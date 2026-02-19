// Test scenarios table existence
console.log('=== Testing Scenarios Table ===');

const testTable = async () => {
  try {
    console.log('\n1. Testing scenarios API...');
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('Data length:', data.data?.length || 0);
      if (data.data?.length > 0) {
        console.log('Sample scenario:', data.data[0]);
      }
    } else {
      console.log('Error:', data.message || data.error);
    }
    
    // Test CREATE scenario
    console.log('\n2. Testing CREATE scenario...');
    const createResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify({
        scenarioCode: 'TEST_SCENARIO_001',
        scenarioName: 'Test Scenario for Development',
        description: 'Test scenario created during development',
        configuration: {}
      })
    });
    
    console.log('Create Status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Create Response:', createData);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

await testTable();

console.log('\n=== Test Complete ===');
