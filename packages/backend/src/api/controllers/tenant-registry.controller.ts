// packages/backend/src/api/controllers/tenant-registry.controller.ts
// ============================================================================
// 🏢 TENANT REGISTRY CONTROLLER - REST API for dynamic tenant management
// ============================================================================
// Based on TodoList-v2.md Hour 4 requirements
// Features: Dynamic discovery, configuration management, health monitoring
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { 
  tenantRegistry, 
  TenantRegistryEntry, 
  TenantConfigurationUpdate 
} from '../../core/services/tenant/tenant-registry.service';

export class TenantRegistryController {

  // ============================================================================
  // 📋 TENANT LISTING & DISCOVERY
  // ============================================================================

  /**
   * List all tenants in registry with filtering and pagination
   * GET /api/v1/tenant/registry
   */
  public async listTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const {
        status,
        bankingType,
        subscriptionTier,
        features,
        limit = 50,
        offset = 0,
        search
      } = req.query;

      // Parse features array if provided
      const featuresArray = features ? 
        (Array.isArray(features) ? features : [features]).map(String) : 
        undefined;

      const result = tenantRegistry.listTenants({
        status: status as string,
        bankingType: bankingType as string,
        subscriptionTier: subscriptionTier as string,
        features: featuresArray,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      // Apply search filter if provided
      let filteredTenants = result.tenants;
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredTenants = result.tenants.filter(tenant => 
          tenant.displayName.toLowerCase().includes(searchLower) ||
          tenant.organizationName.toLowerCase().includes(searchLower) ||
          tenant.slug.toLowerCase().includes(searchLower)
        );
      }

      res.json({
        success: true,
        data: {
          tenants: filteredTenants,
          pagination: {
            total: result.total,
            filtered: search ? filteredTenants.length : result.filtered,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            hasMore: (parseInt(offset as string) + filteredTenants.length) < result.filtered
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          registry: 'tenant-registry-service'
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tenant by ID from registry
   * GET /api/v1/tenant/registry/:tenantId
   */
  public async getTenantById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { tenantId } = req.params;
      const tenant = tenantRegistry.getTenant(tenantId);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found in registry',
          code: 'TENANT_NOT_FOUND',
          tenantId
        });
        return;
      }

      res.json({
        success: true,
        data: tenant,
        meta: {
          timestamp: new Date().toISOString(),
          lastAccessed: tenant.lastAccessed.toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tenant by slug from registry
   * GET /api/v1/tenant/registry/slug/:slug
   */
  public async getTenantBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { slug } = req.params;
      const tenant = tenantRegistry.getTenantBySlug(slug);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found in registry',
          code: 'TENANT_NOT_FOUND',
          slug
        });
        return;
      }

      res.json({
        success: true,
        data: tenant,
        meta: {
          timestamp: new Date().toISOString(),
          lastAccessed: tenant.lastAccessed.toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 🔧 CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Update tenant configuration
   * PUT /api/v1/tenant/registry/:tenantId/configuration
   */
  public async updateTenantConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { tenantId } = req.params;
      const { category, updates, reason } = req.body;
      const updatedBy = (req as any).user?.id || 'unknown';

      const configUpdate: TenantConfigurationUpdate = {
        tenantId,
        category,
        updates,
        updatedBy,
        reason
      };

      const result = await tenantRegistry.updateTenantConfiguration(configUpdate);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error,
          code: 'CONFIGURATION_UPDATE_FAILED'
        });
        return;
      }

      // Get updated tenant
      const updatedTenant = tenantRegistry.getTenant(tenantId);

      res.json({
        success: true,
        data: {
          tenant: updatedTenant,
          update: configUpdate
        },
        message: `Tenant ${category} configuration updated successfully`,
        meta: {
          timestamp: new Date().toISOString(),
          updatedBy
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tenant configuration by category
   * GET /api/v1/tenant/registry/:tenantId/configuration/:category
   */
  public async getTenantConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { tenantId, category } = req.params;
      const tenant = tenantRegistry.getTenant(tenantId);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found in registry',
          code: 'TENANT_NOT_FOUND'
        });
        return;
      }

      let configuration: any;
      switch (category) {
        case 'features':
          configuration = tenant.features;
          break;
        case 'configuration':
          configuration = tenant.configuration;
          break;
        case 'database':
          configuration = tenant.database;
          break;
        case 'metrics':
          configuration = tenant.metrics;
          break;
        default:
          res.status(400).json({
            success: false,
            error: 'Invalid configuration category',
            validCategories: ['features', 'configuration', 'database', 'metrics']
          });
          return;
      }

      res.json({
        success: true,
        data: {
          tenantId,
          category,
          configuration
        },
        meta: {
          timestamp: new Date().toISOString(),
          lastUpdated: tenant.lastUpdated.toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 🏥 HEALTH MONITORING
  // ============================================================================

  /**
   * Get registry statistics and health overview
   * GET /api/v1/tenant/registry/stats
   */
  public async getRegistryStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = tenantRegistry.getRegistryStatistics();

      res.json({
        success: true,
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          service: 'tenant-registry'
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get health status of all tenants
   * GET /api/v1/tenant/registry/health
   */
  public async getTenantsHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenants = tenantRegistry.listTenants().tenants;
      
      const healthSummary = {
        totalTenants: tenants.length,
        healthy: tenants.filter(t => t.database.healthStatus === 'healthy').length,
        degraded: tenants.filter(t => t.database.healthStatus === 'degraded').length,
        unhealthy: tenants.filter(t => t.database.healthStatus === 'unhealthy').length,
        details: tenants.map(tenant => ({
          id: tenant.id,
          slug: tenant.slug,
          displayName: tenant.displayName,
          status: tenant.status,
          database: {
            healthStatus: tenant.database.healthStatus,
            lastHealthCheck: tenant.database.lastHealthCheck,
            responseTime: tenant.metrics.averageResponseTime
          }
        }))
      };

      const overallHealth = healthSummary.unhealthy > 0 ? 'critical' :
                           healthSummary.degraded > 0 ? 'degraded' : 'healthy';

      res.json({
        success: true,
        data: healthSummary,
        health: overallHealth,
        meta: {
          timestamp: new Date().toISOString(),
          lastCheck: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 🔄 DISCOVERY & MAINTENANCE
  // ============================================================================

  /**
   * Refresh tenant registry
   * POST /api/v1/tenant/registry/refresh
   */
  public async refreshRegistry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔄 Registry refresh requested by user:', (req as any).user?.id);
      
      const result = await tenantRegistry.refresh();

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error,
          code: 'REGISTRY_REFRESH_FAILED'
        });
        return;
      }

      const stats = tenantRegistry.getRegistryStatistics();

      res.json({
        success: true,
        data: {
          refreshed: true,
          stats
        },
        message: 'Tenant registry refreshed successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestedBy: (req as any).user?.id
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get registry service information
   * GET /api/v1/tenant/registry
   */
  public async getRegistryInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = tenantRegistry.getRegistryStatistics();

      res.json({
        success: true,
        service: 'Tenant Registry Service',
        version: '1.0.0',
        description: 'Dynamic tenant discovery and configuration management for IFRS9 Multi-Tenant Platform',
        features: [
          'Dynamic tenant discovery',
          'Real-time health monitoring',
          'Configuration management',
          'Multi-tenant metrics tracking',
          'Database health checks',
          'Auto-discovery capabilities'
        ],
        endpoints: {
          list: 'GET /tenant/registry',
          getById: 'GET /tenant/registry/:tenantId',
          getBySlug: 'GET /tenant/registry/slug/:slug',
          updateConfig: 'PUT /tenant/registry/:tenantId/configuration',
          getConfig: 'GET /tenant/registry/:tenantId/configuration/:category',
          stats: 'GET /tenant/registry/stats',
          health: 'GET /tenant/registry/health',
          refresh: 'POST /tenant/registry/refresh'
        },
        statistics: stats,
        meta: {
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

// ============================================================================
// 🔧 VALIDATION MIDDLEWARE
// ============================================================================

export const validateTenantId = [
  param('tenantId')
    .isUUID()
    .withMessage('Tenant ID must be a valid UUID')
];

export const validateTenantSlug = [
  param('slug')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Tenant slug must be lowercase alphanumeric with hyphens')
];

export const validateConfigurationUpdate = [
  param('tenantId').isUUID().withMessage('Tenant ID must be valid UUID'),
  body('category')
    .isIn(['features', 'configuration', 'database', 'metrics'])
    .withMessage('Category must be one of: features, configuration, database, metrics'),
  body('updates')
    .isObject()
    .withMessage('Updates must be an object'),
  body('reason')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Reason must be between 3 and 200 characters')
];

export const validateConfigurationCategory = [
  param('tenantId').isUUID().withMessage('Tenant ID must be valid UUID'),
  param('category')
    .isIn(['features', 'configuration', 'database', 'metrics'])
    .withMessage('Category must be one of: features, configuration, database, metrics')
];

export const validateTenantQuery = [
  query('status')
    .optional()
    .isIn(['active', 'suspended', 'provisioning', 'inactive'])
    .withMessage('Status must be valid'),
  query('bankingType')
    .optional()
    .isIn(['conventional', 'syariah', 'dual'])
    .withMessage('Banking type must be valid'),
  query('subscriptionTier')
    .optional()
    .isIn(['basic', 'standard', 'premium', 'enterprise'])
    .withMessage('Subscription tier must be valid'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative integer')
];

// Export controller instance
export const tenantRegistryController = new TenantRegistryController();