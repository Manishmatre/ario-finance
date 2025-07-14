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

// Update/delete specific advance
router.patch('/:employeeId/advance/:index', employeeController.updateAdvance);
router.delete('/:employeeId/advance/:index', employeeController.deleteAdvance);
// Update/delete specific salary
router.patch('/:employeeId/salary/:index', employeeController.updateSalary);
router.delete('/:employeeId/salary/:index', employeeController.deleteSalary);
// Update/delete specific other expense
router.patch('/:employeeId/other/:index', employeeController.updateOtherExpense);
router.delete('/:employeeId/other/:index', employeeController.deleteOtherExpense);

module.exports = router; 