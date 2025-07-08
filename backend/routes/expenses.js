const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const withTenant = require('../middleware/withTenant');
const expenseController = require('../controllers/expenseController');
const multer = require('multer');
const upload = multer();

// Category routes
router.post('/categories', auth, withTenant, expenseController.createCategory);
router.get('/categories', auth, withTenant, expenseController.getCategories);
router.put('/categories/:id', auth, withTenant, expenseController.updateCategory);
router.delete('/categories/:id', auth, withTenant, expenseController.deleteCategory);

// Reports route
router.get('/reports', auth, withTenant, expenseController.getExpenseReports);

// Expense routes
router.post('/', auth, withTenant, upload.single('receipt'), expenseController.createExpense);
router.get('/', auth, withTenant, expenseController.getExpenses);
router.put('/:id', auth, withTenant, upload.single('receipt'), expenseController.updateExpense);
router.delete('/:id', auth, withTenant, expenseController.deleteExpense);
router.get('/:id', auth, withTenant, expenseController.getExpenseById);

module.exports = router;
