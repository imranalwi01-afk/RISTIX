// Test both staging analysis and staging summary with correct paths
console.log('=== Testing Both Staging Paths ===');

const testAPI = async (url, name) => {
  try {
    console.log(`\nTesting ${name}...`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`OK: ${response.ok}`);
    
    const data = await response.json();
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`Data length: ${data.data?.length || 0}`);
      if (data.data?.length > 0) {
        console.log('Sample record:', data.data[0]);
      }
    } else {
      console.log('Error:', data.message || data.error);
    }
    
  } catch (error) {
    console.log(`❌ ${name} Error:`, error.message);
  }
};

// Test both endpoints with correct paths
await testAPI('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis', 'Staging Analysis');
await testAPI('http://localhost:4232/api/v1/banking/individual/impairment/staging-summary', 'Staging Summary');

console.log('\n=== Test Complete ===');
console.log('\n🎉 FRONTEND URL: http://localhost:4231/banking/ifrs9/staging?mode=conventional');
console.log('\n✅ UPDATE FRONTEND TO USE CORRECT API PATHS!');
