// packages/backend/src/api/controllers/auth.controller.ts
// ✅ SURGICAL FIX: Unified controller using corrected authentication service
// 🔧 CHANGES: Updated to use authenticationService consistently with schema fixes

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { authenticationService } from '../../core/services/auth/authentication.service';
import logger from '../../config/logger';

// ✅ Helper function to safely extract error information
const getErrorInfo = (error: unknown): { message: string; stack?: string } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack
    };
  }
  return {
    message: typeof error === 'string' ? error : 'Unknown error occurred'
  };
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, tenantId, tenantSlug } = req.body;

    // ✅ Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
      return;
    }

    // ✅ Log authentication attempt
    console.log(`🔐 Login attempt: ${email}${tenantId ? ` (tenant: ${tenantId})` : ' (platform)'}`);

    // ✅ Use the corrected authentication service
    const result = await authenticationService.login({ 
      email, 
      password, 
      tenantId: tenantId || tenantSlug // Support both field names
    });

    if (!result.success) {
      console.log(`❌ Authentication failed: ${email} - ${result.error}`);
      res.status(401).json({
        success: false,
        error: result.error || 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // ✅ Log successful authentication
    console.log(`✅ Authentication successful: ${email} (${result.user?.userType})`);

    // ✅ Return success response with proper structure
    res.json({
      success: true,
      data: {
        token: result.tokens?.accessToken,
        refreshToken: result.tokens?.refreshToken,
        user: {
          id: result.user?.id,
          email: result.user?.email,
          username: result.user?.username,
          fullName: result.user?.fullName,
          role: result.user?.role,
          roles: [result.user?.role],
          permissions: result.user?.permissions,
          tenantId: result.user?.tenantId,
          tenantSlug: result.user?.tenantSlug,
          bankingType: result.user?.bankingType,
          userType: result.user?.userType
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    const errorInfo = getErrorInfo(error);
    console.error('❌ Login controller error:', errorInfo.message);
    
    res.status(500).json({
      success: false,
      error: 'Login failed',
      code: 'LOGIN_ERROR'
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

    // ✅ Use authentication service logout
    const success = await authenticationService.logout(
      req.user.sessionId || req.jwtPayload?.sessionId || 'unknown',
      req.user.userId
    );

    console.log(`🔓 User logout: ${req.user.email} (success: ${success})`);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    const errorInfo = getErrorInfo(error);
    console.error('❌ Logout controller error:', errorInfo.message);
    
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
};

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

    // ✅ Use authentication service refresh
    const result = await authenticationService.refreshToken(refreshToken);

    if (!result.success) {
      res.status(401).json({
        success: false,
        error: result.error || 'Token refresh failed',
        code: 'TOKEN_REFRESH_FAILED'
      });
      return;
    }

    console.log(`🔄 Token refreshed successfully`);

    res.json({
      success: true,
      data: {
        token: result.tokens?.accessToken,
        refreshToken: result.tokens?.refreshToken
      },
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    const errorInfo = getErrorInfo(error);
    console.error('❌ Refresh token controller error:', errorInfo.message);
    
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      code: 'TOKEN_REFRESH_ERROR'
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

    // ✅ Return user profile from JWT payload
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.userId,
          email: req.user.email,
          username: req.user.username,
          fullName: req.user.fullName,
          role: req.user.roles?.[0] || 'user',
          roles: req.user.roles,
          permissions: req.user.permissions,
          tenantId: req.user.tenantId,
          userType: req.user.userType,
          bankingAccess: req.user.bankingAccess,
          syariahCertified: req.user.syariahCertified
        }
      },
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    const errorInfo = getErrorInfo(error);
    console.error('❌ Get profile controller error:', errorInfo.message);
    
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
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authorization token provided',
        code: 'NO_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // ✅ Use authentication service to verify token
    const user = await authenticationService.verifyToken(token);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType,
          tenantId: user.tenantId
        }
      },
      message: 'Token is valid'
    });

  } catch (error) {
    const errorInfo = getErrorInfo(error);
    console.error('❌ Token verification error:', errorInfo.message);
    
    res.status(500).json({
      success: false,
      error: 'Token verification failed',
      code: 'VERIFICATION_ERROR'
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
        environment: process.env.NODE_ENV || 'development',
        features: {
          multi_tenant: true,
          dual_banking: true,
          schema_alignment: true,
          real_database: true
        }
      },
      message: 'Auth service is healthy'
    });
  } catch (error) {
    const errorInfo = getErrorInfo(error);
    console.error('❌ Health check error:', errorInfo.message);
    
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      code: 'HEALTH_CHECK_ERROR'
    });
  }
};

// ✅ Export all functions
export default { 
  login, 
  logout, 
  refreshToken, 
  getProfile, 
  verifyToken, 
  healthCheck 
};