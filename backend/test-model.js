const mongoose = require('mongoose');
const BankAccount = require('./models/BankAccount');

async function testModel() {
  try {
    console.log('Testing BankAccount model...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ario-finance');
    console.log('✅ Connected to MongoDB');

    // Test creating a bank account
    const testAccount = new BankAccount({
      bankName: 'HDFC',
      type: 'Current',
      accountHolder: 'Test Company Ltd',
      bankAccountNo: 'TEST123456',
      ifsc: 'HDFC0001234',
      branchName: 'Test Branch',
      currentBalance: 100000,
      status: 'active',
      interestRate: 0,
      features: {
        internetBanking: true,
        mobileBanking: true,
        debitCard: true,
        chequeBook: false
      },
      notes: 'Test account',
      tenantId: 'demo-tenant-1',
      createdBy: 'system'
    });

    console.log('✅ Model created successfully');
    console.log('Account code:', testAccount.accountCode);
    console.log('Features:', testAccount.features);

    // Test saving to database
    const savedAccount = await testAccount.save();
    console.log('✅ Saved to database successfully');
    console.log('Saved ID:', savedAccount._id);
    console.log('Generated code:', savedAccount.accountCode);

    // Test finding the account
    const foundAccount = await BankAccount.findById(savedAccount._id);
    console.log('✅ Found account:', foundAccount.accountHolder);

    // Clean up
    await BankAccount.findByIdAndDelete(savedAccount._id);
    console.log('✅ Cleaned up test data');

  } catch (error) {
    console.log('❌ Error:');
    console.log(error.message);
    if (error.name === 'ValidationError') {
      console.log('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testModel(); 