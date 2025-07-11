const TransactionLine = require("../models/TransactionLine");
const PurchaseBill = require("../models/PurchaseBill");
const BankAccount = require("../models/BankAccount");

exports.getKPIs = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    // Calculate total bank balance
    const bankBalanceAgg = await BankAccount.aggregate([
      { $match: { tenantId } },
      { $group: { _id: null, total: { $sum: "$currentBalance" } } },
    ]);
    const totalBalance = bankBalanceAgg[0]?.total || 0;

    const payables = await PurchaseBill.aggregate([
      { $match: { tenantId, isPaid: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate totalIncome (amount > 0) and totalExpense (amount < 0)
    const incomeAgg = await TransactionLine.aggregate([
      { $match: { tenantId, amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const expenseAgg = await TransactionLine.aggregate([
      { $match: { tenantId, amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      cashInHand: totalBalance,
      budgetVsActual: 0.9,
      payables: payables[0]?.total || 0,
      receivables: 8000,
      totalIncome: incomeAgg[0]?.total || 0,
      totalExpense: Math.abs(expenseAgg[0]?.total || 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMonthlyIncomeExpense = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    // Aggregate by year and month for income and expense (all years)
    const monthlyAgg = await TransactionLine.aggregate([
      { $match: { tenantId } },
      {
        $project: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          amount: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          income: { $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $lt: ["$amount", 0] }, "$amount", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    // Format result as array of { year, month, income, expense }
    const result = monthlyAgg.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      income: m.income,
      expense: Math.abs(m.expense),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Universal search across major entities
exports.universalSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Query too short" });
    }
    const tenantId = req.tenantId;
    // Import models here to avoid circular deps
    const Client = require("../models/Client");
    const Vendor = require("../models/Vendor");
    const Project = require("../models/Project");
    const Product = require("../models/Product");
    const Expense = require("../models/Expense");
    const TransactionLine = require("../models/TransactionLine");
    const Loan = require("../models/loan");
    const GRN = require("../models/GRN");
    const PurchaseOrder = require("../models/PurchaseOrder");
    const Employee = require("../models/Employee");
    const PurchaseBill = require("../models/PurchaseBill");
    const BankAccount = require("../models/BankAccount");

    // Parallel search
    const [
      clients,
      vendors,
      projects,
      products,
      expenses,
      transactions,
      loans,
      grns,
      purchaseOrders,
      employees,
      bills,
      bankAccounts
    ] = await Promise.all([
      Client.find({
        tenantId,
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
        ],
      }).limit(5),
      Vendor.find({
        tenantId,
        $or: [
          { name: { $regex: query, $options: "i" } },
          { gstNo: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
        ],
      }).limit(5),
      Project.find({ tenantId, name: { $regex: query, $options: "i" } }).limit(
        5,
      ),
      Product.find({
        tenantId,
        $or: [
          { name: { $regex: query, $options: "i" } },
          { code: { $regex: query, $options: "i" } },
          { hsnCode: { $regex: query, $options: "i" } },
        ],
      }).limit(5),
      Expense.find({
        tenantId,
        description: { $regex: query, $options: "i" },
      }).limit(5),
      TransactionLine.find({
        tenantId,
        narration: { $regex: query, $options: "i" },
      }).limit(5),
      Loan.find({
        tenantId,
        $or: [
          { "applicant.name": { $regex: query, $options: "i" } },
          { loanNumber: { $regex: query, $options: "i" } },
        ],
      }).limit(5),
      GRN.find({
        tenantId,
        $or: [
          { grnNumber: { $regex: query, $options: "i" } },
          { poRef: { $regex: query, $options: "i" } },
        ],
      }).limit(5),
      PurchaseOrder.find({
        tenantId,
        $or: [{ poRef: { $regex: query, $options: "i" } }],
      }).limit(5),
      Employee.find({
        tenantId,
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
        ],
      }).limit(5),
      PurchaseBill.find({
        tenantId,
        $or: [
          { billNo: { $regex: query, $options: "i" } },
          { vendor: { $regex: query, $options: "i" } },
        ],
      }).populate('vendorId', 'name').limit(5),
      BankAccount.find({
        tenantId,
        $or: [
          { accountName: { $regex: query, $options: "i" } },
          { bankName: { $regex: query, $options: "i" } },
          { accountNumber: { $regex: query, $options: "i" } },
        ],
      }).limit(5),
    ]);

    res.json({
      clients: clients.map((c) => ({
        type: "client",
        id: c._id.toString(),
        label: c.name,
        extra: c.email || c.phone,
      })),
      vendors: vendors.map((v) => ({
        type: "vendor",
        id: v._id,
        label: v.name,
        extra: v.gstNo || v.phone,
      })),
      projects: projects.map((p) => ({
        type: "project",
        id: p._id,
        label: p.name,
        extra: p.client,
      })),
      products: products.map((p) => ({
        type: "product",
        id: p._id,
        label: p.name,
        extra: p.code || p.hsnCode,
      })),
      expenses: expenses.map((e) => ({
        type: "expense",
        id: e._id,
        label: e.description,
        extra: e.amount,
      })),
      transactions: transactions.map((t) => ({
        type: "transaction",
        id: t._id,
        label: t.narration,
        extra: t.amount,
      })),
      loans: loans.map((l) => ({
        type: "loan",
        id: l._id,
        label: l.loanNumber,
        extra: l["applicant.name"],
      })),
      grns: grns.map((g) => ({
        type: "grn",
        id: g._id,
        label: g.grnNumber,
        extra: g.poRef,
      })),
      purchaseOrders: purchaseOrders.map((po) => ({
        type: "purchaseOrder",
        id: po._id,
        label: po.poRef,
      })),
      employees: employees.map((e) => ({
        type: "employee",
        id: e._id.toString(),
        label: e.name,
        extra: e.email || e.phone,
      })),
      bills: bills.map((b) => ({
        type: "bill",
        id: b._id.toString(),
        label: b.billNo,
        extra: b.vendorId?.name || b.vendor || `₹${b.amount}`,
      })),
      bankAccounts: bankAccounts.map((ba) => ({
        type: "bankAccount",
        id: ba._id.toString(),
        label: ba.accountName,
        extra: `${ba.bankName} - ₹${ba.currentBalance?.toLocaleString()}`,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
