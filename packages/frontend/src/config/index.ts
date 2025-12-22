// ============================================================================
// IFRS9 FRONTEND CONFIGURATION INDEX
// ============================================================================
// File Path: packages/frontend/src/config/index.ts
// Purpose: Central configuration exports
// Exports: All configuration utilities and types
// ============================================================================

// Export all configuration utilities
export {
  getConfigValue,
  getBooleanConfig,
  getNumberConfig,
  getArrayConfig,
  getEnvironmentConfig,
  initializeConfiguration,
  validateConfiguration,
  createEnvironmentConfig,
  isProduction,
  isDevelopment,
  isStaging,
  isIslamicBankingEnabled,
  isConventionalBankingEnabled,
  isDualBankingEnabled,
  getApiBaseUrl,
  getStakeholderType,
  ConfigCategory,
  type StakeholderType,
  type BankingType,
  type EnvironmentConfig,
} from './environment.config';

// Re-export default for direct imports
export { default } from './environment.config';

// Environment configuration constants for common use
export const CONFIG_KEYS = {
  // Application
  APP_NAME: 'APP_NAME',
  APP_VERSION: 'APP_VERSION',
  ENVIRONMENT: 'ENVIRONMENT',
  BASE_URL: 'BASE_URL',
  
  // API
  API_URL: 'API_URL',
  BACKEND_URL: 'BACKEND_URL',
  R_API_URL: 'R_API_URL',
  
  // Banking
  DEFAULT_BANKING_MODE: 'DEFAULT_BANKING_MODE',
  SYARIAH_MODE_ENABLED: 'SYARIAH_MODE_ENABLED',
  CONVENTIONAL_MODE_ENABLED: 'CONVENTIONAL_MODE_ENABLED',
  
  // Features
  ENABLE_ANALYTICS: 'ENABLE_ANALYTICS',
  ENABLE_R_INTEGRATION: 'ENABLE_R_INTEGRATION',
  ENABLE_REAL_TIME: 'ENABLE_REAL_TIME',
  
  // Islamic
  HIJRI_ENABLED: 'HIJRI_ENABLED',
  PRAYER_TIMES_ENABLED: 'PRAYER_TIMES_ENABLED',
  
  // Demo
  DEMO_MODE: 'DEMO_MODE',
  DEMO_PASSWORD: 'DEMO_PASSWORD',
} as const;

// Configuration validation rules
export const CONFIG_VALIDATION_RULES = {
  required: [
    'APP_NAME',
    'ENVIRONMENT',
    'API_URL',
  ],
  optional: [
    'APP_VERSION',
    'BASE_URL',
    'BACKEND_URL',
    'R_API_URL',
  ],
  boolean: [
    'SYARIAH_MODE_ENABLED',
    'CONVENTIONAL_MODE_ENABLED',
    'DUAL_BANKING_ENABLED',
    'ENABLE_ANALYTICS',
    'ENABLE_R_INTEGRATION',
    'HIJRI_ENABLED',
    'DEMO_MODE',
  ],
  number: [
    'REQUEST_TIMEOUT',
    'API_RETRY_ATTEMPTS',
  ],
} as const;