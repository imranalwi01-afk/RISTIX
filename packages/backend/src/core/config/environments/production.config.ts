// packages/backend/src/core/config/environments/production.config.ts
export const productionConfig = {
  environment: 'production',
  
  // Application Settings
  app: {
    name: 'IFRS9_Multi_Tenant_Platform',
    version: process.env.APP_VERSION || '1.0.0',
    debug: false,
    hotReload: false,
    sourceMaps: false,
    mockExternalServices: false
  },
  
  // Server Configuration
  server: {
    backend: {
      host: process.env.BACKEND_HOST || '0.0.0.0',
      port: parseInt(process.env.BACKEND_PORT || '4232', 10),
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['https://ifrs9.ifrspro.id'],
        credentials: true
      }
    },
    frontend: {
      host: process.env.FRONTEND_HOST || '0.0.0.0',
      port: parseInt(process.env.FRONTEND_PORT || '4231', 10)
    },
    rAnalytics: {
      host: process.env.R_ANALYTICS_HOST || '0.0.0.0',
      port: parseInt(process.env.R_ANALYTICS_PORT || '4236', 10)
    }
  },
  
  // Database Configuration
  database: {
    tenant: {
      host: process.env.TENANT_DB_HOST || 'localhost',
      port: parseInt(process.env.TENANT_DB_PORT || '5432', 10),
      userPrefix: process.env.TENANT_DB_USER_PREFIX || 'tenant_',
      namePrefix: process.env.TENANT_DB_NAME_PREFIX || 'ifrs9_tenant_',
      ssl: process.env.TENANT_DB_SSL === 'require',
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '20', 10),
        min: parseInt(process.env.DB_POOL_MIN || '5', 10),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
      }
    },
    platform: {
      host: process.env.PLATFORM_DB_HOST || process.env.TENANT_DB_HOST,
      port: parseInt(process.env.PLATFORM_DB_PORT || process.env.TENANT_DB_PORT || '5432', 10),
      name: process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin',
      user: process.env.PLATFORM_DB_USER || 'ifrspro_platform_app',
      password: process.env.PLATFORM_DB_PASSWORD,
      ssl: process.env.PLATFORM_DB_SSL === 'require'
    }
  },
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '10', 10),
    tokenBlacklistDb: parseInt(process.env.REDIS_TOKEN_BLACKLIST_DB || '4', 10),
    sessionDb: parseInt(process.env.REDIS_SESSION_DB || '10', 10),
    keyPrefix: 'ifrs9:prod:'
  },
  
  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY,
      algorithm: 'aes-256-gcm'
    },
    bcrypt: {
      saltRounds: parseInt(process.env.SALT_ROUNDS || '12', 10)
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      message: 'Too many requests from this IP'
    }
  },
  
  // Feature Flags (from environment)
  features: {
    advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
    islamicBanking: process.env.FEATURE_ISLAMIC_BANKING === 'true',
    auditTrail: process.env.FEATURE_AUDIT_TRAIL === 'true',
    stressTesting: process.env.FEATURE_STRESS_TESTING === 'true',
    mobileApi: process.env.FEATURE_MOBILE_API === 'true',
    workflowManagement: process.env.FEATURE_WORKFLOW_MANAGEMENT === 'true',
    syariahCompliance: process.env.FEATURE_SYARIAH_COMPLIANCE === 'true',
    multiTenantArchitecture: process.env.MVP_MULTI_TENANT_ARCHITECTURE === 'true',
    rbacAuthentication: process.env.MVP_RBAC_AUTHENTICATION === 'true',
    auditWorkflow: process.env.MVP_AUDIT_WORKFLOW === 'true',
    bankingDataModels: process.env.MVP_BANKING_DATA_MODELS === 'true',
    etlPipeline: process.env.MVP_ETL_PIPELINE === 'true',
    formsTemplates: process.env.MVP_FORMS_TEMPLATES === 'true',
    reactAdminFramework: process.env.MVP_REACT_ADMIN_FRAMEWORK === 'true',
    dualBankingConfiguration: process.env.MVP_DUAL_BANKING_CONFIGURATION === 'true',
    bankingResourceManagement: process.env.MVP_BANKING_RESOURCE_MANAGEMENT === 'true',
    rApiIntegration: process.env.MVP_R_API_INTEGRATION === 'true',
    infrastructure: process.env.MVP_INFRASTRUCTURE === 'true',
    legacyIntegration: process.env.MVP_LEGACY_INTEGRATION === 'true',
    productionConfiguration: process.env.MVP_PRODUCTION_CONFIGURATION === 'true'
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || '/var/log/ifrspro/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '100MB',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '10', 10),
    console: false,
    colorize: false
  },
  
  // File Upload Configuration
  upload: {
    maxSize: process.env.UPLOAD_MAX_SIZE || '50MB',
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || ['xlsx', 'csv', 'json', 'pdf'],
    path: process.env.UPLOAD_PATH || '/var/uploads/ifrspro',
    tempPath: process.env.UPLOAD_TEMP_PATH || '/tmp/ifrspro'
  },
  
  // R Analytics Configuration
  rAnalytics: {
    enabled: process.env.R_SERVICE_ENABLED === 'true',
    executable: process.env.R_EXECUTABLE || 'Rscript',
    scriptsPath: process.env.R_SCRIPTS_PATH || '/app/packages/r-analytics/scripts',
    modelsPath: process.env.R_MODELS_PATH || '/app/packages/r-analytics/models',
    maxMemoryMB: parseInt(process.env.R_MAX_MEMORY_MB || '2048', 10),
    timeoutSeconds: parseInt(process.env.R_TIMEOUT_SECONDS || '300', 10),
    concurrent: parseInt(process.env.R_MAX_CONCURRENT || '5', 10)
  },
  
  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
      endpoint: process.env.HEALTH_CHECK_ENDPOINT || '/health',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10)
    },
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      endpoint: process.env.METRICS_ENDPOINT || '/metrics'
    }
  },
  
  // External Services
  external: {
    mockMode: false,
    legacyFrs9Pro: {
      enabled: process.env.LEGACY_FRS9PRO_ENABLED === 'true',
      baseUrl: process.env.LEGACY_FRS9PRO_URL
    }
  }
};
