// Debug create scenario error 500
console.log('=== Create Scenario Error 500 Debug ===');

const testCreateScenario = async () => {
  try {
    console.log('\n🔍 Testing create scenario with debug data...');
    
    // Test data minimal untuk create scenario
    const testData = {
      scenarioCode: 'TEST001',
      scenarioName: 'Test Scenario 1',
      description: 'Test scenario for debugging',
      discountRate: 0.05,
      recoveryRate: 0.8,
      growthRate: 0.02,
      timeHorizon: 60,
      paymentFrequency: 'monthly',
      isActive: true
    };
    
    console.log('1. Testing with minimal data:');
    console.log('   Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`\n2. Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success: ${data.success}`);
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error Response: ${errorText}`);
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('   Parsed Error:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log('   Raw Error Text:', errorText);
      }
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
};

// Test with different data structures
const testVariations = async () => {
  console.log('\n\n=== Testing Data Variations ===');
  
  const variations = [
    {
      name: 'Complete Data',
      data: {
        scenarioCode: 'TEST002',
        scenarioName: 'Complete Test',
        description: 'Complete test scenario',
        discountRate: 0.05,
        recoveryRate: 0.8,
        growthRate: 0.02,
        timeHorizon: 60,
        paymentFrequency: 'monthly',
        isActive: true,
        createdBy: 'demo_user'
      }
    },
    {
      name: 'Only Required Fields',
      data: {
        scenarioCode: 'TEST003',
        scenarioName: 'Required Only',
        discountRate: 0.05,
        recoveryRate: 0.8,
        growthRate: 0.02
      }
    },
    {
      name: 'With Account ID',
      data: {
        scenarioCode: 'TEST004',
        scenarioName: 'With Account',
        description: 'Test with account ID',
        discountRate: 0.05,
        recoveryRate: 0.8,
        growthRate: 0.02,
        timeHorizon: 60,
        paymentFrequency: 'monthly',
        isActive: true,
        accountId: 12345
      }
    }
  ];
  
  for (const variation of variations) {
    console.log(`\n--- Testing: ${variation.name} ---`);
    console.log('Data:', JSON.stringify(variation.data, null, 2));
    
    try {
      const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token_ADMIN',
          'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
        },
        body: JSON.stringify(variation.data)
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${data.success}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
  }
};

await testCreateScenario();
await testVariations();

console.log('\n=== Debug Complete ===');