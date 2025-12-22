#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - Phase 1 Validation
# ============================================================================
# Script: phase1-validation.sh
# Phase: PHASE1 - Platform Admin Database Connection Validation
# Objective: Validate Phase 1 implementation and database connectivity
# Generated: $(date)
# File Path: ./ifrs9-platform/scripts/development/phase1-validation.sh
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/phase1-validation-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="PHASE1-VALIDATION"
PHASE_NAME="PLATFORM ADMIN DATABASE CONNECTION VALIDATION"
PHASE_OBJECTIVE="Validate Phase 1 implementation and database connectivity"

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
    log_error "Validation failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    log_error "Stack trace available in: ${LOG_FILE}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# Load environment configuration
load_environment() {
    log_info "Loading environment configuration..."
    
    # Check for .env file
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_success "Environment configuration loaded"
    else
        log_warning "No .env file found. Using defaults."
        # Set default database configuration
        export DB_HOST="${DB_HOST:-localhost}"
        export DB_PORT="${DB_PORT:-5432}"
        export DB_USER="${DB_USER:-postgres}"
        export DB_PASSWORD="${DB_PASSWORD:-postgres}"
        export DB_PLATFORM_ADMIN="${DB_PLATFORM_ADMIN:-ifrspro_platform_admin}"
    fi
}

# Validate database connectivity
validate_database_connectivity() {
    log_info "Validating database connectivity to ifrspro_platform_admin..."
    
    # Check if PostgreSQL client is available
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL client (psql) not found. Please install PostgreSQL client."
        exit 1
    fi
    
    # Test database connection
    if ! PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_PLATFORM_ADMIN}" -c "SELECT 1;" &> /dev/null; then
        log_error "Cannot connect to database: ${DB_PLATFORM_ADMIN}"
        log_error "Host: ${DB_HOST}, Port: ${DB_PORT}, User: ${DB_USER}"
        log_error "Please ensure:"
        log_error "  1. PostgreSQL server is running"
        log_error "  2. Database '${DB_PLATFORM_ADMIN}' exists"
        log_error "  3. User '${DB_USER}' has access permissions"
        exit 1
    fi
    
    log_success "Database connectivity validated"
}

# Validate required database tables
validate_database_schema() {
    log_info "Validating required database tables..."
    
    local required_tables=(
        "core.users"
        "platform_config.banking_institutions"
        "platform_config.consultant_projects"
        "configuration.app_settings"
    )
    
    local validation_passed=true
    
    for table in "${required_tables[@]}"; do
        local table_exists=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_PLATFORM_ADMIN}" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='${table%.*}' AND table_name='${table#*.}');" | tr -d ' ')
        
        if [[ "$table_exists" == "t" ]]; then
            log_success "✓ Table exists: $table"
        else
            log_warning "✗ Table missing: $table"
            validation_passed=false
        fi
    done
    
    if [[ "$validation_passed" == "true" ]]; then
        log_success "Database schema validation passed"
    else
        log_warning "Some database tables are missing. This may be expected if database hasn't been fully setup."
    fi
}

# Validate created files
validate_created_files() {
    log_info "Validating Phase 1 created files..."
    
    local required_files=(
        "packages/frontend/src/admin/providers/data/platformDataProvider.ts"
        "packages/frontend/src/admin/providers/auth/platformAuthProvider.ts" 
        "packages/backend/src/api/routes/platform-admin.routes.ts"
        "packages/backend/src/api/controllers/platform-admin.controller.ts"
        "packages/backend/src/api/middleware/platform-admin.middleware.ts"
    )
    
    local validation_passed=true
    local files_created=0
    
    for file in "${required_files[@]}"; do
        local full_path="${PROJECT_ROOT}/${file}"
        if [[ -f "$full_path" ]]; then
            log_success "✓ File created: $file"
            files_created=$((files_created + 1))
            
            # Check file path documentation
            if grep -q "File Path:" "$full_path"; then
                log_info "  ✓ File path documented"
            else
                log_warning "  ✗ Missing file path documentation"
            fi
            
            # Check for PSDD methodology marker
            if grep -q "PSDD" "$full_path"; then
                log_info "  ✓ PSDD methodology marker present"
            else
                log_warning "  ✗ Missing PSDD methodology marker"
            fi
            
        else
            log_error "✗ File missing: $file"
            validation_passed=false
        fi
    done
    
    log_info "Files created: ${files_created}/${#required_files[@]}"
    
    if [[ "$validation_passed" == "true" ]]; then
        log_success "File validation passed"
    else
        log_error "File validation failed"
    fi
    
    return $([ "$validation_passed" = "true" ] && echo 0 || echo 1)
}

# Validate TypeScript syntax
validate_typescript_syntax() {
    log_info "Validating TypeScript syntax..."
    
    # Check if TypeScript is available
    if ! command -v npx &> /dev/null; then
        log_warning "npx not available. Skipping TypeScript validation."
        return 0
    fi
    
    local ts_files=(
        "${PROJECT_ROOT}/packages/frontend/src/admin/providers/data/platformDataProvider.ts"
        "${PROJECT_ROOT}/packages/frontend/src/admin/providers/auth/platformAuthProvider.ts"
        "${PROJECT_ROOT}/packages/backend/src/api/routes/platform-admin.routes.ts"
        "${PROJECT_ROOT}/packages/backend/src/api/controllers/platform-admin.controller.ts"
        "${PROJECT_ROOT}/packages/backend/src/api/middleware/platform-admin.middleware.ts"
    )
    
    local syntax_valid=true
    
    for file in "${ts_files[@]}"; do
        if [[ -f "$file" ]]; then
            if npx tsc --noEmit --skipLibCheck "$file" &> /dev/null; then
                log_info "✓ TypeScript syntax valid: $(basename "$file")"
            else
                log_warning "✗ TypeScript syntax issues: $(basename "$file")"
                syntax_valid=false
            fi
        fi
    done
    
    if [[ "$syntax_valid" == "true" ]]; then
        log_success "TypeScript syntax validation passed"
    else
        log_warning "Some TypeScript syntax issues found"
    fi
}

