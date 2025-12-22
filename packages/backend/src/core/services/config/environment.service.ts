// packages/backend/src/core/services/config/environment.service.ts
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from 'winston';

export interface EnvironmentConfig {
  nodeEnv: string;
  appName: string;
  appVersion: string;
  appDebug: boolean;
  
  // Server Configuration
  backendHost: string;
  backendPort: number;
  frontendHost: string;
  frontendPort: number;
  rAnalyticsHost: string;
  rAnalyticsPort: number;
  
  // Database Configuration
  tenantDbHost: string;
  tenantDbPort: number;
  tenantDbUserPrefix: string;
  tenantDbNamePrefix: string;
  tenantDbSsl: string;
  
  // Redis Configuration
  redisHost: string;
  redisPort: number;
  redisPassword: string;
  redisDb: number;
  redisTokenBlacklistDb: number;
  redisSessionDb: number;
  
  // Security Configuration
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  encryptionKey: string;
  saltRounds: number;
  
  // Feature Flags
  featureAdvancedAnalytics: boolean;
  featureIslamicBanking: boolean;
  featureAuditTrail: boolean;
  featureStressTesting: boolean;
  featureMobileApi: boolean;
  featureWorkflowManagement: boolean;
  featureSyariahCompliance: boolean;
  
  // MVP Flags
  mvpMultiTenantArchitecture: boolean;
  mvpRbacAuthentication: boolean;
  mvpAuditWorkflow: boolean;
  mvpBankingDataModels: boolean;
  mvpEtlPipeline: boolean;
  mvpFormsTemplates: boolean;
  mvpReactAdminFramework: boolean;
  mvpDualBankingConfiguration: boolean;
  mvpBankingResourceManagement: boolean;
  mvpRApiIntegration: boolean;
  mvpInfrastructure: boolean;
  mvpLegacyIntegration: boolean;
  mvpProductionConfiguration: boolean;
  
  // Logging Configuration
  logLevel: string;
  logFile: string;
  logMaxSize: string;
  logMaxFiles: number;
}

@Injectable()
export class EnvironmentService {
  private config: EnvironmentConfig;
  private configLoaded = false;

  constructor(private readonly logger: Logger) {}

