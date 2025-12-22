// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/ifrs9/lgd-calculation.service.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Winston, Joi
// Purpose: Loss Given Default calculation service with recovery analysis
// ============================================================================

import * as Joi from 'joi';
import { PortfolioAccount } from '../../models/banking/portfolio-account.model';
import { modelManager } from '../../../models/index';

export interface LgdCalculationInput {
  tenantId: string;
  portfolioAccountId: string;
  reportingDate: Date;
  downturnLgd?: boolean;
  collateralRevaluation?: boolean;
}

export interface LgdCalculationResult {
  portfolioAccountId: string;
  lgd: number;
  recoveryRate: number;
  collateralValue: number;
  collateralCoverage: number;
  unsecuredPortion: number;
  securedRecoveryRate: number;
  unsecuredRecoveryRate: number;
  downturnAdjustment: number;
  calculationDate: Date;
  methodology: string;
  parameters: {
    collateralTypes: any[];
    recoveryRates: any;
    costOfRecovery: number;
    timeToRecovery: number;
  };
}

export interface CollateralInfo {
  id: string;
  type: string;
  value: number;
  currency: string;
  lastValuationDate: Date;
  haircut: number;
  liquidityRating: string;
}

const lgdCalculationInputSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  portfolioAccountId: Joi.string().uuid().required(),
  reportingDate: Joi.date().required(),
  downturnLgd: Joi.boolean().default(false),
  collateralRevaluation: Joi.boolean().default(false)
});

// Helper function for tenant model access
async function getTenantModels(tenantId: string) {
  return await modelManager.getTenantModels(tenantId);
}

export class LgdCalculationService {
  constructor() {
    // Initialize logging
  }

  private log(message: string, data?: any): void {
    console.log(`[LgdCalculationService] ${message}`, data || '');
  }

  private logError(message: string, error?: any): void {
    console.error(`[LgdCalculationService] ${message}`, error || '');
  }

