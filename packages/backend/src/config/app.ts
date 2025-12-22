// packages/backend/src/config/app.ts
// ✅ SMART ENVIRONMENT LOADER: Seamless LOCALDEV/IAFECS switching

import { backendEnvironmentLoader } from './environment-loader-backend';

// 🔧 FIXED: Handle empty strings properly - they are valid values!
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  // ✅ FIXED: Check for undefined specifically, not falsy values
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  // ✅ FIXED: Return empty string if that's what's set in env
  return value !== undefined ? value : (defaultValue || '');
};

// Helper function for optional env vars
const getOptionalEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  return value !== undefined ? value : (defaultValue || '');
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  return value ? value.toLowerCase() === 'true' : defaultValue;
};

// ✅ Load smart environment configuration
const envConfig = backendEnvironmentLoader.getConfiguration();

// ✅ Unified configuration object using smart environment loader
const appConfig = {
  // Application basics
  appName: getEnvVar('APP_NAME', 'IAF_IFRS9_Platform_Backend_Local'),
  appVersion: '1.0.0',
  nodeEnv: envConfig.deployment.nodeEnv,
  deploymentTarget: envConfig.deployment.environment,

  // Server configuration
  host: envConfig.servers.backend.host,
  port: envConfig.servers.backend.port,
  frontendUrl: envConfig.urls.frontend,
  backendUrl: envConfig.urls.backend,

  // CORS configuration
  corsOrigins: envConfig.cors.origins,

  // Database configuration
  platformDbHost: envConfig.database.platform.host,
  platformDbPort: envConfig.database.platform.port,
  platformDbUser: envConfig.database.platform.user,
  platformDbPassword: envConfig.database.platform.password,

  // JWT secrets (from environment variables)
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtRefreshSecret: getEnvVar('JWT_REFRESH_SECRET'),

  // Complete database configuration
  database: envConfig.database,

  // Server URLs
  urls: envConfig.urls,

  // Security configuration (using basic object since security section doesn't exist)
  security: {
    corsOrigins: envConfig.cors.origins
  },

  // Tenant configuration (using environment variables)
  tenant: {
    id: getEnvVar('TENANT_ID', 'iaf'),
    mode: getEnvVar('TENANT_MODE', 'single'),
    defaultTenant: getEnvVar('DEFAULT_TENANT', 'iaf')
  },

  // Feature flags (from environment variables)
  features: {
    multiTenant: getEnvBoolean('FEATURE_MULTI_TENANT', false),
    rAnalytics: getEnvBoolean('FEATURE_R_ANALYTICS', true),
    auditTrail: getEnvBoolean('FEATURE_AUDIT_TRAIL', true),
    islamicBanking: getEnvBoolean('FEATURE_ISLAMIC_BANKING', true),
    advancedAnalytics: getEnvBoolean('FEATURE_ADVANCED_ANALYTICS', true),
    stressTesting: getEnvBoolean('FEATURE_STRESS_TESTING', true),
    mobileApi: getEnvBoolean('FEATURE_MOBILE_API', true),
    workflowManagement: getEnvBoolean('FEATURE_WORKFLOW_MANAGEMENT', true)
  },
  
  // Banking features (required by app.ts)
  islamicBankingEnabled: getEnvBoolean('ISLAMIC_BANKING_ENABLED', true),
  syariahComplianceRequired: getEnvBoolean('SYARIAH_COMPLIANCE_REQUIRED', true),
  aaoifiStandards: getEnvBoolean('AAOIFI_STANDARDS', true),
  
  // Rate limiting
  rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
  rateLimitMaxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  
  // Logging configuration (required by logger)
  logLevel: getEnvVar('LOG_LEVEL', 'debug'),
  logFileEnabled: getEnvBoolean('LOG_FILE_ENABLED', true),
  logDir: getEnvVar('LOG_DIR', 'logs'),
  
  // Multi-tenant configuration
  maxTenantConnections: getEnvNumber('MAX_TENANT_CONNECTIONS', 10),
  defaultTenantTier: getEnvVar('DEFAULT_TENANT_TIER', 'basic'),
  
  // File upload configuration
  uploadDir: getEnvVar('UPLOAD_DIR', 'uploads'),
  maxFileSize: getEnvVar('MAX_FILE_SIZE', '50MB'),
  
  // 🔧 FIXED: Redis configuration with proper defaults
  redisHost: getEnvVar('REDIS_HOST', 'localhost'),
  redisPort: getEnvNumber('REDIS_PORT', 6379),
  redisPassword: getOptionalEnvVar('REDIS_PASSWORD', ''), // ✅ Optional password
  
  // Performance monitoring
  healthCheckEnabled: getEnvBoolean('HEALTH_CHECK_ENABLED', true),
  performanceMonitoring: getEnvBoolean('PERFORMANCE_MONITORING', true),
  
  // Development helpers
  debug: getEnvBoolean('APP_DEBUG', true)
};

// ✅ Validation for critical settings
if (!appConfig.jwtSecret || appConfig.jwtSecret.includes('change-in-production')) {
  console.warn('⚠️  WARNING: Using development JWT secret. Please set strong JWT_SECRET in production!');
}

if (!appConfig.jwtRefreshSecret || appConfig.jwtRefreshSecret.includes('change-in-production')) {
  console.warn('⚠️  WARNING: Using development JWT refresh secret. Please set strong JWT_REFRESH_SECRET in production!');
}

// ✅ Redis connection validation
if (appConfig.redisPassword === '') {
  console.info('ℹ️  Redis configured without password (development mode)');
} else {
  console.info('ℹ️  Redis configured with password authentication');
}

// ✅ Export as default for app.ts compatibility
export default appConfig;

// ✅ Export as named export for flexibility
export { appConfig };