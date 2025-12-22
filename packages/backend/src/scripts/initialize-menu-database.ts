#!/usr/bin/env node
/**
 * Initialize Menu Database with IAF Hierarchical Structure
 *
 * This script initializes the menu database with the corrected IAF seed data
 * that includes proper parent-child relationships for hierarchical navigation.
 */

import { Sequelize, Op } from 'sequelize';
import { getIAFMenuSeedData } from '../core/services/menu/iaf-menu-seed';
import { initializeMenuModels } from '../core/models/menu.models';
import { ConnectionFactory } from '../core/database/ConnectionFactory';

async function initializeMenuDatabase() {
  console.log('🚀 Initializing IAF Menu Database with Hierarchical Structure...');

  try {
    // Get IAF tenant database connection using ConnectionFactory
    const connectionFactory = ConnectionFactory.getInstance();
    const sequelize = await connectionFactory.createConnection('tenant_iaf', { type: 'sequelize' });

    console.log('📋 Connected to IAF tenant database');

    // Initialize models - ensure we have Sequelize instance
    if (!(sequelize instanceof Sequelize)) {
      throw new Error('Expected Sequelize instance but received Pool');
    }

    const { MenuItem, MenuConfiguration } = await initializeMenuModels(sequelize);

    // Skip sync - tables already exist with different structure
    // await sequelize.sync({ force: false });
    console.log('🗃️ Using existing database tables');

    // Get the IAF menu seed data
    const seedData = getIAFMenuSeedData();

    console.log(`📊 Processing ${seedData.configurations.length} configurations`);
    console.log(`📋 Processing ${seedData.items.length} menu items`);

    // Clear existing menu data (optional - remove if you want to preserve existing data)
    console.log('🧹 Clearing existing menu data...');
    await MenuItem.destroy({ where: {} });
    await MenuConfiguration.destroy({ where: {} });

    // Insert menu configurations
    console.log('💾 Inserting menu configurations...');
    for (const config of seedData.configurations) {
      await MenuConfiguration.create({
        id: config.id,
        name: config.name,
        description: config.description,
        target_audience: config.target_audience,
        banking_mode: config.banking_mode,
        tenant_specific: config.tenant_specific,
        is_default: config.is_default,
        is_active: config.is_active,
        version: config.version,
        created_by: config.created_by,
        created_at: config.created_at,
        updated_at: config.updated_at
      });
    }

    // Insert menu items with proper hierarchy
    console.log('💾 Inserting menu items with hierarchy...');
    const parentMap = new Map(); // Track parent items for hierarchy validation

    for (const item of seedData.items) {
      const menuItem = await MenuItem.create({
        id: item.id,
        menu_config_id: item.menu_config_id,
        key: item.key,
        title: item.title,
        description: item.description,
        icon: item.icon,
        url: item.url,
        component: item.component,
        type: item.type,
        parent_id: item.parent_id,
        sort_order: item.sort_order,
        is_active: item.is_active,
        permissions: item.permissions,
        user_types: item.user_types,
        banking_types: item.banking_types,
        tenant_types: item.tenant_types,
        visibility_rules: item.visibility_rules,
        breadcrumb: item.breadcrumb,
        external: item.external,
        target: item.target,
        metadata: item.metadata,
        created_at: item.created_at,
        updated_at: item.updated_at
      });

      // Track parent items for validation
      if (item.type === 'group') {
        parentMap.set(item.key, menuItem.id);
      }

      console.log(`  ✅ ${item.type === 'group' ? '📁' : '📄'} ${item.title} (${item.parent_id ? 'child of ' + item.parent_id : 'root'})`);
    }

    // Verify hierarchy was created correctly
    console.log('\n🔍 Verifying menu hierarchy...');
    const rootItems = await MenuItem.findAll({
      where: { parent_id: { [Op.is]: null } },
      order: [['sort_order', 'ASC']]
    });

    console.log(`📊 Found ${rootItems.length} root-level items:`);

    for (const rootItem of rootItems) {
      console.log(`  📁 ${rootItem.title} (${rootItem.key})`);

      // Get children of this root item
      const children = await MenuItem.findAll({
        where: { parent_id: rootItem.id },
        order: [['sort_order', 'ASC']]
      });

      for (const child of children) {
        console.log(`    📄 ${child.title} (${child.key})`);
      }
    }

    // Simple test query to verify data was inserted
    console.log('\n🧪 Verifying menu data insertion...');
    const allItems = await MenuItem.findAll({
      order: [['sort_order', 'ASC']]
    });

    console.log(`📋 Total menu items inserted: ${allItems.length}`);

    // Group by type to show distribution
    const groupItems = allItems.filter(item => item.type === 'group');
    const itemItems = allItems.filter(item => item.type === 'item');

    console.log(`📁 Menu groups: ${groupItems.length}`);
    console.log(`📄 Menu items: ${itemItems.length}`);

    // Show hierarchy structure
    console.log('\n🏗️ Menu Structure:');
    for (const item of allItems) {
      if (!item.parent_id) {
        // Root level item
        const children = allItems.filter(child => child.parent_id === item.id);
        console.log(`  ${item.type === 'group' ? '📁' : '📄'} ${item.title}`);
        for (const child of children) {
          console.log(`    📄 ${child.title}`);
        }
      }
    }

    console.log('\n✅ Menu database initialization completed successfully!');
    console.log('🎯 Hierarchical navigation structure is ready for frontend consumption');

    // Close database connection
    await sequelize.close();

  } catch (error) {
    console.error('❌ Error initializing menu database:', error);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initializeMenuDatabase()
    .then(() => {
      console.log('\n🎉 Menu database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

export { initializeMenuDatabase };