const GRN = require('../models/GRN');

exports.matchGRN = async (req, res) => {
  try {
    const { poRef, vendorId, grnDate, items } = req.body;
    const grn = await GRN.create({
      poRef, vendorId, grnDate, items, billMatched: false, tenantId: req.tenantId, createdBy: req.user?.id
    });
    res.status(201).json(grn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
