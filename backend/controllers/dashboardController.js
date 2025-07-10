const TransactionLine = require('../models/TransactionLine');
const PurchaseBill = require('../models/PurchaseBill');
const BankAccount = require('../models/BankAccount');

exports.getKPIs = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    // Calculate total bank balance
    const bankBalanceAgg = await BankAccount.aggregate([
      { $match: { tenantId } },
      { $group: { _id: null, total: { $sum: "$currentBalance" } } }
    ]);
    const totalBalance = bankBalanceAgg[0]?.total || 0;

    const payables = await PurchaseBill.aggregate([
      { $match: { tenantId, isPaid: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Calculate totalIncome (amount > 0) and totalExpense (amount < 0)
    const incomeAgg = await TransactionLine.aggregate([
      { $match: { tenantId, amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const expenseAgg = await TransactionLine.aggregate([
      { $match: { tenantId, amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      cashInHand: totalBalance,
      budgetVsActual: 0.9,
      payables: payables[0]?.total || 0,
      receivables: 8000,
      totalIncome: incomeAgg[0]?.total || 0,
      totalExpense: Math.abs(expenseAgg[0]?.total || 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
