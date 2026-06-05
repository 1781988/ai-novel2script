const progressNames = [
  "正在清洗小说文本",
  "正在识别章节结构",
  "正在抽取人物信息",
  "正在抽取地点信息",
  "正在生成人物关系图",
  "正在规划短剧分集",
  "正在拆分剧本场景",
  "正在生成 YAML 剧本",
  "正在校验 YAML Schema",
  "正在修复 YAML",
  "正在保存剧本版本",
  "生成完成"
];

function initialSteps() {
  return progressNames.map((name) => ({
    name,
    status: "pending",
    statusText: "等待"
  }));
}

Page({
  data: {
    projectId: "",
    steps: initialSteps(),
    generating: false,
    characters: [],
    locations: [],
    episodes: [],
    yamlContent: ""
  },

  onProjectIdInput(event) {
    this.setData({ projectId: event.detail.value });
  },

  setStep(index, status) {
    const statusText = status === "done" ? "完成" : status === "running" ? "进行中" : "等待";
    this.setData({
      [`steps[${index}].status`]: status,
      [`steps[${index}].statusText`]: statusText
    });
  },

  async startGenerate() {
    if (this.data.generating) return;
    this.setData({
      generating: true,
      steps: initialSteps(),
      characters: [],
      locations: [],
      episodes: [],
      yamlContent: ""
    });

    try {
      const reviewData = wx.getStorageSync("chapterReviewData") || {};
      const chapters = reviewData.chapters || [];
      if (chapters.length < 3 && !this.data.projectId.trim()) {
        wx.showToast({ title: "请先导入 3 章以上小说", icon: "none" });
        return;
      }

      for (let index = 0; index < 7; index += 1) {
        this.setStep(index, "running");
        await this.sleep(80);
        this.setStep(index, "done");
      }

      this.setStep(7, "running");
      const response = await wx.cloud.callFunction({
        name: "generateScript",
        data: {
          projectId: this.data.projectId.trim(),
          chapters
        }
      });
      const result = response.result || {};
      if (!result.success) {
        throw new Error(result.reason || "生成失败");
      }
      this.setStep(7, "done");
      this.setStep(8, "done");
      this.setStep(9, "done");
      this.setStep(10, "done");
      this.setStep(11, "done");

      this.setData({
        characters: result.info ? result.info.characters || [] : [],
        locations: result.info ? result.info.locations || [] : [],
        episodes: result.episodes || [],
        yamlContent: result.yamlContent || ""
      });
      wx.setStorageSync("latestScriptResult", result);
    } catch (error) {
      wx.showToast({ title: error.message || "生成失败", icon: "none" });
    } finally {
      this.setData({ generating: false });
    }
  },

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  goPreview() {
    wx.navigateTo({ url: "/pages/script-preview/script-preview" });
  },

  goYamlEditor() {
    wx.navigateTo({ url: "/pages/yaml-editor/yaml-editor" });
  }
});
