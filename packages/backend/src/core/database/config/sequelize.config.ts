// packages/backend/src/core/database/config/sequelize.config.ts
// ✅ Sequelize Configuration for Multi-Tenant Architecture
// MANDATORY: Follows exact patterns from 001-006-008-coding-standards.md

import { Options as SequelizeOptions } from 'sequelize';
import { configService } from '../../services/configuration/configuration.service';

interface DatabaseConfig extends SequelizeOptions {
  database: string;
  username: string;
  password: string;
  host: string;
  port: number;
}

// ✅ Platform Admin Database Configuration
export const platformAdminConfig: DatabaseConfig = {
  database: 'ifrspro_platform_admin',
  username: configService.getDatabaseConfig().username,
  password: configService.getDatabaseConfig().password,
  host: configService.getDatabaseConfig().host,
  port: configService.getDatabaseConfig().port,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    application_name: 'ifrs9_platform_admin'
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    paranoid: false // Platform admin uses actual deletes
  },
  // MANDATORY: Schema search path from backup structure
  searchPath: ['platform_admin', 'platform_audit', 'platform_analytics', 'platform_billing', 'public']
};

// ✅ Shared Services Database Configuration  
export const sharedServicesConfig: DatabaseConfig = {
  database: 'ifrspro_shared_services',
  username: configService.getDatabaseConfig().username,
  password: configService.getDatabaseConfig().password,
  host: configService.getDatabaseConfig().host,
  port: configService.getDatabaseConfig().port,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 15,
    min: 3,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    application_name: 'ifrs9_shared_services'
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  // MANDATORY: Schema search path for shared services
  searchPath: ['reference_data', 'calculation_engine', 'menu', 'notification', 'public']
};

// ✅ Tenant Database Configuration Factory
export const createTenantConfig = (
  tenantSlug: string, 
  bankingType: 'conventional' | 'syariah'
): DatabaseConfig => {
  const databaseName = `ifrspro_tenant_demo_${bankingType}`;
  
  return {
    database: databaseName,
    username: configService.getDatabaseConfig().username,
    password: configService.getDatabaseConfig().password,
    host: configService.getDatabaseConfig().host,
    port: configService.getDatabaseConfig().port,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? 
      (sql: string) => console.log(`[TENANT:${tenantSlug}] ${sql}`) : 
      false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      application_name: `ifrs9_tenant_${tenantSlug}`
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      paranoid: true // Tenant data uses soft deletes
    },
    // MANDATORY: Schema search path based on database analysis
    searchPath: bankingType === 'syariah' 
      ? ['core', 'calculation', 'staging', 'audit', 'workflow', 'configuration', 'syariah_compliance', 'islamic_economics', 'public']
      : ['core', 'calculation', 'staging', 'audit', 'workflow', 'configuration', 'external_integration', 'data_quality', 'public']
  };
};

// ✅ Environment-specific configurations
export const getEnvironmentConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return {
        logging: false,
        pool: { max: 50, min: 10 },
        dialectOptions: {
          ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      };
    case 'staging':
      return {
        logging: false,
        pool: { max: 30, min: 5 },
        dialectOptions: {
          ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      };
    case 'test':
      return {
        logging: false,
        pool: { max: 5, min: 1 }
      };
    default: // development
      return {
        logging: console.log,
        pool: { max: 20, min: 5 }
      };
  }
};

// ✅ Connection validation
export const validateDatabaseConfig = (config: DatabaseConfig): boolean => {
  const required = ['database', 'username', 'password', 'host', 'port'];
  return required.every(field => config[field as keyof DatabaseConfig] !== undefined);
};

// ✅ Export all configurations
export default {
  platformAdminConfig,
  sharedServicesConfig,
  createTenantConfig,
  getEnvironmentConfig,
  validateDatabaseConfig
};