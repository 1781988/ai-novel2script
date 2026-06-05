function parseScalar(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text === "[]" || text === "{}") return text === "[]" ? [] : {};
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  try {
    return JSON.parse(text);
  } catch (error) {
    return text.replace(/^["']|["']$/g, "");
  }
}

function parseSimpleYaml(yamlContent) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  String(yamlContent || "").split(/\r?\n/).forEach((rawLine) => {
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) return;
    const indent = rawLine.match(/^ */)[0].length;
    const line = rawLine.trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].value;

    if (line.startsWith("- ")) {
      if (!Array.isArray(parent)) return;
      const content = line.slice(2);
      if (content.includes(":")) {
        const [key, ...rest] = content.split(":");
        const item = {};
        parent.push(item);
        const restValue = rest.join(":").trim();
        item[key.trim()] = restValue ? parseScalar(restValue) : {};
        stack.push({ indent, value: item });
        if (!restValue) stack.push({ indent: indent + 2, value: item[key.trim()] });
      } else {
        parent.push(parseScalar(content));
      }
      return;
    }

    const [key, ...rest] = line.split(":");
    const restValue = rest.join(":").trim();
    if (!key) return;
    if (restValue) {
      parent[key.trim()] = parseScalar(restValue);
      return;
    }
    const nextValue = {};
    parent[key.trim()] = nextValue;
    stack.push({ indent, value: nextValue });
  });
  return root;
}

function normalizeParsedYaml(parsed) {
  // The project YAML generator emits nested arrays after a parent key. This lightweight parser
  // is a fallback for cloud functions without js-yaml installed locally.
  return parsed || {};
}

function validateScreenplayObject(data) {
  const errors = [];
  const requireField = (condition, path, message) => {
    if (!condition) errors.push({ path, message });
  };

  requireField(data && data.schema_version, "schema_version", "缺少 schema_version");
  requireField(data && data.metadata, "metadata", "缺少 metadata");
  requireField(data && data.source, "source", "缺少 source");
  requireField(Array.isArray(data && data.characters), "characters", "characters 必须是数组");
  requireField(Array.isArray(data && data.episodes), "episodes", "episodes 必须是数组");
  requireField(Array.isArray(data && data.scenes), "scenes", "scenes 必须是数组");

  if (data && data.metadata) {
    requireField(Number(data.metadata.chapter_count) >= 3, "metadata.chapter_count", "chapter_count 至少为 3");
  }
  if (data && data.source) {
    requireField(Array.isArray(data.source.chapters) && data.source.chapters.length >= 3, "source.chapters", "source.chapters 至少包含 3 章");
  }
  if (Array.isArray(data && data.scenes)) {
    data.scenes.forEach((scene, sceneIndex) => {
      requireField(Array.isArray(scene.beats) && scene.beats.length > 0, `scenes[${sceneIndex}].beats`, "每个 scene 必须有 beats");
      if (Array.isArray(scene.beats)) {
        scene.beats.forEach((beat, beatIndex) => {
          requireField(beat.type, `scenes[${sceneIndex}].beats[${beatIndex}].type`, "beat 缺少 type");
          requireField(beat.content, `scenes[${sceneIndex}].beats[${beatIndex}].content`, "beat 缺少 content");
          requireField(["action", "dialogue", "narration", "transition"].includes(beat.type), `scenes[${sceneIndex}].beats[${beatIndex}].type`, "beat.type 不合法");
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function parseYamlContent(yamlContent) {
  try {
    const yaml = require("js-yaml");
    return yaml.load(yamlContent);
  } catch (error) {
    return normalizeParsedYaml(parseSimpleYaml(yamlContent));
  }
}

module.exports = {
  parseYamlContent,
  validateScreenplayObject
};
