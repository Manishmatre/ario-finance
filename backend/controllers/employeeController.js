const Employee = require('../models/Employee');

// Add new employee
exports.addEmployee = async (req, res) => {
  try {
    const data = { ...req.body, tenantId: req.tenantId, createdBy: req.user?.id };
    const emp = await Employee.create(data);
    res.status(201).json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List all employees
exports.listEmployees = async (req, res) => {
  try {
    const emps = await Employee.find({ tenantId: req.tenantId });
    res.json(emps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get employee details
exports.getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const emp = await Employee.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true }
    );
    if (!emp) return res.status(404).json({ error: 'Not found' });
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const emp = await Employee.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add advance to employee
exports.addAdvance = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    emp.advances.push(req.body);
    await emp.save();
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add salary record to employee
exports.addSalary = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    emp.salaries.push(req.body);
    await emp.save();
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List all employee transactions (salary + advance, flat)
exports.listEmployeeTransactions = async (req, res) => {
  try {
    const { name = '', type = '', dateFrom, dateTo } = req.query;
    const employees = await Employee.find({ tenantId: req.tenantId });
    let transactions = [];
    employees.forEach(emp => {
      // Advances
      (emp.advances || []).forEach(adv => {
        transactions.push({
          employeeId: emp._id,
          employeeName: emp.name,
          type: 'advance',
          amount: adv.amount,
          date: adv.date,
          status: adv.status || (adv.cleared ? 'paid' : 'pending'),
          notes: adv.reason || '',
          paymentMode: adv.paymentMode || '',
        });
      });
      // Salaries
      (emp.salaries || []).forEach(sal => {
        transactions.push({
          employeeId: emp._id,
          employeeName: emp.name,
          type: 'salary',
          amount: sal.amount,
          date: sal.paidDate || null,
          status: sal.status,
          notes: sal.notes || '',
          paymentMode: sal.paymentMode || '',
        });
      });
    });
    // Filtering
    if (name) transactions = transactions.filter(t => t.employeeName.toLowerCase().includes(name.toLowerCase()));
    if (type) transactions = transactions.filter(t => t.type === type);
    if (dateFrom) transactions = transactions.filter(t => t.date && new Date(t.date) >= new Date(dateFrom));
    if (dateTo) transactions = transactions.filter(t => t.date && new Date(t.date) <= new Date(dateTo));
    // Sort by date desc
    transactions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 