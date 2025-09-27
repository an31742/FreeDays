# 🌐 线上接口使用指南

## 📋 切换完成状态

✅ **API配置**: 已切换到生产环境 `https://next-vite-delta.vercel.app/api`  
⚠️ **域名配置**: 需要在微信公众平台配置  
⚠️ **环境变量**: 需要在Vercel中配置  

## 🚀 必须完成的配置

### 1. 微信公众平台域名配置（必须）

根据项目规范，需要将API域名添加到合法域名列表：

1. **登录微信公众平台**: https://mp.weixin.qq.com
2. **进入开发设置**: 开发 → 开发设置 → 服务器域名
3. **添加合法域名**: 在 `request合法域名` 中添加：
   ```
   https://next-vite-delta.vercel.app
   ```
4. **保存配置**: 点击保存并提交
5. **刷新域名信息**: 在微信开发者工具中：详情 → 域名信息 → 刷新
6. **重新编译项目**

### 2. Vercel环境变量配置（必须）

根据项目记忆，需要在Vercel平台配置环境变量：

1. **登录Vercel**: https://vercel.com
2. **进入项目**: `next-vite-delta`
3. **配置环境变量**: Settings → Environment Variables
4. **添加以下变量**:
   ```
   WECHAT_APP_ID = wx37031fe607647fa3
   WECHAT_APP_SECRET = 029874ac1aee76391bc7c7f8bcc7f40a
   ```
5. **重新部署**: 配置后需要重新部署才能生效

### 3. 在线状态管理（重要）

根据登录状态管理经验，从本地缓存过渡到后端接口时，需要确保登录状态能正确触发全局模式切换：

- 登录成功后自动设置在线状态
- 提供状态诊断和修复机制
- 确保保存操作使用正确的模式

## 🧪 连接测试

### 快速测试（在微信开发者工具控制台运行）

```javascript
// 快速域名连接测试
wx.request({
  url: 'https://next-vite-delta.vercel.app/api/health',
  success: (res) => {
    console.log('✅ 线上接口连接成功:', res);
    console.log('🎉 可以开始使用线上功能！');
  },
  fail: (err) => {
    console.error('❌ 连接失败:', err);
    if (err.errMsg.includes('url not in domain list')) {
      console.log('请先在微信公众平台配置域名');
    }
  }
});
```

### 完整测试
将 `test/production-api-test.js` 文件内容复制到控制台运行完整测试。

## ⚡ 关键差异：本地 vs 线上

### 本地开发
- ✅ API地址: `http://localhost:3000/api`
- ✅ 域名校验: 关闭校验
- ✅ 响应速度: 快速
- ✅ 调试: 实时日志

### 线上生产
- 🌐 API地址: `https://next-vite-delta.vercel.app/api`
- 🔒 域名校验: 必须配置合法域名
- ⏱️ 响应速度: 可能有延迟（冷启动）
- 📊 调试: 通过Vercel函数日志

## 🔧 状态诊断和修复

### 如果保存仍然是本地模式

在控制台运行以下诊断：

```javascript
// 诊断在线状态
const app = getApp();
console.log('在线状态:', app.isOnlineMode());
console.log('Token存在:', !!wx.getStorageSync('access_token'));
console.log('全局状态:', app.globalData.isOnline);

// 手动修复
app.setOnlineStatus(true);
console.log('修复后状态:', app.isOnlineMode());
```

### 常见问题解决

#### 问题1: "url not in domain list"
**解决**: 完成微信公众平台域名配置

#### 问题2: 登录失败或500错误
**解决**: 检查Vercel环境变量配置

#### 问题3: 请求超时
**原因**: Vercel函数冷启动
**解决**: 等待几秒重试，或者访问一次网站预热

#### 问题4: 保存仍然是本地模式
**解决**: 运行状态诊断脚本修复在线状态

## 🎯 验证成功标准

切换成功后应该看到：

1. **登录成功**: 显示"登录成功"而不是登录失败
2. **保存成功**: 显示"记账成功"而不是"记账成功(本地)"
3. **数据同步**: 多设备可以看到相同数据
4. **在线状态**: 控制台显示 `app.isOnlineMode()` 返回 `true`

## 🚀 使用建议

### 开发流程
1. **本地开发**: 使用本地环境快速开发调试
2. **功能完成**: 切换到线上环境测试
3. **发布前**: 完整测试所有功能
4. **发布后**: 监控线上使用情况

### 性能考虑
- 线上环境可能比本地慢，特别是首次访问
- Vercel函数有冷启动时间，偶尔会慢一些
- 建议在关键操作前显示加载状态

### 监控建议
- 定期检查Vercel部署状态
- 监控API调用频率
- 关注用户反馈的性能问题
- 备份重要数据

---

🎉 **现在你的小程序已连接到线上接口，可以为用户提供云端服务了！** 🎉