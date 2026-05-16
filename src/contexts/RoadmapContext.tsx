import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import type { Resource, Roadmap, RoadmapStep } from '@/types';
import { supabase } from '@/lib/supabase';
import { getModelById } from '@/constants/aiModels';
import { puterService } from '@/services/puterService';

interface RoadmapContextType {
  currentRoadmap: Roadmap | null;
  roadmapSteps: RoadmapStep[];
  userRoadmaps: Roadmap[];
  loading: boolean;
  error: string | null;
  setCurrentRoadmap: (roadmap: Roadmap | null) => void;
  fetchRoadmap: (roadmapId: string) => Promise<void>;
  fetchUserRoadmaps: () => Promise<Roadmap[]>;
  generateRoadmap: (
    careerGoal: string,
    targetCompany: string,
    timeline: string,
    aiModel: string
  ) => Promise<Roadmap | null>;
}

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null);
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);
  const [userRoadmaps, setUserRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        puterService.handleSupabaseSignOut().catch(console.error);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
      const roadmaps = data || [];
      setUserRoadmaps(roadmaps);
      return roadmaps;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roadmaps');
      return [];
    }
  }, []);

  const generateRoadmap = useCallback(
    async (
      careerGoal: string,
      targetCompany: string,
      timeline: string,
      aiModel: string
    ): Promise<Roadmap | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const modelConfig = getModelById(aiModel);
        if (!modelConfig) throw new Error(`Invalid AI model: ${aiModel}`);

        let content: string;
        let aiProvider: string;

        if ((modelConfig.provider as string) === 'puter') {
          console.log('Using Puter.js for AI generation...');
          aiProvider = 'puter';

          content = await puterService.generateRoadmap(
            careerGoal,
            targetCompany,
            timeline,
            modelConfig.modelId as 'gpt-4o' | 'claude' | 'claude-sonnet' | 'o1' | 'o3-mini'
          );
        } else {
          console.log('Using Edge Function for AI generation...');
          aiProvider = modelConfig.provider;

          const { data, error: funcError } = await supabase.functions.invoke('generate-roadmap', {
            body: { career_goal: careerGoal, target_company: targetCompany, timeline, ai_model: aiModel },
          });

          if (funcError) {
            console.error('Edge Function error:', funcError);
            let errorMsg = 'Failed to generate roadmap';

            try {
              const errorText = await funcError?.context?.text();
              if (errorText) {
                const errorData = JSON.parse(errorText);
                errorMsg = errorData.error || errorData.message || errorText;
              }
            } catch (_e) {
              errorMsg = funcError.message || errorMsg;
            }

            throw new Error(errorMsg);
          }

          if (data?.error) {
            console.error('API error response:', data);
            throw new Error(data.error);
          }

          if (data?.roadmap) {
            setCurrentRoadmap(data.roadmap);
            setRoadmapSteps(data.steps || []);
            setUserRoadmaps(prev => [data.roadmap, ...prev]);
            return data.roadmap;
          }

          throw new Error('No roadmap data returned from API');
        }

        if ((modelConfig.provider as string) === 'puter') {
          console.log('Parsing Puter.js response...');

          if (typeof content !== 'string') {
            throw new Error('Invalid response type from Puter.js AI. Expected string, got ' + typeof content);
          }

          if (!content || content.trim().length === 0) {
            throw new Error('Empty response from Puter.js AI');
          }

          let cleanContent = content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
          }

          let parsedContent;
          try {
            parsedContent = JSON.parse(cleanContent);
          } catch (_e) {
            console.log('Failed to parse as direct JSON, trying to extract...');

            if (typeof cleanContent === 'string') {
              const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  parsedContent = JSON.parse(jsonMatch[0]);
                } catch (_e2) {
                  throw new Error('Failed to parse AI response as JSON');
                }
              } else {
                throw new Error('Failed to parse AI response as JSON');
              }
            } else {
              throw new Error('Invalid response format from AI');
            }
          }

          if (!parsedContent.phases || !parsedContent.steps || !parsedContent.resources) {
            throw new Error('Invalid roadmap structure from AI');
          }

          console.log('Saving roadmap to database...');

          const { data: roadmap, error: roadmapError } = await supabase
            .from('roadmaps')
            .insert({
              user_id: user.id,
              career_goal: careerGoal,
              target_company: targetCompany,
              timeline,
              ai_model: modelConfig.id,
              ai_provider: aiProvider,
              phases: parsedContent.phases || [],
            })
            .select()
            .single();

          if (roadmapError) throw new Error(`Failed to insert roadmap: ${roadmapError.message}`);

          const stepsToInsert = parsedContent.steps.map((step: any, index: number) => ({
            roadmap_id: roadmap.id,
            phase: step.phase,
            title: step.title,
            description: step.description,
            difficulty: step.difficulty,
            estimated_time: step.estimated_time,
            step_order: step.step_order || index + 1,
          }));

          const { data: steps, error: stepsError } = await supabase
            .from('roadmap_steps')
            .insert(stepsToInsert)
            .select();

          if (stepsError) throw new Error(`Failed to insert steps: ${stepsError.message}`);

          const resourcesToInsert = parsedContent.resources
            .map((resource: Resource) => {
              const step = steps.find(s => s.step_order === resource.step_id);
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
            const { error: resourcesError } = await supabase.from('resources').insert(resourcesToInsert);
            if (resourcesError) throw new Error(`Failed to insert resources: ${resourcesError.message}`);
          }

          const { error: progressError } = await supabase.from('user_progress').insert({
            user_id: user.id,
            roadmap_id: roadmap.id,
            completed_steps: [],
            progress_percentage: 0,
            streak_days: 0,
            milestones: [],
          });

          if (progressError) throw new Error(`Failed to create progress record: ${progressError.message}`);

          console.log('Roadmap saved successfully');
          setCurrentRoadmap(roadmap);
          setRoadmapSteps(steps || []);
          setUserRoadmaps(prev => [roadmap, ...prev]);
          return roadmap;
        }

        return null;
      } catch (err) {
        console.error('Generate roadmap error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate roadmap';
        setError(errorMessage);
        throw err;
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
        userRoadmaps,
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