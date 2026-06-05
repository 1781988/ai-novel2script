async function chat({ systemPrompt, userPrompt, temperature = 0.3, responseFormat = "text" }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature,
      response_format: responseFormat === "json" ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error: ${text}`);
  }

  const data = await res.json();
  return data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : "";
}

module.exports = { chat };
