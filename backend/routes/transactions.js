const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const txnController = require('../controllers/transactionController');

router.use(withTenant);

router.get('/', txnController.listTransactions);
router.post('/', txnController.createTransaction);
router.patch('/:id', txnController.updateTransaction);
router.post('/:id/approve', txnController.approveTransaction);

module.exports = router;
