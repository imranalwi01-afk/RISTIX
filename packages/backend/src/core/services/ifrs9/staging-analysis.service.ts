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
