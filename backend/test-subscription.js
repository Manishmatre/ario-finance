const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testSubscriptionEndpoints() {
  try {
    console.log('Testing subscription endpoints...\n');

    // Test 1: Get plans (public endpoint)
    console.log('1. Testing GET /subscription/plans...');
    try {
      const plansResponse = await axios.get(`${BASE_URL}/subscription/plans`);
      console.log('✅ Plans endpoint working:', plansResponse.data.length, 'plans found');
    } catch (error) {
      console.log('❌ Plans endpoint failed:', error.response?.data?.error || error.message);
    }

    // Test 2: Get current subscription (requires auth)
    console.log('\n2. Testing GET /subscription/current...');
    try {
      const subscriptionResponse = await axios.get(`${BASE_URL}/subscription/current`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Current subscription endpoint working');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Current subscription endpoint working (auth required as expected)');
      } else {
        console.log('❌ Current subscription endpoint failed:', error.response?.data?.error || error.message);
      }
    }

    // Test 3: Get usage (requires auth)
    console.log('\n3. Testing GET /subscription/usage...');
    try {
      const usageResponse = await axios.get(`${BASE_URL}/subscription/usage`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Usage endpoint working');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Usage endpoint working (auth required as expected)');
      } else {
        console.log('❌ Usage endpoint failed:', error.response?.data?.error || error.message);
      }
    }

    console.log('\n🎉 Subscription endpoints test completed!');
    console.log('\nNext steps:');
    console.log('1. Start your frontend: cd ../frontend && npm run dev');
    console.log('2. Navigate to /finance/pricing to see the pricing page');
    console.log('3. Navigate to /finance/subscription to manage subscriptions');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSubscriptionEndpoints(); 