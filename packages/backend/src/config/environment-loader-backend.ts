// packages/backend/src/config/environment-loader-backend.ts
// ============================================================================
// 🎯 CENTRALIZED BACKEND ENVIRONMENT LOADER - DUAL ENVIRONMENT SUPPORT
// ============================================================================
// ✅ AUTO-DETECTION: IAF Development ↔ IAF Production
// ✅ NO HARDCODING: All URLs from centralized config
// ✅ ENVIRONMENT AWARE: Switches based on hostname detection
// ============================================================================

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

interface BackendServerConfig {
  host: string;
  port: number;
  url: string;
  apiUrl: string;
  healthUrl: string;
  testUrl: string;
}

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

interface RAnalyticsConfig {
  url: string;
  healthUrl: string;
  sessionUrl: string;
  calcUrl: string;
  domains: {
    dana: string;
    iaf: string;
    syariah: string;
    conventional: string;
  };
}

interface BackendConfiguration {
  deployment: {
    environment: 'localdev' | 'iafecs';
    deploymentType: 'local' | 'ecs';
    nodeEnv: string;
  };
  servers: {
    backend: BackendServerConfig;
  };
  database: {
    platform: DatabaseConfig;
    shared: DatabaseConfig;
    frs9: DatabaseConfig;
    tenant: DatabaseConfig;
  };
  rAnalytics: RAnalyticsConfig;
  cors: {
    origins: string[];
  };
  urls: {
    backend: string;
    api: string;
    frontend: string;
  };
}

class BackendEnvironmentLoader {
  private static instance: BackendEnvironmentLoader;
  private config: BackendConfiguration | null = null;
  private initialized = false;

  public static getInstance(): BackendEnvironmentLoader {
    if (!BackendEnvironmentLoader.instance) {
      BackendEnvironmentLoader.instance = new BackendEnvironmentLoader();
    }
    return BackendEnvironmentLoader.instance;
  }

