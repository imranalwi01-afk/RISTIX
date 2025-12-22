// packages/backend/src/middleware/tenant.middleware.ts
// ============================================================================
// TENANT MIDDLEWARE
// ============================================================================
// Middleware for resolving tenant context from requests

import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    slug: string;
    name: string;
    database: string;
    bankingType: 'conventional' | 'syariah';
  };
}

/**
 * Resolve tenant context from request
 * This is a simplified version that extracts tenant info from JWT token
 */
export const resolveTenant = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    // Extract tenant info from authenticated user
    const user = (req as any).user;

    if (!user || !user.tenantId) {
      console.warn('⚠️ No tenant context found in request');
      return next();
    }

    // Set tenant context
    req.tenant = {
      id: user.tenantId,
      slug: user.tenantSlug || 'unknown',
      name: user.tenantName || 'Unknown Tenant',
      database: user.tenantDatabase || 'unknown',
      bankingType: user.bankingType || 'conventional'
    };

    console.log(`✅ Tenant resolved: ${req.tenant.slug} (${req.tenant.id})`);
    next();
  } catch (error) {
    console.error('❌ Tenant resolution failed:', error);
    // Continue without tenant context to avoid breaking requests
    next();
  }
};

export default resolveTenant;