# ⚡ 小程序测试环境快速启动指南

## 🎯 3分钟快速开始

### 第1分钟：配置域名 (最关键!)
1. 打开 [微信公众平台](https://mp.weixin.qq.com)
2. 登录 AppID `wx37031fe607647fa3` 对应账号
3. 开发 → 开发设置 → 服务器域名
4. 在 "request合法域名" 添加：`https://next-vite-delta.vercel.app`
5. 点击保存

### 第2分钟：检查后端配置
1. 访问 [Vercel](https://vercel.com)
2. 进入 `next-vite-delta` 项目
3. Settings → Environment Variables
4. 确认包含：
   ```
   WECHAT_APP_ID = wx37031fe607647fa3
   WECHAT_APP_SECRET = 你的微信小程序AppSecret
   ```

### 第3分钟：运行测试
1. 打开微信开发者工具
2. 打开小程序项目
3. 打开控制台 (Console)
4. 复制粘贴以下代码：

```javascript
// 一键测试代码 - 复制到控制台运行
console.log('🚀 开始一键测试...');
wx.request({
  url: 'https://next-vite-delta.vercel.app/api/health',
  success: (res) => {
    console.log('✅ 连接成功!', res);
    // 测试登录
    wx.login({
      success: (loginRes) => {
        wx.request({
          url: 'https://next-vite-delta.vercel.app/api/auth/login',
          method: 'POST',
          data: { code: loginRes.code },
          success: (authRes) => {
            console.log('✅ 登录成功!', authRes);
            console.log('🎉 测试环境连接正常，可以开始使用!');
          },
          fail: (authErr) => {
            console.error('❌ 登录失败:', authErr);
            console.log('请检查后端环境变量配置');
          }
        });
      }
    });
  },
  fail: (err) => {
    console.error('❌ 连接失败:', err);
    if (err.errMsg.includes('url not in domain list')) {
      console.log('请先在微信公众平台配置域名');
    }
  }
});
```

## 🧪 完整测试 (可选)

如果需要完整测试，将以下文件内容复制到控制台：
📁 `test/test-environment-connection.js`

## ✅ 成功标准

看到以下输出表示测试成功：
```
✅ 连接成功!
✅ 登录成功!
🎉 测试环境连接正常，可以开始使用!
```

## ❌ 常见问题

### "url not in domain list"
- 域名未在微信公众平台配置
- 完成第1分钟的域名配置

### "登录失败"
- 后端环境变量配置错误
- 完成第2分钟的后端配置

### "网络请求失败"
- 后端服务未启动
- 检查 Vercel 部署状态

## 🎯 测试成功后

可以开始测试以下功能：
1. ✅ 记账功能
2. ✅ 查询统计
3. ✅ 数据同步
4. ✅ 离线模式

---

🚀 **现在开始你的3分钟快速测试！**