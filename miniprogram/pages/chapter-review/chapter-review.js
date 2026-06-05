Page({
  data: {
    chapters: [],
    valid: false,
    reason: ""
  },

  onLoad() {
    const reviewData = wx.getStorageSync("chapterReviewData") || {};
    const chapters = reviewData.chapters || [];
    this.setData({
      chapters,
      valid: Boolean(reviewData.valid || reviewData.success) && chapters.length >= 3,
      reason: reviewData.reason || "章节数量不足，至少需要 3 个章节"
    });
  },

  onTitleChange(event) {
    const { order, title } = event.detail;
    const chapters = this.data.chapters.map((chapter) => (
      chapter.order === order ? { ...chapter, title } : chapter
    ));
    this.setData({ chapters });
    wx.setStorageSync("chapterReviewData", {
      valid: chapters.length >= 3,
      chapterCount: chapters.length,
      chapters
    });
  },

  onPreview(event) {
    const { chapter } = event.detail;
    wx.showModal({
      title: chapter.title,
      content: chapter.cleanText || "本章暂无正文",
      showCancel: false
    });
  },

  continueGenerate() {
    if (!this.data.valid) {
      wx.showToast({ title: "至少需要 3 个章节", icon: "none" });
      return;
    }
    wx.navigateTo({ url: "/pages/generate/generate" });
  }
});
