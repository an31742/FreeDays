# 🚀 Next.js 本地开发环境配置指南

## 📋 当前状态确认

✅ **Next.js 14.0.4** 已启动在 `http://localhost:3000`  
✅ **环境变量文件**: `.env` 已配置  
✅ **小程序API配置**: 已指向本地环境  

## 🔧 微信开发者工具配置

### 关键步骤（必须完成）

1. **打开微信开发者工具**
2. **点击右上角"详情"按钮**
3. **切换到"本地设置"标签**
4. **勾选以下选项**：
   ```
   ☑️ 不校验合法域名、web-view(业务域名)、TLS版本以及HTTPS证书
   ```
5. **重新编译项目**

## 🧪 连接测试

### 快速测试（在开发者工具控制台运行）

```javascript
// 测试基础连接
wx.request({
  url: 'http://localhost:3000/api/health',
  success: (res) => {
    console.log('✅ Next.js连接成功:', res);
    console.log('现在可以开始开发了！');
  },
  fail: (err) => {
    console.error('❌ 连接失败:', err);
    console.log('请检查域名配置或API路由');
  }
});
```

### 完整测试
将 `test/nextjs-local-connection.js` 文件内容复制到控制台运行完整测试。

## 📁 Next.js API 路由结构

确保你的Next.js项目中有以下API路由：

```
your-nextjs-project/
├── pages/api/          # Pages Router (Next.js 12及以下)
│   ├── health.js
│   ├── auth/
│   │   └── login.js
│   └── transactions/
│       └── index.js
│
或
│
├── app/api/           # App Router (Next.js 13+)
│   ├── health/
│   │   └── route.js
│   ├── auth/
│   │   └── login/
│   │       └── route.js
│   └── transactions/
│       └── route.js
```

## 🔑 环境变量配置

确保 `.env` 或 `.env.local` 文件包含：

```bash
# 微信小程序配置
WECHAT_APP_ID=wx37031fe607647fa3
WECHAT_APP_SECRET=029874ac1aee76391bc7c7f8bcc7f40a

# Next.js配置
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# 数据库配置（根据实际情况）
DATABASE_URL=your_database_connection_string

# JWT配置
JWT_SECRET=your_jwt_secret_key
```

## 🌐 CORS 配置示例

在Next.js API路由中配置CORS：

```javascript
// pages/api/auth/login.js 或 app/api/auth/login/route.js
export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 你的API逻辑
  if (req.method === 'POST') {
    // 处理登录逻辑
  }
}
```

## 🎯 开发工作流

### 1. 启动服务
```bash
# Next.js已启动
npm run dev
# 或
yarn dev
```

### 2. 开发循环
1. **修改Next.js代码** → 自动热重载
2. **修改小程序代码** → 自动编译
3. **查看效果** → 实时预览
4. **调试问题** → 查看控制台日志

### 3. 调试工具
- **Next.js控制台**: 查看服务器日志
- **微信开发者工具Network**: 监控API请求
- **微信开发者工具Console**: 查看前端日志
- **浏览器**: 访问 http://localhost:3000 查看Next.js页面

## ❗ 常见问题解决

### 问题1: "url not in domain list"
**解决**: 按照上述步骤配置微信开发者工具域名设置

### 问题2: "404 Not Found"
**原因**: API路由未实现
**解决**: 检查Next.js中的API文件结构

### 问题3: "500 Internal Server Error"  
**原因**: 服务器代码错误
**解决**: 查看Next.js控制台错误日志

### 问题4: "CORS错误"
**原因**: 跨域配置问题
**解决**: 按照上述CORS配置示例设置

### 问题5: "环境变量未生效"
**原因**: 环境变量配置错误
**解决**: 
- 确认文件名 `.env.local`
- 重启Next.js服务器
- 检查变量名拼写

## 🚀 开始开发

现在一切都配置好了，你可以：

1. **测试微信登录流程**
2. **实现记账功能的前后端交互**
3. **调试数据存储和检索**
4. **优化用户体验**

### 开发提示

- 💡 Next.js API路由自动处理HTTP方法
- 💡 使用 `console.log` 在Next.js控制台查看后端日志
- 💡 小程序调试使用开发者工具Console面板
- 💡 数据库操作建议使用ORM或查询构建器
- 💡 JWT Token管理要注意安全性

---

🎉 **开始你的Next.js + 小程序开发之旅！** 🎉