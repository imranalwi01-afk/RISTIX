// Test dashboard API calls (without date parameter)
const response1 = await fetch('http://localhost:4232/api/v1/ifrs9/calculations/summary', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
  }
});

const summaryResult = await response1.json();
console.log('Dashboard Summary API (no date):', JSON.stringify(summaryResult, null, 2));

const response2 = await fetch('http://localhost:4232/api/v1/ifrs9/calculations/portfolio-trend', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
  }
});

const trendResult = await response2.json();
console.log('Dashboard Trend API (no date):', JSON.stringify(trendResult, null, 2));
