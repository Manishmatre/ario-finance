const mongoose = require('mongoose');
const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, index: true },
  type: { type: String, enum: ['asset', 'liability', 'equity', 'revenue', 'expense'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('Account', AccountSchema);
