Page({
  data: {
    versions: []
  },

  onLoad() {
    this.loadLocalVersions();
  },

  loadLocalVersions() {
    const result = wx.getStorageSync("latestScriptResult") || {};
    const versions = wx.getStorageSync("localVersions") || [];
    if (result.yamlContent && !versions.length) {
      versions.push({
        versionNo: 1,
        versionName: "AI初稿",
        yamlContent: result.yamlContent,
        changeSummary: "首次生成剧本 YAML"
      });
    }
    this.setData({ versions });
  },

  restoreVersion(event) {
    const version = event.detail.version;
    const result = wx.getStorageSync("latestScriptResult") || {};
    result.yamlContent = version.yamlContent;
    wx.setStorageSync("latestScriptResult", result);
    wx.showToast({ title: "已恢复版本", icon: "none" });
  }
});
