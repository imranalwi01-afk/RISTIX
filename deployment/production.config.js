// deployment/production.config.js
// ============================================================================
// Production Deployment Configuration for IFRS 9 Multi-Tenant Platform
// ============================================================================
// Generated: 2025-01-11
// Purpose: Complete production deployment configuration for native services
// Architecture: Multi-server deployment without Docker containers
// Services: Frontend, Backend, R Analytics, PostgreSQL, Redis, Nginx
// ============================================================================

const fs = require('fs');
const path = require('path');

/**
 * Production Environment Configuration
 * Native services deployment on dedicated infrastructure
 */
const productionConfig = {
  // ============================================================================
  // ENVIRONMENT INFORMATION
  // ============================================================================
  environment: 'production',
  platform: 'IFRS9_Multi_Tenant_Banking_Platform',
  version: '1.0.0',
  deployment: {
    strategy: 'native_services', // NO Docker containers
    infrastructure: 'multi_server',
    loadBalancing: true,
    autoScaling: false, // Manual scaling for banking compliance
    monitoring: 'comprehensive'
  },

  // ============================================================================
  // SERVER INFRASTRUCTURE
  // ============================================================================
  servers: {
    // Application Server 1 (Primary)
    app_server_primary: {
      hostname: 'ifrs9-app-01.internal',
      ip: '192.168.0.85',
      role: 'primary_application',
      services: ['frontend', 'backend', 'r_analytics'],
      specs: {
        cpu: '16_cores',
        memory: '32GB',
        storage: '500GB_SSD',
        network: '1Gbps'
      }
    },
    
    // Database Server 1 (Primary PostgreSQL)
    db_server_primary: {
      hostname: 'ifrs9-db-01.internal',
      ip: '192.168.0.85',
      role: 'primary_database',
      services: ['postgresql', 'redis'],
      port: 5432,
      specs: {
        cpu: '24_cores',
        memory: '64GB',
        storage: '2TB_NVMe',
        network: '10Gbps'
      }
    },
    
    // Database Server 2 (Legacy & Analytics)
    db_server_secondary: {
      hostname: 'ifrs9-db-02.internal',
      ip: '192.168.0.106',
      role: 'legacy_analytics',
      services: ['postgresql_legacy', 'postgresql_analytics'],
      ports: [5432, 5434],
      specs: {
        cpu: '20_cores',
        memory: '48GB',
        storage: '1TB_NVMe',
        network: '10Gbps'
      }
    },

    // Load Balancer & Proxy Server
    proxy_server: {
      hostname: 'ifrs9-proxy-01.internal',
      ip: '192.168.0.88',
      role: 'load_balancer_proxy',
      services: ['nginx', 'ssl_termination'],
      specs: {
        cpu: '8_cores',
        memory: '16GB',
        storage: '100GB_SSD',
        network: '10Gbps'
      }
    }
  },

  // ============================================================================
  // SERVICE CONFIGURATION
  // ============================================================================
  services: {
    // Frontend Service (Next.js 15)
    frontend: {
      name: 'IFRS9_Frontend',
      type: 'nextjs_application',
      version: '15.0.0',
      runtime: 'node_20',
      port: 4231,
      instances: 2, // PM2 cluster mode
      environment: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
        PORT: '4231',
        BACKEND_URL: 'https://bifrs9.ifrspro.id',
        API_BASE_URL: 'https://bifrs9.ifrspro.id/api/v1'
      },
      build: {
        command: 'pnpm build',
        outputDir: '.next',
        assets: 'static'
      },
      pm2: {
        name: 'ifrs9-frontend',
        script: 'server.js',
        instances: 2,
        exec_mode: 'cluster',
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production',
          PORT: 4231
        }
      }
    },

    // Backend Service (Express.js + TypeScript)
    backend: {
      name: 'IFRS9_Backend',
      type: 'express_api',
      runtime: 'node_20',
      port: 4232,
      instances: 4, // PM2 cluster mode
      environment: {
        NODE_ENV: 'production',
        PORT: '4232',
        DB_HOST: '192.168.0.85',
        DB_PORT: '5432',
        DB_NAME: 'ifrspro_platform_admin',
        DB_USER: 'postgres',
        DB_PASSWORD: '${DB_PASSWORD_ENCRYPTED}',
        REDIS_HOST: '192.168.0.85',
        REDIS_PORT: '6379',
        REDIS_PASSWORD: '${REDIS_PASSWORD_ENCRYPTED}',
        JWT_SECRET: '${JWT_SECRET_ENCRYPTED}',
        R_ANALYTICS_URL: 'http://localhost:4236'
      },
      build: {
        command: 'pnpm build',
        outputDir: 'dist',
        preScript: 'npm run type-check'
      },
      pm2: {
        name: 'ifrs9-backend',
        script: 'dist/index.js',
        instances: 4,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        env: {
          NODE_ENV: 'production',
          PORT: 4232
        }
      }
    },

    // R Analytics Service
    r_analytics: {
      name: 'IFRS9_R_Analytics',
      type: 'r_service',
      runtime: 'r_4.3',
      port: 4236,
      instances: 2, // PM2 fork mode (R doesn't support cluster)
      environment: {
        R_HOME: '/usr/lib/R',
        R_LIBS_USER: '/opt/ifrs9/r-packages',
        IFRS9_DATA_SOURCE: 'postgresql://192.168.0.106:5432/IFRS9_pro',
        R_SERVICE_PORT: '4236',
        R_MAX_MEMORY: '8G'
      },
      dependencies: [
        'r-base-core',
        'r-cran-plumber',
        'r-cran-dbi',
        'r-cran-rpostgresql',
        'r-cran-jsonlite',
        'r-cran-survival'
      ],
      pm2: {
        name: 'ifrs9-r-analytics',
        script: 'start_r_service.sh',
        instances: 2,
        exec_mode: 'fork',
        max_memory_restart: '8G'
      }
    }
  },

  // ============================================================================
  // DATABASE CONFIGURATION
  // ============================================================================
  databases: {
    // Primary PostgreSQL (Multi-tenant)
    postgresql_primary: {
      host: '192.168.0.85',
      port: 5432,
      version: '15.0',
      databases: [
        'ifrspro_platform_admin',
        'ifrspro_shared_services',
        'ifrspro_tenant_dana',
        'ifrspro_tenant_demo_conventional',
        'ifrspro_tenant_demo_syariah'
      ],
      configuration: {
        max_connections: 200,
        shared_buffers: '8GB',
        effective_cache_size: '24GB',
        maintenance_work_mem: '2GB',
        checkpoint_completion_target: 0.9,
        wal_buffers: '16MB',
        default_statistics_target: 100,
        random_page_cost: 1.1,
        effective_io_concurrency: 200
      },
      backup: {
        enabled: true,
        schedule: '0 2 * * *', // Daily at 2 AM
        retention: '30_days',
        compression: true
      }
    },

    // Legacy PostgreSQL (FRS9PRO Migration)
    postgresql_legacy: {
      host: '192.168.0.106',
      port: 5432,
      version: '16.0',
      databases: ['FRS9PRO'],
      role: 'migration_source',
      configuration: {
        max_connections: 100,
        shared_buffers: '4GB',
        effective_cache_size: '12GB'
      }
    },

    // Analytics PostgreSQL (R Integration)
    postgresql_analytics: {
      host: '192.168.0.106',
      port: 5434,
      version: '16.0',
      databases: ['IFRS9_pro'],
      role: 'analytics_processing',
      configuration: {
        max_connections: 50,
        shared_buffers: '4GB',
        work_mem: '256MB'
      }
    }
  },

  // ============================================================================
  // REDIS CONFIGURATION
  // ============================================================================
  redis: {
    host: '192.168.0.85',
    port: 6379,
    databases: {
      session_store: 10,
      token_blacklist: 4,
      cache: 0,
      rate_limiting: 1
    },
    configuration: {
      maxmemory: '2gb',
      maxmemory_policy: 'allkeys-lru',
      save: '900 1 300 10 60 10000',
      appendonly: 'yes',
      appendfsync: 'everysec'
    }
  },

  // ============================================================================
  // NGINX LOAD BALANCER & SSL CONFIGURATION
  // ============================================================================
  nginx: {
    version: '1.24',
    configuration: {
      worker_processes: 'auto',
      worker_connections: 1024,
      keepalive_timeout: 65,
      client_max_body_size: '50m',
      gzip: {
        enabled: true,
        types: ['text/plain', 'application/json', 'application/javascript', 'text/css']
      }
    },
    ssl: {
      enabled: true,
      certificate: '/etc/ssl/certs/ifrspro.id.crt',
      private_key: '/etc/ssl/private/ifrspro.id.key',
      protocols: ['TLSv1.2', 'TLSv1.3'],
      ciphers: 'HIGH:!aNULL:!MD5'
    },
    upstream: {
      frontend: {
        servers: ['192.168.0.85:4231'],
        method: 'least_conn'
      },
      backend: {
        servers: ['192.168.0.85:4232'],
        method: 'least_conn'
      },
      r_analytics: {
        servers: ['192.168.0.85:4236'],
        method: 'ip_hash' // Sticky sessions for R
      }
    },
    domains: {
      frontend: 'https://ifrs9.ifrspro.id',
      backend: 'https://bifrs9.ifrspro.id',
      r_analytics: 'https://rifrs9.ifrspro.id'
    }
  },

  // ============================================================================
  // MONITORING & LOGGING
  // ============================================================================
  monitoring: {
    // System Monitoring
    system: {
      cpu_threshold: 80,
      memory_threshold: 85,
      disk_threshold: 90,
      network_monitoring: true
    },
    
    // Application Monitoring
    application: {
      health_checks: {
        frontend: 'https://ifrs9.ifrspro.id/api/health',
        backend: 'https://bifrs9.ifrspro.id/api/v1/health',
        r_analytics: 'https://rifrs9.ifrspro.id/health'
      },
      response_time_threshold: '2s',
      error_rate_threshold: '1%',
      uptime_requirement: '99.9%'
    },
    
    // Database Monitoring
    database: {
      connection_monitoring: true,
      query_performance: true,
      replication_lag: true,
      disk_usage: true
    }
  },

  // Logging Configuration
  logging: {
    level: 'info',
    format: 'json',
    destinations: {
      files: {
        application: '/var/log/ifrs9/application.log',
        error: '/var/log/ifrs9/error.log',
        access: '/var/log/ifrs9/access.log',
        audit: '/var/log/ifrs9/audit.log'
      },
      rotation: {
        size: '100MB',
        files: 10,
        compress: true
      }
    }
  },

  // ============================================================================
  // SECURITY CONFIGURATION
  // ============================================================================
  security: {
    // Network Security
    firewall: {
      enabled: true,
      allowed_ports: [80, 443, 22, 5432, 6379],
      blocked_ips: [],
      rate_limiting: true
    },
    
    // Application Security
    application: {
      cors_origins: ['https://ifrs9.ifrspro.id'],
      csrf_protection: true,
      helmet_enabled: true,
      session_security: true
    },
    
    // Database Security
    database: {
      ssl_required: true,
      encryption_at_rest: true,
      backup_encryption: true,
      access_logging: true
    }
  },

  // ============================================================================
  // BACKUP & DISASTER RECOVERY
  // ============================================================================
  backup: {
    strategy: 'comprehensive',
    
    // Database Backups
    database: {
      full_backup: {
        schedule: '0 1 * * 0', // Weekly on Sunday 1 AM
        retention: '12_weeks'
      },
      incremental_backup: {
        schedule: '0 2 * * 1-6', // Daily except Sunday at 2 AM
        retention: '2_weeks'
      },
      point_in_time_recovery: true
    },
    
    // Application Backups
    application: {
      code_backup: {
        schedule: '0 3 * * *', // Daily at 3 AM
        retention: '4_weeks'
      },
      config_backup: {
        schedule: '0 */6 * * *', // Every 6 hours
        retention: '1_week'
      }
    },
    
    // File System Backups
    filesystem: {
      user_uploads: {
        schedule: '0 4 * * *', // Daily at 4 AM
        retention: '8_weeks'
      },
      logs: {
        schedule: '0 5 * * *', // Daily at 5 AM
        retention: '4_weeks'
      }
    }
  },

  // ============================================================================
  // DEPLOYMENT AUTOMATION
  // ============================================================================
  deployment: {
    // Build Pipeline
    build: {
      node_version: '20.10.0',
      pnpm_version: '9.0.0',
      typescript_version: '5.0.0',
      build_timeout: '10m'
    },
    
    // Deployment Steps
    steps: [
      'backup_current_release',
      'build_application',
      'run_tests',
      'deploy_to_staging',
      'run_integration_tests',
      'deploy_to_production',
      'health_check',
      'update_monitoring'
    ],
    
    // Rollback Strategy
    rollback: {
      enabled: true,
      automatic_triggers: [
        'health_check_failure',
        'error_rate_spike',
        'performance_degradation'
      ],
      manual_approval: true
    }
  }
};

