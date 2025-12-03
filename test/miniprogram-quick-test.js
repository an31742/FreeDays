// test/miniprogram-quick-test.js
// 在小程序开发者工具控制台中直接运行的测试脚本

// 引入测试数据管理器
const { testDataManager } = require('../utils/test-utils.js');

console.log('🚀 开始小程序API快速测试...');
console.log('目标域名: https://next-vite-delta.vercel.app/api');
console.log('');

// 测试结果收集
const testResults = {
  apiConnection: false,
  userLogin: false,
  transactionAPI: false,
  statisticsAPI: false
};

// 1. 测试API基础连接
function testAPIConnection() {
  return new Promise((resolve) => {
    console.log('📡 测试1: API基础连接...');

    wx.request({
      url: 'https://next-vite-delta.vercel.app/api/health',
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        console.log('✅ API连接成功!', res);
        testResults.apiConnection = true;
        resolve(true);
      },
      fail: (err) => {
        console.error('❌ API连接失败:', err);
        console.log('💡 可能的解决方案:');
        console.log('  1. 检查微信公众平台是否已配置域名');
        console.log('  2. 确认后端服务是否正常运行');
        console.log('  3. 检查网络连接状态');
        testResults.apiConnection = false;
        resolve(false);
      }
    });
  });
}

// 2. 测试用户登录
function testUserLogin() {
  return new Promise((resolve) => {
    console.log('🔐 测试2: 用户登录...');

    wx.login({
      success: (loginRes) => {
        console.log('📱 微信登录码获取成功:', loginRes.code);

        wx.request({
          url: 'https://next-vite-delta.vercel.app/api/auth/login',
          method: 'POST',
          data: { code: loginRes.code },
          timeout: 5000,
          success: (res) => {
            console.log('✅ 用户登录成功!', res);
            if (res.data && res.data.access_token) {
              console.log('🎫 获取到Token:', res.data.access_token.substring(0, 20) + '...');
              // 保存token到本地
              wx.setStorageSync('access_token', res.data.access_token);
              testResults.userLogin = true;
            }
            resolve(true);
          },
          fail: (err) => {
            console.error('❌ 用户登录失败:', err);
            console.log('💡 可能的解决方案:');
            console.log('  1. 检查后端AppID和AppSecret配置');
            console.log('  2. 确认登录接口实现正确');
            testResults.userLogin = false;
            resolve(false);
          }
        });
      },
      fail: (err) => {
        console.error('❌ 微信登录失败:', err);
        testResults.userLogin = false;
        resolve(false);
      }
    });
  });
}

// 3. 测试交易接口
function testTransactionAPI() {
  return new Promise((resolve) => {
    console.log('💰 测试3: 交易接口...');

    const token = wx.getStorageSync('access_token');
    if (!token) {
      console.log('⚠️ 跳过交易接口测试 (需要先登录)');
      resolve(false);
      return;
    }

    // 测试创建交易
    const testTransaction = {
      type: 'expense',
      amount: 10.50,
      categoryId: 'food',
      note: '测试交易记录',
      date: new Date().toISOString().split('T')[0]
    };

    console.log('创建测试交易记录...');

    testDataManager.createTestTransaction(
      'https://next-vite-delta.vercel.app',
      token,
      testTransaction
    )
    .then((createdData) => {
      console.log('✅ 交易创建成功!', createdData);
      testResults.transactionAPI = true;

      // 测试获取交易列表
      wx.request({
        url: 'https://next-vite-delta.vercel.app/api/transactions?page=1&pageSize=5',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (listRes) => {
          console.log('✅ 交易列表获取成功!', listRes);

          // 清理测试数据
          testDataManager.cleanupAllTestData('https://next-vite-delta.vercel.app', token)
            .then(() => {
              console.log('✅ 测试数据清理完成');
              resolve(true);
            })
            .catch((error) => {
              console.error('❌ 测试数据清理过程中出现错误:', error);
              resolve(true); // 即使清理失败也认为测试成功
            });
        },
        fail: (listErr) => {
          console.log('⚠️ 交易列表获取失败:', listErr);

          // 清理测试数据
          testDataManager.cleanupAllTestData('https://next-vite-delta.vercel.app', token)
            .then(() => {
              console.log('✅ 测试数据清理完成');
              resolve(true);
            })
            .catch((error) => {
              console.error('❌ 测试数据清理过程中出现错误:', error);
              resolve(true); // 即使清理失败也认为测试成功
            });
        }
      });
    })
    .catch((err) => {
      console.error('❌ 交易接口测试失败:', err);
      console.log('💡 可能的解决方案:');
      console.log('  1. 检查Token是否有效');
      console.log('  2. 确认交易接口实现正确');
      console.log('  3. 检查数据格式是否符合要求');
      testResults.transactionAPI = false;
      resolve(false);
    });
  });
}

