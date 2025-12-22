// packages/backend/src/core/services/configuration/configuration-factory.service.ts
// ============================================================================
// 🔧 CONFIGURATION FACTORY SERVICE - IFRS9 STANDARDIZATION
// ============================================================================
// ✅ PURPOSE: Centralized configuration management with dependency injection
// ✅ PATTERN: Factory pattern with environment auto-detection
// ✅ COMPLIANCE: IFRS9 standardization requirements
// ============================================================================

import { injectable, inject } from 'inversify';
import environmentLoader from '../../../config/environment-loader-backend';
import { backendEnvironmentLoader } from '../../../config/environment-loader-backend';

export interface ConfigurationSchema {
  application: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
    port: number;
  };
  server: {
    host: string;
    port: number;
    cors: {
      origins: string[];
      credentials: boolean;
    };
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
  };
  database: {
    platform: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
      ssl: boolean;
      pool: {
        min: number;
        max: number;
        acquire: number;
        idle: number;
      };
    };
    shared: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
      ssl: boolean;
      pool: {
        min: number;
        max: number;
        acquire: number;
        idle: number;
      };
    };
    tenant: {
      host: string;
      port: number;
      databasePrefix: string;
      username: string;
      password: string;
      ssl: boolean;
      pool: {
        min: number;
        max: number;
        acquire: number;
        idle: number;
      };
    };
    legacy: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
      ssl: boolean;
    };
  };
  authentication: {
    jwt: {
      secret: string;
      refreshSecret: string;
      expiresIn: string;
      refreshExpiresIn: string;
      issuer: string;
      audience: string;
      algorithm: string;
    };
    bcrypt: {
      saltRounds: number;
    };
    session: {
      secret: string;
      resave: boolean;
      saveUninitialized: boolean;
      cookie: {
        secure: boolean;
        httpOnly: boolean;
        maxAge: number;
      };
    };
  };
  features: {
    multiTenant: boolean;
    dualBanking: boolean;
    syariahCompliance: boolean;
    ifrs9Calculations: boolean;
    auditTrail: boolean;
    advancedAnalytics: boolean;
    workflowManagement: boolean;
  };
  ifrs9: {
    staging: {
      twelveMonthThreshold: number;
      lifetimeEclTrigger: number;
      significantIncreaseTrigger: number;
    };
    calculations: {
      defaultDiscountRate: number;
      defaultRecoveryRate: number;
      probabilityOfDefaultModel: string;
      lossGivenDefaultModel: string;
      exposureAtDefaultModel: string;
    };
    reporting: {
      regulatoryFramework: string;
      reportingCurrency: string;
      reportingFrequency: string;
    };
  };
  banking: {
    conventional: {
      enabled: boolean;
      interestCalculationMethod: string;
      provisionMethod: string;
    };
    syariah: {
      enabled: boolean;
      profitRateMethod: string;
      complianceFramework: string;
      boardApprovalRequired: boolean;
    };
  };
  integration: {
    rAnalytics: {
      url: string;
      port: number;
      timeout: number;
      retryAttempts: number;
    };
    externalApis: {
      centralBank: {
        url: string;
        apiKey: string;
        timeout: number;
      };
      creditBureau: {
        url: string;
        apiKey: string;
        timeout: number;
      };
    };
  };
  security: {
    encryption: {
      algorithm: string;
      keyLength: number;
      ivLength: number;
    };
    passwords: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number;
    };
    apiKeys: {
      length: number;
      prefix: string;
      expirationDays: number;
    };
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    includeRequestBody: boolean;
    includeResponseBody: boolean;
    maskSensitiveData: boolean;
  };
}

@injectable()
export class ConfigurationFactoryService {
  private configuration: ConfigurationSchema;
  private static instance: ConfigurationFactoryService;

  constructor() {
    this.configuration = this.loadConfiguration();
  }

  /**
   * Singleton pattern implementation
   */
  public static getInstance(): ConfigurationFactoryService {
    if (!ConfigurationFactoryService.instance) {
      ConfigurationFactoryService.instance = new ConfigurationFactoryService();
    }
    return ConfigurationFactoryService.instance;
  }

