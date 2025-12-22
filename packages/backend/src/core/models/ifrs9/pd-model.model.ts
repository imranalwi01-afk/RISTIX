// packages/backend/src/core/models/ifrs9/pd-model.model.ts
// ============================================================================
// IFRS9 Probability of Default (PD) Model
// ============================================================================
// Generated: 2025-01-18
// Purpose: Database model for PD statistical models and parameters
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
  Index
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

export interface PdModelAttributes {
  id: string;
  tenantId: string;
  modelName: string;
  modelVersion: string;
  modelType: 'transition_matrix' | 'logistic_regression' | 'cox_proportional' | 'machine_learning' | 'expert_judgment';
  productType: string;
  customerSegment: string;
  termStructure: '12m' | 'lifetime' | 'both';
  geography?: string;
  currency?: string;
  calibrationDate: Date;
  validationDate?: Date;
  isActive: boolean;
  isProduction: boolean;
  modelStatus: 'development' | 'validation' | 'approved' | 'production' | 'deprecated';
  description?: string;
  methodology?: string;
  assumptions?: any;
  limitations?: any;
  
  // Model Parameters
  modelParameters: any;
  coefficients?: any;
  intercept?: number;
  transitionMatrix?: any;
  ratingGrades?: any;
  timeHorizons?: number[];
  
  // Performance Metrics
  backtestingResults?: any;
  discriminatoryPower?: number; // AUC/ROC
  calibrationAccuracy?: number; // Hosmer-Lemeshow p-value
  stability?: number; // PSI (Population Stability Index)
  giniCoefficient?: number;
  ksStatistic?: number;
  rSquared?: number;
  
  // Data Requirements
  dataRequirements?: any;
  sampleSize?: number;
  observationPeriod?: string;
  defaultDefinition?: string;
  
  // Validation & Governance
  validationReport?: any;
  approvalDocuments?: any;
  reviewFrequency?: string; // monthly, quarterly, annually
  nextReviewDate?: Date;
  ownerDepartment?: string;
  modelRisk?: 'low' | 'medium' | 'high';
  
  // Usage Tracking
  lastUsed?: Date;
  usageCount?: number;
  calculationCount?: number;
  
  // Override Settings
  allowOverrides: boolean;
  overrideReasons?: any;
  
