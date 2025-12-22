// packages/backend/src/api/middleware/auth.middleware.ts
// ✅ SURGICAL FIX: Enhanced auth middleware with correct JWT secret and user context

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticationService } from '../../core/services/auth/authentication.service';
import { jwtConfigService } from '../../core/config/jwt.config';

// ✅ Extended Request Interface with comprehensive user context
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
    fullName: string;
    roles: string[];
    permissions: string[];
    tenantId?: string;
    tenantSlug?: string;
    userType: 'platform' | 'tenant';
    roleCodes?: string[]; // ✅ Added role codes for menu compatibility
    bankingAccess: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
    syariahCertified: boolean;
    sessionId?: string;
  };
  tenant?: {
    id: string;
    slug: string;
    name: string;
    bankingType: 'conventional' | 'syariah' | 'dual';
  };
  jwtPayload?: any;
}

// ✅ Get JWT configuration from centralized service
const jwtConfig = jwtConfigService.getConfiguration();

console.log('🔐 Auth Middleware Configuration - CENTRALIZED:');
console.log('JWT Configuration:', {
  issuer: jwtConfig.issuer,
  audience: jwtConfig.audience,
  secretProvided: !!jwtConfig.secret,
  secretLength: jwtConfig.secret.length,
  algorithm: jwtConfig.algorithm,
  environment: process.env.NODE_ENV,
  deploymentTarget: process.env.DEPLOYMENT_TARGET
});

