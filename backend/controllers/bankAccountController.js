const BankAccount = require('../models/BankAccount');
const { getIO } = require('../socket');

// Get all bank accounts for a tenant
exports.getBankAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, bankName } = req.query;
    
    // Build filter object
    const filter = { tenantId: req.tenantId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (bankName) filter.bankName = bankName;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get bank accounts with pagination
    const bankAccounts = await BankAccount.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await BankAccount.countDocuments(filter);

    // Get summary statistics
    const summary = await BankAccount.aggregate([
      { $match: { tenantId: req.tenantId } },
      {
        $group: {
          _id: null,
          totalAccounts: { $sum: 1 },
          totalBalance: { $sum: '$currentBalance' },
          activeAccounts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      bankAccounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      summary: summary[0] || {
        totalAccounts: 0,
        totalBalance: 0,
        activeAccounts: 0
      }
    });
  } catch (err) {
    console.error('Error fetching bank accounts:', err);
    res.status(500).json({ error: 'Failed to fetch bank accounts' });
  }
};

// Get a single bank account by ID
exports.getBankAccount = async (req, res) => {
  try {
    const bankAccount = await BankAccount.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json(bankAccount);
  } catch (err) {
    console.error('Error fetching bank account:', err);
    res.status(500).json({ error: 'Failed to fetch bank account' });
  }
};

exports.createBankAccount = async (req, res) => {
  try {
    const {
      bankName,
      type,
      accountHolder,
      bankAccountNo,
      ifsc,
      branchName,
      currentBalance,
      status,
      interestRate,
      features,
      notes
    } = req.body;

    // Validate required fields
    if (!bankName || !type || !accountHolder || !bankAccountNo || !ifsc || !branchName) {
      return res.status(400).json({ 
        error: 'Missing required fields: bankName, type, accountHolder, bankAccountNo, ifsc, branchName' 
      });
    }

    // Validate IFSC code format
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc)) {
      return res.status(400).json({ error: 'Invalid IFSC code format' });
    }

    // Check if account number already exists for this tenant
    const existingAccount = await BankAccount.findOne({
      bankAccountNo,
      tenantId: req.tenantId
    });

    if (existingAccount) {
      return res.status(400).json({ error: 'Bank account number already exists' });
    }

    // Validate interest rate for interest-bearing accounts
    let finalInterestRate = interestRate || 0;
    if (interestRate !== undefined && interestRate !== null) {
      const interestBearingTypes = ['Savings', 'Fixed Deposit', 'Recurring Deposit', 'NRE', 'NRO'];
      if (interestBearingTypes.includes(type)) {
        if (interestRate < 0 || interestRate > 100) {
          return res.status(400).json({ error: 'Interest rate must be between 0 and 100' });
        }
        finalInterestRate = interestRate;
      } else {
        // Set interest rate to 0 for non-interest-bearing accounts
        finalInterestRate = 0;
      }
    }

    // Create the bank account
    const bankAccount = new BankAccount({
      bankName,
      type,
      accountHolder,
      bankAccountNo,
      ifsc,
      branchName,
      currentBalance: currentBalance || 0,
      status: status || 'active',
      interestRate: finalInterestRate,
      features: features || {
        internetBanking: false,
        mobileBanking: false,
        debitCard: false,
        chequeBook: false
      },
      notes,
      tenantId: req.tenantId,
      createdBy: req.user?.id || 'system'
    });
    await bankAccount.save();

    const io = getIO();
io.emit('bankAccountCreated', bankAccount);

    res.status(201).json({
      message: 'Bank account created successfully',
      bankAccount
    });
  } catch (err) {
    console.error('Error creating bank account:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Bank account with this information already exists' });
    }

    res.status(500).json({ error: 'Failed to create bank account' });
  }
};

