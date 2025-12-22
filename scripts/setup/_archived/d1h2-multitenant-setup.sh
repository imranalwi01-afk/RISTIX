# platform/scripts/setup/d1h2-multitenant-setup.sh
#!/bin/bash
# IFRS 9 Platform - Day 1 Hour 2: Advanced Multi-Tenant Architecture Setup
# 🎯 OBJECTIVE: Advanced multi-tenant architecture with database-per-tenant

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/setup-d1h2-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Create logs directory if it doesn't exist
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
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    log_error "Line number: ${LINENO}"
    exit ${exit_code}
}

trap handle_error ERR

# Load environment variables
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    source "${PROJECT_ROOT}/.env"
fi

# Database configuration with fallbacks
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_ADMIN_NAME="${DB_ADMIN_NAME:-ifrspro_platform_admin}"
DB_SHARED_NAME="${DB_SHARED_NAME:-ifrspro_shared_services}"

# MANDATORY: Environment validation
validate_environment() {
    log_info "🔍 Validating environment for multi-tenant setup..."
    
    # Check PostgreSQL connectivity
    if ! pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" &>/dev/null; then
        log_error "PostgreSQL database is not accessible at ${DB_HOST}:${DB_PORT}"
        log_error "Please ensure PostgreSQL is running and credentials are correct"
        exit 1
    fi
    
    # Check if we can connect with credentials
    export PGPASSWORD="${DB_PASSWORD}"
    if ! psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "SELECT 1;" &>/dev/null; then
        log_error "Cannot connect to PostgreSQL with provided credentials"
        exit 1
    fi
    
    # Check for required backup files
    local backup_dir="${PROJECT_ROOT}/database/backups"
    if [[ ! -d "${backup_dir}" ]]; then
        log_warning "Backup directory not found, creating: ${backup_dir}"
        mkdir -p "${backup_dir}"
    fi
    
    # Validate backup files exist (if they should)
    local platform_backup="${backup_dir}/ifrspro_platform_admin_backup.sql"
    local shared_backup="${backup_dir}/ifrspro_shared_services_backup.sql"
    local conventional_backup="${backup_dir}/ifrspro_tenant_demo_conventional_backup.sql"
    local syariah_backup="${backup_dir}/ifrspro_tenant_demo_syariah_backup.sql"
    
    log_info "📋 Checking backup files availability..."
    for backup_file in "${platform_backup}" "${shared_backup}" "${conventional_backup}" "${syariah_backup}"; do
        if [[ -f "${backup_file}" ]]; then
            log_info "✅ Found: $(basename "${backup_file}")"
        else
            log_warning "⚠️  Not found: $(basename "${backup_file}") - will create from scratch"
        fi
    done
    
    log_success "Environment validation completed"
}

# MANDATORY: Database creation function
create_database_if_not_exists() {
    local db_name=$1
    local description=$2
    
    log_info "🗄️  Checking database: ${db_name}"
    
    # Check if database exists
    local db_exists=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -tAc \
        "SELECT 1 FROM pg_database WHERE datname='${db_name}';")
    
    if [[ "${db_exists}" == "1" ]]; then
        log_info "Database ${db_name} already exists"
        return 0
    fi
    
    log_info "Creating database: ${db_name} (${description})"
    createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${db_name}"
    
    # Set database owner and encoding
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres << EOF
ALTER DATABASE "${db_name}" OWNER TO ${DB_USER};
COMMENT ON DATABASE "${db_name}" IS '${description}';
EOF
    
    log_success "Created database: ${db_name}"
}

# MANDATORY: Apply backup schema function
apply_backup_schema() {
    local db_name=$1
    local backup_file=$2
    local description=$3
    
    if [[ ! -f "${backup_file}" ]]; then
        log_warning "Backup file not found: ${backup_file} - skipping schema application for ${db_name}"
        return 0
    fi
    
    log_info "📥 Applying schema from backup: $(basename "${backup_file}") to ${db_name}"
    
    # Apply backup with error handling
    if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${db_name}" -f "${backup_file}" &>/dev/null; then
        log_success "Schema applied successfully to ${db_name}"
    else
        log_error "Failed to apply schema to ${db_name}"
        return 1
    fi
}

