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
