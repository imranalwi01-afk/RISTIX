// packages/backend/src/core/models/banking/customer.model.ts
// ============================================================================
// Customer Model for IFRS9 Multi-Tenant Platform
// ============================================================================
// Purpose: Core customer model for ECL calculations and portfolio management
// Dependencies: Sequelize, multi-tenant architecture
// Banking Support: Conventional + Syariah (Islamic) banking
// ============================================================================

import { DataTypes, Model, Optional } from 'sequelize';
import { Table, Column, Model as SequelizeModel, PrimaryKey, AutoIncrement, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';

export interface CustomerAttributes {
  id: string;
  legacy_id?: number; // Migration compatibility with FRS9PRO
  
  // Customer identification
  customer_id: string;
  customer_name: string;
  customer_type: 'individual' | 'corporate' | 'sme' | 'government' | 'financial_institution';
  
  // Business/Personal details
  industry_code?: string;
  industry_name?: string;
  business_segment?: string;
  company_size?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  
  // Contact information
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province?: string;
  postal_code?: string;
  country_code: string;
  phone_number?: string;
  email_address?: string;
  
  // Legal and identification
  registration_number?: string;
  tax_id?: string;
  date_of_birth?: Date; // For individuals
  incorporation_date?: Date; // For corporates
  
  // Banking relationship
  customer_since: Date;
  relationship_manager?: string;
  branch_code?: string;
  customer_segment?: 'retail' | 'priority' | 'private' | 'corporate' | 'sme' | 'syariah';
  
  // Risk information
  internal_rating?: string;
  external_rating?: string;
  risk_category?: 'low' | 'medium' | 'high' | 'very_high';
  blacklist_flag: boolean;
  pep_flag: boolean; // Politically Exposed Person
  sanctions_flag: boolean;
  
  // Financial information
  annual_income?: number;
  net_worth?: number;
  total_assets?: number;
  annual_revenue?: number; // For corporates
  employee_count?: number; // For corporates
  
  // Banking type support
  banking_type: 'conventional' | 'syariah';
  syariah_customer_type?: 'mudharib' | 'rabbul_mal' | 'musharik' | 'musta_jir' | 'wa_kil';
  syariah_compliance_status?: boolean;
  syariah_board_approval?: boolean;
  
  // Geographic and currency
  home_country: string;
  operating_countries?: string[]; // JSON array for corporates
  base_currency: string;
  
  // Status information
  customer_status: 'active' | 'inactive' | 'dormant' | 'closed' | 'suspended';
  is_active: boolean;
  closure_date?: Date;
  closure_reason?: string;
  
  // KYC and compliance
  kyc_completion_date?: Date;
  kyc_next_review_date?: Date;
  kyc_risk_rating?: string;
  aml_risk_score?: number;
  fatca_status?: boolean;
  crs_status?: boolean;
  
  // Default and recovery information
  default_history?: any; // JSON field for default events
  recovery_history?: any; // JSON field for recovery actions
  litigation_status?: boolean;
  
  // Audit information
  created_by: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  
  // Additional metadata
  metadata?: any; // JSON field for additional customer-specific data
}

export interface CustomerCreationAttributes 
  extends Optional<CustomerAttributes, 
    'id' | 'legacy_id' | 'industry_code' | 'industry_name' | 'business_segment' | 
    'company_size' | 'address_line2' | 'state_province' | 'postal_code' | 
    'phone_number' | 'email_address' | 'registration_number' | 'tax_id' | 
    'date_of_birth' | 'incorporation_date' | 'relationship_manager' | 'branch_code' | 
    'customer_segment' | 'internal_rating' | 'external_rating' | 'risk_category' | 
    'annual_income' | 'net_worth' | 'total_assets' | 'annual_revenue' | 
    'employee_count' | 'syariah_customer_type' | 'syariah_compliance_status' | 
    'syariah_board_approval' | 'operating_countries' | 'closure_date' | 
    'closure_reason' | 'kyc_completion_date' | 'kyc_next_review_date' | 
    'kyc_risk_rating' | 'aml_risk_score' | 'fatca_status' | 'crs_status' | 
    'default_history' | 'recovery_history' | 'litigation_status' | 'updated_by' | 
    'created_at' | 'updated_at' | 'metadata'> {}

@Table({
  tableName: 'customers',
  schema: 'core',
  timestamps: true,
  underscored: true,
  paranoid: true, // Soft delete support
  indexes: [
    {
      name: 'idx_customers_customer_id',
      fields: ['customer_id'],
      unique: true
    },
    {
      name: 'idx_customers_customer_type',
      fields: ['customer_type']
    },
    {
      name: 'idx_customers_industry_code',
      fields: ['industry_code']
    },
    {
      name: 'idx_customers_risk_category',
      fields: ['risk_category']
    },
    {
      name: 'idx_customers_banking_type',
      fields: ['banking_type']
    },
    {
      name: 'idx_customers_status',
      fields: ['customer_status', 'is_active']
    },
    {
      name: 'idx_customers_segment',
      fields: ['customer_segment']
    },
    {
      name: 'idx_customers_ratings',
      fields: ['internal_rating', 'external_rating']
    }
  ]
})
export class Customer extends SequelizeModel<CustomerAttributes, CustomerCreationAttributes> {
  
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

  // Customer identification
  @Column({
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique customer identifier'
  })
  customer_id!: string;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Customer full name or company name'
  })
  customer_name!: string;

  @Column({
    type: DataTypes.ENUM('individual', 'corporate', 'sme', 'government', 'financial_institution'),
    allowNull: false,
    comment: 'Customer type classification'
  })
  customer_type!: 'individual' | 'corporate' | 'sme' | 'government' | 'financial_institution';

  // Business/Personal details
  @Column({
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Industry classification code'
  })
  industry_code?: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Industry name'
  })
  industry_name?: string;

  @Column({
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Business segment classification'
  })
  business_segment?: string;

  @Column({
    type: DataTypes.ENUM('micro', 'small', 'medium', 'large', 'enterprise'),
    allowNull: true,
    comment: 'Company size classification'
  })
  company_size?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

  // Contact information
  @Column({
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Primary address line'
  })
  address_line1!: string;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Secondary address line'
  })
  address_line2?: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'City name'
  })
  city!: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'State or province'
  })
  state_province?: string;

  @Column({
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Postal code'
  })
  postal_code?: string;

  @Column({
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: 'ID',
    comment: 'Country code (ISO 3166-1)'
  })
  country_code!: string;

  @Column({
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Phone number'
  })
  phone_number?: string;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email address'
  })
  email_address?: string;

  // Legal and identification
  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Business registration number'
  })
  registration_number?: string;

  @Column({
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tax identification number'
  })
  tax_id?: string;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date of birth for individuals'
  })
  date_of_birth?: Date;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Incorporation date for corporates'
  })
  incorporation_date?: Date;

  // Banking relationship
  @Column({
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Customer relationship start date'
  })
  customer_since!: Date;

  @Column({
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Assigned relationship manager'
  })
  relationship_manager?: string;

  @Column({
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Primary branch code'
  })
  branch_code?: string;

  @Column({
    type: DataTypes.ENUM('retail', 'priority', 'private', 'corporate', 'sme', 'syariah'),
    allowNull: true,
    comment: 'Customer segment classification'
  })
  customer_segment?: 'retail' | 'priority' | 'private' | 'corporate' | 'sme' | 'syariah';

  // Risk information
  @Column({
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Internal risk rating'
  })
  internal_rating?: string;

  @Column({
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'External risk rating (S&P, Moody\'s, etc.)'
  })
  external_rating?: string;

  @Column({
    type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
    allowNull: true,
    comment: 'Risk category classification'
  })
  risk_category?: 'low' | 'medium' | 'high' | 'very_high';

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Blacklist flag'
  })
  blacklist_flag!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Politically Exposed Person flag'
  })
  pep_flag!: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Sanctions list flag'
  })
  sanctions_flag!: boolean;

  // Financial information
  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Annual income for individuals'
  })
  annual_income?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Net worth'
  })
  net_worth?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Total assets'
  })
  total_assets?: number;

  @Column({
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Annual revenue for corporates'
  })
  annual_revenue?: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of employees for corporates'
  })
  employee_count?: number;

  // Banking type support
  @Column({
    type: DataTypes.ENUM('conventional', 'syariah'),
    allowNull: false,
    defaultValue: 'conventional',
    comment: 'Banking type preference'
  })
  banking_type!: 'conventional' | 'syariah';

  @Column({
    type: DataTypes.ENUM('mudharib', 'rabbul_mal', 'musharik', 'musta_jir', 'wa_kil'),
    allowNull: true,
    comment: 'Syariah customer type classification'
  })
  syariah_customer_type?: 'mudharib' | 'rabbul_mal' | 'musharik' | 'musta_jir' | 'wa_kil';

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    comment: 'Syariah compliance status'
  })
  syariah_compliance_status?: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Syariah board approval status'
  })
  syariah_board_approval?: boolean;

  // Geographic and currency
  @Column({
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: 'ID',
    comment: 'Home country code'
  })
  home_country!: string;

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Operating countries for corporates'
  })
  operating_countries?: string[];

  @Column({
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'IDR',
    comment: 'Base currency code (ISO 4217)'
  })
  base_currency!: string;

  // Status information
  @Column({
    type: DataTypes.ENUM('active', 'inactive', 'dormant', 'closed', 'suspended'),
    allowNull: false,
    defaultValue: 'active'
  })
  customer_status!: 'active' | 'inactive' | 'dormant' | 'closed' | 'suspended';

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  is_active!: boolean;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Customer closure date'
  })
  closure_date?: Date;

  @Column({
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Reason for closure'
  })
  closure_reason?: string;

  // KYC and compliance
  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'KYC completion date'
  })
  kyc_completion_date?: Date;

  @Column({
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Next KYC review date'
  })
  kyc_next_review_date?: Date;

  @Column({
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'KYC risk rating'
  })
  kyc_risk_rating?: string;

  @Column({
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'AML risk score (0-100)'
  })
  aml_risk_score?: number;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    comment: 'FATCA compliance status'
  })
  fatca_status?: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    comment: 'CRS compliance status'
  })
  crs_status?: boolean;

  // Default and recovery information
  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Historical default events'
  })
  default_history?: any;

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Recovery actions and outcomes'
  })
  recovery_history?: any;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Current litigation status'
  })
  litigation_status?: boolean;

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
    comment: 'Additional customer-specific metadata'
  })
  metadata?: any;

  // Instance methods for business logic
  
  /**
   * Check if customer is high risk
   */
  isHighRisk(): boolean {
    return this.risk_category === 'high' || 
           this.risk_category === 'very_high' ||
           this.pep_flag || 
           this.sanctions_flag ||
           this.blacklist_flag;
  }

  /**
   * Check if customer is corporate
   */
  isCorporate(): boolean {
    return this.customer_type === 'corporate' || 
           this.customer_type === 'sme' ||
           this.customer_type === 'government' ||
           this.customer_type === 'financial_institution';
  }

  /**
   * Check if customer is Syariah compliant
   */
  isShariahCompliant(): boolean {
    return this.banking_type === 'syariah' && 
           (this.syariah_compliance_status ?? false) &&
           !!this.syariah_customer_type;
  }

  /**
   * Get customer age (for individuals)
   */
  getAge(): number | null {
    if (!this.date_of_birth) {
      return null;
    }
    
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get years in business (for corporates)
   */
  getYearsInBusiness(): number | null {
    if (!this.incorporation_date) {
      return null;
    }
    
    const today = new Date();
    const incorpDate = new Date(this.incorporation_date);
    return Math.floor((today.getTime() - incorpDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  /**
   * Get relationship tenure
   */
  getRelationshipTenure(): number {
    const today = new Date();
    const relationshipStart = new Date(this.customer_since);
    return Math.floor((today.getTime() - relationshipStart.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  /**
   * Check if KYC is due for renewal
   */
  isKycDue(): boolean {
    if (!this.kyc_next_review_date) {
      return true; // KYC not completed
    }
    
    return new Date(this.kyc_next_review_date) <= new Date();
  }

  /**
   * Get customer size category
   */
  getSizeCategory(): string {
    if (this.customer_type === 'individual') {
      return 'individual';
    }
    
    return this.company_size || 'unknown';
  }

  /**
   * Validate Syariah customer type
   */
  static validateShariahCustomerType(customerType: string): boolean {
    const validTypes = ['mudharib', 'rabbul_mal', 'musharik', 'musta_jir', 'wa_kil'];
    return validTypes.includes(customerType.toLowerCase());
  }

  /**
   * Get risk multiplier for PD calculations
   */
  getRiskMultiplier(): number {
    switch (this.risk_category) {
      case 'low': return 0.8;
      case 'medium': return 1.0;
      case 'high': return 1.5;
      case 'very_high': return 2.0;
      default: return 1.0;
    }
  }
}

export default Customer;