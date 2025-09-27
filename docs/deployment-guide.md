# 小程序部署指南

## 配置步骤

### 1. 配置小程序AppID
在 `project.config.json` 文件中，将 `appid` 替换为你的真实AppID：

```json
{
  "appid": "你的实际AppID"
}
```

### 2. 配置API地址
在 `config/api.js` 文件中，配置后端API地址：

```javascript
// 开发环境（本地测试）
development: {
  baseURL: 'http://localhost:3000/api',  // 你的本地后端地址
  timeout: 10000,
  debug: true
},

// 生产环境
production: {
  baseURL: 'https://your-api-domain.com/api',  // 你的线上后端地址
  timeout: 10000,
  debug: false
}
```

### 3. 环境切换
在 `config/api.js` 中修改环境变量：
- 开发阶段：`const env = 'development';`
- 生产部署：`const env = 'production';`

### 4. 后端配置要求
确保后端已配置以下环境变量：
- `WECHAT_APP_ID`: 微信小程序AppID
- `WECHAT_APP_SECRET`: 微信小程序AppSecret

### 5. 测试连接
1. 启动后端服务
2. 在微信开发者工具中打开小程序
3. 查看控制台确认API连接状态

## 功能特性

### 在线/离线模式
- **在线模式**: 数据同步到服务器，支持多设备同步
- **离线模式**: 数据存储在本地，网络恢复后自动同步

### 数据同步机制
- 新增/编辑交易时优先调用API，失败时保存到本地并标记待同步
- 删除交易时优先从API删除，失败时本地标记为已删除待同步
- 应用启动时自动同步本地待同步数据

### 接口对接状态
✅ 用户登录认证  
✅ 交易记录CRUD  
✅ 统计数据获取  
✅ 数据同步机制  
✅ 错误处理和降级  

## 测试建议

1. **离线测试**: 关闭网络，测试本地功能
2. **在线测试**: 连接网络，测试API调用
3. **同步测试**: 离线操作后恢复网络，测试数据同步
4. **错误处理**: 模拟网络异常，测试降级机制