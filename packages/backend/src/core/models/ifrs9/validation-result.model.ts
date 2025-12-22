// packages/backend/src/core/models/ifrs9/validation-result.model.ts
// ============================================================================
// IFRS9 Validation Result Model
// ============================================================================
// Generated: 2025-01-18
// Purpose: Database model for IFRS 9 validation results
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
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import { ValidationRule } from './validation-rule.model';

export interface ValidationResultAttributes {
  id: string;
  tenantId: string;
  validationRuleId: string;
  entityType: 'portfolio_account' | 'customer' | 'transaction' | 'calculation' | 'parameter';
  entityId: string;
  batchId?: string;
  executionDate: Date;
  validationStatus: 'passed' | 'failed' | 'warning' | 'skipped' | 'error';
  isBlocking: boolean;
  errorMessage?: string;
  warningMessage?: string;
  actualValue?: any;
  expectedValue?: any;
  correctedValue?: any;
  autoCorrectApplied: boolean;
  validationDetails?: any;
  executionTimeMs: number;
  retryCount: number;
  resolvedFlag: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionComments?: string;
  businessImpact?: 'low' | 'medium' | 'high' | 'critical';
  reviewRequired: boolean;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewComments?: string;
  metadata?: any;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'validation_results',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['validation_rule_id'] },
    { fields: ['entity_type'] },
    { fields: ['entity_id'] },
    { fields: ['batch_id'] },
    { fields: ['execution_date'] },
    { fields: ['validation_status'] },
    { fields: ['is_blocking'] },
    { fields: ['resolved_flag'] },
    { fields: ['review_required'] },
    { fields: ['business_impact'] },
    { unique: false, fields: ['tenant_id', 'entity_id', 'validation_rule_id', 'execution_date'] }
  ]
})
export class ValidationResult extends Model<ValidationResultAttributes> {
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

