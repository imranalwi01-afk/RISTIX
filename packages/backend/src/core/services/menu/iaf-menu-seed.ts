// packages/backend/src/core/services/menu/iaf-menu-seed.ts
// IAF Menu Structure Seed Data
// Based on IAF Navigation Requirements from documentation

import { v4 as uuidv4 } from 'uuid';

export interface IAFMenuSeed {
  configurations: any[];
  items: any[];
}

export const getIAFMenuSeedData = (): IAFMenuSeed => {
  const now = new Date();

  // Create IAF Banking Staff Menu Configuration
  const bankingStaffConfigId = uuidv4();

  // Create all menu items first (without parent relationships)
  const rawItems = [
    // DASHBOARD
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'dashboard',
      title: 'Dashboard',
      description: 'IFRS 9 System Overview',
      icon: 'dashboard',
      url: '/banking/dashboard',
      component: null,
      type: 'item',
      parent_id: null,
      sort_order: 1,
      is_active: true,
      permissions: [],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        badge: null,
        is_new: false,
        requires_setup: false
      },
      created_at: now,
      updated_at: now
    },

    // 🏠 GENERAL SETUP (LEGACY CATEGORY 1)
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'general-setup',
      title: 'General Setup',
      description: 'Application and Business Configuration',
      icon: 'settings_applications',
      url: null,
      component: null,
      type: 'group',
      parent_id: null,
      sort_order: 2,
      is_active: true,
      permissions: [],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        category: 'general-setup',
        legacy_code: 'GENERAL_SETUP'
      },
      created_at: now,
      updated_at: now
    },

    // General Setup - Application Setting
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'application-setting',
      title: 'Application Setting',
      description: 'System Configuration and Basic Parameters',
      icon: 'settings',
      url: '/banking/setup/application',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to general-setup group ID after creation
      sort_order: 3,
      is_active: true,
      permissions: ['view_application_settings'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ApplicationSetting',
        legacy_code: 'APP_SETTING',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN']
      },
      created_at: now,
      updated_at: now
    },

    // General Setup - Business Setting
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'business-setting',
      title: 'Business Setting',
      description: 'Business Rules Configuration and Banking Parameters',
      icon: 'business',
      url: '/banking/setup/business',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to general-setup group ID
      sort_order: 4,
      is_active: true,
      permissions: ['view_business_settings'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/BussinessSetting',
        legacy_code: 'BUSINESS_SETTING',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER']
      },
      created_at: now,
      updated_at: now
    },

    // 📊 PARAMETER SETUP (LEGACY CATEGORY 2)
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'parameter-setup',
      title: 'Parameter Setup',
      description: 'Product and Journal Parameter Configuration',
      icon: 'tune',
      url: null,
      component: null,
      type: 'group',
      parent_id: null,
      sort_order: 5,
      is_active: true,
      permissions: [],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        category: 'parameter-setup',
        legacy_code: 'PARAMETER_SETUP'
      },
      created_at: now,
      updated_at: now
    },

    // Parameter Setup - Product Parameter
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'product-parameter',
      title: 'Product Parameter',
      description: 'Banking Product Configuration and Risk Parameters',
      icon: 'account_balance',
      url: '/banking/parameters/product',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to parameter-setup group ID
      sort_order: 6,
      is_active: true,
      permissions: ['view_product_parameters'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ProductParameter',
        legacy_code: 'PRODUCT_PARAMETER',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // Parameter Setup - Journal Parameter
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'journal-parameter',
      title: 'Journal Parameter',
      description: 'General Ledger Configuration and Accounting Rules',
      icon: 'receipt_long',
      url: '/banking/parameters/journal',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to parameter-setup group ID
      sort_order: 7,
      is_active: true,
      permissions: ['view_journal_parameters'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/JournalParameter',
        legacy_code: 'JOURNAL_PARAMETER',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER']
      },
      created_at: now,
      updated_at: now
    },

    // 🎯 COLLECTIVE IMPAIRMENT (LEGACY CATEGORY 3 - LARGEST MODULE)
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'collective-impairment',
      title: 'Collective Impairment',
      description: 'Segmentation, Rules, Buckets, and ECL Configuration',
      icon: 'groups',
      url: null,
      component: null,
      type: 'group',
      parent_id: null,
      sort_order: 8,
      is_active: true,
      permissions: [],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        category: 'collective-impairment',
        legacy_code: 'COLLECTIVE_IMPAIRMENT',
        item_count: 8
      },
      created_at: now,
      updated_at: now
    },

    // Collective Impairment - Segmentation Configuration
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'segmentation-configuration',
      title: 'Segmentation Configuration',
      description: 'Segment Definition Management and Assignment Rules',
      icon: 'category',
      url: '/banking/collective/segmentation',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to collective-impairment group ID
      sort_order: 9,
      is_active: true,
      permissions: ['view_segmentation'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ParamSegment',
        legacy_code: 'SEGMENTATION',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // Collective Impairment - Rule Base Setting
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'rule-base-setting',
      title: 'Rule Base Setting',
      description: 'Scenario Definition and Stress Test Scenarios',
      icon: 'rule',
      url: '/banking/collective/rules',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to collective-impairment group ID
      sort_order: 10,
      is_active: true,
      permissions: ['view_rules'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ParamScenarioRules',
        legacy_code: 'RULE_BASE',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // Collective Impairment - Bucket Parameter
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'bucket-parameter',
      title: 'Bucket Parameter',
      description: 'Bucket Definition and Risk Bucket Configuration',
      icon: 'bucket',
      url: '/banking/collective/buckets',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to collective-impairment group ID
      sort_order: 11,
      is_active: true,
      permissions: ['view_buckets'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ParamBucket',
        legacy_code: 'BUCKET_PARAMETER',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // Collective Impairment - PD Setup Management
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'pd-setup-management',
      title: 'PD Setup Management',
      description: 'Probability of Default Configuration and Calibration',
      icon: 'trending_up',
      url: '/banking/collective/pd-config',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to collective-impairment group ID
      sort_order: 12,
      is_active: true,
      permissions: ['view_pd_config'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/PDConfig',
        legacy_code: 'PD_SETUP',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // Collective Impairment - FL Scalar
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'fl-scalar',
      title: 'FL Scalar',
      description: 'Forward-looking Scalar Configuration and Economic Variables',
      icon: 'timeline',
      url: '/banking/collective/fl-scalar',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to collective-impairment group ID
      sort_order: 13,
      is_active: true,
      permissions: ['view_fl_scalar'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/FLScalar',
        legacy_code: 'FL_SCALAR',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // Collective Impairment - LGD Setup Management
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'lgd-setup-management',
      title: 'LGD Setup Management',
      description: 'Loss Given Default Configuration and Recovery Rates',
      icon: 'percent',
      url: '/banking/collective/lgd-config',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to collective-impairment group ID
      sort_order: 14,
      is_active: true,
      permissions: ['view_lgd_config'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/LGDConfig',
        legacy_code: 'LGD_SETUP',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // Collective Impairment - EAD Setup Management
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'ead-setup-management',
      title: 'EAD Setup Management',
      description: 'Exposure at Default Configuration and Calculation Methods',
      icon: 'calculate',
      url: '/banking/collective/ead-config',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to collective-impairment group ID
      sort_order: 15,
      is_active: true,
      permissions: ['view_ead_config'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/EADConfig',
        legacy_code: 'EAD_SETUP',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // Collective Impairment - ECL Configuration
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'ecl-configuration',
      title: 'ECL Configuration',
      description: 'Expected Credit Loss Setup and Staging Configuration',
      icon: 'assessment',
      url: '/banking/collective/ecl-config',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to collective-impairment group ID
      sort_order: 16,
      is_active: true,
      permissions: ['view_ecl_config'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ECLConfig',
        legacy_code: 'ECL_CONFIG',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // 👤 INDIVIDUAL IMPAIRMENT (LEGACY CATEGORY 4)
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'individual-impairment',
      title: 'Individual Impairment',
      description: 'Individual Assessment Override and Specific Impairment',
      icon: 'person_off',
      url: '/banking/individual/assessment-override',
      component: null,
      type: 'item',
      parent_id: null,
      sort_order: 17,
      is_active: true,
      permissions: ['view_individual_impairment'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/IndividualImpairment/AssesmentOverride',
        legacy_code: 'INDIVIDUAL_IMPAIRMENT',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // 🏦 IFRS 9 CORE MODULES (LEGACY CATEGORY 5)
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'ifrs9-core-modules',
      title: 'IFRS 9 Core Modules',
      description: 'Impairment Module and Amortization Module',
      icon: 'account_balance',
      url: null,
      component: null,
      type: 'group',
      parent_id: null,
      sort_order: 18,
      is_active: true,
      permissions: [],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        category: 'ifrs9-core-modules',
        legacy_code: 'IFRS9_CORE_MODULES'
      },
      created_at: now,
      updated_at: now
    },

    // IFRS 9 Core Modules - Impairment Module
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'impairment-module',
      title: 'Impairment Module',
      description: 'IFRS 9 Impairment Processing and Stage Classification',
      icon: 'trending_down',
      url: '/banking/ifrs9/impairment',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to ifrs9-core-modules group ID
      sort_order: 19,
      is_active: true,
      permissions: ['view_impairment_module'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ifrs',
        legacy_code: 'IMPAIRMENT_MODULE',
        status: 'disabled',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // IFRS 9 Core Modules - Amortization Module
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'amortization-module',
      title: 'Amortization Module',
      description: 'Lease Contract Management and Amortization Schedule',
      icon: 'schedule',
      url: '/banking/ifrs9/lease-contract',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to ifrs9-core-modules group ID
      sort_order: 20,
      is_active: true,
      permissions: ['view_amortization_module'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/LeaseContract',
        legacy_code: 'AMORTIZATION_MODULE',
        status: 'disabled',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // 📊 IFRS 9 REPORTING (LEGACY CATEGORY 6 - LARGEST REPORTING MODULE)
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'ifrs9-reporting',
      title: 'IFRS 9 Reporting',
      description: 'Comprehensive IFRS 9 Reports and Analytics',
      icon: 'bar_chart',
      url: null,
      component: null,
      type: 'group',
      parent_id: null,
      sort_order: 21,
      is_active: true,
      permissions: [],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        category: 'ifrs9-reporting',
        legacy_code: 'IFRS9_REPORTING',
        item_count: 7
      },
      created_at: now,
      updated_at: now
    },

    // IFRS 9 Reporting - Nominative Report
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'nominative-report',
      title: 'Nominative Report',
      description: 'Account-level ECL Reporting and Individual Impairment Details',
      icon: 'description',
      url: '/banking/reports/nominative',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to ifrs9-reporting group ID
      sort_order: 22,
      is_active: true,
      permissions: ['view_nominative_report'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/NominativeReport',
        legacy_code: 'NOMINATIVE_REPORT',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // IFRS 9 Reporting - Lifetime PD
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'lifetime-pd',
      title: 'Lifetime PD',
      description: 'Lifetime PD Model Setup and PD Curve Calibration',
      icon: 'timeline',
      url: '/banking/reports/lifetime-pd',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to ifrs9-reporting group ID
      sort_order: 23,
      is_active: true,
      permissions: ['view_lifetime_pd'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/LifetimePD',
        legacy_code: 'LIFETIME_PD',
        status: 'disabled',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // IFRS 9 Reporting - Lifetime LGD
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'lifetime-lgd',
      title: 'Lifetime LGD',
      description: 'Lifetime LGD Configuration and Recovery Rate Modeling',
      icon: 'show_chart',
      url: '/banking/reports/lifetime-lgd',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to ifrs9-reporting group ID
      sort_order: 24,
      is_active: true,
      permissions: ['view_lifetime_lgd'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/LifetimeLGD',
        legacy_code: 'LIFETIME_LGD',
        status: 'disabled',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // IFRS 9 Reporting - EAD Model
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'ead-model',
      title: 'EAD Model',
      description: 'EAD Model Configuration and Commitment Modeling',
      icon: 'account_tree',
      url: '/banking/reports/ead-model',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to ifrs9-reporting group ID
      sort_order: 25,
      is_active: true,
      permissions: ['view_ead_model'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/EADModel',
        legacy_code: 'EAD_MODEL',
        status: 'disabled',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // IFRS 9 Reporting - ECL Result
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'ecl-result',
      title: 'ECL Result',
      description: 'ECL Calculation Results and Portfolio ECL Summary',
      icon: 'assessment',
      url: '/banking/reports/ecl-result',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to ifrs9-reporting group ID
      sort_order: 26,
      is_active: true,
      permissions: ['view_ecl_result'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ECLResult',
        legacy_code: 'ECL_RESULT',
        status: 'disabled',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // IFRS 9 Reporting - ECL Movement
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'ecl-movement',
      title: 'ECL Movement',
      description: 'ECL Movement Tracking and Period-over-Period Changes',
      icon: 'trending_up',
      url: '/banking/reports/ecl-movement',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to ifrs9-reporting group ID
      sort_order: 27,
      is_active: true,
      permissions: ['view_ecl_movement'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ECLMovement',
        legacy_code: 'ECL_MOVEMENT',
        status: 'disabled',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // IFRS 9 Reporting - GCA Movement
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'gca-movement',
      title: 'GCA Movement',
      description: 'Group Credit Adjustment Tracking and GCA Movement Analysis',
      icon: 'groups',
      url: '/banking/reports/gca-movement',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to ifrs9-reporting group ID
      sort_order: 28,
      is_active: true,
      permissions: ['view_gca_movement'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/GCAMovement',
        legacy_code: 'GCA_MOVEMENT',
        status: 'disabled',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST']
      },
      created_at: now,
      updated_at: now
    },

    // 🔧 MAINTENANCE & ADMINISTRATION (LEGACY CATEGORY 7)
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'maintenance-administration',
      title: 'Maintenance & Administration',
      description: 'System Administration and User Management',
      icon: 'build',
      url: null,
      component: null,
      type: 'group',
      parent_id: null,
      sort_order: 29,
      is_active: true,
      permissions: [],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        category: 'maintenance-administration',
        legacy_code: 'MAINTENANCE_ADMINISTRATION',
        item_count: 5
      },
      created_at: now,
      updated_at: now
    },

    // Maintenance & Administration - Approval
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'approval',
      title: 'Approval',
      description: 'Approval Tasks Dashboard and Approval Queue Management',
      icon: 'fact_check',
      url: '/banking/maintenance/approval',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to maintenance-administration group ID
      sort_order: 30,
      is_active: true,
      permissions: ['view_approval'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/Approval',
        legacy_code: 'APPROVAL',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER']
      },
      created_at: now,
      updated_at: now
    },

    // Maintenance & Administration - User Activity
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'user-activity',
      title: 'User Activity',
      description: 'User Activity Logging and System Usage Analytics',
      icon: 'history',
      url: '/banking/maintenance/user-activity',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to maintenance-administration group ID
      sort_order: 31,
      is_active: true,
      permissions: ['view_user_activity'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/UserActivity',
        legacy_code: 'USER_ACTIVITY',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN']
      },
      created_at: now,
      updated_at: now
    },

    // Maintenance & Administration - Job Monitoring
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'job-monitoring',
      title: 'Job Monitoring',
      description: 'Background Job Status and Job Queue Management',
      icon: 'monitor_heart',
      url: '/banking/maintenance/job-monitoring',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to maintenance-administration group ID
      sort_order: 32,
      is_active: true,
      permissions: ['view_job_monitoring'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/JobMonitoring',
        legacy_code: 'JOB_MONITORING',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN']
      },
      created_at: now,
      updated_at: now
    },

    // Maintenance & Administration - User Management
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'user-management',
      title: 'User Management',
      description: 'User List & Search and User Role Assignment',
      icon: 'manage_accounts',
      url: '/banking/maintenance/users',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to maintenance-administration group ID
      sort_order: 33,
      is_active: true,
      permissions: ['view_user_management'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/UserManagement',
        legacy_code: 'USER_MANAGEMENT',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN']
      },
      created_at: now,
      updated_at: now
    },

    // Maintenance & Administration - Role Management
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'role-management',
      title: 'Role Management',
      description: 'Role Definitions and Permission Matrix',
      icon: 'admin_panel_settings',
      url: '/banking/maintenance/roles',
      component: null,
      type: 'item',
      parent_id: null, // Will be set to maintenance-administration group ID
      sort_order: 34,
      is_active: true,
      permissions: ['view_role_management'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/RoleManagement',
        legacy_code: 'ROLE_MANAGEMENT',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN']
      },
      created_at: now,
      updated_at: now
    },

    // 🛠️ TOOLS & UTILITIES (LEGACY CATEGORY 8)
    {
      id: uuidv4(),
      menu_config_id: bankingStaffConfigId,
      key: 'tools-utilities',
      title: 'Tools & Utilities',
      description: 'Manual Upload and Data Management Tools',
      icon: 'build_circle',
      url: '/banking/tools/manual-upload',
      component: null,
      type: 'item',
      parent_id: null,
      sort_order: 35,
      is_active: true,
      permissions: ['view_tools'],
      user_types: ['banking_staff'],
      banking_types: ['conventional', 'syariah', 'dual'],
      tenant_types: ['iaf'],
      visibility_rules: {},
      breadcrumb: true,
      external: false,
      target: '_self',
      metadata: {
        legacy_url: '/IFRS9N/ManualUpload',
        legacy_code: 'TOOLS_UTILITIES',
        roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_DATA_ADMIN']
      },
      created_at: now,
      updated_at: now
    }
  ];

  // Helper function to build proper parent-child relationships for database insertion
  const buildHierarchy = (items: any[]): any[] => {
    // Create a map for quick lookup by key
    const itemMap = new Map<string, any>();
    const keyToIdMap = new Map<string, string>();
    const dbInsertionOrder: any[] = [];

    // First pass: create maps and collect all items
    items.forEach(item => {
      itemMap.set(item.key, item);
      keyToIdMap.set(item.key, item.id);
    });

    // Define parent-child relationships based on menu structure
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

    // Build insertion order: parents first, then children
    items.forEach(item => {
      const itemCopy = { ...item };

      // Check if this item has a parent
      let parentId: string | null = null;

      // Look through parentChildMap to find the parent of this item
      Object.entries(parentChildMap).forEach(([parentKey, children]) => {
        if (children.includes(item.key)) {
          const parentItem = itemMap.get(parentKey);
          if (parentItem) {
            parentId = parentItem.id;
          }
        }
      });

      // Set the parent_id for database insertion
      itemCopy.parent_id = parentId;

      // Remove children property for clean database insertion
      delete itemCopy.children;

      dbInsertionOrder.push(itemCopy);
    });

    return dbInsertionOrder;
  };

  // Return the final structure with built hierarchy
  return {
    configurations: [
      {
        id: bankingStaffConfigId,
        name: 'IAF Banking Staff Menu',
        description: 'Complete IAF menu structure for banking staff users',
        target_audience: 'banking_staff',
        banking_mode: 'dual', // Supports both conventional and syariah
        tenant_specific: false,
        is_default: true,
        is_active: true,
        version: '1.0.0',
        created_by: 'system',
        created_at: now,
        updated_at: now
      }
    ],

    items: buildHierarchy(rawItems)
  };
};