// packages/backend/src/core/models/ifrs9/staging-parameter.model.ts
// ============================================================================
// IFRS9 Staging Parameter Model
// ============================================================================
// Generated: 2025-01-18
// Purpose: Database model for IFRS 9 staging classification parameters
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

export interface StagingParameterAttributes {
  id: string;
  tenantId: string;
  productType: string;
  customerSegment: string;
  criteriaType: 'dpd' | 'sicr_pd' | 'sicr_qualitative' | 'forbearance' | 'manual';
  stage1Threshold?: number;
  stage2Threshold?: number;
  stage3Threshold?: number;
  pdMultiplier?: number;
  lookbackPeriod?: number;
  qualitativeCriteria?: any;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  version: number;
  description?: string;
  businessRules?: any;
  validationRules?: any;
  createdBy: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'staging_parameters',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['product_type'] },
    { fields: ['customer_segment'] },
    { fields: ['criteria_type'] },
    { fields: ['effective_from', 'effective_to'] },
    { fields: ['is_active'] },
    { fields: ['version'] }
  ]
})
export class StagingParameter extends Model<StagingParameterAttributes> {
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
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Product type for staging rules'
  })
  productType!: string;

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Customer segment for staging rules'
  })
  customerSegment!: string;

  @Index
  @Column({
    type: DataType.ENUM('dpd', 'sicr_pd', 'sicr_qualitative', 'forbearance', 'manual'),
    allowNull: false,
    comment: 'Type of staging criteria'
  })
  criteriaType!: 'dpd' | 'sicr_pd' | 'sicr_qualitative' | 'forbearance' | 'manual';

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 0 },
    comment: 'Threshold for Stage 1 classification'
  })
  stage1Threshold?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 0 },
    comment: 'Threshold for Stage 2 classification'
  })
  stage2Threshold?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 0 },
    comment: 'Threshold for Stage 3 classification'
  })
  stage3Threshold?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 1 },
    comment: 'PD multiplier for SICR assessment'
  })
  pdMultiplier?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 12,
    validate: { min: 1, max: 60 },
    comment: 'Lookback period in months for SICR assessment'
  })
  lookbackPeriod?: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Qualitative criteria for staging assessment'
  })
  qualitativeCriteria?: any;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether parameter is currently active'
  })
  isActive!: boolean;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    comment: 'Parameter effective start date'
  })
  effectiveFrom!: Date;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Parameter effective end date'
  })
  effectiveTo?: Date;

  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Parameter version for change tracking'
  })
  version!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Human-readable parameter description'
  })
  description?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Business rules and logic'
  })
  businessRules?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Validation rules and constraints'
  })
  validationRules?: any;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'User who created the parameter'
  })
  createdBy!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who last updated the parameter'
  })
  updatedBy?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who approved the parameter'
  })
  approvedBy?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Parameter approval timestamp'
  })
  approvedAt?: Date;

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

  // Instance methods
  async expire(effectiveTo: Date): Promise<void> {
    this.effectiveTo = effectiveTo;
    await this.save();
  }

  async approve(approvedBy: string): Promise<void> {
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.isActive = true;
    await this.save();
  }

  // Staging logic methods
  determineStage(daysPassDue: number, currentPd: number, originationPd: number): number {
    // Stage 3: Credit impaired
    if (this.criteriaType === 'dpd' && this.stage3Threshold && daysPassDue >= this.stage3Threshold) {
      return 3;
    }

    // Stage 2: Significant increase in credit risk
    if (this.criteriaType === 'dpd' && this.stage2Threshold && daysPassDue >= this.stage2Threshold) {
      return 2;
    }

    // SICR assessment based on PD multiple
    if (this.criteriaType === 'sicr_pd' && this.pdMultiplier && originationPd > 0) {
      const pdIncrease = currentPd / originationPd;
      if (pdIncrease >= this.pdMultiplier) {
        return 2;
      }
    }

    // Default to Stage 1
    return 1;
  }

  // Static methods
  static async findEffectiveParameters(
    tenantId: string,
    productType: string,
    customerSegment: string,
    asOfDate?: Date
  ): Promise<StagingParameter[]> {
    const checkDate = asOfDate || new Date();
    
    return this.findAll({
      where: {
        tenantId,
        productType,
        customerSegment,
        isActive: true,
        effectiveFrom: {
          [this.sequelize!.Op.lte]: checkDate
        },
        [this.sequelize!.Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [this.sequelize!.Op.gte]: checkDate } }
        ]
      },
      order: [['criteriaType', 'ASC'], ['version', 'DESC']]
    });
  }

  static async findDefaultParameters(
    tenantId: string,
    asOfDate?: Date
  ): Promise<StagingParameter[]> {
    const checkDate = asOfDate || new Date();
    
    return this.findAll({
      where: {
        tenantId,
        isActive: true,
        effectiveFrom: {
          [this.sequelize!.Op.lte]: checkDate
        },
        [this.sequelize!.Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [this.sequelize!.Op.gte]: checkDate } }
        ]
      },
      order: [['productType', 'ASC'], ['customerSegment', 'ASC'], ['criteriaType', 'ASC']]
    });
  }

  // Default parameter creation
  static async createDefaultParameters(tenantId: string, createdBy: string): Promise<StagingParameter[]> {
    const defaultParams = [
      {
        productType: 'MORTGAGE',
        customerSegment: 'RETAIL',
        criteriaType: 'dpd' as const,
        stage1Threshold: 0,
        stage2Threshold: 30,
        stage3Threshold: 90,
        description: 'DPD-based staging for retail mortgages'
      },
      {
        productType: 'PERSONAL_LOAN',
        customerSegment: 'RETAIL',
        criteriaType: 'dpd' as const,
        stage1Threshold: 0,
        stage2Threshold: 30,
        stage3Threshold: 90,
        description: 'DPD-based staging for personal loans'
      },
      {
        productType: 'CORPORATE_LOAN',
        customerSegment: 'CORPORATE',
        criteriaType: 'sicr_pd' as const,
        pdMultiplier: 2.0,
        lookbackPeriod: 12,
        description: 'PD-based SICR assessment for corporate loans'
      }
    ];

    const parameters = [];
    for (const param of defaultParams) {
      const parameter = await this.create({
        tenantId,
        productType: param.productType,
        customerSegment: param.customerSegment,
        criteriaType: param.criteriaType,
        stage1Threshold: param.stage1Threshold,
        stage2Threshold: param.stage2Threshold,
        stage3Threshold: param.stage3Threshold,
        pdMultiplier: param.pdMultiplier,
        lookbackPeriod: param.lookbackPeriod,
        description: param.description,
        effectiveFrom: new Date(),
        isActive: true,
        version: 1,
        createdBy
      });
      parameters.push(parameter);
    }

    return parameters;
  }
}