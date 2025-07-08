const Expense = require('../models/Expense');
const ExpenseCategory = require('../models/ExpenseCategory');
const { uploadFile } = require('../utils/storage');

// Create a new expense
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
    
    const expense = await Expense.create(expenseData);
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
    if (category) query.category = category;
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
    }).populate('category', 'name');
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update expense
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
    
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId
    });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

    // Summary
    const summaryAgg = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          approvedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, "$amount", 0]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    const summary = summaryAgg[0] || { totalAmount: 0, approvedAmount: 0, count: 0 };

    // By Category
    const byCategory = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "expensecategories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: { path: "$category", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          count: 1,
          categoryName: "$category.name"
        }
      }
    ]);

    // By Month
    const byMonth = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Average monthly
    let averageMonthly = 0;
    if (byMonth.length > 0) {
      averageMonthly = byMonth.reduce((sum, m) => sum + m.totalAmount, 0) / byMonth.length;
    }
    summary.averageMonthly = averageMonthly;

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
