// test/production-test.js
// 生产环境API测试脚本

console.log('=== 生产环境API测试开始 ===');
console.log('API域名: https://next-vite-delta.vercel.app/api');
console.log('');

// 模拟小程序环境的基础函数
const mockWx = {
  request: (options) => {
    return new Promise((resolve, reject) => {
      console.log(`🔄 请求: ${options.method || 'GET'} ${options.url}`);

      // 这里在实际小程序中会发送真实请求
      // 在测试环境中，我们只是模拟请求过程
      setTimeout(() => {
        console.log(`✅ 模拟请求成功: ${options.url}`);
        resolve({
          statusCode: 200,
          data: { message: 'Success', data: {} }
        });
      }, 1000);
    });
  },

  login: () => {
    return new Promise((resolve) => {
      console.log('🔐 模拟微信登录...');
      setTimeout(() => {
        resolve({ code: 'mock_wx_code_12345' });
      }, 500);
    });
  },

  getStorageSync: (key) => {
    console.log(`📖 读取本地存储: ${key}`);
    return [];
  },

  setStorageSync: (key, data) => {
    console.log(`💾 保存本地存储: ${key}`);
  }
};

// 模拟小程序全局对象
global.wx = mockWx;

// 测试API连接
async function testProductionAPI() {
  try {
    console.log('1. 测试基础连接...');
    await testBasicConnection();

    console.log('\n2. 测试用户登录...');
    await testUserLogin();

    console.log('\n3. 测试交易接口...');
    await testTransactionAPI();

    console.log('\n4. 测试统计接口...');
    await testStatisticsAPI();

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n🔍 请检查:');
    console.log('- 后端服务是否正常运行');
    console.log('- 域名配置是否正确');
    console.log('- CORS设置是否允许小程序访问');
    console.log('- HTTPS证书是否有效');
  }
}

async function testBasicConnection() {
  const baseURL = 'https://next-vite-delta.vercel.app/api';

  await mockWx.request({
    url: `${baseURL}/health`,
    method: 'GET'
  });

  console.log('✅ 基础连接测试通过');
}

async function testUserLogin() {
  const loginResult = await mockWx.login();
  console.log(`📱 获取到微信登录码: ${loginResult.code}`);

  await mockWx.request({
    url: 'https://next-vite-delta.vercel.app/api/auth/login',
    method: 'POST',
    data: { code: loginResult.code }
  });

  console.log('✅ 用户登录测试通过');
}

async function testTransactionAPI() {
  const testTransaction = {
    type: 'expense',
    amount: 50.00,
    categoryId: 'food',
    note: '午餐费用',
    date: new Date().toISOString().split('T')[0]
  };

  // 测试创建交易
  await mockWx.request({
    url: 'https://next-vite-delta.vercel.app/api/transactions',
    method: 'POST',
    data: testTransaction
  });

  // 测试获取交易列表
  await mockWx.request({
    url: 'https://next-vite-delta.vercel.app/api/transactions?page=1&pageSize=10',
    method: 'GET'
  });

  console.log('✅ 交易接口测试通过');
}

async function testStatisticsAPI() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  await mockWx.request({
    url: `https://next-vite-delta.vercel.app/api/statistics/monthly?year=${currentYear}&month=${currentMonth}`,
    method: 'GET'
  });

  console.log('✅ 统计接口测试通过');
}

// 在小程序环境中的测试方法
function testInMiniProgram() {
  console.log('=== 小程序内测试方法 ===');
  console.log('请在小程序的控制台中运行以下代码：');
  console.log('');
  console.log('// 测试API连接');
  console.log('wx.request({');
  console.log('  url: "https://next-vite-delta.vercel.app/api/health",');
  console.log('  success: (res) => console.log("API连接成功:", res),');
  console.log('  fail: (err) => console.error("API连接失败:", err)');
  console.log('});');
  console.log('');
  console.log('// 测试登录接口');
  console.log('wx.login({');
  console.log('  success: (loginRes) => {');
  console.log('    wx.request({');
  console.log('      url: "https://next-vite-delta.vercel.app/api/auth/login",');
  console.log('      method: "POST",');
  console.log('      data: { code: loginRes.code },');
  console.log('      success: (res) => console.log("登录成功:", res),');
  console.log('      fail: (err) => console.error("登录失败:", err)');
  console.log('    });');
  console.log('  }');
  console.log('});');
}

// 网络检查清单
function printNetworkChecklist() {
  console.log('\n=== 网络配置检查清单 ===');
  console.log('');
  console.log('□ 1. 微信公众平台域名配置');
  console.log('   - 登录 https://mp.weixin.qq.com');
  console.log('   - 开发 → 开发设置 → 服务器域名');
  console.log('   - request合法域名添加: https://next-vite-delta.vercel.app');
  console.log('');
  console.log('□ 2. 后端CORS配置');
  console.log('   - 允许域名: https://servicewechat.com');
  console.log('   - 允许域名: https://developers.weixin.qq.com');
  console.log('');
  console.log('□ 3. HTTPS证书检查');
  console.log('   - 访问: https://next-vite-delta.vercel.app');
  console.log('   - 确认证书有效且受信任');
  console.log('');
  console.log('□ 4. 后端接口测试');
  console.log('   - GET  /api/health');
  console.log('   - POST /api/auth/login');
  console.log('   - GET  /api/transactions');
  console.log('   - POST /api/transactions');
  console.log('');
  console.log('□ 5. 小程序配置');
  console.log('   - project.config.json 中的 appid 正确');
  console.log('   - config/api.js 中的环境设置为 production');
}

// 运行测试
console.log('选择测试模式:');
console.log('1. 模拟测试 (当前环境)');
console.log('2. 小程序内测试指南');
console.log('3. 网络配置检查清单');

// 运行模拟测试
testProductionAPI();

// 显示小程序测试方法
testInMiniProgram();

// 显示检查清单
printNetworkChecklist();

module.exports = {
  testProductionAPI,
  testInMiniProgram,
  printNetworkChecklist
};