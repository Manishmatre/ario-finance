const mongoose = require('mongoose');
const EmployeeAdvanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  amount: Number,
  date: Date,
  cleared: { type: Boolean, default: false },
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('EmployeeAdvance', EmployeeAdvanceSchema);
