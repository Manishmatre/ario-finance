const PurchaseBill = require('../models/PurchaseBill');
const { uploadFile } = require('../utils/storage');

exports.uploadBill = async (req, res) => {
  try {
    const { vendorId, billNo, billDate, amount, projectId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    const bill = await PurchaseBill.create({
      vendorId, billNo, billDate, amount, projectId,
      fileUrl, tenantId: req.tenantId, createdBy: req.user?.id
    });
    const populatedBill = await PurchaseBill.findById(bill._id).populate('vendorId', 'name');
    res.status(201).json(populatedBill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.payBill = async (req, res) => {
  try {
    const bill = await PurchaseBill.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isPaid: true }, { new: true }
    ).populate('vendorId', 'name');
    if (!bill) return res.status(404).json({ error: 'Not found' });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listBills = async (req, res) => {
  try {
    const bills = await PurchaseBill.find({ tenantId: req.tenantId }).populate('vendorId', 'name');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    const bill = await PurchaseBill.findOne({ _id: req.params.id, tenantId: req.tenantId }).populate('vendorId', 'name');
    if (!bill) return res.status(404).json({ error: 'Not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const bill = await PurchaseBill.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true }
    ).populate('vendorId', 'name');
    if (!bill) return res.status(404).json({ error: 'Not found' });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const bill = await PurchaseBill.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!bill) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
