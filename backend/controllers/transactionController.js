const TransactionLine = require('../models/TransactionLine');
const { io } = require('../server');

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

// Create a double-entry transaction (two docs)
exports.createTransaction = async (req, res) => {
  try {
    const { date, debitAccount, creditAccount, amount, narration, projectId, costCode } = req.body;
    const txn1 = await TransactionLine.create({
      date, debitAccount, creditAccount, amount, narration, projectId, costCode,
      tenantId: req.tenantId, createdBy: req.user?.id
    });
    io.emit('transactionCreated', txn1);
    res.status(201).json(txn1);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const txn = await TransactionLine.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body, { new: true }
    );
    if (!txn) return res.status(404).json({ error: 'Not found' });
    io.emit('transactionUpdated', txn);
    res.json(txn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.approveTransaction = async (req, res) => {
  try {
    const txn = await TransactionLine.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isApproved: true }, { new: true }
    );
    if (!txn) return res.status(404).json({ error: 'Not found' });
    io.emit('transactionApproved', txn);
    res.json(txn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listBankAccountTransactions = async (req, res) => {
  try {
    const { bankAccountId } = req.query;
    if (!bankAccountId) return res.status(400).json({ error: 'bankAccountId is required' });
    const query = { tenantId: req.tenantId, bankAccountId };
    const txns = await TransactionLine.find(query).sort({ date: 1 }); // ascending order
    // Calculate running balance
    let balance = 0;
    const txnsWithBalance = txns.map(txn => {
      // If vendorId is present, it's a payment (debit/outflow)
      const isDebit = !!txn.vendorId;
      const isCredit = !txn.vendorId;
      const debit = isDebit ? txn.amount : 0;
      const credit = isCredit ? txn.amount : 0;
      balance += credit - debit;
      return {
        ...txn.toObject(),
        type: isDebit ? 'Debit' : 'Credit',
        debit,
        credit,
        balance
      };
    });
    res.json(txnsWithBalance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
