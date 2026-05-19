import { supabase } from '@/lib/supabase';

export type EventType =
    | 'sign_in'
    | 'roadmap_created'
    | 'roadmap_completed'
    | 'step_completed'
    | 'milestone_achieved';

export interface TrackEventPayload {
    title?: string;
    description?: string;
    roadmap_id?: string;
    step_id?: string;
    company?: string;
    [key: string]: unknown;
}

/**
 * Insert a single event into user_events.
 * Silently swallows errors so a tracking failure never breaks the calling flow.
 */
export async function trackEvent(
    type: EventType,
    data: TrackEventPayload = {}
): Promise<void> {
    try {
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) return;

        const { error } = await supabase.from('user_events').insert({
            user_id: user.id,
            event_type: type,
            event_data: data,
        });

        if (error) {
            console.warn('[trackEvent] insert failed:', error.message);
        }
    } catch (err) {
        console.warn('[trackEvent] unexpected error:', err);
    }
}

export const track = {
    async signIn() {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return;

            const startOfToday = new Date();
            startOfToday.setUTCHours(0, 0, 0, 0);

            const { data: existing } = await supabase
                .from('user_events')
                .select('id')
                .eq('user_id', user.id)
                .eq('event_type', 'sign_in')
                .gte('created_at', startOfToday.toISOString())
                .limit(1);

            if (existing && existing.length > 0) return;

            await trackEvent('sign_in', { title: 'Daily active' });
        } catch (err) {
            console.warn('[track.signIn] unexpected error:', err);
        }
    },


    roadmapCreated(roadmap: { id: string; career_goal: string; target_company: string }) {
        return trackEvent('roadmap_created', {
            title: `Created roadmap for ${roadmap.target_company}`,
            description: roadmap.career_goal,
            roadmap_id: roadmap.id,
            company: roadmap.target_company,
        });
    },

    roadmapCompleted(roadmap: { id: string; career_goal: string; target_company: string }) {
        return trackEvent('roadmap_completed', {
            title: `Completed roadmap at ${roadmap.target_company}`,
            description: roadmap.career_goal,
            roadmap_id: roadmap.id,
            company: roadmap.target_company,
        });
    },

    stepCompleted(step: { id: string; title: string }, roadmap: { id: string; career_goal: string }) {
        return trackEvent('step_completed', {
            title: `Completed: ${step.title}`,
            description: roadmap.career_goal,
            step_id: step.id,
            roadmap_id: roadmap.id,
        });
    },

    milestoneAchieved(milestone: { title: string }, roadmap: { id: string; career_goal: string }) {
        return trackEvent('milestone_achieved', {
            title: `Milestone reached: ${milestone.title}`,
            description: roadmap.career_goal,
            roadmap_id: roadmap.id,
        });
    },
} as const;