// packages/backend/src/core/models/ifrs9/validation-rule.model.ts
// ============================================================================
// IFRS9 Validation Rule Model
// ============================================================================
// Generated: 2025-01-18
// Purpose: Database model for IFRS 9 data validation rules
// Methodology: Core Platform MVP - IFRS9 Engine Completion
// ============================================================================

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  Index,
  HasMany
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import { ValidationResult } from './validation-result.model';

export interface ValidationRuleAttributes {
  id: string;
  tenantId: string;
  ruleName: string;
  ruleType: 'data_quality' | 'business_logic' | 'regulatory' | 'calculation' | 'consistency';
  ruleCategory: string;
  entityType: 'portfolio_account' | 'customer' | 'transaction' | 'calculation' | 'parameter';
  validationLogic: any;
  severity: 'error' | 'warning' | 'info';
  isActive: boolean;
  isBlocking: boolean;
  autoCorrect: boolean;
  correctionLogic?: any;
  description?: string;
  businessJustification?: string;
  regulatoryReference?: string;
  errorMessage: string;
  warningMessage?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  version: number;
  executionOrder: number;
  dependencies?: string[];
  conditions?: any;
  parameters?: any;
  testData?: any;
  createdBy: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'validation_rules',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['rule_type'] },
    { fields: ['rule_category'] },
    { fields: ['entity_type'] },
    { fields: ['severity'] },
    { fields: ['is_active'] },
    { fields: ['is_blocking'] },
    { fields: ['execution_order'] },
    { fields: ['effective_from', 'effective_to'] },
    { fields: ['version'] }
  ]
})
export class ValidationRule extends Model<ValidationRuleAttributes> {
  @PrimaryKey
  @Default(UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: 'Tenant identifier for multi-tenancy'
  })
  tenantId!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
    comment: 'Human-readable rule name'
  })
  ruleName!: string;

  @Index
  @Column({
    type: DataType.ENUM('data_quality', 'business_logic', 'regulatory', 'calculation', 'consistency'),
    allowNull: false,
    comment: 'Type of validation rule'
  })
  ruleType!: 'data_quality' | 'business_logic' | 'regulatory' | 'calculation' | 'consistency';

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Rule category for grouping'
  })
  ruleCategory!: string;

  @Index
  @Column({
    type: DataType.ENUM('portfolio_account', 'customer', 'transaction', 'calculation', 'parameter'),
    allowNull: false,
    comment: 'Entity type this rule validates'
  })
  entityType!: 'portfolio_account' | 'customer' | 'transaction' | 'calculation' | 'parameter';

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    comment: 'Validation logic definition (JSON schema)'
  })
  validationLogic!: any;

  @Index
  @Column({
    type: DataType.ENUM('error', 'warning', 'info'),
    allowNull: false,
    defaultValue: 'error',
    comment: 'Severity level of validation failure'
  })
  severity!: 'error' | 'warning' | 'info';

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether rule is currently active'
  })
  isActive!: boolean;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether rule failure blocks processing'
  })
  isBlocking!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether rule can auto-correct issues'
  })
  autoCorrect!: boolean;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Auto-correction logic (if applicable)'
  })
  correctionLogic?: any;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Detailed rule description'
  })
  description?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Business justification for the rule'
  })
  businessJustification?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Regulatory reference or standard'
  })
  regulatoryReference?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Error message for validation failure'
  })
  errorMessage!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Warning message for soft validation'
  })
  warningMessage?: string;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    comment: 'Rule effective start date'
  })
  effectiveFrom!: Date;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Rule effective end date'
  })
  effectiveTo?: Date;

  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Rule version for change tracking'
  })
  version!: number;

  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 100,
    comment: 'Execution order for rule processing'
  })
  executionOrder!: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    comment: 'Rule dependencies (other rule IDs)'
  })
  dependencies?: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Conditions for rule execution'
  })
  conditions?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Rule parameters and configuration'
  })
  parameters?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Test data for rule validation'
  })
  testData?: any;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'User who created the rule'
  })
  createdBy!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who last updated the rule'
  })
  updatedBy?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who approved the rule'
  })
  approvedBy?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Rule approval timestamp'
  })
  approvedAt?: Date;

  @HasMany(() => ValidationResult)
  validationResults!: ValidationResult[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Virtual fields
  get isExpired(): boolean {
    if (!this.effectiveTo) return false;
    return new Date() > this.effectiveTo;
  }

  get isEffective(): boolean {
    const now = new Date();
    const effectiveFromCheck = now >= this.effectiveFrom;
    const effectiveToCheck = !this.effectiveTo || now <= this.effectiveTo;
    return this.isActive && effectiveFromCheck && effectiveToCheck;
  }

  get ruleIdentifier(): string {
    return `${this.ruleType}_${this.ruleCategory}_${this.ruleName}`.replace(/\s+/g, '_').toUpperCase();
  }

  // Instance methods
  async activate(): Promise<void> {
    this.isActive = true;
    await this.save();
  }

  async deactivate(): Promise<void> {
    this.isActive = false;
    await this.save();
  }

  async approve(approvedBy: string): Promise<void> {
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.isActive = true;
    await this.save();
  }

  // Validation execution method
  validateEntity(entity: any): { isValid: boolean; errors: string[]; warnings: string[]; correctedData?: any } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let correctedData: any = null;

    try {
      // Check conditions first
      if (this.conditions && !this.evaluateConditions(entity, this.conditions)) {
        return { isValid: true, errors: [], warnings: [] };
      }

      // Execute validation logic
      const validationResult = this.executeValidationLogic(entity, this.validationLogic);

      if (!validationResult.isValid) {
        if (this.severity === 'error') {
          errors.push(this.errorMessage);
        } else if (this.severity === 'warning' && this.warningMessage) {
          warnings.push(this.warningMessage);
        }

        // Attempt auto-correction if enabled
        if (this.autoCorrect && this.correctionLogic) {
          correctedData = this.executeCorrection(entity, this.correctionLogic);
        }
      }

      return {
        isValid: validationResult.isValid,
        errors,
        warnings,
        correctedData
      };
    } catch (error) {
      errors.push(`Validation rule execution failed: ${error.message}`);
      return { isValid: false, errors, warnings };
    }
  }

  private evaluateConditions(entity: any, conditions: any): boolean {
    // Simple condition evaluation - can be enhanced
    if (conditions.field && conditions.operator && conditions.value !== undefined) {
      const fieldValue = this.getNestedValue(entity, conditions.field);
      
      switch (conditions.operator) {
        case 'equals':
          return fieldValue === conditions.value;
        case 'not_equals':
          return fieldValue !== conditions.value;
        case 'greater_than':
          return fieldValue > conditions.value;
        case 'less_than':
          return fieldValue < conditions.value;
        case 'contains':
          return fieldValue && fieldValue.toString().includes(conditions.value);
        case 'is_null':
          return fieldValue === null || fieldValue === undefined;
        case 'is_not_null':
          return fieldValue !== null && fieldValue !== undefined;
        default:
          return true;
      }
    }
    return true;
  }

  private executeValidationLogic(entity: any, logic: any): { isValid: boolean; details?: any } {
    // Basic validation logic execution
    if (logic.type === 'field_validation') {
      const fieldValue = this.getNestedValue(entity, logic.field);
      
      if (logic.required && (fieldValue === null || fieldValue === undefined || fieldValue === '')) {
        return { isValid: false, details: { reason: 'required_field_missing' } };
      }

      if (logic.dataType && !this.validateDataType(fieldValue, logic.dataType)) {
        return { isValid: false, details: { reason: 'invalid_data_type' } };
      }

      if (logic.range && !this.validateRange(fieldValue, logic.range)) {
        return { isValid: false, details: { reason: 'value_out_of_range' } };
      }

      if (logic.pattern && !this.validatePattern(fieldValue, logic.pattern)) {
        return { isValid: false, details: { reason: 'pattern_mismatch' } };
      }
    }

    if (logic.type === 'business_rule') {
      return this.executeBusinessRule(entity, logic);
    }

    if (logic.type === 'calculation_check') {
      return this.executeCalculationCheck(entity, logic);
    }

    return { isValid: true };
  }

  private executeCorrection(entity: any, correctionLogic: any): any {
    const correctedEntity = { ...entity };
    
    if (correctionLogic.type === 'default_value') {
      this.setNestedValue(correctedEntity, correctionLogic.field, correctionLogic.defaultValue);
    }

    if (correctionLogic.type === 'transform') {
      const currentValue = this.getNestedValue(correctedEntity, correctionLogic.field);
      const transformedValue = this.applyTransformation(currentValue, correctionLogic.transformation);
      this.setNestedValue(correctedEntity, correctionLogic.field, transformedValue);
    }

    return correctedEntity;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private validateDataType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      default:
        return true;
    }
  }

  private validateRange(value: any, range: { min?: number; max?: number }): boolean {
    if (typeof value !== 'number') return true;
    if (range.min !== undefined && value < range.min) return false;
    if (range.max !== undefined && value > range.max) return false;
    return true;
  }

  private validatePattern(value: any, pattern: string): boolean {
    if (typeof value !== 'string') return true;
    return new RegExp(pattern).test(value);
  }

  private executeBusinessRule(entity: any, logic: any): { isValid: boolean; details?: any } {
    // Implement specific business rule logic
    return { isValid: true };
  }

  private executeCalculationCheck(entity: any, logic: any): { isValid: boolean; details?: any } {
    // Implement calculation validation logic
    return { isValid: true };
  }

  private applyTransformation(value: any, transformation: any): any {
    switch (transformation.type) {
      case 'uppercase':
        return value?.toString().toUpperCase();
      case 'lowercase':
        return value?.toString().toLowerCase();
      case 'trim':
        return value?.toString().trim();
      case 'round':
        return Math.round(value * Math.pow(10, transformation.decimals || 2)) / Math.pow(10, transformation.decimals || 2);
      default:
        return value;
    }
  }

  // Static methods
  static async findEffectiveRules(
    tenantId: string,
    entityType: string,
    ruleType?: string,
    asOfDate?: Date
  ): Promise<ValidationRule[]> {
    const checkDate = asOfDate || new Date();
    const whereClause: any = {
      tenantId,
      entityType,
      isActive: true,
      effectiveFrom: { [this.sequelize!.Op.lte]: checkDate },
      [this.sequelize!.Op.or]: [
        { effectiveTo: null },
        { effectiveTo: { [this.sequelize!.Op.gte]: checkDate } }
      ]
    };

    if (ruleType) {
      whereClause.ruleType = ruleType;
    }

    return this.findAll({
      where: whereClause,
      order: [['executionOrder', 'ASC'], ['ruleCategory', 'ASC'], ['ruleName', 'ASC']]
    });
  }

  static async createDefaultRules(tenantId: string, createdBy: string): Promise<ValidationRule[]> {
    const defaultRules = [
      {
        ruleName: 'Portfolio Account ID Required',
        ruleType: 'data_quality' as const,
        ruleCategory: 'required_fields',
        entityType: 'portfolio_account' as const,
        validationLogic: {
          type: 'field_validation',
          field: 'accountId',
          required: true
        },
        severity: 'error' as const,
        isBlocking: true,
        errorMessage: 'Portfolio account ID is required',
        executionOrder: 10
      },
      {
        ruleName: 'Outstanding Amount Positive',
        ruleType: 'business_logic' as const,
        ruleCategory: 'amount_validation',
        entityType: 'portfolio_account' as const,
        validationLogic: {
          type: 'field_validation',
          field: 'outstandingAmount',
          dataType: 'number',
          range: { min: 0 }
        },
        severity: 'error' as const,
        isBlocking: true,
        errorMessage: 'Outstanding amount must be positive',
        executionOrder: 20
      },
      {
        ruleName: 'IFRS 9 Stage Valid',
        ruleType: 'regulatory' as const,
        ruleCategory: 'ifrs9_compliance',
        entityType: 'portfolio_account' as const,
        validationLogic: {
          type: 'field_validation',
          field: 'currentStage',
          dataType: 'number',
          range: { min: 1, max: 3 }
        },
        severity: 'error' as const,
        isBlocking: true,
        errorMessage: 'IFRS 9 stage must be 1, 2, or 3',
        regulatoryReference: 'IFRS 9 - Classification and Measurement',
        executionOrder: 30
      }
    ];

    const rules = [];
    for (const ruleData of defaultRules) {
      const rule = await this.create({
        tenantId,
        ...ruleData,
        effectiveFrom: new Date(),
        isActive: true,
        version: 1,
        createdBy
      });
      rules.push(rule);
    }

    return rules;
  }
}