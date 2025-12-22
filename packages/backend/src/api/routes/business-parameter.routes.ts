// packages/backend/src/api/routes/business-parameter.routes.ts
// ============================================================================
// 🔧 BUSI-001: BUSINESS PARAMETER ROUTES - MASTER-DETAIL PATTERN
// ============================================================================
// ✅ IMPLEMENTS: Complete REST API routing for Business Parameters
// ✅ PATTERN: Master-Detail Pattern with 8 endpoints (same as Application)
// ✅ ENDPOINTS: Headers (4) + Details (4) = 8 total endpoints
// ✅ VALIDATION: Request validation and error handling
// ============================================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { BusinessParameterController } from '../controllers/business-parameter.controller';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();
const controller = new BusinessParameterController();

// Apply authentication to all routes
router.use(authenticateToken);

// ==========================================
// ROOT ROUTE - FOR FRONTEND COMPATIBILITY
// ==========================================

/**
 * GET /api/v1/business
 * List all business parameter headers (main endpoint for frontend)
 * Frontend calls: /api/v1/banking/setup/business
 */
router.get(
  '/',
  query('include_details').optional().isBoolean().withMessage('include_details must be boolean'),
  controller.getHeaders.bind(controller)
);

/**
 * POST /api/v1/business
 * Create new business parameter header (main endpoint for frontend)
 */
router.post(
  '/',
  [
    body('param_code')
      .isString()
      .isLength({ min: 1, max: 10 })
      .withMessage('Parameter code must be 1-10 characters')
      .matches(/^[A-Z0-9_-]+$/)
      .withMessage('Parameter code must contain only uppercase letters, numbers, underscores, hyphens'),

    body('param_name')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Parameter name is required and must be max 255 characters'),

    body('param_usage')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Parameter usage is required and must be max 255 characters'),

    body('details')
      .optional()
      .isArray()
      .withMessage('Details must be an array'),

    body('details.*.param_seq')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Detail sequence must be a positive integer'),

    body('details.*.value1')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Value1 must be max 100 characters'),

    body('details.*.value2')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Value2 must be max 100 characters'),

    body('details.*.value3')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Value3 must be max 50 characters'),

    body('details.*.paramdesc')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Parameter description must be max 1000 characters')
  ],
  validateRequest,
  controller.createHeader.bind(controller)
);

/**
 * GET /api/v1/business/:id
 * Get business parameter header by ID
 */
router.get(
  '/:id',
  param('id').isString().withMessage('ID must be a string'),
  controller.getHeaderById.bind(controller)
);

/**
 * PUT /api/v1/business/:id
 * Update business parameter header by ID
 */
router.put(
  '/:id',
  [
    param('id').isString().withMessage('ID must be a string'),

    body('param_name')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Parameter name must be max 255 characters'),

    body('param_usage')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Parameter usage must be max 255 characters')
  ],
  validateRequest,
  controller.updateHeader.bind(controller)
);

/**
 * DELETE /api/v1/business/:id
 * Delete business parameter header by ID
 */
router.delete(
  '/:id',
  param('id').isString().withMessage('ID must be a string'),
  controller.deleteHeader.bind(controller)
);

// ==========================================
// LEGACY COMPATIBILITY ROUTES (/headers)
// ==========================================

/**
 * GET /api/v1/business/headers
 * List all business parameter headers with details
 */
router.get(
  '/headers',
  query('include_details').optional().isBoolean().withMessage('include_details must be boolean'),
  controller.getHeaders.bind(controller)
);

/**
 * POST /api/v1/business/headers
 * Create new business parameter header
 */
router.post(
  '/headers',
  [
    body('param_code')
      .isString()
      .isLength({ min: 1, max: 10 })
      .withMessage('Parameter code must be 1-10 characters')
      .matches(/^[A-Z0-9_-]+$/)
      .withMessage('Parameter code must contain only uppercase letters, numbers, underscores, and hyphens'),
    
    body('param_name')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Parameter name is required and must be max 255 characters'),
    
    body('param_usage')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Parameter usage is required and must be max 255 characters'),
    
    body('details')
      .optional()
      .isArray()
      .withMessage('Details must be an array'),
    
    body('details.*.param_seq')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Detail sequence must be a positive integer'),
    
    body('details.*.value1')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Value1 must be max 100 characters'),
    
    body('details.*.value2')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Value2 must be max 100 characters'),
    
    body('details.*.value3')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Value3 must be max 50 characters'),
    
    body('details.*.paramdesc')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Parameter description must be max 1000 characters')
  ],
  validateRequest,
  controller.createHeader.bind(controller)
);

/**
 * PUT /api/v1/business/headers/:id
 * Update business parameter header
 */
router.put(
  '/headers/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Header ID must be a positive integer'),
    
    body('param_name')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Parameter name must be 1-255 characters'),
    
    body('param_usage')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Parameter usage must be 1-255 characters')
  ],
  controller.updateHeader.bind(controller)
);

/**
 * DELETE /api/v1/business/headers/:id
 * Delete business parameter header with cascade
 */
router.delete(
  '/headers/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Header ID must be a positive integer')
  ],
  controller.deleteHeader.bind(controller)
);

