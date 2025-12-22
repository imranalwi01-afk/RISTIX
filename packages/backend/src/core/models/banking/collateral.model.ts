// packages/backend/src/core/models/banking/collateral.model.ts
// ============================================================================
// Collateral Model for IFRS9 Multi-Tenant Platform
// ============================================================================
// Purpose: Collateral management for LGD calculations and credit risk
// Dependencies: Sequelize, multi-tenant architecture
// Banking Support: Conventional + Syariah (Islamic) banking collateral
// ============================================================================

import { DataTypes, Model, Optional } from 'sequelize';
import { Table, Column, Model as SequelizeModel, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { PortfolioAccount } from './portfolio-account.model';

export interface CollateralAttributes {
  id: string;
  legacy_id?: number; // Migration compatibility with FRS9PRO
  
  // Collateral identification
  collateral_id: string;
  account_id: string; // Foreign key to portfolio_accounts
  collateral_type: string;
  collateral_sub_type?: string;
  
  // Collateral description
  collateral_description: string;
  location?: string;
  address?: string;
  
  // Valuation information
  original_value: number;
  current_market_value: number;
  forced_sale_value?: number;
  appraised_value?: number;
  book_value?: number;
  
  // Valuation details
  valuation_date: Date;
  next_valuation_date?: Date;
  valuation_method: 'market' | 'cost' | 'income' | 'liquidation' | 'expert';
  valuator_name?: string;
  valuator_license?: string;
  
  // LGD calculation parameters
  haircut_percentage: number; // Discount applied to market value
  recovery_rate?: number; // Expected recovery rate
  disposal_costs_percentage?: number; // Costs to realize collateral
  time_to_disposal_months?: number; // Expected time to dispose
  
  // Legal information
  legal_status: 'clear_title' | 'encumbered' | 'disputed' | 'under_litigation';
  ownership_type: 'owned' | 'leased' | 'third_party' | 'government';
  registration_number?: string;
  registration_authority?: string;
  
  // Security information
  security_ranking: 'first_charge' | 'second_charge' | 'third_charge' | 'unsecured';
  perfection_status: 'perfected' | 'pending' | 'imperfect' | 'not_required';
  perfection_date?: Date;
  security_agreement_date?: Date;
  
  // Insurance information
  insurance_coverage: boolean;
  insurance_amount?: number;
  insurance_expiry_date?: Date;
  insurance_company?: string;
  insurance_policy_number?: string;
  
  // Banking type support
  banking_type: 'conventional' | 'syariah';
  syariah_compliant: boolean;
  syariah_asset_type?: string; // Tangible, intangible, etc.
  syariah_ownership_structure?: string;
  
  // Monitoring and maintenance
  monitoring_frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'as_needed';
  last_inspection_date?: Date;
  next_inspection_date?: Date;
  condition_assessment?: 'excellent' | 'good' | 'fair' | 'poor' | 'deteriorating';
  
  // Market information
  market_liquidity: 'high' | 'medium' | 'low' | 'illiquid';
  price_volatility: 'low' | 'medium' | 'high' | 'very_high';
  market_trends?: string;
  comparable_sales?: any; // JSON for comparable market data
  
  // Risk factors
  environmental_risk: boolean;
  obsolescence_risk: boolean;
  concentration_risk: boolean;
  geographic_risk: boolean;
  political_risk: boolean;
  
  // Currency and location
  currency: string;
  country_code: string;
  region?: string;
  city?: string;
  
  // Status information
  collateral_status: 'active' | 'released' | 'partially_released' | 'foreclosed' | 'disposed';
  is_active: boolean;
  release_date?: Date;
  release_reason?: string;
  disposal_date?: Date;
  disposal_proceeds?: number;
  
  // Covenant compliance
  maintenance_covenants?: any; // JSON for maintenance requirements
  covenant_compliance_status: boolean;
  last_covenant_check_date?: Date;
  
  // Documentation
  documentation_complete: boolean;
  missing_documents?: string[]; // JSON array
  document_expiry_dates?: any; // JSON for document expiry tracking
  
  // Stress testing parameters
  stress_haircut_mild?: number;
  stress_haircut_severe?: number;
  stress_recovery_rate?: number;
  stress_disposal_time?: number;
  
  // Audit information
  created_by: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  
  // Additional metadata
  metadata?: any; // JSON field for additional collateral-specific data
}

export interface CollateralCreationAttributes 
  extends Optional<CollateralAttributes, 
    'id' | 'legacy_id' | 'collateral_sub_type' | 'location' | 'address' | 
    'forced_sale_value' | 'appraised_value' | 'book_value' | 'next_valuation_date' | 
    'valuator_name' | 'valuator_license' | 'recovery_rate' | 'disposal_costs_percentage' | 
    'time_to_disposal_months' | 'registration_number' | 'registration_authority' | 
    'perfection_date' | 'security_agreement_date' | 'insurance_amount' | 'insurance_expiry_date' | 
    'insurance_company' | 'insurance_policy_number' | 'syariah_asset_type' | 
    'syariah_ownership_structure' | 'last_inspection_date' | 'next_inspection_date' | 
    'condition_assessment' | 'market_trends' | 'comparable_sales' | 'region' | 'city' | 
    'release_date' | 'release_reason' | 'disposal_date' | 'disposal_proceeds' | 
    'maintenance_covenants' | 'last_covenant_check_date' | 'missing_documents' | 
    'document_expiry_dates' | 'stress_haircut_mild' | 'stress_haircut_severe' | 
    'stress_recovery_rate' | 'stress_disposal_time' | 'updated_by' | 'created_at' | 
    'updated_at' | 'metadata'> {}

@Table({
  tableName: 'collateral',
  schema: 'core',
  timestamps: true,
  underscored: true,
  paranoid: true, // Soft delete support
  indexes: [
    {
      name: 'idx_collateral_collateral_id',
      fields: ['collateral_id'],
      unique: true
    },
    {
      name: 'idx_collateral_account_id',
      fields: ['account_id']
    },
    {
      name: 'idx_collateral_type',
      fields: ['collateral_type', 'collateral_sub_type']
    },
    {
      name: 'idx_collateral_banking_type',
      fields: ['banking_type']
    },
    {
      name: 'idx_collateral_status',
      fields: ['collateral_status', 'is_active']
    },
    {
      name: 'idx_collateral_valuation_date',
      fields: ['valuation_date']
    },
    {
      name: 'idx_collateral_security_ranking',
      fields: ['security_ranking']
    },
    {
      name: 'idx_collateral_location',
      fields: ['country_code', 'region', 'city']
    }
  ]
})
export class Collateral extends SequelizeModel<CollateralAttributes, CollateralCreationAttributes> {
  
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

  // Collateral identification
  @Column({
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique collateral identifier'
  })
  collateral_id!: string;

  @ForeignKey(() => PortfolioAccount)
  @Column({
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Reference to portfolio account'
  })
  account_id!: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Type of collateral'
  })
  collateral_type!: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Collateral sub-type'
  })
  collateral_sub_type?: string;

  // Collateral description
  @Column({
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Detailed description of collateral'
  })
  collateral_description!: string;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Physical location'
  })
  location?: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Full address'
  })
  address?: string;

  // Valuation information
  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    comment: 'Original value at acquisition'
  })
  original_value!: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    comment: 'Current market value'
  })
  current_market_value!: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Forced sale value (distressed sale)'
  })
  forced_sale_value?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Professional appraised value'
  })
  appraised_value?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Book value for accounting'
  })
  book_value?: number;

  // Valuation details
  @Column({
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date of current valuation'
  })
  valuation_date!: Date;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Next scheduled valuation date'
  })
  next_valuation_date?: Date;

  @Column({
    type: DataTypes.ENUM('market', 'cost', 'income', 'liquidation', 'expert'),
    allowNull: false,
    comment: 'Valuation methodology used'
  })
  valuation_method!: 'market' | 'cost' | 'income' | 'liquidation' | 'expert';

  @Column({
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Name of valuator/appraiser'
  })
  valuator_name?: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Valuator license number'
  })
  valuator_license?: string;

  // LGD calculation parameters
  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    defaultValue: 0.0000,
    comment: 'Haircut percentage applied to market value'
  })
  haircut_percentage!: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Expected recovery rate'
  })
  recovery_rate?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Disposal costs as percentage of value'
  })
  disposal_costs_percentage?: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Expected time to dispose in months'
  })
  time_to_disposal_months?: number;

  // Legal information
  @Column({
    type: DataTypes.ENUM('clear_title', 'encumbered', 'disputed', 'under_litigation'),
    allowNull: false,
    comment: 'Legal status of collateral'
  })
  legal_status!: 'clear_title' | 'encumbered' | 'disputed' | 'under_litigation';

  @Column({
    type: DataTypes.ENUM('owned', 'leased', 'third_party', 'government'),
    allowNull: false,
    comment: 'Ownership type'
  })
  ownership_type!: 'owned' | 'leased' | 'third_party' | 'government';

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Legal registration number'
  })
  registration_number?: string;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Registration authority'
  })
  registration_authority?: string;

  // Security information
  @Column({
    type: DataTypes.ENUM('first_charge', 'second_charge', 'third_charge', 'unsecured'),
    allowNull: false,
    comment: 'Security ranking/priority'
  })
  security_ranking!: 'first_charge' | 'second_charge' | 'third_charge' | 'unsecured';

  @Column({
    type: DataTypes.ENUM('perfected', 'pending', 'imperfect', 'not_required'),
    allowNull: false,
    comment: 'Security perfection status'
  })
  perfection_status!: 'perfected' | 'pending' | 'imperfect' | 'not_required';

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Security perfection date'
  })
  perfection_date?: Date;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Security agreement execution date'
  })
  security_agreement_date?: Date;

  // Insurance information
  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Insurance coverage available'
  })
  insurance_coverage!: boolean;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Insurance coverage amount'
  })
  insurance_amount?: number;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Insurance policy expiry date'
  })
  insurance_expiry_date?: Date;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Insurance company name'
  })
  insurance_company?: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Insurance policy number'
  })
  insurance_policy_number?: string;

  // Banking type support
  @Column({
    type: DataTypes.ENUM('conventional', 'syariah'),
    allowNull: false,
    defaultValue: 'conventional',
    comment: 'Banking type classification'
  })
  banking_type!: 'conventional' | 'syariah';

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Syariah compliance status'
  })
  syariah_compliant!: boolean;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Syariah asset type classification'
  })
  syariah_asset_type?: string;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Syariah ownership structure'
  })
  syariah_ownership_structure?: string;

  // Monitoring and maintenance
  @Column({
    type: DataTypes.ENUM('monthly', 'quarterly', 'semi_annual', 'annual', 'as_needed'),
    allowNull: false,
    defaultValue: 'annual',
    comment: 'Monitoring frequency'
  })
  monitoring_frequency!: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'as_needed';

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Last physical inspection date'
  })
  last_inspection_date?: Date;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Next scheduled inspection date'
  })
  next_inspection_date?: Date;

  @Column({
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'deteriorating'),
    allowNull: true,
    comment: 'Current condition assessment'
  })
  condition_assessment?: 'excellent' | 'good' | 'fair' | 'poor' | 'deteriorating';

  // Market information
  @Column({
    type: DataTypes.ENUM('high', 'medium', 'low', 'illiquid'),
    allowNull: false,
    defaultValue: 'medium',
    comment: 'Market liquidity assessment'
  })
  market_liquidity!: 'high' | 'medium' | 'low' | 'illiquid';

  @Column({
    type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
    allowNull: false,
    defaultValue: 'medium',
    comment: 'Price volatility assessment'
  })
  price_volatility!: 'low' | 'medium' | 'high' | 'very_high';

  @Column({
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Market trends analysis'
  })
  market_trends?: string;

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Comparable sales data'
  })
  comparable_sales?: any;

  // Risk factors
  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Environmental risk present'
  })
  environmental_risk!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Obsolescence risk present'
  })
  obsolescence_risk!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Concentration risk present'
  })
  concentration_risk!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Geographic risk present'
  })
  geographic_risk!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Political risk present'
  })
  political_risk!: boolean;

  // Currency and location
  @Column({
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'IDR',
    comment: 'Currency code (ISO 4217)'
  })
  currency!: string;

  @Column({
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: 'ID',
    comment: 'Country code (ISO 3166-1)'
  })
  country_code!: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Region/state'
  })
  region?: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'City'
  })
  city?: string;

  // Status information
  @Column({
    type: DataTypes.ENUM('active', 'released', 'partially_released', 'foreclosed', 'disposed'),
    allowNull: false,
    defaultValue: 'active'
  })
  collateral_status!: 'active' | 'released' | 'partially_released' | 'foreclosed' | 'disposed';

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  is_active!: boolean;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Collateral release date'
  })
  release_date?: Date;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Reason for release'
  })
  release_reason?: string;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Disposal/sale date'
  })
  disposal_date?: Date;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Proceeds from disposal'
  })
  disposal_proceeds?: number;

  // Covenant compliance
  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Maintenance covenant requirements'
  })
  maintenance_covenants?: any;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Covenant compliance status'
  })
  covenant_compliance_status!: boolean;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Last covenant compliance check date'
  })
  last_covenant_check_date?: Date;

  // Documentation
  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Documentation completeness status'
  })
  documentation_complete!: boolean;

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'List of missing documents'
  })
  missing_documents?: string[];

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Document expiry tracking'
  })
  document_expiry_dates?: any;

  // Stress testing parameters
  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Mild stress scenario haircut'
  })
  stress_haircut_mild?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Severe stress scenario haircut'
  })
  stress_haircut_severe?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Stress scenario recovery rate'
  })
  stress_recovery_rate?: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Stress scenario disposal time in months'
  })
  stress_disposal_time?: number;

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
    comment: 'Additional collateral-specific metadata'
  })
  metadata?: any;

  // Associations
  @BelongsTo(() => PortfolioAccount, 'account_id')
  portfolioAccount!: PortfolioAccount;

  // Instance methods for business logic
  
  /**
   * Calculate net realizable value after haircut and disposal costs
   */
  getNetRealizableValue(): number {
    let value = this.current_market_value;
    
    // Apply haircut
    value = value * (1 - this.haircut_percentage);
    
    // Apply disposal costs
    if (this.disposal_costs_percentage) {
      value = value * (1 - this.disposal_costs_percentage);
    }
    
    return Math.max(0, value);
  }

  /**
   * Calculate effective recovery rate
   */
  getEffectiveRecoveryRate(): number {
    if (this.recovery_rate) {
      return this.recovery_rate;
    }
    
    // Calculate based on net realizable value vs original value
    if (this.original_value > 0) {
      return this.getNetRealizableValue() / this.original_value;
    }
    
    return 0;
  }

  /**
   * Check if collateral is Syariah compliant
   */
  isShariahCompliant(): boolean {
    return this.banking_type === 'syariah' && this.syariah_compliant;
  }

  /**
   * Check if valuation is current
   */
  isValuationCurrent(maxAgeMonths: number = 12): boolean {
    const today = new Date();
    const valuationDate = new Date(this.valuation_date);
    const monthsDiff = (today.getTime() - valuationDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    
    return monthsDiff <= maxAgeMonths;
  }

  /**
   * Check if insurance is current
   */
  isInsuranceCurrent(): boolean {
    if (!this.insurance_coverage || !this.insurance_expiry_date) {
      return false;
    }
    
    return new Date(this.insurance_expiry_date) > new Date();
  }

  /**
   * Get loan-to-value ratio
   */
  getLoanToValueRatio(loanAmount: number): number {
    if (this.current_market_value <= 0) {
      return Infinity;
    }
    
    return loanAmount / this.current_market_value;
  }

  /**
   * Get collateral coverage ratio
   */
  getCoverageRatio(loanAmount: number): number {
    const netValue = this.getNetRealizableValue();
    
    if (loanAmount <= 0) {
      return Infinity;
    }
    
    return netValue / loanAmount;
  }

  /**
   * Calculate risk-adjusted value for stress scenarios
   */
  getStressValue(scenario: 'mild' | 'severe'): number {
    let haircut = this.haircut_percentage;
    
    if (scenario === 'mild' && this.stress_haircut_mild) {
      haircut = Math.max(haircut, this.stress_haircut_mild);
    } else if (scenario === 'severe' && this.stress_haircut_severe) {
      haircut = Math.max(haircut, this.stress_haircut_severe);
    }
    
    let value = this.current_market_value * (1 - haircut);
    
    // Apply disposal costs
    if (this.disposal_costs_percentage) {
      value = value * (1 - this.disposal_costs_percentage);
    }
    
    return Math.max(0, value);
  }

  /**
   * Check if collateral needs inspection
   */
  needsInspection(): boolean {
    if (!this.next_inspection_date) {
      return true; // No inspection scheduled
    }
    
    return new Date(this.next_inspection_date) <= new Date();
  }

  /**
   * Get risk score based on various factors
   */
  getRiskScore(): number {
    let score = 0;
    
    // Legal status risk
    switch (this.legal_status) {
      case 'clear_title': score += 0; break;
      case 'encumbered': score += 20; break;
      case 'disputed': score += 60; break;
      case 'under_litigation': score += 80; break;
    }
    
    // Market liquidity risk
    switch (this.market_liquidity) {
      case 'high': score += 0; break;
      case 'medium': score += 10; break;
      case 'low': score += 30; break;
      case 'illiquid': score += 50; break;
    }
    
    // Condition risk
    switch (this.condition_assessment) {
      case 'excellent': score += 0; break;
      case 'good': score += 5; break;
      case 'fair': score += 15; break;
      case 'poor': score += 35; break;
      case 'deteriorating': score += 50; break;
    }
    
    // Other risk factors
    if (this.environmental_risk) score += 20;
    if (this.obsolescence_risk) score += 15;
    if (this.concentration_risk) score += 10;
    if (this.geographic_risk) score += 10;
    if (this.political_risk) score += 15;
    
    // Insurance coverage
    if (!this.insurance_coverage) score += 10;
    if (this.insurance_coverage && !this.isInsuranceCurrent()) score += 5;
    
    return Math.min(100, score);
  }

  /**
   * Validate collateral type for banking type
   */
  static validateCollateralType(collateralType: string, bankingType: 'conventional' | 'syariah'): boolean {
    const shariahProhibited = [
      'alcohol_inventory',
      'gambling_equipment',
      'interest_bearing_securities',
      'conventional_insurance_policies',
      'pork_related_assets'
    ];
    
    if (bankingType === 'syariah') {
      return !shariahProhibited.includes(collateralType.toLowerCase());
    }
    
    return true; // All types allowed for conventional banking
  }
}

export default Collateral;