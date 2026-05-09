export interface PuterAIOptions {
  model: 'gpt-4o' | 'claude' | 'claude-sonnet' | 'o1' | 'o3-mini';
  temperature?: number;
  max_tokens?: number;
}

export interface PuterUser {
  username: string;
  email: string;
}

class PuterService {
  private initialized = false;

  /**
   * Check if Puter.js is available
   */
  isAvailable(): boolean {
    return typeof globalThis !== 'undefined' && typeof globalThis.puter !== 'undefined';
}

  /**
   * Initialize Puter.js (if needed)
   */
  initialize(): Promise<void> {
    if (this.initialized) return Promise.resolve();

    if (!this.isAvailable()) {
      return Promise.reject(new Error('Puter.js is not loaded. Please check your internet.'));
    }

    this.initialized = true;
    return Promise.resolve();
  }

  /**
   * Check if user is signed in to Puter
   */
  isSignedIn(): boolean {
    if (!this.isAvailable()) return false;
    return globalThis.puter.auth.isSignedIn();
  }

  /**
   * Sign in to Puter (opens authentication dialog)
   */
  async signIn(): Promise<void> {
    await this.initialize();
    await globalThis.puter.auth.signIn();
  }

  /**
   * Sign out from Puter
   */
  async signOut(): Promise<void> {
    if (!this.isAvailable()) return;
    await globalThis.puter.auth.signOut();
  }

  /**
   * Get current Puter user
   */
  async getUser(): Promise<PuterUser | null> {
    if (!this.isAvailable() || !this.isSignedIn()) return null;
    return await globalThis.puter.auth.getUser();
  }

  /**
   * Generate AI response using Puter.js
   */
  async chat(prompt: string, options: PuterAIOptions): Promise<string> {
    await this.initialize();

    // Ensure user is signed in
    if (!this.isSignedIn()) {
      await this.signIn();
    }

    try {
      const response = await globalThis.puter.ai.chat(prompt, {
        model: options.model,
        stream: false,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 4000,
      });

      console.log('Puter.js raw response:', response);
      console.log('Response type:', typeof response);

      // Handle different response formats
      let textContent: string;

      if (typeof response === 'string') {
        textContent = response;
      } else if (typeof response === 'object' && response !== null) {
        if ('message' in response && typeof response.message === 'object' && response.message !== null) {
          const message = response.message as any;
          if (Array.isArray(message.content)) {
            textContent = message.content[0]?.text || '';
          } else if (typeof message.content === 'string') {
            textContent = message.content;
          } else {
            throw new Error('Message object found but content format is unknown');
          }
        } else if ('text' in response && typeof response.text === 'string') {
          textContent = response.text;
        } else if ('content' in response && typeof response.content === 'string') {
          textContent = response.content;
        } else if ('message' in response && typeof response.message === 'string') {
          textContent = response.message;
        } else if ('response' in response && typeof response.response === 'string') {
          textContent = response.response;
        } else if ('data' in response && typeof response.data === 'string') {
          textContent = response.data;
        } else {
          console.error('Unknown response structure from Puter.js:', response);
          const responseStr = JSON.stringify(response);
          console.log('Stringified response:', responseStr);
          throw new Error(`Unable to extract text from Puter.js response. Response structure: ${responseStr.substring(0, 200)}`);
        }
      } else {
        console.error('Invalid response type from Puter.js:', typeof response, response);
        throw new Error(`Invalid response type from Puter.js: expected string or object, got ${typeof response}`);
      }

      if (!textContent || textContent.trim().length === 0) {
        throw new Error('Empty response from Puter.js AI');
      }

      console.log('Extracted text content:', textContent.substring(0, 200) + '...');
      return textContent;
    } catch (error) {
      console.error('Puter.js AI error:', error);
      throw new Error(`Puter.js AI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate career roadmap using Puter.js AI
   */
  async generateRoadmap(
    careerGoal: string,
    targetCompany: string,
    timeline: string,
    model: 'gpt-4o' | 'claude' | 'claude-sonnet' | 'o1' | 'o3-mini'
  ): Promise<string> {
    const prompt = `You are a career advisor AI. Generate a detailed, structured career roadmap for the following:

Career Goal: ${careerGoal}
Target Company: ${targetCompany}
Timeline: ${timeline}

Generate a comprehensive roadmap with:
1. 3-5 phases (e.g., Foundations, Intermediate Skills, Advanced Topics, Interview Prep, Final Polish)
2. For each phase, create 3-5 specific, actionable steps
3. Each step should have:
   - A clear title
   - Detailed description (2-3 sentences)
   - Difficulty level (beginner, intermediate, or advanced)
   - Estimated time (e.g., "2-3 hours", "1 week", "2 days")
4. For each step, provide 3-5 resources:
   - Resource type (learning, practice, video, documentation, or interview)
   - Title
   - Description
   - URL (use real, relevant URLs when possible)

Tailor the content specifically for ${targetCompany}'s culture, interview process, and technical requirements.
Adjust the pacing and depth based on the ${timeline} timeline.

Return ONLY valid JSON in this exact format:
{
  "phases": [
    {
      "name": "Phase Name",
      "description": "Phase description",
      "duration": "Duration estimate",
      "order": 1
    }
  ],
  "steps": [
    {
      "phase": "Phase Name",
      "title": "Step Title",
      "description": "Step description",
      "difficulty": "beginner|intermediate|advanced",
      "estimated_time": "Time estimate",
      "step_order": 1
    }
  ],
  "resources": [
    {
      "step_index": 0,
      "resource_type": "learning|practice|video|documentation|interview",
      "media_platform": "YouTube|Google|Github|Stack Overflow|Coursera|Books|Blogs|Official Docs|etc.",
      "title": "Resource Title",
      "url": "https://example.com",
      "description": "Resource description"
    }
  ]
}`;

    return await this.chat(prompt, { model, temperature: 0.7, max_tokens: 4000 });
  }
}

// Export singleton instance
export const puterService = new PuterService();
