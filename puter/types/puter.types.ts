export type AIModel = 'gpt-4o' | 'claude' | 'claude-sonnet' | 'o1' | 'o3-mini';

export interface PuterAIOptions {
  model: AIModel;
  temperature?: number;
  max_tokens?: number;
}

export interface PuterUser {
  username: string;
  email: string;
}

export interface RoadmapPhase {
  name: string;
  description: string;
  duration: string;
  order: number;
}

export interface RoadmapStep {
  phase: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: string;
  step_order: number;
}

export interface RoadmapResource {
  step_id: number;
  resource_type: 'article' | 'course' | 'documentation' | 'video';
  media_platform: string;
  title: string;
  url: string;
  description: string;
}

export interface RoadmapStructure {
  phases: RoadmapPhase[];
  steps: RoadmapStep[];
}

export interface RoadmapOutput extends RoadmapStructure {
  resources: RoadmapResource[];
}