#!/usr/bin/env ts-node
// packages/backend/src/scripts/migrations/run-etl-migration.ts
// ============================================================================
// ETL MIGRATION RUNNER - Deploy ETL Schema to Platform Admin Database
// ============================================================================
// ✅ DEPLOYMENT TARGET: ifrspro_platform_admin database
// ✅ CREATES: etl_processing schema with all required tables
// ============================================================================

import { Pool } from 'pg';
import { up as etlMigration } from '../../core/database/migrations/platform/002-create-etl-tables';

// Database configuration for platform admin
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: 'ifrspro_platform_admin',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

async function runETLMigration() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🚀 Starting ETL Migration Deployment...');
    console.log(`📊 Target Database: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log('');

    // Test connection first
    console.log('🔗 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Check if platform_admin database exists and has expected structure
    const checkQuery = `
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname IN ('platform_admin', 'public') 
      ORDER BY schemaname, tablename
    `;
    
    const existingTables = await client.query(checkQuery);
    console.log(`📋 Found ${existingTables.rows.length} existing tables in platform schemas`);
    
    if (existingTables.rows.length > 0) {
      console.log('📄 Existing platform tables:');
      existingTables.rows.forEach(row => {
        console.log(`   - ${row.schemaname}.${row.tablename}`);
      });
    }
    
    console.log('');
    console.log('🔄 Executing ETL migration...');
    
    // Execute the migration
    await client.query(etlMigration);
    
    console.log('✅ ETL migration executed successfully!');
    console.log('');
    
    // Verify the migration by checking created tables
    const verifyQuery = `
      SELECT schemaname, tablename, tableowner
      FROM pg_tables 
      WHERE schemaname = 'etl_processing'
      ORDER BY tablename
    `;
    
    const createdTables = await client.query(verifyQuery);
    
    if (createdTables.rows.length > 0) {
      console.log('📊 ETL Processing Tables Created:');
      createdTables.rows.forEach(row => {
        console.log(`   ✅ ${row.schemaname}.${row.tablename} (owner: ${row.tableowner})`);
      });
    } else {
      console.log('⚠️ Warning: No ETL tables found after migration');
    }
    
    // Check sample data in templates
    const templateQuery = `
      SELECT template_name, template_type, file_format, is_active
      FROM etl_processing.file_templates
      ORDER BY template_name
    `;
    
    const templates = await client.query(templateQuery);
    
    if (templates.rows.length > 0) {
      console.log('');
      console.log('📋 Sample File Templates Created:');
      templates.rows.forEach(row => {
        const status = row.is_active ? '🟢' : '🔴';
        console.log(`   ${status} ${row.template_name} (${row.template_type}, ${row.file_format})`);
      });
    }
    
    console.log('');
    console.log('🎉 ETL Migration Deployment Completed Successfully!');
    console.log('');
    console.log('📁 Available ETL Endpoints:');
    console.log('   POST   /api/v1/etl/upload              - Upload data files');
    console.log('   GET    /api/v1/etl/upload/:batchId    - Get upload status');
    console.log('   POST   /api/v1/etl/validate/:batchId  - Validate uploaded data');
    console.log('   POST   /api/v1/etl/process/:batchId   - Process validated data');
    console.log('   GET    /api/v1/etl/batches            - List all upload batches');
    console.log('   GET    /api/v1/etl/health             - ETL service health check');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('   1. Test ETL endpoints with sample data uploads');
    console.log('   2. Configure file upload directory permissions');
    console.log('   3. Set up Redis for ETL queue processing');
    console.log('   4. Configure tenant-specific data processing rules');
    
    client.release();
    
  } catch (error) {
    console.error('❌ ETL Migration Failed:', error);
    
    if (error instanceof Error) {
      console.error('Error Details:', error.message);
      if (error.stack) {
        console.error('Stack Trace:', error.stack);
      }
    }
    
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Verify database connection settings');
    console.log('   2. Ensure ifrspro_platform_admin database exists');
    console.log('   3. Check PostgreSQL user permissions');
    console.log('   4. Verify PostgreSQL server is running');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute migration if run directly
if (require.main === module) {
  runETLMigration().catch(console.error);
}

export { runETLMigration };