// api/transaction.js
const apiService = require('../utils/api.js');
const apiConfig = require('../config/api.js');

/**
 * 交易记录相关API
 */
class TransactionAPI {
  /**
   * 创建交易记录
   */
  async create(transactionData) {
    try {
      const response = await apiService.post(apiConfig.endpoints.transactions, transactionData);
      console.log('Transaction created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create transaction failed:', error);
      throw error;
    }
  }

  /**
   * 获取交易记录列表
   */
  async getList(params = {}) {
    try {
      const response = await apiService.get(apiConfig.endpoints.transactions, params);
      return response.data;
    } catch (error) {
      console.error('Get transactions failed:', error);
      throw error;
    }
  }

  /**
   * 获取交易记录详情
   */
  async getDetail(id) {
    try {
      const response = await apiService.get(apiConfig.endpoints.transaction(id));
      return response.data;
    } catch (error) {
      console.error('Get transaction detail failed:', error);
      throw error;
    }
  }

  /**
   * 更新交易记录
   */
  async update(id, transactionData) {
    try {
      const response = await apiService.put(apiConfig.endpoints.transaction(id), transactionData);
      console.log('Transaction updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update transaction failed:', error);
      throw error;
    }
  }

  /**
   * 删除交易记录
   */
  async delete(id) {
    try {
      const response = await apiService.delete(apiConfig.endpoints.transaction(id));
      console.log('Transaction deleted:', id);
      return response.data;
    } catch (error) {
      console.error('Delete transaction failed:', error);
      throw error;
    }
  }

  /**
   * 批量同步交易记录
   */
  async syncBatch(transactions) {
    try {
      const response = await apiService.post(apiConfig.endpoints.syncTransactions, {
        transactions
      });
      console.log('Transactions synced:', response.data);
      return response.data;
    } catch (error) {
      console.error('Sync transactions failed:', error);
      throw error;
    }
  }
}

// 统计分析相关API
class StatisticsAPI {
  /**
   * 获取月度统计
   */
  async getMonthly(year, month) {
    try {
      const params = { year, month };
      const response = await apiService.get(apiConfig.endpoints.monthlyStats, params);
      return response.data;
    } catch (error) {
      console.error('Get monthly stats failed:', error);
      throw error;
    }
  }

  /**
   * 获取年度统计
   */
  async getYearly(year) {
    try {
      const params = { year };
      const response = await apiService.get(apiConfig.endpoints.yearlyStats, params);
      return response.data;
    } catch (error) {
      console.error('Get yearly stats failed:', error);
      throw error;
    }
  }

  /**
   * 获取自定义范围统计
   */
  async getRange(startDate, endDate, groupBy = 'day') {
    try {
      const params = { startDate, endDate, groupBy };
      const response = await apiService.get(apiConfig.endpoints.rangeStats, params);
      return response.data;
    } catch (error) {
      console.error('Get range stats failed:', error);
      throw error;
    }
  }
}

// 分类管理相关API
class CategoryAPI {
  /**
   * 获取分类列表
   */
  async getList(type = null) {
    try {
      const params = type ? { type } : {};
      const response = await apiService.get(apiConfig.endpoints.categories, params);
      return response.data;
    } catch (error) {
      console.error('Get categories failed:', error);
      throw error;
    }
  }

  /**
   * 获取所有分类
   */
  async getAll() {
    return this.getList();
  }

  /**
   * 创建自定义分类
   */
  async create(categoryData) {
    try {
      const response = await apiService.post(apiConfig.endpoints.categories, categoryData);
      console.log('Category created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create category failed:', error);
      throw error;
    }
  }
}

// 数据同步相关API
class SyncAPI {
  /**
   * 获取增量数据
   */
  async getIncremental(lastSyncTime) {
    try {
      const params = { lastSyncTime };
      const response = await apiService.get(apiConfig.endpoints.syncIncremental, params);
      return response.data;
    } catch (error) {
      console.error('Get incremental data failed:', error);
      throw error;
    }
  }

  /**
   * 同步本地数据到服务器
   */
  async syncLocalData() {
    try {
      // 获取本地交易记录
      const localTransactions = wx.getStorageSync('transactions') || [];

      if (localTransactions.length > 0) {
        const transactionAPI = new TransactionAPI();
        const result = await transactionAPI.syncBatch(localTransactions);

        // 同步成功后，可以选择清理本地数据或标记为已同步
        console.log('Local data synced successfully:', result);
        return result;
      } else {
        console.log('No local data to sync');
        return { success: [], failed: [] };
      }
    } catch (error) {
      console.error('Sync local data failed:', error);
      throw error;
    }
  }
}

// 导出API实例
module.exports = {
  transactionAPI: new TransactionAPI(),
  statisticsAPI: new StatisticsAPI(),
  categoriesAPI: new CategoryAPI(),
  categoryAPI: new CategoryAPI(),
  syncAPI: new SyncAPI()
};