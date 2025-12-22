#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: scripts/psdd/d2h8-production-infrastructure-setup.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H8 - Production Infrastructure & Configuration
# Methodology: Phased Shell-Driven Development (PSDD)
# Dependencies: PostgreSQL, Redis, R, Nginx, PM2, Node.js 18+
# Purpose: Native service deployment configuration without Docker
# Previous Phase: D2H7 - Database-driven menu system with infrastructure monitoring (COMPLETED)
# Next Phase: D3H1 - Basic IFRS 9 data models and calculations
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h8-production-infra-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H8"
PHASE_NAME="Production Infrastructure & Configuration"
PHASE_OBJECTIVE="Production deployment setup without Docker - native services configuration"
PREVIOUS_PHASE="D2H7 - Database-driven menu system with infrastructure monitoring (COMPLETED)"
NEXT_PHASE="D3H1 - Basic IFRS 9 data models and calculations"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    log_error "Stack trace available in: ${LOG_FILE}"
    
    # Update progress tracking
    track_progress "${PHASE_ID}" "FAILED" "Production infrastructure setup failed at line ${line_number}"
    
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2" 
    local details="$3"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status} | ${details} | ${NEXT_PHASE:-UNKNOWN}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status} - ${details}"
}

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating PSDD environment for ${PHASE_ID}..."
    
    # Check project structure
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Invalid project root. package.json not found."
        exit 1
    fi
    
    # Validate required tools for production deployment
    local required_tools=("node" "npm" "pnpm" "psql" "redis-cli" "nginx" "pm2" "R")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_warning "Production tool not found: $tool - will be installed during setup"
        else
            log_info "✓ Tool available: $tool ($(command -v "$tool"))"
        fi
    done
    
    # Load environment configuration
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment configuration loaded from .env"
    else
        log_warning "No .env file found. Will create production environment configuration."
    fi
    
    # Validate system requirements
    local available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [[ ${available_memory} -lt 2048 ]]; then
        log_warning "Available memory (${available_memory}MB) is below recommended 2048MB for production"
    fi
    
    # Check disk space
    local available_disk=$(df "${PROJECT_ROOT}" | awk 'NR==2{print $4}')
    if [[ ${available_disk} -lt 10485760 ]]; then # 10GB in KB
        log_warning "Available disk space is below recommended 10GB for production"
    fi
    
    log_success "Environment validation completed for ${PHASE_ID}"
}

# Install production dependencies
install_production_dependencies() {
    log_info "Installing production dependencies for native services..."
    
    # Update system packages
    sudo apt-get update -y || log_warning "Failed to update package lists"
    
    # Install PostgreSQL 15+ if not present
    if ! command -v psql &> /dev/null; then
        log_info "Installing PostgreSQL 15..."
        sudo apt-get install -y postgresql-15 postgresql-contrib-15 postgresql-client-15
        sudo systemctl enable postgresql
        sudo systemctl start postgresql
        log_success "PostgreSQL 15 installed and started"
    else
        log_info "✓ PostgreSQL already available"
    fi
    
    # Install Redis if not present
    if ! command -v redis-cli &> /dev/null; then
        log_info "Installing Redis server..."
        sudo apt-get install -y redis-server redis-tools
        sudo systemctl enable redis-server
        sudo systemctl start redis-server
        log_success "Redis server installed and started"
    else
        log_info "✓ Redis already available"
    fi
    
    # Install Nginx if not present
    if ! command -v nginx &> /dev/null; then
        log_info "Installing Nginx web server..."
        sudo apt-get install -y nginx
        sudo systemctl enable nginx
        log_success "Nginx installed and enabled"
    else
        log_info "✓ Nginx already available"
    fi
    
    # Install R and required packages if not present
    if ! command -v R &> /dev/null; then
        log_info "Installing R statistical computing environment..."
        sudo apt-get install -y r-base r-base-dev r-cran-jsonlite r-cran-plumber r-cran-dplyr
        log_success "R statistical environment installed"
    else
        log_info "✓ R already available"
    fi
    
    # Install PM2 globally if not present
    if ! command -v pm2 &> /dev/null; then
        log_info "Installing PM2 process manager..."
        sudo npm install -g pm2
        # Setup PM2 startup script
        sudo pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))
        log_success "PM2 process manager installed with startup script"
    else
        log_info "✓ PM2 already available"
    fi
    
    # Install build tools
    sudo apt-get install -y build-essential git curl wget unzip htop
    
    log_success "All production dependencies installed successfully"
}

