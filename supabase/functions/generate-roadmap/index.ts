/// <reference lib="deno.ns" />

import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '@supabase/supabase-js/cors';

import { createGoogleJWT, getGoogleAccessToken } from "./google_oauth.ts";
import { AI_MODELS } from "../../../src/constants/aiModels.ts";
import { buildPrompt } from "./lib/prompt.ts";
import { safeParseJSON } from "./lib/json.ts";

import { insertRoadmap } from "./lib/db/insert-roadmap.ts";
import { insertSteps } from "./lib/db/insert-steps.ts";
import { insertResources } from "./lib/db/insert-resources.ts";
import { insertProgress } from "./lib/db/insert-progress.ts";

import { callOpenAI } from "./lib/llm/openai.ts";
import { callClaude } from "./lib/llm/claude.ts";
import { callGemini } from "./lib/llm/gemini.ts";
import { fetchVideoForStep } from "./lib/youtube-resources.ts";
import { callPuter } from "./lib/llm/puter.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const serviceAccountJson = Deno.env.get("GCP_SERVICE_ACCOUNT");
    const projectId = Deno.env.get("GCP_PROJECT_ID");
    const location = Deno.env.get("GCP_LOCATION") || "us-central1";

    if (!serviceAccountJson || !projectId) {
      throw new Error("GCP configuration missing");
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { career_goal, target_company, timeline, ai_model } = body;

    if (!career_goal || !target_company || !timeline || !ai_model) {
      throw new Error("Missing required fields: career_goal, target_company, timeline, ai_model");
    }

    const modelConfig = AI_MODELS[ai_model];
    if (!modelConfig) throw new Error(`Invalid AI model: ${ai_model}`);

    const prompt = buildPrompt(career_goal, target_company, timeline);

    let content: string;

    switch (modelConfig.provider) {
      case "openai": {
        const key = Deno.env.get("LLM_API_KEY");
        if (!key) throw new Error("LLM_API_KEY not configured");
        content = await callOpenAI(key, modelConfig.modelId, prompt);
        break;
      }
      case "claude": {
        const key = Deno.env.get("CLAUDE_API_KEY");
        if (!key) throw new Error("CLAUDE_API_KEY not configured");
        content = await callClaude(key, modelConfig.modelId, prompt);
        break;
      }
      case "gemini": {
        const jwt = await createGoogleJWT(serviceAccount);
        const accessToken = await getGoogleAccessToken(jwt);
        content = await callGemini(accessToken, projectId, location, modelConfig.modelId, prompt);
        break;
      }
      case "puter": {
        content = await callPuter(prompt);
        break;
      }
      default:
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
    }

    const parsed = safeParseJSON(content);
    if (!parsed.phases || !parsed.steps || !parsed.resources) {
      throw new Error("Invalid roadmap structure from LLM");
    }

    const roadmap = await insertRoadmap(supabase, user.id, {
      career_goal,
      target_company,
      timeline,
      modelConfig,
      phases: parsed.phases,
    });

    const steps = await insertSteps(supabase, roadmap.id, parsed.steps);
    await insertResources(supabase, steps, parsed.resources);
    await insertProgress(supabase, user.id, roadmap.id);

    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (youtubeApiKey) {
      try {
        const videoResources = await Promise.all(
          steps.map(async (step: any, idx: number) => {
            const video = await fetchVideoForStep(
              youtubeApiKey,
              step.phase,
              step.title,
              career_goal
            );
            if (!video) return null;
            return {
              step_index: idx,
              resource_type: "video",
              title: video.title,
              url: video.url,
              description: `Video by ${video.channelTitle} covering ${step.title}.`,
            };
          })
        );

        const validVideos = videoResources.filter(Boolean);
        if (validVideos.length > 0) {
          await insertResources(supabase, steps, validVideos);
        }
      } catch (youtubeError) {
        console.error("Error generating or saving YouTube resources:", youtubeError);
      }
    }

    return new Response(
      JSON.stringify({ roadmap, steps, message: "Roadmap generated successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200, }
    );
  } catch (err: any) {
    console.error("Error in generate-roadmap:", err);
    return new Response(
      JSON.stringify({ error: err.message ?? "Unexpected error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});