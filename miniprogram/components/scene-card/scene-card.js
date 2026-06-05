Component({
  properties: {
    scene: {
      type: Object,
      value: {}
    }
  },

  observers: {
    scene(scene) {
      this.setData({
        charactersText: Array.isArray(scene.characters) ? scene.characters.join("、") : ""
      });
    }
  },

  data: {
    charactersText: ""
  },

  methods: {
    edit() {
      this.triggerEvent("edit", { scene: this.data.scene });
    }
  }
});
