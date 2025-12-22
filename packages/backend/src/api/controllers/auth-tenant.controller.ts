// packages/backend/src/api/controllers/auth-tenant.controller.ts
// ============================================================================
// IFRS9 Multi-Tenant Platform - Authentication & Tenant Discovery Controller
// ============================================================================
// Purpose: Provides authentication data and tenant discovery for login page
// Integration: Uses live database for both users and tenant information
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { TenantRegistryService } from '../../core/services/tenant/tenant-registry.service';
import { databaseConfig } from '../../core/database/config/database.config';
import winstonService from '../../core/services/logging/winston.service';

export interface AuthTenantUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  userType: 'tenant' | 'platform';
  company?: string;
  tenantId?: string;
  tenantSlug?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
  isActive: boolean;
  permissions: string[];
  icon?: string;
  description?: string;
  expectedRedirect?: string;
}

export interface TenantOption {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  status: 'active' | 'inactive' | 'suspended';
  description?: string;
  company?: string;
  features: string[];
  subscriptionTier: string;
  userCount: number;
  isActive: boolean;
}

export interface AuthLoginData {
  users: AuthTenantUser[];
  tenants: TenantOption[];
  systemInfo: {
    version: string;
    timestamp: string;
    totalUsers: number;
    totalTenants: number;
  };
}

export class AuthTenantController {
  constructor(
    private readonly tenantRegistryService: TenantRegistryService
  ) {}

