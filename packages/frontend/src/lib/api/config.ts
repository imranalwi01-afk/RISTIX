// packages/frontend/src/lib/api/config.ts
// ============================================================================
// 🎯 CENTRALIZED API CONFIGURATION - DUAL ENVIRONMENT SUPPORT
// ============================================================================
// ✅ AUTO-DETECTION: IAF Development ↔ IAF Production
// ✅ NO HARDCODING: All URLs from centralized config
// ✅ ENVIRONMENT AWARE: Switches based on hostname detection
// ============================================================================

// Import centralized configuration
import { frontendEnvironmentLoader } from '../../config/environment-loader-frontend';

// Load configuration with error handling
const loadConfig = () => {
  try {
    const config = frontendEnvironmentLoader.getConfiguration();
    return {
      // API URLs from centralized config
      BASE_URL: config.api.base,
      BACKEND_URL: config.api.backend,
      R_ANALYTICS_URL: config.rAnalytics.api,
      FRONTEND_URL: config.urls.frontend,
      WS_URL: config.urls.websocket,

      // Environment info
      ENVIRONMENT: config.environmentName,
      DEPLOYMENT_TARGET: config.deploymentTarget,
      IS_PRODUCTION: config.isProduction,
      IS_DEVELOPMENT: config.isLocalDev,

      // IAF Configuration
      IAF_TENANT: config.iaf.tenantId,
      IAF_BANKING_TYPE: config.iaf.bankingType,

      // Feature flags
      FEATURES: config.features
    };
  } catch (error) {
    console.warn('⚠️ Failed to load centralized config, using fallback:', error);

    // Fallback to environment variables
    return {
      BASE_URL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://iaf-ifrs-be.danafin.com/api/v1',
      BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://iaf-ifrs-be.danafin.com',
      R_ANALYTICS_URL: process.env.NEXT_PUBLIC_R_API_URL || 'https://iaf-ifrs-analytics-calc.danafin.com/api',
      FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://iaf-ifrs.danafin.com',
      WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://iaf-ifrs.danafin.com',

      ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production',
      DEPLOYMENT_TARGET: 'iaf-production',
      IS_PRODUCTION: true,
      IS_DEVELOPMENT: false,

      IAF_TENANT: 'iaf',
      IAF_BANKING_TYPE: 'conventional',

      FEATURES: {
        analytics: true,
        syariahMode: true,
        auditTrail: true
      }
    };
  }
};

// Export configuration
export const API_CONFIG = loadConfig();

// Export specific URLs for convenience
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const BACKEND_URL = API_CONFIG.BACKEND_URL;
export const R_ANALYTICS_URL = API_CONFIG.R_ANALYTICS_URL;
export const FRONTEND_URL = API_CONFIG.FRONTEND_URL;
export const WS_URL = API_CONFIG.WS_URL;

// ============================================================================
// 🔬 R ANALYTICS CONFIGURATION
// ============================================================================

export const R_ANALYTICS_CONFIG = {
  // R Analytics API endpoints
  SESSION_ENDPOINT: `${API_CONFIG.R_ANALYTICS_URL}/session`,
  HEALTH_ENDPOINT: `${API_CONFIG.R_ANALYTICS_URL}/health`,

  // R Shiny iframe URLs - Use centralized config
  IFRAME_BASE_URL: API_CONFIG.R_ANALYTICS_URL,

  // IAF-specific R URLs
  IAF_URL: API_CONFIG.R_ANALYTICS_URL,

  // Legacy tenant URLs (kept for compatibility) - Use IAF domains
  CONVENTIONAL_URL: API_CONFIG.R_ANALYTICS_URL,
  SYARIAH_URL: API_CONFIG.R_ANALYTICS_URL,
  DANA_URL: API_CONFIG.R_ANALYTICS_URL,

  // Session configuration
  MAX_SESSIONS_PER_USER: 3,
  SESSION_TIMEOUT: 3600000, // 1 hour in production
  HEARTBEAT_INTERVAL: 30000, // 30 seconds

  // Features
  ENABLED: true,
  IFRAME_SUPPORT: true,
  CROSS_FRAME_COMMUNICATION: true,
  CONTAINER_ORCHESTRATION: API_CONFIG.IS_PRODUCTION
};

// ============================================================================
// 🔐 AUTHENTICATION CONFIGURATION
// ============================================================================

export const AUTH_CONFIG = {
  // JWT Configuration
  TOKEN_STORAGE_KEY: 'ifrs9_auth_token',
  REFRESH_TOKEN_KEY: 'ifrs9_refresh_token',
  USER_STORAGE_KEY: 'ifrs9_user_data',

  // Token expiry
  TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutes before expiry
  AUTO_REFRESH_ENABLED: true,

  // Session configuration
  PERSISTENT_LOGIN: true,
  REMEMBER_ME_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Security
  SECURE_COOKIES: API_CONFIG.IS_PRODUCTION,
  SAME_SITE: API_CONFIG.IS_PRODUCTION ? 'strict' : 'lax',
  HTTP_ONLY: true
};

