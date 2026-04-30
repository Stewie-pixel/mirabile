import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '@supabase/supabase-js/cors'

interface RoadmapRequest {
  career_goal: string;
  target_company: string;
  timeline: string;
  ai_model: string;
}

interface AIModel {
  id: string;
  provider: 'openai' | 'gemini' | 'claude';
  modelId: string;
}

const AI_MODELS: Record<string, AIModel> = {
  'gpt-4o-mini': { id: 'gpt-4o-mini', provider: 'openai', modelId: 'gpt-4o-mini' },
  'gpt-3.5-turbo': { id: 'gpt-3.5-turbo', provider: 'openai', modelId: 'gpt-3.5-turbo' },
  'gemini-1.5-flash': { id: 'gemini-1.5-flash', provider: 'gemini', modelId: 'gemini-1.5-flash' },
  'gemini-1.5-pro': { id: 'gemini-1.5-pro', provider: 'gemini', modelId: 'gemini-1.5-pro' },
  'claude-3-5-sonnet': { id: 'claude-3-5-sonnet', provider: 'claude', modelId: 'claude-3-5-sonnet-20241022' },
  'claude-3-5-haiku': { id: 'claude-3-5-haiku', provider: 'claude', modelId: 'claude-3-5-haiku-20241022' },
};

async function callOpenAI(apiKey: string, modelId: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: 'You are a career advisor AI that generates structured, actionable career roadmaps in JSON format.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from OpenAI API');
  }

  return data.choices[0].message.content;
}

