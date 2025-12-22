#!/bin/bash
# scripts/development/d2h3-basic-ifrs9-r-integration-setup.sh
# Day 2 Hour 3: Basic IFRS 9 R Integration Setup Script
# OBJECTIVE: R API integration for IFRS 9 calculations (Basic level)

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-r-integration-$(date +%Y%m%d-%H%M%S).log"

# Ensure logs directory exists
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
    log_info "Validating environment for R Analytics integration..."
    
    # Check R installation
    if ! command -v R &> /dev/null; then
        log_error "R is not installed. Please install R 4.3+ first"
        exit 1
    fi
    
    local r_version=$(R --version | head -n1 | grep -oE 'R version [0-9]+\.[0-9]+\.[0-9]+' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    local required_r_version="4.3.0"
    
    if ! printf '%s\n%s\n' "${required_r_version}" "${r_version}" | sort -V -C; then
        log_error "R version ${r_version} is below required ${required_r_version}"
        exit 1
    fi
    
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
    
    # Check database connectivity
    if ! pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}"; then
        log_error "PostgreSQL database is not accessible"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Setup R Analytics directory structure
setup_r_analytics_structure() {
    log_info "Setting up R Analytics directory structure..."
    
    local r_dir="${PROJECT_ROOT}/packages/r-analytics"
    
    # Create main R analytics directories
    mkdir -p "${r_dir}"/{src,scripts,models,data,config,tests,logs}
    mkdir -p "${r_dir}/src"/{controllers,services,utils,middleware}
    mkdir -p "${r_dir}/scripts"/{ecl,models,utilities,validation}
    mkdir -p "${r_dir}/models"/{trained,parameters,validation}
    mkdir -p "${r_dir}/data"/{sample,test,exports}
    mkdir -p "${r_dir}/config"/{environments,models,database}
    
    log_success "R Analytics directory structure created"
}

# Install required R packages
install_r_packages() {
    log_info "Installing required R packages for IFRS 9 calculations..."
    
    # Create R package installation script
    cat > "${PROJECT_ROOT}/packages/r-analytics/install-packages.R" << 'EOF'
# Install required R packages for IFRS 9 analytics
# packages/r-analytics/install-packages.R

# Set CRAN mirror
options(repos = c(CRAN = "https://cran.rstudio.com/"))

# Define required packages
required_packages <- c(
  # Database connectivity
  "DBI",
  "RPostgreSQL",
  "odbc",
  
  # Data manipulation
  "dplyr",
  "tidyr",
  "data.table",
  "lubridate",
  
  # Statistical modeling
  "survival",
  "MASS",
  "forecast",
  "VaR",
  "PerformanceAnalytics",
  
  # Financial modeling
  "quantmod",
  "RQuantLib",
  "fBasics",
  
  # Machine learning
  "randomForest",
  "glmnet",
  "caret",
  
  # JSON and API
  "jsonlite",
  "httr",
  "curl",
  
  # Visualization
  "ggplot2",
  "plotly",
  "lattice",
  
  # Web service
  "plumber",
  "httpuv",
  
  # Utilities
  "devtools",
  "testthat",
  "logr"
)

# Function to install packages if not already installed
install_if_missing <- function(packages) {
  for (pkg in packages) {
    if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
      cat(paste("Installing package:", pkg, "\n"))
      install.packages(pkg, dependencies = TRUE)
      
      if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
        stop(paste("Failed to install package:", pkg))
      } else {
        cat(paste("Successfully installed:", pkg, "\n"))
      }
    } else {
      cat(paste("Package already installed:", pkg, "\n"))
    }
  }
}

# Install packages
cat("Starting R package installation for IFRS 9 Platform...\n")
install_if_missing(required_packages)

# Verify installations
cat("\nVerifying package installations...\n")
for (pkg in required_packages) {
  if (require(pkg, character.only = TRUE, quietly = TRUE)) {
    cat(paste("✓", pkg, "- OK\n"))
  } else {
    cat(paste("✗", pkg, "- FAILED\n"))
  }
}

cat("\nR packages installation completed for IFRS 9 Platform!\n")
EOF

    # Execute R package installation
    log_info "Executing R package installation (this may take several minutes)..."
    cd "${PROJECT_ROOT}/packages/r-analytics"
    R --vanilla --quiet < install-packages.R
    
    log_success "R packages installed successfully"
}