// ============================================================================
// 🌐 CORS & SECURITY CONFIGURATION
// ============================================================================

export const SECURITY_CONFIG = {
  // CORS origins - Use centralized config with dual environment support
  ALLOWED_ORIGINS: [
    // IAF ECS Production domains
    'https://iaf-ifrs.danafin.com',
    'https://iaf-ifrs-be.danafin.com',
    'https://iaf-ifrs-analytics.danafin.com',
    'https://iaf-ifrs-analytics-calc.danafin.com',
    // IAF Development domains
    'https://iaf-ifrs.ifrspro.id',
    'https://iaf-ifrs-be.ifrspro.id',
    'https://iaf-ifrs-analytics.ifrspro.id',
    'https://iaf-ifrs-analytics-calc.ifrspro.id'
  ],

  // CSP Configuration
  CSP_ENABLED: API_CONFIG.IS_PRODUCTION,
  FRAME_ANCESTORS: "'self' https://iaf-ifrs.danafin.com https://iaf-ifrs-be.danafin.com https://iaf-ifrs-analytics.danafin.com https://iaf-ifrs-analytics-calc.danafin.com https://iaf-ifrs.ifrspro.id https://iaf-ifrs-be.ifrspro.id https://iaf-ifrs-analytics.ifrspro.id https://iaf-ifrs-analytics-calc.ifrspro.id",

  // SSL Configuration
  SSL_ENABLED: true,
  HSTS_ENABLED: API_CONFIG.IS_PRODUCTION,
  FORCE_HTTPS: false // IAF uses HTTPS domains
};

// ============================================================================
// 🏦 BANKING CONFIGURATION
// ============================================================================

export const BANKING_CONFIG = {
  // Banking mode detection
  DEFAULT_MODE: API_CONFIG.IAF_BANKING_TYPE,
  SUPPORTED_MODES: ['conventional', 'syariah'],

  // Tenant configuration
  TENANT_ID: API_CONFIG.IAF_TENANT,
  TENANT_NAME: 'Indonesia Airawata Finance',

  // Product types
  PRODUCT_TYPES: {
    conventional: ['MORTGAGE', 'PERSONAL_LOAN', 'CREDIT_CARD', 'CORPORATE_LOAN'],
    syariah: ['MURABAHA', 'MUSHARAKA', 'MUDHARABA', 'IJARAH']
  },

  // IFRS9 configuration
  IFRS9_ENABLED: true,
  ECL_CALCULATION_ENABLED: true,
  STAGING_ANALYSIS_ENABLED: true
};

// ============================================================================
// 🌐 HTTP CONFIGURATION
// ============================================================================

export const HTTP_CONFIG = {
  // Request timeout
  TIMEOUT: 30000, // 30 seconds

  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second

  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// ============================================================================
// 🎨 UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  // Theme configuration
  DEFAULT_THEME: API_CONFIG.IAF_BANKING_TYPE,
  SUPPORTED_THEMES: ['conventional', 'syariah'],

  // Language configuration
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'id', 'ar'],

  // Currency configuration
  DEFAULT_CURRENCY: 'IDR',

  // Date format
  DEFAULT_DATE_FORMAT: 'DD/MM/YYYY',

  // Timezone
  DEFAULT_TIMEZONE: 'Asia/Jakarta'
};

// ============================================================================
// 🔧 HELPER FUNCTIONS
// ============================================================================

// Get R Analytics URL for specific tenant
export const getRAnalyticsUrl = (tenantType?: string): string => {
  return API_CONFIG.R_ANALYTICS_URL;
};

// Get API URL for specific endpoint
export const getApiUrl = (endpoint?: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
};

// Get R Analytics API URL for specific endpoint
export const getRAnalyticsApiUrl = (endpoint?: string): string => {
  const baseUrl = API_CONFIG.R_ANALYTICS_URL;
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
};

// Check if current environment is production
export const isProduction = (): boolean => {
  return API_CONFIG.IS_PRODUCTION;
};

// Check if current environment is development
export const isDevelopment = (): boolean => {
  return API_CONFIG.IS_DEVELOPMENT;
};

// Get environment name
export const getEnvironmentName = (): string => {
  return API_CONFIG.ENVIRONMENT;
};

// Get deployment target
export const getDeploymentTarget = (): string => {
  return API_CONFIG.DEPLOYMENT_TARGET;
};

// Export default configuration
export default {
  API_CONFIG,
  R_ANALYTICS_CONFIG,
  AUTH_CONFIG,
  SECURITY_CONFIG,
  BANKING_CONFIG,
  HTTP_CONFIG,
  UI_CONFIG,
  // Helper functions
  getRAnalyticsUrl,
  getApiUrl,
  getRAnalyticsApiUrl,
  isProduction,
  isDevelopment,
  getEnvironmentName,
  getDeploymentTarget
};