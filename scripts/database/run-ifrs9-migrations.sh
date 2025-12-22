#!/bin/bash
# scripts/database/run-ifrs9-migrations.sh
# IFRS 9 Database Migrations Runner

set -e
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/ifrs9-migrations-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Migration failed with exit code: ${exit_code}"
    exit ${exit_code}
}

trap handle_error ERR

# Load environment variables
load_environment() {
    log_info "Loading environment variables..."
    
    if [[ -f "${PROJECT_ROOT}/.env.development" ]]; then
        source "${PROJECT_ROOT}/.env.development"
    elif [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
    fi
    
    # Set defaults
    export DB_HOST=${DB_HOST:-"localhost"}
    export DB_PORT=${DB_PORT:-5432}
    export DB_USER=${DB_USER:-"postgres"}
    export DB_PASSWORD=${DB_PASSWORD:-"postgres"}
}

# Run migrations for specific tenant
run_tenant_migrations() {
    local tenant_id=$1
    local banking_type=$2
    
    log_info "Running IFRS 9 migrations for tenant: ${tenant_id} (${banking_type})"
    
    local tenant_db="ifrspro_tenant_${tenant_id}_${banking_type}"
    
    # Set environment for this tenant database
    export DB_NAME="${tenant_db}"
    
    # Run migrations
    cd "${PROJECT_ROOT}/packages/backend"
    
    # Run Sequelize migrations
    npx sequelize-cli db:migrate --env development
    
    log_success "Migrations completed for tenant: ${tenant_id}"
}

# Run migrations for all tenants
run_all_tenant_migrations() {
    log_info "Running IFRS 9 migrations for all tenant databases..."
    
    # Get list of tenants from platform admin database
    local tenants_query="SELECT tenant_slug, banking_type FROM platform_admin.tenants WHERE is_active = true;"
    
    export DB_NAME="ifrspro_platform_admin"
    
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "${tenants_query}" | \
    while IFS='|' read -r tenant_slug banking_type; do
        tenant_slug=$(echo "$tenant_slug" | xargs)  # Trim whitespace
        banking_type=$(echo "$banking_type" | xargs)
        
        if [[ -n "$tenant_slug" && -n "$banking_type" ]]; then
            run_tenant_migrations "$tenant_slug" "$banking_type"
        fi
    done
}

# Verify migrations
verify_migrations() {
    log_info "Verifying IFRS 9 migrations..."
    
    # Check if calculation tables exist in tenant databases
    local check_query="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'calculation' AND table_name = 'ecl_jobs';"
    
    export DB_NAME="ifrspro_tenant_demo_conventional"
    local table_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "${check_query}" | xargs)
    
    if [[ "$table_count" -eq "1" ]]; then
        log_success "IFRS 9 tables verified successfully"
    else
        log_error "IFRS 9 tables verification failed"
        exit 1
    fi
}

# Main function
main() {
    log_info "=== IFRS 9 Database Migrations Runner ==="
    
    # Load environment
    load_environment
    
    # Parse command line arguments
    local command=${1:-"all"}
    
    case $command in
        "all")
            run_all_tenant_migrations
            ;;
        "tenant")
            if [[ $# -lt 3 ]]; then
                log_error "Usage: $0 tenant <tenant_id> <banking_type>"
                exit 1
            fi
            run_tenant_migrations "$2" "$3"
            ;;
        "verify")
            verify_migrations
            ;;
        *)
            log_error "Unknown command: $command"
            log_error "Usage: $0 [all|tenant|verify] [tenant_id] [banking_type]"
            exit 1
            ;;
    esac
    
    log_success "=== IFRS 9 Database Migrations Completed ==="
}

# Execute main function
main "$@"
