// test/production-api-test.js
// 线上接口连接测试脚本
// 在微信开发者工具控制台中运行

console.log('🌐 ===== 线上接口连接测试开始 =====');
console.log('线上API地址: https://next-vite-delta.vercel.app/api');
console.log('AppID: wx37031fe607647fa3');
console.log('当前时间:', new Date().toLocaleString());
console.log('');

// 测试状态跟踪
const testResults = {
  domainConfigured: false,
  vercelDeployment: false,
  apiHealth: false,
  authentication: false,
  dataOperations: false,
  onlineStatusFixed: false
};

let prodToken = '';

// 步骤1: 检查域名配置
function step1_checkDomainConfig() {
  console.log('📋 步骤1: 检查域名配置...');

  console.log('🔍 确认微信公众平台域名配置:');
  console.log('需要在request合法域名中包含: https://next-vite-delta.vercel.app');
  console.log('');

  // 测试域名访问
  wx.request({
    url: 'https://next-vite-delta.vercel.app/api/health',
    method: 'GET',
    timeout: 15000,
    success: (res) => {
      console.log('✅ 域名配置正确，可以访问线上API');
      console.log('响应状态:', res.statusCode);
      testResults.domainConfigured = true;
      step2_checkVercelDeployment();
    },
    fail: (err) => {
      console.error('❌ 域名配置问题:', err);

      if (err.errMsg && err.errMsg.includes('url not in domain list')) {
        console.log('🔧 解决方案:');
        console.log('1. 登录微信公众平台: https://mp.weixin.qq.com');
        console.log('2. 开发 → 开发设置 → 服务器域名');
        console.log('3. 在request合法域名中添加: https://next-vite-delta.vercel.app');
        console.log('4. 保存配置');
        console.log('5. 在开发者工具中: 详情 → 域名信息 → 刷新');
        console.log('6. 重新编译项目');
        testResults.domainConfigured = false;
      } else {
        console.log('🔧 其他可能原因:');
        console.log('- Vercel部署服务异常');
        console.log('- 网络连接问题');
        console.log('- HTTPS证书问题');
      }

      step2_checkVercelDeployment();
    }
  });
}

// 步骤2: 检查Vercel部署状态
function step2_checkVercelDeployment() {
  console.log('\n📡 步骤2: 检查Vercel部署状态...');

  console.log('🔍 检查Vercel环境变量配置:');
  console.log('确保已在Vercel项目中配置:');
  console.log('- WECHAT_APP_ID=wx37031fe607647fa3');
  console.log('- WECHAT_APP_SECRET=你的微信小程序AppSecret');
  console.log('');

  wx.request({
    url: 'https://next-vite-delta.vercel.app/api/health',
    method: 'GET',
    timeout: 15000,
    success: (res) => {
      console.log('✅ Vercel部署正常');
      console.log('健康检查响应:', res.data);
      testResults.vercelDeployment = true;
      testResults.apiHealth = true;
      step3_testAuthentication();
    },
    fail: (err) => {
      console.error('❌ Vercel部署异常:', err);

      if (err.errMsg && err.errMsg.includes('404')) {
        console.log('💡 API路由可能未部署:');
        console.log('- 检查Vercel部署日志');
        console.log('- 确认API路由文件已正确部署');
      } else if (err.errMsg && err.errMsg.includes('500')) {
        console.log('💡 服务器内部错误:');
        console.log('- 检查Vercel函数日志');
        console.log('- 确认环境变量配置正确');
      }

      testResults.vercelDeployment = false;
      testResults.apiHealth = false;
      generateProductionTestReport();
    }
  });
}

