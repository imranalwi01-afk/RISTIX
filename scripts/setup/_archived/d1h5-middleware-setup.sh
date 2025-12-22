#!/bin/bash
# scripts/setup/d1h5-middleware-setup.sh
# IFRS9 Platform - Day 1 Hour 5: Security Framework Middleware Setup

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h5-middleware-setup-$(date +%Y%m%d-%H%M%S).log"

# Create necessary directories (local project directories)
mkdir -p "${PROJECT_ROOT}"/{logs,tmp,uploads,config}

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

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating environment for middleware setup..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check backend directory structure
    if [[ ! -d "${PROJECT_ROOT}/packages/backend/src/api/middleware" ]]; then
        log_error "Backend middleware directory not found. Run d1h5-api-controllers-setup.sh first"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Generate Audit Middleware
create_audit_middleware() {
    log_info "Creating Audit Middleware..."
    
    local middleware_file="${PROJECT_ROOT}/packages/backend/src/api/middleware/audit.middleware.ts"
    
    cat > "$middleware_file" << 'EOF'
// packages/backend/src/api/middleware/audit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../../core/services/audit/audit.service';
import { TenantContext } from '../../types/tenant.types';

interface AuditableRequest extends Request {
  auditData?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    oldValues?: any;
    newValues?: any;
  };
}

export interface AuditMiddlewareOptions {
  eventType?: string;
  entityType?: string;
  businessProcess?: string;
  complianceRelevant?: boolean;
  regulatoryImpact?: boolean;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  skipRoutes?: string[];
  auditOnSuccess?: boolean;
  auditOnError?: boolean;
}

/**
 * Auto-audit middleware for tracking API requests
 */
export const createAuditMiddleware = (
  auditService: AuditService,
  options: AuditMiddlewareOptions = {}
) => {
  return async (req: AuditableRequest, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    const originalJson = res.json;
    
    // Skip audit for excluded routes
    if (options.skipRoutes?.includes(req.path)) {
      return next();
    }

    // Skip audit for health checks and system routes
    if (req.path.includes('/health') || req.path.includes('/status')) {
      return next();
    }

    // Capture request data
    const requestData = {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: req.query,
      params: req.params,
      body: req.method !== 'GET' ? req.body : undefined,
      headers: {
        'content-type': req.get('Content-Type'),
        'user-agent': req.get('User-Agent'),
        'authorization': req.get('Authorization') ? 'Bearer ***' : undefined
      },
      ip: req.ip,
      timestamp: new Date().toISOString()
    };

    // Override res.json to capture response
    let responseData: any;
    let statusCode: number;

    res.json = function(body: any) {
      responseData = body;
      statusCode = res.statusCode;
      return originalJson.call(this, body);
    };

    // Handle response completion
    res.on('finish', async () => {
      try {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const tenantContext = req.tenantContext as TenantContext;
        const userId = req.user?.id;

        if (!tenantContext || !userId) {
          return; // Skip audit if no tenant context or user
        }

        // Determine event type
        const eventType = options.eventType || `API_${req.method}`;
        const entityType = options.entityType || req.auditData?.entityType || 'api_request';
        const entityId = req.auditData?.entityId || req.params.id;
        
        // Determine if this is a successful operation
        const isSuccess = statusCode >= 200 && statusCode < 300;
        const isError = statusCode >= 400;

        // Skip audit based on options
        if (!options.auditOnSuccess && isSuccess) return;
        if (!options.auditOnError && isError) return;

        // Create audit log entry
        await auditService.createAuditLog(tenantContext, {
          eventType,
          entityType,
          entityId,
          entityName: req.auditData?.action || `${req.method} ${req.path}`,
          oldValues: req.auditData?.oldValues,
          newValues: req.auditData?.newValues || (req.method !== 'GET' ? req.body : undefined),
          userId,
          sessionId: req.sessionId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          apiEndpoint: req.originalUrl,
          requestMethod: req.method,
          bankingType: tenantContext.bankingType,
          businessProcess: options.businessProcess || 'api_operation',
          complianceRelevant: options.complianceRelevant || false,
          regulatoryImpact: options.regulatoryImpact || false,
          riskLevel: options.riskLevel || (isError ? 'MEDIUM' : 'LOW'),
          metadata: {
            statusCode,
            responseTime,
            requestSize: JSON.stringify(requestData).length,
            responseSize: responseData ? JSON.stringify(responseData).length : 0,
            success: isSuccess,
            error: isError,
            route: req.route?.path
          },
          tags: [
            'api_request',
            req.method.toLowerCase(),
            isSuccess ? 'success' : 'failure',
            tenantContext.bankingType || 'unknown'
          ]
        });

        // Also log user activity for tracking
        await auditService.logUserActivity(tenantContext, {
          userId,
          sessionId: req.sessionId,
          activityType: `API_${req.method}`,
          pageUrl: req.originalUrl,
          actionPerformed: `${req.method} ${req.path}`,
          targetEntity: entityType,
          targetId: entityId,
          actionResult: isSuccess ? 'SUCCESS' : (isError ? 'FAILURE' : 'PARTIAL'),
          errorMessage: isError ? responseData?.error : undefined,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          responseTimeMs: responseTime,
          bankingType: tenantContext.bankingType,
          moduleAccessed: req.path.split('/')[3] || 'unknown'
        });

      } catch (auditError) {
        console.error('Audit middleware error:', auditError);
        // Don't fail the request if audit fails
      }
    });

    next();
  };
};

