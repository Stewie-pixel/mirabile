import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoadmapRequest {
  career_goal: string;
  target_company: string;
  timeline: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { career_goal, target_company, timeline }: RoadmapRequest = await req.json();

    const llmApiKey = Deno.env.get('LLM_API_KEY');
    if (!llmApiKey) {
      throw new Error('LLM_API_KEY not configured');
    }

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

    const llmResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${llmApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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

    if (!llmResponse.ok) {
      throw new Error(`LLM API error: ${llmResponse.statusText}`);
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices[0].message.content;

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse LLM response as JSON');
      }
    }

    const { data: roadmap, error: roadmapError } = await supabaseClient
      .from('roadmaps')
      .insert({
        user_id: user.id,
        career_goal,
        target_company,
        timeline,
        phases: parsedContent.phases || [],
      })
      .select()
      .single();

    if (roadmapError) throw roadmapError;

    const stepsToInsert = parsedContent.steps.map((step: any, index: number) => ({
      roadmap_id: roadmap.id,
      phase: step.phase,
      title: step.title,
      description: step.description,
      difficulty: step.difficulty,
      estimated_time: step.estimated_time,
      step_order: step.step_order || index + 1,
    }));

    const { data: steps, error: stepsError } = await supabaseClient
      .from('roadmap_steps')
      .insert(stepsToInsert)
      .select();

    if (stepsError) throw stepsError;

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
      const { error: resourcesError } = await supabaseClient.from('resources').insert(resourcesToInsert);
      if (resourcesError) throw resourcesError;
    }

    const { error: progressError } = await supabaseClient.from('user_progress').insert({
      user_id: user.id,
      roadmap_id: roadmap.id,
      completed_steps: [],
      progress_percentage: 0,
      streak_days: 0,
      milestones: [],
    });

    if (progressError) throw progressError;

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});