# Create production environment configuration
create_production_environment_config() {
    log_info "Creating production environment configuration..."
    
    local env_dir="${PROJECT_ROOT}/config/environments"
    local secrets_dir="${PROJECT_ROOT}/config/secrets"
    
    mkdir -p "${env_dir}"
    mkdir -p "${secrets_dir}"
    chmod 700 "${secrets_dir}"
    
    # Generate production .env file
    cat > "${PROJECT_ROOT}/.env.production" << 'EOF'
# ============================================================================
# PSDD PRODUCTION ENVIRONMENT CONFIGURATION
# ============================================================================
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H8 - Production Infrastructure & Configuration
# Environment: Production
# Purpose: Native services production deployment configuration
# ============================================================================

# Application Configuration
NODE_ENV=production
APP_NAME="IFRS Pro Platform"
APP_VERSION=1.0.0
APP_DEBUG=false
APP_URL=https://ifrs9.ifrspro.id

# Server Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=4232
FRONTEND_HOST=0.0.0.0
FRONTEND_PORT=4231
API_BASE_URL=https://bifrs9.ifrspro.id/api

# R Analytics Configuration
R_ANALYTICS_HOST=0.0.0.0
R_ANALYTICS_PORT=4236
R_ANALYTICS_URL=https://rifrs9.ifrspro.id
R_ANALYTICS_TIMEOUT=300000
R_MAX_MEMORY_MB=4096
R_PACKAGES_PATH=/opt/ifrspro/R/library

# Database Configuration (Platform Admin)
DB_HOST=localhost
DB_PORT=5432
DB_USER=ifrspro_admin
DB_PASSWORD=GENERATE_SECURE_PASSWORD
DB_NAME=ifrspro_platform_admin
DB_SSL=require
DB_POOL_MAX=50
DB_POOL_MIN=10
DB_POOL_IDLE=10000
DB_QUERY_TIMEOUT=30000
DB_LOGGING=false

# Database Configuration (Shared Services)
SHARED_DB_HOST=localhost
SHARED_DB_PORT=5432
SHARED_DB_USER=ifrspro_shared
SHARED_DB_PASSWORD=GENERATE_SECURE_PASSWORD
SHARED_DB_NAME=ifrspro_shared_services
SHARED_DB_SSL=require

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=GENERATE_SECURE_PASSWORD
REDIS_DB=0
REDIS_KEY_PREFIX=ifrspro:prod:
REDIS_TIMEOUT=5000
REDIS_MAX_RETRIES=5
REDIS_CLUSTER_MODE=false

# Security Configuration
JWT_SECRET=GENERATE_JWT_SECRET_64_CHARS_MINIMUM
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=GENERATE_REFRESH_SECRET_64_CHARS_MINIMUM
JWT_REFRESH_EXPIRES_IN=7d
ENCRYPTION_KEY=GENERATE_ENCRYPTION_KEY_32_CHARS_MINIMUM
SALT_ROUNDS=14

# Session Configuration
SESSION_SECRET=GENERATE_SESSION_SECRET_64_CHARS_MINIMUM
SESSION_TIMEOUT=28800000
SESSION_SECURE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict

# CORS Configuration
CORS_ORIGINS=https://ifrs9.ifrspro.id,https://bifrs9.ifrspro.id
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization,X-Tenant-ID

# SSL/TLS Configuration
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/ifrspro.crt
SSL_KEY_PATH=/etc/ssl/private/ifrspro.key
SSL_CA_PATH=/etc/ssl/certs/ca-certificates.crt
HSTS_MAX_AGE=31536000

# Feature Flags (Production)
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_ISLAMIC_BANKING=true
FEATURE_CONVENTIONAL_BANKING=true
FEATURE_AUDIT_TRAIL=true
FEATURE_STRESS_TESTING=true
FEATURE_MOBILE_API=true
FEATURE_WORKFLOW_ENGINE=true
FEATURE_ETL_PIPELINE=true
FEATURE_REAL_TIME_NOTIFICATIONS=true

# Performance Configuration
CACHE_TIMEOUT=600
CACHE_MAX_SIZE=10000
MAX_CONCURRENT_CALC=50
QUERY_TIMEOUT=60000
MAX_FILE_SIZE=100MB
MAX_UPLOAD_FILES=20
REQUEST_RATE_LIMIT=1000
REQUEST_RATE_WINDOW=3600000

# Monitoring Configuration
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
METRICS_COLLECTION_ENABLED=true
METRICS_COLLECTION_INTERVAL=30000
PERFORMANCE_MONITORING=true
ERROR_REPORTING_ENABLED=true
APM_ENABLED=true

# Logging Configuration (Production)
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DESTINATION=file
LOG_FILE_PATH=/var/log/ifrspro/app.log
LOG_MAX_SIZE=100MB
LOG_MAX_FILES=10
LOG_ROTATE_DAILY=true
LOG_COMPRESS=true

# Email Configuration
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=noreply@ifrspro.id
EMAIL_PASSWORD=GENERATE_EMAIL_PASSWORD
EMAIL_FROM=noreply@ifrspro.id

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=90
BACKUP_PATH=/opt/ifrspro/backups
BACKUP_S3_ENABLED=true
BACKUP_S3_BUCKET=ifrspro-backups-production

# File Storage Configuration
STORAGE_TYPE=local
STORAGE_PATH=/opt/ifrspro/storage
STORAGE_MAX_SIZE=1GB
STORAGE_ALLOWED_TYPES=xlsx,xls,csv,pdf,json,xml

# Clustering Configuration
CLUSTER_MODE=true
CLUSTER_WORKERS=auto
CLUSTER_MAX_WORKERS=8

# Deployment Configuration
DEPLOYMENT_ENVIRONMENT=production
DEPLOYMENT_VERSION=1.0.0
DEPLOYMENT_BUILD_NUMBER=BUILD_NUMBER_PLACEHOLDER
DEPLOYMENT_COMMIT_HASH=COMMIT_HASH_PLACEHOLDER
EOF

    # Replace placeholder values with actual generated values
    sed -i "s/GENERATE_SECURE_PASSWORD/$(openssl rand -base64 32)/g" "${PROJECT_ROOT}/.env.production"
    sed -i "s/GENERATE_JWT_SECRET_64_CHARS_MINIMUM/$(openssl rand -base64 64)/g" "${PROJECT_ROOT}/.env.production"
    sed -i "s/GENERATE_REFRESH_SECRET_64_CHARS_MINIMUM/$(openssl rand -base64 64)/g" "${PROJECT_ROOT}/.env.production"
    sed -i "s/GENERATE_ENCRYPTION_KEY_32_CHARS_MINIMUM/$(openssl rand -base64 32)/g" "${PROJECT_ROOT}/.env.production"
    sed -i "s/GENERATE_SESSION_SECRET_64_CHARS_MINIMUM/$(openssl rand -base64 64)/g" "${PROJECT_ROOT}/.env.production"
    sed -i "s/GENERATE_EMAIL_PASSWORD/$(openssl rand -base64 24)/g" "${PROJECT_ROOT}/.env.production"
    
    # Set proper permissions
    chmod 600 "${PROJECT_ROOT}/.env.production"
    
    log_success "Production environment configuration created: .env.production"
}

