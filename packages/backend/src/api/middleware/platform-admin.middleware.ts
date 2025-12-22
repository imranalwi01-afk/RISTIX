// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/middleware/platform-admin.middleware.ts
// Generated: $(date)
// Phase: PHASE1 - Platform Admin Database Connection
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express
// Purpose: Middleware for platform admin and consultant access control
// ============================================================================

import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    user_type: string;
    consultant_access?: boolean;
    permissions: string[];
  };
}

/**
 * Middleware to require platform admin access
 */
export const requirePlatformAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Check if user is platform admin or has consultant access
    const isPlatformAdmin = user.user_type === 'platform_admin';
    const hasConsultantAccess = user.user_type === 'consultant_manager' && user.consultant_access;

    if (!isPlatformAdmin && !hasConsultantAccess) {
      res.status(403).json({
        success: false,
        error: 'Platform admin access required',
        code: 'INSUFFICIENT_PRIVILEGES',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Middleware to require consultant access
 */
export const requireConsultantAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Check if user has consultant access
    const hasConsultantAccess = user.consultant_access || 
                               user.user_type === 'consultant_manager' || 
                               user.user_type === 'platform_admin';

    if (!hasConsultantAccess) {
      res.status(403).json({
        success: false,
        error: 'Consultant access required',
        code: 'CONSULTANT_ACCESS_REQUIRED',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Middleware to check specific permissions
 */
export const requirePermissions = (requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
        return;
      }

      // Platform admin has all permissions
      if (user.user_type === 'platform_admin') {
        next();
        return;
      }

      // Check if user has all required permissions
      const userPermissions = user.permissions || [];
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermissions,
          current: userPermissions,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
};

/**
 * Middleware to validate cross-tenant access
 */
export const validateCrossTenantAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;
    const { tenant_id } = req.params;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Platform admin can access all tenants
    if (user.user_type === 'platform_admin') {
      next();
      return;
    }

    // Consultant with proper access can access assigned tenants
    if (user.consultant_access && tenant_id) {
      // TODO: Validate consultant assignment to specific tenant
      // This would require a database query to check consultant_projects table
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Cross-tenant access not authorized',
      code: 'CROSS_TENANT_ACCESS_DENIED',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};
