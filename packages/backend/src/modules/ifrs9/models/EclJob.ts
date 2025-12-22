// packages/backend/src/modules/ifrs9/models/EclJob.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../core/database/connection';

export interface EclJobAttributes {
  id: string;
  legacyId?: string;
  jobName: string;
  description?: string;
  calculationDate: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalAccounts?: number;
  processedAccounts?: number;
  parameters?: object;
  results?: object;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface EclJobCreationAttributes 
  extends Optional<EclJobAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class EclJob extends Model<EclJobAttributes, EclJobCreationAttributes>
  implements EclJobAttributes {
  
  public id!: string;
  public legacyId?: string;
  public jobName!: string;
  public description?: string;
  public calculationDate!: Date;
  public status!: 'pending' | 'running' | 'completed' | 'failed';
  public totalAccounts?: number;
  public processedAccounts?: number;
  public parameters?: object;
  public results?: object;
  public errorMessage?: string;
  public startedAt?: Date;
  public completedAt?: Date;
  public tenantId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
}

EclJob.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  legacyId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  jobName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  calculationDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  totalAccounts: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  processedAccounts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  parameters: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  results: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'ecl_jobs',
  schema: 'calculation',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['calculationDate'] },
    { fields: ['tenantId'] },
    { fields: ['createdBy'] }
  ]
});
