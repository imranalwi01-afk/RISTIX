// packages/backend/src/config/centralized.config.ts
// ============================================================================
// 🏗️ BACKEND CENTRALIZED CONFIGURATION SYSTEM
// ============================================================================
// ✅ All settings come from .env files and environment variables
// ✅ Support for multiple environments (dev, staging, production, iaf)
// ✅ Database configuration with RDS support
// ✅ Type-safe configuration interface
// ============================================================================

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// ============================================================================
// 🔧 CONFIGURATION INTERFACES
// ============================================================================

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  ssl: boolean;
  platform: {
    database: string;
  };
  shared: {
    database: string;
  };
  tenant: {
    database: string;
    prefix: string;
  };
  legacy: {
    database: string;
  };
}

export interface ServerConfig {
  frontend: {
    host: string;
    port: number;
    url: string;
  };
  backend: {
    host: string;
    port: number;
    url: string;
  };
  rAnalytics: {
    host: string;
    port: number;
    url: string;
  };
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  encryptionKey: string;
  saltRounds: number;
  corsOrigins: string[];
}

export interface CentralizedBackendConfig {
  environment: 'development' | 'staging' | 'production' | 'iaf';
  deploymentType: 'local' | 'ecs' | 'aws' | 'azure';
  app: {
    name: string;
    version: string;
    debug: boolean;
  };
  servers: ServerConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  features: {
    multiTenant: boolean;
    auditTrail: boolean;
    rAnalytics: boolean;
    islamicBanking: boolean;
  };
  tenant: {
    mode: 'single' | 'multi';
    defaultTenant: string;
  };
}

// ============================================================================
// 🌐 ENVIRONMENT LOADING CLASS
// ============================================================================

class CentralizedBackendConfigManager {
  private static instance: CentralizedBackendConfigManager;
  private config: CentralizedBackendConfig | null = null;
  private initialized = false;

  public static getInstance(): CentralizedBackendConfigManager {
    if (!CentralizedBackendConfigManager.instance) {
      CentralizedBackendConfigManager.instance = new CentralizedBackendConfigManager();
    }
    return CentralizedBackendConfigManager.instance;
  }

  /**
   * Load environment files based on priority
   */
  private loadEnvironmentFiles(): void {
    const rootDir = path.resolve(__dirname, '../../../');
    
    // Environment file priority (later files override earlier ones)
    const envFiles = [
      '.env',
      '.env.local',
      `.env.${process.env.NODE_ENV || 'development'}`,
      '.env.iaf' // IAF-specific configuration has highest priority
    ];

    envFiles.forEach(envFile => {
      const envPath = path.join(rootDir, envFile);
      if (fs.existsSync(envPath)) {
        const result = dotenv.config({ path: envPath, override: true });
        if (result.error) {
          console.warn(`⚠️ Failed to load ${envFile}:`, result.error.message);
        } else {
          console.log(`✅ Loaded environment from ${envFile}`);
        }
      }
    });
  }

  /**
   * Get environment variable with fallback
   */
  private getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (value !== undefined && value !== '') {
      return value;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }

