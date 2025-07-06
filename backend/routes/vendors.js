const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const vendorController = require('../controllers/vendorController');

router.use(withTenant);

router.get('/', vendorController.listVendors);
router.post('/', vendorController.createVendor);

module.exports = router;
