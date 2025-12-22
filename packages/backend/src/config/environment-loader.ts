// packages/backend/src/config/environment-loader.ts
// =============================================================================
// 🚀 SMART ENVIRONMENT LOADER - SEAMLESS LOCALDEV/IAFECS SWITCHING
// =============================================================================
// Purpose: Automatically detect and load correct environment configuration
// Supports: LOCALDEV (localhost) and IAFECS (Alibaba Cloud ECS)
// Usage: DEPLOYMENT_TARGET=localdev|iafecs or automatic detection
// =============================================================================

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface EnvironmentConfig {
  // Environment Detection
  nodeEnv: string;
  deploymentTarget: 'localdev' | 'iafecs';
  environmentName: string;
  isProduction: boolean;
  isLocalDev: boolean;
  isEcs: boolean;

  // Database Configuration
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    platform: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      ssl: boolean;
    };
    tenant: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      ssl: boolean;
    };
    shared: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      ssl: boolean;
    };
    legacy: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      ssl: boolean;
    };
  };

  // Server Configuration
  server: {
    backend: {
      host: string;
      port: number;
      url: string;
    };
    frontend: {
      host: string;
      port: number;
      url: string;
    };
    rAnalytics: {
      host: string;
      port: number;
      url: string;
      servicePort: number;
    };
  };

  // URLs
  urls: {
    frontend: string;
    backend: string;
    api: string;
    rApi: string;
    rDashboard: string;
  };

  // Security Configuration
  security: {
    jwtSecret: string;
    jwtRefreshSecret: string;
    encryptionKey: string;
    corsOrigins: string[];
  };

  // IAF Tenant Configuration
  tenant: {
    id: string;
    slug: string;
    name: string;
    companyName: string;
    bankingType: string;
    mode: string;
  };

  // Feature Flags
  features: {
    advancedAnalytics: boolean;
    islamicBanking: boolean;
    auditTrail: boolean;
    developmentTools: boolean;
    mockData: boolean;
  };
}

