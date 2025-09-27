// test/nextjs-local-connection.js
// Next.js 本地后端连接测试脚本
// 在微信开发者工具控制台中运行

console.log('🚀 ===== Next.js 本地后端连接测试 =====');
console.log('Next.js 版本: 14.0.4');
console.log('本地地址: http://localhost:3000');
console.log('API地址: http://localhost:3000/api');
console.log('AppID: wx37031fe607647fa3');
console.log('当前时间:', new Date().toLocaleString());
console.log('');

// 测试状态
const testStatus = {
  nextjsServerRunning: false,
  domainConfigured: false,
  apiEndpointsWorking: false,
  authenticationWorking: false,
  dataOperationsWorking: false
};

let testToken = '';

// 步骤1: 检查Next.js服务器状态
function step1_checkNextjsServer() {
  console.log('📋 步骤1: 检查Next.js服务器状态...');

  // 首先测试基础连接
  wx.request({
    url: 'http://localhost:3000',
    method: 'GET',
    timeout: 5000,
    success: (res) => {
      console.log('✅ Next.js服务器运行正常');
      console.log('响应状态:', res.statusCode);
      testStatus.nextjsServerRunning = true;
      step2_checkApiEndpoints();
    },
    fail: (err) => {
      console.error('❌ Next.js服务器连接失败:', err);

      if (err.errMsg && err.errMsg.includes('url not in domain list')) {
        console.log('🔧 域名配置问题，需要在微信开发者工具中:');
        console.log('1. 点击右上角"详情"');
        console.log('2. 切换到"本地设置"');
        console.log('3. 勾选"不校验合法域名..."');
        console.log('4. 重新编译项目');
        testStatus.domainConfigured = false;
      } else {
        console.log('💡 可能原因:');
        console.log('- Next.js服务器未启动');
        console.log('- 端口3000被占用');
        console.log('- 防火墙阻止连接');
        testStatus.nextjsServerRunning = false;
      }

      step2_checkApiEndpoints();
    }
  });
}

// 步骤2: 检查API端点
function step2_checkApiEndpoints() {
  console.log('\n📡 步骤2: 检查API端点...');

  // 测试API健康检查端点
  wx.request({
    url: 'http://localhost:3000/api/health',
    method: 'GET',
    timeout: 10000,
    success: (res) => {
      console.log('✅ API端点正常工作');
      console.log('健康检查响应:', res.data);
      testStatus.domainConfigured = true;
      testStatus.apiEndpointsWorking = true;
      step3_testAuthentication();
    },
    fail: (err) => {
      console.error('❌ API端点测试失败:', err);

      if (err.errMsg && err.errMsg.includes('url not in domain list')) {
        console.log('🔧 域名配置解决方案:');
        console.log('');
        console.log('方法1 - 开发者工具设置（推荐）:');
        console.log('1. 微信开发者工具 → 详情 → 本地设置');
        console.log('2. 勾选"不校验合法域名、web-view(业务域名)、TLS版本以及HTTPS证书"');
        console.log('3. 重新编译项目');
        console.log('');
        console.log('方法2 - 微信公众平台:');
        console.log('1. 登录 https://mp.weixin.qq.com');
        console.log('2. 开发 → 开发设置 → 服务器域名');
        console.log('3. 在request合法域名添加: http://localhost:3000');
        testStatus.domainConfigured = false;
      } else if (err.errMsg && err.errMsg.includes('404')) {
        console.log('💡 API路由可能未实现:');
        console.log('- 检查Next.js中是否有 /api/health 路由');
        console.log('- 确认API文件夹结构正确');
        console.log('- 查看Next.js控制台日志');
        testStatus.domainConfigured = true;
        testStatus.apiEndpointsWorking = false;
      }

      generateTestReport();
    }
  });
}

// 步骤3: 测试用户认证
function step3_testAuthentication() {
  console.log('\n🔐 步骤3: 测试用户认证...');

  console.log('检查Next.js环境变量配置:');
  console.log('确保在 .env 文件中配置了:');
  console.log('WECHAT_APP_ID=wx37031fe607647fa3');
  console.log('WECHAT_APP_SECRET=029874ac1aee76391bc7c7f8bcc7f40a');
  console.log('');

  wx.login({
    success: (loginRes) => {
      console.log('📱 微信登录码获取成功:', loginRes.code);

      wx.request({
        url: 'http://localhost:3000/api/auth/login',
        method: 'POST',
        data: { code: loginRes.code },
        header: {
          'Content-Type': 'application/json'
        },
        timeout: 15000,
        success: (res) => {
          console.log('✅ Next.js认证成功');
          console.log('认证响应:', res.data);

          if (res.data && res.data.access_token) {
            testToken = res.data.access_token;
            console.log('🎫 Token获取成功');
            wx.setStorageSync('nextjs_test_token', testToken);
            testStatus.authenticationWorking = true;
            step4_testDataOperations();
          } else {
            console.log('⚠️ 认证响应格式异常');
            testStatus.authenticationWorking = false;
            generateTestReport();
          }
        },
        fail: (err) => {
          console.error('❌ Next.js认证失败:', err);

          if (err.errMsg && err.errMsg.includes('404')) {
            console.log('💡 认证端点可能未实现:');
            console.log('- 检查是否有 /api/auth/login 路由文件');
            console.log('- 确认Next.js API路由结构');
          } else if (err.errMsg && err.errMsg.includes('500')) {
            console.log('💡 服务器内部错误:');
            console.log('- 检查Next.js控制台错误日志');
            console.log('- 确认环境变量配置正确');
            console.log('- 验证微信小程序配置');
          }

          testStatus.authenticationWorking = false;
          generateTestReport();
        }
      });
    },
    fail: (err) => {
      console.error('❌ 微信登录失败:', err);
      testStatus.authenticationWorking = false;
      generateTestReport();
    }
  });
}

