const defaultForm = {
  projectName: "",
  novelTitle: "",
  authorName: "",
  genre: "悬疑",
  targetType: "short_drama",
  episodeTargetMinutes: 5
};

Page({
  data: {
    form: { ...defaultForm },
    genres: ["悬疑", "都市", "古装", "奇幻", "现实", "爱情"],
    genreIndex: 0,
    targetLabels: ["短剧"],
    submitting: false
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    const value = field === "episodeTargetMinutes"
      ? Number(event.detail.value)
      : event.detail.value;

    this.setData({
      [`form.${field}`]: value
    });
  },

  onGenreChange(event) {
    const genreIndex = Number(event.detail.value);
    this.setData({
      genreIndex,
      "form.genre": this.data.genres[genreIndex]
    });
  },

  validateForm() {
    const { projectName, novelTitle, episodeTargetMinutes } = this.data.form;
    if (!projectName.trim() || !novelTitle.trim()) {
      wx.showToast({ title: "请填写项目和小说标题", icon: "none" });
      return false;
    }

    if (!episodeTargetMinutes || episodeTargetMinutes < 1) {
      wx.showToast({ title: "请填写有效分钟数", icon: "none" });
      return false;
    }

    return true;
  },

  async submitProject() {
    if (!this.validateForm() || this.data.submitting) return;

    this.setData({ submitting: true });
    try {
      const { result } = await wx.cloud.callFunction({
        name: "initProject",
        data: this.data.form
      });

      if (!result || !result.success) {
        throw new Error(result && result.message ? result.message : "创建失败");
      }

      wx.showModal({
        title: "创建成功",
        content: `项目 ID：${result.projectId}`,
        showCancel: false
      });
    } catch (error) {
      wx.showToast({
        title: error.message || "创建失败",
        icon: "none"
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
