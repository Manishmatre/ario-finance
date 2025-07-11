const express = require('express');
const router = express.Router();
const withTenant = require('../middleware/withTenant');
const employeeController = require('../controllers/employeeController');

router.use(withTenant);

// CRUD
router.post('/', employeeController.addEmployee);
router.get('/', employeeController.listEmployees);
router.get('/:id', employeeController.getEmployee);
router.patch('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

// Advances & Salary
router.post('/:id/advance', employeeController.addAdvance);
router.post('/:id/salary', employeeController.addSalary);
router.post('/:id/other', employeeController.addOtherExpense);
router.get('/transactions/all', employeeController.listEmployeeTransactions);

module.exports = router; 