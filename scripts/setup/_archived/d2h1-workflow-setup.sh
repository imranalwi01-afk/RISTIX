#!/bin/bash
# ./scripts/setup/d2h1-workflow-setup.sh
# Day 2 Hour 1: Master Workflow Engine Setup
# 🎯 OBJECTIVE: Enterprise workflow automation

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h1-workflow-$(date +%Y%m%d-%H%M%S).log"

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

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating environment for workflow engine setup..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed. Install with: npm install -g pnpm"
        exit 1
    fi
    
    # Check PostgreSQL connectivity
    if ! pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}"; then
        log_error "PostgreSQL database is not accessible"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Create workflow directory structure
create_workflow_directories() {
    log_info "Creating workflow engine directory structure..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/workflow"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/workflow"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/workflow"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/middleware/workflow"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/workflow"
    mkdir -p "${PROJECT_ROOT}/database/migrations/workflow"
    mkdir -p "${PROJECT_ROOT}/logs"
    
    log_success "Workflow directories created"
}

# Generate workflow engine files
generate_workflow_files() {
    log_info "Generating workflow engine files..."
    
    # Execute file generation script
    "${SCRIPT_DIR}/d2h1-generate-workflow-files.sh"
    
    log_success "Workflow files generated"
}

# Setup workflow database
setup_workflow_database() {
    log_info "Setting up workflow database schema..."
    
    # Execute workflow migration script
    "${SCRIPT_DIR}/d2h1-workflow-migration.sh"
    
    log_success "Workflow database setup completed"
}

# Install workflow dependencies
install_workflow_dependencies() {
    log_info "Installing workflow engine dependencies..."
    
    cd "${PROJECT_ROOT}"
    
    # Install workflow-specific packages
    pnpm add --filter=backend bull bull-board cron node-cron
    pnpm add --filter=backend @types/bull @types/cron @types/node-cron --save-dev
    
    log_success "Workflow dependencies installed"
}

# Verify workflow setup
verify_workflow_setup() {
    log_info "Verifying workflow engine setup..."
    
    # Check if workflow service files exist
    local workflow_service="${PROJECT_ROOT}/packages/backend/src/core/services/workflow/workflow-engine.service.ts"
    if [[ ! -f "${workflow_service}" ]]; then
        log_error "Workflow service file not found: ${workflow_service}"
        exit 1
    fi
    
    # Check database tables
    local db_name="${DB_NAME:-ifrspro_platform_admin}"
    local table_exists=$(psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${db_name}" -t -c \
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'workflow' AND table_name = 'approval_tasks');")
    
    if [[ "${table_exists// /}" != "t" ]]; then
        log_error "Workflow tables not found in database"
        exit 1
    fi
    
    log_success "Workflow engine setup verified"
}

# Main function
main() {
    log_info "Starting Day 2 Hour 1: Master Workflow Engine Setup..."
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}/logs"
    
    # Validate environment
    validate_environment
    
    # Create directory structure
    create_workflow_directories
    
    # Generate workflow files
    generate_workflow_files
    
    # Setup database
    setup_workflow_database
    
    # Install dependencies
    install_workflow_dependencies
    
    # Verify setup
    verify_workflow_setup
    
    log_success "Day 2 Hour 1: Master Workflow Engine setup completed successfully!"
    log_info "Next: Run ./scripts/setup/d2h2-approval-system-setup.sh for Hour 2"
}

# Execute main function with all arguments
main "$@"