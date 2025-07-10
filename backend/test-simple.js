const axios = require('axios');

async function testBankAccountCreation() {
  try {
    console.log('Testing bank account creation without auth...\n');

    const testData = {
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
      notes: 'Test account'
    };

    console.log('Sending data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('https://ariofinance-backend.onrender.com/api/finance/bank-accounts', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
}

testBankAccountCreation(); 