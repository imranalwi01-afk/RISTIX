const { Client } = require('pg');

async function createIFRS9HierarchicalMenu() {
  console.log('🏗️ Creating complete IFRS 9 hierarchical menu system...');

  // Connect to platform admin database
  const platformClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'ifrspro_platform_admin',
    ssl: false
  });

  // Connect to tenant database
  const tenantClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'ifrspro_tenant_iaf',
    ssl: false
  });

  try {
    await platformClient.connect();
    await tenantClient.connect();
    console.log('✅ Connected to both databases');

    // Get or create menu config
    const configQuery = `
      SELECT id FROM platform_admin.menu_configurations
      WHERE is_active = true AND is_default = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const configResult = await platformClient.query(configQuery);
    let menuConfigId = configResult.rows[0]?.id;

    if (!menuConfigId) {
      console.log('❌ No menu configuration found, creating one...');
      const createConfigQuery = `
        INSERT INTO platform_admin.menu_configurations (id, name, description, is_default, is_active, created_at)
        VALUES (gen_random_uuid(), 'IAF IFRS9 Menu', 'Complete IFRS 9 menu configuration with hierarchy', true, true, NOW())
        RETURNING id
      `;
      const newConfigResult = await platformClient.query(createConfigQuery);
      menuConfigId = newConfigResult.rows[0].id;
      console.log('✅ Created menu configuration:', menuConfigId);
    } else {
      console.log('✅ Found existing menu configuration:', menuConfigId);
    }

    // Clear existing menu items
    const clearQuery = `DELETE FROM platform_admin.menu_items WHERE menu_config_id = $1`;
    await platformClient.query(clearQuery, [menuConfigId]);
    console.log('🧹 Cleared existing menu items');

    // COMPREHENSIVE IFRS 9 menu structure as specified
    const menuStructure = [
      // 1. General Setup
      {
        key: 'general_setup',
        title: 'General Setup',
        description: 'Application and business configuration',
        icon: 'settings',
        url: '/banking/setup',
        sort_order: 1,
        parent_id: null
      },
      {
        key: 'application_setting',
        title: 'Application Setting',
        description: 'Application configuration and settings',
        icon: 'app_settings',
        url: '/banking/setup/application',
        sort_order: 1,
        parent_id: 'general_setup'
      },
      {
        key: 'business_setting',
        title: 'Business Setting',
        description: 'Business configuration and parameters',
        icon: 'business',
        url: '/banking/setup/business',
        sort_order: 2,
        parent_id: 'general_setup'
      },

      // 2. Parameter Setup
      {
        key: 'parameter_setup',
        title: 'Parameter Setup',
        description: 'Banking parameter configuration',
        icon: 'tune',
        url: '/banking/parameters',
        sort_order: 2,
        parent_id: null
      },
      {
        key: 'product_parameter',
        title: 'Product Parameter',
        description: 'Product parameter configuration',
        icon: 'inventory_2',
        url: '/banking/parameters/product',
        sort_order: 1,
        parent_id: 'parameter_setup'
      },
      {
        key: 'journal_parameter',
        title: 'Journal Parameter',
        description: 'Journal and GL parameter configuration',
        icon: 'account_balance',
        url: '/banking/parameters/journal',
        sort_order: 2,
        parent_id: 'parameter_setup'
      },

      // 3. Collective Impairment
      {
        key: 'collective_impairment',
        title: 'Collective Impairment',
        description: 'Collective impairment calculation and configuration',
        icon: 'calculate',
        url: '/banking/collective-impairment',
        sort_order: 3,
        parent_id: null
      },
      {
        key: 'segmentation_configuration',
        title: 'Segmentation Configuration',
        description: 'Customer segmentation setup',
        icon: 'category',
        url: '/banking/collective-impairment/segmentation',
        sort_order: 1,
        parent_id: 'collective_impairment'
      },
      {
        key: 'rule_base_setting',
        title: 'Rule Base Setting',
        description: 'Rules and logic configuration',
        icon: 'rule',
        url: '/banking/collective-impairment/rules',
        sort_order: 2,
        parent_id: 'collective_impairment'
      },
      {
        key: 'bucket_parameter',
        title: 'Bucket Parameter',
        description: 'Bucket parameter configuration',
        icon: 'bucket',
        url: '/banking/collective-impairment/buckets',
        sort_order: 3,
        parent_id: 'collective_impairment'
      },
      {
        key: 'pd_setup_management',
        title: 'PD Setup Management',
        description: 'Probability of Default setup',
        icon: 'trending_up',
        url: '/banking/collective-impairment/pd-setup',
        sort_order: 4,
        parent_id: 'collective_impairment'
      },
      {
        key: 'fl_scalar',
        title: 'FL Scalar',
        description: 'Forward Loss Scalar configuration',
        icon: 'functions',
        url: '/banking/collective-impairment/fl-scalar',
        sort_order: 5,
        parent_id: 'collective_impairment'
      },
      {
        key: 'lgd_setup_management',
        title: 'LGD Setup Management',
        description: 'Loss Given Default setup',
        icon: 'trending_down',
        url: '/banking/collective-impairment/lgd-setup',
        sort_order: 6,
        parent_id: 'collective_impairment'
      },
      {
        key: 'ead_setup_management',
        title: 'EAD Setup Management',
        description: 'Exposure at Default setup',
        icon: 'exposure',
        url: '/banking/collective-impairment/ead-setup',
        sort_order: 7,
        parent_id: 'collective_impairment'
      },
      {
        key: 'ecl_configuration',
        title: 'ECL Configuration',
        description: 'Expected Credit Loss configuration',
        icon: 'assessment',
        url: '/banking/collective-impairment/ecl-config',
        sort_order: 8,
        parent_id: 'collective_impairment'
      },

      // 4. Individual Impairment
      {
        key: 'individual_impairment',
        title: 'Individual Impairment',
        description: 'Individual impairment assessment',
        icon: 'person_off',
        url: '/banking/individual-impairment',
        sort_order: 4,
        parent_id: null
      },
      {
        key: 'individual_assessment_override',
        title: 'Individual Assessment Override',
        description: 'Individual impairment assessment override',
        icon: 'person_search',
        url: '/banking/individual-impairment/assessment',
        sort_order: 1,
        parent_id: 'individual_impairment'
      },

      // 5. IFRS 9
      {
        key: 'ifrs9',
        title: 'IFRS 9',
        description: 'IFRS 9 processing modules',
        icon: 'functions',
        url: '/banking/ifrs9',
        sort_order: 5,
        parent_id: null
      },
      {
        key: 'impairment_module',
        title: 'Impairment Module',
        description: 'IFRS 9 impairment processing',
        icon: 'person_off',
        url: '/banking/ifrs9/impairment',
        sort_order: 1,
        parent_id: 'ifrs9'
      },
      {
        key: 'amortization_module',
        title: 'Amortization Module',
        description: 'IFRS 9 amortization processing',
        icon: 'timeline',
        url: '/banking/ifrs9/amortization',
        sort_order: 2,
        parent_id: 'ifrs9'
      },

      // 6. IFRS 9 Report
      {
        key: 'ifrs9_report',
        title: 'IFRS 9 Report',
        description: 'IFRS 9 reporting and analytics',
        icon: 'assessment',
        url: '/banking/ifrs9-report',
        sort_order: 6,
        parent_id: null
      },
      {
        key: 'nominative_report',
        title: 'Nominative Report',
        description: 'Nominative reporting',
        icon: 'people',
        url: '/banking/ifrs9-report/nominative',
        sort_order: 1,
        parent_id: 'ifrs9_report'
      },
      {
        key: 'lifetime_pd',
        title: 'Lifetime PD',
        description: 'Lifetime Probability of Default reporting',
        icon: 'trending_up',
        url: '/banking/ifrs9-report/lifetime-pd',
        sort_order: 2,
        parent_id: 'ifrs9_report'
      },
      {
        key: 'lifetime_lgd',
        title: 'Lifetime LGD',
        description: 'Lifetime Loss Given Default reporting',
        icon: 'trending_down',
        url: '/banking/ifrs9-report/lifetime-lgd',
        sort_order: 3,
        parent_id: 'ifrs9_report'
      },
      {
        key: 'ead_model',
        title: 'EAD Model',
        description: 'Exposure at Default modeling',
        icon: 'exposure',
        url: '/banking/ifrs9-report/ead-model',
        sort_order: 4,
        parent_id: 'ifrs9_report'
      },
      {
        key: 'ecl_result',
        title: 'ECL Result',
        description: 'Expected Credit Loss results',
        icon: 'assessment',
        url: '/banking/ifrs9-report/ecl-result',
        sort_order: 5,
        parent_id: 'ifrs9_report'
      },
      {
        key: 'ecl_movement',
        title: 'ECL Movement',
        description: 'ECL movement analysis',
        icon: 'compare_arrows',
        url: '/banking/ifrs9-report/ecl-movement',
        sort_order: 6,
        parent_id: 'ifrs9_report'
      },
      {
        key: 'gca_movement',
        title: 'GCA Movement',
        description: 'Gross Carried Amount movement analysis',
        icon: 'sync_alt',
        url: '/banking/ifrs9-report/gca-movement',
        sort_order: 7,
        parent_id: 'ifrs9_report'
      },

      // 7. Maintenance
      {
        key: 'maintenance',
        title: 'Maintenance',
        description: 'System maintenance and administration',
        icon: 'build',
        url: '/banking/maintenance',
        sort_order: 7,
        parent_id: null
      },
      {
        key: 'approval',
        title: 'Approval',
        description: 'Approval workflow management',
        icon: 'fact_check',
        url: '/banking/maintenance/approval',
        sort_order: 1,
        parent_id: 'maintenance'
      },
      {
        key: 'user_activity',
        title: 'User Activity',
        description: 'User activity monitoring',
        icon: 'history',
        url: '/banking/maintenance/user-activity',
        sort_order: 2,
        parent_id: 'maintenance'
      },
      {
        key: 'job_monitoring',
        title: 'Job Monitoring',
        description: 'Background job monitoring',
        icon: 'monitoring',
        url: '/banking/maintenance/job-monitoring',
        sort_order: 3,
        parent_id: 'maintenance'
      },
      {
        key: 'user_management',
        title: 'User Management',
        description: 'User account management',
        icon: 'people',
        url: '/banking/maintenance/users',
        sort_order: 4,
        parent_id: 'maintenance'
      },
      {
        key: 'role_management',
        title: 'Role Management',
        description: 'Role and permission management',
        icon: 'admin_panel_settings',
        url: '/banking/maintenance/roles',
        sort_order: 5,
        parent_id: 'maintenance'
      },

      // 8. Tools
      {
        key: 'tools',
        title: 'Tools',
        description: 'System tools and utilities',
        icon: 'build_circle',
        url: '/banking/tools',
        sort_order: 8,
        parent_id: null
      },
      {
        key: 'manual_upload',
        title: 'Manual Upload',
        description: 'Manual data upload tools',
        icon: 'upload_file',
        url: '/banking/tools/manual-upload',
        sort_order: 1,
        parent_id: 'tools'
      }
    ];

    // COMPREHENSIVE user_types that include ALL possible roles
    const comprehensiveUserTypes = [
      'IAF_TENANT_SUPERADMIN',
      'IAF_TENANT_ADMIN',
      'IAF_BANK_CRO',
      'IAF_IFRS_MANAGER',
      'IAF_RISK_ANALYST',
      'IAF_PORTFOLIO_MANAGER',
      'IAF_DATA_ADMIN',
      'IAF_REPORT_ANALYST',
      'IAF_AUDITOR',
      'IAF_VIEWER',
      'BANK_USER',
      'banking_staff',
      'PLATFORM_SUPER_ADMIN',
      'platform_admin',
      'admin',
      'user'
    ];

    console.log(`📋 Creating ${menuStructure.length} IFRS 9 menu items with hierarchy...`);

    const insertedItems = {};
    const parentIds = {};

    // Insert all menu items
    for (const item of menuStructure) {
      const insertQuery = `
        INSERT INTO platform_admin.menu_items (
          id, menu_config_id, key, title, description, icon, url, type,
          parent_id, sort_order, is_active, user_types, banking_types, metadata,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'item',
          $7, $8, true, $9, $10, $11,
          NOW(), NOW()
        )
        RETURNING id, key
      `;

      const result = await platformClient.query(insertQuery, [
        menuConfigId,
        item.key, item.title, item.description, item.icon,
        item.url,
        item.parent_id ? parentIds[item.parent_id] : null,
        item.sort_order,
        JSON.stringify(comprehensiveUserTypes), // Proper JSONB format
        JSON.stringify(['conventional', 'syariah']), // JSONB for banking_types
        JSON.stringify({ // JSONB for metadata
          banking_modes: ['conventional', 'syariah'],
          requires_approval: false,
          level: item.parent_id ? 2 : 1
        })
      ]);

      insertedItems[item.key] = result.rows[0].id;
      console.log(`✅ Created menu item: ${item.title} (${item.key})`);
    }

    // Update parent relationships
    for (const item of menuStructure) {
      if (item.parent_id && insertedItems[item.parent_id]) {
        const updateQuery = `
          UPDATE platform_admin.menu_items
          SET parent_id = $1
          WHERE key = $2
        `;
        await platformClient.query(updateQuery, [insertedItems[item.parent_id], insertedItems[item.key]]);
        console.log(`🔗 Linked ${item.title} to parent: ${item.parent_id}`);
      }
    }

    // Verify the menu structure
    const verifyQuery = `
      SELECT
        mi.key, mi.title, mi.url, mi.sort_order,
        parent.key as parent_key, parent.title as parent_title
      FROM platform_admin.menu_items mi
      LEFT JOIN platform_admin.menu_items parent ON mi.parent_id = parent.id
      WHERE mi.menu_config_id = $1
      ORDER BY mi.sort_order, mi.title
    `;

    const verifyResult = await platformClient.query(verifyQuery, [menuConfigId]);
    console.log('\n📋 IFRS 9 Menu Structure Verification:');
    verifyResult.rows.forEach((item, i) => {
      const indent = item.parent_key ? '  └─ ' : '├─ ';
      console.log(`  ${i+1}. ${indent}${item.title} (${item.key}) - ${item.url}`);
    });

    console.log(`\n📊 Total menu items created: ${Object.keys(insertedItems).length}`);
    console.log(`📊 Main categories: 8`);
    console.log(`📊 Submenu items: ${Object.keys(insertedItems).length - 8}`);

    // Test the exact API query with IAF_TENANT_SUPERADMIN
    console.log('\n🔍 Testing API query with IAF_TENANT_SUPERADMIN role...');
    const testQuery = `
      SELECT DISTINCT
        mi.id,
        mi.key,
        mi.title,
        mi.user_types::text as user_types_text
      FROM platform_admin.menu_items mi
      WHERE mi.is_active = true
        AND mi.menu_config_id = $1
        AND mi.user_types::text LIKE '%IAF_TENANT_SUPERADMIN%'
      ORDER BY mi.sort_order, mi.title
    `;

    const testResult = await platformClient.query(testQuery, [menuConfigId]);
    console.log(`📊 Menu items accessible to IAF_TENANT_SUPERADMIN: ${testResult.rows.length}`);

    await platformClient.end();
    await tenantClient.end();
    console.log('\n🎉 Complete IFRS 9 hierarchical menu system created successfully!');
    console.log('✅ admin@iaf.co.id with IAF_TENANT_SUPERADMIN role can now access all hierarchical menu items!');

    return {
      success: true,
      menuConfigId: menuConfigId,
      totalItems: Object.keys(insertedItems).length,
      mainCategories: 8,
      subItems: Object.keys(insertedItems).length - 8,
      userTypes: comprehensiveUserTypes
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

createIFRS9HierarchicalMenu();