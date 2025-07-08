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
