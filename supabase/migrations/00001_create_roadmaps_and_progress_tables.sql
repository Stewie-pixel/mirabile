-- Create roadmaps table
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_goal TEXT NOT NULL,
  target_company TEXT NOT NULL,
  timeline TEXT NOT NULL,
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create roadmap_steps table
CREATE TABLE roadmap_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  estimated_time TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES roadmap_steps(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMPTZ,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, roadmap_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_roadmap_steps_roadmap_id ON roadmap_steps(roadmap_id);
CREATE INDEX idx_resources_step_id ON resources(step_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_roadmap_id ON user_progress(roadmap_id);

-- Enable Row Level Security
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user owns roadmap
CREATE OR REPLACE FUNCTION can_access_roadmap(roadmap_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM roadmaps
    WHERE id = roadmap_id_param AND user_id = auth.uid()
  );
$$;

-- Helper function to check if user owns step
CREATE OR REPLACE FUNCTION can_access_step(step_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM roadmap_steps rs
    JOIN roadmaps r ON rs.roadmap_id = r.id
    WHERE rs.id = step_id_param AND r.user_id = auth.uid()
  );
$$;

-- RLS Policies for roadmaps
CREATE POLICY "Users can view their own roadmaps"
  ON roadmaps FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own roadmaps"
  ON roadmaps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own roadmaps"
  ON roadmaps FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own roadmaps"
  ON roadmaps FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for roadmap_steps
CREATE POLICY "Users can view steps of their roadmaps"
  ON roadmap_steps FOR SELECT
  TO authenticated
  USING (can_access_roadmap(roadmap_id));

CREATE POLICY "Users can insert steps to their roadmaps"
  ON roadmap_steps FOR INSERT
  TO authenticated
  WITH CHECK (can_access_roadmap(roadmap_id));

CREATE POLICY "Users can update steps of their roadmaps"
  ON roadmap_steps FOR UPDATE
  TO authenticated
  USING (can_access_roadmap(roadmap_id));

CREATE POLICY "Users can delete steps of their roadmaps"
  ON roadmap_steps FOR DELETE
  TO authenticated
  USING (can_access_roadmap(roadmap_id));

-- RLS Policies for resources
CREATE POLICY "Users can view resources of their steps"
  ON resources FOR SELECT
  TO authenticated
  USING (can_access_step(step_id));

CREATE POLICY "Users can insert resources to their steps"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (can_access_step(step_id));

CREATE POLICY "Users can update resources of their steps"
  ON resources FOR UPDATE
  TO authenticated
  USING (can_access_step(step_id));

CREATE POLICY "Users can delete resources of their steps"
  ON resources FOR DELETE
  TO authenticated
  USING (can_access_step(step_id));

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());