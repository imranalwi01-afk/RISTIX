// Create scenarios table programmatically
console.log('=== Creating Scenarios Table Programmatically ===');

const createScenariosTable = async () => {
  try {
    console.log('\n🔧 Creating scenarios table via API...');
    
    // Try to create the table via a debug endpoint or direct SQL execution
    const sqlScript = `
      -- Create scenarios table
      CREATE TABLE IF NOT EXISTS core.individual_impairment_scenarios (
        id SERIAL PRIMARY KEY,
        tenant_id UUID NOT NULL,
        account_id BIGINT NOT NULL,
        scenario_code VARCHAR(50) NOT NULL,
        scenario_name VARCHAR(100) NOT NULL,
        description TEXT,
        discount_rate NUMERIC(5,4) NOT NULL,
        recovery_rate NUMERIC(5,4) NOT NULL,
        growth_rate NUMERIC(5,4) NOT NULL,
        time_horizon INTEGER DEFAULT 60,
        payment_frequency VARCHAR(20) DEFAULT 'monthly',
        status VARCHAR(20) DEFAULT 'DRAFT',
        active_flag BOOLEAN DEFAULT true,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_scenarios_tenant ON core.individual_impairment_scenarios(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_scenarios_account ON core.individual_impairment_scenarios(account_id);
      CREATE INDEX IF NOT EXISTS idx_scenarios_status ON core.individual_impairment_scenarios(status);
      
      -- Insert sample data
      INSERT INTO core.individual_impairment_scenarios 
      (tenant_id, account_id, scenario_code, scenario_name, description, discount_rate, recovery_rate, growth_rate, status, created_by) 
      VALUES 
      ('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'BASE001', 'Base Case Scenario', 'Normal economic conditions', 0.0500, 0.8000, 0.0200, 'APPROVED', 'demo_user'),
      ('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'STRESS001', 'Stress Test Scenario', 'Adverse economic conditions', 0.0800, 0.6000, -0.0100, 'APPROVED', 'demo_user');
    `;
    
    // Try to execute via a raw SQL endpoint (if available)
    try {
      const response = await fetch('http://localhost:4232/api/v1/debug/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token_ADMIN',
          'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
        },
        body: JSON.stringify({ sql: sqlScript })
      });
      
      if (response.ok) {
        console.log('✅ Table created successfully via debug endpoint');
        return;
      }
    } catch (error) {
      console.log('Debug endpoint not available, trying alternative...');
    }
    
    // Alternative: Try to create via migration API
    try {
      const migrationResponse = await fetch('http://localhost:4232/api/v1/admin/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token_ADMIN',
          'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
        },
        body: JSON.stringify({ 
          migration: '0033_create_individual_impairment_scenarios',
          action: 'up'
        })
      });
      
      if (migrationResponse.ok) {
        console.log('✅ Migration executed successfully');
        return;
      }
    } catch (error) {
      console.log('Migration endpoint not available');
    }
    
    // Last resort: Try alternative approach - create scenarios via existing endpoints
    console.log('\n🔄 Trying alternative approach - creating scenarios manually...');
    
    // Check if we can get account IDs from staging data
    const stagingResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis?limit=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    if (stagingResponse.ok) {
      const stagingData = await stagingResponse.json();
      if (stagingData.success && stagingData.data && stagingData.data.length > 0) {
        console.log('✅ Found staging data, proceeding with scenario creation');
        
        // Try to create a scenario with minimal required data
        const scenarioData = {
          scenarioCode: 'BASE001',
          scenarioName: 'Base Case Scenario',
          description: 'Normal economic conditions',
          discountRate: 0.05,
          recoveryRate: 0.8,
          growthRate: 0.02,
          timeHorizon: 60,
          paymentFrequency: 'monthly',
          isActive: true
        };
        
        console.log('📊 Creating scenario with data:', JSON.stringify(scenarioData, null, 2));
        
        // Try the create scenario endpoint again
        const createResponse = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo_token_ADMIN',
            'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
          },
          body: JSON.stringify(scenarioData)
        });
        
        if (createResponse.ok) {
          console.log('✅ Scenario created successfully!');
          const result = await createResponse.json();
          console.log('Result:', JSON.stringify(result, null, 2));
        } else {
          const error = await createResponse.text();
          console.log('❌ Still getting error:', error);
          console.log('\n💡 RECOMMENDATION: The table needs to be created at database level');
          console.log('💡 Please ask your database administrator to run the SQL script');
          console.log('💡 File location: packages/new-backend/src/db/migrations/0033_create_individual_impairment_scenarios.sql');
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

// Test scenarios after creation
const testScenariosAfterCreation = async () => {
  console.log('\n🧪 Testing scenarios after creation attempt...');
  
  try {
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Scenarios API working - Data count: ${data.data?.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        console.log('Sample scenario:', JSON.stringify(data.data[0], null, 2));
      }
    } else {
      const error = await response.text();
      console.log('❌ Scenarios API error:', error);
    }
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
};

await createScenariosTable();
await testScenariosAfterCreation();

console.log('\n=== Process Complete ===');