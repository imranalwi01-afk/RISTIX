// packages/backend/src/core/models/ifrs9/credit-risk-event.model.ts
// ============================================================================
// IFRS9 Credit Risk Event Model
// ============================================================================
// Generated: 2025-01-18
// Purpose: Database model for credit risk events and triggers
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

export interface CreditRiskEventAttributes {
  id: string;
  tenantId: string;
  portfolioAccountId: string;
  accountId: string;
  eventType: 'payment_missed' | 'pd_increase' | 'forbearance' | 'restructuring' | 'default' | 'recovery' | 'write_off' | 'manual_override';
  eventSubtype?: string;
  eventDate: Date;
  reportingDate: Date;
  stageBefore: number;
  stageAfter: number;
  pdBefore?: number;
  pdAfter?: number;
  lgdBefore?: number;
  lgdAfter?: number;
  eadBefore?: number;
  eadAfter?: number;
  eclBefore?: number;
  eclAfter?: number;
  daysPassDueBefore?: number;
  daysPassDueAfter?: number;
  eventDescription?: string;
  eventMetadata?: any;
  triggerReason: string;
  automaticFlag: boolean;
  reviewRequired: boolean;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewComments?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reversalFlag: boolean;
  reversalReason?: string;
  reversedBy?: string;
  reversedAt?: Date;
  originalEventId?: string;
  batchId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'credit_risk_events',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['portfolio_account_id'] },
    { fields: ['account_id'] },
    { fields: ['event_type'] },
    { fields: ['event_date'] },
    { fields: ['reporting_date'] },
    { fields: ['stage_before', 'stage_after'] },
    { fields: ['automatic_flag'] },
    { fields: ['review_required'] },
    { fields: ['reversal_flag'] },
    { fields: ['batch_id'] }
  ]
})
export class CreditRiskEvent extends Model<CreditRiskEventAttributes> {
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

