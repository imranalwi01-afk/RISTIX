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
