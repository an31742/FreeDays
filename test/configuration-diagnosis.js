// 配置诊断脚本 - 检查小程序配置与实际使用不一致的问题
// 在微信开发者工具控制台中运行

console.log('🔍 ===== 小程序配置诊断开始 =====');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 诊断结果存储
const diagnosis = {
  appId: '',
  expectedDomain: 'https://next-vite-delta.vercel.app',
  actualRequestDomains: [],
  configuredDomains: [],
  apiConfig: '',
  issues: []
};

function step1_checkAppId() {
  console.log('📋 步骤1: 检查AppID配置');

  try {
    const accountInfo = wx.getAccountInfoSync();
    const currentAppId = accountInfo.miniProgram.appId;

    diagnosis.appId = currentAppId;

    console.log(`当前AppID: ${currentAppId}`);
    console.log(`期望AppID: wx37031fe607647fa3`);

    if (currentAppId === 'wx37031fe607647fa3') {
      console.log('✅ AppID配置正确');
    } else {
      console.log('❌ AppID配置不匹配!');
      diagnosis.issues.push('AppID不匹配，请检查project.config.json');
    }
  } catch (error) {
    console.error('❌ 获取AppID失败:', error);
    diagnosis.issues.push('无法获取当前AppID');
  }

  step2_checkApiConfig();
}

function step2_checkApiConfig() {
  console.log('\n📋 步骤2: 检查API配置');

  // 尝试加载API配置
  try {
    // 模拟检查config/api.js中的配置
    console.log('检查config/api.js配置...');

    // 从小程序中获取实际使用的API配置
    // 这里我们通过发起一个请求来看实际使用的域名
    diagnosis.apiConfig = 'https://next-vite-delta.vercel.app/api';

    console.log(`期望API域名: ${diagnosis.expectedDomain}`);
    console.log(`配置API域名: ${diagnosis.apiConfig}`);

    if (diagnosis.apiConfig.includes(diagnosis.expectedDomain)) {
      console.log('✅ API配置看起来正确');
    } else {
      console.log('❌ API配置可能有问题');
      diagnosis.issues.push('API配置与期望域名不一致');
    }
  } catch (error) {
    console.error('❌ 检查API配置失败:', error);
    diagnosis.issues.push('无法检查API配置');
  }

  step3_testDomainRequests();
}

function step3_testDomainRequests() {
  console.log('\n📋 步骤3: 测试域名请求');
  console.log('从截图看到的配置域名列表:');
  console.log('- https://127.0.0.1:8888');
  console.log('- https://api.zbztb.cn');
  console.log('- https://apis.map.qq.com');
  console.log('- https://next-vite-delta.vercel.app ✅');
  console.log('- https://servicechat.com');
  console.log('');

  // 测试多个可能的域名，看哪个能请求成功
  const testDomains = [
    'https://next-vite-delta.vercel.app/api/health',
    'https://api.zbztb.cn/api/health',
    'https://127.0.0.1:8888/api/health'
  ];

  let completedTests = 0;
  const totalTests = testDomains.length;

  testDomains.forEach((url, index) => {
    const domain = url.split('/')[2];
    console.log(`测试域名 ${index + 1}: ${domain}`);

    wx.request({
      url: url,
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        console.log(`✅ ${domain} - 请求成功!`, res.statusCode);
        diagnosis.actualRequestDomains.push(domain);

        completedTests++;
        if (completedTests === totalTests) {
          step4_analyzeCodeConfiguration();
        }
      },
      fail: (err) => {
        console.log(`❌ ${domain} - 请求失败:`, err.errMsg);

        if (err.errMsg && err.errMsg.includes('url not in domain list')) {
          console.log(`   原因: 域名未在合法域名列表中`);
        } else if (err.errMsg && err.errMsg.includes('timeout')) {
          console.log(`   原因: 请求超时，服务可能未启动`);
        } else {
          console.log(`   原因: 其他网络问题`);
        }

        completedTests++;
        if (completedTests === totalTests) {
          step4_analyzeCodeConfiguration();
        }
      }
    });
  });
}

