export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'claude';
  modelId: string;
  isFree: boolean;
  description: string;
  maxTokens: number;
}

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4o-mini',
    name: 'ChatGPT 4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    isFree: false,
    description: 'Fast and affordable GPT-4 model, great balance of quality and cost',
    maxTokens: 4000,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'ChatGPT 3.5 Turbo',
    provider: 'openai',
    modelId: 'gpt-3.5-turbo',
    isFree: false,
    description: 'Reliable and cost-effective model for most tasks',
    maxTokens: 4000,
  },
  // Google Gemini Models
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    isFree: true,
    description: 'Free, fast, and versatile model for everyday tasks',
    maxTokens: 4000,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    modelId: 'gemini-2.5-pro',
    isFree: false,
    description: 'Advanced reasoning and complex task handling',
    maxTokens: 4000,
  },
  // Anthropic Claude Models
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    modelId: 'claude-3-5-sonnet-20241022',
    isFree: false,
    description: 'Excellent for detailed analysis and structured outputs',
    maxTokens: 4000,
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    modelId: 'claude-3-5-haiku-20241022',
    isFree: false,
    description: 'Fast and efficient for quick tasks',
    maxTokens: 4000,
  },
];

export const FREE_MODELS = AI_MODELS.filter((model) => model.isFree);
export const PAID_MODELS = AI_MODELS.filter((model) => !model.isFree);

export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find((model) => model.id === id);
};

export const getModelsByProvider = (provider: 'openai' | 'gemini' | 'claude'): AIModel[] => {
  return AI_MODELS.filter((model) => model.provider === provider);
};
