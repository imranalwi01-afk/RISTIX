// Test different route paths
const testPaths = [
  '/api/v1/ifrs9/calculations/batch-results?date=2026-01-26',
  '/api/v1/ifrs9/calculations/batch-results/',
  '/api/v1/ifrs9/calculations/results?date=2026-01-26'
];

for (const path of testPaths) {
  console.log(`\n🧪 Testing: ${path}`);
  
  try {
    const response = await fetch(`http://localhost:4232${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });

    const result = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log(`❌ Error:`, error.message);
  }
}
