const Client = require('../models/Client');

exports.listClients = async (req, res) => {
  try {
    const clients = await Client.find({ tenantId: req.tenantId });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClient = async (req, res) => {
  try {
    console.log('getClient called with:', req.params.id, 'tenantId:', req.tenantId);
    const client = await Client.findOne({ _id: req.params.id, tenantId: req.tenantId });
    console.log('Client found:', client);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    console.error('getClient error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const client = new Client({ ...req.body, tenantId: req.tenantId });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true }
    );
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 