import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserProgress } from '@/types';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/trackEvent';
import { useRoadmap } from './RoadmapContext';
interface ProgressContextType {
  progress: UserProgress | null;
  progressMap: Record<string, UserProgress>;
  loading: boolean;
  error: string | null;
  fetchProgress: (roadmapId: string) => Promise<void>;
  fetchAllProgress: (roadmapIds: string[]) => Promise<void>;
  updateProgress: (roadmapId: string, stepId: string, completed: boolean) => Promise<void>;
  calculateStreak: () => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userRoadmaps } = useRoadmap();

  const fetchProgress = useCallback(async (roadmapId: string) => {
    if (!roadmapId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setProgress(data);

      if (data) {
        setProgressMap(prev => ({ ...prev, [roadmapId]: data }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllProgress = useCallback(async (roadmapIds: string[]) => {
    if (!roadmapIds.length) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .in('roadmap_id', roadmapIds);

      if (fetchError) throw fetchError;

      if (data) {
        const map: Record<string, UserProgress> = {};
        data.forEach((p: UserProgress) => {
          map[p.roadmap_id] = p;
        });
        setProgressMap(prev => ({ ...prev, ...map }));

        if (data.length > 0 && !progress) {
          setProgress(data[0]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, [progress]);

  const updateProgress = useCallback(
    async (roadmapId: string, stepId: string, completed: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: funcError } = await supabase.functions.invoke('save-progress', {
          body: { roadmap_id: roadmapId, step_id: stepId, completed },
        });

        if (funcError) {
          const errorMsg = await funcError?.context?.text();
          throw new Error(errorMsg || funcError.message);
        }

        if (data?.progress) {
          const updatedProgress: UserProgress = data.progress;

          setProgress(updatedProgress);
          setProgressMap(prev => ({ ...prev, [roadmapId]: updatedProgress }));

          if (completed) {
            const roadmap = userRoadmaps.find(r => r.id === roadmapId);
            const step = roadmap?.steps?.find(s => s.id === stepId);

            const stepRef = { id: stepId, title: step?.title ?? '' };
            const roadmapRef = {
              id: roadmapId,
              career_goal: roadmap?.career_goal ?? '',
              target_company: roadmap?.target_company ?? '',
            };

            await track.stepCompleted(stepRef, roadmapRef);

            const newMilestones: { name: string }[] =
              data.new_milestones ?? data.newly_achieved_milestones ?? [];

            for (const milestone of newMilestones) {
              await track.milestoneAchieved({ title: milestone.name }, roadmapRef);
            }

            if (updatedProgress.progress_percentage === 100) {
              await track.roadmapCompleted(roadmapRef);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update progress');
      } finally {
        setLoading(false);
      }
    },
    [userRoadmaps]
  );

  const calculateStreak = useCallback(() => {
    return progress?.streak_days || 0;
  }, [progress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        progressMap,
        loading,
        error,
        fetchProgress,
        fetchAllProgress,
        updateProgress,
        calculateStreak,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}