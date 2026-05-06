export function safeParseJSON(content: string): any {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Failed to parse LLM response as JSON: no JSON object found");
    }
    return JSON.parse(match[0]);
  }
}
