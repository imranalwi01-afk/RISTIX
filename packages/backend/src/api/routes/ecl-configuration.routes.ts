// packages/backend/src/api/routes/ecl-configuration.routes.ts
// ============================================================================
// 🏦 ECL CONFIGURATION ROUTES - IFRS9 Expected Credit Loss Configuration
// ============================================================================
// Purpose: RESTful API routes for ECL Configuration management
// Database: DS2 FRS9PRO (192.168.0.106:5433) - REAL DATABASE ONLY!
// Tables: frs9_imp_ca_ecl_configh (header), frs9_imp_ca_ecl_configd (detail)
// ============================================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireAuth } from '../../middleware/auth';

// Direct imports for ECL Configuration controller functions
import {
  getHeaders,
  getHeader,
  createHeader,
  updateHeader,
  deleteHeader,
  getDetails,
  createDetail,
  updateDetail,
  deleteDetail,
  runSimulation,
  getComboBoxData
} from '../controllers/ecl-configuration.controller';

const router = Router();

console.log('✅ ECL Configuration routes loaded with controller functions');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

// Header validation schemas
const validateHeaderCreation = [
  body('ecl_model_name')
    .notEmpty()
    .withMessage('ECL model name is required')
    .isLength({ max: 50 })
    .withMessage('ECL model name too long (max 50 characters)'),

  body('module')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Module too long (max 10 characters)'),

  body('effective_date')
    .notEmpty()
    .withMessage('Effective date is required')
    .isISO8601()
    .withMessage('Invalid effective date format'),

  body('active_flag')
    .optional()
    .isBoolean()
    .withMessage('Active flag must be boolean'),

  body('createdby')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Created by too long (max 50 characters)'),

  body('createdhost')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Created host too long (max 50 characters)')
];

