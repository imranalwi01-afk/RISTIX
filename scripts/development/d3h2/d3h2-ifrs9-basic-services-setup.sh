#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - DAY 3 HOUR 2 SETUP SCRIPT
# ============================================================================
# Script: d3h2-ifrs9-basic-services-setup.sh
# Phase: D3H2 - Basic IFRS 9 Services Implementation Setup
# Objective: Environment validation and preparation for IFRS 9 services
# Generated: $(date)
# Methodology: Phased Shell-Driven Development (PSDD)
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d3h2-setup-$(date +%Y%m%d-%H%M%S).log"

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
    log_error "Setup script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    log_error "Stack trace available in: ${LOG_FILE}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Phase identification
PHASE_ID="D3H2"
PHASE_NAME="Basic IFRS 9 Services Implementation"
PHASE_OBJECTIVE="Setup environment for IFRS 9 calculation services"

log_info "============================================================================"
log_info "PSDD METHODOLOGY - ${PHASE_ID}: ${PHASE_NAME}"
log_info "============================================================================"
log_info "Objective: ${PHASE_OBJECTIVE}"
log_info "Script: $(basename "$0")"
log_info "Project Root: ${PROJECT_ROOT}"
log_info "============================================================================"

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating PSDD environment for ${PHASE_ID}..."
    
    # Check project structure
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Invalid project root. package.json not found."
        exit 1
    fi
    
    # Validate required tools
    local required_tools=("node" "pnpm" "psql")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    # Load environment configuration
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment configuration loaded"
    else
        log_warning "No .env file found. Using defaults."
    fi
    
    # Check database connectivity
    if ! pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" &> /dev/null; then
        log_error "PostgreSQL database is not accessible"
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    
    if ! printf '%s\n%s\n' "${required_version}" "${node_version}" | sort -V -C; then
        log_error "Node.js version ${node_version} is below required ${required_version}"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# MANDATORY: Directory structure creation
create_directory_structure() {
    log_info "Creating directory structure for IFRS 9 services..."
    
    # Backend service directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/models/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/middleware/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/utils/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/database/migrations/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/database/seeders/ifrs9"
    
    # Shared types and utilities
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/constants/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/utils/ifrs9"
    
    # R analytics directories
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics/src/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics/src/ifrs9/models"
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics/src/ifrs9/scripts"
    
    # Logs and temporary directories
    mkdir -p "${PROJECT_ROOT}/logs/ifrs9"
    mkdir -p "${PROJECT_ROOT}/tmp/ifrs9"
    mkdir -p "${PROJECT_ROOT}/uploads/ifrs9"
    
    log_success "Directory structure created successfully"
}

# MANDATORY: Dependency validation
validate_dependencies() {
    log_info "Validating project dependencies..."
    
    # Check if node_modules exist
    if [[ ! -d "${PROJECT_ROOT}/node_modules" ]]; then
        log_warning "node_modules not found. Installing dependencies..."
        cd "${PROJECT_ROOT}"
        pnpm install
    fi
    
    # Check backend dependencies
    if [[ ! -d "${PROJECT_ROOT}/packages/backend/node_modules" ]]; then
        log_warning "Backend dependencies not found. Installing..."
        cd "${PROJECT_ROOT}/packages/backend"
        pnpm install
    fi
    
    # Check required packages
    local required_packages=("sequelize" "joi" "express" "winston")
    for package in "${required_packages[@]}"; do
        if ! pnpm list "$package" &> /dev/null; then
            log_warning "Required package $package may not be installed"
        fi
    done
    
    log_success "Dependencies validation completed"
}

# MANDATORY: Database validation
validate_database_setup() {
    log_info "Validating database setup for IFRS 9 services..."
    
    # Check platform admin database
    local platform_db="${DB_NAME:-ifrspro_platform_admin}"
    if ! psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -lqt | cut -d \| -f 1 | grep -qw "${platform_db}"; then
        log_error "Platform admin database '${platform_db}' not found"
        exit 1
    fi
    
    # Check shared services database
    local shared_db="${SHARED_DB_NAME:-ifrspro_shared_services}"
    if ! psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -lqt | cut -d \| -f 1 | grep -qw "${shared_db}"; then
        log_error "Shared services database '${shared_db}' not found"
        exit 1
    fi
    
    # Check if we have at least one tenant database
    local tenant_count=$(psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -lqt | cut -d \| -f 1 | grep -c "ifrspro_tenant_" || true)
    if [[ "$tenant_count" -eq 0 ]]; then
        log_warning "No tenant databases found. IFRS 9 services will need tenant setup."
    fi
    
    log_success "Database validation completed. Found ${tenant_count} tenant database(s)"
}

# MANDATORY: Configuration validation
validate_configuration() {
    log_info "Validating configuration for IFRS 9 services..."
    
    # Check required environment variables
    local required_vars=("NODE_ENV" "DB_HOST" "DB_PORT" "BACKEND_PORT")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Missing required environment variable: $var"
            exit 1
        fi
    done
    
    # Check IFRS 9 specific configuration
    local ifrs9_vars=("FEATURE_IFRS9_ENABLED" "FEATURE_ADVANCED_ANALYTICS")
    for var in "${ifrs9_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_warning "IFRS 9 feature variable not set: $var. Using default: true"
            export ${var}=true
        fi
    done
    
    log_success "Configuration validation completed"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# MANDATORY: Main function
main() {
    log_info "Starting PSDD ${PHASE_ID} setup..."
    
    # Track start
    track_progress "${PHASE_ID}" "SETUP_STARTED"
    
    # Execute setup steps
    validate_environment
    create_directory_structure
    validate_dependencies
    validate_database_setup
    validate_configuration
    
    # Track completion
    track_progress "${PHASE_ID}" "SETUP_COMPLETED"
    
    log_success "============================================================================"
    log_success "PSDD ${PHASE_ID} setup completed successfully!"
    log_success "============================================================================"
    log_success "Ready for IFRS 9 Basic Services implementation"
    log_success "Next step: Execute d3h2-ifrs9-basic-services-part1.sh"
    log_success "============================================================================"
}

# Execute main function
main "$@"