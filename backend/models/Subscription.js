const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'professional', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'],
    default: 'active'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date
  },
  trialEnd: {
    type: Date
  },
  // Usage limits
  limits: {
    users: { type: Number, default: 1 },
    bankAccounts: { type: Number, default: 1 },
    vendors: { type: Number, default: 10 },
    clients: { type: Number, default: 10 },
    projects: { type: Number, default: 5 },
    transactionsPerMonth: { type: Number, default: 100 },
    storageGB: { type: Number, default: 1 }
  },
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay', 'manual', 'card'],
    default: 'manual'
  },
  paymentProviderId: String, // Stripe customer ID, etc.
  subscriptionProviderId: String, // Stripe subscription ID, etc.
  // Billing details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  nextBillingDate: {
    type: Date
  },
  // Features enabled
  features: {
    advancedReporting: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    multiCurrency: { type: Boolean, default: false },
    auditTrail: { type: Boolean, default: false },
    dataExport: { type: Boolean, default: false }
  },
  // Metadata
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ tenantId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

// Methods
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'trialing';
};

subscriptionSchema.methods.isExpired = function() {
  return new Date() > this.currentPeriodEnd;
};

subscriptionSchema.methods.canUseFeature = function(feature) {
  return this.features[feature] === true;
};

subscriptionSchema.methods.getRemainingDays = function() {
  const now = new Date();
  const end = new Date(this.currentPeriodEnd);
  const diffTime = end - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = mongoose.model('Subscription', subscriptionSchema); 