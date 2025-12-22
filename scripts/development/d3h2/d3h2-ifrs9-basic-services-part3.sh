#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - DAY 3 HOUR 2 PART 3
# ============================================================================
# Script: d3h2-ifrs9-basic-services-part3.sh
# Phase: D3H2 - Result Aggregation and Validation Services
# Objective: Generate result aggregation, validation, and audit services
# Generated: $(date)
# Methodology: Phased Shell-Driven Development (PSDD)
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d3h2-part3-$(date +%Y%m%d-%H%M%S).log"

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
    log_error "Part 3 script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Phase identification
PHASE_ID="D3H2P3"
PHASE_NAME="Result Aggregation and Validation Services"
PHASE_OBJECTIVE="Generate result aggregation, validation rules, and audit trail services"

log_info "============================================================================"
log_info "PSDD METHODOLOGY - ${PHASE_ID}: ${PHASE_NAME}"
log_info "============================================================================"

# MANDATORY: Generate Result Aggregation Service
generate_result_aggregation_service() {
    log_info "Generating Result Aggregation Service..."
    
    local file_path="${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9/result-aggregation.service.ts"
    
    cat > "${file_path}" << 'EOF'
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
EOF

    log_success "Generated Result Aggregation Service: ${file_path}"
}

# MANDATORY: Generate Validation Rules Service
generate_validation_rules_service() {
    log_info "Generating Validation Rules Service..."
    
    local file_path="${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9/validation-rules.service.ts"
    
    cat > "${file_path}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/ifrs9/validation-rules.service.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Winston, Joi
// Purpose: IFRS 9 calculation validation rules and data quality checks
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { ValidationRule, ValidationResult, EclCalculation } from '../../models/ifrs9';
import { getTenantModels } from '../../database/tenant-context';
import { ConfigurationService } from '../configuration/configuration.service';

export interface ValidationInput {
  tenantId: string;
  calculationBatchId: string;
  validationType: 'pre_calculation' | 'post_calculation' | 'data_quality';
  scope: 'portfolio' | 'account' | 'calculation';
  portfolioAccountId?: string;
  calculationId?: string;
}

export interface ValidationResultSummary {
  validationId: string;
  batchId: string;
  validationType: string;
  scope: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  overallStatus: 'passed' | 'failed' | 'warning';
  validationDate: Date;
  details: ValidationDetail[];
}

export interface ValidationDetail {
  ruleId: string;
  ruleName: string;
  ruleDescription: string;
  severity: 'error' | 'warning' | 'info';
  status: 'passed' | 'failed' | 'warning';
  entityType: string;
  entityId: string;
  expectedValue?: any;
  actualValue?: any;
  message: string;
  recommendations?: string[];
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'error' | 'warning' | 'info';
  expression: string;
  parameters: any;
  isActive: boolean;
}

const validationInputSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  calculationBatchId: Joi.string().uuid().required(),
  validationType: Joi.string().valid('pre_calculation', 'post_calculation', 'data_quality').required(),
  scope: Joi.string().valid('portfolio', 'account', 'calculation').required(),
  portfolioAccountId: Joi.string().uuid().optional(),
  calculationId: Joi.string().uuid().optional()
});

@Injectable()
export class ValidationRulesService {
  private readonly logger: Logger;
  private readonly validationRules: Map<string, BusinessRule>;

