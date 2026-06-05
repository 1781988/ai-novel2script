Page({
  data: {
    flow: [
      { name: "建档", desc: "记录作品信息、改编目标和短剧时长，形成创作工程。" },
      { name: "拆章", desc: "清洗文本，识别章节边界，为后续抽取建立来源索引。" },
      { name: "成幕", desc: "抽取人物与冲突，规划分集和场景，生成可校验 YAML。" }
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
