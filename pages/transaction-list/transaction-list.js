const apiService = require('../../utils/api.js');

Page({
  data: {
    queryMode: 'month', // month or year
    selectedDate: '', // YYYY-MM or YYYY
    displayDate: '',
    summary: {
      income: '0.00',
      expense: '0.00',
      balance: '0.00'
    },
    categoryStats: {
      income: [],
      expense: []
    },
    monthlyTrend: [],
    transactions: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false
  },

  onLoad(options) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const initialDate = `${year}-${month < 10 ? '0' + month : month}`;

    this.setData({
      selectedDate: initialDate,
      displayDate: initialDate
    });

    this.fetchData();
  },

  onDateChange(e) {
    const value = e.detail.value;
    this.setData({
      selectedDate: value,
      displayDate: value,
      page: 1,
      transactions: [],
      hasMore: true
    }, () => {
      this.fetchData();
    });
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode === this.data.queryMode) return;

    const now = new Date();
    let newDate = '';
    if (mode === 'year') {
      newDate = `${now.getFullYear()}`;
    } else {
      const month = now.getMonth() + 1;
      newDate = `${now.getFullYear()}-${month < 10 ? '0' + month : month}`;
    }

    this.setData({
      queryMode: mode,
      selectedDate: newDate,
      displayDate: newDate,
      page: 1,
      transactions: [],
      hasMore: true,
      categoryStats: { income: [], expense: [] },
      monthlyTrend: []
    }, () => {
      this.fetchData();
    });
  },

  async fetchData() {
    if (this.data.queryMode === 'month') {
      await this.fetchMonthlyStats();
      await this.fetchTransactions();
    } else {
      await this.fetchYearlyStats();
    }
  },

  async fetchMonthlyStats() {
    try {
      const [year, month] = this.data.selectedDate.split('-');
      const res = await apiService.get('/statistics/monthly', { year, month });
      if (res.code === 200) {
        this.setData({
          summary: {
            income: res.data.summary.income.toFixed(2),
            expense: res.data.summary.expense.toFixed(2),
            balance: res.data.summary.balance.toFixed(2)
          },
          categoryStats: res.data.categoryStats
        });
      }
    } catch (error) {
      console.error('Fetch monthly stats failed:', error);
    }
  },

  async fetchYearlyStats() {
    try {
      const year = this.data.selectedDate;
      const res = await apiService.get('/statistics/yearly', { year });
      if (res.code === 200) {
        // 计算柱状图高度 (最大高度 150rpx)
        const trend = res.data.monthlyTrend;
        const maxAmount = Math.max(...trend.map(m => Math.max(m.income, m.expense)), 1);
        const processedTrend = trend.map(m => ({
          ...m,
          incomeHeight: (m.income / maxAmount) * 150,
          expenseHeight: (m.expense / maxAmount) * 150
        }));

        this.setData({
          summary: {
            income: res.data.summary.income.toFixed(2),
            expense: res.data.summary.expense.toFixed(2),
            balance: res.data.summary.balance.toFixed(2)
          },
          categoryStats: {
            income: res.data.categoryStats.topIncomeCategories,
            expense: res.data.categoryStats.topExpenseCategories
          },
          monthlyTrend: processedTrend
        });
      }
    } catch (error) {
      console.error('Fetch yearly stats failed:', error);
    }
  },

  async fetchTransactions() {
    if (!this.data.hasMore || this.data.loading) return;

    this.setData({ loading: true });
    try {
      const [year, month] = this.data.selectedDate.split('-');
      const res = await apiService.get('/transactions', {
        year,
        month,
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      if (res.code === 200) {
        const { list, pagination } = res.data;
        this.setData({
          transactions: [...this.data.transactions, ...list],
          page: this.data.page + 1,
          hasMore: pagination.page < pagination.totalPages,
          loading: false
        });
      }
    } catch (error) {
      console.error('Fetch transactions failed:', error);
      this.setData({ loading: false });
    }
  },

  onReachBottom() {
    if (this.data.queryMode === 'month') {
      this.fetchTransactions();
    }
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/accounting-detail/accounting-detail?id=${id}&mode=view`
    });
  }
});
