const cloud = require("wx-server-sdk");
const { callJsonWithFallback } = require("../common/llm-client");
const { buildFallbackEpisodes } = require("../common/script-pipeline");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function getChapters(projectId, inputChapters) {
  if (Array.isArray(inputChapters) && inputChapters.length) return inputChapters;
  const result = await db.collection("chapters").where({ projectId }).orderBy("order", "asc").get();
  return result.data;
}

async function saveEpisodes(projectId, episodes) {
  if (!projectId) return;
  await db.collection("episodes").add({
    data: {
      projectId,
      episodes,
      createdAt: new Date()
    }
  });
}

exports.main = async (event) => {
  const projectId = event.projectId || "";
  const chapters = await getChapters(projectId, event.chapters);
  const fallback = buildFallbackEpisodes(chapters);
  const response = await callJsonWithFallback({
    systemPrompt: "你是短剧分集策划，请根据章节摘要规划短剧分集，返回 JSON。",
    userPrompt: `规则：每集包含 1 到 3 个章节，每集必须有 title、summary、hook、sourceChapters。\n章节：${JSON.stringify(chapters)}`,
    fallback
  });
  const episodes = response.data.episodes || fallback.episodes;
  await saveEpisodes(projectId, episodes);
  return {
    success: true,
    projectId,
    episodes,
    provider: response.provider,
    model: response.model,
    usedFallback: response.usedFallback,
    errorMessage: response.errorMessage || ""
  };
};
