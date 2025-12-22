// packages/backend/src/api/controllers/ifrs9/model-configuration.controller.ts
// ============================================================================
// Model Configuration Controller - IFRS 9 PD/LGD/EAD Model Parameter Management
// ============================================================================
// Generated: 2025-08-18
// Purpose: HTTP API controller for managing IFRS 9 statistical model configurations
// Dependencies: Express, Configuration Services, Tenant Context
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { logger } from '../../../core/services/logging/winston.service';

export class ModelConfigurationController {
  constructor() {}

  // ============================================================================
  // PD MODEL CONFIGURATION
  // ============================================================================

  /**
   * Get PD model configurations
   * GET /api/v1/ifrs9/models/pd
   */
  async getPdModels(req: Request, res: Response, next: NextFunction) {
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
        productType,
        customerSegment,
        active = true
      } = req.query;

      // Mock PD models - replace with actual database query
      const pdModels = [
        {
          id: 'pd_model_001',
          name: 'Retail Mortgage PD Model',
          productType: 'mortgage',
          customerSegment: 'retail',
          modelType: 'logistic_regression',
          version: '2.1.0',
          isActive: true,
          parameters: {
            baseRates: {
              stage1: 0.015,
              stage2: 0.085,
              stage3: 1.0
            },
            riskFactors: {
              daysPastDue: { weight: 0.35, coefficient: 0.025 },
              debtToIncome: { weight: 0.25, coefficient: 0.018 },
              loanToValue: { weight: 0.20, coefficient: 0.015 },
              creditScore: { weight: 0.15, coefficient: -0.012 },
              employment: { weight: 0.05, coefficient: -0.008 }
            },
            macroFactors: {
              gdpGrowth: { weight: 0.40, coefficient: -0.022 },
              unemploymentRate: { weight: 0.35, coefficient: 0.028 },
              interestRates: { weight: 0.25, coefficient: 0.015 }
            },
            calibration: {
              benchmarkPd: 0.025,
              stressMultiplier: 2.5,
              downturnAdjustment: 1.8
            }
          },
          performance: {
            backtestingScore: 0.87,
            auc: 0.82,
            giniCoefficient: 0.64,
            lastValidation: '2025-01-15',
            nextValidation: '2025-07-15'
          },
          createdAt: '2024-06-15',
          updatedAt: '2025-01-15',
          createdBy: 'risk.modeler@bank.com'
        },
        {
          id: 'pd_model_002',
          name: 'SME Corporate PD Model',
          productType: 'corporate_loan',
          customerSegment: 'sme',
          modelType: 'credit_scoring',
          version: '1.8.2',
          isActive: true,
          parameters: {
            baseRates: {
              stage1: 0.028,
              stage2: 0.125,
              stage3: 1.0
            },
            riskFactors: {
              financialRatio1: { weight: 0.30, coefficient: 0.032 },
              financialRatio2: { weight: 0.25, coefficient: 0.028 },
              industryRisk: { weight: 0.20, coefficient: 0.024 },
              managementQuality: { weight: 0.15, coefficient: -0.018 },
              marketPosition: { weight: 0.10, coefficient: -0.015 }
            },
            macroFactors: {
              gdpGrowth: { weight: 0.35, coefficient: -0.025 },
              sectorGrowth: { weight: 0.40, coefficient: -0.030 },
              creditConditions: { weight: 0.25, coefficient: 0.020 }
            },
            calibration: {
              benchmarkPd: 0.045,
              stressMultiplier: 3.2,
              downturnAdjustment: 2.1
            }
          },
          performance: {
            backtestingScore: 0.84,
            auc: 0.79,
            giniCoefficient: 0.58,
            lastValidation: '2025-01-15',
            nextValidation: '2025-07-15'
          },
          createdAt: '2024-05-20',
          updatedAt: '2025-01-10',
          createdBy: 'risk.modeler@bank.com'
        }
      ];

      // Apply filters
      let filteredModels = pdModels;
      if (productType) {
        filteredModels = filteredModels.filter(model => 
          model.productType === productType
        );
      }
      if (customerSegment) {
        filteredModels = filteredModels.filter(model => 
          model.customerSegment === customerSegment
        );
      }
      if (active !== undefined) {
        filteredModels = filteredModels.filter(model => 
          model.isActive === (active === 'true')
        );
      }