// 步骤4: 测试数据操作
function step4_testDataOperations() {
  console.log('\n💾 步骤4: 测试数据操作...');

  if (!testToken) {
    console.log('⚠️ 跳过数据操作测试 - 未获取到Token');
    generateTestReport();
    return;
  }

  // 测试创建交易记录
  const testTransaction = {
    type: 'expense',
    amount: 77.77,
    categoryId: 'food',
    note: 'Next.js本地测试记录',
    date: new Date().toISOString().split('T')[0]
  };

  console.log('测试创建交易记录...');
  wx.request({
    url: 'http://localhost:3000/api/transactions',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${testToken}`,
      'Content-Type': 'application/json'
    },
    data: testTransaction,
    timeout: 15000,
    success: (res) => {
      console.log('✅ 数据创建成功:', res.data);
      testDataRetrieval();
    },
    fail: (err) => {
      console.error('❌ 数据创建失败:', err);

      if (err.errMsg && err.errMsg.includes('404')) {
        console.log('💡 交易API端点可能未实现');
      } else if (err.errMsg && err.errMsg.includes('401')) {
        console.log('💡 Token验证失败，检查JWT配置');
      } else if (err.errMsg && err.errMsg.includes('500')) {
        console.log('💡 数据库连接或操作失败');
      }

      testStatus.dataOperationsWorking = false;
      generateTestReport();
    }
  });
}

// 测试数据获取
function testDataRetrieval() {
  console.log('测试数据获取...');

  wx.request({
    url: 'http://localhost:3000/api/transactions?page=1&pageSize=5',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${testToken}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000,
    success: (res) => {
      console.log('✅ 数据获取成功:', res.data);
      testStatus.dataOperationsWorking = true;
      generateTestReport();
    },
    fail: (err) => {
      console.error('❌ 数据获取失败:', err);
      testStatus.dataOperationsWorking = false;
      generateTestReport();
    }
  });
}

// 生成测试报告
function generateTestReport() {
  console.log('\n📊 ===== Next.js 本地后端连接测试报告 =====');
  console.log(`Next.js服务器: ${testStatus.nextjsServerRunning ? '✅ 运行正常' : '❌ 连接失败'}`);
  console.log(`域名配置: ${testStatus.domainConfigured ? '✅ 配置正确' : '❌ 需要配置'}`);
  console.log(`API端点: ${testStatus.apiEndpointsWorking ? '✅ 正常工作' : '❌ 端点异常'}`);
  console.log(`用户认证: ${testStatus.authenticationWorking ? '✅ 认证成功' : '❌ 认证失败'}`);
  console.log(`数据操作: ${testStatus.dataOperationsWorking ? '✅ 操作成功' : '❌ 操作失败'}`);

  const passedCount = Object.values(testStatus).filter(Boolean).length;
  const totalCount = Object.keys(testStatus).length;

  console.log(`\n📈 整体通过率: ${passedCount}/${totalCount} (${Math.round(passedCount/totalCount*100)}%)`);

  if (passedCount === totalCount) {
    console.log('🎉 恭喜！Next.js本地后端连接完全正常！');
    console.log('✨ 小程序前端已成功连接到Next.js后端');
    console.log('');
    console.log('🚀 现在你可以:');
    console.log('1. 开始完整的本地开发');
    console.log('2. 实时调试前后端交互');
    console.log('3. 查看Next.js开发控制台日志');
    console.log('4. 测试完整的记账功能流程');
  } else if (passedCount >= 3) {
    console.log('⚠️ 大部分功能正常，个别问题需要解决');

    if (!testStatus.domainConfigured) {
      console.log('');
      console.log('🔧 优先解决域名配置:');
      console.log('开发者工具 → 详情 → 本地设置 → 勾选域名校验');
    }

    if (!testStatus.apiEndpointsWorking) {
      console.log('');
      console.log('🔧 检查Next.js API路由:');
      console.log('确保API文件放在正确的 /api 目录下');
    }
  } else {
    console.log('❌ 连接存在较多问题，需要逐步解决');
    console.log('');
    console.log('📋 解决顺序:');
    console.log('1. 确认Next.js服务器正常启动');
    console.log('2. 配置微信开发者工具域名设置');
    console.log('3. 检查Next.js API路由实现');
    console.log('4. 验证环境变量配置');
    console.log('5. 检查数据库连接');
  }

  console.log('\n💡 Next.js开发提示:');
  console.log('- 查看终端中的Next.js日志');
  console.log('- API路由文件应放在 /pages/api/ 或 /app/api/ 目录');
  console.log('- 环境变量文件: .env.local 或 .env');
  console.log('- 热重载：代码修改后自动更新');

  console.log('\n⏰ 测试完成时间:', new Date().toLocaleString());
  console.log('=====================================');
}

// 导出测试函数
window.nextjsLocalTest = {
  runFullTest: step1_checkNextjsServer,
  checkServer: step1_checkNextjsServer,
  checkApi: step2_checkApiEndpoints,
  testAuth: step3_testAuthentication,
  testData: step4_testDataOperations,
  generateReport: generateTestReport
};

console.log('💡 使用说明:');
console.log('- 完整测试: nextjsLocalTest.runFullTest()');
console.log('- 单项测试: nextjsLocalTest.checkServer() 等');
console.log('');
console.log('🎯 Next.js服务器确认运行在: http://localhost:3000');
console.log('🎬 5秒后自动开始测试...');

// 5秒后自动开始测试
setTimeout(() => {
  console.log('开始Next.js本地后端连接测试...');
  step1_checkNextjsServer();
}, 5000);