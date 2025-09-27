# 🧪 小程序测试环境连接操作指南

## 📋 测试环境信息
- **测试域名**: https://next-vite-delta.vercel.app/api
- **AppID**: wx37031fe607647fa3
- **当前环境**: production (生产测试环境)

## 🚀 操作步骤

### 步骤1: 配置微信公众平台域名 (必须先完成)

1. **登录微信公众平台**
   ```
   访问：https://mp.weixin.qq.com
   使用对应 wx37031fe607647fa3 的账号登录
   ```

2. **添加合法域名**
   ```
   路径：开发 → 开发设置 → 服务器域名
   在 "request合法域名" 中添加：
   https://next-vite-delta.vercel.app
   ```

3. **保存配置**
   - 点击保存
   - 注意：每月只能修改5次，请谨慎操作

### 步骤2: 验证后端环境变量配置

1. **检查Vercel环境变量**
   ```bash
   登录 https://vercel.com
   进入项目：next-vite-delta
   Settings → Environment Variables
   
   确认包含：
   WECHAT_APP_ID = wx37031fe607647fa3
   WECHAT_APP_SECRET = 029874ac1aee76391bc7c7f8bcc7f40a
   ```

2. **如果需要添加环境变量**
   - 点击 "Add New"
   - 输入变量名和值
   - 点击 "Save"
   - 重新部署项目

### 步骤3: 在微信开发者工具中开始测试

#### 3.1 打开项目
1. 启动微信开发者工具
2. 打开你的小程序项目
3. 确认 AppID 为 `wx37031fe607647fa3`

#### 3.2 运行基础连接测试
打开控制台（Console），运行以下测试：

```javascript
// 1. 基础API连接测试
console.log('🧪 开始测试环境连接...');
wx.request({
  url: 'https://next-vite-delta.vercel.app/api/health',
  method: 'GET',
  timeout: 10000,
  success: (res) => {
    console.log('✅ 测试环境连接成功!');
    console.log('响应状态:', res.statusCode);
    console.log('响应数据:', res.data);
  },
  fail: (err) => {
    console.error('❌ 测试环境连接失败:', err);
    if (err.errMsg.includes('url not in domain list')) {
      console.log('💡 请先在微信公众平台配置合法域名');
    }
  }
});
```

#### 3.3 测试微信登录流程
```javascript
// 2. 微信登录测试
wx.login({
  success: (loginRes) => {
    console.log('📱 微信登录码:', loginRes.code);
    
    wx.request({
      url: 'https://next-vite-delta.vercel.app/api/auth/login',
      method: 'POST',
      data: { code: loginRes.code },
      success: (res) => {
        console.log('✅ 登录测试成功!');
        console.log('Token:', res.data?.access_token?.substring(0, 20) + '...');
        
        // 保存Token用于后续测试
        if (res.data?.access_token) {
          wx.setStorageSync('test_token', res.data.access_token);
        }
      },
      fail: (err) => {
        console.error('❌ 登录测试失败:', err);
        console.log('💡 请检查后端环境变量配置');
      }
    });
  }
});
```

#### 3.4 测试记账功能接口
```javascript
// 3. 测试记账接口 (需要先完成登录)
const token = wx.getStorageSync('test_token');
if (token) {
  // 测试创建交易记录
  wx.request({
    url: 'https://next-vite-delta.vercel.app/api/transactions',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      type: 'expense',
      amount: 50.00,
      categoryId: 'food',
      note: '测试记录',
      date: new Date().toISOString().split('T')[0]
    },
    success: (res) => {
      console.log('✅ 记账接口测试成功!', res.data);
    },
    fail: (err) => {
      console.error('❌ 记账接口测试失败:', err);
    }
  });
} else {
  console.log('⚠️ 请先完成登录测试');
}
```

### 步骤4: 运行完整的小程序功能测试

#### 4.1 测试记账主页
1. 点击底部 "记账本" 标签
2. 查看是否能正常加载月度统计
3. 检查最近交易记录是否显示

#### 4.2 测试快速记账
1. 点击收入或支出分类图标
2. 输入金额和备注
3. 保存记录
4. 观察控制台网络请求日志

#### 4.3 测试查询功能
1. 点击查询按钮
2. 选择日期范围
3. 查看统计结果和图表

### 步骤5: 监控测试结果

#### 5.1 查看控制台日志
关注以下信息：
- API请求状态码
- 错误信息
- 数据同步状态
- Token验证结果

#### 5.2 查看网络面板
在开发者工具中：
1. 切换到 Network 标签
2. 观察API请求
3. 检查请求头和响应数据

## 🔍 故障排除

### 常见问题及解决方案

#### 问题1: "url not in domain list"
**原因**: 域名未在微信公众平台配置
**解决**: 完成步骤1的域名配置

#### 问题2: "登录失败"
**原因**: 后端环境变量配置错误
**解决**: 检查Vercel环境变量配置

#### 问题3: "网络请求超时"
**原因**: 后端服务异常或网络问题
**解决**: 
1. 检查后端服务状态
2. 验证API地址是否正确
3. 确认CORS配置

#### 问题4: "Token验证失败"
**原因**: JWT配置或Token生成逻辑问题
**解决**: 检查后端JWT相关配置

## 📊 测试成功标准

### 基础连接 ✅
- [ ] API健康检查返回200
- [ ] 网络请求无跨域错误
- [ ] 响应时间在可接受范围内

### 用户认证 ✅
- [ ] 微信登录获取code成功
- [ ] 后端登录接口返回Token
- [ ] Token格式正确且有效

### 核心功能 ✅
- [ ] 记账功能正常工作
- [ ] 数据查询返回正确结果
- [ ] 统计分析显示正常
- [ ] 图表渲染无错误

### 数据同步 ✅
- [ ] 在线模式数据同步到服务器
- [ ] 离线模式降级到本地存储
- [ ] 网络恢复后自动同步

## 🎯 下一步操作

测试通过后，可以进行：
1. **真机测试**: 使用预览功能在手机上测试
2. **性能测试**: 检查响应时间和用户体验
3. **压力测试**: 多用户并发测试
4. **准备发布**: 提交审核前的最终检查

## 📞 获取帮助

如果测试过程中遇到问题：
1. 记录完整的错误信息
2. 截图控制台日志
3. 提供操作复现步骤
4. 描述预期和实际结果差异

---

🎉 **现在开始你的测试环境连接测试吧！** 🎉