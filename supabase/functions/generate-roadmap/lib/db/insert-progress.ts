export async function insertProgress(
  supabase: any,
  userId: string,
  roadmapId: string,
) {
  const { error } = await supabase
    .from("user_progress")
    .insert({
      user_id: userId,
      roadmap_id: roadmapId,
      completed_steps: [],
      progress_percentage: 0,
      streak_days: 0,
      milestones: [],
    });

  if (error) {
    console.error("Progress insert error:", error);
    throw new Error(`Failed to create progress record: ${error.message}`);
  }
}
