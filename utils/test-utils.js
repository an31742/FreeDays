// utils/test-utils.js
// 测试工具函数

/**
 * 测试数据管理器
 */
class TestDataManager {
  constructor() {
    this.testDataIds = [];
  }

  /**
   * 记录创建的测试数据ID
   * @param {string} id - 测试数据ID
   */
  addTestId(id) {
    this.testDataIds.push(id);
  }

  /**
   * 清理所有测试数据
   * @param {string} baseUrl - API基础URL
   * @param {string} token - 认证Token
   */
  async cleanupAllTestData(baseUrl, token) {
    console.log('🧹 开始清理测试数据...');

    if (this.testDataIds.length === 0) {
      console.log('✅ 没有需要清理的测试数据');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const id of this.testDataIds) {
      try {
        await new Promise((resolve, reject) => {
          wx.request({
            url: `${baseUrl}/api/transactions/${id}`,
            method: 'DELETE',
            header: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            success: () => {
              console.log(`✅ 成功清理测试数据: ${id}`);
              successCount++;
              resolve();
            },
            fail: (err) => {
              console.log(`❌ 清理测试数据失败: ${id}`, err);
              failCount++;
              reject(err);
            }
          });
        });
      } catch (error) {
        // 忽略单个清理失败，继续清理其他数据
      }
    }

    console.log(`📊 测试数据清理完成: 成功${successCount}个，失败${failCount}个`);
    this.testDataIds = []; // 清空ID列表
  }

  /**
   * 创建测试交易记录并记录ID
   * @param {string} baseUrl - API基础URL
   * @param {string} token - 认证Token
   * @param {Object} transactionData - 交易数据
   * @returns {Promise<Object>} 创建的交易记录
   */
  async createTestTransaction(baseUrl, token, transactionData) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}/api/transactions`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: transactionData,
        success: (res) => {
          if (res.data && res.data.id) {
            this.addTestId(res.data.id);
            console.log(`✅ 创建测试交易记录: ${res.data.id}`);
          }
          resolve(res.data);
        },
        fail: (err) => {
          console.error('❌ 创建测试交易记录失败:', err);
          reject(err);
        }
      });
    });
  }
}

// 创建全局实例
const testDataManager = new TestDataManager();

module.exports = {
  testDataManager
};