  @ForeignKey(() => ValidationRule)
  @Index
  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'Reference to validation rule'
  })
  validationRuleId!: string;

  @BelongsTo(() => ValidationRule)
  validationRule!: ValidationRule;

  @Index
  @Column({
    type: DataType.ENUM('portfolio_account', 'customer', 'transaction', 'calculation', 'parameter'),
    allowNull: false,
    comment: 'Type of entity being validated'
  })
  entityType!: 'portfolio_account' | 'customer' | 'transaction' | 'calculation' | 'parameter';

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Identifier of the entity being validated'
  })
  entityId!: string;

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Batch identifier for grouped validations'
  })
  batchId?: string;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'When the validation was executed'
  })
  executionDate!: Date;

  @Index
  @Column({
    type: DataType.ENUM('passed', 'failed', 'warning', 'skipped', 'error'),
    allowNull: false,
    comment: 'Result of the validation'
  })
  validationStatus!: 'passed' | 'failed' | 'warning' | 'skipped' | 'error';

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this validation failure blocks processing'
  })
  isBlocking!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Error message if validation failed'
  })
  errorMessage?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Warning message if validation has warnings'
  })
  warningMessage?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Actual value that was validated'
  })
  actualValue?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Expected value according to rule'
  })
  expectedValue?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Auto-corrected value if correction was applied'
  })
  correctedValue?: any;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether auto-correction was applied'
  })
  autoCorrectApplied!: boolean;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Additional validation details and context'
  })
  validationDetails?: any;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
    comment: 'Execution time in milliseconds'
  })
  executionTimeMs!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
    comment: 'Number of retry attempts'
  })
  retryCount!: number;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the validation issue has been resolved'
  })
  resolvedFlag!: boolean;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who resolved the validation issue'
  })
  resolvedBy?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'When the validation issue was resolved'
  })
  resolvedAt?: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Comments on how the issue was resolved'
  })
  resolutionComments?: string;

  @Index
  @Column({
    type: DataType.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: true,
    comment: 'Business impact level of the validation failure'
  })
  businessImpact?: 'low' | 'medium' | 'high' | 'critical';

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this result requires manual review'
  })
  reviewRequired!: boolean;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: true,
    comment: 'Review status for validation results requiring review'
  })
  reviewStatus?: 'pending' | 'approved' | 'rejected';

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who reviewed the validation result'
  })
  reviewedBy?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'When the validation result was reviewed'
  })
  reviewedAt?: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Review comments'
  })
  reviewComments?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Additional metadata and context'
  })
  metadata?: any;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'User who created the validation result'
  })
  createdBy!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Virtual fields
  get isPassed(): boolean {
    return this.validationStatus === 'passed';
  }

  get isFailed(): boolean {
    return this.validationStatus === 'failed';
  }

  get hasWarnings(): boolean {
    return this.validationStatus === 'warning';
  }

  get isError(): boolean {
    return this.validationStatus === 'error';
  }

  get requiresAttention(): boolean {
    return this.isFailed || this.isError || (this.hasWarnings && this.businessImpact === 'critical');
  }

  get ageInDays(): number {
    const now = new Date();
    const diff = now.getTime() - this.executionDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  get statusLabel(): string {
    switch (this.validationStatus) {
      case 'passed':
        return 'Passed';
      case 'failed':
        return 'Failed';
      case 'warning':
        return 'Warning';
      case 'skipped':
        return 'Skipped';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  }

  get impactLabel(): string {
    switch (this.businessImpact) {
      case 'low':
        return 'Low Impact';
      case 'medium':
        return 'Medium Impact';
      case 'high':
        return 'High Impact';
      case 'critical':
        return 'Critical Impact';
      default:
        return 'Unknown Impact';
    }
  }

  // Instance methods
  async resolve(resolvedBy: string, comments?: string): Promise<void> {
    this.resolvedFlag = true;
    this.resolvedBy = resolvedBy;
    this.resolvedAt = new Date();
    this.resolutionComments = comments;
    await this.save();
  }

  async unresolve(): Promise<void> {
    this.resolvedFlag = false;
    this.resolvedBy = undefined;
    this.resolvedAt = undefined;
    this.resolutionComments = undefined;
    await this.save();
  }

  async approve(reviewedBy: string, comments?: string): Promise<void> {
    this.reviewStatus = 'approved';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.reviewComments = comments;
    this.resolvedFlag = true;
    this.resolvedBy = reviewedBy;
    this.resolvedAt = new Date();
    await this.save();
  }

  async reject(reviewedBy: string, comments: string): Promise<void> {
    this.reviewStatus = 'rejected';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.reviewComments = comments;
    await this.save();
  }

  async retry(): Promise<void> {
    this.retryCount += 1;
    await this.save();
  }

  // Static methods
  static async findByEntity(
    entityType: string,
    entityId: string,
    tenantId?: string
  ): Promise<ValidationResult[]> {
    const whereClause: any = { entityType, entityId };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    return this.findAll({
      where: whereClause,
      include: [{ model: ValidationRule }],
      order: [['executionDate', 'DESC']]
    });
  }

  static async findByBatch(batchId: string): Promise<ValidationResult[]> {
    return this.findAll({
      where: { batchId },
      include: [{ model: ValidationRule }],
      order: [['entityId', 'ASC'], ['executionDate', 'ASC']]
    });
  }

  static async findFailures(
    tenantId: string,
    fromDate?: Date,
    toDate?: Date,
    entityType?: string
  ): Promise<ValidationResult[]> {
    const whereClause: any = {
      tenantId,
      validationStatus: ['failed', 'error']
    };

    if (fromDate) {
      whereClause.executionDate = { [this.sequelize!.Op.gte]: fromDate };
    }
    if (toDate) {
      if (whereClause.executionDate) {
        whereClause.executionDate[this.sequelize!.Op.lte] = toDate;
      } else {
        whereClause.executionDate = { [this.sequelize!.Op.lte]: toDate };
      }
    }
    if (entityType) {
      whereClause.entityType = entityType;
    }

    return this.findAll({
      where: whereClause,
      include: [{ model: ValidationRule }],
      order: [['executionDate', 'DESC']]
    });
  }

  static async findUnresolved(
    tenantId: string,
    businessImpact?: string[]
  ): Promise<ValidationResult[]> {
    const whereClause: any = {
      tenantId,
      resolvedFlag: false,
      validationStatus: ['failed', 'error', 'warning']
    };

    if (businessImpact && businessImpact.length > 0) {
      whereClause.businessImpact = businessImpact;
    }

    return this.findAll({
      where: whereClause,
      include: [{ model: ValidationRule }],
      order: [['businessImpact', 'DESC'], ['executionDate', 'ASC']]
    });
  }

  static async findPendingReview(tenantId: string): Promise<ValidationResult[]> {
    return this.findAll({
      where: {
        tenantId,
        reviewRequired: true,
        reviewStatus: 'pending'
      },
      include: [{ model: ValidationRule }],
      order: [['businessImpact', 'DESC'], ['executionDate', 'ASC']]
    });
  }

  static async getValidationSummary(
    tenantId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any> {
    return this.findAll({
      where: {
        tenantId,
        executionDate: {
          [this.sequelize!.Op.between]: [fromDate, toDate]
        }
      },
      attributes: [
        'validationStatus',
        'entityType',
        'businessImpact',
        [this.sequelize!.fn('COUNT', '*'), 'count'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('execution_time_ms')), 'avgExecutionTime']
      ],
      group: ['validationStatus', 'entityType', 'businessImpact'],
      raw: true
    });
  }

  static async createValidationResult(
    tenantId: string,
    validationRuleId: string,
    entityType: string,
    entityId: string,
    status: 'passed' | 'failed' | 'warning' | 'skipped' | 'error',
    executionTimeMs: number,
    createdBy: string,
    options?: {
      batchId?: string;
      errorMessage?: string;
      warningMessage?: string;
      actualValue?: any;
      expectedValue?: any;
      correctedValue?: any;
      autoCorrectApplied?: boolean;
      validationDetails?: any;
      businessImpact?: 'low' | 'medium' | 'high' | 'critical';
      reviewRequired?: boolean;
      metadata?: any;
    }
  ): Promise<ValidationResult> {
    return this.create({
      tenantId,
      validationRuleId,
      entityType,
      entityId,
      executionDate: new Date(),
      validationStatus: status,
      isBlocking: false, // Will be set based on validation rule
      executionTimeMs,
      retryCount: 0,
      resolvedFlag: status === 'passed',
      autoCorrectApplied: options?.autoCorrectApplied || false,
      reviewRequired: options?.reviewRequired || false,
      createdBy,
      ...options
    });
  }
}