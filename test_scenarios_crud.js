// Test Scenarios CRUD operations
console.log('=== Testing Scenarios CRUD ===');

const testScenariosCRUD = async () => {
  try {
    console.log('\n1. Testing GET all scenarios...');
    const getResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    const getData = await getResponse.json();
    console.log('GET Status:', getResponse.status);
    console.log('GET Success:', getData.success);
    console.log('Total scenarios:', getData.data?.length || 0);
    
    console.log('\n2. Testing CREATE scenario...');
    const createResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify({
        scenarioCode: 'TEST_WEB_UI',
        scenarioName: 'Test Scenario from Web UI',
        description: 'This scenario was created via the web interface testing'
      })
    });
    
    console.log('CREATE Status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('CREATE Response:', createData);
    
    if (getData.data && getData.data.length > 0) {
      const testScenario = getData.data.find(s => s.status === 'PENDING');
      if (testScenario) {
        console.log('\n3. Testing UPDATE scenario status...');
        const updateResponse = await fetch(`http://localhost:4232/api/v1/banking/individual/impairment/scenarios/${testScenario.pkid}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo_token_ADMIN',
            'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
          },
          body: JSON.stringify({ status: 'APPROVED' })
        });
        
        console.log('UPDATE Status:', updateResponse.status);
        const updateData = await updateResponse.json();
        console.log('UPDATE Response:', updateData);
      }
    }
    
    console.log('\n4. Testing GET scenarios by status...');
    const draftResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios?status=DRAFT', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    console.log('GET DRAFT Status:', draftResponse.status);
    const draftData = await draftResponse.json();
    console.log('Draft scenarios:', draftData.data?.length || 0);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

await testScenariosCRUD();

console.log('\n=== Scenarios CRUD Test Complete ===');
console.log('\n🎉 FRONTEND URL: http://localhost:4231/banking/ifrs9/scenarios?mode=conventional');
console.log('✅ Test Create, View, Edit, Status Update operations in frontend!');
