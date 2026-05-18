import { AIModel, RoadmapOutput, RoadmapStructure } from '../types/puter.types.ts';
import { PuterChatService } from './puter-chat.service.ts';
import { buildResourcesPrompt, buildStructurePrompt } from '../prompts/roadmap.prompts.ts';

export class RoadmapService {
  constructor(private chat: PuterChatService) {}

  async generateRoadmap(
    careerGoal: string,
    targetCompany: string,
    timeline: string,
    model: AIModel
  ): Promise<string> {
    const structure = await this.generateStructure(careerGoal, targetCompany, timeline, model);
    const resources = await this.generateResources(careerGoal, targetCompany, structure, model);

    const output: RoadmapOutput = {
      phases: structure.phases,
      steps: structure.steps,
      resources,
    };

    return JSON.stringify(output);
  }

  private async generateStructure(
    careerGoal: string,
    targetCompany: string,
    timeline: string,
    model: AIModel
  ): Promise<RoadmapStructure> {
    const prompt = buildStructurePrompt(careerGoal, targetCompany, timeline);

    const response = await this.chat.chat(prompt, {
      model,
      temperature: 0.3,
      max_tokens: 4000,
    });

    return this.parseJSON<RoadmapStructure>(response, 'roadmap structure');
  }

  private async generateResources(
    careerGoal: string,
    targetCompany: string,
    structure: RoadmapStructure,
    model: AIModel
  ) {
    const stepsSummary = structure.steps
      .map((s, i) => `step_id ${i + 1}: "${s.title}" (phase: ${s.phase}, difficulty: ${s.difficulty})`)
      .join('\n');

    const prompt = buildResourcesPrompt(careerGoal, targetCompany, stepsSummary);

    const response = await this.chat.chat(prompt, {
      model,
      temperature: 0.3,
      max_tokens: 8000,
    });

    const parsed = this.parseJSON<{ resources: RoadmapOutput['resources'] }>(response, 'resources');
    return parsed.resources;
  }

  private parseJSON<T>(raw: string, label: string): T {
    try {
      const clean = raw
        .trim()
        .replace(/^```json\s*\n?/, '')
        .replace(/^```\s*\n?/, '')
        .replace(/\n?```\s*$/, '');

      return JSON.parse(clean) as T;
    } catch {
      throw new Error(`Failed to parse ${label} from AI response`);
    }
  }
}