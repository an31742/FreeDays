// pages/accounting/accounting.js
const { transactionAPI, statisticsAPI } = require('../../api/transaction.js');
const app = getApp();

Page({
  data: {
    // 当前选中的标签页：0-支出，1-收入
    activeTab: 0,
    // 当前月份
    currentMonth: new Date().getMonth() + 1,
    // 当前年份
    currentYear: new Date().getFullYear(),
    // 查询模式：day-日，month-月，year-年
    queryMode: 'month',
    // 选择的查询日期
    selectedDate: '',
    // 选择的查询月份
    selectedMonth: '',
    // 选择的查询年份
    selectedYear: '',
    // 是否显示查询面板
    showQueryPanel: false,
    // 当月收支统计
    monthlyStats: {
      income: 0,
      expense: 0,
      balance: 0
    },
    // 最近交易记录
    recentTransactions: [],
    expenseCategories: [],
    incomeCategories: []
  },

  onLoad() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const todayStr = this.formatDateForPicker(today);
    const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const yearStr = String(currentYear);

    this.setData({
      selectedDate: todayStr,
      selectedMonth: monthStr,
      selectedYear: yearStr
    });

    this.loadCategories();
    this.loadMonthlyStats();
    this.loadRecentTransactions();
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
      wx.showToast({ title: '分类加载失败', icon: 'none' });
    }
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadMonthlyStats();
    this.loadRecentTransactions();
  },

  // 切换标签页
  switchTab(e) {
    const tabIndex = parseInt(e.currentTarget.dataset.index);
    if (isNaN(tabIndex) || tabIndex < 0 || tabIndex > 1) {
      console.error('Invalid tab index:', tabIndex);
      return;
    }

    console.log('Switching to tab:', tabIndex);
    console.log('Income categories:', this.data.incomeCategories);
    console.log('Expense categories:', this.data.expenseCategories);

    this.setData({
      activeTab: tabIndex
    });
  },

  // 加载月度统计
  async loadMonthlyStats() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    try {
      // 尝试使用API获取数据
      if (app.isOnlineMode()) {
        const stats = await statisticsAPI.getMonthly(currentYear, currentMonth);

        this.setData({
          currentMonth: currentMonth,
          currentYear: currentYear,
          monthlyStats: {
            income: stats.summary.income.toFixed(2),
            expense: stats.summary.expense.toFixed(2),
            balance: stats.summary.balance.toFixed(2)
          }
        });

        console.log('Monthly stats loaded from API:', stats);
        return;
      }
    } catch (error) {
      console.error('Failed to load monthly stats from API:', error);
      this.loadMonthlyStatsFromLocal(currentYear, currentMonth);
    }
  },

  // 从本地加载月度统计
  loadMonthlyStatsFromLocal(currentYear, currentMonth) {
    this.setData({
      currentMonth: currentMonth,
      currentYear: currentYear,
      monthlyStats: {
        income: '0.00',
        expense: '0.00',
        balance: '0.00'
      }
    });
    console.log('暂无数据');
  },

  // 加载最近交易记录
  async loadRecentTransactions() {
    try {
      // 尝试使用API获取数据
      if (app.isOnlineMode()) {
        const result = await transactionAPI.getList({
          page: 1,
          pageSize: 10
        });

        // 处理API返回的数据
        const recentTransactions = result.list.map(transaction => {
          const categoryInfo = transaction.category || this.getCategoryInfo(transaction.type, transaction.categoryId);
          const formattedDate = this.formatDate(transaction.date);

          return {
            ...transaction,
            amount: parseFloat(transaction.amount).toFixed(2),
            categoryName: categoryInfo.name,
            categoryIcon: categoryInfo.icon,
            categoryColor: categoryInfo.color,
            displayTitle: transaction.note || categoryInfo.name,
            displayDate: formattedDate
          };
        });

        this.setData({
          recentTransactions: recentTransactions
        });

        console.log('Recent transactions loaded from API:', result);
        return;
      }
    } catch (error) {
      console.error('Failed to load recent transactions from API:', error);
      this.setData({ recentTransactions: [] });
      wx.showToast({ title: '暂无数据', icon: 'none' });
    }
  },

  // 从本地加载最近交易记录
  loadRecentTransactionsFromLocal() {
    this.setData({
      recentTransactions: []
    });
    console.log('暂无数据');
  },

  // 快速记账
  quickAdd(e) {
    const { type, categoryId } = e.currentTarget.dataset;
    if (!type || !categoryId) {
      console.error('Missing required data for quickAdd');
      return;
    }

    const categories = type === 'income' ? this.data.incomeCategories : this.data.expenseCategories;
    const category = categories.find(cat => cat.id === categoryId);

    if (!category) {
      console.error('Category not found:', categoryId);
      wx.showToast({
        title: '分类不存在',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/accounting-detail/accounting-detail?type=${type}&categoryId=${categoryId}&categoryName=${encodeURIComponent(category.name)}&categoryIcon=${encodeURIComponent(category.icon)}&categoryColor=${encodeURIComponent(category.color)}`
    });
  },

  // 添加新记录
  addTransaction() {
    wx.navigateTo({
      url: '/pages/accounting-detail/accounting-detail'
    });
  },

  // 查看交易详情
  viewTransaction(e) {
    const transactionId = e.currentTarget.dataset.id;
    if (!transactionId) {
      console.error('Missing transaction ID');
      return;
    }

    wx.navigateTo({
      url: `/pages/accounting-detail/accounting-detail?id=${transactionId}&mode=view`
    });
  },

  // 格式化金额显示
  formatAmount(amount) {
    return amount.toFixed(2);
  },

  // 格式化日期显示
  formatDate(dateString) {
    if (!dateString) {
      return '未知日期';
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '无效日期';
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return '今天';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天';
      } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return '日期错误';
    }
  },

  // 获取分类信息
  getCategoryInfo(type, categoryId) {
    const categories = type === 'income' ? this.data.incomeCategories : this.data.expenseCategories;
    return categories.find(cat => cat.id === categoryId) || { name: '其他', icon: '📝', color: '#C0C0C0' };
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadMonthlyStats();
    this.loadRecentTransactions();
    wx.stopPullDownRefresh();
  },

  // 查看所有交易
  viewAllTransactions() {
    wx.navigateTo({
      url: '/pages/transaction-list/transaction-list'
    });
  },

  // 切换查询模式
  switchQueryMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      queryMode: mode
    });
  },

  // 显示/隐藏查询面板
  toggleQueryPanel() {
    this.setData({
      showQueryPanel: !this.data.showQueryPanel
    });
  },

  // 选择日期
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    });
  },

  // 选择月份
  onMonthChange(e) {
    this.setData({
      selectedMonth: e.detail.value
    });
  },

  // 选择年份
  onYearChange(e) {
    this.setData({
      selectedYear: e.detail.value
    });
  },

  // 执行查询
  executeQuery() {
    const { queryMode, selectedDate, selectedMonth, selectedYear } = this.data;
    let queryParam = '';
    let chartType = '';

    switch (queryMode) {
      case 'day':
        queryParam = selectedDate;
        break;
      case 'month':
        queryParam = selectedMonth;
        chartType = 'month';
        break;
      case 'year':
        queryParam = selectedYear;
        chartType = 'year';
        break;
    }

    // 跳转到查询结果页面
    const url = `/pages/query-result/query-result?mode=${queryMode}&date=${queryParam}&chart=${chartType}`;
    wx.navigateTo({
      url: url
    });

    // 隐藏查询面板
    this.setData({
      showQueryPanel: false
    });
  },

  // 格式化日期为选择器格式
  formatDateForPicker(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});