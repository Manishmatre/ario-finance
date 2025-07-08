const Vendor = require('../models/Vendor');
const PurchaseBill = require('../models/PurchaseBill');
const AdvanceVendor = require('../models/AdvanceVendor');

exports.listVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ tenantId: req.tenantId });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { name, gstNo, phone, address } = req.body;
    const vendor = await Vendor.create({
      name, gstNo, phone, address, tenantId: req.tenantId, createdBy: req.user?.id
    });
    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getVendor = async (req, res) => {
  try {
    // TEMP: Remove tenantId check for debugging
    const vendor = await Vendor.findOne({ _id: req.params.id });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
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
    const bills = await require('../models/PurchaseBill').find({ tenantId: req.tenantId, vendorId: req.params.id });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVendorPayments = async (req, res) => {
  try {
    // Placeholder: implement actual payments model if available
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVendorLedger = async (req, res) => {
  try {
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
    const ledgerEntries = [
      ...bills.map(bill => ({
        _id: bill._id,
        type: 'Bill',
        date: bill.billDate || bill.createdAt,
        amount: bill.amount,
        debit: bill.amount,
        credit: 0,
        ref: bill.billNo || '',
        note: 'Purchase Bill',
      })),
      ...advances.map(adv => ({
        _id: adv._id,
        type: 'Advance',
        date: adv.date || adv.createdAt,
        amount: adv.amount,
        debit: 0,
        credit: adv.amount,
        ref: '',
        note: adv.cleared ? 'Advance (Cleared)' : 'Advance',
      })),
      // ...payments.map(payment => ({ ... }))
    ];

    // Sort by date ascending
    ledgerEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(ledgerEntries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
