const AdvanceVendor = require('../models/AdvanceVendor');

exports.listAdvances = async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(401).json({ error: 'Unauthorized: tenantId missing' });
    }
    console.log('DEBUG: req.tenantId:', req.tenantId);
    console.log('DEBUG: req.user:', req.user);
    const query = { tenantId: req.tenantId };
    console.log('DEBUG: AdvanceVendor.find query:', query);
    try {
      const advances = await AdvanceVendor.find(query);
      return res.json(advances);
    } catch (err) {
      // fallback: fetch all, filter in JS, log bad docs
      console.error('Fallback: error in AdvanceVendor.find:', err);
      const allDocs = await AdvanceVendor.find({});
      const validDocs = allDocs.filter(doc => doc.tenantId === req.tenantId);
      const badDocs = allDocs.filter(doc => !doc.tenantId);
      if (badDocs.length) {
        console.warn('Found advances with missing tenantId:', badDocs.map(d => d._id));
      }
      return res.json(validDocs);
    }
  } catch (err) {
    console.error('DEBUG: listAdvances error:', err);
    if (err && err.stack) console.error('DEBUG: error stack:', err.stack);
    res.status(500).json({ error: err.message, stack: err.stack });
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

exports.getVendorAdvances = async (req, res) => {
  try {
    const advances = await require('../models/AdvanceVendor').find({ tenantId: req.tenantId, vendorId: req.params.id });
    res.json(advances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 