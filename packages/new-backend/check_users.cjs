const { Client } = require('pg');

// Check users in tenant DB
async function checkUsers() {
  // Try tenant DB first
  const tenantUrl = process.env.TENANT_DATABASE_URL || process.env.DATABASE_URL;
  console.log('Connecting to:', tenantUrl?.replace(/:[^:@]+@/, ':***@'));
  
  const client = new Client({ connectionString: tenantUrl });
  
  try {
    await client.connect();
    
    // Check core.users table
    console.log('\n=== core.users ===');
    const res = await client.query(`
      SELECT id, email, is_active, 
             LEFT(password_hash, 30) as hash_preview,
             LENGTH(password_hash) as hash_length
      FROM core.users 
      WHERE email ILIKE '%admin%' OR email ILIKE '%iaf%'
      LIMIT 10
    `);
    console.table(res.rows);
    
    // Check platform.platform_users if exists
    try {
      console.log('\n=== platform.platform_users ===');
      const res2 = await client.query(`
        SELECT id, email, is_active,
               LEFT(password_hash, 30) as hash_preview,
               LENGTH(password_hash) as hash_length
        FROM platform.platform_users 
        WHERE email ILIKE '%admin%' OR email ILIKE '%iaf%'
        LIMIT 10
      `);
      console.table(res2.rows);
    } catch (e) {
      console.log('platform.platform_users not found or error:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();
