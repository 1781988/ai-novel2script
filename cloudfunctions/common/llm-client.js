const deepseek = require("./adapters/deepseek");
const gemini = require("./adapters/gemini");
const openai = require("./adapters/openai");

function getProvider() {
  return (process.env.LLM_PROVIDER || "deepseek").toLowerCase();
}

function getModelName(provider = getProvider()) {
  if (provider === "gemini") return process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (provider === "openai") return process.env.OPENAI_MODEL || "gpt-4.1-mini";
  return process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
}

async function callLLM({ systemPrompt, userPrompt, temperature = 0.3, responseFormat = "text" }) {
  const provider = getProvider();
  if (provider === "deepseek") return deepseek.chat({ systemPrompt, userPrompt, temperature, responseFormat });
  if (provider === "gemini") return gemini.chat({ systemPrompt, userPrompt, temperature, responseFormat });
  if (provider === "openai") return openai.chat({ systemPrompt, userPrompt, temperature, responseFormat });
  throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
}

async function callJsonWithFallback({ systemPrompt, userPrompt, fallback, temperature = 0.3 }) {
  try {
    const content = await callLLM({ systemPrompt, userPrompt, temperature, responseFormat: "json" });
    return {
      data: JSON.parse(extractJson(content)),
      provider: getProvider(),
      model: getModelName(),
      usedFallback: false
    };
  } catch (error) {
    return {
      data: fallback,
      provider: getProvider(),
      model: getModelName(),
      usedFallback: true,
      errorMessage: error.message
    };
  }
}

function extractJson(content) {
  const text = String(content || "").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

module.exports = {
  callLLM,
  callJsonWithFallback,
  getProvider,
  getModelName
};
