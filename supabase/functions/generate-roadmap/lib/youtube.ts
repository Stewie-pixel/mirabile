const CHANNEL_IDS: Record<string, string> = {
    // General
    TechWithTim: "UC4JX40jDee_tINbkjycV4Sg",
    Fireship: "UCsBjURrPoezykLs9EqgamOA",
    NeetCode: "UC_mYaQAE6-71rjSN6CeCA-g",
    WebDevSimplified: "UCFbNIlppjAuEX4znoulh0Cw",
    husseinalnasser: "UC9-y-6csu5WGm29I7JiwpnA",
    ByteByteGo: "UCZgt6AzoyjslHTC9dz0UoTw",
    FreeCodeCamp: "UC8butISFwT-Wl7EV0hUK0BQ",
    TechLead: "UC4xKdmAXFh4ACyhpiQ_3qBw",
    CSDojo: "UCxX9wt5FWQUAAz4UrysqK9A",
    Statquest: "UCtYLUTtgS3k1Fg4y5tAhLbw",
    MIT: "UCEBb1b_L6zDS3xTUrIALZOw",
    Harvard: "UCznv7Vf9nBdJYvBagFdAHWw",
    Stanford: "UC84whx2xxsiA1gXHXXqKGOA",
    // Google
    GoogleDevelopers: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    Android: "UCVHFbw7woebKtfgADH5lgNQ",
    ChromeDevelopers: "UCnUYZLuoy1rq1aVMwx4aTzw",
    GoogleCloudTech: "UCJS9pqu9BzkAMNTmzNMNhvg",
    TensorFlow: "UC0rqucBdTuFTjJiefW5t-IQ",
    googledeepmind: "UCP7jMXSY2xbc3KCAE0MHQ-A",
    // Meta
    MetaDevelopers: "UCP4bf6IHJJQehibu6ai__cg",
    // Microsoft
    MicrosoftDeveloper: "UCsMica-v34Irf9KVTioWccg",
    visualstudio: "UChqrDOwARrxdJF-ykAptc7w",
    AzureDevOps: "UC-ikyViYMM69joIAv7dlMsA",
    // AWS
    awsdevelopers: "UCd6MoB9NC6JDDSLYkMmJ3qA",
    AmazonWebServices: "UCd6MoB9NC6JDDSLYkMmJ3qA",
    // Apple
    AppleDeveloper: "UCywC6WhWTQZnb0OoTg5WBUA",
    // Netflix
    WeAreNetflix: "UCGGRRqAjPm6sL3-WGBDnKJA",
    // LinkedIn
    LinkedInEngineering: "UCVQjiv2GaKZ343oI916AJUA",
    // GitHub
    GitHub: "UC7c3Kb6jYCRj4JOHHZTxKsQ",
    // Vercel
    VercelHQ: "UCLq8gNoee7oXM7MvTdjyQvA",
    // Cloudflare
    CloudflareDevelopers: "UCFpL8O4SXxA40AEVt4RQRDg",
};

export interface YouTubeVideo {
    title: string;
    url: string;
    channelTitle: string;
}

export async function searchYouTubeVideo(
    apiKey: string,
    channelHandle: string,
    topic: string
): Promise<YouTubeVideo | null> {
    const channelId = CHANNEL_IDS[channelHandle];
    if (!channelId) return null;

    const params = new URLSearchParams({
        part: "snippet",
        type: "video",
        q: topic,
        channelId,
        maxResults: "1",
        relevanceLanguage: "en",
        key: apiKey,
    });

    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/search?${params}`
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[searchYouTubeVideo] API error ${res.status}: ${errorText}`);
            return null;
        }

        const data = await res.json();
        const item = data.items?.[0];
        if (!item) return null;

        return {
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            channelTitle: item.snippet.channelTitle,
        };
    } catch (error) {
        console.error("[searchYouTubeVideo] search failed:", error);
        return null;
    }
}