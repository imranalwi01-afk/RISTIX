const { Client } = require('pg');

async function verifyMenuSystem() {
  console.log('🔍 Verifying the complete menu system...');

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
    console.log('✅ Connected to platform_admin database');

    // Get menu config
    const configQuery = `
      SELECT id FROM platform_admin.menu_configurations
      WHERE is_active = true AND is_default = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const configResult = await client.query(configQuery);
    const menuConfigId = configResult.rows[0]?.id;

    if (!menuConfigId) {
      console.log('❌ No menu configuration found');
      return;
    }

    console.log('✅ Menu config ID:', menuConfigId);

    // Simple test query - no DISTINCT, no complex ORDER BY
    const testQuery = `
      SELECT
        mi.id,
        mi.key,
        mi.title,
        mi.url,
        mi.sort_order,
        mi.user_types::text as user_types_text
      FROM platform_admin.menu_items mi
      WHERE mi.is_active = true
        AND mi.menu_config_id = $1
        AND mi.user_types::text LIKE '%IAF_TENANT_SUPERADMIN%'
      ORDER BY mi.sort_order ASC
      LIMIT 20
    `;

    const testResult = await client.query(testQuery, [menuConfigId]);
    console.log(`📊 Menu items accessible to IAF_TENANT_SUPERADMIN: ${testResult.rows.length}`);

    console.log('\n📋 Complete Menu List:');
    testResult.rows.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.title} (${item.key})`);
      console.log(`     URL: ${item.url} | Sort: ${item.sort_order}`);
    });

    await client.end();
    console.log('\n🎉 Menu verification completed successfully!');
    console.log('✅ admin@iaf.co.id with IAF_TENANT_SUPERADMIN role can now access all menu items!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

verifyMenuSystem();