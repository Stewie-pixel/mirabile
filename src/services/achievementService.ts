import { supabase } from '@/lib/supabase';

export interface AchievementDefinition {
  key: string;
  emoji: string;
  name: string;
  hint: string;
}

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  { key: 'first_spark', emoji: '🔥', name: 'First Spark', hint: 'Complete your first step' },
  { key: 'pathfinder', emoji: '🗺️', name: 'Pathfinder', hint: 'Create your first roadmap' },
  { key: 'summit_reached', emoji: '🏔️', name: 'Summit Reached', hint: 'Complete an entire roadmap' },
  { key: 'on_a_roll', emoji: '⚡', name: 'On a Roll', hint: '7-day activity streak' },
  { key: 'overachiever', emoji: '🏆', name: 'Overachiever', hint: 'Complete 3 roadmaps' },
  { key: 'ai_collaborator', emoji: '💬', name: 'AI Collaborator', hint: 'Ask 5 questions to the AI assistant' },
  { key: 'fast_learner', emoji: '⚡', name: 'Fast Learner', hint: 'Complete 5 steps in a single day' },
  { key: 'explorer', emoji: '🚀', name: 'Explorer', hint: 'Generate 5 roadmaps for unique career goals' },
  { key: 'perseverance', emoji: '💪', name: 'Perseverance', hint: 'Complete 10 steps total' },
  { key: 'night_owl', emoji: '🦉', name: 'Night Owl', hint: 'Complete a step between 11 PM and 4 AM' },
] as const;

/**
 * Checks all achievement conditions for a user and inserts any newly unlocked achievements.
 * Returns the list of achievement keys that were newly unlocked during this check.
 */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  if (!userId) return [];
  const unlockedKeys: string[] = [];

  try {
    // 1. Fetch already unlocked achievements to avoid duplicate inserts
    const { data: currentAchievements, error: achError } = await supabase
      .from('user_achievements')
      .select('achievement_key')
      .eq('user_id', userId);

    if (achError) {
      console.error('Error fetching achievements:', achError);
      return [];
    }

    const existingKeys = new Set((currentAchievements || []).map(a => a.achievement_key));

    // 2. Fetch user progress to check steps, summit reached, on a roll, overachiever
    const { data: progressList, error: progError } = await supabase
      .from('user_progress')
      .select('completed_steps, progress_percentage, streak_days')
      .eq('user_id', userId);

    if (progError) {
      console.error('Error fetching progress for achievements:', progError);
    }

    const progress = progressList || [];

    // Count total completed steps (each completed_steps is a JSON array)
    let totalCompletedSteps = 0;
    let completedRoadmapsCount = 0;
    let maxStreak = 0;

    for (const prog of progress) {
      const steps = Array.isArray(prog.completed_steps) ? prog.completed_steps : [];
      totalCompletedSteps += steps.length;
      if (Number(prog.progress_percentage) === 100) {
        completedRoadmapsCount++;
      }
      if (prog.streak_days > maxStreak) {
        maxStreak = prog.streak_days;
      }
    }

    // 3. Fetch roadmaps count
    const { count: roadmapsCount, error: countError } = await supabase
      .from('roadmaps')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting roadmaps:', countError);
    }

    const numRoadmaps = roadmapsCount || 0;

    // Check achievement conditions
    const unlocksToTry: string[] = [];

    // First Spark: complete first step
    if (totalCompletedSteps >= 1 && !existingKeys.has('first_spark')) {
      unlocksToTry.push('first_spark');
    }

    // Pathfinder: create first roadmap
    if (numRoadmaps >= 1 && !existingKeys.has('pathfinder')) {
      unlocksToTry.push('pathfinder');
    }

    // Summit Reached: complete an entire roadmap
    if (completedRoadmapsCount >= 1 && !existingKeys.has('summit_reached')) {
      unlocksToTry.push('summit_reached');
    }

    // On a Roll: 7-day activity streak
    if (maxStreak >= 7 && !existingKeys.has('on_a_roll')) {
      unlocksToTry.push('on_a_roll');
    }

    // Overachiever: complete 3 roadmaps
    if (completedRoadmapsCount >= 3 && !existingKeys.has('overachiever')) {
      unlocksToTry.push('overachiever');
    }

    // --- Query for 5 additional achievements ---

    // AI Collaborator: Ask 5 questions to the AI assistant
    // First get all session IDs belonging to this user
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId);

    const sessionIds = (sessions || []).map(s => s.id);

    const { count: chatCount } = sessionIds.length > 0
      ? await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds)
        .eq('role', 'user')
      : { count: 0 };

    const totalChats = chatCount ?? 0;
    if (totalChats >= 5 && !existingKeys.has('ai_collaborator')) {
      unlocksToTry.push('ai_collaborator');
    }

    // Perseverance: Complete 10 steps total
    if (totalCompletedSteps >= 10 && !existingKeys.has('perseverance')) {
      unlocksToTry.push('perseverance');
    }

    // Explorer: Generate 5 roadmaps for unique career goals
    const { data: roadmapsData } = await supabase
      .from('roadmaps')
      .select('career_goal')
      .eq('user_id', userId);
    const uniqueGoals = new Set((roadmapsData || []).map(r => r.career_goal.toLowerCase().trim()));
    if (uniqueGoals.size >= 5 && !existingKeys.has('explorer')) {
      unlocksToTry.push('explorer');
    }

    // Step-based timing/frequency achievements
    const { data: stepEvents } = await supabase
      .from('user_events')
      .select('created_at')
      .eq('user_id', userId)
      .eq('event_type', 'step_completed');

    if (stepEvents && stepEvents.length > 0) {
      // Night Owl: Complete a step between 11 PM and 4 AM
      const hasNightOwl = stepEvents.some(e => {
        const hour = new Date(e.created_at).getHours();
        return hour >= 23 || hour < 4;
      });
      if (hasNightOwl && !existingKeys.has('night_owl')) {
        unlocksToTry.push('night_owl');
      }

      // Fast Learner: Complete 5 steps in a single day
      const dateCounts: Record<string, number> = {};
      stepEvents.forEach(e => {
        const dayStr = new Date(e.created_at).toLocaleDateString('en-CA');
        dateCounts[dayStr] = (dateCounts[dayStr] || 0) + 1;
      });
      const maxStepsInADay = Math.max(0, ...Object.values(dateCounts));
      if (maxStepsInADay >= 5 && !existingKeys.has('fast_learner')) {
        unlocksToTry.push('fast_learner');
      }
    }

    // Insert newly unlocked achievements
    for (const key of unlocksToTry) {
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_key: key,
          earned_at: new Date().toISOString()
        });

      if (!insertError) {
        unlockedKeys.push(key);
      } else {
        console.error(`Failed to insert achievement ${key}:`, insertError);
      }
    }
  } catch (e) {
    console.error('Error checking achievements:', e);
  }

  return unlockedKeys;
}
