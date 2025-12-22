// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/ifrs9/ead-computation.service.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Winston, Joi
// Purpose: Exposure at Default computation service with CCF application
// ============================================================================

import * as Joi from 'joi';
import { PortfolioAccount } from '../../models/banking/portfolio-account.model';
import { modelManager } from '../../../models/index';

export interface EadComputationInput {
  tenantId: string;
  portfolioAccountId: string;
  reportingDate: Date;
  timeHorizon?: number; // months (12 for 12-month EAD, lifetime for lifetime EAD)
  includeFutureBehavior?: boolean;
}

export interface EadComputationResult {
  portfolioAccountId: string;
  ead: number;
  outstandingAmount: number;
  committedAmount: number;
  undrawnAmount: number;
  ccf: number; // Credit Conversion Factor
  expectedDrawdown: number;
  isOnBalanceSheet: boolean;
  isOffBalanceSheet: boolean;
  calculationDate: Date;
  timeHorizon: number;
  methodology: string;
  parameters: {
    ccfParameters: any;
    behaviorParameters: any;
    adjustments: any;
  };
}

export interface CcfCalculationResult {
  productType: string;
  customerSegment: string;
  ccf: number;
  historicalDrawdownRate: number;
  adjustedCcf: number;
  stressAdjustment: number;
}

const eadComputationInputSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  portfolioAccountId: Joi.string().uuid().required(),
  reportingDate: Joi.date().required(),
  timeHorizon: Joi.number().integer().min(1).max(120).default(12),
  includeFutureBehavior: Joi.boolean().default(true)
});

// Helper function for tenant model access
async function getTenantModels(tenantId: string) {
  return await modelManager.getTenantModels(tenantId);
}

export class EadComputationService {
  constructor() {
    // Initialize logging
  }

  private log(message: string, data?: any): void {
    console.log(`[EadComputationService] ${message}`, data || '');
  }

  private logError(message: string, error?: any): void {
    console.error(`[EadComputationService] ${message}`, error || '');
  }

