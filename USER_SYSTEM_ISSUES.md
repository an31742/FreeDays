# FreeDays 项目用户系统问题分析与解决方案

## 📊 当前架构

```
┌─────────────────┐         ┌──────────────────┐
│  小程序前端      │         │  后台管理前端     │
│  (FreeDays)     │         │  (vite-app)      │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │ 微信登录(code)             │ 用户名密码
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────┐
│           Next.js API (next-api)            │
├─────────────────────────────────────────────┤
│  /api/auth/login    │  /api/login          │
│  (微信登录)          │  (用户名密码登录)      │
└─────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────┐
│              MongoDB 数据库                  │
├─────────────────────────────────────────────┤
│  users 集合 (小程序用户)                     │
│  - openid (微信唯一标识)                     │
│  - nickname                                 │
│  - avatar                                   │
│  - isAdmin: false (默认)                    │
└─────────────────────────────────────────────┘
```

## 🔴 核心问题

### 1. 两套独立的登录系统

**小程序登录** (`/api/auth/login`)
```typescript
// 使用微信 code 获取 openid
POST /api/auth/login
{
  "code": "微信登录凭证"
}

// 返回
{
  "access_token": "JWT token",
  "user": {
    "id": "user_xxx",
    "openid": "wx_openid_xxx",
    "nickname": "用户xxx",
    "isAdmin": false  // 固定为 false
  }
}
```

**后台管理登录** (`/api/login`)
```typescript
// 使用用户名密码
POST /api/login
{
  "name": "admin",
  "password": "12345"
}

// 硬编码的 admin 账号
if (name === "admin" && password === "12345") {
  return {
    token: "JWT token",
    user: {
      userId: "admin_1",
      role: ["admin", "super-management"],
      isAdmin: true
    }
  }
}

// 或者使用小程序用户的 nickname/openid 登录
// 但密码固定为 "12345"
```

### 2. 用户数据不统一

- **小程序用户**：存储在数据库，有完整的用户信息
- **管理员账号**：硬编码在代码中，没有数据库记录
- **权限字段**：小程序用户的 `isAdmin` 字段无法修改

### 3. 安全隐患

- 所有用户的密码都是 "12345"（硬编码）
- 管理员账号硬编码，无法动态管理
- 小程序用户可以直接用 openid 登录后台

## 💡 解决方案

### 方案一：统一用户系统（推荐）

#### 1. 扩展用户表结构

```typescript
// 在 types/accounting.ts 中扩展 User 接口
interface User {
  id: string;
  openid: string;           // 微信 openid
  nickname: string;
  avatar: string;
  
  // 新增字段
  username?: string;        // 后台登录用户名（可选）
  password?: string;        // 后台登录密码（加密存储）
  role: string[];          // 角色：['user'] 或 ['admin', 'super-management']
  isAdmin: boolean;        // 是否管理员
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. 创建管理员初始化脚本

```javascript
// init-admin.js
const { getCollection } = require('./utils/db');
const bcrypt = require('bcryptjs');

