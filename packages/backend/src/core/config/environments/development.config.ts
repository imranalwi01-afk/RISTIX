// packages/backend/src/core/config/environments/development.config.ts
export const developmentConfig = {
  environment: 'development',
  
  // Application Settings
  app: {
    name: 'IFRS9_Multi_Tenant_Platform',
    version: '1.0.0',
    debug: true,
    hotReload: true,
    sourceMaps: true,
    mockExternalServices: true
  },
  
  // Server Configuration
  server: {
    backend: {
      host: 'localhost',
      port: 4232,
      cors: {
        origin: ['https://ifrs9.ifrspro.id', 'http://localhost:3000'],
        credentials: true
      }
    },
    frontend: {
      host: 'localhost',
      port: 4231
    },
    rAnalytics: {
      host: 'localhost',
      port: 4236
    }
  },
  
  // Database Configuration
  database: {
    tenant: {
      host: 'localhost',
      port: 5432,
      userPrefix: 'tenant_',
      namePrefix: 'ifrs9_tenant_',
      ssl: false,
      pool: {
        max: 10,
        min: 2,
        idle: 10000
      }
    },
    platform: {
      host: 'localhost',
      port: 5432,
      name: 'ifrspro_platform_admin',
      user: 'postgres',
      password: 'postgres',
      ssl: false
    }
  },
  
  // Redis Configuration
  redis: {
    host: 'localhost',
    port: 6379,
    password: '1234567890',
    db: 10,
    tokenBlacklistDb: 4,
    sessionDb: 10,
    keyPrefix: 'ifrs9:dev:'
  },
  
  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'dev_jwt_secret_minimum_32_characters_long',
      expiresIn: '8h',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_minimum_32_characters',
      refreshExpiresIn: '7d'
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY || 'dev_encryption_key_32_characters_min',
      algorithm: 'aes-256-gcm'
    },
    bcrypt: {
      saltRounds: 10 // Lower for development performance
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // More requests for development
      message: 'Too many requests from this IP'
    }
  },
  
  // Feature Flags
  features: {
    advancedAnalytics: true,
    islamicBanking: true,
    auditTrail: true,
    stressTesting: true,
    mobileApi: true,
    workflowManagement: true,
    syariahCompliance: true,
    multiTenantArchitecture: true,
    rbacAuthentication: true,
    auditWorkflow: true,
    bankingDataModels: true,
    etlPipeline: true,
    formsTemplates: true,
    reactAdminFramework: true,
    dualBankingConfiguration: true,
    bankingResourceManagement: true,
    rApiIntegration: true,
    infrastructure: true,
    legacyIntegration: true,
    productionConfiguration: true
  },
  
  // Logging Configuration
  logging: {
    level: 'debug',
    file: './logs/app.log',
    maxSize: '100MB',
    maxFiles: 10,
    console: true,
    colorize: true
  },
  
  // File Upload Configuration
  upload: {
    maxSize: '50MB',
    allowedTypes: ['xlsx', 'csv', 'json', 'pdf'],
    path: './uploads',
    tempPath: './uploads/temp'
  },
  
  // R Analytics Configuration
  rAnalytics: {
    enabled: true,
    executable: 'Rscript',
    scriptsPath: './packages/r-analytics/scripts',
    modelsPath: './packages/r-analytics/models',
    maxMemoryMB: 1024,
    timeoutSeconds: 180,
    concurrent: 3
  },
  
  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: true,
      endpoint: '/health',
      interval: 30000
    },
    metrics: {
      enabled: true,
      endpoint: '/metrics'
    }
  },
  
  // External Services
  external: {
    mockMode: true,
    legacyFrs9Pro: {
      enabled: false,
      baseUrl: 'http://localhost:8080'
    }
  }
};
