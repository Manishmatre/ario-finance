const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { auth } = require('../middleware/auth');
const withTenant = require('../middleware/withTenant');

// Apply auth and withTenant middleware to all routes
router.use(auth);
router.use(withTenant);

// Project routes
router.route('/')
  .get(projectController.getProjects)
  .post(projectController.createProject);

router.route('/:id')
  .get(projectController.getProject);

// Payment routes
router.route('/payments').get(projectController.getPaymentsByClient);
router.route('/:id/payments')
  .get(projectController.getProjectPayments)
  .post(projectController.recordPayment);

router.route('/payments/:paymentId')
  .delete(projectController.deletePayment);

module.exports = router;