  /**
   * Load configuration from environment with validation
   */
  private loadConfiguration(): ConfigurationSchema {
    const env = environmentLoader.getConfiguration();

    return {
      application: {
        name: process.env.APP_NAME || 'IFRS9 Multi-Tenant Platform',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV as 'development' | 'staging' | 'production',
        debug: process.env.DEBUG === 'true',
        port: parseInt(process.env.PORT || '4232')
      },

      server: {
        host: process.env.HOST || '0.0.0.0',
        port: parseInt(process.env.PORT || '4232'),
        cors: {
          origins: this.parseCorsOrigins(process.env.CORS_ORIGINS || 'http://localhost:4231'),
          credentials: process.env.CORS_CREDENTIALS === 'true'
        },
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
        }
      },

      database: {
        platform: {
          host: process.env.PLATFORM_DB_HOST || 'localhost',
          port: parseInt(process.env.PLATFORM_DB_PORT || '5432'),
          database: process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin',
          username: process.env.PLATFORM_DB_USER || 'postgres',
          password: process.env.PLATFORM_DB_PASSWORD || 'postgres',
          ssl: process.env.PLATFORM_DB_SSL === 'true',
          pool: {
            min: parseInt(process.env.PLATFORM_DB_POOL_MIN || '5'),
            max: parseInt(process.env.PLATFORM_DB_POOL_MAX || '20'),
            acquire: parseInt(process.env.PLATFORM_DB_POOL_ACQUIRE || '30000'),
            idle: parseInt(process.env.PLATFORM_DB_POOL_IDLE || '10000')
          }
        },
        shared: {
          host: process.env.SHARED_DB_HOST || 'localhost',
          port: parseInt(process.env.SHARED_DB_PORT || '5432'),
          database: process.env.SHARED_DB_NAME || 'ifrspro_shared_services',
          username: process.env.SHARED_DB_USER || 'postgres',
          password: process.env.SHARED_DB_PASSWORD || 'postgres',
          ssl: process.env.SHARED_DB_SSL === 'true',
          pool: {
            min: parseInt(process.env.SHARED_DB_POOL_MIN || '5'),
            max: parseInt(process.env.SHARED_DB_POOL_MAX || '15'),
            acquire: parseInt(process.env.SHARED_DB_POOL_ACQUIRE || '30000'),
            idle: parseInt(process.env.SHARED_DB_POOL_IDLE || '10000')
          }
        },
        tenant: {
          host: process.env.TENANT_DB_HOST || 'localhost',
          port: parseInt(process.env.TENANT_DB_PORT || '5432'),
          databasePrefix: process.env.TENANT_DB_PREFIX || 'ifrspro_tenant_',
          username: process.env.TENANT_DB_USER || 'postgres',
          password: process.env.TENANT_DB_PASSWORD || 'postgres',
          ssl: process.env.TENANT_DB_SSL === 'true',
          pool: {
            min: parseInt(process.env.TENANT_DB_POOL_MIN || '3'),
            max: parseInt(process.env.TENANT_DB_POOL_MAX || '10'),
            acquire: parseInt(process.env.TENANT_DB_POOL_ACQUIRE || '30000'),
            idle: parseInt(process.env.TENANT_DB_POOL_IDLE || '10000')
          }
        },
        legacy: {
          // ✅ CENTRALIZED: Use environment loader instead of hardcoded values
          host: (() => {
            try {
              const config = backendEnvironmentLoader.getConfiguration();
              return config.database.frs9.host;
            } catch (error) {
              console.warn('⚠️ Failed to load centralized config for legacy DB, using environment variables:', error instanceof Error ? error.message : String(error));
              return process.env.LEGACY_DB_HOST || process.env.FRS9_DB_HOST || '192.168.0.106';
            }
          })(),
          port: (() => {
            try {
              const config = backendEnvironmentLoader.getConfiguration();
              return config.database.frs9.port;
            } catch (error) {
              console.warn('⚠️ Failed to load centralized config for legacy DB port, using environment variables:', error instanceof Error ? error.message : String(error));
              return parseInt(process.env.LEGACY_DB_PORT || process.env.FRS9_DB_PORT || '5433');
            }
          })(),
          database: process.env.LEGACY_DB_NAME || process.env.FRS9_DB_NAME || 'FRS9PRO',
          username: process.env.LEGACY_DB_USER || process.env.FRS9_DB_USER || 'postgres',
          password: process.env.LEGACY_DB_PASSWORD || 'postgres',
          ssl: process.env.LEGACY_DB_SSL === 'true'
        }
      },

      authentication: {
        jwt: {
          secret: this.getRequiredEnv('JWT_SECRET'),
          refreshSecret: this.getRequiredEnv('JWT_REFRESH_SECRET'),
          expiresIn: process.env.JWT_EXPIRES_IN || '8h',
          refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
          issuer: env.jwt?.issuer || 'ifrs9-platform-development',
          audience: 'ifrs9-platform-users',
          algorithm: 'HS256'
        },
        bcrypt: {
          saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
        },
        session: {
          secret: this.getRequiredEnv('SESSION_SECRET'),
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000') // 24 hours
          }
        }
      },

