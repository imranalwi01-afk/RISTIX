// packages/backend/src/core/services/auth/permission.util.ts
// ============================================================================
// 🛡️ ENHANCED PERMISSION UTILITY - Simplified Permission Checking
// ============================================================================
// ✅ PURPOSE: Easy-to-use permission checking for controllers and services
// ✅ FEATURES: IAF admin role recognition, automatic full access grant
// ============================================================================

import { AuthenticatedRequest } from '../../../api/middleware/auth.middleware';

export interface PermissionCheckOptions {
  requireAll?: boolean; // Default: true - require all permissions
  logFailures?: boolean; // Default: true - log permission failures
  bypassForAdmins?: boolean; // Default: true - bypass for admin roles
}

/**
 * ✅ Enhanced permission check utility for controllers
 * Automatically grants full access to IAF_TENANT_SUPERADMIN and IAF_TENANT_ADMIN
 */
export class PermissionUtil {

  /**
   * Check if user has the required permissions
   * Returns true for IAF admin roles automatically
   */
  static hasPermissions(
    req: AuthenticatedRequest,
    requiredPermissions: string[],
    options: PermissionCheckOptions = {}
  ): boolean {
    const {
      requireAll = true,
      logFailures = true,
      bypassForAdmins = true
    } = options;

    if (!req.user) {
      if (logFailures) {
        console.log('❌ [PERMISSION] No user found in request');
      }
      return false;
    }

    // ✅ IAF admin bypass - immediate grant for admin roles
    const userRoleCodes = req.user.roleCodes || [];
    const hasIafAdminRole = userRoleCodes.includes('IAF_TENANT_SUPERADMIN') ||
                         userRoleCodes.includes('IAF_TENANT_ADMIN');

    if (bypassForAdmins && hasIafAdminRole) {
      console.log(`✅ [PERMISSION] IAF admin access granted for ${req.user.email} with roleCodes: ${userRoleCodes.join(', ')}`);
      return true;
    }

    // ✅ Platform admin bypass
    if (req.user.permissions.includes('*') ||
        req.user.permissions.includes('all') ||
        req.user.permissions.includes('full_admin_access') ||
        req.user.roles.includes('platform_super_admin')) {
      if (logFailures) {
        console.log(`✅ [PERMISSION] Platform admin access granted for ${req.user.email}`);
      }
      return true;
    }

    // Check specific permissions
    const userPermissions = req.user.permissions || [];

    if (requireAll) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission) ||
        userPermissions.some(userPerm => userPerm.toLowerCase() === permission.toLowerCase())
      );

      if (!hasAllPermissions && logFailures) {
        console.log(`❌ [PERMISSION] Insufficient permissions for ${req.user.email}. Required: ${requiredPermissions}, Has: ${userPermissions}`);
      }

      return hasAllPermissions;
    } else {
      const hasAnyPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission) ||
        userPermissions.some(userPerm => userPerm.toLowerCase() === permission.toLowerCase())
      );

      if (!hasAnyPermission && logFailures) {
        console.log(`❌ [PERMISSION] No matching permissions for ${req.user.email}. Required any of: ${requiredPermissions}, Has: ${userPermissions}`);
      }

      return hasAnyPermission;
    }
  }

  /**
   * Check if user has the required roles
   * Returns true for IAF admin roles automatically
   */
  static hasRoles(
    req: AuthenticatedRequest,
    requiredRoles: string[],
    options: PermissionCheckOptions = {}
  ): boolean {
    const {
      requireAll = true,
      logFailures = true,
      bypassForAdmins = true
    } = options;

    if (!req.user) {
      if (logFailures) {
        console.log('❌ [PERMISSION] No user found in request');
      }
      return false;
    }

    // ✅ IAF admin bypass - immediate grant for admin roles
    const userRoleCodes = req.user.roleCodes || [];
    const hasIafAdminRole = userRoleCodes.includes('IAF_TENANT_SUPERADMIN') ||
                         userRoleCodes.includes('IAF_TENANT_ADMIN');

    if (bypassForAdmins && hasIafAdminRole) {
      console.log(`✅ [PERMISSION] IAF admin access granted for ${req.user.email} with roleCodes: ${userRoleCodes.join(', ')}`);
      return true;
    }

    // ✅ Platform admin bypass
    if (req.user.roles.includes('platform_super_admin') ||
        req.user.roles.includes('admin')) {
      if (logFailures) {
        console.log(`✅ [PERMISSION] Platform admin access granted for ${req.user.email}`);
      }
      return true;
    }

    // Check specific roles
    const userRoles = req.user.roles || [];

    if (requireAll) {
      const hasAllRoles = requiredRoles.every(role =>
        userRoles.includes(role) ||
        userRoles.some(userRole => userRole.toLowerCase() === role.toLowerCase())
      );

      if (!hasAllRoles && logFailures) {
        console.log(`❌ [PERMISSION] Insufficient roles for ${req.user.email}. Required: ${requiredRoles}, Has: ${userRoles}`);
      }

      return hasAllRoles;
    } else {
      const hasAnyRole = requiredRoles.some(role =>
        userRoles.includes(role) ||
        userRoles.some(userRole => userRole.toLowerCase() === role.toLowerCase())
      );

      if (!hasAnyRole && logFailures) {
        console.log(`❌ [PERMISSION] No matching roles for ${req.user.email}. Required any of: ${requiredRoles}, Has: ${userRoles}`);
      }

      return hasAnyRole;
    }
  }

  /**
   * Check if user is an IAF admin (SUPERADMIN or ADMIN)
   */
  static isIafAdmin(req: AuthenticatedRequest): boolean {
    if (!req.user) {
      return false;
    }

    const userRoleCodes = req.user.roleCodes || [];
    return userRoleCodes.includes('IAF_TENANT_SUPERADMIN') ||
           userRoleCodes.includes('IAF_TENANT_ADMIN');
  }

  /**
   * Check if user is a platform admin
   */
  static isPlatformAdmin(req: AuthenticatedRequest): boolean {
    if (!req.user) {
      return false;
    }

    return req.user.userType === 'platform' ||
           req.user.roles.includes('platform_super_admin') ||
           req.user.roles.includes('PLATFORM_SUPER_ADMIN') ||
           req.user.roles.includes('admin');
  }

  /**
   * Check if user has admin access (either IAF or platform admin)
   */
  static isAdmin(req: AuthenticatedRequest): boolean {
    return this.isIafAdmin(req) || this.isPlatformAdmin(req);
  }

  /**
   * Check if user can access the tenant
   */
  static canAccessTenant(req: AuthenticatedRequest, tenantId?: string): boolean {
    if (!req.user) {
      return false;
    }

    // Platform admins can access any tenant
    if (this.isPlatformAdmin(req)) {
      return true;
    }

    // IAF admins can access their own tenant
    if (this.isIafAdmin(req)) {
      return !tenantId || req.user.tenantId === tenantId || req.user.tenantSlug === tenantId;
    }

    // Regular users can access their assigned tenant
    return !tenantId || req.user.tenantId === tenantId || req.user.tenantSlug === tenantId;
  }

  /**
   * Get user's effective permissions list
   */
  static getUserPermissions(req: AuthenticatedRequest): string[] {
    if (!req.user) {
      return [];
    }

    // Admins get all permissions
    if (this.isAdmin(req)) {
      return [
        '*',
        'full_admin_access',
        'users_read', 'users_create', 'users_update', 'users_delete',
        'roles_read', 'roles_create', 'roles_update', 'roles_delete',
        'permissions_read', 'permissions_create', 'permissions_update', 'permissions_delete',
        'tenants_read', 'tenants_create', 'tenants_update', 'tenants_delete',
        'system_manage', 'system_configure', 'system_monitor',
        'ifrs9_read', 'ifrs9_write', 'ifrs9_approve', 'ifrs9_execute',
        'portfolio_read', 'portfolio_write', 'portfolio_delete',
        'reports_read', 'reports_create', 'reports_generate', 'reports_delete',
        'audit_read', 'audit_create', 'audit_export',
        'etl_manage', 'data_upload', 'data_process', 'data_delete',
        'banking_all', 'conventional_all', 'syariah_all',
        'workflow_all', 'approval_all', 'configuration_all'
      ];
    }

    return req.user.permissions || [];
  }

  /**
   * Get user's effective role codes
   */
  static getUserRoleCodes(req: AuthenticatedRequest): string[] {
    if (!req.user) {
      return [];
    }

    // Return roleCodes if available, otherwise fall back to roles
    return req.user.roleCodes || req.user.roles || [];
  }

  /**
   * Create middleware function for permission checking
   */
  static requirePermissions(
    requiredPermissions: string[],
    options?: PermissionCheckOptions
  ) {
    return (req: AuthenticatedRequest, res: any, next: any): void => {
      if (this.hasPermissions(req, requiredPermissions, options)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermissions,
          current: this.getUserPermissions(req),
          roleCodes: this.getUserRoleCodes(req)
        });
      }
    };
  }

  /**
   * Create middleware function for role checking
   */
  static requireRoles(
    requiredRoles: string[],
    options?: PermissionCheckOptions
  ) {
    return (req: AuthenticatedRequest, res: any, next: any): void => {
      if (this.hasRoles(req, requiredRoles, options)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: 'Insufficient role permissions',
          code: 'INSUFFICIENT_ROLES',
          required: requiredRoles,
          current: req.user?.roles || [],
          roleCodes: this.getUserRoleCodes(req)
        });
      }
    };
  }

  /**
   * Create middleware function for admin access
   */
  static requireAdmin() {
    return (req: AuthenticatedRequest, res: any, next: any): void => {
      if (this.isAdmin(req)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: 'Admin access required',
          code: 'ADMIN_ACCESS_REQUIRED',
          userType: req.user?.userType,
          roles: req.user?.roles || [],
          roleCodes: this.getUserRoleCodes(req)
        });
      }
    };
  }

  /**
   * Create middleware function for tenant access
   */
  static requireTenantAccess(tenantId?: string) {
    return (req: AuthenticatedRequest, res: any, next: any): void => {
      if (this.canAccessTenant(req, tenantId)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: 'Tenant access required',
          code: 'TENANT_ACCESS_REQUIRED',
          requestedTenant: tenantId,
          userTenantId: req.user?.tenantId,
          userTenantSlug: req.user?.tenantSlug
        });
      }
    };
  }
}

// Export for easy use in controllers
export const {
  hasPermissions,
  hasRoles,
  isIafAdmin,
  isPlatformAdmin,
  isAdmin,
  canAccessTenant,
  getUserPermissions,
  getUserRoleCodes,
  requirePermissions,
  requireRoles,
  requireAdmin,
  requireTenantAccess
} = PermissionUtil;