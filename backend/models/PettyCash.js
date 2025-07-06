const mongoose = require('mongoose');
const PettyCashSchema = new mongoose.Schema({
  siteCode: String,
  opening: Number,
  closing: Number,
  date: Date,
  notes: String,
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('PettyCash', PettyCashSchema);
