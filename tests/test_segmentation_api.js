// Test script to verify segmentation API endpoints
const axios = require('axios');

const baseURL = 'http://localhost:4232/api/v1';

async function testSegmentationAPI() {
  console.log('Testing Segmentation API...');
  
  try {
    // Test GET headers
    console.log('\n1. Testing GET /banking/parameters/segmentation');
    const headersResponse = await axios.get(`${baseURL}/banking/parameters/segmentation`, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
      }
    });
    console.log('✅ GET Headers Success:', headersResponse.status, headersResponse.data);
    
    // Test POST header
    console.log('\n2. Testing POST /banking/parameters/segmentation');
    const testData = {
      group_segment: 'Test Group',
      segment: 'Test Segment',
      segment_type: 'PD',
      seq: 1,
      active_flag: true,
      createdby: 'test_user'
    };
    
    const createResponse = await axios.post(`${baseURL}/banking/parameters/segmentation`, testData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('✅ POST Header Success:', createResponse.status, createResponse.data);
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.status, error.response?.data || error.message);
  }
}

testSegmentationAPI();
