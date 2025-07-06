const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const dashboardController = require('../controllers/dashboardController');
router.use(withTenant);

router.get('/kpis', dashboardController.getKPIs);

module.exports = router;
