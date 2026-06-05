Page({
  data: {
    title: "未生成剧本",
    validationStatus: "未校验",
    screenplay: {
      characters: [],
      locations: [],
      episodes: [],
      scenes: []
    }
  },

  onLoad() {
    this.loadScript();
  },

  onShow() {
    this.loadScript();
  },

  loadScript() {
    const result = wx.getStorageSync("latestScriptResult") || {};
    const screenplay = result.screenplay || {};
    this.setData({
      title: screenplay.metadata ? screenplay.metadata.title : "未生成剧本",
      validationStatus: wx.getStorageSync("yamlValidationStatus") || "未校验",
      screenplay: {
        characters: screenplay.characters || [],
        locations: screenplay.locations || [],
        episodes: screenplay.episodes || [],
        scenes: screenplay.scenes || []
      }
    });
  },

  editScene(event) {
    wx.setStorageSync("editingScene", event.detail.scene);
    wx.navigateTo({ url: "/pages/scene-editor/scene-editor" });
  },

  goYaml() {
    wx.navigateTo({ url: "/pages/yaml-editor/yaml-editor" });
  },

  goRelations() {
    wx.navigateTo({ url: "/pages/relation-graph/relation-graph" });
  },

  goVersions() {
    wx.navigateTo({ url: "/pages/version-history/version-history" });
  },

  async saveVersion() {
    const result = wx.getStorageSync("latestScriptResult") || {};
    try {
      const response = await wx.cloud.callFunction({
        name: "saveVersion",
        data: {
          projectId: result.projectId || "local_project",
          scriptId: result.scriptId || "",
          yamlContent: result.yamlContent || "",
          versionName: "预览页保存",
          changeSummary: "从剧本预览页保存版本"
        }
      });
      wx.showToast({ title: response.result.success ? "已保存版本" : "保存失败", icon: "none" });
    } catch (error) {
      wx.showToast({ title: "已保存本地版本", icon: "none" });
      const versions = wx.getStorageSync("localVersions") || [];
      versions.push({
        versionNo: versions.length + 1,
        versionName: "本地版本",
        yamlContent: result.yamlContent || "",
        changeSummary: "本地保存版本"
      });
      wx.setStorageSync("localVersions", versions);
    }
  }
});
