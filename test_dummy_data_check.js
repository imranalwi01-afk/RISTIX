// Check if data is dummy/test data
console.log('=== Dummy Data Detection Analysis ===');

const checkDummyData = async () => {
  try {
    console.log('\n🔍 Testing staging analysis for dummy data detection...');
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
      
      // Check for dummy data patterns
      const outstandingValues = data.data.map(r => parseFloat(r.totalOutstanding || 0));
      
      // Pattern 1: Check for round numbers (multiples of 1000, 10000, etc.)
      const roundNumberPatterns = {
        divisibleBy1000: data.data.filter(r => parseFloat(r.totalOutstanding || 0) % 1000 === 0).length,
        divisibleBy10000: data.data.filter(r => parseFloat(r.totalOutstanding || 0) % 10000 === 0).length,
        divisibleBy1000000: data.data.filter(r => parseFloat(r.totalOutstanding || 0) % 1000000 === 0).length,
        divisibleBy10000000: data.data.filter(r => parseFloat(r.totalOutstanding || 0) % 10000000 === 0).length
      };
      
      console.log('\n🎯 Round Number Pattern Analysis:');
      Object.entries(roundNumberPatterns).forEach(([pattern, count]) => {
        const percentage = (count / data.data.length * 100).toFixed(1);
        console.log(`   - ${pattern}: ${count} records (${percentage}%)`);
      });
      
      // Pattern 2: Check for repeated values
      const valueFrequency = {};
      data.data.forEach(r => {
        const val = parseFloat(r.totalOutstanding || 0);
        valueFrequency[val] = (valueFrequency[val] || 0) + 1;
      });
      
      const repeatedValues = Object.entries(valueFrequency).filter(([val, freq]) => freq > 1);
      console.log('\n🔄 Repeated Value Analysis:');
      console.log(`   - Unique values: ${Object.keys(valueFrequency).length}`);
      console.log(`   - Values repeated: ${repeatedValues.length}`);
      if (repeatedValues.length > 0) {
        console.log('   - Top repeated values:');
        repeatedValues.sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([value, freq]) => {
          console.log(`     * Rp ${parseFloat(value).toLocaleString()}: ${freq} times`);
        });
      }
      
      // Pattern 3: Check for sequential or patterned dates
      const dates = data.data.map(r => r.prcDate).filter(date => date);
      const uniqueDates = [...new Set(dates)];
      console.log('\n📅 Date Pattern Analysis:');
      console.log(`   - Unique dates: ${uniqueDates.length}`);
      console.log(`   - Date range: ${uniqueDates.sort()[0]} to ${uniqueDates.sort()[uniqueDates.length-1]}`);
      
      // Check for test dates (future dates, round dates)
      const today = new Date();
      const futureDates = uniqueDates.filter(date => new Date(date) > today);
      const roundDates = uniqueDates.filter(date => {
        const d = new Date(date);
        return d.getDate() === 1 || d.getDate() === 15; // 1st or 15th of month
      });
      
      console.log(`   - Future dates: ${futureDates.length} (${futureDates.join(', ')})`);
      console.log(`   - Round dates (1st/15th): ${roundDates.length}`);
      
      // Pattern 4: Check for zero values
      const zeroValues = data.data.filter(r => parseFloat(r.totalOutstanding || 0) === 0).length;
      console.log(`\n0️⃣  Zero Value Analysis:`);
      console.log(`   - Zero outstanding: ${zeroValues} records (${(zeroValues/data.data.length*100).toFixed(1)}%)`);
      
      // Pattern 5: Check segment patterns
      const segments = data.data.map(r => r.segmentId).filter(seg => seg);
      const uniqueSegments = [...new Set(segments)];
      console.log(`\n🏷️  Segment Pattern Analysis:`);
      console.log(`   - Unique segments: ${uniqueSegments.length}`);
      console.log(`   - Segments: ${uniqueSegments.join(', ')}`);
      
      // Check for test segment names
      const testSegments = uniqueSegments.filter(seg => 
        seg.toLowerCase().includes('test') || 
        seg.toLowerCase().includes('dummy') ||
        seg.toLowerCase().includes('sample') ||
        seg === 'Unknown'
      );
      console.log(`   - Test/dummy segments: ${testSegments.length} (${testSegments.join(', ')})`);
      
      // Final dummy data score
      let dummyScore = 0;
      if (roundNumberPatterns.divisibleBy1000000 > data.data.length * 0.5) dummyScore += 30;
      if (repeatedValues.length > data.data.length * 0.1) dummyScore += 20;
      if (futureDates.length > 0) dummyScore += 20;
      if (zeroValues > data.data.length * 0.1) dummyScore += 15;
      if (testSegments.length > uniqueSegments.length * 0.3) dummyScore += 15;
      
      console.log('\n🎯 Dummy Data Probability Score:');
      console.log(`   - Score: ${dummyScore}/100`);
      if (dummyScore >= 70) {
        console.log('   - 🚨 HIGH PROBABILITY: This is dummy/test data');
      } else if (dummyScore >= 40) {
        console.log('   - ⚠️  MEDIUM PROBABILITY: Likely contains dummy data');
      } else {
        console.log('   - ✅ LOW PROBABILITY: Likely real production data');
      }
      
      // Additional checks
      console.log('\n🔍 Additional Environment Checks:');
      
      // Check tenant ID pattern
      const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
      console.log(`   - Tenant ID: ${tenantId}`);
      console.log(`   - Tenant pattern: ${tenantId.includes('demo') || tenantId.includes('test') ? 'Test pattern detected' : 'Standard UUID'}`);
      
      // Check authorization token
      const authToken = 'demo_token_ADMIN';
      console.log(`   - Auth token: ${authToken}`);
      console.log(`   - Token pattern: ${authToken.includes('demo') ? 'Demo token' : 'Production token'}`);
      
      // Summary
      console.log('\n📋 SUMMARY:');
      if (dummyScore >= 50) {
        console.log('   🎯 CONCLUSION: Data appears to be TEST/DUMMY data');
        console.log('   💡 RECOMMENDATION: Switch to production database or confirm with business team');
      } else {
        console.log('   ✅ CONCLUSION: Data appears to be PRODUCTION data');
        console.log('   💡 RECOMMENDATION: The large values may be due to currency unit differences');
      }
    }
    
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
};

await checkDummyData();

console.log('\n=== Analysis Complete ===');