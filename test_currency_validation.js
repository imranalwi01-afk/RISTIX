// Deep currency and unit validation
console.log('=== Deep Currency Unit Validation ===');

const validateCurrencyUnit = async () => {
  try {
    console.log('\n🔍 Testing staging analysis for currency unit validation...');
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
      console.log(`\n📊 Sample Data Analysis (${data.data.length} records):`);
      
      // Take sample of different value ranges
      const samples = {
        small: data.data.filter(r => parseFloat(r.totalOutstanding || 0) < 1000000).slice(0, 3),
        medium: data.data.filter(r => {
          const val = parseFloat(r.totalOutstanding || 0);
          return val >= 1000000 && val < 1000000000;
        }).slice(0, 3),
        large: data.data.filter(r => parseFloat(r.totalOutstanding || 0) >= 1000000000).slice(0, 3)
      };
      
      console.log('\n💰 Small Values (< 1 Juta Rupiah):');
      samples.small.forEach((record, i) => {
        console.log(`   ${i+1}. Outstanding: Rp ${parseFloat(record.totalOutstanding || 0).toLocaleString()}`);
      });
      
      console.log('\n💰 Medium Values (1 Juta - 1 Miliar Rupiah):');
      samples.medium.forEach((record, i) => {
        console.log(`   ${i+1}. Outstanding: Rp ${parseFloat(record.totalOutstanding || 0).toLocaleString()}`);
      });
      
      console.log('\n💰 Large Values (> 1 Miliar Rupiah):');
      samples.large.forEach((record, i) => {
        console.log(`   ${i+1}. Outstanding: Rp ${parseFloat(record.totalOutstanding || 0).toLocaleString()}`);
      });
      
      // Calculate if this makes sense for banking portfolio
      const totalOutstanding = data.data.reduce((sum, r) => sum + parseFloat(r.totalOutstanding || 0), 0);
      const avgOutstanding = totalOutstanding / data.data.length;
      
      console.log('\n📈 Banking Portfolio Analysis:');
      console.log(`   - Total Portfolio: Rp ${(totalOutstanding / 1000000000000).toFixed(2)} Triliun`);
      console.log(`   - Average per Account: Rp ${(avgOutstanding / 1000000000).toFixed(2)} Miliar`);
      console.log(`   - Number of Accounts: ${data.data.length}`);
      
      // Compare with realistic banking sizes
      console.log('\n🏦 Realistic Banking Comparison:');
      console.log(`   - Large Bank Portfolio: Rp 500-2000 Triliun (BNI, Mandiri, BCA)`);
      console.log(`   - Medium Bank Portfolio: Rp 50-500 Triliun`);
      console.log(`   - Small Bank Portfolio: Rp 5-50 Triliun`);
      console.log(`   - Current Data: Rp ${(totalOutstanding / 1000000000000).toFixed(2)} Triliun`);
      
      if (totalOutstanding > 2000000000000000) { // > 2000 Triliun
        console.log('\n⚠️  WARNING: Portfolio size exceeds largest Indonesian banks');
        console.log('💡 LIKELY ISSUE: Data unit is probably not in Rupiah');
        console.log('🔧 SUGGESTION: Check if data is in:');
        console.log('   - Thousands of Rupiah (divide by 1000)');
        console.log('   - USD (convert with proper rate)');
        console.log('   - Test data (expected for development)');
      } else if (totalOutstanding > 500000000000000) { // > 500 Triliun
        console.log('\n✅ NORMAL: Portfolio size within large bank range');
      } else {
        console.log('\n✅ NORMAL: Portfolio size within reasonable range');
      }
      
      // Check data consistency for unit detection
      const hasConsistentDecimals = data.data.every(r => {
        const val = parseFloat(r.totalOutstanding || 0);
        // Check if values are round numbers (likely test data)
        return val % 1000000 === 0; // Divisible by 1 million
      });
      
      console.log(`\n🔍 Data Pattern Analysis:`);
      console.log(`   - Round numbers (divisible by 1M): ${hasConsistentDecimals ? 'Yes - likely test data' : 'No - more realistic'}`);
      
      // Final assessment
      console.log('\n📋 FINAL ASSESSMENT:');
      if (totalOutstanding > 2000000000000000) {
        console.log('   🚨 HIGH PROBABILITY: Unit conversion issue');
        console.log('   🎯 ACTION: Verify data source and unit');
      } else {
        console.log('   ✅ LIKELY NORMAL: Within reasonable banking range');
        console.log('   👍 ACTION: Continue monitoring');
      }
    }
    
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
};

await validateCurrencyUnit();

console.log('\n=== Validation Complete ===');