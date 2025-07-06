const mongoose = require('mongoose');
const GRNSchema = new mongoose.Schema({
  poRef: String,
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  grnDate: Date,
  items: [Object],
  billMatched: { type: Boolean, default: false },
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('GRN', GRNSchema);