# MANDATORY: Setup platform admin database
setup_platform_admin_database() {
    log_info "🏛️  Setting up Platform Admin Database..."
    
    create_database_if_not_exists "${DB_ADMIN_NAME}" "IFRS9 Platform Administration Database"
    
    local backup_file="${PROJECT_ROOT}/database/backups/ifrspro_platform_admin_backup.sql"
    apply_backup_schema "${DB_ADMIN_NAME}" "${backup_file}" "Platform Admin"
    
    # Enable required extensions
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_ADMIN_NAME}" << 'EOF'
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create function for tenant database provisioning
CREATE OR REPLACE FUNCTION provision_tenant_database(
    p_tenant_name VARCHAR(100),
    p_banking_type VARCHAR(20),
    p_org_name VARCHAR(255) DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    tenant_record RECORD;
    db_name VARCHAR(100);
    tenant_id UUID;
BEGIN
    -- Generate tenant ID
    tenant_id := uuid_generate_v4();
    
    -- Generate database name
    db_name := 'ifrspro_tenant_' || lower(replace(p_tenant_name, ' ', '_')) || '_' || p_banking_type;
    
    -- Insert tenant record
    INSERT INTO platform_admin.tenants (
        id, tenant_name, tenant_slug, display_name, organization_name,
        banking_type, database_name, database_host, database_port,
        status, subscription_tier, features_enabled, created_at, created_by
    ) VALUES (
        tenant_id,
        p_tenant_name,
        lower(replace(p_tenant_name, ' ', '')),
        COALESCE(p_org_name, p_tenant_name || ' Banking'),
        COALESCE(p_org_name, p_tenant_name || ' Organization'),
        p_banking_type,
        db_name,
        'localhost',
        5432,
        'provisioning',
        'basic',
        CASE 
            WHEN p_banking_type = 'syariah' THEN 
                '{"dashboard": true, "api_access": true, "audit_trail": true, "basic_reports": true, "stress_testing": true, "islamic_banking": true, "ecl_calculations": true, "advanced_analytics": true, "syariah_compliance": true, "workflow_management": true}'::jsonb
            ELSE
                '{"dashboard": true, "basic_reports": true, "ecl_calculations": true}'::jsonb
        END,
        NOW(),
        'system'
    );
    
    -- Return tenant information
    SELECT INTO tenant_record 
        id, tenant_name, database_name, banking_type, status
    FROM platform_admin.tenants 
    WHERE id = tenant_id;
    
    RETURN json_build_object(
        'tenant_id', tenant_record.id,
        'tenant_name', tenant_record.tenant_name,
        'database_name', tenant_record.database_name,
        'banking_type', tenant_record.banking_type,
        'status', tenant_record.status
    );
END;
$$ LANGUAGE plpgsql;
EOF
    
    log_success "Platform Admin Database setup completed"
}

# MANDATORY: Setup shared services database
setup_shared_services_database() {
    log_info "🔧 Setting up Shared Services Database..."
    
    create_database_if_not_exists "${DB_SHARED_NAME}" "IFRS9 Shared Services and Reference Data"
    
    local backup_file="${PROJECT_ROOT}/database/backups/ifrspro_shared_services_backup.sql"
    apply_backup_schema "${DB_SHARED_NAME}" "${backup_file}" "Shared Services"
    
    # Enable required extensions for shared services
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_SHARED_NAME}" << 'EOF'
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create shared calculation functions
CREATE OR REPLACE FUNCTION calculate_ecl_basic(
    outstanding_amount NUMERIC,
    pd_rate NUMERIC,
    lgd_rate NUMERIC,
    ead_amount NUMERIC DEFAULT NULL
) RETURNS NUMERIC AS $$
BEGIN
    -- Basic ECL calculation: ECL = EAD × PD × LGD
    RETURN COALESCE(ead_amount, outstanding_amount) * pd_rate * lgd_rate;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create staging determination function
CREATE OR REPLACE FUNCTION determine_ifrs9_stage(
    days_past_due INTEGER,
    credit_rating_change NUMERIC DEFAULT 0,
    lifetime_pd_increase_pct NUMERIC DEFAULT 0
) RETURNS INTEGER AS $$
BEGIN
    -- Stage 3: Credit-impaired (>90 days past due)
    IF days_past_due > 90 THEN
        RETURN 3;
    END IF;
    
    -- Stage 2: Significant increase in credit risk
    IF days_past_due > 30 OR lifetime_pd_increase_pct > 5.0 OR credit_rating_change > 2 THEN
        RETURN 2;
    END IF;
    
    -- Stage 1: Performing (default)
    RETURN 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
EOF
    
    log_success "Shared Services Database setup completed"
}

