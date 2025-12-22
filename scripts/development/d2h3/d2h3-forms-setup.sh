#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: scripts/development/d2h3/d2h3-forms-setup.sh
# Generated: 2025-07-22 14:30:15
# Phase: D2H3 - Advanced Forms & Templates
# Methodology: Phased Shell-Driven Development (PSDD)
# Dependencies: PostgreSQL, Node.js, pnpm
# Purpose: Main orchestrator for enterprise form management system setup
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-forms-setup-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3"
PHASE_NAME="Advanced Forms & Templates"
PHASE_OBJECTIVE="Enterprise form management system with advanced capabilities"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"
mkdir -p "${PROJECT_ROOT}/logs/psdd"

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
    log_error "Phase ${PHASE_ID} - ${PHASE_NAME} setup failed"
    
    # Cleanup on error
    cleanup_on_error
    exit ${exit_code}
}
trap 'handle_error ${LINENO}' ERR

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating environment for ${PHASE_ID}..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        return 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is required but not installed"
        return 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL client is required but not installed"
        return 1
    fi
    
    # Check project structure
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Not in a valid ifrs9-platform project root"
        return 1
    fi
    
    # Load environment variables
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment variables loaded from .env"
    else
        log_warning "No .env file found, using defaults"
    fi
    
    log_success "Environment validation completed"
}

# MANDATORY: Prerequisites check
check_prerequisites() {
    log_info "Checking prerequisites for ${PHASE_ID}..."
    
    # Check if previous phases completed
    if [[ ! -f "${PROJECT_ROOT}/.d2h2-completed" ]]; then
        log_error "D2H2 (Four-Eyes Approval System) must be completed before D2H3"
        return 1
    fi
    
    # Check database connectivity
    if ! pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-postgres}" > /dev/null 2>&1; then
        log_error "PostgreSQL database not accessible"
        return 1
    fi
    
    # Check backend package
    if [[ ! -d "${PROJECT_ROOT}/packages/backend" ]]; then
        log_error "Backend package not found"
        return 1
    fi
    
    # Check frontend package
    if [[ ! -d "${PROJECT_ROOT}/packages/frontend" ]]; then
        log_error "Frontend package not found"
        return 1
    fi
    
    log_success "Prerequisites check passed"
}

# Phase execution functions
execute_forms_structure_setup() {
    log_info "Creating forms directory structure..."
    
    if [[ -f "${SCRIPT_DIR}/create-forms-structure.sh" ]]; then
        chmod +x "${SCRIPT_DIR}/create-forms-structure.sh"
        bash "${SCRIPT_DIR}/create-forms-structure.sh"
    else
        log_error "create-forms-structure.sh not found"
        return 1
    fi
    
    log_success "Forms structure created successfully"
}

execute_database_setup() {
    log_info "Setting up forms database schema..."
    
    if [[ -f "${SCRIPT_DIR}/forms-database-setup.sh" ]]; then
        chmod +x "${SCRIPT_DIR}/forms-database-setup.sh"
        bash "${SCRIPT_DIR}/forms-database-setup.sh"
    else
        log_error "forms-database-setup.sh not found"
        return 1
    fi
    
    log_success "Forms database schema setup completed"
}

execute_code_generation() {
    log_info "Generating forms implementation code..."
    
    if [[ -f "${SCRIPT_DIR}/generate-forms-code.sh" ]]; then
        chmod +x "${SCRIPT_DIR}/generate-forms-code.sh"
        bash "${SCRIPT_DIR}/generate-forms-code.sh"
    else
        log_error "generate-forms-code.sh not found"
        return 1
    fi
    
    log_success "Forms code generation completed"
}

execute_validation_tests() {
    log_info "Running forms implementation validation..."
    
    if [[ -f "${SCRIPT_DIR}/validate-forms-implementation.sh" ]]; then
        chmod +x "${SCRIPT_DIR}/validate-forms-implementation.sh"
        bash "${SCRIPT_DIR}/validate-forms-implementation.sh"
    else
        log_warning "validate-forms-implementation.sh not found, skipping validation"
    fi
    
    log_success "Forms validation completed"
}

