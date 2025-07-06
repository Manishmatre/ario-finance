const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const cashController = require('../controllers/cashController');
router.use(withTenant);

router.get('/cashbook', cashController.getCashbook);
router.post('/advance', cashController.createAdvance);
router.post('/reimburse', cashController.createReimburse);

module.exports = router;
