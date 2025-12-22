// packages/backend/src/api/routes/user-registration.routes.ts
// =================================================================
// 🚀 USER REGISTRATION API ROUTES
// =================================================================
// Purpose: API endpoints for user registration in both databases
// Target Databases: Platform Admin + IAF Tenant
// =================================================================

import { Router } from 'express';
import { UserRegistrationController } from '../controllers/user-registration.controller';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();
const userRegistrationController = new UserRegistrationController();

/**
 * @route   POST /api/v1/register/superadmin
 * @desc    Register superadmin@iaf.co.id user in both databases
 * @access  Public (initial setup)
 */
router.post(
  '/superadmin',
  [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
  ],
  validateRequest,
  userRegistrationController.registerSuperAdmin.bind(userRegistrationController)
);

/**
 * @route   POST /api/v1/register/admin
 * @desc    Register admin@iaf.co.id user in both databases
 * @access  Public (initial setup)
 */
router.post(
  '/admin',
  [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
  ],
  validateRequest,
  userRegistrationController.registerAdmin.bind(userRegistrationController)
);

/**
 * @route   POST /api/v1/register/test-superadmin-login
 * @desc    Test superadmin login functionality
 * @access  Public (testing)
 */
router.post(
  '/test-superadmin-login',
  userRegistrationController.testSuperAdminLogin.bind(userRegistrationController)
);

/**
 * @route   POST /api/v1/register/test-admin-login
 * @desc    Test admin login functionality
 * @access  Public (testing)
 */
router.post(
  '/test-admin-login',
  userRegistrationController.testAdminLogin.bind(userRegistrationController)
);

/**
 * @route   GET /api/v1/register/health
 * @desc    Health check for user registration service
 * @access  Public
 */
router.get(
  '/health',
  userRegistrationController.healthCheck.bind(userRegistrationController)
);

/**
 * @route   DELETE /api/v1/register/cleanup
 * @desc    Cleanup database connections
 * @access  Private (maintenance)
 */
router.delete(
  '/cleanup',
  authenticateUser,
  userRegistrationController.cleanup.bind(userRegistrationController)
);

export default router;