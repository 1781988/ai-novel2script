const cloud = require("wx-server-sdk");
const { callJsonWithFallback } = require("../common/llm-client");
const { buildFallbackScenes } = require("../common/script-pipeline");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function getChapters(projectId, inputChapters) {
  if (Array.isArray(inputChapters) && inputChapters.length) return inputChapters;
  const result = await db.collection("chapters").where({ projectId }).orderBy("order", "asc").get();
  return result.data;
}

async function getLatestEpisodes(projectId, inputEpisodes) {
  if (Array.isArray(inputEpisodes) && inputEpisodes.length) return inputEpisodes;
  const result = await db.collection("episodes").where({ projectId }).orderBy("createdAt", "desc").limit(1).get();
  return result.data[0] ? result.data[0].episodes : [];
}

async function getLatestInfo(projectId, inputInfo) {
  if (inputInfo && inputInfo.characters) return inputInfo;
  const result = await db.collection("extracted_infos").where({ projectId }).orderBy("createdAt", "desc").limit(1).get();
  return result.data[0] || {};
}

exports.main = async (event) => {
  const projectId = event.projectId || "";
  const chapters = await getChapters(projectId, event.chapters);
  const episodes = await getLatestEpisodes(projectId, event.episodes);
  const info = await getLatestInfo(projectId, event.info);
  const fallback = buildFallbackScenes(chapters, episodes, info);
  const response = await callJsonWithFallback({
    systemPrompt: "你是剧本统筹，请把章节和分集拆成可拍摄的场景，返回 JSON。",
    userPrompt: `每个 scene 必须包含 sceneId、episodeId、chapterId、title、time、location、characters、conflict、summary、beats。\n章节：${JSON.stringify(chapters)}\n分集：${JSON.stringify(episodes)}\n信息：${JSON.stringify(info)}`,
    fallback
  });
  const scenes = response.data.scenes || fallback.scenes;
  return {
    success: true,
    projectId,
    scenes,
    provider: response.provider,
    model: response.model,
    usedFallback: response.usedFallback,
    errorMessage: response.errorMessage || ""
  };
};