/**
 * Middleware to add audit metadata to request
 */
export const addAuditMetadata = (metadata: {
  entityType?: string;
  entityId?: string;
  action?: string;
}) => {
  return (req: AuditableRequest, res: Response, next: NextFunction): void => {
    req.auditData = {
      ...req.auditData,
      ...metadata
    };
    next();
  };
};

/**
 * High-risk operation audit middleware
 */
export const auditHighRiskOperation = (auditService: AuditService) => {
  return createAuditMiddleware(auditService, {
    complianceRelevant: true,
    regulatoryImpact: true,
    riskLevel: 'HIGH',
    auditOnSuccess: true,
    auditOnError: true
  });
};

/**
 * Financial operation audit middleware
 */
export const auditFinancialOperation = (auditService: AuditService) => {
  return createAuditMiddleware(auditService, {
    businessProcess: 'financial_operation',
    complianceRelevant: true,
    regulatoryImpact: true,
    riskLevel: 'MEDIUM',
    auditOnSuccess: true,
    auditOnError: true
  });
};

/**
 * IFRS 9 calculation audit middleware
 */
export const auditIFRS9Calculation = (auditService: AuditService) => {
  return createAuditMiddleware(auditService, {
    eventType: 'IFRS9_CALCULATION',
    businessProcess: 'ifrs9_calculation',
    complianceRelevant: true,
    regulatoryImpact: true,
    riskLevel: 'HIGH',
    auditOnSuccess: true,
    auditOnError: true
  });
};

/**
 * Syariah banking audit middleware
 */
export const auditSyariahOperation = (auditService: AuditService) => {
  return createAuditMiddleware(auditService, {
    businessProcess: 'syariah_banking',
    complianceRelevant: true,
    regulatoryImpact: true,
    riskLevel: 'MEDIUM',
    auditOnSuccess: true,
    auditOnError: true
  });
};
EOF

    log_success "Audit Middleware created successfully"
}

# Generate Security Middleware
create_security_middleware() {
    log_info "Creating Security Middleware..."
    
    local middleware_file="${PROJECT_ROOT}/packages/backend/src/api/middleware/security.middleware.ts"
    
    cat > "$middleware_file" << 'EOF'
// packages/backend/src/api/middleware/security.middleware.ts
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { TenantContext } from '../../types/tenant.types';

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "api.example.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: { policy: "require-corp" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
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
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true
});

/**
 * CORS configuration with tenant-aware origins
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:4231',
      'https://ifrs9-platform.com',
      'https://demo.ifrs9-platform.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Tenant-ID',
    'X-Tenant-Slug',
    'X-Banking-Type',
    'X-Session-ID',
    'X-Request-ID'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Pagination-Page',
    'X-Pagination-Limit',
    'X-Rate-Limit-Remaining',
    'X-Response-Time'
  ]
});

/**
 * Rate limiting configuration
 */
export const createRateLimit = (options?: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options?.max || 1000, // limit each IP to 1000 requests per windowMs
    message: options?.message || {
      success: false,
      error: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options?.skipSuccessfulRequests || false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round(options?.windowMs || (15 * 60 * 1000) / 1000)
      });
    }
  });
};

/**
 * Banking-specific rate limits
 */
export const bankingRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // More restrictive for banking operations
  message: 'Banking operation rate limit exceeded'
});

/**
 * Authentication rate limiting
 */
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Very restrictive for auth operations
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts'
});

/**
 * IFRS 9 calculation rate limiting
 */
export const calculationRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Calculations are resource intensive
  message: 'Calculation rate limit exceeded'
});

/**
 * Compression middleware
 */
export const compressionConfig = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

/**
 * IP whitelist middleware
 */
