// packages/backend/src/config/ConfigurationService.ts
import { z } from 'zod';
import { createClient } from 'redis';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

// Configuration schema validation
const EnvironmentConfigSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('IFRS9_Multi_Tenant_Platform'),
  APP_VERSION: z.string().default('1.0.0'),
  APP_DEBUG: z.boolean().default(false),

  // Server Configuration
  BACKEND_HOST: z.string().default('localhost'),
  BACKEND_PORT: z.number().min(1).max(65535).default(4232),
  FRONTEND_HOST: z.string().default('localhost'),
  FRONTEND_PORT: z.number().min(1).max(65535).default(4231),
  R_ANALYTICS_HOST: z.string().default('localhost'),
  R_ANALYTICS_PORT: z.number().min(1).max(65535).default(4236),

  // Public URLs
  FRONTEND_URL: z.string().url().default('https://ifrs9.ifrspro.id'),
  BACKEND_URL: z.string().url().default('https://bifrs9.ifrspro.id'),
  API_BASE_URL: z.string().url().default('https://bifrs9.ifrspro.id/api'),
  RAPI_BASE_URL: z.string().url().default('https://rifrs9.ifrspro.id/api'),

  // Database Configuration - DS1
  DS1_HOST: z.string().default(process.env.DS1_HOST || 'localhost'),
  DS1_PORT: z.number().min(1).max(65535).default(parseInt(process.env.DS1_PORT || '5432')),
  DS1_USER: z.string().default(process.env.DS1_USER || 'postgres'),
  DS1_PASSWORD: z.string().default(process.env.DS1_PASSWORD || 'postgres'),

  // Database Configuration - DS2
  DS2_HOST: z.string().default(process.env.DS2_HOST || 'localhost'),
  DS2_PORT: z.number().min(1).max(65535).default(parseInt(process.env.DS2_PORT || '5433')),
  DS2_USER: z.string().default(process.env.DS2_USER || 'postgres'),
  DS2_PASSWORD: z.string().default(process.env.DS2_PASSWORD || 'postgres'),

  // Core Platform Databases
  PLATFORM_ADMIN_DB: z.string().default('ifrspro_platform_admin'),
  SHARED_SERVICES_DB: z.string().default('ifrspro_shared_services'),
  
  // Legacy Databases
  FRS9_LEGACY_DB: z.string().default('FRS9PRO'),
  IFRS9_ANALYTICS_DB: z.string().default('IFRS9_pro'),

  // Tenant Databases
  TENANT_CONVENTIONAL_DB: z.string().default('ifrspro_tenant_demo_conventional'),
  TENANT_SYARIAH_DB: z.string().default('ifrspro_tenant_demo_syariah'),
  TENANT_DANA_DB: z.string().default('ifrspro_tenant_dana'),

  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.number().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().default('1234567890'),
  REDIS_DB: z.number().min(0).max(15).default(10),
  REDIS_TOKEN_BLACKLIST_DB: z.number().min(0).max(15).default(4),
  REDIS_SESSION_DB: z.number().min(0).max(15).default(10),

  // Security Configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('8h'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().min(32),
  SALT_ROUNDS: z.number().min(10).max(20).default(12),

  // Feature Flags
  FEATURE_ADVANCED_ANALYTICS: z.boolean().default(true),
  FEATURE_ISLAMIC_BANKING: z.boolean().default(true),
  FEATURE_AUDIT_TRAIL: z.boolean().default(true),
  FEATURE_STRESS_TESTING: z.boolean().default(true),
  FEATURE_MOBILE_API: z.boolean().default(true),
  FEATURE_WORKFLOW_MANAGEMENT: z.boolean().default(true),
  FEATURE_SYARIAH_COMPLIANCE: z.boolean().default(true),

  // Core Platform MVP Flags
  MVP_MULTI_TENANT_ARCHITECTURE: z.boolean().default(true),
  MVP_RBAC_AUTHENTICATION: z.boolean().default(true),
  MVP_AUDIT_WORKFLOW: z.boolean().default(true),
  MVP_BANKING_DATA_MODELS: z.boolean().default(true),
  MVP_ETL_PIPELINE: z.boolean().default(true),
  MVP_FORMS_TEMPLATES: z.boolean().default(true),
  MVP_REACT_ADMIN_FRAMEWORK: z.boolean().default(true),
  MVP_DUAL_BANKING_CONFIGURATION: z.boolean().default(true),
  MVP_BANKING_RESOURCE_MANAGEMENT: z.boolean().default(true),
  MVP_R_API_INTEGRATION: z.boolean().default(true),
  MVP_INFRASTRUCTURE: z.boolean().default(true),
  MVP_LEGACY_INTEGRATION: z.boolean().default(true),
  MVP_PRODUCTION_CONFIGURATION: z.boolean().default(true),

  // R Shiny Configuration
  R_SHINY_CONVENTIONAL_HOST: z.string().default(process.env.R_SHINY_CONVENTIONAL_HOST || 'localhost'),
  R_SHINY_CONVENTIONAL_PORT: z.number().default(parseInt(process.env.R_SHINY_CONVENTIONAL_PORT || '4238')),
  R_SHINY_CONVENTIONAL_URL: z.string().url().default(process.env.R_SHINY_CONVENTIONAL_URL || 'https://i9model-conventional.ifrspro.id'),
  R_SHINY_SYARIAH_HOST: z.string().default(process.env.R_SHINY_SYARIAH_HOST || 'localhost'),
  R_SHINY_SYARIAH_PORT: z.number().default(parseInt(process.env.R_SHINY_SYARIAH_PORT || '4239')),
  R_SHINY_SYARIAH_URL: z.string().url().default(process.env.R_SHINY_SYARIAH_URL || 'https://i9model-syariah.ifrspro.id'),
  R_SHINY_DANA_HOST: z.string().default(process.env.R_SHINY_DANA_HOST || 'localhost'),
  R_SHINY_DANA_PORT: z.number().default(parseInt(process.env.R_SHINY_DANA_PORT || '4240')),
  R_SHINY_DANA_URL: z.string().url().default(process.env.R_SHINY_DANA_URL || 'https://i9model-dana.ifrspro.id'),

  // Connection Pool Settings
  DB_POOL_MAX: z.number().min(5).max(50).default(20),
  DB_POOL_MIN: z.number().min(1).max(10).default(5),
  DB_POOL_ACQUIRE_TIMEOUT: z.number().min(1000).max(60000).default(30000),
  DB_POOL_IDLE_TIMEOUT: z.number().min(1000).max(300000).default(10000),
  DB_CONNECTION_TIMEOUT: z.number().min(1000).max(30000).default(10000),

  // Health Check Settings
  DB_HEALTH_CHECK_INTERVAL: z.number().min(1000).max(300000).default(30000),
  DB_MAX_RETRIES: z.number().min(1).max(10).default(3),
  DB_RETRY_DELAY: z.number().min(1000).max(30000).default(5000),

  // File Upload Configuration
  UPLOAD_MAX_SIZE: z.string().default('50MB'),
  UPLOAD_ALLOWED_TYPES: z.string().default('xlsx,csv,json,pdf'),
  UPLOAD_PATH: z.string().default('/var/uploads/ifrspro'),
  UPLOAD_TEMP_PATH: z.string().default('/tmp/ifrspro'),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('/var/log/ifrspro/app.log'),
  LOG_MAX_SIZE: z.string().default('100MB'),
  LOG_MAX_FILES: z.number().default(10),
});