  /**
   * Load environment files in priority order
   * Priority: localdev > iafecs > production (for development work)
   */
  private loadEnvironmentFiles(): void {
    // ✅ FIXED: Load in correct priority order - IAF ECS takes precedence
    const deploymentTarget = process.env.DEPLOYMENT_TARGET;

    let envFiles;
    if (deploymentTarget === 'iafecs') {
      // IAF ECS deployment: prioritize IAF ECS configuration
      envFiles = [
        '.env',
        '.env.localdev',
        '.env.iaf',        // Base IAF configuration
        '.env.iafecs',    // IAF ECS specific configuration (higher priority)
        '.env.production' // General production (lowest priority for IAF ECS)
      ];
    } else if (deploymentTarget === 'vps') {
      // VPS (OpenVPN) deployment: prioritize .env.vps
      envFiles = [
        '.env',
        '.env.localdev',
        '.env.iaf',
        '.env.production',
        '.env.vps'         // Highest priority for VPS
      ];
    } else {
      // Local development: prioritize localdev configuration
      envFiles = [
        '.env',
        '.env.iafecs',    // Production config (lower priority)
        '.env.production',
        '.env.iaf',        // Base IAF configuration
        '.env.localdev'    // Local development (highest priority)
      ];
    }

    envFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`📁 Loading environment file: ${file}`);
        // Load files in priority - later files override earlier ones
        dotenv.config({ path: filePath, override: true });
      }
    });
  }

  /**
   * Get environment variable with fallback
   */
  private getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set and no default provided`);
  }

  /**
   * List found environment files for debugging
   */
  private listEnvironmentFiles(): string {
    const envFiles = ['.env', '.env.localdev', '.env.iafecs', '.env.production', '.env.iaf'];
    const foundFiles = envFiles.filter(file => fs.existsSync(path.join(process.cwd(), file)));
    return foundFiles.join(', ') || 'none';
  }

  /**
   * Auto-detect deployment environment
   */
  private detectEnvironment(): 'localdev' | 'iafecs' {
    const deploymentTarget = this.getEnvVar('DEPLOYMENT_TARGET', '');
    const nodeEnv = this.getEnvVar('NODE_ENV', 'development');
    const hostname = this.getEnvVar('HOSTNAME', '');

    console.log(`🔍 Environment Detection Debug:
      DEPLOYMENT_TARGET="${deploymentTarget}"
      NODE_ENV="${nodeEnv}"
      HOSTNAME="${hostname}"
      CWD="${process.cwd()}"
      .env.iaf exists: ${fs.existsSync(path.join(process.cwd(), '.env.iaf'))}
      .env.iafecs exists: ${fs.existsSync(path.join(process.cwd(), '.env.iafecs'))}`);

    // Priority 1: Explicit deployment target (RESPECT USER SETTING)
    if (deploymentTarget === 'iafecs') {
      console.log('🎯 Explicit IAF ECS deployment target detected');
      return 'iafecs';
    }
    if (deploymentTarget === 'vps') {
      console.log('📡 Explicit VPS deployment target detected - Remote Database');
      // Treat VPS basically as "localdev" but with remote DB, or we can use 'localdev' 
      // since the code mainly checks for 'iafecs' vs 'localdev'.
      // Keeping it 'localdev' ensures logic flow remains largely consistent with dev tools.
      return 'localdev';
    }
    if (deploymentTarget === 'localdev') {
      console.log('🏠 Explicit local development target detected - RESPECTING USER SETTING');
      return 'localdev';
    }

    // Priority 2: ECS metadata and environment indicators (ONLY IF NO EXPLICIT TARGET)
    // Check for ECS-specific environment variables and indicators FIRST
    const ecsIndicators = [
      process.env.AWS_REGION,           // Alibaba Cloud ECS sets this
      process.env.ECS_CONTAINER_METADATA_URI, // ECS metadata endpoint
      process.env.ECS_TASK_ARN,         // ECS task identifier
      process.env.AWS_DEFAULT_REGION    // AWS/Alibaba region
    ].filter(Boolean);

    if (ecsIndicators.length > 0) {
      console.log('☁️ ECS environment detected from environment variables:', ecsIndicators);
      console.log('🎯 Auto-detected ECS environment (no explicit DEPLOYMENT_TARGET set)');
      return 'iafecs';
    }

    // Check hostname for ECS patterns (ALIBABA CLOUD SPECIFIC) - ONLY IF NO EXPLICIT TARGET
    if (hostname && (
      hostname.includes('ecs') ||
      hostname.includes('alibaba') ||
      hostname.includes('aliyun') ||
      hostname.startsWith('ip-') ||  // ECS internal IP pattern
      /^\d+\.\d+\.\d+\.\d+$/.test(hostname) // IP address pattern
    )) {
      console.log(`☁️ ECS environment detected from hostname pattern: ${hostname}`);
      console.log('🎯 Auto-detected ECS environment from hostname (no explicit DEPLOYMENT_TARGET set)');
      return 'iafecs';
    }

    // Priority 3: Check for .env.iafecs file (production indicator) - ONLY IF NO EXPLICIT TARGET
    if (fs.existsSync(path.join(process.cwd(), '.env.iafecs'))) {
      console.log('📄 IAF ECS environment file detected → IAF ECS production (no explicit DEPLOYMENT_TARGET set)');
      return 'iafecs';
    }

    // Priority 4: Check for .env.iaf file (localdev indicator)
    if (fs.existsSync(path.join(process.cwd(), '.env.iaf'))) {
      console.log('📄 IAF environment file (symlink to .env.localdev) detected → local development');
      return 'localdev';
    }

    // Priority 5: Node environment (only as fallback)
    if (nodeEnv === 'production' && !deploymentTarget.includes('local')) {
      console.log('🚀 Production environment detected without explicit local indicators');
      return 'iafecs';
    }

    // Default: Local development
    console.log('🏠 Defaulting to local development environment');
    return 'localdev';
  }

  /**
   * Auto-detect deployment type
   */
  private detectDeploymentType(): 'local' | 'ecs' {
    const environment = this.detectEnvironment();
    return environment === 'iafecs' ? 'ecs' : 'local';
  }

  /**
   * Load complete configuration
   */
  public initialize(): BackendConfiguration {
    if (this.initialized && this.config) {
      return this.config;
    }

    console.log('🏗️ Initializing backend environment configuration...');

    try {
      // Load environment files
      this.loadEnvironmentFiles();

      const environment = this.detectEnvironment();
      const deploymentType = this.detectDeploymentType();
      const nodeEnv = this.getEnvVar('NODE_ENV', 'development');

      console.log(`🌍 Detected environment: ${environment}`);
      console.log(`🚀 Detected deployment: ${deploymentType}`);
      console.log(`📦 Node environment: ${nodeEnv}`);
      console.log(`📁 Working directory: ${process.cwd()}`);
      console.log(`🔍 Environment files found: ${this.listEnvironmentFiles()}`);

      // Build configuration
      this.config = {
        deployment: {
          environment,
          deploymentType,
          nodeEnv
        },


        servers: {
          backend: {
            host: this.getEnvVar('BACKEND_HOST', '0.0.0.0'),
            port: parseInt(this.getEnvVar('BACKEND_PORT', '4232')),
            url: this.getEnvVar('BACKEND_URL', environment === 'iafecs' ?
              'https://iaf-ifrs-be.danafin.com' : 'https://iaf-ifrs-be.ifrspro.id'),
            apiUrl: this.getEnvVar('BACKEND_API_URL', environment === 'iafecs' ?
              'https://iaf-ifrs-be.danafin.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1'),
            healthUrl: this.getEnvVar('BACKEND_HEALTH_URL', environment === 'iafecs' ?
              'https://iaf-ifrs-be.danafin.com/health' : 'https://iaf-ifrs-be.ifrspro.id/health'),
            testUrl: this.getEnvVar('BACKEND_TEST_URL', environment === 'iafecs' ?
              'https://iaf-ifrs-be.danafin.com/api/v1/test' : 'https://iaf-ifrs-be.ifrspro.id/api/v1/test')
          }
        },

        database: {
          platform: {
            host: this.getEnvVar('PLATFORM_DB_HOST', this.getEnvVar('DB_HOST')),
            port: parseInt(this.getEnvVar('PLATFORM_DB_PORT', this.getEnvVar('DB_PORT', '5432'))),
            user: this.getEnvVar('PLATFORM_DB_USER', this.getEnvVar('DB_USER')),
            password: this.getEnvVar('PLATFORM_DB_PASSWORD', this.getEnvVar('DB_PASSWORD')),
            database: this.getEnvVar('PLATFORM_DB_NAME', 'ifrspro_platform_admin'),
            ssl: this.getEnvVar('PLATFORM_DB_SSL', this.getEnvVar('DB_SSL', 'false')) === 'true'
          },
          shared: {
            host: this.getEnvVar('SHARED_DB_HOST', this.getEnvVar('DB_HOST')),
            port: parseInt(this.getEnvVar('SHARED_DB_PORT', this.getEnvVar('DB_PORT', '5432'))),
            user: this.getEnvVar('SHARED_DB_USER', this.getEnvVar('DB_USER')),
            password: this.getEnvVar('SHARED_DB_PASSWORD', this.getEnvVar('DB_PASSWORD')),
            database: this.getEnvVar('SHARED_DB_NAME', 'ifrspro_shared_services'),
            ssl: this.getEnvVar('SHARED_DB_SSL', this.getEnvVar('DB_SSL', 'false')) === 'true'
          },
          frs9: {
            host: this.getEnvVar('FRS9_DB_HOST', this.getEnvVar('LEGACY_DB_HOST')),
            port: parseInt(this.getEnvVar('FRS9_DB_PORT', this.getEnvVar('LEGACY_DB_PORT', '5432'))),
            user: this.getEnvVar('FRS9_DB_USER', this.getEnvVar('LEGACY_DB_USER')),
            password: this.getEnvVar('FRS9_DB_PASSWORD', this.getEnvVar('LEGACY_DB_PASSWORD')),
            database: this.getEnvVar('FRS9_DB_NAME', 'FRS9PRO'),
            ssl: this.getEnvVar('FRS9_DB_SSL', this.getEnvVar('LEGACY_DB_SSL', 'false')) === 'true'
          },
          tenant: {
            host: this.getEnvVar('TENANT_DB_HOST', this.getEnvVar('DB_HOST')),
            port: parseInt(this.getEnvVar('TENANT_DB_PORT', this.getEnvVar('DB_PORT', '5432'))),
            user: this.getEnvVar('TENANT_DB_USER', this.getEnvVar('DB_USER')),
            password: this.getEnvVar('TENANT_DB_PASSWORD', this.getEnvVar('DB_PASSWORD')),
            database: this.getEnvVar('TENANT_DB_NAME', 'ifrspro_tenant_iaf'),
            ssl: this.getEnvVar('TENANT_DB_SSL', this.getEnvVar('DB_SSL', 'false')) === 'true'
          }
        },

        rAnalytics: {
          url: this.getEnvVar('R_ANALYTICS_URL', environment === 'iafecs' ?
            'https://iaf-ifrs-analytics.danafin.com' : 'https://iaf-ifrs-analytics.ifrspro.id'),
          healthUrl: this.getEnvVar('R_ANALYTICS_HEALTH_URL', environment === 'iafecs' ?
            'https://iaf-ifrs-be.danafin.com/api/v1/r-analytics/health' : 'https://iaf-ifrs-be.ifrspro.id/api/v1/r-analytics/health'),
          sessionUrl: this.getEnvVar('R_ANALYTICS_SESSION_URL', environment === 'iafecs' ?
            'https://iaf-ifrs-be.danafin.com/api/v1/r-analytics/session' : 'https://iaf-ifrs-be.ifrspro.id/api/v1/r-analytics/session'),
          calcUrl: this.getEnvVar('R_ANALYTICS_CALC_URL', environment === 'iafecs' ?
            'https://iaf-ifrs-analytics-calc.danafin.com' : 'https://iaf-ifrs-analytics-calc.ifrspro.id'),
          domains: {
            iaf: this.getEnvVar('R_ANALYTICS_IAF_DOMAIN',
              environment === 'iafecs' ?
                'https://iaf-ifrs-analytics.danafin.com' :
                'https://iaf-ifrs-analytics.ifrspro.id'),
            dana: this.getEnvVar('R_ANALYTICS_DANA_DOMAIN',
              environment === 'iafecs' ?
                'https://iaf-ifrs-analytics.danafin.com' :
                'https://iaf-ifrs-analytics.ifrspro.id'),
            syariah: this.getEnvVar('R_ANALYTICS_SYARIAH_DOMAIN',
              environment === 'iafecs' ?
                'https://iaf-ifrs-analytics.danafin.com' :
                'https://iaf-ifrs-analytics.ifrspro.id'),
            conventional: this.getEnvVar('R_ANALYTICS_CONVENTIONAL_DOMAIN',
              environment === 'iafecs' ?
                'https://iaf-ifrs-analytics.danafin.com' :
                'https://iaf-ifrs-analytics.ifrspro.id')
          }
        },

        cors: {
          origins: this.getEnvVar('CORS_ORIGINS',
            environment === 'iafecs' ?
              'https://iaf-ifrs.danafin.com,https://iaf-ifrs-be.danafin.com,https://iaf-ifrs-analytics.danafin.com,https://iaf-ifrs-analytics-calc.danafin.com' :
              'https://iaf-ifrs.ifrspro.id,https://iaf-ifrs-be.ifrspro.id,https://iaf-ifrs-analytics.ifrspro.id,https://iaf-ifrs-analytics-calc.ifrspro.id,http://localhost:3000,http://localhost:4231,http://localhost:4232,http://10.18.11.35:4231,http://10.18.11.35:4232,http://10.18.11.35:4236'
          ).split(',').map(origin => origin.trim())
        },

        urls: {
          backend: this.getEnvVar('BACKEND_URL', environment === 'iafecs' ?
            'https://iaf-ifrs-be.danafin.com' : 'https://iaf-ifrs-be.ifrspro.id'),
          api: this.getEnvVar('BACKEND_API_URL', environment === 'iafecs' ?
            'https://iaf-ifrs-be.danafin.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1'),
          frontend: this.getEnvVar('FRONTEND_URL', environment === 'iafecs' ?
            'https://iaf-ifrs.danafin.com' : 'https://iaf-ifrs.ifrspro.id')
        }
      };

      this.initialized = true;

      console.log('✅ Backend environment configuration loaded successfully');
      console.log('🔧 Configuration summary:', {
        environment: this.config.deployment.environment,
        deploymentType: this.config.deployment.deploymentType,
        backendUrl: this.config.servers.backend.url,
        databaseHost: this.config.database.platform.host,
        rAnalyticsUrl: this.config.rAnalytics.url,
        corsOrigins: this.config.cors.origins.length
      });

      // Store in global for debugging
      if (typeof globalThis !== 'undefined') {
        (globalThis as any).__BACKEND_CONFIG__ = this.config;
      }

      return this.config;

    } catch (error) {
      console.error('❌ Failed to initialize backend environment configuration:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Backend configuration initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): BackendConfiguration {
    if (!this.config || !this.initialized) {
      return this.initialize();
    }
    return this.config;
  }

  /**
   * Get specific configuration section
   */
  public getSection<K extends keyof BackendConfiguration>(section: K): BackendConfiguration[K] {
    const config = this.getConfiguration();
    return config[section];
  }

  /**
   * Get backend server URLs
   */
  public getServerUrls(): {
    url: string;
    apiUrl: string;
    healthUrl: string;
    testUrl: string;
  } {
    const servers = this.getSection('servers');
    return {
      url: servers.backend.url,
      apiUrl: servers.backend.apiUrl,
      healthUrl: servers.backend.healthUrl,
      testUrl: servers.backend.testUrl
    };
  }

  /**
   * Get database configuration
   */
  public getDatabaseConfig(): {
    platform: DatabaseConfig;
    shared: DatabaseConfig;
    frs9: DatabaseConfig;
    tenant: DatabaseConfig;
  } {
    return this.getSection('database');
  }

  /**
   * Get R Analytics configuration
   */
  public getRAnalyticsConfig(): RAnalyticsConfig {
    return this.getSection('rAnalytics');
  }

  /**
   * Get CORS origins
   */
  public getCorsOrigins(): string[] {
    const cors = this.getSection('cors');
    return cors.origins;
  }

  /**
   * Check if running in specific environment
   */
  public isEnvironment(env: 'localdev' | 'iafecs'): boolean {
    const deployment = this.getSection('deployment');
    return deployment.environment === env;
  }

  /**
   * Check if running on ECS
   */
  public isECS(): boolean {
    const deployment = this.getSection('deployment');
    return deployment.deploymentType === 'ecs';
  }

  /**
   * Generate a cryptographically secure default secret
   */
  private generateDefaultSecret(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const config = this.getConfiguration();

      // Validate required URLs
      const requiredUrls = [
        config.servers.backend.url,
        config.servers.backend.apiUrl,
        config.rAnalytics.url
      ];

      requiredUrls.forEach(url => {
        try {
          new URL(url);
        } catch {
          errors.push(`Invalid URL format: ${url}`);
        }
      });

      // Validate database configuration
      const databases = [config.database.platform, config.database.shared, config.database.frs9, config.database.tenant];
      databases.forEach((db, index) => {
        if (!db.host) {
          errors.push(`Database ${index + 1} host not configured`);
        }
        if (!db.database) {
          errors.push(`Database ${index + 1} name not configured`);
        }
      });

      // Validate CORS origins
      config.cors.origins.forEach(origin => {
        if (origin !== '*' && !origin.startsWith('http')) {
          errors.push(`Invalid CORS origin format: ${origin}`);
        }
      });

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

// Export singleton instance
export const backendEnvironmentLoader = BackendEnvironmentLoader.getInstance();

// Export convenience functions
export const getBackendConfig = (): BackendConfiguration => {
  return backendEnvironmentLoader.getConfiguration();
};

export const getBackendUrls = () => {
  return backendEnvironmentLoader.getServerUrls();
};

export const getBackendDatabaseConfig = () => {
  return backendEnvironmentLoader.getDatabaseConfig();
};

export const getBackendRAnalyticsConfig = () => {
  return backendEnvironmentLoader.getRAnalyticsConfig();
};

export const getBackendCorsOrigins = (): string[] => {
  return backendEnvironmentLoader.getCorsOrigins();
};

export const isBackendECS = (): boolean => {
  return backendEnvironmentLoader.isECS();
};

/**
 * Get DS2 database configuration (FRS9PRO)
 */
export const getDS2DatabaseConfig = (): DatabaseConfig => {
  const config = backendEnvironmentLoader.getConfiguration();
  return config.database.frs9;
};

export default backendEnvironmentLoader;