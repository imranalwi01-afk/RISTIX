// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/ifrs9/result-aggregation.service.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Winston, Joi
// Purpose: IFRS 9 result aggregation and portfolio-level ECL calculation
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { EclCalculation, EclAggregation, PortfolioAccount } from '../../models/ifrs9';
import { getTenantModels } from '../../database/tenant-context';
import { ConfigurationService } from '../configuration/configuration.service';

export interface AggregationInput {
  tenantId: string;
  calculationBatchId: string;
  reportingDate: Date;
  aggregationLevel: 'portfolio' | 'product' | 'customer_segment' | 'stage';
  filterCriteria?: {
    productTypes?: string[];
    customerSegments?: string[];
    stages?: number[];
    branches?: string[];
  };
}

export interface AggregationResult {
  aggregationId: string;
  level: string;
  levelValue: string;
  totalAccounts: number;
  totalExposure: number;
  totalEcl: number;
  stage1Summary: StageAggregation;
  stage2Summary: StageAggregation;
  stage3Summary: StageAggregation;
  coverageRatio: number;
  calculationDate: Date;
  reportingDate: Date;
}

export interface StageAggregation {
  accountCount: number;
  totalExposure: number;
  totalEcl: number;
  averagePd: number;
  averageLgd: number;
  coverageRatio: number;
  weightedAverageMaturity?: number;
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalEclProvision: number;
  overallCoverageRatio: number;
  stageDistribution: {
    stage1Percentage: number;
    stage2Percentage: number;
    stage3Percentage: number;
  };
  eclDistribution: {
    stage1EclPercentage: number;
    stage2EclPercentage: number;
    stage3EclPercentage: number;
  };
  movementAnalysis: {
    newAccounts: number;
    upgrades: number;
    downgrades: number;
    writeOffs: number;
  };
}

const aggregationInputSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
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

