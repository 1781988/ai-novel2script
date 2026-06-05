function cleanNovelText(input) {
  return String(input || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[ \u00A0]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeMarkdownText(input) {
  return cleanNovelText(input)
    .replace(/^#{1,3}\s*(第.+[章节回].*)$/gm, "$1")
    .replace(/^#{1,3}\s*(Chapter\s+\d+.*)$/gim, "$1");
}

module.exports = {
  cleanNovelText,
  normalizeMarkdownText
};
