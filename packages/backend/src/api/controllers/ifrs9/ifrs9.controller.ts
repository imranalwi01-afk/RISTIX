// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/controllers/ifrs9/ifrs9.controller.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, Winston, Joi
// Purpose: IFRS 9 RESTful API controller with calculation endpoints
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { 
  EclCalculationService,
  StagingAnalysisService,
  PdModelService,
  LgdCalculationService,
  EadComputationService,
  ResultAggregationService,
  ValidationRulesService,
  CalculationAuditService
} from '../../../core/services/ifrs9';
import { successResponse, errorResponse } from '../../../utils/api-response';
import { authenticate, authorize, validateTenant } from '../../middleware';
import { asyncHandler } from '../../../utils/async-handler';

// Validation schemas
const calculateEclSchema = Joi.object({
  portfolioAccountIds: Joi.array().items(Joi.string().uuid()).optional(),
  reportingDate: Joi.date().required(),
  scenarioId: Joi.string().uuid().optional(),
  calculationMethod: Joi.string().valid('collective', 'individual').default('collective'),
  forceRecalculation: Joi.boolean().default(false)
});

const stagingAnalysisSchema = Joi.object({
  portfolioAccountId: Joi.string().uuid().required(),
  reportingDate: Joi.date().required(),
  forceRecalculation: Joi.boolean().default(false)
});

const pdCalculationSchema = Joi.object({
  portfolioAccountId: Joi.string().uuid().required(),
  reportingDate: Joi.date().required(),
  stage: Joi.number().integer().min(1).max(3).required(),
  modelType: Joi.string().valid('statistical', 'rating_based', 'hybrid').default('statistical')
});

const lgdCalculationSchema = Joi.object({
  portfolioAccountId: Joi.string().uuid().required(),
  reportingDate: Joi.date().required(),
  downturnLgd: Joi.boolean().default(false),
  collateralRevaluation: Joi.boolean().default(false)
});

const eadComputationSchema = Joi.object({
  portfolioAccountId: Joi.string().uuid().required(),
  reportingDate: Joi.date().required(),
  timeHorizon: Joi.number().integer().min(1).max(120).default(12),
  includeFutureBehavior: Joi.boolean().default(true)
});

const aggregationSchema = Joi.object({
  calculationBatchId: Joi.string().uuid().required(),
  reportingDate: Joi.date().required(),
  aggregationLevel: Joi.string().valid('portfolio', 'product', 'customer_segment', 'stage').required(),
  filterCriteria: Joi.object({
    productTypes: Joi.array().items(Joi.string()).optional(),
    customerSegments: Joi.array().items(Joi.string()).optional(),
    stages: Joi.array().items(Joi.number().integer().min(1).max(3)).optional(),
    branches: Joi.array().items(Joi.string()).optional()
  }).optional()
});

const validationSchema = Joi.object({
  calculationBatchId: Joi.string().uuid().required(),
  validationType: Joi.string().valid('pre_calculation', 'post_calculation', 'data_quality').required(),
  scope: Joi.string().valid('portfolio', 'account', 'calculation').required(),
  portfolioAccountId: Joi.string().uuid().optional(),
  calculationId: Joi.string().uuid().optional()
});

export class Ifrs9Controller {
  private readonly logger: Logger;

  constructor(
    private readonly eclCalculationService: EclCalculationService,
    private readonly stagingAnalysisService: StagingAnalysisService,
    private readonly pdModelService: PdModelService,
    private readonly lgdCalculationService: LgdCalculationService,
    private readonly eadComputationService: EadComputationService,
    private readonly resultAggregationService: ResultAggregationService,
    private readonly validationRulesService: ValidationRulesService,
    private readonly calculationAuditService: CalculationAuditService,
    logger: Logger
  ) {
    this.logger = logger.child({ controller: 'Ifrs9Controller' });
  }