@Injectable()
export class ResultAggregationService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(EclCalculation) private eclCalculationModel: typeof EclCalculation,
    @InjectModel(EclAggregation) private eclAggregationModel: typeof EclAggregation,
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'ResultAggregationService' });
  }

  /**
   * Aggregate ECL calculation results at specified level
   */
  async aggregateResults(input: AggregationInput): Promise<AggregationResult[]> {
    // Validate input
    const { error, value } = aggregationInputSchema.validate(input);
    if (error) {
      throw new Error(`Invalid aggregation input: ${error.message}`);
    }

    const validatedInput = value as AggregationInput;

    this.logger.info('Starting result aggregation', {
      tenantId: validatedInput.tenantId,
      calculationBatchId: validatedInput.calculationBatchId,
      aggregationLevel: validatedInput.aggregationLevel
    });

    try {
      // Get tenant models
      const models = await getTenantModels(validatedInput.tenantId);

      // Get calculation results with account details
      const calculationResults = await this.getCalculationResults(
        models,
        validatedInput
      );

      if (calculationResults.length === 0) {
        this.logger.warning('No calculation results found for aggregation', {
          calculationBatchId: validatedInput.calculationBatchId
        });
        return [];
      }

      // Group results by aggregation level
      const groupedResults = this.groupResultsByLevel(
        calculationResults,
        validatedInput.aggregationLevel
      );

      // Calculate aggregations for each group
      const aggregations: AggregationResult[] = [];
      
      for (const [levelValue, results] of Object.entries(groupedResults)) {
        const aggregation = await this.calculateAggregation(
          models,
          validatedInput,
          levelValue,
          results as any[]
        );
        aggregations.push(aggregation);
      }

      // Store aggregation results
      await this.storeAggregationResults(
        models,
        validatedInput.calculationBatchId,
        aggregations
      );

      this.logger.info('Result aggregation completed', {
        calculationBatchId: validatedInput.calculationBatchId,
        aggregationLevel: validatedInput.aggregationLevel,
        groupCount: aggregations.length
      });

      return aggregations;

    } catch (error) {
      this.logger.error('Result aggregation failed', {
        calculationBatchId: validatedInput.calculationBatchId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Result aggregation failed: ${error.message}`);
    }
  }

  /**
   * Generate portfolio-level summary
   */
  async generatePortfolioSummary(
    tenantId: string,
    calculationBatchId: string
  ): Promise<PortfolioSummary> {
    try {
      const models = await getTenantModels(tenantId);

      // Get all calculation results
      const results = await models.EclCalculation.findAll({
        where: {
          calculationBatchId,
          status: 'completed'
        },
        include: [{
          model: models.PortfolioAccount,
          as: 'PortfolioAccount',
          attributes: ['outstandingAmount', 'productType', 'currentStage', 'previousStage']
        }]
      });

      if (results.length === 0) {
        throw new Error('No calculation results found for portfolio summary');
      }

      // Calculate portfolio totals
      const totalPortfolioValue = results.reduce((sum, r) => 
        sum + (r.PortfolioAccount?.outstandingAmount || 0), 0
      );

      const totalEclProvision = results.reduce((sum, r) => 
        sum + (r.finalEcl || 0), 0
      );

      const overallCoverageRatio = totalPortfolioValue > 0 
        ? (totalEclProvision / totalPortfolioValue) 
        : 0;

      // Calculate stage distribution
      const stageDistribution = this.calculateStageDistribution(results);
      const eclDistribution = this.calculateEclDistribution(results);
      const movementAnalysis = await this.calculateMovementAnalysis(models, results);

      return {
        totalPortfolioValue,
        totalEclProvision,
        overallCoverageRatio,
        stageDistribution,
        eclDistribution,
        movementAnalysis
      };

    } catch (error) {
      this.logger.error('Portfolio summary generation failed', {
        tenantId,
        calculationBatchId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get calculation results with account details
   */
  private async getCalculationResults(
    models: any,
    input: AggregationInput
  ): Promise<any[]> {
    const whereClause: any = {
      calculationBatchId: input.calculationBatchId,
      status: 'completed'
    };

    // Apply filters if provided
    const includeClause: any = [{
      model: models.PortfolioAccount,
      as: 'PortfolioAccount',
      attributes: [
        'id', 'accountId', 'outstandingAmount', 'productType', 
        'currentStage', 'previousStage', 'customerId'
      ],
      include: [{
        model: models.Customer,
        as: 'Customer',
        attributes: ['customerSegment', 'customerType']
      }]
    }];

    // Apply product type filter
    if (input.filterCriteria?.productTypes) {
      includeClause[0].where = {
        productType: input.filterCriteria.productTypes
      };
    }

    // Apply stage filter
    if (input.filterCriteria?.stages) {
      includeClause[0].where = {
        ...includeClause[0].where,
        currentStage: input.filterCriteria.stages
      };
    }

    return await models.EclCalculation.findAll({
      where: whereClause,
      include: includeClause,
      order: [['calculationDate', 'DESC']]
    });
  }

  /**
   * Group results by aggregation level
   */
  private groupResultsByLevel(
    results: any[],
    aggregationLevel: string
  ): { [key: string]: any[] } {
    const grouped: { [key: string]: any[] } = {};

    for (const result of results) {
      let groupKey = 'all';

      switch (aggregationLevel) {
        case 'portfolio':
          groupKey = 'portfolio';
          break;
        case 'product':
          groupKey = result.PortfolioAccount?.productType || 'unknown';
          break;
        case 'customer_segment':
          groupKey = result.PortfolioAccount?.Customer?.customerSegment || 'unknown';
          break;
        case 'stage':
          groupKey = `stage_${result.currentStage}`;
          break;
        default:
          groupKey = 'all';
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(result);
    }

    return grouped;
  }

  /**
   * Calculate aggregation for a group of results
   */
  private async calculateAggregation(
    models: any,
    input: AggregationInput,
    levelValue: string,
    results: any[]
  ): Promise<AggregationResult> {
    // Calculate stage-wise aggregations
    const stage1Results = results.filter(r => r.currentStage === 1);
    const stage2Results = results.filter(r => r.currentStage === 2);
    const stage3Results = results.filter(r => r.currentStage === 3);

    const stage1Summary = this.calculateStageAggregation(stage1Results);
    const stage2Summary = this.calculateStageAggregation(stage2Results);
    const stage3Summary = this.calculateStageAggregation(stage3Results);

    // Calculate overall metrics
    const totalAccounts = results.length;
    const totalExposure = results.reduce((sum, r) => 
      sum + (r.PortfolioAccount?.outstandingAmount || 0), 0
    );
    const totalEcl = results.reduce((sum, r) => sum + (r.finalEcl || 0), 0);
    const coverageRatio = totalExposure > 0 ? (totalEcl / totalExposure) : 0;

    // Store aggregation in database
    const aggregation = await models.EclAggregation.create({
      calculationBatchId: input.calculationBatchId,
      aggregationLevel: input.aggregationLevel,
      levelValue,
      totalAccounts,
      totalExposure,
      totalEcl,
      coverageRatio,
      stage1AccountCount: stage1Summary.accountCount,
      stage1Exposure: stage1Summary.totalExposure,
      stage1Ecl: stage1Summary.totalEcl,
      stage2AccountCount: stage2Summary.accountCount,
      stage2Exposure: stage2Summary.totalExposure,
      stage2Ecl: stage2Summary.totalEcl,
      stage3AccountCount: stage3Summary.accountCount,
      stage3Exposure: stage3Summary.totalExposure,
      stage3Ecl: stage3Summary.totalEcl,
      reportingDate: input.reportingDate,
      calculationDate: new Date()
    });

    return {
      aggregationId: aggregation.id,
      level: input.aggregationLevel,
      levelValue,
      totalAccounts,
      totalExposure,
      totalEcl,
      stage1Summary,
      stage2Summary,
      stage3Summary,
      coverageRatio,
      calculationDate: new Date(),
      reportingDate: input.reportingDate
    };
  }

  /**
   * Calculate stage-specific aggregation
   */
  private calculateStageAggregation(results: any[]): StageAggregation {
    if (results.length === 0) {
      return {
        accountCount: 0,
        totalExposure: 0,
        totalEcl: 0,
        averagePd: 0,
        averageLgd: 0,
        coverageRatio: 0
      };
    }

    const totalExposure = results.reduce((sum, r) => 
      sum + (r.PortfolioAccount?.outstandingAmount || 0), 0
    );
    const totalEcl = results.reduce((sum, r) => sum + (r.finalEcl || 0), 0);
    const coverageRatio = totalExposure > 0 ? (totalEcl / totalExposure) : 0;

    // Calculate weighted averages
    const totalPdWeight = results.reduce((sum, r) => 
      sum + ((r.pd12Month || 0) * (r.PortfolioAccount?.outstandingAmount || 0)), 0
    );
    const totalLgdWeight = results.reduce((sum, r) => 
      sum + ((r.lgd || 0) * (r.PortfolioAccount?.outstandingAmount || 0)), 0
    );

    const averagePd = totalExposure > 0 ? (totalPdWeight / totalExposure) : 0;
    const averageLgd = totalExposure > 0 ? (totalLgdWeight / totalExposure) : 0;

    return {
      accountCount: results.length,
      totalExposure,
      totalEcl,
      averagePd,
      averageLgd,
      coverageRatio
    };
  }

  /**
   * Store aggregation results in database
   */
  private async storeAggregationResults(
    models: any,
    calculationBatchId: string,
    aggregations: AggregationResult[]
  ): Promise<void> {
    try {
      // Store aggregation metadata
      await models.AggregationBatch.create({
        calculationBatchId,
        aggregationCount: aggregations.length,
        status: 'completed',
        createdAt: new Date()
      });

      this.logger.info('Aggregation results stored successfully', {
        calculationBatchId,
        aggregationCount: aggregations.length
      });

    } catch (error) {
      this.logger.error('Failed to store aggregation results', {
        calculationBatchId,
        error: error.message
      });
    }
  }

  // Helper methods for portfolio summary
  private calculateStageDistribution(results: any[]): any {
    const total = results.length;
    if (total === 0) return { stage1Percentage: 0, stage2Percentage: 0, stage3Percentage: 0 };

    const stage1Count = results.filter(r => r.currentStage === 1).length;
    const stage2Count = results.filter(r => r.currentStage === 2).length;
    const stage3Count = results.filter(r => r.currentStage === 3).length;

    return {
      stage1Percentage: (stage1Count / total) * 100,
      stage2Percentage: (stage2Count / total) * 100,
      stage3Percentage: (stage3Count / total) * 100
    };
  }

  private calculateEclDistribution(results: any[]): any {
    const totalEcl = results.reduce((sum, r) => sum + (r.finalEcl || 0), 0);
    if (totalEcl === 0) return { stage1EclPercentage: 0, stage2EclPercentage: 0, stage3EclPercentage: 0 };

    const stage1Ecl = results.filter(r => r.currentStage === 1)
      .reduce((sum, r) => sum + (r.finalEcl || 0), 0);
    const stage2Ecl = results.filter(r => r.currentStage === 2)
      .reduce((sum, r) => sum + (r.finalEcl || 0), 0);
    const stage3Ecl = results.filter(r => r.currentStage === 3)
      .reduce((sum, r) => sum + (r.finalEcl || 0), 0);

    return {
      stage1EclPercentage: (stage1Ecl / totalEcl) * 100,
      stage2EclPercentage: (stage2Ecl / totalEcl) * 100,
      stage3EclPercentage: (stage3Ecl / totalEcl) * 100
    };
  }

  private async calculateMovementAnalysis(models: any, results: any[]): Promise<any> {
    // Simplified movement analysis
    const newAccounts = results.filter(r => !r.PortfolioAccount?.previousStage).length;
    const upgrades = results.filter(r => 
      r.PortfolioAccount?.previousStage && 
      r.currentStage < r.PortfolioAccount.previousStage
    ).length;
    const downgrades = results.filter(r => 
      r.PortfolioAccount?.previousStage && 
      r.currentStage > r.PortfolioAccount.previousStage
    ).length;

    return {
      newAccounts,
      upgrades,
      downgrades,
      writeOffs: 0 // Would be calculated from actual write-off data
    };
  }
}
