Component({
  properties: {
    chapter: {
      type: Object,
      value: {}
    }
  },

  observers: {
    chapter(chapter) {
      const text = chapter && chapter.cleanText ? chapter.cleanText : "";
      this.setData({
        excerpt: text.length > 80 ? `${text.slice(0, 80)}...` : text
      });
    }
  },

  data: {
    excerpt: ""
  },

  methods: {
    onTitleInput(event) {
      this.triggerEvent("titlechange", {
        order: this.data.chapter.order,
        title: event.detail.value
      });
    },

    preview() {
      this.triggerEvent("preview", {
        chapter: this.data.chapter
      });
    }
  }
});
