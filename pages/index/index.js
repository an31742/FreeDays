// index.js
Page({
  data: {
    festivals: [
      { name: '春节', date: '2025-01-29', description: '中国农历新年', image: 'https://img1.baidu.com/it/u=381463868,2944515135&fm=253&fmt=auto&app=120&f=JPEG?w=1280&h=800', color: '#FF6666' },
      { name: '清明节', date: '2025-04-05', description: '缅怀先人，春季踏青好时节', image: 'https://img1.baidu.com/it/u=340781851,1377282715&fm=253&fmt=auto&app=120&f=JPEG?w=750&h=500', color: '#66CC66' },
      { name: '劳动节', date: '2025-05-01', description: '国际劳动节，享受假期', image: 'https://img0.baidu.com/it/u=1100066089,3708114890&fm=253&fmt=auto&app=138&f=JPEG?w=845&h=475', color: '#FFCC33' },
      { name: '端午节', date: '2025-06-01', description: '赛龙舟、吃粽子', image: 'https://img2.baidu.com/it/u=3698634301,12757380&fm=253&fmt=auto&app=138&f=JPEG?w=486&h=486', color: '#3399FF' },
      { name: '中秋节', date: '2025-10-06', description: '团圆节，赏月吃月饼', image: '../image/zhongqiu.webp', color: '#9966CC' },
    ],
    countdowns: []
  },

  onLoad() {
    this.calculateCountdowns();
  },

  calculateCountdowns() {
    const today = new Date(); // 当前日期
    const countdowns = this.data.festivals.map(festival => {
      const festivalDate = new Date(festival.date); // 节日日期
      const diffTime = festivalDate - today; // 日期差值
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 转换为天数
      return { ...festival, daysLeft: diffDays }; // 添加倒计时
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