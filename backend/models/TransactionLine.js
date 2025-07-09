const mongoose = require('mongoose');
const TransactionLineSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', required: true }, // The bank account involved
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // The vendor involved (if any)
  amount: { type: Number, required: true },
  narration: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  costCode: String,
  isApproved: { type: Boolean, default: false, index: true },
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('TransactionLine', TransactionLineSchema);
