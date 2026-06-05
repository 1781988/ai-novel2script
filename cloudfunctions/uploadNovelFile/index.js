const cloud = require("wx-server-sdk");
const mammoth = require("mammoth");
const { cleanNovelText, normalizeMarkdownText } = require("../common/text-cleaner");
const { parseChapters } = require("../common/chapter-parser");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

function getFileType(fileName = "") {
  const ext = fileName.split(".").pop().toLowerCase();
  if (["md", "markdown"].includes(ext)) return "markdown";
  if (ext === "docx") return "docx";
  return "txt";
}

async function extractText(buffer, fileType) {
  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return cleanNovelText(result.value);
  }

  const text = buffer.toString("utf8");
  return fileType === "markdown" ? normalizeMarkdownText(text) : cleanNovelText(text);
}

async function saveChapters(projectId, chapters) {
  if (!projectId) return;

  const oldRecords = await db.collection("chapters").where({ projectId }).get();
  await Promise.all(oldRecords.data.map((item) => db.collection("chapters").doc(item._id).remove()));
  await Promise.all(chapters.map((chapter) => db.collection("chapters").add({ data: chapter })));
  await db.collection("projects").doc(projectId).update({
    data: {
      chapterCount: chapters.length,
      status: "chapters_parsed",
      updatedAt: new Date()
    }
  });
}

exports.main = async (event) => {
  const projectId = event.projectId || "";
  const fileID = event.fileID;
  const fileName = event.fileName || "";

  if (!fileID) {
    return {
      success: false,
      reason: "缺少 fileID",
      chapters: []
    };
  }

  const fileType = getFileType(fileName);
  const download = await cloud.downloadFile({ fileID });
  const rawText = await extractText(download.fileContent, fileType);
  const result = parseChapters(rawText, { projectId });

  if (result.valid && projectId) {
    await saveChapters(projectId, result.chapters);
  }

  return {
    success: result.valid,
    projectId,
    fileType,
    reason: result.reason,
    chapterCount: result.chapterCount,
    chapters: result.chapters
  };
};
