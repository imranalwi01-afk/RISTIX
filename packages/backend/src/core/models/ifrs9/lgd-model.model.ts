// packages/backend/src/core/models/ifrs9/lgd-model.model.ts
// ============================================================================
// IFRS9 Loss Given Default (LGD) Model
// ============================================================================
// Generated: 2025-01-18
// Purpose: Database model for LGD statistical models and parameters
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

export interface LgdModelAttributes {
  id: string;
  tenantId: string;
  modelName: string;
  modelVersion: string;
  modelType: 'historical_average' | 'regression' | 'workout_lgd' | 'market_lgd' | 'hybrid';
  productType: string;
  customerSegment: string;
  collateralType?: string;
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
  historicalLgd?: number;
  downturnLgd?: number;
  collateralHaircuts?: any;
  recoveryRates?: any;
  cureRates?: any;
  
  // Time to Resolution
  workoutPeriod?: number; // months
  discountRate?: number;
  costOfRecovery?: number;
  
  // Performance Metrics
  backtestingResults?: any;
  predictiveAccuracy?: number;
  meanAbsoluteError?: number;
  rootMeanSquareError?: number;
  rSquared?: number;
  correlationCoeff?: number;
  
  // Data Requirements
  dataRequirements?: any;
  sampleSize?: number;
  observationPeriod?: string;
  defaultDefinition?: string;
  recoveryDefinition?: string;
  
  // Validation & Governance
  validationReport?: any;
  approvalDocuments?: any;
  reviewFrequency?: string;
  nextReviewDate?: Date;
  ownerDepartment?: string;
  modelRisk?: 'low' | 'medium' | 'high';
  
