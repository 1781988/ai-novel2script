const cloud = require("wx-server-sdk");
const { callLLM } = require("../common/llm-client");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const content = String(event.content || "");
  try {
    const polished = await callLLM({
      systemPrompt: "你是短剧对白润色助手，保持原意，让对白更口语、更有戏剧张力，只返回对白。",
      userPrompt: content,
      temperature: 0.5
    });
    return { success: true, polishedContent: polished || content };
  } catch (error) {
    return {
      success: true,
      polishedContent: content.endsWith("。") ? `${content.slice(0, -1)}，现在必须做决定。` : `${content}，现在必须做决定。`,
      usedFallback: true,
      errorMessage: error.message
    };
  }
};
