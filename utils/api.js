// utils/api.js
const apiConfig = require('../config/api.js');

/**
 * API请求工具类
 */
class ApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.timeout = apiConfig.timeout;
    this.debug = apiConfig.debug;
    this.token = wx.getStorageSync('access_token') || '';
  }

  /**
   * 设置访问令牌
   */
  setToken(token) {
    this.token = token;
    wx.setStorageSync('access_token', token);
  }

  /**
   * 获取访问令牌
   */
  getToken() {
    if (!this.token) {
      this.token = wx.getStorageSync('access_token') || '';
    }
    return this.token;
  }

  /**
   * 清除访问令牌
   */
  clearToken() {
    this.token = '';
    wx.removeStorageSync('access_token');
  }

  /**
   * 通用请求方法
   */
  request(options) {
    return new Promise((resolve, reject) => {
      const {
        url,
        method = 'GET',
        data = {},
        header = {},
        needAuth = true
      } = options;

      // 构建完整URL
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

      // 构建请求头
      const requestHeader = {
        'Content-Type': 'application/json',
        ...header
      };

      // 添加认证头
      if (needAuth && this.token) {
        requestHeader['Authorization'] = `Bearer ${this.token}`;
      }

      // 添加小程序标识
      requestHeader['User-Agent'] = 'FreeDays-MiniProgram/1.0.0';

      if (this.debug) {
        console.log('API Request:', {
          url: fullUrl,
          method,
          data,
          header: requestHeader
        });
      }

      wx.request({
        url: fullUrl,
        method,
        data,
        header: requestHeader,
        timeout: this.timeout,
        success: (res) => {
          if (this.debug) {
            console.log('API Response:', res);
          }

          const { statusCode, data: responseData } = res;

          // 处理HTTP状态码
          if (statusCode >= 200 && statusCode < 300) {
            // 处理业务状态码
            if (responseData.code === 200) {
              resolve(responseData);
            } else {
              // 业务错误
              this.handleBusinessError(responseData, reject);
            }
          } else {
            // HTTP错误
            this.handleHttpError(statusCode, responseData, reject);
          }
        },
        fail: (error) => {
          if (this.debug) {
            console.error('API Request Failed:', error);
          }

          this.handleNetworkError(error, reject);
        }
      });
    });
  }

  /**
   * 处理业务错误
   */
  handleBusinessError(data, reject) {
    const error = {
      type: 'BUSINESS_ERROR',
      code: data.code,
      message: data.message || '业务处理失败',
      details: data.details || null
    };

    // 特殊处理认证错误
    if (data.code === 401) {
      this.clearToken();
      // 可以触发重新登录
      this.triggerRelogin();
    }

    wx.showToast({
      title: error.message,
      icon: 'none',
      duration: 2000
    });

    reject(error);
  }

  /**
   * 处理HTTP错误
   */
  handleHttpError(statusCode, data, reject) {
    let message = '请求失败';

    switch (statusCode) {
      case 400:
        message = '请求参数错误';
        break;
      case 401:
        message = '登录已过期，请重新登录';
        this.clearToken();
        this.triggerRelogin();
        break;
      case 403:
        message = '没有权限访问';
        break;
      case 404:
        message = '请求的资源不存在';
        break;
      case 500:
        message = '服务器内部错误';
        break;
      case 502:
      case 503:
      case 504:
        message = '服务暂时不可用';
        break;
    }

    const error = {
      type: 'HTTP_ERROR',
      code: statusCode,
      message,
      data
    };

    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });

    reject(error);
  }

  /**
   * 处理网络错误
   */
  handleNetworkError(error, reject) {
    const networkError = {
      type: 'NETWORK_ERROR',
      message: '网络连接失败，请检查网络设置',
      error
    };

    wx.showToast({
      title: '网络连接失败',
      icon: 'none',
      duration: 2000
    });

    reject(networkError);
  }

  /**
   * 触发重新登录
   */
  triggerRelogin() {
    // 可以发送全局事件或跳转到登录页面
    console.log('Token expired, need relogin');

    // 延迟执行，避免与当前错误处理冲突
    setTimeout(() => {
      this.login();
    }, 1000);
  }

  /**
   * GET 请求
   */
  get(url, params = {}, options = {}) {
    const queryString = this.buildQueryString(params);
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return this.request({
      url: fullUrl,
      method: 'GET',
      ...options
    });
  }

  /**
   * POST 请求
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  }

  /**
   * PUT 请求
   */
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  }

  /**
   * DELETE 请求
   */
  delete(url, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      ...options
    });
  }

  /**
   * 构建查询字符串
   */
  buildQueryString(params) {
    const query = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    return query;
  }

  /**
   * 用户登录
   */
  async login() {
    try {
      // 获取微信登录凭证
      const loginRes = await this.wxLogin();

      // 调用后端登录接口
      const response = await this.post(apiConfig.endpoints.login, {
        code: loginRes.code
      }, { needAuth: false });

      // 保存token和用户信息
      if (response.data.access_token) {
        this.setToken(response.data.access_token);
        wx.setStorageSync('user_info', response.data.user);

        console.log('Login successful:', response.data.user);
        return response.data;
      } else {
        throw new Error('登录失败：未获取到访问令牌');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * 微信登录
   */
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
  }

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    return !!this.getToken();
  }

  /**
   * 自动登录（如果需要）
   */
  async autoLogin() {
    if (!this.checkLoginStatus()) {
      try {
        await this.login();
        return true;
      } catch (error) {
        console.error('Auto login failed:', error);
        return false;
      }
    }
    return true;
  }
}

// 创建全局实例
const apiService = new ApiService();

module.exports = apiService;