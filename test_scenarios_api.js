// Test scenarios API endpoint
console.log('=== Scenarios API Test ===');

const testScenarios = async () => {
  try {
    console.log('\n🔍 Testing scenarios API...');
    
    // Test different scenarios endpoints
    const endpoints = [
      'http://localhost:4232/api/v1/banking/individual/impairment/scenarios',
      'http://localhost:4232/api/v1/banking/individual/impairment/scenario-analysis',
      'http://localhost:4232/api/v1/banking/individual/impairment/scenario-summary'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n📡 Testing: ${endpoint}`);
      try {
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
              console.log('   Sample data:', JSON.stringify(data.data[0], null, 2));
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
    
  } catch (error) {
    console.log('❌ Global error:', error.message);
  }
};

await testScenarios();

console.log('\n=== Test Complete ===');