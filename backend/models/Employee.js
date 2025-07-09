const mongoose = require('mongoose');

const AdvanceSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  reason: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { _id: false });

const SalarySchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  paidDate: Date,
  notes: String,
}, { _id: false });

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  department: String,
  designation: String,
  salary: { type: Number, required: true },
  joinDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
  advances: [AdvanceSchema],
  salaries: [SalarySchema],
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema); 