export type PlatformConfiguration = z.infer<typeof EnvironmentConfigSchema>;

interface DatabaseConfigurationItem {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  tenantId?: string;
  isEncrypted: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  private config: PlatformConfiguration;
  private redis: any;
  private cache = new Map<string, any>();
  private cacheTimeout = 300000; // 5 minutes

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  private constructor() {
    this.loadConfiguration();
    this.initializeRedis();
  }

  /**
   * Load and validate environment configuration
   */
  private loadConfiguration(): void {
    try {
      const nodeEnv = process.env.NODE_ENV || 'development';
      
      // Load environment files in order
      const envFiles = [
        '.env',
        `.env.${nodeEnv}`,
        '.env.local'
      ];
      
      envFiles.forEach(file => {
        const envPath = path.join(process.cwd(), file);
        if (fs.existsSync(envPath)) {
          require('dotenv').config({ path: envPath, override: false });
          console.log(`✅ Loaded environment file: ${file}`);
        }
      });

      // Auto-generate secrets if not provided
      const processEnv = { ...process.env };
      if (!processEnv.JWT_SECRET) {
        processEnv.JWT_SECRET = this.generateSecretKey(64);
        console.log('🔑 Generated JWT_SECRET');
      }
      if (!processEnv.JWT_REFRESH_SECRET) {
        processEnv.JWT_REFRESH_SECRET = this.generateSecretKey(64);
        console.log('🔑 Generated JWT_REFRESH_SECRET');
      }
      if (!processEnv.ENCRYPTION_KEY) {
        processEnv.ENCRYPTION_KEY = this.generateSecretKey(64);
        console.log('🔑 Generated ENCRYPTION_KEY');
      }

      // Transform string values to appropriate types
      const transformedEnv = this.transformEnvironmentValues(processEnv);
      
      // Validate configuration
      const validationResult = EnvironmentConfigSchema.safeParse(transformedEnv);
      
      if (!validationResult.success) {
        console.error('❌ Configuration validation failed:');
        validationResult.error.errors.forEach(error => {
          console.error(`   - ${error.path.join('.')}: ${error.message}`);
        });
        throw new Error('Invalid configuration');
      }

      this.config = validationResult.data;
      console.log(`✅ Configuration loaded and validated for environment: ${this.config.NODE_ENV}`);
      
    } catch (error) {
      console.error('❌ Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Initialize Redis connection for configuration caching
   */
  private async initializeRedis(): Promise<void> {
    try {
      this.redis = createClient({
        host: this.config.REDIS_HOST,
        port: this.config.REDIS_PORT,
        password: this.config.REDIS_PASSWORD,
        db: this.config.REDIS_DB
      });

      this.redis.on('error', (err: Error) => {
        console.error('❌ Configuration Redis Error:', err);
      });

      this.redis.on('connect', () => {
        console.log('✅ Configuration Redis connected');
      });

      await this.redis.connect();
    } catch (error) {
      console.warn('⚠️ Redis connection failed, using memory cache only:', error);
    }
  }

  /**
   * Get configuration value
   */
  public get<K extends keyof PlatformConfiguration>(key: K): PlatformConfiguration[K] {
    return this.config[key];
  }

  /**
   * Get all configuration
   */
  public getAll(): PlatformConfiguration {
    return { ...this.config };
  }

  /**
   * Get database-driven configuration
   */
  public async getDatabaseConfig<T>(key: string, tenantId?: string, defaultValue?: T): Promise<T> {
    try {
      // Check cache first
      const cacheKey = tenantId ? `tenant:${tenantId}:${key}` : `global:${key}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.value as T;
        }
      }

      // Check Redis cache
      if (this.redis) {
        try {
          const redisValue = await this.redis.get(cacheKey);
          if (redisValue) {
            const parsed = JSON.parse(redisValue);
            this.cache.set(cacheKey, { value: parsed, timestamp: Date.now() });
            return parsed as T;
          }
        } catch (redisError) {
          console.warn('⚠️ Redis cache read failed:', redisError);
        }
      }

      // This would typically query the database
      // For now, return default value
      const value = defaultValue;
      
      // Cache the value
      const cacheValue = { value, timestamp: Date.now() };
      this.cache.set(cacheKey, cacheValue);
      
      // Cache in Redis if available
      if (this.redis) {
        try {
          await this.redis.setEx(cacheKey, 300, JSON.stringify(value));
        } catch (redisError) {
          console.warn('⚠️ Redis cache write failed:', redisError);
        }
      }

      return value as T;
      
    } catch (error) {
      console.error('❌ Database config retrieval failed:', error);
      return defaultValue as T;
    }
  }

  /**
   * Set database-driven configuration
   */
  public async setDatabaseConfig(key: string, value: any, tenantId?: string): Promise<void> {
    try {
      // This would typically update the database
      // For now, just update cache
      
      const cacheKey = tenantId ? `tenant:${tenantId}:${key}` : `global:${key}`;
      
      // Update memory cache
      this.cache.set(cacheKey, { value, timestamp: Date.now() });
      
      // Update Redis cache
      if (this.redis) {
        try {
          await this.redis.setEx(cacheKey, 300, JSON.stringify(value));
        } catch (redisError) {
          console.warn('⚠️ Redis cache update failed:', redisError);
        }
      }

      console.log(`✅ Configuration updated: ${key} = ${JSON.stringify(value)}`);
      
    } catch (error) {
      console.error('❌ Database config update failed:', error);
      throw error;
    }
  }

  /**
   * Get tenant-specific configuration
   */
  public async getTenantConfig<T>(tenantId: string, key: string, defaultValue?: T): Promise<T> {
    return this.getDatabaseConfig(key, tenantId, defaultValue);
  }

  /**
   * Set tenant-specific configuration
   */
  public async setTenantConfig(tenantId: string, key: string, value: any): Promise<void> {
    return this.setDatabaseConfig(key, value, tenantId);
  }

  /**
   * Get database connection configuration for specific server
   */
  public getDatabaseConfig(server: 'DS1' | 'DS2'): {
    host: string;
    port: number;
    user: string;
    password: string;
    pool: {
      max: number;
      min: number;
      acquire: number;
      idle: number;
    };
  } {
    const isDS1 = server === 'DS1';
    return {
      host: isDS1 ? this.config.DS1_HOST : this.config.DS2_HOST,
      port: isDS1 ? this.config.DS1_PORT : this.config.DS2_PORT,
      user: isDS1 ? this.config.DS1_USER : this.config.DS2_USER,
      password: isDS1 ? this.config.DS1_PASSWORD : this.config.DS2_PASSWORD,
      pool: {
        max: this.config.DB_POOL_MAX,
        min: this.config.DB_POOL_MIN,
        acquire: this.config.DB_POOL_ACQUIRE_TIMEOUT,
        idle: this.config.DB_POOL_IDLE_TIMEOUT
      }
    };
  }

  /**
   * Get R Shiny configuration for specific tenant
   */
  public getRShinyConfig(tenantType: 'conventional' | 'syariah' | 'dana'): {
    host: string;
    port: number;
    url: string;
  } {
    switch (tenantType) {
      case 'conventional':
        return {
          host: this.config.R_SHINY_CONVENTIONAL_HOST,
          port: this.config.R_SHINY_CONVENTIONAL_PORT,
          url: this.config.R_SHINY_CONVENTIONAL_URL
        };
      case 'syariah':
        return {
          host: this.config.R_SHINY_SYARIAH_HOST,
          port: this.config.R_SHINY_SYARIAH_PORT,
          url: this.config.R_SHINY_SYARIAH_URL
        };
      case 'dana':
        return {
          host: this.config.R_SHINY_DANA_HOST,
          port: this.config.R_SHINY_DANA_PORT,
          url: this.config.R_SHINY_DANA_URL
        };
      default:
        throw new Error(`Unknown tenant type: ${tenantType}`);
    }
  }

  /**
   * Validate startup configuration
   */
  public async validateStartupConfiguration(): Promise<boolean> {
    try {
      console.log('🔍 Validating startup configuration...');
      
      // Validate required secrets
      const requiredSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY'];
      for (const secret of requiredSecrets) {
        if (!this.config[secret as keyof PlatformConfiguration] || 
            (this.config[secret as keyof PlatformConfiguration] as string).length < 32) {
          throw new Error(`${secret} must be at least 32 characters long`);
        }
      }

      // Validate database configuration
      const databases = [
        { server: 'DS1', host: this.config.DS1_HOST, port: this.config.DS1_PORT },
        { server: 'DS2', host: this.config.DS2_HOST, port: this.config.DS2_PORT }
      ];

      for (const db of databases) {
        if (!db.host || !db.port) {
          throw new Error(`Database ${db.server} configuration incomplete`);
        }
      }

      // Validate Redis configuration
      if (!this.config.REDIS_HOST || !this.config.REDIS_PORT) {
        console.warn('⚠️ Redis configuration incomplete, some features may not work');
      }

      // Validate feature flags
      const coreFeatures = [
        'MVP_MULTI_TENANT_ARCHITECTURE',
        'MVP_RBAC_AUTHENTICATION',
        'MVP_BANKING_DATA_MODELS'
      ];

      for (const feature of coreFeatures) {
        if (!this.config[feature as keyof PlatformConfiguration]) {
          console.warn(`⚠️ Core feature ${feature} is disabled`);
        }
      }

      console.log('✅ Startup configuration validation completed');
      return true;
      
    } catch (error) {
      console.error('❌ Startup configuration validation failed:', error);
      return false;
    }
  }

  /**
   * Generate environment files for different stages
   */
  public async generateEnvironmentFiles(): Promise<void> {
    const environments = ['development', 'staging', 'production', 'test'];
    
    for (const env of environments) {
      const envContent = this.buildEnvironmentFileContent(env);
      const envPath = path.join(process.cwd(), `config/environments/${env}.env`);
      
      // Ensure directory exists
      const dir = path.dirname(envPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Generated environment file: ${env}.env`);
    }
  }

  /**
   * Transform environment string values to appropriate types
   */
  private transformEnvironmentValues(env: any): any {
    const transformed = { ...env };
    
    // Convert string booleans
    Object.keys(transformed).forEach(key => {
      const value = transformed[key];
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') transformed[key] = true;
        else if (value.toLowerCase() === 'false') transformed[key] = false;
        else if (/^\d+$/.test(value)) transformed[key] = parseInt(value, 10);
      }
    });
    
    return transformed;
  }

  /**
   * Generate secure secret key
   */
  private generateSecretKey(length: number = 64): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Build environment file content
   */
  private buildEnvironmentFileContent(environment: string): string {
    return `# IFRS Pro Platform - ${environment.toUpperCase()} Environment Configuration
# Generated from TodoList-v2.md specifications
# Last Updated: ${new Date().toISOString()}

# =================================
# APPLICATION CONFIGURATION
# =================================
NODE_ENV=${environment}
APP_NAME=IFRS9_Multi_Tenant_Platform
APP_VERSION=1.0.0
APP_DEBUG=${environment === 'development' ? 'true' : 'false'}

# =================================
# SERVER CONFIGURATION
# =================================
BACKEND_HOST=localhost
BACKEND_PORT=4232
FRONTEND_HOST=localhost
FRONTEND_PORT=4231
R_ANALYTICS_HOST=localhost
R_ANALYTICS_PORT=4236

# =================================
# PUBLIC URLS CONFIGURATION
# =================================
FRONTEND_URL=https://ifrs9.ifrspro.id
BACKEND_URL=https://bifrs9.ifrspro.id
API_BASE_URL=https://bifrs9.ifrspro.id/api
RAPI_BASE_URL=https://rifrs9.ifrspro.id/api

# =================================
# DATABASE CONFIGURATION
# =================================
# DS1 Server Configuration
DS1_HOST=\${DS1_HOST:-localhost}
DS1_PORT=\${DS1_PORT:-5432}
DS1_USER=\${DS1_USER:-postgres}
DS1_PASSWORD=\${DS1_PASSWORD:-postgres}

# DS2 Server Configuration
DS2_HOST=\${DS2_HOST:-localhost}
DS2_PORT=\${DS2_PORT:-5433}
DS2_USER=\${DS2_USER:-postgres}
DS2_PASSWORD=\${DS2_PASSWORD:-postgres}

# Platform Databases
PLATFORM_ADMIN_DB=ifrspro_platform_admin
SHARED_SERVICES_DB=ifrspro_shared_services

# Legacy Databases
FRS9_LEGACY_DB=FRS9PRO
IFRS9_ANALYTICS_DB=IFRS9_pro

# Tenant Databases
TENANT_CONVENTIONAL_DB=ifrspro_tenant_demo_conventional
TENANT_SYARIAH_DB=ifrspro_tenant_demo_syariah
TENANT_DANA_DB=ifrspro_tenant_dana

# =================================
# REDIS CONFIGURATION
# =================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=1234567890
REDIS_DB=10
REDIS_TOKEN_BLACKLIST_DB=4
REDIS_SESSION_DB=10

# =================================
# SECURITY CONFIGURATION
# =================================
JWT_SECRET=\${GENERATED_JWT_SECRET_64_CHARS}
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=\${GENERATED_REFRESH_SECRET_64_CHARS}
JWT_REFRESH_EXPIRES_IN=7d
ENCRYPTION_KEY=\${GENERATED_ENCRYPTION_KEY_64_CHARS}
SALT_ROUNDS=12

# =================================
# FEATURE FLAGS (TodoList-v2.md)
# =================================
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_ISLAMIC_BANKING=true
FEATURE_AUDIT_TRAIL=true
FEATURE_STRESS_TESTING=true
FEATURE_MOBILE_API=true
FEATURE_WORKFLOW_MANAGEMENT=true
FEATURE_SYARIAH_COMPLIANCE=true

# =================================
# CORE PLATFORM MVP FLAGS
# =================================
MVP_MULTI_TENANT_ARCHITECTURE=true
MVP_RBAC_AUTHENTICATION=true
MVP_AUDIT_WORKFLOW=true
MVP_BANKING_DATA_MODELS=true
MVP_ETL_PIPELINE=true
MVP_FORMS_TEMPLATES=true
MVP_REACT_ADMIN_FRAMEWORK=true
MVP_DUAL_BANKING_CONFIGURATION=true
MVP_BANKING_RESOURCE_MANAGEMENT=true
MVP_R_API_INTEGRATION=true
MVP_INFRASTRUCTURE=true
MVP_LEGACY_INTEGRATION=true
MVP_PRODUCTION_CONFIGURATION=true

# =================================
# R SHINY CONFIGURATION
# =================================
R_SHINY_CONVENTIONAL_HOST=\${R_SHINY_CONVENTIONAL_HOST:-localhost}
R_SHINY_CONVENTIONAL_PORT=\${R_SHINY_CONVENTIONAL_PORT:-4238}
R_SHINY_CONVENTIONAL_URL=\${R_SHINY_CONVENTIONAL_URL:-https://i9model-conventional.ifrspro.id}
R_SHINY_SYARIAH_HOST=\${R_SHINY_SYARIAH_HOST:-localhost}
R_SHINY_SYARIAH_PORT=\${R_SHINY_SYARIAH_PORT:-4239}
R_SHINY_SYARIAH_URL=\${R_SHINY_SYARIAH_URL:-https://i9model-syariah.ifrspro.id}
R_SHINY_DANA_HOST=\${R_SHINY_DANA_HOST:-localhost}
R_SHINY_DANA_PORT=\${R_SHINY_DANA_PORT:-4240}
R_SHINY_DANA_URL=\${R_SHINY_DANA_URL:-https://i9model-dana.ifrspro.id}

# =================================
# CONNECTION POOL SETTINGS
# =================================
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_ACQUIRE_TIMEOUT=30000
DB_POOL_IDLE_TIMEOUT=10000
DB_CONNECTION_TIMEOUT=10000

# =================================
# HEALTH CHECK SETTINGS
# =================================
DB_HEALTH_CHECK_INTERVAL=30000
DB_MAX_RETRIES=3
DB_RETRY_DELAY=5000

# =================================
# FILE UPLOAD CONFIGURATION
# =================================
UPLOAD_MAX_SIZE=50MB
UPLOAD_ALLOWED_TYPES=xlsx,csv,json,pdf
UPLOAD_PATH=/var/uploads/ifrspro
UPLOAD_TEMP_PATH=/tmp/ifrspro

# =================================
# LOGGING CONFIGURATION
# =================================
LOG_LEVEL=${environment === 'development' ? 'debug' : environment === 'production' ? 'warn' : 'info'}
LOG_FILE=/var/log/ifrspro/app.log
LOG_MAX_SIZE=100MB
LOG_MAX_FILES=10
`;
  }

  /**
   * Get configuration summary for health checks
   */
  public getHealthSummary(): {
    environment: string;
    features: Record<string, boolean>;
    databases: Record<string, any>;
    security: Record<string, boolean>;
  } {
    return {
      environment: this.config.NODE_ENV,
      features: {
        advancedAnalytics: this.config.FEATURE_ADVANCED_ANALYTICS,
        islamicBanking: this.config.FEATURE_ISLAMIC_BANKING,
        auditTrail: this.config.FEATURE_AUDIT_TRAIL,
        workflowManagement: this.config.FEATURE_WORKFLOW_MANAGEMENT,
        multiTenantArchitecture: this.config.MVP_MULTI_TENANT_ARCHITECTURE,
        rbacAuthentication: this.config.MVP_RBAC_AUTHENTICATION
      },
      databases: {
        ds1: { host: this.config.DS1_HOST, port: this.config.DS1_PORT },
        ds2: { host: this.config.DS2_HOST, port: this.config.DS2_PORT },
        redis: { host: this.config.REDIS_HOST, port: this.config.REDIS_PORT }
      },
      security: {
        jwtConfigured: !!this.config.JWT_SECRET && this.config.JWT_SECRET.length >= 32,
        encryptionConfigured: !!this.config.ENCRYPTION_KEY && this.config.ENCRYPTION_KEY.length >= 32,
        refreshTokenConfigured: !!this.config.JWT_REFRESH_SECRET && this.config.JWT_REFRESH_SECRET.length >= 32
      }
    };
  }
}

// Export singleton instance
export const configService = ConfigurationService.getInstance();
export default configService;