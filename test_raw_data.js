// Test raw data to understand staging distribution
console.log('=== Raw Data Analysis ===');

const testRawData = async () => {
  try {
    console.log('\n1. Testing raw staging data...');
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      // Group by stage to see distribution
      const stageGroups = {};
      data.data.forEach(record => {
        const stage = record.stage || 'null';
        if (!stageGroups[stage]) {
          stageGroups[stage] = {
            count: 0,
            totalOutstanding: 0,
            records: []
          };
        }
        stageGroups[stage].count++;
        stageGroups[stage].totalOutstanding += parseFloat(record.totalOutstanding || 0);
        if (stageGroups[stage].records.length < 3) {
          stageGroups[stage].records.push({
            prcDate: record.prcDate,
            segmentId: record.segmentId,
            totalOutstanding: record.totalOutstanding
          });
        }
      });
      
      console.log('\n=== Stage Distribution Analysis ===');
      Object.entries(stageGroups).forEach(([stage, group]) => {
        console.log(`\nStage ${stage}:`);
        console.log(`  Count: ${group.count}`);
        console.log(`  Total Outstanding: ${group.totalOutstanding.toLocaleString()}`);
        console.log(`  Sample Records:`, group.records);
      });
      
      // Check ECL values
      const nonZeroECL = data.data.filter(r => parseFloat(r.totalECL || 0) > 0);
      console.log(`\n=== ECL Analysis ===`);
      console.log(`Records with non-zero ECL: ${nonZeroECL.length}/${data.data.length}`);
      if (nonZeroECL.length > 0) {
        console.log('Sample ECL records:', nonZeroECL.slice(0, 3).map(r => ({
          stage: r.stage,
          segmentId: r.segmentId,
          totalECL: r.totalECL
        })));
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

await testRawData();

console.log('\n=== Analysis Complete ===');