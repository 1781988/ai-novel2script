Component({
  properties: {
    version: {
      type: Object,
      value: {}
    }
  },

  methods: {
    restore() {
      this.triggerEvent("restore", { version: this.data.version });
    }
  }
});
