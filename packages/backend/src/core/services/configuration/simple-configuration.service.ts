// packages/backend/src/core/services/configuration/simple-configuration.service.ts
// ============================================================================
// 🔧 SIMPLE CONFIGURATION SERVICE - IFRS9 STANDARDIZATION
// ============================================================================
// ✅ PURPOSE: Lightweight configuration service without dependency injection
// ✅ PATTERN: Singleton pattern with environment loading
// ✅ COMPLIANCE: IFRS9 standardization requirements
// ============================================================================

import { backendEnvironmentLoader, type BackendConfiguration, type DatabaseConfig } from '../../../config/environment-loader-backend';

export interface ServiceConfiguration {
  application: {
    name: string;
    environment: string;
    port: number;
    debug: boolean;
  };
  servers: BackendConfiguration['servers'];
  database: BackendConfiguration['database'];
  rAnalytics: BackendConfiguration['rAnalytics'];
  features: {
    multiTenant: boolean;
    dualBanking: boolean;
    ifrs9Calculations: boolean;
    auditTrail: boolean;
  };
  authentication: {
    jwt: {
      secret: string;
      issuer: string;
      audience: string;
      algorithm: string;
    };
  };
  urls: BackendConfiguration['urls'];
}

export class SimpleConfigurationService {
  private static instance: SimpleConfigurationService;
  private configuration!: ServiceConfiguration; // Definite assignment assertion

  constructor() {
    this.loadConfiguration();
  }

  public static getInstance(): SimpleConfigurationService {
    if (!SimpleConfigurationService.instance) {
      SimpleConfigurationService.instance = new SimpleConfigurationService();
    }
    return SimpleConfigurationService.instance;
  }

  private loadConfiguration(): void {
    const env = backendEnvironmentLoader.getConfiguration();

    this.configuration = {
      application: {
        name: process.env.APP_NAME || 'IFRS9 Multi-Tenant Platform',
        environment: env.deployment.environment,
        port: env.servers.backend.port,
        debug: env.deployment.nodeEnv === 'development'
      },

      servers: env.servers,

      database: env.database,

      rAnalytics: env.rAnalytics,

      features: {
        multiTenant: process.env.FEATURE_MULTI_TENANT !== 'false',
        dualBanking: process.env.FEATURE_DUAL_BANKING === 'true',
        ifrs9Calculations: process.env.FEATURE_IFRS9_CALCULATIONS !== 'false',
        auditTrail: process.env.FEATURE_AUDIT_TRAIL !== 'false'
      },

      authentication: {
        jwt: {
          secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
          issuer: 'ifrs9-platform-development',
          audience: 'ifrs9-platform-users',
          algorithm: 'HS256'
        }
      },

      urls: env.urls
    };

    console.log('✅ SimpleConfigurationService loaded successfully');
    console.log('🔧 Configuration summary:', {
      environment: this.configuration.application.environment,
      features: this.configuration.features,
      databases: Object.keys(this.configuration.database)
    });
  }

  public getConfiguration(): ServiceConfiguration {
    return this.configuration;
  }

  public getDatabaseConfig(dbType: 'platform' | 'shared' | 'tenant' | 'frs9'): DatabaseConfig {
    return this.configuration.database[dbType];
  }

  public getTenantDatabaseConfig(tenantSlug: string): DatabaseConfig {
    const baseConfig = this.configuration.database.tenant;
    return {
      ...baseConfig,
      database: `ifrspro_tenant_${tenantSlug}`
    };
  }

  public isFeatureEnabled(feature: keyof ServiceConfiguration['features']): boolean {
    return this.configuration.features[feature];
  }

  public getJwtConfig(): ServiceConfiguration['authentication']['jwt'] {
    return this.configuration.authentication.jwt;
  }

  public getUrls(): ServiceConfiguration['urls'] {
    return this.configuration.urls;
  }

  public reloadConfiguration(): void {
    this.loadConfiguration();
  }

  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.configuration.authentication.jwt.secret ||
        this.configuration.authentication.jwt.secret === 'default-secret-change-in-production') {
      errors.push('JWT_SECRET must be set to a secure value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const simpleConfiguration = SimpleConfigurationService.getInstance();
export default simpleConfiguration;