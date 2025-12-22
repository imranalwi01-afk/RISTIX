// ============================================================================
// COMPREHENSIVE MENU CONTROLLER - DATABASE-DRIVEN SYSTEM
// ============================================================================
// File Path: packages/backend/src/api/controllers/menu/menu.controller.ts
// Purpose: REST API controller for database-driven menu system
// Dependencies: Express, MenuService
// ============================================================================

import { Request, Response } from 'express';
import { MenuService, MenuContext } from '../../../core/services/menu/menu.service';

export class MenuController {
  private readonly menuService: MenuService;

  constructor() {
    this.menuService = new MenuService();
  }

  /**
   * GET /api/menu/hierarchy
   * Get user menu hierarchy with role-based filtering
   */
  async getUserMenuHierarchy(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any; // From JWT middleware
      const { bankingType = 'dual', useCache = true } = req.query;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const context: MenuContext = {
        userId: user.userId || user.id,
        tenantId: user.tenantId,
        userRoles: user.roles || [],
        userType: user.userType || 'banking_staff',
        bankingType: bankingType as 'conventional' | 'syariah' | 'dual',
        tenantType: user.tenantType,
        permissions: user.permissions || []
      };

      const startTime = Date.now();
      const hierarchy = await this.menuService.getUserMenuHierarchy(context, useCache === 'true');
      const duration = Date.now() - startTime;

      res.json({
        success: true,
        data: hierarchy,
        message: 'Menu hierarchy retrieved successfully',
        timestamp: new Date(),
        meta: {
          count: hierarchy.length,
          bankingType,
          cached: useCache,
          duration
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get menu hierarchy:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_HIERARCHY_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * POST /api/menu
   * Create new menu item
   */
  async createMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const menuItem = await this.menuService.createMenuItem(req.body, user.userId || user.id);

      console.log(`Menu item created: ${menuItem.title} by user: ${user.userId}`);

      res.status(201).json({
        success: true,
        data: {
          id: menuItem.id,
          key: menuItem.key,
          title: menuItem.title,
          url: menuItem.url,
          createdAt: menuItem.created_at
        },
        message: 'Menu item created successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create menu item:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_CREATION_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * PUT /api/menu/:id
   * Update existing menu item
   */
  async updateMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const menuItem = await this.menuService.updateMenuItem(id, req.body, user.userId || user.id);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MENU_ITEM_NOT_FOUND',
            message: 'Menu item not found'
          }
        });
      }

      console.log(`Menu item updated: ${menuItem.title} by user: ${user.userId}`);

      res.json({
        success: true,
        data: {
          id: menuItem.id,
          key: menuItem.key,
          title: menuItem.title,
          url: menuItem.url,
          updatedAt: menuItem.updated_at
        },
        message: 'Menu item updated successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to update menu item:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_UPDATE_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * DELETE /api/menu/:id
   * Delete menu item
   */
  async deleteMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const deleted = await this.menuService.deleteMenuItem(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MENU_ITEM_NOT_FOUND',
            message: 'Menu item not found'
          }
        });
      }

      console.log(`Menu item deleted: ${id} by user: ${user.userId}`);

      res.json({
        success: true,
        message: 'Menu item deleted successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to delete menu item:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_DELETION_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * GET /api/menu/health
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const healthResult = await this.menuService.healthCheck();

      res.json({
        success: true,
        data: healthResult,
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Health check failed:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * POST /api/menu/user/customization
   * Update user menu customizations
   */
  async updateUserCustomization(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const { menuConfigId, customizations } = req.body;

      const customization = await this.menuService.updateUserCustomization(
        user.userId || user.id,
        user.tenantId,
        menuConfigId,
        customizations
      );

      res.json({
        success: true,
        data: customization,
        message: 'User menu customization updated successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to update user customization:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'USER_CUSTOMIZATION_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * GET /api/menu/analytics
   * Get menu access analytics
   */
  async getMenuAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const { menuItemId, userId, tenantId, startDate, endDate } = req.query;

      const analytics = await this.menuService.getMenuAccessAnalytics(
        menuItemId as string,
        userId as string,
        tenantId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: analytics,
        message: 'Menu analytics retrieved successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get menu analytics:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_ANALYTICS_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * GET /api/menu/management
   * Get all menu items for management (admin only)
   */
  async getAllMenuItems(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const { page = 1, limit = 50, search, activeOnly = false } = req.query;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const menuItems = await this.menuService.getAllMenuItems({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        activeOnly: activeOnly === 'true',
        includeInactive: true
      });

      res.json({
        success: true,
        data: menuItems.items,
        pagination: menuItems.pagination,
        message: 'Menu items retrieved successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get all menu items:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_ITEMS_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * GET /api/menu/management/configurations
   * Get all menu configurations (admin only)
   */
  async getMenuConfigurations(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const configurations = await this.menuService.getMenuConfigurations();

      res.json({
        success: true,
        data: configurations,
        message: 'Menu configurations retrieved successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get menu configurations:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_CONFIGS_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * POST /api/menu/management/configurations
   * Create new menu configuration (admin only)
   */
  async createMenuConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const configuration = await this.menuService.createMenuConfiguration(req.body, user.userId || user.id);

      res.status(201).json({
        success: true,
        data: configuration,
        message: 'Menu configuration created successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create menu configuration:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_CONFIG_CREATION_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * GET /api/menu/management/tree
   * Get complete menu tree structure (admin only)
   */
  async getMenuTree(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const { menuConfigId, includeInactive = false } = req.query;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const menuTree = await this.menuService.getMenuTree({
        menuConfigId: menuConfigId as string,
        includeInactive: includeInactive === 'true'
      });

      res.json({
        success: true,
        data: menuTree,
        message: 'Menu tree retrieved successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get menu tree:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_TREE_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * PUT /api/menu/management/reorder
   * Reorder menu items (admin only)
   */
  async reorderMenuItems(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const { items } = req.body;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const result = await this.menuService.reorderMenuItems(items, user.userId || user.id);

      res.json({
        success: true,
        data: result,
        message: 'Menu items reordered successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to reorder menu items:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_REORDER_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * GET /api/menu/management/user-customizations
   * Get user menu customizations (admin only)
   */
  async getUserCustomizations(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const { userId, tenantId } = req.query;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        });
      }

      const customizations = await this.menuService.getUserCustomizations(
        userId as string,
        tenantId as string
      );

      res.json({
        success: true,
        data: customizations,
        message: 'User customizations retrieved successfully',
        timestamp: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get user customizations:', errorMessage);

      res.status(500).json({
        success: false,
        error: {
          code: 'USER_CUSTOMIZATIONS_ERROR',
          message: errorMessage
        },
        timestamp: new Date()
      });
    }
  }
}
