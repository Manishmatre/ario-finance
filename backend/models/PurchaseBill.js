const mongoose = require('mongoose');
const PurchaseBillSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  billNo: String,
  billDate: Date,
  amount: Number,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  fileUrl: String,
  isPaid: { type: Boolean, default: false },
  relatedTxnId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransactionLine' },
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('PurchaseBill', PurchaseBillSchema);
