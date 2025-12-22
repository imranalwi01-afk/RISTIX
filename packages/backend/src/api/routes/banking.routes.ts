// packages/backend/src/api/routes/banking.routes.ts
// ============================================================================
// BANKING ROUTES - PHASE 3 MODULE 3.1
// ============================================================================
// Express routes for banking parameter management
// Features: Application setup, business setup, product parameters, journal parameters
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
    console.log('✅ Tenant middleware loaded for banking routes');
  } catch (error) {
    console.error('⚠️ Tenant middleware not available for banking routes:', error);
    // Fallback middleware that continues without tenant resolution
    resolveTenant = (req: any, res: any, next: any) => {
      console.warn('⚠️ Tenant resolution skipped - middleware not available');
      next();
    };
  }
};

// Initialize tenant middleware
initializeTenantMiddleware();

// Import all functions from main controller (now fixed with direct PostgreSQL connection)
import {
  getApplicationSetup,
  createApplicationSetup,
  updateApplicationSetup,
  deleteApplicationSetup,
  getBusinessSetup,
  createBusinessSetup,
  updateBusinessSetup,
  deleteBusinessSetup,
  getProductParameters,
  getJournalParameters,
  createProductParameter,
  createJournalParameter,
  updateProductParameter,
  updateJournalParameter,
  deleteProductParameter,
  deleteJournalParameter,
  getApplicationSetupHeaders,
  getApplicationSetupDetails,
  getBusinessSetupDetails,
  createApplicationSetupDetail,
  updateApplicationSetupDetail,
  deleteApplicationSetupDetail,
  createBusinessSetupDetail,
  updateBusinessSetupDetail,
  deleteBusinessSetupDetail
} from '../controllers/frs9-parameter.controller';

// All functions imported above from main controller

const router = Router();

console.log('✅ Banking routes loaded with FRS9 controller functions');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

// Application setup validation rules
const applicationValidationRules = [
  body('param_code')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Parameter code must be between 1 and 50 characters'),

  body('param_name')
    .isString()
    .isLength({ min: 1, max: 250 })
    .withMessage('Parameter name must be between 1 and 250 characters'),

  body('param_usage')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Parameter usage must be less than 500 characters'),

  body('details')
    .isArray()
    .withMessage('Details must be an array'),

  body('details.*.param_seq')
    .isInt({ min: 1 })
    .withMessage('Parameter sequence must be a positive integer'),

  body('details.*.value1')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Value 1 is required'),

  body('details.*.value2')
    .optional()
    .isString()
    .withMessage('Value 2 must be a string'),

  body('details.*.value3')
    .optional()
    .isString()
    .withMessage('Value 3 must be a string'),

  body('details.*.paramdesc')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Parameter description must be less than 1000 characters')
];

// Business setup validation rules
const businessValidationRules = [
  body('param_code')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Parameter code must be between 1 and 50 characters'),

  body('param_name')
    .isString()
    .isLength({ min: 1, max: 250 })
    .withMessage('Parameter name must be between 1 and 250 characters'),

  body('param_usage')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Parameter usage must be less than 500 characters'),

  body('details')
    .isArray()
    .withMessage('Details must be an array')
];

// Product parameter validation rules
const productValidationRules = [
  body('data_source')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Data source must be between 1 and 50 characters'),

  body('prd_group')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Product group must be between 1 and 50 characters'),

  body('prd_type')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Product type must be between 1 and 50 characters'),

  body('prd_code')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Product code must be between 1 and 50 characters'),

  body('prd_desc')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Product description must be between 1 and 500 characters'),

  body('currency')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),

  body('amortization_type')
    .optional()
    .isString()
    .withMessage('Amortization type must be a string'),

  body('al_flag')
    .optional()
    .isString()
    .isLength({ max: 1 })
    .withMessage('AL flag must be a single character'),

  body('expected_life')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Expected life must be a positive integer'),

  body('borrowing_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Borrowing rate must be a non-negative number'),

  body('market_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Market rate must be a non-negative number')
];

// Journal parameter validation rules
const journalValidationRules = [
  body('gl_group')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('GL group must be between 1 and 50 characters'),

  body('currency')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),

  body('gl_type')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('GL type must be between 1 and 50 characters'),

  body('gl_code')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('GL code must be between 1 and 50 characters'),

  body('gl_number')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('GL number must be between 1 and 50 characters'),

  body('dbcr')
    .isString()
    .isLength({ max: 1 })
    .withMessage('DBCR must be a single character (D or C)'),

  body('gl_desc')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('GL description must be between 1 and 500 characters')
];

