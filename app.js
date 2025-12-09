// app.js
const apiService = require('./utils/api.js');

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化记账本数据
    this.initAccountingData();

    // 自动登录
    this.autoLogin();
  },

  // 自动登录
  async autoLogin() {
    try {
      wx.showLoading({
        title: '登录中...',
        mask: true
      });

      const success = await apiService.autoLogin();

      if (success) {
        console.log('Auto login successful');
        this.setOnlineStatus(true);
        console.log('设置为在线模式');

        wx.removeStorageSync('transactions');
        console.log('已清空本地交易数据');

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        });
      } else {
        console.log('Auto login failed, using local mode');
        this.setOnlineStatus(false);
        wx.showToast({
          title: '当前为离线模式',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Auto login error:', error);
      this.setOnlineStatus(false);
      wx.showToast({
        title: '登录失败，使用离线模式',
        icon: 'none',
        duration: 2000
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 同步本地数据到服务器
  async syncLocalDataToServer() {
    // 禁用自动同步，避免重复数据
    console.log('自动同步已禁用');
  },

  // 初始化记账本数据
  initAccountingData() {
    // 不再创建示例数据，仅检查是否存在交易记录
    const transactions = wx.getStorageSync('transactions');
    if (!transactions) {
      // 如果没有交易记录，初始化为空数组
      wx.setStorageSync('transactions', []);
    }
  },

  globalData: {
    userInfo: null,
    isOnline: false,  // 是否在线模式
    apiService: null  // API服务实例
  },

  // 获取API服务实例
  getApiService() {
    if (!this.globalData.apiService) {
      this.globalData.apiService = apiService;
    }
    return this.globalData.apiService;
  },

  // 检查是否在线
  isOnlineMode() {
    const hasToken = apiService.checkLoginStatus();
    const isOnlineFlag = this.globalData.isOnline;

    console.log('在线状态检查:', {
      hasToken: hasToken,
      isOnlineFlag: isOnlineFlag,
      finalResult: hasToken && isOnlineFlag
    });

    return hasToken && isOnlineFlag;
  },

  // 设置在线状态
  setOnlineStatus(status) {
    this.globalData.isOnline = status;
  }
})