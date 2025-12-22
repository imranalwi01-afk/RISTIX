// packages/backend/src/core/models/ifrs9/ecl-calculation.model.ts
// ============================================================================
// IFRS9 ECL Calculation Model
// ============================================================================
// Generated: 2025-01-12
// Purpose: Database model for ECL calculation results
// Methodology: Core Platform MVP - IFRS9 Engine Completion
// ============================================================================

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  Index
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

export interface EclCalculationAttributes {
  id: string;
  calculationBatchId: string;
  portfolioAccountId: string;
  accountId: string;
  tenantId: string;
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
  status: 'completed' | 'failed' | 'pending';
  errorMessage?: string;
  parameters?: any;
  validationFlags?: any;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewComments?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'ecl_calculations',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['calculation_batch_id'] },
    { fields: ['portfolio_account_id'] },
    { fields: ['account_id'] },
    { fields: ['calculation_date'] },
    { fields: ['current_stage'] },
    { fields: ['status'] },
    { fields: ['methodology'] }
  ]
})
export class EclCalculation extends Model<EclCalculationAttributes> {
  @PrimaryKey
  @Default(UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'Reference to calculation batch'
  })
  calculationBatchId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'Reference to portfolio account'
  })
  portfolioAccountId!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Account identifier'
  })
  accountId!: string;

  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: 'Tenant identifier for multi-tenancy'
  })
  tenantId!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 3
    },
    comment: 'Current IFRS 9 stage (1, 2, or 3)'
  })
  currentStage!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 3
    },
    comment: 'Previous IFRS 9 stage for comparison'
  })
  previousStage?: number;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 1
    },
    comment: '12-month Probability of Default'
  })
  pd12Month!: number;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 1
    },
    comment: 'Lifetime Probability of Default'
  })
  pdLifetime!: number;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 1
    },
    comment: 'Loss Given Default'
  })
  lgd!: number;

  @Column({
    type: DataType.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Exposure at Default'
  })
  ead!: number;

  @Column({
    type: DataType.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '12-month Expected Credit Loss'
  })
  ecl12Month!: number;

  @Column({
    type: DataType.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Lifetime Expected Credit Loss'
  })
  eclLifetime!: number;

  @Column({
    type: DataType.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Final ECL amount (stage-dependent)'
  })
  finalEcl!: number;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Calculation execution timestamp'
  })
  calculationDate!: Date;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'collective',
    validate: {
      isIn: [['collective', 'individual', 'hybrid']]
    },
    comment: 'Calculation methodology used'
  })
  methodology!: string;

  @Index
  @Column({
    type: DataType.ENUM('completed', 'failed', 'pending'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Calculation status'
  })
  status!: 'completed' | 'failed' | 'pending';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Error message if calculation failed'
  })
  errorMessage?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Calculation parameters and intermediate results'
  })
  parameters?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Data quality and validation flags'
  })
  validationFlags?: any;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: true,
    defaultValue: 'pending',
    comment: 'Review status for audit trail'
  })
  reviewStatus?: 'pending' | 'approved' | 'rejected';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Review comments from approver'
  })
  reviewComments?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who reviewed the calculation'
  })
  reviewedBy?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Review timestamp'
  })
  reviewedAt?: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Virtual fields for business logic
  get isStageChanged(): boolean {
    return this.previousStage !== undefined && this.currentStage !== this.previousStage;
  }

  get stageMovement(): string {
    if (!this.isStageChanged) return 'no_change';
    if (this.currentStage > (this.previousStage || 1)) return 'deterioration';
    return 'improvement';
  }

  get eclType(): string {
    return this.currentStage === 1 ? '12_month' : 'lifetime';
  }

  get riskLevel(): string {
    if (this.currentStage === 3) return 'high';
    if (this.currentStage === 2) return 'medium';
    return 'low';
  }

  // Instance methods
  async approve(reviewedBy: string, comments?: string): Promise<void> {
    this.reviewStatus = 'approved';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.reviewComments = comments;
    await this.save();
  }

  async reject(reviewedBy: string, comments: string): Promise<void> {
    this.reviewStatus = 'rejected';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.reviewComments = comments;
    await this.save();
  }

  // Static methods
  static async findByBatch(calculationBatchId: string): Promise<EclCalculation[]> {
    return this.findAll({
      where: { calculationBatchId },
      order: [['accountId', 'ASC']]
    });
  }

  static async findByAccountAndDate(
    portfolioAccountId: string,
    calculationDate: Date
  ): Promise<EclCalculation | null> {
    return this.findOne({
      where: {
        portfolioAccountId,
        calculationDate
      },
      order: [['createdAt', 'DESC']]
    });
  }

  static async getSummaryByStage(calculationBatchId: string) {
    const results = await this.findAll({
      where: { calculationBatchId },
      attributes: [
        'currentStage',
        [this.sequelize!.fn('COUNT', '*'), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('final_ecl')), 'totalEcl'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('final_ecl')), 'avgEcl']
      ],
      group: ['currentStage'],
      raw: true
    });

    return results;
  }
}