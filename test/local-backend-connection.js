// test/local-backend-connection.js
// 本地后端连接测试脚本
// 在微信开发者工具控制台中运行

console.log('🏠 ===== 本地后端连接测试开始 =====');
console.log('本地API地址: http://localhost:3000/api');
console.log('AppID: wx37031fe607647fa3');
console.log('当前时间:', new Date().toLocaleString());
console.log('');

// 测试状态跟踪
const testResults = {
  localServerRunning: false,
  domainConfigured: false,
  apiHealth: false,
  authWorking: false,
  dataOperations: false
};

// 测试数据
let localTestToken = '';

// 步骤1: 检查本地服务器状态
function step1_checkLocalServer() {
  console.log('📋 步骤1: 检查本地服务器状态...');

  wx.request({
    url: 'http://localhost:3000/api/health',
    method: 'GET',
    timeout: 5000,
    success: (res) => {
      console.log('✅ 本地服务器运行正常');
      console.log('响应状态:', res.statusCode);
      console.log('响应数据:', res.data);
      testResults.localServerRunning = true;
      step2_checkDomainConfig();
    },
    fail: (err) => {
      console.error('❌ 本地服务器连接失败:', err);

      if (err.errMsg && err.errMsg.includes('url not in domain list')) {
        console.log('🔧 需要配置域名:');
        console.log('1. 在微信公众平台添加: http://localhost:3000');
        console.log('2. 或者在开发者工具中勾选"不校验合法域名"');
        testResults.domainConfigured = false;
      } else if (err.errMsg && err.errMsg.includes('fail')) {
        console.log('💡 可能原因:');
        console.log('- 本地后端服务未启动');
        console.log('- 端口3000被占用或配置错误');
        console.log('- 防火墙阻止连接');
        testResults.localServerRunning = false;
      }

      step2_checkDomainConfig();
    }
  });
}

// 步骤2: 检查域名配置
function step2_checkDomainConfig() {
  console.log('\n📋 步骤2: 检查域名配置...');

  console.log('🔍 本地开发域名配置选项:');
  console.log('选项1: 在微信公众平台添加 http://localhost:3000');
  console.log('选项2: 开发者工具 → 详情 → 本地设置 → 勾选"不校验合法域名"');

  // 再次尝试连接，验证域名配置
  wx.request({
    url: 'http://localhost:3000/api/health',
    method: 'GET',
    timeout: 5000,
    success: (res) => {
      console.log('✅ 域名配置正确，可以访问本地服务');
      testResults.domainConfigured = true;
      step3_testApiHealth();
    },
    fail: (err) => {
      if (err.errMsg && err.errMsg.includes('url not in domain list')) {
        console.log('❌ 域名未配置，请选择以下方案之一:');
        console.log('');
        console.log('🛠️ 方案1: 配置微信公众平台');
        console.log('1. 登录 https://mp.weixin.qq.com');
        console.log('2. 开发 → 开发设置 → 服务器域名');
        console.log('3. 在request合法域名添加: http://localhost:3000');
        console.log('');
        console.log('🛠️ 方案2: 开发者工具设置（推荐）');
        console.log('1. 打开微信开发者工具');
        console.log('2. 点击右上角"详情"');
        console.log('3. 切换到"本地设置"标签');
        console.log('4. 勾选"不校验合法域名、web-view(业务域名)、TLS版本以及HTTPS证书"');
        console.log('5. 重新编译项目');
        testResults.domainConfigured = false;
      } else {
        console.log('❌ 其他连接问题:', err.errMsg);
        testResults.domainConfigured = false;
      }

      generateLocalTestReport();
    }
  });
}

// 步骤3: 测试API健康检查
function step3_testApiHealth() {
  console.log('\n📡 步骤3: 测试API健康检查...');

  wx.request({
    url: 'http://localhost:3000/api/health',
    method: 'GET',
    timeout: 10000,
    success: (res) => {
      console.log('✅ API健康检查通过');
      console.log('服务器信息:', res.data);
      testResults.apiHealth = true;
      step4_testAuthentication();
    },
    fail: (err) => {
      console.error('❌ API健康检查失败:', err);
      console.log('💡 请检查:');
      console.log('- 后端服务是否正确启动在3000端口');
      console.log('- /api/health 接口是否实现');
      console.log('- 后端CORS配置是否允许localhost访问');
      testResults.apiHealth = false;
      generateLocalTestReport();
    }
  });
}

// 步骤4: 测试用户认证
function step4_testAuthentication() {
  console.log('\n🔐 步骤4: 测试用户认证...');

  console.log('检查后端环境变量配置...');
  console.log('需要配置的环境变量:');
  console.log('- WECHAT_APP_ID=wx37031fe607647fa3');
  console.log('- WECHAT_APP_SECRET=029874ac1aee76391bc7c7f8bcc7f40a');
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
        timeout: 10000,
        success: (res) => {
          console.log('✅ 本地认证成功');
          console.log('认证响应:', res.data);

          if (res.data && res.data.access_token) {
            localTestToken = res.data.access_token;
            console.log('🎫 Token获取成功');
            wx.setStorageSync('local_test_token', localTestToken);
            testResults.authWorking = true;
            step5_testDataOperations();
          } else {
            console.log('⚠️ 认证成功但未获取到Token');
            testResults.authWorking = false;
            generateLocalTestReport();
          }
        },
        fail: (err) => {
          console.error('❌ 本地认证失败:', err);
          console.log('🔧 故障排除:');
          console.log('1. 检查后端是否正确配置了微信小程序环境变量');
          console.log('2. 确认/api/auth/login接口实现正确');
          console.log('3. 查看后端控制台日志');
          console.log('4. 验证AppID和AppSecret是否正确');
          testResults.authWorking = false;
          generateLocalTestReport();
        }
      });
    },
    fail: (err) => {
      console.error('❌ 微信登录失败:', err);
      testResults.authWorking = false;
      generateLocalTestReport();
    }
  });
}

