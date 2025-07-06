require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('../models/Account');
const Vendor = require('../models/Vendor');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const tenantId = 'demoTenant';
  const accounts = [
    { name: 'Cash', code: '1001', type: 'asset', tenantId },
    { name: 'Bank', code: '1002', type: 'asset', tenantId },
    { name: 'Accounts Payable', code: '2001', type: 'liability', tenantId },
    { name: 'Revenue', code: '4001', type: 'revenue', tenantId },
    { name: 'Expense', code: '5001', type: 'expense', tenantId }
  ];
  await Account.insertMany(accounts);
  const vendors = [
    { name: 'ABC Steels', gstNo: 'GSTIN123', phone: '1234567890', address: 'Delhi', tenantId },
    { name: 'XYZ Cement', gstNo: 'GSTIN987', phone: '9876543210', address: 'Mumbai', tenantId }
  ];
  await Vendor.insertMany(vendors);
  console.log('Demo data seeded');
  process.exit();
}
seed();
