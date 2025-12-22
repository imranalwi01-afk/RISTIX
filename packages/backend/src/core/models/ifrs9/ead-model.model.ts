// packages/backend/src/core/models/ifrs9/ead-model.model.ts
// ============================================================================
// IFRS9 Exposure at Default (EAD) Model
// ============================================================================
// Generated: 2025-01-18
// Purpose: Database model for EAD statistical models and CCF parameters
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

export interface EadModelAttributes {
  id: string;
  tenantId: string;
  modelName: string;
  modelVersion: string;
  modelType: 'ccf_based' | 'regression' | 'cohort_analysis' | 'simulation' | 'expert_judgment';
  productType: string;
  customerSegment: string;
  facilityType?: string;
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
  ccfParameters?: any; // Credit Conversion Factors
  utilizationFactors?: any;
  seasonalityFactors?: any;
  
  // Time Horizon and Dynamics
  timeHorizon?: number; // months for EAD projection
  dynamicModeling?: boolean;
  stressFactors?: any;
  
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
  utilizationDefinition?: string;
  
  // Validation & Governance
  validationReport?: any;
  approvalDocuments?: any;
  reviewFrequency?: string;
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

// CCF Parameter Interface
export interface CcfParameterAttributes {
  id: string;
  tenantId: string;
  eadModelId: string;
  productType: string;
  facilityType: string;
  ratingGrade?: string;
  timeToDefault?: number; // months
  ccfValue: number; // Credit Conversion Factor (0-1)
  utilizationBand?: string; // e.g., "0-25%", "25-50%", etc.
  description?: string;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'ead_models',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['model_name'] },
    { fields: ['model_type'] },
    { fields: ['product_type'] },
    { fields: ['customer_segment'] },
    { fields: ['facility_type'] },
    { fields: ['is_active'] },
    { fields: ['is_production'] },
    { fields: ['model_status'] },
    { fields: ['calibration_date'] },
    { fields: ['effective_from', 'effective_to'] },
    { unique: true, fields: ['tenant_id', 'model_name', 'model_version'] }
  ]
})
export class EadModel extends Model<EadModelAttributes> {
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
    comment: 'EAD model name'
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
    type: DataType.ENUM('ccf_based', 'regression', 'cohort_analysis', 'simulation', 'expert_judgment'),
    allowNull: false,
    comment: 'Type of EAD model'
  })
  modelType!: 'ccf_based' | 'regression' | 'cohort_analysis' | 'simulation' | 'expert_judgment';

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
    comment: 'Facility type this model applies to'
  })
  facilityType?: string;

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
    comment: 'Credit Conversion Factor parameters'
  })
  ccfParameters?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Utilization factors by product and rating'
  })
  utilizationFactors?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Seasonality adjustment factors'
  })
  seasonalityFactors?: any;

  // Time Horizon and Dynamics
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 12,
    validate: { min: 1, max: 120 },
    comment: 'Time horizon for EAD projection in months'
  })
  timeHorizon?: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Whether to use dynamic modeling for EAD evolution'
  })
  dynamicModeling?: boolean;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Stress factors for downturn EAD calculations'
  })
  stressFactors?: any;

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
    comment: 'Definition of utilization used in model'
  })
  utilizationDefinition?: string;

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
    comment: 'Valid reasons for EAD overrides'
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

  // EAD calculation methods
  calculateEad(inputs: any, timeHorizon?: number): number {
    if (!this.isEffective) {
      throw new Error('Model is not effective for calculations');
    }

    const horizon = timeHorizon || this.timeHorizon || 12;

    switch (this.modelType) {
      case 'ccf_based':
        return this.calculateCcfEad(inputs, horizon);
      case 'regression':
        return this.calculateRegressionEad(inputs, horizon);
      case 'expert_judgment':
        return this.calculateExpertEad(inputs, horizon);
      case 'simulation':
        return this.calculateSimulationEad(inputs, horizon);
      default:
        throw new Error(`Unsupported model type: ${this.modelType}`);
    }
  }

  private calculateCcfEad(inputs: any, timeHorizon: number): number {
    const currentExposure = inputs.currentExposure || 0;
    const undrawnCommitment = inputs.undrawnCommitment || 0;
    
    if (undrawnCommitment === 0) {
      return currentExposure;
    }

    // Get CCF from parameters
    let ccf = 0;
    if (this.ccfParameters) {
      const productCcf = this.ccfParameters[inputs.productType];
      if (productCcf) {
        if (inputs.rating && productCcf.byRating) {
          ccf = productCcf.byRating[inputs.rating] || productCcf.default || 0.75;
        } else {
          ccf = productCcf.default || 0.75;
        }
      }
    }

    // Apply time horizon adjustment
    if (timeHorizon !== 12) {
      ccf = ccf * Math.sqrt(timeHorizon / 12);
    }

    // Apply utilization factors if available
    if (this.utilizationFactors && inputs.currentUtilization) {
      const utilizationBand = this.getUtilizationBand(inputs.currentUtilization);
      const utilizationFactor = this.utilizationFactors[utilizationBand] || 1.0;
      ccf = ccf * utilizationFactor;
    }

    const eadFromUndrawn = undrawnCommitment * ccf;
    return currentExposure + eadFromUndrawn;
  }

  private calculateRegressionEad(inputs: any, timeHorizon: number): number {
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

    // Convert to utilization rate
    const utilizationRate = 1 / (1 + Math.exp(-logOdds));
    
    const currentExposure = inputs.currentExposure || 0;
    const totalCommitment = inputs.totalCommitment || currentExposure;
    
    return Math.min(totalCommitment, currentExposure + (totalCommitment - currentExposure) * utilizationRate);
  }

  private calculateExpertEad(inputs: any, timeHorizon: number): number {
    const currentExposure = inputs.currentExposure || 0;
    const undrawnCommitment = inputs.undrawnCommitment || 0;
    
    // Use default CCF based on product type
    const defaultCcf = this.getDefaultCcf(inputs.productType);
    
    return currentExposure + (undrawnCommitment * defaultCcf);
  }

  private calculateSimulationEad(inputs: any, timeHorizon: number): number {
    // Simplified simulation - would be more complex in practice
    const currentExposure = inputs.currentExposure || 0;
    const totalCommitment = inputs.totalCommitment || currentExposure;
    
    // Use Monte Carlo simulation parameters if available
    const simulationParams = this.modelParameters.simulation || {};
    const meanUtilization = simulationParams.meanUtilization || 0.3;
    const volatility = simulationParams.volatility || 0.2;
    
    // Simple approximation of expected utilization
    const expectedUtilization = Math.min(1, meanUtilization + volatility * Math.sqrt(timeHorizon / 12));
    
    return Math.min(totalCommitment, currentExposure + (totalCommitment - currentExposure) * expectedUtilization);
  }

  private getUtilizationBand(utilization: number): string {
    if (utilization <= 0.25) return '0-25%';
    if (utilization <= 0.50) return '25-50%';
    if (utilization <= 0.75) return '50-75%';
    return '75-100%';
  }

  private getDefaultCcf(productType: string): number {
    const defaultCcfs = {
      'CREDIT_CARD': 0.75,
      'LINE_OF_CREDIT': 0.50,
      'CORPORATE_LOAN': 0.40,
      'SME_LOAN': 0.60,
      'OVERDRAFT': 0.90,
      'TRADE_FINANCE': 0.20
    };
    
    return defaultCcfs[productType] || 0.50;
  }

  // Static methods
  static async findEffectiveModels(
    tenantId: string,
    productType?: string,
    customerSegment?: string,
    facilityType?: string,
    asOfDate?: Date
  ): Promise<EadModel[]> {
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
    if (facilityType) {
      whereClause.facilityType = facilityType;
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
  ): Promise<EadModel> {
    // Create a simple CCF-based model with default CCF values
    const defaultCcfs = {
      'CREDIT_CARD': { default: 0.75, byRating: { 'A': 0.70, 'B': 0.75, 'C': 0.80 } },
      'LINE_OF_CREDIT': { default: 0.50, byRating: { 'A': 0.40, 'B': 0.50, 'C': 0.60 } },
      'CORPORATE_LOAN': { default: 0.40, byRating: { 'A': 0.30, 'B': 0.40, 'C': 0.50 } },
      'SME_LOAN': { default: 0.60, byRating: { 'A': 0.50, 'B': 0.60, 'C': 0.70 } },
      'OVERDRAFT': { default: 0.90, byRating: { 'A': 0.85, 'B': 0.90, 'C': 0.95 } }
    };

    const ccfParams = defaultCcfs[productType] || { default: 0.50 };

    return this.create({
      tenantId,
      modelName: `Default EAD Model - ${productType} ${customerSegment}`,
      modelVersion: 'v1.0',
      modelType: 'ccf_based',
      productType,
      customerSegment,
      calibrationDate: new Date(),
      isActive: true,
      isProduction: true,
      modelStatus: 'production',
      description: 'Default EAD model based on regulatory CCF guidelines',
      methodology: 'Credit Conversion Factor approach with rating adjustments',
      timeHorizon: 12,
      dynamicModeling: false,
      modelParameters: {
        type: 'ccf_based',
        ccfParameters: { [productType]: ccfParams },
        defaultCcf: ccfParams.default
      },
      ccfParameters: { [productType]: ccfParams },
      utilizationFactors: {
        '0-25%': 1.2,
        '25-50%': 1.1,
        '50-75%': 1.0,
        '75-100%': 0.8
      },
      dataRequirements: {
        required: ['currentExposure', 'totalCommitment', 'undrawnCommitment'],
        optional: ['rating', 'currentUtilization', 'facilityType']
      },
      allowOverrides: true,
      overrideReasons: ['Credit limit change', 'Facility restructuring', 'Stress scenario'],
      effectiveFrom: new Date(),
      developedBy,
      createdBy: developedBy
    });
  }
}

