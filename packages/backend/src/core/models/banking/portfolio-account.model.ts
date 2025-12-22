// packages/backend/src/core/models/banking/portfolio-account.model.ts
// ============================================================================
// Portfolio Account Model for IFRS9 Multi-Tenant Platform
// ============================================================================
// Purpose: Core portfolio account model for ECL calculations
// Dependencies: Sequelize, multi-tenant architecture
// Banking Support: Conventional + Syariah (Islamic) banking
// ============================================================================

import { DataTypes, Model, Optional } from 'sequelize';
import { Table, Column, Model as SequelizeModel, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Customer } from './customer.model';
import { ProductType } from './product-type.model';
import { Collateral } from './collateral.model';

export interface PortfolioAccountAttributes {
  id: string;
  legacy_id?: number; // Migration compatibility with FRS9PRO
  
  // Account identification
  account_id: string;
  customer_id: string;
  product_type_id: string;
  
  // Account details
  product_type: string;
  product_code: string;
  product_name: string;
  
  // Financial information
  outstanding_amount: number;
  original_amount: number;
  credit_limit?: number;
  committed_amount?: number;
  
  // Date information
  origination_date: Date;
  maturity_date?: Date;
  reporting_date: Date;
  last_payment_date?: Date;
  
  // Risk information
  current_stage: number; // IFRS9 staging (1, 2, 3)
  previous_stage?: number;
  days_past_due: number;
  credit_rating?: string;
  risk_grade?: string;
  
  // Banking type support
  banking_type: 'conventional' | 'syariah';
  syariah_contract_type?: string; // Murabaha, Musharaka, Mudharaba, etc.
  syariah_compliance_status?: boolean;
  
  // Interest/profit information
  interest_rate?: number; // For conventional banking
  profit_rate?: number; // For Islamic banking
  effective_rate?: number;
  
  // Account status
  account_status: 'active' | 'closed' | 'default' | 'restructured';
  is_active: boolean;
  is_impaired: boolean;
  is_performing: boolean;
  
  // Calculation related
  pd_12_month?: number;
  pd_lifetime?: number;
  lgd?: number;
  ead?: number;
  ecl_12_month?: number;
  ecl_lifetime?: number;
  final_ecl?: number;
  last_calculation_date?: Date;
  
  // Collateral information
  is_secured: boolean;
  collateral_value?: number;
  collateral_coverage_ratio?: number;
  
  // Currency and regional
  currency: string;
  country_code: string;
  branch_code?: string;
  
  // Audit information
  created_by: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  
  // Additional metadata
  metadata?: any; // JSON field for additional product-specific data
}

export interface PortfolioAccountCreationAttributes 
  extends Optional<PortfolioAccountAttributes, 
    'id' | 'legacy_id' | 'previous_stage' | 'last_payment_date' | 'maturity_date' | 
    'credit_limit' | 'committed_amount' | 'credit_rating' | 'risk_grade' | 
    'syariah_contract_type' | 'syariah_compliance_status' | 'interest_rate' | 
    'profit_rate' | 'effective_rate' | 'pd_12_month' | 'pd_lifetime' | 'lgd' | 
    'ead' | 'ecl_12_month' | 'ecl_lifetime' | 'final_ecl' | 'last_calculation_date' | 
    'collateral_value' | 'collateral_coverage_ratio' | 'branch_code' | 
    'updated_by' | 'created_at' | 'updated_at' | 'metadata'> {}

@Table({
  tableName: 'portfolio_accounts',
  schema: 'core',
  timestamps: true,
  underscored: true,
  paranoid: true, // Soft delete support
  indexes: [
    {
      name: 'idx_portfolio_accounts_account_id',
      fields: ['account_id']
    },
    {
      name: 'idx_portfolio_accounts_customer_id',
      fields: ['customer_id']
    },
    {
      name: 'idx_portfolio_accounts_product_type',
      fields: ['product_type']
    },
    {
      name: 'idx_portfolio_accounts_current_stage',
      fields: ['current_stage']
    },
    {
      name: 'idx_portfolio_accounts_banking_type',
      fields: ['banking_type']
    },
    {
      name: 'idx_portfolio_accounts_reporting_date',
      fields: ['reporting_date']
    },
    {
      name: 'idx_portfolio_accounts_status',
      fields: ['account_status', 'is_active']
    }
  ]
})
export class PortfolioAccount extends SequelizeModel<PortfolioAccountAttributes, PortfolioAccountCreationAttributes> {
  
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

  // Account identification
  @Column({
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique account identifier'
  })
  account_id!: string;

  @ForeignKey(() => Customer)
  @Column({
    type: DataTypes.UUID,
    allowNull: false
  })
  customer_id!: string;

  @ForeignKey(() => ProductType)
  @Column({
    type: DataTypes.UUID,
    allowNull: false
  })
  product_type_id!: string;

  // Account details
  @Column({
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Product type code'
  })
  product_type!: string;

