// packages/backend/src/config/production.config.ts
// ============================================================================
// Production Configuration for IFRS9 Platform
// ============================================================================
// Generated: 2025-01-12
// Purpose: Complete production deployment configuration
// Methodology: Core Platform MVP - Production Configuration
// Dependencies: Environment validation, Security, Performance optimization
// ============================================================================

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Production Environment Configuration Interface
export interface ProductionConfig {
  // Application Configuration
  application: {
    name: string;
    version: string;
    environment: 'production';
    port: number;
    host: string;
    baseUrl: string;
    timezone: string;
    locale: string;
  };

  // Security Configuration
  security: {
    jwt: {
      secret: string;
      refreshSecret: string;
      expiresIn: string;
      refreshExpiresIn: string;
      algorithm: string;
    };
    encryption: {
      algorithm: string;
      key: string;
      iv: string;
    };
    cors: {
      origins: string[];
      credentials: boolean;
      methods: string[];
    };
    rateLimit: {
      windowMs: number;
      maxRequests: number;
      skipSuccessfulRequests: boolean;
    };
    helmet: {
      contentSecurityPolicy: boolean;
      hsts: {
        maxAge: number;
        includeSubDomains: boolean;
        preload: boolean;
      };
    };
  };

  // Database Configuration
  database: {
    platform: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
      ssl: boolean;
      pool: {
        max: number;
        min: number;
        acquire: number;
        idle: number;
      };
    };
    frs9Legacy: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
      ssl: boolean;
    };
    tenants: {
      hostPattern: string;
      portPattern: number;
      usernamePattern: string;
      passwordPattern: string;
      ssl: boolean;
    };
  };

  // Redis Configuration
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
    keyPrefix: string;
    ttl: number;
    retryDelayOnFailover: number;
    enableReadyCheck: boolean;
    maxRetriesPerRequest: number;
  };

  // R Analytics Configuration
  rAnalytics: {
    enabled: boolean;
    baseUrl: string;
    timeout: number;
    maxMemoryMb: number;
    maxExecutionTimeSeconds: number;
    healthCheckInterval: number;
    retryAttempts: number;
    retryDelay: number;
  };

  // Logging Configuration
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'simple';
    maxFiles: number;
    maxSize: string;
    datePattern: string;
    zippedArchive: boolean;
    filename: string;
    errorFilename: string;
  };

  // Performance Configuration
  performance: {
    clustering: {
      enabled: boolean;
      workers: number;
    };
    compression: {
      enabled: boolean;
      threshold: number;
      level: number;
    };
    cache: {
      enabled: boolean;
      ttl: number;
      maxKeys: number;
    };
    requestTimeout: number;
    maxRequestSize: string;
  };

  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: boolean;
      path: string;
      interval: number;
    };
    metrics: {
      enabled: boolean;
      path: string;
      collectDefaultMetrics: boolean;
    };
    alerts: {
      enabled: boolean;
      channels: string[];
      thresholds: {
        errorRate: number;
        responseTime: number;
        memoryUsage: number;
        cpuUsage: number;
      };
    };
  };

  // Backup Configuration
  backup: {
    enabled: boolean;
    schedule: string; // Cron expression
    retention: {
      days: number;
      weeks: number;
      months: number;
    };
    storage: {
      type: 'local' | 's3' | 'azure' | 'gcp';
      location: string;
      encryption: boolean;
    };
    notification: {
      enabled: boolean;
      onSuccess: boolean;
      onFailure: boolean;
      channels: string[];
    };
  };

  // Feature Flags
  features: {
    advancedAnalytics: boolean;
    islamicBanking: boolean;
    auditTrail: boolean;
    workflowEngine: boolean;
    realtimeNotifications: boolean;
    multiLanguage: boolean;
    apiVersioning: boolean;
    dataExport: boolean;
    bulkOperations: boolean;
    advancedReporting: boolean;
  };
}

