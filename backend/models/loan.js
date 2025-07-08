const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoanSchema = new Schema({
  loanNumber: {
    type: String,
    required: true,
    unique: true
  },
  applicant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    enum: ['PERSONAL', 'BUSINESS', 'MORTGAGE', 'EDUCATION', 'VEHICLE'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number,
    required: true,
    unit: 'months'
  },
  status: {
    type: String,
    enum: ['APPLIED', 'APPROVED', 'DISBURSED', 'REPAYING', 'CLOSED', 'DEFAULTED'],
    default: 'APPLIED'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  disbursementDate: {
    type: Date
  },
  monthlyInstallment: {
    type: Number
  },
  remainingBalance: {
    type: Number
  },
  payments: [{
    date: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'OVERDUE']
    }
  }],
  documents: [{
    type: String,
    name: String,
    url: String,
    category: {
      type: String,
      enum: ['IDENTIFICATION', 'INCOME', 'PROPERTY', 'OTHER'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    remarks: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  remarks: String,
  guarantors: [{
    name: String,
    relationship: String,
    contact: String,
    address: String,
    documents: [{
      type: String,
      name: String,
      url: String,
      category: String,
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
      }
    }]
  }],
  collateral: [{
    type: String,
    description: String,
    value: Number,
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    documents: [{
      type: String,
      name: String,
      url: String,
      category: String,
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
      }
    }]
  }],
  riskRating: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  repaymentHistory: [{
    date: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'DELAYED', 'DEFAULTED'],
      default: 'PENDING'
    },
    remarks: String
  }],
  nextPaymentDue: {
    type: Date
  },
  latePayments: Number,
  daysLate: Number,
  lastPaymentDate: Date,
  notifications: [{
    type: {
      type: String,
      enum: ['PAYMENT_REMINDER', 'OVERDUE_PAYMENT', 'APPROVAL', 'DISBURSEMENT'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['PAYMENT_DUE', 'PAYMENT_OVERDUE', 'DEFAULT_RISK', 'DOCUMENT_PENDING', 'GUARANTOR_PENDING', 'COLLATERAL_PENDING'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', LoanSchema);