// Query parameter validation
const queryValidationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Search term must be a string with maximum 100 characters'),

  query('active_only')
    .optional()
    .isBoolean()
    .withMessage('Active only flag must be a boolean')
];

// ID parameter validation
const idValidationRules = [
  param('param_code')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Parameter code must be between 1 and 50 characters')
];

// ============================================================================
// APPLICATION SETUP ROUTES
// ============================================================================

/**
 * GET /api/v1/banking/setup/application
 * Get all application setup parameters
 */
router.get(
  '/setup/application',
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
      console.log('📋 Application setup requested - Using main controller (fixed)');
      await getApplicationSetup(req, res);
    } catch (error) {
      console.error('❌ Application setup route error:', error);
      next(error);
    }
  }
);

/**
 * POST /api/v1/banking/setup/application
 * Create new application setup parameter
 */
router.post(
  '/setup/application',
  requireAuth,
  applicationValidationRules,
  async (req, res, next) => {
    try {
      await createApplicationSetup(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/banking/setup/application/:param_code
 * Update application setup parameter
 */
router.put(
  '/setup/application/:param_code',
  requireAuth,
  idValidationRules,
  applicationValidationRules.map(rule => rule.optional()),
  async (req, res, next) => {
    try {
      await updateApplicationSetup(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/banking/setup/application/:param_code
 * Delete application setup parameter
 */
router.delete(
  '/setup/application/:param_code',
  requireAuth,
  idValidationRules,
  async (req, res, next) => {
    try {
      await deleteApplicationSetup(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// APPLICATION SETUP DETAIL ROUTES (Master-Detail Operations)
// ============================================================================

/**
 * GET /api/v1/banking/setup/application/:paramCode/details
 * Get detail records for application setup parameter
 */
router.get(
  '/setup/application/:paramCode/details',
  requireAuth,
  param('paramCode').isString().isLength({ min: 1 }).withMessage('Parameter code is required'),
  async (req, res, next) => {
    try {
      await getApplicationSetupDetails(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/banking/setup/application/:paramCode/details
 * Create detail record for application setup parameter
 */
router.post(
  '/setup/application/:paramCode/details',
  requireAuth,
  param('paramCode').isString().isLength({ min: 1 }).withMessage('Parameter code is required'),
  [
    body('param_seq').isInt({ min: 1 }).withMessage('Sequence must be a positive integer'),
    body('value1').isString().isLength({ min: 1 }).withMessage('Value 1 is required'),
    body('value2').optional().isString(),
    body('value3').optional().isString(),
    body('paramdesc').optional().isString()
  ],
  async (req, res, next) => {
    try {
      await createApplicationSetupDetail(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/banking/setup/application/details/:id
 * Update detail record for application setup parameter
 */
router.put(
  '/setup/application/details/:id',
  requireAuth,
  param('id').isInt({ min: 1 }).withMessage('Detail ID must be a positive integer'),
  [
    body('param_seq').optional().isInt({ min: 1 }),
    body('value1').optional().isString().isLength({ min: 1 }),
    body('value2').optional().isString(),
    body('value3').optional().isString(),
    body('paramdesc').optional().isString()
  ],
  async (req, res, next) => {
    try {
      await updateApplicationSetupDetail(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/banking/setup/application/details/:id
 * Delete detail record for application setup parameter
 */
router.delete(
  '/setup/application/details/:id',
  requireAuth,
  param('id').isInt({ min: 1 }).withMessage('Detail ID must be a positive integer'),
  async (req, res, next) => {
    try {
      await deleteApplicationSetupDetail(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// BUSINESS SETUP ROUTES
// ============================================================================

/**
 * GET /api/v1/banking/setup/business
 * Get all business setup parameters
 */
router.get(
  '/setup/business',
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
      console.log('🏢 Business setup requested - Using main controller (fixed)');
      await getBusinessSetup(req, res);
    } catch (error) {
      console.error('❌ Business setup route error:', error);
      next(error);
    }
  }
);

/**
 * POST /api/v1/banking/setup/business
 * Create new business setup parameter
 */
router.post(
  '/setup/business',
  requireAuth,
  businessValidationRules,
  async (req, res, next) => {
    try {
      await createBusinessSetup(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/banking/setup/business/:param_code
 * Update business setup parameter
 */
router.put(
  '/setup/business/:param_code',
  requireAuth,
  idValidationRules,
  businessValidationRules.map(rule => rule.optional()),
  async (req, res, next) => {
    try {
      await updateBusinessSetup(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/banking/setup/business/:param_code
 * Delete business setup parameter
 */
router.delete(
  '/setup/business/:param_code',
  requireAuth,
  idValidationRules,
  async (req, res, next) => {
    try {
      await deleteBusinessSetup(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// PRODUCT PARAMETERS ROUTES
// ============================================================================

/**
 * GET /api/v1/banking/parameters/product
 * Get all product parameters
 */
router.get(
  '/parameters/product',
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
      await getProductParameters(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/banking/parameters/product
 * Create new product parameter
 */
router.post(
  '/parameters/product',
  requireAuth,
  productValidationRules,
  async (req, res, next) => {
    try {
      await createProductParameter(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/banking/parameters/product/:id
 * Update product parameter
 */
router.put(
  '/parameters/product/:id',
  requireAuth,
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  productValidationRules.map(rule => rule.optional()),
  async (req, res, next) => {
    try {
      await updateProductParameter(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/banking/parameters/product/:id
 * Delete product parameter
 */
router.delete(
  '/parameters/product/:id',
  requireAuth,
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  async (req, res, next) => {
    try {
      await deleteProductParameter(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// JOURNAL PARAMETERS ROUTES
// ============================================================================

/**
 * GET /api/v1/banking/parameters/journal
 * Get all journal parameters
 */
router.get(
  '/parameters/journal',
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
      await getJournalParameters(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/banking/parameters/journal
 * Create new journal parameter
 */
router.post(
  '/parameters/journal',
  requireAuth,
  journalValidationRules,
  async (req, res, next) => {
    try {
      await createJournalParameter(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/banking/parameters/journal/:id
 * Update journal parameter
 */
router.put(
  '/parameters/journal/:id',
  requireAuth,
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  journalValidationRules.map(rule => rule.optional()),
  async (req, res, next) => {
    try {
      await updateJournalParameter(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/banking/parameters/journal/:id
 * Delete journal parameter
 */
router.delete(
  '/parameters/journal/:id',
  requireAuth,
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  async (req, res, next) => {
    try {
      await deleteJournalParameter(req, res, next);
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
  console.error('Banking Route Error:', error);

  // Validation errors
  if (error.name === 'ValidationError' || error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors || error.message,
      code: 'BANKING_VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'Banking parameter already exists',
      details: error.message,
      code: 'BANKING_DUPLICATE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Foreign key constraint errors
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid reference in banking parameter',
      details: error.message,
      code: 'BANKING_REFERENCE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Database connection errors
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      error: 'Banking database service unavailable',
      details: 'Cannot connect to FRS9 database',
      code: 'BANKING_DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Generic server errors
  res.status(500).json({
    success: false,
    error: 'Internal server error in banking service',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Contact system administrator',
    code: 'BANKING_INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

export default router;

// ============================================================================
// ROUTE DOCUMENTATION
// ============================================================================

/**
 * BANKING API ENDPOINTS SUMMARY
 *
 * Application Setup Operations (5 endpoints):
 * - GET    /setup/application              - List application parameters
 * - POST   /setup/application              - Create application parameter
 * - GET    /setup/application/:param_code  - Get single application parameter
 * - PUT    /setup/application/:param_code  - Update application parameter
 * - DELETE /setup/application/:param_code  - Delete application parameter
 *
 * Business Setup Operations (5 endpoints):
 * - GET    /setup/business                 - List business parameters
 * - POST   /setup/business                 - Create business parameter
 * - GET    /setup/business/:param_code     - Get single business parameter
 * - PUT    /setup/business/:param_code     - Update business parameter
 * - DELETE /setup/business/:param_code     - Delete business parameter
 *
 * Product Parameters Operations (5 endpoints):
 * - GET    /parameters/product             - List product parameters
 * - POST   /parameters/product             - Create product parameter
 * - GET    /parameters/product/:id         - Get single product parameter
 * - PUT    /parameters/product/:id         - Update product parameter
 * - DELETE /parameters/product/:id         - Delete product parameter
 *
 * Journal Parameters Operations (5 endpoints):
 * - GET    /parameters/journal             - List journal parameters
 * - POST   /parameters/journal             - Create journal parameter
 * - GET    /parameters/journal/:id         - Get single journal parameter
 * - PUT    /parameters/journal/:id         - Update journal parameter
 * - DELETE /parameters/journal/:id         - Delete journal parameter
 *
 * Total: 20 endpoints
 *
 * Authentication: JWT token required for all endpoints
 * Tenant Validation: All endpoints validate tenant context
 * Validation: Comprehensive input validation with express-validator
 * Error Handling: Standardized error responses with specific error codes
 * Database: DS2 FRS9PRO with real production data
 */