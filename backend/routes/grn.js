const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const grnController = require('../controllers/grnController');
router.use(withTenant);

router.post('/', grnController.createGRN);
router.get('/', grnController.getGRNs);
router.get('/:id', grnController.getGRN);
router.put('/:id', grnController.updateGRN);
router.delete('/:id', grnController.deleteGRN);
router.post('/:id/match-bill', grnController.matchBill);
router.get('/report', grnController.getGRNReport);

module.exports = router;
