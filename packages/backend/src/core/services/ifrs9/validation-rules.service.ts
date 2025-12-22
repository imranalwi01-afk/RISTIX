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
