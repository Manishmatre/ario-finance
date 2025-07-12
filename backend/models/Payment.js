const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'upi', 'wallet'],
    default: 'card'
  },
  // Payment gateway information
  gateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'manual'],
    default: 'manual'
  },
  gatewayPaymentId: String,
  gatewayRefundId: String,
  // Card information (encrypted in production)
  cardInfo: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  // Billing information
  billingAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'IN'
    }
  },
  // Metadata
  metadata: {
    type: Map,
    of: String
  },
  // Error information
  errorCode: String,
  errorMessage: String,
  // Timestamps
  processedAt: Date,
  refundedAt: Date
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ tenantId: 1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Methods
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'succeeded';
};

paymentSchema.methods.isRefundable = function() {
  return this.status === 'succeeded' && !this.refundedAt;
};

paymentSchema.methods.canRefund = function() {
  const refundWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
  return this.isRefundable() && (Date.now() - this.processedAt.getTime()) < refundWindow;
};

module.exports = mongoose.model('Payment', paymentSchema); 