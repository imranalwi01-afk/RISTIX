// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/ifrs9/pd-model.service.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Winston, Joi
// Purpose: Probability of Default calculation service with simple statistical models
// ============================================================================

import * as Joi from 'joi';
import { PortfolioAccount } from '../../models/banking/portfolio-account.model';
import { modelManager } from '../../../models/index';

export interface PdCalculationInput {
  tenantId: string;
  portfolioAccountId: string;
  reportingDate: Date;
  stage: number;
  modelType?: 'statistical' | 'rating_based' | 'hybrid';
}

export interface PdCalculationResult {
  portfolioAccountId: string;
  pd12Month: number;
  pdLifetime: number;
  pdCurve: Array<{ period: number; pd: number }>;
  modelType: string;
  modelVersion: string;
  calculationDate: Date;
  parameters: {
    baseRate: number;
    riskFactors: any;
    adjustments: any;
  };
}

export interface PdModelParameters {
  modelId: string;
  modelType: string;
  baseRate: number;
  riskFactors: {
    industryRisk: number;
    customerTypeRisk: number;
    productRisk: number;
    macroeconomicRisk: number;
  };
  stageAdjustments: {
    stage1Multiplier: number;
    stage2Multiplier: number;
    stage3Multiplier: number;
  };
  timeDecayFactors: number[];
}

const pdCalculationInputSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  portfolioAccountId: Joi.string().uuid().required(),
  reportingDate: Joi.date().required(),
  stage: Joi.number().integer().min(1).max(3).required(),
  modelType: Joi.string().valid('statistical', 'rating_based', 'hybrid').default('statistical')
});

// Helper function for tenant model access
async function getTenantModels(tenantId: string) {
  return await modelManager.getTenantModels(tenantId);
}

export class PdModelService {
  constructor() {
    // Initialize logging
  }

  private log(message: string, data?: any): void {
    console.log(`[PdModelService] ${message}`, data || '');
  }

  private logError(message: string, error?: any): void {
    console.error(`[PdModelService] ${message}`, error || '');
  }

