#!/bin/bash
# scripts/setup/d1h3-security-middleware.sh
# IFRS9 Platform - Generate Security Middleware Components

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h3-security-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate Security Middleware
generate_security_middleware() {
    log_info "Generating Security Middleware..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/security.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/security.middleware.ts
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

export interface SecurityConfig {
  corsOrigins: string[];
  trustProxy: boolean;
  contentSecurityPolicy: boolean;
  hsts: boolean;
  noSniff: boolean;
  xssFilter: boolean;
  frameOptions: string;
  compression: boolean;
}

export class SecurityMiddleware {
  constructor() {}

  /**
   * Complete security middleware stack
   */
  security() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Apply security headers with Helmet
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
              fontSrc: ["'self'", "fonts.gstatic.com"],
              imgSrc: ["'self'", "data:", "https:"],
              scriptSrc: ["'self'"],
              connectSrc: ["'self'"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"]
            }
          },
          
          hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
          },
          
          noSniff: true,
          xssFilter: true,
          
          frameOptions: {
            action: 'deny'
          },
          
          crossOriginEmbedderPolicy: false // Disable for better compatibility
        })(req, res, (err) => {
          if (err) {
            console.error('Helmet security middleware error:', err.message);
          }
        });

        next();
        
      } catch (error) {
        console.error('Security middleware error:', error);
        next(error);
      }
    };
  }

  /**
   * CORS middleware with tenant-aware origins
   */
  cors() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const corsOptions = {
          origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);
            
            // Default allowed origins
            const allowedOrigins = [
              'http://localhost:4231',
              'http://localhost:3000',
              'https://ifrspro.id',
              'https://admin.ifrspro.id'
            ];
            
            // Check if origin is in allowed list
            if (allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            
            // Tenant-specific origin check
            const tenantSlug = req.get('X-Tenant-Slug') || req.query.tenantSlug as string;
            if (tenantSlug) {
              const tenantOrigin = `https://${tenantSlug}.ifrspro.id`;
              if (origin === tenantOrigin) {
                return callback(null, true);
              }
            }
            
            console.warn('CORS violation:', origin);
            callback(new Error('Not allowed by CORS'), false);
          },
          
          credentials: true,
          
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
          
          allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Tenant-Slug',
            'X-Tenant-ID',
            'X-Banking-Type',
            'X-Request-ID',
            'X-API-Version',
            'Cache-Control',
            'Pragma'
          ],
          
          exposedHeaders: [
            'X-Total-Count',
            'X-Page-Count',
            'X-Current-Page',
            'X-Rate-Limit-Remaining',
            'X-Rate-Limit-Reset'
          ],
          
          maxAge: 86400 // 24 hours
        };

        cors(corsOptions)(req, res, next);
        
      } catch (error) {
        console.error('CORS middleware error:', error);
        next(error);
      }
    };
  }

  /**
   * Compression middleware
   */
  compression() {
    return compression({
      level: 6, // Good balance between compression ratio and speed
      threshold: 1024, // Only compress responses larger than 1KB
      filter: (req: Request, res: Response) => {
        // Don't compress responses if the request is from a proxy
        if (req.headers['x-no-compression']) {
          return false;
        }
        
        // Use compression filter function
        return compression.filter(req, res);
      }
    });
  }

  /**
   * Request sanitization middleware
   */
  sanitize() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Sanitize request body
        if (req.body && typeof req.body === 'object') {
          req.body = this.sanitizeObject(req.body);
        }
        
        // Sanitize query parameters
        if (req.query && typeof req.query === 'object') {
          req.query = this.sanitizeObject(req.query);
        }
        
        // Sanitize URL parameters
        if (req.params && typeof req.params === 'object') {
          req.params = this.sanitizeObject(req.params);
        }

        next();
        
      } catch (error) {
        console.error('Sanitization error:', error);
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          code: 'INVALID_REQUEST_DATA'
        });
      }
    };
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Remove potentially dangerous headers
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');
      
      // Add custom security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      // Add cache control for sensitive endpoints
      if (req.path.includes('/api/') && !req.path.includes('/public/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
      }

      next();
    };
  }

  /**
   * Request ID middleware
   */
  requestId() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const requestId = req.get('X-Request-ID') || this.generateRequestId();
      req.headers['x-request-id'] = requestId;
      res.setHeader('X-Request-ID', requestId);
      next();
    };
  }

  // Private helper methods
  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? this.sanitizeString(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[this.sanitizeString(key)] = this.sanitizeObject(value);
    }
    return sanitized;
  }

  private sanitizeString(str: string): string {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>]/g, '') // Remove < and > characters
      .trim();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
EOF

    log_success "Security Middleware generated successfully"
}