  /**
   * Get optional environment variable
   */
  private getOptionalEnvVar(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  /**
   * Auto-detect environment
   */
  private detectEnvironment(): CentralizedBackendConfig['environment'] {
    const nodeEnv = this.getOptionalEnvVar('NODE_ENV', 'development');
    const envSuffix = this.getOptionalEnvVar('ENV_SUFFIX', '');
    const deploymentTarget = this.getOptionalEnvVar('DEPLOYMENT_TARGET', '');
    
    if (envSuffix === 'iaf' || deploymentTarget === 'iaf') {
      return 'iaf';
    }
    
    return nodeEnv as CentralizedBackendConfig['environment'];
  }

  /**
   * Auto-detect deployment type
   */
  private detectDeploymentType(): CentralizedBackendConfig['deploymentType'] {
    const deploymentTarget = this.getOptionalEnvVar('DEPLOYMENT_TARGET', '');
    const hostname = this.getOptionalEnvVar('HOSTNAME', '');

    // Priority 1: Explicit deployment target
    if (deploymentTarget === 'ecs_production' || deploymentTarget === 'iafecs') {
      return 'ecs'; // Alibaba ECS
    } else if (deploymentTarget === 'localdev') {
      return 'local';
    }

    // Priority 2: ECS hostname detection
    if (hostname.includes('ecs') || hostname.includes('alibaba') || hostname.includes('10.18.11')) {
      return 'ecs'; // Alibaba ECS
    }

    // Priority 3: Backend host detection
    const backendHost = this.getOptionalEnvVar('BACKEND_HOST', '');
    if (backendHost === '10.18.11.35') {
      return 'ecs'; // Alibaba ECS
    } else if (backendHost.includes('amazonaws.com')) {
      return 'aws';
    } else if (backendHost.includes('azure')) {
      return 'azure';
    }

    // Default: local development
    return 'local';
  }

  /**
   * Initialize configuration from environment
   */
  public async initialize(): Promise<CentralizedBackendConfig> {
    if (this.initialized && this.config) {
      return this.config;
    }

    console.log('🏗️ Initializing backend centralized configuration...');

    // Load environment files
    this.loadEnvironmentFiles();

    const environment = this.detectEnvironment();
    const deploymentType = this.detectDeploymentType();

    console.log(`🌍 Detected environment: ${environment}`);
    console.log(`🚀 Detected deployment: ${deploymentType}`);

    try {
      this.config = {
        environment,
        deploymentType,

        app: {
          name: this.getOptionalEnvVar('APP_NAME', 'IFRS9 IAF Platform'),
          version: this.getOptionalEnvVar('APP_VERSION', '1.0.0'),
          debug: this.getOptionalEnvVar('APP_DEBUG', 'false') === 'true'
        },

        servers: {
          frontend: {
            host: this.getOptionalEnvVar('FRONTEND_HOST', deploymentType === 'ecs' ? 'iaf-ifrs.danafin.com' : 'ifrs9-iaf.ifrspro.id'),
            port: parseInt(this.getOptionalEnvVar('FRONTEND_PORT', '4231')),
            url: this.getOptionalEnvVar('FRONTEND_URL', deploymentType === 'ecs' ?
              'https://iaf-ifrs.danafin.com' : 'https://ifrs9-iaf.ifrspro.id')
          },
          backend: {
            host: this.getOptionalEnvVar('BACKEND_HOST', deploymentType === 'ecs' ? 'iaf-ifrs-be.danafin.com' : 'iaf-ifrs-be.ifrspro.id'),
            port: parseInt(this.getOptionalEnvVar('BACKEND_PORT', '4232')),
            url: this.getOptionalEnvVar('BACKEND_URL', deploymentType === 'ecs' ?
              'https://iaf-ifrs-be.danafin.com' : 'https://iaf-ifrs-be.ifrspro.id')
          },
          rAnalytics: {
            host: this.getOptionalEnvVar('R_ANALYTICS_HOST', deploymentType === 'ecs' ? 'iaf-ifrs-analytics.danafin.com' : 'iaf-ifrs-analytics.ifrspro.id'),
            port: parseInt(this.getOptionalEnvVar('R_ANALYTICS_PORT', '4236')),
            url: this.getOptionalEnvVar('R_ANALYTICS_URL', deploymentType === 'ecs' ?
              'https://iaf-ifrs-analytics.danafin.com' : 'https://iaf-ifrs-analytics.ifrspro.id')
          }
        },

        database: {
          host: this.getEnvVar('DB_HOST'),
          port: parseInt(this.getEnvVar('DB_PORT')),
          user: this.getEnvVar('DB_USER'),
          password: this.getEnvVar('DB_PASSWORD'),
          ssl: this.getOptionalEnvVar('DB_SSL', 'false') === 'true',
          platform: {
            database: this.getOptionalEnvVar('PLATFORM_DB_NAME', 'ifrspro_platform_admin')
          },
          shared: {
            database: this.getOptionalEnvVar('SHARED_DB_NAME', 'ifrspro_shared_services')
          },
          tenant: {
            database: this.getOptionalEnvVar('TENANT_DB_NAME', 'ifrspro_tenant_iaf'),
            prefix: this.getOptionalEnvVar('TENANT_DB_PREFIX', 'ifrspro_tenant_')
          },
          legacy: {
            database: this.getOptionalEnvVar('LEGACY_DB_NAME', 'FRS9PRO')
          }
        },

        security: {
          jwtSecret: this.getEnvVar('JWT_SECRET'),
          jwtExpiresIn: this.getOptionalEnvVar('JWT_EXPIRES_IN', '8h'),
          jwtRefreshSecret: this.getEnvVar('JWT_REFRESH_SECRET'),
          jwtRefreshExpiresIn: this.getOptionalEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
          encryptionKey: this.getEnvVar('ENCRYPTION_KEY'),
          saltRounds: parseInt(this.getOptionalEnvVar('SALT_ROUNDS', '12')),
          corsOrigins: this.getOptionalEnvVar('CORS_ORIGINS', '').split(',')
        },

        features: {
          multiTenant: this.getOptionalEnvVar('FEATURE_MULTI_TENANT', 'false') === 'true',
          auditTrail: this.getOptionalEnvVar('FEATURE_AUDIT_TRAIL', 'true') === 'true',
          rAnalytics: this.getOptionalEnvVar('FEATURE_R_ANALYTICS', 'true') === 'true',
          islamicBanking: this.getOptionalEnvVar('FEATURE_ISLAMIC_BANKING', 'true') === 'true'
        },

        tenant: {
          mode: this.getOptionalEnvVar('TENANT_MODE', 'single') as 'single' | 'multi',
          defaultTenant: this.getOptionalEnvVar('DEFAULT_TENANT', 'iaf')
        }
      };

      this.initialized = true;

      console.log('✅ Backend centralized configuration loaded successfully');
      console.log('🔧 Configuration summary:', {
        environment: this.config.environment,
        deploymentType: this.config.deploymentType,
        backendUrl: this.config.servers.backend.url,
        databaseHost: this.config.database.host,
        tenantMode: this.config.tenant.mode,
        defaultTenant: this.config.tenant.defaultTenant
      });

      return this.config;

    } catch (error) {
      console.error('❌ Failed to initialize backend centralized configuration:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Backend configuration initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Get current configuration
   */
  public async getConfig(): Promise<CentralizedBackendConfig> {
    if (!this.config || !this.initialized) {
      return await this.initialize();
    }
    return this.config;
  }

  /**
   * Get specific configuration section
   */
  public async getSection<K extends keyof CentralizedBackendConfig>(section: K): Promise<CentralizedBackendConfig[K]> {
    const config = await this.getConfig();
    return config[section];
  }

  /**
   * Validate configuration
   */
  public async validateConfig(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const config = await this.getConfig();

      // Validate required fields
      if (!config.database.host) {
        errors.push('Database host not configured');
      }

      if (!config.database.user) {
        errors.push('Database user not configured');
      }

      if (!config.database.password) {
        errors.push('Database password not configured');
      }

      if (!config.security.jwtSecret) {
        errors.push('JWT secret not configured');
      }

      if (!config.security.encryptionKey) {
        errors.push('Encryption key not configured');
      }

      // Validate URLs
      try {
        new URL(config.servers.backend.url);
      } catch {
        errors.push('Invalid backend URL');
      }

      try {
        new URL(config.servers.frontend.url);
      } catch {
        errors.push('Invalid frontend URL');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Configuration validation failed: ${errorMessage}`);
    }

    const isValid = errors.length === 0;

    if (isValid) {
      console.log('✅ Backend configuration validation passed');
    } else {
      console.error('❌ Backend configuration validation failed:', errors);
    }

    return { isValid, errors };
  }
}

// ============================================================================
// 🚀 EXPORTED FUNCTIONS
// ============================================================================

const configManager = CentralizedBackendConfigManager.getInstance();

/**
 * Initialize and get complete configuration
 */
export const getCentralizedBackendConfig = async (): Promise<CentralizedBackendConfig> => {
  return await configManager.getConfig();
};

/**
 * Get specific configuration section
 */
export const getBackendConfigSection = async <K extends keyof CentralizedBackendConfig>(section: K): Promise<CentralizedBackendConfig[K]> => {
  return await configManager.getSection(section);
};

/**
 * Validate current configuration
 */
export const validateCentralizedBackendConfig = async (): Promise<{ isValid: boolean; errors: string[] }> => {
  return await configManager.validateConfig();
};

/**
 * Initialize configuration system
 */
export const initializeCentralizedBackendConfig = async (): Promise<CentralizedBackendConfig> => {
  try {
    console.log('🏗️ Starting backend centralized configuration initialization...');
    const config = await getCentralizedBackendConfig();
    const validation = await validateCentralizedBackendConfig();
    
    if (!validation.isValid) {
      console.warn('⚠️ Backend configuration validation issues:', validation.errors);
    }
    
    console.log('✅ Backend centralized configuration system ready');
    return config;
    
  } catch (error) {
    console.error('❌ Failed to initialize backend centralized configuration:', error);
    throw error;
  }
};

// Default export
export default getCentralizedBackendConfig;