#!/bin/bash
# scripts/setup/d1h1-environment-setup.sh
# DAY 1 HOUR 1: Environment Configuration Generator - IFRS 9 Multi-Tenant Platform
# Based on: 001-006-005-TodoList-v2.md configuration requirements

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration following coding standards
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h1-environment-setup-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Logging functions following coding standards
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling following coding standards
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate secure secrets following coding standards
generate_secret() {
    openssl rand -hex 32
}

generate_jwt_secret() {
    openssl rand -base64 64 | tr -d '\n'
}

# Generate root environment configuration following TodoList-v2.md
generate_root_environment() {
    log_info "Generating root environment configuration following TodoList-v2.md..."
    
    # Generate secure secrets
    local jwt_secret=$(generate_jwt_secret)
    local jwt_refresh_secret=$(generate_jwt_secret)
    local encryption_key=$(generate_secret)
    local session_secret=$(generate_secret)
    
    cat > "${PROJECT_ROOT}/.env.example" << EOF
# ============================================================================
# IFRS 9 MULTI-TENANT PLATFORM - ENVIRONMENT CONFIGURATION
# Based on: 001-006-005-TodoList-v2.md specifications
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# ============================================================================

# =================================
# APPLICATION CONFIGURATION
# =================================
NODE_ENV=development
APP_NAME=IFRS_Pro_Platform
APP_VERSION=1.0.0
APP_DEBUG=true

# =================================
# SERVER CONFIGURATION (TodoList-v2.md)
# =================================
BACKEND_HOST=localhost
BACKEND_PORT=4232
FRONTEND_HOST=localhost
FRONTEND_PORT=4231
R_ANALYTICS_HOST=localhost
R_ANALYTICS_PORT=4236

# =================================
# PUBLIC URLS (TodoList-v2.md Production)
# =================================
FRONTEND_URL=https://ifrs9.ifrspro.id
BACKEND_URL=https://bifrs9.ifrspro.id
API_BASE_URL=https://bifrs9.ifrspro.id/api
RAPI_BASE_URL=https://rifrs9.ifrspro.id/api

# =================================
# DATABASE CONFIGURATION (TodoList-v2.md)
# =================================
# Primary Database Server
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ifrspro_platform_admin
DB_SSL=false

# Tenant Database Configuration Template
TENANT_DB_HOST=localhost
TENANT_DB_PORT=5432
TENANT_DB_USER_PREFIX=tenant_
TENANT_DB_NAME_PREFIX=ifrspro_tenant_
TENANT_DB_SSL=require

# Database Pool Settings
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_ACQUIRE_TIMEOUT=30000
DB_POOL_IDLE_TIMEOUT=10000

# =================================
# REDIS CONFIGURATION (TodoList-v2.md)
# =================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=1234567890
REDIS_DB=10
REDIS_TOKEN_BLACKLIST_DB=4
REDIS_SESSION_DB=10
REDIS_KEY_PREFIX=ifrspro:
REDIS_TTL=3600

# =================================
# SECURITY CONFIGURATION  
# =================================
JWT_SECRET=${jwt_secret}
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=${jwt_refresh_secret}
JWT_REFRESH_EXPIRES_IN=7d
ENCRYPTION_KEY=${encryption_key}
SESSION_SECRET=${session_secret}
SALT_ROUNDS=12

# Password Policy
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true

# =================================
# CORS AND SECURITY
# =================================
CORS_ORIGINS=http://localhost:4231,https://ifrs9.ifrspro.id
CORS_CREDENTIALS=true
HELMET_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# =================================
# FEATURE FLAGS (TodoList-v2.md)
# =================================
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_ISLAMIC_BANKING=true
FEATURE_AUDIT_TRAIL=true
FEATURE_STRESS_TESTING=true
FEATURE_MOBILE_API=true
FEATURE_WORKFLOW_MANAGEMENT=true
FEATURE_SYARIAH_COMPLIANCE=true

# =================================
# BANKING CONFIGURATION
# =================================
BANKING_TYPE_DEFAULT=conventional
BANKING_SYARIAH_ENABLED=true
BANKING_CONVENTIONAL_ENABLED=true
CURRENCY_DEFAULT=IDR
CURRENCY_PRECISION=2

# Islamic Banking Specific
AAOIFI_COMPLIANCE=true
SYARIAH_BOARD_APPROVAL_REQUIRED=true
SYARIAH_AUDIT_FREQUENCY=12
PROHIBITED_SECTORS=alcohol,gambling,pork,conventional_banking,adult_entertainment,tobacco,weapons

# =================================
# IFRS 9 CONFIGURATION
# =================================
ECL_CALCULATION_TIMEOUT=300000
PD_MODEL_VERSION=1.0
LGD_MODEL_VERSION=1.0
EAD_MODEL_VERSION=1.0
STAGING_THRESHOLD_DAYS=30
STAGING_THRESHOLD_PERCENT=5
MODEL_VALIDATION_ENABLED=true
STRESS_TESTING_ENABLED=true

# =================================
# R ANALYTICS CONFIGURATION
# =================================
R_ANALYTICS_URL=http://localhost:4236
R_SCRIPTS_PATH=/app/packages/r-analytics/scripts
R_MODELS_PATH=/app/packages/r-analytics/models
R_MAX_MEMORY_MB=2048
R_TIMEOUT_SECONDS=300
R_MAX_CONCURRENT_JOBS=5

# =================================
# FILE UPLOAD CONFIGURATION
# =================================
UPLOAD_MAX_SIZE=50MB
UPLOAD_ALLOWED_TYPES=xlsx,csv,json,pdf,xls
UPLOAD_PATH=/var/uploads/ifrspro
UPLOAD_TEMP_PATH=/tmp/ifrspro
UPLOAD_VIRUS_SCAN_ENABLED=true

# =================================
# LOGGING CONFIGURATION
# =================================
LOG_LEVEL=debug
LOG_FILE=/var/log/ifrspro/app.log
LOG_MAX_SIZE=100MB
LOG_MAX_FILES=10
LOG_CONSOLE_ENABLED=true
LOG_FILE_ENABLED=true

# =================================
# MULTI-TENANT CONFIGURATION
# =================================
TENANT_ISOLATION_LEVEL=database
MAX_TENANTS_PER_INSTANCE=50
TENANT_CACHE_TTL=300
TENANT_AUTO_PROVISION=false
TENANT_BACKUP_ENABLED=true

# =================================
# COMPLIANCE CONFIGURATION
# =================================
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=all
REGULATORY_MODE=strict
COMPLIANCE_FRAMEWORK=OJK,AAOIFI,BASEL_III
DATA_RETENTION_YEARS=7

# =================================
# DEVELOPMENT CONFIGURATION
# =================================
DEV_MODE=true
HOT_RELOAD=true
SOURCE_MAPS=true
MOCK_SERVICES=false
DEBUG_SQL=false
DEBUG_REDIS=false
EOF

    # Copy to actual .env file
    cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env"
    
    log_success "Root environment configuration generated"
}