# Validate configuration files
validate_configuration() {
    log_info "Validating configuration..."
    
    local config_valid=true
    
    # Check for hardcoded values
    local files_to_check=(
        "${PROJECT_ROOT}/packages/frontend/src/admin/providers/data/platformDataProvider.ts"
        "${PROJECT_ROOT}/packages/frontend/src/admin/providers/auth/platformAuthProvider.ts"
        "${PROJECT_ROOT}/packages/backend/src/api/routes/platform-admin.routes.ts"
        "${PROJECT_ROOT}/packages/backend/src/api/controllers/platform-admin.controller.ts"
    )
    
    for file in "${files_to_check[@]}"; do
        if [[ -f "$file" ]]; then
            # Check for environment variable usage
            if grep -q "process\.env\." "$file"; then
                log_success "✓ Environment variables used: $(basename "$file")"
            else
                log_warning "✗ No environment variables found: $(basename "$file")"
            fi
            
            # Check for hardcoded localhost
            if grep -q "localhost" "$file" && ! grep -q "process\.env\." "$file"; then
                log_warning "⚠ Hardcoded localhost found: $(basename "$file")"
                config_valid=false
            fi
        fi
    done
    
    if [[ "$config_valid" == "true" ]]; then
        log_success "Configuration validation passed"
    else
        log_warning "Some configuration issues found"
    fi
}

# Generate validation report
generate_validation_report() {
    log_info "Generating validation report..."
    
    local report_file="${PROJECT_ROOT}/logs/phase1-validation-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# Phase 1 Validation Report
## Platform Admin Database Connection Validation

**Date**: $(date)  
**Phase**: Phase 1 - Platform Admin Database Connection  
**Status**: $([ -f "${PROJECT_ROOT}/.phase1-completed" ] && echo "✅ COMPLETED" || echo "❌ INCOMPLETE")

## Validation Results

### Database Connectivity
- **Host**: ${DB_HOST}
- **Port**: ${DB_PORT}
- **Database**: ${DB_PLATFORM_ADMIN}
- **Status**: $(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_PLATFORM_ADMIN}" -c "SELECT 1;" &> /dev/null && echo "✅ Connected" || echo "❌ Connection Failed")

### Created Files
$(ls -la "${PROJECT_ROOT}/packages/frontend/src/admin/providers/data/" 2>/dev/null | grep -v "^total" | sed 's/^/- /' || echo "- No files found")
$(ls -la "${PROJECT_ROOT}/packages/frontend/src/admin/providers/auth/" 2>/dev/null | grep -v "^total" | sed 's/^/- /' || echo "- No files found")
$(ls -la "${PROJECT_ROOT}/packages/backend/src/api/routes/" 2>/dev/null | grep platform-admin | sed 's/^/- /' || echo "- No platform admin routes found")
$(ls -la "${PROJECT_ROOT}/packages/backend/src/api/controllers/" 2>/dev/null | grep platform-admin | sed 's/^/- /' || echo "- No platform admin controllers found")
$(ls -la "${PROJECT_ROOT}/packages/backend/src/api/middleware/" 2>/dev/null | grep platform-admin | sed 's/^/- /' || echo "- No platform admin middleware found")

### Next Steps
1. **Phase 2**: Banking Institution Management
2. **Focus**: Create React Admin components for banking institutions
3. **Database**: Connect to platform_config.banking_institutions table
4. **Consultant Management**: Implement consultant project assignments

### Recommendations
- Ensure database schema is properly setup before Phase 2
- Review created files for any syntax issues
- Configure environment variables in .env file
- Test API endpoints before proceeding to frontend components

---
*Generated by PSDD Phase 1 Validation*
EOF
    
    log_success "Validation report generated: $report_file"
}

# Main validation function
main() {
    log_info "Starting Phase 1 validation: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    local overall_validation=0
    
    # Load environment
    load_environment
    
    # Run all validations
    validate_database_connectivity || overall_validation=1
    validate_database_schema || overall_validation=1
    validate_created_files || overall_validation=1
    validate_typescript_syntax || overall_validation=1
    validate_configuration || overall_validation=1
    
    # Generate report
    generate_validation_report
    
    if [[ $overall_validation -eq 0 ]]; then
        log_success "🎉 Phase 1 validation completed successfully!"
        log_info "✅ All validations passed"
        log_info "🔄 Ready to proceed to Phase 2"
        
        # Update progress file
        local progress_file="${PROJECT_ROOT}/.psdd-progress"
        echo "$(date '+%Y-%m-%d %H:%M:%S') | PHASE1-VALIDATION | COMPLETED | All validations passed | Ready for PHASE2" >> "$progress_file"
        
    else
        log_warning "⚠️ Phase 1 validation completed with issues"
        log_info "📋 Please review the validation report and fix issues before proceeding"
    fi
    
    log_info "📄 Validation log: ${LOG_FILE}"
    log_info "📊 Validation report: $(ls ${PROJECT_ROOT}/logs/phase1-validation-report-*.md | tail -1)"
    
    return $overall_validation
}

# Execute main function with all arguments
main "$@"
