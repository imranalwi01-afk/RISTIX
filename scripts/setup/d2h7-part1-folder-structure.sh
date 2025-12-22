#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/setup/d2h7-part1-folder-structure.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H7P1 - Database-Driven Menu & Infrastructure (Folder Structure)
# Methodology: Phased Shell-Driven Development (PSDD)
# Dependencies: pnpm, PostgreSQL, Node.js 18+
# Purpose: Setup folder structure for database-driven menu system and infrastructure
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h7-p1-folder-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H7P1"
PHASE_NAME="Database-Driven Menu & Infrastructure - Folder Structure"
PHASE_OBJECTIVE="Setup comprehensive folder structure for menu system and infrastructure"

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
    log_info "Validating PSDD environment for ${PHASE_NAME}..."
    
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
    
    log_success "Environment validation completed"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# Setup backend menu infrastructure folders
setup_backend_menu_structure() {
    log_info "Setting up backend menu infrastructure structure..."
    
    # Core menu system directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/menu"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/gateway"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/monitoring"
    
    # Menu-specific service directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/menu/dynamic-generator"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/menu/role-based"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/menu/configuration"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/menu/cache"
    
    # Infrastructure service directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/infrastructure/health-check"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/infrastructure/load-balancer"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/infrastructure/performance"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/infrastructure/metrics"
    
    # API Gateway directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/gateway/routing"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/gateway/middleware"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/gateway/security"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/gateway/rate-limiting"
    
    # Monitoring service directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/monitoring/health"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/monitoring/performance"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/monitoring/alerts"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/monitoring/logging"
    
    # Menu API routes
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/menu"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/gateway"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/monitoring"
    
    # Menu controllers
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/menu"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/gateway"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/monitoring"
    
    # Menu middleware
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/middleware/menu"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/middleware/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/middleware/gateway"
    
    # Menu validators
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/validators/menu"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/validators/infrastructure"
    
    log_success "Backend menu infrastructure structure created"
}

# Setup frontend menu infrastructure folders
setup_frontend_menu_structure() {
    log_info "Setting up frontend menu infrastructure structure..."
    
    # Menu components directory
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/menu"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/monitoring"
    
    # Dynamic menu components
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/menu/dynamic"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/menu/configuration"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/menu/role-based"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/menu/navigation"
    
    # Infrastructure components
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/infrastructure/health-dashboard"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/infrastructure/performance-monitor"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/infrastructure/load-balancer"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/infrastructure/gateway-status"
    
    # Monitoring components
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/monitoring/dashboard"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/monitoring/alerts"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/monitoring/metrics"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/monitoring/logs"
    
    # Menu store slices
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/store/slices/menu"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/store/slices/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/store/slices/monitoring"
    
    # Menu hooks
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/hooks/menu"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/hooks/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/hooks/monitoring"
    
    # Menu types
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/types/menu"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/types/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/types/monitoring"
    
    log_success "Frontend menu infrastructure structure created"
}

# Setup database infrastructure folders
setup_database_infrastructure() {
    log_info "Setting up database infrastructure structure..."
    
    # Database schema directories for menu system
    mkdir -p "${PROJECT_ROOT}/database/schemas/menu"
    mkdir -p "${PROJECT_ROOT}/database/schemas/infrastructure"
    mkdir -p "${PROJECT_ROOT}/database/schemas/monitoring"
    
    # Menu migrations
    mkdir -p "${PROJECT_ROOT}/database/migrations/menu"
    mkdir -p "${PROJECT_ROOT}/database/migrations/infrastructure"
    mkdir -p "${PROJECT_ROOT}/database/migrations/monitoring"
    
    # Menu seeders
    mkdir -p "${PROJECT_ROOT}/database/seeders/menu"
    mkdir -p "${PROJECT_ROOT}/database/seeders/infrastructure"
    
    # Menu stored procedures
    mkdir -p "${PROJECT_ROOT}/database/stored-procedures/menu"
    mkdir -p "${PROJECT_ROOT}/database/stored-procedures/infrastructure"
    mkdir -p "${PROJECT_ROOT}/database/stored-procedures/monitoring"
    
    log_success "Database infrastructure structure created"
}

