// packages/backend/src/modules/ifrs9/models/PortfolioAccount.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../core/database/connection';

export interface PortfolioAccountAttributes {
  id: string;
  legacyId?: string;
  accountId: string;
  customerId: string;
  contractId?: string;
  productType: string;
  outstandingAmount: number;
  committedAmount: number;
  originalAmount: number;
  currencyCode: string;
  originationDate: Date;
  maturityDate: Date;
  reportingDate: Date;
  currentStage: number;
  previousStage?: number;
  stageChangeDate?: Date;
  customerName: string;
  customerType: string;
  industrySector: string;
  internalRating?: string;
  externalRating?: string;
  pd12m?: number;
  pdLifetime?: number;
  lgd?: number;
  ead?: number;
  ecl12m?: number;
  eclLifetime?: number;
  isSyariahCompliant: boolean;
  syariahContractType?: string;
  syariahStructure?: string;
  profitSharingRatio?: number;
  underlyingAssetType?: string;
  assetOwnershipStructure?: string;
  syariahComplianceStatus?: string;
  syariahReviewDate?: Date;
  syariahBoardApprovalDate?: Date;
  aaoifiClassification?: string;
  accountStatus: string;
  isActive: boolean;
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface PortfolioAccountCreationAttributes 
  extends Optional<PortfolioAccountAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PortfolioAccount extends Model<PortfolioAccountAttributes, PortfolioAccountCreationAttributes>
  implements PortfolioAccountAttributes {
  
  public id!: string;
  public legacyId?: string;
  public accountId!: string;
  public customerId!: string;
  public contractId?: string;
  public productType!: string;
  public outstandingAmount!: number;
  public committedAmount!: number;
  public originalAmount!: number;
  public currencyCode!: string;
  public originationDate!: Date;
  public maturityDate!: Date;
  public reportingDate!: Date;
  public currentStage!: number;
  public previousStage?: number;
  public stageChangeDate?: Date;
  public customerName!: string;
  public customerType!: string;
  public industrySector!: string;
  public internalRating?: string;
  public externalRating?: string;
  public pd12m?: number;
  public pdLifetime?: number;
  public lgd?: number;
  public ead?: number;
  public ecl12m?: number;
  public eclLifetime?: number;
  public isSyariahCompliant!: boolean;
  public syariahContractType?: string;
  public syariahStructure?: string;
  public profitSharingRatio?: number;
  public underlyingAssetType?: string;
  public assetOwnershipStructure?: string;
  public syariahComplianceStatus?: string;
  public syariahReviewDate?: Date;
  public syariahBoardApprovalDate?: Date;
  public aaoifiClassification?: string;
  public accountStatus!: string;
  public isActive!: boolean;
  public tenantId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
  public updatedBy?: string;
}

PortfolioAccount.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  legacyId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  accountId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  customerId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  contractId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  productType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  outstandingAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  committedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  originalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  currencyCode: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  originationDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  maturityDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reportingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  currentStage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2, 3]]
    }
  },
  previousStage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isIn: [[1, 2, 3]]
    }
  },
  stageChangeDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  customerName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  customerType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  industrySector: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  internalRating: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  externalRating: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  pd12m: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true
  },
  pdLifetime: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true
  },
  lgd: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: true
  },
  ead: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true
  },
  ecl12m: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: true,
    defaultValue: 0
  },
  eclLifetime: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: true,
    defaultValue: 0
  },
  isSyariahCompliant: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  syariahContractType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  syariahStructure: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  profitSharingRatio: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true
  },
  underlyingAssetType: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  assetOwnershipStructure: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  syariahComplianceStatus: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  syariahReviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  syariahBoardApprovalDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  aaoifiClassification: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  accountStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'portfolio_accounts',
  schema: 'core',
  timestamps: true,
  indexes: [
    { fields: ['accountId'] },
    { fields: ['customerId'] },
    { fields: ['reportingDate'] },
    { fields: ['currentStage'] },
    { fields: ['tenantId'] },
    { fields: ['isSyariahCompliant'] }
  ]
});
