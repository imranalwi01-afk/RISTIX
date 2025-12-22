// packages/backend/src/api/controllers/ifrs9/staging-analysis.controller.ts
// ============================================================================
// Staging Analysis Controller - IFRS 9 Three-Stage Classification Management
// ============================================================================
// Generated: 2025-08-18
// Purpose: HTTP API controller for IFRS 9 staging analysis and classification
// Dependencies: Express, Staging Analysis Service, Tenant Context
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { StagingAnalysisService } from '../../../core/services/ifrs9/staging-analysis.service';
import { logger } from '../../../core/services/logging/winston.service';

export class StagingAnalysisController {
  constructor(
    private readonly stagingAnalysisService: StagingAnalysisService
  ) {}

  /**
   * Analyze staging status for single account
   * POST /api/v1/ifrs9/staging/analyze-account
   */
  async analyzeAccountStaging(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        });
      }

      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required for staging analysis'
        });
      }

      const {
        portfolioAccountId,
        reportingDate,
        forceRecalculation = false
      } = req.body;

      logger.info('Starting account staging analysis', {
        tenantId: tenantContext.id,
        portfolioAccountId,
        reportingDate,
        user: req.user?.id
      });

      const stagingResult = await this.stagingAnalysisService.analyzeStagingStatus({
        tenantId: tenantContext.id,
        portfolioAccountId,
        reportingDate: new Date(reportingDate),
        forceRecalculation
      });

      res.json({
        success: true,
        data: stagingResult,
        message: 'Account staging analysis completed successfully',
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString(),
          requestId: req.id
        }
      });

    } catch (error) {
      logger.error('Failed to analyze account staging', {
        error: error.message,
        stack: error.stack,
        tenantId: req.tenant?.id,
        portfolioAccountId: req.body.portfolioAccountId
      });
      next(error);
    }
  }

  /**
   * Analyze staging for multiple accounts
   * POST /api/v1/ifrs9/staging/analyze-portfolio
   */
  async analyzePortfolioStaging(req: Request, res: Response, next: NextFunction) {
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
        portfolioAccountIds = [],
        reportingDate,
        portfolioFilters = {},
        batchSize = 100,
        forceRecalculation = false
      } = req.body;

      logger.info('Starting portfolio staging analysis', {
        tenantId: tenantContext.id,
        accountCount: portfolioAccountIds.length || 'all',
        reportingDate,
        user: req.user?.id
      });

      // Start batch processing (this would typically be async)
      const batchJobId = `staging_${tenantContext.id}_${Date.now()}`;
      
      // For now, return job initiation response
      // In full implementation, this would start a background job
      res.status(202).json({
        success: true,
        data: {
          batchJobId,
          status: 'initiated',
          accountsToProcess: portfolioAccountIds.length || 'all_portfolio',
          reportingDate,
          estimatedDuration: '5-15 minutes'
        },
        message: 'Portfolio staging analysis initiated',
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString(),
          requestId: req.id
        }
      });

    } catch (error) {
      logger.error('Failed to initiate portfolio staging analysis', {
        error: error.message,
        tenantId: req.tenant?.id
      });
      next(error);
    }
  }

  /**
   * Get stage movements summary for reporting period
   * GET /api/v1/ifrs9/staging/movements
   */
  async getStageMovements(req: Request, res: Response, next: NextFunction) {
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
        fromDate,
        toDate = new Date().toISOString()
      } = req.query;

      const movementSummary = await this.stagingAnalysisService.analyzeStageMovements(
        tenantContext.id,
        new Date(fromDate as string),
        new Date(toDate as string)
      );

      res.json({
        success: true,
        data: movementSummary,
        meta: {
          tenantId: tenantContext.id,
          fromDate,
          toDate,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get stage movements', {
        error: error.message,
        tenantId: req.tenant?.id,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate
      });
      next(error);
    }
  }

  /**
   * Get staging configuration for tenant
   * GET /api/v1/ifrs9/staging/configuration
   */
  async getStagingConfiguration(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      // Return staging configuration parameters
      // In full implementation, this would come from database
      const stagingConfig = {
        tenantId: tenantContext.id,
        parameters: {
          stage2Criteria: {
            dpdThreshold: 30,
            sicrPdMultiple: 2.0,
            qualitativeFactors: [
              'significant_financial_difficulty',
              'breach_of_contract',
              'forbearance_restructuring',
              'bankruptcy_proceedings'
            ]
          },
          stage3Criteria: {
            dpdThreshold: 90,
            defaultIndicators: [
              'unlikely_to_pay',
              'material_credit_loss',
              'significant_concessions'
            ]
          },
          backstopRules: {
            stage2Backstop: 30, // days past due
            stage3Backstop: 90, // days past due
            probabilisticDefault: true
          },
          modelParameters: {
            pdThresholdIncrease: 2.0,
            ratingNotchesThreshold: 2,
            macroeconomicAdjustments: true
          }
        },
        bankingMode: tenantContext.bankingMode || 'conventional',
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      };

      res.json({
        success: true,
        data: stagingConfig,
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get staging configuration', {
        error: error.message,
        tenantId: req.tenant?.id
      });
      next(error);
    }
  }

  /**
   * Update staging configuration
   * PUT /api/v1/ifrs9/staging/configuration
   */
  async updateStagingConfiguration(req: Request, res: Response, next: NextFunction) {
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
        stage2Criteria,
        stage3Criteria,
        backstopRules,
        modelParameters
      } = req.body;

      logger.info('Updating staging configuration', {
        tenantId: tenantContext.id,
        user: req.user?.id
      });

      // In full implementation, this would update database configuration
      const updatedConfig = {
        tenantId: tenantContext.id,
        parameters: {
          stage2Criteria,
          stage3Criteria,
          backstopRules,
          modelParameters
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: req.user?.id || 'system'
      };

      res.json({
        success: true,
        data: updatedConfig,
        message: 'Staging configuration updated successfully',
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString(),
          requestId: req.id
        }
      });

    } catch (error) {
      logger.error('Failed to update staging configuration', {
        error: error.message,
        tenantId: req.tenant?.id,
        user: req.user?.id
      });
      next(error);
    }
  }

  /**
   * Get staging history for account
   * GET /api/v1/ifrs9/staging/account/:accountId/history
   */
  async getAccountStagingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const { 
        limit = 50,
        fromDate,
        toDate
      } = req.query;

      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      // In full implementation, this would query staging history from database
      const stagingHistory = {
        portfolioAccountId: accountId,
        tenantId: tenantContext.id,
        history: [
          // Mock data - replace with actual database query
          {
            stageChangeDate: '2025-01-01',
            fromStage: 1,
            toStage: 2,
            reason: 'Significant increase in credit risk - 45 days past due',
            daysPastDue: 45,
            pdChange: { from: 0.02, to: 0.08 },
            riskIndicators: {
              quantitative: ['dpd_threshold_exceeded'],
              qualitative: ['payment_irregularity']
            }
          }
        ],
        totalRecords: 1,
        currentStage: 2,
        lastStageChange: '2025-01-01'
      };

      res.json({
        success: true,
        data: stagingHistory,
        meta: {
          tenantId: tenantContext.id,
          accountId,
          limit: parseInt(limit as string),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get account staging history', {
        error: error.message,
        tenantId: req.tenant?.id,
        accountId: req.params.accountId
      });
      next(error);
    }
  }

  /**
   * Get portfolio staging distribution
   * GET /api/v1/ifrs9/staging/distribution
   */
  async getPortfolioStagingDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      const {
        reportingDate = new Date().toISOString(),
        groupBy = 'product_type'
      } = req.query;

      // Mock staging distribution - replace with actual database query
      const stagingDistribution = {
        reportingDate,
        tenantId: tenantContext.id,
        totalAccounts: 1250,
        distribution: {
          stage1: {
            count: 950,
            percentage: 76.0,
            totalExposure: 125000000,
            averagePd: 0.015
          },
          stage2: {
            count: 220,
            percentage: 17.6,
            totalExposure: 28000000,
            averagePd: 0.085
          },
          stage3: {
            count: 80,
            percentage: 6.4,
            totalExposure: 12000000,
            averagePd: 1.0
          }
        },
        groupedDistribution: {
          // This would be populated based on groupBy parameter
          mortgage: { stage1: 450, stage2: 80, stage3: 20 },
          personal_loan: { stage1: 300, stage2: 90, stage3: 35 },
          credit_card: { stage1: 200, stage2: 50, stage3: 25 }
        }
      };

      res.json({
        success: true,
        data: stagingDistribution,
        meta: {
          tenantId: tenantContext.id,
          reportingDate,
          groupBy,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get portfolio staging distribution', {
        error: error.message,
        tenantId: req.tenant?.id,
        reportingDate: req.query.reportingDate
      });
      next(error);
    }
  }
}

