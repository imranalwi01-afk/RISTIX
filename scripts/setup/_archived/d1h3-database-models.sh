#!/bin/bash
# scripts/setup/d1h3-database-models.sh
# IFRS9 Platform - Generate Database Models for Authentication (Based on Actual Schemas)

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h3-models-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate Role Model (based on actual database schema)
generate_role_model() {
    log_info "Generating Role Model (based on actual database schema)..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/models/role.model.ts" << 'EOF'
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
EOF

    log_success "Role Model generated successfully"
}

# Generate UserRole Model (junction table)
generate_user_role_model() {
    log_info "Generating UserRole Model (junction table)..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/models/user-role.model.ts" << 'EOF'
// packages/backend/src/core/models/user-role.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
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
          isActive: true,
          [sequelize.Op.or]: [
            { validFrom: null },
            { validFrom: { [sequelize.Op.lte]: new Date() } }
          ],
          [sequelize.Op.or]: [
            { validUntil: null },
            { validUntil: { [sequelize.Op.gte]: new Date() } }
          ]
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
            [sequelize.Op.between]: [
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
EOF

    log_success "UserRole Model generated successfully"
}

# Generate AuditLog Model
generate_audit_log_model() {
    log_info "Generating AuditLog Model (based on actual database schema)..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/models/audit-log.model.ts" << 'EOF'
// packages/backend/src/core/models/audit-log.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

// AuditLog attributes interface (based on actual database schema from backup files)
export interface AuditLogAttributes {
  id: string;
  legacyId?: number;
  
  // User and session context
  userId?: string;
  sessionId?: string;
  correlationId: string;
  
  // Event details
  eventType: string;
  action: string;
  description?: string;
  
  // Entity information
  entityType?: string;
  entityId?: string;
  entityName?: string;
  
  // Change tracking
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  
  // Request context
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
  
  // Application context
  applicationName?: string;
  moduleName?: string;
  functionName?: string;
  
  // Business context
  businessDate?: Date;
  calculationDate?: Date;
  
  // Risk and compliance
  riskLevel: string;
  complianceCategory?: string;
  
  // Performance metrics
  executionTimeMs?: number;
  
  // Tenant isolation
  tenantId?: string;
  
  // Timestamps
  timestamp: Date;
  createdAt: Date;
}

// Optional attributes for creation
interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 
  'id' | 'legacyId' | 'userId' | 'sessionId' | 'correlationId' | 'description' | 
  'entityType' | 'entityId' | 'entityName' | 'oldValues' | 'newValues' | 
  'changedFields' | 'ipAddress' | 'userAgent' | 'requestPath' | 'requestMethod' | 
  'applicationName' | 'moduleName' | 'functionName' | 'businessDate' | 
  'calculationDate' | 'riskLevel' | 'complianceCategory' | 'executionTimeMs' | 
  'tenantId' | 'timestamp' | 'createdAt'
> {}

// AuditLog model class
export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: string;
  public legacyId?: number;
  
  // User and session context
  public userId?: string;
  public sessionId?: string;
  public correlationId!: string;
  
  // Event details
  public eventType!: string;
  public action!: string;
  public description?: string;
  
  // Entity information
  public entityType?: string;
  public entityId?: string;
  public entityName?: string;
  
  // Change tracking
  public oldValues?: Record<string, any>;
  public newValues?: Record<string, any>;
  public changedFields?: string[];
  
  // Request context
  public ipAddress?: string;
  public userAgent?: string;
  public requestPath?: string;
  public requestMethod?: string;
  
  // Application context
  public applicationName?: string;
  public moduleName?: string;
  public functionName?: string;
  
  // Business context
  public businessDate?: Date;
  public calculationDate?: Date;
  
  // Risk and compliance
  public riskLevel!: string;
  public complianceCategory?: string;
  
  // Performance metrics
  public executionTimeMs?: number;
  
  // Tenant isolation
  public tenantId?: string;
  
  // Timestamps
  public timestamp!: Date;
  public readonly createdAt!: Date;

  // Instance methods
  public isHighRisk(): boolean {
    return this.riskLevel === 'high' || this.riskLevel === 'critical';
  }

  public isSecurityEvent(): boolean {
    return this.eventType === 'AUTHENTICATION' || 
           this.eventType === 'AUTHORIZATION' || 
           this.eventType === 'SECURITY';
  }

  public isDataChange(): boolean {
    return this.oldValues && Object.keys(this.oldValues).length > 0;
  }

  public getChangedFieldsCount(): number {
    return this.changedFields ? this.changedFields.length : 0;
  }

  public formatForCompliance(): Record<string, any> {
    return {
      timestamp: this.timestamp.toISOString(),
      user: this.userId,
      action: `${this.eventType}:${this.action}`,
      entity: this.entityType ? `${this.entityType}:${this.entityId}` : null,
      changes: this.getChangedFieldsCount(),
      risk: this.riskLevel,
      compliance: this.complianceCategory,
      tenant: this.tenantId
    };
  }
}

// Initialize the AuditLog model
AuditLog.init(
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
    
    // User and session context
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    correlationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    
    // Event details
    eventType: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Entity information
    entityType: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    entityId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    entityName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    
    // Change tracking
    oldValues: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    newValues: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    changedFields: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    },
    
    // Request context
    ipAddress: {
      type: DataTypes.INET,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requestPath: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    requestMethod: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    
    // Application context
    applicationName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    moduleName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    functionName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    
    // Business context
    businessDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    calculationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Risk and compliance
    riskLevel: {
      type: DataTypes.STRING(20),
      defaultValue: 'low',
      validate: {
        isIn: [['low', 'medium', 'high', 'critical']]
      }
    },
    complianceCategory: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    
    // Performance metrics
    executionTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    
    // Timestamps
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    schema: 'audit',
    timestamps: false, // We handle timestamps manually
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['tenantId']
      },
      {
        fields: ['eventType']
      },
      {
        fields: ['action']
      },
      {
        fields: ['entityType']
      },
      {
        fields: ['entityId']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['businessDate']
      },
      {
        fields: ['riskLevel']
      },
      {
        fields: ['complianceCategory']
      },
      {
        fields: ['sessionId']
      },
      {
        fields: ['correlationId']
      },
      {
        fields: ['ipAddress']
      },
      {
        // Composite index for common queries
        fields: ['tenantId', 'eventType', 'timestamp']
      },
      {
        // Composite index for user activity
        fields: ['userId', 'timestamp']
      },
      {
        // Composite index for entity tracking
        fields: ['entityType', 'entityId', 'timestamp']
      }
    ],
    scopes: {
      recent: {
        where: {
          timestamp: {
            [sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        order: [['timestamp', 'DESC']]
      },
      highRisk: {
        where: {
          riskLevel: ['high', 'critical']
        }
      },
      security: {
        where: {
          eventType: ['AUTHENTICATION', 'AUTHORIZATION', 'SECURITY']
        }
      },
      dataChanges: {
        where: {
          oldValues: {
            [sequelize.Op.ne]: null
          }
        }
      },
      byUser: (userId: string) => ({
        where: {
          userId
        },
        order: [['timestamp', 'DESC']]
      }),
      byTenant: (tenantId: string) => ({
        where: {
          tenantId
        }
      }),
      byEntity: (entityType: string, entityId?: string) => ({
        where: {
          entityType,
          ...(entityId && { entityId })
        },
        order: [['timestamp', 'DESC']]
      }),
      byDateRange: (startDate: Date, endDate: Date) => ({
        where: {
          timestamp: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        order: [['timestamp', 'DESC']]
      }),
      compliance: (category: string) => ({
        where: {
          complianceCategory: category
        },
        order: [['timestamp', 'DESC']]
      })
    }
  }
);

export default AuditLog;
EOF

    log_success "AuditLog Model generated successfully"
}

# Generate model associations and index file
generate_model_associations() {
    log_info "Generating Model Associations and Index..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/models/index.ts" << 'EOF'
// packages/backend/src/core/models/index.ts
import { Sequelize } from 'sequelize';
import User from './user.model';
import Role from './role.model';
import UserRole from './user-role.model';
import AuditLog from './audit-log.model';

// Import other models that will be created
// import Tenant from './tenant.model';
// import PortfolioAccount from './portfolio-account.model';

// Define model associations
export function defineAssociations(): void {
  // User <-> Role many-to-many through UserRole
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles'
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId',
    as: 'users'
  });

  // Direct associations with UserRole junction table
  User.hasMany(UserRole, {
    foreignKey: 'userId',
    as: 'userRoles'
  });

  Role.hasMany(UserRole, {
    foreignKey: 'roleId',
    as: 'userRoles'
  });

  UserRole.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  UserRole.belongsTo(Role, {
    foreignKey: 'roleId',
    as: 'role'
  });

  // UserRole assignment tracking
  UserRole.belongsTo(User, {
    foreignKey: 'assignedBy',
    as: 'assignedByUser'
  });

  // Audit log associations
  AuditLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  User.hasMany(AuditLog, {
    foreignKey: 'userId',
    as: 'auditLogs'
  });

  // Self-referencing associations for User (created/updated by)
  User.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  User.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });

  // Self-referencing associations for Role (created/updated by)
  Role.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  Role.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });

  // TODO: Add tenant associations when Tenant model is created
  // User.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
  // Role.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
  // UserRole.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
  // AuditLog.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
}

