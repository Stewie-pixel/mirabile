declare global {
    var puter: {
      auth: {
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        isSignedIn: () => boolean;
        getUser: () => Promise<{ username: string; email: string } | null>;
      };
      ai: {
        chat: (
          prompt: string,
          options?: {
            model?: 'gpt-4o' | 'claude' | 'claude-sonnet' | 'o1' | 'o3-mini';
            stream?: boolean;
            temperature?: number;
            max_tokens?: number;
          }
        ) => Promise<string | { text?: string; content?: string; message?: string; response?: string; data?: string }>;
      };
      kv: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
        del: (key: string) => Promise<void>;
        list: () => Promise<string[]>;
      };
    };
  }

export {};