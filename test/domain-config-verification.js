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

          // 保存Token用于后续测试
          testToken = res.data?.access_token;

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

  // 创建一个测试交易记录来验证API功能
  const testTransaction = {
    type: 'expense',
    amount: 44.44,
    categoryId: 'food',
    note: '域名配置验证测试',
    date: new Date().toISOString().split('T')[0]
  };

  console.log('创建测试交易记录...');

  testDataManager.createTestTransaction(
    'https://next-vite-delta.vercel.app',
    token,
    testTransaction
  )
  .then((createdData) => {
    console.log('✅ 步骤3通过 - API功能正常!');
    console.log('数据创建成功:', createdData);

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
        console.log('✅ 交易列表获取成功:', res.data);
        generateSummaryReport(true);

        // 清理测试数据
        if (testToken) {
          testDataManager.cleanupAllTestData('https://next-vite-delta.vercel.app', testToken)
            .then(() => {
              console.log('✅ 测试数据清理完成');
            })
            .catch((error) => {
              console.error('❌ 测试数据清理过程中出现错误:', error);
            });
        }
      },
      fail: (err) => {
        console.error('❌ 交易列表获取失败:', err);
        generateSummaryReport(true, false);

        // 清理测试数据
        if (testToken) {
          testDataManager.cleanupAllTestData('https://next-vite-delta.vercel.app', testToken)
            .then(() => {
              console.log('✅ 测试数据清理完成');
            })
            .catch((error) => {
              console.error('❌ 测试数据清理过程中出现错误:', error);
            });
        }
      }
    });
  })
  .catch((err) => {
    console.error('❌ 数据创建失败:', err);
    generateSummaryReport(true, false);
  });
}