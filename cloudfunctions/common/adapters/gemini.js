async function chat({ systemPrompt, userPrompt, temperature = 0.3 }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      generationConfig: { temperature },
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${text}`);
  }

  const data = await res.json();
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content
    ? data.candidates[0].content.parts || []
    : [];
  return parts.map((part) => part.text || "").join("");
}

module.exports = { chat };
