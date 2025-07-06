const mongoose = require('mongoose');
const TransactionLineSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  debitAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  creditAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  amount: { type: Number, required: true },
  narration: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  costCode: String,
  isApproved: { type: Boolean, default: false, index: true },
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('TransactionLine', TransactionLineSchema);
