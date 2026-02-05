// packages/backend/src/api/routes/individual-impairment.routes.ts
// ============================================================================
// 🔧 INDIVIDUAL IMPAIRMENT ASSESSMENT OVERRIDE ROUTES
// ============================================================================
// ✅ PATTERN: REST API routes for comprehensive individual account assessment
// ✅ DATABASE: frs9_imp_ia_* tables with DCF analysis integration
// ✅ FEATURES: Watchlist management, assessment override, DCF analysis, reporting
// ============================================================================

import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { individualImpairmentController } from '../controllers/individual-impairment.controller';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================================================
// WATCHLIST ENDPOINTS (INDIVIDUAL ASSESSMENT WATCHLIST)
// ============================================================================

/**
 * GET /api/v1/banking/individual/impairment/watchlist
 * @desc    Get individual impairment watchlist with pagination and filtering
 * @access  Private (Banking users)
 * @param   page - Page number (default: 1)
 * @param   limit - Items per page (default: 10)
 * @param   search - Search term (CIF number, CIF name, account number)
 * @param   filter - JSON filter object {impairedFlag, ratingCode, dpdFrom, dpdTo, dateFrom, dateTo}
 * @return  Paginated list of individual impairment records
 */
router.get('/watchlist',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('filter').optional().isJSON().withMessage('Filter must be valid JSON')
  ],
  validateRequest,
  individualImpairmentController.getWatchlist.bind(individualImpairmentController)
);

/**
 * POST /api/v1/banking/individual/impairment/watchlist/export
 * @desc    Export individual impairment watchlist to Excel/CSV
 * @access  Private (Banking users)
 * @body    format - Export format (xlsx or csv)
 * @body    filters - Optional filter object
 * @return  Export data with download URL
 */
router.post('/watchlist/export',
  [
    body('format').isIn(['xlsx', 'csv']).withMessage('Format must be xlsx or csv'),
    body('filters').optional().isObject().withMessage('Filters must be an object')
  ],
  validateRequest,
  individualImpairmentController.exportWatchlist.bind(individualImpairmentController)
);

/**
 * GET /api/v1/banking/individual/impairment/:id
 * @desc    Get single individual impairment record
 * @access  Private (Banking users)
 * @param   id - Impairment record ID
 * @return  Individual impairment record details
 */
router.get('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
  ],
  validateRequest,
  individualImpairmentController.getImpairmentById.bind(individualImpairmentController)
);

/**
 * PUT /api/v1/banking/individual/impairment/:id
 * @desc    Update individual impairment record (assessment override)
 * @access  Private (Banking users with IFRS9 permissions)
 * @param   id - Impairment record ID
 * @body    Updated impairment data (impaired_flag, method, trigger_remarks, status)
 * @return  Updated individual impairment record
 */
router.put('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('impaired_flag').optional().isIn(['I', 'N']).withMessage('Impaired flag must be I or N'),
    body('method').optional().isString().isLength({ min: 1, max: 20 }).withMessage('Method must be 1-20 characters'),
    body('trigger_remarks').optional().isString().isLength({ max: 1000 }).withMessage('Trigger remarks must be max 1000 characters'),
    body('status').optional().isInt({ min: 1, max: 10 }).withMessage('Status must be between 1 and 10')
  ],
  validateRequest,
  requireRoles(['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST', 'SENIOR_IFRS9_CONSULTANT']),
  individualImpairmentController.updateImpairment.bind(individualImpairmentController)
);

// ============================================================================
// DETAIL ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/banking/individual/impairment/:id/details
 * @desc    Get detailed cash flow data for individual impairment
 * @access  Private (Banking users)
 * @param   id - Impairment record ID
 * @return  Detailed cash flow and calculation data
 */
router.get('/:id/details',
  [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
  ],
  validateRequest,
  individualImpairmentController.getImpairmentDetails.bind(individualImpairmentController)
);

// ============================================================================
// DCF ANALYSIS ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/banking/individual/impairment/dcf/:accountId
 * @desc    Get DCF data for an account
 * @access  Private (Banking users)
 * @param   accountId - Account ID
 * @query  prc_date - Processing date (YYYY-MM-DD format)
 * @return  DCF data including cash flows and scenario data
 */
router.get('/dcf/:accountId',
  [
    param('accountId').isInt({ min: 1 }).withMessage('Account ID must be a positive integer'),
    query('prc_date').isISO8601().withMessage('Processing date must be a valid date (YYYY-MM-DD)')
  ],
  validateRequest,
  individualImpairmentController.getDCFData.bind(individualImpairmentController)
);

