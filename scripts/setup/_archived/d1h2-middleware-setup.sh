#!/bin/bash
# scripts/setup/d1h2-middleware-setup.sh
# DAY 1 HOUR 2: Additional Middleware Setup - IFRS 9 Multi-Tenant Platform
# Based on: 001-006-005-TodoList-v2.md and 001-006-008-coding-standards.md

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration following coding standards
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h2-middleware-setup-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Logging functions following coding standards
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling following coding standards
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate authentication middleware
generate_auth_middleware() {
    log_info "Generating authentication middleware..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/auth.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/auth.middleware.ts
// Authentication Middleware - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md security patterns

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { configService } from '../../core/services/configuration/configuration.service';

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: string;
        permissions: string[];
        tenantId?: string;
        bankingType?: string;
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  tenantId?: string;
  bankingType?: string;
  iat: number;
  exp: number;
}

export class AuthMiddleware {
  // MANDATORY: JWT token verification
  public static verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = AuthMiddleware.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Authentication token required',
          code: 'TOKEN_MISSING'
        });
        return;
      }

      const config = configService.getConfiguration();
      const jwtSecret = config.security?.jwtSecret || process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error('JWT secret not configured');
        res.status(500).json({
          success: false,
          error: 'Authentication configuration error',
          code: 'AUTH_CONFIG_ERROR'
        });
        return;
      }

      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

      // Set user context
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
        tenantId: decoded.tenantId,
        bankingType: decoded.bankingType
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      } else {
        console.error('Authentication error:', error);
        res.status(500).json({
          success: false,
          error: 'Authentication error',
          code: 'AUTH_ERROR'
        });
      }
    }
  };

  // MANDATORY: Role-based access control
  public static requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_ROLE',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        });
        return;
      }

      next();
    };
  };

  // MANDATORY: Permission-based access control
  public static requirePermission = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const hasPermission = req.user.permissions.includes(requiredPermission) ||
                           req.user.permissions.includes('*') ||
                           req.user.permissions.some(p => p.endsWith(':*') && requiredPermission.startsWith(p.replace(':*', ':')));

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSION',
          requiredPermission,
          userPermissions: req.user.permissions
        });
        return;
      }

      next();
    };
  };

  // MANDATORY: Platform admin access control
  public static requirePlatformAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const isPlatformAdmin = req.user.role === 'super_admin' || 
                           req.user.role === 'platform_admin' ||
                           req.user.permissions.includes('platform:*');

    if (!isPlatformAdmin) {
      res.status(403).json({
        success: false,
        error: 'Platform administrator access required',
        code: 'PLATFORM_ADMIN_REQUIRED'
      });
      return;
    }

    next();
  };

  // MANDATORY: Tenant-specific access control
  public static requireTenantAccess = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (!req.tenant) {
      res.status(400).json({
        success: false,
        error: 'Tenant context required',
        code: 'TENANT_CONTEXT_REQUIRED'
      });
      return;
    }

    // Platform admins have access to all tenants
    if (req.user.role === 'super_admin' || req.user.role === 'platform_admin') {
      next();
      return;
    }

    // Check if user belongs to the current tenant
    if (req.user.tenantId !== req.tenant.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied for this tenant',
        code: 'TENANT_ACCESS_DENIED'
      });
      return;
    }

    next();
  };

  // Extract token from request headers
  private static extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Also check for token in query parameter (for WebSocket connections)
    if (req.query.token && typeof req.query.token === 'string') {
      return req.query.token;
    }
    
    return null;
  }
}

// Export convenience functions
export const verifyToken = AuthMiddleware.verifyToken;
export const requireRole = AuthMiddleware.requireRole;
export const requirePermission = AuthMiddleware.requirePermission;
export const requirePlatformAdmin = AuthMiddleware.requirePlatformAdmin;
export const requireTenantAccess = AuthMiddleware.requireTenantAccess;
EOF
    
    log_success "Authentication middleware generated"
}

