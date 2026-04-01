// Debug staging summary
console.log('=== Debug Staging Summary ===');

const testStagingSummary = async () => {
  try {
    console.log('\n1. Testing Staging Summary API...');
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-summary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Success: ${data.success}`);
    
    if (data.success && data.data) {
      console.log('Staging Summary Data:', JSON.stringify(data.data, null, 2));
    } else {
      console.log('Error response:', data);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

// Test with different date parameters
const testWithDate = async (date) => {
  try {
    console.log(`\n2. Testing with date parameter: ${date}`);
    const response = await fetch(`http://localhost:4232/api/v1/banking/individual/impairment/staging-summary?date=${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const data = await response.json();
    console.log(`Success: ${data.success}`);
    
    if (data.success && data.data) {
      console.log('Data:', data.data);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

await testStagingSummary();
await testWithDate('2023-12-31');
await testWithDate('2023-11-30');

console.log('\n=== Test Complete ===');