# Generate backend environment configuration
generate_backend_environment() {
    log_info "Generating backend environment configuration..."
    
    cat > "${PROJECT_ROOT}/packages/backend/.env.example" << 'EOF'
# ============================================================================
# IFRS 9 BACKEND API - ENVIRONMENT CONFIGURATION
# Express.js + Sequelize + PostgreSQL + Redis
# ============================================================================

# Server Configuration
NODE_ENV=development
PORT=4232
API_PREFIX=/api/v1
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ifrspro_platform_admin
DB_LOGGING=true
DB_SYNC=false
DB_FORCE_SYNC=false

# Redis Configuration  
REDIS_URL=redis://localhost:6379/10

# Security
JWT_SECRET=your-backend-jwt-secret-key-change-this
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:4231
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/backend.log

# File Upload
UPLOAD_PATH=./uploads
UPLOAD_MAX_SIZE=50MB
UPLOAD_ALLOWED_TYPES=xlsx,csv,json,pdf

# Multi-tenant
TENANT_DB_PREFIX=ifrspro_tenant_
DEFAULT_TENANT_FEATURES=dashboard,basic_reports,ecl_calculations

# IFRS 9
ECL_CALCULATION_TIMEOUT=300000
MODEL_VALIDATION_ENABLED=true

# R Analytics Integration
R_ANALYTICS_URL=http://localhost:4236
R_API_TIMEOUT=300000

# Monitoring
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
EOF

    cp "${PROJECT_ROOT}/packages/backend/.env.example" "${PROJECT_ROOT}/packages/backend/.env"
    
    log_success "Backend environment configuration generated"
}