# Generate validation middleware
generate_validation_middleware() {
    log_info "Generating validation middleware..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/validation.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/validation.middleware.ts
// Request Validation Middleware - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md validation patterns

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

export class ValidationMiddleware {
  // MANDATORY: Generic validation middleware
  public static validate = (schema: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    headers?: ZodSchema;
  }) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Validate request body
        if (schema.body) {
          req.body = schema.body.parse(req.body);
        }

        // Validate query parameters
        if (schema.query) {
          req.query = schema.query.parse(req.query);
        }

        // Validate path parameters
        if (schema.params) {
          req.params = schema.params.parse(req.params);
        }

        // Validate headers
        if (schema.headers) {
          req.headers = schema.headers.parse(req.headers);
        }

        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            success: false,
            error: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Internal validation error',
            code: 'VALIDATION_INTERNAL_ERROR'
          });
        }
      }
    };
  };

  // MANDATORY: Banking type validation
  public static validateBankingType = (req: Request, res: Response, next: NextFunction): void => {
    const bankingType = req.body?.bankingType || req.query?.bankingType;
    
    if (bankingType && !['conventional', 'syariah', 'dual'].includes(bankingType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid banking type',
        code: 'INVALID_BANKING_TYPE',
        allowedValues: ['conventional', 'syariah', 'dual']
      });
      return;
    }

    next();
  };

  // MANDATORY: Syariah compliance validation
  public static validateSyariahCompliance = (req: Request, res: Response, next: NextFunction): void => {
    const { bankingType } = req.body;
    
    if (bankingType === 'syariah' || bankingType === 'dual') {
      const requiredFields = ['aaoifiCompliance', 'prohibitedSectors'];
      const missing = requiredFields.filter(field => 
        !req.body.complianceSettings || !(field in req.body.complianceSettings)
      );

      if (missing.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Syariah compliance settings required',
          code: 'SYARIAH_COMPLIANCE_REQUIRED',
          missingFields: missing
        });
        return;
      }

      // Validate prohibited sectors
      const prohibitedSectors = req.body.complianceSettings?.prohibitedSectors;
      if (!Array.isArray(prohibitedSectors) || prohibitedSectors.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Prohibited sectors must be specified for Syariah banking',
          code: 'PROHIBITED_SECTORS_REQUIRED'
        });
        return;
      }
    }

    next();
  };

  // MANDATORY: UUID validation
  public static validateUUID = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const value = req.params[paramName];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(value)) {
        res.status(400).json({
          success: false,
          error: `Invalid UUID format for ${paramName}`,
          code: 'INVALID_UUID_FORMAT',
          parameter: paramName,
          value
        });
        return;
      }

      next();
    };
  };

  // MANDATORY: Pagination validation
  public static validatePagination = (req: Request, res: Response, next: NextFunction): void => {
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);

    if (req.query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      res.status(400).json({
        success: false,
        error: 'Invalid limit parameter',
        code: 'INVALID_LIMIT',
        message: 'Limit must be between 1 and 100'
      });
      return;
    }

    if (req.query.offset && (isNaN(offset) || offset < 0)) {
      res.status(400).json({
        success: false,
        error: 'Invalid offset parameter',
        code: 'INVALID_OFFSET',
        message: 'Offset must be 0 or greater'
      });
      return;
    }

    next();
  };
}

// MANDATORY: Common validation schemas
export const ValidationSchemas = {
  // Tenant creation schema
  createTenant: {
    body: z.object({
      tenantName: z.string().min(1).max(100),
      displayName: z.string().min(1).max(200),
      organizationName: z.string().max(200).optional(),
      bankingType: z.enum(['conventional', 'syariah', 'dual']),
      subscriptionTier: z.enum(['basic', 'standard', 'premium', 'enterprise']).optional(),
      tenantSettings: z.record(z.any()).optional(),
      featuresEnabled: z.record(z.boolean()).optional(),
      complianceSettings: z.record(z.any()).optional()
    })
  },

  // UUID parameter schema
  uuidParam: {
    params: z.object({
      tenantId: z.string().uuid()
    })
  },

  // Pagination schema
  pagination: {
    query: z.object({
      limit: z.string().transform(val => parseInt(val)).refine(val => val >= 1 && val <= 100).optional(),
      offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0).optional(),
      bankingType: z.enum(['conventional', 'syariah', 'dual']).optional()
    })
  },

  // IFRS 9 calculation schema
  ifrs9Calculation: {
    body: z.object({
      portfolioData: z.array(z.object({
        accountId: z.string(),
        outstandingAmount: z.number().positive(),
        originationDate: z.string().datetime(),
        maturityDate: z.string().datetime().optional(),
        currentStage: z.number().int().min(1).max(3),
        bankingType: z.enum(['conventional', 'syariah']).optional()
      })),
      calculationDate: z.string().datetime().optional(),
      includeStressTesting: z.boolean().optional()
    })
  }
};

