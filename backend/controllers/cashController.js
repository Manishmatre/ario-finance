const TransactionLine = require('../models/TransactionLine');
const PettyCash = require('../models/PettyCash');
const EmployeeAdvance = require('../models/EmployeeAdvance');

exports.getCashbook = async (req, res) => {
  try {
    const cashbook = await TransactionLine.find({ tenantId: req.tenantId });
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
