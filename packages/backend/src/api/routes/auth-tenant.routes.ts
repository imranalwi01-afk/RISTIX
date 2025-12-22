// packages/backend/src/api/routes/auth-tenant.routes.ts
// ============================================================================
// IFRS9 Multi-Tenant Platform - Authentication & Tenant Discovery Routes
// ============================================================================
// Purpose: API routes for login data and tenant validation
// Integration: Live database integration for dynamic login functionality
// ============================================================================

import { Router } from 'express';
import { body, query } from 'express-validator';
import AuthTenantController from '../controllers/auth-tenant.controller';
import { TenantRegistryService } from '../../core/services/tenant/tenant-registry.service';
import { validateRequest } from '../middleware/validation.middleware';
import { rateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();
const tenantRegistryService = TenantRegistryService.getInstance();
const authTenantController = new AuthTenantController(tenantRegistryService);

/**
 * GET /api/v1/auth/login-data
 * Get login page data from live database (users + tenants)
 * Replaces hardcoded frontend arrays
 */
router.get('/login-data',
  rateLimiter.auth, // Apply auth rate limiting
  authTenantController.getLoginData.bind(authTenantController)
);

/**
 * POST /api/v1/auth/validate-tenant
 * Validate tenant selection during login
 */
router.post('/validate-tenant',
  rateLimiter.auth, // Apply auth rate limiting
  [
    body('tenantId')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Tenant ID is required')
      .matches(/^[a-z0-9_-]+$/)
      .withMessage('Tenant ID can only contain lowercase letters, numbers, underscores, and hyphens'),

    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail()
  ],
  validateRequest,
  authTenantController.validateTenantSelection.bind(authTenantController)
);

export default router;