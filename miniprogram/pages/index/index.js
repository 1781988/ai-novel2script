Page({
  data: {
    flow: [
      { name: "创建项目", desc: "记录小说标题、作者、题材和目标短剧时长。" },
      { name: "导入小说", desc: "后续 PR 将支持粘贴文本和上传 TXT、Markdown、DOCX。" },
      { name: "生成剧本", desc: "由云函数驱动 AI 生成 YAML 剧本并进行 Schema 校验。" }
    ]
  },

  goCreate() {
    wx.navigateTo({ url: "/pages/project-create/project-create" });
  },

  goSettings() {
    wx.navigateTo({ url: "/pages/settings/settings" });
  },

  useSample() {
    wx.showToast({
      title: "示例已准备",
      icon: "success"
    });
  },

  showComingSoon() {
    wx.showToast({
      title: "后续 PR 开放",
      icon: "none"
    });
  }
});
