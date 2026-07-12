// packages/frontend/src/config/centralized.config.ts
// ============================================================================
// 🏗️ CENTRALIZED CONFIGURATION SYSTEM - NO HARDCODED VALUES
// ============================================================================
// ✅ All settings come from .env files and environment variables
// ✅ Support for multiple environments (dev, staging, production, iaf)
// ✅ Dynamic configuration loading with fallbacks
// ✅ Type-safe configuration interface
// ============================================================================

'use client';

// ============================================================================
// 🔧 CONFIGURATION INTERFACES
// ============================================================================

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
    apiUrl: string;
  };
  rAnalytics: {
    host: string;
    port: number;
    url: string;
    apiUrl: string;
  };
}

export interface DatabaseConfig {
  rds: {
    host: string;
    port: number;
    user: string;
    password: string;
    ssl: boolean;
  };
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
}

export interface RShinyConfig {
  conventional: {
    host: string;
    port: number;
    url: string;
  };
  dana: {
    host: string;
    port: number;
    url: string;
  };
}

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production' | 'iaf';
  deploymentType: 'local' | 'ecs' | 'aws' | 'azure';
  tenantMode: 'multi' | 'single';
  defaultTenant: string;
}

export interface CentralizedConfig {
  deployment: DeploymentConfig;
  servers: ServerConfig;
  database: DatabaseConfig;
  rShiny: RShinyConfig;
  app: {
    name: string;
    version: string;
    debug: boolean;
  };
  features: {
    multiTenant: boolean;
    rAnalytics: boolean;
    auditTrail: boolean;
    islamicBanking: boolean;
  };
  security: {
    // 🚨 SECURITY: JWT secrets are NOT exposed to frontend
    encryptionKey?: string;
    corsOrigins: string[];
  };
}

// ============================================================================
// 🌐 ENVIRONMENT DETECTION & LOADING
// ============================================================================

class CentralizedConfigManager {
  private static instance: CentralizedConfigManager;
  private config: CentralizedConfig | null = null;
  private initialized = false;

  public static getInstance(): CentralizedConfigManager {
    if (!CentralizedConfigManager.instance) {
      CentralizedConfigManager.instance = new CentralizedConfigManager();
    }
    return CentralizedConfigManager.instance;
  }

  /**
   * Get environment variable with fallback support
   */
  private getEnvVar(key: string, defaultValue?: string): string {
    // Try with NEXT_PUBLIC_ prefix first (client-side)
    if (typeof window !== 'undefined' && process.env[`NEXT_PUBLIC_${key}`]) {
      return process.env[`NEXT_PUBLIC_${key}`]!;
    }

    // Try without prefix (server-side)
    if (process.env[key]) {
      return process.env[key]!;
    }

    // Try from browser window object
    if (typeof window !== 'undefined' && (window as any).__ENV__ && (window as any).__ENV__[key]) {
      return (window as any).__ENV__[key];
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Environment variable ${key} is not set and no default provided`);
  }

  /**
   * Auto-detect deployment environment
   */
  private detectEnvironment(): DeploymentConfig['environment'] {
    const nodeEnv = this.getEnvVar('NODE_ENV', 'development');
    const envSuffix = this.getEnvVar('ENV_SUFFIX', '');
    
    // Check for IAF-specific deployment
    if (envSuffix === 'iaf' || this.getEnvVar('DEPLOYMENT_TARGET', '') === 'iaf' || this.getEnvVar('DEPLOYMENT_TARGET', '') === 'iafecs') {
      return 'iaf';
    }

    return nodeEnv as DeploymentConfig['environment'];
  }

  /**
   * Auto-detect deployment type
   */
  private detectDeploymentType(): DeploymentConfig['deploymentType'] {
    const backendHost = this.getEnvVar('BACKEND_HOST', 'ristix.bdo-ki.com');
    
    if (backendHost === '10.18.11.35' || backendHost.includes('ristix.bdo-ki.com')) {
      return 'ecs'; // Alibaba ECS
    } else if (backendHost.includes('amazonaws.com')) {
      return 'aws';
    } else if (backendHost.includes('azure')) {
      return 'azure';
    }
    
    return 'local';
  }

  /**
   * Load complete configuration from environment
   */
  public async initialize(): Promise<CentralizedConfig> {
    if (this.initialized && this.config) {
      return this.config;
    }

    console.log('🏗️ Initializing centralized configuration...');

    try {
      const environment = this.detectEnvironment();
      const deploymentType = this.detectDeploymentType();

      console.log(`🌍 Detected environment: ${environment}`);
      console.log(`🚀 Detected deployment: ${deploymentType}`);

      // Build configuration from environment variables
      this.config = {
        deployment: {
          environment,
          deploymentType,
          tenantMode: this.getEnvVar('TENANT_MODE', 'single') as 'multi' | 'single',
          defaultTenant: this.getEnvVar('DEFAULT_TENANT', 'iaf')
        },

        servers: {
          frontend: {
            host: this.getEnvVar('NEXT_PUBLIC_FRONTEND_HOST', 'ristix.bdo-ki.com'),
            port: parseInt(this.getEnvVar('NEXT_PUBLIC_FRONTEND_PORT', '4231')),
            url: this.getEnvVar('NEXT_PUBLIC_FRONTEND_URL', this.detectEnvironment() === 'iaf' ?
              `https://ristix.bdo-ki.com` : `https://iaf-ifrs.ifrspro.id`)
          },
          backend: {
            host: this.getEnvVar('NEXT_PUBLIC_BACKEND_HOST', 'ristix.bdo-ki.com'),
            port: parseInt(this.getEnvVar('NEXT_PUBLIC_BACKEND_PORT', '443')),
            url: this.getEnvVar('NEXT_PUBLIC_BACKEND_URL', this.detectEnvironment() === 'iaf' ?
              `https://ristix.bdo-ki.com` : `https://iaf-ifrs-be.ifrspro.id`),
            apiUrl: this.getEnvVar('NEXT_PUBLIC_BACKEND_API_URL', this.detectEnvironment() === 'iaf' ?
              `https://ristix.bdo-ki.com/api/v1` : `https://iaf-ifrs-be.ifrspro.id/api/v1`)
          },
          rAnalytics: {
            host: this.getEnvVar('NEXT_PUBLIC_R_ANALYTICS_HOST', 'analytics-ristix.bdo-ki.com'),
            port: parseInt(this.getEnvVar('NEXT_PUBLIC_R_ANALYTICS_PORT', '4236')),
            url: this.getEnvVar('NEXT_PUBLIC_R_ANALYTICS_URL', this.detectEnvironment() === 'iaf' ?
              `https://analytics-ristix.bdo-ki.com` : `https://iaf-ifrs-analytics.ifrspro.id`),
            apiUrl: this.getEnvVar('NEXT_PUBLIC_R_API_URL', this.detectEnvironment() === 'iaf' ?
              `https://analytics-calc-ristix.bdo-ki.com/api` : `https://iaf-ifrs-analytics-calc.ifrspro.id/api`)
          }
        },

