import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProgressRequest {
  roadmap_id: string;
  step_id: string;
  completed: boolean;
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

    const { roadmap_id, step_id, completed }: ProgressRequest = await req.json();

    const { data: progress, error: fetchError } = await supabaseClient
      .from('user_progress')
      .select('*')
      .eq('roadmap_id', roadmap_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!progress) {
      return new Response(JSON.stringify({ error: 'Progress record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const completedSteps = Array.isArray(progress.completed_steps) ? progress.completed_steps : [];
    let updatedCompletedSteps = [...completedSteps];

    if (completed && !completedSteps.includes(step_id)) {
      updatedCompletedSteps.push(step_id);
    } else if (!completed && completedSteps.includes(step_id)) {
      updatedCompletedSteps = completedSteps.filter((id: string) => id !== step_id);
    }

    const { data: allSteps, error: stepsError } = await supabaseClient
      .from('roadmap_steps')
      .select('id')
      .eq('roadmap_id', roadmap_id);

    if (stepsError) throw stepsError;

    const totalSteps = allSteps?.length || 0;
    const completedCount = updatedCompletedSteps.length;
    const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

    const now = new Date().toISOString();
    const lastActivity = progress.last_activity ? new Date(progress.last_activity) : null;
    let streakDays = progress.streak_days || 0;

    if (completed) {
      if (lastActivity) {
        const daysSinceLastActivity = Math.floor(
          (new Date(now).getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastActivity === 1) {
          streakDays += 1;
        } else if (daysSinceLastActivity > 1) {
          streakDays = 1;
        }
      } else {
        streakDays = 1;
      }
    }

    const milestones = [
      { id: '25', name: 'First Step', percentage: 25, achieved: progressPercentage >= 25 },
      { id: '50', name: 'Halfway There', percentage: 50, achieved: progressPercentage >= 50 },
      { id: '75', name: 'Almost Done', percentage: 75, achieved: progressPercentage >= 75 },
      { id: '100', name: 'Completed', percentage: 100, achieved: progressPercentage >= 100 },
    ];

    const { data: updatedProgress, error: updateError } = await supabaseClient
      .from('user_progress')
      .update({
        completed_steps: updatedCompletedSteps,
        progress_percentage: progressPercentage,
        streak_days: streakDays,
        last_activity: now,
        milestones,
        updated_at: now,
      })
      .eq('id', progress.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        progress: updatedProgress,
        message: 'Progress updated successfully',
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