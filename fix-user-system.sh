#!/bin/bash

# FreeDays 用户系统修复脚本
# 用于快速修复用户系统问题

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FreeDays 用户系统修复工具"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    exit 1
fi

# 检查 MongoDB
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "⚠️  警告: 未检测到 MongoDB 客户端"
    echo "   请确保 MongoDB 服务正在运行"
fi

echo "请选择操作："
echo "1. 迁移用户表结构（添加新字段）"
echo "2. 初始化管理员账号"
echo "3. 查看用户统计"
echo "4. 全部执行（推荐）"
echo ""
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔄 开始迁移用户表结构..."
        node migrate-user-schema.js
        ;;
    2)
        echo ""
        echo "👤 开始初始化管理员账号..."
        node init-admin-user.js
        ;;
    3)
        echo ""
        echo "📊 查询用户统计..."
        node -e "
        const { MongoClient } = require('mongodb');
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const dbName = process.env.DB_NAME || 'freedays';
        
        (async () => {
          const client = new MongoClient(uri);
          await client.connect();
          const db = client.db(dbName);
          const users = await db.collection('users').find({}).toArray();
          
          console.log('总用户数:', users.length);
          console.log('管理员:', users.filter(u => u.isAdmin).length);
          console.log('普通用户:', users.filter(u => !u.isAdmin).length);
          console.log('有密码的用户:', users.filter(u => u.password).length);
          
          await client.close();
        })();
        "
        ;;
    4)
        echo ""
        echo "🚀 开始完整修复流程..."
        echo ""
        echo "步骤 1/2: 迁移用户表结构"
        node migrate-user-schema.js
        echo ""
        echo "步骤 2/2: 初始化管理员账号"
        node init-admin-user.js
        echo ""
        echo "✅ 修复完成！"
        ;;
    *)
        echo "❌ 无效的选项"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  操作完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