// 步骤5: 测试数据操作
function step5_testDataOperations() {
  console.log('\n💾 步骤5: 测试数据操作...');

  if (!localTestToken) {
    console.log('⚠️ 跳过数据操作测试 - 未获取到Token');
    generateLocalTestReport();
    return;
  }

  // 测试创建交易记录
  const testData = {
    type: 'expense',
    amount: 66.66,
    categoryId: 'food',
    note: '本地后端连接测试',
    date: new Date().toISOString().split('T')[0]
  };

  console.log('测试创建交易记录...');
  wx.request({
    url: 'http://localhost:3000/api/transactions',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${localTestToken}`,
      'Content-Type': 'application/json'
    },
    data: testData,
    timeout: 10000,
    success: (res) => {
      console.log('✅ 数据操作测试成功:', res.data);
      testResults.dataOperations = true;

      // 测试获取数据
      testDataRetrieval();
    },
    fail: (err) => {
      console.error('❌ 数据操作测试失败:', err);
      console.log('💡 可能原因:');
      console.log('- 数据库连接问题');
      console.log('- 交易接口实现问题');
      console.log('- 数据验证失败');
      testResults.dataOperations = false;
      generateLocalTestReport();
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
      'Authorization': `Bearer ${localTestToken}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000,
    success: (res) => {
      console.log('✅ 数据获取测试成功:', res.data);
      generateLocalTestReport();
    },
    fail: (err) => {
      console.error('❌ 数据获取测试失败:', err);
      generateLocalTestReport();
    }
  });
}

// 生成本地测试报告
function generateLocalTestReport() {
  console.log('\n📊 ===== 本地后端连接测试报告 =====');
  console.log(`本地服务器: ${testResults.localServerRunning ? '✅ 运行正常' : '❌ 连接失败'}`);
  console.log(`域名配置: ${testResults.domainConfigured ? '✅ 配置正确' : '❌ 需要配置'}`);
  console.log(`API健康: ${testResults.apiHealth ? '✅ 正常' : '❌ 异常'}`);
  console.log(`用户认证: ${testResults.authWorking ? '✅ 正常' : '❌ 失败'}`);
  console.log(`数据操作: ${testResults.dataOperations ? '✅ 正常' : '❌ 失败'}`);

  const passedCount = Object.values(testResults).filter(Boolean).length;
  const totalCount = Object.keys(testResults).length;

  console.log(`\n📈 通过率: ${passedCount}/${totalCount} (${Math.round(passedCount/totalCount*100)}%)`);

  if (passedCount === totalCount) {
    console.log('🎉 恭喜！本地后端连接完全正常！');
    console.log('✨ 前端已成功连接到本地后端服务');
    console.log('');
    console.log('🚀 现在你可以:');
    console.log('1. 开始本地开发和调试');
    console.log('2. 测试完整的记账功能');
    console.log('3. 实时查看后端日志');
    console.log('4. 进行数据库操作验证');
  } else if (passedCount >= 2) {
    console.log('⚠️ 部分功能正常，需要解决个别问题');

    if (!testResults.localServerRunning) {
      console.log('🔧 首先启动本地后端服务:');
      console.log('1. 进入后端项目目录');
      console.log('2. 安装依赖: npm install');
      console.log('3. 配置环境变量（见上述说明）');
      console.log('4. 启动服务: npm run dev 或 npm start');
    }

    if (!testResults.domainConfigured) {
      console.log('🔧 配置域名（推荐方案2）');
    }
  } else {
    console.log('❌ 连接存在较多问题');
    console.log('');
    console.log('📝 解决步骤:');
    console.log('1. 确保本地后端服务已启动并运行在3000端口');
    console.log('2. 在开发者工具中关闭域名校验');
    console.log('3. 配置正确的微信小程序环境变量');
    console.log('4. 检查后端CORS配置');
  }

  console.log('\n💡 开发建议:');
  console.log('- 使用开发者工具的Network面板监控请求');
  console.log('- 查看后端控制台日志定位问题');
  console.log('- 确保后端支持CORS跨域请求');
  console.log('- 可以先用Postman等工具测试后端接口');

  console.log('\n⏰ 测试完成时间:', new Date().toLocaleString());
  console.log('=====================================');
}

// 导出测试函数
window.localBackendTest = {
  runFullTest: step1_checkLocalServer,
  checkServer: step1_checkLocalServer,
  checkDomain: step2_checkDomainConfig,
  testHealth: step3_testApiHealth,
  testAuth: step4_testAuthentication,
  testData: step5_testDataOperations,
  generateReport: generateLocalTestReport
};

console.log('💡 使用说明:');
console.log('- 完整测试: localBackendTest.runFullTest()');
console.log('- 单项测试: localBackendTest.checkServer() 等');
console.log('');
console.log('🏠 确保本地后端服务已启动在 http://localhost:3000');
console.log('🎬 3秒后自动开始测试...');

// 3秒后自动开始
setTimeout(() => {
  console.log('开始本地后端连接测试...');
  step1_checkLocalServer();
}, 3000);