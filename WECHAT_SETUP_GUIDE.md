# 微信小程序配置完整指南

## 🎯 配置目标

为后端接口获取必要的微信小程序凭证：
- `WECHAT_APP_ID`：小程序的唯一标识符
- `WECHAT_APP_SECRET`：小程序的密钥，用于服务端API调用

## 📋 准备工作

### **所需资料**
- 企业营业执照（企业主体）或个人身份证（个人主体）
- 手机号码
- 邮箱地址
- 微信号（用于管理员验证）

## 🔧 详细配置步骤

### **第一步：注册微信小程序**

#### 1.1 访问微信公众平台
- 浏览器打开：https://mp.weixin.qq.com/
- 点击右上角"立即注册"

#### 1.2 选择注册类型
- 选择"小程序"
- 填写邮箱地址（注意：每个邮箱只能注册一个账号）
- 设置密码
- 点击"注册"

#### 1.3 邮箱验证
- 登录邮箱查收验证邮件
- 点击邮件中的确认链接

#### 1.4 信息登记
**个人主体：**
- 姓名：真实姓名
- 身份证号：真实身份证号
- 手机号：常用手机号

**企业主体：**
- 企业名称：营业执照上的企业名称
- 营业执照注册号：18位统一社会信用代码
- 企业开户银行：对公账户开户银行
- 对公账户：企业对公银行账户

#### 1.5 管理员信息
- 管理员姓名
- 手机号码
- 微信号（用于后续验证）

### **第二步：获取 AppID (WECHAT_APP_ID)**

#### 2.1 登录小程序后台
- 访问：https://mp.weixin.qq.com/
- 用注册的邮箱和密码登录

#### 2.2 获取 AppID
1. 进入小程序管理后台
2. 点击左侧菜单"开发" → "开发管理" → "开发设置"
3. 在"开发者ID"区域找到"AppID(小程序)"
4. 复制 AppID 值

```
示例：wx1a2b3c4d5e6f7890
```

### **第三步：获取 AppSecret (WECHAT_APP_SECRET)**

#### 3.1 生成 AppSecret
1. 在同一页面的"开发者ID"区域
2. 找到"AppSecret(小程序)"
3. 如果是新注册的小程序，点击"生成"
4. 如果已经有了，点击"重置"（可选）

#### 3.2 身份验证
- 使用管理员微信扫描页面上的二维码
- 在微信中确认身份验证

#### 3.3 获取密钥
- 验证成功后，AppSecret 会显示在页面上
- **立即复制保存**（页面刷新后将无法再次查看）

```
示例：a1b2c3d4e5f6789012345678901234567890abcd
```

### **第四步：服务器域名配置**

#### 4.1 设置服务器域名
1. 在"开发设置"页面找到"服务器域名"
2. 配置以下域名（根据你的实际服务器地址）：
   - **request合法域名**：`https://your-api-domain.com`
   - **socket合法域名**：（如果使用WebSocket）
   - **uploadFile合法域名**：（如果需要上传文件）
   - **downloadFile合法域名**：（如果需要下载文件）

#### 4.2 业务域名配置
- 如果小程序需要跳转到外部网页
- 在"业务域名"中添加相关域名

### **第五步：后端配置**

#### 5.1 创建环境变量文件
在后端项目根目录创建 `.env` 文件：

```env
# 微信小程序配置
WECHAT_APP_ID=wx1a2b3c4d5e6f7890
WECHAT_APP_SECRET=a1b2c3d4e5f6789012345678901234567890abcd

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=freedays_accounting
DB_USER=your_username
DB_PASS=your_password

# Redis 配置（可选，用于缓存）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development
```

#### 5.2 配置安全设置
```env
# HTTPS 配置（生产环境必须）
SSL_CERT_PATH=/path/to/your/cert.pem
SSL_KEY_PATH=/path/to/your/private.key

# API 限流配置
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=15

# 日志配置
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/freedays-api.log
```

### **第六步：小程序前端配置**

