export async function insertRoadmap(
  supabase: any,
  userId: string,
  params: {
    career_goal: string;
    target_company: string;
    timeline: string;
    modelConfig: { id: string; provider: string };
    phases: any[];
  },
) {
  const { data, error } = await supabase
    .from("roadmaps")
    .insert({
      user_id: userId,
      career_goal: params.career_goal,
      target_company: params.target_company,
      timeline: params.timeline,
      ai_model: params.modelConfig.id,
      ai_provider: params.modelConfig.provider,
      phases: params.phases,
    })
    .select()
    .single();

  if (error) {
    console.error("Roadmap insert error:", error);
    throw new Error(`Failed to insert roadmap: ${error.message}`);
  }

  return data;
}
