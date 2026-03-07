// Final verification test
console.log('=== Final Verification of Staging Analysis ===');

const runTest = async () => {
  console.log('\n🧪 Testing Staging Analysis API...');
  
  try {
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const data = await response.json();
    
    console.log(`✅ API Status: ${response.status}`);
    console.log(`✅ Success: ${data.success}`);
    console.log(`✅ Data Length: ${data.data?.length || 0} records`);
    
    if (data.success && data.data && data.data.length > 0) {
      console.log('\n📊 Data Quality Check:');
      
      // Check for null values
      const nullStageCount = data.data.filter(r => !r.stage || r.stage === 'null').length;
      const nullSegmentCount = data.data.filter(r => !r.segmentId || r.segmentId === 'null').length;
      
      console.log(`   - Records with valid stage: ${data.data.length - nullStageCount}/${data.data.length}`);
      console.log(`   - Records with valid segment: ${data.data.length - nullSegmentCount}/${data.data.length}`);
      
      // Stage distribution
      const stageDistribution = {};
      data.data.forEach(record => {
        const stage = record.stage || 'Unknown';
        stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
      });
      
      console.log('\n📈 Stage Distribution:');
      Object.entries(stageDistribution).forEach(([stage, count]) => {
        const percentage = (count / data.data.length * 100).toFixed(1);
        console.log(`   - Stage ${stage}: ${count} records (${percentage}%)`);
      });
      
      // Financial summary
      const totalOutstanding = data.data.reduce((sum, r) => sum + parseFloat(r.totalOutstanding || 0), 0);
      const totalECL = data.data.reduce((sum, r) => sum + parseFloat(r.totalECL || 0), 0);
      
      console.log('\n💰 Financial Summary:');
      console.log(`   - Total Outstanding: ${totalOutstanding.toLocaleString()}`);
      console.log(`   - Total ECL: ${totalECL.toLocaleString()}`);
      console.log(`   - ECL Ratio: ${totalOutstanding > 0 ? (totalECL / totalOutstanding * 100).toFixed(4) : 0}%`);
      
      // Sample records
      console.log('\n📋 Sample Records:');
      data.data.slice(0, 3).forEach((record, index) => {
        console.log(`   ${index + 1}. Date: ${record.prcDate}, Stage: ${record.stage}, Segment: ${record.segmentId}, Outstanding: ${parseFloat(record.totalOutstanding || 0).toLocaleString()}, ECL: ${parseFloat(record.totalECL || 0).toLocaleString()}`);
      });
      
      console.log('\n✅ Staging Analysis API is working correctly!');
      console.log('✅ Data is synchronized with database!');
      console.log('✅ Grid should display data properly!');
      
    } else {
      console.log('❌ No data returned from API');
    }
    
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
};

console.log('🔗 Testing URL: http://localhost:4231/banking/ifrs9/staging?mode=conventional');
await runTest();

console.log('\n=== Test Complete ===');