const express = require('express');
const router = express.Router();
const { createPurchaseOrder, getPurchaseOrders, getPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, getPurchaseOrderReport } = require('../controllers/purchaseOrderController');
const auth = require('../middleware/auth').auth;

// Routes
router.post('/', auth, createPurchaseOrder);
router.get('/', auth, getPurchaseOrders);
router.get('/:id', auth, getPurchaseOrder);
router.put('/:id', auth, updatePurchaseOrder);
router.delete('/:id', auth, deletePurchaseOrder);
router.get('/report', auth, getPurchaseOrderReport);

module.exports = router;
