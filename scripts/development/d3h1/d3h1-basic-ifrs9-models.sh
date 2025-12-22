#!/bin/bash
# scripts/development/d3h1-basic-ifrs9-models.sh
# DAY 3 HOUR 1: Basic IFRS 9 Data Models Setup
# OBJECTIVE: IFRS 9 foundation (Basic level)

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d3h1-basic-ifrs9-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if not exists
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
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating environment for DAY 3 HOUR 1..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    
    if ! printf '%s\n%s\n' "${required_version}" "${node_version}" | sort -V -C; then
        log_error "Node.js version ${node_version} is below required ${required_version}"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed. Install with: npm install -g pnpm"
        exit 1
    fi
    
    # Check R installation
    if ! command -v R &> /dev/null; then
        log_error "R is not installed. Please install R 4.3+"
        exit 1
    fi
    
    # Check database connectivity
    if ! pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" &> /dev/null; then
        log_error "PostgreSQL database is not accessible"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Load environment variables
load_environment() {
    log_info "Loading environment variables..."
    
    if [[ -f "${PROJECT_ROOT}/.env.development" ]]; then
        source "${PROJECT_ROOT}/.env.development"
        log_success "Loaded .env.development"
    elif [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_success "Loaded .env"
    else
        log_warning "No environment file found, using defaults"
    fi
    
    # Set defaults if not provided
    export DB_HOST=${DB_HOST:-"localhost"}
    export DB_PORT=${DB_PORT:-5432}
    export DB_USER=${DB_USER:-"postgres"}
    export DB_PASSWORD=${DB_PASSWORD:-"postgres"}
    export R_ANALYTICS_PORT=${R_ANALYTICS_PORT:-8001}
}

# Create directory structure for IFRS 9 modules
create_ifrs9_directories() {
    log_info "Creating IFRS 9 directory structure..."
    
    # Backend directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/modules/ifrs9"/{models,services,controllers,routes,validators}
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/modules/ifrs9/calculations"/{ecl,pd,lgd,ead}
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/modules/ifrs9/staging"
    
    # R Analytics directories
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics"/{scripts,models,data}
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics/scripts/ifrs9"/{pd,lgd,ead,ecl}
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics/models/basic"
    
    # Frontend directories
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/ifrs9"/{dashboard,calculations,reports}
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/pages/ifrs9"
    
    # Configuration directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/config/ifrs9"
    mkdir -p "${PROJECT_ROOT}/database/migrations/ifrs9"
    mkdir -p "${PROJECT_ROOT}/database/seeds/ifrs9"
    
    log_success "IFRS 9 directory structure created"
}

# Install required R packages
install_r_packages() {
    log_info "Installing required R packages for IFRS 9..."
    
    R --slave --no-restore --no-save << 'EOF'
# Install required packages for IFRS 9 calculations
required_packages <- c(
  "jsonlite",    # JSON processing
  "readxl",      # Excel file processing  
  "dplyr",       # Data manipulation
  "lubridate",   # Date handling
  "forecast",    # Time series forecasting
  "MASS",        # Statistical functions
  "glmnet",      # Generalized linear models
  "randomForest", # Random forest models
  "survival",    # Survival analysis
  "VaR",         # Value at Risk calculations
  "plumber",     # R API framework
  "DBI",         # Database interface
  "RPostgreSQL"  # PostgreSQL connector
)

new_packages <- required_packages[!(required_packages %in% installed.packages()[,"Package"])]
if(length(new_packages)) {
  cat("Installing packages:", paste(new_packages, collapse=", "), "\n")
  install.packages(new_packages, repos="https://cran.r-project.org")
} else {
  cat("All required R packages are already installed\n")
}

# Verify installations
cat("Verifying R package installations...\n")
for(pkg in required_packages) {
  if(require(pkg, character.only=TRUE, quietly=TRUE)) {
    cat("✓", pkg, "loaded successfully\n")
  } else {
    cat("✗", pkg, "failed to load\n")
    quit(status=1)
  }
}

cat("All R packages installed and verified successfully!\n")
EOF
    
    if [[ $? -eq 0 ]]; then
        log_success "R packages installed successfully"
    else
        log_error "Failed to install R packages"
        exit 1
    fi
}

# Install backend dependencies
install_backend_dependencies() {
    log_info "Installing backend dependencies for IFRS 9..."
    
    cd "${PROJECT_ROOT}/packages/backend"
    
    # Install additional packages for IFRS 9
    pnpm add --save \
        fast-csv \
        exceljs \
        mathjs \
        moment \
        decimal.js \
        node-schedule \
        axios \
        @types/fast-csv \
        @types/mathjs \
        @types/node-schedule
    
    log_success "Backend dependencies installed"
    cd "${PROJECT_ROOT}"
}

# Install frontend dependencies
install_frontend_dependencies() {
    log_info "Installing frontend dependencies for IFRS 9..."
    
    cd "${PROJECT_ROOT}/packages/frontend"
    
    # Install chart libraries and IFRS 9 specific packages
    pnpm add --save \
        recharts \
        @mui/x-charts \
        @mui/x-data-grid \
        numeral \
        date-fns \
        react-csv \
        file-saver \
        @types/numeral \
        @types/file-saver
    
    log_success "Frontend dependencies installed"
    cd "${PROJECT_ROOT}"
}

# Generate code files
generate_ifrs9_code() {
    log_info "Generating IFRS 9 code files..."
    
    # Generate backend models
    "${SCRIPT_DIR}/../codegen/generate-ifrs9-backend.sh"
    
    # Generate R analytics scripts
    "${SCRIPT_DIR}/../codegen/generate-ifrs9-r-scripts.sh"
    
    # Generate frontend components
    "${SCRIPT_DIR}/../codegen/generate-ifrs9-frontend.sh"
    
    # Generate database migrations
    "${SCRIPT_DIR}/../codegen/generate-ifrs9-migrations.sh"
    
    log_success "IFRS 9 code files generated"
}

# Setup R analytics service
setup_r_analytics_service() {
    log_info "Setting up R analytics service..."
    
    # Create R service startup script
    cat > "${PROJECT_ROOT}/packages/r-analytics/start-r-service.sh" << 'EOF'
#!/bin/bash
# R Analytics Service Startup Script

cd "$(dirname "$0")"
R_SERVICE_PORT=${R_SERVICE_PORT:-8001}

echo "Starting R Analytics Service on port ${R_SERVICE_PORT}..."

R --slave --no-restore --no-save << REOF
library(plumber)

# Load IFRS 9 calculation functions
source("scripts/ifrs9/ifrs9_calculations.R")

# Create API
pr <- plumber::plumb("api/ifrs9_api.R")

# Start server
pr\$run(host="0.0.0.0", port=${R_SERVICE_PORT})
REOF
EOF
    
    chmod +x "${PROJECT_ROOT}/packages/r-analytics/start-r-service.sh"
    
    log_success "R analytics service setup completed"
}

# Validate installation
validate_installation() {
    log_info "Validating IFRS 9 installation..."
    
    # Check if key files exist
    local required_files=(
        "packages/backend/src/modules/ifrs9/services/EclCalculationService.ts"
        "packages/backend/src/modules/ifrs9/models/PortfolioAccount.ts"
        "packages/r-analytics/scripts/ifrs9/ifrs9_calculations.R"
        "packages/frontend/src/components/ifrs9/dashboard/IfrsCalculationDashboard.tsx"
    )
    
    local missing_files=()
    for file in "${required_files[@]}"; do
        if [[ ! -f "${PROJECT_ROOT}/${file}" ]]; then
            missing_files+=("${file}")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            log_error "  - ${file}"
        done
        exit 1
    fi
    
    # Test R service connectivity
    log_info "Testing R service connectivity..."
    timeout 10s bash -c "while ! nc -z localhost ${R_ANALYTICS_PORT:-8001}; do sleep 1; done" 2>/dev/null || {
        log_warning "R service is not running, will be started separately"
    }
    
    log_success "IFRS 9 installation validation completed"
}

# Main function
main() {
    log_info "=== DAY 3 HOUR 1: Basic IFRS 9 Data Models Setup ==="
    log_info "Objective: IFRS 9 foundation (Basic level)"
    
    # Load environment
    load_environment
    
    # Validate environment
    validate_environment
    
    # Create directories
    create_ifrs9_directories
    
    # Install dependencies
    install_r_packages
    install_backend_dependencies
    install_frontend_dependencies
    
    # Generate code
    generate_ifrs9_code
    
    # Setup services
    setup_r_analytics_service
    
    # Validate installation
    validate_installation
    
    log_success "=== DAY 3 HOUR 1 COMPLETED SUCCESSFULLY ==="
    log_success "Basic IFRS 9 Data Models foundation is ready!"
    
    echo ""
    echo "✅ IFRS 9 Components Installed:"
    echo "   📊 Basic ECL Calculations"
    echo "   📈 Simple PD Models"  
    echo "   📉 Basic LGD Calculations"
    echo "   🎯 Simple EAD Computation"
    echo "   ⏱️  12-month vs Lifetime ECL"
    echo "   🔄 Basic Staging Logic"
    echo "   🔍 Simple Credit Risk Assessment"
    echo "   📋 Excel-based Model Input"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Start R analytics service: cd packages/r-analytics && ./start-r-service.sh"
    echo "   2. Run backend: cd packages/backend && pnpm dev"
    echo "   3. Run frontend: cd packages/frontend && pnpm dev"
    echo "   4. Access IFRS 9 dashboard: http://localhost:3000/ifrs9"
    echo ""
    echo "📝 Continue with: DAY 3 HOUR 2"
}

# Execute main function with all arguments
main "$@"