      features: {
        multiTenant: process.env.FEATURE_MULTI_TENANT !== 'false',
        dualBanking: process.env.FEATURE_DUAL_BANKING === 'true',
        syariahCompliance: process.env.FEATURE_SYARIAH_COMPLIANCE === 'true',
        ifrs9Calculations: process.env.FEATURE_IFRS9_CALCULATIONS !== 'false',
        auditTrail: process.env.FEATURE_AUDIT_TRAIL !== 'false',
        advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
        workflowManagement: process.env.FEATURE_WORKFLOW_MANAGEMENT === 'true'
      },

      ifrs9: {
        staging: {
          twelveMonthThreshold: parseFloat(process.env.IFRS9_TWELVE_MONTH_THRESHOLD || '0.05'),
          lifetimeEclTrigger: parseFloat(process.env.IFRS9_LIFETIME_ECL_TRIGGER || '0.10'),
          significantIncreaseTrigger: parseFloat(process.env.IFRS9_SIGNIFICANT_INCREASE_TRIGGER || '0.20')
        },
        calculations: {
          defaultDiscountRate: parseFloat(process.env.IFRS9_DEFAULT_DISCOUNT_RATE || '0.05'),
          defaultRecoveryRate: parseFloat(process.env.IFRS9_DEFAULT_RECOVERY_RATE || '0.40'),
          probabilityOfDefaultModel: process.env.IFRS9_PD_MODEL || 'logistic',
          lossGivenDefaultModel: process.env.IFRS9_LGD_MODEL || 'linear',
          exposureAtDefaultModel: process.env.IFRS9_EAD_MODEL || 'current_balance'
        },
        reporting: {
          regulatoryFramework: process.env.IFRS9_REGULATORY_FRAMEWORK || 'POJK',
          reportingCurrency: process.env.IFRS9_REPORTING_CURRENCY || 'IDR',
          reportingFrequency: process.env.IFRS9_REPORTING_FREQUENCY || 'monthly'
        }
      },

      banking: {
        conventional: {
          enabled: process.env.BANKING_CONVENTIONAL_ENABLED !== 'false',
          interestCalculationMethod: process.env.BANKING_INTEREST_METHOD || 'reducing_balance',
          provisionMethod: process.env.BANKING_PROVISION_METHOD || 'percentage'
        },
        syariah: {
          enabled: process.env.BANKING_SYARIAH_ENABLED === 'true',
          profitRateMethod: process.env.BANKING_PROFIT_RATE_METHOD || 'flat_rate',
          complianceFramework: process.env.BANKING_SYARIAH_FRAMEWORK || 'AAOIFI',
          boardApprovalRequired: process.env.BANKING_SYARIAH_BOARD_APPROVAL === 'true'
        }
      },

      integration: {
        rAnalytics: {
          url: env.rAnalyticsUrl || 'http://localhost:4236',
          port: parseInt(process.env.R_ANALYTICS_PORT || '4236'),
          timeout: parseInt(process.env.R_ANALYTICS_TIMEOUT || '30000'),
          retryAttempts: parseInt(process.env.R_ANALYTICS_RETRY_ATTEMPTS || '3')
        },
        externalApis: {
          centralBank: {
            url: process.env.CENTRAL_BANK_API_URL || '',
            apiKey: process.env.CENTRAL_BANK_API_KEY || '',
            timeout: parseInt(process.env.CENTRAL_BANK_API_TIMEOUT || '30000')
          },
          creditBureau: {
            url: process.env.CREDIT_BUREAU_API_URL || '',
            apiKey: process.env.CREDIT_BUREAU_API_KEY || '',
            timeout: parseInt(process.env.CREDIT_BUREAU_API_TIMEOUT || '30000')
          }
        }
      },

