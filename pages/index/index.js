// index.js
const getApiBase = () => {
  const accountInfo = wx.getAccountInfoSync();
  return accountInfo.miniProgram.envVersion === 'release'
    ? 'https://next-vite-delta.vercel.app/api'
    : 'http://localhost:9527/api';
};

Page({
  data: {
    festivals: [
      { name: '春节', date: '2026-02-15', description: '中国农历新年', image: '/pages/image/spring.jpeg', color: '#FF6666' },
      { name: '清明节', date: '2026-04-04', description: '缅怀先人，春季踏青好时节', image: '/pages/image/qingming.jpeg', color: '#66CC66' },
      { name: '劳动节', date: '2026-05-01', description: '国际劳动节，享受假期', image: '/pages/image/wuyi.jpeg', color: '#FFCC33' },
      { name: '端午节', date: '2026-06-19', description: '赛龙舟、吃粽子', image: '/pages/image/duanwu.jpeg', color: '#3399FF' },
      { name: '中秋节', date: '2026-09-25', description: '团圆节，赏月吃月饼', image: '/pages/image/zhongqiu.jpeg', color: '#9966CC' },
       { name: '国庆节', date: '2026-10-01', description: '纪念国家本身', image: '/pages/image/gq.jpeg', color: '#9966CC' },
    ],
    countdowns: [],
    userId: '' // 用户ID
  },

  onLoad() {
    this.getUserId();
    this.calculateCountdowns();
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
      return { ...festival, daysLeft: diffDays };
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