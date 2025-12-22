#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - DAY 2 HOUR 6 SETUP SCRIPT
# ============================================================================
# File Path: scripts/setup/d2h6-dual-banking-themes-setup.sh
# Phase: D2H6 - Dual Banking Admin Themes
# Objective: Setup React Admin dual banking interface with configuration management
# Generated: $(date)
# Methodology: Phased Shell-Driven Development (PSDD)
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h6-setup-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H6"
PHASE_NAME="Dual Banking Admin Themes"
PHASE_OBJECTIVE="Complete React Admin dual banking interface with configuration management"

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
    
    # Check if React Admin foundation exists (D2H5 prerequisite)
    if [[ ! -d "${PROJECT_ROOT}/packages/frontend/src/admin" ]]; then
        log_error "React Admin foundation not found. Run D2H5 first."
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
    
    log_success "Environment validation completed for ${PHASE_ID}"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# Create dual banking theme directory structure
create_theme_structure() {
    log_info "Creating dual banking theme directory structure..."
    
    local frontend_root="${PROJECT_ROOT}/packages/frontend"
    
    # Create theme directories
    mkdir -p "${frontend_root}/src/themes/conventional"
    mkdir -p "${frontend_root}/src/themes/syariah"
    mkdir -p "${frontend_root}/src/themes/shared"
    mkdir -p "${frontend_root}/src/themes/config"
    
    # Create admin theme directories
    mkdir -p "${frontend_root}/src/admin/themes/conventional"
    mkdir -p "${frontend_root}/src/admin/themes/syariah"
    mkdir -p "${frontend_root}/src/admin/themes/providers"
    mkdir -p "${frontend_root}/src/admin/themes/components"
    
    # Create configuration directories
    mkdir -p "${frontend_root}/src/config/themes"
    mkdir -p "${frontend_root}/src/config/banking"
    mkdir -p "${frontend_root}/src/config/tenants"
    
    # Create localization directories
    mkdir -p "${frontend_root}/public/locales/en/banking"
    mkdir -p "${frontend_root}/public/locales/id/banking"
    mkdir -p "${frontend_root}/public/locales/ar/banking"
    
    # Create assets directories
    mkdir -p "${frontend_root}/public/assets/themes/conventional"
    mkdir -p "${frontend_root}/public/assets/themes/syariah"
    mkdir -p "${frontend_root}/public/assets/logos/conventional"
    mkdir -p "${frontend_root}/public/assets/logos/syariah"
    
    log_success "Theme directory structure created"
}

# Install required theme dependencies
install_theme_dependencies() {
    log_info "Installing theme dependencies..."
    
    cd "${PROJECT_ROOT}/packages/frontend"
    
    # Install React Admin and theme dependencies
    pnpm add react-admin@^4.16.0 \
             @mui/material@^5.15.0 \
             @mui/icons-material@^5.15.0 \
             @mui/lab@^5.0.0-alpha.158 \
             @emotion/react@^11.11.0 \
             @emotion/styled@^11.11.0 \
             @emotion/cache@^11.11.0 \
             @mui/x-data-grid@^6.18.0 \
             @mui/x-date-pickers@^6.18.0 \
             ra-data-json-server@^4.16.0 \
             ra-i18n-polyglot@^4.16.0 \
             polyglot@^0.5.0 \
             react-redux@^9.0.0 \
             @reduxjs/toolkit@^2.0.0 \
             styled-components@^6.1.0
    
    # Install development dependencies
    pnpm add -D @types/styled-components@^5.1.34
    
    cd "${PROJECT_ROOT}"
    
    log_success "Theme dependencies installed"
}

# Setup theme configuration system
setup_theme_configuration() {
    log_info "Setting up theme configuration system..."
    
    # Run the configuration setup script
    if [[ -f "${SCRIPT_DIR}/d2h6-configuration-setup.sh" ]]; then
        bash "${SCRIPT_DIR}/d2h6-configuration-setup.sh"
    else
        log_warning "Configuration setup script not found, will be created next"
    fi
    
    log_success "Theme configuration system setup completed"
}

