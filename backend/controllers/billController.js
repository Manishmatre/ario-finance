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
    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.payBill = async (req, res) => {
  try {
    const bill = await PurchaseBill.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isPaid: true }, { new: true }
    );
    if (!bill) return res.status(404).json({ error: 'Not found' });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
