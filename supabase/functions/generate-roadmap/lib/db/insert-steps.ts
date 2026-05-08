export async function insertSteps(
  supabase: any,
  roadmapId: string,
  steps: any[],
) {
  const stepsToInsert = steps.map((step: any, index: number) => ({
    roadmap_id: roadmapId,
    phase: step.phase,
    title: step.title,
    description: step.description,
    difficulty: step.difficulty,
    estimated_time: step.estimated_time,
    step_order: step.step_order || index + 1,
  }));

  const { data, error } = await supabase
    .from("roadmap_steps")
    .insert(stepsToInsert)
    .select()
    .order("step_order", { ascending: true });

  if (error) {
    console.error("Steps insert error:", error);
    throw new Error(`Failed to insert steps: ${error.message}`);
  }

  return data;
}
