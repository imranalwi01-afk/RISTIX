// Test portfolio trend API endpoint
const response = await fetch('http://localhost:4232/api/v1/ifrs9/calculations/portfolio-trend?date=2026-01-26', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
  }
});

const result = await response.json();
console.log('Portfolio trend API response:', JSON.stringify(result, null, 2));
