const TransactionLine = require('../models/TransactionLine');
const PettyCash = require('../models/PettyCash');
const EmployeeAdvance = require('../models/EmployeeAdvance');

exports.getCashbook = async (req, res) => {
  try {
    const { type } = req.query;
    let filter = { tenantId: req.tenantId };
    let accountName = null;
    if (type === 'cash') accountName = 'Cash';
    if (type === 'bank') accountName = 'Bank';
    let accountIds = [];
    if (accountName) {
      // Find all accounts with this name for the tenant
      const Account = require('../models/Account');
      const accounts = await Account.find({ name: accountName, tenantId: req.tenantId });
      accountIds = accounts.map(a => a._id);
      // Filter transactions where either debit or credit is this account
      filter.$or = [
        { debitAccount: { $in: accountIds } },
        { creditAccount: { $in: accountIds } }
      ];
    }
    const cashbook = await TransactionLine.find(filter)
      .populate('debitAccount')
      .populate('creditAccount')
      .sort({ date: -1 });
    res.json(cashbook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAdvance = async (req, res) => {
  try {
    const { employeeId, amount, date } = req.body;
    const adv = await EmployeeAdvance.create({
      employeeId, amount, date, tenantId: req.tenantId, createdBy: req.user?.id
    });
    res.status(201).json(adv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createReimburse = async (req, res) => {
  try {
    const { employeeId, amount, date } = req.body;
    const adv = await EmployeeAdvance.findOneAndUpdate(
      { employeeId, tenantId: req.tenantId, cleared: false },
      { cleared: true }
    );
    res.status(201).json({ message: 'Reimbursed', adv });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