# Generate Rate Limiting Middleware
generate_rate_limit_middleware() {
    log_info "Generating Rate Limiting Middleware..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/rate-limit.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/rate-limit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export class RateLimitMiddleware {
  constructor() {}

  /**
   * General API rate limiting
   */
  generalLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      
      keyGenerator: (req: Request) => {
        return this.getClientIdentifier(req);
      }
    });
  }

  /**
   * Authentication endpoint rate limiting (stricter)
   */
  authLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Limit each IP to 10 login attempts per windowMs
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      
      keyGenerator: (req: Request) => {
        // Combine IP and email for more granular control
        const identifier = this.getClientIdentifier(req);
        const email = req.body?.email || '';
        return `${identifier}:${email}`;
      },
      
      skipSuccessfulRequests: true // Only count failed attempts
    });
  }

  /**
   * Token refresh rate limiting
   */
  tokenLimit() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // Limit each IP to 10 token refresh requests per minute
      message: {
        success: false,
        error: 'Too many token refresh attempts',
        code: 'TOKEN_RATE_LIMIT_EXCEEDED',
        retryAfter: '1 minute'
      },
      standardHeaders: true,
      legacyHeaders: false,
      
      keyGenerator: (req: Request) => {
        return this.getClientIdentifier(req);
      }
    });
  }

  // Private helper methods
  private getClientIdentifier(req: Request): string {
    // Try to get user ID if authenticated
    const authReq = req as any;
    if (authReq.user?.id) {
      return `user:${authReq.user.id}`;
    }
    
    // Fall back to IP address
    const ip = req.headers['x-forwarded-for'] as string ||
               req.headers['x-real-ip'] as string ||
               req.connection.remoteAddress ||
               req.socket.remoteAddress ||
               req.ip ||
               '0.0.0.0';
    
    return `ip:${ip.split(',')[0].trim()}`;
  }
}
EOF

    log_success "Rate Limiting Middleware generated successfully"
}

# Generate Validation Middleware
generate_validation_middleware() {
    log_info "Generating Validation Middleware..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/validation.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
  skipOnError?: boolean;
  transformData?: boolean;
}

export class ValidationMiddleware {
  constructor() {}

  /**
   * Generic validation middleware
   */
  validate(options: ValidationOptions) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const errors: any[] = [];

        // Validate request body
        if (options.body) {
          try {
            const result = options.body.parse(req.body);
            if (options.transformData) {
              req.body = result;
            }
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push({
                location: 'body',
                errors: this.formatZodErrors(error)
              });
            }
          }
        }

        // Validate query parameters
        if (options.query) {
          try {
            const result = options.query.parse(req.query);
            if (options.transformData) {
              req.query = result;
            }
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push({
                location: 'query',
                errors: this.formatZodErrors(error)
              });
            }
          }
        }

        // Validate URL parameters
        if (options.params) {
          try {
            const result = options.params.parse(req.params);
            if (options.transformData) {
              req.params = result;
            }
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push({
                location: 'params',
                errors: this.formatZodErrors(error)
              });
            }
          }
        }

        // Validate headers
        if (options.headers) {
          try {
            options.headers.parse(req.headers);
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push({
                location: 'headers',
                errors: this.formatZodErrors(error)
              });
            }
          }
        }

        if (errors.length > 0) {
          if (!options.skipOnError) {
            res.status(400).json({
              success: false,
              error: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: errors
            });
            return;
          }
        }

        next();

      } catch (error) {
        console.error('Validation middleware error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal validation error',
          code: 'VALIDATION_INTERNAL_ERROR'
        });
      }
    };
  }

  /**
   * Simple request validation for common scenarios
   */
  validateRequest() {
    return this.validate({
      transformData: true,
      skipOnError: false
    });
  }

  /**
   * Tenant-specific validation
   */
  validateTenantContext() {
    const tenantSchema = z.object({
      'x-tenant-slug': z.string().min(1).optional(),
      'x-tenant-id': z.string().uuid().optional()
    });

    return this.validate({
      headers: tenantSchema,
      skipOnError: true
    });
  }

  /**
   * Banking type validation
   */
  validateBankingType() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as any;
        const bankingType = req.get('X-Banking-Type') || req.query.bankingType;
        
        if (bankingType && !['CONVENTIONAL', 'SYARIAH'].includes(bankingType as string)) {
          res.status(400).json({
            success: false,
            error: 'Invalid banking type',
            code: 'INVALID_BANKING_TYPE',
            details: {
              provided: bankingType,
              allowed: ['CONVENTIONAL', 'SYARIAH']
            }
          });
          return;
        }

        // Validate user has access to this banking type
        if (authReq.user && bankingType) {
          const userBankingAccess = authReq.user.bankingAccess;
          if (userBankingAccess !== 'BOTH' && userBankingAccess !== bankingType) {
            res.status(403).json({
              success: false,
              error: 'Banking type access denied',
              code: 'BANKING_TYPE_ACCESS_DENIED',
              details: {
                requestedType: bankingType,
                userAccess: userBankingAccess
              }
            });
            return;
          }
        }

        next();

      } catch (error) {
        console.error('Banking type validation error:', error);
        next();
      }
    };
  }

  /**
   * Pagination validation
   */
  validatePagination() {
    const paginationSchema = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(1000).default(20),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).default('asc')
    });

    return this.validate({
      query: paginationSchema,
      transformData: true,
      skipOnError: false
    });
  }

  // Private helper methods
  private formatZodErrors(error: ZodError): any[] {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      received: err.received
    }));
  }
}

