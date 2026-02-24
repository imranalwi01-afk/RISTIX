// Test route mapping
console.log('=== Testing Route Mapping ===');

// Test if the route is actually calling the controller
const response = await fetch('http://localhost:4232/api/v1/banking/ifrs9/impairment-module/staging-analysis', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo_token_ADMIN',
    'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be',
    'X-Debug': 'test-route-mapping'
  }
});

console.log('Response status:', response.status);
console.log('Response headers:', Object.fromEntries(response.headers.entries()));

const text = await response.text();
console.log('Response:', text);

// Check if there's a different route that might be intercepting
const testResponse = await fetch('http://localhost:4232/api/v1/banking/ifrs9/impairment-module/staging-analysis?debug=1', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo_token_ADMIN',
    'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
  }
});

console.log('Test with debug param - Status:', testResponse.status);
console.log('Test with debug param - Response:', await testResponse.text());
