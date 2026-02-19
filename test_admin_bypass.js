// Test admin bypass functionality
const axios = require('axios');

const baseURL = 'http://localhost:4232/api/v1';

async function testAdminBypass() {
  console.log('🧪 Testing Admin Bypass...');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
    }
  };

  try {
    // Test create with simple data
    console.log('\n➕ 1. Testing CREATE with admin bypass...');
    const createData = {
      group_segment: 'Admin Bypass Test',
      segment: 'Admin Bypass Segment',
      segment_type: 'PD',
      seq: 9999,
      active_flag: true,
      createdby: 'admin_test'
    };
    
    const createResponse = await axios.post(`${baseURL}/banking/parameters/segmentation`, createData, config);
    console.log('✅ CREATE Response:', createResponse.status);
    console.log('   Message:', createResponse.data.message);
    console.log('   Approval Required:', createResponse.data.approvalRequired);
    
    if (createResponse.status === 201 && !createResponse.data.approvalRequired) {
      console.log('🎉 CREATE bypass working!');
      
      // Test delete the created record
      const newId = createResponse.data.data?.id;
      if (newId) {
        console.log(`\n🗑️ 2. Testing DELETE on created record: ${newId}`);
        
        const deleteResponse = await axios.delete(`${baseURL}/banking/parameters/segmentation/${newId}`, config);
        console.log('✅ DELETE Response:', deleteResponse.status);
        console.log('   Message:', deleteResponse.data.message);
        console.log('   Approval Required:', deleteResponse.data.approvalRequired);
        
        if (deleteResponse.status === 200 && !deleteResponse.data.approvalRequired) {
          console.log('🎉 DELETE bypass working!');
          console.log('\n✅ Both CREATE and DELETE bypasses are working!');
        } else {
          console.log('❌ DELETE bypass not working');
        }
      }
    } else {
      console.log('❌ CREATE bypass not working');
    }
    
  } catch (error) {
    console.error('❌ Admin bypass test failed:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data) {
      console.log('Error Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAdminBypass();
