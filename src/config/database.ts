// packages/backend/src/config/database.ts
import { Sequelize, Options } from 'sequelize';
import { Dialect } from 'sequelize/types';
import logger from './logger';

interface DatabaseConfig {
  development: Options;
  staging: Options;
  production: Options;
}

interface TenantDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect: Dialect;
  logging: boolean | ((sql: string) => void);
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  dialectOptions: any;
}

// Platform database configuration
const databaseConfig: DatabaseConfig = {
  development: {
    host: process.env.PLATFORM_DB_HOST || 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com',
    port: parseInt(process.env.PLATFORM_DB_PORT || '5432'),
    username: process.env.PLATFORM_DB_USER || 'admin_iaf',
    password: process.env.PLATFORM_DB_PASSWORD || 'P@ssw0rd2025!',
    database: process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin',
    dialect: 'postgres',
    logging: (sql: string) => logger.debug('Database Query:', sql),
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: false,
      connectTimeout: 60000,
    },
  },
  staging: {
    host: process.env.PLATFORM_DB_HOST!,
    port: parseInt(process.env.PLATFORM_DB_PORT || '5432'),
    username: process.env.PLATFORM_DB_USER!,
    password: process.env.PLATFORM_DB_PASSWORD!,
    database: process.env.PLATFORM_DB_NAME!,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    host: process.env.PLATFORM_DB_HOST!,
    port: parseInt(process.env.PLATFORM_DB_PORT || '5432'),
    username: process.env.PLATFORM_DB_USER!,
    password: process.env.PLATFORM_DB_PASSWORD!,
    database: process.env.PLATFORM_DB_NAME!,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 50,
      min: 10,
      acquire: 60000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

// Tenant database configuration generator
export const generateTenantConfig = (tenantSlug: string, bankingType: 'conventional' | 'syariah' | 'dual'): TenantDatabaseConfig => {
  const dbName = `ifrspro_tenant_${tenantSlug}_${bankingType}`;

  return {
    host: process.env.TENANT_DB_HOST || process.env.PLATFORM_DB_HOST || 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com',
    port: parseInt(process.env.TENANT_DB_PORT || process.env.PLATFORM_DB_PORT || '5432'),
    username: process.env.TENANT_DB_USER || process.env.PLATFORM_DB_USER || `tenant_${tenantSlug}`,
    password: process.env.TENANT_DB_PASSWORD || process.env.PLATFORM_DB_PASSWORD || 'P@ssw0rd2025!',
    database: dbName,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ?
      (sql: string) => logger.debug(`Tenant DB [${tenantSlug}]:`, sql) : false,
    pool: {
      max: parseInt(process.env.TENANT_DB_POOL_MAX || '20'),
      min: parseInt(process.env.TENANT_DB_POOL_MIN || '2'),
      acquire: 60000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: false,
      connectTimeout: 60000,
    },
  };
};

// Shared services database configuration
export const sharedServicesConfig: TenantDatabaseConfig = {
  host: process.env.SHARED_DB_HOST || process.env.PLATFORM_DB_HOST || 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com',
  port: parseInt(process.env.SHARED_DB_PORT || process.env.PLATFORM_DB_PORT || '5432'),
  username: process.env.SHARED_DB_USER || process.env.PLATFORM_DB_USER || 'admin_iaf',
  password: process.env.SHARED_DB_PASSWORD || process.env.PLATFORM_DB_PASSWORD || 'P@ssw0rd2025!',
  database: process.env.SHARED_DB_NAME || 'ifrspro_shared_services',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ?
    (sql: string) => logger.debug('Shared Services DB:', sql) : false,
  pool: {
    max: 30,
    min: 5,
    acquire: 60000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: false,
    connectTimeout: 60000,
  },
};

export default databaseConfig;
export { DatabaseConfig, TenantDatabaseConfig };
