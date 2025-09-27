// 域名配置验证测试脚本
// 在域名配置完成后运行此脚本验证

console.log('🔍 ===== 域名配置验证测试 =====');
console.log('目标域名: https://next-vite-delta.vercel.app');
console.log('AppID: wx37031fe607647fa3');
console.log('');

// 测试步骤
let testStep = 1;

function runTest() {
  console.log(`📋 测试步骤 ${testStep}: 基础域名连通性`);

  wx.request({
    url: 'https://next-vite-delta.vercel.app/api/health',
    method: 'GET',
    timeout: 10000,
    success: (res) => {
      console.log('✅ 步骤1通过 - 域名配置正确!');
      console.log('响应状态:', res.statusCode);
      console.log('响应内容:', res.data);

      testStep = 2;
      testLogin();
    },
    fail: (err) => {
      console.error('❌ 步骤1失败 - 域名配置问题');
      console.error('错误信息:', err);

      if (err.errMsg && err.errMsg.includes('url not in domain list')) {
        console.log('');
        console.log('🔧 解决方案:');
        console.log('1. 确认已在微信公众平台配置域名');
        console.log('2. 域名格式: https://next-vite-delta.vercel.app');
        console.log('3. 确认使用了正确的微信账号 (AppID: wx37031fe607647fa3)');
        console.log('4. 重启微信开发者工具后重试');
        console.log('');
        console.log('📖 配置文档: https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html');
      } else {
        console.log('');
        console.log('🔧 其他可能原因:');
        console.log('- 后端服务未启动');
        console.log('- 网络连接问题');
        console.log('- HTTPS证书问题');
      }

      console.log('');
      console.log('❌ 测试终止 - 请解决域名配置问题后重新运行');
    }
  });
}

function testLogin() {
  console.log(`\n📋 测试步骤 ${testStep}: 登录功能验证`);

  wx.login({
    success: (loginRes) => {
      console.log('📱 微信登录码获取成功:', loginRes.code);

      wx.request({
        url: 'https://next-vite-delta.vercel.app/api/auth/login',
        method: 'POST',
        data: { code: loginRes.code },
        header: {
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        success: (res) => {
          console.log('✅ 步骤2通过 - 登录功能正常!');
          console.log('Token获取成功:', res.data?.access_token?.substring(0, 20) + '...');

          testStep = 3;
          testAPIFeatures(res.data?.access_token);
        },
        fail: (err) => {
          console.error('❌ 步骤2失败 - 登录功能异常');
          console.error('错误信息:', err);

          console.log('');
          console.log('🔧 可能原因:');
          console.log('- 后端环境变量配置错误');
          console.log('- AppID/AppSecret不匹配');
          console.log('- 后端登录接口实现问题');

          generateSummaryReport(false);
        }
      });
    },
    fail: (err) => {
      console.error('❌ 微信登录失败:', err);
      generateSummaryReport(false);
    }
  });
}

function testAPIFeatures(token) {
  console.log(`\n📋 测试步骤 ${testStep}: API功能验证`);

  if (!token) {
    console.log('⚠️ 跳过API测试 - 未获取到有效Token');
    generateSummaryReport(false);
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
      console.log('✅ 步骤3通过 - API功能正常!');
      console.log('数据获取成功:', res.data);

      generateSummaryReport(true);
    },
    fail: (err) => {
      console.error('❌ 步骤3失败 - API功能异常');
      console.error('错误信息:', err);

      // 即使API测试失败，域名配置是成功的
      generateSummaryReport(true, false);
    }
  });
}

function generateSummaryReport(domainSuccess, apiSuccess = true) {
  console.log('\n📊 ===== 验证结果报告 =====');

  if (domainSuccess) {
    console.log('✅ 域名配置: 成功');
    console.log('✅ 网络请求: 正常');
    console.log(`${apiSuccess ? '✅' : '⚠️'} API功能: ${apiSuccess ? '正常' : '部分异常'}`);

    console.log('\n🎉 恭喜！域名配置已生效！');

    if (apiSuccess) {
      console.log('🚀 你现在可以正常使用小程序的所有功能了！');
      console.log('');
      console.log('📱 建议下一步测试:');
      console.log('1. 测试记账功能');
      console.log('2. 测试查询统计');
      console.log('3. 测试真机环境');
    } else {
      console.log('⚠️ 域名配置成功，但API功能需要进一步调试');
      console.log('请检查后端服务配置');
    }
  } else {
    console.log('❌ 域名配置: 失败');
    console.log('❌ 网络请求: 被阻止');

    console.log('\n🔧 请按照上述提示完成域名配置');
  }

  console.log('\n⏰ 测试完成时间:', new Date().toLocaleString());
  console.log('=====================================');
}

// 提供手动重试功能
window.domainVerification = {
  runTest: runTest,
  testLogin: testLogin,
  generateReport: generateSummaryReport
};

console.log('💡 使用说明:');
console.log('- 域名配置完成后运行: domainVerification.runTest()');
console.log('- 手动重试登录: domainVerification.testLogin()');
console.log('');
console.log('🎬 开始自动验证...');

// 自动开始测试
runTest();