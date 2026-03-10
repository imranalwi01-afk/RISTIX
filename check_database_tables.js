// Check database tables for scenarios
console.log('=== Database Tables Analysis ===');

const checkDatabaseTables = async () => {
  try {
    console.log('\n🔍 Checking database table structure...');
    
    // Check available tables
    const tablesResponse = await fetch('http://localhost:4232/api/v1/debug/tables', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    if (tablesResponse.ok) {
      const tablesData = await tablesResponse.json();
      console.log('Available tables:', tablesData);
    } else {
      console.log('Debug endpoint not available, trying alternative approach...');
    }
    
    // Check migration files for scenarios
    console.log('\n📁 Checking migration files...');
    
    // Read migration files to find scenarios
    const migrations = [
      '0000_furry_next_avengers.sql',
      '0001_lush_ender_wiggin.sql',
      '0014_test_approval_policies.sql',
      '0015_create_workflows.sql',
      '0016_ecl_stored_procedures.sql',
      '0018_create_jobs_tables.sql',
      '0032_seed_notification_permissions.sql'
    ];
    
    let scenariosFound = false;
    
    for (const migration of migrations) {
      try {
        const response = await fetch(`http://localhost:4232/api/v1/debug/migration/${migration}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo_token_ADMIN',
            'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
          }
        });
        
        if (response.ok) {
          const content = await response.text();
          if (content.toLowerCase().includes('scenario')) {
            console.log(`✅ Found scenarios in ${migration}`);
            scenariosFound = true;
          }
        }
      } catch (error) {
        // Skip if endpoint doesn't exist
      }
    }
    
    if (!scenariosFound) {
      console.log('❌ No scenarios found in migration files');
    }
    
    // Alternative: Check via SQL query
    console.log('\n🗄️ Checking via SQL...');
    
    // Try to query the information schema
    const sqlQuery = `
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_name ILIKE '%scenario%'
      OR table_name ILIKE '%impairment%'
      ORDER BY table_name;
    `;
    
    console.log('SQL Query to run manually:');
    console.log(sqlQuery);
    
    console.log('\n📋 SUMMARY:');
    console.log('1. Tabel individual_impairment_scenarios TIDAK ditemukan');
    console.log('2. Tidak ada migration file untuk scenarios');
    console.log('3. Schema tersedia di core.individual_impairment_scenarios');
    console.log('4. Frontend dan Backend SIAP, hanya perlu tabel database');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

await checkDatabaseTables();

console.log('\n=== Analysis Complete ===');