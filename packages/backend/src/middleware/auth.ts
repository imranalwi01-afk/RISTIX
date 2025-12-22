// packages/backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { jwtService, JwtPayload } from '../utils/auth/jwt';
import { databaseConfig } from '../core/database/config/database.config';
import { jwtConfigService } from '../core/config/jwt.config';

/**
 * Authentication Middleware
 * Handles JWT token validation, user context, and role-based access control
 */

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tenantId?: string;
      tenantSlug?: string;
      isAuthenticated?: boolean;
    }
  }
}

export interface AuthOptions {
  required?: boolean;
  roles?: string[];
  permissions?: string[];
  requireTenant?: boolean;
}

/**
 * Main authentication middleware
 */
export const authenticate = (options: AuthOptions = {}) => {
  const { required = true, roles = [], permissions = [], requireTenant = false } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const authHeader = req.headers.authorization;
      
      // Handle case where authentication is not required
      if (!required && !authHeader) {
        req.isAuthenticated = false;
        return next();
      }

      // Extract token from Authorization header
      const token = jwtService.extractBearerToken(authHeader || '');
      
      if (!token) {
        if (required) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authorization header with Bearer token is required',
          });
        } else {
          req.isAuthenticated = false;
          return next();
        }
      }

      // Verify JWT token with centralized configuration (primary method)
      let payload: JwtPayload | null = null;
      let centralizedError: Error | null = null;

      // First try centralized JWT verification
      try {
        const jwt = require('jsonwebtoken');
        const jwtConfig = jwtConfigService.getConfiguration();

        // Use centralized JWT configuration for consistent token verification
        payload = jwt.verify(token, jwtConfig.secret, {
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience,
          algorithms: [jwtConfig.algorithm]
        }) as JwtPayload;

        console.log(`✅ JWT verification successful with centralized config - issuer: ${jwtConfig.issuer}`);
      } catch (error) {
        centralizedError = error as Error;
        console.log(`⚠️ Centralized JWT verification failed, trying legacy compatibility`);
      }

      // If centralized verification failed, try legacy compatibility mode
      if (!payload && centralizedError) {
        try {
          const jwt = require('jsonwebtoken');
          const possibleIssuers = [
            'ifrs9-platform-development',  // For localdev deployment (DEPLOYMENT_TARGET=localdev)
            'ifrs9-platform-production',   // For production deployment (NODE_ENV=production)
            'ifrs9-platform-localdev',    // Alternative localdev issuer
            'ifrs9-platform-iafecs'       // IAF ECS production issuer
          ];

          // Try each possible issuer for backward compatibility
          for (const issuer of possibleIssuers) {
            try {
              payload = jwt.verify(token, process.env.JWT_SECRET, {
                issuer: issuer,
                audience: 'ifrs9-platform-users',
                algorithms: ['HS256']
              }) as JwtPayload;
              console.log(`✅ JWT verification successful with legacy issuer: ${issuer}`);
              break;
            } catch (issuerError) {
              // Continue to next issuer
              continue;
            }
          }

          // If none of the issuers worked, return error
          if (!payload) {
            throw new Error('Token verification failed with all possible issuers');
          }
        } catch (legacyError) {
          // Both centralized and legacy verification failed
          const errorMessage = centralizedError
            ? `JWT verification failed. Centralized: ${centralizedError.message}. Legacy: ${(legacyError as Error).message}`
            : `JWT verification failed. Legacy: ${(legacyError as Error).message}`;

          return res.status(401).json({
            success: false,
            error: 'Invalid authentication token',
            code: 'AUTH_TOKEN_INVALID',
            message: errorMessage,
          });
        }
      }

      // ✅ FIXED: Normalize token payload structure for consistency
      // JWT service creates tokens with all required fields
      // Handle both role and roles fields for compatibility
      const userRoles = payload?.roles || [];
      const userRole = payload?.role;
      const allRoles = userRole ? [userRole, ...userRoles] : userRoles;

      // Create normalized payload matching actual JWT structure
      const normalizedPayload: JwtPayload = {
        userId: payload?.userId || '',
        tenantId: payload?.tenantId || '',
        tenantSlug: payload?.tenantSlug || '',
        email: payload?.email || '',
        username: payload?.username || '',
        role: userRole,
        roles: allRoles,
        permissions: payload?.permissions || [],
        roleCodes: payload?.roleCodes || [],
        bankingType: payload?.bankingType || 'conventional',
        userType: payload?.userType || '',
        sessionId: payload?.sessionId || '',
        iat: payload?.iat,
        exp: payload?.exp
      };

      // Attach user information to request
      req.user = normalizedPayload;
      req.tenantId = normalizedPayload.tenantId;
      req.tenantSlug = normalizedPayload.tenantSlug;
      req.isAuthenticated = true;

      // Validate tenant requirement
      if (requireTenant && !payload.tenantId) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED',
          message: 'This endpoint requires a valid tenant context',
        });
      }

      // Validate role requirements
      if (roles.length > 0) {
        // Use normalized payload for role validation
        const hasRequiredRole = roles.some(role => allRoles.includes(role));
        if (!hasRequiredRole) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_ROLE_PERMISSIONS',
            message: `Required roles: ${roles.join(', ')}`,
          });
        }
      }

      // Validate permission requirements
      if (permissions.length > 0) {
        const userPermissions = normalizedPayload.permissions || [];
        const hasRequiredPermission = permissions.some(permission =>
          userPermissions.includes(permission)
        );
        if (!hasRequiredPermission) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Required permissions: ${permissions.join(', ')}`,
          });
        }
      }

      // Safe logging with roles from normalized payload
      const logRoles = allRoles.length > 0 ? allRoles : ['unknown'];
      console.log(`✅ User authenticated: ${normalizedPayload.email} (${logRoles.join(', ')})`);
      next();
    } catch (error) {
      console.error('❌ Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication error',
        code: 'AUTH_MIDDLEWARE_ERROR',
        message: 'An error occurred during authentication',
      });
    }
  };
};

/**
 * Require authentication middleware
 */
export const requireAuth = authenticate({ required: true });

/**
 * Optional authentication middleware
 */
export const optionalAuth = authenticate({ required: false });

/**
 * Require specific roles
 */
export const requireRoles = (...roles: string[]) => {
  return authenticate({ required: true, roles });
};

/**
 * Require specific permissions
 */
export const requirePermissions = (...permissions: string[]) => {
  return authenticate({ required: true, permissions });
};

/**
 * Require tenant context
 */
export const requireTenant = authenticate({ required: true, requireTenant: true });

/**
 * Banking-specific role middleware
 */
export const requireBankingRole = (bankingType?: 'conventional' | 'syariah' | 'dual') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // First run authentication
    await new Promise<void>((resolve, reject) => {
      requireAuth(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Check if user has banking roles
    const bankingRoles = [
      'BANK_CRO', 'BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST',
      'BANK_AUDITOR', 'BANK_COMPLIANCE_OFFICER'
    ];

    // Use JWT payload with roles array
    const jwtUser = (req.user as unknown) as JwtPayload;
    const userRoles = jwtUser.roles || [];
    const hasBankingRole = userRoles.some(role => bankingRoles.includes(role));

    if (!hasBankingRole) {
      return res.status(403).json({
        success: false,
        error: 'Banking role required',
        code: 'BANKING_ROLE_REQUIRED',
        message: 'This endpoint requires a banking institution role',
      });
      return;
    }

    // Check banking type compatibility if specified
    if (bankingType && jwtUser.bankingType !== 'dual' && jwtUser.bankingType !== bankingType) {
      return res.status(403).json({
        success: false,
        error: 'Banking type mismatch',
        code: 'BANKING_TYPE_MISMATCH',
        message: `This endpoint requires ${bankingType} banking access`,
      });
      return;
    }

    next();
  };
};

/**
 * Platform admin middleware
 */
export const requirePlatformAdmin = authenticate({ 
  required: true, 
  roles: ['PLATFORM_ADMIN'] 
});

/**
 * Consultant middleware
 */
export const requireConsultant = authenticate({ 
  required: true, 
  roles: ['CONSULTANT'] 
});

/**
 * Regulator middleware
 */
export const requireRegulator = authenticate({ 
  required: true, 
  roles: ['REGULATOR'] 
});

/**
 * Tenant isolation middleware
 * Ensures users can only access data from their own tenant
 */
export const enforceTenantIsolation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context required',
        code: 'TENANT_CONTEXT_MISSING',
      });
      return;
    }

    // Use JWT payload to get user info
    const jwtUser = (req.user as unknown) as JwtPayload;

    if (!jwtUser.tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context required',
        code: 'TENANT_CONTEXT_MISSING',
      });
      return;
    }

    // Allow platform admins to access any tenant
    const userRoles = jwtUser.roles || [];
    if (userRoles.includes('PLATFORM_ADMIN') || userRoles.includes('PLATFORM_SUPER_ADMIN')) {
      console.log(`🔓 Platform admin access granted: ${jwtUser.email}`);
      return next();
    }

    // Get tenant ID from request (URL param, body, or header)
    const requestTenantId = req.params.tenantId ||
      req.body.tenantId ||
      req.headers['x-tenant-id'] as string;

    // If no tenant ID in request, use user's tenant
    if (!requestTenantId) {
      req.params.tenantId = jwtUser.tenantId;
      return next();
    }

    // Verify user belongs to the requested tenant
    if (requestTenantId !== jwtUser.tenantId) {
      console.warn(`🚫 Tenant isolation violation: User ${jwtUser.email} (tenant: ${jwtUser.tenantId}) attempted to access tenant: ${requestTenantId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied to tenant data',
        code: 'TENANT_ACCESS_DENIED',
        message: 'You can only access data from your own tenant',
      });
      return;
    }

    console.log(`✅ Tenant access granted: ${jwtUser.email} accessing tenant ${requestTenantId}`);
    next();
  } catch (error) {
    console.error('❌ Tenant isolation middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Tenant isolation check failed',
      code: 'TENANT_ISOLATION_ERROR',
    });
    return;
  }
};

