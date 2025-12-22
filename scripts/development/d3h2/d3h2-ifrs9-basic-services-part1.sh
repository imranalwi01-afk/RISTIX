#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - DAY 3 HOUR 2 PART 1
# ============================================================================
# Script: d3h2-ifrs9-basic-services-part1.sh
# Phase: D3H2 - Basic IFRS 9 ECL Calculation Services
# Objective: Generate core ECL calculation and staging analysis services
# Generated: $(date)
# Methodology: Phased Shell-Driven Development (PSDD)
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d3h2-part1-$(date +%Y%m%d-%H%M%S).log"

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
    log_error "Part 1 script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Phase identification
PHASE_ID="D3H2P1"
PHASE_NAME="ECL Calculation Services Generation"
PHASE_OBJECTIVE="Generate core ECL calculation and staging analysis services"

log_info "============================================================================"
log_info "PSDD METHODOLOGY - ${PHASE_ID}: ${PHASE_NAME}"
log_info "============================================================================"

# MANDATORY: Generate ECL Calculation Service
generate_ecl_calculation_service() {
    log_info "Generating ECL Calculation Service..."
    
    local file_path="${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9/ecl-calculation.service.ts"
    
    cat > "${file_path}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/ifrs9/ecl-calculation.service.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Winston, Joi
// Purpose: Core ECL calculation service with staging logic
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { 
  PortfolioAccount, 
  EclCalculation, 
  EclParameter,
  CalculationAuditLog 
} from '../../models/ifrs9';
import { getTenantModels } from '../../database/tenant-context';
import { AuditService } from '../audit/audit.service';
import { ConfigurationService } from '../configuration/configuration.service';

export interface EclCalculationInput {
  tenantId: string;
  portfolioAccountIds?: string[];
  reportingDate: Date;
  scenarioId?: string;
  calculationMethod: 'collective' | 'individual';
  forceRecalculation?: boolean;
}

export interface EclCalculationResult {
  calculationId: string;
  portfolioAccountId: string;
  currentStage: number;
  previousStage?: number;
  pd12Month: number;
  pdLifetime: number;
  lgd: number;
  ead: number;
  ecl12Month: number;
  eclLifetime: number;
  finalEcl: number;
  calculationDate: Date;
  methodology: string;
}

export interface EclCalculationSummary {
  calculationId: string;
  totalAccounts: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  totalEcl: number;
  stage1Ecl: number;
  stage2Ecl: number;
  stage3Ecl: number;
  calculationTime: number;
  status: 'completed' | 'failed' | 'in_progress';
}

const eclCalculationInputSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  portfolioAccountIds: Joi.array().items(Joi.string().uuid()).optional(),
  reportingDate: Joi.date().required(),
  scenarioId: Joi.string().uuid().optional(),
  calculationMethod: Joi.string().valid('collective', 'individual').default('collective'),
  forceRecalculation: Joi.boolean().default(false)
});

