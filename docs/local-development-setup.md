# 🏠 本地开发环境设置指南

## 📋 前提条件

### 后端服务要求
- Node.js 环境
- 后端服务运行在 `http://localhost:3000`
- 配置了正确的环境变量

### 小程序配置
- AppID: `wx37031fe607647fa3`
- 已配置API连接本地环境

## 🚀 快速开始

### 步骤1: 启动本地后端服务

```bash
# 进入后端项目目录
cd your-backend-project

# 安装依赖
npm install

# 配置环境变量（创建.env文件）
echo "WECHAT_APP_ID=wx37031fe607647fa3" >> .env
echo "WECHAT_APP_SECRET=029874ac1aee76391bc7c7f8bcc7f40a" >> .env
echo "PORT=3000" >> .env

# 启动开发服务器
npm run dev
# 或者
npm start
```

### 步骤2: 配置微信开发者工具

#### 方案A: 关闭域名校验（推荐）
1. 打开微信开发者工具
2. 点击右上角 **"详情"**
3. 切换到 **"本地设置"** 标签
4. 勾选 **"不校验合法域名、web-view(业务域名)、TLS版本以及HTTPS证书"**
5. 重新编译项目

#### 方案B: 配置微信公众平台
1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 开发 → 开发设置 → 服务器域名
3. 在 request合法域名 添加: `http://localhost:3000`

### 步骤3: 验证连接

在微信开发者工具控制台中运行：
```javascript
// 快速连接测试
wx.request({
  url: 'http://localhost:3000/api/health',
  success: (res) => console.log('✅ 本地连接成功:', res),
  fail: (err) => console.error('❌ 连接失败:', err)
});
```

或者运行完整测试脚本：
```javascript
// 复制 test/local-backend-connection.js 内容到控制台
```

## 🔧 环境配置详情

### 当前API配置
```javascript
// config/api.js
development: {
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  debug: true
}
```

### 必需的后端环境变量
```bash
# 微信小程序配置
WECHAT_APP_ID=wx37031fe607647fa3
WECHAT_APP_SECRET=029874ac1aee76391bc7c7f8bcc7f40a

# 服务配置
PORT=3000
NODE_ENV=development

# 数据库配置（根据实际情况）
DB_HOST=localhost
DB_PORT=3306
DB_NAME=freedays_db
DB_USER=your_username
DB_PASS=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key
```

### 后端CORS配置示例
```javascript
// 后端需要配置CORS允许小程序访问
app.use(cors({
  origin: [
    'http://localhost',
    'https://servicewechat.com',
    'https://developers.weixin.qq.com'
  ],
  credentials: true
}));
```

## 🧪 测试功能

### 基础连接测试
- ✅ 本地服务器连通性
- ✅ 域名配置验证
- ✅ API健康检查

### 功能测试
- ✅ 微信登录认证
- ✅ 交易记录CRUD
- ✅ 统计数据获取
- ✅ 数据同步功能

### 调试工具
1. **Network面板**: 查看API请求详情
2. **Console面板**: 查看日志和错误
3. **后端日志**: 实时监控服务器响应
4. **数据库工具**: 验证数据存储

## ❗ 常见问题

### 问题1: "url not in domain list"
**解决**: 按照步骤2配置域名或关闭校验

### 问题2: "连接被拒绝"
**原因**: 本地服务器未启动
**解决**: 确保后端服务运行在3000端口

### 问题3: "登录失败"
**原因**: 环境变量配置错误
**解决**: 检查AppID和AppSecret配置

### 问题4: "CORS错误"
**原因**: 后端未配置跨域
**解决**: 添加CORS中间件配置

### 问题5: "数据库连接失败"
**原因**: 数据库配置错误
**解决**: 检查数据库连接字符串和权限

## 🎯 开发流程

### 典型开发流程
1. **启动后端服务** - 运行在localhost:3000
2. **启动小程序** - 微信开发者工具
3. **编写代码** - 实时查看效果
4. **测试功能** - 验证前后端交互
5. **查看日志** - 调试和优化

### 代码热重载
- 小程序代码修改后自动编译
- 后端使用nodemon实现热重载
- 数据库操作实时同步

### 调试技巧
- 使用console.log在关键位置打印日志
- 通过Network面板监控API请求
- 在后端添加请求日志中间件
- 使用数据库管理工具查看数据变化

## 📞 获取帮助

### 检查清单
- [ ] 后端服务启动在3000端口
- [ ] 环境变量配置正确
- [ ] 微信开发者工具域名设置
- [ ] 数据库连接正常
- [ ] CORS配置正确

### 调试命令
```bash
# 检查端口占用
lsof -i :3000

# 查看后端日志
tail -f backend.log

# 测试API接口
curl http://localhost:3000/api/health
```

### 联系信息
如遇到问题，请提供：
1. 错误信息截图
2. 后端控制台日志
3. 微信开发者工具Network面板截图
4. 具体的操作步骤

---

🎉 **现在开始你的本地开发之旅！** 🎉