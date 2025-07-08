require('dotenv').config();
const mongoose = require('mongoose');
const ExpenseCategory = require('../models/ExpenseCategory');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const tenantId = 'demoTenant'; // Change if needed
  const createdBy = 'system';    // Change if needed

  const categories = [
    { name: 'Salary', tenantId, createdBy },
    { name: 'Rent', tenantId, createdBy },
    { name: 'Utilities', tenantId, createdBy },
    { name: 'Supplies', tenantId, createdBy },
    { name: 'Travel', tenantId, createdBy },
    { name: 'Other', tenantId, createdBy },
    { name: 'Office Expenses', tenantId, createdBy },
    { name: 'Maintenance', tenantId, createdBy },
    { name: 'Insurance', tenantId, createdBy },
    { name: 'Legal', tenantId, createdBy },
    { name: 'Consulting', tenantId, createdBy },
    { name: 'Marketing', tenantId, createdBy },
    { name: 'Training', tenantId, createdBy },
    { name: 'IT & Software', tenantId, createdBy },
    { name: 'Bank Charges', tenantId, createdBy },
    { name: 'Taxes', tenantId, createdBy },
    { name: 'Transportation', tenantId, createdBy },
    { name: 'Project Materials', tenantId, createdBy },
    { name: 'Subcontractor', tenantId, createdBy },
    { name: 'Equipment Rental', tenantId, createdBy },
    { name: 'Fuel', tenantId, createdBy },
    { name: 'Miscellaneous', tenantId, createdBy }
  ];

  await ExpenseCategory.insertMany(categories);
  console.log('Expense categories seeded');
  process.exit();
}
seed(); 