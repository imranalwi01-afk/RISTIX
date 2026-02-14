// ============================================================================
// COMPREHENSIVE MENU ROUTES - DATABASE-DRIVEN SYSTEM
// ============================================================================
// File Path: packages/backend/src/api/routes/menu/menu.routes.ts
// Purpose: Express routes for database-driven menu system
// Dependencies: Express, MenuController, Authentication
// ============================================================================

import { Router } from 'express';
import { MenuController } from '../../controllers/menu/menu.controller';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware';
import { resolveTenant } from '../../middleware/tenant.middleware';
import { rateLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();
const menuController = new MenuController();

// Middleware stack
const authMiddleware = [authenticateToken, resolveTenant, rateLimiter.general];
const adminMiddleware = [...authMiddleware, requireRoles(['IAF_TENANT_ADMIN'])];

/**
 * GET /api/menu/hierarchy
 * Get user menu hierarchy with role-based filtering
 */
router.get('/hierarchy',
  ...authMiddleware,
  async (req, res) => {
    await menuController.getUserMenuHierarchy(req, res);
  }
);

/**
 * GET /api/menu/tree
 * Alias for menu hierarchy endpoint
 */
router.get('/tree',
  ...authMiddleware,
  async (req, res) => {
    await menuController.getUserMenuHierarchy(req, res);
  }
);

/**
 * POST /api/menu
 * Create new menu item (admin only)
 */
router.post('/',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.createMenuItem(req, res);
  }
);

/**
 * PUT /api/menu/:id
 * Update menu item (admin only)
 */
router.put('/:id',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.updateMenuItem(req, res);
  }
);

/**
 * DELETE /api/menu/:id
 * Delete menu item (admin only)
 */
router.delete('/:id',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.deleteMenuItem(req, res);
  }
);

/**
 * POST /api/menu/user/customization
 * Update user menu customizations
 */
router.post('/user/customization',
  ...authMiddleware,
  async (req, res) => {
    await menuController.updateUserCustomization(req, res);
  }
);

/**
 * GET /api/menu/analytics
 * Get menu access analytics (admin/analytics only)
 */
router.get('/analytics',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.getMenuAnalytics(req, res);
  }
);

/**
 * GET /api/menu/management
 * Get all menu items for management (admin only)
 */
router.get('/management',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.getAllMenuItems(req, res);
  }
);

/**
 * GET /api/menu/management/configurations
 * Get all menu configurations (admin only)
 */
router.get('/management/configurations',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.getMenuConfigurations(req, res);
  }
);

/**
 * POST /api/menu/management/configurations
 * Create new menu configuration (admin only)
 */
router.post('/management/configurations',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.createMenuConfiguration(req, res);
  }
);

/**
 * GET /api/menu/management/tree
 * Get complete menu tree structure (admin only)
 */
router.get('/management/tree',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.getMenuTree(req, res);
  }
);

/**
 * PUT /api/menu/management/reorder
 * Reorder menu items (admin only)
 */
router.put('/management/reorder',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.reorderMenuItems(req, res);
  }
);

/**
 * GET /api/menu/management/user-customizations
 * Get user menu customizations (admin only)
 */
router.get('/management/user-customizations',
  ...adminMiddleware,
  async (req, res) => {
    await menuController.getUserCustomizations(req, res);
  }
);

/**
 * GET /api/menu/health
 * Health check endpoint
 */
router.get('/health',
  async (req, res) => {
    await menuController.healthCheck(req, res);
  }
);

export default router;
