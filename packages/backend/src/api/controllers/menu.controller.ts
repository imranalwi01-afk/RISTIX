// packages/backend/src/api/controllers/menu.controller.ts
// ============================================================================
// Database-Driven Menu Controller for IFRS9 Platform
// ============================================================================
// Generated: 2025-08-30
// Purpose: Dynamic menu configuration with multi-tenant and banking type support
// Methodology: Core Platform MVP - Database-Driven Menu Implementation
// Dependencies: DatabaseDrivenMenuService, tenant context, user permissions
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { DatabaseDrivenMenuService, MenuRenderContext } from '../../core/services/platform/database-driven-menu.service';
import { TenantRegistryService } from '../../core/services/tenant/tenant-registry.service';
import { AuditService } from '../../core/services/audit/audit.service';
import { logger } from '../../core/services/logging/winston.service';
import { IAFMenuInitializerService } from '../../core/services/menu/iaf-menu-initializer.service';

export class MenuController {
  constructor(
    private readonly menuService: DatabaseDrivenMenuService,
    private readonly tenantRegistryService: TenantRegistryService,
    private readonly auditService: AuditService,
    private readonly menuInitializer: IAFMenuInitializerService
  ) {}

  /**
   * Get hierarchical menu tree for current user context
   * GET /api/v1/menu/tree
   */
  async getMenuTree(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const tenant = (req as any).tenant;
      const { bankingMode = tenant?.banking_type || 'conventional', includeInactive = 'false' } = req.query;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User authentication required'
        });
      }

      logger.info('Fetching menu tree for user context', {
        userId: user.id,
        userType: user.user_type,
        tenantId: tenant?.id,
        bankingMode: bankingMode,
        includeInactive: includeInactive === 'true'
      });

      // Build menu render context
      const menuContext: MenuRenderContext = {
        user: {
          userId: user.id,
          userType: user.user_type || 'banking_staff',
          role: user.role || 'user',
          tenantId: tenant?.id,
          bankingType: bankingMode as string,
          permissions: user.permissions || []
        },
        platform: {
          version: process.env.APP_VERSION || '1.0.0',
          features: this.getPlatformFeatures(),
          environment: process.env.NODE_ENV || 'development'
        },
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          banking_type: tenant.banking_type,
          features: tenant.features || []
        } : undefined
      };

      // Get hierarchical menu tree
      const menuTree = await this.menuService.getMenuTreeForContext(menuContext, {
        includeInactive: includeInactive === 'true',
        bankingMode: bankingMode as string
      });

      // Count all menu items (including nested children)
      const countAllMenuItems = (items: any[]): number => {
        let count = 0;
        items.forEach(item => {
          count++;
          if (item.children && item.children.length > 0) {
            count += countAllMenuItems(item.children);
          }
        });
        return count;
      };

      const totalItemCount = countAllMenuItems(menuTree);

      res.json({
        success: true,
        data: menuTree,
        meta: {
          timestamp: new Date().toISOString(),
          userType: menuContext.user.userType,
          bankingType: menuContext.user.bankingType,
          tenantName: menuContext.tenant?.name,
          permissions: menuContext.user.permissions,
          itemCount: totalItemCount,
          cached: false
        }
      });

    } catch (error) {
      logger.error('Failed to get menu tree', {
        error: error.message,
        stack: error.stack,
        userId: (req as any).user?.id,
        bankingMode: req.query.bankingMode
      });
      next(error);
    }
  }

  /**
   * Get menu configuration for current user context
   * GET /api/v1/menu
   */
  async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User authentication required'
        });
      }

      logger.info('Fetching menu for user context', {
        userId: user.id,
        userType: user.user_type,
        tenantId: tenant?.id,
        bankingType: tenant?.banking_type
      });

      // Build menu render context
      const menuContext: MenuRenderContext = {
        user: {
          userId: user.id,
          userType: user.user_type || 'banking_staff',
          role: user.role || 'user',
          tenantId: tenant?.id,
          bankingType: tenant?.banking_type,
          permissions: user.permissions || []
        },
        platform: {
          version: process.env.APP_VERSION || '1.0.0',
          features: this.getPlatformFeatures(),
          environment: process.env.NODE_ENV || 'development'
        },
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          banking_type: tenant.banking_type,
          features: tenant.features || []
        } : undefined
      };

      // Get menu configuration
      const menuConfig = await this.menuService.getMenuForContext(menuContext);

      // Build breadcrumb for current route if provided
      const currentPath = req.query.currentPath as string;
      const breadcrumb = currentPath ? 
        await this.menuService.buildBreadcrumb(menuConfig, currentPath) : [];

      res.json({
        success: true,
        data: {
          menu: menuConfig,
          breadcrumb,
          context: {
            userType: menuContext.user.userType,
            bankingType: menuContext.user.bankingType,
            tenantName: menuContext.tenant?.name,
            permissions: menuContext.user.permissions
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: menuConfig.version,
          cached: false // Could implement caching later
        }
      });

    } catch (error) {
      logger.error('Failed to get menu configuration', {
        error: error.message,
        stack: error.stack,
        userId: (req as any).user?.id
      });
      next(error);
    }
  }

  /**
   * Get menu items for specific category or type
   * GET /api/v1/menu/items
   */
  async getMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        category,
        type = 'all',
        includeInactive = 'false',
        parentId = null
      } = req.query;

      const user = (req as any).user;
      const tenant = (req as any).tenant;

      logger.info('Fetching menu items', {
        category,
        type,
        includeInactive: includeInactive === 'true',
        parentId,
        userId: user?.id
      });

      const filters = {
        category: category as string,
        type: type as string,
        includeInactive: includeInactive === 'true',
        parentId: parentId as string,
        userType: user?.user_type,
        bankingType: tenant?.banking_type
      };

      const menuItems = await this.menuService.getMenuItems(filters);

      res.json({
        success: true,
        data: menuItems,
        meta: {
          timestamp: new Date().toISOString(),
          count: menuItems.length,
          filters
        }
      });

    } catch (error) {
      logger.error('Failed to get menu items', {
        error: error.message,
        filters: req.query
      });
      next(error);
    }
  }

  /**
   * Create new menu item
   * POST /api/v1/menu/items
   */
  async createMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const user = (req as any).user;
      const menuItemData = req.body;

      logger.info('Creating menu item', {
        title: menuItemData.title,
        type: menuItemData.type,
        userId: user?.id
      });

      const createdMenuItem = await this.menuService.createMenuItem({
        ...menuItemData,
        created_by: user?.id || 'system'
      });

      // Audit the menu item creation
      await this.auditService.log({
        userId: user?.id || 'system',
        action: 'MENU_ITEM_CREATED',
        entityType: 'menu_item',
        entityId: createdMenuItem.id,
        details: {
          title: menuItemData.title,
          type: menuItemData.type,
          url: menuItemData.url
        },
        severity: 'MEDIUM'
      });

      res.status(201).json({
        success: true,
        data: createdMenuItem,
        message: 'Menu item created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          createdBy: user?.id
        }
      });

    } catch (error) {
      logger.error('Failed to create menu item', {
        error: error.message,
        menuItemData: req.body
      });
      next(error);
    }
  }

  /**
   * Update menu item
   * PUT /api/v1/menu/items/:itemId
   */
  async updateMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { itemId } = req.params;
      const user = (req as any).user;
      const updateData = req.body;

      logger.info('Updating menu item', {
        itemId,
        userId: user?.id
      });

      const updatedMenuItem = await this.menuService.updateMenuItem(itemId, {
        ...updateData,
        updated_by: user?.id || 'system'
      });

      if (!updatedMenuItem) {
        return res.status(404).json({
          success: false,
          error: 'MENU_ITEM_NOT_FOUND',
          message: 'Menu item not found'
        });
      }

      // Audit the menu item update
      await this.auditService.log({
        userId: user?.id || 'system',
        action: 'MENU_ITEM_UPDATED',
        entityType: 'menu_item',
        entityId: itemId,
        details: {
          updatedFields: Object.keys(updateData)
        },
        severity: 'MEDIUM'
      });

      res.json({
        success: true,
        data: updatedMenuItem,
        message: 'Menu item updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          updatedBy: user?.id
        }
      });

    } catch (error) {
      logger.error('Failed to update menu item', {
        error: error.message,
        itemId: req.params.itemId
      });
      next(error);
    }
  }

  /**
   * Delete menu item
   * DELETE /api/v1/menu/items/:itemId
   */
  async deleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const user = (req as any).user;

      logger.info('Deleting menu item', {
        itemId,
        userId: user?.id
      });

      const deletedMenuItem = await this.menuService.deleteMenuItem(itemId);

      if (!deletedMenuItem) {
        return res.status(404).json({
          success: false,
          error: 'MENU_ITEM_NOT_FOUND',
          message: 'Menu item not found'
        });
      }

      // Audit the menu item deletion
      await this.auditService.log({
        userId: user?.id || 'system',
        action: 'MENU_ITEM_DELETED',
        entityType: 'menu_item',
        entityId: itemId,
        details: {
          title: deletedMenuItem.title,
          type: deletedMenuItem.type
        },
        severity: 'HIGH'
      });

      res.json({
        success: true,
        message: 'Menu item deleted successfully',
        meta: {
          timestamp: new Date().toISOString(),
          deletedBy: user?.id
        }
      });

    } catch (error) {
      logger.error('Failed to delete menu item', {
        error: error.message,
        itemId: req.params.itemId
      });
      next(error);
    }
  }

  /**
   * Get menu configurations
   * GET /api/v1/menu/configurations
   */
  async getMenuConfigurations(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        targetAudience,
        bankingMode,
        includeInactive = 'false'
      } = req.query;

      logger.info('Fetching menu configurations', {
        targetAudience,
        bankingMode,
        includeInactive: includeInactive === 'true'
      });

      const filters = {
        targetAudience: targetAudience as string,
        bankingMode: bankingMode as string,
        includeInactive: includeInactive === 'true'
      };

      const configurations = await this.menuService.getMenuConfigurations(filters);

      res.json({
        success: true,
        data: configurations,
        meta: {
          timestamp: new Date().toISOString(),
          count: configurations.length,
          filters
        }
      });

    } catch (error) {
      logger.error('Failed to get menu configurations', {
        error: error.message,
        filters: req.query
      });
      next(error);
    }
  }

  /**
   * Create menu configuration
   * POST /api/v1/menu/configurations
   */
  async createMenuConfiguration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const user = (req as any).user;
      const configData = req.body;

      logger.info('Creating menu configuration', {
        name: configData.name,
        targetAudience: configData.target_audience,
        userId: user?.id
      });

      const createdConfig = await this.menuService.createMenuConfiguration({
        ...configData,
        created_by: user?.id || 'system'
      });

      // Audit the menu configuration creation
      await this.auditService.log({
        userId: user?.id || 'system',
        action: 'MENU_CONFIG_CREATED',
        entityType: 'menu_configuration',
        entityId: createdConfig.id,
        details: {
          name: configData.name,
          target_audience: configData.target_audience,
          banking_mode: configData.banking_mode
        },
        severity: 'MEDIUM'
      });

      res.status(201).json({
        success: true,
        data: createdConfig,
        message: 'Menu configuration created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          createdBy: user?.id
        }
      });

    } catch (error) {
      logger.error('Failed to create menu configuration', {
        error: error.message,
        configData: req.body
      });
      next(error);
    }
  }

  /**
   * Get breadcrumb for current path
   * GET /api/v1/menu/breadcrumb
   */
  async getBreadcrumb(req: Request, res: Response, next: NextFunction) {
    try {
      const { path } = req.query;
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      if (!path) {
        return res.status(400).json({
          success: false,
          error: 'PATH_REQUIRED',
          message: 'Path parameter is required'
        });
      }

      logger.info('Building breadcrumb', {
        path,
        userId: user?.id,
        tenantId: tenant?.id
      });

      // Build menu render context
      const menuContext: MenuRenderContext = {
        user: {
          userId: user?.id || 'system',
          userType: user?.user_type || 'banking_staff',
          role: user?.role || 'user',
          tenantId: tenant?.id,
          bankingType: tenant?.banking_type,
          permissions: user?.permissions || []
        },
        platform: {
          version: process.env.APP_VERSION || '1.0.0',
          features: this.getPlatformFeatures(),
          environment: process.env.NODE_ENV || 'development'
        },
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          banking_type: tenant.banking_type,
          features: tenant.features || []
        } : undefined
      };

      // Get current menu configuration
      const menuConfig = await this.menuService.getMenuForContext(menuContext);
      
      // Build breadcrumb
      const breadcrumb = await this.menuService.buildBreadcrumb(menuConfig, path as string);

      res.json({
        success: true,
        data: breadcrumb,
        meta: {
          timestamp: new Date().toISOString(),
          path,
          count: breadcrumb.length
        }
      });

    } catch (error) {
      logger.error('Failed to build breadcrumb', {
        error: error.message,
        path: req.query.path
      });
      next(error);
    }
  }

  /**
   * Clear menu cache
   * POST /api/v1/menu/cache/clear
   */
  async clearMenuCache(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { scope = 'all' } = req.body;

      logger.info('Clearing menu cache', {
        scope,
        userId: user?.id
      });

      const result = await this.menuService.clearCache(scope);

      // Audit the cache clear operation
      await this.auditService.log({
        userId: user?.id || 'system',
        action: 'MENU_CACHE_CLEARED',
        entityType: 'cache',
        entityId: 'menu_cache',
        details: { scope },
        severity: 'MEDIUM'
      });

      res.json({
        success: true,
        data: result,
        message: 'Menu cache cleared successfully',
        meta: {
          timestamp: new Date().toISOString(),
          scope,
          clearedBy: user?.id
        }
      });

    } catch (error) {
      logger.error('Failed to clear menu cache', {
        error: error.message
      });
      next(error);
    }
  }

  /**
   * Initialize IAF menu structure (Admin only)
   * POST /api/v1/menu/initialize-iaf
   */
  async initializeIAFMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User authentication required'
        });
      }

      logger.info('Initializing IAF menu structure', {
        userId: user.id,
        userType: user.user_type
      });

      // Check if menu already exists
      const menuExists = await this.menuInitializer.checkIAFMenuExists();

      if (menuExists) {
        logger.info('IAF menu structure already exists');

        const stats = await this.menuInitializer.getMenuStatistics();

        return res.json({
          success: true,
          message: 'IAF menu structure already exists',
          data: {
            alreadyExists: true,
            statistics: stats
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        });
      }

      // Initialize the menu structure
      const success = await this.menuInitializer.initializeIAFMenu();

      if (!success) {
        return res.status(500).json({
          success: false,
          error: 'INITIALIZATION_FAILED',
          message: 'Failed to initialize IAF menu structure'
        });
      }

      // Get statistics after initialization
      const stats = await this.menuInitializer.getMenuStatistics();

      // Audit the menu initialization
      await this.auditService.log({
        userId: user.id,
        action: 'IAF_MENU_INITIALIZED',
        entityType: 'menu_configuration',
        entityId: 'iaf_menu_structure',
        details: {
          configurationsCount: stats.configurations,
          itemsCount: stats.items
        },
        severity: 'HIGH'
      });

      // Clear menu cache to force refresh
      await this.menuService.clearCache('all');

      res.json({
        success: true,
        message: 'IAF menu structure initialized successfully',
        data: {
          alreadyExists: false,
          statistics: stats
        },
        meta: {
          timestamp: new Date().toISOString(),
          initializedBy: user.id
        }
      });

    } catch (error) {
      logger.error('Failed to initialize IAF menu structure', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        userId: (req as any).user?.id
      });
      next(error);
    }
  }

  /**
   * Reinitialize IAF menu structure (Admin only)
   * POST /api/v1/menu/reinitialize-iaf
   */
  async reinitializeIAFMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User authentication required'
        });
      }

      logger.info('Reinitializing IAF menu structure', {
        userId: user.id,
        userType: user.user_type
      });

      // Clear existing menu structure
      const cleared = await this.menuInitializer.clearMenuStructure();

      if (!cleared) {
        return res.status(500).json({
          success: false,
          error: 'CLEAR_FAILED',
          message: 'Failed to clear existing menu structure'
        });
      }

      // Initialize the menu structure
      const success = await this.menuInitializer.initializeIAFMenu();

      if (!success) {
        return res.status(500).json({
          success: false,
          error: 'INITIALIZATION_FAILED',
          message: 'Failed to initialize IAF menu structure'
        });
      }

      // Get statistics after reinitialization
      const stats = await this.menuInitializer.getMenuStatistics();

      // Audit the menu reinitialization
      await this.auditService.log({
        userId: user.id,
        action: 'IAF_MENU_REINITIALIZED',
        entityType: 'menu_configuration',
        entityId: 'iaf_menu_structure',
        details: {
          configurationsCount: stats.configurations,
          itemsCount: stats.items
        },
        severity: 'HIGH'
      });

      // Clear menu cache to force refresh
      await this.menuService.clearCache('all');

      res.json({
        success: true,
        message: 'IAF menu structure reinitialized successfully',
        data: {
          statistics: stats
        },
        meta: {
          timestamp: new Date().toISOString(),
          reinitializedBy: user.id
        }
      });

    } catch (error) {
      logger.error('Failed to reinitialize IAF menu structure', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        userId: (req as any).user?.id
      });
      next(error);
    }
  }

  /**
   * Get platform features for menu context
   */
  private getPlatformFeatures(): string[] {
    return [
      'multi_tenant',
      'dual_banking',
      'ifrs9_calculations',
      'r_analytics',
      'audit_trail',
      'workflow_management',
      'advanced_reporting'
    ];
  }
}

