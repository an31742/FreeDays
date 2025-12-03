// test/api-test.js
// 这个文件用于测试API连接状态

const apiService = require('../utils/api.js');
const transactionAPI = require('../api/transaction.js');
// 引入测试数据管理器
const { testDataManager } = require('../utils/test-utils.js');

// 测试API连接
async function testAPIConnection() {
  console.log('=== API连接测试开始 ===');

  try {
    // 测试自动登录
    console.log('1. 测试自动登录...');
    const loginSuccess = await apiService.autoLogin();
    console.log('登录结果:', loginSuccess ? '成功' : '失败');

    if (loginSuccess) {
      // 测试创建交易记录
      console.log('2. 测试创建交易记录...');
      const token = wx.getStorageSync('access_token');
      const testTransaction = {
        type: 'expense',
        amount: 22.22,
        categoryId: 'food',
        note: 'API测试记录',
        date: new Date().toISOString().split('T')[0]
      };

      try {
        const createdData = await testDataManager.createTestTransaction(
          'https://next-vite-delta.vercel.app',
          token,
          testTransaction
        );
        console.log('交易创建成功:', createdData);

        // 测试获取交易列表
        console.log('3. 测试获取交易列表...');
        const transactions = await transactionAPI.getList({ page: 1, pageSize: 5 });
        console.log('交易列表:', transactions);

        // 测试获取统计数据
        console.log('4. 测试获取统计数据...');
        const stats = await transactionAPI.getMonthlyStats(2024, 1);
        console.log('统计数据:', stats);

        // 清理测试数据
        await testDataManager.cleanupAllTestData('https://next-vite-delta.vercel.app', token);
        console.log('✅ 测试数据清理完成');

        console.log('=== API连接测试完成，所有功能正常 ===');
      } catch (createError) {
        console.error('创建交易记录失败:', createError);
        console.log('=== 交易创建失败，请检查后端服务和配置 ===');
      }
    } else {
      console.log('=== 登录失败，请检查后端服务和配置 ===');
    }

  } catch (error) {
    console.error('API测试失败:', error);
    console.log('=== 可能的问题 ===');
    console.log('1. 后端服务未启动');
    console.log('2. API地址配置错误');
    console.log('3. 网络连接问题');
    console.log('4. 微信小程序配置问题');
  }
}

module.exports = {
  testAPIConnection
};

// 如果直接运行此文件
if (require.main === module) {
  testAPIConnection();
}