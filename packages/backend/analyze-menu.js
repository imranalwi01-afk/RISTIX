const { Client } = require('pg');

async function analyzeCurrentMenuSystem() {
  console.log('🔍 Analyzing current menu system structure...');

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

    // Get menu configuration
    const configQuery = `
      SELECT id, name, description, is_default, is_active
      FROM platform_admin.menu_configurations
      ORDER BY created_at DESC
    `;

    const configResult = await client.query(configQuery);
    console.log('📋 Menu Configurations:', configResult.rows.length);
    configResult.rows.forEach((config, i) => {
      console.log(`  ${i+1}. ${config.name} (ID: ${config.id}) - Default: ${config.is_default}, Active: ${config.is_active}`);
    });

    const menuConfigId = configResult.rows[0]?.id;

    if (menuConfigId) {
      // Get all menu items with full details
      const menuQuery = `
        SELECT
          id,
          key,
          title,
          description,
          icon,
          url,
          type,
          parent_id,
          sort_order,
          is_active,
          user_types::text as user_types_text,
          banking_types::text as banking_types_text,
          metadata::text as metadata_text,
          created_at,
          updated_at
        FROM platform_admin.menu_items
        WHERE menu_config_id = $1
        ORDER BY sort_order, title
      `;

      const menuResult = await client.query(menuQuery, [menuConfigId]);
      console.log('\n📊 Menu Items Analysis:');
      console.log(`  Total items: ${menuResult.rows.length}`);

      const activeItems = menuResult.rows.filter(item => item.is_active);
      const rootItems = menuResult.rows.filter(item => !item.parent_id);
      const childItems = menuResult.rows.filter(item => item.parent_id);

      console.log(`  Active items: ${activeItems.length}`);
      console.log(`  Root items: ${rootItems.length}`);
      console.log(`  Child items: ${childItems.length}`);

      console.log('\n📋 Menu Items Structure:');
      menuResult.rows.forEach((item, i) => {
        const userTypeText = item.user_types_text ? item.user_types_text.substring(0, 50) + '...' : 'null';
        console.log(`  ${i+1}. ${item.title} (${item.key})`);
        console.log(`     URL: ${item.url || 'null'} | Parent: ${item.parent_id || 'root'} | Sort: ${item.sort_order}`);
        console.log(`     User Types: ${userTypeText}`);
        console.log(`     Active: ${item.is_active}`);
      });

      // Analyze hierarchy
      console.log('\n🏗️ Menu Hierarchy:');
      const buildHierarchy = (items, parentId = null, level = 0) => {
        const indent = '  '.repeat(level);
        const children = items.filter(item => item.parent_id === parentId);

        children.forEach(item => {
          console.log(`${indent}📁 ${item.title} (${item.key})`);
          buildHierarchy(items, item.id, level + 1);
        });
      };

      buildHierarchy(menuResult.rows);

      // Check what management endpoints we need
      console.log('\n🔧 Management Endpoints Needed:');
      console.log('  ✅ GET /api/v1/menu/items - List all menu items');
      console.log('  ✅ POST /api/v1/menu/items - Create menu item');
      console.log('  ✅ PUT /api/v1/menu/items/:id - Update menu item');
      console.log('  ✅ DELETE /api/v1/menu/items/:id - Delete menu item');
      console.log('  ✅ PUT /api/v1/menu/items/:id/reorder - Reorder menu items');
      console.log('  ✅ GET /api/v1/menu/configurations - List menu configurations');
      console.log('  ✅ POST /api/v1/menu/configurations - Create menu configuration');
      console.log('  ✅ PUT /api/v1/menu/configurations/:id - Update menu configuration');
      console.log('  ✅ POST /api/v1/menu/user-customization - Save user menu preferences');
      console.log('  ✅ GET /api/v1/menu/analytics - Menu access analytics');

      return {
        totalItems: menuResult.rows.length,
        activeItems: activeItems.length,
        rootItems: rootItems.length,
        childItems: childItems.length,
        menuConfigId: menuConfigId,
        menuItems: menuResult.rows
      };
    }

    await client.end();
    console.log('\n🎉 Menu system analysis completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

analyzeCurrentMenuSystem();