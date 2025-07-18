const mongoose = require('mongoose');
const PurchaseBillSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  billNo: String,
  billDate: Date,
  amount: Number,
  // GST and Invoice Details
  gstinSupplier: String, // GSTIN of supplier
  tradeLegalName: String, // Trade/Legal name
  invoiceType: String, // Invoice type
  invoiceValue: Number, // Invoice Value (₹)
  placeOfSupply: String, // Place of supply
  reverseCharge: { type: Boolean, default: false }, // Supply Attract Reverse Charge
  gstRate: Number, // Rate (%)
  taxableValue: Number, // Taxable Value (₹)
  taxAmount: {
    integratedTax: Number, // Integrated Tax (₹)
    centralTax: Number, // Central Tax (₹)
    stateTax: Number, // State/UT Tax (₹)
    cess: Number // Cess (₹)
  },
  total: Number, // TOTAL
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
  cashOnly: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('PurchaseBill', PurchaseBillSchema);
