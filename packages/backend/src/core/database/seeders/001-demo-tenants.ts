// packages/backend/src/core/database/seeders/001-demo-tenants.ts
// Demo Tenants Seeder - IFRS 9 Multi-Tenant Platform
// Based on: actual backup data from ifrspro_platform_admin_backup.sql

import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Insert demo conventional tenant (from actual backup)
  await queryInterface.bulkInsert('platform_admin.tenants', [
    {
      id: '61c42f2e-14ee-470e-88f3-eae34b51b838',
      tenant_name: 'demo_tenant',
      tenant_slug: 'demotenant',
      display_name: 'Demo Bank',
      organization_name: 'Demo Organization',
      banking_type: 'conventional',
      database_name: 'ifrspro_tenant_demo_conventional',
      database_host: 'localhost',
      database_port: 5432,
      status: 'active',
      subscription_tier: 'basic',
      tenant_settings: JSON.stringify({
        language: 'en',
        timezone: 'UTC',
        currency_default: 'USD'
      }),
      features_enabled: JSON.stringify({
        dashboard: true,
        basic_reports: true,
        ecl_calculations: true
      }),
      compliance_settings: JSON.stringify({
        banking_type: 'conventional',
        regulatory_framework: 'OJK_Conventional'
      }),
      created_at: new Date('2025-07-17 15:05:25.224162+07'),
      updated_at: new Date('2025-07-17 15:05:25.224162+07'),
      created_by: 'system'
    },
    // Insert demo syariah tenant (from actual backup)
    {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      tenant_name: 'demo_syariah',
      tenant_slug: 'demosyariah',
      display_name: 'Demo Islamic Bank',
      organization_name: 'Demo Islamic Banking Organization',
      banking_type: 'syariah',
      database_name: 'ifrspro_tenant_demo_syariah',
      database_host: 'localhost',
      database_port: 5432,
      status: 'active',
      subscription_tier: 'basic',
      tenant_settings: JSON.stringify({
        language: 'en',
        timezone: 'UTC',
        currency_default: 'USD',
        islamic_calendar: true,
        aaoifi_compliance: true,
        syariah_board_approval: true,
        syariah_audit_frequency: 12,
        profit_calculation_method: 'declining_balance'
      }),
      features_enabled: JSON.stringify({
        dashboard: true,
        api_access: true,
        audit_trail: true,
        basic_reports: true,
        stress_testing: true,
        islamic_banking: true,
        ecl_calculations: true,
        advanced_analytics: true,
        syariah_compliance: true,
        workflow_management: true
      }),
      compliance_settings: JSON.stringify({
        banking_type: 'syariah',
        aaoifi_standards: true,
        prohibited_sectors: [
          'alcohol', 'gambling', 'pork', 'conventional_banking',
          'adult_entertainment', 'tobacco', 'weapons'
        ],
        regulatory_framework: 'OJK_Islamic',
        compliance_monitoring: true,
        syariah_audit_required: true,
        syariah_board_required: true
      }),
      created_at: new Date('2025-07-17 22:24:16.813544+07'),
      updated_at: new Date('2025-07-17 22:24:16.813544+07'),
      created_by: 'system'
    }
  ]);

  // Insert platform admin user (from actual backup)
  await queryInterface.bulkInsert('platform_admin.platform_users', [
    {
      id: '11111111-1111-1111-1111-111111111111',
      username: 'admin',
      email: 'admin@ifrspro.id',
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjWEpJWQK', // 'admin123'
      full_name: 'Platform Administrator',
      role: 'super_admin',
      permissions: JSON.stringify([
        'platform:*', 'tenant:*', 'user:*', 'audit:*'
      ]),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Log tenant creation in audit trail (from actual backup)
  await queryInterface.bulkInsert('platform_audit.global_audit_log', [
    {
      id: '1d122ed5-1648-4703-9f73-c4b62d365ac5',
      tenant_id: '61c42f2e-14ee-470e-88f3-eae34b51b838',
      user_id: null,
      event_type: 'TENANT_REGISTRATION',
      action: 'CREATE',
      entity_type: 'TENANT',
      entity_id: '61c42f2e-14ee-470e-88f3-eae34b51b838',
      description: 'Demo conventional banking tenant registered',
      old_values: null,
      new_values: JSON.stringify({
        tenant_name: 'demo_tenant',
        banking_type: 'conventional',
        database_name: 'ifrspro_tenant_demo_conventional',
        subscription_tier: 'basic'
      }),
      ip_address: '127.0.0.1',
      created_at: new Date('2025-07-17 15:05:25.224162+07')
    },
    {
      id: 'eb4cd810-7bd6-40ac-b3be-12b95d89b9f4',
      tenant_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      user_id: null,
      event_type: 'TENANT_REGISTRATION',
      action: 'CREATE',
      entity_type: 'TENANT',
      entity_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      description: 'Demo Syariah banking tenant registered',
      old_values: null,
      new_values: JSON.stringify({
        tenant_name: 'demo_syariah',
        banking_type: 'syariah',
        database_name: 'ifrspro_tenant_demo_syariah',
        organization_name: 'Demo Islamic Banking Organization',
        subscription_tier: 'basic'
      }),
      ip_address: '127.0.0.1',
      created_at: new Date('2025-07-17 22:24:16.816708+07')
    }
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('platform_audit.global_audit_log', {
    tenant_id: ['61c42f2e-14ee-470e-88f3-eae34b51b838', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee']
  });
  
  await queryInterface.bulkDelete('platform_admin.platform_users', {
    email: 'admin@ifrspro.id'
  });
  
  await queryInterface.bulkDelete('platform_admin.tenants', {
    id: ['61c42f2e-14ee-470e-88f3-eae34b51b838', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee']
  });
}
