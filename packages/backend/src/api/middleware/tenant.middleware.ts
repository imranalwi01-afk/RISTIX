// packages/backend/src/api/middleware/tenant.middleware.ts
// Multi-Tenant Request Routing Middleware - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md tenant isolation patterns

import { Request, Response, NextFunction } from 'express';
import { tenantService } from '../../core/services/tenant/tenant.service';
import { databaseConfig } from '../../core/database/config/database.config';

// Extend Express Request to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        slug: string;
        bankingType: 'conventional' | 'syariah' | 'dual';
        database: any; // Sequelize instance
        features: Record<string, boolean>;
        settings: Record<string, any>;
      };
    }
  }
}

interface TenantResolutionStrategy {
  type: 'header' | 'subdomain' | 'path' | 'query';
  extractTenantIdentifier(req: Request): string | null;
}

class HeaderStrategy implements TenantResolutionStrategy {
  type: 'header' = 'header';
  
  extractTenantIdentifier(req: Request): string | null {
    return req.headers['x-tenant-id'] as string || 
           req.headers['x-tenant-slug'] as string || 
           null;
  }
}

class SubdomainStrategy implements TenantResolutionStrategy {
  type: 'subdomain' = 'subdomain';
  
  extractTenantIdentifier(req: Request): string | null {
    const host = req.headers.host;
    if (!host) return null;
    
    const subdomain = host.split('.')[0];
    
    // Skip common subdomains
    if (['www', 'api', 'admin', 'app'].includes(subdomain)) {
      return null;
    }
    
    return subdomain;
  }
}

class PathStrategy implements TenantResolutionStrategy {
  type: 'path' = 'path';
  
  extractTenantIdentifier(req: Request): string | null {
    const pathMatch = req.path.match(/^\/tenant\/([^\/]+)/);
    return pathMatch ? pathMatch[1] : null;
  }
}

class QueryStrategy implements TenantResolutionStrategy {
  type: 'query' = 'query';
  
  extractTenantIdentifier(req: Request): string | null {
    return req.query.tenant as string || 
           req.query.tenant_id as string || 
           req.query.tenant_slug as string || 
           null;
  }
}

class JWTStrategy implements TenantResolutionStrategy {
  type: 'path' = 'path'; // Using 'path' type for interface compatibility
  
  extractTenantIdentifier(req: Request): string | null {
    // Extract tenant from authenticated user context (JWT)
    const user = (req as any).user;
    if (user) {
      return user.tenantId || user.tenantSlug || null;
    }
    return null;
  }
}

export class TenantMiddleware {
  private strategies: TenantResolutionStrategy[] = [
    new JWTStrategy(),        // Try JWT first (most reliable)
    new HeaderStrategy(),
    new SubdomainStrategy(),
    new PathStrategy(),
    new QueryStrategy()
  ];

  // MANDATORY: Main tenant resolution middleware
  public resolve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Skip tenant resolution for health checks and public endpoints
      if (this.isPublicEndpoint(req.path)) {
        return next();
      }

      // Try to resolve tenant using all strategies
      const tenantIdentifier = this.resolveTenantIdentifier(req);
      
      if (!tenantIdentifier) {
        return this.handleMissingTenant(req, res);
      }

      // Get tenant information
      const tenant = await this.getTenantInfo(tenantIdentifier);
      
      if (!tenant) {
        return this.handleTenantNotFound(req, res, tenantIdentifier);
      }

      // Check tenant status
      if (tenant.status !== 'active') {
        return this.handleInactiveTenant(req, res, tenant.status);
      }

      // Get tenant database connection
      const tenantDb = await databaseConfig.getTenantConnection(tenant.id);

      // Set tenant context in request
      req.tenant = {
        id: tenant.id,
        slug: tenant.tenantSlug,
        bankingType: tenant.bankingType,
        database: tenantDb,
        features: tenant.featuresEnabled,
        settings: tenant.tenantSettings
      };

      // Add tenant info to response headers (for debugging)
      if (process.env.NODE_ENV === 'development') {
        res.setHeader('X-Tenant-ID', tenant.id);
        res.setHeader('X-Tenant-Slug', tenant.tenantSlug);
        res.setHeader('X-Banking-Type', tenant.bankingType);
      }

