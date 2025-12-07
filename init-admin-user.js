#!/usr/bin/env node

/**
 * 初始化管理员账号脚本
 * 用于创建后台管理系统的管理员账号
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'freedays';

async function initAdminUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 连接数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // 检查是否已存在管理员
    const existingAdmin = await usersCollection.findOne({ 
      username: 'admin' 
    });
    
    if (existingAdmin) {
      console.log('⚠️  管理员账号已存在');
      console.log('用户ID:', existingAdmin.id);
      console.log('用户名:', existingAdmin.username);
      console.log('昵称:', existingAdmin.nickname);
      
      // 询问是否重置密码
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('是否重置管理员密码？(y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          const newPassword = await bcrypt.hash('admin123', 10);
          await usersCollection.updateOne(
            { username: 'admin' },
            { 
              $set: { 
                password: newPassword,
                updatedAt: new Date()
              }
            }
          );
          console.log('✅ 管理员密码已重置为: admin123');
        }
        readline.close();
        await client.close();
      });
      
      return;
    }
    
    // 创建管理员账号
    console.log('📝 创建管理员账号...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      id: 'admin_' + Date.now(),
      openid: 'admin_openid_system',  // 特殊标识
      nickname: '系统管理员',
      avatar: '',
      username: 'admin',
      password: hashedPassword,
      role: ['admin', 'super-management'],
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await usersCollection.insertOne(adminUser);
    
    console.log('✅ 管理员账号创建成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 管理员账号信息：');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   角色: 超级管理员');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  请及时修改默认密码！');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行脚本
initAdminUser();
