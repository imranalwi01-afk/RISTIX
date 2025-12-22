// packages/backend/src/core/models/ifrs9/ecl-parameter.model.ts
// ============================================================================
// IFRS9 ECL Parameter Model
// ============================================================================
// Generated: 2025-01-12
// Purpose: Database model for ECL calculation parameters
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
  Unique
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

export interface EclParameterAttributes {
  id: string;
  tenantId: string;
  parameterType: 'staging' | 'pd_model' | 'lgd_model' | 'ead_model' | 'general';
  parameterCategory: string;
  parameterKey: string;
  parameterValue: any;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'date';
  description?: string;
  validationRules?: any;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  version: number;
  createdBy: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'ecl_parameters',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['parameter_type'] },
    { fields: ['parameter_category'] },
    { fields: ['parameter_key'] },
    { fields: ['effective_from', 'effective_to'] },
    { fields: ['is_active'] },
    { fields: ['version'] }
  ]
})
export class EclParameter extends Model<EclParameterAttributes> {
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
    type: DataType.ENUM('staging', 'pd_model', 'lgd_model', 'ead_model', 'general'),
    allowNull: false,
    comment: 'Type of IFRS 9 parameter'
  })
  parameterType!: 'staging' | 'pd_model' | 'lgd_model' | 'ead_model' | 'general';

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Parameter category for grouping'
  })
  parameterCategory!: string;

  @Index
  @Unique('unique_tenant_parameter')
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Unique parameter identifier'
  })
  parameterKey!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    comment: 'Parameter value (flexible JSON storage)'
  })
  parameterValue!: any;

  @Column({
    type: DataType.ENUM('string', 'number', 'boolean', 'json', 'date'),
    allowNull: false,
    defaultValue: 'string',
    comment: 'Data type for validation'
  })
  dataType!: 'string' | 'number' | 'boolean' | 'json' | 'date';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Human-readable parameter description'
  })
  description?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Validation rules and constraints'
  })
  validationRules?: any;

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
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether parameter is currently active'
  })
  isActive!: boolean;

  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Parameter version for change tracking'
  })
  version!: number;

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

  get typedValue(): any {
    switch (this.dataType) {
      case 'number':
        return typeof this.parameterValue === 'number' ? this.parameterValue : parseFloat(this.parameterValue);
      case 'boolean':
        return typeof this.parameterValue === 'boolean' ? this.parameterValue : Boolean(this.parameterValue);
      case 'date':
        return new Date(this.parameterValue);
      case 'json':
        return typeof this.parameterValue === 'object' ? this.parameterValue : JSON.parse(this.parameterValue);
      case 'string':
      default:
        return String(this.parameterValue);
    }
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

  async createNewVersion(
    newValue: any,
    updatedBy: string,
    effectiveFrom?: Date
  ): Promise<EclParameter> {
    // Expire current version
    await this.expire(effectiveFrom ? new Date(effectiveFrom.getTime() - 1) : new Date());

    // Create new version
    return EclParameter.create({
      tenantId: this.tenantId,
      parameterType: this.parameterType,
      parameterCategory: this.parameterCategory,
      parameterKey: this.parameterKey,
      parameterValue: newValue,
      dataType: this.dataType,
      description: this.description,
      validationRules: this.validationRules,
      effectiveFrom: effectiveFrom || new Date(),
      isActive: true,
      version: this.version + 1,
      createdBy: updatedBy
    });
  }

  // Static methods
  static async findEffectiveParameter(
    tenantId: string,
    parameterKey: string,
    asOfDate?: Date
  ): Promise<EclParameter | null> {
    const checkDate = asOfDate || new Date();
    
    return this.findOne({
      where: {
        tenantId,
        parameterKey,
        isActive: true,
        effectiveFrom: {
          [this.sequelize!.Op.lte]: checkDate
        },
        [this.sequelize!.Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [this.sequelize!.Op.gte]: checkDate } }
        ]
      },
      order: [['version', 'DESC']]
    });
  }

  static async findParametersByType(
    tenantId: string,
    parameterType: string,
    asOfDate?: Date
  ): Promise<EclParameter[]> {
    const checkDate = asOfDate || new Date();
    
    return this.findAll({
      where: {
        tenantId,
        parameterType,
        isActive: true,
        effectiveFrom: {
          [this.sequelize!.Op.lte]: checkDate
        },
        [this.sequelize!.Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [this.sequelize!.Op.gte]: checkDate } }
        ]
      },
      order: [['parameterCategory', 'ASC'], ['parameterKey', 'ASC']]
    });
  }

  static async findParametersByCategory(
    tenantId: string,
    parameterCategory: string,
    asOfDate?: Date
  ): Promise<EclParameter[]> {
    const checkDate = asOfDate || new Date();
    
    return this.findAll({
      where: {
        tenantId,
        parameterCategory,
        isActive: true,
        effectiveFrom: {
          [this.sequelize!.Op.lte]: checkDate
        },
        [this.sequelize!.Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [this.sequelize!.Op.gte]: checkDate } }
        ]
      },
      order: [['parameterKey', 'ASC']]
    });
  }

  static async getParameterHistory(
    tenantId: string,
    parameterKey: string
  ): Promise<EclParameter[]> {
    return this.findAll({
      where: {
        tenantId,
        parameterKey
      },
      order: [['version', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  // Default parameter creation helpers
  static async createStagingParameters(tenantId: string, createdBy: string): Promise<EclParameter[]> {
    const stagingParams = [
      {
        parameterKey: 'stage2_dpd_threshold',
        parameterValue: 30,
        dataType: 'number' as const,
        parameterCategory: 'dpd_thresholds',
        description: 'Days past due threshold for Stage 2 classification'
      },
      {
        parameterKey: 'stage3_dpd_threshold',
        parameterValue: 90,
        dataType: 'number' as const,
        parameterCategory: 'dpd_thresholds',
        description: 'Days past due threshold for Stage 3 classification'
      },
      {
        parameterKey: 'sicr_pd_multiple',
        parameterValue: 2.0,
        dataType: 'number' as const,
        parameterCategory: 'sicr_criteria',
        description: 'PD multiple threshold for significant increase in credit risk'
      }
    ];

    const parameters = [];
    for (const param of stagingParams) {
      const parameter = await this.create({
        tenantId,
        parameterType: 'staging',
        parameterCategory: param.parameterCategory,
        parameterKey: param.parameterKey,
        parameterValue: param.parameterValue,
        dataType: param.dataType,
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