export const createIPWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (allowedIPs.length === 0) {
      return next(); // No IP restrictions if list is empty
    }

    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
    
    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied - IP not whitelisted',
        code: 'IP_NOT_WHITELISTED'
      });
    }
  };
};

/**
 * Request sanitization middleware
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Remove null bytes and control characters
  const sanitizeString = (str: string): string => {
    return str.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[sanitizeString(key)] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Security event logging middleware
 */
export const logSecurityEvents = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i,
    /<script.*?>.*?<\/script>/i,
    /javascript:/i,
    /vbscript:/i,
    /onload|onerror|onclick/i
  ];

  const requestString = JSON.stringify({
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  const suspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));

  if (suspicious) {
    console.warn('Suspicious request detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Monitor response time
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests (potential DoS)
    if (responseTime > 5000) {
      console.warn('Slow request detected:', {
        ip: req.ip,
        url: req.originalUrl,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

/**
 * Banking compliance security middleware
 */
export const bankingComplianceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const tenantContext = req.tenantContext as TenantContext;
  
  // Additional security for Syariah banking
  if (tenantContext?.bankingType === 'syariah') {
    // Add Syariah-specific security headers
    res.set('X-Banking-Type', 'syariah');
    res.set('X-Compliance-Mode', 'aaoifi');
    
    // Additional audit requirements
    req.headers['x-requires-syariah-audit'] = 'true';
  }

  // Banking-specific security headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-Banking-Security', 'enabled');

  next();
};

/**
 * Complete security middleware stack
 */
export const securityMiddlewareStack = [
  securityHeaders,
  corsConfig,
  compressionConfig,
  createRateLimit(),
  sanitizeRequest,
  logSecurityEvents,
  bankingComplianceMiddleware
];

/**
 * High-security middleware for sensitive operations
 */
export const highSecurityMiddleware = [
  securityHeaders,
  corsConfig,
  authRateLimit,
  sanitizeRequest,
  logSecurityEvents,
  createIPWhitelist(process.env.ADMIN_ALLOWED_IPS?.split(',') || []),
  bankingComplianceMiddleware
];
EOF

    log_success "Security Middleware created successfully"
}

# Generate API Routes
create_api_routes() {
    log_info "Creating API Routes..."
    
    # Audit Routes
    local audit_routes="${PROJECT_ROOT}/packages/backend/src/api/routes/audit.routes.ts"
    cat > "$audit_routes" << 'EOF'
// packages/backend/src/api/routes/audit.routes.ts
import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { AuditService } from '../../core/services/audit/audit.service';
import { DatabaseService } from '../../core/services/database/database.service';
import { ConfigurationService } from '../../core/services/configuration/configuration.service';
import { requireAuth } from '../middleware/auth.middleware';
import { requireTenantAccess } from '../middleware/tenant.middleware';
import { auditHighRiskOperation } from '../middleware/audit.middleware';

const router = Router();

// Initialize services
const databaseService = new DatabaseService();
const configService = new ConfigurationService();
const auditService = new AuditService(databaseService, configService);
const auditController = new AuditController(auditService);

// Apply middleware to all routes
router.use(requireAuth);
router.use(requireTenantAccess);

// Audit log routes
router.post('/logs', auditController.createAuditLog);
router.get('/logs', auditController.queryAuditLogs);
router.get('/logs/:logId', auditController.getAuditLogById);
router.get('/export', auditController.exportAuditLogs);

// User activity routes
router.post('/activity', auditController.logUserActivity);
router.get('/users/:userId/activity', auditController.getUserActivityLogs);

// Data access logging routes
router.post('/data-access', auditController.logDataAccess);

// Calculation audit routes
router.post('/calculation', auditController.logCalculationAudit);

// Compliance and reporting routes
router.post('/compliance/report', auditHighRiskOperation(auditService), auditController.generateComplianceReport);
router.get('/statistics', auditController.getAuditStatistics);

export default router;
EOF

    # Workflow Routes
    local workflow_routes="${PROJECT_ROOT}/packages/backend/src/api/routes/workflow.routes.ts"
    cat > "$workflow_routes" << 'EOF'
// packages/backend/src/api/routes/workflow.routes.ts
import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';
import { WorkflowService } from '../../core/services/workflow/workflow.service';
import { DatabaseService } from '../../core/services/database/database.service';
import { ConfigurationService } from '../../core/services/configuration/configuration.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { AuditService } from '../../core/services/audit/audit.service';
import { requireAuth } from '../middleware/auth.middleware';
import { requireTenantAccess } from '../middleware/tenant.middleware';
import { auditFinancialOperation } from '../middleware/audit.middleware';

const router = Router();

// Initialize services
const databaseService = new DatabaseService();
const configService = new ConfigurationService();
const auditService = new AuditService(databaseService, configService);
const notificationService = new NotificationService(configService);
const workflowService = new WorkflowService(databaseService, configService, notificationService, auditService);
const workflowController = new WorkflowController(workflowService);

// Apply middleware to all routes
router.use(requireAuth);
router.use(requireTenantAccess);

// Workflow instance routes
router.post('/instances', auditFinancialOperation(auditService), workflowController.createWorkflow);
router.get('/instances/:instanceId', workflowController.getWorkflowInstance);

// Approval task routes
router.post('/tasks/:taskId/decision', auditFinancialOperation(auditService), workflowController.processApprovalDecision);
router.get('/users/:userId/pending', workflowController.getUserPendingApprovals);

// Administrative routes
router.post('/escalate-overdue', auditFinancialOperation(auditService), workflowController.escalateOverdueTasks);
router.get('/statistics', workflowController.getWorkflowStatistics);

export default router;
EOF

    # Security Routes
    local security_routes="${PROJECT_ROOT}/packages/backend/src/api/routes/security.routes.ts"
    cat > "$security_routes" << 'EOF'
// packages/backend/src/api/routes/security.routes.ts
import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireTenantAccess } from '../middleware/tenant.middleware';
import { highSecurityMiddleware } from '../middleware/security.middleware';

const router = Router();
const securityController = new SecurityController();

// Apply middleware to all routes
router.use(requireAuth);
router.use(requireTenantAccess);

// Security event routes
router.post('/events', securityController.reportSecurityEvent);
router.get('/dashboard', securityController.getSecurityDashboard);

// Threat assessment routes (high security)
router.post('/threat-assessment', highSecurityMiddleware, securityController.performThreatAssessment);

// Security configuration routes (admin only)
router.get('/configuration', highSecurityMiddleware, securityController.getSecurityConfiguration);

export default router;
EOF

    # Approval Routes
    local approval_routes="${PROJECT_ROOT}/packages/backend/src/api/routes/approval.routes.ts"
    cat > "$approval_routes" << 'EOF'
// packages/backend/src/api/routes/approval.routes.ts
import { Router } from 'express';
import { ApprovalController } from '../controllers/approval.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireTenantAccess } from '../middleware/tenant.middleware';
import { bankingRateLimit } from '../middleware/security.middleware';

const router = Router();
const approvalController = new ApprovalController();

// Apply middleware to all routes
router.use(requireAuth);
router.use(requireTenantAccess);
router.use(bankingRateLimit);

// Approval request routes
router.post('/request', approvalController.requestApproval);
router.get('/:approvalId', approvalController.getApprovalDetails);

// Bulk operations
router.post('/bulk-decision', approvalController.processBulkApproval);

// Statistics and reporting
router.get('/statistics', approvalController.getApprovalStatistics);
router.get('/history', approvalController.getApprovalHistory);

export default router;
EOF

    log_success "API Routes created successfully"
}

# Generate Utility Functions
create_utility_functions() {
    log_info "Creating Security Utility Functions..."
    
    # Audit Utils
    local audit_utils="${PROJECT_ROOT}/packages/backend/src/utils/audit/audit.utils.ts"
    mkdir -p "$(dirname "$audit_utils")"
    
    cat > "$audit_utils" << 'EOF'
// packages/backend/src/utils/audit/audit.utils.ts
import { AuditLogEntry } from '../../types/audit.types';

/**
 * Audit utility functions
 */
export class AuditUtils {
  /**
   * Mask sensitive data in audit logs
   */
  static maskSensitiveData(data: any, sensitiveFields: string[] = []): any {
    if (!data || typeof data !== 'object') return data;

    const defaultSensitiveFields = [
      'password', 'ssn', 'account_number', 'card_number',
      'phone', 'email', 'national_id', 'passport',
      'secret', 'token', 'key', 'hash'
    ];

    const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];
    const masked = Array.isArray(data) ? [...data] : { ...data };

    const maskValue = (obj: any, key: string): void => {
      if (allSensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        obj[key] = '***MASKED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = this.maskSensitiveData(obj[key], sensitiveFields);
      }
    };

    if (Array.isArray(masked)) {
      masked.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => maskValue(item, key));
        }
      });
    } else {
      Object.keys(masked).forEach(key => maskValue(masked, key));
    }

    return masked;
  }

  /**
   * Extract changed fields between old and new values
   */
  static extractChangedFields(oldValues: any, newValues: any): string[] {
    if (!oldValues || !newValues) return [];

    const changedFields: string[] = [];
    const allKeys = new Set([
      ...Object.keys(oldValues),
      ...Object.keys(newValues)
    ]);

    allKeys.forEach(key => {
      const oldVal = JSON.stringify(oldValues[key]);
      const newVal = JSON.stringify(newValues[key]);
      
      if (oldVal !== newVal) {
        changedFields.push(key);
      }
    });

    return changedFields;
  }

  /**
   * Generate change summary
   */
  static generateChangeSummary(oldValues: any, newValues: any): string {
    const changedFields = this.extractChangedFields(oldValues, newValues);
    
    if (changedFields.length === 0) {
      return 'No changes detected';
    }

    if (changedFields.length <= 3) {
      return `Modified fields: ${changedFields.join(', ')}`;
    }

    return `Modified ${changedFields.length} fields: ${changedFields.slice(0, 3).join(', ')}...`;
  }

  /**
   * Calculate risk level based on operation
   */
  static calculateRiskLevel(
    entityType: string,
    operation: string,
    userRole: string = 'user',
    bankingType: string = 'conventional'
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const highRiskEntities = ['portfolio_account', 'calculation_job', 'user', 'role', 'configuration'];
    const criticalOperations = ['DELETE', 'EXECUTE', 'APPROVE'];
    const highRiskRoles = ['admin', 'super_admin'];
    
    let riskScore = 0;

    // Entity type risk
    if (highRiskEntities.includes(entityType.toLowerCase())) {
      riskScore += 2;
    }

    // Operation risk
    if (criticalOperations.includes(operation.toUpperCase())) {
      riskScore += 3;
    }

    // User role risk
    if (highRiskRoles.includes(userRole.toLowerCase())) {
      riskScore += 1;
    }

    // Syariah banking requires higher scrutiny
    if (bankingType === 'syariah') {
      riskScore += 1;
    }

    // Determine risk level
    if (riskScore >= 6) return 'CRITICAL';
    if (riskScore >= 4) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Format audit log for export
   */
  static formatForExport(logs: AuditLogEntry[]): any[] {
    return logs.map(log => ({
      timestamp: log.timestamp,
      event_type: log.eventType,
      entity_type: log.entityType,
      entity_name: log.entityName,
      user_name: log.userName,
      user_role: log.userRole,
      ip_address: log.ipAddress,
      banking_type: log.bankingType,
      risk_level: log.riskLevel,
      compliance_relevant: log.complianceRelevant,
      regulatory_impact: log.regulatoryImpact,
      change_summary: log.changeSummary
    }));
  }

  /**
   * Validate audit log entry
   */
  static validateAuditEntry(entry: Partial<AuditLogEntry>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!entry.eventType) errors.push('Event type is required');
    if (!entry.entityType) errors.push('Entity type is required');
    if (!entry.userId) errors.push('User ID is required');
    if (!entry.tenantId) errors.push('Tenant ID is required');

    if (entry.riskLevel && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(entry.riskLevel)) {
      errors.push('Invalid risk level');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
EOF

    log_success "Security utility functions created successfully"
}

# Verify middleware setup
verify_middleware_setup() {
    log_info "Verifying middleware setup..."
    
    local backend_src="${PROJECT_ROOT}/packages/backend/src"
    local required_files=(
        "${backend_src}/api/middleware/audit.middleware.ts"
        "${backend_src}/api/middleware/security.middleware.ts"
        "${backend_src}/api/routes/audit.routes.ts"
        "${backend_src}/api/routes/workflow.routes.ts"
        "${backend_src}/api/routes/security.routes.ts"
        "${backend_src}/api/routes/approval.routes.ts"
        "${backend_src}/utils/audit/audit.utils.ts"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "✓ $(basename "$file") created"
        else
            log_error "✗ $(basename "$file") missing"
            return 1
        fi
    done
    
    log_success "Middleware setup verification completed successfully"
}

# MANDATORY: Main function
main() {
    log_info "🚀 Starting IFRS9 Platform - Day 1 Hour 5: Security Framework Middleware Setup"
    
    # Validate environment
    validate_environment
    
    # Create middleware components
    log_info "⚙️ Creating Audit Middleware..."
    create_audit_middleware
    
    log_info "🔒 Creating Security Middleware..."
    create_security_middleware
    
    log_info "🛤️ Creating API Routes..."
    create_api_routes
    
    log_info "🔧 Creating Utility Functions..."
    create_utility_functions
    
    # Verify setup
    log_info "🔍 Verifying middleware setup..."
    verify_middleware_setup
    
    log_success "🎉 Day 1 Hour 5: Security Framework Middleware Setup completed successfully!"
    log_info "📋 Next step: Run d1h5-verification.sh to complete Hour 5 setup"
}

# Execute main function with all arguments
main "$@"