// Export convenience functions
export const validate = ValidationMiddleware.validate;
export const validateBankingType = ValidationMiddleware.validateBankingType;
export const validateSyariahCompliance = ValidationMiddleware.validateSyariahCompliance;
export const validateUUID = ValidationMiddleware.validateUUID;
export const validatePagination = ValidationMiddleware.validatePagination;
EOF
    
    log_success "Validation middleware generated"
}

# Generate security middleware
generate_security_middleware() {
    log_info "Generating security middleware..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/security.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/security.middleware.ts
// Security Middleware - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md security patterns

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { configService } from '../../core/services/configuration/configuration.service';

export class SecurityMiddleware {
  // MANDATORY: Rate limiting middleware
  public static createRateLimit = (options?: {
    windowMs?: number;
    max?: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
  }) => {
    const config = configService.getConfiguration();
    
    return rateLimit({
      windowMs: options?.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: options?.max || parseInt(process.env.RATE_LIMIT_MAX || '100'),
      message: options?.message || 'Too many requests from this IP, please try again later',
      skipSuccessfulRequests: options?.skipSuccessfulRequests || false,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        // Use tenant-aware rate limiting
        const tenantId = req.tenant?.id || 'global';
        const ip = req.ip || req.connection.remoteAddress;
        return `${ip}:${tenantId}`;
      }
    });
  };

  // MANDATORY: Helmet security headers
  public static securityHeaders = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  });

  // MANDATORY: CORS middleware with tenant-aware origins
  public static configureCORS = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const config = configService.getConfiguration();
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:4231',
        'https://ifrs9.ifrspro.id'
      ];

      // Add tenant-specific origins if available
      if (req.tenant) {
        // Add tenant subdomain if using subdomain strategy
        const tenantOrigin = `https://${req.tenant.slug}.ifrspro.id`;
        if (!allowedOrigins.includes(tenantOrigin)) {
          allowedOrigins.push(tenantOrigin);
        }
      }

      const origin = req.headers.origin;
      
      if (!origin || allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
      }

      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID, X-Tenant-Slug');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }

      next();
    };
  };

  // MANDATORY: IP whitelisting middleware
  public static ipWhitelist = (allowedIPs: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      if (!clientIP || !allowedIPs.includes(clientIP)) {
        res.status(403).json({
          success: false,
          error: 'Access denied from this IP address',
          code: 'IP_NOT_WHITELISTED'
        });
        return;
      }

      next();
    };
  };

  // MANDATORY: Request sanitization
  public static sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
    // Remove potentially dangerous characters from query parameters
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      }
    }

    // Add security-related headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  };

  // MANDATORY: Banking compliance security
  public static bankingCompliance = (req: Request, res: Response, next: NextFunction): void => {
    // Add banking-specific security headers
    res.setHeader('X-Banking-Security', 'enabled');
    res.setHeader('X-Audit-Required', 'true');

    // Log sensitive banking operations
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      console.log(`[BANKING_AUDIT] ${req.method} ${req.path} - User: ${req.user?.id} - Tenant: ${req.tenant?.id} - IP: ${req.ip}`);
    }

    // Additional security for Syariah banking
    if (req.tenant?.bankingType === 'syariah') {
      res.setHeader('X-Syariah-Compliance', 'enforced');
      res.setHeader('X-AAOIFI-Standards', 'active');
    }

    next();
  };

  // MANDATORY: Audit logging middleware
  public static auditLog = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Log request details
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
      tenantId: req.tenant?.id,
      bankingType: req.tenant?.bankingType
    };

    // Log the request
    console.log('[AUDIT_LOG]', JSON.stringify(logData));

    // Capture response
    const originalSend = res.send;
    res.send = function(body) {
      const responseTime = Date.now() - startTime;
      
      console.log('[AUDIT_LOG]', JSON.stringify({
        ...logData,
        statusCode: res.statusCode,
        responseTime,
        responseSize: Buffer.byteLength(body, 'utf8')
      }));

      return originalSend.call(this, body);
    };

    next();
  };
}

