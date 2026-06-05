Page({
  data: {
    characters: [],
    relations: []
  },

  onLoad() {
    const result = wx.getStorageSync("latestScriptResult") || {};
    const screenplay = result.screenplay || {};
    this.setData({
      characters: screenplay.characters || [],
      relations: screenplay.relations || []
    });
  },

  onSelect(event) {
    const relation = event.detail.relation;
    if (!relation) return;
    wx.showModal({
      title: `${relation.source} - ${relation.target}`,
      content: relation.evidence || relation.description || "暂无证据",
      showCancel: false
    });
  }
});
