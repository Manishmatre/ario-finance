const mongoose = require('mongoose');
const BankAccount = require('../models/BankAccount');

// Sample bank account data
const sampleBankAccounts = [
  {
    bankName: 'HDFC',
    type: 'Current',
    accountHolder: 'Arionex Technologies Pvt Ltd',
    bankAccountNo: '1234567890',
    ifsc: 'HDFC0001234',
    branchName: 'Koramangala Branch',
    currentBalance: 2500000,
    status: 'active',
    interestRate: 0,
    features: {
      internetBanking: true,
      mobileBanking: true,
      debitCard: true,
      chequeBook: true
    },
    notes: 'Main business account for daily operations',
    tenantId: 'demo-tenant-1',
    createdBy: 'system'
  },
  {
    bankName: 'SBI',
    type: 'Savings',
    accountHolder: 'Arionex Technologies Pvt Ltd',
    bankAccountNo: '9876543210',
    ifsc: 'SBIN0009876',
    branchName: 'Indiranagar Branch',
    currentBalance: 1500000,
    status: 'active',
    interestRate: 3.5,
    features: {
      internetBanking: true,
      mobileBanking: true,
      debitCard: true,
      chequeBook: false
    },
    notes: 'Savings account for emergency funds',
    tenantId: 'demo-tenant-1',
    createdBy: 'system'
  },
  {
    bankName: 'ICICI',
    type: 'Fixed Deposit',
    accountHolder: 'Arionex Technologies Pvt Ltd',
    bankAccountNo: '1122334455',
    ifsc: 'ICIC0001122',
    branchName: 'Whitefield Branch',
    currentBalance: 5000000,
    status: 'active',
    interestRate: 7.25,
    features: {
      internetBanking: true,
      mobileBanking: true,
      debitCard: false,
      chequeBook: false
    },
    notes: 'Fixed deposit for 1 year at 7.25% interest',
    tenantId: 'demo-tenant-1',
    createdBy: 'system'
  },
  {
    bankName: 'Axis',
    type: 'Current',
    accountHolder: 'Arionex Technologies Pvt Ltd',
    bankAccountNo: '5566778899',
    ifsc: 'UTIB0005566',
    branchName: 'Electronic City Branch',
    currentBalance: 750000,
    status: 'active',
    interestRate: 0,
    features: {
      internetBanking: true,
      mobileBanking: true,
      debitCard: true,
      chequeBook: true
    },
    notes: 'Secondary business account for vendor payments',
    tenantId: 'demo-tenant-1',
    createdBy: 'system'
  },
  {
    bankName: 'Kotak',
    type: 'Recurring Deposit',
    accountHolder: 'Arionex Technologies Pvt Ltd',
    bankAccountNo: '9988776655',
    ifsc: 'KKBK0009988',
    branchName: 'HSR Layout Branch',
    currentBalance: 2000000,
    status: 'active',
    interestRate: 6.5,
    features: {
      internetBanking: true,
      mobileBanking: true,
      debitCard: false,
      chequeBook: false
    },
    notes: 'Monthly RD of ₹50,000 for 36 months',
    tenantId: 'demo-tenant-1',
    createdBy: 'system'
  }
];

async function seedBankAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ario-finance');
    console.log('Connected to MongoDB');

    // Clear existing bank accounts for demo tenant
    await BankAccount.deleteMany({ tenantId: 'demo-tenant-1' });
    console.log('Cleared existing bank accounts for demo tenant');

    // Insert sample bank accounts
    const bankAccounts = await BankAccount.insertMany(sampleBankAccounts);
    console.log(`Created ${bankAccounts.length} sample bank accounts`);

    // Display created accounts
    console.log('\nCreated Bank Accounts:');
    bankAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.bankName} - ${account.type} - ${account.accountCode}`);
      console.log(`   Balance: ₹${account.currentBalance.toLocaleString('en-IN')}`);
      console.log(`   Status: ${account.status}`);
      console.log('');
    });

    // Get summary statistics
    const stats = await BankAccount.aggregate([
      { $match: { tenantId: 'demo-tenant-1' } },
      {
        $group: {
          _id: null,
          totalAccounts: { $sum: 1 },
          totalBalance: { $sum: '$currentBalance' },
          activeAccounts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('Summary Statistics:');
      console.log(`Total Accounts: ${stats[0].totalAccounts}`);
      console.log(`Total Balance: ₹${stats[0].totalBalance.toLocaleString('en-IN')}`);
      console.log(`Active Accounts: ${stats[0].activeAccounts}`);
    }

    console.log('\nBank account seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding bank accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedBankAccounts();
}

module.exports = seedBankAccounts; 