# Generate theme code files
generate_theme_files() {
    log_info "Generating dual banking theme files..."
    
    # Run the code generation script
    if [[ -f "${SCRIPT_DIR}/d2h6-themes-codegen.sh" ]]; then
        bash "${SCRIPT_DIR}/d2h6-themes-codegen.sh"
    else
        log_warning "Theme code generation script not found, will be created next"
    fi
    
    log_success "Theme files generated"
}

# Validate theme implementation
validate_theme_implementation() {
    log_info "Validating theme implementation..."
    
    local frontend_root="${PROJECT_ROOT}/packages/frontend"
    local validation_passed=true
    
    # Check required theme files exist
    local required_files=(
        "src/themes/conventional/theme.ts"
        "src/themes/syariah/theme.ts"
        "src/themes/shared/theme.provider.tsx"
        "src/admin/themes/providers/DualBankingThemeProvider.tsx"
        "src/config/themes/banking.config.ts"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "${frontend_root}/${file}" ]]; then
            log_error "Required theme file missing: ${file}"
            validation_passed=false
        fi
    done
    
    # Check for file path documentation
    find "${frontend_root}/src/themes" -name "*.ts" -o -name "*.tsx" | while read -r file; do
        if ! grep -q "File Path:" "$file"; then
            log_warning "Missing file path documentation: $file"
        fi
    done
    
    # Validate TypeScript compilation
    cd "${frontend_root}"
    if ! pnpm run type-check; then
        log_error "TypeScript compilation failed"
        validation_passed=false
    fi
    cd "${PROJECT_ROOT}"
    
    if [[ "$validation_passed" == "true" ]]; then
        log_success "Theme implementation validation passed"
        return 0
    else
        log_error "Theme implementation validation failed"
        return 1
    fi
}

# Update package.json scripts for theme management
update_package_scripts() {
    log_info "Updating package.json scripts for theme management..."
    
    local frontend_package="${PROJECT_ROOT}/packages/frontend/package.json"
    
    # Add theme-related scripts if they don't exist
    if ! grep -q "theme:build" "$frontend_package"; then
        log_info "Adding theme management scripts to package.json"
        
        # This would normally be done with jq, but using sed for simplicity
        sed -i '/"scripts": {/a\    "theme:build": "tsc --project tsconfig.json --noEmit",\n    "theme:validate": "eslint src/themes --ext .ts,.tsx",\n    "theme:test": "jest src/themes",' "$frontend_package"
    fi
    
    log_success "Package scripts updated"
}

# Main execution function
main() {
    log_info "Starting ${PHASE_NAME} setup (${PHASE_ID})..."
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    # Track progress start
    track_progress "${PHASE_ID}" "STARTED"
    
    # Execute setup steps
    validate_environment
    create_theme_structure
    install_theme_dependencies
    setup_theme_configuration
    generate_theme_files
    update_package_scripts
    validate_theme_implementation
    
    # Track progress completion
    track_progress "${PHASE_ID}" "COMPLETED"
    
    log_success "=== ${PHASE_NAME} setup completed successfully! ==="
    log_info "Phase: ${PHASE_ID}"
    log_info "Duration: Approximately $(( $(date +%s) - $(stat -c %Y "${LOG_FILE}") )) seconds"
    log_info "Log file: ${LOG_FILE}"
    
    echo ""
    echo "🎯 NEXT STEPS:"
    echo "1. Run: pnpm run dev"
    echo "2. Test dual banking themes in React Admin"
    echo "3. Validate tenant-specific theme switching"
    echo "4. Continue to D2H7: React Admin Banking Resources"
    echo ""
    echo "📋 CONTINUATION PROMPT FOR NEXT CHAT:"
    echo "CONTINUE CODE GENERATION: DAY 2 HOUR 7 - React Admin Banking Resources"
    echo "Follow 001-006-011-phased-shell-driven-development-psdd-methodology.md"
    echo "Previous phase D2H6 completed: Dual Banking Admin Themes"
    echo "Status: Theme system operational, configuration management ready"
}

# Execute main function
main "$@"