      next();
    } catch (error) {
      console.error('Tenant resolution error:', error);
      res.status(500).json({
        error: 'Internal server error during tenant resolution',
        code: 'TENANT_RESOLUTION_ERROR'
      });
    }
  };

  // MANDATORY: Banking type detection middleware
  public requireBankingType = (allowedTypes: ('conventional' | 'syariah' | 'dual')[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.tenant) {
        return res.status(401).json({
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_MISSING'
        });
      }

      if (!allowedTypes.includes(req.tenant.bankingType)) {
        return res.status(403).json({
          error: `This endpoint requires ${allowedTypes.join(' or ')} banking type`,
          code: 'BANKING_TYPE_NOT_ALLOWED',
          allowedTypes,
          currentType: req.tenant.bankingType
        });
      }

      next();
    };
  };

  // MANDATORY: Feature requirement middleware
  public requireFeature = (featureName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.tenant) {
        return res.status(401).json({
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_MISSING'
        });
      }

      if (!req.tenant.features[featureName]) {
        return res.status(403).json({
          error: `Feature '${featureName}' is not enabled for this tenant`,
          code: 'FEATURE_NOT_ENABLED',
          requiredFeature: featureName
        });
      }

      next();
    };
  };

  // MANDATORY: Syariah compliance middleware
  public requireSyariahCompliance = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.tenant) {
        return res.status(401).json({
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_MISSING'
        });
      }

      if (req.tenant.bankingType === 'conventional') {
        return res.status(403).json({
          error: 'This endpoint requires Syariah banking compliance',
          code: 'SYARIAH_COMPLIANCE_REQUIRED'
        });
      }

      if (!req.tenant.features.syariahCompliance) {
        return res.status(403).json({
          error: 'Syariah compliance feature is not enabled',
          code: 'SYARIAH_COMPLIANCE_NOT_ENABLED'
        });
      }

      next();
    };
  };

  // Resolve tenant identifier using multiple strategies
  private resolveTenantIdentifier(req: Request): string | null {
    for (const strategy of this.strategies) {
      const identifier = strategy.extractTenantIdentifier(req);
      if (identifier) {
        return identifier;
      }
    }
    return null;
  }

  // Get tenant information by ID or slug
  private async getTenantInfo(identifier: string): Promise<any> {
    // Try UUID format first
    if (identifier.length === 36 && identifier.includes('-')) {
      return await tenantService.getTenant(identifier);
    }
    
    // Try as tenant slug
    return await tenantService.getTenantBySlug(identifier);
  }

  // Check if endpoint is public (no tenant required)
  private isPublicEndpoint(path: string): boolean {
    const publicPaths = [
      '/health',
      '/metrics',
      '/api/v1/auth/platform',
      '/api/v1/platform',
      '/api/v1/status'
    ];

    return publicPaths.some(publicPath => path.startsWith(publicPath));
  }

  // Handle missing tenant identifier
  private handleMissingTenant(req: Request, res: Response): void {
    res.status(400).json({
      error: 'Tenant identification required',
      code: 'TENANT_IDENTIFIER_MISSING',
      hint: 'Provide tenant ID via header (X-Tenant-ID), subdomain, or path parameter'
    });
  }

  // Handle tenant not found
  private handleTenantNotFound(req: Request, res: Response, identifier: string): void {
    res.status(404).json({
      error: 'Tenant not found',
      code: 'TENANT_NOT_FOUND',
      identifier
    });
  }

  // Handle inactive tenant
  private handleInactiveTenant(req: Request, res: Response, status: string): void {
    res.status(403).json({
      error: 'Tenant is not active',
      code: 'TENANT_INACTIVE',
      status
    });
  }
}

// Export singleton instance
export const tenantMiddleware = new TenantMiddleware();

// Export convenience functions
export const resolveTenant = tenantMiddleware.resolve;
export const requireBankingType = tenantMiddleware.requireBankingType;
export const requireFeature = tenantMiddleware.requireFeature;
export const requireSyariahCompliance = tenantMiddleware.requireSyariahCompliance;
