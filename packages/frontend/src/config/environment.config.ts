// packages/frontend/src/config/environment.config.ts
// ============================================================================
// IFRS9 ENVIRONMENT CONFIGURATION - COMPLETE WITH ALL FUNCTIONS
// ============================================================================
// ✅ FIXED: Added ALL missing functions that providers expect
// ✅ This file provides complete environment configuration
// ============================================================================

// ✅ Simple config value getter function
export const getConfigValue = (key: string, defaultValue?: string): string => {
  // Check environment variables first
  if (typeof process !== 'undefined' && process.env) {
    const envValue = process.env[`NEXT_PUBLIC_${key}`] || process.env[key];
    if (envValue) return envValue;
  }

  // Check browser environment
  if (typeof window !== 'undefined' && (window as any).__CONFIG__) {
    const browserValue = (window as any).__CONFIG__[key];
    if (browserValue) return browserValue;
  }

  // Default configuration values
  const defaults: Record<string, string> = {
    APP_NAME: 'IFRS 9 Pro System',
    APP_VERSION: '2.0.0',
    ENVIRONMENT: 'development',
    API_URL: 'https://iaf-ifrs-be.danafin.com/api/v1',
    BANKING_MODE: 'conventional',
    PLATFORM_NAME: 'IFRS 9 Platform',
    COMPANY_NAME: 'Banking Institution'
  };

  return defaults[key] || defaultValue || '';
};

// ✅ Config helper functions
export const getBooleanConfig = (key: string, defaultValue = false): boolean => {
  const value = getConfigValue(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const getNumberConfig = (key: string, defaultValue: number): number => {
  const value = getConfigValue(key);
  if (!value) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const getArrayConfig = (key: string, defaultValue: string[] = []): string[] => {
  const value = getConfigValue(key);
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim());
};

// ✅ Types
export type StakeholderType = 'admin' | 'business' | 'consultant' | 'auditor';
export type BankingType = 'conventional' | 'syariah' | 'dual';

export enum ConfigCategory {
  APP = 'app',
  API = 'api',
  BANKING = 'banking',
  FEATURES = 'features',
  SECURITY = 'security',
  THEME = 'theme'
}

// ✅ Environment configuration interface
export interface EnvironmentConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    baseUrl: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  banking: {
    mode: 'conventional' | 'syariah' | 'dual';
    supportedModes: string[];
  };
  features: {
    rAnalytics: boolean;
    advancedWorkflow: boolean;
    consultantHub: boolean;
    multiTenant: boolean;
    auditTrail: boolean;
  };
  security: {
    jwtExpiry: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  // ✅ ADDED: Theme configuration
  theme: {
    defaultTheme: 'light' | 'dark';
  };
}

// ✅ Get complete environment configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    app: {
      name: getConfigValue('APP_NAME', 'IFRS 9 Pro System'),
      version: getConfigValue('APP_VERSION', '2.0.0'),
      environment: getConfigValue('ENVIRONMENT', 'development') as any,
      baseUrl: getConfigValue('BASE_URL', 'https://iaf-ifrs.danafin.com')
    },
    api: {
      baseUrl: getConfigValue('API_URL', 'https://iaf-ifrs-be.danafin.com/api/v1'),
      timeout: parseInt(getConfigValue('API_TIMEOUT', '30000')),
      retries: parseInt(getConfigValue('API_RETRIES', '3'))
    },
    banking: {
      mode: getConfigValue('BANKING_MODE', 'conventional') as any,
      supportedModes: ['conventional', 'syariah', 'dual']
    },
    features: {
      rAnalytics: getConfigValue('FEATURE_R_ANALYTICS', 'true') === 'true',
      advancedWorkflow: getConfigValue('FEATURE_WORKFLOW', 'true') === 'true',
      consultantHub: getConfigValue('FEATURE_CONSULTANT', 'true') === 'true',
      multiTenant: getConfigValue('FEATURE_MULTI_TENANT', 'true') === 'true',
      auditTrail: getConfigValue('FEATURE_AUDIT_TRAIL', 'true') === 'true'
    },
    security: {
      jwtExpiry: parseInt(getConfigValue('JWT_EXPIRY', '3600000')), // 1 hour
      sessionTimeout: parseInt(getConfigValue('SESSION_TIMEOUT', '1800000')), // 30 minutes
      maxLoginAttempts: parseInt(getConfigValue('MAX_LOGIN_ATTEMPTS', '5'))
    },
    theme: {
      defaultTheme: getConfigValue('THEME_DEFAULT', 'light') as 'light' | 'dark'
    }
  };
};