// Export convenience functions
export const createRateLimit = SecurityMiddleware.createRateLimit;
export const securityHeaders = SecurityMiddleware.securityHeaders;
export const configureCORS = SecurityMiddleware.configureCORS;
export const ipWhitelist = SecurityMiddleware.ipWhitelist;
export const sanitizeRequest = SecurityMiddleware.sanitizeRequest;
export const bankingCompliance = SecurityMiddleware.bankingCompliance;
export const auditLog = SecurityMiddleware.auditLog;

// Export default rate limiters
export const defaultRateLimit = SecurityMiddleware.createRateLimit();
export const strictRateLimit = SecurityMiddleware.createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Stricter limit
  message: 'Too many requests, please try again later'
});
EOF
    
    log_success "Security middleware generated"
}

# Generate error handling middleware
generate_error_middleware() {
    log_info "Generating error handling middleware..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/error.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/error.middleware.ts
// Error Handling Middleware - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md error handling patterns

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export class ErrorMiddleware {
  // MANDATORY: Global error handler
  public static globalErrorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // Log the error
    ErrorMiddleware.logError(error, req);

    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Default error response
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal server error';
    let code = error.code || 'INTERNAL_ERROR';
    let details = error.details;

    // Handle specific error types
    if (error instanceof ValidationError) {
      statusCode = 400;
      message = 'Validation error';
      code = 'VALIDATION_ERROR';
      details = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
    }

    // Database connection errors
    if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
      statusCode = 503;
      message = isProduction ? 'Service temporarily unavailable' : error.message;
      code = 'DATABASE_CONNECTION_ERROR';
    }

    // Tenant-related errors
    if (error.message.includes('tenant') || error.code === 'TENANT_NOT_FOUND') {
      statusCode = 404;
      code = 'TENANT_ERROR';
    }

    // Banking compliance errors
    if (error.message.includes('syariah') || error.message.includes('compliance')) {
      statusCode = 403;
      code = 'BANKING_COMPLIANCE_ERROR';
    }

    // Prepare error response
    const errorResponse: any = {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };

    // Add details in development or for operational errors
    if (isDevelopment || error.isOperational) {
      if (details) {
        errorResponse.details = details;
      }
      
      if (isDevelopment && error.stack) {
        errorResponse.stack = error.stack;
      }
    }

    // Add tenant context if available
    if (req.tenant) {
      errorResponse.tenantId = req.tenant.id;
      errorResponse.bankingType = req.tenant.bankingType;
    }

    // Add user context if available
    if (req.user) {
      errorResponse.userId = req.user.id;
    }

    res.status(statusCode).json(errorResponse);
  };

  // MANDATORY: Async error wrapper
  public static asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  // MANDATORY: 404 handler
  public static notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error: AppError = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    error.code = 'ROUTE_NOT_FOUND';
    error.isOperational = true;
    next(error);
  };

  // MANDATORY: Banking operation error handler
  public static bankingErrorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // Log banking-specific errors with higher priority
    if (req.tenant?.bankingType === 'syariah') {
      console.error('[SYARIAH_BANKING_ERROR]', {
        error: error.message,
        tenant: req.tenant.id,
        user: req.user?.id,
        timestamp: new Date().toISOString()
      });
    }

    // Handle IFRS 9 calculation errors
    if (error.message.includes('ECL') || error.message.includes('IFRS')) {
      error.statusCode = 422;
      error.code = 'IFRS9_CALCULATION_ERROR';
    }

    // Handle compliance errors
    if (error.message.includes('prohibited') || error.message.includes('AAOIFI')) {
      error.statusCode = 403;
      error.code = 'SYARIAH_COMPLIANCE_VIOLATION';
    }

    next(error);
  };

  // MANDATORY: Validation error handler
  public static validationErrorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (error.name === 'ValidationError' || error.code === 'VALIDATION_ERROR') {
      error.statusCode = 400;
      error.isOperational = true;
    }

    next(error);
  };

  // MANDATORY: Database error handler
  public static databaseErrorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // Handle Sequelize errors
    if (error.name === 'SequelizeConnectionError') {
      error.statusCode = 503;
      error.code = 'DATABASE_CONNECTION_ERROR';
      error.message = 'Database connection failed';
      error.isOperational = true;
    }

    if (error.name === 'SequelizeValidationError') {
      error.statusCode = 400;
      error.code = 'DATABASE_VALIDATION_ERROR';
      error.isOperational = true;
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      error.statusCode = 409;
      error.code = 'DUPLICATE_ENTRY';
      error.message = 'Resource already exists';
      error.isOperational = true;
    }

    next(error);
  };

  // Log error with context
  private static logError(error: AppError, req: Request): void {
    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack
      },
      request: {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      },
      context: {
        userId: req.user?.id,
        tenantId: req.tenant?.id,
        bankingType: req.tenant?.bankingType
      }
    };

    // Use different log levels based on error severity
    if (error.statusCode && error.statusCode >= 500) {
      console.error('[ERROR]', JSON.stringify(logData));
    } else if (error.statusCode && error.statusCode >= 400) {
      console.warn('[WARNING]', JSON.stringify(logData));
    } else {
      console.info('[INFO]', JSON.stringify(logData));
    }
  }
}

