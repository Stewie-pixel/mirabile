import { PuterAIOptions } from '../types/puter.types.ts';
import { PuterAuthService } from './puter-auth.service.ts';

export class PuterChatService {
  constructor(private auth: PuterAuthService) { }

  private get puter() {
    return globalThis.puter;
  }

  async chat(prompt: string, options: PuterAIOptions): Promise<string> {
    if (!this.auth.isSignedIn()) {
      await this.auth.signIn();
    }

    try {
      const response = await this.puter.ai.chat(prompt, {
        model: options.model,
        stream: false,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 4000,
      });

      console.log('Puter.js raw response:', response);
      return this.extractText(response);
    } catch (error) {
      console.error('Puter.js AI error:', error);
      throw new Error(`Puter.js AI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractText(response: unknown): string {
    if (typeof response === 'string') {
      return this.assertNonEmpty(response);
    }

    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;

      if (typeof obj.message === 'object' && obj.message !== null) {
        const message = obj.message as Record<string, unknown>;
        if (Array.isArray(message.content)) {
          return this.assertNonEmpty((message.content[0] as any)?.text ?? '');
        }
        if (typeof message.content === 'string') {
          return this.assertNonEmpty(message.content);
        }
      }

      for (const key of ['text', 'content', 'message', 'response', 'data'] as const) {
        if (typeof obj[key] === 'string') {
          return this.assertNonEmpty(obj[key] as string);
        }
      }

      const preview = JSON.stringify(response).substring(0, 200);
      console.error('Unknown response structure from Puter.js:', response);
      throw new Error(`Unable to extract text from Puter.js response. Structure: ${preview}`);
    }

    throw new Error(`Invalid response type from Puter.js: expected string or object, got ${typeof response}`);
  }

  private assertNonEmpty(text: string): string {
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Puter.js AI');
    }
    return text;
  }
}