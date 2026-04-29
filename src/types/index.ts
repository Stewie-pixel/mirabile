export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

export interface CareerPath {
  id: string;
  name: string;
  description: string;
}

export interface TimelineOption {
  id: string;
  label: string;
  value: string;
  duration: string;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  order: number;
}

export interface Resource {
  id: string;
  step_id: string;
  resource_type: 'learning' | 'practice' | 'video' | 'documentation' | 'interview';
  title: string;
  url?: string;
  description?: string;
  created_at: string;
}

export interface RoadmapStep {
  id: string;
  roadmap_id: string;
  phase: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: string;
  step_order: number;
  resources?: Resource[];
  created_at: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  career_goal: string;
  target_company: string;
  timeline: string;
  phases: RoadmapPhase[];
  steps?: RoadmapStep[];
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  name: string;
  percentage: number;
  achieved: boolean;
  achieved_at?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  roadmap_id: string;
  completed_steps: string[];
  progress_percentage: number;
  streak_days: number;
  last_activity?: string;
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
}

export interface RoadmapGenerationRequest {
  career_goal: string;
  target_company: string;
  timeline: string;
}

export interface RoadmapGenerationResponse {
  roadmap: Roadmap;
  steps: RoadmapStep[];
  resources: Resource[];
}