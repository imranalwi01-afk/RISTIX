// packages/backend/src/api/routes/collective-parameter.routes.ts
// ============================================================================
// 🔧 COLLECTIVE PARAMETER ROUTES - PHASE 3 MODULE 3.4
// ============================================================================
// ✅ PATTERN: Master-Detail with Integration Links + Configuration Orchestration
// ✅ ENDPOINTS: 18 routes (8 CRUD + 4 Integration + 6 Metadata)
// ✅ FEATURES: Module integration, validation engine, calculation preview
// ============================================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import CollectiveParameterController from '../controllers/collective-parameter.controller';

const router = Router();
const controller = new CollectiveParameterController();

console.log('🔧 [COLL-ROUTES-001] Initializing Collective Parameter routes - Module 3.4');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

// Header validation schemas
const validateHeaderCreation = [
  body('template_name')
    .notEmpty()
    .withMessage('Template name is required')
    .isLength({ max: 200 })
    .withMessage('Template name too long (max 200 characters)'),
  
  body('template_description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description too long (max 500 characters)'),
  
  body('template_type')
    .isIn(['PORTFOLIO', 'SEGMENT', 'PRODUCT', 'CUSTOM'])
    .withMessage('Invalid template type'),
  
  body('segmentation_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Segmentation ID must be a positive integer'),
  
  body('rule_base_setting_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Rule base setting ID must be a positive integer'),
  
  body('bucket_parameter_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Bucket parameter ID must be a positive integer'),
  
  body('calculation_method')
    .isIn(['COLLECTIVE', 'HYBRID'])
    .withMessage('Invalid calculation method'),
  
  body('aggregation_level')
    .isIn(['ACCOUNT', 'SEGMENT', 'PORTFOLIO'])
    .withMessage('Invalid aggregation level'),
  
  body('active_flag')
    .optional()
    .isBoolean()
    .withMessage('Active flag must be boolean'),
  
  body('execution_priority')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Execution priority must be a positive integer'),
  
  body('effective_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid effective date format'),
  
  body('expiry_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format')
];

// Detail validation schemas
const validateDetailCreation = [
  body('parameter_type')
    .isIn(['PD_OVERRIDE', 'LGD_ADJUSTMENT', 'EAD_FACTOR', 'STAGING_RULE', 'SICR_THRESHOLD', 'DEFAULT_TRIGGER'])
    .withMessage('Invalid parameter type'),
  
  body('parameter_name')
    .notEmpty()
    .withMessage('Parameter name is required')
    .isLength({ max: 200 })
    .withMessage('Parameter name too long (max 200 characters)'),
  
  body('parameter_value')
    .notEmpty()
    .withMessage('Parameter value is required'),
  
  body('parameter_unit')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Parameter unit too long (max 50 characters)'),
  
  body('apply_to_segment')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Segment name too long (max 100 characters)'),
  
  body('apply_to_product')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Product name too long (max 100 characters)'),
  
  body('apply_to_stage')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('IFRS 9 stage must be 1, 2, or 3'),
  
  body('execution_order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Execution order must be a positive integer'),
  
  body('min_value')
    .optional()
    .isNumeric()
    .withMessage('Min value must be numeric'),
  
  body('max_value')
    .optional()
    .isNumeric()
    .withMessage('Max value must be numeric'),
  
  body('active_flag')
    .optional()
    .isBoolean()
    .withMessage('Active flag must be boolean')
];

// Parameter validation
const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

const validateDetailIdParam = [
  param('detailId')
    .isInt({ min: 1 })
    .withMessage('Detail ID must be a positive integer')
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
  
  query('template_type')
    .optional()
    .isIn(['PORTFOLIO', 'SEGMENT', 'PRODUCT', 'CUSTOM'])
    .withMessage('Invalid template type'),
  
  query('active_flag')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Active flag must be true or false')
];

// ============================================================================
// MASTER (HEADER) ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/banking/collective-parameter
 * @desc    Get all collective parameter headers with pagination and search
 * @access  Private
 */
router.get(
  '/',
  validatePaginationQuery,
  controller.getHeaders
);

/**
 * @route   GET /api/v1/banking/collective-parameter/:id
 * @desc    Get single collective parameter header with details
 * @access  Private
 */
router.get(
  '/:id',
  validateIdParam,
  controller.getHeader
);

/**
 * @route   POST /api/v1/banking/collective-parameter
 * @desc    Create new collective parameter header
 * @access  Private
 */
router.post(
  '/',
  validateHeaderCreation,
  controller.createHeader
);

