// packages/backend/src/types/config.ts
// ✅ Configuration Type Definitions
// Purpose: Type safety for configuration objects

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

export interface PlatformDbConfig extends DatabaseConfig {
  frs9: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix?: string;
  timeout: number;
}

export interface SecurityConfig {
  bcryptRounds: number;
  encryptionKey: string;
  saltRounds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

export interface JWTConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface BankingConfig {
  conventional: boolean;
  syariah: boolean;
  dualMode: boolean;
  islamicBankingEnabled: boolean;
  syariahComplianceRequired: boolean;
  aaoifiStandards: boolean;
  halalScreeningEnabled: boolean;
}

export interface MultiTenantConfig {
  maxTenantConnections: number;
  tenantConnectionTimeout: number;
  defaultTenantTier: string;
}

export interface PerformanceConfig {
  cacheTimeout: number;
  maxConcurrentCalc: number;
  queryTimeout: number;
  maxFileSize: string;
  maxUploadFiles: number;
}

export interface MonitoringConfig {
  healthCheckEnabled: boolean;
  healthCheckInterval: number;
  metricsCollectionEnabled: boolean;
  metricsCollectionInterval: number;
  performanceMonitoring: boolean;
}

export interface LoggingConfig {
  level: string;
  format: string;
  fileEnabled: boolean;
  directory: string;
}

export interface UploadConfig {
  directory: string;
  allowedFileTypes: string[];
  maxFileSize: string;
}

export interface FeaturesConfig {
  advancedAnalytics: boolean;
  islamicBanking: boolean;
  auditTrail: boolean;
  stressTesting: boolean;
  mobileApi: boolean;
  workflowEngine: boolean;
  etlPipeline: boolean;
}

export interface ExternalApisConfig {
  exchangeRateApiKey?: string;
  creditBureauApiKey?: string;
}

export interface RAnalyticsConfig {
  url: string;
  timeout: number;
  maxMemoryMb: number;
}

export interface AppConfig {
  // Application
  nodeEnv: string;
  appName: string;
  appVersion: string;
  appDebug: boolean;
  port: number;
  host: string;
  frontendUrl: string;
  corsOrigins: string[];

  // Database
  database: DatabaseConfig;
  platformDb: PlatformDbConfig;
  sharedDb: DatabaseConfig;

  // Redis
  redis: RedisConfig;

  // Security
  security: SecurityConfig;

  // JWT
  jwt: JWTConfig;

  // Banking
  banking: BankingConfig;

  // Multi-tenant
  multiTenant: MultiTenantConfig;
  maxTenantConnections: number;
  defaultTenantTier: string;

  // Performance
  performance: PerformanceConfig;

  // Monitoring
  monitoring: MonitoringConfig;

  // Logging
  logging: LoggingConfig;

  // Upload
  upload: UploadConfig;

  // Features
  features: FeaturesConfig;

  // External APIs
  externalApis: ExternalApisConfig;

  // R Analytics
  rAnalytics: RAnalyticsConfig;
}

export type Environment = 'development' | 'staging' | 'production' | 'test';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

export type BankingType = 'conventional' | 'syariah' | 'dual';

export type DatabaseType = 'platform' | 'shared' | 'tenant';

export type StakeholderType = 'platform-admin' | 'banking' | 'consultant' | 'regulator';