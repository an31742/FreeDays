# FreeDays 用户系统快速修复指南

## 🎯 问题概述

当前 FreeDays 项目存在两套独立的用户系统：
1. **小程序端**：使用微信登录（openid）
2. **后台管理端**：使用用户名密码登录

这导致用户数据管理混乱，权限控制不清晰。

## ⚡ 快速修复（5分钟）

### 方案一：只允许管理员登录后台（最简单）

如果你只想让管理员使用后台，普通小程序用户不需要登录后台：

1. **修改后台登录接口**

编辑 `next-api/app/api/login/route.ts`：

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const { name, password } = body;

  // 只允许管理员登录
  if (name === "admin" && password === "your_secure_password") {
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

  // 拒绝其他登录
  return NextResponse.json({
    code: 401,
    message: "无权限访问后台管理系统"
  }, { status: 401 });
}
```

2. **修改密码**

将 `your_secure_password` 改为你的安全密码。

3. **完成**

现在只有管理员可以登录后台，小程序用户只能使用小程序。

---

## 🔧 完整修复（30分钟）

如果你想要一个完整的用户系统，支持：
- 管理员账号存储在数据库
- 密码加密存储
- 可以动态管理用户权限

### 步骤 1：安装依赖

```bash
cd next-api
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### 步骤 2：运行修复脚本

```bash
cd FreeDays

# 给脚本添加执行权限
chmod +x fix-user-system.sh

# 运行修复脚本
./fix-user-system.sh
```

选择 `4. 全部执行`，脚本会：
1. 迁移用户表结构
2. 创建管理员账号（用户名: admin, 密码: admin123）

### 步骤 3：更新登录接口

编辑 `next-api/app/api/login/route.ts`：

```typescript
import bcrypt from 'bcryptjs';
import { getCollection } from '../../../utils/db';
import { User, COLLECTIONS } from '../../../types/accounting';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, password } = body;

  const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
  
  // 查找用户
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

### 步骤 4：更新用户类型定义

编辑 `next-api/types/accounting.ts`：

```typescript
export interface User {
  id: string;
  openid: string;
  nickname: string;
  avatar: string;
  
  // 新增字段
  username?: string;      // 后台登录用户名
  password?: string;      // 后台登录密码（加密）
  role: string[];        // 用户角色
  isAdmin: boolean;      // 是否管理员
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 步骤 5：测试

1. **测试管理员登录**
```bash
curl -X POST http://localhost:9527/api/login \
  -H "Content-Type: application/json" \
  -d '{"name":"admin","password":"admin123"}'
```

2. **登录后台管理系统**
- 访问 http://localhost:5173
- 用户名: admin
- 密码: admin123

3. **修改默认密码**（重要！）

---

## 📋 验证清单

修复完成后，请验证：

- [ ] 管理员可以登录后台
- [ ] 小程序用户可以正常使用微信登录
- [ ] 普通用户无法登录后台（如果没有设置密码）
- [ ] 数据隔离正常（用户只能看到自己的数据）
- [ ] 管理员可以查看所有用户数据

---

## 🔐 安全建议

1. **立即修改默认密码**
```bash
# 使用 MongoDB 客户端
mongosh freedays

db.users.updateOne(
  { username: "admin" },
  { $set: { password: "$2a$10$your_new_hashed_password" } }
)
```

2. **使用环境变量**
```bash
# 在 .env.local 中设置
JWT_SECRET=your_random_secret_key_here
```

3. **定期更新密码**

4. **启用 HTTPS**（生产环境）

---

## 🆘 常见问题

### Q1: 脚本运行失败，提示找不到 mongodb 模块

**解决方案**：
```bash
npm install mongodb bcryptjs
```

### Q2: 管理员登录失败

**检查**：
1. 数据库中是否有管理员记录
2. 密码是否正确
3. JWT_SECRET 是否配置

**重置管理员密码**：
```bash
node init-admin-user.js
# 选择 'y' 重置密码
```

### Q3: 小程序用户无法登录

**检查**：
1. 微信配置是否正确（WECHAT_APP_ID, WECHAT_APP_SECRET）
2. `/api/auth/login` 接口是否正常
3. 数据库连接是否正常

### Q4: 想让小程序用户也能登录后台

**解决方案**：
1. 为小程序用户设置密码
2. 在小程序中添加"设置密码"功能
3. 用户设置密码后就可以用 nickname 登录后台

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. 数据库连接是否正常
2. 环境变量是否配置正确
3. 依赖包是否安装完整

详细文档：`USER_SYSTEM_ISSUES.md`
