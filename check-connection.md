# 数据连接问题诊断

## 🔴 问题原因

**小程序和后台管理连接的不是同一个数据库！**

### 之前的配置

```
小程序 (FreeDays)
  ↓ 连接
https://next-vite-delta.vercel.app/api (线上 Vercel)
  ↓ 使用
MongoDB 线上数据库

后台管理 (vite-app)
  ↓ 连接
http://localhost:9527/api (本地 next-api)
  ↓ 使用
MongoDB 本地或不同的数据库
```

**结果**：小程序的数据存在线上，后台管理看的是本地数据，所以看不到！

## ✅ 解决方案

### 方案一：都使用本地环境（推荐开发时）

**已修改**：`FreeDays/config/api.js`

```javascript
const env = 'development'; // 改为 development
baseURL: 'http://localhost:9527/api'  // 连接本地
```

**步骤**：

1. **启动本地后端**
```bash
cd next-api
npm run dev
# 确保运行在 http://localhost:9527
```

2. **重新编译小程序**
```
在微信开发者工具中点击"编译"
```

3. **测试小程序**
```
在小程序中添加一笔交易记录
```

4. **查看后台**
```
访问 http://localhost:5173/#/accounting/admin
应该能看到刚才添加的数据
```

### 方案二：都使用线上环境（推荐生产时）

**修改后台管理的 API 地址**：

编辑 `vite-app/.env.local`：
```bash
VITE_API_BASE_URL=https://next-vite-delta.vercel.app
```

**注意**：这样后台管理也会连接线上数据库。

## 🔍 验证连接

### 检查小程序连接

在小程序 `app.js` 的 `autoLogin` 方法中查看日志：
```javascript
console.log('API baseURL:', apiService.baseURL);
// 应该显示: http://localhost:9527/api
```

### 检查后台连接

在浏览器控制台查看网络请求：
```
Network → XHR → 查看请求地址
应该是: http://localhost:9527/api/admin/users-stats
```

### 检查数据库

```bash
# 查看本地数据库
mongosh
use accounting_app
db.users.find()
db.transactions.find()
```

## 📋 完整测试流程

1. **启动本地后端**
```bash
cd next-api
npm run dev
```

2. **启动后台管理**
```bash
cd vite-app
npm run dev
```

3. **打开小程序**
```
微信开发者工具 → 编译 → 运行
```

4. **在小程序中操作**
```
- 登录（自动）
- 添加一笔收入：100元
- 添加一笔支出：50元
```

5. **查看后台**
```
访问: http://localhost:5173
登录: admin / 12345
进入: 系统管理页面
```

6. **验证数据**
```
应该能看到：
- 用户列表中有你的小程序用户
- 收入：100
- 支出：50
- 余额：50
```

## 🚨 常见问题

### Q1: 小程序提示"网络连接失败"

**原因**：本地后端没启动或端口不对

**解决**：
```bash
# 检查后端是否运行
curl http://localhost:9527/api/health

# 如果失败，启动后端
cd next-api
npm run dev
```

### Q2: 小程序能用，但后台看不到数据

**原因**：小程序还在连接线上环境

**解决**：
1. 确认 `config/api.js` 中 `env = 'development'`
2. 在微信开发者工具中点击"编译"
3. 清除小程序缓存：开发者工具 → 清缓存 → 全部清除

### Q3: 后台能看到用户，但没有交易记录

**原因**：用户是之前创建的，交易记录在线上

**解决**：
1. 在小程序中重新添加交易记录
2. 或者导出线上数据导入本地

### Q4: 想同时支持本地和线上

**解决**：在小程序中添加环境切换

```javascript
// config/api.js
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
```

## 📝 环境配置总结

### 开发环境（本地测试）

```
小程序 → http://localhost:9527/api → 本地 MongoDB
后台   → http://localhost:9527/api → 本地 MongoDB
✅ 数据同步
```

### 生产环境（线上部署）

```
小程序 → https://next-vite-delta.vercel.app/api → 线上 MongoDB
后台   → https://next-vite-delta.vercel.app/api → 线上 MongoDB
✅ 数据同步
```

### 混合环境（不推荐）

```
小程序 → 线上 API → 线上 MongoDB
后台   → 本地 API → 本地 MongoDB
❌ 数据不同步
```

## 🎯 下一步

1. ✅ 已修改小程序配置为本地环境
2. 🔄 重新编译小程序
3. 🧪 测试数据同步
4. 📊 验证后台能看到数据

完成后，你应该能在后台看到小程序的所有操作数据了！
