// Test staging with detailed analysis
console.log('=== Detailed Staging Analysis Test ===');

const testAPI = async (url, name) => {
  try {
    console.log(`\nTesting ${name}...`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`OK: ${response.ok}`);
    
    const data = await response.json();
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`Data length: ${data.data?.length || 0}`);
      
      // Analyze first 5 records
      if (data.data && data.data.length > 0) {
        console.log('\n=== First 5 Records Analysis ===');
        data.data.slice(0, 5).forEach((record, index) => {
          console.log(`Record ${index + 1}:`, {
            prcDate: record.prcDate,
            stage: record.stage,
            segmentId: record.segmentId,
            totalOutstanding: record.totalOutstanding,
            totalECL: record.totalECL,
            avgOutstanding: record.avgOutstanding
          });
        });
        
        // Check for null values
        const nullStages = data.data.filter(r => r.stage === null).length;
        const nullSegments = data.data.filter(r => r.segmentId === null).length;
        console.log(`\n=== Data Quality Check ===`);
        console.log(`Records with null stage: ${nullStages}/${data.data.length}`);
        console.log(`Records with null segmentId: ${nullSegments}/${data.data.length}`);
        
        // Stage distribution
        const stageCounts = {};
        data.data.forEach(r => {
          const stage = r.stage || 'null';
          stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        });
        console.log('\n=== Stage Distribution ===');
        Object.entries(stageCounts).forEach(([stage, count]) => {
          console.log(`Stage ${stage}: ${count} records`);
        });
      }
    } else {
      console.log('Error:', data.message || data.error);
    }
    
  } catch (error) {
    console.log(`❌ ${name} Error:`, error.message);
  }
};

// Test both endpoints
await testAPI('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis', 'Staging Analysis');
await testAPI('http://localhost:4232/api/v1/banking/individual/impairment/staging-summary', 'Staging Summary');

console.log('\n=== Test Complete ===');