#!/bin/bash
# DAY 2 HOUR 1: Environment Setup Helper (Fixed Version)

set -e
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Apply database migration with proper environment handling
apply_database_migration() {
    log_info "Applying database migration..."
    
    local migration_file="${PROJECT_ROOT}/database/migrations/platform/001-platform-infrastructure.sql"
    
    if [[ -f "$migration_file" ]]; then
        # Extract database connection info directly from .env file (avoiding source issues)
        local db_host=$(grep "^DB_HOST=" "${PROJECT_ROOT}/.env" | cut -d'=' -f2 | tr -d '"' || echo "localhost")
        local db_port=$(grep "^DB_PORT=" "${PROJECT_ROOT}/.env" | cut -d'=' -f2 | tr -d '"' || echo "5432")
        local db_user=$(grep "^DB_USER=" "${PROJECT_ROOT}/.env" | cut -d'=' -f2 | tr -d '"' || echo "postgres")
        local db_name=$(grep "^DB_NAME=" "${PROJECT_ROOT}/.env" | cut -d'=' -f2 | tr -d '"' || echo "ifrspro_platform_admin")
        
        log_info "Connecting to database: ${db_host}:${db_port}/${db_name} as ${db_user}"
        
        # Test connection first
        if pg_isready -h "$db_host" -p "$db_port" -U "$db_user"; then
            log_info "Database connection successful"
            
            # Apply migration
            PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -f "$migration_file"
            log_success "Database migration applied successfully"
        else
            log_error "Cannot connect to database. Please check your database service and configuration."
            log_info "To start PostgreSQL: sudo systemctl start postgresql"
            exit 1
        fi
    else
        log_error "Migration file not found: $migration_file"
        exit 1
    fi
}

# Main function
main() {
    log_info "Starting DAY 2 HOUR 1: Environment Setup (Fixed Version)"
    
    # Apply database migration
    apply_database_migration
    
    log_success "Environment setup completed!"
    log_info "You can now run the platform infrastructure setup script"
}

main "$@"
