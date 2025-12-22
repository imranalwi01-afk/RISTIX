#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - PHASE 1A SETUP SCRIPT (PART 1 OF 5)
# ============================================================================
# File Path: ./scripts/setup/d2h3-forms-templates-setup-part1of5.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H3 - Advanced Forms & Templates Foundation
# Methodology: Phased Shell-Driven Development (PSDD) v2.0
# Objective: Environment setup and validation for advanced forms system
# Dependencies: PostgreSQL, Node.js 18+, pnpm, Redis
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-forms-templates-part1-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3P1"
PHASE_NAME="Advanced Forms & Templates Foundation - Part 1"
PHASE_OBJECTIVE="Environment validation and project structure setup"

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
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating PSDD environment for ${PHASE_ID}..."
    
    # Check project structure
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Invalid project root. package.json not found."
        exit 1
    fi
    
    # Validate required tools
    local required_tools=("node" "pnpm" "psql" "redis-cli")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    
    if ! printf '%s\n%s\n' "${required_version}" "${node_version}" | sort -V -C; then
        log_error "Node.js version ${node_version} is below required ${required_version}"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# MANDATORY: Load configuration
load_configuration() {
    log_info "Loading environment configuration..."
    
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment configuration loaded from .env"
    else
        log_warning "No .env file found. Using defaults."
        # Set default values
        export NODE_ENV=${NODE_ENV:-development}
        export DB_HOST=${DB_HOST:-localhost}
        export DB_PORT=${DB_PORT:-5432}
        export DB_USER=${DB_USER:-postgres}
        export DB_PASSWORD=${DB_PASSWORD:-postgres}
        export BACKEND_PORT=${BACKEND_PORT:-4232}
        export FRONTEND_PORT=${FRONTEND_PORT:-4231}
    fi
    
    log_info "Configuration loaded: NODE_ENV=${NODE_ENV}, DB_HOST=${DB_HOST}:${DB_PORT}"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# MANDATORY: Directory structure creation
create_project_directories() {
    log_info "Creating project directory structure for ${PHASE_ID}..."
    
    local directories=(
        "packages/backend/src/modules/forms"
        "packages/backend/src/modules/forms/services"
        "packages/backend/src/modules/forms/controllers"
        "packages/backend/src/modules/forms/models"
        "packages/backend/src/modules/forms/routes"
        "packages/backend/src/modules/forms/middleware"
        "packages/backend/src/modules/forms/validators"
        "packages/backend/src/modules/templates"
        "packages/backend/src/modules/templates/services"
        "packages/backend/src/modules/templates/controllers"
        "packages/backend/src/modules/templates/models"
        "packages/frontend/src/components/forms"
        "packages/frontend/src/components/forms/builder"
        "packages/frontend/src/components/forms/renderer"
        "packages/frontend/src/components/templates"
        "packages/frontend/src/services/forms"
        "packages/frontend/src/services/templates"
        "packages/frontend/src/hooks/forms"
        "scripts/forms"
        "scripts/templates"
        "config/forms"
        "config/templates"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "${PROJECT_ROOT}/${dir}"
        log_info "Created directory: ${dir}"
    done
    
    log_success "Project directory structure created"
}

# Main execution
main() {
    log_info "Starting ${PHASE_ID}: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    validate_environment
    load_configuration
    create_project_directories
    track_progress "${PHASE_ID}" "PART_1_COMPLETED"
    
    log_success "${PHASE_ID} Part 1 completed successfully!"
    log_info "Next: Run d2h3-forms-templates-setup-part2of5.sh"
    
    # Auto-continue to next part
    if [[ -f "${SCRIPT_DIR}/d2h3-forms-templates-setup-part2of5.sh" ]]; then
        log_info "Auto-continuing to Part 2..."
        "${SCRIPT_DIR}/d2h3-forms-templates-setup-part2of5.sh"
    else
        log_warning "Part 2 script not found. Manual execution required."
    fi
}

# Execute main function
main "$@"