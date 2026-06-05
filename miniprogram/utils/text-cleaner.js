function cleanNovelText(input) {
  return String(input || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[ \u00A0]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

module.exports = {
  cleanNovelText
};
