// packages/backend/src/scripts/migrations/run-frs9-parameter-migration.ts
// ============================================================================
// 🔧 APPL-007: FRS9 PARAMETER MIGRATION RUNNER
// ============================================================================
// ✅ PURPOSE: Execute FRS9 parameter bridge migration
// ✅ SCOPE: Ensures FRS9PRO database is properly configured for Application Parameters
// ✅ SAFE: Can be run multiple times (idempotent operations)
// ============================================================================

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// ==========================================
// CONFIGURATION
// ==========================================

const FRS9_DB_CONFIG = {
  host: process.env.FRS9_DB_HOST || '192.168.0.106',
  port: parseInt(process.env.FRS9_DB_PORT || '5433'),
  database: process.env.FRS9_DB_NAME || 'FRS9PRO',
  user: process.env.FRS9_DB_USER || 'postgres',
  password: process.env.FRS9_DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  statement_timeout: 300000, // 5 minutes
  query_timeout: 300000
};

// ==========================================
// MIGRATION RUNNER CLASS
// ==========================================

export class FRS9ParameterMigrationRunner {
  private client: Client;
  
  constructor() {
    this.client = new Client(FRS9_DB_CONFIG);
  }

  /**
   * Run the complete FRS9 parameter migration
   */
  async runMigration(): Promise<void> {
    console.log('🚀 [APPL-007] Starting FRS9 Parameter Bridge Migration...');
    console.log(`📡 [APPL-007] Connecting to FRS9PRO database at ${FRS9_DB_CONFIG.host}:${FRS9_DB_CONFIG.port}`);
    
    try {
      // Connect to database
      await this.client.connect();
      console.log('✅ [APPL-007] Connected to FRS9PRO database successfully');
      
      // Test connection
      await this.testConnection();
      
      // Load and execute migration SQL
      await this.executeMigrationSQL();
      
      // Verify migration success
      await this.verifyMigration();
      
      console.log('🎉 [APPL-007] FRS9 Parameter Bridge Migration completed successfully!');
      
    } catch (error) {
      console.error('❌ [APPL-007] Migration failed:', error);
      throw error;
    } finally {
      try {
        await this.client.end();
        console.log('🔌 [APPL-007] Database connection closed');
      } catch (closeError) {
        console.warn('⚠️ [APPL-007] Warning: Failed to close database connection:', closeError);
      }
    }
  }