// Load production configuration from environment and files
export function loadProductionConfig(): ProductionConfig {
  // Validate required environment variables
  validateRequiredEnvironmentVariables();

  // Load SSL certificates if enabled
  const sslConfig = loadSSLConfiguration();

  // Build production configuration
  const config: ProductionConfig = {
    application: {
      name: process.env.APP_NAME || 'IFRS9 Multi-Tenant Platform',
      version: process.env.APP_VERSION || '1.0.0',
      environment: 'production',
      port: parseInt(process.env.PORT || process.env.BACKEND_PORT || '4232'),
      host: process.env.HOST || '0.0.0.0',
      baseUrl: process.env.BASE_URL || 'https://bifrs9.ifrspro.id',
      timezone: process.env.TZ || 'UTC',
      locale: process.env.LOCALE || 'en-US'
    },

    security: {
      jwt: {
        secret: getRequiredEnvVar('JWT_SECRET'),
        refreshSecret: getRequiredEnvVar('JWT_REFRESH_SECRET'),
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        algorithm: process.env.JWT_ALGORITHM || 'HS256'
      },
      encryption: {
        algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
        key: getRequiredEnvVar('ENCRYPTION_KEY'),
        iv: process.env.ENCRYPTION_IV || generateIV()
      },
      cors: {
        origins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
        credentials: process.env.CORS_CREDENTIALS === 'true',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      },
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
        skipSuccessfulRequests: false
      },
      helmet: {
        contentSecurityPolicy: true,
        hsts: {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true
        }
      }
    },

    database: {
      platform: {
        host: getRequiredEnvVar('PLATFORM_DB_HOST'),
        port: parseInt(getRequiredEnvVar('PLATFORM_DB_PORT')),
        database: getRequiredEnvVar('PLATFORM_DB_NAME'),
        username: getRequiredEnvVar('PLATFORM_DB_USER'),
        password: getRequiredEnvVar('PLATFORM_DB_PASSWORD'),
        ssl: process.env.PLATFORM_DB_SSL === 'true',
        pool: {
          max: parseInt(process.env.DB_POOL_MAX || '20'),
          min: parseInt(process.env.DB_POOL_MIN || '5'),
          acquire: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '30000'),
          idle: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '10000')
        }
      },
      frs9Legacy: {
        host: getRequiredEnvVar('FRS9_DB_HOST'),
        port: parseInt(getRequiredEnvVar('FRS9_DB_PORT')),
        database: getRequiredEnvVar('FRS9_DB_NAME'),
        username: getRequiredEnvVar('FRS9_DB_USER'),
        password: getRequiredEnvVar('FRS9_DB_PASSWORD'),
        ssl: process.env.FRS9_DB_SSL === 'true'
      },
      tenants: {
        hostPattern: process.env.TENANT_DB_HOST_PATTERN || 'localhost',
        portPattern: parseInt(process.env.TENANT_DB_PORT_PATTERN || '5432'),
        usernamePattern: process.env.TENANT_DB_USER_PATTERN || 'postgres',
        passwordPattern: process.env.TENANT_DB_PASSWORD_PATTERN || 'postgres',
        ssl: process.env.TENANT_DB_SSL === 'true'
      }
    },

    redis: {
      host: getRequiredEnvVar('REDIS_HOST'),
      port: parseInt(getRequiredEnvVar('REDIS_PORT')),
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'ifrspro:',
      ttl: parseInt(process.env.REDIS_TTL || '3600'),
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
      enableReadyCheck: true,
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3')
    },

    rAnalytics: {
      enabled: process.env.R_ANALYTICS_ENABLED !== 'false',
      baseUrl: process.env.R_ANALYTICS_URL || 'http://localhost:4236',
      timeout: parseInt(process.env.R_ANALYTICS_TIMEOUT || '300000'), // 5 minutes
      maxMemoryMb: parseInt(process.env.R_ANALYTICS_MAX_MEMORY_MB || '2048'),
      maxExecutionTimeSeconds: parseInt(process.env.R_ANALYTICS_MAX_EXECUTION_TIME || '300'),
      healthCheckInterval: parseInt(process.env.R_ANALYTICS_HEALTH_CHECK_INTERVAL || '60000'),
      retryAttempts: parseInt(process.env.R_ANALYTICS_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.R_ANALYTICS_RETRY_DELAY || '5000')
    },

    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      format: (process.env.LOG_FORMAT as any) || 'json',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '10'),
      maxSize: process.env.LOG_MAX_SIZE || '100MB',
      datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
      zippedArchive: process.env.LOG_ZIPPED_ARCHIVE === 'true',
      filename: process.env.LOG_FILENAME || '/var/log/ifrspro/app-%DATE%.log',
      errorFilename: process.env.LOG_ERROR_FILENAME || '/var/log/ifrspro/error-%DATE%.log'
    },

    performance: {
      clustering: {
        enabled: process.env.CLUSTERING_ENABLED === 'true',
        workers: parseInt(process.env.CLUSTERING_WORKERS || '0') || require('os').cpus().length
      },
      compression: {
        enabled: process.env.COMPRESSION_ENABLED !== 'false',
        threshold: parseInt(process.env.COMPRESSION_THRESHOLD || '1024'),
        level: parseInt(process.env.COMPRESSION_LEVEL || '6')
      },
      cache: {
        enabled: process.env.CACHE_ENABLED !== 'false',
        ttl: parseInt(process.env.CACHE_TTL || '3600'),
        maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '10000')
      },
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
      maxRequestSize: process.env.MAX_REQUEST_SIZE || '50mb'
    },

    monitoring: {
      healthCheck: {
        enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
        path: process.env.HEALTH_CHECK_PATH || '/health',
        interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000')
      },
      metrics: {
        enabled: process.env.METRICS_ENABLED !== 'false',
        path: process.env.METRICS_PATH || '/metrics',
        collectDefaultMetrics: process.env.METRICS_COLLECT_DEFAULT !== 'false'
      },
      alerts: {
        enabled: process.env.ALERTS_ENABLED === 'true',
        channels: (process.env.ALERT_CHANNELS || '').split(',').filter(Boolean),
        thresholds: {
          errorRate: parseFloat(process.env.ALERT_THRESHOLD_ERROR_RATE || '0.05'),
          responseTime: parseInt(process.env.ALERT_THRESHOLD_RESPONSE_TIME || '5000'),
          memoryUsage: parseFloat(process.env.ALERT_THRESHOLD_MEMORY_USAGE || '0.85'),
          cpuUsage: parseFloat(process.env.ALERT_THRESHOLD_CPU_USAGE || '0.85')
        }
      }
    },

    backup: {
      enabled: process.env.BACKUP_ENABLED === 'true',
      schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      retention: {
        days: parseInt(process.env.BACKUP_RETENTION_DAYS || '7'),
        weeks: parseInt(process.env.BACKUP_RETENTION_WEEKS || '4'),
        months: parseInt(process.env.BACKUP_RETENTION_MONTHS || '12')
      },
      storage: {
        type: (process.env.BACKUP_STORAGE_TYPE as any) || 'local',
        location: process.env.BACKUP_STORAGE_LOCATION || '/var/backups/ifrspro',
        encryption: process.env.BACKUP_ENCRYPTION === 'true'
      },
      notification: {
        enabled: process.env.BACKUP_NOTIFICATION_ENABLED === 'true',
        onSuccess: process.env.BACKUP_NOTIFY_SUCCESS === 'true',
        onFailure: process.env.BACKUP_NOTIFY_FAILURE !== 'false',
        channels: (process.env.BACKUP_NOTIFICATION_CHANNELS || '').split(',').filter(Boolean)
      }
    },

    features: {
      advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS !== 'false',
      islamicBanking: process.env.FEATURE_ISLAMIC_BANKING !== 'false',
      auditTrail: process.env.FEATURE_AUDIT_TRAIL !== 'false',
      workflowEngine: process.env.FEATURE_WORKFLOW_ENGINE !== 'false',
      realtimeNotifications: process.env.FEATURE_REALTIME_NOTIFICATIONS === 'true',
      multiLanguage: process.env.FEATURE_MULTI_LANGUAGE === 'true',
      apiVersioning: process.env.FEATURE_API_VERSIONING !== 'false',
      dataExport: process.env.FEATURE_DATA_EXPORT !== 'false',
      bulkOperations: process.env.FEATURE_BULK_OPERATIONS !== 'false',
      advancedReporting: process.env.FEATURE_ADVANCED_REPORTING !== 'false'
    }
  };

  return config;
}

