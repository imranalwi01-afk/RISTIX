/**
 * Check platform_admin database for correct tenant UUID
 */
import postgres from 'postgres'

const sql = postgres({
  host: process.env.PLATFORM_DB_HOST || 'host.docker.internal',
  port: Number(process.env.PLATFORM_DB_PORT) || 5433,
  database: 'ifrspro_platform_admin',
  username: process.env.PLATFORM_DB_USER || 'postgres',
  password: process.env.PLATFORM_DB_PASSWORD || 'postgres',
  ssl: false,
})

async function checkPlatformTenant() {
  try {
    console.log('🔍 Checking platform_admin for IAF tenant...\n')
    
    // First check what columns exist
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'core' 
        AND table_name = 'tenants'
      ORDER BY ordinal_position
    `
    
    console.log('Columns in core.tenants:', JSON.stringify(columns, null, 2))
    
    // Try to get tenant data
    const tenants = await sql`
      SELECT *
      FROM core.tenants
      LIMIT 5
    `
    
    console.log('\nTenants:', JSON.stringify(tenants, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await sql.end()
  }
}

checkPlatformTenant()
