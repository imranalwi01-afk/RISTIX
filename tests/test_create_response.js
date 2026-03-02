// Test CREATE response format
console.log('=== Testing CREATE Response Format ===');

try {
  console.log('\nTesting CREATE PD Model...');
  const createResponse = await fetch('http://localhost:4232/api/v1/banking/collective/pd-configurations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_token_ADMIN',
      'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
    },
    body: JSON.stringify({
      model_name: 'TEST RESPONSE FORMAT',
      population_segment_id: 1,
      selected_method: 1,
      migration_interval: 12,
      population_type: 2,
      historical_month: 24,
      is_active: true
    })
  });
  
  console.log('Status:', createResponse.status);
  console.log('Headers:', Object.fromEntries(createResponse.headers.entries()));
  
  const text = await createResponse.text();
  console.log('Response Text:', text);
  
  try {
    const json = JSON.parse(text);
    console.log('Parsed JSON:', json);
  } catch (e) {
    console.log('Not JSON format');
  }
  
} catch (error) {
  console.error('Error:', error.message);
}
