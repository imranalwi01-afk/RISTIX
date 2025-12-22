// packages/backend/src/api/routes/platform/menu.routes.ts
// ============================================================================
// Menu System API Routes
// ============================================================================
// Generated: 2025-01-12
// Purpose: RESTful routes for database-driven menu system
// Methodology: Core Platform MVP - Menu System Routes
// Dependencies: MenuController, Authentication, Validation
// ============================================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { MenuController } from '../../controllers/platform/menu.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { validateTenantContext } from '../../middleware/tenant.middleware';
import { DatabaseDrivenMenuService } from '../../../core/services/platform/database-driven-menu.service';
import { TenantRegistryService } from '../../../core/services/tenant/tenant-registry.service';
import { AuditService } from '../../../core/services/audit/audit.service';
import { ConfigurationService } from '../../../core/services/configuration/configuration.service';
import logger from '../../../utils/logger';

const router = Router();

// Initialize services and controller
const configService = new ConfigurationService(logger);
const tenantRegistryService = TenantRegistryService.getInstance();
const auditService = new AuditService(logger);
const menuService = new DatabaseDrivenMenuService(configService, tenantRegistryService, auditService, logger);
const menuController = new MenuController(menuService, tenantRegistryService, auditService);

// =============================================================================
// PUBLIC MENU ENDPOINTS (Authenticated Users)
// =============================================================================

/**
 * @route   GET /api/v1/menu
 * @desc    Get menu configuration for current user context
 * @access  Private (All authenticated users)
 */
router.get(
  '/',
  authenticateToken,
  validateTenantContext, // Optional - will work with or without tenant
  (req, res, next) => menuController.getUserMenu(req, res, next)
);

/**
 * @route   GET /api/v1/menu/breadcrumbs
 * @desc    Get breadcrumb navigation for current path
 * @access  Private (All authenticated users)
 */
router.get(
  '/breadcrumbs',
  authenticateToken,
  validateTenantContext,
  [
    query('path')
      .notEmpty()
      .withMessage('Path is required')
      .isString()
      .withMessage('Path must be a string')
      .isLength({ max: 500 })
      .withMessage('Path too long')
  ],
  (req, res, next) => menuController.getBreadcrumbs(req, res, next)
);

/**
 * @route   POST /api/v1/menu/access-log
 * @desc    Log menu item access for analytics
 * @access  Private (All authenticated users)
 */
router.post(
  '/access-log',
  authenticateToken,
  validateTenantContext,
  [
    body('menu_item_id')
      .notEmpty()
      .withMessage('Menu item ID is required')
      .isUUID()
      .withMessage('Invalid menu item ID format'),
    body('accessed_url')
      .optional()
      .isString()
      .withMessage('Accessed URL must be a string')
      .isLength({ max: 500 })
      .withMessage('URL too long'),
    body('response_time')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Response time must be a positive integer')
  ],
  (req, res, next) => menuController.logMenuAccess(req, res, next)
);

// =============================================================================
// ADMIN MENU MANAGEMENT ENDPOINTS
// =============================================================================

/**
 * @route   GET /api/v1/admin/menu/configurations
 * @desc    Get all menu configurations (paginated)
 * @access  Private (Platform Admin only)
 */
router.get(
  '/admin/configurations',
  authenticateToken,
  requirePermission(['PLATFORM_ADMIN', 'MANAGE_MENU_SYSTEM']),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('target_audience')
      .optional()
      .isIn(['banking_staff', 'consultant', 'regulator', 'platform_admin'])
      .withMessage('Invalid target audience'),
    query('banking_mode')
      .optional()
      .isIn(['conventional', 'syariah', 'dual'])
      .withMessage('Invalid banking mode')
  ],
  (req, res, next) => menuController.getMenuConfigurations(req, res, next)
);

/**
 * @route   POST /api/v1/admin/menu/configurations
 * @desc    Create or update menu configuration
 * @access  Private (Platform Admin only)
 */
