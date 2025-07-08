const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProduct, updateProduct, deleteProduct, getProductReport } = require('../controllers/productController');
const { auth } = require('../middleware/auth');

// Routes
router.post('/', auth, createProduct);
router.get('/', auth, getProducts);
router.get('/:id', auth, getProduct);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);
router.get('/report', auth, getProductReport);

module.exports = router;
