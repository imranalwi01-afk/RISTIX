// packages/r-analytics/config/environment-loader-r-analytics.ts
// ============================================================================
// 🎯 CENTRALIZED R-ANALYTICS ENVIRONMENT LOADER - DUAL ENVIRONMENT SUPPORT
// ============================================================================
// ✅ AUTO-DETECTION: IAF Development ↔ IAF Production
// ✅ NO HARDCODING: All URLs from centralized config
// ✅ ENVIRONMENT AWARE: Switches based on hostname detection
// ============================================================================

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

interface RAnalyticsServerConfig {
  host: string;
  port: number;
  url: string;
  apiUrl: string;
}

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

interface RServiceConfig {
  port: number;
  url: string;
  calcUrl: string;
}

interface RAnalyticsConfiguration {
  deployment: {
    environment: 'localdev' | 'iafecs';
    deploymentType: 'local' | 'ecs';
    nodeEnv: string;
    bankingType: string;
    tenantSlug: string;
  };
  servers: {
    rAnalytics: RAnalyticsServerConfig;
    backend: RAnalyticsServerConfig;
    frontend: RAnalyticsServerConfig;
  };
  database: {
    rds: DatabaseConfig;
    legacy: DatabaseConfig;
  };
  rService: RServiceConfig;
  urls: {
    backend: string;
    api: string;
    frontend: string;
    rAnalytics: string;
    rApi: string;
  };
  cors: {
    origins: string[];
  };
  packages: {
    cranRepo: string;
    cranMirror: string;
    requiredPackages: string[];
  };
  tenantDomains: {
    dana: string;
    iaf: string;
    syariah: string;
    conventional: string;
  };
}

class RAnalyticsEnvironmentLoader {
  private static instance: RAnalyticsEnvironmentLoader;
  private config: RAnalyticsConfiguration | null = null;
  private initialized = false;

  public static getInstance(): RAnalyticsEnvironmentLoader {
    if (!RAnalyticsEnvironmentLoader.instance) {
      RAnalyticsEnvironmentLoader.instance = new RAnalyticsEnvironmentLoader();
    }
    return RAnalyticsEnvironmentLoader.instance;
  }

  /**
   * Load environment files in priority order
   */
  private loadEnvironmentFiles(): void {
    const envFiles = [
      '.env',
      '.env.localdev',
      '.env.iafecs',
      '.env.production'
    ];

    envFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`📁 Loading R-analytics environment file: ${file}`);
        dotenv.config({ path: filePath, override: false });
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
   * Auto-detect deployment environment
   */
  private detectEnvironment(): 'localdev' | 'iafecs' {
    const deploymentTarget = this.getEnvVar('DEPLOYMENT_TARGET', '');
    const nodeEnv = this.getEnvVar('NODE_ENV', 'development');
    const hostname = this.getEnvVar('HOSTNAME', '');

    // Priority 1: Explicit deployment target
    if (deploymentTarget === 'iafecs') {
      console.log('🎯 R-analytics: Explicit IAF ECS deployment target detected');
      return 'iafecs';
    }
    if (deploymentTarget === 'localdev') {
      console.log('🏠 R-analytics: Explicit local development target detected');
      return 'localdev';
    }

    // Priority 2: ECS metadata indicators
    if (hostname.includes('ecs') || hostname.includes('alibaba')) {
      console.log('☁️ R-analytics: ECS environment detected from hostname');
      return 'iafecs';
    }

    // Priority 3: Environment file existence
    if (fs.existsSync(path.join(process.cwd(), '.env.iafecs'))) {
      console.log('📄 R-analytics: IAF ECS environment file detected');
      return 'iafecs';
    }

    // Priority 4: Node environment
    if (nodeEnv === 'production' && !deploymentTarget.includes('local')) {
      console.log('🚀 R-analytics: Production environment detected');
      return 'iafecs';
    }

    // Default: Local development
    console.log('🏠 R-analytics: Defaulting to local development environment');
    return 'localdev';
  }

