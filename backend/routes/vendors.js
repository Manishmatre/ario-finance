const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const vendorController = require('../controllers/vendorController');
const advanceVendorController = require('../controllers/advanceVendorController');

router.use(withTenant);

// --- Specific routes first ---
router.get('/advances', advanceVendorController.listAdvances);
router.post('/advances', advanceVendorController.createAdvance);
router.get('/advances/:id', advanceVendorController.getAdvance);
router.put('/advances/:id', advanceVendorController.updateAdvance);
router.delete('/advances/:id', advanceVendorController.deleteAdvance);
router.get('/summary', vendorController.getVendorSummary);
router.get('/:id/bills', vendorController.getVendorBills);
router.get('/:id/advances', advanceVendorController.getVendorAdvances);
router.get('/:id/payments', vendorController.getVendorPayments);
router.get('/:id/ledger', vendorController.getVendorLedger);
// --- General routes after ---
router.get('/', vendorController.listVendors);
router.post('/', vendorController.createVendor);
router.get('/:id', vendorController.getVendor);
router.put('/:id', vendorController.updateVendor);

module.exports = router;
