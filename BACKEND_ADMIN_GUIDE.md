# FreeDays 小程序后台管理指南

## 📋 系统架构

```
┌─────────────────────┐
│  FreeDays 小程序     │  ← 用户使用
│  (微信小程序)        │
└──────────┬──────────┘
           │
           │ 微信登录 + 记账数据
           ▼
┌─────────────────────┐
│   Next.js API       │  ← 后端服务
│   (next-api)        │
└──────────┬──────────┘
           │
           │ 管理接口
           ▼
┌─────────────────────┐
│  vite-app 后台管理   │  ← 管理员使用
│  (Vue3 + Element)   │
└─────────────────────┘
```

## 🎯 后台管理功能

### 1. 用户管理 (`/accounting/admin`)

**功能**：
- ✅ 查看所有小程序用户列表
- ✅ 查看用户的收入、支出、余额
- ✅ 查看用户的交易笔数
- ✅ 查看用户注册时间
- ✅ 查看单个用户的详细交易记录
- ✅ 重置用户数据
- ✅ 删除用户

**API**：`GET /api/admin/users-stats`

### 2. 用户交易记录 (`/accounting/user-transactions`)

**功能**：
- ✅ 查看指定用户的所有交易记录
- ✅ 按日期、类型筛选
- ✅ 查看交易详情

**API**：`GET /api/admin/user-transactions?userId=xxx`

### 3. 系统统计

**功能**：
- ✅ 用户总数
- ✅ 交易记录总数
- ✅ 系统总收入
- ✅ 系统总支出

## 🔑 登录方式

### 管理员登录

**接口**：`POST /api/login`

```bash
# 当前硬编码的管理员账号
用户名: admin
密码: 12345
```

**返回**：
```json
{
  "code": 200,
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "userId": "admin_1",
      "name": "admin",
      "role": ["admin", "super-management"],
      "isAdmin": true
    }
  }
}
```

## 📊 数据流程

### 小程序用户注册流程

1. 用户在小程序中点击登录
2. 小程序调用 `wx.login()` 获取 code
3. 小程序发送 code 到 `/api/auth/login`
4. 后端调用微信接口获取 openid
5. 后端创建或查找用户记录
6. 返回 JWT token 给小程序

### 后台查看用户流程

1. 管理员登录后台（用户名密码）
2. 访问 `/accounting/admin` 页面
3. 后台调用 `/api/admin/users-stats`
4. 显示所有小程序用户列表

## 🔧 当前配置

### Next.js API (next-api)

**端口**：9527  
**数据库**：MongoDB  
**集合**：
- `users` - 小程序用户
- `transactions` - 交易记录
- `categories` - 分类

### Vite-app 后台

**端口**：5173  
**API 地址**：http://localhost:9527  
**路由**：
- `/login` - 登录页
- `/accounting/admin` - 用户管理
- `/accounting/user-transactions` - 用户交易记录

## ✅ 已完成的功能

- [x] 小程序微信登录
- [x] 用户数据隔离
- [x] 后台查看所有用户
- [x] 后台查看用户交易记录
- [x] 用户数据统计
- [x] 管理员权限控制

## 🚀 启动步骤

### 1. 启动后端 API

```bash
cd next-api
npm install
npm run dev
# 运行在 http://localhost:9527
```

### 2. 启动后台管理

```bash
cd vite-app
npm install
npm run dev
# 运行在 http://localhost:5173
```

### 3. 登录后台

访问 http://localhost:5173  
用户名: `admin`  
密码: `12345`

### 4. 查看用户

登录后访问：http://localhost:5173/#/accounting/admin

## 📝 API 列表

### 小程序相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 小程序微信登录 |
| `/api/transactions` | GET/POST | 交易记录 |
| `/api/categories` | GET | 分类列表 |
| `/api/statistics/*` | GET | 统计数据 |

### 后台管理相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/login` | POST | 后台管理员登录 |
| `/api/admin/users-stats` | GET | 获取所有用户统计 |
| `/api/admin/user-transactions` | GET | 获取用户交易记录 |
| `/api/user/reset-transactions` | POST | 重置用户数据 |
| `/api/admin/batch-initialize` | POST | 批量初始化 |
| `/api/clear-data` | POST | 清空数据库 |

## 🔐 权限说明

### 管理员权限

- 查看所有用户
- 查看所有交易记录
- 重置用户数据
- 删除用户
- 系统管理

### 普通用户权限

- 只能查看自己的数据
- 只能管理自己的交易记录

## 📌 注意事项

1. **数据隔离**：小程序用户之间数据完全隔离
2. **管理员账号**：当前硬编码，建议改为数据库存储
3. **密码安全**：建议使用 bcrypt 加密
4. **生产环境**：需要配置 HTTPS 和环境变量

## 🔄 下一步优化建议

1. **管理员账号数据库化**
   - 将管理员账号存储到数据库
   - 支持多个管理员
   - 密码加密存储

2. **权限细化**
   - 添加角色管理
   - 不同管理员不同权限
   - 操作日志记录

3. **数据导出**
   - 导出用户数据
   - 导出交易记录
   - 生成报表

4. **实时监控**
   - 用户活跃度
   - 交易趋势
   - 系统性能

## 📞 问题排查

### 后台看不到用户

**检查**：
1. 小程序是否有用户登录过
2. 数据库连接是否正常
3. API 接口是否返回数据

```bash
# 测试 API
curl http://localhost:9527/api/admin/users-stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 管理员登录失败

**检查**：
1. 用户名密码是否正确（admin/12345）
2. 后端服务是否启动
3. 浏览器控制台是否有错误

### 数据不同步

**检查**：
1. 小程序和后台是否连接同一个数据库
2. 环境变量配置是否正确
3. MongoDB 连接字符串是否一致