# Configure PostgreSQL for production
configure_postgresql_production() {
    log_info "Configuring PostgreSQL for production deployment..."
    
    local pg_version=$(sudo -u postgres psql -c "SELECT version();" | grep -oP "PostgreSQL \K[0-9]+")
    local pg_config_dir="/etc/postgresql/${pg_version}/main"
    local pg_data_dir="/var/lib/postgresql/${pg_version}/main"
    
    # Backup original configuration
    sudo cp "${pg_config_dir}/postgresql.conf" "${pg_config_dir}/postgresql.conf.backup"
    sudo cp "${pg_config_dir}/pg_hba.conf" "${pg_config_dir}/pg_hba.conf.backup"
    
    # Create production postgresql.conf
    cat > "/tmp/postgresql_production.conf" << 'EOF'
# ============================================================================
# PSDD PostgreSQL Production Configuration
# ============================================================================
# Generated for IFRS Pro Platform production deployment
# Optimized for multi-tenant IFRS 9 calculations with high performance
# ============================================================================

# Connection Settings
listen_addresses = 'localhost,127.0.0.1'
port = 5432
max_connections = 200
superuser_reserved_connections = 3

# Memory Configuration
shared_buffers = 1GB                    # 25% of available RAM
effective_cache_size = 3GB              # 75% of available RAM
maintenance_work_mem = 256MB
work_mem = 16MB
huge_pages = try

# WAL Configuration
wal_level = replica
wal_buffers = 16MB
max_wal_size = 2GB
min_wal_size = 1GB
checkpoint_completion_target = 0.7
checkpoint_timeout = 10min

# Query Planner
random_page_cost = 1.1                  # For SSD storage
effective_io_concurrency = 200          # For SSD storage
seq_page_cost = 1.0

# Logging Configuration
logging_collector = on
log_destination = 'stderr,csvlog'
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_file_mode = 0640
log_min_duration_statement = 1000       # Log slow queries (1 second+)
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_statement = 'mod'                   # Log all modifications
log_temp_files = 0

# Statistics
track_activities = on
track_counts = on
track_io_timing = on
track_functions = all

# Autovacuum (Optimized for IFRS 9 workloads)
autovacuum = on
autovacuum_max_workers = 6
autovacuum_naptime = 30s
autovacuum_vacuum_threshold = 100
autovacuum_vacuum_scale_factor = 0.05
autovacuum_analyze_threshold = 50
autovacuum_analyze_scale_factor = 0.02

# Background Writer
bgwriter_delay = 200ms
bgwriter_lru_maxpages = 100
bgwriter_lru_multiplier = 2.0

# Archive Settings (for backup)
archive_mode = on
archive_command = 'test ! -f /opt/ifrspro/pg_archive/%f && cp %p /opt/ifrspro/pg_archive/%f'

# Security
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'

# Locale
datestyle = 'iso, mdy'
timezone = 'UTC'
lc_messages = 'en_US.UTF-8'
lc_monetary = 'en_US.UTF-8'
lc_numeric = 'en_US.UTF-8'
lc_time = 'en_US.UTF-8'

# Performance Extensions
shared_preload_libraries = 'pg_stat_statements,auto_explain'

# Additional IFRS 9 Optimizations
enable_seqscan = on
enable_indexscan = on
enable_bitmapscan = on
enable_hashjoin = on
enable_mergejoin = on
enable_nestloop = on
EOF

    # Apply PostgreSQL configuration
    sudo cp "/tmp/postgresql_production.conf" "${pg_config_dir}/postgresql.conf"
    sudo chown postgres:postgres "${pg_config_dir}/postgresql.conf"
    sudo chmod 644 "${pg_config_dir}/postgresql.conf"
    
    # Create production pg_hba.conf
    cat > "/tmp/pg_hba_production.conf" << 'EOF'
# ============================================================================  
# PSDD PostgreSQL Host-Based Authentication (Production)
# ============================================================================
# Generated for IFRS Pro Platform production deployment
# Secure multi-tenant database access configuration
# ============================================================================

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             postgres                                peer
local   all             all                                     peer

# IPv4 local connections:
host    all             postgres        127.0.0.1/32            scram-sha-256
host    all             ifrspro_admin   127.0.0.1/32            scram-sha-256
host    all             ifrspro_shared  127.0.0.1/32            scram-sha-256

# IPv6 local connections:
host    all             all             ::1/128                 scram-sha-256

# Allow replication connections from localhost
local   replication     postgres                                peer
host    replication     postgres        127.0.0.1/32            scram-sha-256
host    replication     postgres        ::1/128                 scram-sha-256

# Production tenant databases
host    ifrspro_platform_admin    ifrspro_admin     127.0.0.1/32    scram-sha-256
host    ifrspro_shared_services   ifrspro_shared    127.0.0.1/32    scram-sha-256

# Deny all other connections
host    all             all             0.0.0.0/0               reject
host    all             all             ::/0                    reject
EOF

    # Apply pg_hba.conf configuration
    sudo cp "/tmp/pg_hba_production.conf" "${pg_config_dir}/pg_hba.conf"
    sudo chown postgres:postgres "${pg_config_dir}/pg_hba.conf"
    sudo chmod 640 "${pg_config_dir}/pg_hba.conf"
    
    # Create archive directory
    sudo mkdir -p /opt/ifrspro/pg_archive
    sudo chown postgres:postgres /opt/ifrspro/pg_archive
    sudo chmod 755 /opt/ifrspro/pg_archive
    
    # Restart PostgreSQL to apply configuration
    sudo systemctl restart postgresql
    sudo systemctl enable postgresql
    
    # Verify PostgreSQL is running
    if sudo systemctl is-active --quiet postgresql; then
        log_success "PostgreSQL production configuration applied and service restarted"
    else
        log_error "PostgreSQL failed to start with production configuration"
        exit 1
    fi
    
    # Create production database users
    log_info "Creating production database users..."
    
    # Create admin user
    sudo -u postgres psql -c "CREATE USER ifrspro_admin WITH PASSWORD '$(openssl rand -base64 24)';" || log_warning "Admin user may already exist"
    sudo -u postgres psql -c "ALTER USER ifrspro_admin CREATEDB;" || log_warning "Admin user privileges may already be set"
    
    # Create shared services user  
    sudo -u postgres psql -c "CREATE USER ifrspro_shared WITH PASSWORD '$(openssl rand -base64 24)';" || log_warning "Shared user may already exist"
    
    log_success "PostgreSQL production configuration completed"
}

# Main execution function
main() {
    log_info "=========================================="
    log_info "PSDD ${PHASE_ID}: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    log_info "Previous Phase: ${PREVIOUS_PHASE}"
    log_info "=========================================="
    
    # Track phase start
    track_progress "${PHASE_ID}" "STARTED" "Production infrastructure setup initiated"
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,config/environments,config/secrets,storage,backups}
    
    # Validate environment
    validate_environment
    
    # Install production dependencies
    install_production_dependencies
    
    # Create production environment configuration
    create_production_environment_config
    
    # Configure PostgreSQL for production
    configure_postgresql_production
    
    log_success "=========================================="
    log_success "PSDD ${PHASE_ID} Part 1 completed successfully!"
    log_success "Next: Execute d2h8-production-services-config.sh"
    log_success "=========================================="
    
    # Track phase completion
    track_progress "${PHASE_ID}" "PART1_COMPLETED" "Production infrastructure setup Part 1 completed - PostgreSQL configured"
}

# Execute main function with all arguments
main "$@"