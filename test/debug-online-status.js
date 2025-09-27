// test/debug-online-status.js
// 调试在线状态问题的脚本
// 在微信开发者工具控制台中运行

console.log('🔍 ===== 在线状态调试诊断 =====');
console.log('当前时间:', new Date().toLocaleString());
console.log('');

// 获取应用实例
const app = getApp();

function diagnoseOnlineStatus() {
  console.log('📋 诊断在线状态...');

  // 1. 检查全局状态
  console.log('1. 全局状态检查:');
  console.log('   app.globalData.isOnline:', app.globalData.isOnline);

  // 2. 检查Token状态
  console.log('2. Token状态检查:');
  const token = wx.getStorageSync('access_token');
  console.log('   Token存在:', !!token);
  if (token) {
    console.log('   Token长度:', token.length);
    console.log('   Token前20字符:', token.substring(0, 20) + '...');
  }

  // 3. 检查API服务状态
  console.log('3. API服务状态:');
  const apiService = app.getApiService();
  const loginStatus = apiService.checkLoginStatus();
  console.log('   API服务登录状态:', loginStatus);

  // 4. 检查isOnlineMode方法
  console.log('4. isOnlineMode方法检查:');
  const isOnline = app.isOnlineMode();
  console.log('   app.isOnlineMode()结果:', isOnline);

  // 5. 用户信息检查
  console.log('5. 用户信息检查:');
  const userInfo = wx.getStorageSync('user_info');
  console.log('   用户信息存在:', !!userInfo);
  if (userInfo) {
    console.log('   用户信息:', userInfo);
  }

  console.log('');

  // 综合诊断结果
  if (isOnline) {
    console.log('✅ 诊断结果: 在线模式正常');
  } else {
    console.log('❌ 诊断结果: 在线模式异常');
    console.log('');
    console.log('🔧 可能的问题:');

    if (!app.globalData.isOnline) {
      console.log('- 全局在线状态未设置为true');
    }

    if (!token) {
      console.log('- Token不存在，需要重新登录');
    }

    if (!loginStatus) {
      console.log('- API服务登录状态异常');
    }

    console.log('');
    console.log('💡 修复建议:');
    console.log('1. 手动设置在线状态: fixOnlineStatus()');
    console.log('2. 重新登录: retryLogin()');
    console.log('3. 测试API连接: testApiConnection()');
  }
}

// 修复在线状态
function fixOnlineStatus() {
  console.log('🔧 手动修复在线状态...');

  const token = wx.getStorageSync('access_token');
  if (token) {
    app.setOnlineStatus(true);
    console.log('✅ 已设置为在线模式');

    // 重新检查状态
    const isOnline = app.isOnlineMode();
    console.log('修复后状态:', isOnline);

    if (isOnline) {
      console.log('🎉 在线状态修复成功！现在可以保存到服务器了');
    } else {
      console.log('❌ 修复失败，需要进一步检查');
    }
  } else {
    console.log('❌ 无法修复：Token不存在，需要重新登录');
  }
}

// 重新登录
async function retryLogin() {
  console.log('🔐 尝试重新登录...');

  try {
    wx.showLoading({ title: '登录中...' });

    const apiService = app.getApiService();
    await apiService.login();

    // 设置在线状态
    app.setOnlineStatus(true);

    wx.hideLoading();
    console.log('✅ 重新登录成功');

    // 验证状态
    const isOnline = app.isOnlineMode();
    console.log('登录后在线状态:', isOnline);

    if (isOnline) {
      wx.showToast({
        title: '登录成功，现在可以在线保存',
        icon: 'success'
      });
    }

  } catch (error) {
    wx.hideLoading();
    console.error('❌ 重新登录失败:', error);
    wx.showToast({
      title: '登录失败',
      icon: 'error'
    });
  }
}

// 测试API连接
async function testApiConnection() {
  console.log('🌐 测试API连接...');

  try {
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:3000/api/health',
        method: 'GET',
        timeout: 10000,
        success: resolve,
        fail: reject
      });
    });

    console.log('✅ API连接正常:', response);
    return true;
  } catch (error) {
    console.error('❌ API连接失败:', error);
    return false;
  }
}

// 测试保存功能
async function testSaveFunction() {
  console.log('💾 测试保存功能...');

  // 检查在线状态
  const isOnline = app.isOnlineMode();
  console.log('当前在线状态:', isOnline);

  if (!isOnline) {
    console.log('❌ 当前为离线模式，无法测试在线保存');
    console.log('请先运行 fixOnlineStatus() 或 retryLogin()');
    return;
  }

  // 模拟保存测试数据
  const testData = {
    type: 'expense',
    amount: 99.99,
    categoryId: 'food',
    note: '在线状态测试',
    date: new Date().toISOString().split('T')[0]
  };

  try {
    const token = wx.getStorageSync('access_token');

    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:3000/api/transactions',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: testData,
        timeout: 15000,
        success: resolve,
        fail: reject
      });
    });

    console.log('✅ 在线保存测试成功:', response.data);
    wx.showToast({
      title: '在线保存功能正常',
      icon: 'success'
    });

  } catch (error) {
    console.error('❌ 在线保存测试失败:', error);
    wx.showToast({
      title: '在线保存失败',
      icon: 'error'
    });
  }
}

// 导出调试函数
window.debugOnlineStatus = {
  diagnose: diagnoseOnlineStatus,
  fix: fixOnlineStatus,
  retryLogin: retryLogin,
  testApi: testApiConnection,
  testSave: testSaveFunction
};

console.log('💡 调试命令:');
console.log('- 诊断状态: debugOnlineStatus.diagnose()');
console.log('- 修复状态: debugOnlineStatus.fix()');
console.log('- 重新登录: debugOnlineStatus.retryLogin()');
console.log('- 测试API: debugOnlineStatus.testApi()');
console.log('- 测试保存: debugOnlineStatus.testSave()');
console.log('');

// 自动开始诊断
console.log('🎬 自动开始诊断...');
diagnoseOnlineStatus();