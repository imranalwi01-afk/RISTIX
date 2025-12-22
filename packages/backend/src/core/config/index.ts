// packages/backend/src/core/config/index.ts
import { developmentConfig } from './environments/development.config';
import { productionConfig } from './environments/production.config';

export interface AppConfig {
  environment: string;
  app: {
    name: string;
    version: string;
    debug: boolean;
    hotReload: boolean;
    sourceMaps: boolean;
    mockExternalServices: boolean;
  };
  server: {
    backend: {
      host: string;
      port: number;
      cors: {
        origin: string | string[];
        credentials: boolean;
      };
    };
    frontend: {
      host: string;
      port: number;
    };
    rAnalytics: {
      host: string;
      port: number;
    };
  };
  database: {
    tenant: {
      host: string;
      port: number;
      userPrefix: string;
      namePrefix: string;
      ssl: boolean;
      pool: {
        max: number;
        min: number;
        idle: number;
      };
    };
    platform: {
      host: string;
      port: number;
      name: string;
      user: string;
      password?: string;
      ssl: boolean;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    tokenBlacklistDb: number;
    sessionDb: number;
    keyPrefix: string;
  };
  security: {
    jwt: {
      secret?: string;
      expiresIn: string;
      refreshSecret?: string;
      refreshExpiresIn: string;
    };
    encryption: {
      key?: string;
      algorithm: string;
    };
    bcrypt: {
      saltRounds: number;
    };
    rateLimit: {
      windowMs: number;
      max: number;
      message: string;
    };
  };
  features: Record<string, boolean>;
  logging: {
    level: string;
    file: string;
    maxSize: string;
    maxFiles: number;
    console: boolean;
    colorize: boolean;
  };
  upload: {
    maxSize: string;
    allowedTypes: string[];
    path: string;
    tempPath: string;
  };
  rAnalytics: {
    enabled: boolean;
    executable: string;
    scriptsPath: string;
    modelsPath: string;
    maxMemoryMB: number;
    timeoutSeconds: number;
    concurrent: number;
  };
  monitoring: {
    healthCheck: {
      enabled: boolean;
      endpoint: string;
      interval: number;
    };
    metrics: {
      enabled: boolean;
      endpoint: string;
    };
  };
  external: {
    mockMode: boolean;
    legacyFrs9Pro: {
      enabled: boolean;
      baseUrl?: string;
    };
  };
}

/**
 * Get configuration based on environment
 */
export function getConfig(): AppConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return productionConfig;
    case 'staging':
      // For now, use production config for staging with some modifications
      return {
        ...productionConfig,
        environment: 'staging',
        app: {
          ...productionConfig.app,
          debug: true
        },
        logging: {
          ...productionConfig.logging,
          level: 'debug',
          console: true
        }
      };
    case 'test':
      return {
        ...developmentConfig,
        environment: 'test',
        database: {
          ...developmentConfig.database,
          platform: {
            ...developmentConfig.database.platform,
            name: 'ifrspro_platform_admin_test'
          }
        },
        redis: {
          ...developmentConfig.redis,
          db: 15,
          keyPrefix: 'ifrs9:test:'
        }
      };
    default:
      return developmentConfig;
  }
}

export const config = getConfig();

// Export specific configs for direct access
export { developmentConfig, productionConfig };

// Environment-specific exports
export const isDevelopment = config.environment === 'development';
export const isProduction = config.environment === 'production';
export const isStaging = config.environment === 'staging';
export const isTest = config.environment === 'test';
