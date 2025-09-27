# 记账小程序接口文档

## 📋 文档说明

### **项目概述**
- **项目名称**：假期生活记账小程序
- **当前版本**：v1.0.0
- **文档版本**：v1.0.0
- **更新日期**：2024年9月

### **技术规范**
- **协议**：HTTPS
- **数据格式**：JSON
- **字符编码**：UTF-8
- **认证方式**：微信小程序登录态
- **时间格式**：ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

### **微信小程序配置**
- **WECHAT_APP_ID**：微信小程序AppID
- **WECHAT_APP_SECRET**：微信小程序AppSecret

## 🔐 认证说明

### **获取微信小程序凭证**

#### **1. 注册微信小程序**
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 点击“立即注册”
3. 选择“小程序”类型
4. 填写注册信息（需要企业营业执照或个人身份证）
5. 完成注册并认证

#### **2. 获取 WECHAT_APP_ID**
1. 登录微信小程序管理后台
2. 进入“开发” -> “开发管理”-> “开发设置”
3. 在“开发者ID”模块中找到“AppID(小程序)”
4. 复制 AppID 值，这就是 `WECHAT_APP_ID`

```
示例：WECHAT_APP_ID=wx1234567890abcdef
```

#### **3. 获取 WECHAT_APP_SECRET**
1. 在同一页面的“开发者ID”模块中
2. 找到“AppSecret(小程序)”
3. 点击“重置”按钮（如果是新小程序）或“查看”
4. 通过微信扫码验证身份
5. 获取并复制 AppSecret 值，这就是 `WECHAT_APP_SECRET`

```
示例：WECHAT_APP_SECRET=abcdef1234567890abcdef1234567890
```

#### **4. 重要注意事项**
- 🔒 **AppSecret 绝对保密**：不能泄露给第三方
- 🔄 **定期更新**：建议定期重置AppSecret提高安全性
- 🏠 **服务器环境**：AppSecret只能在服务端使用，不能放在小程序代码中
- 🔍 **IP白名单**：可以设置服务器IP白名单提高安全性

#### **5. 服务器配置**
在后端项目中创建 `.env` 文件：
```env
# 微信小程序配置
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=abcdef1234567890abcdef1234567890

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=freedays_db
DB_USER=your_db_user
DB_PASS=your_db_password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### **小程序配置**
在小程序代码中，需要在 `project.config.json` 或 `app.json` 中配置 AppID：

```json
{
  "appid": "wx1234567890abcdef",
  "projectname": "FreeDays",
  "setting": {
    "es6": true,
    "enhance": true,
    "minified": true
  }
}
```

### **用户认证流程**
1. 小程序调用 `wx.login()` 获取 `code`
2. 调用登录接口获取 `access_token`
3. 后续接口请求在 Header 中携带 `Authorization: Bearer {access_token}`

### **请求头规范**
```http
Content-Type: application/json
Authorization: Bearer {access_token}
User-Agent: FreeDays-MiniProgram/1.0.0
```

## 📚 接口列表

## 1. 用户认证模块

### 1.1 用户登录
```http
POST /api/auth/login
```

**请求参数**
```json
{
  "code": "string",           // 微信登录凭证
  "encryptedData": "string",  // 可选，加密用户信息
  "iv": "string"              // 可选，解密向量
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "string",
    "expires_in": 7200,
    "user": {
      "id": "string",
      "openid": "string",
      "nickname": "string",
      "avatar": "string"
    }
  }
}
```

### 1.2 刷新Token
```http
POST /api/auth/refresh
```

**请求参数**
```json
{
  "refresh_token": "string"
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "access_token": "string",
    "expires_in": 7200
  }
}
```

## 2. 交易记录模块

### 2.1 创建交易记录
```http
POST /api/transactions
```

**请求参数**
```json
{
  "type": "income|expense",   // 交易类型：收入|支出
  "amount": "number",         // 金额（保留2位小数）
  "categoryId": "string",     // 分类ID
  "note": "string",           // 备注，可选
  "date": "string"            // 交易日期 YYYY-MM-DD
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "string",
    "type": "income",
    "amount": 100.50,
    "categoryId": "food",
    "note": "午餐",
    "date": "2024-09-27",
    "createTime": "2024-09-27T14:30:00.000Z",
    "updateTime": "2024-09-27T14:30:00.000Z"
  }
}
```

### 2.2 获取交易记录列表
```http
GET /api/transactions
```

**查询参数**
```
page=1                    // 页码，默认1
pageSize=20              // 每页条数，默认20，最大100
type=income|expense      // 可选，筛选类型
categoryId=string        // 可选，筛选分类
startDate=YYYY-MM-DD     // 可选，开始日期
endDate=YYYY-MM-DD       // 可选，结束日期
keyword=string           // 可选，备注关键词搜索
```

**响应数据**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "string",
        "type": "expense",
        "amount": 25.80,
        "categoryId": "food",
        "category": {
          "id": "food",
          "name": "餐饮",
          "icon": "🍽️",
          "color": "#FF6B6B"
        },
        "note": "晚餐",
        "date": "2024-09-27",
        "createTime": "2024-09-27T18:30:00.000Z",
        "updateTime": "2024-09-27T18:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### 2.3 获取交易记录详情
```http
GET /api/transactions/{id}
```

**路径参数**
- `id`: 交易记录ID

**响应数据**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "string",
    "type": "income",
    "amount": 5000.00,
    "categoryId": "salary",
    "category": {
      "id": "salary",
      "name": "工资",
      "icon": "💰",
      "color": "#52C41A"
    },
    "note": "九月工资",
    "date": "2024-09-01",
    "createTime": "2024-09-01T10:00:00.000Z",
    "updateTime": "2024-09-01T10:00:00.000Z"
  }
}
```

### 2.4 更新交易记录
```http
PUT /api/transactions/{id}
```

**路径参数**
- `id`: 交易记录ID

**请求参数**
```json
{
  "type": "expense",
  "amount": 120.00,
  "categoryId": "shopping",
  "note": "购买衣服",
  "date": "2024-09-27"
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "string",
    "type": "expense",
    "amount": 120.00,
    "categoryId": "shopping",
    "note": "购买衣服",
    "date": "2024-09-27",
    "createTime": "2024-09-25T10:00:00.000Z",
    "updateTime": "2024-09-27T16:45:00.000Z"
  }
}
```

### 2.5 删除交易记录
```http
DELETE /api/transactions/{id}
```

**路径参数**
- `id`: 交易记录ID

**响应数据**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

## 3. 统计分析模块

### 3.1 获取月度统计
```http
GET /api/statistics/monthly
```

**查询参数**
```
year=2024     // 年份，默认当前年
month=9       // 月份，默认当前月
```

**响应数据**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "year": 2024,
    "month": 9,
    "summary": {
      "income": 8500.00,
      "expense": 3200.50,
      "balance": 5299.50,
      "transactionCount": 45
    },
    "categoryStats": {
      "income": [
        {
          "categoryId": "salary",
          "categoryName": "工资",
          "amount": 8000.00,
          "count": 1,
          "percentage": 94.12
        }
      ],
      "expense": [
        {
          "categoryId": "food",
          "categoryName": "餐饮",
          "amount": 1200.30,
          "count": 18,
          "percentage": 37.51
        },
        {
          "categoryId": "transport",
          "categoryName": "交通",
          "amount": 450.20,
          "count": 12,
          "percentage": 14.07
        }
      ]
    },
    "dailyTrend": [
      {
        "date": "2024-09-01",
        "income": 8000.00,
        "expense": 120.50
      }
    ]
  }
}
```

### 3.2 获取年度统计
```http
GET /api/statistics/yearly
```

**查询参数**
```
year=2024     // 年份，默认当前年
```

**响应数据**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "year": 2024,
    "summary": {
      "income": 96000.00,
      "expense": 38400.80,
      "balance": 57599.20,
      "transactionCount": 456
    },
    "monthlyTrend": [
      {
        "month": 1,
        "income": 8000.00,
        "expense": 3200.50,
        "balance": 4799.50,
        "transactionCount": 42
      }
    ],
    "categoryStats": {
      "topIncomeCategories": [
        {
          "categoryId": "salary",
          "categoryName": "工资",
          "amount": 80000.00,
          "percentage": 83.33
        }
      ],
      "topExpenseCategories": [
        {
          "categoryId": "food",
          "categoryName": "餐饮",
          "amount": 14400.60,
          "percentage": 37.51
        }
      ]
    }
  }
}
```

### 3.3 获取日期范围统计
```http
GET /api/statistics/range
```

**查询参数**
```
startDate=2024-09-01    // 开始日期
endDate=2024-09-30      // 结束日期
groupBy=day|month       // 可选，分组方式
```

**响应数据**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "startDate": "2024-09-01",
    "endDate": "2024-09-30",
    "summary": {
      "income": 8500.00,
      "expense": 3200.50,
      "balance": 5299.50,
      "transactionCount": 45
    },
    "trend": [
      {
        "date": "2024-09-01",
        "income": 8000.00,
        "expense": 120.50,
        "balance": 7879.50
      }
    ],
    "categoryBreakdown": {
      "expense": [
        {
          "categoryId": "food",
          "categoryName": "餐饮",
          "amount": 1200.30,
          "count": 18,
          "percentage": 37.51
        }
      ]
    }
  }
}
```

## 4. 分类管理模块

### 4.1 获取分类列表
```http
GET /api/categories
```

**查询参数**
```
type=income|expense     // 可选，筛选类型
```

**响应数据**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "income": [
      {
        "id": "salary",
        "name": "工资",
        "icon": "💰",
        "color": "#52C41A",
        "sort": 1,
        "isSystem": true
      }
    ],
    "expense": [
      {
        "id": "food",
        "name": "餐饮",
        "icon": "🍽️",
        "color": "#FF6B6B",
        "sort": 1,
        "isSystem": true
      }
    ]
  }
}
```

