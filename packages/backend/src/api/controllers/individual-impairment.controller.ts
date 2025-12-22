// packages/backend/src/api/controllers/individual-impairment.controller.ts
// ============================================================================
// 🔧 INDIVIDUAL IMPAIRMENT ASSESSMENT OVERRIDE CONTROLLER
// ============================================================================
// ✅ PATTERN: REST API with comprehensive individual account assessment
// ✅ DATABASE: frs9_imp_ia_* tables with DCF analysis integration
// ✅ FEATURES: Watchlist management, assessment override, DCF analysis, reporting
// ============================================================================

import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';
import { IndividualImpairmentService } from '../../core/services/individual-impairment.service';
import { handleAPIError } from '../../utils/error-handler';
import { AuthenticatedRequest } from '../../api/middleware/auth.middleware';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const IndividualImpairmentHeaderSchema = z.object({
  prc_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid processing date'),
  eff_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid effective date'),
  cif_number: z.string().min(1, 'CIF number is required').max(50, 'CIF number too long'),
  cif_name: z.string().min(1, 'CIF name is required').max(150, 'CIF name too long'),
  account_id: z.number().int().min(1, 'Account ID is required'),
  account_number: z.string().min(1, 'Account number is required').max(50, 'Account number too long'),
  currency: z.string().min(3, 'Currency code must be 3 characters').max(5, 'Currency code too long'),
  eff_interest_rate: z.number().min(0, 'Effective interest rate must be non-negative'),
  interest_rate: z.number().min(0, 'Interest rate must be non-negative'),
  dpd: z.number().int().min(0, 'DPD must be non-negative'),
  collectability: z.number().int().min(1, 'Collectibility score required'),
  rating_code: z.string().min(1, 'Rating code is required').max(5, 'Rating code too long'),
  impaired_flag: z.enum(['I', 'N']),
  method: z.string().min(1, 'Assessment method is required'),
  plafond: z.number().min(0, 'Plafond must be non-negative'),
  outstanding: z.number().min(0, 'Outstanding must be non-negative'),
  accrued_interest: z.number().min(0, 'Accrued interest must be non-negative'),
  carrying_amt: z.number().min(0, 'Carrying amount must be non-negative'),
  ead_amt: z.number().min(0, 'EAD amount must be non-negative'),
  scenario_id: z.number().int().min(1, 'Scenario ID is required'),
  n_of_scenario: z.number().int().min(1, 'Number of scenarios is required'),
  po_rate_1: z.number().min(0).max(1).optional(),
  po_rate_2: z.number().min(0).max(1).optional(),
  po_rate_3: z.number().min(0).max(1).optional(),
  sc_name_1: z.string().max(20).optional(),
  sc_name_2: z.string().max(20).optional(),
  sc_name_3: z.string().max(20).optional(),
  trigger_remarks: z.string().max(1000).optional()
});

const IndividualImpairmentUpdateSchema = z.object({
  impaired_flag: z.enum(['I', 'N']).optional(),
  method: z.string().min(1).optional(),
  trigger_remarks: z.string().max(1000).optional(),
  status: z.number().int().min(1).max(10).optional()
});

const DCFCalculationSchema = z.object({
  account_id: z.number().int().min(1, 'Account ID is required'),
  prc_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid processing date'),
  cash_flows: z.array(z.object({
    periode: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid period date'),
    principal: z.number().min(0, 'Principal must be non-negative'),
    interest: z.number().min(0, 'Interest must be non-negative'),
    collateral: z.number().min(0, 'Collateral must be non-negative')
  })).min(1, 'At least one cash flow is required'),
  scenario_data: z.object({
    scenario_id: z.number().int().min(1),
    scenario_name: z.string(),
    pd_rates: z.array(z.number().min(0).max(1)),
    recovery_rates: z.array(z.number().min(0).max(1))
  }).optional()
});

// ============================================================================
// INDIVIDUAL IMPAIRMENT CONTROLLER CLASS
// ============================================================================

export class IndividualImpairmentController {
  private individualImpairmentService: IndividualImpairmentService;

  constructor() {
    this.individualImpairmentService = new IndividualImpairmentService();
    console.log('✅ [II-CTRL-INIT] IndividualImpairmentController initialized with real database integration');
  }

  // ============================================================================
  // WATCHLIST ENDPOINTS (INDIVIDUAL ASSESSMENT WATCHLIST)
  // ============================================================================

  /**
   * GET /api/v1/banking/individual/impairment/watchlist
   * Get individual impairment watchlist with pagination and filtering
   */
  async getWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔍 [II-001] Getting individual impairment watchlist');

      const { page = 1, limit = 10, search, filter } = req.query;

