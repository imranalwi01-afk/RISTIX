// packages/backend/src/core/models/product-parameter.models.ts
import { DataTypes, Model } from 'sequelize';
import { frs9Sequelize } from './frs9-parameter.models';

// TypeScript interface for ProductParameter attributes
export interface ProductParameterAttributes {
  pkid?: number;
  data_source?: string;
  prd_group?: string;
  prd_type?: string;
  prd_code: string;
  prd_desc?: string;
  currency?: string;
  amortization_type?: string;
  al_flag?: string;
  impaired_flag?: boolean;
  bmi_flag?: boolean;
  expected_life?: number;
  borrowing_rate?: number;
  market_rate?: number;
  active_flag?: boolean;
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

// Sequelize model class for ProductParameter
export class ProductParameter extends Model<ProductParameterAttributes> implements ProductParameterAttributes {
  public pkid!: number;
  public data_source?: string;
  public prd_group?: string;
  public prd_type?: string;
  public prd_code!: string;
  public prd_desc?: string;
  public currency?: string;
  public amortization_type?: string;
  public al_flag?: string;
  public impaired_flag?: boolean;
  public bmi_flag?: boolean;
  public expected_life?: number;
  public borrowing_rate?: number;
  public market_rate?: number;
  public active_flag?: boolean;
  public createdby!: string;
  public createddate!: Date;
  public createdhost!: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;

  // Readonly timestamp properties
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the ProductParameter model
ProductParameter.init(
  {
    pkid: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    data_source: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Source system for product data'
    },
    prd_group: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Product group (KREDIT, DEPOSIT, INVESTMENT, etc.)'
    },
    prd_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Product type (KONSUMTIF, KOMERSIAL, MIKRO, etc.)'
    },
    prd_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Unique product code identifier'
    },
    prd_desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Product description'
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: 'Currency code (IDR, USD, etc.)'
    },
    amortization_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Amortization type (EFFECTIVE, STRAIGHT, etc.)'
    },
    al_flag: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'AL flag indicator'
    },
    impaired_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Impairment flag indicator'
    },
    bmi_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: 'Below Market Interest (BMI) flag indicator'
    },
    expected_life: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Expected life in months'
    },
    borrowing_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Borrowing rate percentage'
    },
    market_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Market rate percentage'
    },
    active_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: 'Active status flag'
    },
    createdby: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'User who created the record'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Creation timestamp'
    },
    createdhost: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Host/IP where record was created'
    },
    updatedby: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'User who last updated the record'
    },
    updateddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last update timestamp'
    },
    updatedhost: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Host/IP where record was last updated'
    }
  },
  {
    sequelize: frs9Sequelize,
    tableName: 'frs9_param_product',
    timestamps: false, // We manage timestamps manually
    underscored: false,
    indexes: [
      {
        name: 'idx_frs9_param_product_code',
        fields: ['prd_code']
      },
      {
        name: 'idx_frs9_param_product_group',
        fields: ['prd_group']
      },
      {
        name: 'idx_frs9_param_product_active',
        fields: ['active_flag']
      }
    ]
  }
);

// Helper function to create audit context for product parameters
export function createProductAuditContext(userEmail?: string, hostIp?: string) {
  const now = new Date();
  return {
    createdby: userEmail || 'SYSTEM',
    createddate: now,
    createdhost: hostIp || 'localhost',
    updatedby: userEmail || 'SYSTEM',
    updateddate: now,
    updatedhost: hostIp || 'localhost'
  };
}

// Export the model and utilities
export { ProductParameter as default };