// Test full API response
console.log('=== Testing Full API Response ===');

const response = await fetch('http://localhost:4232/api/v1/banking/ifrs9/impairment-module/staging-analysis', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo_token_ADMIN',
    'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
  }
});

console.log('Response status:', response.status);
console.log('Response headers:', Object.fromEntries(response.headers.entries()));

const text = await response.text();
console.log('Response text length:', text.length);
console.log('Response text:', text.substring(0, 500) + '...');

try {
  const json = JSON.parse(text);
  console.log('Parsed JSON success:', json.success);
  console.log('Data length:', json.data?.length || 0);
} catch (e) {
  console.log('JSON parse error:', e.message);
}