  constructor(
    @InjectModel(ValidationRule) private validationRuleModel: typeof ValidationRule,
    @InjectModel(ValidationResult) private validationResultModel: typeof ValidationResult,
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'ValidationRulesService' });
    this.validationRules = new Map();
    this.initializeValidationRules();
  }

  /**
   * Execute validation checks
   */
  async executeValidation(input: ValidationInput): Promise<ValidationResultSummary> {
    // Validate input
    const { error, value } = validationInputSchema.validate(input);
    if (error) {
      throw new Error(`Invalid validation input: ${error.message}`);
    }

    const validatedInput = value as ValidationInput;

    this.logger.info('Starting validation execution', {
      tenantId: validatedInput.tenantId,
      calculationBatchId: validatedInput.calculationBatchId,
      validationType: validatedInput.validationType,
      scope: validatedInput.scope
    });

    try {
      // Get tenant models
      const models = await getTenantModels(validatedInput.tenantId);

      // Get applicable validation rules
      const applicableRules = await this.getApplicableRules(
        models,
        validatedInput.validationType,
        validatedInput.scope
      );

      if (applicableRules.length === 0) {
        this.logger.warning('No applicable validation rules found', validatedInput);
        return this.createEmptyValidationResult(validatedInput);
      }

      // Execute validation checks
      const validationDetails: ValidationDetail[] = [];

      for (const rule of applicableRules) {
        try {
          const ruleResults = await this.executeValidationRule(
            models,
            validatedInput,
            rule
          );
          validationDetails.push(...ruleResults);
        } catch (error) {
          this.logger.error(`Validation rule execution failed: ${rule.name}`, {
            ruleId: rule.id,
            error: error.message
          });
          
          validationDetails.push({
            ruleId: rule.id,
            ruleName: rule.name,
            ruleDescription: rule.description,
            severity: 'error',
            status: 'failed',
            entityType: 'validation',
            entityId: 'system',
            message: `Rule execution failed: ${error.message}`,
            recommendations: ['Review rule configuration', 'Check data availability']
          });
        }
      }

      // Create validation summary
      const summary = await this.createValidationSummary(
        models,
        validatedInput,
        validationDetails
      );

      // Store validation results
      await this.storeValidationResults(models, summary);

      this.logger.info('Validation execution completed', {
        validationId: summary.validationId,
        totalChecks: summary.totalChecks,
        overallStatus: summary.overallStatus
      });

      return summary;

    } catch (error) {
      this.logger.error('Validation execution failed', {
        calculationBatchId: validatedInput.calculationBatchId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Validation execution failed: ${error.message}`);
    }
  }

  /**
   * Execute specific validation rule
   */
  private async executeValidationRule(
    models: any,
    input: ValidationInput,
    rule: BusinessRule
  ): Promise<ValidationDetail[]> {
    const results: ValidationDetail[] = [];

    switch (rule.category) {
      case 'data_quality':
        return await this.executeDataQualityRule(models, input, rule);
      case 'business_logic':
        return await this.executeBusinessLogicRule(models, input, rule);
      case 'calculation_consistency':
        return await this.executeCalculationConsistencyRule(models, input, rule);
      case 'regulatory_compliance':
        return await this.executeRegulatoryComplianceRule(models, input, rule);
      default:
        return await this.executeGenericRule(models, input, rule);
    }
  }

  /**
   * Execute data quality validation rules
   */
  private async executeDataQualityRule(
    models: any,
    input: ValidationInput,
    rule: BusinessRule
  ): Promise<ValidationDetail[]> {
    const results: ValidationDetail[] = [];

    switch (rule.id) {
      case 'DQ001': // Missing mandatory fields
        return await this.checkMandatoryFields(models, input, rule);
      case 'DQ002': // Data type validation
        return await this.checkDataTypes(models, input, rule);
      case 'DQ003': // Value range validation
        return await this.checkValueRanges(models, input, rule);
      case 'DQ004': // Data consistency checks
        return await this.checkDataConsistency(models, input, rule);
      case 'DQ005': // Duplicate detection
        return await this.checkDuplicates(models, input, rule);
      default:
        return results;
    }
  }

  /**
   * Execute business logic validation rules
   */
  private async executeBusinessLogicRule(
    models: any,
    input: ValidationInput,
    rule: BusinessRule
  ): Promise<ValidationDetail[]> {
    const results: ValidationDetail[] = [];

    switch (rule.id) {
      case 'BL001': // Staging logic validation
        return await this.validateStagingLogic(models, input, rule);
      case 'BL002': // PD reasonableness
        return await this.validatePdReasonableness(models, input, rule);
      case 'BL003': // LGD bounds checking
        return await this.validateLgdBounds(models, input, rule);
      case 'BL004': // EAD calculation validation
        return await this.validateEadCalculation(models, input, rule);
      case 'BL005': // ECL calculation validation
        return await this.validateEclCalculation(models, input, rule);
      default:
        return results;
    }
  }

  /**
   * Execute calculation consistency validation rules
   */
  private async executeCalculationConsistencyRule(
    models: any,
    input: ValidationInput,
    rule: BusinessRule
  ): Promise<ValidationDetail[]> {
    const results: ValidationDetail[] = [];

    switch (rule.id) {
      case 'CC001': // PD × LGD × EAD = ECL
        return await this.validateEclFormula(models, input, rule);
      case 'CC002': // Stage movement consistency
        return await this.validateStageMovements(models, input, rule);
      case 'CC003': // Total portfolio reconciliation
        return await this.validatePortfolioReconciliation(models, input, rule);
      case 'CC004': // Currency consistency
        return await this.validateCurrencyConsistency(models, input, rule);
      default:
        return results;
    }
  }

  // Specific validation implementations
  private async checkMandatoryFields(
    models: any,
    input: ValidationInput,
    rule: BusinessRule
  ): Promise<ValidationDetail[]> {
    const results: ValidationDetail[] = [];
    
    try {
      // Get calculation results
      const calculations = await models.EclCalculation.findAll({
        where: { calculationBatchId: input.calculationBatchId },
        include: [{
          model: models.PortfolioAccount,
          as: 'PortfolioAccount'
        }]
      });

      const mandatoryFields = [
        'outstandingAmount', 'productType', 'originationDate',
        'reportingDate', 'customerId', 'accountId'
      ];

      for (const calc of calculations) {
        const account = calc.PortfolioAccount;
        if (!account) continue;

        for (const field of mandatoryFields) {
          if (!account[field] || account[field] === null || account[field] === '') {
            results.push({
              ruleId: rule.id,
              ruleName: rule.name,
              ruleDescription: rule.description,
              severity: rule.severity as any,
              status: 'failed',
              entityType: 'portfolio_account',
              entityId: account.id,
              expectedValue: 'non-null value',
              actualValue: account[field],
              message: `Mandatory field '${field}' is missing or empty`,
              recommendations: [`Provide valid value for ${field}`, 'Review data loading process']
            });
          }
        }
      }

      // Add success result if no failures
      if (results.length === 0) {
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleDescription: rule.description,
          severity: 'info',
          status: 'passed',
          entityType: 'portfolio',
          entityId: input.calculationBatchId,
          message: 'All mandatory fields are present',
          recommendations: []
        });
      }

    } catch (error) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        ruleDescription: rule.description,
        severity: 'error',
        status: 'failed',
        entityType: 'validation',
        entityId: 'system',
        message: `Mandatory fields check failed: ${error.message}`,
        recommendations: ['Review data structure', 'Check database connectivity']
      });
    }

    return results;
  }

  private async validateEclFormula(
    models: any,
    input: ValidationInput,
    rule: BusinessRule
  ): Promise<ValidationDetail[]> {
    const results: ValidationDetail[] = [];
    
    try {
      const calculations = await models.EclCalculation.findAll({
        where: { 
          calculationBatchId: input.calculationBatchId,
          status: 'completed'
        }
      });

      for (const calc of calculations) {
        const expectedEcl = (calc.pd12Month || calc.pdLifetime || 0) * 
                           (calc.lgd || 0) * 
                           (calc.ead || 0);
        
        const actualEcl = calc.finalEcl || 0;
        const tolerance = 0.01; // 1% tolerance
        
        const difference = Math.abs(expectedEcl - actualEcl);
        const relativeDifference = expectedEcl > 0 ? difference / expectedEcl : 0;

        if (relativeDifference > tolerance) {
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            ruleDescription: rule.description,
            severity: 'error',
            status: 'failed',
            entityType: 'ecl_calculation',
            entityId: calc.id,
            expectedValue: expectedEcl,
            actualValue: actualEcl,
            message: `ECL calculation formula inconsistency: Expected ${expectedEcl.toFixed(2)}, got ${actualEcl.toFixed(2)}`,
            recommendations: ['Review ECL calculation logic', 'Check component calculations']
          });
        }
      }

      if (results.length === 0) {
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleDescription: rule.description,
          severity: 'info',
          status: 'passed',
          entityType: 'portfolio',
          entityId: input.calculationBatchId,
          message: 'ECL formula validation passed for all calculations',
          recommendations: []
        });
      }

    } catch (error) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        ruleDescription: rule.description,
        severity: 'error',
        status: 'failed',
        entityType: 'validation',
        entityId: 'system',
        message: `ECL formula validation failed: ${error.message}`,
        recommendations: ['Review calculation data', 'Check formula implementation']
      });
    }

    return results;
  }

  // Helper methods
  private async getApplicableRules(
    models: any,
    validationType: string,
    scope: string
  ): Promise<BusinessRule[]> {
    // Get rules from database
    const rules = await models.ValidationRule.findAll({
      where: {
        validationType,
        scope,
        isActive: true
      }
    });

    return rules.map((rule: any) => ({
      id: rule.ruleId,
      name: rule.ruleName,
      description: rule.description,
      category: rule.category,
      severity: rule.severity,
      expression: rule.expression,
      parameters: rule.parameters,
      isActive: rule.isActive
    }));
  }

  private async createValidationSummary(
    models: any,
    input: ValidationInput,
    details: ValidationDetail[]
  ): Promise<ValidationResultSummary> {
    const totalChecks = details.length;
    const passedChecks = details.filter(d => d.status === 'passed').length;
    const failedChecks = details.filter(d => d.status === 'failed').length;
    const warningChecks = details.filter(d => d.status === 'warning').length;

    let overallStatus: 'passed' | 'failed' | 'warning' = 'passed';
    if (failedChecks > 0) {
      overallStatus = 'failed';
    } else if (warningChecks > 0) {
      overallStatus = 'warning';
    }

    return {
      validationId: `validation_${Date.now()}`,
      batchId: input.calculationBatchId,
      validationType: input.validationType,
      scope: input.scope,
      totalChecks,
      passedChecks,
      failedChecks,
      warningChecks,
      overallStatus,
      validationDate: new Date(),
      details
    };
  }

  private async storeValidationResults(
    models: any,
    summary: ValidationResultSummary
  ): Promise<void> {
    try {
      // Store validation summary
      await models.ValidationResult.create({
        validationId: summary.validationId,
        calculationBatchId: summary.batchId,
        validationType: summary.validationType,
        scope: summary.scope,
        totalChecks: summary.totalChecks,
        passedChecks: summary.passedChecks,
        failedChecks: summary.failedChecks,
        warningChecks: summary.warningChecks,
        overallStatus: summary.overallStatus,
        validationDate: summary.validationDate,
        details: JSON.stringify(summary.details)
      });

    } catch (error) {
      this.logger.error('Failed to store validation results', {
        validationId: summary.validationId,
        error: error.message
      });
    }
  }

  private createEmptyValidationResult(input: ValidationInput): ValidationResultSummary {
    return {
      validationId: `validation_empty_${Date.now()}`,
      batchId: input.calculationBatchId,
      validationType: input.validationType,
      scope: input.scope,
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warningChecks: 0,
      overallStatus: 'passed',
      validationDate: new Date(),
      details: []
    };
  }

  private initializeValidationRules(): void {
    // Initialize built-in validation rules
    const builtInRules: BusinessRule[] = [
      {
        id: 'DQ001',
        name: 'Mandatory Fields Check',
        description: 'Validates that all mandatory fields are present',
        category: 'data_quality',
        severity: 'error',
        expression: 'NOT NULL AND NOT EMPTY',
        parameters: {},
        isActive: true
      },
      {
        id: 'BL001',
        name: 'Staging Logic Validation',
        description: 'Validates IFRS 9 staging classification logic',
        category: 'business_logic',
        severity: 'error',
        expression: 'STAGE IN (1,2,3)',
        parameters: {},
        isActive: true
      },
      {
        id: 'CC001',
        name: 'ECL Formula Validation',
        description: 'Validates PD × LGD × EAD = ECL formula',
        category: 'calculation_consistency',
        severity: 'error',
        expression: 'ABS(PD * LGD * EAD - ECL) < 0.01',
        parameters: { tolerance: 0.01 },
        isActive: true
      }
    ];

    builtInRules.forEach(rule => {
      this.validationRules.set(rule.id, rule);
    });
  }

  // Placeholder implementations for other validation methods
  private async checkDataTypes(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async checkValueRanges(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async checkDataConsistency(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async checkDuplicates(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async validateStagingLogic(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async validatePdReasonableness(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async validateLgdBounds(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async validateEadCalculation(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async validateEclCalculation(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async validateStageMovements(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async validatePortfolioReconciliation(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async validateCurrencyConsistency(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async executeRegulatoryComplianceRule(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
  private async executeGenericRule(models: any, input: ValidationInput, rule: BusinessRule): Promise<ValidationDetail[]> { return []; }
}
EOF

    log_success "Generated Validation Rules Service: ${file_path}"
}

# MANDATORY: Generate Calculation Audit Service
generate_calculation_audit_service() {
    log_info "Generating Calculation Audit Service..."
    
    local file_path="${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9/calculation-audit.service.ts"
    
    cat > "${file_path}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/ifrs9/calculation-audit.service.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Winston, Joi
// Purpose: IFRS 9 calculation audit trail and compliance tracking
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { CalculationAuditLog, UserSession } from '../../models/ifrs9';
import { getTenantModels } from '../../database/tenant-context';
import { ConfigurationService } from '../configuration/configuration.service';

export interface AuditLogInput {
  tenantId: string;
  userId: string;
  sessionId?: string;
  eventType: string;
  eventCategory: 'calculation' | 'configuration' | 'data_upload' | 'system' | 'user_action';
  entityType: string;
  entityId: string;
  description: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  businessDate?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditTrailQuery {
  tenantId: string;
  entityType?: string;
  entityId?: string;
  eventType?: string;
  eventCategory?: string;
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditTrailResponse {
  auditLogs: AuditLogEntry[];
  totalCount: number;
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    eventTypes: { [key: string]: number };
    eventCategories: { [key: string]: number };
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName?: string;
  sessionId?: string;
  eventType: string;
  eventCategory: string;
  entityType: string;
  entityId: string;
  description: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  businessDate?: Date;
}

export interface ComplianceReport {
  reportId: string;
  tenantId: string;
  reportType: 'audit_trail' | 'data_lineage' | 'calculation_history' | 'user_activity';
  periodStart: Date;
  periodEnd: Date;
  generatedDate: Date;
  generatedBy: string;
  summary: any;
  details: any[];
  exportFormat?: 'pdf' | 'excel' | 'csv';
}

const auditLogInputSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  sessionId: Joi.string().uuid().optional(),
  eventType: Joi.string().required(),
  eventCategory: Joi.string().valid('calculation', 'configuration', 'data_upload', 'system', 'user_action').required(),
  entityType: Joi.string().required(),
  entityId: Joi.string().required(),
  description: Joi.string().required(),
  oldValues: Joi.any().optional(),
  newValues: Joi.any().optional(),
  metadata: Joi.any().optional(),
  businessDate: Joi.date().optional(),
  ipAddress: Joi.string().ip().optional(),
  userAgent: Joi.string().optional()
});

const auditTrailQuerySchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  entityType: Joi.string().optional(),
  entityId: Joi.string().optional(),
  eventType: Joi.string().optional(),
  eventCategory: Joi.string().optional(),
  userId: Joi.string().uuid().optional(),
  fromDate: Joi.date().optional(),
  toDate: Joi.date().optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  offset: Joi.number().integer().min(0).default(0)
});

@Injectable()
export class CalculationAuditService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(CalculationAuditLog) private auditLogModel: typeof CalculationAuditLog,
    @InjectModel(UserSession) private userSessionModel: typeof UserSession,
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'CalculationAuditService' });
  }

  /**
   * Log calculation event for audit trail
   */
  async logCalculationEvent(input: AuditLogInput): Promise<void> {
    // Validate input
    const { error, value } = auditLogInputSchema.validate(input);
    if (error) {
      this.logger.error('Invalid audit log input', { error: error.message });
      return; // Don't throw error for audit logging
    }

    const validatedInput = value as AuditLogInput;

    try {
      // Get tenant models
      const models = await getTenantModels(validatedInput.tenantId);

      // Extract changes if old and new values provided
      const changes = this.extractChanges(
        validatedInput.oldValues,
        validatedInput.newValues
      );

      // Create audit log entry
      await models.CalculationAuditLog.create({
        tenantId: validatedInput.tenantId,
        userId: validatedInput.userId,
        sessionId: validatedInput.sessionId,
        correlationId: this.generateCorrelationId(),
        eventType: validatedInput.eventType,
        eventCategory: validatedInput.eventCategory,
        entityType: validatedInput.entityType,
        entityId: validatedInput.entityId,
        description: validatedInput.description,
        oldValues: validatedInput.oldValues,
        newValues: validatedInput.newValues,
        changedFields: changes.map(c => c.field),
        metadata: {
          changes,
          ...validatedInput.metadata
        },
        ipAddress: validatedInput.ipAddress,
        userAgent: validatedInput.userAgent,
        businessDate: validatedInput.businessDate,
        timestamp: new Date()
      });

      this.logger.info('Audit event logged', {
        tenantId: validatedInput.tenantId,
        eventType: validatedInput.eventType,
        entityType: validatedInput.entityType,
        entityId: validatedInput.entityId
      });

    } catch (error) {
      this.logger.error('Failed to log audit event', {
        tenantId: validatedInput.tenantId,
        eventType: validatedInput.eventType,
        error: error.message
      });
      // Don't throw error for audit logging failures
    }
  }

  /**
   * Query audit trail with filtering and pagination
   */
  async queryAuditTrail(query: AuditTrailQuery): Promise<AuditTrailResponse> {
    // Validate query
    const { error, value } = auditTrailQuerySchema.validate(query);
    if (error) {
      throw new Error(`Invalid audit trail query: ${error.message}`);
    }

    const validatedQuery = value as AuditTrailQuery;

    this.logger.info('Querying audit trail', {
      tenantId: validatedQuery.tenantId,
      entityType: validatedQuery.entityType,
      eventType: validatedQuery.eventType
    });

    try {
      // Get tenant models
      const models = await getTenantModels(validatedQuery.tenantId);

      // Build where clause
      const whereClause: any = {
        tenantId: validatedQuery.tenantId
      };

      if (validatedQuery.entityType) {
        whereClause.entityType = validatedQuery.entityType;
      }

      if (validatedQuery.entityId) {
        whereClause.entityId = validatedQuery.entityId;
      }

      if (validatedQuery.eventType) {
        whereClause.eventType = validatedQuery.eventType;
      }

      if (validatedQuery.eventCategory) {
        whereClause.eventCategory = validatedQuery.eventCategory;
      }

      if (validatedQuery.userId) {
        whereClause.userId = validatedQuery.userId;
      }

      if (validatedQuery.fromDate || validatedQuery.toDate) {
        whereClause.timestamp = {};
        if (validatedQuery.fromDate) {
          whereClause.timestamp[models.Sequelize.Op.gte] = validatedQuery.fromDate;
        }
        if (validatedQuery.toDate) {
          whereClause.timestamp[models.Sequelize.Op.lte] = validatedQuery.toDate;
        }
      }

      // Get audit logs with user information
      const auditLogs = await models.CalculationAuditLog.findAll({
        where: whereClause,
        include: [{
          model: models.User,
          as: 'User',
          attributes: ['id', 'username', 'fullName', 'email']
        }],
        order: [['timestamp', 'DESC']],
        limit: validatedQuery.limit,
        offset: validatedQuery.offset
      });

      // Get total count
      const totalCount = await models.CalculationAuditLog.count({
        where: whereClause
      });

      // Generate summary statistics
      const summary = await this.generateAuditSummary(
        models,
        whereClause
      );

      // Transform audit logs
      const auditLogEntries: AuditLogEntry[] = auditLogs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        userId: log.userId,
        userName: log.User ? `${log.User.fullName} (${log.User.username})` : 'Unknown',
        sessionId: log.sessionId,
        eventType: log.eventType,
        eventCategory: log.eventCategory,
        entityType: log.entityType,
        entityId: log.entityId,
        description: log.description,
        changes: log.metadata?.changes || [],
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        businessDate: log.businessDate
      }));

      return {
        auditLogs: auditLogEntries,
        totalCount,
        summary
      };

    } catch (error) {
      this.logger.error('Audit trail query failed', {
        tenantId: validatedQuery.tenantId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Audit trail query failed: ${error.message}`);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    tenantId: string,
    reportType: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    this.logger.info('Generating compliance report', {
      tenantId,
      reportType,
      periodStart,
      periodEnd
    });

    try {
      switch (reportType) {
        case 'audit_trail':
          return await this.generateAuditTrailReport(tenantId, periodStart, periodEnd, generatedBy);
        case 'data_lineage':
          return await this.generateDataLineageReport(tenantId, periodStart, periodEnd, generatedBy);
        case 'calculation_history':
          return await this.generateCalculationHistoryReport(tenantId, periodStart, periodEnd, generatedBy);
        case 'user_activity':
          return await this.generateUserActivityReport(tenantId, periodStart, periodEnd, generatedBy);
        default:
          throw new Error(`Unsupported report type: ${reportType}`);
      }

    } catch (error) {
      this.logger.error('Compliance report generation failed', {
        tenantId,
        reportType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(input: {
    tenantId?: string;
    userId?: string;
    sessionId?: string;
    eventType: string;
    eventCategory: string;
    description: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const auditInput: AuditLogInput = {
        tenantId: input.tenantId || 'system',
        userId: input.userId || 'system',
        sessionId: input.sessionId,
        eventType: input.eventType,
        eventCategory: input.eventCategory,
        entityType: 'security',
        entityId: 'system',
        description: input.description,
        metadata: {
          severity: input.severity || 'medium',
          ...input.metadata
        },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      };

      await this.logCalculationEvent(auditInput);

      // Log to security log as well
      this.logger.warn('Security event', {
        eventType: input.eventType,
        severity: input.severity,
        description: input.description,
        metadata: input.metadata
      });

    } catch (error) {
      this.logger.error('Failed to log security event', {
        eventType: input.eventType,
        error: error.message
      });
    }
  }

  // Private helper methods
  private extractChanges(oldValues: any, newValues: any): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    if (!oldValues || !newValues) {
      return changes;
    }

    // Compare objects and extract changed fields
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    for (const key of allKeys) {
      const oldValue = oldValues[key];
      const newValue = newValues[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue
        });
      }
    }

    return changes;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateAuditSummary(
    models: any,
    whereClause: any
  ): Promise<any> {
    try {
      // Count total events
      const totalEvents = await models.CalculationAuditLog.count({
        where: whereClause
      });

      // Count unique users
      const uniqueUsers = await models.CalculationAuditLog.count({
        where: whereClause,
        distinct: true,
        col: 'userId'
      });

      // Count by event types
      const eventTypes = await models.CalculationAuditLog.findAll({
        where: whereClause,
        attributes: [
          'eventType',
          [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'count']
        ],
        group: ['eventType']
      });

      // Count by event categories
      const eventCategories = await models.CalculationAuditLog.findAll({
        where: whereClause,
        attributes: [
          'eventCategory',
          [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'count']
        ],
        group: ['eventCategory']
      });

      return {
        totalEvents,
        uniqueUsers,
        eventTypes: eventTypes.reduce((acc: any, item: any) => {
          acc[item.eventType] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
        eventCategories: eventCategories.reduce((acc: any, item: any) => {
          acc[item.eventCategory] = parseInt(item.dataValues.count);
          return acc;
        }, {})
      };

    } catch (error) {
      this.logger.error('Failed to generate audit summary', {
        error: error.message
      });
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        eventTypes: {},
        eventCategories: {}
      };
    }
  }

  // Report generation methods (simplified implementations)
  private async generateAuditTrailReport(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    const auditTrail = await this.queryAuditTrail({
      tenantId,
      fromDate: periodStart,
      toDate: periodEnd,
      limit: 10000 // Large limit for report
    });

    return {
      reportId: `audit_trail_${Date.now()}`,
      tenantId,
      reportType: 'audit_trail',
      periodStart,
      periodEnd,
      generatedDate: new Date(),
      generatedBy,
      summary: auditTrail.summary,
      details: auditTrail.auditLogs
    };
  }

  private async generateDataLineageReport(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    // Simplified data lineage report
    return {
      reportId: `data_lineage_${Date.now()}`,
      tenantId,
      reportType: 'data_lineage',
      periodStart,
      periodEnd,
      generatedDate: new Date(),
      generatedBy,
      summary: { dataFlows: 0, transformations: 0 },
      details: []
    };
  }

  private async generateCalculationHistoryReport(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    // Simplified calculation history report
    return {
      reportId: `calc_history_${Date.now()}`,
      tenantId,
      reportType: 'calculation_history',
      periodStart,
      periodEnd,
      generatedDate: new Date(),
      generatedBy,
      summary: { calculations: 0, recalculations: 0 },
      details: []
    };
  }

  private async generateUserActivityReport(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    // Simplified user activity report
    return {
      reportId: `user_activity_${Date.now()}`,
      tenantId,
      reportType: 'user_activity',
      periodStart,
      periodEnd,
      generatedDate: new Date(),
      generatedBy,
      summary: { activeUsers: 0, totalSessions: 0 },
      details: []
    };
  }
}
EOF

    log_success "Generated Calculation Audit Service: ${file_path}"
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
    track_progress "${PHASE_ID}" "PART3_STARTED"
    
    # Generate services
    generate_result_aggregation_service
    generate_validation_rules_service
    generate_calculation_audit_service
    
    # Track completion
    track_progress "${PHASE_ID}" "PART3_COMPLETED"
    
    log_success "============================================================================"
    log_success "PSDD ${PHASE_ID} Part 3 completed successfully!"
    log_success "============================================================================"
    log_success "Generated: Result Aggregation Service, Validation Rules Service, Calculation Audit Service"
    log_success "Next step: Execute d3h2-ifrs9-basic-services-part4.sh"
    log_success "============================================================================"
}

# Execute main function
main "$@"