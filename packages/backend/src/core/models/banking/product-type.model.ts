// packages/backend/src/core/models/banking/product-type.model.ts
// ============================================================================
// Product Type Model for IFRS9 Multi-Tenant Platform
// ============================================================================
// Purpose: Product configuration for ECL calculations and banking operations
// Dependencies: Sequelize, multi-tenant architecture
// Banking Support: Conventional + Syariah (Islamic) banking products
// ============================================================================

import { DataTypes, Model, Optional } from 'sequelize';
import { Table, Column, Model as SequelizeModel, PrimaryKey, AutoIncrement, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';

export interface ProductTypeAttributes {
  id: string;
  legacy_id?: number; // Migration compatibility with FRS9PRO
  
  // Product identification
  product_code: string;
  product_name: string;
  product_group: string;
  product_category: 'credit' | 'deposit' | 'investment' | 'trade_finance' | 'treasury' | 'guarantee';
  
  // Product classification
  product_sub_category?: string;
  asset_class: 'loans' | 'securities' | 'derivatives' | 'off_balance_sheet' | 'other';
  risk_weight: number; // Basel risk weight percentage
  
  // Banking type support
  banking_type: 'conventional' | 'syariah' | 'dual';
  syariah_contract_type?: string; // Murabaha, Musharaka, etc.
  syariah_compliance_required: boolean;
  aaoifi_category?: string; // AAOIFI classification
  
  // Financial characteristics
  interest_bearing: boolean;
  profit_sharing: boolean; // For Islamic products
  collateral_required: boolean;
  guarantee_required: boolean;
  
  // Tenor and pricing
  min_tenor_months?: number;
  max_tenor_months?: number;
  min_amount?: number;
  max_amount?: number;
  base_rate?: number;
  margin_rate?: number;
  
  // IFRS9 specific attributes
  stage_1_threshold_days: number; // Days past due for Stage 1
  stage_2_threshold_days: number; // Days past due for Stage 2
  stage_3_threshold_days: number; // Days past due for Stage 3
  
  // PD model configuration
  pd_model_type?: 'statistical' | 'external_rating' | 'internal_model' | 'simplified';
  pd_base_rate?: number;
  pd_adjustment_factors?: any; // JSON for adjustment parameters
  
  // LGD model configuration
  lgd_model_type?: 'historical' | 'regulatory' | 'advanced';
  lgd_base_rate?: number;
  lgd_downturn_adjustment?: number;
  recovery_period_months?: number;
  
  // EAD model configuration
  ead_model_type?: 'current_exposure' | 'committed_facility' | 'ccf_based';
  credit_conversion_factor?: number; // CCF for off-balance sheet
  drawdown_factor?: number;
  
  // ECL calculation parameters
  discount_rate?: number;
  cure_rate?: number; // Probability of curing from default
  forward_looking_periods?: number; // Months for forward-looking scenarios
  
  // Regulatory and compliance
  regulatory_category?: string;
  basel_category?: string;
  ifrs9_scope: boolean;
  stress_testing_applicable: boolean;
  
  // Operational attributes
  auto_approval_limit?: number;
  manual_review_required: boolean;
  documentation_required?: string[]; // JSON array
  
  // Status and lifecycle
  product_status: 'active' | 'inactive' | 'discontinued' | 'suspended';
  is_active: boolean;
  launch_date?: Date;
  discontinuation_date?: Date;
  
  // Fee structure
  processing_fee?: number;
  annual_fee?: number;
  penalty_rate?: number;
  early_settlement_fee?: number;
  
  // Channel availability
  branch_available: boolean;
  online_available: boolean;
  mobile_available: boolean;
  agent_available: boolean;
  
  // Target market
  target_customer_types?: string[]; // JSON array
  target_segments?: string[]; // JSON array
  geographic_restrictions?: string[]; // JSON array
  
  // Audit information
  created_by: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  
  // Additional metadata
  metadata?: any; // JSON field for additional product-specific data
}

export interface ProductTypeCreationAttributes 
  extends Optional<ProductTypeAttributes, 
    'id' | 'legacy_id' | 'product_sub_category' | 'syariah_contract_type' | 
    'aaoifi_category' | 'min_tenor_months' | 'max_tenor_months' | 'min_amount' | 
    'max_amount' | 'base_rate' | 'margin_rate' | 'pd_model_type' | 'pd_base_rate' | 
    'pd_adjustment_factors' | 'lgd_model_type' | 'lgd_base_rate' | 'lgd_downturn_adjustment' | 
    'recovery_period_months' | 'ead_model_type' | 'credit_conversion_factor' | 
    'drawdown_factor' | 'discount_rate' | 'cure_rate' | 'forward_looking_periods' | 
    'regulatory_category' | 'basel_category' | 'auto_approval_limit' | 'documentation_required' | 
    'launch_date' | 'discontinuation_date' | 'processing_fee' | 'annual_fee' | 
    'penalty_rate' | 'early_settlement_fee' | 'target_customer_types' | 'target_segments' | 
    'geographic_restrictions' | 'updated_by' | 'created_at' | 'updated_at' | 'metadata'> {}

@Table({
  tableName: 'product_types',
  schema: 'core',
  timestamps: true,
  underscored: true,
  paranoid: true, // Soft delete support
  indexes: [
    {
      name: 'idx_product_types_product_code',
      fields: ['product_code'],
      unique: true
    },
    {
      name: 'idx_product_types_category',
      fields: ['product_category', 'product_group']
    },
    {
      name: 'idx_product_types_banking_type',
      fields: ['banking_type']
    },
    {
      name: 'idx_product_types_asset_class',
      fields: ['asset_class']
    },
    {
      name: 'idx_product_types_status',
      fields: ['product_status', 'is_active']
    },
    {
      name: 'idx_product_types_ifrs9',
      fields: ['ifrs9_scope']
    },
    {
      name: 'idx_product_types_syariah',
      fields: ['syariah_contract_type', 'syariah_compliance_required']
    }
  ]
})
export class ProductType extends SequelizeModel<ProductTypeAttributes, ProductTypeCreationAttributes> {
  
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  })
  id!: string;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Legacy ID for migration from FRS9PRO system'
  })
  legacy_id?: number;

  // Product identification
  @Column({
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique product code'
  })
  product_code!: string;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Product name'
  })
  product_name!: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Product group classification'
  })
  product_group!: string;

  @Column({
    type: DataTypes.ENUM('credit', 'deposit', 'investment', 'trade_finance', 'treasury', 'guarantee'),
    allowNull: false,
    comment: 'Product category'
  })
  product_category!: 'credit' | 'deposit' | 'investment' | 'trade_finance' | 'treasury' | 'guarantee';

  // Product classification
  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Product sub-category'
  })
  product_sub_category?: string;

  @Column({
    type: DataTypes.ENUM('loans', 'securities', 'derivatives', 'off_balance_sheet', 'other'),
    allowNull: false,
    comment: 'Asset class for regulatory purposes'
  })
  asset_class!: 'loans' | 'securities' | 'derivatives' | 'off_balance_sheet' | 'other';

  @Column({
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100.00,
    comment: 'Basel risk weight percentage'
  })
  risk_weight!: number;

  // Banking type support
  @Column({
    type: DataTypes.ENUM('conventional', 'syariah', 'dual'),
    allowNull: false,
    defaultValue: 'conventional',
    comment: 'Banking type support'
  })
  banking_type!: 'conventional' | 'syariah' | 'dual';

  @Column({
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Syariah contract type (Murabaha, Musharaka, etc.)'
  })
  syariah_contract_type?: string;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Syariah compliance required'
  })
  syariah_compliance_required!: boolean;

  @Column({
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'AAOIFI category classification'
  })
  aaoifi_category?: string;

  // Financial characteristics
  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Interest bearing product'
  })
  interest_bearing!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Profit sharing for Islamic products'
  })
  profit_sharing!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Collateral required'
  })
  collateral_required!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Guarantee required'
  })
  guarantee_required!: boolean;

  // Tenor and pricing
  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Minimum tenor in months'
  })
  min_tenor_months?: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maximum tenor in months'
  })
  max_tenor_months?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Minimum amount'
  })
  min_amount?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Maximum amount'
  })
  max_amount?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Base rate as decimal (e.g., 0.05 = 5%)'
  })
  base_rate?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Margin rate as decimal'
  })
  margin_rate?: number;

  // IFRS9 specific attributes
  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    comment: 'Days past due threshold for Stage 1'
  })
  stage_1_threshold_days!: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 90,
    comment: 'Days past due threshold for Stage 2'
  })
  stage_2_threshold_days!: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 180,
    comment: 'Days past due threshold for Stage 3'
  })
  stage_3_threshold_days!: number;

  // PD model configuration
  @Column({
    type: DataTypes.ENUM('statistical', 'external_rating', 'internal_model', 'simplified'),
    allowNull: true,
    comment: 'PD model type'
  })
  pd_model_type?: 'statistical' | 'external_rating' | 'internal_model' | 'simplified';

  @Column({
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true,
    comment: 'Base PD rate'
  })
  pd_base_rate?: number;

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'PD adjustment factors and parameters'
  })
  pd_adjustment_factors?: any;

  // LGD model configuration
  @Column({
    type: DataTypes.ENUM('historical', 'regulatory', 'advanced'),
    allowNull: true,
    comment: 'LGD model type'
  })
  lgd_model_type?: 'historical' | 'regulatory' | 'advanced';

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Base LGD rate'
  })
  lgd_base_rate?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Downturn LGD adjustment'
  })
  lgd_downturn_adjustment?: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Recovery period in months'
  })
  recovery_period_months?: number;

  // EAD model configuration
  @Column({
    type: DataTypes.ENUM('current_exposure', 'committed_facility', 'ccf_based'),
    allowNull: true,
    comment: 'EAD model type'
  })
  ead_model_type?: 'current_exposure' | 'committed_facility' | 'ccf_based';

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Credit Conversion Factor for off-balance sheet'
  })
  credit_conversion_factor?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Drawdown factor for committed facilities'
  })
  drawdown_factor?: number;

  // ECL calculation parameters
  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Discount rate for ECL calculation'
  })
  discount_rate?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Probability of curing from default'
  })
  cure_rate?: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of months for forward-looking scenarios'
  })
  forward_looking_periods?: number;

  // Regulatory and compliance
  @Column({
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Regulatory category'
  })
  regulatory_category?: string;

  @Column({
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Basel category'
  })
  basel_category?: string;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Included in IFRS9 scope'
  })
  ifrs9_scope!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Applicable for stress testing'
  })
  stress_testing_applicable!: boolean;

  // Operational attributes
  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Auto approval limit'
  })
  auto_approval_limit?: number;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Manual review required'
  })
  manual_review_required!: boolean;

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Required documentation list'
  })
  documentation_required?: string[];

  // Status and lifecycle
  @Column({
    type: DataTypes.ENUM('active', 'inactive', 'discontinued', 'suspended'),
    allowNull: false,
    defaultValue: 'active'
  })
  product_status!: 'active' | 'inactive' | 'discontinued' | 'suspended';

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  is_active!: boolean;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Product launch date'
  })
  launch_date?: Date;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Product discontinuation date'
  })
  discontinuation_date?: Date;

  // Fee structure
  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Processing fee'
  })
  processing_fee?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Annual fee'
  })
  annual_fee?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Penalty rate'
  })
  penalty_rate?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Early settlement fee rate'
  })
  early_settlement_fee?: number;

  // Channel availability
  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Available through branch'
  })
  branch_available!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Available through online banking'
  })
  online_available!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Available through mobile banking'
  })
  mobile_available!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Available through agents'
  })
  agent_available!: boolean;

  // Target market
  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Target customer types'
  })
  target_customer_types?: string[];

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Target customer segments'
  })
  target_segments?: string[];

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Geographic restrictions'
  })
  geographic_restrictions?: string[];

  // Audit information
  @Column({
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'User who created the record'
  })
  created_by!: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'User who last updated the record'
  })
  updated_by?: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Additional metadata
  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional product-specific metadata'
  })
  metadata?: any;

  // Instance methods for business logic
  
  /**
   * Check if product is Syariah compliant
   */
  isShariahCompliant(): boolean {
    return this.banking_type === 'syariah' && 
           this.syariah_compliance_required &&
           !!this.syariah_contract_type;
  }

  /**
   * Check if product supports dual banking
   */
  supportsDualBanking(): boolean {
    return this.banking_type === 'dual';
  }

  /**
   * Get effective interest rate
   */
  getEffectiveRate(): number {
    return (this.base_rate || 0) + (this.margin_rate || 0);
  }

  /**
   * Check if amount is within product limits
   */
  isAmountValid(amount: number): boolean {
    if (this.min_amount && amount < this.min_amount) {
      return false;
    }
    
    if (this.max_amount && amount > this.max_amount) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if tenor is within product limits
   */
  isTenorValid(tenorMonths: number): boolean {
    if (this.min_tenor_months && tenorMonths < this.min_tenor_months) {
      return false;
    }
    
    if (this.max_tenor_months && tenorMonths > this.max_tenor_months) {
      return false;
    }
    
    return true;
  }

  /**
   * Get IFRS9 stage based on days past due
   */
  getIfrs9Stage(daysPastDue: number): number {
    if (daysPastDue >= this.stage_3_threshold_days) {
      return 3;
    } else if (daysPastDue >= this.stage_2_threshold_days) {
      return 2;
    } else {
      return 1;
    }
  }

  /**
   * Check if auto approval is possible
   */
  canAutoApprove(amount: number): boolean {
    if (this.manual_review_required) {
      return false;
    }
    
    if (!this.auto_approval_limit) {
      return false;
    }
    
    return amount <= this.auto_approval_limit;
  }

  /**
   * Get credit conversion factor
   */
  getCreditConversionFactor(): number {
    return this.credit_conversion_factor || 1.0;
  }

  /**
   * Calculate processing fee
   */
  calculateProcessingFee(amount: number): number {
    if (!this.processing_fee) {
      return 0;
    }
    
    // If processing fee < 1, treat as percentage
    if (this.processing_fee < 1) {
      return amount * this.processing_fee;
    }
    
    // Otherwise, treat as fixed amount
    return this.processing_fee;
  }

  /**
   * Validate Syariah contract type
   */
  static validateShariahContract(contractType: string): boolean {
    const validContracts = [
      'murabaha',    // Cost-plus financing
      'musharaka',   // Partnership
      'mudharaba',   // Profit-sharing
      'ijarah',      // Leasing
      'salam',       // Forward sale
      'istisna',     // Manufacturing contract
      'qard_hassan', // Benevolent loan
      'wakalah',     // Agency
      'takaful',     // Islamic insurance
      'sukuk',       // Islamic bonds
      'wadiah',      // Safekeeping
      'hiwalah'      // Debt transfer
    ];
    
    return validContracts.includes(contractType.toLowerCase());
  }

  /**
   * Get product risk multiplier
   */
  getRiskMultiplier(): number {
    // Base multiplier on asset class
    switch (this.asset_class) {
      case 'loans': return 1.0;
      case 'securities': return 0.8;
      case 'derivatives': return 1.5;
      case 'off_balance_sheet': return 0.5;
      default: return 1.0;
    }
  }
}

export default ProductType;