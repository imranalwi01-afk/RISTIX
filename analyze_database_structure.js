// Deep analysis of database structure and table references
console.log('=== Database Structure Analysis ===');

const analyzeDatabaseStructure = async () => {
  try {
    console.log('\n🔍 Analyzing database structure from code...');
    
    // Test get database schema info via API
    console.log('1. Testing database info endpoint...');
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Success: ${data.success}`);
      if (data.data && data.data.length > 0) {
        console.log('   Sample data structure:', JSON.stringify(data.data[0], null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
};

// Analyze migration files
const analyzeMigrations = () => {
  console.log('\n📁 Analyzing migration files...');
  
  // List of known table names from code analysis
  const knownTables = [
    'frs9_master_account',
    'frs9_imp_ia_header',
    'frs9_imp_ca_result_h',
    'individual_impairment_scenarios',
    'frs9_imp_ia_result_h',
    'frs9_imp_ca_result',
    'frs9_imp_ia_header'
  ];
  
  console.log('\n📋 Known Tables from Code Analysis:');
  knownTables.forEach(table => {
    console.log(`   - ${table}`);
  });
  
  console.log('\n🔍 Schema References Found:');
  console.log('   - core.individual_impairment_scenarios (from error message)');
  console.log('   - frs9_master_account (from staging query)');
  console.log('   - frs9_imp_ia_header (from staging query)');
  console.log('   - frs9_imp_ca_result_h (from staging query)');
};

// Analyze service file for table references
const analyzeServiceFile = () => {
  console.log('\n📄 Analyzing service file structure...');
  
  console.log('\n🎯 Key Service Methods Found:');
  console.log('   1. getStagingAnalysis() - Uses frs9_master_account');
  console.log('   2. getStagingSummary() - Uses frs9_master_account');
  console.log('   3. getScenarios() - Uses individual_impairment_scenarios');
  console.log('   4. createScenario() - Uses individual_impairment_scenarios');
  console.log('   5. updateScenarioStatus() - Uses individual_impairment_scenarios');
  
  console.log('\n🔗 Table Relationships:');
  console.log('   - frs9_master_account LEFT JOIN frs9_imp_ia_header');
  console.log('   - frs9_master_account LEFT JOIN frs9_imp_ca_result_h');
  console.log('   - individual_impairment_scenarios (standalone table)');
  
  console.log('\n📊 Data Flow:');
  console.log('   Staging Data: frs9_master_account → JOIN → frs9_imp_ia_header/ca_result_h');
  console.log('   Scenarios Data: individual_impairment_scenarios (direct query)');
};

// Analyze error patterns
const analyzeErrorPatterns = () => {
  console.log('\n🚨 Error Pattern Analysis:');
  
  console.log('\n❌ Known Errors:');
  console.log('   1. "relation \"core.individual_impairment_scenarios\" does not exist"');
  console.log('      → Table missing in database');
  console.log('      → Schema issue: table should be in "core" schema');
  
  console.log('\n💡 Implications:');
  console.log('   - Database migration belum lengkap');
  console.log('   - Schema "core" mungkin belum dibuat');
  console.log('   - Table individual_impairment_scenarios belum ada');
};

// Database structure inference
const inferDatabaseStructure = () => {
  console.log('\n🧠 Database Structure Inference:');
  
  console.log('\n📋 Probable Database Structure:');
  console.log('Schema: core');
  console.log('Tables:');
  console.log('  ├── frs9_master_account (main account data)');
  console.log('  ├── frs9_imp_ia_header (individual assessment header)');
  console.log('  ├── frs9_imp_ca_result_h (collective assessment results)');
  console.log('  ├── individual_impairment_scenarios (scenarios data) ← MISSING');
  console.log('  └── [other frs9_* tables]');
  
  console.log('\n🔧 Required Actions:');
  console.log('   1. Create schema "core" jika belum ada');
  console.log('   2. Create table individual_impairment_scenarios');
  console.log('   3. Run migration scripts');
  console.log('   4. Verify table structure');
};

await analyzeDatabaseStructure();
analyzeMigrations();
analyzeServiceFile();
analyzeErrorPatterns();
inferDatabaseStructure();

console.log('\n=== Analysis Complete ===');