// Test both IFRS9 Staging and Models pages
console.log('=== Testing IFRS9 Pages ===');

// Test 1: Staging Analysis API
console.log('\n1. Testing Staging Analysis API...');
try {
  const stagingResponse = await fetch('http://localhost:4232/api/v1/banking/ifrs9/impairment-module/staging-analysis', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
    }
  });
  const stagingData = await stagingResponse.json();
  console.log('✅ Staging Analysis:', stagingData.success ? 'SUCCESS' : 'FAILED');
  if (stagingData.success) {
    console.log(`   Found ${stagingData.data?.length || 0} records`);
  }
} catch (error) {
  console.log('❌ Staging Analysis Error:', error.message);
}

// Test 2: Staging Summary API
console.log('\n2. Testing Staging Summary API...');
try {
  const summaryResponse = await fetch('http://localhost:4232/api/v1/banking/ifrs9/impairment-module/staging-summary', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
    }
  });
  const summaryData = await summaryResponse.json();
  console.log('✅ Staging Summary:', summaryData.success ? 'SUCCESS' : 'FAILED');
} catch (error) {
  console.log('❌ Staging Summary Error:', error.message);
}

// Test 3: PD Models API
console.log('\n3. Testing PD Models API...');
try {
  const pdResponse = await fetch('http://localhost:4232/api/v1/banking/ifrs9/pd-configurations', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
    }
  });
  const pdData = await pdResponse.json();
  console.log('✅ PD Models:', pdData.success ? 'SUCCESS' : 'FAILED');
  if (pdData.success) {
    console.log(`   Found ${pdData.data?.length || 0} PD models`);
  }
} catch (error) {
  console.log('❌ PD Models Error:', error.message);
}

// Test 4: LGD Models API
console.log('\n4. Testing LGD Models API...');
try {
  const lgdResponse = await fetch('http://localhost:4232/api/v1/banking/ifrs9/lgd-configurations', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
    }
  });
  const lgdData = await lgdResponse.json();
  console.log('✅ LGD Models:', lgdData.success ? 'SUCCESS' : 'FAILED');
  if (lgdData.success) {
    console.log(`   Found ${lgdData.data?.length || 0} LGD models`);
  }
} catch (error) {
  console.log('❌ LGD Models Error:', error.message);
}

console.log('\n=== Test Complete ===');
console.log('\n📋 Expected Results:');
console.log('• Staging: http://localhost:4231/banking/ifrs9/staging?mode=conventional');
console.log('• Models: http://localhost:4231/banking/ifrs9/models?mode=conventional');
console.log('• Scenarios: http://localhost:4231/banking/ifrs9/scenarios?mode=conventional');
