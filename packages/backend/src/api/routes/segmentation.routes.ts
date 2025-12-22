// packages/backend/src/api/routes/segmentation.routes.ts
// ============================================================================
// 🔧 SEGMENTATION CONFIGURATION ROUTES - PHASE 3 MODULE 3.1
// ============================================================================
// ✅ PATTERN: Express Router with Master-Detail + Business Settings Integration
// ✅ ENDPOINTS: Headers, Details, Cascading Dropdowns (16 routes total)
// ✅ FEATURES: Validation middleware, error handling, tenant context
// ============================================================================

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { segmentationController } from '../controllers/segmentation.controller';
import { requireAuth } from '../../middleware/auth';

// Express-validator middleware for handling validation results
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const router = Router();

// ============================================================================
// MIDDLEWARE STACK
// ============================================================================

// Apply authentication middleware to all routes
router.use(requireAuth);

// ============================================================================
// HEADER ROUTES (MASTER)
// ============================================================================

/**
 * GET /api/v1/banking/segmentation
 * Get all segmentation headers with detail counts and pagination
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isLength({ max: 255 }).withMessage('Search term too long')
  ],
  handleValidationErrors,
  segmentationController.getHeaders.bind(segmentationController)
);

/**
 * POST /api/v1/banking/segmentation
 * Create new segmentation header
 */
router.post(
  '/',
  [
    body('group_segment')
      .notEmpty()
      .withMessage('Group Segment is required')
      .isLength({ max: 150 })
      .withMessage('Group Segment must be 150 characters or less'),

    body('segment')
      .notEmpty()
      .withMessage('Segment is required')
      .isLength({ max: 150 })
      .withMessage('Segment must be 150 characters or less'),

    body('sub_segment')
      .optional()
      .isLength({ max: 150 })
      .withMessage('Sub Segment must be 150 characters or less'),

    body('segment_type')
      .notEmpty()
      .withMessage('Segment Type is required')
      .isIn(['PD', 'LGD', 'EAD', 'PF'])
      .withMessage('Invalid segment type'),

    body('seq')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Allow null/undefined/empty values
        }
        if (!Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error('Sequence must be a positive integer');
        }
        return true;
      }),

    body('active_flag')
      .optional()
      .isBoolean()
      .withMessage('Active Flag must be a boolean')
  ],
  handleValidationErrors,
  segmentationController.createHeader.bind(segmentationController)
);

/**
 * PUT /api/v1/banking/segmentation/:id
 * Update segmentation header
 */
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid header ID'),

    body('group_segment')
      .notEmpty()
      .withMessage('Group Segment is required')
      .isLength({ max: 150 })
      .withMessage('Group Segment must be 150 characters or less'),

    body('segment')
      .notEmpty()
      .withMessage('Segment is required')
      .isLength({ max: 150 })
      .withMessage('Segment must be 150 characters or less'),

    body('sub_segment')
      .optional()
      .isLength({ max: 150 })
      .withMessage('Sub Segment must be 150 characters or less'),

    body('segment_type')
      .notEmpty()
      .withMessage('Segment Type is required'),

    body('seq')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true; // Allow null/undefined/empty values
        }
        if (!Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error('Sequence must be a positive integer');
        }
        return true;
      }),

    body('active_flag')
      .optional()
      .isBoolean()
      .withMessage('Active Flag must be a boolean')
  ],
  handleValidationErrors,
  segmentationController.updateHeader.bind(segmentationController)
);

/**
 * DELETE /api/v1/banking/segmentation/:id
 * Delete segmentation header and cascade delete details
 */
router.delete(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid header ID')
  ],
  handleValidationErrors,
  segmentationController.deleteHeader.bind(segmentationController)
);

/**
 * GET /api/v1/banking/segmentation/:id
 * Get single segmentation header with basic info
 */
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid header ID')
  ],
  handleValidationErrors,
  segmentationController.getHeaderById.bind(segmentationController)
);

// ============================================================================
// DETAIL ROUTES (DETAIL)
// ============================================================================

/**
 * GET /api/v1/banking/segmentation/:id/details
 * Get all detail rules for a segmentation header
 */
router.get(
  '/:id/details',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid header ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  segmentationController.getDetails.bind(segmentationController)
);

/**
 * POST /api/v1/banking/segmentation/:id/details
 * Create new detail rule for segmentation header
 */
router.post(
  '/:id/details',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid header ID'),

    body('query_group')
      .isInt({ min: 1 })
      .withMessage('Query Group must be a positive integer'),

    body('seq')
      .isInt({ min: 1 })
      .withMessage('Sequence must be a positive integer'),

    body('table_name')
      .notEmpty()
      .withMessage('Table Name is required')
      .isLength({ max: 100 })
      .withMessage('Table Name must be 100 characters or less'),

    body('column_name')
      .notEmpty()
      .withMessage('Column Name is required')
      .isLength({ max: 100 })
      .withMessage('Column Name must be 100 characters or less'),

    body('data_type')
      .notEmpty()
      .withMessage('Data Type is required')
      .isIn(['VARCHAR', 'NUMBER', 'DATE', 'BOOLEAN'])
      .withMessage('Invalid data type'),

    body('operator')
      .notEmpty()
      .withMessage('Operator is required')
      .isIn(['=', '>', '<', '>=', '<=', '<>', 'BETWEEN', 'IN', 'NOT IN', 'LIKE', 'NOT LIKE'])
      .withMessage('Invalid operator'),

    body('value1')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Value1 must be 1000 characters or less'),

    body('value2')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Value2 must be 1000 characters or less'),

    body('condition')
      .optional()
      .isIn(['AND', 'OR'])
      .withMessage('Condition must be AND or OR')
  ],
  handleValidationErrors,
  segmentationController.createDetail.bind(segmentationController)
);