  /**
   * Calculate Loss Given Default for portfolio account
   */
  async calculateLgd(input: LgdCalculationInput): Promise<LgdCalculationResult> {
    // Validate input
    const { error, value } = lgdCalculationInputSchema.validate(input);
    if (error) {
      throw new Error(`Invalid LGD calculation input: ${error.message}`);
    }

    const validatedInput = value as LgdCalculationInput;

    this.log('Starting LGD calculation', {
      tenantId: validatedInput.tenantId,
      portfolioAccountId: validatedInput.portfolioAccountId,
      downturnLgd: validatedInput.downturnLgd
    });

    try {
      // Get tenant models and account data
      const models = await getTenantModels(validatedInput.tenantId);
      const account = await this.getPortfolioAccountWithCollateral(
        models,
        validatedInput.portfolioAccountId
      );

      if (!account) {
        throw new Error(`Portfolio account not found: ${validatedInput.portfolioAccountId}`);
      }

      // Get LGD model parameters
      const lgdParams = await this.getLgdModelParameters(
        models,
        account,
        validatedInput.downturnLgd
      );

      // Get and value collateral
      const collateralInfo = await this.getCollateralInformation(
        models,
        account,
        validatedInput.reportingDate,
        validatedInput.collateralRevaluation
      );

      // Calculate recovery rates
      const recoveryAnalysis = await this.calculateRecoveryRates(
        account,
        collateralInfo,
        lgdParams
      );

      // Apply downturn adjustments if required
      let finalLgd = recoveryAnalysis.lgd;
      let downturnAdjustment = 0;

      if (validatedInput.downturnLgd) {
        const downturnResult = this.applyDownturnAdjustments(
          recoveryAnalysis.lgd,
          lgdParams
        );
        finalLgd = downturnResult.adjustedLgd;
        downturnAdjustment = downturnResult.adjustment;
      }

      const result: LgdCalculationResult = {
        portfolioAccountId: validatedInput.portfolioAccountId,
        lgd: finalLgd,
        recoveryRate: 1 - finalLgd,
        collateralValue: collateralInfo.totalValue,
        collateralCoverage: recoveryAnalysis.collateralCoverage,
        unsecuredPortion: recoveryAnalysis.unsecuredPortion,
        securedRecoveryRate: recoveryAnalysis.securedRecoveryRate,
        unsecuredRecoveryRate: recoveryAnalysis.unsecuredRecoveryRate,
        downturnAdjustment,
        calculationDate: new Date(),
        methodology: 'collateral_based',
        parameters: {
          collateralTypes: collateralInfo.collateral.map(c => ({
            type: c.type,
            value: c.value,
            haircut: c.haircut
          })),
          recoveryRates: lgdParams.recoveryRates,
          costOfRecovery: lgdParams.costOfRecovery,
          timeToRecovery: lgdParams.timeToRecovery
        }
      };

      this.log('LGD calculation completed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        lgd: finalLgd,
        collateralCoverage: recoveryAnalysis.collateralCoverage,
        downturnAdjustment
      });

      return result;

    } catch (error) {
      this.logError('LGD calculation failed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`LGD calculation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get portfolio account with collateral information
   */
  private async getPortfolioAccountWithCollateral(
    models: any,
    portfolioAccountId: string
  ): Promise<any> {
    return await models.PortfolioAccount.findByPk(portfolioAccountId, {
      include: [
        {
          model: models.Customer,
          as: 'Customer',
          attributes: ['id', 'customerName', 'customerType']
        },
        {
          model: models.ProductType,
          as: 'ProductType',
          attributes: ['id', 'productName', 'riskCategory', 'isSecured']
        },
        {
          model: models.Collateral,
          as: 'Collateral',
          include: [{
            model: models.CollateralValuation,
            as: 'Valuations',
            limit: 5,
            order: [['valuationDate', 'DESC']]
          }]
        }
      ]
    });
  }

  /**
   * Get LGD model parameters
   */
  private async getLgdModelParameters(
    models: any,
    account: any,
    downturnLgd: boolean
  ): Promise<any> {
    try {
      // Get LGD model from database
      const lgdModel = await models.LgdModel.findOne({
        where: {
          productType: account.productType,
          customerType: account.Customer?.customerType,
          isActive: true
        },
        include: [{
          model: models.LgdParameter,
          as: 'Parameters'
        }]
      });

      if (!lgdModel) {
        return this.getDefaultLgdParameters(account, downturnLgd);
      }

      // Extract parameters
      const parameters = lgdModel.Parameters.reduce((params: any, param: any) => {
        params[param.parameterKey] = param.parameterValue;
        return params;
      }, {});

      return {
        modelId: lgdModel.id,
        baseLgd: parseFloat(parameters.baseLgd || '0.45'),
        recoveryRates: {
          realEstate: parseFloat(parameters.realEstateRecoveryRate || '0.75'),
          cashDeposit: parseFloat(parameters.cashDepositRecoveryRate || '0.95'),
          securities: parseFloat(parameters.securitiesRecoveryRate || '0.65'),
          equipment: parseFloat(parameters.equipmentRecoveryRate || '0.40'),
          inventory: parseFloat(parameters.inventoryRecoveryRate || '0.30'),
          receivables: parseFloat(parameters.receivablesRecoveryRate || '0.50'),
          unsecured: parseFloat(parameters.unsecuredRecoveryRate || '0.20')
        },
        collateralHaircuts: {
          realEstate: parseFloat(parameters.realEstateHaircut || '0.25'),
          cashDeposit: parseFloat(parameters.cashDepositHaircut || '0.05'),
          securities: parseFloat(parameters.securitiesHaircut || '0.35'),
          equipment: parseFloat(parameters.equipmentHaircut || '0.60'),
          inventory: parseFloat(parameters.inventoryHaircut || '0.70'),
          receivables: parseFloat(parameters.receivablesHaircut || '0.50')
        },
        costOfRecovery: parseFloat(parameters.costOfRecovery || '0.15'),
        timeToRecovery: parseFloat(parameters.timeToRecovery || '24'),
        downturnMultiplier: parseFloat(parameters.downturnMultiplier || '1.2')
      };

    } catch (error) {
      this.logError('Failed to get LGD parameters', {
        accountId: account.accountId,
        error: error instanceof Error ? error.message : String(error)
      });
      return this.getDefaultLgdParameters(account, downturnLgd);
    }
  }

  /**
   * Get and value collateral information
   */
  private async getCollateralInformation(
    models: any,
    account: any,
    reportingDate: Date,
    revaluation: boolean
  ): Promise<{ totalValue: number; collateral: CollateralInfo[] }> {
    const collateralInfo: CollateralInfo[] = [];
    let totalValue = 0;

    if (!account.Collateral || account.Collateral.length === 0) {
      return { totalValue: 0, collateral: [] };
    }

    for (const collateral of account.Collateral) {
      try {
        // Get latest valuation
        let currentValue = collateral.originalValue;
        let valuationDate = collateral.createdAt;

        if (collateral.Valuations && collateral.Valuations.length > 0) {
          const latestValuation = collateral.Valuations[0];
          currentValue = latestValuation.valuationAmount;
          valuationDate = latestValuation.valuationDate;
        }

        // Apply revaluation if required
        if (revaluation) {
          currentValue = await this.revalueCollateral(
            collateral,
            reportingDate
          );
        }

        // Apply haircut
        const haircut = this.getCollateralHaircut(collateral.collateralType);
        const adjustedValue = currentValue * (1 - haircut);

        const info: CollateralInfo = {
          id: collateral.id,
          type: collateral.collateralType,
          value: adjustedValue,
          currency: collateral.currency || 'IDR',
          lastValuationDate: valuationDate,
          haircut,
          liquidityRating: collateral.liquidityRating || 'medium'
        };

        collateralInfo.push(info);
        totalValue += adjustedValue;

      } catch (error) {
        this.logError('Failed to process collateral', {
          collateralId: collateral.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return { totalValue, collateral: collateralInfo };
  }

  /**
   * Calculate recovery rates based on collateral and unsecured portions
   */
  private async calculateRecoveryRates(
    account: any,
    collateralInfo: any,
    lgdParams: any
  ): Promise<any> {
    const exposure = account.outstandingAmount;
    const collateralValue = collateralInfo.totalValue;

    // Calculate secured and unsecured portions
    const securedPortion = Math.min(exposure, collateralValue);
    const unsecuredPortion = Math.max(0, exposure - collateralValue);
    const collateralCoverage = exposure > 0 ? (securedPortion / exposure) : 0;

    // Calculate recovery rates
    const securedRecoveryRate = this.calculateSecuredRecoveryRate(
      collateralInfo.collateral,
      lgdParams
    );
    const unsecuredRecoveryRate = lgdParams.recoveryRates.unsecured;

    // Weighted average recovery rate
    const totalRecoveryRate = (
      (securedPortion * securedRecoveryRate) +
      (unsecuredPortion * unsecuredRecoveryRate)
    ) / exposure;

    // Apply recovery costs
    const netRecoveryRate = totalRecoveryRate * (1 - lgdParams.costOfRecovery);

    // LGD = 1 - Recovery Rate
    const lgd = Math.max(0, Math.min(1, 1 - netRecoveryRate));

    return {
      lgd,
      totalRecoveryRate,
      netRecoveryRate,
      securedRecoveryRate,
      unsecuredRecoveryRate,
      collateralCoverage,
      securedPortion,
      unsecuredPortion
    };
  }

  /**
   * Calculate secured recovery rate based on collateral mix
   */
  private calculateSecuredRecoveryRate(
    collateral: CollateralInfo[],
    lgdParams: any
  ): number {
    if (collateral.length === 0) return 0;

    let weightedRecoveryRate = 0;
    let totalValue = 0;

    for (const coll of collateral) {
      const recoveryRate = this.getCollateralRecoveryRate(coll.type, lgdParams);
      weightedRecoveryRate += coll.value * recoveryRate;
      totalValue += coll.value;
    }

    return totalValue > 0 ? (weightedRecoveryRate / totalValue) : 0;
  }

  /**
   * Apply downturn adjustments to LGD
   */
  private applyDownturnAdjustments(
    baseLgd: number,
    lgdParams: any
  ): { adjustedLgd: number; adjustment: number } {
    const downturnMultiplier = lgdParams.downturnMultiplier || 1.2;
    const adjustedLgd = Math.min(1, baseLgd * downturnMultiplier);
    const adjustment = adjustedLgd - baseLgd;

    return { adjustedLgd, adjustment };
  }

  // Helper methods
  private getCollateralHaircut(collateralType: string): number {
    const haircutMap: { [key: string]: number } = {
      'real_estate': 0.25,
      'cash_deposit': 0.05,
      'securities': 0.35,
      'equipment': 0.60,
      'inventory': 0.70,
      'receivables': 0.50,
      'vehicle': 0.45,
      'other': 0.75
    };

    return haircutMap[collateralType?.toLowerCase()] || 0.75;
  }

  private getCollateralRecoveryRate(collateralType: string, lgdParams: any): number {
    const type = collateralType?.toLowerCase();
    switch (type) {
      case 'real_estate': return lgdParams.recoveryRates.realEstate;
      case 'cash_deposit': return lgdParams.recoveryRates.cashDeposit;
      case 'securities': return lgdParams.recoveryRates.securities;
      case 'equipment': return lgdParams.recoveryRates.equipment;
      case 'inventory': return lgdParams.recoveryRates.inventory;
      case 'receivables': return lgdParams.recoveryRates.receivables;
      default: return lgdParams.recoveryRates.unsecured;
    }
  }

  private async revalueCollateral(
    collateral: any,
    reportingDate: Date
  ): Promise<number> {
    // Simplified revaluation logic
    // In practice, this would involve market data and valuation models
    
    const valuationAge = this.getValuationAgeInMonths(
      collateral.Valuations?.[0]?.valuationDate || collateral.createdAt,
      reportingDate
    );

    // Apply depreciation based on collateral type and age
    let depreciationRate = 0;
    switch (collateral.collateralType?.toLowerCase()) {
      case 'vehicle':
        depreciationRate = 0.02; // 2% per month
        break;
      case 'equipment':
        depreciationRate = 0.01; // 1% per month
        break;
      case 'inventory':
        depreciationRate = 0.015; // 1.5% per month
        break;
      default:
        depreciationRate = 0.005; // 0.5% per month
    }

    const currentValue = collateral.Valuations?.[0]?.valuationAmount || collateral.originalValue;
    const depreciatedValue = currentValue * Math.pow(1 - depreciationRate, valuationAge);

    return Math.max(0, depreciatedValue);
  }

  private getValuationAgeInMonths(valuationDate: Date, reportingDate: Date): number {
    const diffTime = reportingDate.getTime() - new Date(valuationDate).getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30)));
  }

  private getDefaultLgdParameters(account: any, downturnLgd: boolean): any {
    return {
      modelId: 'default-lgd-model',
      baseLgd: 0.45,
      recoveryRates: {
        realEstate: 0.75,
        cashDeposit: 0.95,
        securities: 0.65,
        equipment: 0.40,
        inventory: 0.30,
        receivables: 0.50,
        unsecured: 0.20
      },
      collateralHaircuts: {
        realEstate: 0.25,
        cashDeposit: 0.05,
        securities: 0.35,
        equipment: 0.60,
        inventory: 0.70,
        receivables: 0.50
      },
      costOfRecovery: 0.15,
      timeToRecovery: 24,
      downturnMultiplier: downturnLgd ? 1.2 : 1.0
    };
  }
}