# Setup R service configuration
setup_r_service_config() {
    log_info "Setting up R service configuration..."
    
    # Create main R service configuration
    cat > "${PROJECT_ROOT}/packages/r-analytics/config/r-service.json" << EOF
{
  "service": {
    "name": "IFRS9 R Analytics Service",
    "version": "1.0.0",
    "port": 8001,
    "host": "0.0.0.0",
    "debug": true
  },
  "database": {
    "host": "${DB_HOST:-localhost}",
    "port": ${DB_PORT:-5432},
    "user": "${DB_USER:-postgres}",
    "password": "${DB_PASSWORD:-postgres}",
    "platform_db": "ifrspro_platform_admin",
    "shared_db": "ifrspro_shared_services",
    "tenant_conventional_db": "ifrspro_tenant_demo_conventional",
    "tenant_syariah_db": "ifrspro_tenant_demo_syariah"
  },
  "models": {
    "max_memory_mb": 2048,
    "timeout_seconds": 300,
    "parallel_processing": true,
    "max_parallel_jobs": 4
  },
  "ecl_calculations": {
    "default_confidence_level": 0.95,
    "simulation_iterations": 10000,
    "staging_threshold_12m": 30,
    "staging_threshold_lifetime": 90,
    "default_lgd": 0.45,
    "economic_scenarios": ["base", "upside", "downside"]
  },
  "logging": {
    "level": "info",
    "file": "./logs/r-service.log",
    "max_size_mb": 100,
    "max_files": 10
  }
}
EOF

    # Create database connection configuration
    cat > "${PROJECT_ROOT}/packages/r-analytics/config/database.R" << 'EOF'
# packages/r-analytics/config/database.R
# Database connection configuration for R Analytics Service

library(DBI)
library(RPostgreSQL)
library(jsonlite)

# Load configuration
config_file <- file.path(getwd(), "config", "r-service.json")
if (!file.exists(config_file)) {
  stop("Configuration file not found: ", config_file)
}

config <- fromJSON(config_file)

# Database connection function
create_db_connection <- function(database_name = NULL) {
  tryCatch({
    # Use specific database or default to platform admin
    db_name <- ifelse(is.null(database_name), 
                     config$database$platform_db, 
                     database_name)
    
    # Create connection
    conn <- dbConnect(
      PostgreSQL(),
      host = config$database$host,
      port = config$database$port,
      dbname = db_name,
      user = config$database$user,
      password = config$database$password
    )
    
    cat("Connected to database:", db_name, "\n")
    return(conn)
    
  }, error = function(e) {
    stop("Database connection failed: ", e$message)
  })
}

# Test database connectivity
test_db_connections <- function() {
  cat("Testing database connections...\n")
  
  databases <- list(
    platform = config$database$platform_db,
    shared = config$database$shared_db,
    conventional = config$database$tenant_conventional_db,
    syariah = config$database$tenant_syariah_db
  )
  
  results <- list()
  
  for (name in names(databases)) {
    db_name <- databases[[name]]
    
    tryCatch({
      conn <- create_db_connection(db_name)
      
      # Test query
      result <- dbGetQuery(conn, "SELECT 1 as test")
      dbDisconnect(conn)
      
      results[[name]] <- list(status = "SUCCESS", database = db_name)
      cat("✓", name, "database connection OK\n")
      
    }, error = function(e) {
      results[[name]] <- list(status = "FAILED", database = db_name, error = e$message)
      cat("✗", name, "database connection FAILED:", e$message, "\n")
    })
  }
  
  return(results)
}

# Execute connection test
connection_test_results <- test_db_connections()
EOF

    log_success "R service configuration created"
}

# Setup Node.js Express API for R integration
setup_express_r_api() {
    log_info "Setting up Express.js API for R integration..."
    
    # Create package.json for R analytics service
    cat > "${PROJECT_ROOT}/packages/r-analytics/package.json" << EOF
{
  "name": "@ifrspro/r-analytics",
  "version": "1.0.0",
  "description": "R Analytics API Service for IFRS 9 Platform",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "r-test": "Rscript scripts/test-connection.R",
    "r-install": "Rscript install-packages.R"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "rate-limiter-flexible": "^2.4.1",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0",
    "winston": "^3.10.0",
    "dotenv": "^16.3.1",
    "node-cron": "^3.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3"
  },
  "keywords": [
    "ifrs9",
    "r-analytics",
    "banking",
    "ecl-calculations",
    "statistical-modeling"
  ],
  "author": "IFRS Pro Platform Team",
  "license": "MIT"
}
EOF

    # Install Node.js dependencies
    log_info "Installing Node.js dependencies for R Analytics API..."
    cd "${PROJECT_ROOT}/packages/r-analytics"
    pnpm install
    
    log_success "Express.js R API dependencies installed"
}

