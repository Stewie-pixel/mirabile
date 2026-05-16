export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'claude' | 'puter';
  modelId: string;
  isFree: boolean;
  description: string;
  maxTokens: number;
  requiresApiKey?: boolean;
}

export const AI_MODELS: AIModel[] = [
  // Puter.js Models (No API Key Required)
  {
    id: 'puter-gpt-4o',
    name: 'GPT-4o',
    provider: 'puter',
    modelId: 'gpt-4o',
    isFree: true,
    description: 'Recommended for all tasks',
    maxTokens: 4000,
    requiresApiKey: false,
  },
  {
    id: 'puter-claude',
    name: 'Claude Haiku 4.6',
    provider: 'puter',
    modelId: 'claude',
    isFree: true,
    description: 'Great for fast responses and cost-effective usage',
    maxTokens: 4000,
    requiresApiKey: false,
  },
  {
    id: 'puter-claude-sonnet',
    name: 'Claude Sonnet 4.5',
    provider: 'puter',
    modelId: 'claude-sonnet',
    isFree: true,
    description: 'Ideal for detailed analysis and structured outputs',
    maxTokens: 4000,
    requiresApiKey: false,
  },
  // OpenAI Models (Requires API Key)
  {
    id: 'gpt-4o-mini',
    name: 'ChatGPT 4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    isFree: false,
    description: 'Fast and affordable GPT-4 model, great balance of quality and cost',
    maxTokens: 4000,
    requiresApiKey: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'ChatGPT 3.5 Turbo',
    provider: 'openai',
    modelId: 'gpt-3.5-turbo',
    isFree: false,
    description: 'Reliable and cost-effective model for most tasks',
    maxTokens: 4000,
    requiresApiKey: true,
  },
  // Google Gemini Models (Requires API Key)
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    isFree: true,
    description: 'Free with your own API key, fast and versatile',
    maxTokens: 4000,
    requiresApiKey: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    modelId: 'gemini-2.5-pro',
    isFree: false,
    description: 'Advanced reasoning and complex task handling',
    maxTokens: 4000,
    requiresApiKey: true,
  },
  // Anthropic Claude Models (Requires API Key)
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    modelId: 'claude-3-5-sonnet-20241022',
    isFree: false,
    description: 'Excellent for detailed analysis and structured outputs',
    maxTokens: 4000,
    requiresApiKey: true,
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    modelId: 'claude-3-5-haiku-20241022',
    isFree: false,
    description: 'Fast and efficient for quick tasks',
    maxTokens: 4000,
    requiresApiKey: true,
  },
];

export const FREE_MODELS = AI_MODELS.filter((model) => model.isFree);
export const PAID_MODELS = AI_MODELS.filter((model) => !model.isFree);
export const PUTER_MODELS = AI_MODELS.filter((model) => model.provider === 'puter');
export const API_KEY_MODELS = AI_MODELS.filter((model) => model.requiresApiKey);

export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find((model) => model.id === id);
};

export const getModelsByProvider = (provider: 'openai' | 'gemini' | 'claude' | 'puter'): AIModel[] => {
  return AI_MODELS.filter((model) => model.provider === provider);
};