/**
 * PUT /api/v1/banking/segmentation/details/:detailId
 * Update segmentation detail rule
 */
router.put(
  '/details/:detailId',
  [
    param('detailId').isInt({ min: 1 }).withMessage('Invalid detail ID'),

    body('query_group')
      .isInt({ min: 1 })
      .withMessage('Query Group must be a positive integer'),

    body('seq')
      .isInt({ min: 1 })
      .withMessage('Sequence must be a positive integer'),

    body('table_name')
      .notEmpty()
      .withMessage('Table Name is required')
      .isLength({ max: 100 })
      .withMessage('Table Name must be 100 characters or less'),

    body('column_name')
      .notEmpty()
      .withMessage('Column Name is required')
      .isLength({ max: 100 })
      .withMessage('Column Name must be 100 characters or less'),

    body('data_type')
      .notEmpty()
      .withMessage('Data Type is required')
      .isIn(['VARCHAR', 'NUMBER', 'DATE', 'BOOLEAN'])
      .withMessage('Invalid data type'),

    body('operator')
      .notEmpty()
      .withMessage('Operator is required'),

    body('value1')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Value1 must be 1000 characters or less'),

    body('value2')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Value2 must be 1000 characters or less'),

    body('condition')
      .optional()
      .isIn(['AND', 'OR'])
      .withMessage('Condition must be AND or OR')
  ],
  handleValidationErrors,
  segmentationController.updateDetail.bind(segmentationController)
);

/**
 * DELETE /api/v1/banking/segmentation/details/:detailId
 * Delete segmentation detail rule
 */
router.delete(
  '/details/:detailId',
  [
    param('detailId').isInt({ min: 1 }).withMessage('Invalid detail ID')
  ],
  handleValidationErrors,
  segmentationController.deleteDetail.bind(segmentationController)
);

// ============================================================================
// BUSINESS SETTINGS INTEGRATION ROUTES
// ============================================================================

/**
 * GET /api/v1/banking/segmentation/business-settings/tables
 * Get table names from Business Setting B0012
 */
router.get(
  '/business-settings/tables',
  segmentationController.getTableNames.bind(segmentationController)
);

/**
 * GET /api/v1/banking/segmentation/business-settings/columns/:tableName
 * Get column names for selected table from Business Setting B0013
 */
router.get(
  '/business-settings/columns/:tableName',
  [
    param('tableName').notEmpty().withMessage('Table name is required')
  ],
  handleValidationErrors,
  segmentationController.getColumnNames.bind(segmentationController)
);

/**
 * GET /api/v1/banking/segmentation/business-settings/data-type/:tableName/:columnName
 * Get data type for selected column from Business Setting B0013
 */
router.get(
  '/business-settings/data-type/:tableName/:columnName',
  [
    param('tableName').notEmpty().withMessage('Table name is required'),
    param('columnName').notEmpty().withMessage('Column name is required')
  ],
  handleValidationErrors,
  segmentationController.getDataType.bind(segmentationController)
);

/**
 * GET /api/v1/banking/segmentation/business-settings/operators/:dataType
 * Get operators for selected data type from Business Setting B0014
 */
router.get(
  '/business-settings/operators/:dataType',
  [
    param('dataType')
      .notEmpty()
      .withMessage('Data type is required')
      .isIn(['VARCHAR', 'NUMBER', 'DATE', 'BOOLEAN'])
      .withMessage('Invalid data type')
  ],
  handleValidationErrors,
  segmentationController.getOperators.bind(segmentationController)
);

/**
 * GET /api/v1/banking/segmentation/business-settings/conditions
 * Get condition options (AND/OR) from Business Setting B0015
 */
router.get(
  '/business-settings/conditions',
  segmentationController.getConditions.bind(segmentationController)
);

/**
 * GET /api/v1/banking/segmentation/business-settings/values/:tableName/:columnName
 * Get distinct values for IN/NOT IN operators from Business Setting B0016
 */
router.get(
  '/business-settings/values/:tableName/:columnName',
  [
    param('tableName').notEmpty().withMessage('Table name is required'),
    param('columnName').notEmpty().withMessage('Column name is required')
  ],
  handleValidationErrors,
  segmentationController.getColumnValues.bind(segmentationController)
);

/**
 * GET /api/v1/banking/segmentation/business-settings/segment-types
 * Get segment type options for header dropdown
 */
router.get(
  '/business-settings/segment-types',
  segmentationController.getSegmentTypes.bind(segmentationController)
);

/**
 * GET /api/v1/banking/segmentation/configuration
 * Get segmentation configuration for frontend
 * Alias for the main endpoint to support frontend routing
 */
router.get(
  '/configuration',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('segmentType').optional().isString().withMessage('Segment type must be a string'),
    query('isActive').optional().isBoolean().withMessage('Active flag must be boolean')
  ],
  handleValidationErrors,
  segmentationController.getHeaders.bind(segmentationController)
);

export default router;