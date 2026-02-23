// Test auto-approve functionality
const axios = require('axios');

const baseURL = 'http://localhost:4232/api/v1';

async function testAutoApprove() {
  console.log('🧪 Testing Auto-Approve Delete Flow...');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
    }
  };

  try {
    // 1. Create a test record first
    console.log('\n➕ 1. Creating test record...');
    const testData = {
      group_segment: 'Auto-Delete Test',
      segment: 'Auto-Delete Segment',
      segment_type: 'PD',
      seq: 9999,
      active_flag: true,
      createdby: 'auto_approve_test'
    };
    
    const createResponse = await axios.post(`${baseURL}/banking/parameters/segmentation`, testData, config);
    console.log('✅ Create Response:', createResponse.status);
    console.log('   Message:', createResponse.data.message);
    console.log('   Approval Required:', createResponse.data.approvalRequired);
    console.log('   Request ID:', createResponse.data.requestId);
    
    if (createResponse.data.requestId) {
      // 2. Approve the create request first
      console.log('\n✅ 2. Approving create request...');
      try {
        await axios.post(`${baseURL}/approvals/requests/${createResponse.data.requestId}/approve`, 
          { comment: 'Auto-approving create for test' }, config);
        console.log('✅ Create request approved');
      } catch (approveErr) {
        console.log('⚠️ Create approval failed, continuing anyway...');
      }
      
      const newId = createResponse.data.data?.id;
      if (newId) {
        // 3. Delete the created record
        console.log(`\n🗑️ 3. Deleting record: ${newId}`);
        
        const deleteResponse = await axios.delete(`${baseURL}/banking/parameters/segmentation/${newId}`, config);
        console.log('✅ Delete Response:', deleteResponse.status);
        console.log('   Message:', deleteResponse.data.message);
        console.log('   Approval Required:', deleteResponse.data.approvalRequired);
        console.log('   Request ID:', deleteResponse.data.requestId);
        
        if (deleteResponse.data.approvalRequired && deleteResponse.data.requestId) {
          // 4. Auto-approve the delete request
          console.log('\n🔓 4. Auto-approving delete request...');
          try {
            const approveResponse = await axios.post(
              `${baseURL}/approvals/requests/${deleteResponse.data.requestId}/approve`, 
              { comment: 'Auto-approved delete for development testing' }, 
              config
            );
            console.log('✅ Auto-Approve Response:', approveResponse.status);
            console.log('   Message:', approveResponse.data.message);
            console.log('   Success:', approveResponse.data.success);
            
            // 5. Verify deletion
            console.log('\n🔍 5. Verifying final deletion...');
            const verifyResponse = await axios.get(`${baseURL}/banking/parameters/segmentation`, config);
            const finalRecords = verifyResponse.data.data;
            const deletedRecord = finalRecords.find(r => r.id === newId);
            
            if (!deletedRecord) {
              console.log('\n🎉 SUCCESS: Auto-approve delete working!');
              console.log(`   - Record ${newId} successfully deleted`);
              console.log('   - Auto-approval flow working correctly');
              console.log('   - Frontend should now show immediate deletion');
            } else {
              console.log('\n❌ FAILED: Record still exists after auto-approve');
            }
            
          } catch (autoApproveError) {
            console.error('❌ Auto-approve failed:', autoApproveError.response?.data || autoApproveError.message);
          }
        } else {
          console.log('❌ Delete operation did not require approval or failed');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Auto-approve test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testAutoApprove();
