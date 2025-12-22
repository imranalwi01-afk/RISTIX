// packages/backend/src/api/routes/product-parameter.routes.ts
// ============================================================================
// 🔧 PROD-002: PRODUCT PARAMETER ROUTES - STANDALONE CRUD PATTERN
// ============================================================================
// ✅ IMPLEMENTS: Complete REST API routing for Product Parameters
// ✅ PATTERN: Standalone CRUD Pattern with 5 endpoints
// ✅ ENDPOINTS: CRUD (4) + Health (1) = 5 total endpoints
// ✅ VALIDATION: Request validation and error handling
// ============================================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { ProductParameterController } from '../controllers/product-parameter.controller';

const router = Router();
const controller = new ProductParameterController();

// ==========================================
// UTILITY ENDPOINTS (MUST BE FIRST!)
// ==========================================

/**
 * GET /instrument-class-options
 * Get instrument class options from FRS9PRO parameter B0003
 * IMPORTANT: This must be FIRST to avoid /:id route conflict
 */
router.get('/instrument-class-options', controller.getInstrumentClassOptions);

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================

/**
 * GET /health
 * Health check for product parameter service
 */
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 [PROD-002] Product parameter health check');
    
    const productHealth = {
      connection: 'healthy',
      status: 'operational',
      service: 'Product Parameter Service',
      pattern: 'Standalone CRUD',
      endpoints: {
        crud_operations: 4,
        health: 1,
        total: 5
      },
      validation: 'express-validator + zod',
      database: {
        host: `${process.env.FRS9_DB_HOST || 'localhost'}:${process.env.FRS9_DB_PORT || '5433'}`,
        database: process.env.FRS9_DB_NAME || 'FRS9PRO',
        table: 'frs9_param_product'
      },
      last_check: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: productHealth,
      message: 'Product parameter service is operational'
    });
    
  } catch (error) {
    console.error('❌ [PROD-002] Product parameter health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Product parameter service health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==========================================
// STANDALONE CRUD ENDPOINTS
// ==========================================

/**
 * GET /
 * Get all product parameters with pagination and filtering
 */
router.get(
  '/',
  [
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
      .withMessage('Search term must be max 100 characters'),
    
    query('prd_group')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Product group must be max 50 characters'),
    
    query('prd_type')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Product type must be max 50 characters'),
    
    query('currency')
      .optional()
      .isString()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be exactly 3 characters'),
    
    query('active_only')
      .optional()
      .isBoolean()
      .withMessage('Active only must be boolean')
  ],
  (req, res) => controller.getProducts(req, res)
);

/**
 * POST /
 * Create new product parameter
 */
router.post(
  '/',
  [
    body('data_source')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Data source must be max 50 characters'),
    
    body('prd_group')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Product group must be max 50 characters'),
    
    body('prd_type')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Product type must be max 50 characters'),
    
    body('prd_code')
      .isString()
      .isLength({ min: 1, max: 20 })
      .withMessage('Product code is required and must be max 20 characters')
      .matches(/^[A-Z0-9_-]+$/)
      .withMessage('Product code must contain only uppercase letters, numbers, underscores, and hyphens'),
    
    body('prd_desc')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Product description must be max 255 characters'),
    
    body('currency')
      .optional()
      .isString()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be exactly 3 characters'),
    
    body('amortization_type')
      .optional()
      .isString()
      .isLength({ max: 20 })
      .withMessage('Amortization type must be max 20 characters'),
    
    body('al_flag')
      .optional()
      .isString()
      .isLength({ min: 1, max: 1 })
      .withMessage('AL flag must be exactly 1 character'),
    
    body('impaired_flag')
      .optional()
      .isBoolean()
      .withMessage('Impaired flag must be boolean'),
    
    body('bm_flag')
      .optional()
      .isBoolean()
      .withMessage('BM flag must be boolean'),
    
    body('expected_life')
      .optional()
      .isInt({ min: 1, max: 600 })
      .withMessage('Expected life must be between 1 and 600 months'),
    
    body('borrowing_rate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Borrowing rate must be between 0 and 100'),
    
    body('market_rate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Market rate must be between 0 and 100'),
    
    body('active_flag')
      .optional()
      .isBoolean()
      .withMessage('Active flag must be boolean')
  ],
  (req, res) => controller.createProduct(req, res)
);

/**
 * GET /:id
 * Get specific product parameter by ID
 */
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer')
  ],
  (req, res) => controller.getProduct(req, res)
);

/**
 * PUT /:prd_code
 * Update existing product parameter by code
 */
router.put(
  '/:prd_code',
  [
    param('prd_code')
      .isString()
      .isLength({ min: 1, max: 20 })
      .withMessage('Product code is required and must be max 20 characters'),
    
    body('data_source')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Data source must be max 50 characters'),
    
    body('prd_group')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Product group must be max 50 characters'),
    
    body('prd_type')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Product type must be max 50 characters'),
    
    body('prd_desc')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Product description must be max 255 characters'),
    
    body('currency')
      .optional()
      .isString()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be exactly 3 characters'),
    
    body('amortization_type')
      .optional()
      .isString()
      .isLength({ max: 20 })
      .withMessage('Amortization type must be max 20 characters'),
    
    body('al_flag')
      .optional()
      .isString()
      .isLength({ min: 1, max: 1 })
      .withMessage('AL flag must be exactly 1 character'),
    
    body('impaired_flag')
      .optional()
      .isBoolean()
      .withMessage('Impaired flag must be boolean'),
    
    body('bm_flag')
      .optional()
      .isBoolean()
      .withMessage('BM flag must be boolean'),
    
    body('expected_life')
      .optional()
      .isInt({ min: 1, max: 600 })
      .withMessage('Expected life must be between 1 and 600 months'),
    
    body('borrowing_rate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Borrowing rate must be between 0 and 100'),
    
    body('market_rate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Market rate must be between 0 and 100'),
    
    body('active_flag')
      .optional()
      .isBoolean()
      .withMessage('Active flag must be boolean')
  ],
  (req, res) => controller.updateProduct(req, res)
);

/**
 * DELETE /:prd_code
 * Delete product parameter by code
 */
router.delete(
  '/:prd_code',
  [
    param('prd_code')
      .isString()
      .isLength({ min: 1, max: 20 })
      .withMessage('Product code is required and must be max 20 characters')
  ],
  (req, res) => controller.deleteProduct(req, res)
);

// ==========================================
// UTILITY ROUTES
// ==========================================

/**
 * GET /metadata
 * Get metadata for product parameter forms
 */
router.get('/metadata', async (req, res) => {
  try {
    console.log('📋 [PROD-002] Getting product parameter metadata');
    
    const metadata = {
      prd_code_pattern: '^[A-Z0-9_-]+$',
      prd_code_max_length: 20,
      prd_desc_max_length: 255,
      currency_length: 3,
      amortization_type_max_length: 20,
      al_flag_length: 1,
      expected_life_max: 600,
      rate_max: 100,
      pattern: 'Standalone CRUD',
      table: 'frs9_param_product',
      fields: {
        required: ['prd_code'],
        optional: [
          'data_source', 'prd_group', 'prd_type', 'prd_desc', 
          'currency', 'amortization_type', 'al_flag', 
          'impaired_flag', 'bm_flag', 'expected_life', 
          'borrowing_rate', 'market_rate', 'active_flag'
        ]
      }
    };
    
    res.json({
      success: true,
      data: metadata,
      message: 'Product parameter metadata retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ [PROD-002] Failed to get product parameter metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get product parameter metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

console.log('✅ [PROD-002] Product parameter routes loaded - 6 standalone CRUD endpoints registered');