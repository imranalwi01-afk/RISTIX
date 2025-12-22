// packages/backend/src/core/models/audit-log.model.ts
import { DataTypes, Model, Optional, Op } from 'sequelize';
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
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
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
            [Op.ne]: null
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
            [Op.between]: [startDate, endDate]
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