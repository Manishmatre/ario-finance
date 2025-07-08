const AdvanceVendor = require('../models/AdvanceVendor');

exports.listAdvances = async (req, res) => {
  try {
    const advances = await AdvanceVendor.find({ tenantId: req.tenantId });
    res.json(advances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAdvance = async (req, res) => {
  try {
    const { vendorId, amount, date } = req.body;
    const advance = await AdvanceVendor.create({
      vendorId, amount, date, tenantId: req.tenantId, createdBy: req.user?.id
    });
    res.status(201).json(advance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAdvance = async (req, res) => {
  try {
    const advance = await AdvanceVendor.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!advance) return res.status(404).json({ error: 'Advance not found' });
    res.json(advance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAdvance = async (req, res) => {
  try {
    const advance = await AdvanceVendor.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true }
    );
    if (!advance) return res.status(404).json({ error: 'Advance not found' });
    res.json(advance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAdvance = async (req, res) => {
  try {
    const advance = await AdvanceVendor.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!advance) return res.status(404).json({ error: 'Advance not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 