const { cleanNovelText } = require("./text-cleaner");

const chapterRegex = /(^|\n)(第[一二三四五六七八九十百千万0-9]+[章节回].*|Chapter\s+\d+.*|#{1,3}\s*第.+[章节回].*)/g;

function countWords(text) {
  return cleanNovelText(text).replace(/\s/g, "").length;
}

function createChapter(block, index, projectId) {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  const title = (lines[0] || `第${index + 1}章`).replace(/^#{1,3}\s*/, "").trim();
  const body = lines.slice(1).join("\n").trim();

  return {
    chapterId: `chapter_${String(index + 1).padStart(3, "0")}`,
    projectId,
    title,
    order: index + 1,
    rawText: body,
    cleanText: cleanNovelText(body),
    wordCount: countWords(body)
  };
}

function parseChapters(input, options = {}) {
  const cleanText = cleanNovelText(input);
  const matches = [...cleanText.matchAll(chapterRegex)];
  const chapters = matches.map((match, index) => {
    const start = match.index + match[1].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : cleanText.length;
    return createChapter(cleanText.slice(start, end).trim(), index, options.projectId || "");
  });

  if (matches.length < 3) {
    return {
      valid: false,
      reason: "章节数量不足，至少需要 3 个章节",
      chapterCount: matches.length,
      chapters
    };
  }

  const missingTitle = chapters.find((chapter) => !chapter.title);
  if (missingTitle) {
    return {
      valid: false,
      reason: "存在缺少标题的章节",
      chapterCount: chapters.length,
      chapters
    };
  }

  return {
    valid: true,
    reason: "",
    chapterCount: chapters.length,
    chapters
  };
}

module.exports = {
  chapterRegex,
  parseChapters,
  countWords
};
