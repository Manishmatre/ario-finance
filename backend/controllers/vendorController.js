const Vendor = require('../models/Vendor');
const PurchaseBill = require('../models/PurchaseBill');
const AdvanceVendor = require('../models/AdvanceVendor');

exports.listVendors = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const vendors = await Vendor.find({ tenantId: req.tenantId });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const { name, gstNo, phone, address, bankAccounts, paymentModes } = req.body;
    const vendor = await Vendor.create({
      name, gstNo, phone, address, bankAccounts, paymentModes, tenantId: req.tenantId, createdBy: req.user?.id
    });
    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getVendor = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    // Add tenantId check for correct and fast lookup
    const vendor = await Vendor.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true }
    );
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Vendor summary API
exports.getVendorSummary = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const tenantId = req.tenantId;

    // Total vendors
    const totalVendors = await Vendor.countDocuments({ tenantId });

    // Total outstanding: sum of all unpaid bills minus advances
    const unpaidBills = await PurchaseBill.aggregate([
      { $match: { tenantId, isPaid: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalUnpaid = unpaidBills[0]?.total || 0;
    const advances = await AdvanceVendor.aggregate([
      { $match: { tenantId, cleared: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalAdvances = advances[0]?.total || 0;
    const totalOutstanding = totalUnpaid - totalAdvances;

    // Active vendors: vendors with at least one unpaid bill
    const activeVendors = await PurchaseBill.distinct("vendorId", { tenantId, isPaid: false });
    const activeVendorsCount = activeVendors.length;

    // Categories: count of distinct GST numbers
    const categories = await Vendor.distinct("gstNo", { tenantId });
    const totalCategories = categories.filter(Boolean).length;

    res.json({
      totalVendors,
      totalOutstanding,
      activeVendors: activeVendorsCount,
      totalCategories
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVendorBills = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const bills = await require('../models/PurchaseBill').find({ tenantId: req.tenantId, vendorId: req.params.id });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVendorPayments = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    // Placeholder: implement actual payments model if available
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVendorLedger = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const tenantId = req.tenantId;
    const vendorId = req.params.id;
    const PurchaseBill = require('../models/PurchaseBill');
    const AdvanceVendor = require('../models/AdvanceVendor');
    // Placeholder for payments, if you have a model
    // const Payment = require('../models/Payment');

    // Fetch all bills and advances for this vendor
    const [bills, advances] = await Promise.all([
      PurchaseBill.find({ tenantId, vendorId }),
      AdvanceVendor.find({ tenantId, vendorId })
    ]);

    // Format as ledger entries
    let ledgerEntries = [
      ...bills.map(bill => ({
        _id: bill._id,
        type: 'Bill',
        date: bill.billDate || bill.createdAt,
        amount: bill.amount,
        debit: 0,
        credit: bill.amount,
        ref: bill.billNo || '',
        note: 'Purchase Bill',
      })),
      ...advances.map(adv => ({
        _id: adv._id,
        type: 'Advance',
        date: adv.date || adv.createdAt,
        amount: adv.amount,
        debit: adv.amount, // CHANGED: advances are now debit
        credit: 0,         // CHANGED: advances are not credit
        ref: '',
        note: adv.cleared ? 'Advance (Cleared)' : 'Advance',
      })),
      // Add bill payments as debit entries
      ...bills.flatMap(bill =>
        (bill.payments || []).map((payment, idx) => ({
          _id: `${bill._id}-payment-${idx}`,
          type: 'Payment',
          date: payment.date || bill.updatedAt || bill.createdAt,
          amount: payment.amount,
          debit: payment.amount,
          credit: 0,
          ref: bill.billNo || '',
          note: 'Bill Payment',
        }))
      ),
    ];

    // Sort by date ascending
    ledgerEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let balance = 0;
    ledgerEntries = ledgerEntries.map(entry => {
      balance += (entry.debit || 0) - (entry.credit || 0);
      return { ...entry, balance };
    });

    res.json(ledgerEntries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unified vendor payment endpoint
exports.createVendorPayment = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const { vendorId, amount, date, type, bills } = req.body;
    if (!vendorId || !amount || !date || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (type === 'advance') {
      // Create an advance
      const adv = await AdvanceVendor.create({
        vendorId,
        amount,
        date,
        cleared: false,
        tenantId: req.tenantId,
        createdBy: req.user?.id
      });
      return res.status(201).json({ message: 'Advance payment recorded', advance: adv });
    } else if (type === 'bill') {
      if (!Array.isArray(bills) || bills.length === 0) {
        return res.status(400).json({ error: 'No bills selected for payment' });
      }
      // Pay bills in order until amount is exhausted
      let remaining = amount;
      const updatedBills = [];
      for (const billId of bills) {
        if (remaining <= 0) break;
        const bill = await PurchaseBill.findOne({ _id: billId, vendorId, tenantId: req.tenantId });
        if (!bill) continue;
        const paidSoFar = (bill.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        const toPay = Math.min(remaining, bill.amount - paidSoFar);
        if (toPay > 0) {
          bill.payments = bill.payments || [];
          bill.payments.push({
            amount: toPay,
            date: new Date(date),
            paymentMode: 'manual',
            // Add more fields as needed
          });
          // Update payment status
          const totalPaid = paidSoFar + toPay;
          if (totalPaid >= bill.amount) {
            bill.isPaid = true;
            bill.paymentStatus = 'paid';
          } else if (totalPaid > 0) {
            bill.isPaid = false;
            bill.paymentStatus = 'partial';
          } else {
            bill.isPaid = false;
            bill.paymentStatus = 'pending';
          }
          await bill.save();
          updatedBills.push(bill);
          remaining -= toPay;
        }
      }
      return res.status(201).json({ message: 'Bill payment(s) recorded', updatedBills });
    } else {
      return res.status(400).json({ error: 'Invalid payment type' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
