// packages/backend/src/core/models/customer.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

export interface CustomerAttributes {
  id: string;
  legacyId?: string;
  customerId: string;
  customerName: string;
  customerType: string;
  customerSegment: string;
  industryCode?: string;
  taxId?: string;
  bankingType: 'conventional' | 'syariah';
  riskRating?: string;
  totalExposure?: number;
  numberOfAccounts?: number;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CustomerCreationAttributes
  extends Optional<CustomerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Customer extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes {

  public id!: string;
  public legacyId?: string;
  public customerId!: string;
  public customerName!: string;
  public customerType!: string;
  public customerSegment!: string;
  public industryCode?: string;
  public taxId?: string;
  public bankingType!: 'conventional' | 'syariah';
  public riskRating?: string;
  public totalExposure?: number;
  public numberOfAccounts?: number;
  public contactEmail?: string;
  public contactPhone?: string;
  public address?: string;
  public city?: string;
  public country?: string;
  public postalCode?: string;
  public isActive!: boolean;
  public tenantId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
  public updatedBy?: string;
}

Customer.init({
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
  customerId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique customer identifier'
  },
  customerName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Customer legal name'
  },
  customerType: {
    type: DataTypes.ENUM('INDIVIDUAL', 'CORPORATE', 'SME', 'MICRO'),
    allowNull: false,
    comment: 'Customer classification type'
  },
  customerSegment: {
    type: DataTypes.ENUM('RETAIL', 'COMMERCIAL', 'SME', 'MICRO', 'PREMIUM', 'ENTERPRISE'),
    allowNull: false,
    comment: 'Customer market segment'
  },
  industryCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Industry classification code'
  },
  taxId: {
    type: DataTypes.STRING(30),
    allowNull: true,
    comment: 'Tax identification number'
  },
  bankingType: {
    type: DataTypes.ENUM('conventional', 'syariah'),
    allowNull: false,
    defaultValue: 'conventional',
    comment: 'Banking type preference'
  },
  riskRating: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Customer risk rating'
  },
  totalExposure: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Total credit exposure across all accounts'
  },
  numberOfAccounts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Number of active accounts'
  },
  contactEmail: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Primary contact email'
  },
  contactPhone: {
    type: DataTypes.STRING(30),
    allowNull: true,
    comment: 'Primary contact phone'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Customer address'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Customer city'
  },
  country: {
    type: DataTypes.STRING(3),
    allowNull: true,
    defaultValue: 'ID',
    comment: 'Customer country code'
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Postal code'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Customer active status'
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Tenant identifier for multi-tenancy'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User who created the record'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User who last updated the record'
  }
}, {
  sequelize,
  tableName: 'customers',
  schema: 'core',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['customerName'] },
    { fields: ['customerType'] },
    { fields: ['bankingType'] },
    { fields: ['isActive'] },
    { fields: ['tenantId'] }
  ]
});

export default Customer;