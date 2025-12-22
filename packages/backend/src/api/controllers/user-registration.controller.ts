// packages/backend/src/api/controllers/user-registration.controller.ts
// =================================================================
// 🚀 USER REGISTRATION CONTROLLER - SURGICAL IMPLEMENTATION
// =================================================================
// Purpose: Register superadmin@iaf.co.id and admin@iaf.co.id users
// Target Databases: Platform Admin + IAF Tenant
// Password: 1019181716
// =================================================================

import { Request, Response } from 'express';
import { Pool } from 'pg';
import { backendEnvironmentLoader } from '../../config/environment-loader-backend';
import bcrypt from 'bcryptjs';

interface RegistrationResult {
  success: boolean;
  message: string;
  user?: {
    email: string;
    role: string;
    database: string;
  };
  error?: string;
}

export class UserRegistrationController {
  private platformPool: Pool | null = null;
  private tenantPool: Pool | null = null;

  constructor() {
    this.initializeConnections();
  }

  private async initializeConnections(): Promise<void> {
    try {
      // Get IAF database configuration
      const config = backendEnvironmentLoader.getConfiguration();
      const iafDbConfig = config.database;

      console.log('🔗 Initializing User Registration Database Connections...');

      // Platform Admin Database Connection
      this.platformPool = new Pool({
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

      // IAF Tenant Database Connection
      this.tenantPool = new Pool({
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

      console.log('✅ User Registration database connections initialized');

    } catch (error) {
      console.error('❌ Failed to initialize database connections:', error);
      throw error;
    }
  }

  /**
   * Register superadmin@iaf.co.id user in both databases
   */
  public async registerSuperAdmin(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚀 Starting superadmin@iaf.co.id registration...');

      const email = 'superadmin@iaf.co.id';
      const password = '1019181716';
      const username = 'superadmin';
      const fullName = 'IAF Super Administrator';
      const role = 'PLATFORM_SUPER_ADMIN';

      // Generate password hash
      const passwordHash = await bcrypt.hash(password, 12);
      console.log('🔐 Generated password hash for superadmin user');

      // 1. Register in Platform Admin Database
      const platformClient = await this.platformPool!.connect();
      let platformUser;

      try {
        // Check if user already exists
        const existingUser = await platformClient.query(
          'SELECT id FROM platform_admin.users WHERE email = $1',
          [email]
        );

        if (existingUser.rows.length > 0) {
          // Update existing user
          await platformClient.query(
            `UPDATE platform_admin.users
             SET password_hash = $1, full_name = $2, role = $3, updated_at = NOW()
             WHERE email = $4`,
            [passwordHash, fullName, role, email]
          );
          console.log('✅ Updated existing superadmin in platform admin database');
        } else {
          // Create new user
          const result = await platformClient.query(
            `INSERT INTO platform_admin.users
             (username, email, password_hash, full_name, role, is_active, tenant_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
             RETURNING id, email, role, created_at`,
            [username, email, passwordHash, fullName, role, true, null]
          );
          platformUser = result.rows[0];
          console.log('✅ Created new superadmin in platform admin database');
        }
      } finally {
        platformClient.release();
      }

      // 2. Register in IAF Tenant Database
      const tenantClient = await this.tenantPool!.connect();

      try {
        // Ensure core.users table exists
        await tenantClient.query(`
          CREATE TABLE IF NOT EXISTS core.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(100) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            employee_id VARCHAR(100),
            department VARCHAR(100),
            position VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            banking_access VARCHAR(20) DEFAULT 'BOTH',
            syariah_certified BOOLEAN DEFAULT false,
            tenant_id UUID,
            tenant_slug VARCHAR(50),
            last_login_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);

        // Get tenant ID
        const tenantResult = await tenantClient.query(
          'SELECT id FROM platform_admin.tenants WHERE tenant_slug = $1 LIMIT 1',
          ['iaf']
        );

        const tenantId = tenantResult.rows[0]?.id;

        // Check if user already exists in tenant database
        const existingTenantUser = await tenantClient.query(
          'SELECT id FROM core.users WHERE email = $1',
          [email]
        );

        if (existingTenantUser.rows.length > 0) {
          // Update existing tenant user
          await tenantClient.query(
            `UPDATE core.users
             SET password_hash = $1, full_name = $2, updated_at = NOW()
             WHERE email = $3`,
            [passwordHash, fullName, email]
          );
          console.log('✅ Updated existing superadmin in tenant database');
        } else {
          // Create new tenant user
          await tenantClient.query(
            `INSERT INTO core.users
             (username, email, password_hash, full_name, employee_id, department, position,
              is_active, banking_access, syariah_certified, tenant_id, tenant_slug, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
            [username, email, passwordHash, fullName, 'SUPER001', 'Platform Administration', 'Platform Super Administrator',
             true, 'BOTH', true, tenantId, 'iaf']
          );
          console.log('✅ Created new superadmin in tenant database');
        }

        // Add audit log entry
        await platformClient.query(
          `INSERT INTO platform_audit.global_audit_log
           (user_id, event_type, action, description, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [platformUser?.id, 'USER_MANAGEMENT', 'USER_CREATED', 'Superadmin user created: ' + email]
        );

      } finally {
        tenantClient.release();
      }

      const result: RegistrationResult = {
        success: true,
        message: 'Superadmin user registered successfully in both databases',
        user: {
          email,
          role,
          database: 'Platform Admin + IAF Tenant'
        }
      };

      console.log('🎉 Superadmin registration completed successfully!');
      res.status(201).json(result);

    } catch (error) {
      console.error('❌ Error registering superadmin user:', error);

      const result: RegistrationResult = {
        success: false,
        message: 'Failed to register superadmin user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(result);
    }
  }

  /**
   * Register admin@iaf.co.id user in both databases
   */
  public async registerAdmin(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚀 Starting admin@iaf.co.id registration...');

      const email = 'admin@iaf.co.id';
      const password = '1019181716';
      const username = 'admin';
      const fullName = 'IAF Administrator';
      const role = 'PLATFORM_ADMIN';

      // Generate password hash
      const passwordHash = await bcrypt.hash(password, 12);
      console.log('🔐 Generated password hash for admin user');

      // 1. Register in Platform Admin Database
      const platformClient = await this.platformPool!.connect();
      let platformUser;

      try {
        // Check if user already exists
        const existingUser = await platformClient.query(
          'SELECT id FROM platform_admin.users WHERE email = $1',
          [email]
        );

        if (existingUser.rows.length > 0) {
          // Update existing user
          await platformClient.query(
            `UPDATE platform_admin.users
             SET password_hash = $1, full_name = $2, role = $3, updated_at = NOW()
             WHERE email = $4`,
            [passwordHash, fullName, role, email]
          );
          console.log('✅ Updated existing admin in platform admin database');
        } else {
          // Create new user
          const result = await platformClient.query(
            `INSERT INTO platform_admin.users
             (username, email, password_hash, full_name, role, is_active, tenant_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
             RETURNING id, email, role, created_at`,
            [username, email, passwordHash, fullName, role, true, null]
          );
          platformUser = result.rows[0];
          console.log('✅ Created new admin in platform admin database');
        }
      } finally {
        platformClient.release();
      }

      // 2. Register in IAF Tenant Database
      const tenantClient = await this.tenantPool!.connect();

      try {
        // Get tenant ID
        const tenantResult = await tenantClient.query(
          'SELECT id FROM platform_admin.tenants WHERE tenant_slug = $1 LIMIT 1',
          ['iaf']
        );

        const tenantId = tenantResult.rows[0]?.id;

        // Check if user already exists in tenant database
        const existingTenantUser = await tenantClient.query(
          'SELECT id FROM core.users WHERE email = $1',
          [email]
        );

        if (existingTenantUser.rows.length > 0) {
          // Update existing tenant user
          await tenantClient.query(
            `UPDATE core.users
             SET password_hash = $1, full_name = $2, updated_at = NOW()
             WHERE email = $3`,
            [passwordHash, fullName, email]
          );
          console.log('✅ Updated existing admin in tenant database');
        } else {
          // Create new tenant user
          await tenantClient.query(
            `INSERT INTO core.users
             (username, email, password_hash, full_name, employee_id, department, position,
              is_active, banking_access, syariah_certified, tenant_id, tenant_slug, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
            [username, email, passwordHash, fullName, 'ADMIN001', 'Platform Administration', 'Platform Administrator',
             true, 'BOTH', true, tenantId, 'iaf']
          );
          console.log('✅ Created new admin in tenant database');
        }

        // Add audit log entry
        await platformClient.query(
          `INSERT INTO platform_audit.global_audit_log
           (user_id, event_type, action, description, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [platformUser?.id, 'USER_MANAGEMENT', 'USER_CREATED', 'Admin user created: ' + email]
        );

      } finally {
        tenantClient.release();
      }

      const result: RegistrationResult = {
        success: true,
        message: 'Admin user registered successfully in both databases',
        user: {
          email,
          role,
          database: 'Platform Admin + IAF Tenant'
        }
      };

      console.log('🎉 Admin registration completed successfully!');
      res.status(201).json(result);

    } catch (error) {
      console.error('❌ Error registering admin user:', error);

      const result: RegistrationResult = {
        success: false,
        message: 'Failed to register admin user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(result);
    }
  }

  /**
   * Test superadmin login
   */
  public async testSuperAdminLogin(req: Request, res: Response): Promise<void> {
    try {
      console.log('🧪 Testing superadmin@iaf.co.id login...');

      const config = backendEnvironmentLoader.getConfiguration();
      const backendUrl = config.servers.backend.url;
      const loginResult = await fetch(`${backendUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'superadmin@iaf.co.id',
          password: '1019181716'
        })
      });

      const response = await loginResult.json();

      console.log('🧪 Superadmin login test result:', response);

      res.status(200).json({
        success: true,
        message: 'Superadmin login test completed',
        loginResult: response
      });

    } catch (error) {
      console.error('❌ Error testing superadmin login:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to test superadmin login',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test admin login
   */
  public async testAdminLogin(req: Request, res: Response): Promise<void> {
    try {
      console.log('🧪 Testing admin@iaf.co.id login...');

      const config = backendEnvironmentLoader.getConfiguration();
      const backendUrl = config.servers.backend.url;
      const loginResult = await fetch(`${backendUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@iaf.co.id',
          password: '1019181716'
        })
      });

      const response = await loginResult.json();

      console.log('🧪 Admin login test result:', response);

      res.status(200).json({
        success: true,
        message: 'Admin login test completed',
        loginResult: response
      });

    } catch (error) {
      console.error('❌ Error testing admin login:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to test admin login',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Health check for user registration service
   */
  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Test database connections
      await this.platformPool!.query('SELECT 1');
      await this.tenantPool!.query('SELECT 1');

      const result = {
        success: true,
        message: 'User registration service is healthy',
        databases: {
          platformAdmin: 'connected',
          iafTenant: 'connected'
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json(result);

    } catch (error) {
      console.error('❌ User registration service health check failed:', error);

      const result = {
        success: false,
        message: 'User registration service is unhealthy',
        databases: {
          platformAdmin: this.platformPool ? 'connected' : 'disconnected',
          iafTenant: this.tenantPool ? 'connected' : 'disconnected'
        },
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };

      res.status(503).json(result);
    }
  }

  /**
   * Cleanup database connections
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.platformPool) {
        await this.platformPool.end();
        this.platformPool = null;
      }

      if (this.tenantPool) {
        await this.tenantPool.end();
        this.tenantPool = null;
      }

      console.log('✅ User registration database connections cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up database connections:', error);
    }
  }
}