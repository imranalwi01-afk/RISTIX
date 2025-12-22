const { Client } = require('pg');

async function testConnection() {
  console.log('Testing database connections...');

  // Test local database connection
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'ifrspro_platform_admin',
    ssl: false
  });

  try {
    await client.connect();
    console.log('✅ Connected to ifrspro_platform_admin database');

    // Check if user tables exist
    const result = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema IN ('public', 'core', 'platform_admin', 'users', 'auth')
      ORDER BY table_schema, table_name
    `);

    console.log('📋 Tables found:');
    result.rows.forEach(row => {
      console.log(`  ${row.table_schema}.${row.table_name}`);
    });

    // Check for admin user
    const userQuery = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name LIKE '%user%' OR table_name LIKE '%role%'
      ORDER BY table_name, ordinal_position
    `);

    console.log('\n👥 User/Role related tables:');
    userQuery.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name} (${row.data_type})`);
    });

    // Check for admin@iaf.co.id user
    const adminUserQuery = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name LIKE '%user%' AND table_schema = 'public'
    `);

    console.log('\n🔍 User tables found:');
    adminUserQuery.rows.forEach(row => {
      console.log(`  ${row.table_name}`);
    });

    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();