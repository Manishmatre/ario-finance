const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const accountController = require('../controllers/accountController');

router.use(withTenant);

router.get('/', accountController.getAccounts);
router.post('/', accountController.createAccount);
router.patch('/:id', accountController.updateAccount);

// Ledger endpoint: GET /api/finance/accounts/:id/ledger
const txnController = require('../controllers/transactionController');
router.get('/:id/ledger', (req, res, next) => {
  // Attach accountId to query for controller
  req.query.accountId = req.params.id;
  txnController.listTransactions(req, res, next);
});

module.exports = router;
