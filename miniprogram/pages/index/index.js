Page({
  data: {
    flow: [
      { name: "创建项目", desc: "记录小说标题、作者、题材和目标短剧时长。" },
      { name: "导入小说", desc: "支持粘贴文本和上传 TXT、Markdown、DOCX。" },
      { name: "生成剧本", desc: "由云函数驱动 AI 生成 YAML 剧本并进行 Schema 校验。" }
    ]
  },

  goCreate() {
    wx.navigateTo({ url: "/pages/project-create/project-create" });
  },

  goSettings() {
    wx.navigateTo({ url: "/pages/settings/settings" });
  },

  goImport() {
    wx.navigateTo({ url: "/pages/import/import" });
  },

  useSample() {
    wx.navigateTo({ url: "/pages/import/import?sample=1" });
  },

  showComingSoon() {
    wx.showToast({
      title: "后续 PR 开放",
      icon: "none"
    });
  }
});
