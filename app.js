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
        // 设置在线状态
        this.setOnlineStatus(true);
        console.log('设置为在线模式');

        // 可以在这里同步本地数据到服务器
        this.syncLocalDataToServer();

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
    try {
      const { syncAPI } = require('./api/transaction.js');
      const result = await syncAPI.syncLocalData();

      if (result && (result.success.length > 0 || result.failed.length > 0)) {
        console.log('Data sync completed:', result);
        wx.showToast({
          title: `同步完成: 成功${result.success.length}条`,
          icon: 'success',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Sync local data error:', error);
      // 同步失败不影响正常使用
    }
  },

  // 初始化记账本数据
  initAccountingData() {
    const transactions = wx.getStorageSync('transactions');
    if (!transactions || transactions.length === 0) {
      // 创建一些示例数据
      const sampleData = [
        {
          id: Date.now() + '_1',
          type: 'expense',
          amount: 25.50,
          categoryId: 'food',
          note: '早餐',
          date: new Date().toISOString().split('T')[0],
          createTime: new Date().toISOString()
        },
        {
          id: Date.now() + '_2',
          type: 'income',
          amount: 5000,
          categoryId: 'salary',
          note: '工资',
          date: new Date().toISOString().split('T')[0],
          createTime: new Date().toISOString()
        },
        {
          id: Date.now() + '_3',
          type: 'expense',
          amount: 15.00,
          categoryId: 'transport',
          note: '地铁',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 昨天
          createTime: new Date().toISOString()
        }
      ];
      wx.setStorageSync('transactions', sampleData);
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
