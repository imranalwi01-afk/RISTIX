// Test IFRS9 pages with proper authentication
console.log('=== Testing IFRS9 Pages with Auth ===');

// Get auth token first (simulate login)
let authToken = '';
try {
  const loginResponse = await fetch('http://localhost:4232/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'banking@ifrs9.com',
      password: 'password123'
    })
  });
  
  if (loginResponse.ok) {
    const loginData = await loginResponse.json();
    authToken = loginData.data?.token || '';
    console.log('✅ Login successful, token obtained');
  } else {
    console.log('⚠️ Login failed, using mock token');
    authToken = 'mock-jwt-token-for-testing';
  }
} catch (error) {
  console.log('⚠️ Login error, using mock token');
  authToken = 'mock-jwt-token-for-testing';
}

console.log(`Using token: ${authToken.substring(0, 20)}...`);

// Test APIs with proper auth headers
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authToken}`,
  'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
};

// Test 1: Staging Analysis API
console.log('\n1. Testing Staging Analysis API...');
try {
  const stagingResponse = await fetch('http://localhost:4232/api/v1/banking/ifrs9/impairment-module/staging-analysis', {
    method: 'GET',
    headers
  });
  const stagingData = await stagingResponse.json();
  console.log('✅ Staging Analysis:', stagingResponse.ok ? 'SUCCESS' : 'FAILED');
  if (stagingResponse.ok && stagingData.success) {
    console.log(`   Found ${stagingData.data?.length || 0} records`);
  }
} catch (error) {
  console.log('❌ Staging Analysis Error:', error.message);
}

// Test 2: PD Models API
console.log('\n2. Testing PD Models API...');
try {
  const pdResponse = await fetch('http://localhost:4232/api/v1/banking/ifrs9/pd-configurations', {
    method: 'GET',
    headers
  });
  const pdData = await pdResponse.json();
  console.log('✅ PD Models:', pdResponse.ok ? 'SUCCESS' : 'FAILED');
  if (pdResponse.ok && pdData.success) {
    console.log(`   Found ${pdData.data?.length || 0} PD models`);
  }
} catch (error) {
  console.log('❌ PD Models Error:', error.message);
}

console.log('\n=== Test Complete ===');
console.log('\n📋 Expected Results:');
console.log('• Staging: http://localhost:4231/banking/ifrs9/staging?mode=conventional');
console.log('• Models: http://localhost:4231/banking/ifrs9/models?mode=conventional');
