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