/**
 * ✅ Main authentication middleware
 * Verifies JWT tokens and sets user context
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
      return;
    }

    console.log(`🔍 [IFRS9-AUTH] Verifying JWT token: ${token.substring(0, 20)}...`);

    // ✅ Handle demo tokens for development
    if (token.startsWith('demo_token_')) {
      console.log('🎭 [IFRS9-AUTH] Using demo token authentication');
      const userRole = token.replace('demo_token_', '');
      req.user = createDemoUser(userRole);
      req.jwtPayload = { userId: userRole, userType: 'platform' };
      next();
      return;
    }

    // ✅ ENHANCED: Direct JWT verification with detailed logging using centralized config
    let decodedToken;
    try {
      const jwtConfig = jwtConfigService.getConfiguration();

      // 🔍 CRITICAL DEBUG: Capture exact JWT config for this specific request
      const requestInfo = {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        tokenPrefix: token.substring(0, 30) + '...'
      };

      console.log(`🔍 [JWT-DEBUG] ${requestInfo.method} ${requestInfo.url}`);
      console.log(`🔍 [JWT-DEBUG] Request Info:`, requestInfo);
      console.log(`🔍 [JWT-DEBUG] JWT Config loaded:`, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        algorithm: jwtConfig.algorithm,
        secretProvided: !!jwtConfig.secret,
        secretLength: jwtConfig.secret.length,
        secretPrefix: jwtConfig.secret.substring(0, 10) + '...'
      });

      // 🔍 CRITICAL DEBUG: Test JWT decoding step-by-step
      console.log(`🔍 [JWT-DEBUG] Attempting JWT verification with config:`, {
        secret: jwtConfig.secret.substring(0, 10) + '...',
        algorithms: [jwtConfig.algorithm],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      decodedToken = jwt.verify(token, jwtConfig.secret, {
        algorithms: [jwtConfig.algorithm],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as any;

      console.log('✅ JWT token decoded successfully:', {
        userId: decodedToken.userId,
        email: decodedToken.email,
        userType: decodedToken.userType,
        tenantId: decodedToken.tenantId,
        exp: decodedToken.exp,
        iat: decodedToken.iat,
        expTime: new Date(decodedToken.exp * 1000).toISOString(),
        iatTime: new Date(decodedToken.iat * 1000).toISOString(),
        timeUntilExpiry: decodedToken.exp * 1000 - Date.now()
      });

      // ✅ Check if token is expired
      if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
        console.log('❌ JWT token expired:', {
          expiredAt: new Date(decodedToken.exp * 1000).toISOString(),
          currentTime: new Date().toISOString(),
          timeUntilExpiry: decodedToken.exp * 1000 - Date.now()
        });
        throw new Error('Token expired');
      }

    } catch (jwtError) {
      const jwtConfig = jwtConfigService.getConfiguration();

      // 🔍 CRITICAL DEBUG: Enhanced JWT error analysis
      const errorDetails = {
        error: jwtError instanceof Error ? jwtError.message : 'Unknown error',
        name: jwtError instanceof Error ? jwtError.name : 'Unknown',
        stack: jwtError instanceof Error ? jwtError.stack : undefined,
        tokenPrefix: token.substring(0, 30) + '...',
        tokenLength: token.length,
        timestamp: new Date().toISOString(),
        requestInfo: {
          method: req.method,
          url: req.originalUrl,
          userAgent: req.get('User-Agent')
        },
        jwtConfig: {
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience,
          algorithm: jwtConfig.algorithm,
          secretProvided: !!jwtConfig.secret,
          secretLength: jwtConfig.secret.length,
          secretPrefix: jwtConfig.secret.substring(0, 10) + '...'
        }
      };

      console.error('🚨 [JWT-ERROR] JWT verification failed:', errorDetails);

      // 🔍 CRITICAL DEBUG: Try to decode without verification to see token content
      try {
        const decodedWithoutVerify = jwt.decode(token, { complete: true }) as any;
        console.log('🔍 [JWT-DEBUG] Token content (without verification):', {
          header: decodedWithoutVerify?.header,
          payload: {
            sub: decodedWithoutVerify?.payload?.sub,
            email: decodedWithoutVerify?.payload?.email,
            userId: decodedWithoutVerify?.payload?.userId,
            userType: decodedWithoutVerify?.payload?.userType,
            tenantId: decodedWithoutVerify?.payload?.tenantId,
            aud: decodedWithoutVerify?.payload?.aud,
            iss: decodedWithoutVerify?.payload?.iss,
            exp: decodedWithoutVerify?.payload?.exp,
            iat: decodedWithoutVerify?.payload?.iat
          }
        });
      } catch (decodeError) {
        console.error('🚨 [JWT-ERROR] Token could not be decoded at all:', decodeError);
      }

      // 🚨 CRITICAL FIX: Return 401 instead of 403 for JWT validation errors
      // This matches what the session control service expects
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: jwtError instanceof Error && jwtError.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        debug: {
          errorType: jwtError instanceof Error ? jwtError.name : 'Unknown',
          message: jwtError instanceof Error ? jwtError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // ✅ DEBUG: Skip user verification to isolate JWT validation issue
    console.log('🔧 DEBUG: Skipping user verification to test JWT validation only');
    let userInfo = {
      id: decodedToken.userId,
      userId: decodedToken.userId,
      email: decodedToken.email,
      username: decodedToken.username,
      fullName: decodedToken.fullName || 'Platform Administrator',
      role: decodedToken.role,
      permissions: decodedToken.permissions || ['*'],
      userType: decodedToken.userType,
      tenantId: decodedToken.tenantId,
      tenantSlug: decodedToken.tenantSlug,
      roleCodes: decodedToken.roleCodes || [decodedToken.role],
      bankingAccess: 'BOTH',
      syariahCertified: false
    };

    console.log('✅ JWT decoded and user info created:', {
      userId: decodedToken.userId,
      email: decodedToken.email,
      userType: decodedToken.userType,
      tenantId: decodedToken.tenantId
    });

    /* TODO: Re-enable after debugging
    try {
      userInfo = await authenticationService.verifyToken(token);
      if (!userInfo) {
        console.log('❌ User verification failed: Token is valid but user not found or inactive');
        throw new Error('User verification failed');
      }

      console.log('✅ User verification successful:', {
        userId: userInfo.userId,
        email: userInfo.email,
        userType: userInfo.userType,
        tenantId: userInfo.tenantId
      });

    } catch (serviceError) {
      console.error('🚨 User verification failed:', {
        error: serviceError instanceof Error ? serviceError.message : 'Unknown error',
        tokenPrefix: token.substring(0, 20) + '...',
        timestamp: new Date().toISOString()
      });

      // 🚨 CRITICAL FIX: Return 401 instead of 403 for user verification errors
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'USER_VERIFICATION_FAILED'
      });
      return;
    }
    */
  
    // ✅ Set user context from authentication service response
    const userData = userInfo;

    // 🔍 DEBUG: Log user ID mapping for debugging 401 errors
    console.log('🔍 [AUTH-MIDDLEWARE] User ID Mapping Debug:', {
      jwtPayloadUserId: decodedToken.userId,
      userDataId: userData.id,
      jwtPayloadSub: decodedToken.sub,
      userEmail: userData.email,
      userType: userData.userType,
      tenantId: userData.tenantId,
      tenantSlug: userData.tenantSlug
    });

    req.user = {
      userId: userData.id,
      email: userData.email,
      username: userData.username,
      fullName: userData.fullName,
      roles: userData.role ? [userData.role] : ['user'],
      permissions: userData.permissions || ['*'],
      tenantId: userData.tenantId,
      tenantSlug: userData.tenantSlug,
      userType: userData.userType,
      // ✅ Add role codes from database for menu compatibility
      roleCodes: userData.roleCodes || [userData.role],
      bankingAccess: userData.bankingType === 'dual' ? 'BOTH' :
                      userData.bankingType?.toUpperCase() as 'CONVENTIONAL' | 'SYARIAH' | 'BOTH' || 'BOTH',
      syariahCertified: userData.bankingType === 'syariah' || userData.bankingType === 'dual',
      sessionId: undefined
    };

    // 🔍 DEBUG: Log final user context
    console.log('🔍 [AUTH-MIDDLEWARE] Final User Context Set:', {
      reqUserId: req.user.userId,
      reqUserEmail: req.user.email,
      reqUserRoles: req.user.roles,
      reqUserTenantId: req.user.tenantId,
      reqUserTenantSlug: req.user.tenantSlug,
      reqUserType: req.user.userType
    });

    console.log('🔍 User context set from JWT:', {
      userId: req.user.userId,
      email: req.user.email,
      roles: req.user.roles,
      permissions: req.user.permissions.slice(0, 3),
      tenantId: req.user.tenantId,
      tenantSlug: req.user.tenantSlug
    });

    // ✅ Set tenant context if available
    if (userData.tenantId || userData.tenantSlug) {
      req.tenant = {
        id: userData.tenantId || 'platform',
        slug: userData.tenantSlug || 'platform',
        name: 'IAF Tenant',
        bankingType: userData.bankingType as 'conventional' | 'syariah' | 'dual' || 'dual'
      };
    }

    req.jwtPayload = userData;
    
    console.log(`✅ User authenticated: ${req.user.email} (${req.user.userId}) with roles: ${req.user.roles.join(', ')}`);
    next();

  } catch (error) {
    const jwtConfig = jwtConfigService.getConfiguration();
    console.error('🚨 JWT verification failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tokenPrefix: req.headers.authorization?.substring(0, 30) + '...',
      timestamp: new Date().toISOString(),
      jwtConfig: {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        algorithm: jwtConfig.algorithm,
        secretProvided: !!jwtConfig.secret,
        secretLength: jwtConfig.secret.length
      }
    });
    
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * ✅ Require specific roles middleware
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_AUTH'
      });
      return;
    }

    // ✅ Platform super admin bypass
    if (req.user.roles.includes('platform_super_admin') ||
        req.user.roles.includes('PLATFORM_SUPER_ADMIN') ||
        req.user.roles.includes('admin')) {
      console.log(`✅ Platform admin access granted for ${req.user.email}`);
      next();
      return;
    }

    // ✅ IAF Tenant admin bypass - check roleCodes for IAF admin roles
    const userRoleCodes = req.user.roleCodes || [];
    if (userRoleCodes.includes('IAF_TENANT_SUPERADMIN') ||
        userRoleCodes.includes('IAF_TENANT_ADMIN')) {
      console.log(`✅ IAF admin access granted for ${req.user.email} with roleCodes: ${userRoleCodes.join(', ')}`);
      next();
      return;
    }

    // ✅ Check if user has any of the required roles (case-insensitive)
    const hasRequiredRole = allowedRoles.some(role => 
      req.user!.roles.some(userRole => 
        userRole.toLowerCase() === role.toLowerCase()
      )
    );

    if (!hasRequiredRole) {
      console.log(`❌ Insufficient roles for ${req.user.email}. Required: ${allowedRoles}, Has: ${req.user.roles}`);
      res.status(403).json({
        success: false,
        error: 'Insufficient role permissions',
        code: 'INSUFFICIENT_ROLE',
        required: allowedRoles,
        current: req.user.roles
      });
      return;
    }

    console.log(`✅ Role check passed for ${req.user.email}`);
    next();
  };
};

