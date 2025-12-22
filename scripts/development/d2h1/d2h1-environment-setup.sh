#!/bin/bash
# DAY 2 HOUR 1: Environment Setup Helper
# Sets up environment variables and validates prerequisites

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

# Copy environment configuration if .env doesn't exist
setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [[ ! -f "${PROJECT_ROOT}/.env" ]]; then
        if [[ -f "${PROJECT_ROOT}/.env.platform" ]]; then
            cp "${PROJECT_ROOT}/.env.platform" "${PROJECT_ROOT}/.env"
            log_success "Environment configuration copied from .env.platform"
        else
            log_error ".env.platform file not found. Run code generation first."
            exit 1
        fi
    else
        log_info "Environment file already exists at ${PROJECT_ROOT}/.env"
    fi
}

# Validate prerequisites
validate_prerequisites() {
    log_info "Validating prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL client is not installed"
        exit 1
    fi
    
    # Check Redis (optional but recommended)
    if ! command -v redis-cli &> /dev/null; then
        log_info "Redis CLI not found (optional)"
    fi
    
    log_success "Prerequisites validation completed"
}

# Apply database migration
apply_database_migration() {
    log_info "Applying database migration..."
    
    local migration_file="${PROJECT_ROOT}/database/migrations/platform/001-platform-infrastructure.sql"
    
    if [[ -f "$migration_file" ]]; then
        # Source environment variables
        if [[ -f "${PROJECT_ROOT}/.env" ]]; then
            source "${PROJECT_ROOT}/.env"
        fi
        
        # Apply migration
        psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-ifrspro_platform_admin}" -f "$migration_file"
        log_success "Database migration applied successfully"
    else
        log_error "Migration file not found: $migration_file"
        exit 1
    fi
}

# Main function
main() {
    log_info "Starting DAY 2 HOUR 1: Environment Setup"
    
    validate_prerequisites
    setup_environment
    apply_database_migration
    
    log_success "Environment setup completed!"
    log_info "You can now run the platform infrastructure setup script"
}

main "$@"
