const mongoose = require('mongoose');
const AdvanceVendorSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  amount: Number,
  date: Date,
  cleared: { type: Boolean, default: false },
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('AdvanceVendor', AdvanceVendorSchema);