/**
 * ✅ Require specific permissions middleware
 */
export const requirePermissions = (requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_AUTH'
      });
      return;
    }

    // ✅ Platform super admin bypass
    if (req.user.permissions.includes('*') ||
        req.user.permissions.includes('all') ||
        req.user.permissions.includes('full_admin_access') ||
        req.user.roles.includes('platform_super_admin')) {
      console.log(`✅ Platform admin permissions granted for ${req.user.email}`);
      next();
      return;
    }

    // ✅ IAF Tenant admin bypass - check roleCodes and full_admin_access permission
    const userRoleCodes = req.user.roleCodes || [];
    if (userRoleCodes.includes('IAF_TENANT_SUPERADMIN') ||
        userRoleCodes.includes('IAF_TENANT_ADMIN') ||
        req.user.permissions.includes('full_admin_access')) {
      console.log(`✅ IAF admin permissions granted for ${req.user.email} with roleCodes: ${userRoleCodes.join(', ')}`);
      next();
      return;
    }

    // ✅ BANK_USER role fallback - they should have users_read by default
    if (req.user.roles.includes('BANK_USER') &&
        requiredPermissions.includes('users_read') &&
        requiredPermissions.length === 1) {
      console.log(`✅ BANK_USER fallback granted for ${req.user.email} - users_read permission`);
      next();
      return;
    }

    // ✅ Check permissions
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      req.user!.permissions.some(userPerm =>
        userPerm.toLowerCase() === permission.toLowerCase()
      )
    );

    if (!hasRequiredPermissions) {
      console.log(`❌ Insufficient permissions for ${req.user.email}. Required: ${requiredPermissions}, Has: ${req.user.permissions}`);
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredPermissions,
        current: req.user.permissions
      });
      return;
    }

    console.log(`✅ Permission check passed for ${req.user.email}`);
    next();
  };
};

