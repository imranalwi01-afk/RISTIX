#!/usr/bin/env node
/**
 * Initialize Menu Database with IAF Hierarchical Structure - Simple Version
 *
 * This script works with the existing database table structure
 */

import { Sequelize, Op } from 'sequelize';
import { getIAFMenuSeedData } from '../core/services/menu/iaf-menu-seed';
import { ConnectionFactory } from '../core/database/ConnectionFactory';

async function initializeMenuDatabaseSimple() {
  console.log('🚀 Initializing IAF Menu Database (Simple Version)...');

  try {
    // Get IAF tenant database connection using ConnectionFactory
    const connectionFactory = ConnectionFactory.getInstance();
    const sequelize = await connectionFactory.createConnection('tenant_iaf', { type: 'sequelize' });

    console.log('📋 Connected to IAF tenant database');

    // Get the IAF menu seed data
    const seedData = getIAFMenuSeedData();

    console.log(`📊 Processing ${seedData.configurations.length} configurations`);
    console.log(`📋 Processing ${seedData.items.length} menu items`);

    // Clear existing menu data
    console.log('🧹 Clearing existing menu data...');
    await sequelize.query('DELETE FROM core.menu_items');

    // Insert menu items with simplified structure
    console.log('💾 Inserting menu items with hierarchy...');
    const parentMap = new Map(); // Track parent items for hierarchy validation

    for (const item of seedData.items) {
      // Find the parent_id from our hierarchy mapping
      let parentId: string | null = null;

      // Map items to their parent IDs based on the hierarchy we fixed
      const parentChildMap: Record<string, string[]> = {
        'general-setup': ['application-setting', 'business-setting'],
        'parameter-setup': ['product-parameter', 'journal-parameter'],
        'collective-impairment': [
          'segmentation-configuration',
          'rule-base-setting',
          'bucket-parameter',
          'pd-setup-management',
          'fl-scalar',
          'lgd-setup-management',
          'ead-setup-management',
          'ecl-configuration'
        ],
        'ifrs9-core-modules': ['impairment-module', 'amortization-module'],
        'ifrs9-reporting': [
          'nominative-report',
          'lifetime-pd',
          'lifetime-lgd',
          'ead-model',
          'ecl-result',
          'ecl-movement',
          'gca-movement'
        ],
        'maintenance-administration': [
          'approval',
          'user-activity',
          'job-monitoring',
          'user-management',
          'role-management'
        ]
      };

      Object.entries(parentChildMap).forEach(([parentKey, children]) => {
        if (children.includes(item.key)) {
          const parentItem = seedData.items.find(i => i.key === parentKey);
          if (parentItem) {
            parentId = parentItem.id;
          }
        }
      });

      // Insert using existing table structure with correct PostgreSQL array syntax
      await sequelize.query(`
        INSERT INTO core.menu_items (
          id,
          parent_id,
          menu_key,
          title,
          description,
          icon,
          url,
          menu_type,
          sort_order,
          is_active,
          banking_types,
          created_by,
          created_at,
          updated_at
        ) VALUES (
          :id,
          :parentId,
          :menuKey,
          :title,
          :description,
          :icon,
          :url,
          :menuType,
          :sortOrder,
          :isActive,
          ARRAY[:bankingTypes],
          :createdBy,
          :createdAt,
          :updatedAt
        )
      `, {
        replacements: {
          id: item.id,
          parentId: parentId,
          menuKey: item.key,
          title: item.title,
          description: item.description || null,
          icon: item.icon || null,
          url: item.url || null,
          menuType: item.type,
          sortOrder: item.sort_order || 100,
          isActive: item.is_active,
          bankingTypes: ['conventional', 'syariah', 'dual'], // Use default since we need array
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Track parent items for validation
      if (item.type === 'group') {
        parentMap.set(item.key, item.id);
      }

      console.log(`  ✅ ${item.type === 'group' ? '📁' : '📄'} ${item.title} (${parentId ? 'child of ' + parentId : 'root'})`);
    }

    // Verify hierarchy was created correctly
    console.log('\n🔍 Verifying menu hierarchy...');
    const [rootItems] = await sequelize.query(`
      SELECT * FROM core.menu_items
      WHERE parent_id IS NULL
      ORDER BY sort_order ASC
    `);

    console.log(`📊 Found ${rootItems.length} root-level items:`);

    for (const rootItem of rootItems as any[]) {
      console.log(`  📁 ${rootItem.title} (${rootItem.menu_key})`);

      // Get children of this root item
      const [children] = await sequelize.query(`
        SELECT * FROM core.menu_items
        WHERE parent_id = :parentId
        ORDER BY sort_order ASC
      `, {
        replacements: { parentId: rootItem.id }
      });

      for (const child of children as any[]) {
        console.log(`    📄 ${child.title} (${child.menu_key})`);
      }
    }

    // Simple test query to verify data was inserted
    console.log('\n🧪 Verifying menu data insertion...');
    const [allItems] = await sequelize.query(`
      SELECT * FROM core.menu_items
      ORDER BY sort_order ASC
    `);

    console.log(`📋 Total menu items inserted: ${allItems.length}`);

    // Group by type to show distribution
    const groupItems = (allItems as any[]).filter(item => item.menu_type === 'group');
    const itemItems = (allItems as any[]).filter(item => item.menu_type === 'item');

    console.log(`📁 Menu groups: ${groupItems.length}`);
    console.log(`📄 Menu items: ${itemItems.length}`);

    console.log('\n✅ Menu database initialization completed successfully!');
    console.log('🎯 Hierarchical navigation structure is ready for frontend consumption');

    // Close database connection
    await sequelize.close();

  } catch (error) {
    console.error('❌ Error initializing menu database:', error);
    throw error;
  }
}

// Run the initialization
if (require.main === module) {
  initializeMenuDatabaseSimple()
    .then(() => {
      console.log('\n🎉 Menu database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

export { initializeMenuDatabaseSimple };