// Helper functions
function validateRequiredEnvironmentVariables() {
  const required = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'ENCRYPTION_KEY',
    'PLATFORM_DB_HOST',
    'PLATFORM_DB_PORT',
    'PLATFORM_DB_NAME',
    'PLATFORM_DB_USER',
    'PLATFORM_DB_PASSWORD',
    'FRS9_DB_HOST',
    'FRS9_DB_PORT',
    'FRS9_DB_NAME',
    'FRS9_DB_USER',
    'FRS9_DB_PASSWORD',
    'REDIS_HOST',
    'REDIS_PORT'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

function generateIV(): string {
  // Generate a random IV for encryption
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('hex');
}

function loadSSLConfiguration() {
  const sslEnabled = process.env.SSL_ENABLED === 'true';
  
  if (!sslEnabled) {
    return null;
  }

  const keyPath = process.env.SSL_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;
  const caPath = process.env.SSL_CA_PATH;

  if (!keyPath || !certPath) {
    throw new Error('SSL_KEY_PATH and SSL_CERT_PATH are required when SSL is enabled');
  }

  if (!existsSync(keyPath)) {
    throw new Error(`SSL key file not found: ${keyPath}`);
  }

  if (!existsSync(certPath)) {
    throw new Error(`SSL certificate file not found: ${certPath}`);
  }

  return {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath),
    ca: caPath && existsSync(caPath) ? readFileSync(caPath) : undefined
  };
}

// Export configuration validation
export function validateProductionConfig(config: ProductionConfig): void {
  // Validate JWT secrets are strong enough
  if (config.security.jwt.secret.length < 32) {
    throw new Error('JWT secret must be at least 32 characters long');
  }

  if (config.security.encryption.key.length < 32) {
    throw new Error('Encryption key must be at least 32 characters long');
  }

  // Validate database connections
  if (!config.database.platform.host || !config.database.platform.database) {
    throw new Error('Platform database configuration is incomplete');
  }

  // Validate Redis configuration
  if (!config.redis.host) {
    throw new Error('Redis host is required');
  }

  // Validate logging configuration
  if (!['error', 'warn', 'info', 'debug'].includes(config.logging.level)) {
    throw new Error('Invalid logging level');
  }

  console.log('✅ Production configuration validation passed');
}

export default loadProductionConfig;