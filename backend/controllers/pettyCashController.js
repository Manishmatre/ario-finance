const PettyCash = require('../models/PettyCash');

exports.getPettyCash = async (req, res) => {
  try {
    const { siteCode } = req.query;
    const filter = { tenantId: req.tenantId };
    if (siteCode) filter.siteCode = siteCode;
    const data = await PettyCash.find(filter);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPettyCash = async (req, res) => {
  try {
    const { siteCode, opening, closing, date, notes } = req.body;
    const entry = await PettyCash.create({
      siteCode, opening, closing, date, notes, tenantId: req.tenantId, createdBy: req.user?.id
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePettyCash = async (req, res) => {
  try {
    const entry = await PettyCash.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true }
    );
    if (!entry) return res.status(404).json({ error: 'Not found' });
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePettyCash = async (req, res) => {
  try {
    const entry = await PettyCash.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
