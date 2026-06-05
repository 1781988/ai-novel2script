const cloud = require("wx-server-sdk");
const { callJsonWithFallback } = require("../common/llm-client");
const { buildFallbackInfo } = require("../common/script-pipeline");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function getChapters(projectId, inputChapters) {
  if (Array.isArray(inputChapters) && inputChapters.length) return inputChapters;
  if (!projectId) return [];
  const result = await db.collection("chapters").where({ projectId }).orderBy("order", "asc").get();
  return result.data;
}

async function saveInfo(projectId, info) {
  if (!projectId) return;
  await db.collection("extracted_infos").add({
    data: {
      projectId,
      ...info,
      createdAt: new Date()
    }
  });
}

exports.main = async (event) => {
  const projectId = event.projectId || "";
  const chapters = await getChapters(projectId, event.chapters);
  const fallback = buildFallbackInfo(chapters);
  const promptChapters = chapters.map((chapter) => `${chapter.title}\n${chapter.cleanText || chapter.rawText}`).join("\n\n");
  const response = await callJsonWithFallback({
    systemPrompt: "你是小说改编剧本策划，请抽取人物、地点、事件、冲突和人物关系，返回 JSON。",
    userPrompt: `请从以下小说章节中抽取信息，JSON 字段必须为 characters、locations、events、conflicts、relations。\n\n${promptChapters}`,
    fallback
  });
  const info = {
    characters: response.data.characters || fallback.characters,
    locations: response.data.locations || fallback.locations,
    events: response.data.events || fallback.events,
    conflicts: response.data.conflicts || fallback.conflicts,
    relations: response.data.relations || fallback.relations
  };
  await saveInfo(projectId, info);

  return {
    success: true,
    projectId,
    ...info,
    provider: response.provider,
    model: response.model,
    usedFallback: response.usedFallback,
    errorMessage: response.errorMessage || ""
  };
};
