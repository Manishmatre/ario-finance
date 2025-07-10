const axios = require('axios');

const API_BASE_URL = 'https://ariofinance-backend.onrender.com';

async function testBankAccountAPI() {
  try {
    console.log('Testing Bank Account API...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/finance/bank-accounts`);
      console.log('✅ Server is running and API is accessible');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running. Please start the server with: npm start');
        return;
      }
      console.log('⚠️ Server is running but API returned:', error.response?.status, error.response?.data);
    }

    // Test 2: Create a test bank account
    console.log('\n2. Testing bank account creation...');
    const testBankAccount = {
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
      notes: 'Test account for API testing'
    };

    try {
      const createResponse = await axios.post(`${API_BASE_URL}/api/finance/bank-accounts`, testBankAccount);
      console.log('✅ Bank account created successfully');
      console.log('Created account ID:', createResponse.data.bankAccount._id);
      console.log('Account code:', createResponse.data.bankAccount.accountCode);
      
      // Test 3: Get the created account
      console.log('\n3. Testing get bank account...');
      const getResponse = await axios.get(`${API_BASE_URL}/api/finance/bank-accounts/${createResponse.data.bankAccount._id}`);
      console.log('✅ Bank account retrieved successfully');
      console.log('Account holder:', getResponse.data.accountHolder);
      console.log('Balance:', getResponse.data.currentBalance);
      
      // Test 4: Get statistics
      console.log('\n4. Testing statistics endpoint...');
      const statsResponse = await axios.get(`${API_BASE_URL}/api/finance/bank-accounts/stats`);
      console.log('✅ Statistics retrieved successfully');
      console.log('Total accounts:', statsResponse.data.summary.totalAccounts);
      console.log('Total balance:', statsResponse.data.summary.totalBalance);
      
    } catch (error) {
      console.log('❌ Error creating bank account:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testBankAccountAPI(); 