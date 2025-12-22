#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/development/d3h1-basic-ifrs9-models.sh
# Generated: 2025-07-22 15:30:00
# Phase: D3H1 - Basic IFRS 9 Data Models
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Main setup script for Basic IFRS 9 foundation (Basic level)
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d3h1-basic-ifrs9-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D3H1"
PHASE_NAME="Basic IFRS 9 Data Models"
PHASE_OBJECTIVE="IFRS 9 foundation (Basic level) with ECL calculations"

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
    local required_tools=("node" "pnpm" "psql" "R")
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
        log_warning "No .env file found. Creating from template."
        create_environment_template
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

# Create environment template with correct ports from TodoList-v2.md
create_environment_template() {
    log_info "Creating environment template with correct configuration..."
    
    cat > "${PROJECT_ROOT}/.env" << 'EOF'
# ============================================================================
# PSDD ENVIRONMENT CONFIGURATION
# ============================================================================
# Generated: $(date)
# Phase: D3H1 - Basic IFRS 9 Data Models
# Environment: development
# Purpose: IFRS 9 foundation configuration with correct ports
# ============================================================================

# Application Configuration
NODE_ENV=development
APP_NAME="IFRS Pro Platform"
APP_VERSION=1.0.0
APP_DEBUG=true

# Server Configuration (CORRECT PORTS from TodoList-v2.md)
BACKEND_HOST=localhost
BACKEND_PORT=4232
FRONTEND_HOST=localhost
FRONTEND_PORT=4231
R_ANALYTICS_HOST=localhost
R_ANALYTICS_PORT=4236

# Public URLs
FRONTEND_URL=https://ifrs9.ifrspro.id
BACKEND_URL=https://bifrs9.ifrspro.id
API_BASE_URL=https://bifrs9.ifrspro.id/api
RAPI_BASE_URL=https://rifrs9.ifrspro.id/api

# Database Configuration (Platform Admin)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ifrspro_platform_admin
DB_SSL=false

# Database Configuration (Tenant)
TENANT_DB_HOST=localhost
TENANT_DB_PORT=5432
TENANT_DB_USER_PREFIX=tenant_
TENANT_DB_NAME_PREFIX=ifrs9_tenant_
TENANT_DB_SSL=require

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=1234567890
REDIS_DB=10
REDIS_TOKEN_BLACKLIST_DB=4
REDIS_SESSION_DB=10

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-development
JWT_EXPIRES_IN=8h
ENCRYPTION_KEY=your-encryption-key-32-chars-dev

# IFRS 9 Configuration
IFRS9_ENABLED=true
IFRS9_CALCULATION_FREQUENCY=monthly
IFRS9_PD_METHOD=historical
IFRS9_LGD_METHOD=historical
IFRS9_EAD_METHOD=current

# R Analytics Configuration
R_ANALYTICS_URL=http://localhost:4236
R_SCRIPTS_PATH=/app/packages/r-analytics/scripts
R_MODELS_PATH=/app/packages/r-analytics/models
R_MAX_MEMORY_MB=2048
R_TIMEOUT_SECONDS=300

# Feature Flags
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_ISLAMIC_BANKING=true
FEATURE_AUDIT_TRAIL=true
FEATURE_STRESS_TESTING=false

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=./logs/app.log
EOF

    log_success "Environment template created with correct ports"
}

# IFRS 9 specific setup
setup_ifrs9_foundation() {
    log_info "Setting up IFRS 9 foundation directories..."
    
    # Create IFRS 9 directory structure
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/modules/ifrs9"/{models,services,controllers,routes}
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/modules/ifrs9/calculation"
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics"/{scripts,api,config,models}
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics/scripts/ifrs9"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/ifrs9"/{dashboard,calculations,forms}
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/pages/ifrs9"
    mkdir -p "${PROJECT_ROOT}/database/migrations/ifrs9"
    mkdir -p "${PROJECT_ROOT}/config/ifrs9"
    
    log_success "IFRS 9 directory structure created"
}

# Install R packages for IFRS 9 calculations
install_r_packages() {
    log_info "Installing R packages for IFRS 9 calculations..."
    
    # Check if R is available
    if ! command -v R &> /dev/null; then
        log_error "R is not installed. Please install R 4.3+ first."
        exit 1
    fi
    
    # Install required R packages
    R --slave --no-restore --no-save << 'REOF'
# Install essential packages for IFRS 9 calculations
packages <- c(
    "jsonlite",      # JSON handling
    "dplyr",         # Data manipulation
    "lubridate",     # Date handling
    "readxl",        # Excel file reading
    "writexl",       # Excel file writing
    "MASS",          # Statistical functions
    "survival",      # Survival analysis for PD
    "VaR",           # Value at Risk calculations
    "forecast",      # Time series forecasting
    "plumber",       # R API framework
    "DBI",           # Database interface
    "RPostgreSQL"    # PostgreSQL connector
)

# Install packages
for (pkg in packages) {
    if (!require(pkg, character.only = TRUE)) {
        install.packages(pkg, repos = "https://cran.r-project.org")
        cat("Installed:", pkg, "\n")
    } else {
        cat("Already installed:", pkg, "\n")
    }
}

# Verify installation
cat("=== R Package Installation Summary ===\n")
cat("Required packages for IFRS 9:\n")
for (pkg in packages) {
    if (require(pkg, character.only = TRUE)) {
        cat("✅", pkg, "\n")
    } else {
        cat("❌", pkg, "\n")
    }
}
cat("R Analytics environment ready!\n")
REOF

    log_success "R packages installation completed"
}

