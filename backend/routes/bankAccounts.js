const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const validateBankAccount = require('../middleware/validateBankAccount');
const bankAccountController = require('../controllers/bankAccountController');
const transactionController = require('../controllers/transactionController');

// Apply tenant middleware to all routes
router.use(withTenant);

// Temporary test route without auth
router.post('/test', (req, res) => {
  console.log('Test route hit with data:', req.body);
  res.json({ message: 'Test route working', data: req.body });
});

// GET /api/finance/bank-accounts - Get all bank accounts with pagination and filters
router.get('/', bankAccountController.getBankAccounts);

// GET /api/finance/bank-accounts/stats - Get bank account statistics
router.get('/stats', bankAccountController.getBankAccountStats);

// GET /api/finance/bank-accounts/:id - Get a specific bank account
router.get('/:id', bankAccountController.getBankAccount);

// Add ledger endpoint for a bank account
router.get('/:id/ledger', (req, res, next) => {
  req.query.bankAccountId = req.params.id;
  transactionController.listBankAccountTransactions(req, res, next);
});

// POST /api/finance/bank-accounts - Create a new bank account
router.post('/', bankAccountController.createBankAccount);

// PUT /api/finance/bank-accounts/:id - Update a bank account
router.put('/:id', validateBankAccount, bankAccountController.updateBankAccount);

// PATCH /api/finance/bank-accounts/:id - Partially update a bank account
router.patch('/:id', validateBankAccount, bankAccountController.updateBankAccount);

// DELETE /api/finance/bank-accounts/:id - Soft delete a bank account
router.delete('/:id', bankAccountController.deleteBankAccount);

// DELETE /api/finance/bank-accounts/:id/hard - Hard delete a bank account
router.delete('/:id/hard', bankAccountController.deleteBankAccountHard);

module.exports = router; 