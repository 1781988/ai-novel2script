Component({
  properties: {
    value: {
      type: String,
      value: ""
    },
    readonly: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onInput(event) {
      this.triggerEvent("change", { value: event.detail.value });
    }
  }
});
