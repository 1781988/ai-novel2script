function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function summarize(text, limit = 80) {
  const clean = String(text || "").replace(/\s+/g, "");
  return clean.length > limit ? `${clean.slice(0, limit)}...` : clean;
}

function inferCharacterNames(chapters) {
  const text = chapters.map((chapter) => chapter.cleanText || chapter.rawText || "").join("\n");
  const matches = text.match(/[一-龥]{2,3}/g) || [];
  const stopWords = new Set(["第一", "第二", "第三", "第四", "第五", "深夜", "老宅", "地下", "小说", "正文"]);
  const counts = {};
  matches.forEach((name) => {
    if (!stopWords.has(name)) counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name], index) => ({
      characterId: `char_${String(index + 1).padStart(3, "0")}`,
      name,
      roleType: index === 0 ? "protagonist" : "supporting",
      description: `${name} 是从小说文本中识别出的角色。`,
      firstAppearance: chapters[0] ? chapters[0].chapterId : ""
    }));
}

function inferLocations(chapters) {
  const candidates = ["出租屋", "老宅", "地下室", "门廊", "街道", "书房"];
  const text = chapters.map((chapter) => chapter.cleanText || chapter.rawText || "").join("\n");
  const locations = candidates.filter((item) => text.includes(item));
  const list = locations.length ? locations : ["主要场景"];
  return list.slice(0, 5).map((name, index) => ({
    locationId: `loc_${String(index + 1).padStart(3, "0")}`,
    name,
    description: `${name} 是剧情推进的重要空间。`,
    atmosphere: index === 0 ? ["悬疑", "紧张"] : ["叙事"]
  }));
}

function buildFallbackInfo(chapters) {
  const characters = inferCharacterNames(chapters);
  const locations = inferLocations(chapters);
  const events = chapters.map((chapter) => ({
    eventId: `event_${String(chapter.order).padStart(3, "0")}`,
    chapterId: chapter.chapterId,
    title: chapter.title,
    summary: summarize(chapter.cleanText, 90)
  }));
  const conflicts = chapters.map((chapter) => ({
    conflictId: `conflict_${String(chapter.order).padStart(3, "0")}`,
    chapterId: chapter.chapterId,
    description: `${chapter.title} 中的关键悬念需要被改编为戏剧冲突。`
  }));
  const relations = characters.length > 1 ? [{
    relationId: "rel_001",
    source: characters[0].name,
    target: characters[1].name,
    relationType: "story_tension",
    description: "二人在核心事件中互相推动剧情。",
    evidence: chapters[0] ? chapters[0].title : ""
  }] : [];

  return { characters, locations, events, conflicts, relations };
}

function buildFallbackEpisodes(chapters) {
  const episodes = [];
  for (let index = 0; index < chapters.length; index += 3) {
    const group = chapters.slice(index, index + 3);
    const order = episodes.length + 1;
    episodes.push({
      episodeId: `ep_${String(order).padStart(3, "0")}`,
      title: group[0] ? group[0].title.replace(/^第.+?[章节回]\s*/, "") || `第 ${order} 集` : `第 ${order} 集`,
      order,
      sourceChapters: group.map((chapter) => chapter.chapterId),
      summary: group.map((chapter) => summarize(chapter.cleanText, 40)).join(" / "),
      hook: group[group.length - 1] ? `${group[group.length - 1].title} 留下新的悬念。` : "剧情继续推进。"
    });
  }
  return { episodes };
}

function buildFallbackScenes(chapters, episodes, info) {
  const characters = ensureArray(info.characters);
  const locations = ensureArray(info.locations);
  const scenes = [];
  ensureArray(episodes).forEach((episode) => {
    ensureArray(episode.sourceChapters).forEach((chapterId) => {
      const chapter = chapters.find((item) => item.chapterId === chapterId);
      if (!chapter) return;
      const order = scenes.length + 1;
      const location = locations[(order - 1) % Math.max(locations.length, 1)];
      scenes.push({
        sceneId: `scene_${String(order).padStart(3, "0")}`,
        episodeId: episode.episodeId,
        chapterId: chapter.chapterId,
        title: chapter.title,
        time: order === 1 ? "深夜" : "日内",
        location: location ? location.name : "主要场景",
        characters: characters.slice(0, 3).map((item) => item.name),
        conflict: `${chapter.title} 的核心冲突被压缩为可表演场景。`,
        summary: summarize(chapter.cleanText, 90),
        beats: [
          { type: "action", content: summarize(chapter.cleanText, 45) || "人物进入场景，情绪逐步累积。" },
          { type: "dialogue", speaker: characters[0] ? characters[0].name : "角色", content: "这件事不能再拖下去了。" },
          { type: "narration", content: episode.hook || "场景在悬念中结束。" }
        ]
      });
    });
  });
  return { scenes };
}

function buildScreenplayObject({ project = {}, chapters = [], info = {}, episodes = [], scenes = [], provider = "fallback", model = "rule-based" }) {
  return {
    schema_version: "1.0.0",
    metadata: {
      project_id: project._id || project.projectId || "",
      title: project.novelTitle || project.projectName || "未命名小说",
      source_type: "novel",
      target_type: "short_drama_script",
      genre: project.genre || "未分类",
      language: "zh-CN",
      chapter_count: chapters.length,
      episode_count: episodes.length,
      created_at: new Date().toISOString(),
      model_provider: provider,
      model_name: model
    },
    source: {
      novel_title: project.novelTitle || "",
      author: project.authorName || "",
      chapters: chapters.map((chapter) => ({
        chapter_id: chapter.chapterId,
        title: chapter.title,
        order: chapter.order,
        summary: summarize(chapter.cleanText, 70)
      }))
    },
    characters: ensureArray(info.characters),
    relations: ensureArray(info.relations),
    locations: ensureArray(info.locations),
    episodes,
    scenes
  };
}

function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return value.map((item) => {
      if (typeof item === "object" && item !== null) {
        return `${pad}- ${toYamlObjectInline(item, indent + 2)}`;
      }
      return `${pad}- ${formatScalar(item)}`;
    }).join("\n");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).map(([key, item]) => {
      if (typeof item === "object" && item !== null) {
        const rendered = toYaml(item, indent + 2);
        return `${pad}${key}:\n${rendered}`;
      }
      return `${pad}${key}: ${formatScalar(item)}`;
    }).join("\n");
  }
  return formatScalar(value);
}

function toYamlObjectInline(object, indent) {
  const entries = Object.entries(object);
  return entries.map(([key, value], index) => {
    if (typeof value === "object" && value !== null) {
      return `${index === 0 ? `${key}:\n` : `${" ".repeat(indent)}${key}:\n`}${toYaml(value, indent + 2)}`;
    }
    return `${index === 0 ? "" : " ".repeat(indent)}${key}: ${formatScalar(value)}`;
  }).join("\n");
}

function formatScalar(value) {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "\"\"";
  return JSON.stringify(String(value));
}

module.exports = {
  buildFallbackInfo,
  buildFallbackEpisodes,
  buildFallbackScenes,
  buildScreenplayObject,
  toYaml
};
