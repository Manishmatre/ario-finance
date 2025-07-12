const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const withTenant = require('../middleware/withTenant');
const { auth } = require('../middleware/auth');

// Public routes (no auth required)
router.get('/plans', subscriptionController.getPlans);

// Protected routes (require auth)
router.use(auth);
router.use(withTenant);

// Routes that need tenant context
router.get('/current', subscriptionController.getCurrentSubscription);
router.get('/usage', subscriptionController.getUsage);

// Subscription management
router.post('/create', subscriptionController.createSubscription);
router.post('/process-payment', subscriptionController.processPayment);
router.post('/cancel', subscriptionController.cancelSubscription);
router.post('/reactivate', subscriptionController.reactivateSubscription);
router.post('/change-plan', subscriptionController.changePlan);

// Usage and billing
router.get('/billing-history', subscriptionController.getBillingHistory);

// Usage limit middleware
router.post('/check-usage', subscriptionController.checkUsageLimit);

module.exports = router; 