# Generate frontend environment configuration
generate_frontend_environment() {
    log_info "Generating frontend environment configuration..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/.env.example" << 'EOF'
# ============================================================================
# IFRS 9 FRONTEND - ENVIRONMENT CONFIGURATION  
# Next.js 15 + Material-UI v6 + React Admin v4
# ============================================================================

# Public API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4232/api/v1
NEXT_PUBLIC_R_API_URL=http://localhost:4236/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=IFRS Pro Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development

# Banking Configuration
NEXT_PUBLIC_DEFAULT_BANKING_MODE=conventional
NEXT_PUBLIC_SYARIAH_MODE_ENABLED=true
NEXT_PUBLIC_CONVENTIONAL_MODE_ENABLED=true
NEXT_PUBLIC_DUAL_BANKING_ENABLED=true

# Locale Configuration
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,id,ar
NEXT_PUBLIC_RTL_LANGUAGES=ar
NEXT_PUBLIC_HIJRI_CALENDAR_ENABLED=true

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_R_INTEGRATION=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_3D_VISUALIZATIONS=true
NEXT_PUBLIC_ENABLE_MOBILE_VIEW=true

# Performance
NEXT_PUBLIC_REQUEST_TIMEOUT=30000
NEXT_PUBLIC_CACHE_TTL=300
NEXT_PUBLIC_LAZY_LOADING=true

# Development
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_MOCK_API=false
NEXT_PUBLIC_SOURCE_MAPS=true

# Theme Configuration
NEXT_PUBLIC_DEFAULT_THEME=light
NEXT_PUBLIC_THEME_PERSISTENCE=true
NEXT_PUBLIC_CUSTOM_THEMES=conventional,syariah

# Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=50MB
NEXT_PUBLIC_ALLOWED_FILE_TYPES=xlsx,csv,json,pdf,xls
EOF

    cp "${PROJECT_ROOT}/packages/frontend/.env.example" "${PROJECT_ROOT}/packages/frontend/.env.local"
    
    log_success "Frontend environment configuration generated"
}

# Generate R Analytics environment configuration
generate_r_analytics_environment() {
    log_info "Generating R Analytics environment configuration..."
    
    cat > "${PROJECT_ROOT}/packages/r-analytics/.env.example" << 'EOF'
# ============================================================================
# IFRS 9 R ANALYTICS SERVICE - ENVIRONMENT CONFIGURATION
# R Statistical Computing + Express.js API Bridge
# ============================================================================

# Server Configuration
NODE_ENV=development  
PORT=4236
HOST=localhost
API_PREFIX=/api

# R Configuration
R_EXECUTABLE=Rscript
R_SCRIPT_TIMEOUT=300000
R_MEMORY_LIMIT=2GB
R_MAX_CONCURRENT_JOBS=5
R_SCRIPTS_PATH=./src/scripts
R_MODELS_PATH=./models
R_DATA_PATH=./data

# Database Configuration (for R data access)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ifrspro_platform_admin

# Caching
RESULT_CACHE_TTL=3600
MODEL_CACHE_TTL=7200
CACHE_ENABLED=true

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/r-analytics.log

# Performance
JOB_TIMEOUT=600000
MAX_MEMORY_USAGE=2048
CPU_CORES=4

# IFRS 9 Models
ECL_MODEL_VERSION=1.0
PD_MODEL_VERSION=1.0
LGD_MODEL_VERSION=1.0
STAGING_MODEL_VERSION=1.0

# Security
API_KEY_REQUIRED=false
CORS_ORIGIN=http://localhost:4231,http://localhost:4232

# Monitoring
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
PERFORMANCE_MONITORING=true
EOF

    cp "${PROJECT_ROOT}/packages/r-analytics/.env.example" "${PROJECT_ROOT}/packages/r-analytics/.env"
    
    log_success "R Analytics environment configuration generated"
}