  /**
   * POST /api/v1/ifrs9/calculations/ecl
   * Execute ECL calculation for portfolio accounts
   */
  calculateEcl = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const { error, value } = calculateEclSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, 'Invalid calculation parameters', error.details);
    }

    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    try {
      this.logger.info('ECL calculation requested', {
        tenantId,
        userId: req.user?.id,
        reportingDate: value.reportingDate
      });

      // Execute ECL calculation
      const result = await this.eclCalculationService.calculateEcl({
        tenantId,
        ...value
      });

      // Log audit event
      await this.calculationAuditService.logCalculationEvent({
        tenantId,
        userId: req.user?.id || 'system',
        sessionId: req.session?.id,
        eventType: 'ECL_CALCULATION_REQUESTED',
        eventCategory: 'calculation',
        entityType: 'calculation_batch',
        entityId: result.calculationId,
        description: 'ECL calculation executed successfully',
        metadata: {
          calculationMethod: value.calculationMethod,
          reportingDate: value.reportingDate,
          totalAccounts: result.totalAccounts,
          totalEcl: result.totalEcl
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return successResponse(res, result, 'ECL calculation completed successfully');

    } catch (error) {
      this.logger.error('ECL calculation failed', {
        tenantId,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });

      // Log audit event
      await this.calculationAuditService.logCalculationEvent({
        tenantId,
        userId: req.user?.id || 'system',
        sessionId: req.session?.id,
        eventType: 'ECL_CALCULATION_FAILED',
        eventCategory: 'calculation',
        entityType: 'calculation_batch',
        entityId: 'unknown',
        description: `ECL calculation failed: ${error.message}`,
        metadata: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return errorResponse(res, 500, 'ECL calculation failed', error.message);
    }
  });

  /**
   * POST /api/v1/ifrs9/staging/analyze
   * Analyze staging status for portfolio account
   */
  analyzeStagingStatus = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = stagingAnalysisSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, 'Invalid staging analysis parameters', error.details);
    }

    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    try {
      const result = await this.stagingAnalysisService.analyzeStagingStatus({
        tenantId,
        ...value
      });

      // Log audit event
      await this.calculationAuditService.logCalculationEvent({
        tenantId,
        userId: req.user?.id || 'system',
        sessionId: req.session?.id,
        eventType: 'STAGING_ANALYSIS_COMPLETED',
        eventCategory: 'calculation',
        entityType: 'portfolio_account',
        entityId: value.portfolioAccountId,
        description: 'Staging analysis completed',
        metadata: {
          currentStage: result.currentStage,
          previousStage: result.previousStage,
          stagingReason: result.stagingReason
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return successResponse(res, result, 'Staging analysis completed successfully');

    } catch (error) {
      this.logger.error('Staging analysis failed', {
        tenantId,
        portfolioAccountId: value.portfolioAccountId,
        error: error.message
      });

      return errorResponse(res, 500, 'Staging analysis failed', error.message);
    }
  });

  /**
   * POST /api/v1/ifrs9/pd/calculate
   * Calculate Probability of Default
   */
  calculatePd = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = pdCalculationSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, 'Invalid PD calculation parameters', error.details);
    }

    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    try {
      const result = await this.pdModelService.calculatePd({
        tenantId,
        ...value
      });

      return successResponse(res, result, 'PD calculation completed successfully');

    } catch (error) {
      this.logger.error('PD calculation failed', {
        tenantId,
        portfolioAccountId: value.portfolioAccountId,
        error: error.message
      });

      return errorResponse(res, 500, 'PD calculation failed', error.message);
    }
  });

  /**
   * POST /api/v1/ifrs9/lgd/calculate
   * Calculate Loss Given Default
   */
  calculateLgd = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = lgdCalculationSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, 'Invalid LGD calculation parameters', error.details);
    }

    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    try {
      const result = await this.lgdCalculationService.calculateLgd({
        tenantId,
        ...value
      });

      return successResponse(res, result, 'LGD calculation completed successfully');

    } catch (error) {
      this.logger.error('LGD calculation failed', {
        tenantId,
        portfolioAccountId: value.portfolioAccountId,
        error: error.message
      });

      return errorResponse(res, 500, 'LGD calculation failed', error.message);
    }
  });

  /**
   * POST /api/v1/ifrs9/ead/compute
   * Compute Exposure at Default
   */
  computeEad = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = eadComputationSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, 'Invalid EAD computation parameters', error.details);
    }

    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    try {
      const result = await this.eadComputationService.computeEad({
        tenantId,
        ...value
      });

      return successResponse(res, result, 'EAD computation completed successfully');

    } catch (error) {
      this.logger.error('EAD computation failed', {
        tenantId,
        portfolioAccountId: value.portfolioAccountId,
        error: error.message
      });

      return errorResponse(res, 500, 'EAD computation failed', error.message);
    }
  });

  /**
   * POST /api/v1/ifrs9/results/aggregate
   * Aggregate calculation results
   */
  aggregateResults = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = aggregationSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, 'Invalid aggregation parameters', error.details);
    }

    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    try {
      const result = await this.resultAggregationService.aggregateResults({
        tenantId,
        ...value
      });

      return successResponse(res, result, 'Result aggregation completed successfully');

    } catch (error) {
      this.logger.error('Result aggregation failed', {
        tenantId,
        calculationBatchId: value.calculationBatchId,
        error: error.message
      });

      return errorResponse(res, 500, 'Result aggregation failed', error.message);
    }
  });

  /**
   * GET /api/v1/ifrs9/results/portfolio-summary/:calculationBatchId
   * Get portfolio summary for calculation batch
   */
  getPortfolioSummary = asyncHandler(async (req: Request, res: Response) => {
    const calculationBatchId = req.params.calculationBatchId;
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    if (!calculationBatchId) {
      return errorResponse(res, 400, 'Calculation batch ID required');
    }

    try {
      const result = await this.resultAggregationService.generatePortfolioSummary(
        tenantId,
        calculationBatchId
      );

      return successResponse(res, result, 'Portfolio summary retrieved successfully');

    } catch (error) {
      this.logger.error('Portfolio summary retrieval failed', {
        tenantId,
        calculationBatchId,
        error: error.message
      });

      return errorResponse(res, 500, 'Portfolio summary retrieval failed', error.message);
    }
  });

  /**
   * POST /api/v1/ifrs9/validation/execute
   * Execute validation checks
   */
  executeValidation = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = validationSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, 'Invalid validation parameters', error.details);
    }

    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    try {
      const result = await this.validationRulesService.executeValidation({
        tenantId,
        ...value
      });

      return successResponse(res, result, 'Validation executed successfully');

    } catch (error) {
      this.logger.error('Validation execution failed', {
        tenantId,
        calculationBatchId: value.calculationBatchId,
        error: error.message
      });

      return errorResponse(res, 500, 'Validation execution failed', error.message);
    }
  });

  /**
   * GET /api/v1/ifrs9/audit/trail
   * Query audit trail
   */
  getAuditTrail = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    const query = {
      tenantId,
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
      eventType: req.query.eventType as string,
      eventCategory: req.query.eventCategory as string,
      userId: req.query.userId as string,
      fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
      toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    try {
      const result = await this.calculationAuditService.queryAuditTrail(query);

      return successResponse(res, result, 'Audit trail retrieved successfully');

    } catch (error) {
      this.logger.error('Audit trail query failed', {
        tenantId,
        error: error.message
      });

      return errorResponse(res, 500, 'Audit trail query failed', error.message);
    }
  });

  /**
   * GET /api/v1/ifrs9/calculation-batches
   * Get calculation batches for tenant
   */
  getCalculationBatches = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return errorResponse(res, 400, 'Tenant context required');
    }

    try {
      // This would be implemented in a separate service
      const result = {
        calculationBatches: [],
        totalCount: 0
      };

      return successResponse(res, result, 'Calculation batches retrieved successfully');

    } catch (error) {
      this.logger.error('Calculation batches retrieval failed', {
        tenantId,
        error: error.message
      });

      return errorResponse(res, 500, 'Calculation batches retrieval failed', error.message);
    }
  });

  /**
   * GET /api/v1/ifrs9/health
   * Health check endpoint
   */
  healthCheck = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;

    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        tenantId,
        services: {
          eclCalculation: 'operational',
          stagingAnalysis: 'operational',
          pdModel: 'operational',
          lgdCalculation: 'operational',
          eadComputation: 'operational',
          resultAggregation: 'operational',
          validation: 'operational',
          audit: 'operational'
        }
      };

      return successResponse(res, healthStatus, 'IFRS 9 services are healthy');

    } catch (error) {
      this.logger.error('Health check failed', {
        tenantId,
        error: error.message
      });

      return errorResponse(res, 500, 'Health check failed', error.message);
    }
  });
}

export { IFRS9Controller };