// ============================================================================
// CONFIGURATION VALIDATION & EXPORT
// ============================================================================

/**
 * Validate production configuration
 */
function validateConfiguration() {
  const requiredFields = [
    'servers.app_server_primary.ip',
    'servers.db_server_primary.ip',
    'services.frontend.port',
    'services.backend.port',
    'databases.postgresql_primary.host'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const keys = field.split('.');
    let value = productionConfig;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return true;
    }
    return false;
  });
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
  }
  
  console.log('✅ Production configuration validation passed');
  return true;
}

/**
 * Generate environment-specific configuration files
 */
function generateConfigFiles() {
  const configs = {
    // PM2 Ecosystem Configuration
    'ecosystem.config.js': generatePM2Config(),
    
    // Nginx Configuration
    'nginx.conf': generateNginxConfig(),
    
    // PostgreSQL Configuration
    'postgresql.conf': generatePostgreSQLConfig(),
    
    // Redis Configuration
    'redis.conf': generateRedisConfig(),
    
    // Environment Variables
    '.env.production': generateEnvironmentFile()
  };
  
  return configs;
}

function generatePM2Config() {
  return `
// PM2 Ecosystem Configuration for IFRS9 Platform
module.exports = {
  apps: [
    // Frontend Application
    {
      name: '${productionConfig.services.frontend.pm2.name}',
      script: '${productionConfig.services.frontend.pm2.script}',
      cwd: './packages/frontend',
      instances: ${productionConfig.services.frontend.pm2.instances},
      exec_mode: '${productionConfig.services.frontend.pm2.exec_mode}',
      max_memory_restart: '${productionConfig.services.frontend.pm2.max_memory_restart}',
      env: ${JSON.stringify(productionConfig.services.frontend.pm2.env, null, 6)},
      error_file: '/var/log/ifrs9/frontend-error.log',
      out_file: '/var/log/ifrs9/frontend-out.log',
      log_file: '/var/log/ifrs9/frontend.log',
      time: true
    },
    
    // Backend API
    {
      name: '${productionConfig.services.backend.pm2.name}',
      script: '${productionConfig.services.backend.pm2.script}',
      cwd: './packages/backend',
      instances: ${productionConfig.services.backend.pm2.instances},
      exec_mode: '${productionConfig.services.backend.pm2.exec_mode}',
      max_memory_restart: '${productionConfig.services.backend.pm2.max_memory_restart}',
      env: ${JSON.stringify(productionConfig.services.backend.pm2.env, null, 6)},
      error_file: '/var/log/ifrs9/backend-error.log',
      out_file: '/var/log/ifrs9/backend-out.log',
      log_file: '/var/log/ifrs9/backend.log',
      time: true
    },
    
    // R Analytics Service
    {
      name: '${productionConfig.services.r_analytics.pm2.name}',
      script: '${productionConfig.services.r_analytics.pm2.script}',
      cwd: './packages/r-analytics',
      instances: ${productionConfig.services.r_analytics.pm2.instances},
      exec_mode: '${productionConfig.services.r_analytics.pm2.exec_mode}',
      max_memory_restart: '${productionConfig.services.r_analytics.pm2.max_memory_restart}',
      error_file: '/var/log/ifrs9/r-analytics-error.log',
      out_file: '/var/log/ifrs9/r-analytics-out.log',
      log_file: '/var/log/ifrs9/r-analytics.log',
      time: true
    }
  ]
};
`;
}