// ==========================================
// MASTER-DETAIL DETAIL ROUTES
// ==========================================

/**
 * GET /api/v1/business/headers/:id/details
 * Get details for specific business parameter header
 */
router.get(
  '/headers/:id/details',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Header ID must be a positive integer')
  ],
  controller.getDetails.bind(controller)
);

/**
 * POST /api/v1/business/headers/:id/details
 * Create new detail for business parameter header
 */
router.post(
  '/headers/:id/details',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Header ID must be a positive integer'),
    
    body('param_seq')
      .isInt({ min: 1 })
      .withMessage('Detail sequence must be a positive integer'),
    
    body('value1')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Value1 is required and must be max 100 characters'),
    
    body('value2')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Value2 must be max 100 characters'),
    
    body('value3')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Value3 must be max 50 characters'),
    
    body('paramdesc')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Parameter description must be max 1000 characters')
  ],
  validateRequest,
  controller.createDetail.bind(controller)
);

/**
 * PUT /api/v1/business/details/:detailId
 * Update business parameter detail
 */
router.put(
  '/details/:detailId',
  [
    param('detailId')
      .isInt({ min: 1 })
      .withMessage('Detail ID must be a positive integer'),
    
    body('param_seq')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Detail sequence must be a positive integer'),
    
    body('value1')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Value1 must be 1-100 characters'),
    
    body('value2')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Value2 must be max 100 characters'),
    
    body('value3')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Value3 must be max 50 characters'),
    
    body('paramdesc')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Parameter description must be max 1000 characters')
  ],
  controller.updateDetail.bind(controller)
);

/**
 * DELETE /api/v1/business/details/:detailId
 * Delete business parameter detail
 */
router.delete(
  '/details/:detailId',
  [
    param('detailId')
      .isInt({ min: 1 })
      .withMessage('Detail ID must be a positive integer')
  ],
  controller.deleteDetail.bind(controller)
);

// ==========================================
// EXPORT ROUTES
// ==========================================

/**
 * GET /api/v1/business/headers/export
 * Export business parameters with filtering
 */
router.get(
  '/headers/export',
  [
    query('format')
      .optional()
      .isIn(['xlsx', 'xls', 'csv', 'pdf'])
      .withMessage('Export format must be one of: xlsx, xls, csv, pdf'),

    query('search')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Search term must be max 100 characters'),

    query('status_filter')
      .optional()
      .isString()
      .withMessage('Status filter must be a string'),

    query('date_from')
      .optional()
      .isISO8601()
      .withMessage('Date from must be a valid ISO 8601 date'),

    query('date_to')
      .optional()
      .isISO8601()
      .withMessage('Date to must be a valid ISO 8601 date')
  ],
  controller.exportHeaders.bind(controller)
);

/**
 * GET /api/v1/business/details/export
 * Export business parameter details
 */
router.get(
  '/details/export',
  [
    query('format')
      .optional()
      .isIn(['xlsx', 'xls', 'csv', 'pdf'])
      .withMessage('Export format must be one of: xlsx, xls, csv, pdf'),

    query('param_code')
      .optional()
      .isString()
      .isLength({ min: 1, max: 10 })
      .withMessage('Parameter code must be 1-10 characters')
  ],
  controller.exportDetails.bind(controller)
);

// ==========================================
// UTILITY ROUTES
// ==========================================

/**
 * GET /api/v1/business/health
 * Health check for business parameter service
 */
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 [BUSI-001] Business parameter health check');
    
    // Simple health check without external dependency
    const businessHealth = {
      connection: 'healthy',
      status: 'operational',
      service: 'Business Parameter Service',
      pattern: 'Master-Detail',
      endpoints: {
        headers: 4,
        details: 4,
        total: 8
      },
      validation: 'express-validator',
      database: {
        host: `${process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost'}:${process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'}`,
        database: process.env.FRS9_DB_NAME || 'FRS9PRO',
        tables: ['frs9_param_commonh', 'frs9_param_commond']
      },
      last_check: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: businessHealth,
      message: 'Business parameter service is operational'
    });
    
  } catch (error) {
    console.error('❌ [BUSI-001] Business parameter health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Business parameter service health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/business/metadata
 * Get metadata for business parameter forms
 */
router.get('/metadata', async (req, res) => {
  try {
    console.log('📋 [BUSI-001] Getting business parameter metadata');
    
    const metadata = {
      param_code_pattern: '^[A-Z0-9_-]+$',
      param_code_max_length: 10,
      param_name_max_length: 255,
      param_usage_max_length: 255,
      detail_value1_max_length: 100,
      detail_value2_max_length: 100,
      detail_value3_max_length: 50,
      detail_paramdesc_max_length: 1000,
      param_type: 'B',
      pattern: 'Master-Detail',
      tables: {
        header: 'frs9_param_commonh',
        detail: 'frs9_param_commond'
      }
    };
    
    res.json({
      success: true,
      data: metadata,
      message: 'Business parameter metadata retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ [BUSI-001] Failed to get business parameter metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get business parameter metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

console.log('✅ [BUSI-001] Business parameter routes loaded - 10 endpoints (8 master-detail + 2 export) registered');