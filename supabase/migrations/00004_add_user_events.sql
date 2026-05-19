-- Create user_events table
CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pinned_roadmaps table
CREATE TABLE pinned_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, roadmap_id)
);

-- Create indexes
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_created_at ON user_events(created_at);
CREATE INDEX idx_pinned_roadmaps_user_id ON pinned_roadmaps(user_id);

-- Enable RLS
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_roadmaps ENABLE ROW LEVEL SECURITY;

-- Policies for user_events
CREATE POLICY "Users can view their own events"
  ON user_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own events"
  ON user_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policies for pinned_roadmaps
CREATE POLICY "Users can view their own pinned roadmaps"
  ON pinned_roadmaps FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own pinned roadmaps"
  ON pinned_roadmaps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pinned roadmaps"
  ON pinned_roadmaps FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own pinned roadmaps"
  ON pinned_roadmaps FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