async function callGemini(apiKey: string, modelId: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

async function callClaude(apiKey: string, modelId: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid response from Claude API');
  }

  return data.content[0].text;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error: Missing Supabase credentials');
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      console.error('Unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating roadmap for user: ${user.id}`);

    const { career_goal, target_company, timeline, ai_model }: RoadmapRequest = await req.json();
    
    if (!career_goal || !target_company || !timeline || !ai_model) {
      throw new Error('Missing required fields: career_goal, target_company, timeline, or ai_model');
    }
    
    console.log(`Request: ${career_goal} at ${target_company} in ${timeline} using ${ai_model}`);

    // Get model configuration
    const modelConfig = AI_MODELS[ai_model];
    if (!modelConfig) {
      throw new Error(`Invalid AI model: ${ai_model}`);
    }

    console.log(`Using ${modelConfig.provider} provider with model ${modelConfig.modelId}`);

    // Get appropriate API key based on provider
    let apiKey: string | undefined;
    if (modelConfig.provider === 'openai') {
      apiKey = Deno.env.get('LLM_API_KEY');
      if (!apiKey) {
        throw new Error('LLM_API_KEY (OpenAI) not configured. Please add it in Supabase Dashboard > Edge Functions > Secrets');
      }
    } else if (modelConfig.provider === 'gemini') {
      apiKey = Deno.env.get('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured. Please add it in Supabase Dashboard > Edge Functions > Secrets');
      }
    } else if (modelConfig.provider === 'claude') {
      apiKey = Deno.env.get('CLAUDE_API_KEY');
      if (!apiKey) {
        throw new Error('CLAUDE_API_KEY not configured. Please add it in Supabase Dashboard > Edge Functions > Secrets');
      }
    }
    
    console.log(`API key configured for ${modelConfig.provider}`);

    const llmApiKey = Deno.env.get('LLM_API_KEY');
    if (!llmApiKey) {
      console.error('LLM_API_KEY not configured in Supabase secrets');
      throw new Error('LLM_API_KEY not configured. Please add it in Supabase Dashboard > Edge Functions > Secrets');
    }
    
    console.log('Calling OpenAI API...');

    const prompt = `You are a career advisor AI. Generate a detailed, structured career roadmap for the following:

Career Goal: ${career_goal}
Target Company: ${target_company}
Timeline: ${timeline}

Generate a comprehensive roadmap with:
1. 3-5 phases (e.g., Foundations, Intermediate Skills, Advanced Topics, Interview Prep, Final Polish)
2. For each phase, create 3-5 specific, actionable steps
3. Each step should have:
   - A clear title
   - Detailed description (2-3 sentences)
   - Difficulty level (beginner, intermediate, or advanced)
   - Estimated time (e.g., "2-3 hours", "1 week", "2 days")
4. For each step, provide 3-5 resources:
   - Resource type (learning, practice, video, documentation, or interview)
   - Title
   - Description
   - URL (use real, relevant URLs when possible)

Tailor the content specifically for ${target_company}'s culture, interview process, and technical requirements.
Adjust the pacing and depth based on the ${timeline} timeline.

Return ONLY valid JSON in this exact format:
{
  "phases": [
    {
      "name": "Phase Name",
      "description": "Phase description",
      "duration": "Duration estimate",
      "order": 1
    }
  ],
  "steps": [
    {
      "phase": "Phase Name",
      "title": "Step Title",
      "description": "Step description",
      "difficulty": "beginner|intermediate|advanced",
      "estimated_time": "Time estimate",
      "step_order": 1
    }
  ],
  "resources": [
    {
      "step_index": 0,
      "resource_type": "learning|practice|video|documentation|interview",
      "title": "Resource Title",
      "url": "https://example.com",
      "description": "Resource description"
    }
  ]
}`;

    console.log(`Calling ${modelConfig.provider} API...`);
    
    let content: string;
    try {
      if (modelConfig.provider === 'openai') {
        content = await callOpenAI(apiKey!, modelConfig.modelId, prompt);
      } else if (modelConfig.provider === 'gemini') {
        content = await callGemini(apiKey!, modelConfig.modelId, prompt);
      } else if (modelConfig.provider === 'claude') {
        content = await callClaude(apiKey!, modelConfig.modelId, prompt);
      } else {
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
      }
    } catch (error) {
      console.error(`${modelConfig.provider} API call failed:`, error);
      throw error;
    }

    console.log('Received AI response, parsing...');

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.log('Failed to parse as direct JSON, trying to extract...');
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('Failed to parse extracted JSON:', e2);
          console.error('Content:', content);
          throw new Error('Failed to parse LLM response as JSON');
        }
      } else {
        console.error('No JSON found in content:', content);
        throw new Error('Failed to parse LLM response as JSON');
      }
    }
    
    // Validate parsed content structure
    if (!parsedContent.phases || !parsedContent.steps || !parsedContent.resources) {
      console.error('Invalid content structure:', JSON.stringify(parsedContent));
      throw new Error('Invalid roadmap structure from LLM');
    }
    
    console.log(`Parsed roadmap: ${parsedContent.phases.length} phases, ${parsedContent.steps.length} steps, ${parsedContent.resources.length} resources`);

    console.log('Inserting roadmap into database...');
    
    const { data: roadmap, error: roadmapError } = await supabaseClient
      .from('roadmaps')
      .insert({
        user_id: user.id,
        career_goal,
        target_company,
        timeline,
        ai_model: modelConfig.id,
        ai_provider: modelConfig.provider,
        phases: parsedContent.phases || [],
      })
      .select()
      .single();

    if (roadmapError) {
      console.error('Roadmap insert error:', roadmapError);
      throw new Error(`Failed to insert roadmap: ${roadmapError.message}`);
    }
    
    console.log(`Roadmap created with ID: ${roadmap.id}`);

    const stepsToInsert = parsedContent.steps.map((step: any, index: number) => ({
      roadmap_id: roadmap.id,
      phase: step.phase,
      title: step.title,
      description: step.description,
      difficulty: step.difficulty,
      estimated_time: step.estimated_time,
      step_order: step.step_order || index + 1,
    }));

    console.log(`Inserting ${stepsToInsert.length} steps...`);
    
    const { data: steps, error: stepsError } = await supabaseClient
      .from('roadmap_steps')
      .insert(stepsToInsert)
      .select();

    if (stepsError) {
      console.error('Steps insert error:', stepsError);
      throw new Error(`Failed to insert steps: ${stepsError.message}`);
    }
    
    console.log(`Inserted ${steps.length} steps`);

    const resourcesToInsert = parsedContent.resources
      .map((resource: any) => {
        const step = steps[resource.step_index];
        if (!step) return null;
        return {
          step_id: step.id,
          resource_type: resource.resource_type,
          title: resource.title,
          url: resource.url,
          description: resource.description,
        };
      })
      .filter(Boolean);

    if (resourcesToInsert.length > 0) {
      console.log(`Inserting ${resourcesToInsert.length} resources...`);
      const { error: resourcesError } = await supabaseClient.from('resources').insert(resourcesToInsert);
      if (resourcesError) {
        console.error('Resources insert error:', resourcesError);
        throw new Error(`Failed to insert resources: ${resourcesError.message}`);
      }
      console.log(`Inserted ${resourcesToInsert.length} resources`);
    } else {
      console.log('No resources to insert');
    }

    console.log('Creating user progress record...');
    
    const { error: progressError } = await supabaseClient.from('user_progress').insert({
      user_id: user.id,
      roadmap_id: roadmap.id,
      completed_steps: [],
      progress_percentage: 0,
      streak_days: 0,
      milestones: [],
    });

    if (progressError) {
      console.error('Progress insert error:', progressError);
      throw new Error(`Failed to create progress record: ${progressError.message}`);
    }
    
    console.log('Roadmap generation completed successfully');

    return new Response(
      JSON.stringify({
        roadmap,
        steps,
        message: 'Roadmap generated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-roadmap function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});