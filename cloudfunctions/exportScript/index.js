const cloud = require("wx-server-sdk");
const { normalizeScript, getExportContent, getFileExt } = require("../common/export-helper");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function getScriptById(scriptId) {
  if (!scriptId) return null;
  const result = await db.collection("scripts").doc(scriptId).get();
  return result.data;
}

exports.main = async (event) => {
  const format = (event.format || "yaml").toLowerCase();
  const scriptRecord = await getScriptById(event.scriptId);
  const yamlContent = event.yamlContent || (scriptRecord && scriptRecord.yamlContent) || "";
  const screenplay = normalizeScript({
    ...event,
    yamlContent,
    jsonContent: event.jsonContent || (scriptRecord && scriptRecord.jsonContent)
  });
  const content = getExportContent({ format, yamlContent, screenplay });
  const ext = getFileExt(format);
  const fileName = `chapterstage-${Date.now()}.${ext}`;
  const cloudPath = `exports/${fileName}`;

  try {
    const upload = await cloud.uploadFile({
      cloudPath,
      fileContent: Buffer.from(content, "utf8")
    });
    return {
      success: true,
      format,
      fileName,
      fileID: upload.fileID,
      content
    };
  } catch (error) {
    return {
      success: true,
      format,
      fileName,
      fileID: "",
      content,
      warning: error.message
    };
  }
};
