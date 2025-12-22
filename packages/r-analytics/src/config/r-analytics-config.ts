// packages/r-analytics/src/config/r-analytics-config.ts
// 🎯 R ANALYTICS CONFIGURATION SERVICE
// Centralized configuration management for R Analytics application

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

  console.log(`🎯 R Analytics Configuration: ${configManager.getConfig().name}`);
  return configManager.getConfig();
};

// 🌐 Global configuration instance
export const appConfig = initializeConfig();

// 🎯 R Analytics Configuration Service
export class RAnalyticsConfigService {
  private static instance: RAnalyticsConfigService;
  private config = appConfig;

  private constructor() {}

  public static getInstance(): RAnalyticsConfigService {
    if (!RAnalyticsConfigService.instance) {
      RAnalyticsConfigService.instance = new RAnalyticsConfigService();
    }
    return RAnalyticsConfigService.instance;
  }

  // 🗄️ Database configuration (same as backend)
  public getDatabaseConfig() {
    return {
      host: this.config.database.host,
      port: this.config.database.port,
      platformDb: this.config.database.platformDb,
      sharedDb: this.config.database.sharedServices,
      tenantDb: this.config.database.tenantDb,
      legacyDb: this.config.database.legacyDb,
      user: this.config.database.user,
      ssl: this.config.database.ssl,
      // Database connection string builders
      getPlatformDbUrl: () => `postgresql://${this.config.database.user}:${process.env.DB_PASSWORD || 'P@ssw0rd2025!'}@${this.config.database.host}:${this.config.database.port}/${this.config.database.platformDb}`,
      getSharedDbUrl: () => `postgresql://${this.config.database.user}:${process.env.DB_PASSWORD || 'P@ssw0rd2025!'}@${this.config.database.host}:${this.config.database.port}/${this.config.database.sharedServices}`,
      getTenantDbUrl: (tenantId: string) => `postgresql://${this.config.database.user}:${process.env.DB_PASSWORD || 'P@ssw0rd2025!'}@${this.config.database.host}:${this.config.database.port}/${this.config.database.tenantDb}`,
      getLegacyDbUrl: () => `postgresql://${this.config.database.user}:${process.env.DB_PASSWORD || 'P@ssw0rd2025!'}@${this.config.database.host}:${this.config.database.port}/${this.config.database.legacyDb}`
    };
  }

  // 🚀 R Server configuration
  public getRServerConfig() {
    return {
      host: process.env.R_SERVER_HOST || '0.0.0.0',
      port: process.env.R_SERVER_PORT || this.config.rAnalytics.apiPort,
      dashboardPort: this.config.rAnalytics.dashboardPort,
      appName: 'IFRS9 R Analytics Service',
      version: '1.0.0',
      maxMemory: process.env.R_MAX_MEMORY_MB || '2048',
      timeout: parseInt(process.env.R_TIMEOUT_SECONDS || '300'),
      maxConnections: 100
    };
  }

  // 🌐 API configuration
  public getApiConfig() {
    return {
      baseUrl: this.config.rAnalytics.apiUrl,
      dashboardUrl: this.config.rAnalytics.dashboardUrl,
      apiPrefix: '/api',
      version: 'v1',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    };
  }