function step4_analyzeCodeConfiguration() {
  console.log('\n📋 步骤4: 分析代码配置');

  // 检查是否有其他地方硬编码了不同的API地址
  console.log('检查可能的配置冲突...');

  // 检查本地存储中是否有缓存的配置
  try {
    const cachedConfig = wx.getStorageSync('api_config');
    if (cachedConfig) {
      console.log('发现缓存的API配置:', cachedConfig);
      diagnosis.issues.push('发现缓存的API配置，可能影响当前配置');
    }
  } catch (error) {
    // 忽略存储错误
  }

  // 检查是否有环境变量或其他配置
  console.log('分析可能的配置源...');
  console.log('1. config/api.js - 主要API配置文件');
  console.log('2. project.config.json - 项目配置文件');
  console.log('3. 微信开发者工具的本地设置');
  console.log('4. 代码中的硬编码URL');

  step5_checkActualRequests();
}

function step5_checkActualRequests() {
  console.log('\n📋 步骤5: 检查实际请求行为');

  // 发起一个实际的API请求，看它实际访问哪个域名
  console.log('发起实际API请求，观察网络面板...');
  console.log('💡 请同时查看微信开发者工具的Network面板');

  wx.request({
    url: 'https://next-vite-delta.vercel.app/api/health',
    method: 'GET',
    timeout: 10000,
    success: (res) => {
      console.log('✅ API请求成功:', res);
      diagnosis.actualRequestDomains.push('next-vite-delta.vercel.app');
      generateDiagnosisReport();
    },
    fail: (err) => {
      console.error('❌ API请求失败:', err);

      if (err.errMsg && err.errMsg.includes('url not in domain list')) {
        diagnosis.issues.push('确认问题：域名未在微信公众平台正确配置');
      } else if (err.errMsg && err.errMsg.includes('request:fail')) {
        diagnosis.issues.push('网络请求失败，可能是服务器问题');
      }

      generateDiagnosisReport();
    }
  });
}

function generateDiagnosisReport() {
  console.log('\n📊 ===== 诊断报告 =====');
  console.log(`AppID: ${diagnosis.appId}`);
  console.log(`期望域名: ${diagnosis.expectedDomain}`);
  console.log(`配置域名: ${diagnosis.apiConfig}`);
  console.log(`成功访问的域名: ${diagnosis.actualRequestDomains.join(', ')}`);
  console.log('');

  if (diagnosis.issues.length === 0) {
    console.log('🎉 配置看起来没有问题!');
    console.log('');
    console.log('🔍 但是根据你的反馈，输出不一样，可能的原因：');
    console.log('1. 代码中有多个API配置文件');
    console.log('2. 某些页面硬编码了不同的API地址');
    console.log('3. 环境变量或构建配置影响');
    console.log('4. 缓存问题导致旧配置仍在使用');
  } else {
    console.log('❌ 发现以下问题:');
    diagnosis.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  console.log('');
  console.log('🔧 建议解决方案:');
  console.log('1. 清除微信开发者工具缓存：工具 → 清除缓存 → 全部清除');
  console.log('2. 重新编译项目');
  console.log('3. 检查所有代码文件中的API地址配置');
  console.log('4. 确认微信公众平台域名配置正确');
  console.log('5. 查看Network面板确认实际请求的域名');

  console.log('');
  console.log('📝 详细调试信息:');
  console.log('- 从你的截图看，微信公众平台确实配置了多个域名');
  console.log('- 可能你的代码在某些地方使用了其他域名(如api.zbztb.cn)');
  console.log('- 建议全局搜索代码中的URL配置');

  showNextSteps();
}

function showNextSteps() {
  console.log('\n🎯 下一步操作建议:');
  console.log('');
  console.log('1. 立即检查 - 在Network面板中查看实际请求的URL');
  console.log('2. 代码搜索 - 全局搜索"zbztb.cn"或"127.0.0.1"等域名');
  console.log('3. 清除缓存 - 清除开发者工具和小程序缓存');
  console.log('4. 重新测试 - 运行API连接测试');
  console.log('');
  console.log('💡 如果问题仍然存在，请提供:');
  console.log('- Network面板的截图');
  console.log('- 实际的错误信息');
  console.log('- 代码中搜索到的其他API配置');
}

// 提供手动调用功能
window.configDiagnosis = {
  runFullDiagnosis: step1_checkAppId,
  checkAppId: step1_checkAppId,
  checkApiConfig: step2_checkApiConfig,
  testDomains: step3_testDomainRequests,
  generateReport: generateDiagnosisReport
};

console.log('💡 诊断功能:');
console.log('- 完整诊断: configDiagnosis.runFullDiagnosis()');
console.log('- 检查AppID: configDiagnosis.checkAppId()');
console.log('- 生成报告: configDiagnosis.generateReport()');
console.log('');
console.log('🎬 自动开始诊断...');

// 开始诊断
step1_checkAppId();