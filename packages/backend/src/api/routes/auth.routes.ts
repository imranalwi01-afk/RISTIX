// packages/backend/src/api/routes/auth.routes.ts
// ✅ FIXED: Auth routes with correct controller import and error handling

import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.middleware';

// ✅ FIXED: Import auth controller with correct named exports including verifyToken and register
import { login, logout, refreshToken, getProfile, healthCheck, verifyToken, getLoginData, register } from '../controllers/auth.controller';

const authController = {
  login,
  logout,
  refreshToken,
  getProfile,
  healthCheck,
  verifyToken,
  getLoginData,
  register
};

const router = Router();

// ✅ Enhanced rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs (production-ready)
  message: {
    success: false,
    message: 'Rate limit exceeded. Please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
    details: 'Too many authentication attempts from this IP. Please wait before trying again.',
    retryAfter: 15 * 60 // Show retry time in seconds (15 minutes)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute for general endpoints (production-ready)
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
    retryAfter: 60 // Show retry time in seconds (1 minute)
  }
});

// ✅ Special rate limiter for token refresh (more lenient)
const refreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 refresh requests per minute (allow frequent token refresh)
  message: {
    success: false,
    message: 'Too many refresh attempts, please try again later',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
    retryAfter: 60 // Show retry time in seconds (1 minute)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Enhanced validation schemas
const loginSchema = z.object({
  email: z.string()
    .email('Valid email is required')
    .min(1, 'Email cannot be empty'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(255, 'Password too long'),
  tenantId: z.string().optional(),
  tenantSlug: z.string().optional(),
  bankingType: z.enum(['conventional', 'syariah', 'dual']).optional()
});

const refreshSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
    .max(2048, 'Refresh token too long')
});

const registerSchema = z.object({
  email: z.string()
    .email('Valid email is required')
    .min(1, 'Email cannot be empty')
    .max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(255, 'Password too long'),
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name too long'),
  tenantId: z.string().optional(),
  role: z.string().optional(),
  userType: z.enum(['tenant', 'platform']).optional()
});

// ✅ Validation middleware
const validateLogin = (req: Request, res: Response, next: Function) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: { 
        code: 'VALIDATION_ERROR', 
        details: error instanceof z.ZodError ? error.issues : error 
      }
    });
  }
};

const validateRefresh = (req: Request, res: Response, next: Function) => {
  try {
    refreshSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: {
        code: 'VALIDATION_ERROR',
        details: error instanceof z.ZodError ? error.issues : error
      }
    });
  }
};

const validateRegister = (req: Request, res: Response, next: Function) => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: {
        code: 'VALIDATION_ERROR',
        details: error instanceof z.ZodError ? error.issues : error
      }
    });
  }
};

// ✅ SAFE CONTROLLER METHOD WRAPPER
const safeController = (methodName: keyof typeof authController) => {
  return (req: Request, res: Response, next: Function) => {
    try {
      if (authController && typeof authController[methodName] === 'function') {
        (authController[methodName] as any)(req, res, next);
      } else {
        console.error(`❌ Auth controller method '${methodName}' not found`);
        res.status(503).json({
          success: false,
          error: `Auth method '${methodName}' not available`,
          code: 'METHOD_NOT_FOUND'
        });
      }
    } catch (error) {
      console.error(`❌ Error calling auth controller method '${methodName}':`, error);
      res.status(500).json({
        success: false,
        error: 'Controller method error',
        code: 'CONTROLLER_METHOD_ERROR'
      });
    }
  };
};

// ✅ PUBLIC ROUTES (No Authentication Required)

/**
 * POST /api/v1/auth/login
 * User authentication with multi-tenant support
 * ✅ Supports both platform and tenant users
 * ✅ Schema-aware authentication (handles employee_id vs department/position)
 */
router.post('/login', authLimiter, validateLogin, safeController('login'));

/**
 * POST /api/v1/auth/register
 * User registration endpoint
 * ✅ Validates user data and creates new accounts
 * ✅ Supports both platform and tenant user registration
 */
router.post('/register', authLimiter, validateRegister, safeController('register'));

/**
 * POST /api/v1/auth/refresh
 * Token refresh endpoint
 * ✅ Validates refresh tokens and issues new access tokens
 */
router.post('/refresh', refreshLimiter, validateRefresh, safeController('refreshToken'));

/**
 * GET /api/v1/auth/verify
 * Token verification endpoint (public for external services)
 * ✅ Verifies JWT tokens without requiring authentication middleware
 */