      security: {
        encryption: {
          algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
          keyLength: parseInt(process.env.ENCRYPTION_KEY_LENGTH || '32'),
          ivLength: parseInt(process.env.ENCRYPTION_IV_LENGTH || '12')
        },
        passwords: {
          minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
          requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
          requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
          requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
          requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
          maxAge: parseInt(process.env.PASSWORD_MAX_AGE || '7776000000') // 90 days
        },
        apiKeys: {
          length: parseInt(process.env.API_KEY_LENGTH || '32'),
          prefix: process.env.API_KEY_PREFIX || 'ifrs9_',
          expirationDays: parseInt(process.env.API_KEY_EXPIRATION_DAYS || '365')
        }
      },

      audit: {
        enabled: process.env.AUDIT_ENABLED !== 'false',
        retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555'), // 7 years
        logLevel: (process.env.AUDIT_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
        includeRequestBody: process.env.AUDIT_INCLUDE_REQUEST_BODY === 'true',
        includeResponseBody: process.env.AUDIT_INCLUDE_RESPONSE_BODY === 'false',
        maskSensitiveData: process.env.AUDIT_MASK_SENSITIVE === 'true'
      }
    };
  }

  /**
   * Get complete configuration
   */
  public getConfiguration(): ConfigurationSchema {
    return this.configuration;
  }

  /**
   * Get specific configuration section
   */
  public getSection<K extends keyof ConfigurationSchema>(section: K): ConfigurationSchema[K] {
    return this.configuration[section];
  }

  /**
   * Get database configuration for specific database type
   */
  public getDatabaseConfig(dbType: 'platform' | 'shared' | 'tenant' | 'legacy') {
    return this.configuration.database[dbType];
  }

  /**
   * Get tenant database configuration with specific tenant
   */
  public getTenantDatabaseConfig(tenantSlug: string) {
    const baseConfig = this.configuration.database.tenant;
    return {
      ...baseConfig,
      database: `${baseConfig.databasePrefix}${tenantSlug}`
    };
  }

  /**
   * Validate configuration completeness
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!this.configuration.authentication.jwt.secret) {
      errors.push('JWT_SECRET is required');
    }

    if (!this.configuration.authentication.jwt.refreshSecret) {
      errors.push('JWT_REFRESH_SECRET is required');
    }

    if (!this.configuration.authentication.session.secret) {
      errors.push('SESSION_SECRET is required');
    }

    // Validate database configurations
    Object.entries(this.configuration.database).forEach(([key, config]) => {
      if (!config.host) {
        errors.push(`Database ${key} host is required`);
      }
      if (!config.port) {
        errors.push(`Database ${key} port is required`);
      }
    });

    // Validate numeric ranges
    if (this.configuration.server.rateLimit.maxRequests <= 0) {
      errors.push('Rate limit max requests must be positive');
    }

    if (this.configuration.features.ifrs9Calculations) {
      if (this.configuration.ifrs9.staging.twelveMonthThreshold <= 0 ||
          this.configuration.ifrs9.staging.twelveMonthThreshold >= 1) {
        errors.push('IFRS9 twelve month threshold must be between 0 and 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reload configuration from environment
   */
  public reloadConfiguration(): void {
    this.configuration = this.loadConfiguration();
  }

  /**
   * Parse CORS origins from comma-separated string
   */
  private parseCorsOrigins(origins: string): string[] {
    return origins.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0);
  }

  /**
   * Get required environment variable or throw error
   */
  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Get environment-specific feature flags
   */
  public getFeatureFlags() {
    return this.configuration.features;
  }

  /**
   * Check if feature is enabled
   */
  public isFeatureEnabled(feature: keyof ConfigurationSchema['features']): boolean {
    return this.configuration.features[feature];
  }

  /**
   * Get IFRS9 configuration
   */
  public getIFRS9Configuration() {
    return this.configuration.ifrs9;
  }

  /**
   * Get banking configuration
   */
  public getBankingConfiguration() {
    return this.configuration.banking;
  }

  /**
   * Get security configuration
   */
  public getSecurityConfiguration() {
    return this.configuration.security;
  }

  /**
   * Get audit configuration
   */
  public getAuditConfiguration() {
    return this.configuration.audit;
  }
}

// Export singleton instance
export const configurationFactory = ConfigurationFactoryService.getInstance();
export default configurationFactory;