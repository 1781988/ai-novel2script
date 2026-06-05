const { parseChapters } = require("../../utils/chapter-parser");

const sampleText = `第一章 雨夜来信

林澈在深夜收到一封没有署名的信。信纸被雨水打湿，只剩一句话清晰可见：三年前的失踪不是意外。

第二章 老宅门口

林澈按照信上的地址来到顾家老宅。顾眠站在门廊下，像是早就知道他会来，却拒绝解释匿名信的来源。

第三章 地下室的声音

两人在争执中听见地下室传来敲击声。林澈推开锈住的铁门，发现父亲旧相机里的胶卷仍然完好。`;

Page({
  data: {
    projectId: "",
    rawText: "",
    parseResult: null,
    parsing: false
  },

  onLoad(options) {
    if (options.projectId) {
      this.setData({ projectId: options.projectId });
    }
    if (options.sample) {
      this.loadSample();
    }
  },

  onProjectIdInput(event) {
    this.setData({ projectId: event.detail.value });
  },

  onTextInput(event) {
    this.setData({
      rawText: event.detail.value,
      parseResult: null
    });
  },

  loadSample() {
    this.setData({
      rawText: sampleText,
      parseResult: null
    });
  },

  async parseText() {
    if (!this.data.rawText.trim()) {
      wx.showToast({ title: "请先输入小说文本", icon: "none" });
      return;
    }

    this.setData({ parsing: true });
    try {
      let result;
      if (wx.cloud && this.data.projectId.trim()) {
        const response = await wx.cloud.callFunction({
          name: "parseNovel",
          data: {
            projectId: this.data.projectId.trim(),
            rawText: this.data.rawText
          }
        });
        result = response.result;
      } else {
        result = parseChapters(this.data.rawText);
      }
      this.handleParseResult(result);
    } catch (error) {
      wx.showToast({ title: error.message || "解析失败", icon: "none" });
    } finally {
      this.setData({ parsing: false });
    }
  },

  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["txt", "md", "markdown", "docx"],
      success: async (res) => {
        const file = res.tempFiles[0];
        if (!file) return;
        await this.uploadAndParse(file);
      }
    });
  },

  async uploadAndParse(file) {
    this.setData({ parsing: true });
    try {
      if (!wx.cloud) {
        throw new Error("请在微信开发者工具云开发环境中上传文件");
      }

      const cloudPath = `novels/${Date.now()}-${file.name}`;
      const upload = await wx.cloud.uploadFile({
        cloudPath,
        filePath: file.path
      });
      const response = await wx.cloud.callFunction({
        name: "uploadNovelFile",
        data: {
          projectId: this.data.projectId.trim(),
          fileID: upload.fileID,
          fileName: file.name
        }
      });
      this.handleParseResult(response.result);
    } catch (error) {
      wx.showToast({ title: error.message || "上传失败", icon: "none" });
    } finally {
      this.setData({ parsing: false });
    }
  },

  handleParseResult(result) {
    const parseResult = result || { success: false, valid: false, reason: "解析失败", chapterCount: 0, chapters: [] };
    const normalized = {
      ...parseResult,
      valid: Boolean(parseResult.valid || parseResult.success)
    };
    this.setData({ parseResult: normalized });
    wx.setStorageSync("chapterReviewData", normalized);

    if (normalized.valid) {
      wx.navigateTo({ url: "/pages/chapter-review/chapter-review" });
    } else {
      wx.showToast({ title: normalized.reason || "章节数量不足", icon: "none" });
    }
  }
});
