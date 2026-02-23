// Test staging analysis API
const response = await fetch('http://localhost:4232/api/v1/banking/ifrs9/impairment-module/staging-analysis', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
  }
});

const result = await response.json();
console.log('Staging Analysis API response:', JSON.stringify(result, null, 2));
