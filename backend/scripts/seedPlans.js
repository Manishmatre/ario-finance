const mongoose = require('mongoose');
const Plan = require('../models/Plan');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/SSK-finance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const plans = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Perfect for individuals and small businesses getting started',
    price: {
      monthly: 0,
      yearly: 0
    },
    currency: 'INR',
    features: {
      users: 1,
      bankAccounts: 1,
      vendors: 5,
      clients: 5,
      projects: 2,
      transactionsPerMonth: 50,
      storageGB: 0.5,
      advancedReporting: false,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
      multiCurrency: false,
      auditTrail: false,
      dataExport: false,
      whiteLabel: false,
      dedicatedSupport: false
    },
    featureList: [
      { name: '1 User', description: 'Single user access', included: true },
      { name: '1 Bank Account', description: 'Manage one bank account', included: true },
      { name: '5 Vendors', description: 'Track up to 5 vendors', included: true },
      { name: '5 Clients', description: 'Manage up to 5 clients', included: true },
      { name: '2 Projects', description: 'Track up to 2 projects', included: true },
      { name: '50 Transactions/Month', description: 'Process up to 50 transactions per month', included: true },
      { name: '0.5 GB Storage', description: 'File storage space', included: true },
      { name: 'Basic Support', description: 'Email support', included: true },
      { name: 'Advanced Reporting', description: 'Advanced analytics and reports', included: false },
      { name: 'API Access', description: 'REST API for integrations', included: false },
      { name: 'Priority Support', description: 'Priority customer support', included: false },
      { name: 'Custom Branding', description: 'White-label and custom branding', included: false },
      { name: 'Multi-Currency', description: 'Support for multiple currencies', included: false },
      { name: 'Audit Trail', description: 'Detailed activity logs', included: false },
      { name: 'Data Export', description: 'Export data in multiple formats', included: false }
    ],
    isPopular: false,
    isActive: true,
    sortOrder: 1,
    trialDays: 0,
    billingCycle: 'both',
    color: '#6B7280',
    badge: null
  },
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Ideal for growing small businesses',
    price: {
      monthly: 999,
      yearly: 9999
    },
    currency: 'INR',
    features: {
      users: 3,
      bankAccounts: 3,
      vendors: 25,
      clients: 25,
      projects: 10,
      transactionsPerMonth: 500,
      storageGB: 5,
      advancedReporting: true,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
      multiCurrency: false,
      auditTrail: false,
      dataExport: true,
      whiteLabel: false,
      dedicatedSupport: false
    },
    featureList: [
      { name: '3 Users', description: 'Up to 3 team members', included: true },
      { name: '3 Bank Accounts', description: 'Manage multiple bank accounts', included: true },
      { name: '25 Vendors', description: 'Track up to 25 vendors', included: true },
      { name: '25 Clients', description: 'Manage up to 25 clients', included: true },
      { name: '10 Projects', description: 'Track up to 10 projects', included: true },
      { name: '500 Transactions/Month', description: 'Process up to 500 transactions per month', included: true },
      { name: '5 GB Storage', description: 'Increased file storage', included: true },
      { name: 'Advanced Reporting', description: 'Advanced analytics and reports', included: true },
      { name: 'Data Export', description: 'Export data in multiple formats', included: true },
      { name: 'Email Support', description: 'Priority email support', included: true },
      { name: 'API Access', description: 'REST API for integrations', included: false },
      { name: 'Priority Support', description: 'Priority customer support', included: false },
      { name: 'Custom Branding', description: 'White-label and custom branding', included: false },
      { name: 'Multi-Currency', description: 'Support for multiple currencies', included: false },
      { name: 'Audit Trail', description: 'Detailed activity logs', included: false }
    ],
    isPopular: true,
    isActive: true,
    sortOrder: 2,
    trialDays: 14,
    billingCycle: 'both',
    color: '#3B82F6',
    badge: 'Most Popular'
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'For established businesses with advanced needs',
    price: {
      monthly: 2499,
      yearly: 24999
    },
    currency: 'INR',
    features: {
      users: 10,
      bankAccounts: 10,
      vendors: 100,
      clients: 100,
      projects: 50,
      transactionsPerMonth: 2000,
      storageGB: 20,
      advancedReporting: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: false,
      multiCurrency: true,
      auditTrail: true,
      dataExport: true,
      whiteLabel: false,
      dedicatedSupport: false
    },
    featureList: [
      { name: '10 Users', description: 'Up to 10 team members', included: true },
      { name: '10 Bank Accounts', description: 'Manage multiple bank accounts', included: true },
      { name: '100 Vendors', description: 'Track up to 100 vendors', included: true },
      { name: '100 Clients', description: 'Manage up to 100 clients', included: true },
      { name: '50 Projects', description: 'Track up to 50 projects', included: true },
      { name: '2000 Transactions/Month', description: 'Process up to 2000 transactions per month', included: true },
      { name: '20 GB Storage', description: 'Large file storage space', included: true },
      { name: 'Advanced Reporting', description: 'Advanced analytics and reports', included: true },
      { name: 'API Access', description: 'REST API for integrations', included: true },
      { name: 'Priority Support', description: 'Priority customer support', included: true },
      { name: 'Multi-Currency', description: 'Support for multiple currencies', included: true },
      { name: 'Audit Trail', description: 'Detailed activity logs', included: true },
      { name: 'Data Export', description: 'Export data in multiple formats', included: true },
      { name: 'Custom Branding', description: 'White-label and custom branding', included: false },
      { name: 'Dedicated Support', description: 'Dedicated account manager', included: false }
    ],
    isPopular: false,
    isActive: true,
    sortOrder: 3,
    trialDays: 14,
    billingCycle: 'both',
    color: '#8B5CF6',
    badge: null
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For large organizations with unlimited needs',
    price: {
      monthly: 4999,
      yearly: 49999
    },
    currency: 'INR',
    features: {
      users: -1, // Unlimited
      bankAccounts: -1, // Unlimited
      vendors: -1, // Unlimited
      clients: -1, // Unlimited
      projects: -1, // Unlimited
      transactionsPerMonth: -1, // Unlimited
      storageGB: 100,
      advancedReporting: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
      multiCurrency: true,
      auditTrail: true,
      dataExport: true,
      whiteLabel: true,
      dedicatedSupport: true
    },
    featureList: [
      { name: 'Unlimited Users', description: 'Unlimited team members', included: true },
      { name: 'Unlimited Bank Accounts', description: 'Manage unlimited bank accounts', included: true },
      { name: 'Unlimited Vendors', description: 'Track unlimited vendors', included: true },
      { name: 'Unlimited Clients', description: 'Manage unlimited clients', included: true },
      { name: 'Unlimited Projects', description: 'Track unlimited projects', included: true },
      { name: 'Unlimited Transactions', description: 'Process unlimited transactions', included: true },
      { name: '100 GB Storage', description: 'Large file storage space', included: true },
      { name: 'Advanced Reporting', description: 'Advanced analytics and reports', included: true },
      { name: 'API Access', description: 'REST API for integrations', included: true },
      { name: 'Priority Support', description: 'Priority customer support', included: true },
      { name: 'Custom Branding', description: 'White-label and custom branding', included: true },
      { name: 'Multi-Currency', description: 'Support for multiple currencies', included: true },
      { name: 'Audit Trail', description: 'Detailed activity logs', included: true },
      { name: 'Data Export', description: 'Export data in multiple formats', included: true },
      { name: 'White Label', description: 'Remove SSK branding', included: true },
      { name: 'Dedicated Support', description: 'Dedicated account manager', included: true }
    ],
    isPopular: false,
    isActive: true,
    sortOrder: 4,
    trialDays: 30,
    billingCycle: 'both',
    color: '#059669',
    badge: 'Best Value'
  }
];

async function seedPlans() {
  try {
    console.log('Starting to seed plans...');
    
    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans');
    
    // Insert new plans
    const createdPlans = await Plan.insertMany(plans);
    console.log(`Successfully created ${createdPlans.length} plans:`);
    
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: ${plan.slug}`);
    });
    
    console.log('Plan seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding plans:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding
seedPlans(); 