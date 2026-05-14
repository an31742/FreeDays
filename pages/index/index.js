// index.js
const apiService = require('../../utils/api.js');

Page({
  data: {
    festivals: [],
    countdowns: [],
    userId: '', // 用户ID
    loading: true,
    error: null
  },

  onLoad() {
    this.getUserId();
    this.fetchFestivals();

    // 每分钟更新一次倒计时
    this.timer = setInterval(() => {
      if (this.data.festivals.length > 0) {
        this.calculateCountdowns();
      }
    }, 60000);
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },

  async fetchFestivals() {
    this.setData({ loading: true, error: null });
    try {
      // 尝试从 API 获取
      const res = await apiService.get('/festivals');
      if (res.code === 200 && res.data && res.data.length > 0) {
        this.setData({
          festivals: res.data,
          loading: false
        });
        this.calculateCountdowns();
      } else {
        throw new Error('No data');
      }
    } catch (error) {
      console.error('Failed to fetch festivals:', error);
      // 如果 API 失败，使用备用数据（硬编码的）
      const fallbackFestivals = [
        { name: '春节', date: '2026-02-15', description: '中国农历新年', color: '#FF6666' },
        { name: '清明节', date: '2026-04-04', description: '缅怀先人，春季踏青好时节', color: '#66CC66' },
        { name: '劳动节', date: '2026-05-01', description: '国际劳动节，享受假期', color: '#FFCC33' },
        { name: '端午节', date: '2026-06-19', description: '赛龙舟、吃粽子',  color: '#3399FF' },
        { name: '中秋节', date: '2026-09-25', description: '团圆节，赏月吃月饼', color: '#9966CC' },
        { name: '国庆节', date: '2026-10-01', description: '纪念国家本身', color: '#FF0000' },
      ];
      this.setData({
        festivals: fallbackFestivals,
        loading: false,
        error: '使用离线数据'
      });
      this.calculateCountdowns();
    }
  },

  onPullDownRefresh() {
    this.fetchFestivals().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  getUserId() {
    let userId = wx.getStorageSync('userId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      wx.setStorageSync('userId', userId);
    }
    this.setData({ userId });
  },

  calculateCountdowns() {
    const today = new Date();
    const countdowns = this.data.festivals.map(festival => {
      const festivalDate = new Date(festival.date);
      const diffTime = festivalDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 如果是今天，则显示"今天"
      let daysLeftDisplay = diffDays;
      if (diffDays === 0) {
        daysLeftDisplay = '今天';
      } else if (diffDays < 0) {
        daysLeftDisplay = '已过期';
      }

      return {
        ...festival,
        daysLeft: diffDays,
        daysLeftDisplay: daysLeftDisplay
      };
    });

    this.setData({ countdowns });
  },

  // 监听用户点击右上角分享
  onShareAppMessage() {
    return {
      title: '假期个人生活',      // 自定义分享标题
      path: '/pages/index/index', // 分享路径（通常是当前页路径）
      imageUrl: '/pages/image/basicprofile.jpeg' // 可选：分享图片（建议尺寸 5:4）
    }
  },
  // 如果需要分享到朋友圈（基础库 2.11.3+）
  onShareTimeline() {
    return {
      title: '假期个人生活',
      query: 'key=value' // 可选：自定义参数
    }
  }
});