// ✅ ADDED: Initialize configuration function (required by providers)
export const initializeConfiguration = async (): Promise<EnvironmentConfig> => {
  try {
    console.log('🔧 Initializing IFRS9 configuration...');

    const config = getEnvironmentConfig();

    // Validate critical configuration
    if (!config.api.baseUrl) {
      throw new Error('API base URL not configured');
    }

    // Store in global for browser access
    if (typeof window !== 'undefined') {
      (window as any).__IFRS9_CONFIG__ = config;
    }

    console.log('✅ IFRS9 configuration initialized successfully');
    return config;

  } catch (error) {
    console.error('❌ Configuration initialization failed:', error);
    throw error;
  }
};

// ✅ ADDED: Diagnose environment function (required by providers)
export const diagnoseEnvironment = (): {
  isValid: boolean;
  issues: string[];
  config: EnvironmentConfig
} => {
  const issues: string[] = [];
  const config = getEnvironmentConfig();

  // Check critical values
  if (!config.app.name) {
    issues.push('App name not configured');
  }

  if (!config.api.baseUrl) {
    issues.push('API base URL not configured');
  }

  if (!['development', 'staging', 'production'].includes(config.app.environment)) {
    issues.push('Invalid environment value');
  }

  if (!['conventional', 'syariah', 'dual'].includes(config.banking.mode)) {
    issues.push('Invalid banking mode');
  }

  const isValid = issues.length === 0;

  if (isValid) {
    console.log('✅ Environment diagnosis: All checks passed');
  } else {
    console.warn('⚠️ Environment diagnosis: Issues found:', issues);
  }

  return { isValid, issues, config };
};

// ✅ ADDED: Validate configuration function
export const validateConfiguration = (config: EnvironmentConfig): boolean => {
  try {
    // Basic validation
    if (!config.app?.name || !config.api?.baseUrl) {
      return false;
    }

    // URL validation
    try {
      new URL(config.api.baseUrl);
    } catch {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// ✅ ADDED: Get runtime configuration
export const getRuntimeConfig = () => {
  const config = getEnvironmentConfig();

  return {
    ...config,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'N/A'
  };
};

// ✅ Export default configuration
export default getEnvironmentConfig;

// ✅ Export Alias for compatibility
export const createEnvironmentConfig = getEnvironmentConfig;

// ✅ Environment Helpers
export const isProduction = (): boolean => getConfigValue('ENVIRONMENT') === 'production';
export const isDevelopment = (): boolean => getConfigValue('ENVIRONMENT') === 'development';
export const isStaging = (): boolean => getConfigValue('ENVIRONMENT') === 'staging';

// ✅ Banking Mode Helpers
export const isIslamicBankingEnabled = (): boolean => {
  const mode = getConfigValue('BANKING_MODE');
  return mode === 'syariah' || mode === 'dual';
}
export const isConventionalBankingEnabled = (): boolean => {
  const mode = getConfigValue('BANKING_MODE');
  return mode === 'conventional' || mode === 'dual';
}
export const isDualBankingEnabled = (): boolean => getConfigValue('BANKING_MODE') === 'dual';

// ✅ API Configuration Helpers
export const getApiBaseUrl = (): string => getConfigValue('API_URL', 'http://iaf-ifrs-be.danafin.com/api/v1');
export const getApiTimeout = (): number => parseInt(getConfigValue('API_TIMEOUT', '30000'));
export const getApiRetries = (): number => parseInt(getConfigValue('API_RETRIES', '3'));

// ✅ Stakeholder Helper
export const getStakeholderType = (): StakeholderType => {
  return getConfigValue('STAKEHOLDER_TYPE', 'business') as StakeholderType;
}
