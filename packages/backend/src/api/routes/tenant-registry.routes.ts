// packages/backend/src/api/routes/tenant-registry.routes.ts
// ============================================================================
// 🏢 TENANT REGISTRY ROUTES - REST API endpoints for dynamic tenant management
// ============================================================================
// Based on TodoList-v2.md Hour 4 requirements
// Features: Dynamic discovery, configuration management, health monitoring
// ============================================================================

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  tenantRegistryController,
  validateTenantId,
  validateTenantSlug,
  validateConfigurationUpdate,
  validateConfigurationCategory,
  validateTenantQuery
} from '../controllers/tenant-registry.controller';

const router = Router();

// ============================================================================
// 🛡️ MIDDLEWARE STACK
// ============================================================================

// Apply authentication to all routes
router.use(authMiddleware);

// Note: No tenant middleware here since this manages tenants themselves

// ============================================================================
// 📋 TENANT REGISTRY ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/v1/tenant/registry
 * @desc    Get registry service information and available endpoints
 * @access  Protected (requires authentication)
 */
router.get('/',
  tenantRegistryController.getRegistryInfo.bind(tenantRegistryController)
);

/**
 * @route   GET /api/v1/tenant/registry/list
 * @desc    List all tenants in registry with filtering and pagination
 * @access  Protected (requires authentication)
 * @query   ?status=active&bankingType=conventional&limit=50&offset=0&search=term
 */
router.get('/list',
  validateTenantQuery,
  tenantRegistryController.listTenants.bind(tenantRegistryController)
);

/**
 * @route   GET /api/v1/tenant/registry/stats
 * @desc    Get registry statistics and overview
 * @access  Protected (requires authentication)
 */
router.get('/stats',
  tenantRegistryController.getRegistryStatistics.bind(tenantRegistryController)
);

/**
 * @route   GET /api/v1/tenant/registry/health
 * @desc    Get health status of all tenants
 * @access  Protected (requires authentication)
 */
router.get('/health',
  tenantRegistryController.getTenantsHealth.bind(tenantRegistryController)
);

/**
 * @route   POST /api/v1/tenant/registry/refresh
 * @desc    Refresh tenant registry (rediscover tenants)
 * @access  Protected (requires authentication)
 */
router.post('/refresh',
  tenantRegistryController.refreshRegistry.bind(tenantRegistryController)
);

/**
 * @route   GET /api/v1/tenant/registry/:tenantId
 * @desc    Get tenant by ID from registry
 * @access  Protected (requires authentication)
 * @params  tenantId - UUID of the tenant
 */
router.get('/:tenantId',
  validateTenantId,
  tenantRegistryController.getTenantById.bind(tenantRegistryController)
);

/**
 * @route   GET /api/v1/tenant/registry/slug/:slug
 * @desc    Get tenant by slug from registry
 * @access  Protected (requires authentication)
 * @params  slug - Tenant slug (e.g., 'dana', 'metrobank')
 */
router.get('/slug/:slug',
  validateTenantSlug,
  tenantRegistryController.getTenantBySlug.bind(tenantRegistryController)
);

// ============================================================================
// 🔧 CONFIGURATION MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @route   PUT /api/v1/tenant/registry/:tenantId/configuration
 * @desc    Update tenant configuration
 * @access  Protected (requires authentication)
 * @params  tenantId - UUID of the tenant
 * @body    { category: 'features|configuration|database|metrics', updates: {}, reason?: '' }
 */
router.put('/:tenantId/configuration',
  validateConfigurationUpdate,
  tenantRegistryController.updateTenantConfiguration.bind(tenantRegistryController)
);

/**
 * @route   GET /api/v1/tenant/registry/:tenantId/configuration/:category
 * @desc    Get tenant configuration by category
 * @access  Protected (requires authentication)
 * @params  tenantId - UUID of the tenant
 * @params  category - Configuration category (features|configuration|database|metrics)
 */
router.get('/:tenantId/configuration/:category',
  validateConfigurationCategory,
  tenantRegistryController.getTenantConfiguration.bind(tenantRegistryController)
);

export default router;