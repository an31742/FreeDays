// test/your-domain-test.js
// 专门针对你的域名和配置的测试脚本
// 在微信开发者工具控制台中运行

console.log('🚀 开始测试你的小程序API配置');
console.log('AppID: wx37031fe607647fa3');
console.log('域名: https://next-vite-delta.vercel.app/api');
console.log('');

// 测试配置验证
function verifyConfiguration() {
  console.log('📋 验证配置信息...');

  // 检查当前小程序AppID
  const accountInfo = wx.getAccountInfoSync();
  const currentAppId = accountInfo.miniProgram.appId;

  console.log(`当前小程序AppID: ${currentAppId}`);
  console.log(`期望的AppID: wx37031fe607647fa3`);

  if (currentAppId === 'wx37031fe607647fa3') {
    console.log('✅ AppID配置正确!');
    return true;
  } else {
    console.log('❌ AppID配置不匹配!');
    console.log('请检查project.config.json中的appid配置');
    return false;
  }
}

// 测试域名连接
function testDomainConnection() {
  return new Promise((resolve) => {
    console.log('🌐 测试域名连接...');

    wx.request({
      url: 'https://next-vite-delta.vercel.app/api/health',
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        console.log('✅ 域名连接成功!');
        console.log('响应状态:', res.statusCode);
        console.log('响应数据:', res.data);
        resolve(true);
      },
      fail: (err) => {
        console.error('❌ 域名连接失败:', err);

        if (err.errMsg.includes('url not in domain list')) {
          console.log('💡 解决方案: 在微信公众平台配置合法域名');
          console.log('   域名: https://next-vite-delta.vercel.app');
        } else if (err.errMsg.includes('fail')) {
          console.log('💡 可能原因: 后端服务未启动或配置错误');
        }

        resolve(false);
      }
    });
  });
}

// 测试微信登录和后端认证
function testWechatLogin() {
  return new Promise((resolve) => {
    console.log('🔐 测试微信登录...');

    wx.login({
      success: (loginRes) => {
        console.log('📱 微信登录成功, code:', loginRes.code);

        // 发送登录请求到后端
        wx.request({
          url: 'https://next-vite-delta.vercel.app/api/auth/login',
          method: 'POST',
          data: {
            code: loginRes.code
          },
          timeout: 10000,
          success: (res) => {
            console.log('✅ 后端登录认证成功!');
            console.log('响应数据:', res.data);

            if (res.data && res.data.access_token) {
              console.log('🎫 Token获取成功:', res.data.access_token.substring(0, 30) + '...');
              wx.setStorageSync('test_token', res.data.access_token);
              resolve(true);
            } else {
              console.log('⚠️ 登录成功但未获取到Token');
              resolve(false);
            }
          },
          fail: (err) => {
            console.error('❌ 后端登录认证失败:', err);
            console.log('💡 请检查后端环境变量配置:');
            console.log('   WECHAT_APP_ID=wx37031fe607647fa3');
            console.log('   WECHAT_APP_SECRET=你的微信小程序AppSecret');
            resolve(false);
          }
        });
      },
      fail: (err) => {
        console.error('❌ 微信登录失败:', err);
        resolve(false);
      }
    });
  });
}

// 测试授权接口
function testAuthorizedAPI() {
  return new Promise((resolve) => {
    console.log('🔒 测试需要授权的接口...');

    const token = wx.getStorageSync('test_token');
    if (!token) {
      console.log('⚠️ 跳过授权接口测试 (未获取到Token)');
      resolve(false);
      return;
    }

    // 测试获取交易列表
    wx.request({
      url: 'https://next-vite-delta.vercel.app/api/transactions?page=1&pageSize=5',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      success: (res) => {
        console.log('✅ 授权接口调用成功!');
        console.log('交易列表数据:', res.data);
        resolve(true);
      },
      fail: (err) => {
        console.error('❌ 授权接口调用失败:', err);
        console.log('💡 可能原因:');
        console.log('   1. Token验证失败');
        console.log('   2. 后端接口实现问题');
        console.log('   3. 数据库连接问题');
        resolve(false);
      }
    });
  });
}

// 生成测试报告
function generateTestReport(results) {
  console.log('\n📊 ===== 测试报告 =====');
  console.log(`配置验证: ${results.config ? '✅ 通过' : '❌ 失败'}`);
  console.log(`域名连接: ${results.domain ? '✅ 通过' : '❌ 失败'}`);
  console.log(`微信登录: ${results.login ? '✅ 通过' : '❌ 失败'}`);
  console.log(`授权接口: ${results.api ? '✅ 通过' : '❌ 失败'}`);

  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n总体结果: ${passedCount}/${totalCount} 项测试通过`);

  if (passedCount === totalCount) {
    console.log('🎉 恭喜! 所有配置都正确，可以正常使用!');
    console.log('📱 现在可以开始使用小程序的完整功能了');
  } else if (passedCount >= 2) {
    console.log('⚠️ 基础功能正常，请根据失败项进行调试');
  } else {
    console.log('❌ 存在配置问题，请检查基础设置');
  }

  console.log('\n📝 下一步建议:');
  if (results.config && results.domain && results.login) {
    console.log('1. 测试记账功能的完整流程');
    console.log('2. 测试查询和统计功能');
    console.log('3. 测试离线模式和数据同步');
    console.log('4. 进行真机测试');
  } else {
    console.log('1. 根据上述错误信息修复配置问题');
    console.log('2. 确认后端服务正常运行');
    console.log('3. 重新运行测试');
  }
}

// 执行完整测试
async function runCompleteTest() {
  const results = {
    config: false,
    domain: false,
    login: false,
    api: false
  };

  try {
    // 1. 验证配置
    results.config = verifyConfiguration();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. 测试域名连接
    results.domain = await testDomainConnection();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. 测试微信登录
    results.login = await testWechatLogin();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. 测试授权接口
    results.api = await testAuthorizedAPI();

    // 5. 生成报告
    generateTestReport(results);

  } catch (error) {
    console.error('测试过程中出现异常:', error);
  }
}

// 导出测试函数
window.yourDomainTest = {
  runCompleteTest,
  verifyConfiguration,
  testDomainConnection,
  testWechatLogin,
  testAuthorizedAPI
};

// 显示使用说明
console.log('💡 使用方法:');
console.log('- 运行完整测试: yourDomainTest.runCompleteTest()');
console.log('- 单独测试配置: yourDomainTest.verifyConfiguration()');
console.log('- 单独测试域名: yourDomainTest.testDomainConnection()');
console.log('- 单独测试登录: yourDomainTest.testWechatLogin()');
console.log('');
console.log('🎬 自动开始完整测试...');
runCompleteTest();