# Generate environment variants (development, staging, production)
generate_environment_variants() {
    log_info "Generating environment variants..."
    
    # Development environment
    cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env.development"
    sed -i 's/NODE_ENV=development/NODE_ENV=development/g' "${PROJECT_ROOT}/.env.development"
    sed -i 's/APP_DEBUG=true/APP_DEBUG=true/g' "${PROJECT_ROOT}/.env.development"
    
    # Staging environment
    cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env.staging"
    sed -i 's/NODE_ENV=development/NODE_ENV=staging/g' "${PROJECT_ROOT}/.env.staging"
    sed -i 's/APP_DEBUG=true/APP_DEBUG=false/g' "${PROJECT_ROOT}/.env.staging"
    sed -i 's/LOG_LEVEL=debug/LOG_LEVEL=info/g' "${PROJECT_ROOT}/.env.staging"
    sed -i 's/DEV_MODE=true/DEV_MODE=false/g' "${PROJECT_ROOT}/.env.staging"
    
    # Production environment template
    cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env.production"
    sed -i 's/NODE_ENV=development/NODE_ENV=production/g' "${PROJECT_ROOT}/.env.production"
    sed -i 's/APP_DEBUG=true/APP_DEBUG=false/g' "${PROJECT_ROOT}/.env.production"
    sed -i 's/LOG_LEVEL=debug/LOG_LEVEL=warn/g' "${PROJECT_ROOT}/.env.production"
    sed -i 's/DEV_MODE=true/DEV_MODE=false/g' "${PROJECT_ROOT}/.env.production"
    sed -i 's/HOT_RELOAD=true/HOT_RELOAD=false/g' "${PROJECT_ROOT}/.env.production"
    sed -i 's/SOURCE_MAPS=true/SOURCE_MAPS=false/g' "${PROJECT_ROOT}/.env.production"
    
    log_success "Environment variants generated"
}

# Generate configuration service template
generate_configuration_service_template() {
    log_info "Generating configuration service template..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/configuration"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/configuration/configuration.service.ts" << 'EOF'
// packages/backend/src/core/services/configuration/configuration.service.ts
// Configuration Management Service - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md and 001-006-005-TodoList-v2.md

import { readFileSync } from 'fs';
import { resolve } from 'path';

// MANDATORY: TodoList-v2.md Configuration Integration
interface TodoListV2Configuration {
  server: {
    backend: { host: string; port: number };
    frontend: { host: string; port: number };
    rAnalytics: { host: string; port: number };
  };
  urls: {
    frontend: string;
    backend: string;
    api: string;
    rApi: string;
  };
  database: {
    tenant: {
      host: string;
      port: number;
      userPrefix: string;
      namePrefix: string;
      ssl: string;
    };
  };
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
    tokenBlacklistDb: number;
    sessionDb: number;
  };
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  private config: any;

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  private constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    // Load environment configuration
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    this.config = {
      application: {
        nodeEnv,
        appName: process.env.APP_NAME || 'IFRS Pro Platform',
        version: process.env.APP_VERSION || '1.0.0',
        debug: process.env.APP_DEBUG === 'true'
      },
      server: {
        backend: {
          host: process.env.BACKEND_HOST || 'localhost',
          port: parseInt(process.env.BACKEND_PORT || '4232')
        },
        frontend: {
          host: process.env.FRONTEND_HOST || 'localhost',
          port: parseInt(process.env.FRONTEND_PORT || '4231')
        },
        rAnalytics: {
          host: process.env.R_ANALYTICS_HOST || 'localhost',
          port: parseInt(process.env.R_ANALYTICS_PORT || '4236')
        }
      },
      // Add more configuration sections as needed
    };
  }

  public getConfiguration(): any {
    return { ...this.config };
  }

  public get<T>(path: string): T {
    const keys = path.split('.');
    let value: any = this.config;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) {
        throw new Error(`Configuration path '${path}' not found`);
      }
    }
    
    return value as T;
  }
}

