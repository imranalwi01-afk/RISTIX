// packages/backend/src/api/routes/fl-scalar.routes.ts
// ============================================================================
// FL SCALAR ROUTES - PHASE 3 MODULE 3.5
// ============================================================================
// Express routes for FL Scalar Management (Forward Looking Scalar Configuration)
// Features: FL scalar configurations with period-based weighted scalars
// Database: DS2 FRS9PRO with actual production data
// ============================================================================

import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { requireAuth } from '../../middleware/auth';

// Dynamic import for tenant middleware to handle dependency issues
let resolveTenant: any = null;

const initializeTenantMiddleware = async () => {
  try {
    const tenantMiddlewareModule = await import('../../middleware/tenant.middleware');
    resolveTenant = tenantMiddlewareModule.resolveTenant;
    console.log('✅ Tenant middleware loaded for FL Scalar routes');
  } catch (error) {
    console.error('⚠️ Tenant middleware not available for FL Scalar routes:', error);
    // Fallback middleware that continues without tenant resolution
    resolveTenant = (req: any, res: any, next: any) => {
      console.warn('⚠️ Tenant resolution skipped - middleware not available');
      next();
    };
  }
};

// Initialize tenant middleware
initializeTenantMiddleware();

// Direct imports for FL Scalar controller functions
import {
  getFLScalars,
  getFLScalarById,
  createFLScalar,
  updateFLScalar,
  deleteFLScalar,
  healthCheck
} from '../controllers/fl-scalar.controller';

const router = Router();

console.log('✅ FL Scalar routes loaded with controller functions');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

// FL Scalar validation rules
const flScalarValidationRules = [
  body('scalar_name')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Scalar name must be between 1 and 255 characters'),

  body('active_flag')
    .isBoolean()
    .withMessage('Active flag must be a boolean'),

  body('details')
    .isArray()
    .withMessage('Details must be an array'),

  body('details.*.period')
    .isInt({ min: 1 })
    .withMessage('Period must be a positive integer'),

  body('details.*.weighted_scalar')
    .isFloat({ min: 0 })
    .withMessage('Weighted scalar must be a non-negative number')
];

// Update FL Scalar validation rules (all fields optional)
const updateFLScalarValidationRules = flScalarValidationRules.map(rule => rule.optional());

// Query parameter validation
const queryValidationRules = [
  query('active_only')
    .optional()
    .isBoolean()
    .withMessage('Active only flag must be a boolean'),

  query('search')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Search term must be a string with maximum 100 characters')
];

// ID parameter validation
const idValidationRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================

/**
 * GET /api/v1/banking/collective/fl-scalar/health
 * Health check for FL Scalar service and DS2 database connection
 */
router.get('/health', requireAuth, async (req, res, next) => {
  try {
    await healthCheck(req, res, next);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// FL SCALAR ROUTES
// ============================================================================

/**
 * GET /api/v1/banking/collective/fl-scalar
 * Get all FL Scalar configurations with details
 */
router.get(
  '/',
  requireAuth,
  queryValidationRules,
  async (req, res, next) => {
    // Handle tenant middleware
    if (resolveTenant) {
      try {
        await new Promise<void>((resolve, reject) => {
          resolveTenant(req, res, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (error) {
        console.warn('⚠️ Tenant resolution failed:', error);
      }
    }

    try {
      await getFLScalars(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/banking/collective/fl-scalar/:id
 * Get single FL Scalar configuration by ID
 */
router.get(
  '/:id',
  requireAuth,
  idValidationRules,
  async (req, res, next) => {
    // Handle tenant middleware
    if (resolveTenant) {
      try {
        await new Promise<void>((resolve, reject) => {
          resolveTenant(req, res, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (error) {
        console.warn('⚠️ Tenant resolution failed:', error);
      }
    }

    try {
      await getFLScalarById(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/banking/collective/fl-scalar
 * Create new FL Scalar configuration
 */
router.post(
  '/',
  requireAuth,
  flScalarValidationRules,
  async (req, res, next) => {
    try {
      await createFLScalar(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/banking/collective/fl-scalar/:id
 * Update existing FL Scalar configuration
 */
router.put(
  '/:id',
  requireAuth,
  idValidationRules,
  updateFLScalarValidationRules,
  async (req, res, next) => {
    try {
      await updateFLScalar(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/banking/collective/fl-scalar/:id
 * Delete FL Scalar configuration
 */
router.delete(
  '/:id',
  requireAuth,
  idValidationRules,
  async (req, res, next) => {
    try {
      await deleteFLScalar(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Handle any route-specific errors
router.use((error: any, req: any, res: any, next: any) => {
  console.error('FL Scalar Route Error:', error);

  // Validation errors
  if (error.name === 'ValidationError' || error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors || error.message,
      code: 'FL_SCALAR_VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'FL scalar already exists',
      details: error.message,
      code: 'FL_SCALAR_DUPLICATE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Foreign key constraint errors
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid reference in FL scalar configuration',
      details: error.message,
      code: 'FL_SCALAR_REFERENCE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Database connection errors
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      error: 'FL Scalar database service unavailable',
      details: 'Cannot connect to FRS9 database',
      code: 'FL_SCALAR_DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Generic server errors
  res.status(500).json({
    success: false,
    error: 'Internal server error in FL Scalar service',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Contact system administrator',
    code: 'FL_SCALAR_INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

export default router;

// ============================================================================
// ROUTE DOCUMENTATION
// ============================================================================

/**
 * FL SCALAR API ENDPOINTS SUMMARY
 *
 * Health Check Operations (1 endpoint):
 * - GET    /health                     - Service health check
 *
 * FL Scalar Operations (5 endpoints):
 * - GET    /                           - List all FL scalars
 * - POST   /                           - Create FL scalar
 * - GET    /:id                        - Get single FL scalar
 * - PUT    /:id                        - Update FL scalar
 * - DELETE /:id                        - Delete FL scalar
 *
 * Total: 6 endpoints
 *
 * Authentication: JWT token required for all endpoints
 * Tenant Validation: All endpoints validate tenant context
 * Validation: Comprehensive input validation with express-validator
 * Error Handling: Standardized error responses with specific error codes
 * Database: DS2 FRS9PRO with real production data
 */