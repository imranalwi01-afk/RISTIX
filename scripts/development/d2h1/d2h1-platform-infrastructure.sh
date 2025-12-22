#!/bin/bash
# DAY 2 HOUR 1: Platform Infrastructure & Base Configuration
# Target: Advanced platform services and infrastructure components

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h1-platform-infrastructure-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
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

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Environment validation
validate_environment() {
    log_info "Validating environment for DAY 2 HOUR 1..."
    
    # Check if DAY 1 was completed
    if [[ ! -f "${PROJECT_ROOT}/.day1-completed" ]]; then
        log_error "DAY 1 must be completed before running DAY 2 HOUR 1"
        exit 1
    fi
    
    # Validate PostgreSQL connection
    if ! pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}"; then
        log_error "PostgreSQL database is not accessible"
        exit 1
    fi
    
    # Check Redis availability
    if ! redis-cli ping > /dev/null 2>&1; then
        log_error "Redis is not accessible. Please start Redis service."
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Create platform infrastructure directories
create_infrastructure_directories() {
    log_info "Creating platform infrastructure directories..."
    
    # Backend infrastructure directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/infrastructure"/{cache,monitoring,fileprocessing,configuration,workflows,audit}
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services"/{config,workflow,audit,etl,monitoring}
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/repositories"/{config,workflow,audit}
    
    # Configuration directories
    mkdir -p "${PROJECT_ROOT}/config"/{environments,banking,workflows,monitoring}
    
    # Data processing directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/etl"/{processors,validators,transformers}
    
    # Monitoring and logs
    mkdir -p "${PROJECT_ROOT}/logs"/{audit,workflow,etl,performance}
    mkdir -p "${PROJECT_ROOT}/monitoring"/{dashboards,alerts,metrics}
    
    log_success "Infrastructure directories created"
}

# Main execution function
main() {
    log_info "Starting DAY 2 HOUR 1: Platform Infrastructure & Base Configuration"
    
    # Create log entry marker
    echo "DAY 2 HOUR 1 - Platform Infrastructure Started" > "${PROJECT_ROOT}/.d2h1-started"
    
    # Validate environment
    validate_environment
    
    # Create infrastructure directories
    create_infrastructure_directories
    
    # Create completion marker
    echo "DAY 2 HOUR 1 - Platform Infrastructure Completed at $(date)" > "${PROJECT_ROOT}/.d2h1-completed"
    
    log_success "DAY 2 HOUR 1 completed successfully!"
    log_info "Next step: Run DAY 2 HOUR 2 - Four-Eyes Approval System"
    log_info "Command: ./scripts/development/d2h2-approval-system.sh"
}

# Execute main function with all arguments
main "$@"
