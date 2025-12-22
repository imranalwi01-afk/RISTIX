// packages/backend/src/api/controllers/auth.controller.ts
// ============================================================================
// 🩹 SURGICAL FIX: Complete auth controller with JWT refresh implementation
// ============================================================================
// ✅ FIXED: JWT malformed error handling
// ✅ FIXED: Missing refresh token implementation (was returning 501)
// ✅ FIXED: Uses your existing AuthenticationService
// ============================================================================

import { Request, Response } from 'express';
import { authenticationService } from '../../core/services/auth/authentication.service';
import { jwtService } from '../../utils/auth/jwt'; // ✅ Uses your existing JWT service
import { tenantService } from '../../core/services/tenant/tenant.service';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, tenantId, tenantSlug } = req.body;
    
    // 🩹 FIX: Support both tenantId and tenantSlug for compatibility
    const actualTenantId = tenantId || tenantSlug;

    console.log(`🔐 Login attempt: ${email}${actualTenantId ? ` (tenant: ${actualTenantId})` : ' (platform)'}`);

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
      return;
    }

    const result = await authenticationService.login({ 
      email, 
      password, 
      tenantId: actualTenantId 
    });

    if (!result.success) {
      console.log(`❌ Login failed for: ${email} - ${result.error}`);
      res.status(401).json({
        success: false,
        error: result.error || 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }

    console.log(`✅ Login successful: ${email}`);

    res.json({
      success: true,
      data: {
        accessToken: result.tokens?.accessToken,
        token: result.tokens?.accessToken, // ✅ Compatibility with frontend
        refreshToken: result.tokens?.refreshToken,
        expiresIn: 28800, // 8 hours
        user: result.user
      },
      message: 'Login successful'
    });

  } catch (error: any) {
    console.error('❌ Login controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      code: 'LOGIN_ERROR',
      message: error.message
    });
  }
};