/**
 * POST /api/v1/banking/individual/impairment/dcf/calculate
 * @desc    Calculate DCF results
 * @access  Private (All authenticated banking users)
 * @body    DCF calculation data (account_id, prc_date, scenario_data)
 * @return  DCF calculation results (PV, ECL, rates)
 */
router.post('/dcf/calculate',
  [
    body('account_id').isInt({ min: 1 }).withMessage('Account ID must be a positive integer'),
    body('prc_date').isISO8601().withMessage('Processing date must be a valid date (YYYY-MM-DD)'),
    body('scenario_data.scenario_id').optional().isInt({ min: 1 }).withMessage('Scenario ID must be a positive integer'),
    body('scenario_data.scenario_name').optional().isString().withMessage('Scenario name must be a string'),
    body('scenario_data.pd_rates').optional().isArray().withMessage('PD rates must be an array'),
    body('scenario_data.recovery_rates').optional().isArray().withMessage('Recovery rates must be an array')
  ],
  validateRequest,
  // Removed requireRoles - allow all authenticated banking users to calculate DCF
  individualImpairmentController.calculateDCF.bind(individualImpairmentController)
);

// ============================================================================
// REPORT ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/banking/individual/impairment/report
 * @desc    Get assessment report with pagination and filtering
 * @access  Private (Banking users)
 * @param   page - Page number (default: 1)
 * @param   limit - Items per page (default: 10)
 * @param   search - Search term (CIF name, account number)
 * @param   filter - JSON filter object
 * @return  Paginated assessment report data
 */
router.get('/report',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('filter').optional().isJSON().withMessage('Filter must be valid JSON')
  ],
  validateRequest,
  individualImpairmentController.getAssessmentReport.bind(individualImpairmentController)
);

// ============================================================================
// VALIDATION ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/banking/individual/impairment/validate/rating/:ratingCode
 * @desc    Validate rating code
 * @access  Private (Banking users)
 * @param   ratingCode - Rating code to validate
 * @return  Validation result with rating information
 */
router.get('/validate/rating/:ratingCode',
  [
    param('ratingCode').isString().isLength({ min: 1, max: 5 }).withMessage('Rating code must be 1-5 characters')
  ],
  validateRequest,
  individualImpairmentController.validateRatingCode.bind(individualImpairmentController)
);

/**
 * GET /api/v1/banking/individual/impairment/validate/method/:method
 * @desc    Validate assessment method
 * @access  Private (Banking users)
 * @param   method - Assessment method to validate
 * @return  Validation result with method information
 */
router.get('/validate/method/:method',
  [
    param('method').isString().isLength({ min: 1, max: 20 }).withMessage('Method must be 1-20 characters')
  ],
  validateRequest,
  individualImpairmentController.validateAssessmentMethod.bind(individualImpairmentController)
);

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * GET /api/v1/banking/individual/impairment/health
 * @desc    Health check for individual impairment service
 * @access  Private (System administrators)
 * @return  Service health status and capabilities
 */
router.get('/health',
  requireRoles(['PLATFORM_SUPER_ADMIN', 'PLATFORM_ADMIN']),
  individualImpairmentController.healthCheck.bind(individualImpairmentController)
);

// ============================================================================
// ROUTE SUMMARY
// ============================================================================

/**
 * INDIVIDUAL IMPAIRMENT ASSESSMENT OVERRIDE API ENDPOINTS SUMMARY
 *
 * WATCHLIST ENDPOINTS:
 * ├─ GET /watchlist - Get individual impairment watchlist with pagination
 * ├─ GET /:id - Get single individual impairment record
 * └─ PUT /:id - Update individual impairment record (assessment override)
 *
 * DETAIL ENDPOINTS:
 * └─ GET /:id/details - Get detailed cash flow data for individual impairment
 *
 * DCF ANALYSIS ENDPOINTS:
 * ├─ GET /dcf/:accountId - Get DCF data for an account
 * └─ POST /dcf/calculate - Calculate DCF results
 *
 * REPORT ENDPOINTS:
 * └─ GET /report - Get assessment report with pagination and filtering
 *
 * VALIDATION ENDPOINTS:
 * ├─ GET /validate/rating/:ratingCode - Validate rating code
 * └─ GET /validate/method/:method - Validate assessment method
 *
 * SYSTEM ENDPOINTS:
 * └─ GET /health - Health check for individual impairment service
 *
 * SECURITY:
 * ✅ All endpoints require JWT authentication
 * ✅ Modify operations require specific banking roles
 * ✅ Admin endpoints require platform roles
 * ✅ Input validation with express-validator
 * ✅ SQL injection protection with parameterized queries
 * ✅ Audit logging for all modifications
 */

export default router;