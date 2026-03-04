// Test CRUD operations for IFRS9 Models
console.log('=== Testing CRUD Operations ===');

const testCRUD = async () => {
  try {
    console.log('\n1. Testing CREATE PD Model...');
    const createResponse = await fetch('http://localhost:4232/api/v1/banking/collective/pd-configurations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify({
        model_name: 'TEST CRUD PD MODEL',
        population_segment_id: 1,
        selected_method: 1,
        migration_interval: 12,
        population_type: 2,
        historical_month: 24,
        is_active: true
      })
    });
    
    const createData = await createResponse.json();
    console.log('Create Status:', createResponse.status);
    console.log('Create Success:', createData.success);
    
    if (createData.success && createData.data && createData.data[0]) {
      const newModelId = createData.data[0].id;
      console.log('New Model ID:', newModelId);
      
      console.log('\n2. Testing UPDATE PD Model...');
      const updateResponse = await fetch(`http://localhost:4232/api/v1/banking/collective/pd-configurations/${newModelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token_ADMIN',
          'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
        },
        body: JSON.stringify({
          model_name: 'TEST CRUD PD MODEL - UPDATED',
          population_segment_id: 1,
          selected_method: 2,
          migration_interval: 6,
          population_type: 1,
          historical_month: 12,
          is_active: false
        })
      });
      
      const updateData = await updateResponse.json();
      console.log('Update Status:', updateResponse.status);
      console.log('Update Success:', updateData.success);
      
      console.log('\n3. Testing DELETE PD Model...');
      const deleteResponse = await fetch(`http://localhost:4232/api/v1/banking/collective/pd-configurations/${newModelId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token_ADMIN',
          'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
        }
      });
      
      const deleteData = await deleteResponse.json();
      console.log('Delete Status:', deleteResponse.status);
      console.log('Delete Success:', deleteData.success);
    }
    
  } catch (error) {
    console.error('CRUD Test Error:', error.message);
  }
};

await testCRUD();

console.log('\n=== CRUD Test Complete ===');
console.log('\n🎉 FRONTEND URL: http://localhost:4231/banking/ifrs9/models?mode=conventional');
console.log('✅ Test Create, Edit, Delete operations in the frontend!');