// CCF Parameter Model
@Table({
  tableName: 'ccf_parameters',
  schema: 'ifrs9',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['ead_model_id'] },
    { fields: ['product_type'] },
    { fields: ['facility_type'] },
    { fields: ['rating_grade'] },
    { fields: ['is_active'] },
    { fields: ['effective_from', 'effective_to'] }
  ]
})
export class CcfParameter extends Model<CcfParameterAttributes> {
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
    comment: 'Reference to EAD model'
  })
  eadModelId!: string;

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Product type'
  })
  productType!: string;

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Facility type'
  })
  facilityType!: string;

  @Index
  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    comment: 'Rating grade (optional)'
  })
  ratingGrade?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Time to default in months (optional)'
  })
  timeToDefault?: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: false,
    validate: { min: 0, max: 1 },
    comment: 'Credit Conversion Factor (0-1)'
  })
  ccfValue!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: 'Utilization band (e.g., 0-25%, 25-50%)'
  })
  utilizationBand?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Parameter description'
  })
  description?: string;

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

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'User who created the parameter'
  })
  createdBy!: string;

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

  // Static methods
  static async findEffectiveParameters(
    tenantId: string,
    eadModelId: string,
    productType?: string,
    facilityType?: string,
    asOfDate?: Date
  ): Promise<CcfParameter[]> {
    const checkDate = asOfDate || new Date();
    const whereClause: any = {
      tenantId,
      eadModelId,
      isActive: true,
      effectiveFrom: { [this.sequelize!.Op.lte]: checkDate },
      [this.sequelize!.Op.or]: [
        { effectiveTo: null },
        { effectiveTo: { [this.sequelize!.Op.gte]: checkDate } }
      ]
    };

    if (productType) {
      whereClause.productType = productType;
    }
    if (facilityType) {
      whereClause.facilityType = facilityType;
    }

    return this.findAll({
      where: whereClause,
      order: [['productType', 'ASC'], ['facilityType', 'ASC'], ['ratingGrade', 'ASC']]
    });
  }
}