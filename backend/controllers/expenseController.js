const Expense = require('../models/Expense');
const ExpenseCategory = require('../models/ExpenseCategory');
const BankAccount = require('../models/BankAccount');
const TransactionLine = require('../models/TransactionLine');
const { uploadFile } = require('../utils/storage');
const mongoose = require('mongoose');
const { getIO } = require('../socket');

exports.createExpense = async (req, res) => {
  try {
    console.log('DEBUG: req.body:', req.body);
    console.log('DEBUG: req.user:', req.user);
    const allowedFields = [
      'date', 'amount', 'category', 'description', 'paymentMethod', 'referenceNo', 'receipt', 'status', 'approvedBy', 'approvedAt', 'notes', 'tenantId', 'createdBy', 'updatedBy'
    ];
    const expenseData = {};
    const details = {};
    Object.entries(req.body).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        expenseData[key] = value;
      } else {
        details[key] = value;
      }
    });
    expenseData.details = details;
    expenseData.tenantId = req.tenantId;
    expenseData.createdBy = req.user?.userId || req.user?.id;
    console.log('DEBUG: expenseData before create:', expenseData);
    
    if (req.file) {
      expenseData.receipt = await uploadFile(
        req.file.buffer, 
        `expenses/${Date.now()}-${req.file.originalname}`, 
        req.file.mimetype
      );
    }
    
    // Validate bank transfer requires bankAccount
    if (expenseData.paymentMethod === 'bank_transfer' && !req.body.bankAccount) {
      return res.status(400).json({ error: 'Bank account is required for bank transfer' });
    }
    if (req.body.bankAccount) {
      expenseData.bankAccount = req.body.bankAccount;
    }

    const expense = await Expense.create(expenseData);

    // If payment method is bank_transfer and bankAccount is provided, create transaction and update balance
    if (expense.paymentMethod === 'bank_transfer' && expense.bankAccount) {
      // Find the bank account
      const bankAcc = await BankAccount.findOne({ _id: expense.bankAccount, tenantId: req.tenantId });
      if (bankAcc) {
        // Always create a TransactionLine for the expense
        await TransactionLine.create({
          date: expense.date,
          bankAccountId: bankAcc._id, // Bank account involved
          amount: expense.amount,
          narration: `Expense: ${expense.description}`,
          tenantId: req.tenantId,
          createdBy: req.user?.userId || req.user?.id
        });
        // Update bank balance
        bankAcc.currentBalance = (bankAcc.currentBalance || 0) - expense.amount;
        await bankAcc.save();
      }
    }
    
    const io = getIO();
io.emit('expenseCreated', expense);

    res.status(201).json(expense);
  } catch (err) {
    console.error('DEBUG: Expense create error:', err);
    res.status(400).json({
      error: err.message,
      stack: err.stack,
      details: err.errors || err
    });
  }
};

// Get all expenses with filters
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, status, paymentMethod } = req.query;
    const query = { tenantId: req.tenantId };
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        // Try to resolve category name to ObjectId
        const catDoc = await require('../models/ExpenseCategory').findOne({ name: category, tenantId: req.tenantId });
        if (catDoc) {
          query.category = catDoc._id;
        } else {
          // If not found, return empty result (no expenses match this category)
          return res.json([]);
        }
      }
    }
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .populate('category', 'name');
      
    res.json(expenses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    })
      .populate('category', 'name')
      .populate('bankAccount');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    let transaction = null;
    if (expense.paymentMethod === 'bank_transfer' && expense.bankAccount) {
      // Find the transaction for this expense (by date, amount, bankAccount, and narration)
      transaction = await require('../models/TransactionLine').findOne({
        date: expense.date,
        amount: expense.amount,
        debitAccount: expense.bankAccount._id,
        creditAccount: expense.category._id || expense.category,
        tenantId: req.tenantId
      });
    }

    res.json({ ...expense.toObject(), transaction });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const allowedFields = [
      'date', 'amount', 'category', 'description', 'paymentMethod', 'referenceNo', 'receipt', 'status', 'approvedBy', 'approvedAt', 'notes', 'tenantId', 'createdBy', 'updatedBy'
    ];
    const updateData = { updatedBy: req.user?.id };
    updateData.updatedBy = req.user?.userId || req.user?.id;
    const details = {};
    Object.entries(req.body).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      } else {
        details[key] = value;
      }
    });
    updateData.details = details;
    
    if (req.file) {
      updateData.receipt = await uploadFile(
        req.file.buffer, 
        `expenses/${Date.now()}-${req.file.originalname}`, 
        req.file.mimetype
      );
    }
    
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const io = getIO();
io.emit('expenseUpdated', expense);
    
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    // First check if the expense exists
    const expense = await Expense.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Delete the expense
    await Expense.deleteOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    // If the expense had a receipt, delete it from storage
    if (expense.receipt) {
      try {
        await axiosInstance.delete(`/api/storage/${expense.receipt}`);
      } catch (storageErr) {
        console.error('Error deleting receipt:', storageErr);
      }
    }

    const io = getIO();
