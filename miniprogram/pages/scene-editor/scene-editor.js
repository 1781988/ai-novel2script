const beatTypes = ["action", "dialogue", "narration", "transition"];

Page({
  data: {
    scene: { beats: [] },
    charactersText: "",
    beatTypes
  },

  onLoad() {
    const scene = wx.getStorageSync("editingScene") || { beats: [] };
    this.setData({
      scene,
      charactersText: Array.isArray(scene.characters) ? scene.characters.join("、") : ""
    });
  },

  onFieldInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`scene.${field}`]: event.detail.value });
  },

  onCharactersInput(event) {
    const charactersText = event.detail.value;
    this.setData({
      charactersText,
      "scene.characters": charactersText.split(/[、,，]/).map((item) => item.trim()).filter(Boolean)
    });
  },

  onBeatTypeChange(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({ [`scene.beats[${index}].type`]: beatTypes[Number(event.detail.value)] });
  },

  onBeatContentInput(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({ [`scene.beats[${index}].content`]: event.detail.value });
  },

  addBeat() {
    const beats = this.data.scene.beats.concat([{ type: "action", content: "新增动作。" }]);
    this.setData({ "scene.beats": beats });
  },

  deleteBeat(event) {
    const index = Number(event.currentTarget.dataset.index);
    const beats = this.data.scene.beats.filter((_, itemIndex) => itemIndex !== index);
    this.setData({ "scene.beats": beats });
  },

  moveBeatUp(event) {
    this.moveBeat(Number(event.currentTarget.dataset.index), -1);
  },

  moveBeatDown(event) {
    this.moveBeat(Number(event.currentTarget.dataset.index), 1);
  },

  moveBeat(index, direction) {
    const beats = this.data.scene.beats.slice();
    const target = index + direction;
    if (target < 0 || target >= beats.length) return;
    [beats[index], beats[target]] = [beats[target], beats[index]];
    this.setData({ "scene.beats": beats });
  },

  async polishBeat(event) {
    const index = Number(event.currentTarget.dataset.index);
    const beat = this.data.scene.beats[index];
    if (!beat || beat.type !== "dialogue") {
      wx.showToast({ title: "只润色 dialogue", icon: "none" });
      return;
    }
    const response = await wx.cloud.callFunction({
      name: "polishDialogue",
      data: { content: beat.content }
    });
    this.setData({ [`scene.beats[${index}].content`]: response.result.polishedContent || beat.content });
  },

  saveScene() {
    const result = wx.getStorageSync("latestScriptResult") || {};
    const screenplay = result.screenplay || {};
    screenplay.scenes = (screenplay.scenes || []).map((scene) => (
      scene.sceneId === this.data.scene.sceneId ? this.data.scene : scene
    ));
    result.screenplay = screenplay;
    wx.setStorageSync("latestScriptResult", result);
    wx.showToast({ title: "场景已保存", icon: "none" });
  }
});
