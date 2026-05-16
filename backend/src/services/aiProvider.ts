import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export type AIProviderType = 'openai' | 'deepseek' | 'openclaw' | 'tianyi' | 'demo';

interface AIProviderConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

function getProviderConfig(provider: AIProviderType): AIProviderConfig {
  switch (provider) {
    case 'openai':
      return {
        apiKey: process.env.OPENAI_API_KEY || '',
        baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      };
    case 'deepseek':
      return {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      };
    case 'tianyi':
      return {
        apiKey: process.env.TIANYI_API_KEY || '',
        baseURL: process.env.TIANYI_BASE_URL || 'https://api.tianyiyun.com/v1',
        model: process.env.TIANYI_MODEL || 'tianyi-large',
      };
    case 'openclaw':
      return {
        apiKey: process.env.OPENCLAW_API_KEY || '',
        baseURL: process.env.OPENCLAW_BASE_URL || 'https://api.openclaw.com/v1',
        model: process.env.OPENCLAW_MODEL || 'openclaw-chat',
      };
    default:
      return { apiKey: '', baseURL: '', model: '' };
  }
}

const provider: AIProviderType = (process.env.AI_PROVIDER as AIProviderType) || 'demo';

let client: OpenAI | null = null;

export function getAIClient(): OpenAI | null {
  if (provider === 'demo') return null;
  if (client) return client;

  const config = getProviderConfig(provider);
  if (!config.apiKey) {
    console.warn(`[AIProvider] ${provider} API Key 未配置，降级到 demo 模式`);
    return null;
  }

  client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
  return client;
}

export function getAIModel(): string {
  if (provider === 'demo') return 'demo-rule-engine';
  return getProviderConfig(provider).model;
}

export function getAIProviderName(): string {
  return provider;
}

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const aiClient = getAIClient();

  if (!aiClient) {
    throw new Error('AI_DEMO_MODE');
  }

  const model = getAIModel();
  const response = await aiClient.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2000,
  });

  return response.choices[0]?.message?.content || '';
}