# MANDATORY: Setup tenant database function
setup_tenant_database() {
    local tenant_name=$1
    local banking_type=$2
    local backup_file=$3
    local description=$4
    
    log_info "🏦 Setting up ${description} Tenant Database: ${tenant_name}"
    
    local db_name="ifrspro_tenant_${tenant_name}_${banking_type}"
    
    # Create database
    create_database_if_not_exists "${db_name}" "${description} - ${tenant_name}"
    
    # Apply backup schema
    apply_backup_schema "${db_name}" "${backup_file}" "${description}"
    
    # Enable extensions and create tenant-specific functions
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${db_name}" << 'EOF'
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit log function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.audit_log (
            table_name, action, new_values, created_at, created_by
        ) VALUES (
            TG_TABLE_NAME, TG_OP, to_jsonb(NEW), NOW(), COALESCE(NEW.created_by, NEW.updated_by, 'system')
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.audit_log (
            table_name, action, old_values, new_values, created_at, created_by
        ) VALUES (
            TG_TABLE_NAME, TG_OP, to_jsonb(OLD), to_jsonb(NEW), NOW(), COALESCE(NEW.updated_by, 'system')
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.audit_log (
            table_name, action, old_values, created_at, created_by
        ) VALUES (
            TG_TABLE_NAME, TG_OP, to_jsonb(OLD), NOW(), 'system'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
EOF
    
    # Register tenant in platform admin
    log_info "📝 Registering tenant in platform admin..."
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_ADMIN_NAME}" << EOF
-- Register tenant if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM platform_admin.tenants 
        WHERE database_name = '${db_name}'
    ) THEN
        PERFORM provision_tenant_database('${tenant_name}', '${banking_type}', '${description} Organization');
    END IF;
END\$\$;
EOF
    
    log_success "${description} tenant setup completed: ${db_name}"
}

# MANDATORY: Create tenant isolation middleware function
create_tenant_isolation() {
    log_info "🔒 Setting up tenant isolation mechanisms..."
    
    # Create tenant context schema in each database
    for db_name in "${DB_ADMIN_NAME}" "${DB_SHARED_NAME}"; do
        psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${db_name}" << 'EOF'
-- Create tenant context function
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- Set tenant context for row-level security
    PERFORM set_config('app.current_tenant_id', tenant_id_param::text, true);
END;
$$ LANGUAGE plpgsql;

-- Create tenant context retrieval function
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(current_setting('app.current_tenant_id', true)::UUID, '00000000-0000-0000-0000-000000000000'::UUID);
END;
$$ LANGUAGE plpgsql;
EOF
    done
    
    log_success "Tenant isolation mechanisms created"
}

# MANDATORY: Setup database monitoring
setup_database_monitoring() {
    log_info "📊 Setting up database monitoring..."
    
    # Create monitoring schema in platform admin
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_ADMIN_NAME}" << 'EOF'
-- Create monitoring views
CREATE OR REPLACE VIEW monitoring.tenant_database_health AS
SELECT 
    t.id as tenant_id,
    t.tenant_name,
    t.database_name,
    t.status,
    pg_size_pretty(pg_database_size(t.database_name)) as database_size,
    (SELECT count(*) FROM pg_stat_activity WHERE datname = t.database_name) as active_connections,
    t.created_at,
    t.updated_at
FROM platform_admin.tenants t
WHERE t.status = 'active';

-- Create health check function
CREATE OR REPLACE FUNCTION check_tenant_database_health(tenant_id_param UUID)
RETURNS JSON AS $$
DECLARE
    tenant_info RECORD;
    health_result JSON;
BEGIN
    SELECT INTO tenant_info
        tenant_name, database_name, status
    FROM platform_admin.tenants
    WHERE id = tenant_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Tenant not found');
    END IF;
    
    -- Basic health check
    health_result := json_build_object(
        'tenant_id', tenant_id_param,
        'tenant_name', tenant_info.tenant_name,
        'database_name', tenant_info.database_name,
        'status', tenant_info.status,
        'checked_at', NOW()
    );
    
    RETURN health_result;
END;
$$ LANGUAGE plpgsql;
EOF
    
    log_success "Database monitoring setup completed"
}

