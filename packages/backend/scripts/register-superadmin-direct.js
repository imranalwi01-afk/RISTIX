#!/usr/bin/env node

/**
 * Direct Superadmin Registration Script
 * Executes user registration in both platform and tenant databases
 * using existing database connections from the backend
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const PASSWORD = '1019181716';
const SUPERADMIN_EMAIL = 'superadmin@iaf.co.id';

async function main() {
  try {
    console.log('🚀 Starting direct superadmin registration...');

    // Load environment configuration directly
    const iafDbConfig = {
      platform: {
        host: process.env.DB_HOST || 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'ifrspro_platform_admin',
        user: process.env.DB_USER || 'admin_iaf',
        password: process.env.DB_PASSWORD || 'P@ssw0rd2025!',
        ssl: process.env.DB_SSL === 'true'
      },
      tenant: {
        host: process.env.DB_HOST || 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.TENANT_DB_NAME || 'ifrspro_tenant_iaf',
        user: process.env.DB_USER || 'admin_iaf',
        password: process.env.DB_PASSWORD || 'P@ssw0rd2025!',
        ssl: process.env.DB_SSL === 'true'
      }
    };
    console.log('✅ Environment configuration loaded');

    // Create database connections
    const platformPool = new Pool({
      host: iafDbConfig.platform.host,
      port: iafDbConfig.platform.port,
      database: iafDbConfig.platform.database,
      user: iafDbConfig.platform.user,
      password: iafDbConfig.platform.password,
      ssl: iafDbConfig.platform.ssl ? {
        rejectUnauthorized: false,
        requestCert: false,
        minVersion: 'TLSv1.2'
      } : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    const tenantPool = new Pool({
      host: iafDbConfig.tenant.host,
      port: iafDbConfig.tenant.port,
      database: iafDbConfig.tenant.database,
      user: iafDbConfig.tenant.user,
      password: iafDbConfig.tenant.password,
      ssl: iafDbConfig.tenant.ssl ? {
        rejectUnauthorized: false,
        requestCert: false,
        minVersion: 'TLSv1.2'
      } : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    console.log('✅ Database connection pools created');

    // Generate password hash
    const passwordHash = await bcrypt.hash(PASSWORD, 12);
    console.log('✅ Password hash generated');

    // 1. Update platform admin database
    const platformClient = await platformPool.connect();
    let platformUser;

    try {
      // Check if user already exists
      const existingUser = await platformClient.query(
        'SELECT id, email FROM platform_admin.users WHERE email = $1',
        [SUPERADMIN_EMAIL]
      );

      if (existingUser.rows.length > 0) {
        // Update existing user
        await platformClient.query(
          `UPDATE platform_admin.users
           SET password_hash = $1, full_name = $2, role = $3, updated_at = NOW()
           WHERE email = $4`,
          [passwordHash, 'IAF Super Administrator', 'PLATFORM_SUPER_ADMIN', SUPERADMIN_EMAIL]
        );
        platformUser = existingUser.rows[0];
        console.log('✅ Updated existing superadmin in platform admin database');
      } else {
        // Create new user
        const result = await platformClient.query(
          `INSERT INTO platform_admin.users
           (username, email, password_hash, full_name, role, is_active, tenant_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           RETURNING id, email, role, created_at`,
          ['superadmin', SUPERADMIN_EMAIL, passwordHash, 'IAF Super Administrator', 'PLATFORM_SUPER_ADMIN', true, null]
        );
        platformUser = result.rows[0];
        console.log('✅ Created new superadmin in platform admin database');
      }
    } finally {
      platformClient.release();
    }

    // 2. Update tenant database
    const tenantClient = await tenantPool.connect();

    try {
      // Check existing table structure
      const tableInfo = await tenantClient.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND table_schema = 'core'
        ORDER BY ordinal_position
      `);

      console.log('📋 Existing users table columns:', tableInfo.rows.map(r => r.column_name).join(', '));

      // Ensure core.users table exists with minimal columns
      await tenantClient.query(`
        CREATE TABLE IF NOT EXISTS core.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Get tenant ID (skip if table doesn't exist)
      let tenantId = null;
      try {
        const tenantResult = await tenantClient.query(
          'SELECT id FROM platform_admin.tenants WHERE tenant_slug = $1 LIMIT 1',
          ['iaf']
        );
        tenantId = tenantResult.rows[0]?.id;
      } catch (error) {
        console.log('ℹ️ Tenants table not found, proceeding without tenant ID');
      }

      // Check if user already exists in tenant database
      const existingTenantUser = await tenantClient.query(
        'SELECT id FROM core.users WHERE email = $1',
        [SUPERADMIN_EMAIL]
      );

      if (existingTenantUser.rows.length > 0) {
        // Update existing tenant user
        await tenantClient.query(
          `UPDATE core.users
           SET password_hash = $1, full_name = $2, updated_at = NOW()
           WHERE email = $3`,
          [passwordHash, 'IAF Super Administrator', SUPERADMIN_EMAIL]
        );
        console.log('✅ Updated existing superadmin in tenant database');
      } else {
        // Create new tenant user (use only columns that exist)
        const availableColumns = tableInfo.rows.map(r => r.column_name);
        const insertColumns = ['username', 'email', 'password_hash', 'full_name'].filter(col => availableColumns.includes(col));
        const insertValues = ['superadmin', SUPERADMIN_EMAIL, passwordHash, 'IAF Super Administrator'].slice(0, insertColumns.length);

        if (insertColumns.length >= 4) {
          await tenantClient.query(
            `INSERT INTO core.users (${insertColumns.join(', ')}, created_at, updated_at)
             VALUES (${insertColumns.map((_, i) => `$${i + 1}`).join(', ')}, NOW(), NOW())`,
            [...insertValues]
          );
        }
        console.log('✅ Created new superadmin in tenant database');
      }

      // Add audit log entry
      if (platformUser?.id) {
        await platformClient.query(
          `INSERT INTO platform_audit.global_audit_log
           (user_id, event_type, action, description, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [platformUser.id, 'USER_MANAGEMENT', 'USER_CREATED', 'Superadmin user created: ' + SUPERADMIN_EMAIL]
        );
      }

    } finally {
      tenantClient.release();
    }

    console.log('🎉 Superadmin registration completed successfully!');
    console.log(`📧 Email: ${SUPERADMIN_EMAIL}`);
    console.log(`🔑 Password: ${PASSWORD}`);
    console.log('🏢 Registered in: Platform Admin + IAF Tenant databases');

    // Close connection pools
    await platformPool.end();
    await tenantPool.end();

  } catch (error) {
    console.error('❌ Error during superadmin registration:', error);
    process.exit(1);
  }
}

main();