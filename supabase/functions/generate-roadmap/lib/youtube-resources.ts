import { searchYouTubeVideo, YouTubeVideo } from "./youtube.ts";

const ROLE_CHANNELS: Record<string, string[]> = {
    frontend: ["WebDevSimplified", "Fireship", "VercelHQ", "ChromeDevelopers"],
    backend: ["husseinalnasser", "TechWithTim", "Fireship"],
    ml: ["Statquest", "TensorFlow", "googledeepmind"],
    devops: ["GoogleCloudTech", "AzureDevOps", "awsdevelopers"],
    mobile: ["Android", "AppleDeveloper"],
    dsa: ["NeetCode", "CSDojo", "ByteByteGo"],
    system_design: ["ByteByteGo", "husseinalnasser", "GoogleDevelopers"],
    interview: ["NeetCode", "TechLead", "ByteByteGo"],
};

export async function fetchVideoForStep(
    apiKey: string,
    phase: string,
    stepTitle: string,
    careerGoal: string
): Promise<YouTubeVideo | null> {
    const role = detectRole(phase, careerGoal);
    const channels = ROLE_CHANNELS[role] ?? ["Fireship", "ByteByteGo"];

    for (const channel of channels) {
        const video = await searchYouTubeVideo(apiKey, channel, stepTitle);
        if (video) return video;
    }

    return null;
}

function detectRole(phase: string, careerGoal: string): string {
    const g = careerGoal.toLowerCase();
    if (phase.toLowerCase().includes("algorithm") || phase.toLowerCase().includes("dsa")) return "dsa";
    if (phase.toLowerCase().includes("system")) return "system_design";
    if (phase.toLowerCase().includes("interview")) return "interview";
    if (g.includes("frontend") || g.includes("front-end")) return "frontend";
    if (g.includes("backend") || g.includes("back-end")) return "backend";
    if (g.includes("ml") || g.includes("machine learning") || g.includes("data")) return "ml";
    if (g.includes("devops") || g.includes("platform") || g.includes("cloud")) return "devops";
    if (g.includes("mobile") || g.includes("ios") || g.includes("android")) return "mobile";
    return "backend";
}