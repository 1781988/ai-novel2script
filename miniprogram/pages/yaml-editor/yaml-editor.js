Page({
  data: {
    yamlContent: "",
    validation: null,
    validating: false,
    repairing: false
  },

  onLoad() {
    const result = wx.getStorageSync("latestScriptResult") || {};
    this.setData({ yamlContent: result.yamlContent || "" });
  },

  onYamlChange(event) {
    this.setData({ yamlContent: event.detail.value });
  },

  formatYaml() {
    this.setData({ yamlContent: this.data.yamlContent.trim() });
    wx.showToast({ title: "已格式化", icon: "none" });
  },

  async validateYaml() {
    this.setData({ validating: true });
    try {
      const response = await wx.cloud.callFunction({
        name: "validateYaml",
        data: {
          yamlContent: this.data.yamlContent,
          jsonContent: (wx.getStorageSync("latestScriptResult") || {}).screenplay
        }
      });
      const validation = response.result || { valid: false, errors: [] };
      this.setData({ validation });
      wx.setStorageSync("yamlValidationStatus", validation.valid ? "passed" : "failed");
    } catch (error) {
      this.setData({ validation: { valid: false, errors: [{ path: "cloud", message: error.message }] } });
    } finally {
      this.setData({ validating: false });
    }
  },

  async repairYaml() {
    this.setData({ repairing: true });
    try {
      const response = await wx.cloud.callFunction({
        name: "repairYaml",
        data: {
          yamlContent: this.data.yamlContent,
          errors: this.data.validation ? this.data.validation.errors : []
        }
      });
      const result = response.result || {};
      this.setData({
        yamlContent: result.repairedYaml || this.data.yamlContent,
        validation: result.validation || null
      });
    } catch (error) {
      wx.showToast({ title: error.message || "修复失败", icon: "none" });
    } finally {
      this.setData({ repairing: false });
    }
  },

  saveVersion() {
    const result = wx.getStorageSync("latestScriptResult") || {};
    result.yamlContent = this.data.yamlContent;
    wx.setStorageSync("latestScriptResult", result);
    wx.showToast({ title: "已保存到本地", icon: "none" });
  }
});
