// packages/backend/src/core/models/user-role.model.ts
import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../database/connection';

// UserRole attributes interface (based on actual database schema from backup files)
export interface UserRoleAttributes {
  id: string;
  userId: string;
  roleId: string;
  
  // Assignment metadata
  assignedBy?: string;
  assignedAt: Date;
  
  // Status and validity
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
  
  // Banking context
  bankingTypeRestriction?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  
  // Temporary assignments
  isTemporary: boolean;
  temporaryReason?: string;
  
  // Tenant isolation
  tenantId: string;
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}

// Optional attributes for creation
interface UserRoleCreationAttributes extends Optional<UserRoleAttributes, 
  'id' | 'assignedBy' | 'assignedAt' | 'isActive' | 'validFrom' | 'validUntil' | 
  'bankingTypeRestriction' | 'isTemporary' | 'temporaryReason' | 'createdAt' | 'updatedAt'
> {}

// UserRole model class
export class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  public id!: string;
  public userId!: string;
  public roleId!: string;
  
  // Assignment metadata
  public assignedBy?: string;
  public assignedAt!: Date;
  
  // Status and validity
  public isActive!: boolean;
  public validFrom?: Date;
  public validUntil?: Date;
  
  // Banking context
  public bankingTypeRestriction?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  
  // Temporary assignments
  public isTemporary!: boolean;
  public temporaryReason?: string;
  
  // Tenant isolation
  public tenantId!: string;
  
  // Audit fields
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public isCurrentlyValid(): boolean {
    const now = new Date();
    
    if (!this.isActive) return false;
    
    if (this.validFrom && this.validFrom > now) return false;
    if (this.validUntil && this.validUntil < now) return false;
    
    return true;
  }

  public isValidForBankingType(bankingType: 'CONVENTIONAL' | 'SYARIAH'): boolean {
    if (!this.bankingTypeRestriction) return true;
    return this.bankingTypeRestriction === 'BOTH' || this.bankingTypeRestriction === bankingType;
  }

  public daysUntilExpiry(): number | null {
    if (!this.validUntil) return null;
    
    const now = new Date();
    const diff = this.validUntil.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  public async extendValidity(days: number): Promise<void> {
    if (this.validUntil) {
      this.validUntil = new Date(this.validUntil.getTime() + (days * 24 * 60 * 60 * 1000));
    } else {
      this.validUntil = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
    }
    await this.save();
  }
}

// Initialize the UserRole model
UserRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    
    // Assignment metadata
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    
    // Status and validity
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: true
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Banking context
    bankingTypeRestriction: {
      type: DataTypes.ENUM('CONVENTIONAL', 'SYARIAH', 'BOTH'),
      allowNull: true
    },
    
    // Temporary assignments
    isTemporary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    temporaryReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Tenant isolation
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    
    // Audit fields
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_roles',
    schema: 'core',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roleId'],
        name: 'unique_user_role'
      },
      {
        fields: ['userId']
      },
      {
        fields: ['roleId']
      },
      {
        fields: ['tenantId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['validFrom']
      },
      {
        fields: ['validUntil']
      },
      {
        fields: ['isTemporary']
      },
      {
        fields: ['bankingTypeRestriction']
      }
    ],
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      current: {
        where: {
          isActive: true
        }
      },
      temporary: {
        where: {
          isTemporary: true
        }
      },
      permanent: {
        where: {
          isTemporary: false
        }
      },
      byUser: (userId: string) => ({
        where: {
          userId
        }
      }),
      byRole: (roleId: string) => ({
        where: {
          roleId
        }
      }),
      byTenant: (tenantId: string) => ({
        where: {
          tenantId
        }
      }),
      byBankingType: (bankingType: string) => ({
        where: {
          bankingTypeRestriction: [bankingType, 'BOTH', null]
        }
      }),
      expiringWithin: (days: number) => ({
        where: {
          validUntil: {
            [Op.between]: [
              new Date(),
              new Date(Date.now() + (days * 24 * 60 * 60 * 1000))
            ]
          }
        }
      })
    }
  }
);

export default UserRole;