/**
 * Debug script to check user roles
 */
import postgres from 'postgres'

const sql = postgres({
  host: process.env.TENANT_DB_HOST || 'host.docker.internal',
  port: Number(process.env.TENANT_DB_PORT) || 5433,
  database: process.env.TENANT_DB_NAME || 'ifrspro_tenant_iaf',
  username: process.env.TENANT_DB_USER || 'postgres',
  password: process.env.TENANT_DB_PASSWORD || 'postgres',
  ssl: false,
})

async function debug() {
  try {
    console.log('🔍 Checking admin@iaf.co.id user_roles...\n')
    
    const result = await sql`
      SELECT 
        u.id as user_id,
        u.email,
        ur.id as user_role_id,
        ur.role_id,
        ur.is_active as ur_active,
        ur.tenant_id,
        pg_typeof(ur.tenant_id) as tenant_id_type,
        r.role_code,
        r.role_name
      FROM core.users u
      LEFT JOIN core.user_roles ur ON u.id = ur.user_id
      LEFT JOIN core.roles r ON ur.role_id = r.id
      WHERE u.email = 'admin@iaf.co.id'
    `
    
    console.log('User roles:', JSON.stringify(result, null, 2))
    
    // Check what's in platform_admin.tenants or core.tenant_info
    const tenants = await sql`
      SELECT id, tenant_slug, tenant_name, database_name
      FROM core.tenant_info
      WHERE tenant_slug = 'iaf'
    `
    console.log('\nTenant info:', JSON.stringify(tenants, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await sql.end()
  }
}

debug()
