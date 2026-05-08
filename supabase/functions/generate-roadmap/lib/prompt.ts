export function buildPrompt(
  career_goal: string,
  target_company: string,
  timeline: string,
): string {
  return `You are a career advisor AI. Generate a detailed, structured career roadmap for the following:

Career Goal: ${career_goal}
Target Company: ${target_company}
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

Tailor the content specifically for ${target_company}'s culture, interview process, and technical requirements.
Adjust the pacing and depth based on the ${timeline} timeline.

Return ONLY valid JSON in this exact format:
{
  "phases": [...],
  "steps": [...],
  "resources": [...]
}`;
}
