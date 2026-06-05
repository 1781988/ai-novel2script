App({
  globalData: {
    cloudEnv: "",
    modelProvider: "deepseek"
  },

  onLaunch() {
    if (!wx.cloud) {
      console.warn("CloudBase SDK is unavailable.");
      return;
    }

    wx.cloud.init({
      env: this.globalData.cloudEnv || undefined,
      traceUser: true
    });
  }
});
