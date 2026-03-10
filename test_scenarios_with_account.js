// Test scenarios API with account ID
console.log('=== Scenarios API Test with Account ID ===');

const testScenariosWithAccount = async () => {
  try {
    console.log('\n🔍 Testing scenarios API with account ID...');
    
    // Pertama, ambil data staging analysis untuk mendapatkan account ID sample
    console.log('1. Getting sample account IDs from staging analysis...');
    const stagingResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const stagingData = await stagingResponse.json();
    
    if (stagingData.success && stagingData.data && stagingData.data.length > 0) {
      // Ambil beberapa account ID sample
      const sampleAccounts = stagingData.data.slice(0, 3);
      console.log(`   Found ${sampleAccounts.length} sample accounts`);
      
      // Test scenarios untuk setiap account
      for (let i = 0; i < sampleAccounts.length; i++) {
        const account = sampleAccounts[i];
        console.log(`\n2. Testing scenarios for account ${i + 1}:`);
        console.log(`   Account details:`, {
          segmentId: account.segmentId,
          stage: account.stage,
          totalOutstanding: account.totalOutstanding,
          totalECL: account.totalECL
        });
        
        // Coba dengan berbagai endpoint scenarios
        const endpoints = [
          `http://localhost:4232/api/v1/banking/individual/impairment/scenarios?accountId=${account.segmentId}`,
          `http://localhost:4232/api/v1/banking/individual/impairment/scenarios/${account.segmentId}`,
          'http://localhost:4232/api/v1/banking/individual/impairment/scenarios'
        ];
        
        for (const endpoint of endpoints) {
          try {
            console.log(`   Testing: ${endpoint}`);
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer demo_token_ADMIN',
                'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
              }
            });
            
            console.log(`   Status: ${response.status}`);
            
            if (response.ok) {
              const data = await response.json();
              console.log(`   Success: ${data.success}`);
              if (data.success && data.data) {
                console.log(`   Data length: ${data.data.length || 0}`);
                if (data.data.length > 0) {
                  console.log('   Sample scenarios:', JSON.stringify(data.data[0], null, 2));
                }
              } else {
                console.log('   Error:', data.message || data.error || 'Unknown error');
              }
            } else {
              const errorText = await response.text();
              console.log('   Error response:', errorText.substring(0, 200));
            }
          } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
          }
        }
      }
    } else {
      console.log('   ❌ No staging data available');
    }
    
  } catch (error) {
    console.log('❌ Global error:', error.message);
  }
};

await testScenariosWithAccount();

console.log('\n=== Test Complete ===');