// Script to approve pending delete requests
const axios = require('axios');

const baseURL = 'http://localhost:4232/api/v1';

async function approvePendingDeletes() {
  console.log('🔍 Checking for pending delete requests...');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
    }
  };

  try {
    // 1. Get all pending approval requests
    console.log('\n📋 1. Getting pending approval requests...');
    const approvalsResponse = await axios.get(`${baseURL}/approvals/requests`, config);
    const allRequests = approvalsResponse.data.data || [];
    
    // Filter for segmentation delete requests
    const deleteRequests = allRequests.filter(req => 
      req.entityType === 'segmentation' && 
      req.operation === 'delete' &&
      req.status === 'pending'
    );
    
    console.log(`Found ${deleteRequests.length} pending delete requests for segmentation`);
    
    if (deleteRequests.length === 0) {
      console.log('✅ No pending delete requests found');
      return;
    }
    
    // 2. Approve each delete request
    for (const request of deleteRequests) {
      console.log(`\n🎯 2. Approving delete request: ${request.id}`);
      console.log(`   Entity: ${request.entityType} (${request.entityId})`);
      console.log(`   Title: ${request.title}`);
      
      try {
        const approveResponse = await axios.post(
          `${baseURL}/approvals/requests/${request.id}/approve`,
          { comment: 'Auto-approved for development testing' },
          config
        );
        
        console.log(`✅ Approved: ${approveResponse.data.message}`);
      } catch (approveError) {
        console.error(`❌ Failed to approve ${request.id}:`, approveError.response?.data || approveError.message);
      }
    }
    
    // 3. Verify deletions
    console.log('\n🔍 3. Verifying deletions...');
    const segmentationResponse = await axios.get(`${baseURL}/banking/parameters/segmentation`, config);
    const currentRecords = segmentationResponse.data.data || [];
    console.log(`Current record count: ${currentRecords.length}`);
    
    console.log('\n🎉 Delete approval process completed!');
    console.log('📝 Summary:');
    console.log(`   - Pending delete requests found: ${deleteRequests.length}`);
    console.log(`   - Current segmentation records: ${currentRecords.length}`);
    console.log('   - Check the application to verify data is removed');
    
  } catch (error) {
    console.error('❌ Error in approval process:', error.response?.data || error.message);
  }
}

approvePendingDeletes();
