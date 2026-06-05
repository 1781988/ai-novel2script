const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const projectId = event.projectId || "";
  const scriptId = event.scriptId || "";
  const yamlContent = event.yamlContent || "";
  const versionName = event.versionName || "手动保存版本";
  const changeSummary = event.changeSummary || "用户保存剧本版本";

  if (!projectId || !yamlContent) {
    return { success: false, message: "projectId and yamlContent are required" };
  }

  const history = await db.collection("script_versions").where({ projectId }).get();
  const versionNo = history.data.length + 1;
  const result = await db.collection("script_versions").add({
    data: {
      projectId,
      scriptId,
      versionNo,
      versionName,
      yamlContent,
      changeSummary,
      createdAt: new Date()
    }
  });

  return {
    success: true,
    versionId: result._id,
    versionNo
  };
};