  /**
   * Calculate Probability of Default for portfolio account
   */
  async calculatePd(input: PdCalculationInput): Promise<PdCalculationResult> {
    // Validate input
    const { error, value } = pdCalculationInputSchema.validate(input);
    if (error) {
      throw new Error(`Invalid PD calculation input: ${error.message}`);
    }

    const validatedInput = value as PdCalculationInput;

    this.log('Starting PD calculation', {
      tenantId: validatedInput.tenantId,
      portfolioAccountId: validatedInput.portfolioAccountId,
      stage: validatedInput.stage,
      modelType: validatedInput.modelType
    });

    try {
      // Get tenant models and account data
      const models = await getTenantModels(validatedInput.tenantId);
      const account = await this.getPortfolioAccountData(
        models,
        validatedInput.portfolioAccountId
      );

      if (!account) {
        throw new Error(`Portfolio account not found: ${validatedInput.portfolioAccountId}`);
      }

      // Get PD model parameters
      const modelParams = await this.getPdModelParameters(
        models,
        account,
        validatedInput.modelType || 'statistical'
      );

      // Calculate base PD
      const basePd = await this.calculateBasePd(account, modelParams);

      // Apply stage adjustments
      const adjustedPd = this.applyStageAdjustments(
        basePd,
        validatedInput.stage,
        modelParams
      );

      // Calculate PD term structure
      const pdCurve = this.calculatePdCurve(adjustedPd, modelParams);

      // Extract 12-month and lifetime PD
      const pd12Month = pdCurve.find(p => p.period === 12)?.pd || adjustedPd;
      const pdLifetime = this.calculateLifetimePd(pdCurve);

      const result: PdCalculationResult = {
        portfolioAccountId: validatedInput.portfolioAccountId,
        pd12Month,
        pdLifetime,
        pdCurve,
        modelType: validatedInput.modelType || 'statistical',
        modelVersion: modelParams.modelId,
        calculationDate: new Date(),
        parameters: {
          baseRate: modelParams.baseRate,
          riskFactors: modelParams.riskFactors,
          adjustments: modelParams.stageAdjustments
        }
      };

      this.log('PD calculation completed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        pd12Month,
        pdLifetime,
        modelType: validatedInput.modelType
      });

      return result;

    } catch (error) {
      this.logError('PD calculation failed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`PD calculation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get PD model parameters based on account characteristics
   */
  private async getPdModelParameters(
    models: any,
    account: any,
    modelType: string
  ): Promise<PdModelParameters> {
    try {
      // Get model configuration from database
      const pdModel = await models.PdModel.findOne({
        where: {
          modelType,
          productType: account.productType,
          isActive: true
        },
        include: [{
          model: models.PdParameter,
          as: 'Parameters'
        }]
      });

      if (!pdModel) {
        // Use default model parameters
        return this.getDefaultModelParameters(account, modelType);
      }

      // Extract parameters from model
      const parameters = pdModel.Parameters.reduce((params: any, param: any) => {
        params[param.parameterKey] = param.parameterValue;
        return params;
      }, {});

      return {
        modelId: pdModel.id,
        modelType: pdModel.modelType,
        baseRate: parseFloat(parameters.baseRate || '0.02'),
        riskFactors: {
          industryRisk: parseFloat(parameters.industryRiskFactor || '1.0'),
          customerTypeRisk: parseFloat(parameters.customerTypeRiskFactor || '1.0'),
          productRisk: parseFloat(parameters.productRiskFactor || '1.0'),
          macroeconomicRisk: parseFloat(parameters.macroeconomicRiskFactor || '1.0')
        },
        stageAdjustments: {
          stage1Multiplier: parseFloat(parameters.stage1Multiplier || '1.0'),
          stage2Multiplier: parseFloat(parameters.stage2Multiplier || '2.0'),
          stage3Multiplier: parseFloat(parameters.stage3Multiplier || '5.0')
        },
        timeDecayFactors: this.parseTimeDecayFactors(parameters.timeDecayFactors)
      };

    } catch (error) {
      this.logError('Failed to get PD model parameters', {
        accountId: account.accountId,
        modelType,
        error: error instanceof Error ? error.message : String(error)
      });
      return this.getDefaultModelParameters(account, modelType);
    }
  }

  /**
   * Calculate base PD using statistical model
   */
  private async calculateBasePd(
    account: any,
    modelParams: PdModelParameters
  ): Promise<number> {
    try {
      let basePd = modelParams.baseRate;

      // Apply risk factor adjustments
      const riskAdjustments = [
        this.getIndustryRiskAdjustment(account.Customer?.industryCode, modelParams),
        this.getCustomerTypeRiskAdjustment(account.Customer?.customerType, modelParams),
        this.getProductRiskAdjustment(account.productType, modelParams),
        this.getMacroeconomicRiskAdjustment(modelParams)
      ];

      // Multiplicative risk model
      const totalRiskMultiplier = riskAdjustments.reduce((total, adj) => total * adj, 1);
      basePd = basePd * totalRiskMultiplier;

      // Apply account-specific factors
      const accountFactors = this.calculateAccountSpecificFactors(account);
      basePd = basePd * accountFactors;

      // Ensure PD is within reasonable bounds
      return Math.max(0.0001, Math.min(0.9999, basePd));

    } catch (error) {
      this.logError('Failed to calculate base PD', {
        accountId: account.accountId,
        error: error instanceof Error ? error.message : String(error)
      });
      return modelParams.baseRate;
    }
  }

  /**
   * Apply stage-specific adjustments to PD
   */
  private applyStageAdjustments(
    basePd: number,
    stage: number,
    modelParams: PdModelParameters
  ): number {
    let multiplier = 1.0;

    switch (stage) {
      case 1:
        multiplier = modelParams.stageAdjustments.stage1Multiplier;
        break;
      case 2:
        multiplier = modelParams.stageAdjustments.stage2Multiplier;
        break;
      case 3:
        multiplier = modelParams.stageAdjustments.stage3Multiplier;
        break;
      default:
        multiplier = 1.0;
    }

    const adjustedPd = basePd * multiplier;
    return Math.max(0.0001, Math.min(0.9999, adjustedPd));
  }

  /**
   * Calculate PD term structure (PD curve)
   */
  private calculatePdCurve(
    basePd: number,
    modelParams: PdModelParameters
  ): Array<{ period: number; pd: number }> {
    const curve = [];
    const maxPeriods = 120; // 10 years

    for (let period = 1; period <= maxPeriods; period++) {
      let periodPd = basePd;

      // Apply time decay if available
      if (modelParams.timeDecayFactors && modelParams.timeDecayFactors.length > 0) {
        const decayIndex = Math.min(period - 1, modelParams.timeDecayFactors.length - 1);
        periodPd = basePd * modelParams.timeDecayFactors[decayIndex];
      } else {
        // Default time decay function (PD increases over time)
        const decayFactor = 1 + (period / 120) * 0.5; // 50% increase over 10 years
        periodPd = basePd * decayFactor;
      }

      curve.push({
        period,
        pd: Math.max(0.0001, Math.min(0.9999, periodPd))
      });
    }

    return curve;
  }

  /**
   * Calculate lifetime PD from PD curve
   */
  private calculateLifetimePd(pdCurve: Array<{ period: number; pd: number }>): number {
    // Simplified lifetime PD calculation
    // In practice, this would involve complex survival analysis
    
    let cumulativeSurvival = 1.0;
    let lifetimePd = 0.0;

    for (const point of pdCurve) {
      // Marginal PD for the period
      const marginalPd = point.pd / 12; // Convert annual to monthly
      
      // Probability of default in this period given survival to this period
      const conditionalPd = marginalPd * cumulativeSurvival;
      
      lifetimePd += conditionalPd;
      cumulativeSurvival *= (1 - marginalPd);
      
      // Stop if survival probability becomes very low
      if (cumulativeSurvival < 0.01) break;
    }

    return Math.max(0.0001, Math.min(0.9999, lifetimePd));
  }

  /**
   * Get portfolio account data with related information
   */
  private async getPortfolioAccountData(
    models: any,
    portfolioAccountId: string
  ): Promise<any> {
    return await models.PortfolioAccount.findByPk(portfolioAccountId, {
      include: [
        {
          model: models.Customer,
          as: 'Customer',
          attributes: ['id', 'customerName', 'customerType', 'industryCode', 'riskRating']
        },
        {
          model: models.ProductType,
          as: 'ProductType',
          attributes: ['id', 'productName', 'riskCategory', 'productGroup']
        }
      ]
    });
  }

  // Helper methods for risk adjustments
  private getIndustryRiskAdjustment(industryCode: string | undefined, modelParams: PdModelParameters): number {
    const industryRiskMap: { [key: string]: number } = {
      'agriculture': 1.2,
      'mining': 1.5,
      'manufacturing': 1.0,
      'construction': 1.3,
      'trade': 1.1,
      'services': 0.9,
      'financial': 0.8,
      'government': 0.5
    };

    return industryRiskMap[industryCode?.toLowerCase() || ''] || modelParams.riskFactors.industryRisk;
  }

  private getCustomerTypeRiskAdjustment(customerType: string | undefined, modelParams: PdModelParameters): number {
    const customerRiskMap: { [key: string]: number } = {
      'individual': 1.2,
      'sme': 1.3,
      'corporate': 1.0,
      'government': 0.6,
      'financial_institution': 0.8
    };

    return customerRiskMap[customerType?.toLowerCase() || ''] || modelParams.riskFactors.customerTypeRisk;
  }

  private getProductRiskAdjustment(productType: string | undefined, modelParams: PdModelParameters): number {
    const productRiskMap: { [key: string]: number } = {
      'mortgage': 0.8,
      'auto_loan': 1.0,
      'personal_loan': 1.4,
      'credit_card': 1.6,
      'business_loan': 1.2,
      'trade_finance': 1.1
    };

    return productRiskMap[productType?.toLowerCase() || ''] || modelParams.riskFactors.productRisk;
  }

  private getMacroeconomicRiskAdjustment(modelParams: PdModelParameters): number {
    // In practice, this would use current macroeconomic indicators
    // For now, return the configured factor
    return modelParams.riskFactors.macroeconomicRisk;
  }

  private calculateAccountSpecificFactors(account: any): number {
    let factor = 1.0;

    // Utilization rate factor
    if (account.creditLimit && account.outstandingAmount) {
      const utilizationRate = account.outstandingAmount / account.creditLimit;
      if (utilizationRate > 0.8) {
        factor *= 1.3; // High utilization increases risk
      } else if (utilizationRate < 0.3) {
        factor *= 0.9; // Low utilization decreases risk
      }
    }

    // Account age factor
    if (account.originationDate) {
      const accountAgeMonths = this.getAccountAgeInMonths(account.originationDate);
      if (accountAgeMonths < 12) {
        factor *= 1.2; // New accounts are riskier
      } else if (accountAgeMonths > 60) {
        factor *= 0.9; // Seasoned accounts are less risky
      }
    }

    return factor;
  }

  private getAccountAgeInMonths(originationDate: Date): number {
    const now = new Date();
    const diffTime = now.getTime() - new Date(originationDate).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  }

  private getDefaultModelParameters(_account: any, modelType: string): PdModelParameters {
    return {
      modelId: 'default-model',
      modelType,
      baseRate: 0.02, // 2% base default rate
      riskFactors: {
        industryRisk: 1.0,
        customerTypeRisk: 1.0,
        productRisk: 1.0,
        macroeconomicRisk: 1.0
      },
      stageAdjustments: {
        stage1Multiplier: 1.0,
        stage2Multiplier: 2.5,
        stage3Multiplier: 8.0
      },
      timeDecayFactors: [] // Will use default time decay function
    };
  }

  private parseTimeDecayFactors(factors: string): number[] {
    if (!factors) return [];
    
    try {
      return factors.split(',').map(f => parseFloat(f.trim()));
    } catch {
      return [];
    }
  }
}
