// Debug ECL values
console.log('=== Debug ECL Values ===');

const testECLData = async () => {
  try {
    console.log('\n1. Testing staging analysis for ECL data...');
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
      // Find records with non-zero ECL
      const nonZeroECL = data.data.filter(r => parseFloat(r.totalECL || 0) > 0);
      console.log(`Records with non-zero ECL: ${nonZeroECL.length}/${data.data.length}`);
      
      if (nonZeroECL.length > 0) {
        console.log('\n=== Sample ECL Records ===');
        nonZeroECL.slice(0, 5).forEach((record, index) => {
          console.log(`Record ${index + 1}:`, {
            prcDate: record.prcDate,
            stage: record.stage,
            segmentId: record.segmentId,
            totalOutstanding: record.totalOutstanding,
            totalECL: record.totalECL,
            avgOutstanding: record.avgOutstanding
          });
        });
      }
      
      // Check ECL by stage
      const eclByStage = {};
      data.data.forEach(record => {
        const stage = record.stage || 'Unknown';
        const ecl = parseFloat(record.totalECL || 0);
        if (!eclByStage[stage]) {
          eclByStage[stage] = { count: 0, totalECL: 0, totalOutstanding: 0 };
        }
        eclByStage[stage].count++;
        eclByStage[stage].totalECL += ecl;
        eclByStage[stage].totalOutstanding += parseFloat(record.totalOutstanding || 0);
      });
      
      console.log('\n=== ECL Analysis by Stage ===');
      Object.entries(eclByStage).forEach(([stage, data]) => {
        console.log(`Stage ${stage}:`, {
          count: data.count,
          totalECL: data.totalECL.toLocaleString(),
          totalOutstanding: data.totalOutstanding.toLocaleString(),
          eclRatio: data.totalOutstanding > 0 ? (data.totalECL / data.totalOutstanding * 100).toFixed(4) + '%' : '0%'
        });
      });
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

await testECLData();

console.log('\n=== Analysis Complete ===');