// Update a bank account
exports.updateBankAccount = async (req, res) => {
  try {
    const {
      bankName,
      type,
      accountHolder,
      bankAccountNo,
      ifsc,
      branchName,
      currentBalance,
      status,
      interestRate,
      features,
      notes
    } = req.body;

    // Find the bank account
    const bankAccount = await BankAccount.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // Validate IFSC code format if provided
    if (ifsc) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifsc)) {
        return res.status(400).json({ error: 'Invalid IFSC code format' });
      }
    }

    // Check if account number already exists (excluding current account)
    if (bankAccountNo && bankAccountNo !== bankAccount.bankAccountNo) {
      const existingAccount = await BankAccount.findOne({
        bankAccountNo,
        tenantId: req.tenantId,
        _id: { $ne: req.params.id }
      });

      if (existingAccount) {
        return res.status(400).json({ error: 'Bank account number already exists' });
      }
    }

    // Validate interest rate for interest-bearing accounts
    let finalInterestRate = interestRate !== undefined ? interestRate : bankAccount.interestRate;
    if (interestRate !== undefined && interestRate !== null) {
      const accountType = type || bankAccount.type;
      const interestBearingTypes = ['Savings', 'Fixed Deposit', 'Recurring Deposit', 'NRE', 'NRO'];
      
      if (interestBearingTypes.includes(accountType)) {
        if (interestRate < 0 || interestRate > 100) {
          return res.status(400).json({ error: 'Interest rate must be between 0 and 100' });
        }
        finalInterestRate = interestRate;
      } else {
        // Set interest rate to 0 for non-interest-bearing accounts
        finalInterestRate = 0;
      }
    }

    // Update the bank account
    const updatedBankAccount = await BankAccount.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      {
        bankName,
        type,
        accountHolder,
        bankAccountNo,
        ifsc,
        branchName,
        currentBalance,
        status,
        interestRate: finalInterestRate,
        features,
        notes
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Bank account updated successfully',
      bankAccount: updatedBankAccount
    });
  } catch (err) {
    console.error('Error updating bank account:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.status(500).json({ error: 'Failed to update bank account' });
  }
};

// Delete a bank account (soft delete)
exports.deleteBankAccount = async (req, res) => {
  try {
    const bankAccount = await BankAccount.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status: 'inactive' },
      { new: true }
    );

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json({
      message: 'Bank account deleted successfully',
      bankAccount
    });
  } catch (err) {
    console.error('Error deleting bank account:', err);
    res.status(500).json({ error: 'Failed to delete bank account' });
  }
};

// Permanently delete a bank account (hard delete)
exports.deleteBankAccountHard = async (req, res) => {
  try {
    const bankAccount = await BankAccount.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json({
      message: 'Bank account permanently deleted',
      bankAccount
    });
  } catch (err) {
    console.error('Error hard deleting bank account:', err);
    res.status(500).json({ error: 'Failed to permanently delete bank account' });
  }
};

// Get bank account statistics
exports.getBankAccountStats = async (req, res) => {
  try {
    const stats = await BankAccount.aggregate([
      { $match: { tenantId: req.tenantId } },
      {
        $group: {
          _id: null,
          totalAccounts: { $sum: 1 },
          totalBalance: { $sum: '$currentBalance' },
          activeAccounts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveAccounts: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          dormantAccounts: {
            $sum: { $cond: [{ $eq: ['$status', 'dormant'] }, 1, 0] }
          },
          frozenAccounts: {
            $sum: { $cond: [{ $eq: ['$status', 'frozen'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get accounts by type
    const accountsByType = await BankAccount.aggregate([
      { $match: { tenantId: req.tenantId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalBalance: { $sum: '$currentBalance' }
        }
      }
    ]);

    // Get accounts by bank
    const accountsByBank = await BankAccount.aggregate([
      { $match: { tenantId: req.tenantId } },
      {
        $group: {
          _id: '$bankName',
          count: { $sum: 1 },
          totalBalance: { $sum: '$currentBalance' }
        }
      }
    ]);

    res.json({
      summary: stats[0] || {
        totalAccounts: 0,
        totalBalance: 0,
        activeAccounts: 0,
        inactiveAccounts: 0,
        dormantAccounts: 0,
        frozenAccounts: 0
      },
      accountsByType,
      accountsByBank
    });
  } catch (err) {
    console.error('Error fetching bank account stats:', err);
    res.status(500).json({ error: 'Failed to fetch bank account statistics' });
  }
}; 