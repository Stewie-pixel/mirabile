import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserProgress } from '@/types';
import { supabase } from '@/lib/supabase';

interface ProgressContextType {
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
  fetchProgress: (roadmapId: string) => Promise<void>;
  updateProgress: (roadmapId: string, stepId: string, completed: boolean) => Promise<void>;
  calculateStreak: () => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async (roadmapId: string) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, []);

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
          setProgress(data.progress);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update progress');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const calculateStreak = useCallback(() => {
    return progress?.streak_days || 0;
  }, [progress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        loading,
        error,
        fetchProgress,
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
