const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const pettyCashController = require('../controllers/pettyCashController');
router.use(withTenant);

router.get('/', pettyCashController.getPettyCash);
router.post('/', pettyCashController.createPettyCash);
router.put('/:id', pettyCashController.updatePettyCash);
router.patch('/:id', pettyCashController.updatePettyCash);
router.delete('/:id', pettyCashController.deletePettyCash);

module.exports = router;
