const mongoose = require('mongoose');

const projectPaymentSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: [true, 'Project ID is required'] 
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  paymentMethod: { 
    type: String, 
    enum: ['bank_transfer', 'check', 'cash', 'upi'],
    required: [true, 'Payment method is required']
  },
  referenceNumber: String,
  bankAccountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BankAccount' 
  },
  notes: String,
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionLine'
  },
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
projectPaymentSchema.index({ projectId: 1, paymentDate: -1 });
projectPaymentSchema.index({ tenantId: 1, paymentDate: -1 });

module.exports = mongoose.model('ProjectPayment', projectPaymentSchema);