  // 🔒 Security configuration
  public getSecurityConfig() {
    return {
      enableHttps: this.config.security.enableHttps,
      apiKey: process.env.R_ANALYTICS_API_KEY || 'default-api-key',
      allowedOrigins: this.config.cors.origins,
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
      }
    };
  }

  // 🏢 Backend API configuration (for data exchange)
  public getBackendApiConfig() {
    return {
      baseUrl: this.config.backend.apiUrl,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      endpoints: {
        auth: '/auth',
        portfolio: '/portfolio',
        banking: '/banking',
        reports: '/reports'
      }
    };
  }

  // 📊 IFRS 9 calculation configuration
  public getIfrs9Config() {
    return {
      models: {
        pd: {
          enabled: true,
          modelPath: process.env.PD_MODEL_PATH || './models/pd',
          defaultModel: 'logistic_regression',
          confidenceLevel: 0.95
        },
        lgd: {
          enabled: true,
          modelPath: process.env.LGD_MODEL_PATH || './models/lgd',
          defaultModel: 'linear_regression',
          recoveryRateDefault: 0.40
        },
        ead: {
          enabled: true,
          modelPath: process.env.EAD_MODEL_PATH || './models/ead',
          defaultModel: 'exposure_calculation',
          ccfDefault: 0.75
        },
        ecl: {
          enabled: true,
          stagingThreshold: 0.05,
          lifetimeHorizon: 12, // months
          discountRate: 0.05
        }
      },
      parameters: {
        minDataPoints: 50,
        maxDataPoints: 100000,
        maxMissingRatio: 0.2,
        outlierThreshold: 3.0
      }
    };
  }

  // 🏦 Banking configuration
  public getBankingConfig() {
    return {
      ...this.config.iaf,
      supportedProductTypes: [
        'MORTGAGE',
        'PERSONAL_LOAN',
        'CREDIT_CARD',
        'CORPORATE_LOAN',
        'SME_LOAN',
        'MURABAHA',
        'MUSHARAKA',
        'MUDHARABA',
        'IJARAH',
        'SALAM',
        'ISTISNA'
      ],
      islamicContracts: [
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

  // 📈 Analytics configuration
  public getAnalyticsConfig() {
    return {
      cacheEnabled: true,
      cacheTimeout: 3600, // seconds
      parallelProcessing: true,
      maxWorkers: parseInt(process.env.R_MAX_WORKERS || '4'),
      memoryLimit: parseInt(process.env.R_MEMORY_LIMIT_MB || '2048'),
      logging: {
        level: process.env.R_LOG_LEVEL || 'info',
        file: process.env.R_LOG_FILE || '/var/log/r-analytics/app.log',
        maxSize: '100MB',
        maxFiles: 10
      }
    };
  }

  // 🚀 Feature flags
  public hasFeature(feature: keyof typeof appConfig.features): boolean {
    return this.config.features[feature];
  }

  public getAllFeatures() {
    return this.config.features;
  }

  // 📱 Environment information
  public getEnvironmentInfo() {
    return {
      name: this.config.name,
      mode: this.config.mode,
      deployment: this.config.deployment,
      isLocalDevelopment: this.config.mode === 'local',
      isEcsProduction: this.config.mode === 'ecs-production'
    };
  }

  // 🔄 Environment switching (for development/debugging)
  public switchEnvironment(mode: 'local' | 'ecs-production'): void {
    const configManager = ConfigManager.getInstance();
    configManager.setEnvironment(mode);
    this.config = configManager.getConfig();
    console.log(`🔄 R Analytics Environment switched to: ${this.config.name}`);
    console.log('⚠️ Consider restarting the R service to apply new configuration');
  }

  // 🔍 Configuration validation
  public validateConfiguration(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required configuration
    if (!this.config.database.host) {
      errors.push('Database host is required');
    }

    if (!this.config.rAnalytics.apiUrl) {
      errors.push('R Analytics API URL is required');
    }

    // R-specific validations
    if (process.env.R_MAX_MEMORY_MB && parseInt(process.env.R_MAX_MEMORY_MB) < 1024) {
      warnings.push('R memory limit should be at least 1024MB for production use');
    }

    if (process.env.R_MAX_WORKERS && parseInt(process.env.R_MAX_WORKERS) > 8) {
      warnings.push('Using more than 8 R workers may impact system performance');
    }

    // Model validations
    const ifrs9Config = this.getIfrs9Config();
    if (ifrs9Config.models.pd.enabled && !ifrs9Config.models.pd.modelPath) {
      errors.push('PD model path is required when PD models are enabled');
    }

    if (ifrs9Config.models.lgd.enabled && !ifrs9Config.models.lgd.modelPath) {
      errors.push('LGD model path is required when LGD models are enabled');
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
      rServer: this.getRServerConfig(),
      api: this.getApiConfig(),
      database: {
        host: this.config.database.host,
        port: this.config.database.port,
        databases: {
          platform: this.config.database.platformDb,
          shared: this.config.database.sharedServices,
          tenant: this.config.database.tenantDb,
          legacy: this.config.database.legacyDb
        },
        ssl: this.config.database.ssl
      },
      ifrs9: this.getIfrs9Config(),
      banking: this.getBankingConfig(),
      analytics: this.getAnalyticsConfig(),
      features: this.getAllFeatures(),
      validation: this.validateConfiguration()
    };
  }
}

// 🌍 Export singleton instance
export const rAnalyticsConfig = RAnalyticsConfigService.getInstance();

// 📄 Convenience exports
export const {
  getDatabaseConfig,
  getRServerConfig,
  getApiConfig,
  getSecurityConfig,
  getBackendApiConfig,
  getIfrs9Config,
  getBankingConfig,
  getAnalyticsConfig,
  hasFeature,
  getAllFeatures,
  getEnvironmentInfo,
  isDevelopmentMode,
  isProductionMode
} = rAnalyticsConfig;

// 🎯 Environment helpers
export const isLocalDevelopment = () => rAnalyticsConfig.getEnvironmentInfo().isLocalDevelopment;
export const isEcsProduction = () => rAnalyticsConfig.getEnvironmentInfo().isEcsProduction;
export const currentEnvironment = () => rAnalyticsConfig.getEnvironmentInfo().name;