      // Parse filter if provided
      let parsedFilter = {};
      if (filter && typeof filter === 'string') {
        try {
          parsedFilter = JSON.parse(filter);
        } catch (error) {
          console.warn('Invalid filter parameter:', filter);
        }
      }

      const result = await this.individualImpairmentService.getWatchlist({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        filter: parsedFilter as any
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [II-001] Failed to get watchlist:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/banking/individual/impairment/:id
   * Get single individual impairment record
   */
  async getImpairmentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const impairmentId = parseInt(req.params.id);
      console.log(`🔍 [II-002] Getting individual impairment ID: ${impairmentId}`);

      if (isNaN(impairmentId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid impairment ID'
        });
        return;
      }

      const impairment = await this.individualImpairmentService.getHeaderById(impairmentId);

      res.json({
        success: true,
        data: impairment,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [II-002] Failed to get impairment:', error);
      next(error);
    }
  }

  /**
   * PUT /api/v1/banking/individual/impairment/:id
   * Update individual impairment record (assessment override)
   */
  async updateImpairment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const impairmentId = parseInt(req.params.id);
      console.log(`✏️ [II-003] Updating individual impairment ID: ${impairmentId}`, req.body);

      if (isNaN(impairmentId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid impairment ID'
        });
        return;
      }

      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      // Validate with Zod schema
      const validatedData = IndividualImpairmentUpdateSchema.parse(req.body);

      const updatedImpairment = await this.individualImpairmentService.updateHeader(
        impairmentId,
        validatedData,
        (req as any).user?.email,
        req.ip
      );

