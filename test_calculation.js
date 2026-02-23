// Test calculation API call
const response = await fetch('http://localhost:4232/api/v1/ifrs9/calculations/ecl', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
  },
  body: JSON.stringify({
    processDate: '2026-01-26',
    segmentIds: [1],
    calculationType: 'full',
    recalculate: false,
    scenarios: ['Base']
  })
});

const result = await response.json();
console.log('Calculation result:', result);