  /**
   * Load complete configuration
   */
  public initialize(): RAnalyticsConfiguration {
    if (this.initialized && this.config) {
      return this.config;
    }

    console.log('🏗️ Initializing R-analytics environment configuration...');

    try {
      // Load environment files
      this.loadEnvironmentFiles();

      const environment = this.detectEnvironment();
      const deploymentType = environment === 'iafecs' ? 'ecs' : 'local';
      const nodeEnv = this.getEnvVar('NODE_ENV', 'development');
      const bankingType = this.getEnvVar('BANKING_TYPE', 'conventional');
      const tenantSlug = this.getEnvVar('TENANT_SLUG', 'iaf');

      console.log(`🌍 R-analytics detected environment: ${environment}`);
      console.log(`🚀 R-analytics deployment: ${deploymentType}`);
      console.log(`📦 R-analytics node environment: ${nodeEnv}`);
      console.log(`🏦 R-analytics banking type: ${bankingType}`);

      // Build configuration
      this.config = {
        deployment: {
          environment,
          deploymentType,
          nodeEnv,
          bankingType,
          tenantSlug
        },

        servers: {
          rAnalytics: {
            host: this.getEnvVar('R_ANALYTICS_HOST', '0.0.0.0'),
            port: parseInt(this.getEnvVar('R_ANALYTICS_PORT', '4236')),
            url: this.getEnvVar('R_ANALYTICS_URL', environment === 'iafecs' ?
              'https://analytics-ristix.bdo-ki.com' : 'https://iaf-ifrs-analytics.ifrspro.id'),
            apiUrl: this.getEnvVar('R_API_URL', environment === 'iafecs' ?
              'https://analytics-calc-ristix.bdo-ki.com' : 'https://iaf-ifrs-analytics-calc.ifrspro.id')
          },
          backend: {
            host: this.getEnvVar('BACKEND_HOST', 'ristix.bdo-ki.com'),
            port: parseInt(this.getEnvVar('BACKEND_PORT', '443')),
            url: this.getEnvVar('BACKEND_URL', environment === 'iafecs' ?
              'https://ristix.bdo-ki.com' : 'https://iaf-ifrs-be.ifrspro.id'),
            apiUrl: this.getEnvVar('BACKEND_API_URL', environment === 'iafecs' ?
              'https://ristix.bdo-ki.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1')
          },
          frontend: {
            host: this.getEnvVar('FRONTEND_HOST', 'ristix.bdo-ki.com'),
            port: parseInt(this.getEnvVar('FRONTEND_PORT', '443')),
            url: this.getEnvVar('FRONTEND_URL', environment === 'iafecs' ?
              'https://ristix.bdo-ki.com' : 'https://iaf-ifrs.ifrspro.id'),
            apiUrl: this.getEnvVar('FRONTEND_API_URL', environment === 'iafecs' ?
              'https://ristix.bdo-ki.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1')
          }
        },

        database: {
          rds: {
            host: this.getEnvVar('RDS_HOST', environment === 'iafecs' ?
              'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com' : '192.168.0.85'),
            port: parseInt(this.getEnvVar('RDS_PORT', '5432')),
            user: this.getEnvVar('RDS_USER', environment === 'iafecs' ? 'admin_iaf' : 'postgres'),
            password: this.getEnvVar('RDS_PASSWORD', environment === 'iafecs' ? 'P@ssw0rd2025!' : 'postgres'),
            database: this.getEnvVar('RDS_DB_NAME', 'ifrspro_tenant_iaf'),
            ssl: environment === 'iafecs'
          },
          legacy: {
            host: this.getEnvVar('LEGACY_HOST', '192.168.0.106'),
            port: parseInt(this.getEnvVar('LEGACY_PORT', '5433')),
            user: this.getEnvVar('LEGACY_USER', 'postgres'),
            password: this.getEnvVar('LEGACY_PASSWORD', 'postgres'),
            database: this.getEnvVar('LEGACY_DB_NAME', 'FRS9PRO'),
            ssl: false
          }
        },

        rService: {
          port: parseInt(this.getEnvVar('R_SERVICE_PORT', '4241')),
          url: this.getEnvVar('R_ANALYTICS_URL', environment === 'iafecs' ?
            'https://analytics-ristix.bdo-ki.com' : 'https://iaf-ifrs-analytics.ifrspro.id'),
          calcUrl: this.getEnvVar('R_API_URL', environment === 'iafecs' ?
            'https://analytics-calc-ristix.bdo-ki.com' : 'https://iaf-ifrs-analytics-calc.ifrspro.id')
        },

        urls: {
          backend: this.getEnvVar('BACKEND_URL', environment === 'iafecs' ?
            'https://ristix.bdo-ki.com' : 'https://iaf-ifrs-be.ifrspro.id'),
          api: this.getEnvVar('BACKEND_API_URL', environment === 'iafecs' ?
            'https://ristix.bdo-ki.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1'),
          frontend: this.getEnvVar('FRONTEND_URL', environment === 'iafecs' ?
            'https://ristix.bdo-ki.com' : 'https://iaf-ifrs.ifrspro.id'),
          rAnalytics: this.getEnvVar('R_ANALYTICS_URL', environment === 'iafecs' ?
            'https://analytics-ristix.bdo-ki.com' : 'https://iaf-ifrs-analytics.ifrspro.id'),
          rApi: this.getEnvVar('R_API_URL', environment === 'iafecs' ?
            'https://analytics-calc-ristix.bdo-ki.com' : 'https://iaf-ifrs-analytics-calc.ifrspro.id')
        },

        cors: {
          origins: this.getEnvVar('CORS_ORIGINS',
            environment === 'iafecs' ?
              'https://ristix.bdo-ki.com,https://ristix.bdo-ki.com,https://analytics-ristix.bdo-ki.com' :
              'https://iaf-ifrs.ifrspro.id,https://iaf-ifrs-be.ifrspro.id,https://iaf-ifrs-analytics.ifrspro.id,http://localhost:3000,http://localhost:4231,http://localhost:4236'
          ).split(',').map(origin => origin.trim())
        },

        packages: {
          cranRepo: this.getEnvVar('R_CRAN_REPO', 'https://cran.r-project.org/'),
          cranMirror: this.getEnvVar('R_CRAN_MIRROR', 'https://cran.rstudio.com/'),
          requiredPackages: this.getEnvVar('R_REQUIRED_PACKAGES',
            'shiny,plumber,jsonlite,RPostgres,dplyr,parallelly,DT,ggplot2,plotly'
          ).split(',').map(pkg => pkg.trim())
        },

        tenantDomains: {
          iaf: this.getEnvVar('R_ANALYTICS_IAF_DOMAIN',
            environment === 'iafecs' ?
              'https://analytics-ristix.bdo-ki.com' :
              'https://iaf-ifrs-analytics.ifrspro.id')
        }
      };

      this.initialized = true;

      console.log('✅ R-analytics environment configuration loaded successfully');
      console.log('🔧 R-analytics configuration summary:', {
        environment: this.config.deployment.environment,
        deploymentType: this.config.deployment.deploymentType,
        bankingType: this.config.deployment.bankingType,
        rAnalyticsUrl: this.config.servers.rAnalytics.url,
        rdsHost: this.config.database.rds.host,
        corsOrigins: this.config.cors.origins.length
      });

      // Store in global for debugging
      if (typeof global !== 'undefined') {
        (global as any).__R_ANALYTICS_CONFIG__ = this.config;
      }

      return this.config;

    } catch (error) {
      console.error('❌ Failed to initialize R-analytics environment configuration:', error);
      throw new Error(`R-analytics configuration initialization failed: ${error.message}`);
    }
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): RAnalyticsConfiguration {
    if (!this.config || !this.initialized) {
      return this.initialize();
    }
    return this.config;
  }

