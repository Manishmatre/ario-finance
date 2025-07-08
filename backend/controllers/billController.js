const PurchaseBill = require('../models/PurchaseBill');
const { uploadFile } = require('../utils/storage');

exports.uploadBill = async (req, res) => {
  try {
    const { vendorId, billNo, billDate, amount, projectId } = req.body;
    console.log('Received uploadBill request');
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    let fileUrl;
    try {
      fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      console.log('Cloudinary upload success, fileUrl:', fileUrl);
      if (!fileUrl || typeof fileUrl !== 'string' || !/^https?:\/\//.test(fileUrl)) {
        console.error('Cloudinary did not return a valid URL:', fileUrl);
      }
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      return res.status(500).json({ error: 'File upload failed', details: uploadErr.message || uploadErr });
    }
    let fixedVendorId = vendorId;
    if (vendorId && typeof vendorId === 'object') {
      fixedVendorId = vendorId._id || vendorId.value || '';
      if (Array.isArray(vendorId)) fixedVendorId = vendorId[0];
      if (typeof fixedVendorId === 'object') fixedVendorId = String(fixedVendorId);
    }
    const bill = await PurchaseBill.create({
      vendorId: fixedVendorId, billNo, billDate, amount, projectId,
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
    let vendorId = req.body.vendorId;
    let fixedVendorId = vendorId;
    if (vendorId && typeof vendorId === 'object') {
      fixedVendorId = vendorId._id || vendorId.value || '';
      if (Array.isArray(vendorId)) fixedVendorId = vendorId[0];
      if (typeof fixedVendorId === 'object') fixedVendorId = String(fixedVendorId);
    }
    let updateData = {
      ...req.body,
      vendorId: fixedVendorId
    };
    if (req.file) {
      try {
        const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
        updateData.fileUrl = fileUrl;
      } catch (uploadErr) {
        console.error('Cloudinary upload error (updateBill):', uploadErr);
        return res.status(500).json({ error: 'File upload failed', details: uploadErr.message || uploadErr });
      }
    }
    const bill = await PurchaseBill.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      updateData,
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
