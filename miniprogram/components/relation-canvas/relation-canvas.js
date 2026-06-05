Component({
  properties: {
    relations: {
      type: Array,
      value: []
    },
    characters: {
      type: Array,
      value: []
    }
  },

  observers: {
    "relations, characters": function draw() {
      this.drawGraph();
    }
  },

  lifetimes: {
    ready() {
      this.drawGraph();
    }
  },

  methods: {
    drawGraph() {
      const ctx = wx.createCanvasContext("relationCanvas", this);
      const names = this.data.characters.map((item) => item.name);
      this.data.relations.forEach((rel) => {
        if (!names.includes(rel.source)) names.push(rel.source);
        if (!names.includes(rel.target)) names.push(rel.target);
      });
      const nodes = names.map((name, index) => ({
        name,
        x: 80 + (index % 2) * 210,
        y: 80 + Math.floor(index / 2) * 120
      }));
      ctx.clearRect(0, 0, 360, 320);
      this.data.relations.forEach((rel) => {
        const source = nodes.find((node) => node.name === rel.source);
        const target = nodes.find((node) => node.name === rel.target);
        if (!source || !target) return;
        ctx.setStrokeStyle("#8aa0b8");
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setFillStyle("#415166");
        ctx.fillText(rel.relationType || rel.relation_type || "关系", (source.x + target.x) / 2, (source.y + target.y) / 2);
      });
      nodes.forEach((node) => {
        ctx.setFillStyle("#1f6feb");
        ctx.beginPath();
        ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.setFillStyle("#172331");
        ctx.fillText(node.name, node.x - 24, node.y + 48);
      });
      ctx.draw();
    },

    onTap() {
      this.triggerEvent("select", { relation: this.data.relations[0] || null });
    }
  }
});