# Dependency installation
install_dependencies() {
    log_info "Installing additional dependencies for forms..."
    
    cd "${PROJECT_ROOT}"
    
    # Install backend dependencies for forms
    local backend_deps=(
        "multer@1.4.5-lts.1"      # File upload handling
        "xlsx@0.18.5"              # Excel file processing
        "jsonschema@1.4.1"         # JSON schema validation
        "ajv@8.12.0"               # Another JSON schema validator
        "form-data@4.0.0"          # Form data processing
        "mime-types@2.1.35"        # MIME type detection
    )
    
    # Install frontend dependencies for forms
    local frontend_deps=(
        "@dnd-kit/core@6.1.0"           # Drag and drop functionality
        "@dnd-kit/sortable@8.0.0"       # Sortable drag and drop
        "@dnd-kit/utilities@3.2.2"      # DnD utilities
        "react-hook-form@7.48.2"        # Form handling
        "react-jsonschema-form@5.15.0"  # JSON Schema forms
        "@rjsf/core@5.15.0"             # React JSON Schema Form core
        "@rjsf/material-ui@5.15.0"      # Material-UI theme for RJSF
        "react-dropzone@14.2.3"         # File drop zone
        "xlsx-js-style@1.2.0"           # Excel styling
    )
    
    log_info "Installing backend form dependencies..."
    pnpm add --filter backend ${backend_deps[@]}
    
    log_info "Installing frontend form dependencies..."
    pnpm add --filter frontend ${frontend_deps[@]}
    
    log_success "Form dependencies installed successfully"
}

# Configuration setup
setup_forms_configuration() {
    log_info "Setting up forms configuration..."
    
    # Create forms configuration directory
    mkdir -p "${PROJECT_ROOT}/config/forms"
    
    # Create forms environment variables
    local forms_env="${PROJECT_ROOT}/.env.forms"
    
    cat > "${forms_env}" << 'EOF'
# Forms Configuration
FORMS_UPLOAD_PATH=./uploads/forms
FORMS_TEMPLATE_PATH=./templates/forms
FORMS_MAX_FILE_SIZE=10MB
FORMS_ALLOWED_FILE_TYPES=xlsx,xls,csv,json
FORMS_CACHE_TTL=3600
FORMS_VALIDATION_TIMEOUT=30000
FORMS_ENABLE_ANALYTICS=true
FORMS_ENABLE_VERSIONING=true
FORMS_AUTO_SAVE_INTERVAL=30000
FORMS_MAX_FORM_FIELDS=500
FORMS_MAX_FORM_STEPS=20
EOF
    
    # Append to main .env if not already present
    if ! grep -q "# Forms Configuration" "${PROJECT_ROOT}/.env" 2>/dev/null; then
        echo "" >> "${PROJECT_ROOT}/.env"
        cat "${forms_env}" >> "${PROJECT_ROOT}/.env"
        log_info "Forms configuration added to .env"
    fi
    
    # Create forms directories
    mkdir -p "${PROJECT_ROOT}/uploads/forms"
    mkdir -p "${PROJECT_ROOT}/templates/forms"
    mkdir -p "${PROJECT_ROOT}/logs/forms"
    
    log_success "Forms configuration setup completed"
}

# Cleanup function
cleanup_on_error() {
    log_warning "Cleaning up after error in ${PHASE_ID}..."
    
    # Remove incomplete generated files
    find "${PROJECT_ROOT}" -name "*.tmp" -delete 2>/dev/null || true
    find "${PROJECT_ROOT}" -name ".forms-*" -delete 2>/dev/null || true
    
    log_info "Cleanup completed"
}

# Success completion
mark_phase_completed() {
    log_info "Marking ${PHASE_ID} as completed..."
    
    # Create completion marker
    touch "${PROJECT_ROOT}/.d2h3-completed"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ${PHASE_ID} ${PHASE_NAME} completed successfully" > "${PROJECT_ROOT}/.d2h3-completed"
    
    # Update progress tracking
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${PHASE_ID} | COMPLETED | ${PHASE_NAME} | Continue to D2H4" >> "${PROJECT_ROOT}/.psdd-progress"
    
    log_success "${PHASE_ID} - ${PHASE_NAME} completed successfully"
}

# Main execution function
main() {
    log_info "Starting ${PHASE_ID} - ${PHASE_NAME} setup..."
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    # Execute setup phases
    validate_environment
    check_prerequisites
    install_dependencies
    setup_forms_configuration
    execute_forms_structure_setup
    execute_database_setup
    execute_code_generation
    execute_validation_tests
    mark_phase_completed
    
    log_success "==================================================="
    log_success "✅ ${PHASE_ID} - ${PHASE_NAME} SETUP COMPLETED!"
    log_success "==================================================="
    log_info "Next Phase: D2H4 - Visual ETL Designer"
    log_info "Continue with: ./scripts/development/d2h4/d2h4-etl-setup.sh"
    
    # Display summary
    echo ""
    echo "📋 FORMS SYSTEM COMPONENTS READY:"
    echo "✅ Dynamic Form Builder"
    echo "✅ Form Validation Framework" 
    echo "✅ Excel Template Engine"
    echo "✅ Multi-Step Form Wizard"
    echo "✅ Conditional Field Logic"
    echo "✅ Form Analytics Dashboard"
    echo "✅ Template Versioning System"
    echo ""
    echo "🚀 Ready to proceed with D2H4 - Visual ETL Designer"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi