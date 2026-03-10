// Test different ECL sources
console.log('=== Debug ECL Sources ===');

const testECLSources = async () => {
  try {
    console.log('\n1. Testing staging analysis with detailed ECL fields...');
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      console.log('\n=== Sample Record Structure ===');
      const sample = data.data[0];
      console.log('Available fields:', Object.keys(sample));
      
      console.log('\n=== ECL Field Analysis ===');
      console.log('totalECL values in first 10 records:');
      data.data.slice(0, 10).forEach((record, index) => {
        console.log(`Record ${index + 1}: totalECL=${record.totalECL}, avgOutstanding=${record.avgOutstanding}`);
      });
      
      // Check if there are any non-zero values at all
      const hasNonZeroECL = data.data.some(r => parseFloat(r.totalECL || 0) > 0);
      console.log(`\nHas non-zero ECL values: ${hasNonZeroECL}`);
      
      // Summary statistics
      const totalRecords = data.data.length;
      const zeroECLRecords = data.data.filter(r => parseFloat(r.totalECL || 0) === 0).length;
      const nonZeroECLRecords = totalRecords - zeroECLRecords;
      
      console.log('\n=== ECL Statistics ===');
      console.log(`Total records: ${totalRecords}`);
      console.log(`Zero ECL records: ${zeroECLRecords} (${(zeroECLRecords/totalRecords*100).toFixed(1)}%)`);
      console.log(`Non-zero ECL records: ${nonZeroECLRecords} (${(nonZeroECLRecords/totalRecords*100).toFixed(1)}%)`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

await testECLSources();

console.log('\n=== Analysis Complete ===');