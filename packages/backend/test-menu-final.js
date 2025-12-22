const { Client } = require('pg');

async function testMenuFinal() {
  console.log('🔍 Final menu API test for IAF_TENANT_SUPERADMIN...');

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

    // Fixed query - remove DISTINCT and include all ORDER BY columns in SELECT
    const testQuery = `
      SELECT
        mi.id,
        mi.key,
        mi.title,
        mi.description,
        mi.icon,
        mi.url,
        mi.type,
        mi.parent_id,
        mi.sort_order,
        mi.is_active,
        mi.user_types,
        mi.banking_types,
        mi.metadata
      FROM platform_admin.menu_items mi
      WHERE mi.is_active = true
        AND mi.menu_config_id = $1
        AND mi.user_types::text LIKE '%IAF_TENANT_SUPERADMIN%'
      ORDER BY mi.sort_order ASC, mi.title ASC
    `;

    const result = await client.query(testQuery, [menuConfigId]);
    console.log(`📊 Menu items found: ${result.rows.length}`);

    result.rows.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.title} (${item.key})`);
      console.log(`     URL: ${item.url || 'null'} | Parent: ${item.parent_id || 'root'} | Sort: ${item.sort_order}`);
    });

    // Build hierarchy for frontend
    console.log('\n🏗️ Building menu hierarchy...');
    const buildHierarchy = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          id: item.key,
          key: item.key,
          title: item.title,
          description: item.description,
          icon: item.icon,
          url: item.url,
          sort_order: item.sort_order,
          children: buildHierarchy(items, item.id)
        }));
    };

    const hierarchicalMenu = buildHierarchy(result.rows);

    console.log('\n📋 Hierarchical Menu Structure:');
    const printHierarchy = (items, level = 0) => {
      const indent = '  '.repeat(level);
      items.forEach(item => {
        console.log(`${indent}📁 ${item.title} (${item.key}) - ${item.url || 'no url'}`);
        if (item.children && item.children.length > 0) {
          printHierarchy(item.children, level + 1);
        }
      });
    };

    printHierarchy(hierarchicalMenu);

    // Simulate API response
    const apiResponse = {
      success: true,
      data: {
        menuItems: result.rows,
        hierarchy: hierarchicalMenu
      },
      meta: {
        userRole: 'IAF_TENANT_SUPERADMIN',
        totalItems: result.rows.length,
        databaseDriven: true,
        timestamp: new Date().toISOString()
      }
    };

    console.log('\n🌐 Simulated API Response:');
    console.log(`   Success: ${apiResponse.success}`);
    console.log(`   Total Items: ${apiResponse.meta.totalItems}`);
    console.log(`   Hierarchical Items: ${apiResponse.data.hierarchy.length} root items`);

    // Test with different role
    console.log('\n🔍 Testing with banking_staff role...');
    const testQueryBanking = `
      SELECT
        mi.id,
        mi.key,
        mi.title,
        mi.user_types::text as user_types_text
      FROM platform_admin.menu_items mi
      WHERE mi.is_active = true
        AND mi.menu_config_id = $1
        AND mi.user_types::text LIKE '%banking_staff%'
      ORDER BY mi.sort_order ASC, mi.title ASC
    `;

    const resultBanking = await client.query(testQueryBanking, [menuConfigId]);
    console.log(`📊 Menu items accessible to banking_staff: ${resultBanking.rows.length}`);

    await client.end();
    console.log('\n🎉 Menu API test completed successfully!');
    console.log('✅ admin@iaf.co.id with IAF_TENANT_SUPERADMIN role should see all menu items!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMenuFinal();