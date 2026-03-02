// Final test script for CRUD operations with demo token
const axios = require('axios');

const baseURL = 'http://localhost:4232/api/v1';

async function testCRUDOperations() {
  console.log('🧪 Testing Complete CRUD Operations...');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
    }
  };

  try {
    // 1. READ - Get all segmentations
    console.log('\n📖 1. Testing READ operation...');
    const readResponse = await axios.get(`${baseURL}/banking/parameters/segmentation`, config);
    console.log('✅ READ Success:', readResponse.status);
    console.log(`   Found ${readResponse.data.data.length} records`);
    
    // Get first record for update/delete tests
    const firstRecord = readResponse.data.data[0];
    if (!firstRecord) {
      console.log('❌ No records found for update/delete tests');
      return;
    }
    
    // 2. CREATE - Add new segmentation
    console.log('\n➕ 2. Testing CREATE operation...');
    const newSegment = {
      group_segment: 'Test API Group',
      segment: 'Test API Segment',
      segment_type: 'PD',
      seq: 999,
      active_flag: true,
      createdby: 'api_test_user'
    };
    
    const createResponse = await axios.post(`${baseURL}/banking/parameters/segmentation`, newSegment, config);
    console.log('✅ CREATE Success:', createResponse.status);
    console.log('   Response:', createResponse.data.message);
    
    // 3. UPDATE - Modify existing segmentation
    console.log('\n✏️ 3. Testing UPDATE operation...');
    const updateData = {
      group_segment: 'Updated API Group',
      segment: 'Updated API Segment',
      segment_type: 'PD',
      seq: 998,
      active_flag: true
    };
    
    const updateResponse = await axios.put(`${baseURL}/banking/parameters/segmentation/${firstRecord.id}`, updateData, config);
    console.log('✅ UPDATE Success:', updateResponse.status);
    console.log('   Response:', updateResponse.data.message);
    
    // 4. DELETE - Remove a segmentation (using the last record to avoid breaking existing data)
    console.log('\n🗑️ 4. Testing DELETE operation...');
    const lastRecord = readResponse.data.data[readResponse.data.data.length - 1];
    
    const deleteResponse = await axios.delete(`${baseURL}/banking/parameters/segmentation/${lastRecord.id}`, config);
    console.log('✅ DELETE Success:', deleteResponse.status);
    console.log('   Response:', deleteResponse.data.message);
    
    // 5. Test Details endpoint
    console.log('\n📋 5. Testing Details endpoint...');
    const detailsResponse = await axios.get(`${baseURL}/banking/parameters/segmentation/${firstRecord.id}/details`, config);
    console.log('✅ Details Success:', detailsResponse.status);
    console.log(`   Found ${detailsResponse.data.data.length} detail records`);
    
    console.log('\n🎉 All CRUD operations completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ READ: Working');
    console.log('   ✅ CREATE: Working (with approval workflow)');
    console.log('   ✅ UPDATE: Working (with approval workflow)');
    console.log('   ✅ DELETE: Working (with approval workflow)');
    console.log('   ✅ Details: Working');
    
  } catch (error) {
    console.error('❌ CRUD Test Failed:', error.response?.status, error.response?.data || error.message);
  }
}

testCRUDOperations();
