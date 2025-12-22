// packages/backend/src/api/middleware/tenant-role-context.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { TenantService } from '../../core/services/tenant/tenant.service';
import { AuthenticatedRequest } from './auth.middleware';
import { backendEnvironmentLoader } from '../../config/environment-loader-backend';

/**
 * Enhanced tenant context middleware specifically for role management
 * Provides database connections and proper tenant isolation
 */

export interface TenantRoleContext {
  id: string;
  slug: string;
  name: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  database: Pool;
  isActive: boolean;
}

export interface TenantRoleRequest extends AuthenticatedRequest {
  tenant?: TenantRoleContext;
}

/**
 * Validate tenant context and provide database connection for role operations
 */
export async function validateTenantContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantReq = req as TenantRoleRequest;

    // 🔓 BYPASS FOR PLATFORM ADMINS - Admin and superadmin can access everywhere!
    // Check if user is authenticated and has platform admin roles
    if (tenantReq.user && tenantReq.user.roles) {
      const userRoles = tenantReq.user.roles;

      // Platform admins can bypass tenant context requirements
      if (userRoles.includes('PLATFORM_SUPER_ADMIN') ||
          userRoles.includes('PLATFORM_ADMIN') ||
          userRoles.includes('ADMIN') ||
          userRoles.includes('SUPER_ADMIN')) {
        console.log(`🔓 Platform admin bypass: User ${userRoles} skipping tenant validation`);
        return next();
      }
    }

    // Extract tenant identifier from request
    const tenantSlug = getTenantSlug(req);
    const tenantId = getTenantId(req);

    if (!tenantSlug && !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant context required',
        details: 'Provide X-Tenant-Slug header or tenantSlug parameter'
      });
    }

    try {
      // Get tenant information from the tenant service
      const tenantService = new TenantService();
      let tenant;

      if (tenantSlug) {
        tenant = await tenantService.getTenantBySlug(tenantSlug);
      } else if (tenantId) {
        tenant = await tenantService.getTenant(tenantId);
      }

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Tenant not found',
          details: { tenantSlug, tenantId }
        });
      }

      if (tenant.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Tenant is inactive',
          details: { tenantSlug: tenant.tenantSlug, status: tenant.status }
        });
      }

      // Get database connection for this tenant
      const database = await getDatabaseConnectionForTenant(tenant.tenantSlug, tenant.bankingType);
      
      if (!database) {
        return res.status(500).json({
          success: false,
          error: 'Failed to connect to tenant database'
        });
      }

      // Create tenant context
      tenantReq.tenant = {
        id: tenant.id,
        slug: tenant.tenantSlug,
        name: tenant.displayName,
        bankingType: tenant.bankingType,
        database,
        isActive: tenant.status === 'active'
      };

      // Validate user has access to this tenant (if user is authenticated)
      if (tenantReq.user && tenantReq.user.tenantId && tenantReq.user.tenantId !== tenant.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this tenant'
        });
      }

      next();

    } catch (dbError) {
      console.error('Database connection error for tenant:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Failed to establish tenant database connection',
        details: 'Database connectivity issue'
      });
    }

  } catch (error) {
    console.error('Tenant validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Tenant validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get database connection pool for specific tenant
 */
async function getDatabaseConnectionForTenant(tenantSlug: string, bankingType: string): Promise<Pool | null> {
  try {
    // Load configuration from environment loader
    const config = backendEnvironmentLoader.getConfiguration();
    const tenantDbConfig = config.database.tenant;

    // Database connection configuration based on project specs
    const dbConfig = {
      host: tenantDbConfig.host,
      port: tenantDbConfig.port,
      user: tenantDbConfig.user,
      password: tenantDbConfig.password,
      database: getDatabaseNameForTenant(tenantSlug, bankingType),
      max: 10,
      min: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: tenantDbConfig.ssl
    };

    const pool = new Pool(dbConfig);
    
    // Test connection
    const client = await pool.connect();
    client.release();
    
    return pool;
  } catch (error) {
    console.error(`Failed to connect to tenant database: ${tenantSlug}`, error);
    return null;
  }
}

/**
 * Get database name for tenant based on slug and banking type
 */
function getDatabaseNameForTenant(tenantSlug: string, bankingType: string): string {
  // Map tenant slugs to actual database names - LIVE DATABASE MAPPING
  const tenantDatabaseMap: { [key: string]: string } = {
    'iaf': 'ifrspro_tenant_iaf'                // Indonesia Airawata Finance
  };

  // Return mapped database name or construct default
  return tenantDatabaseMap[tenantSlug] || `ifrspro_tenant_${tenantSlug}`;
}

/**
 * Extract tenant slug from request
 */
function getTenantSlug(req: Request): string | null {
  return req.get('X-Tenant-Slug') || 
         req.query.tenantSlug as string ||
         req.body?.tenantSlug ||
         null;
}

/**
 * Extract tenant ID from request
 */
function getTenantId(req: Request): string | null {
  return req.get('X-Tenant-ID') || 
         req.query.tenantId as string ||
         req.body?.tenantId ||
         null;
}

/**
 * Permission checking middleware for role operations
 */
export function checkPermissions(requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userReq = req as TenantRoleRequest;
    
    if (!userReq.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // For development, allow admin and system roles
    const userRoles = userReq.user.roles || [];
    const userPermissions = userReq.user.permissions || [];
    
    // Check if user has admin or system roles (auto-allow)
    if (userRoles.includes('PLATFORM_SUPER_ADMIN') || 
        userRoles.includes('BANK_CRO') || 
        userRoles.includes('BANK_IFRS_MANAGER') ||
        userRoles.includes('ADMIN')) {
      return next();
    }

    // Check specific permissions - handle both dot and underscore formats
    const hasPermission = requiredPermissions.some(permission => {
      // Check exact match
      if (userPermissions.includes(permission)) return true;
      
      // Check with underscore/dot conversion
      const underscoreVersion = permission.replace(/\./g, '_');
      const dotVersion = permission.replace(/_/g, '.');
      
      return userPermissions.includes(underscoreVersion) || 
             userPermissions.includes(dotVersion) ||
             userRoles.some(role => role.includes('ADMIN') || role.includes('MANAGER'));
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        details: {
          required: requiredPermissions,
          userRoles,
          userPermissions: userPermissions.slice(0, 5) // Limit for security
        }
      });
    }

    next();
  };
}