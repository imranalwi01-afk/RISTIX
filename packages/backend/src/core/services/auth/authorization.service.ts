// packages/backend/src/core/services/auth/authorization.service.ts
// Enterprise Authorization Service - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md RBAC patterns

import { databaseConfig } from '../../database/config/database.config';

interface Role {
  id: string;
  roleName: string;
  permissions: string[];
  bankingType?: string;
  tenantId?: string;
  isActive: boolean;
}

interface Permission {
  id: string;
  permissionName: string;
  resource: string;
  action: string;
  bankingType?: string;
  description?: string;
}

export class AuthorizationService {
  private static instance: AuthorizationService;

  public static getInstance(): AuthorizationService {
    if (!AuthorizationService.instance) {
      AuthorizationService.instance = new AuthorizationService();
    }
    return AuthorizationService.instance;
  }

  // MANDATORY: Check if user has permission
  public async hasPermission(userId: string, permission: string, tenantId?: string): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId, tenantId);
      
      // Check for exact permission or wildcard permissions
      return userPermissions.includes(permission) ||
             userPermissions.includes('*') ||
             userPermissions.some(p => this.matchesWildcard(p, permission));

    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // MANDATORY: Check if user has role
  public async hasRole(userId: string, roleName: string, tenantId?: string): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId, tenantId);
      return userRoles.some(role => role.roleName === roleName);

    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }

  // MANDATORY: Get user permissions
  public async getUserPermissions(userId: string, tenantId?: string): Promise<string[]> {
    try {
      if (tenantId) {
        return await this.getTenantUserPermissions(userId, tenantId);
      } else {
        return await this.getPlatformUserPermissions(userId);
      }

    } catch (error) {
      console.error('Get user permissions error:', error);
      return [];
    }
  }

  // MANDATORY: Get user roles
  public async getUserRoles(userId: string, tenantId?: string): Promise<Role[]> {
    try {
      if (tenantId) {
        return await this.getTenantUserRoles(userId, tenantId);
      } else {
        return await this.getPlatformUserRoles(userId);
      }

    } catch (error) {
      console.error('Get user roles error:', error);
      return [];
    }
  }

  // MANDATORY: Banking type permission check
  public async hasBankingPermission(userId: string, bankingType: string, permission: string, tenantId?: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId, tenantId);
      
      // Check if any role has permission for the specific banking type
      for (const role of roles) {
        if (!role.bankingType || role.bankingType === bankingType || role.bankingType === 'dual') {
          const rolePermissions = role.permissions;
          if (rolePermissions.includes(permission) || 
              rolePermissions.includes('*') ||
              rolePermissions.some(p => this.matchesWildcard(p, permission))) {
            return true;
          }
        }
      }

      return false;

    } catch (error) {
      console.error('Banking permission check error:', error);
      return false;
    }
  }

  // MANDATORY: Syariah compliance check
  public async hasSyariahAccess(userId: string, tenantId: string): Promise<boolean> {
    try {
      // Check if user has syariah banking permissions
      const hasSyariahPermission = await this.hasPermission(userId, 'syariah:access', tenantId);
      const hasBankingPermission = await this.hasBankingPermission(userId, 'syariah', 'banking:access', tenantId);
      
      return hasSyariahPermission || hasBankingPermission;

    } catch (error) {
      console.error('Syariah access check error:', error);
      return false;
    }
  }

  // Get platform user permissions
  private async getPlatformUserPermissions(userId: string): Promise<string[]> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const query = `
      SELECT permissions FROM platform_admin.platform_users WHERE id = :userId
    `;

    const [results] = await platformDb.query(query, {
      replacements: { userId },
      type: 'SELECT'
    });

    if (results && results.length > 0) {
      const user = results[0] as any;
      return typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []);
    }

    return [];
  }

  // Get platform user roles
  private async getPlatformUserRoles(userId: string): Promise<Role[]> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const query = `
      SELECT u.role, u.permissions
      FROM platform_admin.platform_users u
      WHERE u.id = :userId
    `;

    const [results] = await platformDb.query(query, {
      replacements: { userId },
      type: 'SELECT'
    });

    if (results && results.length > 0) {
      const user = results[0] as any;
      return [{
        id: userId,
        roleName: user.role || 'user',
        permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []),
        isActive: true
      }];
    }

    return [];
  }

  // Get tenant user permissions
  private async getTenantUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const tenantDb = await databaseConfig.getTenantConnection(tenantId);
    
    const query = `
      SELECT r.permissions
      FROM core.users u
      LEFT JOIN core.roles r ON u.role_id = r.id
      WHERE u.id = :userId AND u.tenant_id = :tenantId
    `;

    const [results] = await tenantDb.query(query, {
      replacements: { userId, tenantId },
      type: 'SELECT'
    });

    if (results && results.length > 0) {
      const user = results[0] as any;
      return typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []);
    }

    return [];
  }

  // Get tenant user roles
  private async getTenantUserRoles(userId: string, tenantId: string): Promise<Role[]> {
    const tenantDb = await databaseConfig.getTenantConnection(tenantId);
    
    const query = `
      SELECT r.id, r.role_name, r.permissions, r.banking_type
      FROM core.users u
      LEFT JOIN core.roles r ON u.role_id = r.id
      WHERE u.id = :userId AND u.tenant_id = :tenantId
    `;

    const [results] = await tenantDb.query(query, {
      replacements: { userId, tenantId },
      type: 'SELECT'
    });

    return (results as any[]).map(row => ({
      id: row.id,
      roleName: row.role_name,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || []),
      bankingType: row.banking_type,
      tenantId,
      isActive: true
    }));
  }

  // Check wildcard permission matching
  private matchesWildcard(wildcardPermission: string, permission: string): boolean {
    if (!wildcardPermission.includes('*')) {
      return false;
    }

    const pattern = wildcardPermission.replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(permission);
  }
}

// Export singleton instance
export const authorizationService = AuthorizationService.getInstance();

// Export types
export type { Role, Permission };