export class SmartEnvironmentLoader {
  private static instance: SmartEnvironmentLoader;
  private config: EnvironmentConfig | null = null;
  private isLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): SmartEnvironmentLoader {
    if (!SmartEnvironmentLoader.instance) {
      SmartEnvironmentLoader.instance = new SmartEnvironmentLoader();
    }
    return SmartEnvironmentLoader.instance;
  }

  /**
   * Auto-detect environment and load configuration
   */
  public loadConfiguration(): EnvironmentConfig {
    if (this.isLoaded) {
      return this.config!;
    }

    console.log('🔧 Smart Environment Loader - Auto-detecting environment...');
    console.log(`📁 Working directory: ${process.cwd()}`);

    // Step 1: Detect deployment target
    const deploymentTarget = this.detectDeploymentTarget();
    console.log(`🎯 Detected deployment target: ${deploymentTarget}`);

    // Step 2: Load appropriate environment file
    this.loadEnvironmentFile(deploymentTarget);

    // Step 3: Build configuration object
    this.config = this.buildConfiguration(deploymentTarget);

    // Step 4: Validate configuration
    this.validateConfiguration();

    this.isLoaded = true;
    console.log('✅ Environment configuration loaded successfully');
    this.logConfigurationSummary();

    return this.config;
  }

  /**
   * Auto-detect deployment target based on system and environment
   */
  private detectDeploymentTarget(): 'localdev' | 'iafecs' {
    // Priority 1: Explicit DEPLOYMENT_TARGET environment variable
    const explicitTarget = process.env.DEPLOYMENT_TARGET;
    if (explicitTarget === 'localdev' || explicitTarget === 'iafecs') {
      console.log(`📋 Using explicit DEPLOYMENT_TARGET: ${explicitTarget}`);
      return explicitTarget;
    }

    // Priority 2: Check if running on Alibaba Cloud ECS
    if (this.isRunningOnECS()) {
      console.log('☁️ Detected Alibaba Cloud ECS environment');
      return 'iafecs';
    }

    // Priority 3: Check if .env.iafecs exists (indicates ECS deployment)
    if (fs.existsSync(path.join(process.cwd(), '.env.iafecs'))) {
      console.log('📄 Found .env.iafecs file - assuming ECS deployment');
      return 'iafecs';
    }

    // Priority 4: Check if .env.localdev exists
    if (fs.existsSync(path.join(process.cwd(), '.env.localdev'))) {
      console.log('📄 Found .env.localdev file - assuming local development');
      return 'localdev';
    }

    // Priority 5: Check hostname and network indicators
    const hostname = os.hostname();
    if (hostname.includes('ecs') || hostname.includes('alibaba') || hostname.includes('10.18')) {
      console.log('🌐 Network indicators suggest ECS environment');
      return 'iafecs';
    }

    // Default: Local development
    console.log('💻 Defaulting to local development environment');
    return 'localdev';
  }

  /**
   * Check if running on Alibaba Cloud ECS
   */
  private isRunningOnECS(): boolean {
    // Check for explicit deployment target first
    const deploymentTarget = process.env.DEPLOYMENT_TARGET;
    if (deploymentTarget === 'localdev') {
      console.log('🏠 Explicit localdev deployment target detected');
      return false;
    }
    if (deploymentTarget === 'iafecs') {
      console.log('🎯 Explicit iafecs deployment target detected');
      return true;
    }

    // Fallback to ECS detection
    return !!(
      process.env.ECS_CONTAINER_METADATA_URI ||
      process.env.ECS_CONTAINER_METADATA_URI_V4 ||
      process.env.AWS_EXECUTION_ENV?.includes('ECS') ||
      process.env.AWS_REGION ||
      fs.existsSync('/etc/ecs/ecs.config') ||
      fs.existsSync('/var/log/ecs/ecs-agent.log')
    );
  }

  /**
   * Load appropriate environment file
   */
  private loadEnvironmentFile(deploymentTarget: 'localdev' | 'iafecs'): void {
    const envFiles = [
      '.env',                    // Base configuration (lowest priority)
      `.env.${deploymentTarget}`, // Environment-specific (highest priority)
    ];

    console.log('📄 Loading environment files...');

    envFiles.forEach(envFile => {
      const envPath = path.join(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        console.log(`✅ Loading: ${envFile}`);
        dotenv.config({ path: envPath, override: true });
      } else {
        console.log(`⚠️ Not found: ${envFile}`);
      }
    });
  }

  /**
   * Build comprehensive configuration object
   */
  private buildConfiguration(deploymentTarget: 'localdev' | 'iafecs'): EnvironmentConfig {
    const isEcs = deploymentTarget === 'iafecs';
    const isLocalDev = deploymentTarget === 'localdev';
    const isProduction = process.env.NODE_ENV === 'production' || isEcs;

    // Database configuration - USE ENVIRONMENT VARIABLES ONLY
    const database = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      platform: {
        host: process.env.PLATFORM_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.PLATFORM_DB_PORT || process.env.DB_PORT || '5432'),
        database: process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin',
        user: process.env.PLATFORM_DB_USER || process.env.DB_USER || 'postgres',
        password: process.env.PLATFORM_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.PLATFORM_DB_SSL === 'true' || process.env.DB_SSL === 'true'
      },
      tenant: {
        host: process.env.TENANT_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.TENANT_DB_PORT || process.env.DB_PORT || '5432'),
        database: process.env.TENANT_DB_NAME || 'ifrspro_tenant_iaf',
        user: process.env.TENANT_DB_USER || process.env.DB_USER || 'postgres',
        password: process.env.TENANT_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.TENANT_DB_SSL === 'true' || process.env.DB_SSL === 'true'
      },
      shared: {
        host: process.env.SHARED_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.SHARED_DB_PORT || process.env.DB_PORT || '5432'),
        database: process.env.SHARED_DB_NAME || 'ifrspro_shared_services',
        user: process.env.SHARED_DB_USER || process.env.DB_USER || 'postgres',
        password: process.env.SHARED_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.SHARED_DB_SSL === 'true' || process.env.DB_SSL === 'true'
      },
      legacy: {
        host: process.env.LEGACY_DB_HOST || process.env.FRS9_DB_HOST || '192.168.0.106',
        port: parseInt(process.env.LEGACY_DB_PORT || process.env.FRS9_DB_PORT || '5433'),
        database: process.env.LEGACY_DB_NAME || process.env.FRS9_DB_NAME || 'FRS9PRO',
        user: process.env.LEGACY_DB_USER || process.env.FRS9_DB_USER || 'postgres',
        password: process.env.LEGACY_DB_PASSWORD || process.env.FRS9_DB_PASSWORD || 'postgres',
        ssl: process.env.LEGACY_DB_SSL === 'true' || process.env.FRS9_DB_SSL === 'true'
      }
    };

    // Server configuration - USE ENVIRONMENT VARIABLES ONLY
    const server = {
      backend: {
        host: process.env.BACKEND_HOST || 'localhost',
        port: parseInt(process.env.BACKEND_PORT || '4232'),
        url: process.env.BACKEND_URL || 'http://localhost:4232'
      },
      frontend: {
        host: process.env.FRONTEND_HOST || 'localhost',
        port: parseInt(process.env.FRONTEND_PORT || '4231'),
        url: process.env.FRONTEND_URL || 'http://localhost:4231'
      },
      rAnalytics: {
        host: process.env.R_ANALYTICS_HOST || 'localhost',
        port: parseInt(process.env.R_ANALYTICS_PORT || '4236'),
        url: process.env.R_ANALYTICS_URL || 'http://localhost:4236',
        servicePort: parseInt(process.env.R_SERVICE_PORT || '4241')
      }
    };

    // URLs - USE ENVIRONMENT VARIABLES ONLY
    const urls = {
      frontend: process.env.FRONTEND_URL || 'http://localhost:4231',
      backend: process.env.BACKEND_URL || 'http://localhost:4232',
      api: process.env.API_BASE_URL || 'http://localhost:4232/api',
      rApi: process.env.RAPI_BASE_URL || 'http://localhost:4241/api',
      rDashboard: process.env.R_ANALYTICS_URL || 'http://localhost:4236'
    };

    // Security configuration - USE ENVIRONMENT VARIABLES ONLY
    const security = {
      jwtSecret: process.env.JWT_SECRET || 'ifrs9-localdev-jwt-secret-change-in-production-2025',
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'ifrs9-localdev-refresh-secret-change-in-production-2025',
      encryptionKey: process.env.ENCRYPTION_KEY || 'ifrs9-localdev-encryption-key-change-in-production-2025',
      corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean)
    };

    // Tenant configuration
    const tenant = {
      id: process.env.TENANT_ID || 'iaf',
      slug: process.env.TENANT_SLUG || 'iaf',
      name: process.env.TENANT_NAME || (isEcs ? 'Indonesia Airawata Finance' : 'Indonesia Airawata Finance (Local Development)'),
      companyName: process.env.COMPANY_NAME || 'Indonesia Airawata Finance',
      bankingType: process.env.BANKING_TYPE || 'conventional',
      mode: process.env.IAF_TENANT_MODE || 'single'
    };

    // Feature flags
    const features = {
      advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
      islamicBanking: process.env.FEATURE_ISLAMIC_BANKING === 'true',
      auditTrail: process.env.FEATURE_AUDIT_TRAIL === 'true',
      developmentTools: process.env.FEATURE_DEVELOPMENT_TOOLS === 'true' && !isProduction,
      mockData: process.env.FEATURE_MOCK_DATA === 'true' && !isProduction
    };

    return {
      nodeEnv: process.env.NODE_ENV || (isEcs ? 'production' : 'development'),
      deploymentTarget,
      environmentName: isEcs ? 'IAF ECS Production' : 'Local Development',
      isProduction,
      isLocalDev,
      isEcs,
      database,
      server,
      urls,
      security,
      tenant,
      features
    };
  }

  /**
   * Validate critical configuration
   */
  private validateConfiguration(): void {
    const config = this.config!;
    const warnings: string[] = [];

    // Validate database connections
    if (!config.database.host || !config.database.user) {
      warnings.push('Database configuration is incomplete');
    }

    // Validate security
    if (config.security.jwtSecret.includes('change-in-production') && config.isProduction) {
      warnings.push('Using default JWT secrets in production - please change them!');
    }

    // Validate URLs
    if (!config.urls.frontend || !config.urls.backend) {
      warnings.push('Frontend/Backend URLs are not configured');
    }

    if (warnings.length > 0) {
      console.warn('⚠️ Configuration warnings:');
      warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
  }

  /**
   * Log configuration summary
   */
  private logConfigurationSummary(): void {
    const config = this.config!;

    console.log('\n📋 Environment Configuration Summary:');
    console.log('=====================================');
    console.log(`🎯 Environment: ${config.environmentName}`);
    console.log(`🖥️  Node.js: ${config.nodeEnv}`);
    console.log(`🚀 Target: ${config.deploymentTarget}`);
    console.log(`🌐 Is Production: ${config.isProduction}`);

    console.log('\n🌐 Server URLs:');
    console.log(`  Frontend: ${config.urls.frontend}`);
    console.log(`  Backend:  ${config.urls.backend}`);
    console.log(`  API:      ${config.urls.api}`);
    console.log(`  R Analytics: ${config.urls.rDashboard}`);

    console.log('\n🗄️ Primary Database:');
    console.log(`  Platform: ${config.database.platform.host}:${config.database.platform.port}/${config.database.platform.database}`);
    console.log(`  SSL:     ${config.database.platform.ssl}`);

    console.log('\n🏢 Tenant Configuration:');
    console.log(`  Tenant: ${config.tenant.name} (${config.tenant.id})`);
    console.log(`  Banking: ${config.tenant.bankingType}`);
    console.log(`  Mode:    ${config.tenant.mode}`);

    console.log('\n✨ Features:');
    console.log(`  Analytics: ${config.features.advancedAnalytics ? 'Enabled' : 'Disabled'}`);
    console.log(`  Islamic Banking: ${config.features.islamicBanking ? 'Enabled' : 'Disabled'}`);
    console.log(`  Development Tools: ${config.features.developmentTools ? 'Enabled' : 'Disabled'}`);
    console.log('=====================================\n');
  }

  /**
   * Get loaded configuration
   */
  public getConfiguration(): EnvironmentConfig {
    if (!this.isLoaded) {
      throw new Error('Configuration not loaded. Call loadConfiguration() first.');
    }
    return this.config!;
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.getConfiguration().isProduction;
  }

  /**
   * Check if running in local development
   */
  public isLocalDevelopment(): boolean {
    return this.getConfiguration().isLocalDev;
  }

  /**
   * Check if running on ECS
   */
  public isEcsDeployment(): boolean {
    return this.getConfiguration().isEcs;
  }

  /**
   * Get deployment target
   */
  public getDeploymentTarget(): 'localdev' | 'iafecs' {
    return this.getConfiguration().deploymentTarget;
  }
}

// Export singleton instance
export const environmentLoader = SmartEnvironmentLoader.getInstance();

// Auto-load on import
environmentLoader.loadConfiguration();