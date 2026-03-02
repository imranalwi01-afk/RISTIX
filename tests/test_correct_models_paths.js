// Test IFRS9 Models with correct paths
console.log('=== Testing IFRS9 Models with Correct Paths ===');

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

// Test with correct paths
await testAPI('http://localhost:4232/api/v1/banking/collective/pd-configurations', 'PD Configurations (CORRECT)');
await testAPI('http://localhost:4232/api/v1/banking/collective/lgd-configurations', 'LGD Configurations (CORRECT)');
await testAPI('http://localhost:4232/api/v1/banking/collective/ead-configurations', 'EAD Configurations (CORRECT)');
await testAPI('http://localhost:4232/api/v1/banking/collective/ecl-config', 'ECL Configurations (CORRECT)');

console.log('\n=== Test Complete ===');
console.log('\n🎉 FRONTEND URL: http://localhost:4231/banking/ifrs9/models?mode=conventional');
console.log('\n✅ UPDATE FRONTEND TO USE CORRECT API PATHS!');