  /**
   * Load environment configuration
   */
  async loadEnvironmentConfig(): Promise<void> {
    try {
      const environment = process.env.NODE_ENV || 'development';
      
      // Load base .env file
      const baseEnvPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(baseEnvPath)) {
        dotenv.config({ path: baseEnvPath });
      }
      
      // Load environment-specific .env file
      const envPath = path.join(process.cwd(), `.env.${environment}`);
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: true });
      }
      
      // Load local overrides
      const localEnvPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(localEnvPath)) {
        dotenv.config({ path: localEnvPath, override: true });
      }
      
      // Parse and validate configuration
      this.config = this.parseEnvironmentVariables();
      this.validateRequiredConfiguration();
      this.configLoaded = true;
      
      this.logger.info(`Environment configuration loaded for: ${environment}`);
    } catch (error) {
      this.logger.error('Failed to load environment configuration', error);
      throw error;
    }
  }

  /**
   * Get configuration value
   */
  get<T = any>(key: string, defaultValue?: T): T {
    if (!this.configLoaded) {
      throw new Error('Environment configuration not loaded. Call loadEnvironmentConfig() first.');
    }
    
    // Check direct environment variable
    const envValue = process.env[key];
    if (envValue !== undefined) {
      return this.parseValue(envValue) as T;
    }
    
    // Check parsed configuration
    const configKey = this.toCamelCase(key);
    if (configKey in this.config) {
      return (this.config as any)[configKey] as T;
    }
    
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    throw new Error(`Environment variable '${key}' not found and no default value provided`);
  }

  /**
   * Get all configuration
   */
  getAll(): EnvironmentConfig {
    if (!this.configLoaded) {
      throw new Error('Environment configuration not loaded. Call loadEnvironmentConfig() first.');
    }
    
    return { ...this.config };
  }

  /**
   * Check if environment is development
   */
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Check if environment is production
   */
  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if environment is staging
   */
  isStaging(): boolean {
    return this.get('NODE_ENV') === 'staging';
  }

  /**
   * Check if environment is test
   */
  isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  /**
   * Get database configuration for specific tenant
   */
  getTenantDatabaseConfig(tenantSlug: string, bankingType: 'conventional' | 'syariah'): any {
    return {
      host: this.config.tenantDbHost,
      port: this.config.tenantDbPort,
      username: `${this.config.tenantDbUserPrefix}${tenantSlug}_${bankingType}`,
      database: `${this.config.tenantDbNamePrefix}${tenantSlug}_${bankingType}`,
      ssl: this.config.tenantDbSsl === 'require'
    };
  }

  /**
   * Get Redis configuration
   */
  getRedisConfig(purpose: 'default' | 'session' | 'tokenBlacklist' = 'default'): any {
    let db = this.config.redisDb;
    
    switch (purpose) {
      case 'session':
        db = this.config.redisSessionDb;
        break;
      case 'tokenBlacklist':
        db = this.config.redisTokenBlacklistDb;
        break;
    }
    
    return {
      host: this.config.redisHost,
      port: this.config.redisPort,
      password: this.config.redisPassword || undefined,
      db
    };
  }

  /**
   * Validate environment configuration
   */
  validateConfiguration(): string[] {
    const errors: string[] = [];
    
    // Required configurations
    const required = [
      'NODE_ENV',
      'APP_NAME',
      'BACKEND_PORT',
      'FRONTEND_PORT',
      'TENANT_DB_HOST',
      'TENANT_DB_PORT',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'REDIS_HOST',
      'REDIS_PORT'
    ];
    
    for (const key of required) {
      if (!process.env[key]) {
        errors.push(`Required environment variable missing: ${key}`);
      }
    }
    
    // Validate JWT secret length
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }
    
    // Validate encryption key length
    if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
      errors.push('ENCRYPTION_KEY must be at least 32 characters long');
    }
    
    // Validate port numbers
    const ports = ['BACKEND_PORT', 'FRONTEND_PORT', 'R_ANALYTICS_PORT', 'TENANT_DB_PORT', 'REDIS_PORT'];
    for (const portKey of ports) {
      const port = process.env[portKey];
      if (port && (isNaN(Number(port)) || Number(port) < 1024 || Number(port) > 65535)) {
        errors.push(`Invalid port number for ${portKey}: ${port}`);
      }
    }
    
    return errors;
  }

  /**
   * Parse environment variables into typed configuration
   */
  private parseEnvironmentVariables(): EnvironmentConfig {
    return {
      nodeEnv: this.get('NODE_ENV', 'development'),
      appName: this.get('APP_NAME', 'IFRS9_Multi_Tenant_Platform'),
      appVersion: this.get('APP_VERSION', '1.0.0'),
      appDebug: this.parseBoolean('APP_DEBUG', false),
      
      // Server Configuration
      backendHost: this.get('BACKEND_HOST', 'localhost'),
      backendPort: this.parseNumber('BACKEND_PORT', 4232),
      frontendHost: this.get('FRONTEND_HOST', 'localhost'),
      frontendPort: this.parseNumber('FRONTEND_PORT', 4231),
      rAnalyticsHost: this.get('R_ANALYTICS_HOST', 'localhost'),
      rAnalyticsPort: this.parseNumber('R_ANALYTICS_PORT', 4236),
      
      // Database Configuration
      tenantDbHost: this.get('TENANT_DB_HOST', 'localhost'),
      tenantDbPort: this.parseNumber('TENANT_DB_PORT', 5432),
      tenantDbUserPrefix: this.get('TENANT_DB_USER_PREFIX', 'tenant_'),
      tenantDbNamePrefix: this.get('TENANT_DB_NAME_PREFIX', 'ifrs9_tenant_'),
      tenantDbSsl: this.get('TENANT_DB_SSL', 'require'),
      
      // Redis Configuration
      redisHost: this.get('REDIS_HOST', 'localhost'),
      redisPort: this.parseNumber('REDIS_PORT', 6379),
      redisPassword: this.get('REDIS_PASSWORD', '1234567890'),
      redisDb: this.parseNumber('REDIS_DB', 10),
      redisTokenBlacklistDb: this.parseNumber('REDIS_TOKEN_BLACKLIST_DB', 4),
      redisSessionDb: this.parseNumber('REDIS_SESSION_DB', 10),
      
      // Security Configuration
      jwtSecret: this.get('JWT_SECRET', ''),
      jwtExpiresIn: this.get('JWT_EXPIRES_IN', '8h'),
      jwtRefreshSecret: this.get('JWT_REFRESH_SECRET', ''),
      jwtRefreshExpiresIn: this.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      encryptionKey: this.get('ENCRYPTION_KEY', ''),
      saltRounds: this.parseNumber('SALT_ROUNDS', 12),
      
      // Feature Flags
      featureAdvancedAnalytics: this.parseBoolean('FEATURE_ADVANCED_ANALYTICS', true),
      featureIslamicBanking: this.parseBoolean('FEATURE_ISLAMIC_BANKING', true),
      featureAuditTrail: this.parseBoolean('FEATURE_AUDIT_TRAIL', true),
      featureStressTesting: this.parseBoolean('FEATURE_STRESS_TESTING', true),
      featureMobileApi: this.parseBoolean('FEATURE_MOBILE_API', true),
      featureWorkflowManagement: this.parseBoolean('FEATURE_WORKFLOW_MANAGEMENT', true),
      featureSyariahCompliance: this.parseBoolean('FEATURE_SYARIAH_COMPLIANCE', true),
      
      // MVP Flags
      mvpMultiTenantArchitecture: this.parseBoolean('MVP_MULTI_TENANT_ARCHITECTURE', true),
      mvpRbacAuthentication: this.parseBoolean('MVP_RBAC_AUTHENTICATION', true),
      mvpAuditWorkflow: this.parseBoolean('MVP_AUDIT_WORKFLOW', true),
      mvpBankingDataModels: this.parseBoolean('MVP_BANKING_DATA_MODELS', true),
      mvpEtlPipeline: this.parseBoolean('MVP_ETL_PIPELINE', true),
      mvpFormsTemplates: this.parseBoolean('MVP_FORMS_TEMPLATES', true),
      mvpReactAdminFramework: this.parseBoolean('MVP_REACT_ADMIN_FRAMEWORK', true),
      mvpDualBankingConfiguration: this.parseBoolean('MVP_DUAL_BANKING_CONFIGURATION', true),
      mvpBankingResourceManagement: this.parseBoolean('MVP_BANKING_RESOURCE_MANAGEMENT', true),
      mvpRApiIntegration: this.parseBoolean('MVP_R_API_INTEGRATION', true),
      mvpInfrastructure: this.parseBoolean('MVP_INFRASTRUCTURE', true),
      mvpLegacyIntegration: this.parseBoolean('MVP_LEGACY_INTEGRATION', true),
      mvpProductionConfiguration: this.parseBoolean('MVP_PRODUCTION_CONFIGURATION', true),
      
      // Logging Configuration
      logLevel: this.get('LOG_LEVEL', 'info'),
      logFile: this.get('LOG_FILE', '/var/log/ifrspro/app.log'),
      logMaxSize: this.get('LOG_MAX_SIZE', '100MB'),
      logMaxFiles: this.parseNumber('LOG_MAX_FILES', 10)
    };
  }

  /**
   * Validate required configuration
   */
  private validateRequiredConfiguration(): void {
    const errors = this.validateConfiguration();
    if (errors.length > 0) {
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Helper methods
   */
  private parseBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  private parseNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private parseValue(value: string): any {
    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Try to parse as number
    if (!isNaN(Number(value))) return Number(value);
    
    // Try to parse as JSON
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private toCamelCase(str: string): string {
    return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}
