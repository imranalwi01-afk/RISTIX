/**
 * Quick migration runner script
 * Run with: bun run run-migration.ts
 */
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

const sql = postgres({
  host: process.env.TENANT_DB_HOST || 'host.docker.internal',
  port: Number(process.env.TENANT_DB_PORT) || 5433,
  database: process.env.TENANT_DB_NAME || 'ifrspro_tenant_iaf',
  username: process.env.TENANT_DB_USER || 'postgres',
  password: process.env.TENANT_DB_PASSWORD || 'postgres',
  ssl: false,
})

async function runMigration() {
  try {
    const migrationFile = process.argv[2] || '/app/migration.sql'
    console.log(`📦 Reading migration file: ${migrationFile}`)
    const migrationSQL = readFileSync(
      migrationFile,
      'utf-8'
    )

    console.log('🔄 Running migration...')
    await sql.unsafe(migrationSQL)

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

runMigration()