async function initAdmin() {
  const usersCollection = await getCollection('users');
  
  // 检查是否已存在管理员
  const existingAdmin = await usersCollection.findOne({ 
    username: 'admin' 
  });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await usersCollection.insertOne({
      id: 'admin_1',
      openid: 'admin_openid',  // 特殊标识
      nickname: '系统管理员',
      avatar: '',
      username: 'admin',
      password: hashedPassword,
      role: ['admin', 'super-management'],
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ 管理员账号创建成功');
  }
}

initAdmin();
```

#### 3. 统一登录接口

```typescript
// /api/login/route.ts - 统一的登录接口
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { name, password } = await request.json();
  
  const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
  
  // 查找用户（支持用户名或 nickname）
  const user = await usersCollection.findOne({
    $or: [
      { username: name },
      { nickname: name }
    ]
  });
  
  if (!user) {
    return NextResponse.json({
      code: 401,
      message: '用户不存在'
    }, { status: 401 });
  }
  
  // 验证密码
  if (!user.password) {
    return NextResponse.json({
      code: 401,
      message: '该用户未设置密码，无法登录后台'
    }, { status: 401 });
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return NextResponse.json({
      code: 401,
      message: '密码错误'
    }, { status: 401 });
  }
  
  // 生成 token
  const token = jwt.sign(
    {
      userId: user.id,
      openid: user.openid,
      name: user.nickname || user.username,
      role: user.role || ['user'],
      isAdmin: user.isAdmin || false
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return NextResponse.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      user: {
        userId: user.id,
        name: user.nickname || user.username,
        role: user.role || ['user'],
        isAdmin: user.isAdmin || false
      }
    }
  });
}
```

#### 4. 添加用户管理接口

```typescript
// /api/admin/users/route.ts - 管理员管理用户
export async function PUT(request: Request) {
  // 验证管理员权限
  const user = await verifyToken(request);
  if (!user.isAdmin) {
    return NextResponse.json({
      code: 403,
      message: '无权限'
    }, { status: 403 });
  }
  
  const { userId, updates } = await request.json();
  const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
  
  // 允许管理员修改用户的 isAdmin 和 role
  await usersCollection.updateOne(
    { id: userId },
    { 
      $set: {
        isAdmin: updates.isAdmin,
        role: updates.role,
        updatedAt: new Date()
      }
    }
  );
  
  return NextResponse.json({
    code: 200,
    message: '用户权限更新成功'
  });
}
```

### 方案二：保持双系统（简单方案）

如果不想大改，可以：

1. **明确区分两个系统**
   - 小程序：纯粹的记账功能，用户只能管理自己的数据
   - 后台管理：管理员查看所有用户数据，进行系统管理

2. **改进后台登录**
   ```typescript
   // 只允许管理员登录后台
   export async function POST(request: Request) {
     const { name, password } = await request.json();
     
     // 只验证管理员账号
     if (name === "admin" && password === "your_secure_password") {
       // 返回管理员 token
     }
     
     // 移除普通用户登录后台的功能
     return NextResponse.json({
       code: 401,
       message: '无权限访问后台管理系统'
     }, { status: 401 });
   }
   ```

3. **添加用户管理页面**
   - 在 vite-app 中添加用户列表页面
   - 管理员可以查看所有小程序用户
   - 管理员可以查看每个用户的交易记录

## 🎯 推荐实施步骤

### 第一步：数据库迁移
```bash
# 1. 备份数据库
mongodump --db freedays --out ./backup

# 2. 运行迁移脚本
node migrate-user-schema.js

# 3. 初始化管理员账号
node init-admin.js
```

### 第二步：更新 API
1. 修改 `/api/login/route.ts` 使用统一登录逻辑
2. 添加密码加密功能（使用 bcryptjs）
3. 添加用户管理接口

### 第三步：更新前端
1. vite-app 登录页面保持不变
2. 添加用户管理页面（可选）
3. 更新权限控制逻辑

### 第四步：测试
1. 测试管理员登录
2. 测试小程序用户登录
3. 测试权限控制
4. 测试数据隔离

## 📝 注意事项

1. **密码安全**
   - 使用 bcrypt 加密存储密码
   - 不要在代码中硬编码密码
   - 定期更新管理员密码

2. **权限控制**
   - 所有管理接口都要验证 `isAdmin` 权限
   - 普通用户只能访问自己的数据
   - 管理员可以查看所有数据但要记录操作日志

3. **数据隔离**
   - 保持现有的用户数据隔离机制
   - 确保小程序用户之间数据完全隔离
   - 管理员查看数据时要明确标识用户

4. **向后兼容**
   - 现有小程序用户不受影响
   - 现有交易数据保持不变
   - 逐步迁移，不要一次性大改

## 🔧 快速修复（临时方案）

如果需要快速解决当前问题，可以：

```typescript
// 在 /api/login/route.ts 中
export async function POST(request: Request) {
  const { name, password } = await request.json();
  
  // 方案1：只允许 admin 登录
  if (name !== "admin" || password !== "12345") {
    return NextResponse.json({
      code: 401,
      message: '用户名或密码错误'
    }, { status: 401 });
  }
  
  // 返回管理员 token
  const token = jwt.sign(
    {
      userId: "admin_1",
      name: "admin",
      role: ["admin", "super-management"],
      isAdmin: true
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
  
  return NextResponse.json({
    code: 200,
    message: "登录成功",
    data: { token, user: { ... } }
  });
}
```

## 📚 相关文档

- [用户数据隔离文档](./next-api/README-user-data-isolation.md)
- [API 文档](./API_DOCUMENTATION.md)
- [项目说明](./PROJECT_README.md)
