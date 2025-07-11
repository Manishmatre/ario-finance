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
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  payments: [{
    amount: Number,
    date: Date,
    paymentMode: String,
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransactionLine' },
    vendorBankAccount: {
      accountHolder: String,
      bankName: String,
      accountNumber: String,
      ifsc: String,
      branch: String,
      notes: String
    },
  }],
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('PurchaseBill', PurchaseBillSchema);
