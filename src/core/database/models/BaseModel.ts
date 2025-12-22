// packages/backend/src/core/database/models/BaseModel.ts
import { 
  DataTypes, 
  Model, 
  ModelAttributes, 
  ModelOptions, 
  Sequelize, 
  CreationOptional, 
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize';

export interface BaseModelAttributes {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export abstract class BaseModel<TModelAttributes = any, TCreationAttributes = TModelAttributes> extends Model<
  InferAttributes<BaseModel & TModelAttributes>,
  InferCreationAttributes<BaseModel & TCreationAttributes>
> {
  declare id: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare createdBy: string | null;
  declare updatedBy: string | null;

  public static getBaseAttributes(): ModelAttributes {
    return {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'created_by',
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'updated_by',
      },
    };
  }

  public static getBaseOptions(tableName: string, schemaName?: string): ModelOptions {
    return {
      tableName,
      schema: schemaName,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      hooks: {
        beforeUpdate: (instance: any) => {
          instance.updatedAt = new Date();
        },
      },
    };
  }

  // Helper method to get model with user info
  public static async findByIdWithUser<T extends BaseModel>(
    this: new () => T,
    id: string,
    options: any = {}
  ): Promise<T | null> {
    return await (this as any).findByPk(id, {
      ...options,
      include: [
        ...(options.include || []),
        {
          association: 'Creator',
          attributes: ['id', 'full_name', 'email'],
          required: false,
        },
        {
          association: 'Updater',
          attributes: ['id', 'full_name', 'email'],
          required: false,
        },
      ],
    });
  }

  // Helper method to create with user tracking
  public static async createWithUser<T extends BaseModel>(
    this: new () => T,
    data: any,
    userId?: string,
    options: any = {}
  ): Promise<T> {
    return await (this as any).create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    }, options);
  }

  // Helper method to update with user tracking
  public async updateWithUser(
    data: any,
    userId?: string,
    options: any = {}
  ): Promise<this> {
    return await this.update({
      ...data,
      updatedBy: userId,
    }, options);
  }

  // Soft delete functionality
  public async softDelete(userId?: string): Promise<void> {
    if ('deletedAt' in this) {
      await this.update({
        deletedAt: new Date(),
        updatedBy: userId,
      } as any);
    }
  }

  // Restore soft deleted record
  public async restore(userId?: string): Promise<void> {
    if ('deletedAt' in this) {
      await this.update({
        deletedAt: null,
        updatedBy: userId,
      } as any);
    }
  }
}

export default BaseModel;
