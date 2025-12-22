// packages/backend/src/config/app.config.ts
// ✅ Complete configuration service with all required properties

import dotenv from 'dotenv';
import { AppConfig, PlatformDbConfig } from '../types/config';

// Load environment variables
dotenv.config();

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue || '';
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  return value ? value.toLowerCase() === 'true' : defaultValue;
};

export const appConfig: AppConfig = {
  // Application Configuration
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  appName: getEnvVar('APP_NAME', 'IFRS Pro Platform'),
  appVersion: getEnvVar('APP_VERSION', '1.0.0'),
  appDebug: getEnvBoolean('APP_DEBUG', true),
  port: getEnvNumber('BACKEND_PORT', 4232),
  host: getEnvVar('HOST', '0.0.0.0'),
  frontendUrl: getEnvVar('FRONTEND_URL', 'https://ifrs9.ifrspro.id'),
  corsOrigins: getEnvVar('CORS_ORIGINS', 'http://localhost:3000,https://ifrs9.ifrspro.id').split(','),

  // Database Configuration
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvNumber('DB_PORT', 5432),
    username: getEnvVar('DB_USER', 'postgres'),
    password: getEnvVar('DB_PASSWORD', 'postgres'),
    database: getEnvVar('DB_NAME', 'ifrspro_platform_admin'),
    ssl: getEnvBoolean('DB_SSL', false),
    pool: {
      max: getEnvNumber('DB_POOL_MAX', 20),
      min: getEnvNumber('DB_POOL_MIN', 5),
      acquire: getEnvNumber('DB_POOL_ACQUIRE_TIMEOUT', 60000),
      idle: getEnvNumber('DB_POOL_IDLE_TIMEOUT', 10000),
    },
  },

  platformDb: {
    host: getEnvVar('DB_HOST', process.env.DS1_HOST || 'localhost'),
    port: getEnvNumber('DB_PORT', parseInt(process.env.DS1_PORT || '5432')),
    username: getEnvVar('DB_USER', process.env.DS1_USER || 'postgres'),
    password: getEnvVar('DB_PASSWORD', process.env.DS1_PASSWORD || 'postgres'),
    database: getEnvVar('PLATFORM_DB_NAME', 'ifrspro_platform_admin'),
    ssl: getEnvBoolean('DB_SSL', false),
    pool: {
      max: getEnvNumber('DB_POOL_MAX', 20),
      min: getEnvNumber('DB_POOL_MIN', 5),
      acquire: getEnvNumber('DB_POOL_ACQUIRE_TIMEOUT', 60000),
      idle: getEnvNumber('DB_POOL_IDLE_TIMEOUT', 10000),
    },
    // FRS9 Database Configuration
    frs9: {
      host: getEnvVar('FRS9_DB_HOST', process.env.DS2_HOST || 'localhost'),
      port: getEnvNumber('FRS9_DB_PORT', parseInt(process.env.DS2_PORT || '5433')),
      user: getEnvVar('FRS9_DB_USER', process.env.DS2_USER || 'postgres'),
      password: getEnvVar('FRS9_DB_PASSWORD', process.env.DS2_PASSWORD || 'postgres'),
      database: getEnvVar('FRS9_DB_NAME', 'FRS9PRO'),
      ssl: getEnvBoolean('FRS9_DB_SSL', false),
    },
  },

  sharedDb: {
    host: getEnvVar('DB_HOST', process.env.DS1_HOST || 'localhost'),
    port: getEnvNumber('DB_PORT', parseInt(process.env.DS1_PORT || '5432')),
    username: getEnvVar('DB_USER', process.env.DS1_USER || 'postgres'),
    password: getEnvVar('DB_PASSWORD', process.env.DS1_PASSWORD || 'postgres'),
    database: getEnvVar('SHARED_DB_NAME', 'ifrspro_shared_services'),
    ssl: getEnvBoolean('DB_SSL', false),
    pool: {
      max: getEnvNumber('DB_POOL_MAX', 20),
      min: getEnvNumber('DB_POOL_MIN', 5),
      acquire: getEnvNumber('DB_POOL_ACQUIRE_TIMEOUT', 60000),
      idle: getEnvNumber('DB_POOL_IDLE_TIMEOUT', 10000),
    },
  },

  // Redis Configuration
  redis: {
    host: getEnvVar('REDIS_HOST', 'localhost'),
    port: getEnvNumber('REDIS_PORT', 6379),
    password: process.env.REDIS_PASSWORD || '1234567890',
    db: getEnvNumber('REDIS_DB', 10),
    keyPrefix: getEnvVar('REDIS_KEY_PREFIX', 'ifrspro:'),
    timeout: getEnvNumber('REDIS_TIMEOUT', 5000),
  },

  // Security Configuration
  security: {
    bcryptRounds: getEnvNumber('BCRYPT_ROUNDS', 12),
    encryptionKey: getEnvVar('ENCRYPTION_KEY', 'your-encryption-key-here-32-characters'),
    saltRounds: getEnvNumber('SALT_ROUNDS', 12),
    rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
    rateLimitMaxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  // JWT Configuration
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '8h'),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  // Banking Configuration
  banking: {
    conventional: getEnvBoolean('BANKING_CONVENTIONAL', true),
    syariah: getEnvBoolean('BANKING_SYARIAH', true),
    dualMode: getEnvBoolean('BANKING_DUAL_MODE', true),
    islamicBankingEnabled: getEnvBoolean('ISLAMIC_BANKING_ENABLED', true),
    syariahComplianceRequired: getEnvBoolean('SYARIAH_COMPLIANCE_REQUIRED', true),
    aaoifiStandards: getEnvBoolean('AAOIFI_STANDARDS', true),
    halalScreeningEnabled: getEnvBoolean('HALAL_SCREENING_ENABLED', true),
  },

  // Multi-tenant Configuration
  multiTenant: {
    maxTenantConnections: getEnvNumber('MAX_TENANT_CONNECTIONS', 10),
    tenantConnectionTimeout: getEnvNumber('TENANT_CONNECTION_TIMEOUT', 1800000),
    defaultTenantTier: getEnvVar('DEFAULT_TENANT_TIER', 'basic'),
  },
  maxTenantConnections: getEnvNumber('MAX_TENANT_CONNECTIONS', 10),
  defaultTenantTier: getEnvVar('DEFAULT_TENANT_TIER', 'basic'),

  // Performance Configuration
  performance: {
    cacheTimeout: getEnvNumber('CACHE_TIMEOUT', 300),
    maxConcurrentCalc: getEnvNumber('MAX_CONCURRENT_CALC', 10),
    queryTimeout: getEnvNumber('QUERY_TIMEOUT', 30000),
    maxFileSize: getEnvVar('MAX_FILE_SIZE', '50MB'),
    maxUploadFiles: getEnvNumber('MAX_UPLOAD_FILES', 10),
  },

  // Monitoring Configuration
  monitoring: {
    healthCheckEnabled: getEnvBoolean('HEALTH_CHECK_ENABLED', true),
    healthCheckInterval: getEnvNumber('HEALTH_CHECK_INTERVAL', 30000),
    metricsCollectionEnabled: getEnvBoolean('METRICS_COLLECTION_ENABLED', true),
    metricsCollectionInterval: getEnvNumber('METRICS_COLLECTION_INTERVAL', 60000),
    performanceMonitoring: getEnvBoolean('PERFORMANCE_MONITORING', true),
  },

  // Logging Configuration
  logging: {
    level: getEnvVar('LOG_LEVEL', 'debug'),
    format: getEnvVar('LOG_FORMAT', 'combined'),
    fileEnabled: getEnvBoolean('LOG_FILE_ENABLED', true),
    directory: getEnvVar('LOG_DIR', 'logs'),
  },

  // Upload Configuration
  upload: {
    directory: getEnvVar('UPLOAD_DIR', 'uploads'),
    allowedFileTypes: getEnvVar('ALLOWED_FILE_TYPES', 'csv,xlsx,pdf').split(','),
    maxFileSize: getEnvVar('MAX_FILE_SIZE', '50MB'),
  },

  // Feature Flags
  features: {
    advancedAnalytics: getEnvBoolean('FEATURE_ADVANCED_ANALYTICS', true),
    islamicBanking: getEnvBoolean('FEATURE_ISLAMIC_BANKING', true),
    auditTrail: getEnvBoolean('FEATURE_AUDIT_TRAIL', true),
    stressTesting: getEnvBoolean('FEATURE_STRESS_TESTING', true),
    mobileApi: getEnvBoolean('FEATURE_MOBILE_API', true),
    workflowEngine: getEnvBoolean('FEATURE_WORKFLOW_ENGINE', true),
    etlPipeline: getEnvBoolean('FEATURE_ETL_PIPELINE', true),
  },

  // External APIs
  externalApis: {
    exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY,
    creditBureauApiKey: process.env.CREDIT_BUREAU_API_KEY,
  },

  // R Analytics Configuration
  rAnalytics: {
    url: getEnvVar('R_ANALYTICS_URL', 'https://rsak413.ifrspro.id'),
    timeout: getEnvNumber('R_ANALYTICS_TIMEOUT', 300000),
    maxMemoryMb: getEnvNumber('R_MAX_MEMORY_MB', 2048),
  },
};

// Default export
export default appConfig;