function generateNginxConfig() {
  return `
# Nginx Configuration for IFRS9 Multi-Tenant Platform
# Generated: ${new Date().toISOString()}

worker_processes ${productionConfig.nginx.configuration.worker_processes};
pid /var/run/nginx.pid;

events {
    worker_connections ${productionConfig.nginx.configuration.worker_connections};
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout ${productionConfig.nginx.configuration.keepalive_timeout};
    types_hash_max_size 2048;
    client_max_body_size ${productionConfig.nginx.configuration.client_max_body_size};
    
    # MIME Types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Gzip Compression
    gzip ${productionConfig.nginx.configuration.gzip.enabled ? 'on' : 'off'};
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types ${productionConfig.nginx.configuration.gzip.types.join(' ')};
    
    # SSL Configuration
    ssl_protocols ${productionConfig.nginx.ssl.protocols.join(' ')};
    ssl_ciphers ${productionConfig.nginx.ssl.ciphers};
    ssl_prefer_server_ciphers on;
    
    # Upstream Configuration
    upstream ifrs9_frontend {
        ${productionConfig.nginx.upstream.frontend.servers.map(server => `server ${server};`).join('\n        ')}
    }
    
    upstream ifrs9_backend {
        ${productionConfig.nginx.upstream.backend.servers.map(server => `server ${server};`).join('\n        ')}
    }
    
    upstream ifrs9_r_analytics {
        ${productionConfig.nginx.upstream.r_analytics.servers.map(server => `server ${server};`).join('\n        ')}
    }
    
    # Frontend Server (ifrs9.ifrspro.id)
    server {
        listen 443 ssl http2;
        server_name ifrs9.ifrspro.id;
        
        ssl_certificate ${productionConfig.nginx.ssl.certificate};
        ssl_certificate_key ${productionConfig.nginx.ssl.private_key};
        
        location / {
            proxy_pass http://ifrs9_frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
    
    # Backend API Server (bifrs9.ifrspro.id)
    server {
        listen 443 ssl http2;
        server_name bifrs9.ifrspro.id;
        
        ssl_certificate ${productionConfig.nginx.ssl.certificate};
        ssl_certificate_key ${productionConfig.nginx.ssl.private_key};
        
        location / {
            proxy_pass http://ifrs9_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    
    # R Analytics Server (rifrs9.ifrspro.id)
    server {
        listen 443 ssl http2;
        server_name rifrs9.ifrspro.id;
        
        ssl_certificate ${productionConfig.nginx.ssl.certificate};
        ssl_certificate_key ${productionConfig.nginx.ssl.private_key};
        
        location / {
            proxy_pass http://ifrs9_r_analytics;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    
    # HTTP Redirect to HTTPS
    server {
        listen 80;
        server_name ifrs9.ifrspro.id bifrs9.ifrspro.id rifrs9.ifrspro.id;
        return 301 https://$server_name$request_uri;
    }
}
`;
}