// 4. 测试统计接口
function testStatisticsAPI() {
  return new Promise((resolve) => {
    console.log('📊 测试4: 统计接口...');

    const token = wx.getStorageSync('access_token');
    if (!token) {
      console.log('⚠️ 跳过统计接口测试 (需要先登录)');
      resolve(false);
      return;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    wx.request({
      url: `https://next-vite-delta.vercel.app/api/statistics/monthly?year=${currentYear}&month=${currentMonth}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 5000,
      success: (res) => {
        console.log('✅ 统计接口成功!', res);
        testResults.statisticsAPI = true;
        resolve(true);
      },
      fail: (err) => {
        console.error('❌ 统计接口测试失败:', err);
        testResults.statisticsAPI = false;
        resolve(false);
      }
    });
  });
}

// 5. 生成测试报告
function generateTestReport() {
  console.log('\n📋 ===== 测试报告 =====');
  console.log(`API基础连接: ${testResults.apiConnection ? '✅ 通过' : '❌ 失败'}`);
  console.log(`用户登录: ${testResults.userLogin ? '✅ 通过' : '❌ 失败'}`);
  console.log(`交易接口: ${testResults.transactionAPI ? '✅ 通过' : '❌ 失败'}`);
  console.log(`统计接口: ${testResults.statisticsAPI ? '✅ 通过' : '❌ 失败'}`);

  const passedTests = Object.values(testResults).filter(result => result).length;
  const totalTests = Object.keys(testResults).length;

  console.log(`\n总体结果: ${passedTests}/${totalTests} 项测试通过`);

  if (passedTests === totalTests) {
    console.log('🎉 恭喜! 所有测试都通过了，API对接成功!');
  } else if (passedTests >= 2) {
    console.log('⚠️ 部分功能正常，请根据上述错误信息进行调试');
  } else {
    console.log('❌ 大部分功能异常，请检查基础配置');
  }

  console.log('\n📞 如需技术支持，请提供完整的控制台日志');
}

// 执行完整测试流程
async function runFullTest() {
  try {
    await testAPIConnection();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒

    await testUserLogin();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒

    await testTransactionAPI();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒

    await testStatisticsAPI();

    generateTestReport();

  } catch (error) {
    console.error('测试过程中出现异常:', error);
  }
}

// 导出测试函数，可以单独调用
window.miniProgramAPITest = {
  runFullTest,
  testAPIConnection,
  testUserLogin,
  testTransactionAPI,
  testStatisticsAPI,
  generateTestReport
};

// 自动开始测试
console.log('🎬 自动开始完整测试...');
runFullTest();

console.log('\n💡 使用说明:');
console.log('- 可以调用 miniProgramAPITest.runFullTest() 重新运行完整测试');
console.log('- 可以调用 miniProgramAPITest.testAPIConnection() 单独测试API连接');
console.log('- 可以调用 miniProgramAPITest.testUserLogin() 单独测试登录');
console.log('- 其他单项测试方法类似...');