  // Stress Testing
  stressTestResults?: any;
  economicScenarios?: any;
  sensitivityAnalysis?: any;
  
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
  tableName: 'lgd_models',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['model_name'] },
    { fields: ['model_type'] },
    { fields: ['product_type'] },
    { fields: ['customer_segment'] },
    { fields: ['collateral_type'] },
    { fields: ['is_active'] },
    { fields: ['is_production'] },
    { fields: ['model_status'] },
    { fields: ['calibration_date'] },
    { fields: ['effective_from', 'effective_to'] },
    { unique: true, fields: ['tenant_id', 'model_name', 'model_version'] }
  ]
})
export class LgdModel extends Model<LgdModelAttributes> {
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
    comment: 'LGD model name'
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
    type: DataType.ENUM('historical_average', 'regression', 'workout_lgd', 'market_lgd', 'hybrid'),
    allowNull: false,
    comment: 'Type of LGD model'
  })
  modelType!: 'historical_average' | 'regression' | 'workout_lgd' | 'market_lgd' | 'hybrid';

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
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Collateral type this model applies to'
  })
  collateralType?: string;

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
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'Historical average LGD'
  })
  historicalLgd?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'Downturn LGD for stress scenarios'
  })
  downturnLgd?: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Collateral haircuts by type and condition'
  })
  collateralHaircuts?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Recovery rates by collateral type and seniority'
  })
  recoveryRates?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Cure rates for different workout strategies'
  })
  cureRates?: any;

  // Time to Resolution
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 0 },
    comment: 'Average workout period in months'
  })
  workoutPeriod?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0 },
    comment: 'Discount rate for present value calculations'
  })
  discountRate?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'Cost of recovery as percentage of exposure'
  })
  costOfRecovery?: number;

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
    comment: 'Predictive accuracy of the model'
  })
  predictiveAccuracy?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0 },
    comment: 'Mean Absolute Error (MAE)'
  })
  meanAbsoluteError?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0 },
    comment: 'Root Mean Square Error (RMSE)'
  })
  rootMeanSquareError?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: 0, max: 1 },
    comment: 'R-squared value'
  })
  rSquared?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: true,
    validate: { min: -1, max: 1 },
    comment: 'Correlation coefficient'
  })
  correlationCoeff?: number;

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

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Definition of recovery used in model'
  })
  recoveryDefinition?: string;

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

  // Stress Testing
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Stress testing results'
  })
  stressTestResults?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Economic scenarios for stress testing'
  })
  economicScenarios?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Sensitivity analysis results'
  })
  sensitivityAnalysis?: any;

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
    comment: 'Valid reasons for LGD overrides'
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

    if (this.predictiveAccuracy !== undefined) {
      score += this.predictiveAccuracy * 100;
      count++;
    }
    if (this.rSquared !== undefined) {
      score += this.rSquared * 100;
      count++;
    }
    if (this.correlationCoeff !== undefined) {
      score += Math.abs(this.correlationCoeff) * 100;
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

  async updateUsage(): Promise<void> {
    this.lastUsed = new Date();
    this.usageCount = (this.usageCount || 0) + 1;
    await this.save();
  }

  // LGD calculation methods
  calculateLgd(inputs: any, isDownturn: boolean = false): number {
    if (!this.isEffective) {
      throw new Error('Model is not effective for calculations');
    }

    if (isDownturn && this.downturnLgd !== undefined) {
      return this.downturnLgd;
    }

    switch (this.modelType) {
      case 'historical_average':
        return this.calculateHistoricalLgd(inputs);
      case 'regression':
        return this.calculateRegressionLgd(inputs);
      case 'workout_lgd':
        return this.calculateWorkoutLgd(inputs);
      case 'market_lgd':
        return this.calculateMarketLgd(inputs);
      case 'hybrid':
        return this.calculateHybridLgd(inputs);
      default:
        throw new Error(`Unsupported model type: ${this.modelType}`);
    }
  }

  private calculateHistoricalLgd(inputs: any): number {
    if (this.historicalLgd === undefined) {
      throw new Error('Historical LGD not defined');
    }

    // Apply collateral adjustments if available
    let lgd = this.historicalLgd;
    
    if (inputs.collateralType && this.collateralHaircuts) {
      const haircut = this.collateralHaircuts[inputs.collateralType];
      if (haircut !== undefined) {
        const collateralCoverage = inputs.collateralValue / inputs.exposure;
        const effectiveCoverage = collateralCoverage * (1 - haircut);
        lgd = Math.max(0, Math.min(1, lgd - effectiveCoverage));
      }
    }

    return lgd;
  }

  private calculateRegressionLgd(inputs: any): number {
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

    // Convert to LGD (using logistic transformation)
    return Math.max(0, Math.min(1, 1 / (1 + Math.exp(-logOdds))));
  }

  private calculateWorkoutLgd(inputs: any): number {
    if (!this.recoveryRates || !inputs.collateralType) {
      return this.historicalLgd || 0.45; // Default LGD
    }

    const recoveryRate = this.recoveryRates[inputs.collateralType] || 0.55;
    let lgd = 1 - recoveryRate;

    // Apply workout costs and time value of money
    if (this.costOfRecovery) {
      lgd += this.costOfRecovery;
    }

    if (this.discountRate && this.workoutPeriod) {
      const discountFactor = Math.pow(1 + this.discountRate / 12, -this.workoutPeriod);
      lgd = 1 - (1 - lgd) * discountFactor;
    }

    return Math.max(0, Math.min(1, lgd));
  }

  private calculateMarketLgd(inputs: any): number {
    // Simplified market-based LGD calculation
    // In practice, this would use market prices and credit spreads
    const baseLgd = this.historicalLgd || 0.45;
    
    // Apply market stress factor if available
    const marketStress = inputs.marketStressFactor || 1.0;
    
    return Math.max(0, Math.min(1, baseLgd * marketStress));
  }

  private calculateHybridLgd(inputs: any): number {
    // Combine multiple approaches
    const historical = this.calculateHistoricalLgd(inputs);
    const regression = this.coefficients ? this.calculateRegressionLgd(inputs) : historical;
    
    // Weight the approaches (could be parameterized)
    const historicalWeight = 0.4;
    const regressionWeight = 0.6;
    
    return historicalWeight * historical + regressionWeight * regression;
  }

  // Static methods
  static async findEffectiveModels(
    tenantId: string,
    productType?: string,
    customerSegment?: string,
    collateralType?: string,
    asOfDate?: Date
  ): Promise<LgdModel[]> {
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
    if (collateralType) {
      whereClause.collateralType = collateralType;
    }

    return this.findAll({
      where: whereClause,
      order: [['modelName', 'ASC'], ['modelVersion', 'DESC']]
    });
  }

  static async createDefaultModel(
    tenantId: string,
    productType: string,
    customerSegment: string,
    developedBy: string
  ): Promise<LgdModel> {
    // Create a simple historical average model with default LGD rates
    const defaultLgdRates = {
      'MORTGAGE': 0.20,
      'PERSONAL_LOAN': 0.75,
      'CREDIT_CARD': 0.85,
      'CORPORATE_LOAN': 0.45,
      'SME_LOAN': 0.55,
      'AUTO_LOAN': 0.25
    };

    const baseLgd = defaultLgdRates[productType] || 0.45;

    return this.create({
      tenantId,
      modelName: `Default LGD Model - ${productType} ${customerSegment}`,
      modelVersion: 'v1.0',
      modelType: 'historical_average',
      productType,
      customerSegment,
      calibrationDate: new Date(),
      isActive: true,
      isProduction: true,
      modelStatus: 'production',
      description: 'Default LGD model based on industry benchmarks',
      methodology: 'Historical average with collateral adjustments',
      historicalLgd: baseLgd,
      downturnLgd: Math.min(1, baseLgd * 1.5), // Stressed LGD
      modelParameters: {
        type: 'historical_average',
        baseLgd,
        downturnMultiplier: 1.5
      },
      collateralHaircuts: {
        'REAL_ESTATE': 0.15,
        'VEHICLE': 0.25,
        'CASH': 0.05,
        'SECURITIES': 0.20,
        'INVENTORY': 0.40,
        'ACCOUNTS_RECEIVABLE': 0.30
      },
      workoutPeriod: 24,
      discountRate: 0.05,
      costOfRecovery: 0.05,
      dataRequirements: {
        required: ['exposure', 'collateralType', 'collateralValue'],
        optional: ['seniority', 'industry', 'geography']
      },
      allowOverrides: true,
      overrideReasons: ['Updated collateral valuation', 'Workout strategy change', 'Market conditions'],
      effectiveFrom: new Date(),
      developedBy,
      createdBy: developedBy
    });
  }
}