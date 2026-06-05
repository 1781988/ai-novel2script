const providers = [
  { value: "deepseek", label: "DeepSeek", model: "deepseek-v4-flash" },
  { value: "gemini", label: "Gemini", model: "gemini-2.5-flash" },
  { value: "openai", label: "OpenAI", model: "gpt-4.1-mini" }
];

Page({
  data: {
    providers,
    providerLabels: providers.map((provider) => provider.label),
    providerIndex: 0,
    currentProvider: providers[0],
    checking: false,
    testing: false,
    resultText: ""
  },

  onLoad() {
    const savedProvider = wx.getStorageSync("modelProvider");
    const providerIndex = Math.max(0, providers.findIndex((item) => item.value === savedProvider));
    this.setProvider(providerIndex);
  },

  onProviderChange(event) {
    this.setProvider(Number(event.detail.value));
  },

  setProvider(providerIndex) {
    const currentProvider = providers[providerIndex] || providers[0];
    wx.setStorageSync("modelProvider", currentProvider.value);
    this.setData({
      providerIndex,
      currentProvider,
      resultText: ""
    });
  },

  checkConfig() {
    this.setData({ checking: true });
    wx.showToast({ title: "请在云函数环境变量配置 Key", icon: "none" });
    this.setData({
      checking: false,
      resultText: `${this.data.currentProvider.label} 将通过云函数环境变量读取配置。`
    });
  },

  testConnection() {
    this.setData({ testing: true });
    setTimeout(() => {
      this.setData({
        testing: false,
        resultText: "PR1 已建立设置入口，真实模型测试将在 AI 服务云函数阶段接入。"
      });
    }, 300);
  }
});