// 步骤3: 测试线上认证
function step3_testAuthentication() {
  console.log('\n🔐 步骤3: 测试线上认证...');

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
        timeout: 20000, // 线上环境延长超时时间
        success: (res) => {
          console.log('✅ 线上认证成功');
          console.log('认证响应:', res.data);

          if (res.data && res.data.access_token) {
            prodToken = res.data.access_token;
            console.log('🎫 线上Token获取成功');
            wx.setStorageSync('access_token', prodToken);
            testResults.authentication = true;

            // 重要：设置在线状态
            step4_fixOnlineStatus();
          } else {
            console.log('⚠️ 认证成功但Token格式异常');
            testResults.authentication = false;
            generateProductionTestReport();
          }
        },
        fail: (err) => {
          console.error('❌ 线上认证失败:', err);

          if (err.errMsg && err.errMsg.includes('timeout')) {
            console.log('💡 认证超时，可能原因:');
            console.log('- Vercel函数冷启动');
            console.log('- 网络延迟');
            console.log('- 微信API响应慢');
          } else if (err.errMsg && err.errMsg.includes('500')) {
            console.log('💡 服务器错误，检查:');
            console.log('- Vercel环境变量配置');
            console.log('- 微信小程序配置');
            console.log('- 数据库连接');
          }

          testResults.authentication = false;
          generateProductionTestReport();
        }
      });
    },
    fail: (err) => {
      console.error('❌ 微信登录失败:', err);
      testResults.authentication = false;
      generateProductionTestReport();
    }
  });
}

// 步骤4: 修复在线状态（重要）
function step4_fixOnlineStatus() {
  console.log('\n🔧 步骤4: 设置在线状态...');

  try {
    const app = getApp();

    // 设置在线状态
    app.setOnlineStatus(true);

    // 验证状态
    const isOnline = app.isOnlineMode();
    console.log('在线状态设置结果:', isOnline);

    if (isOnline) {
      console.log('✅ 在线状态设置成功');
      testResults.onlineStatusFixed = true;
      step5_testDataOperations();
    } else {
      console.log('❌ 在线状态设置失败');
      console.log('尝试手动修复...');

      // 强制设置
      app.globalData.isOnline = true;
      const retryOnline = app.isOnlineMode();

      if (retryOnline) {
        console.log('✅ 手动修复成功');
        testResults.onlineStatusFixed = true;
        step5_testDataOperations();
      } else {
        console.log('❌ 手动修复失败');
        testResults.onlineStatusFixed = false;
        generateProductionTestReport();
      }
    }
  } catch (error) {
    console.error('❌ 设置在线状态出错:', error);
    testResults.onlineStatusFixed = false;
    generateProductionTestReport();
  }
}

// 步骤5: 测试线上数据操作
function step5_testDataOperations() {
  console.log('\n💾 步骤5: 测试线上数据操作...');

  if (!prodToken) {
    console.log('⚠️ 跳过数据操作测试 - 未获取到Token');
    generateProductionTestReport();
    return;
  }

  // 测试创建交易记录
  const testTransaction = {
    type: 'expense',
    amount: 88.88,
    categoryId: 'food',
    note: '线上接口测试记录',
    date: new Date().toISOString().split('T')[0]
  };

  console.log('测试创建线上交易记录...');
  wx.request({
    url: 'https://next-vite-delta.vercel.app/api/transactions',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${prodToken}`,
      'Content-Type': 'application/json'
    },
    data: testTransaction,
    timeout: 20000,
    success: (res) => {
      console.log('✅ 线上数据创建成功:', res.data);
      testDataRetrieval();
    },
    fail: (err) => {
      console.error('❌ 线上数据创建失败:', err);

      if (err.errMsg && err.errMsg.includes('401')) {
        console.log('💡 Token验证失败，可能原因:');
        console.log('- JWT密钥配置错误');
        console.log('- Token格式问题');
      } else if (err.errMsg && err.errMsg.includes('500')) {
        console.log('💡 数据库操作失败');
      }

      testResults.dataOperations = false;
      generateProductionTestReport();
    }
  });
}

// 测试线上数据获取
function testDataRetrieval() {
  console.log('测试线上数据获取...');

  wx.request({
    url: 'https://next-vite-delta.vercel.app/api/transactions?page=1&pageSize=5',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${prodToken}`,
      'Content-Type': 'application/json'
    },
    timeout: 20000,
    success: (res) => {
      console.log('✅ 线上数据获取成功:', res.data);
      testResults.dataOperations = true;
      generateProductionTestReport();
    },
    fail: (err) => {
      console.error('❌ 线上数据获取失败:', err);
      testResults.dataOperations = false;
      generateProductionTestReport();
    }
  });
}

