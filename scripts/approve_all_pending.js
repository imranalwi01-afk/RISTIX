const axios = require('axios');

const baseURL = 'http://localhost:4232/api/v1';

async function approveAllPending() {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
    }
  };

  try {
    // Get all pending requests
    const response = await axios.get(`${baseURL}/approvals/requests`, config);
    const pendingRequests = response.data.data?.filter(r => r.status === 'pending') || [];
    
    console.log(`Found ${pendingRequests.length} pending requests`);
    
    // Approve all pending requests
    for (const request of pendingRequests) {
      try {
        await axios.post(`${baseURL}/approvals/requests/${request.id}/approve`, 
          { comment: 'Bulk approved for development' }, config);
        console.log(`✅ Approved request: ${request.id} (${request.entityType})`);
      } catch (err) {
        console.log(`❌ Failed to approve ${request.id}:`, err.response?.data?.message || err.message);
      }
    }
    
    console.log('\n🎉 All pending requests approved!');
    console.log('📝 Refresh your browser to see updated data');
    
  } catch (error) {
    console.error('❌ Approval failed:', error.message);
  }
}

approveAllPending();