  @Index
  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'Reference to portfolio account'
  })
  portfolioAccountId!: string;

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Account identifier'
  })
  accountId!: string;

  @Index
  @Column({
    type: DataType.ENUM('payment_missed', 'pd_increase', 'forbearance', 'restructuring', 'default', 'recovery', 'write_off', 'manual_override'),
    allowNull: false,
    comment: 'Type of credit risk event'
  })
  eventType!: 'payment_missed' | 'pd_increase' | 'forbearance' | 'restructuring' | 'default' | 'recovery' | 'write_off' | 'manual_override';

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Event subtype for detailed classification'
  })
  eventSubtype?: string;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Date when the event occurred'
  })
  eventDate!: Date;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Reporting date for the event'
  })
  reportingDate!: Date;

  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 3 },
    comment: 'IFRS 9 stage before the event'
  })
  stageBefore!: number;

  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 3 },
    comment: 'IFRS 9 stage after the event'
  })
  stageAfter!: number;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'PD before the event'
  })
  pdBefore?: number;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'PD after the event'
  })
  pdAfter?: number;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'LGD before the event'
  })
  lgdBefore?: number;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'LGD after the event'
  })
  lgdAfter?: number;

  @Column({
    type: DataType.DECIMAL(18, 2),
    allowNull: true,
    validate: { min: 0 },
    comment: 'EAD before the event'
  })
  eadBefore?: number;

  @Column({
    type: DataType.DECIMAL(18, 2),
    allowNull: true,
    validate: { min: 0 },
    comment: 'EAD after the event'
  })
  eadAfter?: number;

  @Column({
    type: DataType.DECIMAL(18, 2),
    allowNull: true,
    comment: 'ECL before the event'
  })
  eclBefore?: number;

  @Column({
    type: DataType.DECIMAL(18, 2),
    allowNull: true,
    comment: 'ECL after the event'
  })
  eclAfter?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 0 },
    comment: 'Days past due before the event'
  })
  daysPassDueBefore?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 0 },
    comment: 'Days past due after the event'
  })
  daysPassDueAfter?: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Description of the credit risk event'
  })
  eventDescription?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Additional event metadata and parameters'
  })
  eventMetadata?: any;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Reason that triggered this event'
  })
  triggerReason!: string;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether event was automatically triggered'
  })
  automaticFlag!: boolean;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether event requires manual review'
  })
  reviewRequired!: boolean;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: true,
    defaultValue: 'pending',
    comment: 'Review status for manual events'
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
    comment: 'User who reviewed the event'
  })
  reviewedBy?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Review timestamp'
  })
  reviewedAt?: Date;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this event has been reversed'
  })
  reversalFlag!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Reason for event reversal'
  })
  reversalReason?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who reversed the event'
  })
  reversedBy?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Reversal timestamp'
  })
  reversedAt?: Date;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'Reference to original event for reversals'
  })
  originalEventId?: string;

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Batch identifier for bulk events'
  })
  batchId?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'User who created the event'
  })
  createdBy!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Virtual fields
  get isStageChanged(): boolean {
    return this.stageBefore !== this.stageAfter;
  }

  get stageMovement(): 'deterioration' | 'improvement' | 'no_change' {
    if (!this.isStageChanged) return 'no_change';
    return this.stageAfter > this.stageBefore ? 'deterioration' : 'improvement';
  }

  get pdChange(): number | null {
    if (this.pdBefore === undefined || this.pdAfter === undefined) return null;
    return this.pdAfter - this.pdBefore;
  }

  get eclImpact(): number | null {
    if (this.eclBefore === undefined || this.eclAfter === undefined) return null;
    return this.eclAfter - this.eclBefore;
  }

  get isSignificantEvent(): boolean {
    return this.isStageChanged || (this.eclImpact !== null && Math.abs(this.eclImpact) > 1000);
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

  async reverse(reversedBy: string, reason: string): Promise<CreditRiskEvent> {
    // Mark this event as reversed
    this.reversalFlag = true;
    this.reversedBy = reversedBy;
    this.reversedAt = new Date();
    this.reversalReason = reason;
    await this.save();

    // Create reversal event
    return CreditRiskEvent.create({
      tenantId: this.tenantId,
      portfolioAccountId: this.portfolioAccountId,
      accountId: this.accountId,
      eventType: 'manual_override',
      eventSubtype: 'reversal',
      eventDate: new Date(),
      reportingDate: new Date(),
      stageBefore: this.stageAfter,
      stageAfter: this.stageBefore,
      pdBefore: this.pdAfter,
      pdAfter: this.pdBefore,
      lgdBefore: this.lgdAfter,
      lgdAfter: this.lgdBefore,
      eadBefore: this.eadAfter,
      eadAfter: this.eadBefore,
      eclBefore: this.eclAfter,
      eclAfter: this.eclBefore,
      daysPassDueBefore: this.daysPassDueAfter,
      daysPassDueAfter: this.daysPassDueBefore,
      eventDescription: `Reversal of event: ${this.eventDescription}`,
      triggerReason: `Manual reversal: ${reason}`,
      automaticFlag: false,
      reviewRequired: false,
      reviewStatus: 'approved',
      originalEventId: this.id,
      createdBy: reversedBy
    });
  }

  // Static methods
  static async findByAccount(
    portfolioAccountId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<CreditRiskEvent[]> {
    const whereClause: any = { portfolioAccountId };
    
    if (fromDate) {
      whereClause.eventDate = { [this.sequelize!.Op.gte]: fromDate };
    }
    if (toDate) {
      if (whereClause.eventDate) {
        whereClause.eventDate[this.sequelize!.Op.lte] = toDate;
      } else {
        whereClause.eventDate = { [this.sequelize!.Op.lte]: toDate };
      }
    }

    return this.findAll({
      where: whereClause,
      order: [['eventDate', 'ASC'], ['createdAt', 'ASC']]
    });
  }

  static async findByBatch(batchId: string): Promise<CreditRiskEvent[]> {
    return this.findAll({
      where: { batchId },
      order: [['accountId', 'ASC'], ['eventDate', 'ASC']]
    });
  }

  static async findPendingReviews(tenantId: string): Promise<CreditRiskEvent[]> {
    return this.findAll({
      where: {
        tenantId,
        reviewRequired: true,
        reviewStatus: 'pending'
      },
      order: [['eventDate', 'ASC']]
    });
  }

  static async getEventSummary(
    tenantId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any> {
    return this.findAll({
      where: {
        tenantId,
        eventDate: {
          [this.sequelize!.Op.between]: [fromDate, toDate]
        }
      },
      attributes: [
        'eventType',
        'stageMovement',
        [this.sequelize!.fn('COUNT', '*'), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('ecl_after')), 'totalEclAfter'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('ecl_before')), 'totalEclBefore']
      ],
      group: ['eventType', 'stageMovement'],
      raw: true
    });
  }

  static async createPaymentMissedEvent(
    portfolioAccountId: string,
    accountId: string,
    tenantId: string,
    eventDate: Date,
    daysPassDueAfter: number,
    createdBy: string,
    batchId?: string
  ): Promise<CreditRiskEvent> {
    return this.create({
      tenantId,
      portfolioAccountId,
      accountId,
      eventType: 'payment_missed',
      eventDate,
      reportingDate: new Date(),
      stageBefore: 1, // Will be updated by staging logic
      stageAfter: 1,   // Will be updated by staging logic
      daysPassDueAfter,
      eventDescription: `Payment missed, DPD: ${daysPassDueAfter}`,
      triggerReason: 'Automatic payment monitoring',
      automaticFlag: true,
      reviewRequired: daysPassDueAfter >= 90, // Stage 3 requires review
      batchId,
      createdBy
    });
  }
}