router.get('/verify', generalLimiter, safeController('verifyToken'));

/**
 * GET /api/v1/auth/status
 * Authentication service health and status
 * ✅ Public endpoint for service monitoring
 */
router.get('/status', safeController('healthCheck'));

/**
 * GET /api/v1/auth/login-data
 * Get login data including active tenants
 * ✅ Public endpoint for login form initialization
 */
router.get('/login-data', generalLimiter, safeController('getLoginData'));

// ✅ PROTECTED ROUTES (Authentication Required)

/**
 * POST /api/v1/auth/logout
 * User logout endpoint
 * ✅ Invalidates session and tokens
 */
router.post('/logout', authenticateToken, safeController('logout'));

/**
 * GET /api/v1/auth/me
 * Get current user information
 * ✅ Returns user profile from JWT token
 */
router.get('/me', authenticateToken, safeController('getProfile'));

/**
 * POST /api/v1/auth/change-password
 * Change user password (placeholder for future implementation)
 */
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: 'Password change not implemented yet',
    error: { code: 'NOT_IMPLEMENTED' }
  });
});

/**
 * POST /api/v1/auth/forgot-password
 * Forgot password endpoint (placeholder for future implementation)
 */
router.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: 'Password reset not implemented yet',
    error: { code: 'NOT_IMPLEMENTED' }
  });
});

// ✅ DEVELOPMENT/TESTING ROUTES (Only in development)
if (process.env.NODE_ENV === 'development') {
  /**
   * GET /api/v1/auth/test-users
   * Returns list of test users for development
   */
  router.get('/test-users', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        platform_users: [
          {
            email: 'admin@ifrspro.id',
            password: '1019181716',
            type: 'platform_admin',
            description: 'Platform Super Administrator'
          },
          {
            email: 'consultant@pwc.com',
            password: '1019181716',
            type: 'consultant',
            description: 'PwC Senior Consultant'
          },
          {
            email: 'supervisor@bi.go.id',
            password: '1019181716',
            type: 'regulator',
            description: 'Bank Indonesia Supervisor'
          }
        ],
        tenant_users: [
          {
            email: 'cro@dana.com',
            password: '1019181716',
            tenantId: 'dana',
            type: 'banking_cro',
            description: 'DANA Chief Risk Officer'
          },
          {
            email: 'ifrs.manager@dana.com',
            password: '1019181716',
            tenantId: 'dana',
            type: 'banking_manager',
            description: 'DANA IFRS Manager'
          },
          {
            email: 'cro@metrobank.com',
            password: '1019181716',
            tenantId: 'demo_conventional',
            type: 'banking_cro',
            description: 'Metro Bank Chief Risk Officer'
          },
          {
            email: 'cro@syariahbank.com',
            password: '1019181716',
            tenantId: 'demo_syariah',
            type: 'banking_cro',
            description: 'Syariah Bank Chief Risk Officer'
          },
          {
            email: 'dps@syariahbank.com',
            password: '1019181716',
            tenantId: 'demo_syariah',
            type: 'syariah_dps',
            description: 'Dewan Pengawas Syariah'
          }
        ]
      },
      message: 'Test users for development environment'
    });
  });

  /**
   * POST /api/v1/auth/test-login
   * Quick test login endpoint for development
   */
  router.post('/test-login', async (req: Request, res: Response) => {
    const { userType } = req.body;
    
    const testUsers: Record<string, any> = {
      platform_admin: { email: 'admin@ifrspro.id', password: '1019181716' },
      dana_cro: { email: 'cro@dana.com', password: '1019181716', tenantId: 'dana' },
      metro_cro: { email: 'cro@metrobank.com', password: '1019181716', tenantId: 'demo_conventional' },
      syariah_cro: { email: 'cro@syariahbank.com', password: '1019181716', tenantId: 'demo_syariah' }
    };
    
    const user = testUsers[userType];
    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid user type',
        availableTypes: Object.keys(testUsers)
      });
      return;
    }
    
    // Forward to real login endpoint
    req.body = user;
    safeController('login')(req, res, () => {});
  });
}

// ✅ Error handling middleware for auth routes
router.use((error: any, req: Request, res: Response, next: Function) => {
  console.error('❌ Auth route error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Authentication error',
    code: error.code || 'AUTH_ERROR',
    timestamp: new Date().toISOString()
  });
});

// ✅ Debug info on module load
console.log('✅ Auth routes loaded successfully');
console.log('🔍 Auth controller methods available:', Object.keys(authController || {}));

export default router;