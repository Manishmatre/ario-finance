const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    monthly: {
      type: Number,
      required: true
    },
    yearly: {
      type: Number,
      required: true
    }
  },
  currency: {
    type: String,
    default: 'INR'
  },
  // Features included
  features: {
    users: { type: Number, default: 1 },
    bankAccounts: { type: Number, default: 1 },
    vendors: { type: Number, default: 10 },
    clients: { type: Number, default: 10 },
    projects: { type: Number, default: 5 },
    transactionsPerMonth: { type: Number, default: 100 },
    storageGB: { type: Number, default: 1 },
    // Premium features
    advancedReporting: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    multiCurrency: { type: Boolean, default: false },
    auditTrail: { type: Boolean, default: false },
    dataExport: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    dedicatedSupport: { type: Boolean, default: false }
  },
  // Feature descriptions for display
  featureList: [{
    name: String,
    description: String,
    included: { type: Boolean, default: true }
  }],
  // Plan metadata
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  // Trial settings
  trialDays: {
    type: Number,
    default: 0
  },
  // Billing settings
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly', 'both'],
    default: 'both'
  },
  // Display settings
  color: {
    type: String,
    default: '#3B82F6'
  },
  badge: {
    type: String,
    default: null // e.g., "Most Popular", "Best Value"
  }
}, {
  timestamps: true
});

// Indexes
planSchema.index({ slug: 1 });
planSchema.index({ isActive: 1 });
planSchema.index({ sortOrder: 1 });

// Methods
planSchema.methods.getPrice = function(cycle = 'monthly') {
  return this.price[cycle] || this.price.monthly;
};

planSchema.methods.getYearlyDiscount = function() {
  const monthly = this.price.monthly * 12;
  const yearly = this.price.yearly;
  return Math.round(((monthly - yearly) / monthly) * 100);
};

planSchema.methods.hasFeature = function(feature) {
  return this.features[feature] === true || this.features[feature] > 0;
};

module.exports = mongoose.model('Plan', planSchema); 