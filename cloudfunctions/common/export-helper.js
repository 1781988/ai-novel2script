const { parseYamlContent } = require("./yaml-tools");

function normalizeScript(event) {
  if (event.jsonContent) return event.jsonContent;
  if (event.screenplay) return event.screenplay;
  return parseYamlContent(event.yamlContent || "");
}

function exportYaml({ yamlContent, screenplay }) {
  if (yamlContent) return yamlContent;
  const { toYaml } = require("./script-pipeline");
  return toYaml(screenplay || {});
}

function beatToMarkdown(beat) {
  if (beat.type === "dialogue") return `${beat.speaker || "角色"}：${beat.content}`;
  if (beat.type === "action") return `动作：${beat.content}`;
  if (beat.type === "transition") return `转场：${beat.content}`;
  return `旁白：${beat.content}`;
}

function exportMarkdown(screenplay) {
  const lines = [`# ${screenplay.metadata && screenplay.metadata.title ? screenplay.metadata.title : "未命名剧本"}`, ""];
  lines.push("## 人物表", "");
  (screenplay.characters || []).forEach((item) => {
    lines.push(`- ${item.name}：${item.description || ""}`);
  });
  lines.push("");

  (screenplay.episodes || []).forEach((episode) => {
    lines.push(`## 第 ${episode.order} 集：${episode.title}`, "");
    (screenplay.scenes || []).filter((scene) => scene.episodeId === episode.episodeId).forEach((scene, index) => {
      lines.push(`### 第 ${index + 1} 场：${scene.title}`, "");
      lines.push(`时间：${scene.time || ""}  `);
      lines.push(`地点：${scene.location || ""}  `);
      lines.push(`人物：${Array.isArray(scene.characters) ? scene.characters.join("、") : ""}  `);
      lines.push("");
      (scene.beats || []).forEach((beat) => lines.push(beatToMarkdown(beat)));
      lines.push("");
    });
  });
  return lines.join("\n");
}

function exportTxt(screenplay) {
  return exportMarkdown(screenplay)
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/  $/gm, "");
}

function getExportContent({ format, yamlContent, screenplay }) {
  if (format === "markdown" || format === "md") return exportMarkdown(screenplay);
  if (format === "txt") return exportTxt(screenplay);
  return exportYaml({ yamlContent, screenplay });
}

function getFileExt(format) {
  if (format === "markdown" || format === "md") return "md";
  if (format === "txt") return "txt";
  return "yaml";
}

module.exports = {
  normalizeScript,
  getExportContent,
  getFileExt,
  exportMarkdown,
  exportTxt
};