// Validation rules for menu endpoints
export const menuValidation = {
  createMenuItem: [
    body('key').isString().isLength({ min: 1 }).withMessage('Menu key is required'),
    body('title').isString().isLength({ min: 1 }).withMessage('Menu title is required'),
    body('type').isIn(['group', 'item', 'divider']).withMessage('Invalid menu type'),
    body('sort_order').isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    body('is_active').isBoolean().withMessage('Active status must be boolean')
  ],

  updateMenuItem: [
    param('itemId').isUUID().withMessage('Invalid item ID'),
    body('title').optional().isString().isLength({ min: 1 }).withMessage('Title must be non-empty string'),
    body('type').optional().isIn(['group', 'item', 'divider']).withMessage('Invalid menu type'),
    body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be non-negative integer'),
    body('is_active').optional().isBoolean().withMessage('Active status must be boolean')
  ],

  createConfiguration: [
    body('name').isString().isLength({ min: 1 }).withMessage('Configuration name is required'),
    body('target_audience').isIn([
      'banking_staff', 'consultant', 'regulator', 'platform_admin'
    ]).withMessage('Invalid target audience'),
    body('banking_mode').optional().isIn([
      'conventional', 'syariah', 'dual'
    ]).withMessage('Invalid banking mode'),
    body('is_active').isBoolean().withMessage('Active status must be boolean')
  ],

  initializeIAFMenu: [
    // No validation required - uses user authentication
  ],

  reinitializeIAFMenu: [
    body('confirm').optional().isBoolean().withMessage('Confirm must be boolean'),
    body('force').optional().isBoolean().withMessage('Force must be boolean')
  ]
};

export default MenuController;