io.emit('expenseDeleted', { id: req.params.id });

    res.json({ 
      message: 'Expense deleted successfully',
      deletedExpense: {
        id: expense._id,
        amount: expense.amount,
        description: expense.description
      }
    });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(400).json({ 
      error: err.message,
      details: err.errors || err
    });
  }
};

// Create expense category
exports.createCategory = async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      tenantId: req.tenantId,
      createdBy: req.user?.userId
    };
    
    const category = await ExpenseCategory.create(categoryData);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    // Debug logging
    console.log('getCategories called. req.tenantId:', req.tenantId);
    const categories = await ExpenseCategory.find({ 
      tenantId: req.tenantId
    }).sort('name');
    res.json(categories);
  } catch (err) {
    console.error('getCategories error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Expense Reports (summary, byCategory, byMonth)
exports.getExpenseReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const match = {
      tenantId: req.tenantId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    // Get all expenses first to ensure we have all data
    const expenses = await Expense.find(match)
      .sort({ date: -1 })
      .populate('category', 'name');
    
    // Calculate summary from the found expenses
    const summary = {
      totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      approvedAmount: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0),
      pendingAmount: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
      rejectedAmount: expenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0),
      count: expenses.length
    };


    // By Category
    const byCategory = expenses.reduce((acc, expense) => {
      // Use the category _id for grouping, not the whole object
      const catId = expense.category?._id ? expense.category._id.toString() : expense.category?.toString() || 'Unknown';
      const categoryIndex = acc.findIndex(item => item._id === catId);
      if (categoryIndex !== -1) {
        acc[categoryIndex].totalAmount += expense.amount;
        acc[categoryIndex].count += 1;
      } else {
        acc.push({
          _id: catId,
          totalAmount: expense.amount,
          count: 1,
          categoryName: expense.category?.name || 'Unknown'
        });
      }
      return acc;
    }, []);

    // By Month
    const byMonth = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const monthIndex = acc.findIndex(item => item._id.year === year && item._id.month === month);
      if (monthIndex !== -1) {
        acc[monthIndex].totalAmount += expense.amount;
        acc[monthIndex].count += 1;
      } else {
        acc.push({
          _id: { year, month },
          totalAmount: expense.amount,
          count: 1
        });
      }
      return acc;
    }, []);
    
    // Sort by month
    byMonth.sort((a, b) => {
      const aDate = new Date(a._id.year, a._id.month - 1);
      const bDate = new Date(b._id.year, b._id.month - 1);
      return aDate - bDate;
    });

    // Average monthly
    let averageMonthly = 0;
    if (byMonth.length > 0) {
      averageMonthly = byMonth.reduce((sum, m) => sum + m.totalAmount, 0) / byMonth.length;
    }
    summary.averageMonthly = averageMonthly;

    // Calculate average monthly
    summary.averageMonthly = byMonth.length > 0 ? byMonth.reduce((sum, m) => sum + m.totalAmount, 0) / byMonth.length : 0;

    res.json({ summary, byCategory, byMonth });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update expense category
exports.updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body, updatedBy: req.user?.userId };
    const category = await ExpenseCategory.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete expense category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await ExpenseCategory.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