# MANDATORY: Verify multi-tenant setup
verify_setup() {
    log_info "🔍 Verifying multi-tenant setup..."
    
    # Check database connectivity
    log_info "Testing database connections..."
    
    local databases=("${DB_ADMIN_NAME}" "${DB_SHARED_NAME}")
    
    # Add tenant databases if they exist
    for tenant_db in "ifrspro_tenant_demo_conventional" "ifrspro_tenant_demo_syariah"; do
        if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -tAc \
           "SELECT 1 FROM pg_database WHERE datname='${tenant_db}';" | grep -q 1; then
            databases+=("${tenant_db}")
        fi
    done
    
    for db in "${databases[@]}"; do
        if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${db}" -c "SELECT 1;" &>/dev/null; then
            log_success "✅ Database connection test passed: ${db}"
        else
            log_error "❌ Database connection test failed: ${db}"
            return 1
        fi
    done
    
    # Test tenant functions
    log_info "Testing tenant management functions..."
    local test_result=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_ADMIN_NAME}" -tAc \
        "SELECT count(*) FROM platform_admin.tenants WHERE status IN ('active', 'provisioning');")
    
    log_info "Found ${test_result} tenants in the system"
    
    log_success "Multi-tenant setup verification completed"
}

# MANDATORY: Generate environment configuration
generate_tenant_env_config() {
    log_info "📝 Generating tenant environment configuration..."
    
    local env_config_file="${PROJECT_ROOT}/config/tenant-databases.env"
    mkdir -p "$(dirname "${env_config_file}")"
    
    cat > "${env_config_file}" << EOF
# IFRS9 Platform - Tenant Database Configuration
# Generated: $(date)

# Platform Databases
PLATFORM_ADMIN_DB_NAME=${DB_ADMIN_NAME}
SHARED_SERVICES_DB_NAME=${DB_SHARED_NAME}

# Database Connection
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USER=${DB_USER}
DB_SSL=false

# Multi-Tenant Configuration
TENANT_ISOLATION_ENABLED=true
TENANT_DB_PREFIX=ifrspro_tenant_
MAX_TENANT_CONNECTIONS=50
TENANT_CONNECTION_TIMEOUT=300000

# Database Pool Configuration
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_ACQUIRE_TIMEOUT=60000
DB_POOL_IDLE_TIMEOUT=10000

# Multi-Tenant Features
MULTI_TENANT_MODE=database_per_tenant
TENANT_CONTEXT_REQUIRED=true
CROSS_TENANT_ACCESS_DENIED=true

# Monitoring
DB_MONITORING_ENABLED=true
DB_HEALTH_CHECK_INTERVAL=300
DB_PERFORMANCE_LOGGING=true
EOF
    
    log_success "Tenant environment configuration created: ${env_config_file}"
}

# MANDATORY: Main function
main() {
    log_info "🚀 Starting IFRS9 Platform - Day 1 Hour 2: Advanced Multi-Tenant Architecture Setup"
    log_info "🕐 Execution started at: $(date)"
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,tmp,uploads,config}
    mkdir -p "${PROJECT_ROOT}/database/backups"
    
    # Execute setup steps
    validate_environment
    setup_platform_admin_database
    setup_shared_services_database
    
    # Setup demo tenant databases if backup files exist
    local conventional_backup="${PROJECT_ROOT}/database/backups/ifrspro_tenant_demo_conventional_backup.sql"
    local syariah_backup="${PROJECT_ROOT}/database/backups/ifrspro_tenant_demo_syariah_backup.sql"
    
    if [[ -f "${conventional_backup}" ]]; then
        setup_tenant_database "demo" "conventional" "${conventional_backup}" "Demo Conventional Banking"
    else
        log_warning "Conventional banking backup not found - skipping demo conventional tenant"
    fi
    
    if [[ -f "${syariah_backup}" ]]; then
        setup_tenant_database "demo" "syariah" "${syariah_backup}" "Demo Islamic Banking"
    else
        log_warning "Syariah banking backup not found - skipping demo syariah tenant"
    fi
    
    # Setup isolation and monitoring
    create_tenant_isolation
    setup_database_monitoring
    generate_tenant_env_config
    
    # Verify setup
    verify_setup
    
    log_success "🎉 IFRS9 Platform Multi-Tenant Architecture Setup Completed Successfully!"
    log_info "📝 Setup log saved to: ${LOG_FILE}"
    log_info "🔧 Configuration saved to: ${PROJECT_ROOT}/config/tenant-databases.env"
    log_info "🔄 Next: Execute './scripts/setup/d1h3-auth-setup.sh' for Authentication & Authorization System"
    log_info "🕐 Execution completed at: $(date)"
}

# Execute main function with all arguments
main "$@"