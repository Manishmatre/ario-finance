const mongoose = require('mongoose');

const ExpenseCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  parentCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ExpenseCategory' 
  },
  tenantId: { type: String, required: true, index: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String }
}, { timestamps: true });

// Ensure category names are unique per tenant
ExpenseCategorySchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('ExpenseCategory', ExpenseCategorySchema);
