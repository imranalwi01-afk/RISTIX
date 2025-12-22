#!/bin/bash
# scripts/setup/d3h1-ifrs9-data-models.sh
# DAY 3 HOUR 1: Basic IFRS 9 Data Models Setup

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d3h1-ifrs9-setup-$(date +%Y%m%d-%H%M%S).log"

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

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating environment for IFRS 9 data models setup..."
    
    # Check if project root exists
    if [[ ! -d "${PROJECT_ROOT}/packages" ]]; then
        log_error "Project structure not found. Run project setup first."
        exit 1
    fi
    
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
    
    # Check database connectivity
    if ! pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" > /dev/null 2>&1; then
        log_error "PostgreSQL database is not accessible"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Create IFRS 9 directory structure
create_ifrs9_structure() {
    log_info "Creating IFRS 9 directory structure..."
    
    # Backend IFRS 9 structure
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/models/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/database/models/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/utils/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/validators/ifrs9"
    
    # Shared IFRS 9 types
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/constants/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/utils/ifrs9"
    
    # Frontend IFRS 9 structure
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/ifrs9/calculations"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/ifrs9/upload"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/ifrs9/reporting"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/ifrs9/models"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/app/platform/ifrs9"
    
    # Configuration and templates
    mkdir -p "${PROJECT_ROOT}/config/ifrs9/models"
    mkdir -p "${PROJECT_ROOT}/config/ifrs9/parameters"
    mkdir -p "${PROJECT_ROOT}/config/ifrs9/templates"
    
    log_success "IFRS 9 directory structure created"
}

# Install IFRS 9 specific dependencies
install_ifrs9_dependencies() {
    log_info "Installing IFRS 9 specific dependencies..."
    
    cd "${PROJECT_ROOT}/packages/backend"
    
    # Add IFRS 9 calculation dependencies
    pnpm add multer xlsx node-cron decimal.js date-fns
    pnpm add -D @types/multer
    
    cd "${PROJECT_ROOT}/packages/frontend"
    
    # Add frontend calculation dependencies
    pnpm add recharts react-upload-gallery react-data-grid
    
    cd "${PROJECT_ROOT}/packages/shared"
    
    # Add shared calculation utilities
    pnpm add decimal.js date-fns zod
    
    log_success "IFRS 9 dependencies installed"
}

# Setup database tables for IFRS 9 (if needed)
setup_ifrs9_tables() {
    log_info "Setting up IFRS 9 database tables..."
    
    # Connect to the tenant database and verify IFRS 9 tables exist
    local db_name="${DB_NAME:-ifrspro_tenant_demo_conventional}"
    
    # Check if calculation schema exists
    if psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${db_name}" -c "\dn calculation" | grep -q calculation; then
        log_success "IFRS 9 calculation schema already exists"
    else
        log_error "IFRS 9 calculation schema not found. Please restore from backup files first."
        exit 1
    fi
    
    log_success "IFRS 9 database tables verified"
}

# Main function
main() {
    log_info "Starting DAY 3 HOUR 1: Basic IFRS 9 Data Models Setup..."
    
    # Load environment variables
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        set -a
        source "${PROJECT_ROOT}/.env"
        set +a
    fi
    
    # Execute setup steps
    validate_environment
    create_ifrs9_structure
    install_ifrs9_dependencies
    setup_ifrs9_tables
    
    log_success "==================================="
    log_success "DAY 3 HOUR 1 SETUP COMPLETED!"
    log_success "==================================="
    log_success "Next Steps:"
    log_success "1. Generate IFRS 9 service files"
    log_success "2. Implement ECL calculation logic"
    log_success "3. Create staging logic services"
    log_success "4. Setup Excel processing engine"
    log_success "==================================="
}

# Execute main function with all arguments
main "$@"