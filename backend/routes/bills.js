const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const billController = require('../controllers/billController');
const multer = require('multer');
const upload = multer(); // memory storage

router.use(withTenant);

router.post('/', upload.single('file'), billController.uploadBill);
router.patch('/:id/pay', billController.payBill);
router.get('/', billController.listBills);
router.get('/:id', billController.getBill);
router.put('/:id', billController.updateBill);
router.delete('/:id', billController.deleteBill);

module.exports = router;
