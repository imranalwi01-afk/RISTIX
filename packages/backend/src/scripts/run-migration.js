// packages/backend/src/scripts/run-migration.js
// ============================================================================
// 🔧 APPL-007: QUICK MIGRATION RUNNER (JavaScript)
// ============================================================================
// ✅ PURPOSE: Quick migration runner for FRS9 parameter bridge
// ✅ USAGE: node packages/backend/src/scripts/run-migration.js
// ============================================================================

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const FRS9_DB_CONFIG = {
  host: process.env.FRS9_DB_HOST || '192.168.0.106',
  port: parseInt(process.env.FRS9_DB_PORT || '5433'),
  database: process.env.FRS9_DB_NAME || 'FRS9PRO',
  user: process.env.FRS9_DB_USER || 'postgres',
  password: process.env.FRS9_DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 30000,
  statement_timeout: 300000
};

async function runMigration() {
  console.log('🚀 [APPL-007] Starting FRS9 Parameter Bridge Migration...');
  console.log(`📡 [APPL-007] Connecting to ${FRS9_DB_CONFIG.host}:${FRS9_DB_CONFIG.port}/${FRS9_DB_CONFIG.database}`);
  
  const client = new Client(FRS9_DB_CONFIG);
  
  try {
    // Connect
    await client.connect();
    console.log('✅ [APPL-007] Connected to FRS9PRO database');
    
    // Test connection
    const versionResult = await client.query('SELECT version()');
    console.log('📊 [APPL-007] PostgreSQL version:', versionResult.rows[0].version.split(' ')[1]);
    
    // Load migration SQL
    const migrationPath = path.join(__dirname, '../../../../src/core/database/migrations/003-frs9-parameter-bridge-migration.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(`📄 [APPL-007] Loaded migration SQL (${migrationSQL.length} characters)`);
    
    // Execute migration
    console.log('⚡ [APPL-007] Executing migration...');
    const startTime = Date.now();
    
    await client.query(migrationSQL);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ [APPL-007] Migration executed successfully (${executionTime}ms)`);
    
    // Verify results
    const appParamCount = await client.query("SELECT COUNT(*) FROM frs9_param_commonh WHERE param_type = 'A'");
    const detailCount = await client.query("SELECT COUNT(*) FROM frs9_param_commond");
    
    console.log('📊 [APPL-007] Migration Results:');
    console.log(`   📋 Application Parameters: ${appParamCount.rows[0].count}`);
    console.log(`   📝 Parameter Details: ${detailCount.rows[0].count}`);
    
    console.log('🎉 [APPL-007] Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ [APPL-007] Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 [APPL-007] Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ [APPL-007] Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ [APPL-007] Migration script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runMigration };