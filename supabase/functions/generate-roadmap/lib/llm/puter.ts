export async function callPuter(
    prompt: string
): Promise<string> {
    const response = await fetch("https://api.puter.com/drivers/call", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            interface: "puter-chat-completion",
            driver: "openai-completion",
            test_mode: false,
            method: "complete",
            args: {
                messages: [{ role: "user", content: prompt }],
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Puter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.result?.message?.content ?? "";
}