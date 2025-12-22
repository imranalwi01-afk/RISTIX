// packages/backend/src/core/models/banking-product.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

export interface BankingProductAttributes {
  id: string;
  legacyId?: string;
  productCode: string;
  productName: string;
  productType: string;
  productCategory: string;
  bankingType: 'conventional' | 'syariah';
  description?: string;
  interestRateMin?: number;
  interestRateMax?: number;
  profitRateMin?: number;
  profitRateMax?: number;
  tenorMin?: number;
  tenorMax?: number;
  loanAmountMin?: number;
  loanAmountMax?: number;
  collateralRequired: boolean;
  collateralType?: string;
  eligibilityCriteria?: string;
  termsAndConditions?: string;
  fees?: string;
  isActive: boolean;
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface BankingProductCreationAttributes
  extends Optional<BankingProductAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class BankingProduct extends Model<BankingProductAttributes, BankingProductCreationAttributes>
  implements BankingProductAttributes {

  public id!: string;
  public legacyId?: string;
  public productCode!: string;
  public productName!: string;
  public productType!: string;
  public productCategory!: string;
  public bankingType!: 'conventional' | 'syariah';
  public description?: string;
  public interestRateMin?: number;
  public interestRateMax?: number;
  public profitRateMin?: number;
  public profitRateMax?: number;
  public tenorMin?: number;
  public tenorMax?: number;
  public loanAmountMin?: number;
  public loanAmountMax?: number;
  public collateralRequired!: boolean;
  public collateralType?: string;
  public eligibilityCriteria?: string;
  public termsAndConditions?: string;
  public fees?: string;
  public isActive!: boolean;
  public tenantId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
  public updatedBy?: string;
}

BankingProduct.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  legacyId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Legacy system ID for migration tracking'
  },
  productCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Unique product code'
  },
  productName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Product display name'
  },
  productType: {
    type: DataTypes.ENUM(
      'KREDIT_KONSUMTIF',
      'KREDIT_KOMERSIAL',
      'KREDIT_MODAL_KERJA',
      'KREDIT_KENDARAAN',
      'KREDIT_PROPERTI',
      'KREDIT_INVESTASI',
      'MURABAHA',
      'MUSYARAKAH',
      'MUDHARABAH',
      'IJARAH',
      'ISTISNA',
      'SALAM',
      'QARD_HASAN',
      'WAKALAH'
    ),
    allowNull: false,
    comment: 'Product type classification'
  },
  productCategory: {
    type: DataTypes.ENUM('CONSUMER_LOAN', 'COMMERCIAL_LOAN', 'INVESTMENT', 'ISLAMIC_FINANCING', 'DEPOSIT', 'OTHER'),
    allowNull: false,
    comment: 'Product category'
  },
  bankingType: {
    type: DataTypes.ENUM('conventional', 'syariah'),
    allowNull: false,
    comment: 'Banking type classification'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Product description'
  },
  interestRateMin: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Minimum interest rate for conventional products'
  },
  interestRateMax: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Maximum interest rate for conventional products'
  },
  profitRateMin: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Minimum profit rate for syariah products'
  },
  profitRateMax: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Maximum profit rate for syariah products'
  },
  tenorMin: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Minimum loan tenor in months'
  },
  tenorMax: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maximum loan tenor in months'
  },
  loanAmountMin: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Minimum loan amount'
  },
  loanAmountMax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Maximum loan amount'
  },
  collateralRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether collateral is required'
  },
  collateralType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Type of collateral required'
  },
  eligibilityCriteria: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Eligibility criteria for the product'
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Product terms and conditions'
  },
  fees: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Product fees and charges'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Product active status'
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Tenant identifier for multi-tenancy'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User who created the product'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User who last updated the product'
  }
}, {
  sequelize,
  tableName: 'banking_products',
  schema: 'core',
  timestamps: true,
  indexes: [
    { fields: ['productCode'] },
    { fields: ['productName'] },
    { fields: ['productType'] },
    { fields: ['bankingType'] },
    { fields: ['isActive'] },
    { fields: ['tenantId'] }
  ]
});

export default BankingProduct;