      res.json({
        success: true,
        data: updatedImpairment,
        message: 'Individual impairment updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [II-003] Failed to update impairment:', error);
      next(error);
    }
  }

  // ============================================================================
  // DETAIL ENDPOINTS
  // ============================================================================

  /**
   * GET /api/v1/banking/individual/impairment/:id/details
   * Get detailed cash flow data for individual impairment
   */
  async getImpairmentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const impairmentId = parseInt(req.params.id);
      console.log(`🔍 [II-004] Getting impairment details ID: ${impairmentId}`);

      if (isNaN(impairmentId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid impairment ID'
        });
        return;
      }

      const details = await this.individualImpairmentService.getDetails(impairmentId);

      res.json({
        success: true,
        data: details,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id,
          impairmentId: impairmentId
        }
      });

    } catch (error) {
      console.error('❌ [II-004] Failed to get impairment details:', error);
      next(error);
    }
  }

  // ============================================================================
  // DCF ANALYSIS ENDPOINTS
  // ============================================================================

  /**
   * GET /api/v1/banking/individual/impairment/dcf/:accountId
   * Get DCF data for an account
   */
  async getDCFData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accountId = parseInt(req.params.accountId);
      const { prc_date } = req.query;

      console.log(`🔍 [II-005] Getting DCF data for account ID: ${accountId}`);

      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ACCOUNT_ID',
          message: 'Invalid account ID'
        });
        return;
      }

      if (!prc_date || typeof prc_date !== 'string') {
        res.status(400).json({
          success: false,
          error: 'MISSING_DATE',
          message: 'Processing date is required'
        });
        return;
      }

      const dcfData = await this.individualImpairmentService.getDCFData(accountId, prc_date);

      res.json({
        success: true,
        data: dcfData,
        message: 'DCF data retrieved successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id,
          accountId: accountId,
          processingDate: prc_date
        }
      });

    } catch (error) {
      console.error('❌ [II-005] Failed to get DCF data:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/banking/individual/impairment/dcf/calculate
   * Calculate DCF results
   */
  async calculateDCF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🧮 [II-006] Calculating DCF results', req.body);

      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      // Validate with Zod schema
      const validatedData = DCFCalculationSchema.parse(req.body);

      const result = await this.individualImpairmentService.calculateDCF(validatedData);

      res.json({
        success: true,
        data: result,
        message: 'DCF calculation completed successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id,
          accountId: validatedData.account_id
        }
      });

    } catch (error) {
      console.error('❌ [II-006] Failed to calculate DCF:', error);
      next(error);
    }
  }

  // ============================================================================
  // REPORT ENDPOINTS
  // ============================================================================

  /**
   * GET /api/v1/banking/individual/impairment/report
   * Get assessment report with pagination and filtering
   */
  async getAssessmentReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📊 [II-007] Getting assessment report');

      const { page = 1, limit = 10, search, filter } = req.query;

      // Parse filter if provided
      let parsedFilter = {};
      if (filter && typeof filter === 'string') {
        try {
          parsedFilter = JSON.parse(filter);
        } catch (error) {
          console.warn('Invalid filter parameter:', filter);
        }
      }

      const result = await this.individualImpairmentService.getAssessmentReport({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        filter: parsedFilter as any
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Assessment report retrieved successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [II-007] Failed to get assessment report:', error);
      next(error);
    }
  }

  // ============================================================================
  // VALIDATION ENDPOINTS
  // ============================================================================

  /**
   * GET /api/v1/banking/individual/impairment/validate/rating/:ratingCode
   * Validate rating code
   */
  async validateRatingCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ratingCode } = req.params;
      console.log(`🔍 [II-008] Validating rating code: ${ratingCode}`);

      if (!ratingCode) {
        res.status(400).json({
          success: false,
          error: 'MISSING_RATING_CODE',
          message: 'Rating code is required'
        });
        return;
      }

      const isValid = this.individualImpairmentService.validateRatingCode(ratingCode);

      res.json({
        success: true,
        data: {
          ratingCode,
          isValid
        },
        message: `Rating code ${ratingCode} is ${isValid ? 'valid' : 'invalid'}`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id
        }
      });

    } catch (error) {
      console.error('❌ [II-008] Failed to validate rating code:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/banking/individual/impairment/validate/method/:method
   * Validate assessment method
   */
  async validateAssessmentMethod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { method } = req.params;
      console.log(`🔍 [II-009] Validating assessment method: ${method}`);

      if (!method) {
        res.status(400).json({
          success: false,
          error: 'MISSING_METHOD',
          message: 'Assessment method is required'
        });
        return;
      }

      const isValid = this.individualImpairmentService.validateAssessmentMethod(method);

      res.json({
        success: true,
        data: {
          method,
          isValid
        },
        message: `Assessment method ${method} is ${isValid ? 'valid' : 'invalid'}`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id
        }
      });

    } catch (error) {
      console.error('❌ [II-009] Failed to validate assessment method:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/banking/individual/impairment/watchlist/export
   * Export individual impairment watchlist to Excel/CSV
   */
  async exportWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📤 [II-009] Exporting individual impairment watchlist');

      const { format, filters } = req.body;

      if (!format || !['xlsx', 'csv'].includes(format)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_FORMAT',
          message: 'Export format must be xlsx or csv'
        });
        return;
      }

      // Get filtered data
      const { page = 1, limit = 10000, search, filter } = filters || {};
      const watchlistData = await this.individualImpairmentService.getWatchlist({
        page,
        limit,
        search,
        filter
      });

      if (!watchlistData.data || watchlistData.data.length === 0) {
        res.json({
          success: true,
          data: {
            message: 'No data found to export',
            filename: `ifrs9-impairment-watchlist.${format}`,
            download_url: null
          }
        });
        return;
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ifrs9-impairment-watchlist-${timestamp}.${format}`;

      // Create export data (in a real implementation, this would generate actual files)
      const exportData = {
        headers: [
          'Account Number',
          'CIF Number',
          'Customer Name',
          'Currency',
          'Outstanding Balance',
          'ECL Amount',
          'Rating Code',
          'DPD',
          'Impaired Flag',
          'Method',
          'Assessment Status',
          'Created Date'
        ],
        data: watchlistData.data.map(item => [
          item.account_number,
          item.cif_number,
          item.cif_name,
          item.currency,
          item.outstanding || 0,
          item.ecl_ia_amt || 0,
          item.rating_code,
          item.dpd || 0,
          item.impaired_flag,
          item.method,
          'COMPLETED', // Default status
          item.createddate
        ])
      };

      // For now, return data that can be used to generate files on frontend
      res.json({
        success: true,
        data: {
          filename,
          format,
          totalRecords: watchlistData.data.length,
          exportData,
          download_url: `/api/v1/banking/individual/impairment/download/${filename}`
        },
        message: 'Individual impairment watchlist export generated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [II-009] Export failed:', error);
      res.status(500).json({
        success: false,
        error: 'EXPORT_FAILED',
        message: 'Failed to export individual impairment watchlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/banking/individual/impairment/health
   * Health check for individual impairment service
   */
  async healthCheck(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🏥 [II-010] Individual impairment health check');

      // Test database connection
      const client = this.individualImpairmentService['getFRS9Database']();
      await client.query('SELECT 1');

      const healthData = {
        service: 'Individual Impairment Assessment Override',
        status: 'healthy',
        database: 'FRS9 (frs9_imp_ia_* tables)',
        features: [
          'Individual impairment watchlist',
          'Assessment override',
          'DCF analysis',
          'Assessment reporting',
          'Rating validation',
          'Method validation'
        ],
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: healthData,
        message: 'Individual Impairment service is healthy',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [II-010] Health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'SERVICE_UNHEALTHY',
        message: 'Individual Impairment service health check failed',
        data: {
          service: 'Individual Impairment Assessment Override',
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}

// Export controller instance
export const individualImpairmentController = new IndividualImpairmentController();