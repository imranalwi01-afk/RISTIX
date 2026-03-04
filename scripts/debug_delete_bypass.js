// Debug script to check if bypass is working
const axios = require('axios');

const baseURL = 'http://localhost:4232/api/v1';

async function debugDeleteBypass() {
  console.log('🔍 Debug: Delete Bypass Check...');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
    }
  };

  try {
    // Test with a simple delete operation
    console.log('\n📋 1. Getting records...');
    const listResponse = await axios.get(`${baseURL}/banking/parameters/segmentation`, config);
    const records = listResponse.data.data;
    console.log(`Found ${records.length} records`);
    
    if (records.length > 0) {
      const lastRecord = records[records.length - 1];
      console.log(`\n🎯 Attempting to delete record: ${lastRecord.id}`);
      
      // Add debug headers to trace the request
      const debugConfig = {
        ...config,
        headers: {
          ...config.headers,
          'X-Debug-Test': 'delete-bypass-check',
          'X-Timestamp': new Date().toISOString()
        }
      };
      
      console.log('\n🗑️ 2. Sending delete request...');
      console.log('   URL:', `${baseURL}/banking/parameters/segmentation/${lastRecord.id}`);
      console.log('   Headers:', debugConfig.headers);
      
      const deleteResponse = await axios.delete(
        `${baseURL}/banking/parameters/segmentation/${lastRecord.id}`, 
        debugConfig
      );
      
      console.log('\n📊 3. Delete Response Analysis:');
      console.log('   Status:', deleteResponse.status);
      console.log('   Status Text:', deleteResponse.statusText);
      console.log('   Response Data:', JSON.stringify(deleteResponse.data, null, 2));
      console.log('   Approval Required:', deleteResponse.data.approvalRequired);
      console.log('   Success:', deleteResponse.data.success);
      
      // Check if bypass message is present
      if (deleteResponse.data.message && 
          deleteResponse.data.message.includes('bypass mode')) {
        console.log('✅ Bypass mode is working!');
      } else if (deleteResponse.data.approvalRequired) {
        console.log('❌ Bypass mode NOT working - still requires approval');
      } else {
        console.log('❓ Unexpected response format');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data) {
      console.log('Error Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugDeleteBypass();
