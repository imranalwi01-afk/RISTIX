// packages/backend/src/config/backend-config.ts
// 🎯 BACKEND CONFIGURATION SERVICE
// Centralized configuration management for backend application

import { config, ConfigManager } from '../../../../config/centralized-config';
import { LOCAL_ENV_CONFIG } from '../../../../config/environment.local';
import { ECS_PRODUCTION_CONFIG } from '../../../../config/environment.ecs-production';

// 🔄 Initialize configuration based on environment
const initializeConfig = () => {
  const deploymentMode = process.env.DEPLOYMENT_MODE || process.env.NODE_ENV === 'production' ? 'ecs-production' : 'local';

  const configManager = ConfigManager.getInstance();

  if (deploymentMode === 'ecs-production') {
    configManager.setEnvironment('ecs-production');
  } else {
    configManager.setEnvironment('local');
  }

  console.log(`🎯 Backend Configuration: ${configManager.getConfig().name}`);
  return configManager.getConfig();
};

// 🌐 Global configuration instance
export const appConfig = initializeConfig();

// 🎯 Backend Configuration Service
export class BackendConfigService {
  private static instance: BackendConfigService;
  private config = appConfig;

  private constructor() {}

  public static getInstance(): BackendConfigService {
    if (!BackendConfigService.instance) {
      BackendConfigService.instance = new BackendConfigService();
    }
    return BackendConfigService.instance;
  }

  // 🗄️ Database configuration
  public getDatabaseConfig() {
    return {
      host: this.config.database.host,
      port: this.config.database.port,
      platformDb: this.config.database.platformDb,
      sharedDb: this.config.database.sharedDb,
      tenantDb: this.config.database.tenantDb,
      legacyDb: this.config.database.legacyDb,
      user: this.config.database.user,
      ssl: this.config.database.ssl,
      // Database connection string builders
      getPlatformDbUrl: () => `postgresql://${this.config.database.user}:${process.env.DB_PASSWORD || 'P@ssw0rd2025!'}@${this.config.database.host}:${this.config.database.port}/${this.config.database.platformDb}`,
      getSharedDbUrl: () => `postgresql://${this.config.database.user}:${process.env.DB_PASSWORD || 'P@ssw0rd2025!'}@${this.config.database.host}:${this.config.database.port}/${this.config.database.sharedDb}`,
      getTenantDbUrl: (tenantId: string) => `postgresql://${this.config.database.user}:${process.env.DB_PASSWORD || 'P@ssw0rd2025!'}@${this.config.database.host}:${this.config.database.port}/${this.config.database.tenantDb}`,
      getLegacyDbUrl: () => `postgresql://${this.config.database.user}:${process.env.DB_PASSWORD || 'P@ssw0rd2025!'}@${this.config.database.host}:${this.config.database.port}/${this.config.database.legacyDb}`
    };
  }

  // 🔒 Security configuration
  public getSecurityConfig() {
    return {
      enableHttps: this.config.security.enableHttps,
      secureCookies: this.config.security.secureCookies,
      jwtSecret: this.config.security.jwtSecret,
      jwtRefreshSecret: this.config.security.jwtRefreshSecret,
      jwtExpiresIn: '8h',
      jwtRefreshExpiresIn: '7d',
      encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars',
      saltRounds: 12
    };
  }

  // 🌐 CORS configuration
  public getCorsConfig() {
    return {
      origin: this.config.cors.origins,
      methods: this.config.cors.methods,
      allowedHeaders: this.config.cors.headers,
      credentials: true
    };
  }

  // 🚀 Server configuration
  public getServerConfig() {
    return {
      host: process.env.BACKEND_HOST || '0.0.0.0',
      port: process.env.BACKEND_PORT || this.config.backend.port,
      nodeEnv: process.env.NODE_ENV || 'development',
      appName: 'IFRS9 Backend Service',
      version: '1.0.0'
    };
  }

  // 📊 R Analytics configuration
  public getRAnalyticsConfig() {
    return {
      dashboardUrl: this.config.rAnalytics.dashboardUrl,
      apiUrl: this.config.rAnalytics.apiUrl,
      apiHost: this.config.rAnalytics.apiHost,
      apiPort: this.config.rAnalytics.apiPort,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    };
  }