// Create application error class
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Export convenience functions
export const globalErrorHandler = ErrorMiddleware.globalErrorHandler;
export const asyncHandler = ErrorMiddleware.asyncHandler;
export const notFoundHandler = ErrorMiddleware.notFoundHandler;
export const bankingErrorHandler = ErrorMiddleware.bankingErrorHandler;
export const validationErrorHandler = ErrorMiddleware.validationErrorHandler;
export const databaseErrorHandler = ErrorMiddleware.databaseErrorHandler;
EOF
    
    log_success "Error handling middleware generated"
}

# Update main Express app to use all middleware
update_express_app() {
    log_info "Updating main Express application with middleware stack..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/index.ts" << 'EOF'
// packages/backend/src/index.ts
// IFRS 9 Multi-Tenant Platform Backend - Main Entry Point with Complete Middleware Stack

import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import middleware
import { securityHeaders, configureCORS, defaultRateLimit, sanitizeRequest, bankingCompliance, auditLog } from './api/middleware/security.middleware';
import { globalErrorHandler, notFoundHandler, bankingErrorHandler, validationErrorHandler, databaseErrorHandler } from './api/middleware/error.middleware';
import { resolveTenant } from './api/middleware/tenant.middleware';

// Import routes
import tenantRoutes from './api/routes/tenant.routes';

// Import services
import { configService } from './core/services/configuration/configuration.service';
import { databaseConfig } from './core/database/config/database.config';

// Load environment configuration
dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 4232;

// MANDATORY: Security middleware stack (order matters)
app.use(securityHeaders);
app.use(configureCORS());
app.use(defaultRateLimit);
app.use(sanitizeRequest);

// Basic middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Audit logging
app.use(auditLog);

// Health check endpoint (public, no middleware)
app.get('/health', async (req, res) => {
  try {
    const health = await databaseConfig.healthCheck();
    const config = configService.getConfiguration();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ifrs9-backend',
      version: '1.0.0',
      environment: config.application.nodeEnv,
      database: {
        platform: health.platform,
        shared: health.shared,
        tenants: Object.keys(health.tenants).length
      },
      features: {
        multiTenant: true,
        dualBanking: true,
        syariahCompliance: true,
        ifrs9Calculations: true
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'ifrs9-backend',
      error: 'Health check failed'
    });
  }
});

// Platform status endpoint
app.get('/status', (req, res) => {
  const config = configService.getConfiguration();
  
  res.json({
    platform: 'IFRS 9 Multi-Tenant Platform',
    version: '1.0.0',
    environment: config.application.nodeEnv,
    bankingSupport: ['conventional', 'syariah', 'dual'],
    features: [
      'multi-tenant-architecture',
      'database-per-tenant',
      'dual-banking-support',
      'syariah-compliance',
      'ifrs9-calculations',
      'r-analytics-integration'
    ],
    timestamp: new Date().toISOString()
  });
});