@Injectable()
export class EclCalculationService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(EclCalculation) private eclCalculationModel: typeof EclCalculation,
    @InjectModel(EclParameter) private eclParameterModel: typeof EclParameter,
    private readonly auditService: AuditService,
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'EclCalculationService' });
  }

  /**
   * Execute ECL calculation for portfolio accounts
   */
  async calculateEcl(input: EclCalculationInput): Promise<EclCalculationSummary> {
    // Validate input
    const { error, value } = eclCalculationInputSchema.validate(input);
    if (error) {
      throw new Error(`Invalid ECL calculation input: ${error.message}`);
    }

    const validatedInput = value as EclCalculationInput;
    const startTime = Date.now();

    this.logger.info('Starting ECL calculation', {
      tenantId: validatedInput.tenantId,
      reportingDate: validatedInput.reportingDate,
      method: validatedInput.calculationMethod
    });

    try {
      // Get tenant models
      const models = await getTenantModels(validatedInput.tenantId);
      
      // Create calculation batch
      const calculationBatch = await this.createCalculationBatch(
        models, 
        validatedInput
      );

      // Get portfolio accounts for calculation
      const portfolioAccounts = await this.getPortfolioAccountsForCalculation(
        models,
        validatedInput
      );

      // Execute ECL calculation
      const results = await this.executeEclCalculation(
        models,
        calculationBatch.id,
        portfolioAccounts,
        validatedInput
      );

      // Generate summary
      const summary = await this.generateCalculationSummary(
        models,
        calculationBatch.id,
        results,
        Date.now() - startTime
      );

      // Audit log
      await this.auditService.logCalculationEvent({
        tenantId: validatedInput.tenantId,
        eventType: 'ECL_CALCULATION_COMPLETED',
        calculationId: calculationBatch.id,
        summary,
        executionTime: Date.now() - startTime
      });

      this.logger.info('ECL calculation completed', {
        calculationId: calculationBatch.id,
        totalAccounts: summary.totalAccounts,
        totalEcl: summary.totalEcl,
        executionTime: summary.calculationTime
      });

      return summary;

    } catch (error) {
      this.logger.error('ECL calculation failed', {
        tenantId: validatedInput.tenantId,
        error: error.message,
        stack: error.stack
      });

      // Log failure
      await this.auditService.logCalculationEvent({
        tenantId: validatedInput.tenantId,
        eventType: 'ECL_CALCULATION_FAILED',
        error: error.message,
        executionTime: Date.now() - startTime
      });

      throw new Error(`ECL calculation failed: ${error.message}`);
    }
  }

  /**
   * Create calculation batch record
   */
  private async createCalculationBatch(
    models: any,
    input: EclCalculationInput
  ): Promise<any> {
    const calculationBatch = await models.EclCalculationBatch.create({
      tenantId: input.tenantId,
      reportingDate: input.reportingDate,
      calculationMethod: input.calculationMethod,
      scenarioId: input.scenarioId,
      status: 'in_progress',
      startedAt: new Date(),
      parameters: {
        forceRecalculation: input.forceRecalculation,
        portfolioAccountIds: input.portfolioAccountIds
      }
    });

    return calculationBatch;
  }

  /**
   * Get portfolio accounts for ECL calculation
   */
  private async getPortfolioAccountsForCalculation(
    models: any,
    input: EclCalculationInput
  ): Promise<any[]> {
    const whereClause: any = {
      tenantId: input.tenantId,
      isActive: true
    };

    // Filter by specific accounts if provided
    if (input.portfolioAccountIds && input.portfolioAccountIds.length > 0) {
      whereClause.id = input.portfolioAccountIds;
    }

    // Only include accounts with outstanding amounts
    whereClause.outstandingAmount = {
      [models.Sequelize.Op.gt]: 0
    };

    const portfolioAccounts = await models.PortfolioAccount.findAll({
      where: whereClause,
      include: [
        {
          model: models.Customer,
          as: 'Customer',
          attributes: ['id', 'customerName', 'customerType', 'industryCode']
        },
        {
          model: models.ProductType,
          as: 'ProductType',
          attributes: ['id', 'productName', 'riskCategory']
        }
      ],
      order: [['accountId', 'ASC']]
    });

    this.logger.info(`Found ${portfolioAccounts.length} accounts for ECL calculation`);
    return portfolioAccounts;
  }

  /**
   * Execute ECL calculation for accounts
   */
  private async executeEclCalculation(
    models: any,
    calculationBatchId: string,
    portfolioAccounts: any[],
    input: EclCalculationInput
  ): Promise<EclCalculationResult[]> {
    const results: EclCalculationResult[] = [];
    const batchSize = await this.configService.get<number>(
      'calculation.batch_size', 
      input.tenantId, 
      100
    );

    // Process accounts in batches
    for (let i = 0; i < portfolioAccounts.length; i += batchSize) {
      const batch = portfolioAccounts.slice(i, i + batchSize);
      const batchResults = await this.calculateEclForBatch(
        models,
        calculationBatchId,
        batch,
        input
      );
      results.push(...batchResults);

      this.logger.info(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(portfolioAccounts.length / batchSize)}`);
    }

    return results;
  }

  /**
   * Calculate ECL for a batch of accounts
   */
  private async calculateEclForBatch(
    models: any,
    calculationBatchId: string,
    accounts: any[],
    input: EclCalculationInput
  ): Promise<EclCalculationResult[]> {
    const results: EclCalculationResult[] = [];

    for (const account of accounts) {
      try {
        // Determine staging
        const stagingResult = await this.determineStagingStatus(
          models,
          account,
          input.reportingDate
        );

        // Calculate PD components
        const pdResult = await this.calculateProbabilityOfDefault(
          models,
          account,
          stagingResult.currentStage,
          input.reportingDate
        );

        // Calculate LGD
        const lgdResult = await this.calculateLossGivenDefault(
          models,
          account,
          input.reportingDate
        );

        // Calculate EAD
        const eadResult = await this.calculateExposureAtDefault(
          models,
          account,
          input.reportingDate
        );

        // Calculate final ECL
        const eclResult = await this.calculateFinalEcl(
          stagingResult.currentStage,
          pdResult,
          lgdResult,
          eadResult
        );

        // Store calculation result
        const calculationResult = await models.EclCalculation.create({
          calculationBatchId,
          portfolioAccountId: account.id,
          accountId: account.accountId,
          currentStage: stagingResult.currentStage,
          previousStage: stagingResult.previousStage,
          pd12Month: pdResult.pd12Month,
          pdLifetime: pdResult.pdLifetime,
          lgd: lgdResult,
          ead: eadResult,
          ecl12Month: eclResult.ecl12Month,
          eclLifetime: eclResult.eclLifetime,
          finalEcl: eclResult.finalEcl,
          calculationDate: new Date(),
          methodology: input.calculationMethod,
          parameters: {
            stagingDetails: stagingResult,
            pdDetails: pdResult,
            lgdDetails: lgdResult,
            eadDetails: eadResult
          }
        });

        results.push({
          calculationId: calculationResult.id,
          portfolioAccountId: account.id,
          currentStage: stagingResult.currentStage,
          previousStage: stagingResult.previousStage,
          pd12Month: pdResult.pd12Month,
          pdLifetime: pdResult.pdLifetime,
          lgd: lgdResult,
          ead: eadResult,
          ecl12Month: eclResult.ecl12Month,
          eclLifetime: eclResult.eclLifetime,
          finalEcl: eclResult.finalEcl,
          calculationDate: new Date(),
          methodology: input.calculationMethod
        });

      } catch (error) {
        this.logger.error(`Failed to calculate ECL for account ${account.accountId}`, {
          accountId: account.accountId,
          error: error.message
        });

        // Store failed calculation
        await models.EclCalculation.create({
          calculationBatchId,
          portfolioAccountId: account.id,
          accountId: account.accountId,
          status: 'failed',
          errorMessage: error.message,
          calculationDate: new Date()
        });
      }
    }

    return results;
  }

  /**
   * Determine IFRS 9 staging status
   */
  private async determineStagingStatus(
    models: any,
    account: any,
    reportingDate: Date
  ): Promise<{ currentStage: number; previousStage?: number; reason: string }> {
    try {
      // Get staging parameters
      const stagingParams = await this.getStagingParameters(models, account.productType);

      // Calculate days past due
      const daysPastDue = this.calculateDaysPastDue(account, reportingDate);

      // Check significant increase in credit risk (SICR)
      const sicrResult = await this.checkSignificantIncreaseInCreditRisk(
        models,
        account,
        reportingDate
      );

      // Determine stage based on criteria
      let currentStage = 1;
      let reason = 'Performing account';

      if (daysPastDue >= stagingParams.stage3DpdThreshold || account.isDefaulted) {
        currentStage = 3;
        reason = `Default: ${daysPastDue} days past due`;
      } else if (
        daysPastDue >= stagingParams.stage2DpdThreshold ||
        sicrResult.hasSignificantIncrease
      ) {
        currentStage = 2;
        reason = sicrResult.hasSignificantIncrease 
          ? `SICR: ${sicrResult.reason}` 
          : `${daysPastDue} days past due`;
      }

      return {
        currentStage,
        previousStage: account.currentStage,
        reason
      };

    } catch (error) {
      this.logger.error('Failed to determine staging status', {
        accountId: account.accountId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Calculate probability of default
   */
  private async calculateProbabilityOfDefault(
    models: any,
    account: any,
    stage: number,
    reportingDate: Date
  ): Promise<{ pd12Month: number; pdLifetime: number }> {
    try {
      // Get PD model parameters
      const pdModel = await this.getPdModelParameters(
        models, 
        account.productType, 
        account.Customer?.customerType
      );

      // Calculate base PD using simple scoring model
      const basePd = await this.calculateBasePd(account, pdModel);

      // Apply stage-specific adjustments
      const pd12Month = this.applyPdAdjustments(basePd, stage, 12);
      const pdLifetime = stage === 1 ? pd12Month : this.applyPdAdjustments(basePd, stage, null);

      return {
        pd12Month: Math.max(0, Math.min(1, pd12Month)),
        pdLifetime: Math.max(0, Math.min(1, pdLifetime))
      };

    } catch (error) {
      this.logger.error('Failed to calculate PD', {
        accountId: account.accountId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Calculate loss given default
   */
  private async calculateLossGivenDefault(
    models: any,
    account: any,
    reportingDate: Date
  ): Promise<number> {
    try {
      // Get LGD parameters
      const lgdParams = await this.getLgdParameters(
        models,
        account.productType,
        account.collateralType
      );

      // Calculate recovery rate based on collateral
      const recoveryRate = this.calculateRecoveryRate(account, lgdParams);

      // LGD = 1 - Recovery Rate
      const lgd = 1 - recoveryRate;

      return Math.max(0, Math.min(1, lgd));

    } catch (error) {
      this.logger.error('Failed to calculate LGD', {
        accountId: account.accountId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Calculate exposure at default
   */
  private async calculateExposureAtDefault(
    models: any,
    account: any,
    reportingDate: Date
  ): Promise<number> {
    try {
      // For on-balance sheet exposures, EAD = Outstanding Amount
      let ead = account.outstandingAmount;

      // For off-balance sheet exposures, apply Credit Conversion Factor (CCF)
      if (account.isOffBalanceSheet) {
        const ccf = await this.getCreditConversionFactor(
          models,
          account.productType
        );
        ead = account.committedAmount * ccf;
      }

      return Math.max(0, ead);

    } catch (error) {
      this.logger.error('Failed to calculate EAD', {
        accountId: account.accountId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Calculate final ECL
   */
  private async calculateFinalEcl(
    stage: number,
    pdResult: { pd12Month: number; pdLifetime: number },
    lgd: number,
    ead: number
  ): Promise<{ ecl12Month: number; eclLifetime: number; finalEcl: number }> {
    // ECL = PD × LGD × EAD
    const ecl12Month = pdResult.pd12Month * lgd * ead;
    const eclLifetime = pdResult.pdLifetime * lgd * ead;

    // For Stage 1: use 12-month ECL
    // For Stage 2 & 3: use lifetime ECL
    const finalEcl = stage === 1 ? ecl12Month : eclLifetime;

    return {
      ecl12Month,
      eclLifetime,
      finalEcl
    };
  }

  /**
   * Generate calculation summary
   */
  private async generateCalculationSummary(
    models: any,
    calculationBatchId: string,
    results: EclCalculationResult[],
    executionTime: number
  ): Promise<EclCalculationSummary> {
    // Count by stages
    const stage1Count = results.filter(r => r.currentStage === 1).length;
    const stage2Count = results.filter(r => r.currentStage === 2).length;
    const stage3Count = results.filter(r => r.currentStage === 3).length;

    // Sum ECL by stages
    const stage1Ecl = results
      .filter(r => r.currentStage === 1)
      .reduce((sum, r) => sum + r.finalEcl, 0);
    
    const stage2Ecl = results
      .filter(r => r.currentStage === 2)
      .reduce((sum, r) => sum + r.finalEcl, 0);
    
    const stage3Ecl = results
      .filter(r => r.currentStage === 3)
      .reduce((sum, r) => sum + r.finalEcl, 0);

    const totalEcl = stage1Ecl + stage2Ecl + stage3Ecl;

    return {
      calculationId: calculationBatchId,
      totalAccounts: results.length,
      stage1Count,
      stage2Count,
      stage3Count,
      totalEcl,
      stage1Ecl,
      stage2Ecl,
      stage3Ecl,
      calculationTime: executionTime,
      status: 'completed'
    };
  }

  // Helper methods (simplified implementations)
  private calculateDaysPastDue(account: any, reportingDate: Date): number {
    if (!account.lastPaymentDate) return 0;
    const diffTime = reportingDate.getTime() - new Date(account.lastPaymentDate).getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  private async checkSignificantIncreaseInCreditRisk(models: any, account: any, reportingDate: Date) {
    // Simplified SICR check
    return {
      hasSignificantIncrease: false,
      reason: 'No significant increase detected'
    };
  }

  private async getStagingParameters(models: any, productType: string) {
    return {
      stage2DpdThreshold: 30,
      stage3DpdThreshold: 90
    };
  }

  private async getPdModelParameters(models: any, productType: string, customerType: string) {
    return {
      baseRate: 0.02,
      adjustmentFactors: {}
    };
  }

  private async calculateBasePd(account: any, pdModel: any): Promise<number> {
    // Simplified PD calculation
    return pdModel.baseRate;
  }

  private applyPdAdjustments(basePd: number, stage: number, timeHorizon: number | null): number {
    // Stage adjustments
    const stageMultiplier = stage === 1 ? 1 : stage === 2 ? 2 : 5;
    return basePd * stageMultiplier;
  }

  private async getLgdParameters(models: any, productType: string, collateralType: string) {
    return {
      baseLgd: 0.45,
      collateralRecoveryRate: collateralType ? 0.7 : 0.2
    };
  }

  private calculateRecoveryRate(account: any, lgdParams: any): number {
    return lgdParams.collateralRecoveryRate;
  }

  private async getCreditConversionFactor(models: any, productType: string): Promise<number> {
    return 0.75; // Default CCF for off-balance sheet items
  }
}
EOF

    log_success "Generated ECL Calculation Service: ${file_path}"
}

# MANDATORY: Generate Staging Analysis Service
generate_staging_analysis_service() {
    log_info "Generating Staging Analysis Service..."
    
    local file_path="${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9/staging-analysis.service.ts"
    
    cat > "${file_path}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/ifrs9/staging-analysis.service.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Winston, Joi
// Purpose: IFRS 9 staging analysis service for credit risk classification
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { PortfolioAccount, StagingParameter, CreditRiskEvent } from '../../models/ifrs9';
import { getTenantModels } from '../../database/tenant-context';
import { ConfigurationService } from '../configuration/configuration.service';

export interface StagingAnalysisInput {
  tenantId: string;
  portfolioAccountId: string;
  reportingDate: Date;
  forceRecalculation?: boolean;
}

export interface StagingAnalysisResult {
  portfolioAccountId: string;
  currentStage: number;
  previousStage: number;
  stageChangeDate?: Date;
  stagingReason: string;
  daysPastDue: number;
  hasSignificantIncrease: boolean;
  isDefaulted: boolean;
  riskIndicators: {
    quantitativeFactors: any;
    qualitativeFactors: any;
    macroeconomicFactors: any;
  };
  stagingHistory: any[];
}

export interface StageMovementSummary {
  reportingDate: Date;
  totalAccounts: number;
  stage1Accounts: number;
  stage2Accounts: number;
  stage3Accounts: number;
  stage1To2Movements: number;
  stage2To1Movements: number;
  stage2To3Movements: number;
  stage3To2Movements: number;
  netStageMovements: {
    stage1Net: number;
    stage2Net: number;
    stage3Net: number;
  };
}

const stagingAnalysisInputSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  portfolioAccountId: Joi.string().uuid().required(),
  reportingDate: Joi.date().required(),
  forceRecalculation: Joi.boolean().default(false)
});

@Injectable()
export class StagingAnalysisService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(StagingParameter) private stagingParameterModel: typeof StagingParameter,
    @InjectModel(CreditRiskEvent) private creditRiskEventModel: typeof CreditRiskEvent,
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'StagingAnalysisService' });
  }

  /**
   * Analyze staging status for a portfolio account
   */
  async analyzeStagingStatus(input: StagingAnalysisInput): Promise<StagingAnalysisResult> {
    // Validate input
    const { error, value } = stagingAnalysisInputSchema.validate(input);
    if (error) {
      throw new Error(`Invalid staging analysis input: ${error.message}`);
    }

    const validatedInput = value as StagingAnalysisInput;

    this.logger.info('Starting staging analysis', {
      tenantId: validatedInput.tenantId,
      portfolioAccountId: validatedInput.portfolioAccountId,
      reportingDate: validatedInput.reportingDate
    });

    try {
      // Get tenant models and account data
      const models = await getTenantModels(validatedInput.tenantId);
      const account = await this.getPortfolioAccountWithHistory(
        models,
        validatedInput.portfolioAccountId
      );

      if (!account) {
        throw new Error(`Portfolio account not found: ${validatedInput.portfolioAccountId}`);
      }

      // Get staging parameters
      const stagingParams = await this.getStagingParameters(
        models,
        account.productType,
        account.Customer?.customerType
      );

      // Calculate days past due
      const daysPastDue = this.calculateDaysPastDue(
        account,
        validatedInput.reportingDate
      );

      // Check for default status
      const isDefaulted = await this.checkDefaultStatus(
        models,
        account,
        daysPastDue,
        stagingParams
      );

      // Check for significant increase in credit risk (SICR)
      const sicrResult = await this.checkSignificantIncreaseInCreditRisk(
        models,
        account,
        validatedInput.reportingDate,
        stagingParams
      );

      // Determine current stage
      const stagingResult = await this.determineCurrentStage(
        account,
        daysPastDue,
        isDefaulted,
        sicrResult,
        stagingParams
      );

      // Get risk indicators
      const riskIndicators = await this.calculateRiskIndicators(
        models,
        account,
        validatedInput.reportingDate
      );

      // Get staging history
      const stagingHistory = await this.getStagingHistory(
        models,
        validatedInput.portfolioAccountId
      );

      const result: StagingAnalysisResult = {
        portfolioAccountId: validatedInput.portfolioAccountId,
        currentStage: stagingResult.currentStage,
        previousStage: account.currentStage || 1,
        stageChangeDate: stagingResult.stageChangeDate,
        stagingReason: stagingResult.reason,
        daysPastDue,
        hasSignificantIncrease: sicrResult.hasSignificantIncrease,
        isDefaulted,
        riskIndicators,
        stagingHistory
      };

      // Update account staging if changed
      if (result.currentStage !== result.previousStage) {
        await this.updateAccountStaging(
          models,
          account,
          result,
          validatedInput.reportingDate
        );
      }

      this.logger.info('Staging analysis completed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        currentStage: result.currentStage,
        previousStage: result.previousStage,
        stagingReason: result.stagingReason
      });

      return result;

    } catch (error) {
      this.logger.error('Staging analysis failed', {
        portfolioAccountId: validatedInput.portfolioAccountId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Staging analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze stage movements for reporting period
   */
  async analyzeStageMovements(
    tenantId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<StageMovementSummary> {
    try {
      const models = await getTenantModels(tenantId);

      // Get all accounts with staging history in the period
      const stageMovements = await models.StagingHistory.findAll({
        where: {
          stageChangeDate: {
            [models.Sequelize.Op.between]: [fromDate, toDate]
          }
        },
        include: [{
          model: models.PortfolioAccount,
          as: 'PortfolioAccount',
          attributes: ['id', 'accountId']
        }],
        order: [['stageChangeDate', 'ASC']]
      });

      // Get current staging distribution
      const currentStaging = await models.PortfolioAccount.findAll({
        attributes: [
          'currentStage',
          [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'count']
        ],
        where: {
          tenantId,
          isActive: true
        },
        group: ['currentStage']
      });

      // Calculate movements
      const movements = this.calculateStageMovements(stageMovements);
      const stagingDistribution = this.calculateStagingDistribution(currentStaging);

      return {
        reportingDate: toDate,
        totalAccounts: stagingDistribution.total,
        stage1Accounts: stagingDistribution.stage1,
        stage2Accounts: stagingDistribution.stage2,
        stage3Accounts: stagingDistribution.stage3,
        stage1To2Movements: movements.stage1To2,
        stage2To1Movements: movements.stage2To1,
        stage2To3Movements: movements.stage2To3,
        stage3To2Movements: movements.stage3To2,
        netStageMovements: {
          stage1Net: movements.stage2To1 - movements.stage1To2,
          stage2Net: movements.stage1To2 + movements.stage3To2 - movements.stage2To1 - movements.stage2To3,
          stage3Net: movements.stage2To3 - movements.stage3To2
        }
      };

    } catch (error) {
      this.logger.error('Stage movement analysis failed', {
        tenantId,
        fromDate,
        toDate,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get portfolio account with historical data
   */
  private async getPortfolioAccountWithHistory(
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
        },
        {
          model: models.PaymentHistory,
          as: 'PaymentHistory',
          limit: 12,
          order: [['paymentDate', 'DESC']]
        }
      ]
    });
  }

  /**
   * Calculate days past due
   */
  private calculateDaysPastDue(account: any, reportingDate: Date): number {
    if (!account.nextPaymentDate) return 0;
    
    const nextPaymentDate = new Date(account.nextPaymentDate);
    if (nextPaymentDate > reportingDate) return 0;

    const diffTime = reportingDate.getTime() - nextPaymentDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check default status
   */
  private async checkDefaultStatus(
    models: any,
    account: any,
    daysPastDue: number,
    stagingParams: any
  ): Promise<boolean> {
    // Quantitative default indicators
    if (daysPastDue >= stagingParams.defaultDpdThreshold) {
      return true;
    }

    // Qualitative default indicators
    const qualitativeDefaults = await models.CreditRiskEvent.findOne({
      where: {
        portfolioAccountId: account.id,
        eventType: 'default',
        isActive: true
      }
    });

    return !!qualitativeDefaults;
  }

  /**
   * Check for significant increase in credit risk
   */
  private async checkSignificantIncreaseInCreditRisk(
    models: any,
    account: any,
    reportingDate: Date,
    stagingParams: any
  ): Promise<{ hasSignificantIncrease: boolean; reason: string; indicators: any[] }> {
    const indicators = [];
    let hasSignificantIncrease = false;
    let reason = 'No significant increase in credit risk detected';

    try {
      // 1. Days past due test
      const daysPastDue = this.calculateDaysPastDue(account, reportingDate);
      if (daysPastDue >= stagingParams.sicrDpdThreshold) {
        hasSignificantIncrease = true;
        reason = `Days past due threshold exceeded: ${daysPastDue} days`;
        indicators.push({
          type: 'days_past_due',
          value: daysPastDue,
          threshold: stagingParams.sicrDpdThreshold,
          triggered: true
        });
      }

      // 2. Credit rating deterioration
      const ratingHistory = await this.getCreditRatingHistory(models, account.id);
      const ratingDeterioration = this.checkRatingDeterioration(ratingHistory, stagingParams);
      if (ratingDeterioration.hasDeterioration) {
        hasSignificantIncrease = true;
        reason = ratingDeterioration.reason;
        indicators.push(ratingDeterioration.indicator);
      }

      // 3. Probability of default increase
      const pdIncrease = await this.checkPdIncrease(models, account, reportingDate, stagingParams);
      if (pdIncrease.hasIncrease) {
        hasSignificantIncrease = true;
        reason = pdIncrease.reason;
        indicators.push(pdIncrease.indicator);
      }

      // 4. Qualitative factors
      const qualitativeFactors = await this.checkQualitativeFactors(models, account, reportingDate);
      if (qualitativeFactors.hasSignificantFactors) {
        hasSignificantIncrease = true;
        reason = qualitativeFactors.reason;
        indicators.push(...qualitativeFactors.indicators);
      }

      return {
        hasSignificantIncrease,
        reason,
        indicators
      };

    } catch (error) {
      this.logger.error('SICR check failed', {
        accountId: account.accountId,
        error: error.message
      });
      return {
        hasSignificantIncrease: false,
        reason: 'SICR check failed',
        indicators: []
      };
    }
  }

  /**
   * Determine current staging
   */
  private async determineCurrentStage(
    account: any,
    daysPastDue: number,
    isDefaulted: boolean,
    sicrResult: any,
    stagingParams: any
  ): Promise<{ currentStage: number; reason: string; stageChangeDate?: Date }> {
    let currentStage = 1;
    let reason = 'Performing account - no significant increase in credit risk';
    let stageChangeDate: Date | undefined;

    // Stage 3: Default
    if (isDefaulted) {
      currentStage = 3;
      reason = `Credit-impaired account - default status detected`;
      stageChangeDate = new Date();
    }
    // Stage 2: Significant increase in credit risk
    else if (sicrResult.hasSignificantIncrease) {
      currentStage = 2;
      reason = `Significant increase in credit risk - ${sicrResult.reason}`;
      stageChangeDate = new Date();
    }
    // Stage 1: Performing
    else {
      currentStage = 1;
      reason = 'Performing account - no significant increase in credit risk';
    }

    // Only set stage change date if stage actually changed
    if (currentStage === account.currentStage) {
      stageChangeDate = undefined;
    }

    return {
      currentStage,
      reason,
      stageChangeDate
    };
  }

  // Helper methods (simplified implementations)
  private async getStagingParameters(models: any, productType: string, customerType: string) {
    // Get from configuration or database
    return {
      sicrDpdThreshold: 30,
      defaultDpdThreshold: 90,
      pdThresholdIncrease: 2.0, // 200% increase
      ratingNotchesThreshold: 2
    };
  }

  private async calculateRiskIndicators(models: any, account: any, reportingDate: Date) {
    return {
      quantitativeFactors: {
        daysPastDue: this.calculateDaysPastDue(account, reportingDate),
        utilizationRate: account.outstandingAmount / (account.creditLimit || account.outstandingAmount),
        paymentBehavior: 'regular' // simplified
      },
      qualitativeFactors: {
        industryRisk: 'medium',
        managementQuality: 'good',
        businessConditions: 'stable'
      },
      macroeconomicFactors: {
        gdpGrowth: 0.05,
        unemploymentRate: 0.06,
        interestRateEnvironment: 'stable'
      }
    };
  }

  private async getStagingHistory(models: any, portfolioAccountId: string) {
    return await models.StagingHistory.findAll({
      where: { portfolioAccountId },
      order: [['stageChangeDate', 'DESC']],
      limit: 12
    });
  }

  private async updateAccountStaging(
    models: any,
    account: any,
    result: StagingAnalysisResult,
    reportingDate: Date
  ) {
    // Update account staging
    await account.update({
      currentStage: result.currentStage,
      previousStage: result.previousStage,
      stageChangeDate: result.stageChangeDate,
      lastStagingDate: reportingDate
    });

    // Record staging history
    await models.StagingHistory.create({
      portfolioAccountId: account.id,
      fromStage: result.previousStage,
      toStage: result.currentStage,
      stageChangeDate: result.stageChangeDate || reportingDate,
      reason: result.stagingReason,
      daysPastDue: result.daysPastDue,
      riskIndicators: result.riskIndicators
    });
  }

  private calculateStageMovements(movements: any[]) {
    return {
      stage1To2: movements.filter(m => m.fromStage === 1 && m.toStage === 2).length,
      stage2To1: movements.filter(m => m.fromStage === 2 && m.toStage === 1).length,
      stage2To3: movements.filter(m => m.fromStage === 2 && m.toStage === 3).length,
      stage3To2: movements.filter(m => m.fromStage === 3 && m.toStage === 2).length
    };
  }

  private calculateStagingDistribution(distribution: any[]) {
    const result = { total: 0, stage1: 0, stage2: 0, stage3: 0 };
    distribution.forEach(d => {
      const count = parseInt(d.dataValues.count);
      result.total += count;
      if (d.currentStage === 1) result.stage1 = count;
      if (d.currentStage === 2) result.stage2 = count;
      if (d.currentStage === 3) result.stage3 = count;
    });
    return result;
  }

  private async getCreditRatingHistory(models: any, accountId: string) {
    return [];
  }

  private checkRatingDeterioration(history: any[], params: any) {
    return {
      hasDeterioration: false,
      reason: '',
      indicator: {}
    };
  }

  private async checkPdIncrease(models: any, account: any, reportingDate: Date, params: any) {
    return {
      hasIncrease: false,
      reason: '',
      indicator: {}
    };
  }

  private async checkQualitativeFactors(models: any, account: any, reportingDate: Date) {
    return {
      hasSignificantFactors: false,
      reason: '',
      indicators: []
    };
  }
}
EOF

    log_success "Generated Staging Analysis Service: ${file_path}"
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
    track_progress "${PHASE_ID}" "PART1_STARTED"
    
    # Generate services
    generate_ecl_calculation_service
    generate_staging_analysis_service
    
    # Track completion
    track_progress "${PHASE_ID}" "PART1_COMPLETED"
    
    log_success "============================================================================"
    log_success "PSDD ${PHASE_ID} Part 1 completed successfully!"
    log_success "============================================================================"
    log_success "Generated: ECL Calculation Service, Staging Analysis Service"
    log_success "Next step: Execute d3h2-ifrs9-basic-services-part2.sh"
    log_success "============================================================================"
}

# Execute main function
main "$@"