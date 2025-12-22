// packages/backend/src/api/controllers/r-analytics.controller.ts
// ============================================================================
// 🔬 R ANALYTICS CONTROLLER - REST API endpoints for R Analytics integration
// ============================================================================
// Based on TodoList-v2.md Hour 8 requirements
// Features: IFRS 9 calculations, model management, health monitoring
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { rAnalyticsService } from '../../core/services/r-analytics/r-analytics.service';

export class RAnalyticsController {

  // ============================================================================
  // 🏥 HEALTH AND STATUS ENDPOINTS
  // ============================================================================

  /**
   * Get R Analytics service health status
   * GET /api/v1/r-analytics/health
   */
  public async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ✅ TENANT ROUTING: Pass tenant ID for tenant-specific R Analytics health check
      const tenantId = req.tenant?.id;
      const healthStatus = await rAnalyticsService.checkHealth(tenantId);
      
      const httpStatus = healthStatus.status === 'healthy' ? 200 :
                        healthStatus.status === 'degraded' ? 206 : 503;

      res.status(httpStatus).json({
        success: healthStatus.status !== 'unhealthy',
        data: healthStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available R models
   * GET /api/v1/r-analytics/models
   */
  public async getModels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ✅ TENANT ROUTING: Pass tenant ID for tenant-specific R Analytics routing
      const tenantId = req.tenant?.id;
      const models = await rAnalyticsService.getAvailableModels(tenantId);

      res.json({
        success: true,
        data: {
          models,
          count: models.length
        },
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: req.tenant?.id
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific model information
   * GET /api/v1/r-analytics/models/:modelName
   */
  public async getModelInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { modelName } = req.params;
      // ✅ TENANT ROUTING: Pass tenant ID for tenant-specific R Analytics routing
      const tenantId = req.tenant?.id;
      const modelInfo = await rAnalyticsService.getModelInfo(modelName, tenantId);

      if (!modelInfo) {
        return res.status(404).json({
          success: false,
          error: 'MODEL_NOT_FOUND',
          message: `Model '${modelName}' not found`
        });
      }

      res.json({
        success: true,
        data: modelInfo,
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: req.tenant?.id
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 🧮 IFRS 9 CALCULATION ENDPOINTS
  // ============================================================================

  /**
   * Calculate Expected Credit Loss (ECL)
   * POST /api/v1/r-analytics/calculations/ecl
   */
  public async calculateECL(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { modelName, data, parameters = {} } = req.body;
      const tenantContext = req.tenant!;
      const userContext = req.user!;

      // Get tenant banking type
      const bankingType = await this.getTenantBankingType(tenantContext.id);

      const calculationRequest = {
        modelName,
        data,
        parameters,
        bankingType,
        tenantId: tenantContext.id,
        userId: userContext.id,
        requestId: uuidv4()
      };

      const result = await rAnalyticsService.calculateECL(calculationRequest);

      const httpStatus = result.success ? 200 : 500;

      res.status(httpStatus).json({
        success: result.success,
        data: result.success ? result.results : null,
        metadata: result.metadata,
        requestId: result.requestId,
        error: result.success ? null : 'ECL_CALCULATION_FAILED',
        message: result.success ? 'ECL calculation completed' : 'ECL calculation failed'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate Probability of Default (PD)
   * POST /api/v1/r-analytics/calculations/pd
   */
  public async calculatePD(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { modelName, data, parameters = {} } = req.body;
      const tenantContext = req.tenant!;
      const userContext = req.user!;

      const bankingType = await this.getTenantBankingType(tenantContext.id);

      const calculationRequest = {
        modelName,
        data,
        parameters,
        bankingType,
        tenantId: tenantContext.id,
        userId: userContext.id,
        requestId: uuidv4()
      };

      const result = await rAnalyticsService.calculatePD(calculationRequest);

      const httpStatus = result.success ? 200 : 500;

      res.status(httpStatus).json({
        success: result.success,
        data: result.success ? result.results : null,
        metadata: result.metadata,
        requestId: result.requestId,
        error: result.success ? null : 'PD_CALCULATION_FAILED',
        message: result.success ? 'PD calculation completed' : 'PD calculation failed'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate Loss Given Default (LGD)
   * POST /api/v1/r-analytics/calculations/lgd
   */
  public async calculateLGD(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { modelName, data, parameters = {} } = req.body;
      const tenantContext = req.tenant!;
      const userContext = req.user!;

      const bankingType = await this.getTenantBankingType(tenantContext.id);

      const calculationRequest = {
        modelName,
        data,
        parameters,
        bankingType,
        tenantId: tenantContext.id,
        userId: userContext.id,
        requestId: uuidv4()
      };

      const result = await rAnalyticsService.calculateLGD(calculationRequest);

      const httpStatus = result.success ? 200 : 500;

      res.status(httpStatus).json({
        success: result.success,
        data: result.success ? result.results : null,
        metadata: result.metadata,
        requestId: result.requestId,
        error: result.success ? null : 'LGD_CALCULATION_FAILED',
        message: result.success ? 'LGD calculation completed' : 'LGD calculation failed'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate Exposure at Default (EAD)
   * POST /api/v1/r-analytics/calculations/ead
   */
  public async calculateEAD(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { modelName, data, parameters = {} } = req.body;
      const tenantContext = req.tenant!;
      const userContext = req.user!;

      const bankingType = await this.getTenantBankingType(tenantContext.id);

      const calculationRequest = {
        modelName,
        data,
        parameters,
        bankingType,
        tenantId: tenantContext.id,
        userId: userContext.id,
        requestId: uuidv4()
      };

      const result = await rAnalyticsService.calculateEAD(calculationRequest);

      const httpStatus = result.success ? 200 : 500;

      res.status(httpStatus).json({
        success: result.success,
        data: result.success ? result.results : null,
        metadata: result.metadata,
        requestId: result.requestId,
        error: result.success ? null : 'EAD_CALCULATION_FAILED',
        message: result.success ? 'EAD calculation completed' : 'EAD calculation failed'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Perform IFRS 9 Staging Classification
   * POST /api/v1/r-analytics/calculations/staging
   */
  public async performStaging(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { modelName, data, parameters = {} } = req.body;
      const tenantContext = req.tenant!;
      const userContext = req.user!;

      const bankingType = await this.getTenantBankingType(tenantContext.id);

      const calculationRequest = {
        modelName,
        data,
        parameters,
        bankingType,
        tenantId: tenantContext.id,
        userId: userContext.id,
        requestId: uuidv4()
      };

      const result = await rAnalyticsService.performStaging(calculationRequest);

      const httpStatus = result.success ? 200 : 500;

      res.status(httpStatus).json({
        success: result.success,
        data: result.success ? result.results : null,
        metadata: result.metadata,
        requestId: result.requestId,
        error: result.success ? null : 'STAGING_CALCULATION_FAILED',
        message: result.success ? 'Staging classification completed' : 'Staging classification failed'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Execute custom calculation
   * POST /api/v1/r-analytics/calculations/custom
   */
  public async executeCustomCalculation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { modelName, calculationType, data, parameters = {} } = req.body;
      const tenantContext = req.tenant!;
      const userContext = req.user!;

      // Validate calculation type
      if (!['ECL', 'PD', 'LGD', 'EAD', 'STAGING'].includes(calculationType)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CALCULATION_TYPE',
          message: 'Calculation type must be one of: ECL, PD, LGD, EAD, STAGING'
        });
      }

      const bankingType = await this.getTenantBankingType(tenantContext.id);

      const calculationRequest = {
        modelName,
        data,
        parameters,
        calculationType,
        bankingType,
        tenantId: tenantContext.id,
        userId: userContext.id,
        requestId: uuidv4()
      };

      // Execute based on calculation type
      let result;
      switch (calculationType) {
        case 'ECL':
          result = await rAnalyticsService.calculateECL(calculationRequest);
          break;
        case 'PD':
          result = await rAnalyticsService.calculatePD(calculationRequest);
          break;
        case 'LGD':
          result = await rAnalyticsService.calculateLGD(calculationRequest);
          break;
        case 'EAD':
          result = await rAnalyticsService.calculateEAD(calculationRequest);
          break;
        case 'STAGING':
          result = await rAnalyticsService.performStaging(calculationRequest);
          break;
        default:
          throw new Error(`Unsupported calculation type: ${calculationType}`);
      }

      const httpStatus = result.success ? 200 : 500;

      res.status(httpStatus).json({
        success: result.success,
        data: result.success ? result.results : null,
        metadata: result.metadata,
        requestId: result.requestId,
        calculationType,
        error: result.success ? null : `${calculationType}_CALCULATION_FAILED`,
        message: result.success ? 
          `${calculationType} calculation completed` : 
          `${calculationType} calculation failed`
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 🔧 HELPER METHODS
  // ============================================================================

  private async getTenantBankingType(tenantId: string): Promise<'CONVENTIONAL' | 'SYARIAH'> {
    // TODO: Get actual banking type from tenant configuration
    // For now, return CONVENTIONAL as default
    return 'CONVENTIONAL';
  }
}

// ============================================================================
// 🔍 VALIDATION MIDDLEWARES
// ============================================================================

export const validateCalculationRequest = [
  body('modelName')
    .notEmpty()
    .withMessage('Model name is required')
    .isString()
    .withMessage('Model name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Model name must be between 1 and 100 characters'),

  body('data')
    .isArray({ min: 1 })
    .withMessage('Data must be a non-empty array'),

  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object'),

  // Custom validation for data array
  body('data.*')
    .isObject()
    .withMessage('Each data item must be an object')
];

export const validateCustomCalculationRequest = [
  ...validateCalculationRequest,
  
  body('calculationType')
    .notEmpty()
    .withMessage('Calculation type is required')
    .isIn(['ECL', 'PD', 'LGD', 'EAD', 'STAGING'])
    .withMessage('Calculation type must be one of: ECL, PD, LGD, EAD, STAGING')
];

// Export controller instance
export const rAnalyticsController = new RAnalyticsController();