# Setup shared packages for menu system
setup_shared_menu_structure() {
    log_info "Setting up shared menu infrastructure structure..."
    
    # Menu types
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/menu"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/monitoring"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/gateway"
    
    # Menu constants
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/constants/menu"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/constants/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/constants/monitoring"
    
    # Menu utilities
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/utils/menu"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/utils/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/utils/monitoring"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/utils/gateway"
    
    # Menu schemas
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/schemas/menu"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/schemas/infrastructure"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/schemas/monitoring"
    
    log_success "Shared menu infrastructure structure created"
}

# Setup configuration and environment files
setup_configuration_structure() {
    log_info "Setting up configuration structure for menu system..."
    
    # Configuration directories
    mkdir -p "${PROJECT_ROOT}/config/menu"
    mkdir -p "${PROJECT_ROOT}/config/infrastructure"
    mkdir -p "${PROJECT_ROOT}/config/monitoring"
    mkdir -p "${PROJECT_ROOT}/config/gateway"
    
    # Environment-specific configurations
    mkdir -p "${PROJECT_ROOT}/environments/development/menu"
    mkdir -p "${PROJECT_ROOT}/environments/staging/menu"
    mkdir -p "${PROJECT_ROOT}/environments/production/menu"
    
    mkdir -p "${PROJECT_ROOT}/environments/development/infrastructure"
    mkdir -p "${PROJECT_ROOT}/environments/staging/infrastructure"
    mkdir -p "${PROJECT_ROOT}/environments/production/infrastructure"
    
    log_success "Configuration structure created"
}

# Setup documentation structure
setup_documentation_structure() {
    log_info "Setting up documentation structure for menu system..."
    
    # API documentation
    mkdir -p "${PROJECT_ROOT}/docs/api/menu"
    mkdir -p "${PROJECT_ROOT}/docs/api/infrastructure"
    mkdir -p "${PROJECT_ROOT}/docs/api/monitoring"
    mkdir -p "${PROJECT_ROOT}/docs/api/gateway"
    
    # Architecture documentation
    mkdir -p "${PROJECT_ROOT}/docs/architecture/menu-system"
    mkdir -p "${PROJECT_ROOT}/docs/architecture/infrastructure"
    mkdir -p "${PROJECT_ROOT}/docs/architecture/monitoring"
    
    # Development documentation
    mkdir -p "${PROJECT_ROOT}/docs/development/menu-development"
    mkdir -p "${PROJECT_ROOT}/docs/development/infrastructure-setup"
    
    log_success "Documentation structure created"
}

# Setup testing structure
setup_testing_structure() {
    log_info "Setting up testing structure for menu system..."
    
    # Unit tests
    mkdir -p "${PROJECT_ROOT}/tests/unit/menu"
    mkdir -p "${PROJECT_ROOT}/tests/unit/infrastructure"
    mkdir -p "${PROJECT_ROOT}/tests/unit/monitoring"
    mkdir -p "${PROJECT_ROOT}/tests/unit/gateway"
    
    # Integration tests
    mkdir -p "${PROJECT_ROOT}/tests/integration/menu"
    mkdir -p "${PROJECT_ROOT}/tests/integration/infrastructure"
    mkdir -p "${PROJECT_ROOT}/tests/integration/monitoring"
    
    # E2E tests
    mkdir -p "${PROJECT_ROOT}/tests/e2e/menu"
    mkdir -p "${PROJECT_ROOT}/tests/e2e/infrastructure"
    
    # Performance tests
    mkdir -p "${PROJECT_ROOT}/tests/performance/menu"
    mkdir -p "${PROJECT_ROOT}/tests/performance/infrastructure"
    mkdir -p "${PROJECT_ROOT}/tests/performance/load-balancing"
    
    # Test fixtures
    mkdir -p "${PROJECT_ROOT}/tests/fixtures/menu"
    mkdir -p "${PROJECT_ROOT}/tests/fixtures/infrastructure"
    
    log_success "Testing structure created"
}

