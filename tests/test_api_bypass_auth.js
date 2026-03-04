// Test API by calling service directly (bypass auth)
console.log('=== Testing API Directly (Bypass Auth) ===');

// Import service directly
const { individualImpairmentService } = await import('./src/services/individual-impairment.service.js');

const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';

// Test 1: Staging Analysis
console.log('\n1. Testing Staging Analysis...');
try {
  const stagingData = await individualImpairmentService.getStagingAnalysis(tenantId);
  console.log('✅ Staging Analysis: SUCCESS');
  console.log(`   Found ${stagingData?.length || 0} records`);
  if (stagingData?.length > 0) {
    console.log('   Sample record:', stagingData[0]);
  }
} catch (error) {
  console.log('❌ Staging Analysis Error:', error.message);
}

// Test 2: Staging Summary
console.log('\n2. Testing Staging Summary...');
try {
  const summaryData = await individualImpairmentService.getStagingSummary(tenantId);
  console.log('✅ Staging Summary: SUCCESS');
  console.log('   Summary:', summaryData);
} catch (error) {
  console.log('❌ Staging Summary Error:', error.message);
}

console.log('\n=== Test Complete ===');