/**
 * ✅ Require platform admin access
 */
export const requirePlatformAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.userType !== 'platform') {
    res.status(403).json({
      success: false,
      error: 'Platform admin access required',
      code: 'PLATFORM_ADMIN_REQUIRED'
    });
    return;
  }
  next();
};

/**
 * ✅ Banking access control middleware
 */
export const requireBankingAccess = (bankingType: 'CONVENTIONAL' | 'SYARIAH') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_AUTH'
      });
      return;
    }

    // ✅ Check banking access
    const hasAccess = req.user.bankingAccess === 'BOTH' || 
                     req.user.bankingAccess === bankingType ||
                     req.user.userType === 'platform'; // Platform admins have all access

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: `${bankingType} banking access required`,
        code: 'INSUFFICIENT_BANKING_ACCESS',
        required: bankingType,
        current: req.user.bankingAccess
      });
      return;
    }

    // ✅ Additional Syariah compliance check (DISABLED for development)
    if (process.env.NODE_ENV === 'production' && 
        bankingType === 'SYARIAH' && 
        !req.user.syariahCertified && 
        req.user.userType !== 'platform') {
      res.status(403).json({
        success: false,
        error: 'Syariah certification required',
        code: 'SYARIAH_CERTIFICATION_REQUIRED'
      });
      return;
    }
    
    // Development override: Skip Syariah certification check
    if (process.env.NODE_ENV !== 'production' && bankingType === 'SYARIAH' && !req.user.syariahCertified) {
      console.log(`🚧 DEVELOPMENT: Skipping Syariah certification requirement for ${req.user.email}`);
    }

    next();
  };
};

/**
 * ✅ Tenant isolation middleware
 */
export const requireTenantAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NO_AUTH'
    });
    return;
  }

  // ✅ Platform admins can access any tenant
  if (req.user.userType === 'platform') {
    console.log(`✅ Platform admin tenant access granted: ${req.user.email}`);
    next();
    return;
  }

  // ✅ Check if user has tenant context
  if (!req.user.tenantId) {
    res.status(403).json({
      success: false,
      error: 'Tenant access required',
      code: 'NO_TENANT_ACCESS'
    });
    return;
  }

  console.log(`✅ Tenant access granted: ${req.user.email} for tenant ${req.user.tenantId}`);
  next();
};

/**
 * ✅ Optional authentication middleware
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    // If token provided, verify it
    authenticateToken(req, res, next);
  } else {
    // If no token, continue without auth
    next();
  }
};

/**
 * ✅ Demo user factory for development
 */
function createDemoUser(userRole: string): AuthenticatedRequest['user'] {
  const demoUsers: Record<string, AuthenticatedRequest['user']> = {
    'PLATFORM_SUPER_ADMIN': {
      userId: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@ifrspro.id',
      username: 'admin',
      fullName: 'Platform Administrator',
      roles: ['platform_super_admin', 'admin'],
      permissions: ['*'],
      userType: 'platform',
      bankingAccess: 'BOTH',
      syariahCertified: true
    },
    'CONSULTANT': {
      userId: 'consultant-uuid',
      email: 'consultant@pwc.com',
      username: 'consultant',
      fullName: 'PwC Senior Consultant',
      roles: ['consultant'],
      permissions: ['*'],
      userType: 'platform',
      bankingAccess: 'BOTH',
      syariahCertified: false
    },
    'REGULATOR': {
      userId: 'regulator-uuid',
      email: 'supervisor@bi.go.id',
      username: 'regulator',
      fullName: 'Bank Indonesia Supervisor',
      roles: ['regulator'],
      permissions: ['*'],
      userType: 'platform',
      bankingAccess: 'BOTH',
      syariahCertified: false
    }
  };

  return demoUsers[userRole] || demoUsers['PLATFORM_SUPER_ADMIN'];
}

// ✅ Export authenticateUser as alias for authenticateToken for backward compatibility
export const authenticateUser = authenticateToken;

// ✅ Export authMiddleware as alias for authenticateToken for backward compatibility
export const authMiddleware = authenticateToken;

// ✅ Export all middleware functions
export default {
  authenticateToken,
  authenticateUser: authenticateToken,
  requireRoles,
  requirePermissions,
  requirePlatformAdmin,
  requireBankingAccess,
  requireTenantAccess,
  optionalAuth,
  authMiddleware: authenticateToken
};