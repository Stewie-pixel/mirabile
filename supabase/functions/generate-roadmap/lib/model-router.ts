export type Provider = "openai" | "claude" | "gemini";

export interface ModelConfig {
  id: string;
  provider: Provider;
  modelId: string;
}

export const AI_MODELS: Record<string, ModelConfig> = {
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    provider: "openai",
    modelId: "gpt-4o-mini",
  },
  "claude-3-5-sonnet": {
    id: "claude-3-5-sonnet",
    provider: "claude",
    modelId: "claude-3-5-sonnet-20241022",
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    provider: "gemini",
    modelId: "gemini-2.5-flash",
  },
};