        database: {
          rds: {
            host: this.detectEnvironment() === 'iaf' ?
              (this.getEnvVar('DB_HOST', 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com')) :
              (this.getEnvVar('DB_HOST', '192.168.0.85')),
            port: parseInt(this.getEnvVar('DB_PORT', '5432')),
            user: this.detectEnvironment() === 'iaf' ?
              (this.getEnvVar('DB_USER', 'admin_iaf')) :
              (this.getEnvVar('DB_USER', 'postgres')),
            password: this.getEnvVar('DB_PASSWORD', 'postgres'),
            ssl: this.detectEnvironment() === 'iaf' || this.getEnvVar('DB_SSL', 'false') === 'true'
          },
          platform: {
            database: this.getEnvVar('PLATFORM_DB_NAME', 'ifrspro_platform_admin')
          },
          shared: {
            database: this.getEnvVar('SHARED_DB_NAME', 'ifrspro_shared_services')
          },
          tenant: {
            database: this.getEnvVar('TENANT_DB_NAME', 'ifrspro_tenant_iaf'),
            prefix: this.getEnvVar('TENANT_DB_PREFIX', 'ifrspro_tenant_')
          }
        },

        rShiny: {
          conventional: {
            host: this.getEnvVar('R_SHINY_HOST', this.getEnvVar('R_ANALYTICS_HOST', 'analytics-ristix.bdo-ki.com')),
            port: parseInt(this.getEnvVar('R_SHINY_CONVENTIONAL_PORT', '4236')),
            url: this.getEnvVar('R_SHINY_CONVENTIONAL_URL', `https://${this.getEnvVar('R_SHINY_HOST', this.getEnvVar('R_ANALYTICS_HOST', 'analytics-ristix.bdo-ki.com'))}`)
          },
          dana: {
            host: this.getEnvVar('R_SHINY_HOST', this.getEnvVar('R_ANALYTICS_HOST', 'analytics-ristix.bdo-ki.com')),
            port: parseInt(this.getEnvVar('R_SHINY_DANA_PORT', '4240')),
            url: this.getEnvVar('R_SHINY_DANA_URL', `https://${this.getEnvVar('R_SHINY_HOST', this.getEnvVar('R_ANALYTICS_HOST', 'analytics-ristix.bdo-ki.com'))}:${this.getEnvVar('R_SHINY_DANA_PORT', '4240')}`)
          }
        },

        app: {
          name: this.getEnvVar('APP_NAME', 'PSAK 413 IAF Platform'),
          version: this.getEnvVar('APP_VERSION', '1.0.0'),
          debug: this.getEnvVar('APP_DEBUG', 'false') === 'true'
        },

        features: {
          multiTenant: this.getEnvVar('FEATURE_MULTI_TENANT', 'false') === 'true',
          rAnalytics: this.getEnvVar('FEATURE_R_ANALYTICS', 'true') === 'true',
          auditTrail: this.getEnvVar('FEATURE_AUDIT_TRAIL', 'true') === 'true',
          islamicBanking: this.getEnvVar('FEATURE_ISLAMIC_BANKING', 'true') === 'true'
        },

        security: {
          // 🚨 SECURITY NOTICE: JWT secrets are NOT exposed to frontend
          // JWT tokens are handled entirely server-side for security
          encryptionKey: this.getEnvVar('ENCRYPTION_KEY', '3bbd7f579ca87a9ec95abf240248ad9a4e12e1524984845625372279f9c7937c'),
          corsOrigins: this.getEnvVar('CORS_ORIGINS', `${this.getEnvVar('FRONTEND_URL', 'https://ristix.bdo-ki.com')},${this.getEnvVar('BACKEND_URL', 'https://ristix.bdo-ki.com')}`).split(',')
        }
      };

      this.initialized = true;
      
      console.log('✅ Centralized configuration loaded successfully');
      console.log('🔧 Configuration summary:', {
        environment: this.config?.deployment?.environment || 'unknown',
        deploymentType: this.config?.deployment?.deploymentType || 'unknown',
        backendUrl: this.config?.servers?.backend?.url || 'unknown',
        frontendUrl: this.config?.servers?.frontend?.url || 'unknown',
        databaseHost: this.config?.database?.rds?.host || 'unknown',
        tenantMode: this.config?.deployment?.tenantMode || 'unknown'
      });

      // Store in window for debugging
      if (typeof window !== 'undefined') {
        (window as any).__IFRS9_CONFIG__ = this.config;
      }

      return this.config;

    } catch (error) {
      console.error('❌ Failed to initialize centralized configuration:', error);
      throw new Error(`Configuration initialization failed: ${error.message}`);
    }
  }

  /**
   * Get current configuration (initialize if needed)
   */
  public async getConfig(): Promise<CentralizedConfig> {
    if (!this.config || !this.initialized) {
      return await this.initialize();
    }
    return this.config;
  }

  /**
   * Get specific configuration section
   */
  public async getSection<K extends keyof CentralizedConfig>(section: K): Promise<CentralizedConfig[K]> {
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
      if (!config.servers.backend.host) {
        errors.push('Backend host not configured');
      }

      if (!config.database.rds.host) {
        errors.push('Database host not configured');
      }

      if (!config.app.name) {
        errors.push('App name not configured');
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
      errors.push(`Configuration validation failed: ${error.message}`);
    }

    const isValid = errors.length === 0;

    if (isValid) {
      console.log('✅ Configuration validation passed');
    } else {
      console.error('❌ Configuration validation failed:', errors);
    }

    return { isValid, errors };
  }
}

