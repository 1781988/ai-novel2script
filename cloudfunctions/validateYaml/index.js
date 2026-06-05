const cloud = require("wx-server-sdk");
const { parseYamlContent, validateScreenplayObject } = require("../common/yaml-tools");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  try {
    const jsonContent = event.jsonContent || parseYamlContent(event.yamlContent || "");
    const result = validateScreenplayObject(jsonContent);
    return {
      success: true,
      valid: result.valid,
      errors: result.errors,
      jsonContent
    };
  } catch (error) {
    return {
      success: false,
      valid: false,
      errors: [{ path: "yaml", message: error.message }],
      jsonContent: null
    };
  }
};
