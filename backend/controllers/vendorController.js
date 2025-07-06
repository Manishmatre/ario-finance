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