/**
 * @route   PUT /api/v1/banking/collective-parameter/:id
 * @desc    Update collective parameter header
 * @access  Private
 */
router.put(
  '/:id',
  validateIdParam,
  controller.updateHeader
);

/**
 * @route   DELETE /api/v1/banking/collective-parameter/:id
 * @desc    Delete collective parameter header and all details
 * @access  Private
 */
router.delete(
  '/:id',
  validateIdParam,
  controller.deleteHeader
);

// ============================================================================
// DETAIL ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/banking/collective-parameter/:id/details
 * @desc    Get all details for a specific collective parameter header
 * @access  Private
 */
router.get(
  '/:id/details',
  validateIdParam,
  controller.getDetails
);

/**
 * @route   POST /api/v1/banking/collective-parameter/:id/details
 * @desc    Create new detail for a collective parameter header
 * @access  Private
 */
router.post(
  '/:id/details',
  validateIdParam,
  validateDetailCreation,
  controller.createDetail
);

/**
 * @route   PUT /api/v1/banking/collective-parameter/details/:detailId
 * @desc    Update collective parameter detail
 * @access  Private
 */
router.put(
  '/details/:detailId',
  validateDetailIdParam,
  controller.updateDetail
);

/**
 * @route   DELETE /api/v1/banking/collective-parameter/details/:detailId
 * @desc    Delete collective parameter detail
 * @access  Private
 */
router.delete(
  '/details/:detailId',
  validateDetailIdParam,
  controller.deleteDetail
);

// ============================================================================
// INTEGRATION ROUTES (MODULE 3.4 SPECIFIC)
// ============================================================================

/**
 * @route   GET /api/v1/banking/collective-parameter/:id/linkage-status
 * @desc    Get module linkage status with modules 3.1-3.3
 * @access  Private
 */
router.get(
  '/:id/linkage-status',
  validateIdParam,
  controller.getModuleLinkageStatus
);

/**
 * @route   GET /api/v1/banking/collective-parameter/:id/configuration
 * @desc    Get complete collective configuration with linked modules
 * @access  Private
 */
router.get(
  '/:id/configuration',
  validateIdParam,
  controller.getCollectiveConfiguration
);

/**
 * @route   POST /api/v1/banking/collective-parameter/:id/validate
 * @desc    Validate collective parameter configuration
 * @access  Private
 */
router.post(
  '/:id/validate',
  validateIdParam,
  controller.validateConfiguration
);

/**
 * @route   POST /api/v1/banking/collective-parameter/:id/preview-calculation
 * @desc    Preview calculation impact with sample data
 * @access  Private
 */
router.post(
  '/:id/preview-calculation',
  validateIdParam,
  controller.previewCalculation
);

// ============================================================================
// METADATA ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/banking/collective-parameter/metadata/template-types
 * @desc    Get available template types
 * @access  Private
 */
router.get(
  '/metadata/template-types',
  controller.getTemplateTypes
);

/**
 * @route   GET /api/v1/banking/collective-parameter/metadata/calculation-methods
 * @desc    Get available calculation methods
 * @access  Private
 */
router.get(
  '/metadata/calculation-methods',
  controller.getCalculationMethods
);

/**
 * @route   GET /api/v1/banking/collective-parameter/metadata/aggregation-levels
 * @desc    Get available aggregation levels
 * @access  Private
 */
router.get(
  '/metadata/aggregation-levels',
  controller.getAggregationLevels
);

/**
 * @route   GET /api/v1/banking/collective-parameter/metadata/parameter-types
 * @desc    Get available parameter types
 * @access  Private
 */
router.get(
  '/metadata/parameter-types',
  controller.getParameterTypes
);

// ============================================================================
// LINKED MODULE ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/banking/collective-parameter/linked-modules/segmentation
 * @desc    Get available segmentation configurations for linking
 * @access  Private
 */
router.get(
  '/linked-modules/segmentation',
  controller.getAvailableSegmentations
);

/**
 * @route   GET /api/v1/banking/collective-parameter/linked-modules/rule-base-settings
 * @desc    Get available rule base settings for linking
 * @access  Private
 */
router.get(
  '/linked-modules/rule-base-settings',
  controller.getAvailableRuleBaseSettings
);

/**
 * @route   GET /api/v1/banking/collective-parameter/linked-modules/bucket-parameters
 * @desc    Get available bucket parameters for linking
 * @access  Private
 */
router.get(
  '/linked-modules/bucket-parameters',
  controller.getAvailableBucketParameters
);

console.log('✅ [COLL-ROUTES-002] Collective Parameter routes configured - 18 endpoints ready');

export default router;