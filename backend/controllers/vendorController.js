const Vendor = require('../models/Vendor');

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
