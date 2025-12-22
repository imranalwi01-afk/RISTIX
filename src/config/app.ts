// packages/backend/src/config/app.ts
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') });

interface AppConfig {
  nodeEnv: string;
  appName: string;
  appVersion: string;
  port: number;
  
  // Security
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  bcryptRounds: number;
  
  // CORS
  corsOrigins: string[];
  corsCredentials: boolean;
  
  // Rate limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // File upload
  maxFileSize: string;
  uploadDir: string;
  allowedFileTypes: string[];
  
  // Islamic Banking
  islamicBankingEnabled: boolean;
  syariahComplianceRequired: boolean;
  aaoifiStandards: boolean;
  halalScreeningEnabled: boolean;
  prayerTimesApiKey?: string;
  
  // Multi-tenant
  maxTenantConnections: number;
  tenantConnectionTimeout: number;
  defaultTenantTier: string;
  
  // R Analytics
  rAnalyticsEnabled: boolean;
  rAnalyticsHost: string;
  rAnalyticsPort: number;
  rAnalyticsUser: string;
  rAnalyticsPassword: string;
  
  // External APIs
  exchangeRateApiKey?: string;
  creditBureauApiKey?: string;
  
  // Monitoring
  healthCheckInterval: number;
  performanceMonitoring: boolean;
  
  // Logging
  logLevel: string;
  logFormat: string;
  logFileEnabled: boolean;
  logDir: string;
  
  // Frontend
  frontendUrl: string;
  
  // Email (SMTP)
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
}

const appConfig: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'IFRS9_Platform_Backend',
  appVersion: process.env.APP_VERSION || '1.0.0',
  port: parseInt(process.env.PORT || '4232'),
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_for_development_only',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_for_development_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  
  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || 'https://iaf-ifrs.ifrspro.id,https://iaf-ifrs-be.ifrspro.id').split(','),
  corsCredentials: true,
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // File upload
  maxFileSize: process.env.MAX_FILE_SIZE || '50MB',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'csv,xlsx,pdf').split(','),
  
  // Islamic Banking
  islamicBankingEnabled: process.env.ISLAMIC_BANKING_ENABLED === 'true',
  syariahComplianceRequired: process.env.SYARIAH_COMPLIANCE_REQUIRED === 'true',
  aaoifiStandards: process.env.AAOIFI_STANDARDS === 'true',
  halalScreeningEnabled: process.env.HALAL_SCREENING_ENABLED === 'true',
  prayerTimesApiKey: process.env.PRAYER_TIMES_API_KEY,
  
  // Multi-tenant
  maxTenantConnections: parseInt(process.env.MAX_TENANT_CONNECTIONS || '10'),
  tenantConnectionTimeout: parseInt(process.env.TENANT_CONNECTION_TIMEOUT || '1800000'), // 30 minutes
  defaultTenantTier: process.env.DEFAULT_TENANT_TIER || 'basic',
  
  // R Analytics
  rAnalyticsEnabled: process.env.R_ANALYTICS_ENABLED === 'true',
  rAnalyticsHost: process.env.R_ANALYTICS_HOST || process.env.DB_HOST,
  rAnalyticsPort: parseInt(process.env.R_ANALYTICS_PORT || '4236'),
  rAnalyticsUser: process.env.R_ANALYTICS_USER || process.env.DB_USER,
  rAnalyticsPassword: process.env.R_ANALYTICS_PASSWORD || process.env.DB_PASSWORD,
  
  // External APIs
  exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY,
  creditBureauApiKey: process.env.CREDIT_BUREAU_API_KEY,
  
  // Monitoring
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
  performanceMonitoring: process.env.PERFORMANCE_MONITORING === 'true',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'combined',
  logFileEnabled: process.env.LOG_FILE_ENABLED === 'true',
  logDir: process.env.LOG_DIR || 'logs',
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'https://iaf-ifrs.ifrspro.id',
  
  // Email (SMTP)
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@ifrs9platform.com',
};

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];
  
  if (appConfig.nodeEnv === 'production') {
    requiredVars.push(
      'PLATFORM_DB_HOST',
      'PLATFORM_DB_USER',
      'PLATFORM_DB_PASSWORD',
      'REDIS_PASSWORD'
    );
  }
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Validate configuration on import
validateConfig();

export default appConfig;
export { AppConfig };
