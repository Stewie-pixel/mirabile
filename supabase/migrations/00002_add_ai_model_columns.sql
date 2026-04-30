-- Add AI model tracking columns to roadmaps table
ALTER TABLE roadmaps 
ADD COLUMN IF NOT EXISTS ai_model TEXT,
ADD COLUMN IF NOT EXISTS ai_provider TEXT;

-- Add comment for documentation
COMMENT ON COLUMN roadmaps.ai_model IS 'The AI model ID used to generate this roadmap (gpt-4o-mini, gemini-1.5-flash)';
COMMENT ON COLUMN roadmaps.ai_provider IS 'The AI provider (openai, gemini, or claude)';