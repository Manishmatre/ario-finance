const TransactionLine = require('../models/TransactionLine');
const BankAccount = require('../models/BankAccount');
const mongoose = require('mongoose');
const { getIO } = require('../socket');

// List transactions (with pagination & filters)
exports.listTransactions = async (req, res) => {
  try {
    const { page = 1, accountId, dateFrom, dateTo } = req.query;
    const query = { tenantId: req.tenantId };
    if (accountId) query.$or = [{ debitAccount: accountId }, { creditAccount: accountId }];
    if (dateFrom || dateTo) query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
    const txns = await TransactionLine.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * 20)
      .limit(20);
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { date, debitAccount, creditAccount, amount, narration, projectId, costCode } = req.body;

    if (!debitAccount || !creditAccount || !amount || amount <= 0) {
      throw new Error('Invalid transaction data');
    }

    // Create transaction line with bankAccountId for debit and credit accounts
    const txn = new TransactionLine({
      date,
      debitAccount,
      creditAccount,
      amount,
      narration,
      projectId,
      costCode,
      tenantId: req.tenantId,
      createdBy: req.user?.id,
      bankAccountId: debitAccount // Set bankAccountId to debitAccount for filtering in cashbook
    });

    await txn.save({ session });

    // Update debit account balance (subtract amount)
    const debitAcc = await BankAccount.findOne({ _id: debitAccount, tenantId: req.tenantId }).session(session);
    if (!debitAcc) throw new Error('Debit bank account not found');
    debitAcc.currentBalance -= amount;
    await debitAcc.save({ session });

    // Update credit account balance (add amount)
    const creditAcc = await BankAccount.findOne({ _id: creditAccount, tenantId: req.tenantId }).session(session);
    if (!creditAcc) throw new Error('Credit bank account not found');
    creditAcc.currentBalance += amount;
    await creditAcc.save({ session });

    // Audit log
    // await AuditLog.create([{
    //   tenantId: req.tenantId,
    //   userId: req.user?.id,
    //   action: 'CREATE_TRANSACTION',
    //   details: {
    //     transactionId: txn._id,
    //     debitAccount: debitAccount,
    //     creditAccount: creditAccount,
    //     amount,
    //     narration
    //   }
    // }], { session });

    await session.commitTransaction();
    session.endSession();

    const io = getIO();
io.emit('transactionCreated', txn);

    res.status(201).json(txn);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};

// Update transaction (simplified, no balance update here)
exports.updateTransaction = async (req, res) => {
  try {
    const txn = await TransactionLine.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body, { new: true }
    );
    if (!txn) return res.status(404).json({ error: 'Not found' });
    const io = getIO();
io.emit('transactionUpdated', txn);
    res.json(txn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Approve transaction and update balances if not already approved
exports.approveTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const txn = await TransactionLine.findOne({ _id: req.params.id, tenantId: req.tenantId }).session(session);
    if (!txn) {
      throw new Error('Transaction not found');
    }
    if (txn.isApproved) {
      throw new Error('Transaction already approved');
    }

    // Update balances
    const debitAcc = await BankAccount.findOne({ _id: txn.debitAccount, tenantId: req.tenantId }).session(session);
    if (!debitAcc) throw new Error('Debit bank account not found');
    debitAcc.currentBalance -= txn.amount;
    await debitAcc.save({ session });

    const creditAcc = await BankAccount.findOne({ _id: txn.creditAccount, tenantId: req.tenantId }).session(session);
    if (!creditAcc) throw new Error('Credit bank account not found');
    creditAcc.currentBalance += txn.amount;
    await creditAcc.save({ session });

    // Mark transaction approved
    txn.isApproved = true;
    await txn.save({ session });

    // Audit log
    // await AuditLog.create([{
    //   tenantId: req.tenantId,
    //   userId: req.user?.id,
    //   action: 'APPROVE_TRANSACTION',
    //   details: {
    //     transactionId: txn._id,
    //     debitAccount: txn.debitAccount,
    //     creditAccount: txn.creditAccount,
    //     amount: txn.amount
    //   }
    // }], { session });

    await session.commitTransaction();
    session.endSession();

    const io = getIO();
io.emit('transactionApproved', txn);

    res.json(txn);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};

// List bank account transactions with running balance
exports.listBankAccountTransactions = async (req, res) => {
  try {
    const { bankAccountId } = req.query;
    if (!bankAccountId) return res.status(400).json({ error: 'bankAccountId is required' });
    const query = {
      tenantId: req.tenantId,
      $or: [
        { debitAccount: bankAccountId },
        { creditAccount: bankAccountId },
        { bankAccountId: bankAccountId }
      ]
    };
    const txns = await require('../models/TransactionLine').find(query)
      .sort({ date: 1 })
      .populate('projectId', 'name')
      .populate('vendorId', 'name')
      .lean();

    let balance = 0;
    const txnsWithBalance = txns.map(txn => {
      // For expenses, always treat as debit for the bank account
      const isExpense = txn.narration && txn.narration.toLowerCase().includes('expense');
      // Fix: If creditAccount is null and amount is positive, treat as Credit (received payment)
      let isDebit;
      if (txn.creditAccount === null && txn.amount > 0) {
        isDebit = false;
      } else {
        isDebit = isExpense || txn.debitAccount?.toString() === bankAccountId;
      }
      const debit = isDebit ? txn.amount : 0;
      const credit = !isDebit ? txn.amount : 0;
      balance += credit - debit;
      return {
        ...txn,
        type: isDebit ? 'Debit' : 'Credit',
        debit,
        credit,
        balance,
        projectName: txn.projectId?.name,
        vendorName: txn.vendorId?.name,
      };
    });
    res.json(txnsWithBalance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get full ledger for a bank account (debit/credit columns, running balance)
exports.getBankAccountLedger = async (req, res) => {
  try {
    const { bankAccountId } = req.query;
    if (!bankAccountId) return res.status(400).json({ error: 'bankAccountId is required' });
    const query = {
      tenantId: req.tenantId,
      $or: [
        { debitAccount: bankAccountId },
        { creditAccount: bankAccountId },
        { bankAccountId: bankAccountId }
      ]
    };
    const txns = await require('../models/TransactionLine').find(query)
      .sort({ date: 1 })
      .populate('projectId', 'name')
      .populate('vendorId', 'name')
      .lean();

    let balance = 0;
    const ledgerEntries = txns.map(txn => {
      // Determine debit/credit for this bank account
      let debit = 0, credit = 0, type = '';
      if (txn.debitAccount?.toString() === bankAccountId) {
        debit = Math.abs(Number(txn.amount));
        type = 'Debit';
      } else if (txn.creditAccount?.toString() === bankAccountId) {
        credit = Math.abs(Number(txn.amount));
        type = 'Credit';
      } else if (txn.creditAccount === null && txn.amount > 0) {
        // Received payment (credit)
        credit = Math.abs(Number(txn.amount));
        type = 'Credit';
      }
      // Always show positive values in debit/credit columns
      debit = debit > 0 ? debit : '';
      credit = credit > 0 ? credit : '';
      balance += (credit || 0) - (debit || 0);
      return {
        date: txn.date,
        type,
        description: txn.narration || '',
        debit,
        credit,
        reference: txn.reference || '',
        balance,
        projectName: txn.projectId?.name,
        vendorName: txn.vendorId?.name,
      };
    });
    res.json(ledgerEntries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