// ✅ SURGICAL FIX: Complete refresh token implementation (was returning 501)
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
      return;
    }

    console.log('🔄 Token refresh attempt');

    // ✅ FIX: Use authentication service instead of directly using JWT service
    const result = await authenticationService.refreshToken(refreshToken);

    if (!result.success) {
      console.log('❌ Token refresh failed:', result.error);
      res.status(401).json({
        success: false,
        error: result.error || 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }

    console.log('✅ Token refresh successful');

    res.json({
      success: true,
      data: {
        accessToken: result.tokens?.accessToken,
        refreshToken: result.tokens?.refreshToken,
        token: result.tokens?.accessToken, // ✅ Compatibility
        expiresIn: 28800
      },
      message: 'Tokens refreshed successfully'
    });

  } catch (error: any) {
    console.error('❌ Refresh token controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      code: 'TOKEN_REFRESH_ERROR',
      message: error.message
    });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    console.log(`🚪 User logout: ${req.user.email}`);

    // ✅ You can implement session invalidation here if needed
    // await authenticationService.logout(req.user.sessionId);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error: any) {
    console.error('❌ Logout controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.userId,
          email: req.user.email,
          role: req.user.roles?.[0],
          roles: req.user.roles,
          tenantId: req.user.tenantId,
          tenantSlug: req.user.tenantSlug,
          permissions: req.user.permissions
        }
      },
      message: 'Profile retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Get profile controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile retrieval failed',
      code: 'PROFILE_ERROR'
    });
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromQuery = req.query.token as string;
    
    // Get token from Authorization header or query parameter
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (tokenFromQuery) {
      token = tokenFromQuery;
    }
    
    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Token required',
        code: 'TOKEN_REQUIRED',
        message: 'Token must be provided via Authorization header or query parameter'
      });
      return;
    }

    try {
      // Verify the token using the existing JWT service
      const decoded = jwtService.verifyAccessToken(token);
      
      if (!decoded) {
        throw new Error('Token verification failed');
      }

      console.log(`✅ Token verified for user: ${decoded.email}`);

      res.json({
        success: true,
        data: {
          valid: true,
          token: {
            userId: decoded.userId,
            email: decoded.email,
            tenantId: decoded.tenantId,
            tenantSlug: decoded.tenantSlug,
            roles: decoded.roles || [],
            permissions: decoded.permissions || [],
            exp: decoded.exp || 0,
            iat: decoded.iat || 0
          },
          expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined,
          issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : undefined
        },
        message: 'Token is valid'
      });

    } catch (jwtError: any) {
      console.log(`❌ Token verification failed: ${jwtError.message}`);
      
      // Determine the type of JWT error
      let errorCode = 'INVALID_TOKEN';
      let errorMessage = 'Token is invalid';
      
      if (jwtError.name === 'TokenExpiredError') {
        errorCode = 'TOKEN_EXPIRED';
        errorMessage = 'Token has expired';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorCode = 'MALFORMED_TOKEN';
        errorMessage = 'Token is malformed';
      } else if (jwtError.name === 'NotBeforeError') {
        errorCode = 'TOKEN_NOT_ACTIVE';
        errorMessage = 'Token is not active yet';
      }

      res.status(401).json({
        success: false,
        data: {
          valid: false,
          error: errorMessage,
          errorType: jwtError.name
        },
        error: errorMessage,
        code: errorCode,
        message: jwtError.message
      });
    }

  } catch (error: any) {
    console.error('❌ Token verification controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_ERROR',
      message: error.message
    });
  }
};

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      message: 'Auth service is healthy'
    });
  } catch (error: any) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      code: 'HEALTH_CHECK_ERROR'
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, tenantId, role, userType = 'tenant' } = req.body;

    console.log(`🔐 Registration attempt: ${email} (tenant: ${tenantId || 'platform'})`);

    // Validation
    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        error: 'Email, password, and full name are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Valid email address is required',
        code: 'INVALID_EMAIL'
      });
      return;
    }

    // Password validation (minimum 8 characters)
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
      return;
    }

    // The register method will handle duplicate checking internally
    // We'll proceed with registration and handle any conflicts

    // Create user using authentication service
    const user = {
      username: email.split('@')[0], // Generate username from email
      email,
      password,
      fullName,
      tenantId: tenantId || undefined,
      role: role || (tenantId ? 'TENANT_USER' : 'PLATFORM_USER')
    };

    const result = await authenticationService.register(user);

    if (!result.success) {
      console.log(`❌ Registration failed for: ${email} - ${result.error}`);
      res.status(500).json({
        success: false,
        error: result.error || 'Registration failed',
        code: 'REGISTRATION_FAILED'
      });
      return;
    }

    console.log(`✅ User registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user: result.user
      },
      message: 'User registered successfully',
      code: 'USER_CREATED'
    });

  } catch (error: any) {
    console.error('❌ Registration controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
      code: 'REGISTRATION_ERROR',
      details: error.message
    });
  }
};

export const getLoginData = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 Fetching login data (tenants) from database');

    // Get all active tenants using tenant service
    const tenantsResult = await tenantService.listTenants({
      includeInactive: false, // Only return active tenants
      limit: 50
    });

    // Transform tenant data to match frontend expectations
    const tenants = tenantsResult.data.map(tenant => ({
      id: tenant.id,
      slug: tenant.tenantSlug, // Frontend expects slug
      name: tenant.displayName,
      displayName: tenant.displayName,
      tenantName: tenant.tenantName,
      organizationName: tenant.organizationName,
      bankingType: tenant.bankingType,
      status: tenant.status,
      isActive: tenant.status === 'active', // Frontend expects isActive boolean
      subscriptionTier: tenant.subscriptionTier,
      featuresEnabled: tenant.featuresEnabled,
      complianceSettings: tenant.complianceSettings,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt
    }));

    console.log(`✅ Found ${tenants.length} active tenants`);

    res.json({
      success: true,
      data: {
        tenants: tenants,
        total: tenantsResult.total
      },
      message: 'Login data retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Get login data controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve login data',
      code: 'LOGIN_DATA_ERROR',
      details: error.message
    });
  }
};

export default { login, logout, refreshToken, getProfile, healthCheck, verifyToken, getLoginData, register };