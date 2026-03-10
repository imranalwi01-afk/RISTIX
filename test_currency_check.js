// Check currency conversion and data validation
console.log('=== Currency and Data Validation Check ===');

const testCurrencyData = async () => {
  try {
    console.log('\n🔍 Testing staging analysis for currency data...');
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
      console.log(`\n📊 Total Records: ${data.data.length}`);
      
      // Analyze outstanding values
      const outstandingValues = data.data.map(r => parseFloat(r.totalOutstanding || 0));
      const minOutstanding = Math.min(...outstandingValues);
      const maxOutstanding = Math.max(...outstandingValues);
      const avgOutstanding = outstandingValues.reduce((a, b) => a + b, 0) / outstandingValues.length;
      const totalOutstanding = outstandingValues.reduce((a, b) => a + b, 0);
      
      console.log('\n💰 Outstanding Value Analysis:');
      console.log(`   - Minimum: ${minOutstanding.toLocaleString()}`);
      console.log(`   - Maximum: ${maxOutstanding.toLocaleString()}`);
      console.log(`   - Average: ${avgOutstanding.toLocaleString()}`);
      console.log(`   - Total: ${totalOutstanding.toLocaleString()}`);
      
      // Check for outliers or suspicious values
      const largeValues = data.data.filter(r => parseFloat(r.totalOutstanding || 0) > 1000000000000); // > 1 Triliun
      const smallValues = data.data.filter(r => parseFloat(r.totalOutstanding || 0) < 1000000); // < 1 Juta
      
      console.log(`\n🔍 Value Distribution Analysis:`);
      console.log(`   - Records > 1 Triliun: ${largeValues.length}`);
      console.log(`   - Records < 1 Juta: ${smallValues.length}`);
      console.log(`   - Records 1 Juta - 1 Miliar: ${data.data.filter(r => {
        const val = parseFloat(r.totalOutstanding || 0);
        return val >= 1000000 && val <= 1000000000;
      }).length}`);
      console.log(`   - Records > 1 Miliar: ${data.data.filter(r => {
        const val = parseFloat(r.totalOutstanding || 0);
        return val > 1000000000;
      }).length}`);
      
      // Check currency unit (assuming in Rupiah)
      console.log('\n💵 Currency Unit Analysis:');
      console.log(`   - Total in Rupiah: Rp ${totalOutstanding.toLocaleString()}`);
      console.log(`   - Total in Miliar Rupiah: Rp ${(totalOutstanding / 1000000000).toFixed(2)} Miliar`);
      console.log(`   - Total in Triliun Rupiah: Rp ${(totalOutstanding / 1000000000000).toFixed(2)} Triliun`);
      
      // Sample records for validation
      console.log('\n📋 Sample Records (Top 5 by Outstanding):');
      const sortedData = [...data.data].sort((a, b) => 
        parseFloat(b.totalOutstanding || 0) - parseFloat(a.totalOutstanding || 0)
      );
      
      sortedData.slice(0, 5).forEach((record, index) => {
        console.log(`   ${index + 1}. Stage: ${record.stage}, Outstanding: Rp ${parseFloat(record.totalOutstanding || 0).toLocaleString()}, Segment: ${record.segmentId}`);
      });
      
      // Validation check
      console.log('\n✅ Validation Results:');
      if (totalOutstanding > 1000000000000000) { // > 1.000 Triliun
        console.log('   ⚠️  WARNING: Total outstanding > 1.000 Triliun Rupiah');
        console.log('   💡 Suggestion: Check if data is in correct currency unit');
      } else if (totalOutstanding > 1000000000000) { // > 1 Triliun
        console.log('   ✅ Normal: Total outstanding in reasonable range for large bank');
      } else {
        console.log('   ✅ Normal: Total outstanding in reasonable range');
      }
      
      // Check for data consistency
      const hasConsistentCurrency = data.data.every(r => {
        const val = parseFloat(r.totalOutstanding || 0);
        return val >= 0; // All values should be non-negative
      });
      
      console.log(`   ✅ Data Consistency: ${hasConsistentCurrency ? 'All values non-negative' : 'Some negative values found'}`);
    }
    
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
};

await testCurrencyData();

console.log('\n=== Analysis Complete ===');