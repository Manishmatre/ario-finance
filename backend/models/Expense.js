const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
  description: { type: String, trim: true },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['cash', 'bank_transfer', 'credit_card', 'debit_card', 'upi', 'other']
  },
  referenceNo: { type: String, trim: true },
  receipt: { type: String }, // URL to the receipt file
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  notes: { type: String, trim: true },
  tenantId: { type: String, required: true, index: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
  details: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Indexes
ExpenseSchema.index({ tenantId: 1, date: -1 });
ExpenseSchema.index({ tenantId: 1, category: 1 });
ExpenseSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
