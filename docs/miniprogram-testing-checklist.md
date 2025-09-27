# 🚀 小程序真实域名测试完整清单

## 🎯 测试目标
使用真实域名 `https://next-vite-delta.vercel.app` 进行小程序API对接测试

## 📋 配置检查清单 (测试前必做)

### ✅ 1. 微信公众平台配置
1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入：开发 → 开发设置 → 服务器域名
3. 在 **request合法域名** 中添加：
   ```
   https://next-vite-delta.vercel.app
   ```
4. 保存配置（注意：每月只能修改5次）

### ✅ 2. 小程序代码配置
确认以下文件配置正确：

**project.config.json** ✅ 已配置
```json
{
  "appid": "wx37031fe607647fa3"  // ✅ 正确的AppID
}
```

**config/api.js** (已配置)
```javascript
const env = 'production';  // ✅ 已切换到生产环境
```

### ✅ 3. 后端服务检查
确认后端已部署并包含以下配置：

**环境变量** ✅ 已知配置
```bash
WECHAT_APP_ID=wx37031fe607647fa3
WECHAT_APP_SECRET=029874ac1aee76391bc7c7f8bcc7f40a
```

**CORS配置**
```javascript
app.use(cors({
  origin: [
    'https://servicewechat.com',
    'https://developers.weixin.qq.com'
  ],
  credentials: true
}));
```

## 🧪 分阶段测试方案

### 第一阶段：基础连通性测试

#### 1.1 在微信开发者工具中测试
打开调试器控制台，执行：

```javascript
// 测试基础API连接
wx.request({
  url: 'https://next-vite-delta.vercel.app/api/health',
  method: 'GET',
  success: (res) => {
    console.log('✅ API连接成功:', res);
  },
  fail: (err) => {
    console.error('❌ API连接失败:', err);
    console.log('可能原因：');
    console.log('1. 域名未在微信公众平台配置');
    console.log('2. 后端服务未启动');
    console.log('3. CORS配置问题');
  }
});
```

#### 1.2 测试登录接口
```javascript
// 测试微信登录
wx.login({
  success: (loginRes) => {
    console.log('微信登录码获取成功:', loginRes.code);
    
    wx.request({
      url: 'https://next-vite-delta.vercel.app/api/auth/login',
      method: 'POST',
      data: { code: loginRes.code },
      success: (res) => {
        console.log('✅ 登录接口成功:', res);
        console.log('Token:', res.data.access_token);
      },
      fail: (err) => {
        console.error('❌ 登录接口失败:', err);
      }
    });
  },
  fail: (err) => {
    console.error('微信登录失败:', err);
  }
});
```

### 第二阶段：小程序应用测试

#### 2.1 启动小程序
1. 在微信开发者工具中编译运行
2. 观察启动日志
3. 检查自动登录是否成功

#### 2.2 记账功能测试
1. **新增记录测试**
   - 点击快速记账按钮
   - 输入金额和备注
   - 保存并观察网络请求
   - 确认数据同步到服务器

2. **查看记录测试**
   - 查看最近交易列表
   - 检查数据是否从API加载
   - 验证显示格式正确

3. **编辑删除测试**
   - 编辑一条记录
   - 删除一条记录
   - 确认操作同步到服务器

#### 2.3 统计查询测试
1. 查看月度统计
2. 使用日/月/年查询功能
3. 验证图表数据加载

### 第三阶段：异常场景测试

#### 3.1 网络异常测试
1. 关闭网络连接
2. 进行记账操作
3. 确认降级到本地存储
4. 恢复网络连接
5. 检查数据自动同步

#### 3.2 真机测试
1. 使用预览功能生成二维码
2. 在真实手机上测试
3. 验证所有功能正常

## 🔍 问题排查指南

### 常见错误及解决方案

#### 错误1：域名不在合法域名列表中
**现象**: `url not in domain list`
**解决**: 确认已在微信公众平台配置域名

#### 错误2：SSL证书问题
**现象**: `SSL certificate problem`
**解决**: 检查域名HTTPS证书有效性

#### 错误3：CORS跨域错误
**现象**: `Access-Control-Allow-Origin`
**解决**: 后端配置正确的CORS头

#### 错误4：接口404错误
**现象**: `404 Not Found`
**解决**: 确认API路径正确，后端服务正常

#### 错误5：登录失败
**现象**: `登录接口返回错误`
**解决**: 检查AppID和AppSecret配置

## 📊 测试记录表

| 测试项目 | 预期结果 | 实际结果 | 状态 | 备注 |
|---------|---------|---------|------|------|
| 域名配置 | 已配置 |  | ⏳ |  |
| API连接 | 200响应 |  | ⏳ |  |
| 微信登录 | 获取Token |  | ⏳ |  |
| 新增记录 | 保存成功 |  | ⏳ |  |
| 查询记录 | 显示数据 |  | ⏳ |  |
| 编辑记录 | 更新成功 |  | ⏳ |  |
| 删除记录 | 删除成功 |  | ⏳ |  |
| 统计查询 | 显示图表 |  | ⏳ |  |
| 离线模式 | 本地存储 |  | ⏳ |  |
| 数据同步 | 自动同步 |  | ⏳ |  |
| 真机测试 | 功能正常 |  | ⏳ |  |

## 🎯 成功标准

### 基础功能 (必须通过)
- ✅ API连接正常
- ✅ 用户登录成功
- ✅ 记账功能完整
- ✅ 数据查询正常

### 高级功能 (建议通过)
- ✅ 图表显示正常
- ✅ 离线模式可用
- ✅ 数据同步及时
- ✅ 错误处理友好

### 性能指标 (参考标准)
- API响应时间 < 2秒
- 页面加载时间 < 3秒
- 数据同步时间 < 5秒

## 🚀 测试完成后

1. **记录测试结果**
2. **收集用户反馈**
3. **优化问题点**
4. **准备上线发布**

## 📞 技术支持

测试过程中如遇到问题，请提供：
1. 具体错误信息截图
2. 微信开发者工具控制台日志
3. 网络请求详情
4. 操作复现步骤

祝测试顺利！🎉