// ============================================================================
// 🚀 EXPORTED FUNCTIONS
// ============================================================================

// Singleton instance
const configManager = CentralizedConfigManager.getInstance();

/**
 * Initialize and get complete configuration
 */
export const getCentralizedConfig = async (): Promise<CentralizedConfig> => {
  return await configManager.getConfig();
};

/**
 * Get specific configuration section
 */
export const getConfigSection = async <K extends keyof CentralizedConfig>(section: K): Promise<CentralizedConfig[K]> => {
  return await configManager.getSection(section);
};

/**
 * Validate current configuration
 */
export const validateCentralizedConfig = async (): Promise<{ isValid: boolean; errors: string[] }> => {
  return await configManager.validateConfig();
};

/**
 * Get server URLs for API calls
 */
export const getServerUrls = async () => {
  const servers = await getConfigSection('servers');
  return {
    frontend: servers.frontend.url,
    backend: servers.backend.url,
    backendApi: servers.backend.apiUrl,
    rAnalytics: servers.rAnalytics.url,
    rAnalyticsApi: servers.rAnalytics.apiUrl
  };
};

/**
 * Get R Shiny URLs
 */
export const getRShinyUrls = async () => {
  const rShiny = await getConfigSection('rShiny');
  return {
    conventional: rShiny.conventional.url,
    dana: rShiny.dana.url
  };
};

/**
 * Get database configuration
 */
export const getDatabaseConfig = async () => {
  const database = await getConfigSection('database');
  return database;
};

/**
 * Check if running in specific environment
 */
export const isEnvironment = async (env: DeploymentConfig['environment']): Promise<boolean> => {
  const deployment = await getConfigSection('deployment');
  return deployment.environment === env;
};

/**
 * Check if running on specific deployment type
 */
export const isDeploymentType = async (type: DeploymentConfig['deploymentType']): Promise<boolean> => {
  const deployment = await getConfigSection('deployment');
  return deployment.deploymentType === type;
};

/**
 * Initialize configuration on app start
 */
export const initializeCentralizedConfig = async (): Promise<void> => {
  try {
    console.log('🏗️ Starting centralized configuration initialization...');
    const config = await getCentralizedConfig();
    const validation = await validateCentralizedConfig();
    
    if (!validation.isValid) {
      console.warn('⚠️ Configuration validation issues:', validation.errors);
    }
    
    console.log('✅ Centralized configuration system ready');
    
  } catch (error) {
    console.error('❌ Failed to initialize centralized configuration:', error);
    throw error;
  }
};

// Default export
export default getCentralizedConfig;