  // 🎨 Frontend URLs for redirects and callbacks
  public getFrontendUrls() {
    return {
      baseUrl: this.config.frontend.url,
      loginUrl: `${this.config.frontend.url}/login`,
      dashboardUrl: `${this.config.frontend.url}/dashboard`,
      bankingDashboardUrl: `${this.config.frontend.url}/banking/dashboard`,
      resetPasswordUrl: `${this.config.frontend.url}/reset-password`,
      emailVerificationUrl: `${this.config.frontend.url}/verify-email`
    };
  }

  // 🚀 Feature flags
  public hasFeature(feature: keyof typeof appConfig.features): boolean {
    return this.config.features[feature];
  }

  public getAllFeatures() {
    return this.config.features;
  }

  // 🏢 IAF specific configuration
  public getIafConfig() {
    return {
      ...this.config.iaf,
      defaultTenantId: this.config.iaf.tenantId,
      defaultBankingType: this.config.iaf.bankingType,
      supportedContractTypes: [
        'Murabaha',
        'Musharaka',
        'Mudharaba',
        'Ijarah',
        'Salam',
        'Istisna',
        'Sukuk'
      ]
    };
  }

  // 📱 Environment information
  public getEnvironmentInfo() {
    return {
      name: this.config.name,
      mode: this.config.mode,
      deployment: this.config.deployment,
      isLocalDevelopment: this.config.mode === 'local',
      isEcsProduction: this.config.mode === 'ecs-production',
      isProduction: this.config.mode === 'ecs-production'
    };
  }

  // 🔄 Environment switching (for development/debugging)
  public switchEnvironment(mode: 'local' | 'ecs-production'): void {
    const configManager = ConfigManager.getInstance();
    configManager.setEnvironment(mode);
    this.config = configManager.getConfig();
    console.log(`🔄 Environment switched to: ${this.config.name}`);
    console.log('⚠️ Consider restarting the server to apply new configuration');
  }

  // 🔍 Configuration validation
  public validateConfiguration(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required configuration
    if (!this.config.database.host) {
      errors.push('Database host is required');
    }

    if (!this.config.security.jwtSecret) {
      errors.push('JWT secret is required');
    }

    if (!this.config.cors.origins.length) {
      errors.push('At least one CORS origin is required');
    }

    // Security warnings
    if (this.config.security.jwtSecret === 'default-jwt-secret') {
      warnings.push('Using default JWT secret - please set a secure one in production');
    }

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.length < 12) {
      warnings.push('Database password should be at least 12 characters long');
    }

    if (!this.config.database.ssl && this.config.mode === 'ecs-production') {
      warnings.push('Database SSL should be enabled in production');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 🛠️ Utility methods
  public isDevelopmentMode(): boolean {
    return this.config.mode === 'local' || process.env.NODE_ENV === 'development';
  }

  public isProductionMode(): boolean {
    return this.config.mode === 'ecs-production' || process.env.NODE_ENV === 'production';
  }

  // 📊 Debug information
  public getDebugInfo() {
    return {
      environment: this.getEnvironmentInfo(),
      server: this.getServerConfig(),
      database: {
        host: this.config.database.host,
        port: this.config.database.port,
        databases: {
          platform: this.config.database.platformDb,
          shared: this.config.database.sharedDb,
          tenant: this.config.database.tenantDb,
          legacy: this.config.database.legacyDb
        },
        ssl: this.config.database.ssl
      },
      cors: this.getCorsConfig(),
      features: this.getAllFeatures(),
      iaf: this.getIafConfig(),
      validation: this.validateConfiguration()
    };
  }
}

// 🌍 Export singleton instance
export const backendConfig = BackendConfigService.getInstance();

// 📄 Convenience exports
export const {
  getDatabaseConfig,
  getSecurityConfig,
  getCorsConfig,
  getServerConfig,
  getRAnalyticsConfig,
  getFrontendUrls,
  hasFeature,
  getAllFeatures,
  getIafConfig,
  getEnvironmentInfo,
  isDevelopmentMode,
  isProductionMode
} = backendConfig;

// 🎯 Environment helpers
export const isLocalDevelopment = () => backendConfig.getEnvironmentInfo().isLocalDevelopment;
export const isEcsProduction = () => backendConfig.getEnvironmentInfo().isEcsProduction;
export const currentEnvironment = () => backendConfig.getEnvironmentInfo().name;