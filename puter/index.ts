import { AIModel, PuterAIOptions, PuterUser } from './types/puter.types.ts';
import { PuterAuthService } from './services/puter-auth.service.ts';
import { PuterChatService } from './services/puter-chat.service.ts';
import { RoadmapService } from './services/roadmap.service.ts';

class PuterService {
  private initialized = false;

  private readonly auth: PuterAuthService;
  private readonly chatService: PuterChatService;
  private readonly roadmapService: RoadmapService;

  constructor() {
    this.auth = new PuterAuthService();
    this.chatService = new PuterChatService(this.auth);
    this.roadmapService = new RoadmapService(this.chatService);
  }

  isAvailable(): boolean {
    return this.auth.isAvailable();
  }

  initialize(): void {
    if (this.initialized) return;

    if (!this.isAvailable()) {
      throw new Error('Puter.js is not loaded. Please check your internet connection.');
    }

    this.initialized = true;
  }

  isSignedIn(): boolean {
    return this.auth.isSignedIn();
  }

  async signIn(): Promise<void> {
    this.initialize();
    await this.auth.signIn();
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
  }

  getUser(): Promise<PuterUser | null> | null {
    return this.auth.getUser();
  }

  async ensureCorrectUser(supabaseUserId: string): Promise<void> {
    this.initialize();
    await this.auth.ensureCorrectUser(supabaseUserId);
  }

  async handleSupabaseSignOut(): Promise<void> {
    await this.auth.handleSupabaseSignOut();
  }

  chat(prompt: string, options: PuterAIOptions): Promise<string> {
    this.initialize();
    return this.chatService.chat(prompt, options);
  }

  generateRoadmap(
    careerGoal: string,
    targetCompany: string,
    timeline: string,
    model: AIModel
  ): Promise<string> {
    this.initialize();
    return this.roadmapService.generateRoadmap(careerGoal, targetCompany, timeline, model);
  }
}

export const puterService = new PuterService();