/**
 * Database access middleware
 * Ensures user has access to tenant database before proceeding
 */
export const requireTenantDatabase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Tenant database access requires authentication',
        code: 'AUTH_REQUIRED_FOR_DB_ACCESS',
      });
      return;
    }

    // Use JWT payload to get tenant slug
    const jwtUser = req.user as JwtPayload;

    if (!jwtUser.tenantSlug) {
      res.status(401).json({
        success: false,
        error: 'Tenant database access requires tenant context',
        code: 'TENANT_CONTEXT_REQUIRED',
      });
      return;
    }

    // Check if tenant database connection exists or can be established
    try {
      const connection = await databaseConfig.getTenantConnection(jwtUser.tenantSlug);

      // Test the connection
      await connection.authenticate();

      console.log(`✅ Tenant database access verified: ${jwtUser.tenantSlug}`);
      next();
    } catch (error) {
      console.error(`❌ Tenant database access failed for ${jwtUser.tenantSlug}:`, error);
      res.status(503).json({
        success: false,
        error: 'Tenant database unavailable',
        code: 'TENANT_DB_UNAVAILABLE',
        message: 'Unable to access tenant database. Please contact support.',
      });
      return;
    }
  } catch (error) {
    console.error('❌ Database access middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Database access check failed',
      code: 'DB_ACCESS_CHECK_ERROR',
    });
    return;
  }
};

