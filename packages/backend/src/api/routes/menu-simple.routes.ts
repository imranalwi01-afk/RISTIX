// packages/backend/src/api/routes/menu-simple.routes.ts
// Simple menu management API routes for IAF project

import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { menuSimpleController } from '../controllers/menu-simple.controller';

const router = Router();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================
// All menu routes require authentication
router.use((req, res, next) => {
  // Simple auth middleware - replace with actual auth middleware
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }
  next();
});

// ============================================================================
// MENU ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/menu/tree
 * Get menu tree for authenticated user
 * Query params: bankingMode, includeInactive, parentId, level
 */
router.get('/tree', [
  query('bankingMode').optional().isIn(['conventional', 'syariah', 'dual']).withMessage('Invalid banking mode'),
  query('includeInactive').optional().isBoolean().withMessage('Include inactive must be boolean'),
  query('parentId').optional().isUUID().withMessage('Parent ID must be valid UUID'),
  query('level').optional().isInt({ min: 0 }).withMessage('Level must be non-negative integer')
], menuSimpleController.getMenuTree.bind(menuSimpleController));

/**
 * GET /api/v1/menu
 * Get all menu items (flat list with pagination)
 * Query params: page, limit, search, bankingMode, includeInactive, parentId, level
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().isLength({ max: 255 }).withMessage('Search term too long'),
  query('bankingMode').optional().isIn(['conventional', 'syariah', 'dual']).withMessage('Invalid banking mode'),
  query('includeInactive').optional().isBoolean().withMessage('Include inactive must be boolean'),
  query('parentId').optional().isUUID().withMessage('Parent ID must be valid UUID'),
  query('level').optional().isInt({ min: 0 }).withMessage('Level must be non-negative integer')
], menuSimpleController.getMenuItems.bind(menuSimpleController));

/**
 * GET /api/v1/menu/:id
 * Get menu item by ID
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid menu item ID')
], menuSimpleController.getMenuItem.bind(menuSimpleController));

/**
 * POST /api/v1/menu
 * Create new menu item (Admin only)
 * Body: CreateMenuItemRequest
 */
router.post('/', [
  body('code').isString().isLength({ min: 1, max: 100 }).withMessage('Code is required (max 100 chars)'),
  body('label').isString().isLength({ min: 1, max: 255 }).withMessage('Label is required (max 255 chars)'),
  body('href').optional().isString().isLength({ max: 500 }).withMessage('URL too long (max 500 chars)'),
  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description too long (max 1000 chars)'),
  body('icon').optional().isString().isLength({ max: 100 }).withMessage('Icon name too long (max 100 chars)'),
  body('parent_id').optional().isUUID().withMessage('Parent ID must be valid UUID'),
  body('banking_modes').optional().isArray().custom((value) => {
    if (!Array.isArray(value)) return false;
    const validModes = ['conventional', 'syariah', 'dual'];
    return value.every((mode: string) => validModes.includes(mode));
  }).withMessage('Invalid banking modes'),
  body('roles').optional().isArray().custom((value) => {
    if (!Array.isArray(value)) return false;
    return value.every((role: string) => typeof role === 'string');
  }).withMessage('Invalid roles array'),
  body('badge').optional().isObject().withMessage('Badge must be an object'),
  body('status').optional().isIn(['active', 'warning', 'error', 'disabled']).withMessage('Invalid status'),
  body('is_new').optional().isBoolean().withMessage('Is new must be boolean'),
  body('requires_setup').optional().isBoolean().withMessage('Requires setup must be boolean'),
  body('target').optional().isIn(['_self', '_blank']).withMessage('Invalid target'),
  body('external_url').optional().isString().isLength({ max: 500 }).withMessage('External URL too long (max 500 chars)')
], menuSimpleController.createMenuItem.bind(menuSimpleController));

/**
 * PUT /api/v1/menu/:id
 * Update menu item (Admin only)
 * Body: UpdateMenuItemRequest
 */
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid menu item ID'),
  body('label').optional().isString().isLength({ min: 1, max: 255 }).withMessage('Label must be 1-255 chars'),
  body('href').optional().isString().isLength({ max: 500 }).withMessage('URL too long (max 500 chars)'),
  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description too long (max 1000 chars)'),
  body('icon').optional().isString().isLength({ max: 100 }).withMessage('Icon name too long (max 100 chars)'),
  body('parent_id').optional().isUUID().withMessage('Parent ID must be valid UUID'),
  body('banking_modes').optional().isArray().custom((value) => {
    if (!Array.isArray(value)) return false;
    const validModes = ['conventional', 'syariah', 'dual'];
    return value.every((mode: string) => validModes.includes(mode));
  }).withMessage('Invalid banking modes'),
  body('roles').optional().isArray().custom((value) => {
    if (!Array.isArray(value)) return false;
    return value.every((role: string) => typeof role === 'string');
  }).withMessage('Invalid roles array'),
  body('badge').optional().isObject().withMessage('Badge must be an object'),
  body('status').optional().isIn(['active', 'warning', 'error', 'disabled']).withMessage('Invalid status'),
  body('is_new').optional().isBoolean().withMessage('Is new must be boolean'),
  body('requires_setup').optional().isBoolean().withMessage('Requires setup must be boolean'),
  body('is_active').optional().isBoolean().withMessage('Active status must be boolean'),
  body('target').optional().isIn(['_self', '_blank']).withMessage('Invalid target'),
  body('external_url').optional().isString().isLength({ max: 500 }).withMessage('External URL too long (max 500 chars)')
], menuSimpleController.updateMenuItem.bind(menuSimpleController));

/**
 * DELETE /api/v1/menu/:id
 * Delete menu item (Admin only)
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid menu item ID')
], menuSimpleController.deleteMenuItem.bind(menuSimpleController));

/**
 * POST /api/v1/menu/reorder
 * Reorder menu items (Admin only)
 * Body: ReorderMenuItemsRequest
 */
router.post('/reorder', [
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.id').isUUID().withMessage('Item ID must be valid UUID'),
  body('items.*.sort_order').isInt({ min: 0 }).withMessage('Sort order must be non-negative integer')
], menuSimpleController.reorderMenuItems.bind(menuSimpleController));

/**
 * POST /api/v1/menu/initialize
 * Initialize default menu structure from hardcoded data (Admin only)
 */
router.post('/initialize', menuSimpleController.initializeMenuStructure.bind(menuSimpleController));

export default router;