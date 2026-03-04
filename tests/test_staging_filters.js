// Test Staging Filters
console.log('=== Testing Staging Filters ===');

const testStagingFilters = async () => {
  try {
    console.log('\n1. Testing GET all staging data...');
    const allResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const allData = await allResponse.json();
    console.log('All data count:', allData.data?.length || 0);
    
    console.log('\n2. Testing filter by Stage 1...');
    const stage1Response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis?stage=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const stage1Data = await stage1Response.json();
    console.log('Stage 1 count:', stage1Data.data?.length || 0);
    console.log('Stage 1 sample:', stage1Data.data?.slice(0, 2));
    
    console.log('\n3. Testing filter by Stage 2...');
    const stage2Response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis?stage=2', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const stage2Data = await stage2Response.json();
    console.log('Stage 2 count:', stage2Data.data?.length || 0);
    console.log('Stage 2 sample:', stage2Data.data?.slice(0, 2));
    
    console.log('\n4. Testing filter by Stage 3...');
    const stage3Response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis?stage=3', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const stage3Data = await stage3Response.json();
    console.log('Stage 3 count:', stage3Data.data?.length || 0);
    console.log('Stage 3 sample:', stage3Data.data?.slice(0, 2));
    
    console.log('\n5. Testing filter by Segment ID...');
    const segmentResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis?segmentId=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const segmentData = await segmentResponse.json();
    console.log('Segment 1 count:', segmentData.data?.length || 0);
    console.log('Segment 1 sample:', segmentData.data?.slice(0, 2));
    
    console.log('\n6. Testing combined filters...');
    const combinedResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis?stage=1&segmentId=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const combinedData = await combinedResponse.json();
    console.log('Combined filters count:', combinedData.data?.length || 0);
    console.log('Combined filters sample:', combinedData.data?.slice(0, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

await testStagingFilters();

console.log('\n=== Staging Filters Test Complete ===');
console.log('\n🎉 FRONTEND URL: http://localhost:4231/banking/ifrs9/staging?mode=conventional');
console.log('✅ Test Stage filter, Segment ID filter, and date filters in frontend!');