// Validation rules for staging analysis endpoints
export const stagingAnalysisValidation = {
  analyzeAccount: [
    body('portfolioAccountId')
      .isUUID()
      .withMessage('Portfolio account ID must be valid UUID'),
    body('reportingDate')
      .isISO8601()
      .withMessage('Reporting date must be valid ISO 8601 date'),
    body('forceRecalculation')
      .optional()
      .isBoolean()
      .withMessage('Force recalculation must be boolean')
  ],

  analyzePortfolio: [
    body('portfolioAccountIds')
      .optional()
      .isArray()
      .withMessage('Portfolio account IDs must be array'),
    body('portfolioAccountIds.*')
      .optional()
      .isUUID()
      .withMessage('Each portfolio account ID must be valid UUID'),
    body('reportingDate')
      .isISO8601()
      .withMessage('Reporting date must be valid ISO 8601 date'),
    body('batchSize')
      .optional()
      .isInt({ min: 10, max: 1000 })
      .withMessage('Batch size must be between 10 and 1000')
  ],

  getMovements: [
    query('fromDate')
      .isISO8601()
      .withMessage('From date must be valid ISO 8601 date'),
    query('toDate')
      .optional()
      .isISO8601()
      .withMessage('To date must be valid ISO 8601 date')
  ],

  updateConfiguration: [
    body('stage2Criteria')
      .optional()
      .isObject()
      .withMessage('Stage 2 criteria must be object'),
    body('stage3Criteria')
      .optional()
      .isObject()
      .withMessage('Stage 3 criteria must be object'),
    body('backstopRules')
      .optional()
      .isObject()
      .withMessage('Backstop rules must be object'),
    body('modelParameters')
      .optional()
      .isObject()
      .withMessage('Model parameters must be object')
  ]
};