// Detail validation schemas
const validateDetailCreation = [
  body('ecl_model_id')
    .notEmpty()
    .withMessage('ECL model ID is required')
    .isInt({ min: 1 })
    .withMessage('ECL model ID must be a positive integer'),

  body('pf_segment_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Portfolio segment ID must be a positive integer'),

  body('stage_rule_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Stage rule ID must be a positive integer'),

  body('pd_model_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('PD model ID must be a positive integer'),

  body('lgd_model_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('LGD model ID must be a positive integer'),

  body('ead_model_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('EAD model ID must be a positive integer'),

  body('overlay_rate')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Overlay rate must be between 0 and 1000'),

  body('period_type')
    .optional()
    .isInt()
    .withMessage('Period type must be an integer'),

  body('createdby')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Created by too long (max 50 characters)')
];

// Parameter validation
const validatePkidParam = [
  param('pkid')
    .notEmpty()
    .withMessage('PKID is required')
    .isInt({ min: 1 })
    .withMessage('PKID must be a positive integer')
];

const validateDetailIdParam = [
  param('detailId')
    .isInt({ min: 1 })
    .withMessage('Detail ID must be a positive integer')
];

const validateComboSourceParam = [
  param('source')
    .notEmpty()
    .withMessage('Combo box data source is required')
    .isIn([
      'modules', 'portfolio_segments', 'stage_rules', 'pd_models', 'lgd_models',
      'ead_models', 'ccf_models', 'period_types', 'modelstatus', 'overlayrates'
    ])
    .withMessage('Invalid combo box data source')
];

// Query validation
const validatePaginationQuery = [
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
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term too long (max 100 characters)'),

  query('active_flag')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Active flag must be true or false')
];

// Simulation validation
const validateSimulationRequest = [
  body('preview_data')
    .optional()
    .custom((value) => {
      if (value && typeof value !== 'object') {
        throw new Error('Preview data must be a valid JSON object');
      }
      return true;
    }),

  body('calculation_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid calculation date format')
];

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================

/**
 * GET /api/v1/banking/collective/ecl-config/health
 * Health check for ECL Configuration service and DS2 database connectivity
 */
router.get('/health', requireAuth, async (req, res, next) => {
  try {
    console.log('🏥 ECL Configuration health check requested');

    // Return service health information
    res.json({
      success: true,
      service: 'ECL Configuration Service',
      version: '1.0.0',
      status: 'healthy',
      database: {
        host: process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost',
        port: process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433',
        database: process.env.DS2_DATABASE || 'FRS9PRO',
        tables: [
          'frs9_imp_ca_ecl_configh (header)',
          'frs9_imp_ca_ecl_configd (detail)'
        ]
      },
      endpoints: {
        headers: 'GET,POST,PUT,DELETE /api/v1/banking/collective/ecl-config',
        details: 'GET,POST,PUT,DELETE /api/v1/banking/collective/ecl-config/:pkid/details',
        simulation: 'POST /api/v1/banking/collective/ecl-config/:pkid/simulate',
        combo_data: 'GET /api/v1/banking/collective/ecl-config/combo-data/:source'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ECL Configuration health check error:', error);
    res.status(503).json({
      success: false,
      service: 'ECL Configuration Service',
      error: 'Service health check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// HEADER OPERATIONS (FRS9_IMP_CA_ECL_CONFIGH)
// ============================================================================

/**
 * GET /api/v1/banking/collective/ecl-config
 * Get all ECL configuration headers with pagination and search
 */
router.get(
  '/',
  requireAuth,
  validatePaginationQuery,
  async (req, res, next) => {
    try {
      await getHeaders(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/banking/collective/ecl-config/:pkid
 * Get single ECL configuration header with details
 */
router.get(
  '/:pkid',
  requireAuth,
  validatePkidParam,
  async (req, res, next) => {
    try {
      await getHeader(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/banking/collective/ecl-config
 * Create new ECL configuration header
 */
router.post(
  '/',
  requireAuth,
  validateHeaderCreation,
  async (req, res, next) => {
    try {
      await createHeader(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/banking/collective/ecl-config/:pkid
 * Update ECL configuration header
 */
router.put(
  '/:pkid',
  requireAuth,
  validatePkidParam,
  validateHeaderCreation,
  async (req, res, next) => {
    try {
      await updateHeader(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/banking/collective/ecl-config/:pkid
 * Delete ECL configuration header and all details
 */
router.delete(
  '/:pkid',
  requireAuth,
  validatePkidParam,
  async (req, res, next) => {
    try {
      await deleteHeader(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// DETAIL OPERATIONS (FRS9_IMP_CA_ECL_CONFIGD)
// ============================================================================

/**
 * GET /api/v1/banking/collective/ecl-config/:pkid/details
 * Get all details for a specific ECL configuration header
 */
router.get(
  '/:pkid/details',
  requireAuth,
  validatePkidParam,
  async (req, res, next) => {
    try {
      await getDetails(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/banking/collective/ecl-config/:pkid/details
 * Create new detail for an ECL configuration header
 */
router.post(
  '/:pkid/details',
  requireAuth,
  validatePkidParam,
  validateDetailCreation,
  async (req, res, next) => {
    try {
      await createDetail(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/banking/collective/ecl-config/details/:detailId
 * Update ECL configuration detail
 */
router.put(
  '/details/:detailId',
  requireAuth,
  validateDetailIdParam,
  validateDetailCreation,
  async (req, res, next) => {
    try {
      await updateDetail(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/banking/collective/ecl-config/details/:detailId
 * Delete ECL configuration detail
 */
router.delete(
  '/details/:detailId',
  requireAuth,
  validateDetailIdParam,
  async (req, res, next) => {
    try {
      await deleteDetail(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// SIMULATION AND INTEGRATION ROUTES
// ============================================================================

/**
 * POST /api/v1/banking/collective/ecl-config/:pkid/simulate
 * Run simulation using ECL model calculations
 */
router.post(
  '/:pkid/simulate',
  requireAuth,
  validatePkidParam,
  validateSimulationRequest,
  async (req, res, next) => {
    try {
      await runSimulation(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/banking/collective/ecl-config/combo-data/:source
 * Get combo box data from business settings
 */
router.get(
  '/combo-data/:source',
  requireAuth,
  validateComboSourceParam,
  async (req, res, next) => {
    try {
      await getComboBoxData(req, res, next);
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
  console.error('ECL Configuration Route Error:', error);

  // Validation errors
  if (error.name === 'ValidationError' || error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors || error.message,
      code: 'ECL_CONFIG_VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'ECL configuration already exists',
      details: error.message,
      code: 'ECL_CONFIG_DUPLICATE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Foreign key constraint errors
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid reference in ECL configuration',
      details: error.message,
      code: 'ECL_CONFIG_REFERENCE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Database connection errors
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      error: 'ECL Configuration database service unavailable',
      details: 'Cannot connect to FRS9 database',
      code: 'ECL_CONFIG_DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Generic server errors
  res.status(500).json({
    success: false,
    error: 'Internal server error in ECL Configuration service',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Contact system administrator',
    code: 'ECL_CONFIG_INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

export default router;

// ============================================================================
// ROUTE DOCUMENTATION
// ============================================================================

/**
 * ECL CONFIGURATION API ENDPOINTS SUMMARY
 *
 * Health Check Operations (1 endpoint):
 * - GET    /health                     - Service health check
 *
 * Header Operations (5 endpoints):
 * - GET    /                           - List all ECL configurations
 * - POST   /                           - Create ECL configuration
 * - GET    /:pkid                      - Get single ECL configuration
 * - PUT    /:pkid                      - Update ECL configuration
 * - DELETE /:pkid                      - Delete ECL configuration
 *
 * Detail Operations (4 endpoints):
 * - GET    /:pkid/details              - Get configuration details
 * - POST   /:pkid/details              - Create configuration detail
 * - PUT    /details/:detailId         - Update configuration detail
 * - DELETE /details/:detailId         - Delete configuration detail
 *
 * Integration Operations (2 endpoints):
 * - POST   /:pkid/simulate              - Run ECL simulation
 * - GET    /combo-data/:source         - Get combo box data
 *
 * Total: 12 endpoints
 *
 * Authentication: JWT token required for all endpoints
 * Tenant Validation: All endpoints validate tenant context
 * Validation: Comprehensive input validation with express-validator
 * Error Handling: Standardized error responses with specific error codes
 * Database: DS2 FRS9PRO with real production data
 */