# Setup monitoring and deployment structure
setup_monitoring_deployment_structure() {
    log_info "Setting up monitoring and deployment structure..."
    
    # Monitoring configurations
    mkdir -p "${PROJECT_ROOT}/monitoring/prometheus/menu"
    mkdir -p "${PROJECT_ROOT}/monitoring/grafana/menu"
    mkdir -p "${PROJECT_ROOT}/monitoring/logs/menu"
    mkdir -p "${PROJECT_ROOT}/monitoring/alerts/menu"
    
    # Infrastructure monitoring
    mkdir -p "${PROJECT_ROOT}/monitoring/infrastructure/health"
    mkdir -p "${PROJECT_ROOT}/monitoring/infrastructure/performance"
    mkdir -p "${PROJECT_ROOT}/monitoring/infrastructure/load-balancer"
    
    # Deployment scripts
    mkdir -p "${PROJECT_ROOT}/scripts/deployment/menu"
    mkdir -p "${PROJECT_ROOT}/scripts/deployment/infrastructure"
    mkdir -p "${PROJECT_ROOT}/scripts/deployment/monitoring"
    
    # Maintenance scripts
    mkdir -p "${PROJECT_ROOT}/scripts/maintenance/menu"
    mkdir -p "${PROJECT_ROOT}/scripts/maintenance/infrastructure"
    
    log_success "Monitoring and deployment structure created"
}

# Generate .gitkeep files for empty directories
generate_gitkeep_files() {
    log_info "Generating .gitkeep files for empty directories..."
    
    # Find all empty directories and add .gitkeep
    find "${PROJECT_ROOT}" -type d -empty -not -path "*/.git/*" -not -path "*/node_modules/*" | while read -r dir; do
        touch "${dir}/.gitkeep"
        log_info "Added .gitkeep to: ${dir}"
    done
    
    log_success ".gitkeep files generated"
}

# Main execution function
main() {
    log_info "Starting PSDD ${PHASE_ID}: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    # Validate environment
    validate_environment
    
    # Track progress start
    track_progress "${PHASE_ID}" "STARTED"
    
    # Execute folder structure setup
    setup_backend_menu_structure
    setup_frontend_menu_structure
    setup_database_infrastructure
    setup_shared_menu_structure
    setup_configuration_structure
    setup_documentation_structure
    setup_testing_structure
    setup_monitoring_deployment_structure
    generate_gitkeep_files
    
    # Track progress completion
    track_progress "${PHASE_ID}" "COMPLETED"
    
    log_success "PSDD ${PHASE_ID} completed successfully!"
    log_info "Next step: Run d2h7-part2-database-menu-schema.sh"
    log_info "Log file: ${LOG_FILE}"
    
    # Generate completion report
    echo ""
    echo "=========================================="
    echo "PSDD D2H7 PHASE 1 COMPLETION REPORT"
    echo "=========================================="
    echo "Phase: ${PHASE_NAME}"
    echo "Status: ✅ COMPLETED"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Log File: ${LOG_FILE}"
    echo ""
    echo "Folder Structure Created:"
    echo "  ✅ Backend menu infrastructure"
    echo "  ✅ Frontend menu components"
    echo "  ✅ Database infrastructure"
    echo "  ✅ Shared packages"
    echo "  ✅ Configuration structure"
    echo "  ✅ Documentation structure"
    echo "  ✅ Testing structure"
    echo "  ✅ Monitoring/deployment structure"
    echo ""
    echo "Next Phase: D2H7P2 - Database Menu Schema"
    echo "Next Script: ./scripts/setup/d2h7-part2-database-menu-schema.sh"
    echo "=========================================="
}

# Execute main function
main "$@"