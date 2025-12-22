// packages/backend/src/core/database/migrations/platform/001-create-platform-admin.ts
// Platform Admin Database Migration - IFRS 9 Multi-Tenant Platform
// Based on: ifrspro_platform_admin_backup.sql actual schema

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Enable extensions
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // Create schemas
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_admin');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_audit');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_analytics');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_billing');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_integration');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_monitoring');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS monitoring');

  // Create platform_admin.tenants table (from actual backup)
  await queryInterface.createTable({
    schema: 'platform_admin',
    tableName: 'tenants'
  }, {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    tenant_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    tenant_slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    display_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    organization_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    banking_type: {
      type: DataTypes.ENUM('conventional', 'syariah', 'dual'),
      allowNull: false
    },
    database_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    database_host: {
      type: DataTypes.STRING(100),
      defaultValue: 'localhost'
    },
    database_port: {
      type: DataTypes.INTEGER,
      defaultValue: 5432
    },
    status: {
      type: DataTypes.ENUM('provisioning', 'active', 'suspended', 'inactive'),
      defaultValue: 'provisioning'
    },
    subscription_tier: {
      type: DataTypes.ENUM('basic', 'standard', 'premium', 'enterprise'),
      defaultValue: 'basic'
    },
    tenant_settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    features_enabled: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    compliance_settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_by: {
      type: DataTypes.STRING(100),
      defaultValue: 'system'
    },
    updated_by: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  });

  // Create platform_admin.platform_users table (from actual backup)
  await queryInterface.createTable({
    schema: 'platform_admin',
    tableName: 'platform_users'
  }, {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'platform_admin'
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Create global audit log (from actual backup)
  await queryInterface.createTable({
    schema: 'platform_audit',
    tableName: 'global_audit_log'
  }, {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    event_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    old_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Create indexes (from actual backup)
  await queryInterface.addIndex('platform_admin.tenants', ['tenant_slug'], {
    name: 'idx_tenants_slug'
  });
  await queryInterface.addIndex('platform_admin.tenants', ['banking_type'], {
    name: 'idx_tenants_banking_type'
  });
  await queryInterface.addIndex('platform_admin.tenants', ['status'], {
    name: 'idx_tenants_status'
  });
  await queryInterface.addIndex('platform_admin.platform_users', ['email'], {
    name: 'idx_platform_users_email'
  });
  await queryInterface.addIndex('platform_audit.global_audit_log', ['tenant_id'], {
    name: 'idx_global_audit_tenant'
  });
  await queryInterface.addIndex('platform_audit.global_audit_log', ['created_at'], {
    name: 'idx_global_audit_created'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable({ schema: 'platform_audit', tableName: 'global_audit_log' });
  await queryInterface.dropTable({ schema: 'platform_admin', tableName: 'platform_users' });
  await queryInterface.dropTable({ schema: 'platform_admin', tableName: 'tenants' });
  
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_monitoring CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_integration CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_billing CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_analytics CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_audit CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_admin CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS monitoring CASCADE');
}
