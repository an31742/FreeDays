#!/usr/bin/env node

/**
 * 用户表结构迁移脚本
 * 为现有用户添加新字段：username, password, role, isAdmin
 */

const { MongoClient } = require('mongodb');

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'freedays';

async function migrateUserSchema() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 连接数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // 获取所有用户
    const users = await usersCollection.find({}).toArray();
    console.log(`📊 找到 ${users.length} 个用户`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      const updates = {};
      
      // 添加 role 字段（如果不存在）
      if (!user.role) {
        updates.role = ['user'];
      }
      
      // 添加 isAdmin 字段（如果不存在）
      if (user.isAdmin === undefined) {
        updates.isAdmin = false;
      }
      
      // 如果有更新，执行更新操作
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updates }
        );
        
        updatedCount++;
        console.log(`✅ 更新用户: ${user.nickname || user.id}`);
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 迁移完成！共更新 ${updatedCount} 个用户`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 显示迁移后的统计
    const stats = await usersCollection.aggregate([
      {
        $group: {
          _id: '$isAdmin',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('📊 用户统计：');
    stats.forEach(stat => {
      const type = stat._id ? '管理员' : '普通用户';
      console.log(`   ${type}: ${stat.count} 人`);
    });
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行脚本
migrateUserSchema();