// Common validation schemas for reuse
export const CommonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  tenantSlug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  bankingType: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']),
  
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(1000).default(20)
  })
};
EOF

    log_success "Validation Middleware generated successfully"
}

# Generate Tenant Context Middleware
generate_tenant_context_middleware() {
    log_info "Generating Tenant Context Middleware..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/tenant-context.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/tenant-context.middleware.ts
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenant?: any;
  tenantContext?: {
    id: string;
    slug: string;
    name: string;
    bankingType: 'CONVENTIONAL' | 'SYARIAH' | 'DUAL';
    isActive: boolean;
    databaseName: string;
    databaseConfig: any;
  };
}

export class TenantContextMiddleware {
  constructor() {}

  /**
   * Extract and validate tenant context from request
   */
  extractTenantContext() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const tenantReq = req as TenantRequest;
        
        // Try to get tenant identifier from various sources
        const tenantSlug = this.getTenantSlug(req);
        const tenantId = this.getTenantId(req);
        
        if (!tenantSlug && !tenantId) {
          // For public endpoints, continue without tenant context
          if (this.isPublicEndpoint(req.path)) {
            next();
            return;
          }
          
          res.status(400).json({
            success: false,
            error: 'Tenant context required',
            code: 'TENANT_CONTEXT_REQUIRED',
            details: {
              message: 'Please provide X-Tenant-Slug header or tenantSlug query parameter'
            }
          });
          return;
        }

        // Mock tenant data for development
        // In production, this would fetch from database
        const tenant = {
          id: tenantId || 'tenant-123',
          slug: tenantSlug || 'demo-tenant',
          name: 'Demo Tenant',
          bankingType: 'CONVENTIONAL' as const,
          isActive: true,
          databaseName: `ifrspro_tenant_${tenantSlug}_conventional`,
          databaseConfig: {}
        };

        if (!tenant.isActive) {
          res.status(403).json({
            success: false,
            error: 'Tenant is inactive',
            code: 'TENANT_INACTIVE',
            details: {
              tenantSlug: tenant.slug,
              tenantId: tenant.id
            }
          });
          return;
        }

        // Set tenant context
        tenantReq.tenant = tenant;
        tenantReq.tenantContext = {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          bankingType: tenant.bankingType,
          isActive: tenant.isActive,
          databaseName: tenant.databaseName,
          databaseConfig: tenant.databaseConfig
        };

        next();

      } catch (error) {
        console.error('Tenant context extraction error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to extract tenant context',
          code: 'TENANT_CONTEXT_ERROR'
        });
      }
    };
  }

  /**
   * Require tenant context (must be set)
   */
  requireTenantContext() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const tenantReq = req as TenantRequest;
      
      if (!tenantReq.tenant || !tenantReq.tenantContext) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      next();
    };
  }

  /**
   * Validate tenant access permissions
   */
  validateTenantAccess() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const tenantReq = req as TenantRequest;
        const authReq = req as any; // AuthenticatedRequest
        
        if (!tenantReq.tenant || !authReq.user) {
          next();
          return;
        }

        // Check if user belongs to this tenant
        if (authReq.user.tenantId !== tenantReq.tenant.id) {
          res.status(403).json({
            success: false,
            error: 'Tenant access denied',
            code: 'TENANT_ACCESS_DENIED'
          });
          return;
        }

        next();

      } catch (error) {
        console.error('Tenant access validation error:', error);
        res.status(500).json({
          success: false,
          error: 'Tenant access validation failed',
          code: 'TENANT_ACCESS_VALIDATION_ERROR'
        });
      }
    };
  }

  // Private helper methods
  private getTenantSlug(req: Request): string | null {
    return req.get('X-Tenant-Slug') || 
           req.query.tenantSlug as string ||
           req.body?.tenantSlug ||
           null;
  }

  private getTenantId(req: Request): string | null {
    return req.get('X-Tenant-ID') || 
           req.query.tenantId as string ||
           req.body?.tenantId ||
           null;
  }

  private isPublicEndpoint(path: string): boolean {
    const publicPaths = [
      '/health',
      '/api/v1/auth/health',
      '/api/v1/public/',
      '/docs',
      '/favicon.ico'
    ];

    return publicPaths.some(publicPath => path.startsWith(publicPath));
  }
}
EOF

    log_success "Tenant Context Middleware generated successfully"
}

# Main function
main() {
    log_info "Starting Security Middleware Generation..."
    
    # Create middleware directory if it doesn't exist
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/middleware"
    
    # Generate all security middleware components
    generate_security_middleware
    generate_rate_limit_middleware
    generate_validation_middleware
    generate_tenant_context_middleware
    
    log_success "Security Middleware Generation completed successfully!"
    log_info "Generated files:"
    log_info "- Security Middleware: packages/backend/src/api/middleware/security.middleware.ts"
    log_info "- Rate Limit Middleware: packages/backend/src/api/middleware/rate-limit.middleware.ts"
    log_info "- Validation Middleware: packages/backend/src/api/middleware/validation.middleware.ts"
    log_info "- Tenant Context Middleware: packages/backend/src/api/middleware/tenant-context.middleware.ts"
}

# Execute main function with all arguments
main "$@"