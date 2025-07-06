const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyType: { type: String, required: true },
  pan: { type: String, required: true },
  gstNo: { type: String },
  contactPerson: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  address: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);