# Create basic R statistical scripts for ECL calculations
create_basic_ecl_scripts() {
    log_info "Creating basic R statistical scripts for ECL calculations..."
    
    # Create main ECL calculation script
    cat > "${PROJECT_ROOT}/packages/r-analytics/scripts/ecl/basic_ecl_calculator.R" << 'EOF'
# packages/r-analytics/scripts/ecl/basic_ecl_calculator.R
# Basic ECL Calculation Functions for IFRS 9

library(dplyr)
library(survival)
library(jsonlite)

# Basic PD Model Function
calculate_basic_pd <- function(data, model_params = list()) {
  tryCatch({
    # Default parameters
    defaults <- list(
      base_pd_12m = 0.015,  # 1.5% base PD for 12 months
      base_pd_lifetime = 0.08,  # 8% base PD for lifetime
      rating_multiplier = 1.0,
      sector_adjustment = 0.0,
      economic_adjustment = 0.0
    )
    
    # Merge with provided parameters
    params <- modifyList(defaults, model_params)
    
    # Calculate adjusted PD
    data$pd_12m <- pmax(0.0001, 
                       params$base_pd_12m * 
                       params$rating_multiplier * 
                       (1 + params$sector_adjustment) * 
                       (1 + params$economic_adjustment))
    
    data$pd_lifetime <- pmax(0.0001,
                            params$base_pd_lifetime * 
                            params$rating_multiplier * 
                            (1 + params$sector_adjustment) * 
                            (1 + params$economic_adjustment))
    
    return(data)
    
  }, error = function(e) {
    stop("PD calculation failed: ", e$message)
  })
}

# Basic LGD Calculation Function
calculate_basic_lgd <- function(data, model_params = list()) {
  tryCatch({
    # Default parameters
    defaults <- list(
      base_lgd = 0.45,  # 45% base LGD
      secured_discount = 0.2,  # 20% discount for secured loans
      unsecured_premium = 0.1,  # 10% premium for unsecured loans
      collateral_haircut = 0.3  # 30% haircut on collateral value
    )
    
    # Merge with provided parameters
    params <- modifyList(defaults, model_params)
    
    # Initialize LGD with base rate
    data$lgd <- params$base_lgd
    
    # Adjust for collateral (if exists)
    if ("collateral_value" %in% names(data) && "outstanding_amount" %in% names(data)) {
      collateral_ratio <- pmin(1, (data$collateral_value * (1 - params$collateral_haircut)) / data$outstanding_amount)
      data$lgd <- data$lgd * (1 - collateral_ratio * params$secured_discount)
    }
    
    # Ensure LGD is within bounds
    data$lgd <- pmax(0.05, pmin(0.95, data$lgd))
    
    return(data)
    
  }, error = function(e) {
    stop("LGD calculation failed: ", e$message)
  })
}

# Basic EAD Calculation Function
calculate_basic_ead <- function(data, model_params = list()) {
  tryCatch({
    # Default parameters
    defaults <- list(
      credit_conversion_factor = 0.75,  # 75% CCF for undrawn commitments
      usage_given_default = 0.85       # 85% usage at default
    )
    
    # Merge with provided parameters
    params <- modifyList(defaults, model_params)
    
    # Calculate EAD
    if ("outstanding_amount" %in% names(data)) {
      data$ead <- data$outstanding_amount
      
      # Add undrawn commitments if available
      if ("committed_amount" %in% names(data)) {
        undrawn <- pmax(0, data$committed_amount - data$outstanding_amount)
        data$ead <- data$ead + (undrawn * params$credit_conversion_factor)
      }
    } else {
      stop("Outstanding amount is required for EAD calculation")
    }
    
    return(data)
    
  }, error = function(e) {
    stop("EAD calculation failed: ", e$message)
  })
}

# Staging Logic Function
determine_staging <- function(data, staging_params = list()) {
  tryCatch({
    # Default staging parameters
    defaults <- list(
      stage1_dpd_threshold = 30,
      stage2_dpd_threshold = 90,
      stage2_sicr_threshold = 2.0,  # Significant increase in credit risk
      stage3_default_threshold = 90
    )
    
    # Merge with provided parameters
    params <- modifyList(defaults, staging_params)
    
    # Initialize all accounts as Stage 1
    data$current_stage <- 1
    
    # Check for days past due (if available)
    if ("days_past_due" %in% names(data)) {
      # Stage 2: 30+ DPD but less than 90 DPD
      data$current_stage[data$days_past_due >= params$stage1_dpd_threshold & 
                        data$days_past_due < params$stage3_default_threshold] <- 2
      
      # Stage 3: 90+ DPD (default)
      data$current_stage[data$days_past_due >= params$stage3_default_threshold] <- 3
    }
    
    # Check for SICR (Significant Increase in Credit Risk)
    if ("pd_current" %in% names(data) && "pd_origination" %in% names(data)) {
      sicr_ratio <- data$pd_current / data$pd_origination
      data$current_stage[sicr_ratio >= params$stage2_sicr_threshold & 
                        data$current_stage == 1] <- 2
    }
    
    return(data)
    
  }, error = function(e) {
    stop("Staging determination failed: ", e$message)
  })
}

# Main ECL Calculation Function
calculate_basic_ecl <- function(data, calculation_params = list()) {
  tryCatch({
    cat("Starting basic ECL calculation for", nrow(data), "accounts...\n")
    
    # Step 1: Calculate PD
    data <- calculate_basic_pd(data, calculation_params$pd_params)
    cat("✓ PD calculation completed\n")
    
    # Step 2: Calculate LGD
    data <- calculate_basic_lgd(data, calculation_params$lgd_params)
    cat("✓ LGD calculation completed\n")
    
    # Step 3: Calculate EAD
    data <- calculate_basic_ead(data, calculation_params$ead_params)
    cat("✓ EAD calculation completed\n")
    
    # Step 4: Determine staging
    data <- determine_staging(data, calculation_params$staging_params)
    cat("✓ Staging determination completed\n")
    
    # Step 5: Calculate ECL based on staging
    data$ecl_12m <- 0
    data$ecl_lifetime <- 0
    
    # Stage 1: 12-month ECL
    stage1_accounts <- data$current_stage == 1
    if (sum(stage1_accounts) > 0) {
      data$ecl_12m[stage1_accounts] <- data$pd_12m[stage1_accounts] * 
                                      data$lgd[stage1_accounts] * 
                                      data$ead[stage1_accounts]
    }
    
    # Stage 2 & 3: Lifetime ECL
    stage23_accounts <- data$current_stage %in% c(2, 3)
    if (sum(stage23_accounts) > 0) {
      data$ecl_lifetime[stage23_accounts] <- data$pd_lifetime[stage23_accounts] * 
                                            data$lgd[stage23_accounts] * 
                                            data$ead[stage23_accounts]
    }
    
    # Final ECL (use 12m for Stage 1, lifetime for Stage 2&3)
    data$ecl_amount <- ifelse(data$current_stage == 1, 
                             data$ecl_12m, 
                             data$ecl_lifetime)
    
    cat("✓ ECL calculation completed\n")
    cat("Summary:\n")
    cat("  Stage 1 accounts:", sum(data$current_stage == 1), "\n")
    cat("  Stage 2 accounts:", sum(data$current_stage == 2), "\n")
    cat("  Stage 3 accounts:", sum(data$current_stage == 3), "\n")
    cat("  Total ECL:", round(sum(data$ecl_amount, na.rm = TRUE), 2), "\n")
    
    return(data)
    
  }, error = function(e) {
    stop("ECL calculation failed: ", e$message)
  })
}

# Export results to JSON
export_ecl_results <- function(data, output_file = NULL) {
  tryCatch({
    # Prepare summary results
    summary_results <- list(
      calculation_date = Sys.time(),
      total_accounts = nrow(data),
      total_exposure = sum(data$ead, na.rm = TRUE),
      total_ecl = sum(data$ecl_amount, na.rm = TRUE),
      staging_summary = table(data$current_stage),
      stage_breakdown = data %>%
        group_by(current_stage) %>%
        summarise(
          count = n(),
          total_exposure = sum(ead, na.rm = TRUE),
          total_ecl = sum(ecl_amount, na.rm = TRUE),
          avg_pd = mean(ifelse(current_stage == 1, pd_12m, pd_lifetime), na.rm = TRUE),
          avg_lgd = mean(lgd, na.rm = TRUE),
          .groups = 'drop'
        )
    )
    
    # Convert results to JSON
    results_json <- toJSON(summary_results, pretty = TRUE, auto_unbox = TRUE)
    
    # Save to file if specified
    if (!is.null(output_file)) {
      writeLines(results_json, output_file)
      cat("Results exported to:", output_file, "\n")
    }
    
    return(list(
      summary = summary_results,
      detailed_data = data,
      json_output = results_json
    ))
    
  }, error = function(e) {
    stop("Results export failed: ", e$message)
  })
}

cat("Basic ECL calculation functions loaded successfully!\n")
EOF

    log_success "Basic ECL calculation scripts created"
}

# Main execution function
main() {
    log_info "Starting Day 2 Hour 3: Basic IFRS 9 R Integration Setup..."
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,tmp}
    
    # Execute setup steps
    validate_environment
    setup_r_analytics_structure
    install_r_packages
    setup_r_service_config
    setup_express_r_api
    create_basic_ecl_scripts
    
    log_success "Day 2 Hour 3 setup completed successfully!"
    log_info "Next step: Run d2h3-create-r-api-service.sh to create the Express API service"
    
    # Create continue script for next step
    cat > "${PROJECT_ROOT}/scripts/development/d2h3-continue.sh" << 'EOF'
#!/bin/bash
# Continue script for Day 2 Hour 3
echo "Continuing with R API service creation..."
./scripts/development/d2h3-create-r-api-service.sh
EOF
    chmod +x "${PROJECT_ROOT}/scripts/development/d2h3-continue.sh"
}

# Execute main function with all arguments
main "$@"