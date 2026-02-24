// Test script with demo token for authentication
const axios = require('axios');

const baseURL = 'http://localhost:4232/api/v1';

async function testWithDemoToken() {
  console.log('Testing with Demo Token...');
  
  try {
    // Test with demo token (bypasses auth for development)
    console.log('\n1. Testing GET headers with demo token');
    const headersResponse = await axios.get(`${baseURL}/banking/parameters/segmentation`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
      }
    });
    console.log('✅ GET Headers Success:', headersResponse.status);
    console.log('Data:', JSON.stringify(headersResponse.data, null, 2));
    
    // Test POST with demo token
    console.log('\n2. Testing POST with demo token');
    const testData = {
      group_segment: 'Test Group API',
      segment: 'Test Segment API',
      segment_type: 'PD',
      seq: 1,
      active_flag: true,
      createdby: 'api_test_user'
    };
    
    const createResponse = await axios.post(`${baseURL}/banking/parameters/segmentation`, testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
      }
    });
    console.log('✅ POST Success:', createResponse.status);
    console.log('Created:', JSON.stringify(createResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.status, error.response?.data || error.message);
  }
}

testWithDemoToken();