function generateEnvironmentFile() {
  return `
# IFRS9 Multi-Tenant Platform - Production Environment
# Generated: ${new Date().toISOString()}
# DO NOT COMMIT TO VERSION CONTROL

# =================================
# ENVIRONMENT CONFIGURATION
# =================================
NODE_ENV=production
APP_NAME=IFRS9_Multi_Tenant_Platform
APP_VERSION=1.0.0
APP_DEBUG=false

# =================================
# SERVER CONFIGURATION
# =================================
FRONTEND_PORT=${productionConfig.services.frontend.port}
BACKEND_PORT=${productionConfig.services.backend.port}
R_ANALYTICS_PORT=${productionConfig.services.r_analytics.port}

# =================================
# PUBLIC URLS
# =================================
FRONTEND_URL=${productionConfig.nginx.domains.frontend}
BACKEND_URL=${productionConfig.nginx.domains.backend}
R_ANALYTICS_URL=${productionConfig.nginx.domains.r_analytics}

# =================================
# DATABASE CONFIGURATION (PRIMARY)
# =================================
DB_HOST=${productionConfig.databases.postgresql_primary.host}
DB_PORT=${productionConfig.databases.postgresql_primary.port}
DB_NAME=ifrspro_platform_admin
DB_USER=postgres
DB_PASSWORD=\${DB_PASSWORD_ENCRYPTED}

# =================================
# DATABASE CONFIGURATION (LEGACY)
# =================================
DB_LEGACY_HOST=${productionConfig.databases.postgresql_legacy.host}
DB_LEGACY_PORT=${productionConfig.databases.postgresql_legacy.port}
DB_LEGACY_NAME=FRS9PRO
DB_LEGACY_USER=postgres
DB_LEGACY_PASSWORD=\${DB_LEGACY_PASSWORD_ENCRYPTED}

# =================================
# REDIS CONFIGURATION
# =================================
REDIS_HOST=${productionConfig.redis.host}
REDIS_PORT=${productionConfig.redis.port}
REDIS_PASSWORD=\${REDIS_PASSWORD_ENCRYPTED}
REDIS_SESSION_DB=${productionConfig.redis.databases.session_store}
REDIS_CACHE_DB=${productionConfig.redis.databases.cache}

# =================================
# SECURITY CONFIGURATION
# =================================
JWT_SECRET=\${JWT_SECRET_ENCRYPTED}
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=\${JWT_REFRESH_SECRET_ENCRYPTED}
JWT_REFRESH_EXPIRES_IN=7d
ENCRYPTION_KEY=\${ENCRYPTION_KEY_ENCRYPTED}
SALT_ROUNDS=12

# =================================
# FEATURE FLAGS
# =================================
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_ISLAMIC_BANKING=true
FEATURE_AUDIT_TRAIL=true
FEATURE_MULTI_FACTOR_AUTH=true
FEATURE_STRESS_TESTING=true

# =================================
# MONITORING CONFIGURATION
# =================================
LOG_LEVEL=${productionConfig.logging.level}
LOG_FILE=${productionConfig.logging.destinations.files.application}
MONITORING_ENABLED=true
HEALTH_CHECK_ENABLED=true

# =================================
# R ANALYTICS CONFIGURATION
# =================================
R_SERVICE_URL=http://localhost:${productionConfig.services.r_analytics.port}
R_MAX_MEMORY=${productionConfig.services.r_analytics.environment.R_MAX_MEMORY}
R_TIMEOUT=300000
`;
}

// Export configuration and utilities
module.exports = {
  productionConfig,
  validateConfiguration,
  generateConfigFiles,
  generatePM2Config,
  generateNginxConfig,
  generateEnvironmentFile
};

// Auto-validate configuration when loaded
try {
  validateConfiguration();
  console.log('🚀 Production configuration loaded successfully');
} catch (error) {
  console.error('❌ Production configuration validation failed:', error.message);
  process.exit(1);
}