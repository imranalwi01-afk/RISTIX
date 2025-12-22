// packages/backend/src/api/controllers/ifrs9/ecl-calculation.controller.ts
// ============================================================================
// ECL Calculation Controller - IFRS 9 Expected Credit Loss Management
// ============================================================================
// Generated: 2025-08-18
// Purpose: HTTP API controller for ECL calculation batch jobs
// Dependencies: Express, ECL Calculation Service, Tenant Context
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { EclCalculationService } from '../../../core/services/ifrs9/ecl-calculation.service';
import { RAnalyticsIntegrationService } from '../../../core/services/ifrs9/r-analytics-integration.service';
import { ValidationRulesService } from '../../../core/services/ifrs9/validation-rules.service';
import { ResultAggregationService } from '../../../core/services/ifrs9/result-aggregation.service';

export class EclCalculationController {
  private readonly eclCalculationService: EclCalculationService;
  private readonly rAnalyticsService: RAnalyticsIntegrationService;
  private readonly validationService: ValidationRulesService;
  private readonly aggregationService: ResultAggregationService;

  constructor() {
    this.eclCalculationService = new EclCalculationService();
    this.rAnalyticsService = new RAnalyticsIntegrationService();
    this.validationService = new ValidationRulesService();
    this.aggregationService = new ResultAggregationService();
  }

