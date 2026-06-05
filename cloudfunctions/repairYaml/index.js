const cloud = require("wx-server-sdk");
const { callLLM } = require("../common/llm-client");
const { parseYamlContent, validateScreenplayObject } = require("../common/yaml-tools");
const { toYaml } = require("../common/script-pipeline");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function repairObject(data) {
  const repaired = data && typeof data === "object" ? { ...data } : {};
  repaired.schema_version = repaired.schema_version || "1.0.0";
  repaired.metadata = repaired.metadata || {};
  repaired.source = repaired.source || {};
  repaired.characters = Array.isArray(repaired.characters) ? repaired.characters : [];
  repaired.episodes = Array.isArray(repaired.episodes) ? repaired.episodes : [];
  repaired.scenes = Array.isArray(repaired.scenes) ? repaired.scenes : [];
  repaired.source.chapters = Array.isArray(repaired.source.chapters) ? repaired.source.chapters : [];
  repaired.metadata.chapter_count = Math.max(Number(repaired.metadata.chapter_count || repaired.source.chapters.length || 3), 3);
  repaired.scenes = repaired.scenes.map((scene, index) => ({
    sceneId: scene.sceneId || `scene_${String(index + 1).padStart(3, "0")}`,
    episodeId: scene.episodeId || "ep_001",
    chapterId: scene.chapterId || "chapter_001",
    title: scene.title || `第 ${index + 1} 场`,
    time: scene.time || "",
    location: scene.location || "",
    characters: Array.isArray(scene.characters) ? scene.characters : [],
    conflict: scene.conflict || "",
    summary: scene.summary || "",
    beats: Array.isArray(scene.beats) && scene.beats.length ? scene.beats.map((beat) => ({
      type: ["action", "dialogue", "narration", "transition"].includes(beat.type) ? beat.type : "action",
      speaker: beat.speaker || "",
      content: beat.content || "补充场景内容。"
    })) : [{ type: "action", content: "补充场景内容。" }]
  }));
  return repaired;
}

exports.main = async (event) => {
  let repairedYaml = "";
  let usedFallback = false;
  try {
    repairedYaml = await callLLM({
      systemPrompt: "你是 YAML 修复助手，只返回修复后的 YAML。",
      userPrompt: `请修复以下剧本 YAML，使其通过错误列表约束。\n错误：${JSON.stringify(event.errors || [])}\nYAML：\n${event.yamlContent || ""}`,
      temperature: 0.1
    });
  } catch (error) {
    usedFallback = true;
    const repairedObject = repairObject(parseYamlContent(event.yamlContent || ""));
    repairedYaml = toYaml(repairedObject);
  }

  const jsonContent = parseYamlContent(repairedYaml);
  const validation = validateScreenplayObject(jsonContent);
  return {
    success: true,
    repairedYaml,
    jsonContent,
    validation,
    usedFallback
  };
};
