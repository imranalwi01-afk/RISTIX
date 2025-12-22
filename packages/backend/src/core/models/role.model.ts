// packages/backend/src/core/models/role.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

// Role attributes interface (based on actual database schema from backup files)
export interface RoleAttributes {
  id: string;
  legacyId?: number;
  roleName: string;
  description?: string;
  permissions: Record<string, any>;
  isActive: boolean;
  
  // Banking-specific role configuration
  bankingTypeSpecific?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  complianceLevel?: string;
  hierarchyLevel: number;
  
  // System roles (cannot be deleted/modified)
  isSystemRole: boolean;
  
  // Tenant isolation
  tenantId?: string;
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Optional attributes for creation
interface RoleCreationAttributes extends Optional<RoleAttributes, 
  'id' | 'legacyId' | 'description' | 'permissions' | 'isActive' | 
  'bankingTypeSpecific' | 'complianceLevel' | 'hierarchyLevel' | 'isSystemRole' | 
  'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
> {}

// Role model class
export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public legacyId?: number;
  public roleName!: string;
  public description?: string;
  public permissions!: Record<string, any>;
  public isActive!: boolean;
  
  // Banking-specific role configuration
  public bankingTypeSpecific?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  public complianceLevel?: string;
  public hierarchyLevel!: number;
  
  // System roles (cannot be deleted/modified)
  public isSystemRole!: boolean;
  
  // Tenant isolation
  public tenantId?: string;
  
  // Audit fields
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
  public updatedBy?: string;

  // Instance methods
  public hasPermission(resource: string, action: string): boolean {
    if (!this.permissions) return false;
    
    const resourcePerms = this.permissions[resource];
    if (!resourcePerms) return false;
    
    return resourcePerms.includes(action) || resourcePerms.includes('*');
  }

  public isBankingCompatible(bankingType: 'CONVENTIONAL' | 'SYARIAH'): boolean {
    if (!this.bankingTypeSpecific) return true;
    return this.bankingTypeSpecific === 'BOTH' || this.bankingTypeSpecific === bankingType;
  }

  public canBeAssignedToUser(userComplianceLevel?: string): boolean {
    if (!this.complianceLevel) return true;
    if (!userComplianceLevel) return false;
    
    // Implement compliance level comparison logic
    return userComplianceLevel >= this.complianceLevel;
  }
}

// Initialize the Role model
Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    legacyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'For migration from existing system'
    },
    roleName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    
    // Banking-specific role configuration
    bankingTypeSpecific: {
      type: DataTypes.ENUM('CONVENTIONAL', 'SYARIAH', 'BOTH'),
      allowNull: true
    },
    complianceLevel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    hierarchyLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    
    // System roles (cannot be deleted/modified)
    isSystemRole: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    
    // Tenant isolation
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
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
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    schema: 'core',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['roleName']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['tenantId']
      },
      {
        fields: ['bankingTypeSpecific']
      },
      {
        fields: ['hierarchyLevel']
      },
      {
        fields: ['isSystemRole']
      }
    ],
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      system: {
        where: {
          isSystemRole: true
        }
      },
      userDefined: {
        where: {
          isSystemRole: false
        }
      },
      byTenant: (tenantId: string) => ({
        where: {
          tenantId
        }
      }),
      byBankingType: (bankingType: string) => ({
        where: {
          bankingTypeSpecific: [bankingType, 'BOTH', null]
        }
      }),
      byHierarchy: (maxLevel: number) => ({
        where: {
          hierarchyLevel: {
            [sequelize.Op.lte]: maxLevel
          }
        }
      })
    }
  }
);

export default Role;
