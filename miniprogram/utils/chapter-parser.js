const { cleanNovelText } = require("./text-cleaner");

const chapterRegex = /(^|\n)(第[一二三四五六七八九十百千万0-9]+[章节回].*|Chapter\s+\d+.*|#{1,3}\s*第.+[章节回].*)/g;

function parseChapters(input) {
  const cleanText = cleanNovelText(input);
  const matches = [...cleanText.matchAll(chapterRegex)];
  const chapters = matches.map((match, index) => {
    const start = match.index + match[1].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : cleanText.length;
    const block = cleanText.slice(start, end).trim();
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const title = (lines[0] || `第${index + 1}章`).replace(/^#{1,3}\s*/, "");
    const body = lines.slice(1).join("\n").trim();

    return {
      chapterId: `chapter_${String(index + 1).padStart(3, "0")}`,
      title,
      order: index + 1,
      rawText: body,
      cleanText: cleanNovelText(body),
      wordCount: cleanNovelText(body).replace(/\s/g, "").length
    };
  });

  if (matches.length < 3) {
    return {
      valid: false,
      reason: "章节数量不足，至少需要 3 个章节",
      chapterCount: matches.length,
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
  parseChapters
};
