const mongoose = require('mongoose');
const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gstNo: String,
  phone: String,
  address: String,
  bankAccounts: [
    {
      accountHolder: String,
      bankName: String,
      accountNumber: String,
      ifsc: String,
      branch: String,
      notes: String
    }
  ],
  paymentModes: [String],
  tenantId: { type: String, required: true, index: true },
  createdBy: String,
}, { timestamps: true });
module.exports = mongoose.model('Vendor', VendorSchema);
