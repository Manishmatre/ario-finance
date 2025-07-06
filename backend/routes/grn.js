const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const grnController = require('../controllers/grnController');
router.use(withTenant);

router.post('/', grnController.matchGRN);

module.exports = router;
