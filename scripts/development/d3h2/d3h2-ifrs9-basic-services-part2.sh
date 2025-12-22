#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - DAY 3 HOUR 2 PART 2
# ============================================================================
# Script: d3h2-ifrs9-basic-services-part2.sh
# Phase: D3H2 - PD/LGD/EAD Calculation Engines
# Objective: Generate PD, LGD, and EAD calculation services
# Generated: $(date)
# Methodology: Phased Shell-Driven Development (PSDD)
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d3h2-part2-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Part 2 script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Phase identification
PHASE_ID="D3H2P2"
PHASE_NAME="PD/LGD/EAD Calculation Engines"
PHASE_OBJECTIVE="Generate probability of default, loss given default, and exposure at default services"

log_info "============================================================================"
log_info "PSDD METHODOLOGY - ${PHASE_ID}: ${PHASE_NAME}"
log_info "============================================================================"

# MANDATORY: Generate PD Model Service
generate_pd_model_service() {
    log_info "Generating PD Model Service..."
    
    local file_path="${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9/pd-model.service.ts"
    
    cat > "${file_path}" << 'EOF'
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

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { PdModel, PdParameter, PortfolioAccount } from '../../models/ifrs9';
import { getTenantModels } from '../../database/tenant-context';
import { ConfigurationService } from '../configuration/configuration.service';

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

@Injectable()
export class PdModelService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(PdModel) private pdModelModel: typeof PdModel,
    @InjectModel(PdParameter) private pdParameterModel: typeof PdParameter,
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'PdModelService' });
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

    this.logger.info('Starting PD calculation', {
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
        validatedInput.modelType
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
        modelType: validatedInput.modelType,
        modelVersion: modelParams.modelId,
        calculationDate: new Date(),
        parameters: {
          baseRate: modelParams.baseRate,
          riskFactors: modelParams.riskFactors,
          adjustments: modelParams.stageAdjustments
        }
      };

      this.logger.info('PD calculation completed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        pd12Month,
        pdLifetime,
        modelType: validatedInput.modelType
      });

      return result;

    } catch (error) {
      this.logger.error('PD calculation failed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`PD calculation failed: ${error.message}`);
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
      this.logger.error('Failed to get PD model parameters', {
        accountId: account.accountId,
        modelType,
        error: error.message
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
      this.logger.error('Failed to calculate base PD', {
        accountId: account.accountId,
        error: error.message
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
  private getIndustryRiskAdjustment(industryCode: string, modelParams: PdModelParameters): number {
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

    return industryRiskMap[industryCode?.toLowerCase()] || modelParams.riskFactors.industryRisk;
  }

  private getCustomerTypeRiskAdjustment(customerType: string, modelParams: PdModelParameters): number {
    const customerRiskMap: { [key: string]: number } = {
      'individual': 1.2,
      'sme': 1.3,
      'corporate': 1.0,
      'government': 0.6,
      'financial_institution': 0.8
    };

    return customerRiskMap[customerType?.toLowerCase()] || modelParams.riskFactors.customerTypeRisk;
  }

  private getProductRiskAdjustment(productType: string, modelParams: PdModelParameters): number {
    const productRiskMap: { [key: string]: number } = {
      'mortgage': 0.8,
      'auto_loan': 1.0,
      'personal_loan': 1.4,
      'credit_card': 1.6,
      'business_loan': 1.2,
      'trade_finance': 1.1
    };

    return productRiskMap[productType?.toLowerCase()] || modelParams.riskFactors.productRisk;
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

  private getDefaultModelParameters(account: any, modelType: string): PdModelParameters {
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
EOF

    log_success "Generated PD Model Service: ${file_path}"
}

# MANDATORY: Generate LGD Calculation Service
generate_lgd_calculation_service() {
    log_info "Generating LGD Calculation Service..."
    
    local file_path="${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9/lgd-calculation.service.ts"
    
    cat > "${file_path}" << 'EOF'
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

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { LgdModel, LgdParameter, CollateralValuation } from '../../models/ifrs9';
import { getTenantModels } from '../../database/tenant-context';
import { ConfigurationService } from '../configuration/configuration.service';

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

@Injectable()
export class LgdCalculationService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(LgdModel) private lgdModelModel: typeof LgdModel,
    @InjectModel(LgdParameter) private lgdParameterModel: typeof LgdParameter,
    @InjectModel(CollateralValuation) private collateralValuationModel: typeof CollateralValuation,
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'LgdCalculationService' });
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

    this.logger.info('Starting LGD calculation', {
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

      this.logger.info('LGD calculation completed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        lgd: finalLgd,
        collateralCoverage: recoveryAnalysis.collateralCoverage,
        downturnAdjustment
      });

      return result;

    } catch (error) {
      this.logger.error('LGD calculation failed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`LGD calculation failed: ${error.message}`);
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
      this.logger.error('Failed to get LGD parameters', {
        accountId: account.accountId,
        error: error.message
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
        this.logger.error('Failed to process collateral', {
          collateralId: collateral.id,
          error: error.message
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
EOF

    log_success "Generated LGD Calculation Service: ${file_path}"
}

# MANDATORY: Generate EAD Computation Service
generate_ead_computation_service() {
    log_info "Generating EAD Computation Service..."
    
    local file_path="${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9/ead-computation.service.ts"
    
    cat > "${file_path}" << 'EOF'
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

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { EadModel, EadParameter, CcfParameter } from '../../models/ifrs9';
import { getTenantModels } from '../../database/tenant-context';
import { ConfigurationService } from '../configuration/configuration.service';

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

@Injectable()
export class EadComputationService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(EadModel) private eadModelModel: typeof EadModel,
    @InjectModel(EadParameter) private eadParameterModel: typeof EadParameter,
    @InjectModel(CcfParameter) private ccfParameterModel: typeof CcfParameter,
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'EadComputationService' });
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

    this.logger.info('Starting EAD computation', {
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

      this.logger.info('EAD computation completed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        ead: finalEad,
        ccf: ccfResult.adjustedCcf,
        expectedDrawdown
      });

      return result;

    } catch (error) {
      this.logger.error('EAD computation failed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`EAD computation failed: ${error.message}`);
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
      this.logger.error('Failed to get EAD parameters', {
        accountId: account.accountId,
        error: error.message
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
      this.logger.error('Failed to calculate CCF', {
        accountId: account.accountId,
        error: error.message
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
EOF

    log_success "Generated EAD Computation Service: ${file_path}"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# MANDATORY: Main function
main() {
    log_info "Starting PSDD ${PHASE_ID} code generation..."
    
    # Track start
    track_progress "${PHASE_ID}" "PART2_STARTED"
    
    # Generate services
    generate_pd_model_service
    generate_lgd_calculation_service
    generate_ead_computation_service
    
    # Track completion
    track_progress "${PHASE_ID}" "PART2_COMPLETED"
    
    log_success "============================================================================"
    log_success "PSDD ${PHASE_ID} Part 2 completed successfully!"
    log_success "============================================================================"
    log_success "Generated: PD Model Service, LGD Calculation Service, EAD Computation Service"
    log_success "Next step: Execute d3h2-ifrs9-basic-services-part3.sh"
    log_success "============================================================================"
}

# Execute main function
main "$@"