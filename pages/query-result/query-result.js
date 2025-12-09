// pages/query-result/query-result.js
const app = getApp();
const transactionAPI = require('../../api/transaction.js');

Page({
  data: {
    // 查询模式：day-日，month-月，year-年
    queryMode: 'month',
    // 查询日期参数
    queryDate: '',
    // 是否显示图表
    showChart: false,
    // 查询结果标题
    queryTitle: '',
    // 统计数据
    stats: {
      income: 0,
      expense: 0,
      balance: 0,
      transactionCount: 0
    },
    // 交易记录
    transactions: [],
    // 图表数据
    chartData: {
      categories: [],
      series: []
    },
    expenseCategories: [],
    incomeCategories: []
  },

  onLoad(options) {
    const { mode, date, chart } = options;

    this.setData({
      queryMode: mode || 'month',
      queryDate: date || '',
      showChart: chart === 'month' || chart === 'year'
    });

    this.loadCategories();
    this.generateQueryTitle();
    this.loadQueryData();

    if (this.data.showChart) {
      this.generateChartData();
    }
  },

  async loadCategories() {
    try {
      const { categoriesAPI } = require('../../api/transaction.js');
      const categories = await categoriesAPI.getAll();
      this.setData({
        incomeCategories: categories.income || [],
        expenseCategories: categories.expense || []
      });
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  },

  // 生成查询标题
  generateQueryTitle() {
    const { queryMode, queryDate } = this.data;
    let title = '';

    switch (queryMode) {
      case 'day':
        title = `${queryDate} 日账单`;
        break;
      case 'month':
        const [year, month] = queryDate.split('-');
        title = `${year}年${month}月账单`;
        break;
      case 'year':
        title = `${queryDate}年账单`;
        break;
    }

    this.setData({ queryTitle: title });
    wx.setNavigationBarTitle({ title });
  },

  // 加载查询数据
  async loadQueryData() {
    wx.showLoading({ title: '加载中...' });

    try {
      let transactions = [];

      if (app.isOnlineMode()) {
        transactions = await this.loadFromAPI();
      } else {
        throw new Error('离线模式');
      }

      const filteredTransactions = this.filterTransactionsByDate(transactions);
      this.calculateAndDisplayStats(filteredTransactions);

    } catch (error) {
      console.error('加载查询数据失败:', error);
      this.setData({ transactions: [], stats: { income: '0.00', expense: '0.00', balance: '0.00', transactionCount: 0 } });
      wx.showToast({ title: '暂无数据', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 从API加载数据
  async loadFromAPI() {
    const { queryMode, queryDate } = this.data;

    switch (queryMode) {
      case 'day':
        const dayTransactions = await transactionAPI.getByDateRange(queryDate, queryDate);
        return dayTransactions;

      case 'month':
        const [year, month] = queryDate.split('-');
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = `${year}-${month.padStart(2, '0')}-31`;
        const monthTransactions = await transactionAPI.getByDateRange(startDate, endDate);
        return monthTransactions;

      case 'year':
        const yearStartDate = `${queryDate}-01-01`;
        const yearEndDate = `${queryDate}-12-31`;
        const yearTransactions = await transactionAPI.getByDateRange(yearStartDate, yearEndDate);
        return yearTransactions;

      default:
        return [];
    }
  },

  // 计算并显示统计数据
  calculateAndDisplayStats(filteredTransactions) {
    // 计算统计数据
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      if (transaction.type === 'income') {
        income += amount;
      } else {
        expense += amount;
      }
    });

    // 处理交易记录，添加显示信息
    const processedTransactions = filteredTransactions.map(transaction => {
      const categoryInfo = this.getCategoryInfo(transaction.type, transaction.categoryId);
      return {
        ...transaction,
        amount: parseFloat(transaction.amount).toFixed(2),
        categoryName: categoryInfo.name,
        categoryIcon: categoryInfo.icon,
        categoryColor: categoryInfo.color,
        displayTitle: transaction.note || categoryInfo.name,
        displayDate: this.formatDate(transaction.date)
      };
    });

    // 按日期排序，最新的在前面
    processedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    this.setData({
      stats: {
        income: income.toFixed(2),
        expense: expense.toFixed(2),
        balance: (income - expense).toFixed(2),
        transactionCount: filteredTransactions.length
      },
      transactions: processedTransactions
    });
  },

  // 根据查询模式筛选交易记录
  filterTransactionsByDate(transactions) {
    const { queryMode, queryDate } = this.data;

    return transactions.filter(transaction => {
      if (!transaction.date) return false;

      const transactionDate = new Date(transaction.date);

      switch (queryMode) {
        case 'day':
          return transaction.date === queryDate;
        case 'month':
          const [queryYear, queryMonth] = queryDate.split('-');
          return transactionDate.getFullYear() === parseInt(queryYear) &&
                 (transactionDate.getMonth() + 1) === parseInt(queryMonth);
        case 'year':
          return transactionDate.getFullYear() === parseInt(queryDate);
        default:
          return false;
      }
    });
  },

  // 生成图表数据
  async generateChartData() {
    const { queryMode } = this.data;
    let transactions = [];

    try {
      if (app.isOnlineMode()) {
        transactions = await this.loadFromAPI();
      } else {
        throw new Error('离线模式');
      }
    } catch (error) {
      console.error('获取图表数据失败:', error);
      transactions = [];
    }

    if (queryMode === 'month') {
      this.generateMonthlyChart(transactions);
    } else if (queryMode === 'year') {
      this.generateYearlyChart(transactions);
    }
  },

  // 生成月度图表数据（按分类统计）
  generateMonthlyChart(transactions) {
    const { queryDate } = this.data;
    const [queryYear, queryMonth] = queryDate.split('-');

    // 筛选当月交易
    const monthTransactions = transactions.filter(transaction => {
      if (!transaction.date) return false;
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === parseInt(queryYear) &&
             (transactionDate.getMonth() + 1) === parseInt(queryMonth);
    });

    // 按分类统计支出
    const categoryStats = {};
    monthTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const categoryId = transaction.categoryId;
        const amount = parseFloat(transaction.amount) || 0;

        if (!categoryStats[categoryId]) {
          categoryStats[categoryId] = 0;
        }
        categoryStats[categoryId] += amount;
      }
    });

    // 转换为图表数据格式
    const categories = [];
    const series = [];
    const totalExpense = Object.values(categoryStats).reduce((sum, amount) => sum + amount, 0);

    Object.keys(categoryStats).forEach(categoryId => {
      const categoryInfo = this.getCategoryInfo('expense', categoryId);
      const amount = categoryStats[categoryId];
      const percentage = totalExpense > 0 ? (amount / totalExpense * 100).toFixed(1) : 0;

      categories.push({
        name: categoryInfo.name,
        icon: categoryInfo.icon,
        color: categoryInfo.color,
        amount: amount.toFixed(2),
        percentage: percentage
      });
      series.push(amount);
    });

    this.setData({
      chartData: { categories, series }
    });
  },

  // 生成年度图表数据（按月统计）
  generateYearlyChart(transactions) {
    const { queryDate } = this.data;
    const queryYear = parseInt(queryDate);

    // 筛选当年交易
    const yearTransactions = transactions.filter(transaction => {
      if (!transaction.date) return false;
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === queryYear;
    });

    // 按月统计
    const monthlyStats = {};
    for (let month = 1; month <= 12; month++) {
      monthlyStats[month] = { income: 0, expense: 0 };
    }

    yearTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const month = transactionDate.getMonth() + 1;
      const amount = parseFloat(transaction.amount) || 0;

      if (transaction.type === 'income') {
        monthlyStats[month].income += amount;
      } else {
        monthlyStats[month].expense += amount;
      }
    });

    // 转换为图表数据格式
    const categories = [];
    const incomeSeries = [];
    const expenseSeries = [];

    // 找到最大值用于计算百分比
    const maxIncome = Math.max(...Object.values(monthlyStats).map(stat => stat.income));
    const maxExpense = Math.max(...Object.values(monthlyStats).map(stat => stat.expense));
    const maxValue = Math.max(maxIncome, maxExpense);

    for (let month = 1; month <= 12; month++) {
      const incomeHeight = maxValue > 0 ? (monthlyStats[month].income / maxValue * 100).toFixed(1) : 0;
      const expenseHeight = maxValue > 0 ? (monthlyStats[month].expense / maxValue * 100).toFixed(1) : 0;

      categories.push({
        name: `${month}月`,
        income: monthlyStats[month].income.toFixed(2),
        expense: monthlyStats[month].expense.toFixed(2),
        incomeHeight: incomeHeight,
        expenseHeight: expenseHeight
      });
      incomeSeries.push(monthlyStats[month].income);
      expenseSeries.push(monthlyStats[month].expense);
    }

    this.setData({
      chartData: {
        categories,
        incomeSeries,
        expenseSeries
      }
    });
  },

  // 获取分类信息
  getCategoryInfo(type, categoryId) {
    const categories = type === 'income' ? this.data.incomeCategories : this.data.expenseCategories;
    return categories.find(cat => cat.id === categoryId) || { name: '其他', icon: '📝', color: '#C0C0C0' };
  },

  // 格式化日期显示
  formatDate(dateString) {
    if (!dateString) return '未知日期';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '无效日期';

      return `${date.getMonth() + 1}月${date.getDate()}日`;
    } catch (error) {
      return '日期错误';
    }
  },

  // 查看交易详情
  viewTransaction(e) {
    const transactionId = e.currentTarget.dataset.id;
    if (!transactionId) return;

    wx.navigateTo({
      url: `/pages/accounting-detail/accounting-detail?id=${transactionId}&mode=view`
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `我的${this.data.queryTitle}`,
      path: `/pages/query-result/query-result?mode=${this.data.queryMode}&date=${this.data.queryDate}`
    };
  }
});