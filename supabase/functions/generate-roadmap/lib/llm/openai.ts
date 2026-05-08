export async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("OpenAI error:", data);
    throw new Error("OpenAI API call failed");
  }

  return data.choices[0].message.content;
}
