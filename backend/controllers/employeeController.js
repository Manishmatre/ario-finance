const Employee = require('../models/Employee');
const TransactionLine = require('../models/TransactionLine');
const BankAccount = require('../models/BankAccount');

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
    // Bank transaction logic
    if (req.body.paymentMode === 'bank_transfer' && req.body.companyBankId) {
      const bankAcc = await BankAccount.findOne({ _id: req.body.companyBankId, tenantId: req.tenantId });
      if (bankAcc) {
        // Create transaction line
        await TransactionLine.create({
          date: req.body.date || new Date(),
          bankAccountId: bankAcc._id,
          debitAccount: bankAcc._id,
          creditAccount: null,
          employeeId: emp._id,
          amount: -Math.abs(req.body.amount), // Always negative for outflows
          narration: `Advance to employee: ${emp.name}`,
          tenantId: req.tenantId,
          createdBy: req.user?.id
        });
      }
    }
    // Emit notification for advance
    const { getIO } = require('../socket');
    const io = getIO();
    io.emit('notification', {
      type: 'employee',
      message: `Advance of ₹${req.body.amount} paid to employee: ${emp.name}`,
      data: { employeeId: emp._id },
      createdAt: new Date(),
      read: false
    });
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
    // Bank transaction logic
    if (req.body.paymentMode === 'bank_transfer' && req.body.companyBankId) {
      const bankAcc = await BankAccount.findOne({ _id: req.body.companyBankId, tenantId: req.tenantId });
      if (bankAcc) {
        // Create transaction line
        await TransactionLine.create({
          date: req.body.paidDate || new Date(),
          bankAccountId: bankAcc._id,
          debitAccount: bankAcc._id,
          creditAccount: null,
          employeeId: emp._id,
          amount: -Math.abs(req.body.amount), // Always negative for outflows
          narration: `Salary payment to employee: ${emp.name}`,
          tenantId: req.tenantId,
          createdBy: req.user?.id
        });
      }
    }
    // Emit notification for salary
    const { getIO } = require('../socket');
    const io = getIO();
    io.emit('notification', {
      type: 'employee',
      message: `Salary of ₹${req.body.amount} paid to employee: ${emp.name}`,
      data: { employeeId: emp._id },
      createdAt: new Date(),
      read: false
    });
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add other expense to employee
exports.addOtherExpense = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    if (!emp.otherExpenses) emp.otherExpenses = [];
    emp.otherExpenses.push(req.body);
    await emp.save();
    // Bank transaction logic
    if (req.body.paymentMode === 'bank_transfer' && req.body.companyBankId) {
      const bankAcc = await BankAccount.findOne({ _id: req.body.companyBankId, tenantId: req.tenantId });
      if (bankAcc) {
        // Create transaction line
        await TransactionLine.create({
          date: req.body.date || new Date(),
          bankAccountId: bankAcc._id,
          debitAccount: bankAcc._id,
          creditAccount: null,
          employeeId: emp._id,
          amount: -Math.abs(req.body.amount), // Always negative for outflows
          narration: `Other employee expense: ${emp.name}`,
          tenantId: req.tenantId,
          createdBy: req.user?.id
        });
      }
    }
    // Emit notification for other expense
    const { getIO } = require('../socket');
    const io = getIO();
    io.emit('notification', {
      type: 'employee',
      message: `Other expense of ₹${req.body.amount} paid for employee: ${emp.name}`,
      data: { employeeId: emp._id },
      createdAt: new Date(),
      read: false
    });
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a specific advance
exports.updateAdvance = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.employeeId, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || !emp.advances[idx]) return res.status(404).json({ error: 'Advance not found' });
    emp.advances[idx] = { ...emp.advances[idx]._doc, ...req.body };
    await emp.save();
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Delete a specific advance
exports.deleteAdvance = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.employeeId, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || !emp.advances[idx]) return res.status(404).json({ error: 'Advance not found' });
    emp.advances.splice(idx, 1);
    await emp.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Update a specific salary
exports.updateSalary = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.employeeId, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || !emp.salaries[idx]) return res.status(404).json({ error: 'Salary not found' });
    emp.salaries[idx] = { ...emp.salaries[idx]._doc, ...req.body };
    await emp.save();
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Delete a specific salary
exports.deleteSalary = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.employeeId, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || !emp.salaries[idx]) return res.status(404).json({ error: 'Salary not found' });
    emp.salaries.splice(idx, 1);
    await emp.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Update a specific other expense
exports.updateOtherExpense = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.employeeId, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || !emp.otherExpenses[idx]) return res.status(404).json({ error: 'Other expense not found' });
    emp.otherExpenses[idx] = { ...emp.otherExpenses[idx]._doc, ...req.body };
    await emp.save();
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Delete a specific other expense
exports.deleteOtherExpense = async (req, res) => {
  try {
    const emp = await Employee.findOne({ _id: req.params.employeeId, tenantId: req.tenantId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || !emp.otherExpenses[idx]) return res.status(404).json({ error: 'Other expense not found' });
    emp.otherExpenses.splice(idx, 1);
    await emp.save();
    res.json({ success: true });
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
      (emp.advances || []).forEach((adv, idx) => {
        transactions.push({
          employeeId: emp._id,
          employeeName: emp.name,
          type: 'advance',
          amount: adv.amount,
          date: adv.date,
          status: adv.status || (adv.cleared ? 'paid' : 'pending'),
          notes: adv.reason || '',
          paymentMode: adv.paymentMode || '',
          index: idx
        });
      });
      // Salaries
      (emp.salaries || []).forEach((sal, idx) => {
        transactions.push({
          employeeId: emp._id,
          employeeName: emp.name,
          type: 'salary',
          amount: sal.amount,
          date: sal.paidDate || null,
          status: sal.status,
          notes: sal.notes || '',
          paymentMode: sal.paymentMode || '',
          index: idx
        });
      });
      // Other Expenses
      (emp.otherExpenses || []).forEach((oth, idx) => {
        transactions.push({
          employeeId: emp._id,
          employeeName: emp.name,
          type: 'other',
          amount: oth.amount,
          date: oth.date,
          status: oth.status,
          notes: oth.description || '',
          paymentMode: oth.paymentMode || '',
          index: idx
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