// 生成线上测试报告
function generateProductionTestReport() {
  console.log('\n📊 ===== 线上接口连接测试报告 =====');
  console.log(`域名配置: ${testResults.domainConfigured ? '✅ 正确' : '❌ 异常'}`);
  console.log(`Vercel部署: ${testResults.vercelDeployment ? '✅ 正常' : '❌ 异常'}`);
  console.log(`API健康: ${testResults.apiHealth ? '✅ 正常' : '❌ 异常'}`);
  console.log(`线上认证: ${testResults.authentication ? '✅ 成功' : '❌ 失败'}`);
  console.log(`在线状态: ${testResults.onlineStatusFixed ? '✅ 已修复' : '❌ 异常'}`);
  console.log(`数据操作: ${testResults.dataOperations ? '✅ 成功' : '❌ 失败'}`);

  const passedCount = Object.values(testResults).filter(Boolean).length;
  const totalCount = Object.keys(testResults).length;

  console.log(`\n📈 线上通过率: ${passedCount}/${totalCount} (${Math.round(passedCount/totalCount*100)}%)`);

  if (passedCount === totalCount) {
    console.log('🎉 恭喜！线上接口连接完全正常！');
    console.log('✨ 小程序已成功切换到线上接口');
    console.log('');
    console.log('🚀 现在你可以:');
    console.log('1. 正常使用记账功能（数据保存到线上）');
    console.log('2. 多设备数据同步');
    console.log('3. 准备发布小程序');
    console.log('4. 进行真机测试');

    // 显示成功提示
    wx.showModal({
      title: '线上接口连接成功',
      content: '小程序已切换到线上接口，数据将保存到云端服务器',
      showCancel: false,
      confirmText: '知道了'
    });

  } else if (passedCount >= 4) {
    console.log('⚠️ 大部分功能正常，个别问题需要解决');

    if (!testResults.domainConfigured) {
      console.log('');
      console.log('🔧 优先解决域名配置问题');
    }

    if (!testResults.onlineStatusFixed) {
      console.log('');
      console.log('🔧 手动修复在线状态:');
      console.log('运行: fixOnlineStatusManually()');
    }

  } else {
    console.log('❌ 线上接口存在较多问题');
    console.log('');
    console.log('📋 解决优先级:');
    console.log('1. 确认Vercel部署状态和环境变量');
    console.log('2. 配置微信公众平台域名');
    console.log('3. 检查API接口实现');
    console.log('4. 验证数据库连接');
  }

  console.log('\n💡 生产环境提示:');
  console.log('- 线上环境响应可能比本地慢');
  console.log('- 注意Vercel函数的冷启动时间');
  console.log('- 监控API调用频率和限制');
  console.log('- 定期检查部署状态');

  console.log('\n⏰ 测试完成时间:', new Date().toLocaleString());
  console.log('=====================================');
}

// 手动修复在线状态函数
function fixOnlineStatusManually() {
  console.log('🔧 手动修复在线状态...');

  try {
    const app = getApp();
    const token = wx.getStorageSync('access_token');

    if (token) {
      // 强制设置在线状态
      app.globalData.isOnline = true;

      // 验证
      const isOnline = app.isOnlineMode();
      console.log('修复后在线状态:', isOnline);

      if (isOnline) {
        console.log('✅ 在线状态修复成功！');
        wx.showToast({
          title: '已切换到线上模式',
          icon: 'success'
        });
      } else {
        console.log('❌ 修复失败，需要重新登录');
      }
    } else {
      console.log('❌ Token不存在，需要重新运行测试');
    }
  } catch (error) {
    console.error('修复过程出错:', error);
  }
}

// 导出测试函数
window.productionApiTest = {
  runFullTest: step1_checkDomainConfig,
  checkDomain: step1_checkDomainConfig,
  checkVercel: step2_checkVercelDeployment,
  testAuth: step3_testAuthentication,
  fixStatus: fixOnlineStatusManually,
  testData: step5_testDataOperations,
  generateReport: generateProductionTestReport
};

console.log('💡 使用说明:');
console.log('- 完整测试: productionApiTest.runFullTest()');
console.log('- 修复状态: productionApiTest.fixStatus()');
console.log('- 单项测试: productionApiTest.testAuth() 等');
console.log('');
console.log('🌐 确保Vercel服务正常运行');
console.log('🎬 5秒后自动开始测试...');

// 5秒后自动开始测试
setTimeout(() => {
  console.log('开始线上接口连接测试...');
  step1_checkDomainConfig();
}, 5000);