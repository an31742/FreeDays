// config/api.js
const config = {
  // 开发环境配置
  development: {
    baseURL: 'http://localhost:3000/api',  // 本地开发环境
    timeout: 10000,
    debug: true
  },

  // 测试环境配置
  test: {
    baseURL: 'https://next-vite-delta.vercel.app/api',  // 测试环境API域名
    timeout: 15000,  // 测试环境可能需要更长超时时间
    debug: true      // 测试环境开启调试
  },

  // 生产环境配置
  production: {
    baseURL: 'https://next-vite-delta.vercel.app/api',  // 你的生产环境API域名
    timeout: 10000,
    debug: false
  }
};

// 获取当前环境配置
const env = 'production'; // 切换到生产环境使用线上接口
const apiConfig = config[env];

module.exports = {
  ...apiConfig,

  // API端点配置
  endpoints: {
    // 用户认证
    login: '/auth/login',
    refresh: '/auth/refresh',

    // 交易记录
    transactions: '/transactions',
    transaction: (id) => `/transactions/${id}`,

    // 统计分析
    monthlyStats: '/statistics/monthly',
    yearlyStats: '/statistics/yearly',
    rangeStats: '/statistics/range',

    // 分类管理
    categories: '/categories',

    // 数据同步
    syncTransactions: '/sync/transactions',
    syncIncremental: '/sync/incremental'
  }
};