### 4.2 创建自定义分类
```http
POST /api/categories
```

**请求参数**
```json
{
  "type": "expense",
  "name": "宠物用品",
  "icon": "🐕",
  "color": "#9C88FF"
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "pet_supplies",
    "type": "expense",
    "name": "宠物用品",
    "icon": "🐕",
    "color": "#9C88FF",
    "sort": 99,
    "isSystem": false,
    "createTime": "2024-09-27T16:30:00.000Z"
  }
}
```

## 5. 数据同步模块

### 5.1 批量上传交易记录
```http
POST /api/sync/transactions
```

**请求参数**
```json
{
  "transactions": [
    {
      "localId": "string",        // 本地临时ID
      "type": "expense",
      "amount": 25.80,
      "categoryId": "food",
      "note": "午餐",
      "date": "2024-09-27",
      "createTime": "2024-09-27T12:30:00.000Z"
    }
  ]
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "同步成功",
  "data": {
    "success": [
      {
        "localId": "string",
        "serverId": "string",
        "status": "created"
      }
    ],
    "failed": [
      {
        "localId": "string",
        "error": "数据格式错误",
        "code": "INVALID_DATA"
      }
    ]
  }
}
```

### 5.2 获取增量数据
```http
GET /api/sync/incremental
```

**查询参数**
```
lastSyncTime=2024-09-27T10:00:00.000Z    // 上次同步时间
```

**响应数据**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "transactions": [
      {
        "id": "string",
        "action": "create|update|delete",
        "data": {
          // 交易记录数据
        },
        "updateTime": "2024-09-27T16:30:00.000Z"
      }
    ],
    "categories": [
      {
        "id": "string",
        "action": "create|update|delete",
        "data": {
          // 分类数据
        },
        "updateTime": "2024-09-27T16:30:00.000Z"
      }
    ],
    "syncTime": "2024-09-27T16:45:00.000Z"
  }
}
```

## 📊 错误码说明

### **通用错误码**
| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| 200 | 200 | 请求成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未授权或token过期 |
| 403 | 403 | 禁止访问 |
| 404 | 404 | 资源不存在 |
| 422 | 422 | 数据验证失败 |
| 429 | 429 | 请求频率超限 |
| 500 | 500 | 服务器内部错误 |

### **业务错误码**
| 错误码 | 说明 |
|--------|------|
| B1001 | 用户不存在 |
| B1002 | 微信登录失败 |
| B2001 | 交易记录不存在 |
| B2002 | 分类不存在 |
| B2003 | 金额格式错误 |
| B2004 | 日期格式错误 |
| B3001 | 数据同步冲突 |

### **错误响应格式**
```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": "INVALID_PARAMS",
  "details": {
    "field": "amount",
    "message": "金额必须大于0"
  },
  "timestamp": "2024-09-27T16:30:00.000Z",
  "path": "/api/transactions"
}
```

## 📋 数据库设计参考

### **用户表 (users)**
```sql
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  openid VARCHAR(128) UNIQUE NOT NULL,
  unionid VARCHAR(128),
  nickname VARCHAR(100),
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **交易记录表 (transactions)**
```sql
CREATE TABLE transactions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category_id VARCHAR(64) NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_user_date (user_id, date),
  INDEX idx_user_type (user_id, type),
  INDEX idx_user_category (user_id, category_id)
);
```

### **分类表 (categories)**
```sql
CREATE TABLE categories (
  id VARCHAR(64) PRIMARY KEY,
  type ENUM('income', 'expense') NOT NULL,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(7),
  sort INT DEFAULT 99,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🚀 部署建议

### **性能优化**
1. **数据库索引**：按用户ID、日期、分类ID创建复合索引
2. **缓存策略**：统计数据使用Redis缓存，TTL设置为1小时
3. **分页查询**：交易记录列表使用游标分页，避免OFFSET性能问题

### **安全建议**
1. **数据验证**：严格验证所有输入参数
2. **权限控制**：确保用户只能访问自己的数据
3. **防重复提交**：使用幂等性设计防止重复创建
4. **SQL注入防护**：使用参数化查询

### **监控指标**
1. **接口响应时间**：P95 < 200ms，P99 < 500ms
2. **错误率**：< 1%
3. **QPS容量**：支持1000+ QPS
4. **数据库连接池**：监控连接使用率

这份接口文档涵盖了记账小程序的所有核心功能，可以直接用于后端API开发！