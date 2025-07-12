const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Get all available plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .sort({ sortOrder: 1, price: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current user's subscription
exports.getCurrentSubscription = async (req, res) => {
  try {
    console.log('getCurrentSubscription called with tenantId:', req.tenantId);
    console.log('User data:', req.user);
    
    // If no tenantId (user not authenticated), return default free subscription
    if (!req.tenantId) {
      console.log('No tenantId found, returning default free subscription');
      const freePlan = await Plan.findOne({ slug: 'free' });
      if (!freePlan) {
        return res.status(404).json({ error: 'Free plan not found' });
      }
      
      return res.json({
        plan: 'free',
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        amount: 0,
        limits: freePlan.features,
        features: freePlan.features,
        getRemainingDays: function() {
          const now = new Date();
          const end = new Date(this.currentPeriodEnd);
          const diffTime = end - now;
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      });
    }

    const subscription = await Subscription.findOne({ 
      tenantId: req.tenantId 
    }).populate('plan');
    
    console.log('Found subscription:', subscription);
    
    if (!subscription) {
      console.log('No subscription found, creating free subscription');
      // Create free subscription if none exists
      const freePlan = await Plan.findOne({ slug: 'free' });
      if (!freePlan) {
        return res.status(404).json({ error: 'Free plan not found' });
      }
      
      const newSubscription = new Subscription({
        tenantId: req.tenantId,
        plan: 'free',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        amount: 0,
        limits: freePlan.features,
        features: freePlan.features
      });
      
      await newSubscription.save();
      const subscriptionObj = newSubscription.toObject();
      subscriptionObj.getRemainingDays = function() {
        const now = new Date();
        const end = new Date(this.currentPeriodEnd);
        const diffTime = end - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      };
      return res.json(subscriptionObj);
    }
    
    // Convert to plain object and add the getRemainingDays method
    const subscriptionObj = subscription.toObject();
    subscriptionObj.getRemainingDays = function() {
      const now = new Date();
      const end = new Date(this.currentPeriodEnd);
      const diffTime = end - now;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    res.json(subscriptionObj);
  } catch (err) {
    console.error('Error in getCurrentSubscription:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create new subscription
exports.createSubscription = async (req, res) => {
  try {
    const { planSlug, billingCycle, paymentMethod, paymentId } = req.body;
    
    // Get the plan
    const plan = await Plan.findOne({ slug: planSlug, isActive: true });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Verify payment if paymentId is provided
    if (paymentId) {
      const payment = await Payment.findOne({ paymentId, tenantId: req.tenantId });
      if (!payment || !payment.isSuccessful()) {
        return res.status(400).json({ error: 'Invalid or failed payment' });
      }
    }
    
    // Check if user already has a subscription
    const existingSubscription = await Subscription.findOne({ 
      tenantId: req.tenantId 
    });
    
    let subscription;
    
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.plan = planSlug;
      existingSubscription.billingCycle = billingCycle;
      existingSubscription.amount = plan.getPrice(billingCycle);
      existingSubscription.limits = plan.features;
      existingSubscription.features = plan.features;
      existingSubscription.paymentMethod = paymentMethod;
      
      // Recalculate billing period
      const now = new Date();
      if (billingCycle === 'yearly') {
        existingSubscription.currentPeriodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      } else {
        existingSubscription.currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
      existingSubscription.nextBillingDate = existingSubscription.currentPeriodEnd;
      existingSubscription.status = 'active';
      
      await existingSubscription.save();
      subscription = existingSubscription;
    } else {
      // Create new subscription
      const now = new Date();
      const trialDays = plan.trialDays || 0;
      const trialEnd = trialDays > 0 ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
      
      let currentPeriodEnd;
      if (billingCycle === 'yearly') {
        currentPeriodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      } else {
        currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
      
      subscription = new Subscription({
        tenantId: req.tenantId,
        plan: planSlug,
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEnd,
        status: trialDays > 0 ? 'trialing' : 'active',
        amount: plan.getPrice(billingCycle),
        currency: plan.currency,
        paymentMethod,
        limits: plan.features,
        features: plan.features,
        nextBillingDate: currentPeriodEnd
      });
      
      await subscription.save();
    }
    
    // Update payment with subscription ID
    if (paymentId) {
      await Payment.findOneAndUpdate(
        { paymentId },
        { subscriptionId: subscription._id }
      );
    }
    
    // Convert to plain object and add the getRemainingDays method
    const subscriptionObj = subscription.toObject();
    subscriptionObj.getRemainingDays = function() {
      const now = new Date();
      const end = new Date(this.currentPeriodEnd);
      const diffTime = end - now;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    res.status(201).json(subscriptionObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      tenantId: req.tenantId 
    });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    subscription.cancelAtPeriodEnd = true;
    subscription.cancelledAt = new Date();
    await subscription.save();
    
    res.json({ message: 'Subscription will be cancelled at the end of the current period' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reactivate subscription
exports.reactivateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      tenantId: req.tenantId 
    });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    subscription.cancelAtPeriodEnd = false;
    subscription.cancelledAt = null;
    await subscription.save();
    
    res.json({ message: 'Subscription reactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upgrade/downgrade subscription
exports.changePlan = async (req, res) => {
  try {
    const { planSlug, billingCycle } = req.body;
    
    const plan = await Plan.findOne({ slug: planSlug, isActive: true });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    const subscription = await Subscription.findOne({ 
      tenantId: req.tenantId 
    });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Update subscription
    subscription.plan = planSlug;
    subscription.billingCycle = billingCycle;
    subscription.amount = plan.getPrice(billingCycle);
    subscription.limits = plan.features;
    subscription.features = plan.features;
    
    // Recalculate billing period
    const now = new Date();
    if (billingCycle === 'yearly') {
      subscription.currentPeriodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    } else {
      subscription.currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    subscription.nextBillingDate = subscription.currentPeriodEnd;
    
    await subscription.save();
    
    // Create a Payment record for the plan change (even if free/coupon)
    const planObj = await Plan.findOne({ slug: subscription.plan });
    const payment = new Payment({
      paymentId: `change_${uuidv4()}`,
      tenantId: subscription.tenantId,
      subscriptionId: subscription._id,
      amount: subscription.amount,
      currency: subscription.currency || 'INR',
      status: 'succeeded',
      paymentMethod: subscription.paymentMethod || 'manual',
      description: `Plan Change: ${planObj ? planObj.name : subscription.plan} - ${subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}`,
      processedAt: new Date()
    });
    await payment.save();
    
    // Convert to plain object and add the getRemainingDays method
    const subscriptionObj = subscription.toObject();
    subscriptionObj.getRemainingDays = function() {
      const now = new Date();
      const end = new Date(this.currentPeriodEnd);
      const diffTime = end - now;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    res.json(subscriptionObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get usage statistics
exports.getUsage = async (req, res) => {
  try {
    // If no tenantId (user not authenticated), return default usage
    if (!req.tenantId) {
      const freePlan = await Plan.findOne({ slug: 'free' });
      if (!freePlan) {
        return res.status(404).json({ error: 'Free plan not found' });
      }
      
      const defaultUsage = {
        users: 0,
        bankAccounts: 0,
        vendors: 0,
        clients: 0,
        projects: 0,
        transactionsThisMonth: 0
      };
      
      const limits = freePlan.features;
      const usagePercentages = {
        users: 0,
        bankAccounts: 0,
        vendors: 0,
        clients: 0,
        projects: 0,
        transactionsThisMonth: 0
      };
      
      return res.json({
        subscription: {
          plan: 'free',
          status: 'active',
          limits: limits
        },
        usage: defaultUsage,
        usagePercentages,
        limits
      });
    }

    const subscription = await Subscription.findOne({ 
      tenantId: req.tenantId 
    });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Get current usage counts
    const usage = {
      users: await User.countDocuments({ tenantId: req.tenantId }),
      bankAccounts: await require('../models/BankAccount').countDocuments({ tenantId: req.tenantId }),
      vendors: await require('../models/Vendor').countDocuments({ tenantId: req.tenantId }),
      clients: await require('../models/Client').countDocuments({ tenantId: req.tenantId }),
      projects: await require('../models/Project').countDocuments({ tenantId: req.tenantId }),
      transactionsThisMonth: await require('../models/TransactionLine').countDocuments({
        tenantId: req.tenantId,
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    };
    
    // Calculate usage percentages
    const limits = subscription.limits;
    const usagePercentages = {
      users: Math.round((usage.users / limits.users) * 100),
      bankAccounts: Math.round((usage.bankAccounts / limits.bankAccounts) * 100),
      vendors: Math.round((usage.vendors / limits.vendors) * 100),
      clients: Math.round((usage.clients / limits.clients) * 100),
      projects: Math.round((usage.projects / limits.projects) * 100),
      transactionsThisMonth: Math.round((usage.transactionsThisMonth / limits.transactionsPerMonth) * 100)
    };
    
    res.json({
      subscription,
      usage,
      usagePercentages,
      limits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check if user can perform action (usage limits)
exports.checkUsageLimit = async (req, res, next) => {
  try {
    const { action, resource } = req.body;
    
    const subscription = await Subscription.findOne({ 
      tenantId: req.tenantId 
    });
    
    if (!subscription || !subscription.isActive()) {
      return res.status(403).json({ error: 'No active subscription' });
    }
    
    // Get current usage
    let currentUsage = 0;
    switch (resource) {
      case 'users':
        currentUsage = await User.countDocuments({ tenantId: req.tenantId });
        break;
      case 'bankAccounts':
        currentUsage = await require('../models/BankAccount').countDocuments({ tenantId: req.tenantId });
        break;
      case 'vendors':
        currentUsage = await require('../models/Vendor').countDocuments({ tenantId: req.tenantId });
        break;
      case 'clients':
        currentUsage = await require('../models/Client').countDocuments({ tenantId: req.tenantId });
        break;
      case 'projects':
        currentUsage = await require('../models/Project').countDocuments({ tenantId: req.tenantId });
        break;
      default:
        return res.status(400).json({ error: 'Invalid resource type' });
    }
    
    const limit = subscription.limits[resource];
    
    if (currentUsage >= limit) {
      return res.status(403).json({ 
        error: `Usage limit exceeded for ${resource}`,
        currentUsage,
        limit
      });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get billing history
exports.getBillingHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { planSlug, billingCycle, amount, paymentData } = req.body;
    
    // Get the plan
    const plan = await Plan.findOne({ slug: planSlug, isActive: true });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Validate payment data
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
      return res.status(400).json({ error: 'Missing required payment information' });
    }

    // Simulate payment processing (in real implementation, integrate with Stripe/Razorpay)
    // For demo purposes, we'll simulate a successful payment
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create payment record
    const payment = new Payment({
      paymentId,
      tenantId: req.tenantId,
      amount,
      currency: 'INR',
      status: 'succeeded',
      paymentMethod: 'card',
      gateway: 'manual',
      cardInfo: {
        last4: paymentData.cardNumber.slice(-4),
        brand: 'visa', // In real implementation, detect from card number
        expiryMonth: parseInt(paymentData.expiryDate.split('/')[0]),
        expiryYear: parseInt('20' + paymentData.expiryDate.split('/')[1])
      },
      billingAddress: paymentData.billingAddress,
      processedAt: new Date()
    });
    
    await payment.save();
    
    res.json({
      success: true,
      paymentId,
      amount,
      currency: 'INR',
      status: 'succeeded',
      message: 'Payment processed successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 