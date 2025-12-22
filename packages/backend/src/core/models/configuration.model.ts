// packages/backend/src/core/models/configuration.model.ts
// ============================================================================
// 🔧 CONFIGURATION MODEL - Database Storage for Configuration Settings
// ============================================================================
// Based on TodoList-v2.md Hour 4 requirements
// ============================================================================

import { DataTypes, Model, Optional, Sequelize, Op } from 'sequelize';
// Import database config instead of pre-configured connection
import { databaseConfig } from '../database/config/database.config';

// Configuration attributes interface
export interface ConfigurationAttributes {
  id: string;
  configKey: string;
  configValue: any;
  configType: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'encrypted';
  category: string;
  description?: string;
  
  // Tenant and environment context
  tenantId?: string;
  environment?: 'development' | 'staging' | 'production' | 'test';
  
  // Access control
  isPublic: boolean;
  isEncrypted: boolean;
  accessLevel: 'public' | 'internal' | 'admin' | 'system';
  
  // Metadata
  tags: string[];
  version: number;
  schema?: Record<string, any>;
  
  // Validation
  validationRules?: Record<string, any>;
  defaultValue?: any;
  isRequired: boolean;
  
  // Status and lifecycle
  isActive: boolean;
  deprecated: boolean;
  deprecationMessage?: string;
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Optional attributes for creation
interface ConfigurationCreationAttributes extends Optional<ConfigurationAttributes, 
  'id' | 'description' | 'tenantId' | 'environment' | 'isPublic' | 'isEncrypted' |
  'accessLevel' | 'tags' | 'version' | 'schema' | 'validationRules' | 'defaultValue' |
  'isRequired' | 'isActive' | 'deprecated' | 'deprecationMessage' | 'createdAt' |
  'updatedAt' | 'createdBy' | 'updatedBy'
> {}

// Configuration model class
export class Configuration extends Model<ConfigurationAttributes, ConfigurationCreationAttributes> 
  implements ConfigurationAttributes {
  
  public id!: string;
  public configKey!: string;
  public configValue!: any;
  public configType!: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'encrypted';
  public category!: string;
  public description?: string;
  
  // Tenant and environment context
  public tenantId?: string;
  public environment?: 'development' | 'staging' | 'production' | 'test';
  
  // Access control
  public isPublic!: boolean;
  public isEncrypted!: boolean;
  public accessLevel!: 'public' | 'internal' | 'admin' | 'system';
  
  // Metadata
  public tags!: string[];
  public version!: number;
  public schema?: Record<string, any>;
  
  // Validation
  public validationRules?: Record<string, any>;
  public defaultValue?: any;
  public isRequired!: boolean;
  
  // Status and lifecycle
  public isActive!: boolean;
  public deprecated!: boolean;
  public deprecationMessage?: string;
  
  // Audit fields
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
  public updatedBy?: string;

  // Instance methods
  public getTypedValue(): any {
    switch (this.configType) {
      case 'number':
        return Number(this.configValue);
      case 'boolean':
        return Boolean(this.configValue);
      case 'json':
        return typeof this.configValue === 'string' 
          ? JSON.parse(this.configValue) 
          : this.configValue;
      case 'array':
        return Array.isArray(this.configValue) 
          ? this.configValue 
          : JSON.parse(this.configValue);
      case 'encrypted':
        // Encrypted values should be decrypted in service layer
        return this.configValue;
      default:
        return String(this.configValue);
    }
  }

  public validateValue(value: any): boolean {
    try {
      // Basic type validation
      switch (this.configType) {
        case 'number':
          if (isNaN(Number(value))) return false;
          break;
        case 'boolean':
          if (typeof value !== 'boolean' && !['true', 'false', '1', '0'].includes(String(value))) {
            return false;
          }
          break;
        case 'json':
          try {
            if (typeof value === 'string') JSON.parse(value);
          } catch {
            return false;
          }
          break;
        case 'array':
          if (!Array.isArray(value) && typeof value !== 'string') return false;
          break;
      }

      // Custom validation rules
      if (this.validationRules) {
        // Implementation for custom validation rules
        // This could include min/max values, regex patterns, etc.
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  public isValidForEnvironment(environment: string): boolean {
    return !this.environment || this.environment === environment;
  }

  public isAccessibleBy(accessLevel: string): boolean {
    const hierarchy = {
      'public': 0,
      'internal': 1,
      'admin': 2,
      'system': 3
    };
    
    return hierarchy[accessLevel] >= hierarchy[this.accessLevel];
  }

  public toSafeObject(): Partial<ConfigurationAttributes> {
    return {
      id: this.id,
      configKey: this.configKey,
      configValue: this.isEncrypted ? '***ENCRYPTED***' : this.configValue,
      configType: this.configType,
      category: this.category,
      description: this.description,
      tenantId: this.tenantId,
      environment: this.environment,
      isPublic: this.isPublic,
      accessLevel: this.accessLevel,
      tags: this.tags,
      version: this.version,
      deprecated: this.deprecated,
      deprecationMessage: this.deprecationMessage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Get Sequelize instance from database config
let sequelizeInstance: Sequelize | null = null;

export const getConfigurationModel = async (): Promise<typeof Configuration> => {
  if (!sequelizeInstance) {
    // Use raw connection to create Sequelize instance
    const pool = databaseConfig.getPlatformConnection();
    
    // Create Sequelize instance using connection details
    sequelizeInstance = new Sequelize({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'ifrspro_platform_admin',
      username: 'postgres',
      password: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    // Initialize model with the Sequelize instance
    Configuration.init(
      {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    configKey: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'config_key'
    },
    configValue: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'config_value'
    },
    configType: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'array', 'encrypted'),
      allowNull: false,
      defaultValue: 'string',
      field: 'config_type'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Tenant and environment context
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'tenant_id'
    },
    environment: {
      type: DataTypes.ENUM('development', 'staging', 'production', 'test'),
      allowNull: true
    },
    
    // Access control
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_public'
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_encrypted'
    },
    accessLevel: {
      type: DataTypes.ENUM('public', 'internal', 'admin', 'system'),
      defaultValue: 'internal',
      field: 'access_level'
    },
    
    // Metadata
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    schema: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    
    // Validation
    validationRules: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'validation_rules'
    },
    defaultValue: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'default_value'
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_required'
    },
    
    // Status and lifecycle
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    deprecated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deprecationMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'deprecation_message'
    },
    
    // Audit fields
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'updated_by'
    }
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Configuration',
    tableName: 'configuration',
    schema: 'platform_admin',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['config_key', 'tenant_id', 'environment'],
        name: 'unique_config_key_tenant_env'
      },
      {
        fields: ['category']
      },
      {
        fields: ['tenant_id']
      },
      {
        fields: ['environment']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['access_level']
      },
      {
        fields: ['deprecated']
      },
      {
        fields: ['tags'],
        using: 'gin'
      }
    ],
    scopes: {
      active: {
        where: {
          isActive: true,
          deprecated: false
        }
      },
      public: {
        where: {
          isPublic: true,
          isActive: true
        }
      },
      byCategory: (category: string) => ({
        where: {
          category,
          isActive: true
        }
      }),
      byTenant: (tenantId: string | null) => ({
        where: {
          tenantId,
          isActive: true
        }
      }),
      byEnvironment: (environment: string) => ({
        where: {
          [Op.or]: [
            { environment },
            { environment: null }
          ],
          isActive: true
        }
      }),
      byAccessLevel: (accessLevel: string) => ({
        where: {
          accessLevel: {
            [Op.in]: getAccessLevels(accessLevel)
          },
          isActive: true
        }
      })
    },
    hooks: {
      beforeUpdate: (configuration: Configuration) => {
        configuration.version += 1;
      },
      afterUpdate: (configuration: Configuration) => {
        // Could trigger cache invalidation here
        console.log(`Configuration updated: ${configuration.configKey}`);
      }
    }
  });
  }
  
  return Configuration;
};

// Helper function for access level hierarchy
function getAccessLevels(userLevel: string): string[] {
  const hierarchy = {
    'system': ['system', 'admin', 'internal', 'public'],
    'admin': ['admin', 'internal', 'public'],
    'internal': ['internal', 'public'],
    'public': ['public']
  };
  
  return hierarchy[userLevel] || ['public'];
}

export default Configuration;