# 🔒 环境变量安全配置指南

## ⚠️ 重要安全提醒

**绝对不要在代码中硬编码敏感信息！**

### 敏感信息包括：
- 微信小程序 AppSecret
- 数据库密码
- API 密钥
- JWT 密钥
- 第三方服务密钥

## 🔧 正确的配置方式

### 1. 本地开发环境

创建 `.env.local` 文件（确保添加到 .gitignore）：

```env
# 微信小程序配置
WECHAT_APP_ID=wx37031fe607647fa3
WECHAT_APP_SECRET=你的真实AppSecret

# 数据库配置
DATABASE_URL=your_database_connection_string

# JWT配置
JWT_SECRET=your_jwt_secret_key

# 其他配置
NODE_ENV=development
```

### 2. 生产环境配置 (Vercel)

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加以下环境变量：

```
Name: WECHAT_APP_ID
Value: wx37031fe607647fa3

Name: WECHAT_APP_SECRET  
Value: [你的真实AppSecret]

Name: NODE_ENV
Value: production
```

### 3. 团队协作

对于团队成员：
1. 创建 `.env.example` 文件作为模板
2. 在项目文档中说明如何获取真实密钥
3. 使用密钥管理工具（如 1Password, HashiCorp Vault）

## 🚨 安全检查清单

- [ ] ✅ 所有密钥都使用环境变量
- [ ] ✅ `.env` 文件已添加到 `.gitignore`
- [ ] ✅ 代码中没有硬编码的密钥
- [ ] ✅ 生产环境环境变量已配置
- [ ] ✅ 团队成员知道如何获取密钥

## 🔍 如何检查代码中的敏感信息

```bash
# 搜索可能的敏感信息
grep -r "secret\|password\|key\|token" --include="*.js" --include="*.md" .
grep -r "wx[a-z0-9]" --include="*.js" --include="*.md" .
```

## 📚 最佳实践

1. **使用环境变量**：所有敏感配置都通过环境变量传递
2. **定期轮换密钥**：建议每季度更换一次密钥
3. **最小权限原则**：只给必要的权限
4. **监控和审计**：定期检查密钥使用情况
5. **代码审查**：确保没有硬编码的敏感信息

## 🛠️ 紧急响应

如果发现密钥泄露：
1. 立即更换泄露的密钥
2. 检查系统是否被入侵
3. 通知团队成员
4. 更新所有使用该密钥的系统
5. 分析泄露原因并改进流程

记住：**安全是每个人的责任！** 🛡️