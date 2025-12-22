// packages/backend/src/api/routes/role-management.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { roleManagementController } from '../controllers/role-management.controller';
import { validateTenantContext, checkPermissions, TenantRoleRequest } from '../middleware/tenant-role-context.middleware';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Role Management Routes
 * Provides REST API endpoints for role and permission management
 * All routes require authentication and proper tenant context
 */

const router = Router();

// Apply authentication to all routes first
router.use(authenticateToken);

// Apply tenant validation after authentication
router.use(validateTenantContext);

/**
 * GET /api/v1/roles
 * Get all roles for current tenant with filtering and pagination
 */
router.get(
  '/',
  [
    // Validation
    query('type')
      .optional()
      .isIn(['SYSTEM', 'BANKING', 'CUSTOM'])
      .withMessage('Invalid role type'),
    query('level')
      .optional()
      .isIn(['PLATFORM', 'TENANT', 'DEPARTMENT'])
      .withMessage('Invalid role level'),
    query('bankingAccess')
      .optional()
      .isIn(['CONVENTIONAL', 'SYARIAH', 'BOTH'])
      .withMessage('Invalid banking access type'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
    query('search')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be 1-100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  // Permission check - Allow banking managers and users with appropriate permissions
  checkPermissions(['role:read', 'admin:read', 'banking.read', 'users.read']),
  // Controller
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log('🔍 DEBUG: Role endpoint reached, user:', req.user ? 'authenticated' : 'NOT authenticated');
    console.log('🔍 DEBUG: Tenant:', req.tenant ? req.tenant.slug : 'NO tenant context');
    await roleManagementController.getRoles(req, res, next);
  }
);

/**
 * POST /api/v1/roles
 * Create a new role
 */
router.post(
  '/',
  [
    // Validation
    body('name')
      .isString()
      .isLength({ min: 2, max: 100 })
      .matches(/^[A-Z_][A-Z0-9_]*$/)
      .withMessage('Role name must be uppercase alphanumeric with underscores'),
    body('displayName')
      .optional()
      .isString()
      .isLength({ min: 2, max: 200 })
      .withMessage('Display name must be 2-200 characters'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('type')
      .optional()
      .isIn(['SYSTEM', 'BANKING', 'CUSTOM'])
      .withMessage('Invalid role type'),
    body('level')
      .optional()
      .isIn(['PLATFORM', 'TENANT', 'DEPARTMENT'])
      .withMessage('Invalid role level'),
    body('bankingAccess')
      .optional()
      .isIn(['CONVENTIONAL', 'SYARIAH', 'BOTH'])
      .withMessage('Invalid banking access type'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
  ],
  // Permission check - requires high-level permissions
  checkPermissions(['role:create', 'admin:write']),
  // Controller
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await roleManagementController.createRole(req, res, next);
  }
);

/**
 * PUT /api/v1/roles/:roleId
 * Update an existing role
 */
router.put(
  '/:roleId',
  [
    // Parameter validation
    param('roleId')
      .isUUID()
      .withMessage('Invalid role ID format'),
    // Body validation
    body('name')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .matches(/^[A-Z_][A-Z0-9_]*$/)
      .withMessage('Role name must be uppercase alphanumeric with underscores'),
    body('displayName')
      .optional()
      .isString()
      .isLength({ min: 2, max: 200 })
      .withMessage('Display name must be 2-200 characters'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('bankingAccess')
      .optional()
      .isIn(['CONVENTIONAL', 'SYARIAH', 'BOTH'])
      .withMessage('Invalid banking access type'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
  ],
  // Permission check
  checkPermissions(['role:write', 'admin:write']),
  // Controller
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await roleManagementController.updateRole(req, res, next);
  }
);

/**
 * DELETE /api/v1/roles/:roleId
 * Delete (soft delete) a role
 */
router.delete(
  '/:roleId',
  [
    // Parameter validation
    param('roleId')
      .isUUID()
      .withMessage('Invalid role ID format'),
  ],
  // Permission check - requires highest level permissions
  checkPermissions(['role:delete', 'admin:delete']),
  // Controller
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await roleManagementController.deleteRole(req, res, next);
  }
);

/**
 * GET /api/v1/permissions
 * Get all available permissions for the current tenant
 */
router.get(
  '/permissions',
  [
    // No additional validation needed
  ],
  // Permission check - Allow banking managers and users with appropriate permissions
  checkPermissions(['role:read', 'admin:read', 'banking.read', 'users.read']),
  // Controller
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await roleManagementController.getPermissions(req, res, next);
  }
);

/**
 * PUT /api/v1/roles/:roleId/permissions
 * Update permissions for a specific role
 */
router.put(
  '/:roleId/permissions',
  [
    // Parameter validation
    param('roleId')
      .isUUID()
      .withMessage('Invalid role ID format'),
    // Body validation
    body('permissions')
      .isArray()
      .withMessage('Permissions must be an array'),
    body('permissions.*')
      .isString()
      .withMessage('Each permission must be a string'),
  ],
  // Permission check - requires critical permissions
  checkPermissions(['role:permissions', 'admin:critical']),
  // Controller
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await roleManagementController.updateRolePermissions(req, res, next);
  }
);

