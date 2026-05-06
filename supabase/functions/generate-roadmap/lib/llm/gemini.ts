export async function callGemini(
  accessToken: string,
  projectId: string,
  location: string,
  model: string,
  prompt: string,
): Promise<string> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "x-goog-user-project": projectId,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Gemini error:", data);
    throw new Error("Gemini API call failed");
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text content");
  return text;
}
