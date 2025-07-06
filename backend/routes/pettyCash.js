const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const pettyCashController = require('../controllers/pettyCashController');
router.use(withTenant);

router.get('/', pettyCashController.getPettyCash);
router.post('/', pettyCashController.createPettyCash);

module.exports = router;