/**
 * POST /api/v1/roles/:roleId/toggle
 * Toggle role active status (enable/disable)
 */
router.post(
  '/:roleId/toggle',
  [
    // Parameter validation
    param('roleId')
      .isUUID()
      .withMessage('Invalid role ID format'),
  ],
  // Permission check
  checkPermissions(['role:write', 'admin:write']),
  // Controller - using update controller with isActive toggle
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Get current role status first
    try {
      const tenantContext = (req as TenantRoleRequest).tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      const roleQuery = 'SELECT is_active FROM core.roles WHERE id = $1';
      const result = await tenantContext.database.query(roleQuery, [req.params.roleId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Role not found'
        });
      }

      // Toggle the active status
      const currentStatus = result.rows[0].is_active;
      req.body = { isActive: !currentStatus };
      
      await roleManagementController.updateRole(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/roles/:roleId/users
 * Get users assigned to a specific role
 */
router.get(
  '/roles/:roleId/users',
  [
    // Parameter validation
    param('roleId')
      .isUUID()
      .withMessage('Invalid role ID format'),
  ],
  // Permission check
  checkPermissions(['role:read', 'user:read']),
  // Controller
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantContext = (req as TenantRoleRequest).tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      const { roleId } = req.params;

      // Get users assigned to this role
      const usersQuery = `
        SELECT 
          u.id,
          u.employee_id,
          u.employee_name,
          u.email,
          ur.assigned_at,
          ur.assigned_by
        FROM core.users u
        JOIN core.user_roles ur ON u.id = ur.user_id
        WHERE ur.role_id = $1
        ORDER BY ur.assigned_at DESC
      `;

      const result = await tenantContext.database.query(usersQuery, [roleId]);

      return res.json({
        success: true,
        data: result.rows,
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantContext.id,
          roleId,
          totalUsers: result.rows.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/roles/:roleId/users/:userId
 * Assign a role to a user
 */
router.post(
  '/roles/:roleId/users/:userId',
  [
    // Parameter validation
    param('roleId')
      .isUUID()
      .withMessage('Invalid role ID format'),
    param('userId')
      .isUUID()
      .withMessage('Invalid user ID format'),
  ],
  // Permission check
  checkPermissions(['role:assign', 'user:write']),
  // Controller
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantContext = (req as TenantRoleRequest).tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      const { roleId, userId } = req.params;

      // Check if assignment already exists
      const existingQuery = 'SELECT id FROM core.user_roles WHERE user_id = $1 AND role_id = $2';
      const existing = await tenantContext.database.query(existingQuery, [userId, roleId]);

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'User already assigned to this role'
        });
      }

      // Create assignment
      const assignQuery = `
        INSERT INTO core.user_roles (user_id, role_id, assigned_by, assigned_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `;

      await tenantContext.database.query(assignQuery, [userId, roleId, req.user?.id]);

      return res.status(201).json({
        success: true,
        message: 'Role assigned to user successfully',
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantContext.id,
          roleId,
          userId,
          assignedBy: req.user?.userId
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/roles/:roleId/users/:userId
 * Remove role assignment from a user
 */
router.delete(
  '/roles/:roleId/users/:userId',
  [
    // Parameter validation
    param('roleId')
      .isUUID()
      .withMessage('Invalid role ID format'),
    param('userId')
      .isUUID()
      .withMessage('Invalid user ID format'),
  ],
  // Permission check
  checkPermissions(['role:assign', 'user:write']),
  // Controller
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantContext = (req as TenantRoleRequest).tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      const { roleId, userId } = req.params;

      // Remove assignment
      const removeQuery = 'DELETE FROM core.user_roles WHERE user_id = $1 AND role_id = $2';
      const result = await tenantContext.database.query(removeQuery, [userId, roleId]);

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Role assignment not found'
        });
      }

      return res.json({
        success: true,
        message: 'Role assignment removed successfully',
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantContext.id,
          roleId,
          userId,
          removedBy: req.user?.userId
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;