  /**
   * Start ECL calculation batch job
   * POST /api/v1/ifrs9/ecl/calculate
   */
  async startCalculationBatch(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        });
      }

      // Get tenant context
      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required for ECL calculations'
        });
      }

      const {
        reportingDate,
        calculationType = 'full_portfolio',
        portfolioFilters = {},
        calculationParameters = {},
        includeValidation = true,
        includeAggregation = true
      } = req.body;

      console.log('[EclCalculationController] Starting ECL calculation batch', {
        tenantId: tenantContext.id,
        calculationType,
        reportingDate,
        user: req.user?.id
      });

      // Start ECL calculation batch
      const batchJob = await this.eclCalculationService.startCalculationBatch({
        tenantId: tenantContext.id,
        reportingDate: new Date(reportingDate),
        calculationType,
        portfolioFilters,
        calculationParameters,
        requestedBy: req.user?.id || 'system'
      });

      // Pre-calculation validation if requested
      if (includeValidation) {
        await this.validationService.executeValidation({
          tenantId: tenantContext.id,
          calculationBatchId: batchJob.id,
          validationType: 'pre_calculation',
          scope: 'portfolio'
        });
      }

      res.status(202).json({
        success: true,
        data: {
          batchId: batchJob.id,
          status: batchJob.status,
          calculationType: batchJob.calculationType,
          reportingDate: batchJob.reportingDate,
          accountsToProcess: batchJob.accountsToProcess,
          estimatedDuration: batchJob.estimatedDuration,
          createdAt: batchJob.createdAt
        },
        message: 'ECL calculation batch started successfully',
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString(),
          requestId: req.id
        }
      });

    } catch (error) {
      console.error('[EclCalculationController] Failed to start ECL calculation batch', {
        error: error.message,
        stack: error.stack,
        tenantId: req.tenant?.id,
        user: req.user?.id
      });
      next(error);
    }
  }

  /**
   * Get calculation batch status
   * GET /api/v1/ifrs9/ecl/batch/:batchId/status
   */
  async getBatchStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { batchId } = req.params;
      const tenantContext = req.tenant;

      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      const batchStatus = await this.eclCalculationService.getBatchStatus(
        tenantContext.id,
        batchId
      );

      if (!batchStatus) {
        return res.status(404).json({
          success: false,
          error: 'BATCH_NOT_FOUND',
          message: 'ECL calculation batch not found'
        });
      }

      res.json({
        success: true,
        data: batchStatus,
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('[EclCalculationController] Failed to get batch status', {
        error: error.message,
        batchId: req.params.batchId,
        tenantId: req.tenant?.id
      });
      next(error);
    }
  }

  /**
   * Get calculation results
   * GET /api/v1/ifrs9/ecl/batch/:batchId/results
   */
  async getBatchResults(req: Request, res: Response, next: NextFunction) {
    try {
      const { batchId } = req.params;
      const { 
        page = 1, 
        limit = 50, 
        includeDetails = true,
        format = 'json'
      } = req.query;

      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      const results = await this.eclCalculationService.getBatchResults(
        tenantContext.id,
        batchId,
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          includeDetails: includeDetails === 'true'
        }
      );

      // Handle different response formats
      if (format === 'csv') {
        const csvData = await this.convertToCsv(results.calculations);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="ecl-results-${batchId}.csv"`);
        return res.send(csvData);
      }

      res.json({
        success: true,
        data: results,
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('[EclCalculationController] Failed to get batch results', {
        error: error.message,
        batchId: req.params.batchId,
        tenantId: req.tenant?.id
      });
      next(error);
    }
  }

  /**
   * Get portfolio aggregation results
   * GET /api/v1/ifrs9/ecl/batch/:batchId/aggregation
   */
  async getPortfolioAggregation(req: Request, res: Response, next: NextFunction) {
    try {
      const { batchId } = req.params;
      const { 
        level = 'portfolio',
        filters = {}
      } = req.query;

      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      // Get aggregation results
      const aggregationResults = await this.aggregationService.aggregateResults({
        tenantId: tenantContext.id,
        calculationBatchId: batchId,
        reportingDate: new Date(),
        aggregationLevel: level as any,
        filterCriteria: typeof filters === 'string' ? JSON.parse(filters) : filters
      });

      // Get portfolio summary
      const portfolioSummary = await this.aggregationService.generatePortfolioSummary(
        tenantContext.id,
        batchId
      );

      res.json({
        success: true,
        data: {
          aggregations: aggregationResults,
          portfolioSummary,
          level,
          batchId
        },
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('[EclCalculationController] Failed to get portfolio aggregation', {
        error: error.message,
        batchId: req.params.batchId,
        tenantId: req.tenant?.id
      });
      next(error);
    }
  }

  /**
   * Execute R Analytics model
   * POST /api/v1/ifrs9/ecl/r-analytics/execute
   */
  async executeRAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      const {
        modelType,
        portfolioData,
        modelParameters
      } = req.body;

      let result;
      
      switch (modelType) {
        case 'pd_calculation':
          result = await this.rAnalyticsService.calculateProbabilityOfDefault(
            tenantContext.id,
            { accounts: portfolioData, modelParameters }
          );
          break;

        case 'lgd_calculation':
          result = await this.rAnalyticsService.calculateLossGivenDefault(
            tenantContext.id,
            { accounts: portfolioData, modelParameters }
          );
          break;

        case 'staging_analysis':
          result = await this.rAnalyticsService.performStagingAnalysis(
            tenantContext.id,
            { accounts: portfolioData, stagingCriteria: modelParameters }
          );
          break;

        case 'ecl_calculation':
          result = await this.rAnalyticsService.calculateExpectedCreditLoss(
            tenantContext.id,
            portfolioData,
            modelParameters
          );
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'INVALID_MODEL_TYPE',
            message: 'Unsupported model type'
          });
      }

      res.json({
        success: true,
        data: result,
        meta: {
          tenantId: tenantContext.id,
          modelType,
          executionTime: result.executionTime,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('[EclCalculationController] R Analytics execution failed', {
        error: error.message,
        tenantId: req.tenant?.id,
        modelType: req.body.modelType
      });
      next(error);
    }
  }

  /**
   * Cancel calculation batch
   * POST /api/v1/ifrs9/ecl/batch/:batchId/cancel
   */
  async cancelBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { batchId } = req.params;
      const tenantContext = req.tenant;

      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      const cancelResult = await this.eclCalculationService.cancelBatch(
        tenantContext.id,
        batchId,
        req.user?.id || 'system'
      );

      res.json({
        success: true,
        data: cancelResult,
        message: 'ECL calculation batch cancelled successfully',
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('[EclCalculationController] Failed to cancel batch', {
        error: error.message,
        batchId: req.params.batchId,
        tenantId: req.tenant?.id
      });
      next(error);
    }
  }

  /**
   * Helper method to convert results to CSV
   */
  private async convertToCsv(calculations: any[]): Promise<string> {
    if (calculations.length === 0) {
      return 'No data available';
    }

    const headers = [
      'Account ID',
      'Outstanding Amount', 
      'Current Stage',
      'PD (12M)',
      'PD (Lifetime)',
      'LGD',
      'EAD',
      'Final ECL',
      'Calculation Date'
    ];

    const csvRows = [headers.join(',')];

    for (const calc of calculations) {
      const row = [
        calc.PortfolioAccount?.accountId || '',
        calc.PortfolioAccount?.outstandingAmount || 0,
        calc.currentStage || 1,
        calc.pd12Month || 0,
        calc.pdLifetime || 0,
        calc.lgd || 0,
        calc.ead || 0,
        calc.finalEcl || 0,
        calc.calculationDate || ''
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}

// Validation rules for ECL calculation endpoints
export const eclCalculationValidation = {
  startBatch: [
    body('reportingDate')
      .isISO8601()
      .withMessage('Reporting date must be valid ISO 8601 date'),
    body('calculationType')
      .optional()
      .isIn(['full_portfolio', 'incremental', 'specific_accounts'])
      .withMessage('Invalid calculation type'),
    body('portfolioFilters')
      .optional()
      .isObject()
      .withMessage('Portfolio filters must be an object'),
    body('calculationParameters')
      .optional()
      .isObject()
      .withMessage('Calculation parameters must be an object')
  ],

  executeRAnalytics: [
    body('modelType')
      .isIn(['pd_calculation', 'lgd_calculation', 'staging_analysis', 'ecl_calculation'])
      .withMessage('Invalid model type'),
    body('portfolioData')
      .isArray({ min: 1 })
      .withMessage('Portfolio data must be non-empty array'),
    body('modelParameters')
      .isObject()
      .withMessage('Model parameters must be an object')
  ],

  getBatchResults: [
    param('batchId')
      .isUUID()
      .withMessage('Batch ID must be valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limit must be between 1 and 1000')
  ]
};