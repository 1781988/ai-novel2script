const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const now = new Date();
  const projectName = normalizeText(event.projectName);
  const novelTitle = normalizeText(event.novelTitle);
  const authorName = normalizeText(event.authorName);
  const genre = normalizeText(event.genre) || "未分类";
  const episodeTargetMinutes = Number(event.episodeTargetMinutes || 5);

  if (!projectName || !novelTitle) {
    return {
      success: false,
      message: "projectName and novelTitle are required"
    };
  }

  const project = {
    userId: wxContext.OPENID,
    projectName,
    novelTitle,
    authorName,
    genre,
    targetType: event.targetType || "short_drama",
    episodeTargetMinutes,
    chapterCount: 0,
    status: "created",
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection("projects").add({
    data: project
  });

  return {
    success: true,
    projectId: result._id
  };
};