  // Metadata
  developedBy: string;
  validatedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  effectiveFrom: Date;
  effectiveTo?: Date;
  tags?: string[];
  externalModelId?: string;
  
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'pd_models',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['model_name'] },
    { fields: ['model_type'] },
    { fields: ['product_type'] },
    { fields: ['customer_segment'] },
    { fields: ['term_structure'] },
    { fields: ['is_active'] },
    { fields: ['is_production'] },
    { fields: ['model_status'] },
    { fields: ['calibration_date'] },
    { fields: ['effective_from', 'effective_to'] },
    { unique: true, fields: ['tenant_id', 'model_name', 'model_version'] }
  ]
})
export class PdModel extends Model<PdModelAttributes> {
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
    type: DataType.STRING(200),
    allowNull: false,
    comment: 'PD model name'
  })
  modelName!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: 'Model version (e.g., v1.0, v2.1)'
  })
  modelVersion!: string;

  @Index
  @Column({
    type: DataType.ENUM('transition_matrix', 'logistic_regression', 'cox_proportional', 'machine_learning', 'expert_judgment'),
    allowNull: false,
    comment: 'Type of PD model'
  })
  modelType!: 'transition_matrix' | 'logistic_regression' | 'cox_proportional' | 'machine_learning' | 'expert_judgment';

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Product type this model applies to'
  })
  productType!: string;

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Customer segment this model applies to'
  })
  customerSegment!: string;

  @Index
  @Column({
    type: DataType.ENUM('12m', 'lifetime', 'both'),
    allowNull: false,
    comment: 'Term structure of PD estimates'
  })
  termStructure!: '12m' | 'lifetime' | 'both';

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Geographic scope of the model'
  })
  geography?: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    comment: 'Currency for the model'
  })
  currency?: string;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Model calibration date'
  })
  calibrationDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Model validation date'
  })
  validationDate?: Date;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether model is currently active'
  })
  isActive!: boolean;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether model is approved for production use'
  })
  isProduction!: boolean;

  @Index
  @Column({
    type: DataType.ENUM('development', 'validation', 'approved', 'production', 'deprecated'),
    allowNull: false,
    defaultValue: 'development',
    comment: 'Current status of the model'
  })
  modelStatus!: 'development' | 'validation' | 'approved' | 'production' | 'deprecated';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Model description and purpose'
  })
  description?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Statistical methodology used'
  })
  methodology?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Model assumptions and constraints'
  })
  assumptions?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Known limitations of the model'
  })
  limitations?: any;

  // Model Parameters
  @Column({
    type: DataType.JSONB,
    allowNull: false,
    comment: 'Complete model parameters and configuration'
  })
  modelParameters!: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Regression coefficients (for parametric models)'
  })
  coefficients?: any;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: true,
    comment: 'Model intercept (for regression models)'
  })
  intercept?: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Transition matrix (for rating-based models)'
  })
  transitionMatrix?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Rating grades and default rates'
  })
  ratingGrades?: any;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: true,
    comment: 'Time horizons for PD estimation (in months)'
  })
  timeHorizons?: number[];

  // Performance Metrics
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Backtesting results and validation metrics'
  })
  backtestingResults?: any;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'Discriminatory power (AUC/ROC)'
  })
  discriminatoryPower?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'Calibration accuracy (Hosmer-Lemeshow p-value)'
  })
  calibrationAccuracy?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0 },
    comment: 'Population Stability Index (PSI)'
  })
  stability?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'Gini coefficient'
  })
  giniCoefficient?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'Kolmogorov-Smirnov statistic'
  })
  ksStatistic?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'R-squared value'
  })
  rSquared?: number;

  // Data Requirements
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Data requirements and input variables'
  })
  dataRequirements?: any;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 0 },
    comment: 'Sample size used for model development'
  })
  sampleSize?: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Observation period for model development'
  })
  observationPeriod?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Definition of default used in model'
  })
  defaultDefinition?: string;

  // Validation & Governance
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Model validation report and findings'
  })
  validationReport?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Model approval documents and sign-offs'
  })
  approvalDocuments?: any;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: 'Model review frequency'
  })
  reviewFrequency?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Next scheduled review date'
  })
  nextReviewDate?: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Department responsible for model'
  })
  ownerDepartment?: string;

  @Column({
    type: DataType.ENUM('low', 'medium', 'high'),
    allowNull: true,
    comment: 'Model risk assessment'
  })
  modelRisk?: 'low' | 'medium' | 'high';

  // Usage Tracking
  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Last time model was used'
  })
  lastUsed?: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Number of times model has been used'
  })
  usageCount?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Number of calculations performed'
  })
  calculationCount?: number;

  // Override Settings
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether manual overrides are allowed'
  })
  allowOverrides!: boolean;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Valid reasons for PD overrides'
  })
  overrideReasons?: any;

  // Metadata
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Model developer'
  })
  developedBy!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Model validator'
  })
  validatedBy?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who approved the model'
  })
  approvedBy?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Model approval timestamp'
  })
  approvedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    comment: 'Model effective start date'
  })
  effectiveFrom!: Date;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Model effective end date'
  })
  effectiveTo?: Date;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    comment: 'Tags for model categorization'
  })
  tags?: string[];

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'External model identifier'
  })
  externalModelId?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'User who created the model'
  })
  createdBy!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'User who last updated the model'
  })
  updatedBy?: string;

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

  get modelAge(): number {
    const now = new Date();
    const ageMs = now.getTime() - this.calibrationDate.getTime();
    return Math.floor(ageMs / (1000 * 60 * 60 * 24)); // Days
  }

  get isReviewRequired(): boolean {
    if (!this.nextReviewDate) return false;
    return new Date() >= this.nextReviewDate;
  }

  get performanceScore(): number {
    // Calculate overall performance score based on available metrics
    let score = 0;
    let count = 0;

    if (this.discriminatoryPower !== undefined) {
      score += this.discriminatoryPower * 100;
      count++;
    }
    if (this.giniCoefficient !== undefined) {
      score += this.giniCoefficient * 100;
      count++;
    }
    if (this.ksStatistic !== undefined) {
      score += this.ksStatistic * 100;
      count++;
    }

    return count > 0 ? score / count : 0;
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

  async promoteToProduction(approvedBy: string): Promise<void> {
    this.isProduction = true;
    this.modelStatus = 'production';
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    await this.save();
  }

  async deprecate(effectiveTo: Date): Promise<void> {
    this.modelStatus = 'deprecated';
    this.effectiveTo = effectiveTo;
    this.isActive = false;
    await this.save();
  }

  async updateUsage(): Promise<void> {
    this.lastUsed = new Date();
    this.usageCount = (this.usageCount || 0) + 1;
    await this.save();
  }

  // PD calculation methods
  calculatePd(inputs: any, timeHorizon: number = 12): number {
    if (!this.isEffective) {
      throw new Error('Model is not effective for calculations');
    }

    switch (this.modelType) {
      case 'logistic_regression':
        return this.calculateLogisticPd(inputs, timeHorizon);
      case 'transition_matrix':
        return this.calculateTransitionPd(inputs, timeHorizon);
      case 'expert_judgment':
        return this.calculateExpertPd(inputs, timeHorizon);
      default:
        throw new Error(`Unsupported model type: ${this.modelType}`);
    }
  }

  private calculateLogisticPd(inputs: any, timeHorizon: number): number {
    if (!this.coefficients || this.intercept === undefined) {
      throw new Error('Model coefficients not defined');
    }

    let logOdds = this.intercept;
    
    // Add coefficient contributions
    Object.keys(this.coefficients).forEach(variable => {
      if (inputs[variable] !== undefined) {
        logOdds += this.coefficients[variable] * inputs[variable];
      }
    });

    // Convert to probability
    const pd12m = 1 / (1 + Math.exp(-logOdds));

    // Adjust for time horizon if different from 12 months
    if (timeHorizon !== 12) {
      return 1 - Math.pow(1 - pd12m, timeHorizon / 12);
    }

    return pd12m;
  }

  private calculateTransitionPd(inputs: any, timeHorizon: number): number {
    if (!this.transitionMatrix || !inputs.rating) {
      throw new Error('Transition matrix or rating not available');
    }

    const rating = inputs.rating;
    const matrix = this.transitionMatrix;
    
    // Get default probability from transition matrix
    if (matrix[rating] && matrix[rating]['D']) {
      const pd12m = matrix[rating]['D'];
      
      // Adjust for time horizon
      if (timeHorizon !== 12) {
        return 1 - Math.pow(1 - pd12m, timeHorizon / 12);
      }
      
      return pd12m;
    }

    throw new Error(`Rating ${rating} not found in transition matrix`);
  }

  private calculateExpertPd(inputs: any, timeHorizon: number): number {
    if (!this.ratingGrades || !inputs.rating) {
      throw new Error('Rating grades or rating not available');
    }

    const rating = inputs.rating;
    const grades = this.ratingGrades;
    
    if (grades[rating] && grades[rating].defaultRate) {
      const pd12m = grades[rating].defaultRate;
      
      // Adjust for time horizon
      if (timeHorizon !== 12) {
        return 1 - Math.pow(1 - pd12m, timeHorizon / 12);
      }
      
      return pd12m;
    }

    throw new Error(`Rating ${rating} not found in rating grades`);
  }

  // Static methods
  static async findEffectiveModels(
    tenantId: string,
    productType?: string,
    customerSegment?: string,
    asOfDate?: Date
  ): Promise<PdModel[]> {
    const checkDate = asOfDate || new Date();
    const whereClause: any = {
      tenantId,
      isActive: true,
      isProduction: true,
      effectiveFrom: { [this.sequelize!.Op.lte]: checkDate },
      [this.sequelize!.Op.or]: [
        { effectiveTo: null },
        { effectiveTo: { [this.sequelize!.Op.gte]: checkDate } }
      ]
    };

    if (productType) {
      whereClause.productType = productType;
    }
    if (customerSegment) {
      whereClause.customerSegment = customerSegment;
    }

    return this.findAll({
      where: whereClause,
      order: [['modelName', 'ASC'], ['modelVersion', 'DESC']]
    });
  }

  static async findBestModel(
    tenantId: string,
    productType: string,
    customerSegment: string,
    termStructure: '12m' | 'lifetime' | 'both' = 'both'
  ): Promise<PdModel | null> {
    const models = await this.findEffectiveModels(tenantId, productType, customerSegment);
    
    // Filter by term structure
    const filteredModels = models.filter(model => 
      model.termStructure === termStructure || model.termStructure === 'both'
    );

    if (filteredModels.length === 0) return null;

    // Sort by performance score (descending)
    filteredModels.sort((a, b) => b.performanceScore - a.performanceScore);
    
    return filteredModels[0];
  }

  static async createDefaultModel(
    tenantId: string,
    productType: string,
    customerSegment: string,
    developedBy: string
  ): Promise<PdModel> {
    // Create a simple expert judgment model with default PD rates
    const defaultRates = {
      'AAA': 0.0001, 'AA': 0.0005, 'A': 0.001, 'BBB': 0.005,
      'BB': 0.015, 'B': 0.045, 'CCC': 0.15, 'D': 1.0
    };

    return this.create({
      tenantId,
      modelName: `Default PD Model - ${productType} ${customerSegment}`,
      modelVersion: 'v1.0',
      modelType: 'expert_judgment',
      productType,
      customerSegment,
      termStructure: 'both',
      calibrationDate: new Date(),
      isActive: true,
      isProduction: true,
      modelStatus: 'production',
      description: 'Default PD model based on industry benchmarks',
      methodology: 'Expert judgment using industry standard default rates',
      modelParameters: {
        type: 'rating_based',
        ratingSystem: 'internal',
        defaultRates
      },
      ratingGrades: Object.keys(defaultRates).map(rating => ({
        rating,
        defaultRate: defaultRates[rating],
        description: `${rating} grade default rate`
      })),
      dataRequirements: {
        required: ['rating'],
        optional: ['industry', 'geography', 'size']
      },
      allowOverrides: true,
      overrideReasons: ['Expert judgment', 'Recent events', 'Forward-looking information'],
      effectiveFrom: new Date(),
      developedBy,
      createdBy: developedBy
    });
  }
}