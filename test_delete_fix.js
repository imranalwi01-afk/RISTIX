// Test script to verify delete operation now works directly
const axios = require('axios');

const baseURL = 'http://localhost:4232/api/v1';

async function testDeleteOperation() {
  console.log('🧪 Testing Delete Operation with Development Bypass...');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
    }
  };

  try {
    // 1. Get current records
    console.log('\n📋 1. Getting current segmentation records...');
    const listResponse = await axios.get(`${baseURL}/banking/parameters/segmentation`, config);
    const initialCount = listResponse.data.data.length;
    console.log(`✅ Found ${initialCount} records`);
    
    if (initialCount === 0) {
      console.log('❌ No records available for delete test');
      return;
    }
    
    // Get the last record for delete test (to avoid breaking important data)
    const recordToDelete = listResponse.data.data[initialCount - 1];
    console.log(`🎯 Will delete record: ${recordToDelete.id} - ${recordToDelete.group_segment}`);
    
    // 2. Delete the record
    console.log('\n🗑️ 2. Deleting record...');
    const deleteResponse = await axios.delete(`${baseURL}/banking/parameters/segmentation/${recordToDelete.id}`, config);
    console.log('✅ Delete Response:', deleteResponse.status);
    console.log('   Message:', deleteResponse.data.message);
    console.log('   Approval Required:', deleteResponse.data.approvalRequired);
    
    // 3. Verify deletion
    console.log('\n🔍 3. Verifying deletion...');
    const verifyResponse = await axios.get(`${baseURL}/banking/parameters/segmentation`, config);
    const finalCount = verifyResponse.data.data.length;
    console.log(`✅ Final record count: ${finalCount}`);
    
    // 4. Check if record was actually deleted
    const deletedRecord = verifyResponse.data.data.find(r => r.id === recordToDelete.id);
    
    if (finalCount < initialCount && !deletedRecord) {
      console.log('\n🎉 SUCCESS: Delete operation working correctly!');
      console.log(`   - Initial count: ${initialCount}`);
      console.log(`   - Final count: ${finalCount}`);
      console.log(`   - Record ${recordToDelete.id} successfully deleted`);
      console.log('   - No approval required (development bypass working)');
    } else {
      console.log('\n❌ FAILED: Delete operation not working');
      console.log(`   - Initial count: ${initialCount}`);
      console.log(`   - Final count: ${finalCount}`);
      console.log(`   - Record still exists: ${!!deletedRecord}`);
    }
    
  } catch (error) {
    console.error('❌ Delete test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testDeleteOperation();
