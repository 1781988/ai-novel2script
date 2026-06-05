const cloud = require("wx-server-sdk");
const { cleanNovelText } = require("../common/text-cleaner");
const { parseChapters } = require("../common/chapter-parser");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

async function replaceProjectChapters(projectId, chapters) {
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
  const rawText = String(event.rawText || event.text || "");
  const cleanText = cleanNovelText(rawText);
  const result = parseChapters(cleanText, { projectId });

  if (result.valid && projectId) {
    await replaceProjectChapters(projectId, result.chapters);
  }

  return {
    success: result.valid,
    projectId,
    reason: result.reason,
    chapterCount: result.chapterCount,
    chapters: result.chapters
  };
};
