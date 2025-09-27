// pages/accounting-detail/accounting-detail.js
const { transactionAPI } = require('../../api/transaction.js');
const app = getApp();

Page({
  data: {
    // 页面模式：add-添加，edit-编辑，view-查看
    mode: 'add',
    // 交易类型：income-收入，expense-支出
    type: 'expense',
    // 金额
    amount: '',
    // 备注
    note: '',
    // 选中的分类
    selectedCategory: null,
    // 日期
    date: '',
    // 支出分类
    expenseCategories: [
      { id: 'food', name: '餐饮', icon: '🍽️', color: '#FF6B6B' },
      { id: 'transport', name: '交通', icon: '🚗', color: '#4ECDC4' },
      { id: 'shopping', name: '购物', icon: '🛍️', color: '#45B7D1' },
      { id: 'entertainment', name: '娱乐', icon: '🎮', color: '#96CEB4' },
      { id: 'healthcare', name: '医疗', icon: '🏥', color: '#FFEAA7' },
      { id: 'education', name: '学习', icon: '📚', color: '#DDA0DD' },
      { id: 'housing', name: '住房', icon: '🏠', color: '#FFB6C1' },
      { id: 'other', name: '其他', icon: '📝', color: '#C0C0C0' }
    ],
    // 收入分类
    incomeCategories: [
      { id: 'salary', name: '工资', icon: '💰', color: '#52C41A' },
      { id: 'bonus', name: '奖金', icon: '🎁', color: '#1890FF' },
      { id: 'investment', name: '投资', icon: '📈', color: '#722ED1' },
      { id: 'part_time', name: '兼职', icon: '⏰', color: '#FA8C16' },
      { id: 'gift', name: '礼金', icon: '🎊', color: '#EB2F96' },
      { id: 'other', name: '其他', icon: '📝', color: '#C0C0C0' }
    ],
    // 当前交易记录ID（编辑模式下使用）
    transactionId: null
  },

  onLoad(options) {
    // 设置默认日期为今天
    const today = new Date();
    const dateString = this.formatDateForInput(today);

    this.setData({
      date: dateString
    });

    // 处理页面参数，添加安全检查
    if (options && options.type) {
      this.setData({
        type: options.type
      });
    }

    if (options && options.categoryId) {
      const currentType = options.type || this.data.type;
      const categories = currentType === 'income' ? this.data.incomeCategories : this.data.expenseCategories;
      const category = categories.find(cat => cat.id === options.categoryId);
      if (category) {
        this.setData({
          selectedCategory: category
        });
      }
    }

    if (options && options.mode) {
      this.setData({
        mode: options.mode
      });
    }

    if (options && options.id) {
      this.setData({
        transactionId: options.id
      });
      this.loadTransaction(options.id);
    }

    // 设置页面标题
    this.updateNavigationTitle();
  },

  // 更新导航栏标题
  updateNavigationTitle() {
    let title = '';
    switch (this.data.mode) {
      case 'add':
        title = this.data.type === 'income' ? '记收入' : '记支出';
        break;
      case 'edit':
        title = '编辑记录';
        break;
      case 'view':
        title = '交易详情';
        break;
    }
    wx.setNavigationBarTitle({ title });
  },

  // 加载交易记录（编辑/查看模式）
  async loadTransaction(id) {
    if (!id) return;

    try {
      // 尝试使用API获取数据
      if (app.isOnlineMode()) {
        const transaction = await transactionAPI.getDetail(id);

        const categories = transaction.type === 'income' ? this.data.incomeCategories : this.data.expenseCategories;
        const category = categories.find(cat => cat.id === transaction.categoryId);

        this.setData({
          type: transaction.type,
          amount: transaction.amount ? transaction.amount.toString() : '',
          note: transaction.note || '',
          selectedCategory: category || null,
          date: transaction.date ? this.formatDateForInput(new Date(transaction.date)) : this.data.date
        });

        console.log('Transaction loaded from API:', transaction);
        return;
      }
    } catch (error) {
      console.error('Failed to load transaction from API:', error);
      // 失败时降级到本地模式
    }

    // 使用本地数据
    this.loadTransactionFromLocal(id);
  },

  // 从本地加载交易记录
  loadTransactionFromLocal(id) {
    const transactions = wx.getStorageSync('transactions') || [];
    const transaction = transactions.find(t => t.id === id);

    if (transaction) {
      const categories = transaction.type === 'income' ? this.data.incomeCategories : this.data.expenseCategories;
      const category = categories.find(cat => cat.id === transaction.categoryId);

      this.setData({
        type: transaction.type,
        amount: transaction.amount ? transaction.amount.toString() : '',
        note: transaction.note || '',
        selectedCategory: category || null,
        date: transaction.date ? this.formatDateForInput(new Date(transaction.date)) : this.data.date
      });

      console.log('Transaction loaded from local storage:', transaction);
    }
  },

  // 切换收支类型
  switchType(e) {
    const type = e.currentTarget.dataset.type;
    if (!type || (type !== 'income' && type !== 'expense')) {
      console.error('Invalid transaction type:', type);
      return;
    }

    this.setData({
      type: type,
      selectedCategory: null // 切换类型时清空选中的分类
    });
    this.updateNavigationTitle();
  },

  // 选择分类
  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    if (!categoryId) {
      console.error('Missing category ID');
      return;
    }

    const categories = this.data.type === 'income' ? this.data.incomeCategories : this.data.expenseCategories;
    const category = categories.find(cat => cat.id === categoryId);

    if (!category) {
      console.error('Category not found:', categoryId);
      return;
    }

    this.setData({
      selectedCategory: category
    });
  },

  // 输入金额 - 最激进的解决方案，完全不处理input事件
  onAmountInput(e) {
    // 什么都不做，让小程序原生处理输入
    // 这样绝对不会触发重渲染
    console.log('输入事件，不做任何处理:', e.detail.value);
  },

  // 在失去焦点时进行验证和格式化，同时同步数据
  onAmountBlur(e) {
    let value = e.detail.value;
    console.log('失去焦点，验证金额:', value);

    // 首先同步数据到data中
    this.setData({
      amount: value
    });

    // 然后进行验证和格式化
    let filteredValue = value.replace(/[^\d.]/g, '');

    // 防止多个小数点
    const parts = filteredValue.split('.');
    if (parts.length > 2) {
      filteredValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // 限制小数点后只能有两位
    if (parts[1] && parts[1].length > 2) {
      filteredValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // 防止以小数点开头
    if (filteredValue.startsWith('.')) {
      filteredValue = '0' + filteredValue;
    }

    // 只有当需要纠正时才更新
    if (filteredValue !== value) {
      console.log('需要纠正输入:', value, '->', filteredValue);
      this.setData({
        amount: filteredValue
      });
    }
  },

  // 输入备注
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    });
  },

  // 选择日期
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },

  // 保存交易记录
  async saveTransaction() {
    // 验证表单 - 明确区分未输入和输入0的情况
    const amountValue = this.data.amount;
    console.log('保存时的金额值:', amountValue, '类型:', typeof amountValue);

    if (amountValue === '' || amountValue === null || amountValue === undefined) {
      wx.showToast({
        title: '请输入金额',
        icon: 'none'
      });
      return;
    }

    const amount = parseFloat(amountValue);
    console.log('解析后的数值:', amount, 'isNaN:', isNaN(amount));

    if (isNaN(amount) || amount < 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return;
    }

    if (!this.data.selectedCategory) {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      });
      return;
    }

    const transactionData = {
      type: this.data.type,
      amount: amount,
      categoryId: this.data.selectedCategory.id,
      note: this.data.note.trim(),
      date: this.data.date
    };

    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    try {
      // 尝试使用API保存
      if (app.isOnlineMode()) {
        let result;

        if (this.data.mode === 'add') {
          result = await transactionAPI.create(transactionData);
        } else if (this.data.mode === 'edit') {
          result = await transactionAPI.update(this.data.transactionId, transactionData);
        }

        console.log('Transaction saved to API:', result);

        wx.showToast({
          title: this.data.mode === 'add' ? '记账成功' : '保存成功',
          icon: 'success'
        });

        // API保存成功后，也更新本地数据以保证一致性
        this.saveToLocal({
          id: result.id || this.data.transactionId || Date.now().toString(),
          ...transactionData,
          createTime: result.createTime || new Date().toISOString()
        });

      } else {
        // 离线模式，保存到本地
        throw new Error('当前为离线模式');
      }

    } catch (error) {
      console.error('Failed to save transaction to API:', error);

      // API失败，保存到本地
      const transaction = {
        id: this.data.transactionId || Date.now().toString(),
        ...transactionData,
        createTime: new Date().toISOString(),
        _pendingSync: true  // 标记为待同步
      };

      this.saveToLocal(transaction);

      wx.showToast({
        title: this.data.mode === 'add' ? '记账成功(本地)' : '保存成功(本地)',
        icon: 'success'
      });
    } finally {
      wx.hideLoading();

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 保存到本地存储
  saveToLocal(transaction) {
    const transactions = wx.getStorageSync('transactions') || [];

    if (this.data.mode === 'add') {
      // 添加新记录
      transactions.unshift(transaction);
    } else if (this.data.mode === 'edit') {
      // 更新现有记录
      const index = transactions.findIndex(t => t.id === this.data.transactionId);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...transaction };
      }
    }

    wx.setStorageSync('transactions', transactions);
    console.log('Transaction saved to local storage:', transaction);
  },

  // 删除交易记录
  deleteTransaction() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条记录吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
            mask: true
          });

          try {
            // 尝试从API删除
            if (app.isOnlineMode()) {
              await transactionAPI.delete(this.data.transactionId);
              console.log('Transaction deleted from API');
            }

            // 从本地存储删除
            const transactions = wx.getStorageSync('transactions') || [];
            const index = transactions.findIndex(t => t.id === this.data.transactionId);
            if (index !== -1) {
              transactions.splice(index, 1);
              wx.setStorageSync('transactions', transactions);
            }

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });

            setTimeout(() => {
              wx.navigateBack();
            }, 1500);

          } catch (error) {
            console.error('Failed to delete transaction from API:', error);

            // API删除失败，但仍然从本地删除，标记为待同步
            const transactions = wx.getStorageSync('transactions') || [];
            const index = transactions.findIndex(t => t.id === this.data.transactionId);
            if (index !== -1) {
              // 标记为已删除待同步，而不是直接删除
              transactions[index]._deleted = true;
              transactions[index]._pendingSync = true;
              wx.setStorageSync('transactions', transactions);
            }

            wx.showToast({
              title: '删除成功(本地)',
              icon: 'success'
            });

            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // 进入编辑模式
  enterEditMode() {
    this.setData({
      mode: 'edit'
    });
    this.updateNavigationTitle();
  },

  // 格式化日期为YYYY-MM-DD格式
  formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});