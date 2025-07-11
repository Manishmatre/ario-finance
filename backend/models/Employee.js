const mongoose = require('mongoose');

const AdvanceSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  reason: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentMode: { type: String },
  companyBankId: { type: String },
  employeeBankName: { type: String },
  upiId: { type: String },
  chequeNo: { type: String },
}, { _id: false });

const SalarySchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  paidDate: Date,
  notes: String,
  paymentMode: { type: String },
  companyBankId: { type: String },
  employeeBankName: { type: String },
  upiId: { type: String },
  chequeNo: { type: String },
}, { _id: false });

const OtherExpenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
  paymentMode: { type: String },
  companyBankId: { type: String },
  employeeBankName: { type: String },
  upiId: { type: String },
  chequeNo: { type: String },
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
  otherExpenses: [OtherExpenseSchema],
  bankAccountHolder: { type: String },
  bankName: { type: String },
  customBankName: { type: String },
  bankAccountNo: { type: String },
  ifsc: { type: String },
  branch: { type: String },
  bankNotes: { type: String },
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema); 