  /**
   * Compute Exposure at Default for portfolio account
   */
  async computeEad(input: EadComputationInput): Promise<EadComputationResult> {
    // Validate input
    const { error, value } = eadComputationInputSchema.validate(input);
    if (error) {
      throw new Error(`Invalid EAD computation input: ${error.message}`);
    }

    const validatedInput = value as EadComputationInput;

    this.log('Starting EAD computation', {
      tenantId: validatedInput.tenantId,
      portfolioAccountId: validatedInput.portfolioAccountId,
      timeHorizon: validatedInput.timeHorizon
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

      // Get EAD model parameters
      const eadParams = await this.getEadModelParameters(
        models,
        account
      );

      // Determine exposure components
      const exposureComponents = this.analyzeExposureComponents(account);

      // Calculate Credit Conversion Factor for off-balance sheet items
      const ccfResult = await this.calculateCreditConversionFactor(
        models,
        account,
        validatedInput.timeHorizon,
        eadParams
      );

      // Calculate expected drawdown for undrawn commitments
      const expectedDrawdown = await this.calculateExpectedDrawdown(
        account,
        ccfResult,
        validatedInput.timeHorizon,
        validatedInput.includeFutureBehavior
      );

      // Calculate final EAD
      const finalEad = this.calculateFinalEad(
        exposureComponents,
        expectedDrawdown,
        ccfResult
      );

      const result: EadComputationResult = {
        portfolioAccountId: validatedInput.portfolioAccountId,
        ead: finalEad,
        outstandingAmount: exposureComponents.outstandingAmount,
        committedAmount: exposureComponents.committedAmount,
        undrawnAmount: exposureComponents.undrawnAmount,
        ccf: ccfResult.adjustedCcf,
        expectedDrawdown,
        isOnBalanceSheet: exposureComponents.isOnBalanceSheet,
        isOffBalanceSheet: exposureComponents.isOffBalanceSheet,
        calculationDate: new Date(),
        timeHorizon: validatedInput.timeHorizon,
        methodology: 'ccf_based',
        parameters: {
          ccfParameters: ccfResult,
          behaviorParameters: eadParams.behaviorParameters,
          adjustments: eadParams.adjustments
        }
      };

      this.log('EAD computation completed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        ead: finalEad,
        ccf: ccfResult.adjustedCcf,
        expectedDrawdown
      });

      return result;

    } catch (error) {
      this.logError('EAD computation failed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`EAD computation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get portfolio account data for EAD calculation
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
          attributes: ['id', 'customerName', 'customerType', 'customerSegment']
        },
        {
          model: models.ProductType,
          as: 'ProductType',
          attributes: ['id', 'productName', 'productGroup', 'isRevolvingCredit']
        },
        {
          model: models.CreditFacility,
          as: 'CreditFacility',
          attributes: ['id', 'facilityType', 'creditLimit', 'utilizationHistory']
        }
      ]
    });
  }

  /**
   * Get EAD model parameters
   */
  private async getEadModelParameters(
    models: any,
    account: any
  ): Promise<any> {
    try {
      const eadModel = await models.EadModel.findOne({
        where: {
          productType: account.productType,
          customerSegment: account.Customer?.customerSegment,
          isActive: true
        },
        include: [{
          model: models.EadParameter,
          as: 'Parameters'
        }]
      });

      if (!eadModel) {
        return this.getDefaultEadParameters(account);
      }

      const parameters = eadModel.Parameters.reduce((params: any, param: any) => {
        params[param.parameterKey] = param.parameterValue;
        return params;
      }, {});

      return {
        modelId: eadModel.id,
        ccfParameters: {
          baseCcf: parseFloat(parameters.baseCcf || '0.75'),
          creditLineCcf: parseFloat(parameters.creditLineCcf || '0.75'),
          guaranteeCcf: parseFloat(parameters.guaranteeCcf || '1.0'),
          letterOfCreditCcf: parseFloat(parameters.letterOfCreditCcf || '0.5')
        },
        behaviorParameters: {
          drawdownRateStressed: parseFloat(parameters.drawdownRateStressed || '0.8'),
          drawdownRateNormal: parseFloat(parameters.drawdownRateNormal || '0.4'),
          repaymentBehavior: parameters.repaymentBehavior || 'normal'
        },
        adjustments: {
          stressMultiplier: parseFloat(parameters.stressMultiplier || '1.2'),
          seasonalityAdjustment: parseFloat(parameters.seasonalityAdjustment || '1.0'),
          economicCycleAdjustment: parseFloat(parameters.economicCycleAdjustment || '1.0')
        }
      };

    } catch (error) {
      this.logError('Failed to get EAD parameters', {
        accountId: account.accountId,
        error: error instanceof Error ? error.message : String(error)
      });
      return this.getDefaultEadParameters(account);
    }
  }

  /**
   * Analyze exposure components (on-balance vs off-balance sheet)
   */
  private analyzeExposureComponents(account: any): any {
    const outstandingAmount = account.outstandingAmount || 0;
    const creditLimit = account.creditLimit || account.CreditFacility?.creditLimit || 0;
    const committedAmount = account.committedAmount || creditLimit;
    
    // Calculate undrawn amount
    const undrawnAmount = Math.max(0, committedAmount - outstandingAmount);
    
    // Determine on/off balance sheet nature
    const isOnBalanceSheet = outstandingAmount > 0;
    const isOffBalanceSheet = undrawnAmount > 0 || this.isOffBalanceSheetProduct(account);

    return {
      outstandingAmount,
      committedAmount,
      undrawnAmount,
      isOnBalanceSheet,
      isOffBalanceSheet
    };
  }

  /**
   * Calculate Credit Conversion Factor
   */
  private async calculateCreditConversionFactor(
    models: any,
    account: any,
    timeHorizon: number,
    eadParams: any
  ): Promise<CcfCalculationResult> {
    try {
      // Get product-specific CCF parameters
      const productCcf = await this.getProductSpecificCcf(
        models,
        account.productType,
        account.Customer?.customerSegment
      );

      // Calculate historical drawdown rate if available
      const historicalDrawdownRate = await this.calculateHistoricalDrawdownRate(
        models,
        account
      );

      // Determine base CCF
      let baseCcf = productCcf || eadParams.ccfParameters.baseCcf;
      
      // Apply product-specific CCF
      baseCcf = this.applyProductSpecificCcf(account, baseCcf, eadParams);

      // Apply stress adjustments for longer time horizons
      let stressAdjustment = 0;
      if (timeHorizon > 12) {
        stressAdjustment = (timeHorizon - 12) * 0.05; // 5% increase per year
      }

      // Apply economic conditions adjustment
      const economicAdjustment = eadParams.adjustments.economicCycleAdjustment - 1;

      // Calculate final adjusted CCF
      const adjustedCcf = Math.min(1.0, baseCcf + stressAdjustment + economicAdjustment);

      return {
        productType: account.productType,
        customerSegment: account.Customer?.customerSegment || 'unknown',
        ccf: baseCcf,
        historicalDrawdownRate,
        adjustedCcf,
        stressAdjustment
      };

    } catch (error) {
      this.logError('Failed to calculate CCF', {
        accountId: account.accountId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Return default CCF
      return {
        productType: account.productType,
        customerSegment: 'unknown',
        ccf: 0.75,
        historicalDrawdownRate: 0,
        adjustedCcf: 0.75,
        stressAdjustment: 0
      };
    }
  }

  /**
   * Calculate expected drawdown for undrawn commitments
   */
  private async calculateExpectedDrawdown(
    account: any,
    ccfResult: CcfCalculationResult,
    timeHorizon: number,
    includeFutureBehavior: boolean
  ): Promise<number> {
    const undrawnAmount = Math.max(0, 
      (account.committedAmount || account.creditLimit || 0) - 
      (account.outstandingAmount || 0)
    );

    if (undrawnAmount <= 0) {
      return 0;
    }

    // Basic CCF-based calculation
    let expectedDrawdown = undrawnAmount * ccfResult.adjustedCcf;

    // Apply time horizon adjustments
    if (timeHorizon < 12) {
      // For shorter horizons, reduce expected drawdown
      const timeAdjustment = timeHorizon / 12;
      expectedDrawdown = expectedDrawdown * timeAdjustment;
    } else if (timeHorizon > 12) {
      // For longer horizons, apply behavioral modeling
      expectedDrawdown = this.applyLongerTermBehavior(
        expectedDrawdown,
        timeHorizon,
        account
      );
    }

    // Apply future behavior modeling if enabled
    if (includeFutureBehavior) {
      expectedDrawdown = this.applyFutureBehaviorModeling(
        expectedDrawdown,
        account,
        timeHorizon
      );
    }

    return Math.max(0, expectedDrawdown);
  }

  /**
   * Calculate final EAD combining all components
   */
  private calculateFinalEad(
    exposureComponents: any,
    expectedDrawdown: number,
    ccfResult: CcfCalculationResult
  ): number {
    // EAD = Outstanding Amount + Expected Drawdown on Undrawn Commitments
    const ead = exposureComponents.outstandingAmount + expectedDrawdown;
    
    return Math.max(0, ead);
  }

  // Helper methods
  private isOffBalanceSheetProduct(account: any): boolean {
    const offBalanceSheetProducts = [
      'letter_of_credit',
      'guarantee',
      'credit_line',
      'revolving_credit',
      'standby_facility'
    ];
    
    return offBalanceSheetProducts.includes(
      account.productType?.toLowerCase()
    );
  }

  private async getProductSpecificCcf(
    models: any,
    productType: string,
    customerSegment: string
  ): Promise<number | null> {
    try {
      const ccfParam = await models.CcfParameter.findOne({
        where: {
          productType,
          customerSegment,
          isActive: true
        }
      });

      return ccfParam ? parseFloat(ccfParam.ccfValue) : null;
    } catch {
      return null;
    }
  }

  private async calculateHistoricalDrawdownRate(
    models: any,
    account: any
  ): Promise<number> {
    try {
      // Get historical utilization data
      const utilizationHistory = await models.UtilizationHistory.findAll({
        where: {
          portfolioAccountId: account.id
        },
        order: [['reportingDate', 'DESC']],
        limit: 12
      });

      if (utilizationHistory.length === 0) {
        return 0;
      }

      // Calculate average drawdown rate
      const totalDrawdowns = utilizationHistory.reduce((sum: number, record: any) => {
        return sum + (record.drawdownAmount || 0);
      }, 0);

      const totalCapacity = utilizationHistory.reduce((sum: number, record: any) => {
        return sum + (record.availableLimit || 0);
      }, 0);

      return totalCapacity > 0 ? (totalDrawdowns / totalCapacity) : 0;

    } catch {
      return 0;
    }
  }

  private applyProductSpecificCcf(
    account: any,
    baseCcf: number,
    eadParams: any
  ): number {
    const productType = account.productType?.toLowerCase();
    
    switch (productType) {
      case 'credit_line':
      case 'revolving_credit':
        return eadParams.ccfParameters.creditLineCcf;
      case 'guarantee':
      case 'standby_letter_of_credit':
        return eadParams.ccfParameters.guaranteeCcf;
      case 'commercial_letter_of_credit':
        return eadParams.ccfParameters.letterOfCreditCcf;
      default:
        return baseCcf;
    }
  }

  private applyLongerTermBehavior(
    expectedDrawdown: number,
    timeHorizon: number,
    account: any
  ): number {
    // For lifetime EAD, consider long-term customer behavior
    const yearsHorizon = timeHorizon / 12;
    
    // Apply diminishing returns for very long horizons
    const decayFactor = 1 - Math.exp(-yearsHorizon / 5); // 5-year half-life
    
    return expectedDrawdown * decayFactor;
  }

  private applyFutureBehaviorModeling(
    expectedDrawdown: number,
    account: any,
    timeHorizon: number
  ): number {
    // Simple behavioral modeling based on customer type and product
    let behaviorMultiplier = 1.0;

    // Customer type adjustments
    switch (account.Customer?.customerType?.toLowerCase()) {
      case 'individual':
        behaviorMultiplier *= 0.9; // Individuals typically draw less
        break;
      case 'sme':
        behaviorMultiplier *= 1.1; // SMEs tend to use more of their facilities
        break;
      case 'corporate':
        behaviorMultiplier *= 1.0; // Corporates are baseline
        break;
    }

    // Economic stress adjustments
    if (timeHorizon > 24) {
      behaviorMultiplier *= 1.2; // Higher utilization in stress scenarios
    }

    return expectedDrawdown * behaviorMultiplier;
  }

  private getDefaultEadParameters(account: any): any {
    return {
      modelId: 'default-ead-model',
      ccfParameters: {
        baseCcf: 0.75,
        creditLineCcf: 0.75,
        guaranteeCcf: 1.0,
        letterOfCreditCcf: 0.5
      },
      behaviorParameters: {
        drawdownRateStressed: 0.8,
        drawdownRateNormal: 0.4,
        repaymentBehavior: 'normal'
      },
      adjustments: {
        stressMultiplier: 1.2,
        seasonalityAdjustment: 1.0,
        economicCycleAdjustment: 1.0
      }
    };
  }
}