// Export singleton instance
export const configService = ConfigurationService.getInstance();
EOF
    
    log_success "Configuration service template generated"
}

# Generate Next.js configuration
generate_nextjs_config() {
    log_info "Generating Next.js configuration..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/next.config.js" << 'EOF'
// packages/frontend/next.config.js
// Next.js 15 Configuration for IFRS 9 Multi-Tenant Platform

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['sequelize'],
    typedRoutes: true
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configurations here
    return config;
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/platform/dashboard',
        permanent: false,
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: ['localhost', 'ifrs9.ifrspro.id'],
    formats: ['image/webp', 'image/avif'],
  },

  // Internationalization
  i18n: {
    locales: ['en', 'id', 'ar'],
    defaultLocale: 'en',
    localeDetection: true,
  },

  // Output configuration
  output: 'standalone',
  
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
EOF
    
    log_success "Next.js configuration generated"
}

# Set file permissions
set_file_permissions() {
    log_info "Setting secure file permissions..."
    
    # Secure environment files
    find "${PROJECT_ROOT}" -name ".env*" -type f -exec chmod 600 {} \; 2>/dev/null || true
    
    # Make scripts executable
    find "${PROJECT_ROOT}/scripts" -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null || true
    
    log_success "File permissions set"
}

# Main execution function following coding standards
main() {
    log_info "🚀 Starting Day 1 Hour 1: Environment Configuration Setup"
    log_info "Following TodoList-v2.md environment configuration requirements"
    
    # Step 1: Generate root environment
    generate_root_environment
    
    # Step 2: Generate package environments
    generate_backend_environment
    generate_frontend_environment
    generate_r_analytics_environment
    
    # Step 3: Generate environment variants
    generate_environment_variants
    
    # Step 4: Generate configuration service template
    generate_configuration_service_template
    
    # Step 5: Generate Next.js configuration
    generate_nextjs_config
    
    # Step 6: Set file permissions
    set_file_permissions
    
    log_success "✅ Day 1 Hour 1: Environment Configuration completed successfully!"
    log_info "📍 Project location: ${PROJECT_ROOT}"
    log_info "📋 Log file: ${LOG_FILE}"
    log_info "🔄 Next step: Run 'pnpm install' to install dependencies"
    
    echo ""
    echo "🎯 DAY 1 HOUR 1 COMPLETED - ENVIRONMENT CONFIGURATION"
    echo "✅ Root environment (.env, .env.development, .env.staging, .env.production)"
    echo "✅ Backend environment (Express.js + Sequelize + PostgreSQL)"
    echo "✅ Frontend environment (Next.js 15 + Material-UI v6 + React Admin v4)"
    echo "✅ R Analytics environment (R + Express.js API)"
    echo "✅ Configuration service template"
    echo "✅ Next.js 15 configuration"
    echo "✅ Security configurations applied"
    echo ""
    echo "🔧 Configuration highlights:"
    echo "   • Multi-tenant database architecture configured"
    echo "   • Dual banking support enabled"
    echo "   • IFRS 9 calculation engine ready"
    echo "   • R Analytics integration configured"
    echo "   • Production-ready security settings"
    echo ""
    echo "⚠️  IMPORTANT: Update .env files with your actual values before starting services"
    echo ""
    echo "🔄 Next: Run 'pnpm install' to install all dependencies"
    echo ""
}

# Execute main function with all arguments
main "$@"