// Export all models
export {
  User,
  Role,
  UserRole,
  AuditLog
};

// Export types
export type {
  UserAttributes,
  RoleAttributes,
  UserRoleAttributes,
  AuditLogAttributes
} from './user.model';

export type {
  RoleAttributes as RoleModelAttributes
} from './role.model';

export type {
  UserRoleAttributes as UserRoleModelAttributes
} from './user-role.model';

export type {
  AuditLogAttributes as AuditLogModelAttributes
} from './audit-log.model';

// Database sync utility (for development only)
export async function syncModels(options: { force?: boolean; alter?: boolean } = {}): Promise<void> {
  try {
    // Define associations first
    defineAssociations();

    // Sync models in dependency order
    await Role.sync(options);
    await User.sync(options);
    await UserRole.sync(options);
    await AuditLog.sync(options);

    console.log('✅ Database models synchronized successfully');
  } catch (error) {
    console.error('❌ Database model synchronization failed:', error);
    throw error;
  }
}

// Model initialization utility
export async function initializeModels(): Promise<void> {
  try {
    // Define associations
    defineAssociations();

    // Validate all models
    await User.sync({ validate: true });
    await Role.sync({ validate: true });
    await UserRole.sync({ validate: true });
    await AuditLog.sync({ validate: true });

    console.log('✅ Database models initialized successfully');
  } catch (error) {
    console.error('❌ Database model initialization failed:', error);
    throw error;
  }
}

