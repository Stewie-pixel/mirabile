export async function insertResources(
  supabase: any,
  steps: any[],
  resources: any[],
) {
  const resourcesToInsert = resources
    .map((resource: any) => {
      const step = steps[resource.step_index];
      if (!step) return null;
      return {
        step_id: step.id,
        resource_type: resource.resource_type,
        title: resource.title,
        url: resource.url,
        description: resource.description,
      };
    })
    .filter(Boolean);

  if (!resourcesToInsert.length) return;

  const { error } = await supabase
    .from("resources")
    .insert(resourcesToInsert);

  if (error) {
    console.error("Resources insert error:", error);
    throw new Error(`Failed to insert resources: ${error.message}`);
  }
}
