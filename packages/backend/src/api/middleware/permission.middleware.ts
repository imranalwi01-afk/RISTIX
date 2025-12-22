// packages/backend/src/api/middleware/permission.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/auth';

/**
 * Permission-based access control middleware
 */
export class PermissionMiddleware {
  /**
   * Check if user has specific permission
   */
  static requirePermission(permission: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        // Check if user is authenticated
        if (!req.isAuthenticated || !req.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
        }

        // Check if user has the required permission
        const userPermissions = req.user.permissions || [];
        if (!userPermissions.includes(permission) && !userPermissions.includes('admin:all')) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: permission,
            userPermissions
          });
        }

        next();
      } catch (error) {
        console.error('❌ Permission middleware error:', error);
        return res.status(500).json({
          success: false,
          error: 'Permission validation failed',
          code: 'PERMISSION_CHECK_FAILED'
        });
      }
    };
  }

  /**
   * Check if user has any of the specified permissions
   */
  static requireAnyPermission(permissions: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        // Check if user is authenticated
        if (!req.isAuthenticated || !req.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
        }

        // Check if user has any of the required permissions
        const userPermissions = req.user.permissions || [];
        const hasPermission = permissions.some(perm => 
          userPermissions.includes(perm) || userPermissions.includes('admin:all')
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: permissions,
            userPermissions
          });
        }

        next();
      } catch (error) {
        console.error('❌ Permission middleware error:', error);
        return res.status(500).json({
          success: false,
          error: 'Permission validation failed',
          code: 'PERMISSION_CHECK_FAILED'
        });
      }
    };
  }

  /**
   * Check if user has tenant-level access
   */
  static requireTenantAccess() {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        // Check if user is authenticated
        if (!req.isAuthenticated || !req.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
        }

        // Check if user has tenant context
        if (!req.tenantId || !req.tenantSlug) {
          return res.status(403).json({
            success: false,
            error: 'Tenant context required',
            code: 'TENANT_CONTEXT_REQUIRED'
          });
        }

        next();
      } catch (error) {
        console.error('❌ Permission middleware error:', error);
        return res.status(500).json({
          success: false,
          error: 'Permission validation failed',
          code: 'PERMISSION_CHECK_FAILED'
        });
      }
    };
  }

  /**
   * Check if user has platform-level access
   */
  static requirePlatformAccess() {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        // Check if user is authenticated
        if (!req.isAuthenticated || !req.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
        }

        // Check if user has platform admin role or permission
        const userRoles = req.user.roles || [];
        const userPermissions = req.user.permissions || [];
        
        const hasPlatformAccess = userRoles.includes('PLATFORM_SUPER_ADMIN') || 
                                 userRoles.includes('PLATFORM_ADMIN') ||
                                 userPermissions.includes('admin:all') ||
                                 userPermissions.includes('platform:admin');

        if (!hasPlatformAccess) {
          return res.status(403).json({
            success: false,
            error: 'Platform access required',
            code: 'PLATFORM_ACCESS_REQUIRED'
          });
        }

        next();
      } catch (error) {
        console.error('❌ Permission middleware error:', error);
        return res.status(500).json({
          success: false,
          error: 'Permission validation failed',
          code: 'PERMISSION_CHECK_FAILED'
        });
      }
    };
  }
}

// Export convenience functions
export const requirePermission = PermissionMiddleware.requirePermission;
export const requireAnyPermission = PermissionMiddleware.requireAnyPermission;
export const requireTenantAccess = PermissionMiddleware.requireTenantAccess;
export const requirePlatformAccess = PermissionMiddleware.requirePlatformAccess;

export default PermissionMiddleware;