#!/usr/bin/env bun
/**
 * Run approval schema migration on tenant_iaf database
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

const sql = postgres({
  host: 'localhost',
  port: 5432,
  database: 'tenant_iaf',
  username: 'postgres',
  password: 'postgres',
});

async function runMigration() {
  try {
    console.log('📋 Reading migration file...');
    const migrationSQL = readFileSync(
      join(__dirname, 'create_approval_schema_tenant.sql'),
      'utf-8'
    );

    console.log('🚀 Running approval schema migration on tenant_iaf...');
    
    // Execute the migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Verify tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'approval'
      ORDER BY table_name
    `;

    console.log('\n📊 Created tables in approval schema:');
    tables.forEach((table) => {
      console.log(`  - approval.${table.table_name}`);
    });

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