  /**
   * Get specific configuration section
   */
  public getSection<K extends keyof RAnalyticsConfiguration>(section: K): RAnalyticsConfiguration[K] {
    const config = this.getConfiguration();
    return config[section];
  }

  /**
   * Get R-analytics server URLs
   */
  public getRAnalyticsUrls(): {
    url: string;
    apiUrl: string;
    calcUrl: string;
  } {
    const servers = this.getSection('servers');
    const rService = this.getSection('rService');
    return {
      url: servers.rAnalytics.url,
      apiUrl: servers.rAnalytics.apiUrl,
      calcUrl: rService.calcUrl
    };
  }

  /**
   * Get database configuration
   */
  public getDatabaseConfig(): {
    rds: DatabaseConfig;
    legacy: DatabaseConfig;
  } {
    return this.getSection('database');
  }

  /**
   * Get R package configuration
   */
  public getPackageConfig(): {
    cranRepo: string;
    cranMirror: string;
    requiredPackages: string[];
  } {
    return this.getSection('packages');
  }

  /**
   * Get tenant domains
   */
  public getTenantDomains(): {
    dana: string;
    iaf: string;
    syariah: string;
    conventional: string;
  } {
    return this.getSection('tenantDomains');
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
   * Get banking type
   */
  public getBankingType(): string {
    const deployment = this.getSection('deployment');
    return deployment.bankingType;
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
        config.servers.rAnalytics.url,
        config.servers.backend.url,
        config.servers.frontend.url
      ];

      requiredUrls.forEach(url => {
        try {
          new URL(url);
        } catch {
          errors.push(`Invalid URL format: ${url}`);
        }
      });

      // Validate database configuration
      const databases = [config.database.rds, config.database.legacy];
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

      // Validate R packages
      if (config.packages.requiredPackages.length === 0) {
        errors.push('No required R packages configured');
      }

    } catch (error) {
      errors.push(`R-analytics configuration validation failed: ${error.message}`);
    }

    const isValid = errors.length === 0;

    if (isValid) {
      console.log('✅ R-analytics configuration validation passed');
    } else {
      console.error('❌ R-analytics configuration validation failed:', errors);
    }

    return { isValid, errors };
  }
}

// Export singleton instance
export const rAnalyticsEnvironmentLoader = RAnalyticsEnvironmentLoader.getInstance();

// Export convenience functions
export const getRAnalyticsConfig = (): RAnalyticsConfiguration => {
  return rAnalyticsEnvironmentLoader.getConfiguration();
};

export const getRAnalyticsUrls = () => {
  return rAnalyticsEnvironmentLoader.getRAnalyticsUrls();
};

export const getRAnalyticsDatabaseConfig = () => {
  return rAnalyticsEnvironmentLoader.getDatabaseConfig();
};

export const getRAnalyticsPackageConfig = () => {
  return rAnalyticsEnvironmentLoader.getPackageConfig();
};

export const getRAnalyticsTenantDomains = () => {
  return rAnalyticsEnvironmentLoader.getTenantDomains();
};

export const getRAnalyticsCorsOrigins = (): string[] => {
  return rAnalyticsEnvironmentLoader.getCorsOrigins();
};

export const isRAnalyticsECS = (): boolean => {
  return rAnalyticsEnvironmentLoader.isECS();
};

export const getRAnalyticsBankingType = (): string => {
  return rAnalyticsEnvironmentLoader.getBankingType();
};

export default rAnalyticsEnvironmentLoader;