      res.json({
        success: true,
        data: filteredModels,
        total: filteredModels.length,
        meta: {
          tenantId: tenantContext.id,
          bankingMode: tenantContext.bankingMode,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get PD models', {
        error: error.message,
        tenantId: req.tenant?.id
      });
      next(error);
    }
  }

  /**
   * Create PD model configuration
   * POST /api/v1/ifrs9/models/pd
   */
  async createPdModel(req: Request, res: Response, next: NextFunction) {
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
        name,
        productType,
        customerSegment,
        modelType,
        parameters
      } = req.body;

      logger.info('Creating PD model configuration', {
        tenantId: tenantContext.id,
        name,
        productType,
        user: req.user?.id
      });

      // Create new PD model
      const newModel = {
        id: `pd_model_${Date.now()}`,
        name,
        productType,
        customerSegment,
        modelType,
        version: '1.0.0',
        isActive: false, // New models start as inactive
        parameters,
        performance: {
          backtestingScore: null,
          auc: null,
          giniCoefficient: null,
          lastValidation: null,
          nextValidation: null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user?.email || 'system',
        status: 'draft'
      };

      res.status(201).json({
        success: true,
        data: newModel,
        message: 'PD model configuration created successfully',
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString(),
          requestId: req.id
        }
      });

    } catch (error) {
      logger.error('Failed to create PD model', {
        error: error.message,
        tenantId: req.tenant?.id,
        modelName: req.body.name
      });
      next(error);
    }
  }

  // ============================================================================
  // LGD MODEL CONFIGURATION
  // ============================================================================

  /**
   * Get LGD model configurations
   * GET /api/v1/ifrs9/models/lgd
   */
  async getLgdModels(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      // Mock LGD models - replace with actual database query
      const lgdModels = [
        {
          id: 'lgd_model_001',
          name: 'Secured Asset LGD Model',
          productType: 'mortgage',
          collateralType: 'real_estate',
          modelType: 'recovery_analysis',
          version: '1.5.0',
          isActive: true,
          parameters: {
            baseRecoveryRates: {
              residential: 0.75,
              commercial: 0.68,
              land: 0.60
            },
            haircuts: {
              valuation: 0.15,
              liquidation: 0.25,
              timeToRealize: 0.10
            },
            adjustments: {
              economicCycle: 0.05,
              marketLiquidity: 0.08,
              legalCosts: 0.12
            },
            timeFactors: {
              averageRecoveryTime: 18, // months
              discountRate: 0.08
            }
          },
          performance: {
            backtestingScore: 0.91,
            meanAbsoluteError: 0.08,
            lastValidation: '2025-01-20'
          },
          createdAt: '2024-08-10',
          updatedAt: '2025-01-20'
        }
      ];

      res.json({
        success: true,
        data: lgdModels,
        total: lgdModels.length,
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get LGD models', {
        error: error.message,
        tenantId: req.tenant?.id
      });
      next(error);
    }
  }

  // ============================================================================
  // EAD MODEL CONFIGURATION
  // ============================================================================

  /**
   * Get EAD model configurations
   * GET /api/v1/ifrs9/models/ead
   */
  async getEadModels(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      // Mock EAD models - replace with actual database query
      const eadModels = [
        {
          id: 'ead_model_001',
          name: 'Credit Card EAD Model',
          productType: 'credit_card',
          facilityType: 'revolving_credit',
          modelType: 'ccf_behavioral',
          version: '2.0.1',
          isActive: true,
          parameters: {
            ccfParameters: {
              baseCcf: 0.75,
              creditLineCcf: 0.75,
              guaranteeCcf: 1.0,
              letterOfCreditCcf: 0.5
            },
            behaviorParameters: {
              drawdownRateStressed: 0.85,
              drawdownRateNormal: 0.45,
              repaymentBehavior: 'cyclical'
            },
            adjustments: {
              stressMultiplier: 1.3,
              seasonalityAdjustment: 1.1,
              economicCycleAdjustment: 1.15
            },
            timeHorizons: {
              twelveMonth: {
                ccfAdjustment: 1.0,
                behaviorAdjustment: 1.0
              },
              lifetime: {
                ccfAdjustment: 0.9,
                behaviorAdjustment: 0.85
              }
            }
          },
          performance: {
            backtestingScore: 0.88,
            utilizationAccuracy: 0.82,
            lastValidation: '2025-01-18'
          },
          createdAt: '2024-09-15',
          updatedAt: '2025-01-18'
        }
      ];

      res.json({
        success: true,
        data: eadModels,
        total: eadModels.length,
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get EAD models', {
        error: error.message,
        tenantId: req.tenant?.id
      });
      next(error);
    }
  }

  // ============================================================================
  // MODEL VALIDATION & TESTING
  // ============================================================================

  /**
   * Validate model configuration
   * POST /api/v1/ifrs9/models/:modelType/:modelId/validate
   */
  async validateModel(req: Request, res: Response, next: NextFunction) {
    try {
      const { modelType, modelId } = req.params;
      const { validationType = 'full', testData } = req.body;

      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      logger.info('Starting model validation', {
        tenantId: tenantContext.id,
        modelType,
        modelId,
        validationType,
        user: req.user?.id
      });

      // Mock validation results - replace with actual model validation
      const validationResult = {
        modelId,
        modelType,
        validationType,
        status: 'completed',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30000).toISOString(), // 30 seconds later
        results: {
          overallScore: 0.85,
          tests: {
            parameterValidation: {
              status: 'passed',
              score: 0.92,
              issues: []
            },
            statisticalTests: {
              status: 'passed',
              score: 0.88,
              tests: {
                kolmogorovSmirnov: 0.89,
                andersonDarling: 0.87,
                chiSquare: 0.86
              }
            },
            backtesting: {
              status: 'passed',
              score: 0.83,
              periods: 12,
              averageError: 0.08,
              maxError: 0.15
            },
            benchmarking: {
              status: 'warning',
              score: 0.79,
              comparison: 'industry_average',
              deviation: 0.12
            }
          },
          recommendations: [
            'Consider adjusting macro factor weightings',
            'Review benchmark comparison methodology',
            'Update validation dataset with recent observations'
          ]
        }
      };

      res.json({
        success: true,
        data: validationResult,
        message: 'Model validation completed successfully',
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Model validation failed', {
        error: error.message,
        tenantId: req.tenant?.id,
        modelType: req.params.modelType,
        modelId: req.params.modelId
      });
      next(error);
    }
  }

  /**
   * Get model performance metrics
   * GET /api/v1/ifrs9/models/:modelType/:modelId/performance
   */
  async getModelPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const { modelType, modelId } = req.params;
      const { 
        periodFrom,
        periodTo = new Date().toISOString(),
        metrics = 'all'
      } = req.query;

      const tenantContext = req.tenant;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'TENANT_REQUIRED',
          message: 'Tenant context is required'
        });
      }

      // Mock performance metrics
      const performance = {
        modelId,
        modelType,
        reportingPeriod: {
          from: periodFrom,
          to: periodTo
        },
        metrics: {
          accuracy: {
            overall: 0.85,
            byStage: {
              stage1: 0.88,
              stage2: 0.82,
              stage3: 0.79
            },
            trend: [0.84, 0.85, 0.86, 0.85, 0.85] // last 5 months
          },
          discriminatoryPower: {
            auc: 0.82,
            gini: 0.64,
            ks: 0.28
          },
          calibration: {
            hosmerLemeshow: 0.89,
            binnedAnalysis: {
              bin1: { predicted: 0.01, actual: 0.012 },
              bin2: { predicted: 0.03, actual: 0.028 },
              bin3: { predicted: 0.07, actual: 0.075 },
              bin4: { predicted: 0.15, actual: 0.148 },
              bin5: { predicted: 0.32, actual: 0.335 }
            }
          },
          stability: {
            psi: 0.08, // Population Stability Index
            csi: 0.06  // Characteristic Stability Index
          }
        },
        benchmarks: {
          industryAverage: 0.80,
          regulatoryMinimum: 0.70,
          internalTarget: 0.85
        },
        alerts: [
          {
            severity: 'warning',
            metric: 'stability.psi',
            threshold: 0.10,
            currentValue: 0.08,
            description: 'PSI approaching monitoring threshold'
          }
        ]
      };

      res.json({
        success: true,
        data: performance,
        meta: {
          tenantId: tenantContext.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get model performance', {
        error: error.message,
        tenantId: req.tenant?.id,
        modelType: req.params.modelType,
        modelId: req.params.modelId
      });
      next(error);
    }
  }
}

// Validation rules for model configuration endpoints
export const modelConfigurationValidation = {
  createPdModel: [
    body('name')
      .isLength({ min: 3, max: 100 })
      .withMessage('Model name must be between 3 and 100 characters'),
    body('productType')
      .isIn(['mortgage', 'personal_loan', 'credit_card', 'corporate_loan', 'auto_loan'])
      .withMessage('Invalid product type'),
    body('customerSegment')
      .isIn(['retail', 'sme', 'corporate', 'institutional'])
      .withMessage('Invalid customer segment'),
    body('modelType')
      .isIn(['logistic_regression', 'credit_scoring', 'machine_learning', 'expert_judgment'])
      .withMessage('Invalid model type'),
    body('parameters')
      .isObject()
      .withMessage('Parameters must be an object')
  ],

  validateModel: [
    param('modelType')
      .isIn(['pd', 'lgd', 'ead'])
      .withMessage('Model type must be pd, lgd, or ead'),
    param('modelId')
      .isUUID()
      .withMessage('Model ID must be valid UUID'),
    body('validationType')
      .optional()
      .isIn(['quick', 'full', 'backtesting', 'benchmarking'])
      .withMessage('Invalid validation type')
  ]
};