/**
 * API rate limiting by user
 */
export const rateLimitByUser = (windowMs: number = 60000, maxRequests: number = 100) => {
  const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.user?.userId || req.ip;
    const now = Date.now();
    
    const userLimit = userRequestCounts.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize counter
      userRequestCounts.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        code: 'USER_RATE_LIMIT_EXCEEDED',
        message: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds`,
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
      });
    }

    userLimit.count++;
    next();
  };
};

/**
 * Session validation middleware
 * Ensures the user's session is still valid
 */
export const validateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Invalid session',
        code: 'INVALID_SESSION',
      });
      return;
    }

    // Use JWT payload to get user info
    const jwtUser = (req.user as unknown) as JwtPayload;

    if (!jwtUser.sessionId) {
      res.status(401).json({
        success: false,
        error: 'Invalid session',
        code: 'INVALID_SESSION',
      });
      return;
    }

    // Check if session is still active in JWT service
    const isActive = jwtService.isSessionActive(jwtUser.userId, jwtUser.sessionId);

    if (!isActive) {
      res.status(401).json({
        success: false,
        error: 'Session expired or invalidated',
        code: 'SESSION_INVALID',
        message: 'Please login again',
      });
      return;
    }

    console.log(`✅ Session validated: ${jwtUser.email} (${jwtUser.sessionId})`);
    next();
  } catch (error) {
    console.error('❌ Session validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Session validation failed',
      code: 'SESSION_VALIDATION_ERROR',
    });
    return;
  }
};

/**
 * Audit logging middleware
 * Logs authenticated user actions for compliance
 */
export const auditLog = (action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user) {
      // Use JWT payload to get user info
      const jwtUser = (req.user as unknown) as JwtPayload;
      const auditEntry = {
        timestamp: new Date().toISOString(),
        userId: jwtUser.userId,
        userEmail: jwtUser.email,
        tenantId: jwtUser.tenantId,
        action,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      };

      // In production, this would be sent to an audit service
      console.log(`📝 AUDIT: ${JSON.stringify(auditEntry)}`);
    }

    next();
  };
};

/**
 * Combined middleware for typical protected routes
 */
export const protectedRoute = (options: AuthOptions = {}) => {
  return [
    authenticate({ required: true, ...options }),
    validateSession,
    enforceTenantIsolation,
  ];
};

/**
 * Banking route protection with tenant database access
 */
export const protectedBankingRoute = (bankingType?: 'conventional' | 'syariah' | 'dual') => {
  return [
    requireBankingRole(bankingType),
    validateSession,
    enforceTenantIsolation,
    requireTenantDatabase,
  ];
};

/**
 * Utility function to get user context from request
 */
export const getUserContext = (req: Request): JwtPayload | null => {
  if (!req.user) return null;
  // Use unknown as intermediate type to avoid conversion error
  return (req.user as unknown) as JwtPayload;
};

/**
 * Utility function to check if user has specific permission
 */
export const hasPermission = (req: Request, permission: string): boolean => {
  if (!req.user) return false;
  const jwtUser = (req.user as unknown) as JwtPayload;
  return jwtUser.permissions?.includes(permission) || false;
};

/**
 * Utility function to check if user has specific role
 */
export const hasRole = (req: Request, role: string): boolean => {
  if (!req.user) return false;
  const jwtUser = (req.user as unknown) as JwtPayload;
  const userRoles = jwtUser.roles || [];
  return userRoles.includes(role);
};

export default {
  authenticate,
  requireAuth,
  optionalAuth,
  requireRoles,
  requirePermissions,
  requireTenant,
  requireBankingRole,
  requirePlatformAdmin,
  requireConsultant,
  requireRegulator,
  enforceTenantIsolation,
  requireTenantDatabase,
  rateLimitByUser,
  validateSession,
  auditLog,
  protectedRoute,
  protectedBankingRoute,
  getUserContext,
  hasPermission,
  hasRole,
};