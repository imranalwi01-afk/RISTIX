// packages/backend/src/api/routes/ifrs9-reports.routes.ts
// ============================================================================
// IFRS 9 REPORTS ROUTES - DS2 LIVE DATABASE INTEGRATION
// ============================================================================
// Routes for all 7 IFRS 9 report types with DS2 FRS9PRO database integration
// Live DB: DS2 FRS9PRO (192.168.0.106:5433) - ACTUAL DATA, NO MOCK DATA
// ============================================================================

import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { query } from 'express-validator';
import Ifrs9ReportsDS2Controller from '../controllers/ifrs9-reports-ds2.controller';

const router = Router();

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateReportRequest = [
  query('prc_date')
    .notEmpty()
    .withMessage('Processing date is required')
    .isISO8601()
    .withMessage('Processing date must be in ISO 8601 format (YYYY-MM-DD)'),
  query('pd_config_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('PD config ID must be a positive integer'),
  query('lgd_config_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('LGD config ID must be a positive integer'),
  query('ead_config_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('EAD config ID must be a positive integer'),
  query('segment_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Segment ID must be a positive integer'),
  query('stage')
    .optional()
    .isIn(['1', '2', '3'])
    .withMessage('Stage must be 1, 2, or 3'),
  query('fl_flag')
    .optional()
    .isBoolean()
    .withMessage('FL flag must be boolean'),
];

const validatePaginationRequest = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
];

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((error: any) => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// ============================================================================
// LIFETIME PD ROUTES
// ============================================================================

/**
 * GET /api/v1/ifrs9/reports/lifetime-pd/yearly
 * Get Lifetime PD Yearly Marginal data with pivot structure
 */
router.get('/lifetime-pd/yearly',
  validateReportRequest,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Ifrs9ReportsDS2Controller.getLifetimePDYearly(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/ifrs9/reports/lifetime-pd/monthly
 * Get Lifetime PD Monthly Marginal data with pivot structure
 */
router.get('/lifetime-pd/monthly',
  validateReportRequest,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Ifrs9ReportsDS2Controller.getLifetimePDMonthly(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/ifrs9/reports/lifetime-pd/account-details
 * Get Lifetime PD account-level details from PD structure table
 */
router.get('/lifetime-pd/account-details',
  [
    ...validateReportRequest,
    ...validatePaginationRequest
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Ifrs9ReportsDS2Controller.getLifetimePDAccountDetails(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// LIFETIME LGD ROUTES
// ============================================================================


/**
 * GET /api/v1/ifrs9/reports/lifetime-lgd
 * Get Lifetime LGD data with account details and recovery information (paginated)
 */
router.get('/lifetime-lgd',
  [
    ...validateReportRequest,
    ...validatePaginationRequest
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Ifrs9ReportsDS2Controller.getLifetimeLGD(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// EAD MODEL ROUTES
// ============================================================================

/**
 * GET /api/v1/ifrs9/reports/ead-model
 * Get EAD Model payment average data
 */
router.get('/ead-model',
  validateReportRequest,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Ifrs9ReportsDS2Controller.getEADModel(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// ECL RESULT ROUTES
// ============================================================================

/**
 * GET /api/v1/ifrs9/reports/ecl-result
 * Get ECL Result data from master account table
 */
router.get('/ecl-result',
  validateReportRequest,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Ifrs9ReportsDS2Controller.getECLResult(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// ECL MOVEMENT ROUTES
// ============================================================================

/**
 * GET /api/v1/ifrs9/reports/ecl-movement
 * Get ECL Movement data using stored procedure
 */
router.get('/ecl-movement',
  [
    query('prc_date')
      .notEmpty()
      .withMessage('Processing date is required')
      .isISO8601()
      .withMessage('Processing date must be in ISO 8601 format (YYYY-MM-DD)'),
    query('segment_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Segment ID must be a positive integer'),
    query('stage')
      .optional()
      .isIn(['1', '2', '3'])
      .withMessage('Stage must be 1, 2, or 3'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Ifrs9ReportsDS2Controller.getECLMovement(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// GCA MOVEMENT ROUTES
// ============================================================================

/**
 * GET /api/v1/ifrs9/reports/gca-movement
 * Get GCA Movement data
 */
router.get('/gca-movement',
  [
    query('prc_date')
      .notEmpty()
      .withMessage('Processing date is required')
      .isISO8601()
      .withMessage('Processing date must be in ISO 8601 format (YYYY-MM-DD)'),
    query('segment_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Segment ID must be a positive integer'),
    query('stage')
      .optional()
      .isIn(['1', '2', '3'])
      .withMessage('Stage must be 1, 2, or 3'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Ifrs9ReportsDS2Controller.getGCAMovement(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// NOMINATIVE REPORT ROUTES
// ============================================================================

/**
 * GET /api/v1/ifrs9/reports/nominative-report
 * Get Nominative Report data with detailed account information (paginated)
 */
router.get('/nominative-report',
  [
    ...validateReportRequest,
    ...validatePaginationRequest,
    query('branch_code')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Branch code must be between 1 and 20 characters'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Ifrs9ReportsDS2Controller.getNominativeReport(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================

/**
 * GET /api/v1/ifrs9/reports/health
 * Health check for DS2 FRS9PRO database connection
 */
router.get('/health',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { Pool } = require('pg');
      
      const frs9ProPool = new Pool({
        host: process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'),
        user: process.env.FRS9_DB_USER || process.env.DB_USER || 'postgres',
        password: process.env.FRS9_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
        database: process.env.FRS9_DB_NAME || 'FRS9PRO',
        max: 1,
        connectionTimeoutMillis: 5000,
      });

      const startTime = Date.now();
      const result = await frs9ProPool.query('SELECT NOW() as server_time, current_database() as database_name;');
      const responseTime = Date.now() - startTime;
      
      await frs9ProPool.end();

      res.json({
        success: true,
        message: 'DS2 FRS9PRO database connection healthy',
        data: {
          database_name: result.rows[0].database_name,
          server_time: result.rows[0].server_time,
          response_time_ms: responseTime,
          host: `${process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost'}:${process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'}`,
          status: 'connected'
        }
      });

    } catch (error) {
      console.error('Health check failed:', error);
      
      res.status(503).json({
        success: false,
        error: 'DS2 FRS9PRO database connection failed',
        details: error.message,
        data: {
          host: `${process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost'}:${process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'}`,
          database: 'FRS9PRO',
          status: 'disconnected'
        }
      });
    }
  }
);

// ============================================================================
// REPORT METADATA ROUTE
// ============================================================================

/**
 * GET /api/v1/ifrs9/reports/metadata
 * Get available reports metadata and configuration
 */
router.get('/metadata',
  async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: {
          reports: [
            {
              id: 'lifetime-pd-yearly',
              name: 'Lifetime PD - Yearly Marginal',
              endpoint: '/api/v1/ifrs9/reports/lifetime-pd/yearly',
              description: 'Probability of Default data by year with dynamic pivot columns',
              required_params: ['prc_date'],
              optional_params: ['pd_config_id', 'pd_method', 'scalar_id', 'fl_flag'],
              database_table: 'frs9_imp_ca_pd_structure'
            },
            {
              id: 'lifetime-pd-monthly',
              name: 'Lifetime PD - Monthly Marginal',
              endpoint: '/api/v1/ifrs9/reports/lifetime-pd/monthly',
              description: 'Probability of Default data by month with dynamic pivot columns',
              required_params: ['prc_date'],
              optional_params: ['pd_config_id', 'pd_method', 'scalar_id', 'fl_flag'],
              database_table: 'frs9_imp_ca_pd_structure'
            },
            {
              id: 'lifetime-pd-account-details',
              name: 'Lifetime PD - Account Details',
              endpoint: '/api/v1/ifrs9/reports/lifetime-pd/account-details',
              description: 'Account-level PD structure and scalar details from frs9_imp_ca_pd_structure',
              required_params: ['prc_date'],
              optional_params: ['pd_config_id', 'pd_method', 'scalar_id', 'fl_flag', 'page', 'limit'],
              database_table: 'frs9_imp_ca_pd_structure'
            },
            {
              id: 'lifetime-lgd',
              name: 'Lifetime LGD',
              endpoint: '/api/v1/ifrs9/reports/lifetime-lgd',
              description: 'Loss Given Default data with recovery information (paginated)',
              required_params: ['prc_date'],
              optional_params: ['lgd_config_id', 'lgd_method', 'model_id', 'page', 'limit'],
              database_table: 'frs9_imp_ca_lgd_data',
              supports_pagination: true
            },
            {
              id: 'ead-model',
              name: 'EAD Model',
              endpoint: '/api/v1/ifrs9/reports/ead-model',
              description: 'Exposure at Default model with payment averages',
              required_params: ['prc_date'],
              optional_params: ['ead_config_id'],
              database_table: 'frs9_imp_ca_ead_paym_avg'
            },
            {
              id: 'ecl-result',
              name: 'ECL Result',
              endpoint: '/api/v1/ifrs9/reports/ecl-result',
              description: 'Expected Credit Loss results aggregated by segment and stage',
              required_params: ['prc_date'],
              optional_params: ['segment_id', 'stage', 'sub_segment'],
              database_table: 'frs9_master_account'
            },
            {
              id: 'ecl-movement',
              name: 'ECL Movement',
              endpoint: '/api/v1/ifrs9/reports/ecl-movement',
              description: 'ECL movement analysis using stored procedures',
              required_params: ['prc_date'],
              optional_params: ['segment_id', 'stage'],
              database_table: 'frs9_imp_movement_data',
              stored_procedure: 'USPR_FRS9_IMP_MOVEMENT'
            },
            {
              id: 'gca-movement',
              name: 'GCA Movement',
              endpoint: '/api/v1/ifrs9/reports/gca-movement',
              description: 'Gross Carrying Amount movement reporting',
              required_params: ['prc_date'],
              optional_params: ['segment_id', 'stage'],
              database_table: 'frs9_master_account'
            },
            {
              id: 'nominative-report',
              name: 'Nominative Report',
              endpoint: '/api/v1/ifrs9/reports/nominative-report',
              description: 'Detailed account-level IFRS 9 data with pagination',
              required_params: ['prc_date'],
              optional_params: ['segment_id', 'stage', 'branch_code', 'page', 'limit'],
              database_table: 'frs9_master_account',
              supports_pagination: true
            }
          ],
          database_info: {
            host: `${process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost'}`,
            port: parseInt(process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'),
            database: process.env.FRS9_DB_NAME || 'FRS9PRO',
            description: 'DS2 FRS9PRO database for IFRS 9 calculations and reporting',
            connection_type: 'PostgreSQL'
          },
          common_parameters: {
            prc_date: {
              type: 'string',
              format: 'YYYY-MM-DD',
              description: 'Processing date for the report (ISO 8601 format)'
            },
            pd_config_id: {
              type: 'integer',
              default: 1,
              description: 'PD configuration ID'
            },
            lgd_config_id: {
              type: 'integer',
              default: 2,
              description: 'LGD configuration ID'
            },
            ead_config_id: {
              type: 'integer',
              default: 1,
              description: 'EAD configuration ID'
            },
            segment_id: {
              type: 'integer',
              description: 'Segment identifier'
            },
            stage: {
              type: 'string',
              enum: ['1', '2', '3'],
              description: 'IFRS 9 staging (1, 2, or 3)'
            },
            fl_flag: {
              type: 'boolean',
              default: false,
              description: 'Forward-looking flag'
            }
          }
        },
        message: 'IFRS 9 Reports metadata retrieved successfully',
        version: '1.0.0',
        last_updated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error retrieving metadata:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve reports metadata',
        details: error.message
      });
    }
  }
);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('IFRS 9 Reports Route Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error in IFRS 9 reports',
    message: 'An unexpected error occurred while processing your request',
    timestamp: new Date().toISOString(),
    request_id: req.headers['x-request-id'] || 'unknown'
  });
});

// ============================================================================
// EXPORT ROUTER
// ============================================================================

export default router;