  /**
   * Test database connection and basic table access
   */
  private async testConnection(): Promise<void> {
    console.log('🏥 [APPL-007] Testing database connection and table access...');
    
    try {
      // Test basic connection
      const versionResult = await this.client.query('SELECT version()');
      console.log('📊 [APPL-007] PostgreSQL version:', versionResult.rows[0].version.split(' ')[1]);
      
      // Check if parameter tables exist
      const tableCheckQuery = `
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_name IN ('frs9_param_commonh', 'frs9_param_commond', 'frs9_param_product', 'frs9_param_journal')
        ORDER BY table_name;
      `;
      
      const tableResult = await this.client.query(tableCheckQuery);
      
      if (tableResult.rows.length === 0) {
        throw new Error('Required FRS9 parameter tables not found in database');
      }
      
      console.log('📋 [APPL-007] Found parameter tables:');
      tableResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name} (${row.column_count} columns)`);
      });
      
      // Check current record counts
      const countQueries = [
        { name: 'Application Parameters (Type A)', query: "SELECT COUNT(*) FROM frs9_param_commonh WHERE param_type = 'A'" },
        { name: 'Business Parameters (Type B)', query: "SELECT COUNT(*) FROM frs9_param_commond" },
        { name: 'Product Parameters', query: "SELECT COUNT(*) FROM frs9_param_product" },
        { name: 'Journal Parameters', query: "SELECT COUNT(*) FROM frs9_param_journal" }
      ];
      
      console.log('📊 [APPL-007] Current record counts:');
      for (const countQuery of countQueries) {
        try {
          const result = await this.client.query(countQuery.query);
          console.log(`   📈 ${countQuery.name}: ${result.rows[0].count} records`);
        } catch (error) {
          console.log(`   ⚠️ ${countQuery.name}: Unable to count (table may be empty)`);
        }
      }
      
    } catch (error) {
      console.error('❌ [APPL-007] Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Load and execute the migration SQL file
   */
  private async executeMigrationSQL(): Promise<void> {
    console.log('📜 [APPL-007] Loading migration SQL file...');
    
    try {
      // Load migration SQL file
      const migrationPath = path.join(
        __dirname, 
        '../../../../src/core/database/migrations/003-frs9-parameter-bridge-migration.sql'
      );
      
      if (!fs.existsSync(migrationPath)) {
        throw new Error(`Migration file not found: ${migrationPath}`);
      }
      
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log(`📄 [APPL-007] Loaded migration SQL (${migrationSQL.length} characters)`);
      
      // Execute migration SQL
      console.log('⚡ [APPL-007] Executing migration SQL...');
      const startTime = Date.now();
      
      await this.client.query(migrationSQL);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ [APPL-007] Migration SQL executed successfully (${executionTime}ms)`);
      
    } catch (error) {
      console.error('❌ [APPL-007] Failed to execute migration SQL:', error);
      throw error;
    }
  }

  /**
   * Verify migration completed successfully
   */
  private async verifyMigration(): Promise<void> {
    console.log('🔍 [APPL-007] Verifying migration results...');
    
    try {
      // Check if new columns were added
      const columnCheckQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'frs9_param_commonh'
        AND column_name IN ('banking_type', 'tenant_id', 'is_active', 'requires_approval')
        ORDER BY column_name;
      `;
      
      const columnResult = await this.client.query(columnCheckQuery);
      console.log('🆕 [APPL-007] New columns added to frs9_param_commonh:');
      
      if (columnResult.rows.length === 0) {
        console.log('   ⚠️ No new columns found (they may have existed already)');
      } else {
        columnResult.rows.forEach(row => {
          console.log(`   ✅ ${row.column_name} (${row.data_type}) - Default: ${row.column_default || 'NULL'}`);
        });
      }
      
      // Check if views were created
      const viewCheckQuery = `
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname IN ('view_application_parameters', 'view_business_parameters')
        ORDER BY viewname;
      `;
      
      const viewResult = await this.client.query(viewCheckQuery);
      console.log('👁️ [APPL-007] Views created:');
      
      if (viewResult.rows.length === 0) {
        console.log('   ⚠️ No views found - they may not have been created');
      } else {
        viewResult.rows.forEach(row => {
          console.log(`   ✅ ${row.viewname}`);
        });
      }
      
      // Check if history table was created
      const historyTableQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'frs9_param_history';
      `;
      
      const historyResult = await this.client.query(historyTableQuery);
      if (historyResult.rows.length > 0) {
        console.log('📚 [APPL-007] History table created: frs9_param_history');
      }
      
      // Check if functions were created
      const functionCheckQuery = `
        SELECT proname 
        FROM pg_proc 
        WHERE proname IN ('validate_param_code', 'get_next_param_code');
      `;
      
      const functionResult = await this.client.query(functionCheckQuery);
      console.log('⚙️ [APPL-007] Functions created:');
      
      if (functionResult.rows.length === 0) {
        console.log('   ⚠️ No functions found');
      } else {
        functionResult.rows.forEach(row => {
          console.log(`   ✅ ${row.proname}()`);
        });
      }
      
      // Check sample data
      const sampleDataQuery = `
        SELECT COUNT(*) as count
        FROM frs9_param_commonh 
        WHERE param_type = 'A' 
        AND param_code LIKE 'SYS_%'
        AND createdby = 'system';
      `;
      
      const sampleResult = await this.client.query(sampleDataQuery);
      const sampleCount = parseInt(sampleResult.rows[0].count);
      
      if (sampleCount > 0) {
        console.log(`📝 [APPL-007] Sample application parameters created: ${sampleCount} records`);
      }
      
      // Final verification
      const finalCountQuery = `
        SELECT 
          (SELECT COUNT(*) FROM frs9_param_commonh WHERE param_type = 'A') as app_params,
          (SELECT COUNT(*) FROM frs9_param_commond) as details,
          (SELECT COUNT(*) FROM frs9_param_product WHERE active_flag = true) as products,
          (SELECT COUNT(*) FROM frs9_param_journal WHERE active_flag = true) as journals;
      `;
      
      const finalResult = await this.client.query(finalCountQuery);
      const counts = finalResult.rows[0];
      
      console.log('📊 [APPL-007] Final verification:');
      console.log(`   📋 Application Parameters: ${counts.app_params}`);
      console.log(`   📝 Parameter Details: ${counts.details}`);
      console.log(`   🏦 Product Parameters: ${counts.products}`);
      console.log(`   📊 Journal Parameters: ${counts.journals}`);
      
      if (parseInt(counts.app_params) === 0) {
        console.warn('⚠️ [APPL-007] Warning: No application parameters found after migration');
      }
      
    } catch (error) {
      console.error('❌ [APPL-007] Migration verification failed:', error);
      throw error;
    }
  }
}

// ==========================================
// STANDALONE EXECUTION
// ==========================================

/**
 * Run migration if this file is executed directly
 */
async function runStandaloneMigration(): Promise<void> {
  console.log('🏃 [APPL-007] Running FRS9 Parameter Migration as standalone script...');
  
  const migration = new FRS9ParameterMigrationRunner();
  
  try {
    await migration.runMigration();
    console.log('✅ [APPL-007] Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [APPL-007] Migration failed:', error);
    process.exit(1);
  }
}

// Check if this file is being run directly
if (require.main === module) {
  runStandaloneMigration();
}

// Export for use in other modules
export { runStandaloneMigration };