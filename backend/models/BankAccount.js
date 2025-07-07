const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
  // Bank Information
  bankName: { 
    type: String, 
    required: true,
    enum: ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Yes Bank', 'PNB', 'Canara', 'Bank of Baroda', 'Union Bank', 'Other']
  },
  type: { 
    type: String, 
    required: true,
    enum: ['Current', 'Savings', 'Fixed Deposit', 'Recurring Deposit', 'NRE', 'NRO', 'Other']
  },
  
  // Account Details
  accountHolder: { 
    type: String, 
    required: true,
    trim: true
  },
  bankAccountNo: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Bank Codes
  ifsc: { 
    type: String, 
    required: true,
    trim: true,
    uppercase: true,
    match: /^[A-Z]{4}0[A-Z0-9]{6}$/
  },
  
  // Branch Information
  branchName: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Balance Information
  currentBalance: { 
    type: Number, 
    required: true,
    min: 0,
    default: 0
  },
  
  // Account Status
  status: { 
    type: String, 
    required: true,
    enum: ['active', 'inactive', 'dormant', 'frozen'],
    default: 'active'
  },
  
  // Interest Rate (only for interest-bearing accounts)
  interestRate: { 
    type: Number, 
    min: 0,
    max: 100,
    default: 0
  },
  
  // Account Features
  features: {
    internetBanking: { type: Boolean, default: false },
    mobileBanking: { type: Boolean, default: false },
    debitCard: { type: Boolean, default: false },
    chequeBook: { type: Boolean, default: false }
  },
  
  // Additional Information
  notes: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  
  // System Fields
  tenantId: { 
    type: String, 
    required: true, 
    index: true 
  },
  createdBy: { 
    type: String, 
    required: true 
  },
  lastTransactionDate: { 
    type: Date 
  },
  
  // Virtual for account code generation
  accountCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, { 
  timestamps: true 
});

// Generate account code before saving
BankAccountSchema.pre('save', function(next) {
  if (!this.accountCode) {
    const bankCode = this.bankName.substring(0, 3).toUpperCase();
    const accountType = this.type.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.accountCode = `${bankCode}${accountType}${timestamp}`;
  }
  next();
});

// Indexes for better query performance
BankAccountSchema.index({ tenantId: 1, status: 1 });
BankAccountSchema.index({ tenantId: 1, bankName: 1 });
BankAccountSchema.index({ tenantId: 1, type: 1 });
BankAccountSchema.index({ bankAccountNo: 1, tenantId: 1 });

// Virtual for formatted balance
BankAccountSchema.virtual('formattedBalance').get(function() {
  return this.currentBalance.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR'
  });
});

// Method to check if account is interest-bearing
BankAccountSchema.methods.isInterestBearing = function() {
  return ['Savings', 'Fixed Deposit', 'Recurring Deposit', 'NRE', 'NRO'].includes(this.type);
};

// Static method to get accounts by type
BankAccountSchema.statics.getByType = function(tenantId, type) {
  return this.find({ tenantId, type });
};

// Static method to get total balance
BankAccountSchema.statics.getTotalBalance = function(tenantId) {
  return this.aggregate([
    { $match: { tenantId, status: 'active' } },
    { $group: { _id: null, total: { $sum: '$currentBalance' } } }
  ]);
};

module.exports = mongoose.model('BankAccount', BankAccountSchema); 