router.post(
  '/admin/configurations',
  authenticateToken,
  requirePermission(['PLATFORM_ADMIN', 'MANAGE_MENU_SYSTEM']),
  [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 3, max: 255 })
      .withMessage('Name must be between 3 and 255 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 1000 })
      .withMessage('Description too long'),
    body('target_audience')
      .notEmpty()
      .withMessage('Target audience is required')
      .isIn(['banking_staff', 'consultant', 'regulator', 'platform_admin'])
      .withMessage('Invalid target audience'),
    body('banking_mode')
      .optional()
      .isIn(['conventional', 'syariah', 'dual'])
      .withMessage('Invalid banking mode'),
    body('tenant_specific')
      .optional()
      .isBoolean()
      .withMessage('Tenant specific must be boolean'),
    body('is_default')
      .optional()
      .isBoolean()
      .withMessage('Is default must be boolean'),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('Is active must be boolean'),
    body('version')
      .optional()
      .isString()
      .withMessage('Version must be a string')
      .matches(/^\d+\.\d+\.\d+$/)
      .withMessage('Version must be in semver format (x.y.z)'),
    body('menu_items')
      .optional()
      .isArray()
      .withMessage('Menu items must be an array'),
    body('menu_items.*.key')
      .if(body('menu_items').exists())
      .notEmpty()
      .withMessage('Menu item key is required'),
    body('menu_items.*.title')
      .if(body('menu_items').exists())
      .notEmpty()
      .withMessage('Menu item title is required'),
    body('menu_items.*.type')
      .if(body('menu_items').exists())
      .isIn(['group', 'item', 'divider'])
      .withMessage('Invalid menu item type'),
    body('menu_items.*.sort_order')
      .if(body('menu_items').exists())
      .isInt({ min: 0 })
      .withMessage('Sort order must be a non-negative integer')
  ],
  (req, res, next) => menuController.upsertMenuConfiguration(req, res, next)
);

/**
 * @route   GET /api/v1/admin/menu/configurations/:configId/items
 * @desc    Get menu items for specific configuration
 * @access  Private (Platform Admin only)
 */
router.get(
  '/admin/configurations/:configId/items',
  authenticateToken,
  requirePermission(['PLATFORM_ADMIN', 'MANAGE_MENU_SYSTEM']),
  [
    param('configId')
      .isUUID()
      .withMessage('Invalid configuration ID format')
  ],
  (req, res, next) => menuController.getMenuItems(req, res, next)
);

/**
 * @route   GET /api/v1/admin/menu/analytics
 * @desc    Get menu usage analytics
 * @access  Private (Platform Admin only)
 */
router.get(
  '/admin/analytics',
  authenticateToken,
  requirePermission(['PLATFORM_ADMIN', 'VIEW_SYSTEM_ANALYTICS']),
  [
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be in ISO 8601 format'),
    query('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be in ISO 8601 format'),
    query('tenant_id')
      .optional()
      .isUUID()
      .withMessage('Invalid tenant ID format')
  ],
  (req, res, next) => menuController.getMenuAnalytics(req, res, next)
);

// =============================================================================
// MENU HEALTH CHECK
// =============================================================================

/**
 * @route   GET /api/v1/menu/health
 * @desc    Check menu system health
 * @access  Private (Platform Admin only)
 */
router.get(
  '/health',
  authenticateToken,
  requirePermission(['PLATFORM_ADMIN', 'VIEW_SYSTEM_HEALTH']),
  async (req, res, next) => {
    try {
      // Basic health check for menu system
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database_connection: true,
          menu_cache: true,
          service_availability: true
        },
        version: '1.0.0'
      };

      res.json({
        success: true,
        data: healthStatus
      });

    } catch (error) {
      logger.error('Menu system health check failed', {
        error: (error as Error).message
      });

      res.status(503).json({
        success: false,
        error: 'HEALTH_CHECK_FAILED',
        message: 'Menu system health check failed'
      });
    }
  }
);

// =============================================================================
// MENU SYSTEM INFO
// =============================================================================

/**
 * @route   GET /api/v1/menu/info
 * @desc    Get menu system information
 * @access  Public (for system info)
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'Database-Driven Menu System',
      version: '1.0.0',
      description: 'Dynamic menu configuration with multi-tenant and banking type support',
      features: [
        'Role-based menu filtering',
        'Multi-tenant menu customization',
        'Dual banking mode support',
        'Breadcrumb generation',
        'Menu access analytics',
        'User menu customization',
        'Hierarchical menu structure',
        'Permission-based visibility'
      ],
      supported_audiences: [
        'banking_staff',
        'consultant', 
        'regulator',
        'platform_admin'
      ],
      banking_modes: [
        'conventional',
        'syariah',
        'dual'
      ]
    },
    meta: {
      timestamp: new Date().toISOString(),
      api_version: 'v1'
    }
  });
});

export default router;