# Install Node.js dependencies
install_dependencies() {
    log_info "Installing Node.js dependencies..."
    
    # Install backend dependencies
    if [[ -d "${PROJECT_ROOT}/packages/backend" ]]; then
        cd "${PROJECT_ROOT}/packages/backend"
        log_info "Installing backend dependencies..."
        pnpm install || npm install
        cd "${PROJECT_ROOT}"
    fi
    
    # Install frontend dependencies  
    if [[ -d "${PROJECT_ROOT}/packages/frontend" ]]; then
        cd "${PROJECT_ROOT}/packages/frontend"
        log_info "Installing frontend dependencies..."
        pnpm install || npm install
        cd "${PROJECT_ROOT}"
    fi
    
    log_success "Node.js dependencies installed"
}

# Execute code generation scripts
execute_code_generation() {
    log_info "Executing IFRS 9 code generation scripts..."
    
    # Make code generation scripts executable
    chmod +x "${PROJECT_ROOT}/scripts/codegen/"*.sh
    
    # Execute backend code generation (multipart)
    if [[ -f "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-backend-part1.sh" ]]; then
        log_info "Executing backend code generation (Part 1)..."
        "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-backend-part1.sh"
    fi
    
    if [[ -f "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-backend-part2.sh" ]]; then
        log_info "Executing backend code generation (Part 2)..."
        "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-backend-part2.sh"
    fi
    
    # Execute R analytics code generation
    if [[ -f "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-r-analytics.sh" ]]; then
        log_info "Executing R analytics code generation..."
        "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-r-analytics.sh"
    fi
    
    # Execute frontend code generation
    if [[ -f "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-frontend.sh" ]]; then
        log_info "Executing frontend code generation..."
        "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-frontend.sh"
    fi
    
    # Execute database migrations
    if [[ -f "${PROJECT_ROOT}/scripts/database/d3h1-ifrs9-migrations.sh" ]]; then
        log_info "Executing database migrations..."
        "${PROJECT_ROOT}/scripts/database/d3h1-ifrs9-migrations.sh"
    fi
    
    log_success "Code generation completed"
}

# Validation checks
validate_ifrs9_setup() {
    log_info "Validating IFRS 9 setup..."
    
    # Check if key directories exist
    local required_dirs=(
        "packages/backend/src/modules/ifrs9"
        "packages/r-analytics/scripts/ifrs9"
        "packages/frontend/src/components/ifrs9"
        "database/migrations/ifrs9"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "${PROJECT_ROOT}/${dir}" ]]; then
            log_error "Required directory missing: ${dir}"
            exit 1
        fi
    done
    
    # Check database connectivity
    if command -v psql &> /dev/null; then
        if pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" &> /dev/null; then
            log_success "Database connectivity verified"
        else
            log_warning "Database connection failed. Please check PostgreSQL setup."
        fi
    fi
    
    # Check R installation
    if command -v R &> /dev/null; then
        log_success "R installation verified"
    else
        log_warning "R not found. Some features may not work."
    fi
    
    log_success "IFRS 9 setup validation completed"
}

# Main execution
main() {
    log_info "=== ${PHASE_ID}: ${PHASE_NAME} ==="
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    # Track progress start
    track_progress "${PHASE_ID}" "STARTED"
    
    # Execute setup steps
    validate_environment
    setup_ifrs9_foundation
    install_r_packages
    install_dependencies
    execute_code_generation
    validate_ifrs9_setup
    
    # Track progress completion
    track_progress "${PHASE_ID}" "COMPLETED"
    
    log_success "=== ${PHASE_ID} COMPLETED SUCCESSFULLY ==="
    log_info "Generated files logged in: ${LOG_FILE}"
    log_info "Next Phase: D3H2 - Basic IFRS 9 Services"
    
    # Print continuation prompt
    echo ""
    echo "🔄 CONTINUE PROMPT FOR NEXT CHAT:"
    echo "================================================================"
    echo "CODE GENERATION CONTINUATION - PSDD METHODOLOGY:"
    echo "Continue from DAY 3 HOUR 2 based on project knowledge documents."
    echo "Previous chat completed DAY 3 HOUR 1 - Basic IFRS 9 Data Models"
    echo "with PSDD methodology. Use correct ports (FRONTEND_PORT=4231,"
    echo "BACKEND_PORT=4232, R_ANALYTICS_PORT=4236). Follow same shell"
    echo "script patterns and PSDD methodology. Always read project"
    echo "knowledge first before generating any code."
    echo "================================================================"
}

# Execute main function
main "$@"