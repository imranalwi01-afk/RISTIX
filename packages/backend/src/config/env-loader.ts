// packages/backend/src/config/env-loader.ts
// ============================================================================
// IAF Environment Configuration Loader
// ============================================================================
// Purpose: Load .env.iaf configuration for ECS deployment
// Company: Indonesia Airawata Finance (IAF)
// ============================================================================

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export class IAFEnvironmentLoader {
  private static instance: IAFEnvironmentLoader;
  private isLoaded: boolean = false;

  private constructor() { }

  public static getInstance(): IAFEnvironmentLoader {
    if (!IAFEnvironmentLoader.instance) {
      IAFEnvironmentLoader.instance = new IAFEnvironmentLoader();
    }
    return IAFEnvironmentLoader.instance;
  }

  /**
   * Load IAF-specific environment configuration
   * Priority: .env.localdev > .env.iafecs > .env > .env.production
   */
  public loadEnvironment(): void {
    if (this.isLoaded) {
      console.log('✅ IAF environment already loaded');
      return;
    }

    const rootDir = path.resolve(process.cwd());
    const deploymentTarget = process.env.DEPLOYMENT_TARGET || 'localdev';

    console.log(`🎯 Deployment Target: ${deploymentTarget}`);
    console.log(`🔍 PRE-LOAD DEBUG: PLATFORM_DB_HOST=${process.env.PLATFORM_DB_HOST}`);
    console.log(`🔍 PRE-LOAD DEBUG: DB_HOST=${process.env.DB_HOST}`);

    // Load environment files based on deployment target
    // ✅ CHANGED: Load in Priority Descending order (High -> Low)
    // This allows existing variables (from dotenv-cli or system) to be preserved (First Wins)
    let envFiles;
    if (deploymentTarget === 'iafecs') {
      // IAF ECS deployment
      envFiles = [
        '.env.production',        // Highest priority (was last with override: true)
        '.env.iafecs',
        '.env.iaf',
        '.env'                    // Base configuration
      ];
    } else {
      // Local development
      envFiles = [
        '.env.localdev',          // Highest priority
        '.env.iaf',
        '.env.production',
        '.env'                    // Base configuration
      ];
    }

    console.log('🔧 Loading IAF environment configuration...');
    console.log(`📁 Root directory: ${rootDir}`);

    // Load each env file. Since override is false (default), the first file to set a variable wins.
    // This supports dotenv-cli usage where variables are pre-loaded.
    envFiles.forEach(envFile => {
      const envPath = path.join(rootDir, envFile);
      if (fs.existsSync(envPath)) {
        console.log(`📄 Loading (fallback): ${envFile}`);
        dotenv.config({ path: envPath }); // override: false is default
      } else {
        // console.log(`⚠️ Not found: ${envFile}`); // Reduce noise
      }
    });

    // Validate critical IAF configurations
    this.validateIAFConfiguration();

    this.isLoaded = true;
    console.log('✅ IAF environment configuration loaded successfully');
    this.logConfiguration();
  }

  /**
   * Validate that critical IAF configurations are present
   */
  private validateIAFConfiguration(): void {
    const requiredVars = [
      'PLATFORM_DB_HOST',
      'PLATFORM_DB_USER',
      'PLATFORM_DB_PASSWORD',
      'TENANT_DB_HOST',
      'TENANT_DB_USER',
      'TENANT_DB_PASSWORD'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
      console.warn('⚠️ Missing IAF configuration variables:', missing);
      console.log('💡 Make sure .env.iaf file is present and properly configured');
    }
  }

  /**
   * Get database configuration for IAF
   */
  public getIAFDatabaseConfig() {
    return {
      // Platform Admin Database
      platform: {
        host: process.env.PLATFORM_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.PLATFORM_DB_PORT || process.env.DB_PORT || '5432'),
        database: process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin',
        user: (process.env.DEPLOYMENT_TARGET === 'vps') ? 'postgres' : (process.env.PLATFORM_DB_USER || process.env.DB_USER || 'postgres'),
        password: (process.env.DEPLOYMENT_TARGET === 'vps') ? 'postgres' : (process.env.PLATFORM_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres'),
        ssl: process.env.PLATFORM_DB_SSL === 'true'
      },

      // Shared Services Database
      shared: {
        host: process.env.SHARED_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.SHARED_DB_PORT || process.env.DB_PORT || '5432'),
        database: process.env.SHARED_DB_NAME || 'ifrspro_shared_services',
        user: process.env.SHARED_DB_USER || process.env.DB_USER || 'postgres',
        password: process.env.SHARED_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.SHARED_DB_SSL === 'true'
      },

      // IAF Tenant Database
      tenant: {
        host: process.env.TENANT_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.TENANT_DB_PORT || process.env.DB_PORT || '5432'),
        database: process.env.TENANT_DB_NAME || 'ifrspro_tenant_iaf',
        user: (process.env.DEPLOYMENT_TARGET === 'vps') ? 'postgres' : (process.env.TENANT_DB_USER || process.env.DB_USER || 'postgres'),
        password: (process.env.DEPLOYMENT_TARGET === 'vps') ? 'postgres' : (process.env.TENANT_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres'),
        ssl: process.env.TENANT_DB_SSL === 'true'
      },

      // Legacy FRS9PRO Database
      legacy: {
        host: process.env.LEGACY_DB_HOST || process.env.FRS9_DB_HOST || 'localhost',
        port: parseInt(process.env.LEGACY_DB_PORT || process.env.FRS9_DB_PORT || '5432'),
        database: process.env.LEGACY_DB_NAME || 'FRS9PRO',
        user: process.env.LEGACY_DB_USER || process.env.FRS9_DB_USER || 'postgres',
        password: process.env.LEGACY_DB_PASSWORD || process.env.FRS9_DB_PASSWORD || 'postgres',
        ssl: process.env.LEGACY_DB_SSL === 'true'
      }
    };
  }

  /**
   * Get server configuration for IAF
   */
  public getIAFServerConfig() {
    return {
      backend: {
        host: process.env.BACKEND_HOST || '0.0.0.0',
        port: parseInt(process.env.PORT || process.env.BACKEND_PORT || '4232'),
        url: process.env.BACKEND_URL
      },
      frontend: {
        url: process.env.FRONTEND_URL
      },
      rAnalytics: {
        url: process.env.R_ANALYTICS_URL
      }
    };
  }

  /**
   * Get security configuration for IAF
   */
  public getIAFSecurityConfig() {
    return {
      jwt: {
        secret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      },
      encryption: {
        key: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
        saltRounds: parseInt(process.env.SALT_ROUNDS || '12')
      },
      cors: {
        origins: process.env.CORS_ORIGINS?.split(',') || []
      }
    };
  }

  /**
   * Get Redis configuration for IAF
   */
  public getIAFRedisConfig() {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '1234567890',
      db: parseInt(process.env.REDIS_DB || '10'),
      sessionDb: parseInt(process.env.REDIS_SESSION_DB || '11'),
      tokenBlacklistDb: parseInt(process.env.REDIS_TOKEN_BLACKLIST_DB || '12')
    };
  }

  /**
   * Get IAF tenant configuration
   */
  public getIAFTenantConfig() {
    return {
      tenantId: process.env.TENANT_ID || process.env.DEFAULT_TENANT || 'iaf',
      tenantName: process.env.TENANT_NAME || 'Indonesia Airawata Finance',
      tenantMode: process.env.TENANT_MODE || 'conventional',
      bankingType: process.env.BANKING_TYPE || 'conventional',
      companyName: process.env.COMPANY_NAME || 'Indonesia Airawata Finance',
      singleTenantMode: process.env.SINGLE_TENANT_MODE === 'true',
      tenantAutoDiscovery: process.env.TENANT_AUTO_DISCOVERY === 'true',
      databaseRegistryAutoDiscovery: process.env.DATABASE_REGISTRY_AUTO_DISCOVERY === 'true'
    };
  }

  /**
   * Log current configuration (with sensitive data masked)
   */
  private logConfiguration(): void {
    const dbConfig = this.getIAFDatabaseConfig();
    const serverConfig = this.getIAFServerConfig();
    const tenantConfig = this.getIAFTenantConfig();

    console.log('\n📋 IAF Configuration Summary:');
    console.log('================================');

    // Server Configuration
    console.log('\n🌐 Server Configuration:');
    console.log(`  Backend: ${serverConfig.backend.host}:${serverConfig.backend.port}`);
    console.log(`  Frontend URL: ${serverConfig.frontend.url}`);
    console.log(`  R Analytics URL: ${serverConfig.rAnalytics.url}`);

    // Database Configuration
    console.log('\n🗄️ Database Configuration:');
    console.log(`  Platform DB: ${dbConfig.platform.host}:${dbConfig.platform.port}/${dbConfig.platform.database}`);
    console.log(`  Shared DB: ${dbConfig.shared.host}:${dbConfig.shared.port}/${dbConfig.shared.database}`);
    console.log(`  Tenant DB: ${dbConfig.tenant.host}:${dbConfig.tenant.port}/${dbConfig.tenant.database}`);
    console.log(`  Legacy DB: ${dbConfig.legacy.host}:${dbConfig.legacy.port}/${dbConfig.legacy.database}`);

    // Tenant Configuration
    console.log('\n🏢 Tenant Configuration:');
    console.log(`  Tenant ID: ${tenantConfig.tenantId}`);
    console.log(`  Company: ${tenantConfig.companyName}`);
    console.log(`  Banking Type: ${tenantConfig.bankingType}`);
    console.log(`  Single Tenant Mode: ${tenantConfig.singleTenantMode}`);
    console.log(`  Tenant Auto Discovery: ${tenantConfig.tenantAutoDiscovery}`);
    console.log(`  Database Registry Auto Discovery: ${tenantConfig.databaseRegistryAutoDiscovery}`);

    // Environment
    console.log('\n🔧 Environment:');
    console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  DEBUG: ${process.env.APP_DEBUG || 'false'}`);

    console.log('================================\n');
  }

  /**
   * Check if running on ECS
   */
  public isECS(): boolean {
    // ECS sets specific environment variables
    return !!(
      process.env.ECS_CONTAINER_METADATA_URI ||
      process.env.ECS_CONTAINER_METADATA_URI_V4 ||
      process.env.AWS_EXECUTION_ENV?.includes('ECS')
    );
  }

  /**
   * Get environment type
   */
  public getEnvironmentType(): 'local' | 'ecs' | 'production' {
    if (this.isECS()) return 'ecs';
    if (process.env.NODE_ENV === 'production') return 'production';
    return 'local';
  }
}

// Export singleton instance
export const iafEnvLoader = IAFEnvironmentLoader.getInstance();

// Auto-load on import
iafEnvLoader.loadEnvironment();