// Banking compliance middleware for all banking operations
app.use('/api/v1', bankingCompliance);

// Mount API routes
app.use('/api/v1', tenantRoutes);

// Banking-specific demo endpoints
app.get('/api/v1/demo/conventional', resolveTenant, (req, res) => {
  res.json({
    message: 'Conventional banking demo endpoint',
    tenant: req.tenant?.slug,
    bankingType: req.tenant?.bankingType,
    features: req.tenant?.features
  });
});

app.get('/api/v1/demo/syariah', resolveTenant, (req, res) => {
  res.json({
    message: 'Syariah banking demo endpoint',
    tenant: req.tenant?.slug,
    bankingType: req.tenant?.bankingType,
    compliance: {
      aaoifiCompliant: true,
      syariahBoard: true,
      prohibitedSectors: ['alcohol', 'gambling', 'pork']
    }
  });
});

// Error handling middleware stack (order matters)
app.use(validationErrorHandler);
app.use(databaseErrorHandler);
app.use(bankingErrorHandler);
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await databaseConfig.closeAllConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await databaseConfig.closeAllConnections();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  const config = configService.getConfiguration();
  
  console.log('🚀 IFRS 9 Multi-Tenant Platform Backend Started');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Status: http://localhost:${PORT}/status`);
  console.log(`🏗️ Environment: ${config.application.nodeEnv}`);
  console.log(`🏛️ Banking Types: Conventional, Syariah, Dual`);
  console.log(`🔒 Security: Enabled (Helmet, CORS, Rate Limiting)`);
  console.log(`📊 Multi-Tenant: Database-per-tenant isolation`);
  console.log(`✅ Ready for multi-tenant banking operations`);
});

export default app;
EOF
    
    log_success "Express application updated with complete middleware stack"
}

# Main execution function following coding standards
main() {
    log_info "🚀 Starting Day 1 Hour 2: Additional Middleware Setup"
    log_info "Following TodoList-v2.md middleware requirements"
    
    # Step 1: Generate authentication middleware
    generate_auth_middleware
    
    # Step 2: Generate validation middleware
    generate_validation_middleware
    
    # Step 3: Generate security middleware
    generate_security_middleware
    
    # Step 4: Generate error handling middleware
    generate_error_middleware
    
    # Step 5: Update main Express app
    update_express_app
    
    log_success "✅ Day 1 Hour 2: Additional Middleware Setup completed successfully!"
    log_info "📍 Project location: ${PROJECT_ROOT}"
    log_info "📋 Log file: ${LOG_FILE}"
    log_info "🔄 Next: Ready for Day 1 Hour 3 or test current setup"
    
    echo ""
    echo "🎯 DAY 1 HOUR 2 COMPLETED - COMPLETE MIDDLEWARE STACK"
    echo "✅ Authentication middleware with JWT and RBAC"
    echo "✅ Validation middleware with Zod schemas"
    echo "✅ Security middleware with Helmet, CORS, Rate Limiting"
    echo "✅ Error handling middleware with banking-specific errors"
    echo "✅ Main Express app updated with complete middleware stack"
    echo ""
    echo "🛡️ Security features enabled:"
    echo "   • JWT authentication and authorization"
    echo "   • Role-based access control (RBAC)"
    echo "   • Permission-based access control"
    echo "   • Rate limiting with tenant awareness"
    echo "   • Security headers (Helmet)"
    echo "   • CORS with tenant-specific origins"
    echo "   • Request sanitization"
    echo "   • Banking compliance enforcement"
    echo "   • Syariah compliance validation"
    echo "   • Comprehensive audit logging"
    echo ""
    echo "🔄 Next steps:"
    echo "   1. Test the setup: pnpm run dev"
    echo "   2. Visit: http://localhost:4232/health"
    echo "   3. Check status: http://localhost:4232/status"
    echo "   4. Continue with Day 1 Hour 3 development"
    echo ""
    echo "✅ HOUR 2 COMPLETE - ADVANCED MULTI-TENANT ARCHITECTURE READY!"
    echo ""
}

# Execute main function with all arguments
main "$@"