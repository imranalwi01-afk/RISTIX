// packages/backend/src/api/controllers/menu-simple.controller.ts
// Simple menu management API controller for IAF project

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { menuService } from '../../core/services/menu.service';
import { ApiResponse, MenuQueryRequest, MenuHierarchyResponse, PaginatedResponse } from '../../types/menu.types';
import logger from '../../config/logger';

export class MenuSimpleController {

  /**
   * Get menu tree for authenticated user
   * GET /api/v1/menu/tree
   */
  async getMenuTree(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array(),
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      const {
        bankingMode,
        includeInactive = false,
        parentId,
        level
      } = req.query as MenuQueryRequest;

      // Get user info from JWT token
      const user = req.user as any;
      const userRole = user?.role || user?.userType || '';

      const menuTree = await menuService.getMenuTree({
        userRole,
        bankingMode: bankingMode as 'conventional' | 'syariah' | 'dual',
        includeInactive: includeInactive === 'true',
        parentId: parentId as string,
        level: level ? parseInt(level as string) : undefined
      });

      res.json({
        success: true,
        data: menuTree,
        message: 'Menu tree retrieved successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          tenantId: req.tenant?.id
        }
      } as ApiResponse<MenuHierarchyResponse[]>);

    } catch (error) {
      logger.error('Error getting menu tree:', error);
      next(error);
    }
  }

  /**
   * Get all menu items (flat list)
   * GET /api/v1/menu
   */
  async getMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array(),
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      const {
        page = 1,
        limit = 50,
        search,
        bankingMode,
        includeInactive = false,
        parentId,
        level
      } = req.query as MenuQueryRequest;

      // Get user info from JWT token
      const user = req.user as any;
      const userRole = user?.role || user?.userType || '';

      const menuTree = await menuService.getMenuTree({
        userRole,
        bankingMode: bankingMode as 'conventional' | 'syariah' | 'dual',
        includeInactive: includeInactive === 'true',
        parentId: parentId as string,
        level: level ? parseInt(level as string) : undefined
      });

      // Flatten tree for response
      const flattenMenuItems = (items: any[]): any[] => {
        const result: any[] = [];
        for (const item of items) {
          result.push(item);
          if (item.children && item.children.length > 0) {
            result.push(...flattenMenuItems(item.children));
          }
        }
        return result;
      };

      const flatItems = flattenMenuItems(menuTree);

      // Apply pagination
      const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
      const endIndex = startIndex + parseInt(limit as string);
      const paginatedItems = flatItems.slice(startIndex, endIndex);

      const totalPages = Math.ceil(flatItems.length / parseInt(limit as string));

      res.json({
        success: true,
        data: paginatedItems,
        message: 'Menu items retrieved successfully',
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: flatItems.length,
          totalPages
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          tenantId: req.tenant?.id
        }
      } as PaginatedResponse);

    } catch (error) {
      logger.error('Error getting menu items:', error);
      next(error);
    }
  }

  /**
   * Get menu item by ID
   * GET /api/v1/menu/:id
   */
  async getMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const menuItem = await menuService.getMenuItemById(id);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Menu item not found',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: menuItem,
        message: 'Menu item retrieved successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          tenantId: req.tenant?.id
        }
      } as ApiResponse);

    } catch (error) {
      logger.error(`Error getting menu item ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create new menu item
   * POST /api/v1/menu
   */
  async createMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array(),
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      const user = req.user as any;
      const menuData = {
        ...req.body,
        created_by: user?.id || user?.email || 'system'
      };

      const menuItem = await menuService.createMenuItem(menuData);

      res.status(201).json({
        success: true,
        data: menuItem,
        message: 'Menu item created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          tenantId: req.tenant?.id
        }
      } as ApiResponse);

    } catch (error) {
      logger.error('Error creating menu item:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      next(error);
    }
  }

  /**
   * Update menu item
   * PUT /api/v1/menu/:id
   */
  async updateMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array(),
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      const { id } = req.params;
      const user = req.user as any;
      const updateData = {
        ...req.body,
        updated_by: user?.id || user?.email || 'system'
      };

      const menuItem = await menuService.updateMenuItem(id, updateData);

      res.json({
        success: true,
        data: menuItem,
        message: 'Menu item updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          tenantId: req.tenant?.id
        }
      } as ApiResponse);

    } catch (error) {
      logger.error(`Error updating menu item ${req.params.id}:`, error);

      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      next(error);
    }
  }

  /**
   * Delete menu item
   * DELETE /api/v1/menu/:id
   */
  async deleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const success = await menuService.deleteMenuItem(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Menu item not found',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      res.json({
        success: true,
        message: 'Menu item deleted successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          tenantId: req.tenant?.id
        }
      } as ApiResponse);

    } catch (error) {
      logger.error(`Error deleting menu item ${req.params.id}:`, error);

      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      if (error instanceof Error && error.message.includes('children')) {
        return res.status(400).json({
          success: false,
          error: 'HAS_CHILDREN',
          message: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      next(error);
    }
  }

  /**
   * Initialize default menu structure
   * POST /api/v1/menu/initialize
   */
  async initializeMenuStructure(req: Request, res: Response, next: NextFunction) {
    try {
      await menuService.initializeDefaultMenuStructure();

      res.json({
        success: true,
        message: 'Default menu structure initialized successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          tenantId: req.tenant?.id
        }
      } as ApiResponse);

    } catch (error) {
      logger.error('Error initializing menu structure:', error);
      next(error);
    }
  }

  /**
   * Reorder menu items
   * POST /api/v1/menu/reorder
   */
  async reorderMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array(),
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        } as ApiResponse);
      }

      const { items } = req.body;

      const success = await menuService.reorderMenuItems(items);

      res.json({
        success,
        message: 'Menu items reordered successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          tenantId: req.tenant?.id
        }
      } as ApiResponse);

    } catch (error) {
      logger.error('Error reordering menu items:', error);
      next(error);
    }
  }
}

export const menuSimpleController = new MenuSimpleController();