// Utility functions for common queries
export const ModelQueries = {
  // Get user with roles and permissions
  async getUserWithRoles(userId: string, tenantId?: string): Promise<User | null> {
    const whereClause: any = { id: userId, isActive: true };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    return await User.findOne({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'roles',
          through: {
            where: { isActive: true },
            attributes: ['assignedAt', 'validFrom', 'validUntil', 'isTemporary']
          },
          where: { isActive: true }
        }
      ]
    });
  },

  // Get role with users
  async getRoleWithUsers(roleId: string, tenantId?: string): Promise<Role | null> {
    const whereClause: any = { id: roleId, isActive: true };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    return await Role.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'users',
          through: {
            where: { isActive: true },
            attributes: ['assignedAt', 'validFrom', 'validUntil', 'isTemporary']
          },
          where: { isActive: true }
        }
      ]
    });
  },

  // Get active user roles
  async getActiveUserRoles(userId: string, tenantId?: string): Promise<UserRole[]> {
    const whereClause: any = { 
      userId, 
      isActive: true 
    };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    return await UserRole.scope('current').findAll({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'role',
          where: { isActive: true }
        }
      ]
    });
  },

  // Get audit trail for entity
  async getEntityAuditTrail(
    entityType: string, 
    entityId: string, 
    limit: number = 50
  ): Promise<AuditLog[]> {
    return await AuditLog.findAll({
      where: {
        entityType,
        entityId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'fullName']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit
    });
  },

  // Get user activity summary
  async getUserActivitySummary(
    userId: string, 
    fromDate: Date, 
    toDate: Date
  ): Promise<any> {
    return await AuditLog.findAll({
      where: {
        userId,
        timestamp: {
          [sequelize.Op.between]: [fromDate, toDate]
        }
      },
      attributes: [
        'eventType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('MAX', sequelize.col('timestamp')), 'lastActivity']
      ],
      group: ['eventType'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
  }
};

export default {
  User,
  Role,
  UserRole,
  AuditLog,
  defineAssociations,
  syncModels,
  initializeModels,
  ModelQueries
};
EOF

    log_success "Model Associations and Index generated successfully"
}

# Generate database migration script
generate_migration_script() {
    log_info "Generating Database Migration Script..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/database/migrations/001-auth-system.sql" << 'EOF'
-- packages/backend/src/core/database/migrations/001-auth-system.sql
-- IFRS9 Platform Authentication System Migration
-- Based on actual database schemas from backup files

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create core schema if not exists
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS audit;

-- ============================================================================
-- AUTHENTICATION SYSTEM TABLES (Based on actual schemas)
-- ============================================================================

-- Users table (enhanced from existing system)
CREATE TABLE IF NOT EXISTS core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER, -- For migration from existing system
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Multi-factor authentication
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    
    -- Banking access control
    banking_access VARCHAR(20) DEFAULT 'CONVENTIONAL' CHECK (banking_access IN ('CONVENTIONAL', 'SYARIAH', 'BOTH')),
    
    -- Syariah-specific fields
    syariah_certified BOOLEAN DEFAULT false,
    syariah_certification_date DATE,
    syariah_certification_level VARCHAR(50),
    
    -- Session management
    login_count INTEGER DEFAULT 0,
    current_session_id UUID,
    
    -- Security
    force_password_change BOOLEAN DEFAULT false,
    password_history JSONB DEFAULT '[]',
    
    -- Tenant isolation
    tenant_id UUID NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Roles table (enhanced from existing system)
CREATE TABLE IF NOT EXISTS core.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    
    -- Banking-specific role configuration
    banking_type_specific VARCHAR(20) CHECK (banking_type_specific IN ('CONVENTIONAL', 'SYARIAH', 'BOTH')),
    compliance_level VARCHAR(50),
    hierarchy_level INTEGER DEFAULT 1 CHECK (hierarchy_level >= 1 AND hierarchy_level <= 10),
    
    -- System roles (cannot be deleted/modified)
    is_system_role BOOLEAN DEFAULT false,
    
    -- Tenant isolation
    tenant_id UUID,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- User roles mapping (enhanced from existing system)
CREATE TABLE IF NOT EXISTS core.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    
    -- Assignment metadata
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status and validity
    is_active BOOLEAN DEFAULT true,
    valid_from DATE,
    valid_until DATE,
    
    -- Banking context
    banking_type_restriction VARCHAR(20) CHECK (banking_type_restriction IN ('CONVENTIONAL', 'SYARIAH', 'BOTH')),
    
    -- Temporary assignments
    is_temporary BOOLEAN DEFAULT false,
    temporary_reason TEXT,
    
    -- Tenant isolation
    tenant_id UUID NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- Audit logs table (comprehensive from existing system)
CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER, -- For migration
    
    -- User and session context
    user_id UUID,
    session_id VARCHAR(255),
    correlation_id UUID DEFAULT uuid_generate_v4(),
    
    -- Event details
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Entity information
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    entity_name VARCHAR(200),
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    
    -- Application context
    application_name VARCHAR(100),
    module_name VARCHAR(100),
    function_name VARCHAR(100),
    
    -- Business context
    business_date DATE,
    calculation_date DATE,
    
    -- Risk and compliance
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    compliance_category VARCHAR(50),
    
    -- Performance metrics
    execution_time_ms INTEGER,
    
    -- Tenant isolation
    tenant_id UUID,
    
    -- Timestamps
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- User table constraints
ALTER TABLE core.users
    ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES core.users(id),
    ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by) REFERENCES core.users(id);

-- Role table constraints
ALTER TABLE core.roles
    ADD CONSTRAINT fk_roles_created_by FOREIGN KEY (created_by) REFERENCES core.users(id),
    ADD CONSTRAINT fk_roles_updated_by FOREIGN KEY (updated_by) REFERENCES core.users(id);

-- User roles constraints
ALTER TABLE core.user_roles
    ADD CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id) REFERENCES core.roles(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES core.users(id);

-- Audit log constraints
ALTER TABLE audit.audit_logs
    ADD CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id) REFERENCES core.users(id);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

