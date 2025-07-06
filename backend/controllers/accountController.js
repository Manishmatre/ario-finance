const Account = require('../models/Account');

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ tenantId: req.tenantId });
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { name, code, type, parentId } = req.body;
    const account = await Account.create({
      name, code, type, parentId, tenantId: req.tenantId, createdBy: req.user?.id
    });
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body, { new: true }
    );
    if (!account) return res.status(404).json({ error: 'Not found' });
    res.json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
