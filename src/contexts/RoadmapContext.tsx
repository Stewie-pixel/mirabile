import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Roadmap, RoadmapStep, Resource } from '@/types';
import { supabase } from '@/lib/supabase';

interface RoadmapContextType {
  currentRoadmap: Roadmap | null;
  roadmapSteps: RoadmapStep[];
  loading: boolean;
  error: string | null;
  setCurrentRoadmap: (roadmap: Roadmap | null) => void;
  fetchRoadmap: (roadmapId: string) => Promise<void>;
  fetchUserRoadmaps: () => Promise<Roadmap[]>;
  generateRoadmap: (careerGoal: string, targetCompany: string, timeline: string) => Promise<Roadmap | null>;
}

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null);
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = useCallback(async (roadmapId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('id', roadmapId)
        .maybeSingle();

      if (roadmapError) throw roadmapError;

      if (roadmap) {
        setCurrentRoadmap(roadmap);

        const { data: steps, error: stepsError } = await supabase
          .from('roadmap_steps')
          .select('*, resources(*)')
          .eq('roadmap_id', roadmapId)
          .order('step_order');

        if (stepsError) throw stepsError;
        setRoadmapSteps(steps || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roadmap');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserRoadmaps = useCallback(async (): Promise<Roadmap[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('roadmaps')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roadmaps');
      return [];
    }
  }, []);

  const generateRoadmap = useCallback(
    async (careerGoal: string, targetCompany: string, timeline: string): Promise<Roadmap | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: funcError } = await supabase.functions.invoke('generate-roadmap', {
          body: { career_goal: careerGoal, target_company: targetCompany, timeline },
        });

        if (funcError) {
          const errorMsg = await funcError?.context?.text();
          throw new Error(errorMsg || funcError.message);
        }

        if (data?.roadmap) {
          setCurrentRoadmap(data.roadmap);
          setRoadmapSteps(data.steps || []);
          return data.roadmap;
        }
        return null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate roadmap');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <RoadmapContext.Provider
      value={{
        currentRoadmap,
        roadmapSteps,
        loading,
        error,
        setCurrentRoadmap,
        fetchRoadmap,
        fetchUserRoadmaps,
        generateRoadmap,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
}

export function useRoadmap() {
  const context = useContext(RoadmapContext);
  if (context === undefined) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
}