-- Core schema indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON core.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON core.users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON core.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON core.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_banking_access ON core.users(banking_access);
CREATE INDEX IF NOT EXISTS idx_users_syariah_certified ON core.users(syariah_certified);
CREATE INDEX IF NOT EXISTS idx_users_legacy_id ON core.users(legacy_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_email ON core.users(tenant_id, email);

CREATE INDEX IF NOT EXISTS idx_roles_name ON core.roles(role_name);
CREATE INDEX IF NOT EXISTS idx_roles_active ON core.roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON core.roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_banking_type ON core.roles(banking_type_specific);
CREATE INDEX IF NOT EXISTS idx_roles_system ON core.roles(is_system_role);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON core.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON core.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON core.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON core.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_valid_from ON core.user_roles(valid_from);
CREATE INDEX IF NOT EXISTS idx_user_roles_valid_until ON core.user_roles(valid_until);

-- Audit schema indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit.audit_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance ON audit.audit_logs(compliance_category);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_event_time ON audit.audit_logs(tenant_id, event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time ON audit.audit_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_time ON audit.audit_logs(entity_type, entity_id, timestamp);

-- ============================================================================
-- ROW LEVEL SECURITY (Tenant Isolation)
-- ============================================================================

-- Enable RLS on core tables
ALTER TABLE core.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.user_roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit tables
ALTER TABLE audit.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY tenant_isolation_users ON core.users
    USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_roles ON core.roles
    USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_user_roles ON core.user_roles
    USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_audit ON audit.audit_logs
    USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- ============================================================================
-- DEFAULT SYSTEM ROLES
-- ============================================================================

-- Insert default system roles (these will be created for each tenant)
INSERT INTO core.roles (id, role_name, description, permissions, is_system_role, banking_type_specific, hierarchy_level)
VALUES 
    (uuid_generate_v4(), 'PLATFORM_ADMIN', 'Platform Administrator with full system access', 
     '{"*": ["*"]}', true, 'BOTH', 10),
    
    (uuid_generate_v4(), 'TENANT_ADMIN', 'Tenant Administrator with full tenant access', 
     '{"tenant": ["*"], "users": ["*"], "roles": ["*"], "audit": ["read"]}', true, 'BOTH', 9),
    
    (uuid_generate_v4(), 'RISK_MANAGER', 'Risk Manager with portfolio and calculation access', 
     '{"portfolio": ["*"], "calculations": ["*"], "reports": ["*"], "audit": ["read"]}', true, 'BOTH', 8),
    
    (uuid_generate_v4(), 'SYARIAH_OFFICER', 'Syariah Officer with compliance oversight', 
     '{"syariah": ["*"], "compliance": ["*"], "audit": ["read"], "portfolio": ["read"]}', true, 'SYARIAH', 8),
    
    (uuid_generate_v4(), 'CREDIT_ANALYST', 'Credit Analyst with portfolio analysis access', 
     '{"portfolio": ["read", "analyze"], "calculations": ["read"], "reports": ["read"]}', true, 'BOTH', 6),
    
    (uuid_generate_v4(), 'MODEL_VALIDATOR', 'Model Validator with validation and approval rights', 
     '{"models": ["*"], "calculations": ["validate", "approve"], "audit": ["read"]}', true, 'BOTH', 7),
    
    (uuid_generate_v4(), 'DATA_ENTRY_USER', 'Data Entry User with limited portfolio access', 
     '{"portfolio": ["create", "read", "update"], "staging": ["*"]}', true, 'BOTH', 3),
    
    (uuid_generate_v4(), 'READ_ONLY_USER', 'Read-only access to reports and dashboards', 
     '{"reports": ["read"], "dashboards": ["read"], "portfolio": ["read"]}', true, 'BOTH', 1);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON core.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON core.roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON core.user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT (Optional)
-- ============================================================================

-- Note: This will be populated by the application during tenant creation
-- Sample data should be inserted through the application layer to ensure
-- proper tenant context and security
EOF

    log_success "Database Migration Script generated successfully"
}

# Main function
main() {
    log_info "Starting Database Models Generation for Authentication System..."
    
    # Create models directory if it doesn't exist
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/models"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/database/migrations"
    
    # Generate all database models
    generate_role_model
    generate_user_role_model
    generate_audit_log_model
    generate_model_associations
    generate_migration_script
    
    log_success "Database Models Generation completed successfully!"
    log_info "Generated files:"
    log_info "- Role Model: packages/backend/src/core/models/role.model.ts"
    log_info "- UserRole Model: packages/backend/src/core/models/user-role.model.ts"
    log_info "- AuditLog Model: packages/backend/src/core/models/audit-log.model.ts"
    log_info "- Models Index: packages/backend/src/core/models/index.ts"
    log_info "- Migration SQL: packages/backend/src/core/database/migrations/001-auth-system.sql"
}

# Execute main function with all arguments
main "$@"