  @Column({
    type: DataTypes.STRING(50),
    allowNull: false
  })
  product_code!: string;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: false
  })
  product_name!: string;

  // Financial information
  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    comment: 'Current outstanding amount'
  })
  outstanding_amount!: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    comment: 'Original loan/facility amount'
  })
  original_amount!: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Credit limit for revolving facilities'
  })
  credit_limit?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Committed amount for undrawn facilities'
  })
  committed_amount?: number;

  // Date information
  @Column({
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Account origination date'
  })
  origination_date!: Date;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Account maturity date'
  })
  maturity_date?: Date;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Reporting date for calculations'
  })
  reporting_date!: Date;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Last payment received date'
  })
  last_payment_date?: Date;

  // Risk information
  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 3
    },
    comment: 'IFRS9 staging classification (1=12M ECL, 2=Lifetime ECL, 3=Credit Impaired)'
  })
  current_stage!: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 3
    },
    comment: 'Previous stage for transition analysis'
  })
  previous_stage?: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Days past due for payment'
  })
  days_past_due!: number;

  @Column({
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'External credit rating (AAA, AA+, etc.)'
  })
  credit_rating?: string;

  @Column({
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Internal risk grade'
  })
  risk_grade?: string;

  // Banking type support
  @Column({
    type: DataTypes.ENUM('conventional', 'syariah'),
    allowNull: false,
    defaultValue: 'conventional',
    comment: 'Banking type for regulatory compliance'
  })
  banking_type!: 'conventional' | 'syariah';

  @Column({
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Islamic banking contract type (Murabaha, Musharaka, etc.)'
  })
  syariah_contract_type?: string;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    comment: 'Syariah compliance verification status'
  })
  syariah_compliance_status?: boolean;

  // Interest/profit information
  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Interest rate for conventional banking (as decimal, e.g., 0.05 = 5%)'
  })
  interest_rate?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Profit sharing rate for Islamic banking'
  })
  profit_rate?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Effective annual rate'
  })
  effective_rate?: number;

  // Account status
  @Column({
    type: DataTypes.ENUM('active', 'closed', 'default', 'restructured'),
    allowNull: false,
    defaultValue: 'active'
  })
  account_status!: 'active' | 'closed' | 'default' | 'restructured';

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  is_active!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Credit impaired flag (Stage 3)'
  })
  is_impaired!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Performing account flag'
  })
  is_performing!: boolean;

  // Calculation related
  @Column({
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true,
    comment: '12-month Probability of Default'
  })
  pd_12_month?: number;

  @Column({
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true,
    comment: 'Lifetime Probability of Default'
  })
  pd_lifetime?: number;

  @Column({
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true,
    comment: 'Loss Given Default'
  })
  lgd?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Exposure at Default'
  })
  ead?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: '12-month Expected Credit Loss'
  })
  ecl_12_month?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Lifetime Expected Credit Loss'
  })
  ecl_lifetime?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Final ECL amount for provisions'
  })
  final_ecl?: number;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last ECL calculation date'
  })
  last_calculation_date?: Date;

  // Collateral information
  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Account has collateral security'
  })
  is_secured!: boolean;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Total collateral value (after haircuts)'
  })
  collateral_value?: number;

  @Column({
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Collateral coverage ratio'
  })
  collateral_coverage_ratio?: number;

  // Currency and regional
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
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Bank branch code'
  })
  branch_code?: string;

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

  // Associations
  @BelongsTo(() => Customer)
  customer!: Customer;

  @BelongsTo(() => ProductType)
  productType!: ProductType;

  @HasMany(() => Collateral)
  collateral!: Collateral[];

  // Instance methods for business logic
  
  /**
   * Check if account requires lifetime ECL (Stage 2 or 3)
   */
  requiresLifetimeEcl(): boolean {
    return this.current_stage === 2 || this.current_stage === 3;
  }

  /**
   * Check if account is credit impaired (Stage 3)
   */
  isCreditImpaired(): boolean {
    return this.current_stage === 3 || this.is_impaired;
  }

  /**
   * Check if account has Significant Increase in Credit Risk (SICR)
   */
  hasSicr(): boolean {
    return this.current_stage === 2;
  }

  /**
   * Get days since origination
   */
  getDaysSinceOrigination(): number {
    const now = new Date();
    const origination = new Date(this.origination_date);
    const diffTime = now.getTime() - origination.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate utilization ratio for revolving facilities
   */
  getUtilizationRatio(): number {
    if (!this.credit_limit || this.credit_limit === 0) {
      return 0;
    }
    return this.outstanding_amount / this.credit_limit;
  }

  /**
   * Check if account is Islamic banking compliant
   */
  isShariahCompliant(): boolean {
    return this.banking_type === 'syariah' && 
           (this.syariah_compliance_status ?? false) &&
           !!this.syariah_contract_type;
  }

  /**
   * Get effective interest/profit rate
   */
  getEffectiveRate(): number {
    if (this.effective_rate) {
      return this.effective_rate;
    }
    
    if (this.banking_type === 'syariah' && this.profit_rate) {
      return this.profit_rate;
    }
    
    return this.interest_rate || 0;
  }

  /**
   * Calculate months to maturity
   */
  getMonthsToMaturity(): number | null {
    if (!this.maturity_date) {
      return null;
    }
    
    const now = new Date();
    const maturity = new Date(this.maturity_date);
    
    if (maturity <= now) {
      return 0;
    }
    
    const diffTime = maturity.getTime() - now.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  }

  /**
   * Validate Islamic banking contract type
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
      'takaful'      // Islamic insurance
    ];
    
    return validContracts.includes(contractType.toLowerCase());
  }
}

export default PortfolioAccount;