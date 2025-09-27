# 🚀 小程序部署完整检查清单

## 📋 配置信息确认

### ✅ 小程序信息
- **AppID**: `wx37031fe607647fa3` ✅ 已配置
- **AppSecret**: `你的微信小程序AppSecret` ⚠️ 需要配置
- **域名**: `https://next-vite-delta.vercel.app` ✅ 已知

## 🔧 部署前检查 (必须完成)

### 1. 微信公众平台配置 ⏳
- [ ] 登录 [微信公众平台](https://mp.weixin.qq.com)
- [ ] 使用AppID `wx37031fe607647fa3` 对应的账号登录
- [ ] 进入：开发 → 开发设置 → 服务器域名
- [ ] 在 **request合法域名** 中添加：`https://next-vite-delta.vercel.app`
- [ ] 保存配置

### 2. Vercel后端配置 ⏳
- [ ] 登录 [Vercel](https://vercel.com)
- [ ] 进入项目 `next-vite-delta`
- [ ] 进入 Settings → Environment Variables
- [ ] 添加环境变量：
  ```
  WECHAT_APP_ID = wx37031fe607647fa3
  WECHAT_APP_SECRET = 你的微信小程序AppSecret
  ```
- [ ] 重新部署项目

### 3. 后端CORS配置 ⏳
确保后端代码包含以下CORS配置：
```javascript
app.use(cors({
  origin: [
    'https://servicewechat.com',
    'https://developers.weixin.qq.com'
  ],
  credentials: true
}));
```

### 4. 小程序代码配置 ✅
- [x] `project.config.json` 中 appid 正确
- [x] `config/api.js` 中环境设置为 production
- [x] API域名配置正确

## 🧪 测试流程

### 第一步：基础连接测试
在微信开发者工具控制台中运行：
```javascript
// 复制以下代码到控制台
wx.request({
  url: 'https://next-vite-delta.vercel.app/api/health',
  success: (res) => console.log('✅ 连接成功:', res),
  fail: (err) => console.error('❌ 连接失败:', err)
});
```

**预期结果**: 返回200状态码和健康检查数据

### 第二步：登录功能测试
```javascript
wx.login({
  success: (loginRes) => {
    wx.request({
      url: 'https://next-vite-delta.vercel.app/api/auth/login',
      method: 'POST',
      data: { code: loginRes.code },
      success: (res) => console.log('✅ 登录成功:', res),
      fail: (err) => console.error('❌ 登录失败:', err)
    });
  }
});
```

**预期结果**: 返回包含 `access_token` 的响应

### 第三步：运行完整测试
将 `test/your-domain-test.js` 文件内容复制到控制台运行

### 第四步：功能测试
1. 测试记账功能
2. 测试查询功能
3. 测试统计功能
4. 测试数据同步

### 第五步：真机测试
1. 使用预览功能生成二维码
2. 手机扫码测试
3. 验证所有功能正常

## 🚨 常见问题解决

### 问题1: "url not in domain list"
**解决**: 确认已在微信公众平台配置域名

### 问题2: "登录失败"
**解决**: 检查Vercel环境变量是否正确配置

### 问题3: "网络请求失败"
**解决**: 
1. 检查后端服务是否正常
2. 确认CORS配置正确
3. 验证HTTPS证书有效

### 问题4: "Token验证失败"
**解决**: 检查JWT密钥和Token生成逻辑

## 📊 部署后验证

### 基础功能验证 ✅
- [ ] 用户可以正常登录
- [ ] 可以新增记账记录
- [ ] 可以查看交易列表
- [ ] 统计数据显示正常

### 高级功能验证 ✅
- [ ] 图表显示正常
- [ ] 查询功能工作正常
- [ ] 离线模式可用
- [ ] 数据同步及时

### 性能验证 📈
- [ ] API响应时间 < 2秒
- [ ] 页面加载时间 < 3秒
- [ ] 无明显卡顿现象

## 🎯 上线发布

### 提交审核前
- [ ] 所有功能测试通过
- [ ] 真机测试正常
- [ ] 性能表现良好
- [ ] 用户体验友好

### 发布流程
1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 在微信公众平台提交审核
4. 等待审核通过
5. 发布上线

## 📞 技术支持

### 配置信息确认
- **小程序名称**: FreeDays (假期倒计时与记账)
- **AppID**: wx37031fe607647fa3
- **后端域名**: https://next-vite-delta.vercel.app
- **API路径**: /api/*

### 联系方式
如需技术支持，请提供：
1. 具体错误截图
2. 控制台完整日志
3. 操作复现步骤
4. 设备和网络环境信息

---

🎉 **祝部署顺利！记账小程序即将为用户提供优质的财务管理体验！** 🎉