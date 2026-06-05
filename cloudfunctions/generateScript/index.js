const cloud = require("wx-server-sdk");
const { callJsonWithFallback, getProvider, getModelName } = require("../common/llm-client");
const {
  buildFallbackInfo,
  buildFallbackEpisodes,
  buildFallbackScenes,
  buildScreenplayObject,
  toYaml
} = require("../common/script-pipeline");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function getProject(projectId) {
  if (!projectId) return {};
  try {
    const result = await db.collection("projects").doc(projectId).get();
    return result.data || {};
  } catch (error) {
    return { _id: projectId, projectId };
  }
}

async function getChapters(projectId, inputChapters) {
  if (Array.isArray(inputChapters) && inputChapters.length) return inputChapters;
  if (!projectId) return [];
  const result = await db.collection("chapters").where({ projectId }).orderBy("order", "asc").get();
  return result.data;
}

async function saveGeneration({ projectId, screenplay, yamlContent, provider, model }) {
  if (!projectId) return { scriptId: "" };
  const now = new Date();
  const script = await db.collection("scripts").add({
    data: {
      projectId,
      yamlContent,
      jsonContent: screenplay,
      validationStatus: "pending",
      warnings: [],
      createdAt: now,
      updatedAt: now
    }
  });
  await db.collection("script_versions").add({
    data: {
      projectId,
      scriptId: script._id,
      versionNo: 1,
      versionName: "AI初稿",
      yamlContent,
      changeSummary: "首次生成剧本 YAML",
      createdAt: now
    }
  });
  await db.collection("generation_logs").add({
    data: {
      projectId,
      stage: "generate_script",
      provider,
      model,
      status: "success",
      inputTokens: 0,
      outputTokens: 0,
      errorMessage: "",
      createdAt: now
    }
  });
  await db.collection("projects").doc(projectId).update({
    data: {
      status: "script_generated",
      updatedAt: now
    }
  });
  return { scriptId: script._id };
}

exports.main = async (event) => {
  const projectId = event.projectId || "";
  const provider = getProvider();
  const model = getModelName(provider);
  const project = event.project || await getProject(projectId);
  const chapters = await getChapters(projectId, event.chapters);

  if (chapters.length < 3) {
    return {
      success: false,
      reason: "章节数量不足，至少需要 3 个章节",
      chapterCount: chapters.length
    };
  }

  const info = event.info || buildFallbackInfo(chapters);
  const episodes = event.episodes || buildFallbackEpisodes(chapters).episodes;
  const scenes = event.scenes || buildFallbackScenes(chapters, episodes, info).scenes;
  const fallbackScreenplay = buildScreenplayObject({ project, chapters, info, episodes, scenes, provider, model });
  const aiResponse = await callJsonWithFallback({
    systemPrompt: "你是专业短剧编剧，请输出符合结构化剧本 Schema 的 JSON，不要输出 Markdown。",
    userPrompt: `请根据项目、章节、人物信息、分集和场景生成完整剧本 JSON。必须包含 schema_version、metadata、source、characters、relations、locations、episodes、scenes。\n项目：${JSON.stringify(project)}\n章节：${JSON.stringify(chapters)}\n信息：${JSON.stringify(info)}\n分集：${JSON.stringify(episodes)}\n场景：${JSON.stringify(scenes)}`,
    fallback: fallbackScreenplay
  });
  const screenplay = {
    ...fallbackScreenplay,
    ...aiResponse.data,
    metadata: {
      ...fallbackScreenplay.metadata,
      ...(aiResponse.data.metadata || {}),
      model_provider: aiResponse.provider,
      model_name: aiResponse.model
    }
  };
  const yamlContent = toYaml(screenplay);
  const saved = await saveGeneration({ projectId, screenplay, yamlContent, provider, model });

  return {
    success: true,
    projectId,
    scriptId: saved.scriptId,
    provider,
    model,
    screenplay,
    yamlContent,
    info,
    episodes,
    scenes,
    usedFallback: aiResponse.usedFallback,
    errorMessage: aiResponse.errorMessage || ""
  };
};