#### 6.1 配置 project.config.json
```json
{
  "appid": "wx1a2b3c4d5e6f7890",
  "projectname": "FreeDays",
  "description": "假期生活记账小程序",
  "setting": {
    "es6": true,
    "enhance": true,
    "minified": true,
    "postcss": true,
    "minifyWXSS": true,
    "lazyloadPlaceholderEnable": false,
    "preloadBackgroundData": false,
    "autoAudits": false
  },
  "compileType": "miniprogram",
  "condition": {}
}
```

#### 6.2 配置 app.json
```json
{
  "pages": [
    "pages/index/index",
    "pages/accounting/accounting",
    "pages/accounting-detail/accounting-detail",
    "pages/query-result/query-result"
  ],
  "window": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "假期生活",
    "navigationBarBackgroundColor": "#ffffff"
  },
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#3399FF",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "假期生活"
      },
      {
        "pagePath": "pages/accounting/accounting",
        "text": "记账本"
      }
    ]
  }
}
```

#### 6.3 配置网络请求域名
在小程序代码中配置API基础URL：

```javascript
// config/api.js
const config = {
  // 开发环境
  development: {
    baseURL: 'https://dev-api.your-domain.com'
  },
  // 生产环境
  production: {
    baseURL: 'https://api.your-domain.com'
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

## 🔒 安全最佳实践

### **AppSecret 安全管理**
1. **绝对保密**：AppSecret 绝不能出现在前端代码中
2. **服务器专用**：只在后端服务器中使用
3. **环境变量**：使用环境变量存储，不写在代码里
4. **定期轮换**：建议每季度更换一次 AppSecret
5. **访问限制**：限制知晓 AppSecret 的人员数量

### **IP 白名单设置**
1. 在微信公众平台设置服务器IP白名单
2. 只允许你的服务器IP访问微信API
3. 路径：开发设置 → IP白名单

### **HTTPS 强制使用**
- 生产环境必须使用 HTTPS
- 微信小程序只能请求 HTTPS 接口
- 申请免费SSL证书（Let's Encrypt 或云服务商）

## 🧪 测试验证

### **测试配置是否正确**
创建一个简单的测试接口：

```javascript
// 测试微信登录
app.post('/api/test/wechat-login', async (req, res) => {
  const { code } = req.body;
  
  try {
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APP_ID,
        secret: process.env.WECHAT_APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    
    if (response.data.openid) {
      res.json({
        code: 200,
        message: '微信配置正确',
        data: {
          openid: response.data.openid
        }
      });
    } else {
      res.json({
        code: 400,
        message: '微信配置错误',
        error: response.data
      });
    }
  } catch (error) {
    res.json({
      code: 500,
      message: '请求失败',
      error: error.message
    });
  }
});
```

### **小程序端测试代码**
```javascript
// 测试登录
wx.login({
  success: (res) => {
    if (res.code) {
      wx.request({
        url: 'https://your-api.com/api/test/wechat-login',
        method: 'POST',
        data: {
          code: res.code
        },
        success: (response) => {
          console.log('测试结果:', response.data);
          if (response.data.code === 200) {
            wx.showToast({
              title: '配置成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '配置错误',
              icon: 'error'
            });
          }
        }
      });
    }
  }
});
```

## 🚨 常见问题解决

### **问题1：AppSecret 无法查看**
- 原因：AppSecret 只在生成时显示一次
- 解决：重新生成新的 AppSecret

### **问题2：接口调用失败，返回40013错误**
- 原因：AppID 不正确
- 解决：检查环境变量中的 AppID 是否正确

### **问题3：接口调用失败，返回40001错误**
- 原因：AppSecret 不正确
- 解决：重新获取 AppSecret

### **问题4：小程序无法发起网络请求**
- 原因：服务器域名未配置
- 解决：在微信公众平台配置服务器域名

### **问题5：开发工具正常，手机预览异常**
- 原因：开发工具跳过域名校验
- 解决：确保服务器域名已正确配置且使用HTTPS

## 📞 技术支持

如果遇到问题，可以参考：
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [微信开放社区](https://developers.weixin.qq.com/community/)
- [微信公众平台](https://mp.weixin.qq.com/)

配置完成后，你的后端接口就可以正常与微信小程序进行用户认证和数据交互了！🎉