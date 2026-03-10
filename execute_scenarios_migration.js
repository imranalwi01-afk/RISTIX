// Execute scenarios table migration
console.log('=== Executing Scenarios Table Migration ===');

const executeMigration = async () => {
  try {
    console.log('\n🔧 Creating scenarios table through application...');
    
    // SQL untuk membuat tabel scenarios
    const createTableSQL = `
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
      
      CREATE INDEX IF NOT EXISTS idx_scenarios_tenant ON core.individual_impairment_scenarios(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_scenarios_account ON core.individual_impairment_scenarios(account_id);
      CREATE INDEX IF NOT EXISTS idx_scenarios_status ON core.individual_impairment_scenarios(status);
      CREATE INDEX IF NOT EXISTS idx_scenarios_code ON core.individual_impairment_scenarios(scenario_code);
    `;
    
    // Try to execute through raw SQL endpoint
    console.log('1. Attempting raw SQL execution...');
    
    try {
      const response = await fetch('http://localhost:4232/api/v1/admin/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token_ADMIN',
          'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
        },
        body: JSON.stringify({ 
          sql: createTableSQL,
          description: 'Create individual impairment scenarios table'
        })
      });
      
      if (response.ok) {
        console.log('✅ Table created successfully via raw SQL endpoint');
        
        // Insert sample data
        await insertSampleData();
        return;
      } else {
        console.log('Raw SQL endpoint not available, trying alternative...');
      }
    } catch (error) {
      console.log('Raw SQL endpoint error:', error.message);
    }
    
    // Alternative: Try to create scenarios using the existing create endpoint
    console.log('\n2. Trying to create scenarios manually...');
    
    const sampleScenarios = [
      {
        scenarioCode: 'BASE001',
        scenarioName: 'Base Case Scenario',
        description: 'Normal economic conditions with standard recovery rates',
        discountRate: 0.05,
        recoveryRate: 0.8,
        growthRate: 0.02,
        timeHorizon: 60,
        paymentFrequency: 'monthly',
        isActive: true
      },
      {
        scenarioCode: 'STRESS001',
        scenarioName: 'Stress Test Scenario',
        description: 'Adverse economic conditions with lower recovery rates',
        discountRate: 0.08,
        recoveryRate: 0.6,
        growthRate: -0.01,
        timeHorizon: 60,
        paymentFrequency: 'monthly',
        isActive: true
      },
      {
        scenarioCode: 'OPTIM001',
        scenarioName: 'Optimistic Scenario',
        description: 'Favorable economic conditions with higher recovery rates',
        discountRate: 0.03,
        recoveryRate: 0.9,
        growthRate: 0.04,
        timeHorizon: 60,
        paymentFrequency: 'monthly',
        isActive: true
      }
    ];
    
    let successCount = 0;
    for (const scenario of sampleScenarios) {
      try {
        console.log(`Creating scenario: ${scenario.scenarioCode} - ${scenario.scenarioName}`);
        
        const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo_token_ADMIN',
            'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
          },
          body: JSON.stringify(scenario)
        });
        
        if (response.ok) {
          console.log(`✅ Created: ${scenario.scenarioCode}`);
          successCount++;
        } else {
          const error = await response.text();
          console.log(`❌ Failed to create ${scenario.scenarioCode}:`, error);
        }
      } catch (error) {
        console.log(`❌ Error creating ${scenario.scenarioCode}:`, error.message);
      }
    }
    
    console.log(`\n📊 Migration result: ${successCount}/${sampleScenarios.length} scenarios created`);
    
    if (successCount === 0) {
      console.log('\n💡 RECOMMENDATION:');
      console.log('The scenarios table needs to be created at the database level.');
      console.log('Please ask your database administrator to run the SQL script.');
      console.log('File: packages/new-backend/src/db/migrations/0033_create_individual_impairment_scenarios.sql');
    }
    
  } catch (error) {
    console.log('❌ Migration execution error:', error.message);
  }
};

const insertSampleData = async () => {
  console.log('\n3. Inserting sample data...');
  
  const sampleDataSQL = `
    INSERT INTO core.individual_impairment_scenarios 
    (tenant_id, account_id, scenario_code, scenario_name, description, discount_rate, recovery_rate, growth_rate, status, created_by) 
    VALUES 
    ('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'BASE001', 'Base Case Scenario', 'Normal economic conditions', 0.0500, 0.8000, 0.0200, 'APPROVED', 'demo_user'),
    ('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'STRESS001', 'Stress Test Scenario', 'Adverse economic conditions', 0.0800, 0.6000, -0.0100, 'APPROVED', 'demo_user'),
    ('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'OPTIM001', 'Optimistic Scenario', 'Favorable economic conditions', 0.0300, 0.9000, 0.0400, 'DRAFT', 'demo_user');
  `;
  
  try {
    const response = await fetch('http://localhost:4232/api/v1/admin/execute-sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify({ 
        sql: sampleDataSQL,
        description: 'Insert sample scenarios data'
      })
    });
    
    if (response.ok) {
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('❌ Failed to insert sample data');
    }
  } catch (error) {
    console.log('Sample data insertion error:', error.message);
  }
};

// Test scenarios after migration
const testScenariosAfterMigration = async () => {
  console.log('\n4. Testing scenarios after migration...');
  
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

await executeMigration();
await testScenariosAfterMigration();

console.log('\n=== Migration Process Complete ===');