const TransactionLine = require('../models/TransactionLine');
const PurchaseBill = require('../models/PurchaseBill');

exports.getKPIs = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cashInHand = await TransactionLine.aggregate([
      { $match: { tenantId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const payables = await PurchaseBill.aggregate([
      { $match: { tenantId, isPaid: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({
      cashInHand: cashInHand[0]?.total || 0,
      budgetVsActual: 0.9,
      payables: payables[0]?.total || 0,
      receivables: 8000
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