  /**
   * Get login page data - users and tenants from live database
   * GET /api/v1/auth/login-data
   *
   * Replaces hardcoded frontend arrays with live database integration
   */
  async getLoginData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      winstonService.info('Fetching login data from live database', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Get all active tenants from registry
      const tenantResult = await this.tenantRegistryService.listTenants({
        status: 'active',
        limit: 50
      });

      // Get users for each tenant
      const allUsers: AuthTenantUser[] = [];

      for (const tenant of tenantResult.tenants) {
        const tenantUsers = await this.getTenantUsers(tenant.id, tenant.slug, tenant.organizationName, tenant.bankingType);
        allUsers.push(...tenantUsers);
      }

      // Get platform users (no tenant context)
      const platformUsers = await this.getPlatformUsers();
      allUsers.push(...platformUsers);

      // Transform tenants for frontend dropdown
      const tenantOptions: TenantOption[] = tenantResult.tenants.map(tenant => ({
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.organizationName,
        displayName: tenant.displayName,
        bankingType: tenant.bankingType,
        status: tenant.status === 'provisioning' ? 'active' as const : tenant.status as 'active' | 'inactive' | 'suspended',
        description: tenant.organizationName,
        company: tenant.organizationName,
        features: Object.keys(tenant.features).filter(key => tenant.features[key as keyof typeof tenant.features]),
        subscriptionTier: tenant.subscriptionTier,
        userCount: tenant.metrics?.totalUsers || 0,
        isActive: tenant.status === 'active'
      }));

      const loginData: AuthLoginData = {
        users: allUsers,
        tenants: tenantOptions,
        systemInfo: {
          version: process.env.APP_VERSION || '2.0.0',
          timestamp: new Date().toISOString(),
          totalUsers: allUsers.length,
          totalTenants: tenantOptions.length
        }
      };

      res.json({
        success: true,
        data: loginData,
        meta: {
          requestId: (req as any).id,
          timestamp: new Date().toISOString(),
          source: 'live_database'
        }
      });

      winstonService.info('Login data fetched successfully', {
        usersCount: allUsers.length,
        tenantsCount: tenantOptions.length
      });

    } catch (error) {
      winstonService.error('Failed to fetch login data', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ip: req.ip
      });
      next(error);
    }
  }

  /**
   * Get users for a specific tenant
   */
  private async getTenantUsers(
    tenantId: string,
    tenantSlug: string,
    tenantName: string,
    bankingType: 'conventional' | 'syariah' | 'dual'
  ): Promise<AuthTenantUser[]> {
    try {
      // Connect to tenant database to get users
      const tenantConnection = await databaseConfig.getTenantConnection(tenantSlug);

      if (!tenantConnection) {
        winstonService.warn('Tenant database not accessible', { tenantId, tenantSlug });
        return [];
      }

      // Query users from tenant database (using the actual schema from backup files)
      const userRowsResult = await tenantConnection.query(`
        SELECT
          u.id as user_id,
          u.email,
          COALESCE(u.employee_name, u.display_name, u.name, 'Unknown User') as name,
          u.position,
          u.department,
          u.is_active,
          u.created_at
        FROM core.users u
        WHERE u.is_active = true
        AND u.email IS NOT NULL
        ORDER BY u.created_at DESC
        LIMIT 10
      `);

      const userRows = userRowsResult.rows || [];

      // Get roles for each user
      const users: AuthTenantUser[] = [];

      for (const userRow of userRows) {
        const roleRowsResult = await tenantConnection.query(`
          SELECT
            r.name as role_name,
            r.permissions
          FROM core.roles r
          INNER JOIN core.user_roles ur ON r.id = ur.role_id
          WHERE ur.user_id = $1
          AND r.is_active = true
        `, [userRow.user_id]);

        const roleRows = roleRowsResult.rows || [];

        const permissions = roleRows.length > 0
          ? roleRows.reduce((acc: string[], role) => {
              const rolePerms = role.permissions ? JSON.parse(role.permissions) as string[] : [];
              const uniquePerms = rolePerms.filter(perm => !acc.includes(perm));
              return [...acc, ...uniquePerms];
            }, [] as string[])
          : [];

        // Determine user role and redirect path based on permissions
        const primaryRole = roleRows.length > 0 ? roleRows[0].role_name : 'BANK_USER';
        const expectedRedirect = this.getRedirectByRole(primaryRole, bankingType);

        users.push({
          userId: userRow.user_id,
          email: userRow.email,
          name: userRow.name,
          role: primaryRole,
          userType: 'tenant',
          company: tenantName,
          tenantId: tenantSlug,
          tenantSlug: tenantSlug,
          bankingType: bankingType,
          isActive: userRow.is_active,
          permissions: permissions,
          icon: this.getUserIcon(primaryRole),
          description: this.getUserDescription(primaryRole, tenantName),
          expectedRedirect: expectedRedirect
        });
      }

      return users;

    } catch (error) {
      winstonService.error('Failed to get tenant users', {
        tenantId,
        tenantSlug,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Get platform users (admin, consultants, regulators)
   */
  private async getPlatformUsers(): Promise<AuthTenantUser[]> {
    try {
      // Connect to platform admin database
      const platformConnection = await databaseConfig.getPlatformConnection();

      if (!platformConnection) {
        winstonService.warn('Platform database not accessible');
        return [];
      }

      // Query platform users from actual database schema
      const platformUserRowsResult = await platformConnection.query(`
        SELECT
          id,
          email,
          COALESCE(name, display_name, 'Unknown User') as name,
          role,
          permissions,
          company,
          is_active,
          created_at
        FROM platform_admin.users
        WHERE is_active = true
        AND tenant_id IS NULL
        ORDER BY created_at DESC
        LIMIT 10
      `);

      const userRows = platformUserRowsResult.rows || [];

      const users: AuthTenantUser[] = [];

      for (const userRow of userRows) {
        const expectedRedirect = this.getPlatformRedirectByRole(userRow.role);

        users.push({
          userId: userRow.id,
          email: userRow.email,
          name: userRow.name,
          role: userRow.role,
          userType: 'platform',
          company: userRow.company,
          tenantId: undefined,
          tenantSlug: undefined,
          bankingType: undefined,
          isActive: userRow.is_active,
          permissions: userRow.permissions ? JSON.parse(userRow.permissions) as string[] : [],
          icon: this.getUserIcon(userRow.role),
          description: this.getUserDescription(userRow.role, userRow.company),
          expectedRedirect: expectedRedirect
        });
      }

      return users;

    } catch (error) {
      winstonService.error('Failed to get platform users', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Get appropriate icon for user role
   */
  private getUserIcon(role: string): string {
    const iconMap: Record<string, string> = {
      'BANK_CRO': '👨‍💼',
      'BANK_IFRS_MANAGER': '👨‍💼',
      'BANK_RISK_ANALYST': '👩‍💻',
      'BANK_PORTFOLIO_MANAGER': '👨‍💻',
      'BANK_DATA_ADMIN': '👩‍💻',
      'SYARIAH_BANK_CRO': '🧔‍♂️',
      'SYARIAH_COMPLIANCE_OFFICER': '👩‍💼',
      'DPS_BOARD_MEMBER': '👨‍🏫',
      'PLATFORM_SUPER_ADMIN': '👨‍💻',
      'PLATFORM_ADMIN': '👨‍💻',
      'SENIOR_IFRS9_CONSULTANT': '👩‍🎓',
      'BANKING_SUPERVISION_HEAD': '👩‍⚖️',
      'BANK_USER': '👤'
    };

    return iconMap[role] || '👤';
  }

  /**
   * Get user description based on role and company
   */
  private getUserDescription(role: string, company: string): string {
    const descriptions: Record<string, string> = {
      'BANK_CRO': `Chief Risk Officer - ${company}`,
      'BANK_IFRS_MANAGER': `IFRS 9 Manager - ${company}`,
      'BANK_RISK_ANALYST': `Senior Risk Analyst - ${company}`,
      'BANK_PORTFOLIO_MANAGER': `Portfolio Manager - ${company}`,
      'BANK_DATA_ADMIN': `Data Administrator - ${company}`,
      'SYARIAH_BANK_CRO': `Chief Risk Officer - ${company}`,
      'SYARIAH_COMPLIANCE_OFFICER': `Syariah Compliance Officer - ${company}`,
      'DPS_BOARD_MEMBER': `Dewan Pengawas Syariah Member - ${company}`,
      'PLATFORM_SUPER_ADMIN': 'Platform Super Administrator - i9model Platform',
      'PLATFORM_ADMIN': 'Platform Administrator - i9model Platform',
      'SENIOR_IFRS9_CONSULTANT': 'Senior IFRS 9 Consultant - PwC',
      'BANKING_SUPERVISION_HEAD': 'Head of Banking Supervision - Bank Indonesia'
    };

    return descriptions[role] || `${role} - ${company}`;
  }

  /**
   * Get redirect path based on user role for banking users
   */
  private getRedirectByRole(role: string, bankingType: string): string {
    // All banking users go to banking dashboard
    return '/banking/dashboard';
  }

  /**
   * Get redirect path based on user role for platform users
   */
  private getPlatformRedirectByRole(role: string): string {
    const redirects: Record<string, string> = {
      'PLATFORM_SUPER_ADMIN': '/platform/dashboard',
      'PLATFORM_ADMIN': '/platform/dashboard',
      'SENIOR_IFRS9_CONSULTANT': '/consultant/dashboard',
      'BANKING_SUPERVISION_HEAD': '/regulator/dashboard'
    };

    return redirects[role] || '/platform/dashboard';
  }

  /**
   * Validate tenant selection during login
   * POST /api/v1/auth/validate-tenant
   */
  async validateTenantSelection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
        return;
      }

      const { tenantId, email } = req.body;

      winstonService.info('Validating tenant selection', {
        tenantId,
        email,
        ip: req.ip
      });

      // Check if tenant exists and is active
      const tenant = await this.tenantRegistryService.getTenantBySlug(tenantId);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
        return;
      }

      if (tenant.status !== 'active') {
        res.status(403).json({
          success: false,
          error: 'TENANT_INACTIVE',
          message: 'Tenant is not active'
        });
        return;
      }

      // Check if user exists in tenant database
      const isValidUser = await this.validateUserInTenant(tenant.id, email);

      if (!isValidUser) {
        res.status(401).json({
          success: false,
          error: 'INVALID_USER_TENANT',
          message: 'User does not exist in this tenant'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          tenant: {
            id: tenant.id,
            slug: tenant.slug,
            name: tenant.organizationName,
            bankingType: tenant.bankingType
          },
          validated: true
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      winstonService.error('Failed to validate tenant selection', {
        error: error instanceof Error ? error.message : String(error),
        ip: req.ip
      });
      next(error);
    }
  }

  /**
   * Validate if user exists in tenant database
   */
  private async validateUserInTenant(tenantId: string, email: string): Promise<boolean> {
    try {
      const tenantDB = await databaseConfig.getTenantConnection(tenantId);

      if (!tenantDB) {
        return false;
      }

      const userValidationResult = await tenantDB.query(`
        SELECT id FROM core.users
        WHERE email = $1 AND is_active = true
        LIMIT 1
      `, [email]);

      const userRows = userValidationResult.rows || [];
      return userRows.length > 0;

    } catch (error) {
      winstonService.error('Failed to validate user in tenant', {
        tenantId,
        email,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}

export default AuthTenantController;