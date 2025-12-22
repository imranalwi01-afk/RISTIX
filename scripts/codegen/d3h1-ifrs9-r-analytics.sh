#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/codegen/d3h1-ifrs9-r-analytics.sh
# Generated: 2025-07-22 15:30:00
# Phase: D3H1 - Basic IFRS 9 Data Models
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: R Analytics scripts generation for IFRS 9 calculations (Basic level)
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d3h1-r-analytics-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D3H1"
PHASE_NAME="Basic IFRS 9 Data Models - R Analytics"
CURRENT_PHASE="${PHASE_ID}"

# Create logs directory
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
    log_error "Code generation failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# MANDATORY: Code generation function
generate_code_file() {
    local file_path="$1"
    local file_type="$2"
    local description="$3"
    local template_content="$4"
    
    log_info "Generating ${file_type}: ${file_path}"
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "${file_path}")"
    
    # Generate file with MANDATORY path documentation
    cat > "${file_path}" << EOF
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ${file_path}
# Generated: $(date)
# Phase: ${CURRENT_PHASE} - ${PHASE_NAME}
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: ${description}
# ============================================================================

${template_content}
EOF
    
    log_success "Generated: ${file_path}"
}

# Generate Main IFRS 9 Calculations R Script
generate_ifrs9_calculations() {
    local template_content='# Load required libraries
suppressPackageStartupMessages({
  library(jsonlite)
  library(dplyr)
  library(lubridate)
  library(MASS)
  library(survival)
})

# IFRS 9 ECL Calculation Functions
# =================================

#' Calculate Probability of Default (PD) - Basic Implementation
#' 
#' @param portfolio_data Data frame with portfolio information
#' @param method PD calculation method ("historical", "through_the_cycle", "point_in_time")
#' @return Data frame with PD calculations
calculate_pd <- function(portfolio_data, method = "historical") {
  
  cat("Calculating PD using method:", method, "\n")
  
  # Basic PD calculation based on historical data
  portfolio_data <- portfolio_data %>%
    mutate(
      # Base PD rates by product type
      base_pd_12m = case_when(
        product_type == "Personal Loan" ~ 0.03,
        product_type == "Mortgage Loan" ~ 0.01,
        product_type == "Working Capital" ~ 0.025,
        product_type == "Murabaha" ~ 0.02,
        product_type == "Musharaka" ~ 0.035,
        product_type == "Mudharaba" ~ 0.04,
        TRUE ~ 0.025
      ),
      
      # Adjust for days past due
      dpd_adjustment = case_when(
        days_past_due == 0 ~ 1.0,
        days_past_due <= 30 ~ 1.2,
        days_past_due <= 60 ~ 2.0,
        days_past_due <= 90 ~ 3.5,
        TRUE ~ 5.0
      ),
      
      # Adjust for internal rating
      rating_adjustment = case_when(
        grepl("AAA|AA", internal_rating, ignore.case = TRUE) ~ 0.3,
        grepl("A", internal_rating, ignore.case = TRUE) ~ 0.7,
        grepl("BBB", internal_rating, ignore.case = TRUE) ~ 1.0,
        grepl("BB", internal_rating, ignore.case = TRUE) ~ 1.8,
        grepl("B", internal_rating, ignore.case = TRUE) ~ 3.0,
        grepl("C", internal_rating, ignore.case = TRUE) ~ 5.0,
        TRUE ~ 1.0
      ),
      
      # Industry sector adjustment
      sector_adjustment = case_when(
        industry_sector == "Manufacturing" ~ 1.0,
        industry_sector == "Trade" ~ 1.2,
        industry_sector == "Services" ~ 0.9,
        industry_sector == "Agriculture" ~ 1.5,
        industry_sector == "Mining" ~ 1.8,
        TRUE ~ 1.0
      ),
      
      # Islamic banking adjustment (generally lower risk)
      syariah_adjustment = ifelse(is_syariah_compliant, 0.85, 1.0),
      
      # Calculate final 12-month PD
      pd_12m = pmin(base_pd_12m * dpd_adjustment * rating_adjustment * 
                    sector_adjustment * syariah_adjustment, 1.0),
      
      # Calculate lifetime PD (simplified approach)
      years_to_maturity = pmax(as.numeric(maturity_date - Sys.Date()) / 365, 0.25),
      pd_lifetime = pmin(1 - (1 - pd_12m)^years_to_maturity, 1.0)
    )
  
  return(portfolio_data)
}

#' Calculate Loss Given Default (LGD) - Basic Implementation
#' 
#' @param portfolio_data Data frame with portfolio information
#' @param method LGD calculation method ("historical", "downturn", "best_estimate")
#' @return Data frame with LGD calculations
calculate_lgd <- function(portfolio_data, method = "historical") {
  
  cat("Calculating LGD using method:", method, "\n")
  
  portfolio_data <- portfolio_data %>%
    mutate(
      # Base LGD rates by product type
      base_lgd = case_when(
        product_type == "Personal Loan" ~ 0.60,
        product_type == "Mortgage Loan" ~ 0.25,
        product_type == "Working Capital" ~ 0.45,
        product_type == "Murabaha" ~ 0.35,
        product_type == "Musharaka" ~ 0.50,
        product_type == "Mudharaba" ~ 0.55,
        TRUE ~ 0.45
      ),
      
      # Collateral adjustment
      collateral_ratio = ifelse(is.na(collateral_value) | outstanding_amount == 0, 
                               0, 
                               pmin(collateral_value / outstanding_amount, 2.0)),
      
      collateral_adjustment = case_when(
        collateral_ratio >= 1.5 ~ 0.4,  # Strong collateral coverage
        collateral_ratio >= 1.0 ~ 0.6,  # Full collateral coverage
        collateral_ratio >= 0.5 ~ 0.8,  # Partial collateral coverage
        TRUE ~ 1.0                      # No/weak collateral
      ),
      
      # Customer type adjustment
      customer_adjustment = case_when(
        customer_type == "Corporate" ~ 0.9,
        customer_type == "SME" ~ 1.1,
        customer_type == "Individual" ~ 1.0,
        TRUE ~ 1.0
      ),
      
      # Guarantee adjustment
      guarantee_ratio = ifelse(is.na(guarantee_amount) | outstanding_amount == 0,
                              0,
                              pmin(guarantee_amount / outstanding_amount, 1.0)),
      
      guarantee_adjustment = ifelse(guarantee_ratio > 0, 0.7, 1.0),
      
      # Islamic product adjustment (asset-backed nature)
      syariah_lgd_adjustment = case_when(
        is_syariah_compliant & grepl("Murabaha|Ijara", product_type) ~ 0.8,
        is_syariah_compliant ~ 0.9,
        TRUE ~ 1.0
      ),
      
      # Calculate final LGD
      lgd = pmin(pmax(base_lgd * collateral_adjustment * customer_adjustment * 
                     guarantee_adjustment * syariah_lgd_adjustment, 0.05), 0.95)
    )
  
  return(portfolio_data)
}

#' Calculate Exposure at Default (EAD) - Basic Implementation
#' 
#' @param portfolio_data Data frame with portfolio information
#' @param method EAD calculation method ("current", "credit_conversion_factor", "behavioral")
#' @return Data frame with EAD calculations
calculate_ead <- function(portfolio_data, method = "current") {
  
  cat("Calculating EAD using method:", method, "\n")
  
  portfolio_data <- portfolio_data %>%
    mutate(
      # Credit Conversion Factor (CCF) by product type
      ccf = case_when(
        product_type == "Personal Loan" ~ 1.0,      # Fully drawn
        product_type == "Mortgage Loan" ~ 1.0,      # Fully drawn
        product_type == "Working Capital" ~ 0.75,   # Revolving facility
        product_type == "Murabaha" ~ 1.0,          # Asset financing
        product_type == "Musharaka" ~ 0.5,         # Partnership
        product_type == "Mudharaba" ~ 0.3,         # Investment account
        TRUE ~ 0.75
      ),
      
      # Calculate undrawn commitment
      undrawn_commitment = pmax(ifelse(is.na(committed_amount), 0, committed_amount) - 
                               outstanding_amount, 0),
      
      # Calculate EAD
      ead = outstanding_amount + (undrawn_commitment * ccf),
      
      # Ensure EAD is not less than outstanding amount
      ead = pmax(ead, outstanding_amount)
    )
  
  return(portfolio_data)
}

#' Calculate Expected Credit Loss (ECL) - Basic Implementation
#' 
#' @param portfolio_data Data frame with PD, LGD, and EAD calculations
#' @return Data frame with ECL calculations
calculate_ecl <- function(portfolio_data) {
  
  cat("Calculating ECL for", nrow(portfolio_data), "accounts\n")
  
  portfolio_data <- portfolio_data %>%
    mutate(
      # Determine discount factor (simplified - using effective interest rate or default rate)
      discount_factor = ifelse(is.na(interest_rate) | interest_rate == 0, 
                              0.95,  # Default discount factor
                              1 / (1 + pmax(interest_rate, 0.05))),
      
      # Calculate 12-month ECL (for Stage 1 accounts)
      ecl_12m = pd_12m * lgd * ead * discount_factor,
      
      # Calculate lifetime ECL (for Stage 2 and 3 accounts)
      ecl_lifetime = pd_lifetime * lgd * ead * discount_factor,
      
      # Determine final ECL based on IFRS 9 stage
      final_ecl = case_when(
        current_stage == 1 ~ ecl_12m,           # Stage 1: 12-month ECL
        current_stage == 2 ~ ecl_lifetime,     # Stage 2: Lifetime ECL
        current_stage == 3 ~ ead * lgd,        # Stage 3: Best estimate (assumed default)
        TRUE ~ ecl_12m
      ),
      
      # Calculate ECL coverage ratio
      ecl_coverage_ratio = ifelse(outstanding_amount > 0, 
                                 final_ecl / outstanding_amount * 100, 
                                 0)
    )
  
  return(portfolio_data)
}

#' Determine IFRS 9 Stage - Basic Implementation
#' 
#' @param portfolio_data Data frame with portfolio information
#' @return Data frame with stage classifications
determine_ifrs9_stage <- function(portfolio_data) {
  
  cat("Determining IFRS 9 stages for", nrow(portfolio_data), "accounts\n")
  
  portfolio_data <- portfolio_data %>%
    mutate(
      # Basic stage determination logic
      new_stage = case_when(
        # Stage 3: Credit-impaired (default)
        days_past_due >= 90 ~ 3L,
        
        # Stage 2: Significant increase in credit risk
        days_past_due >= 30 | 
        (pd_12m > 0.05 & !is.na(pd_12m)) |
        grepl("B|C", internal_rating, ignore.case = TRUE) ~ 2L,
        
        # Stage 1: Performing (no significant increase in credit risk)
        TRUE ~ 1L
      ),
      
      # Track stage changes
      stage_change_flag = ifelse(is.na(current_stage) | current_stage != new_stage, 
                                TRUE, FALSE),
      
      # Update previous stage
      previous_stage = ifelse(stage_change_flag & !is.na(current_stage), 
                             current_stage, previous_stage),
      
      # Update current stage
      current_stage = new_stage,
      
      # Update stage change date
      stage_change_date = ifelse(stage_change_flag, 
                                as.character(Sys.Date()), 
                                stage_change_date)
    ) %>%
    select(-new_stage)
  
  return(portfolio_data)
}

#' Main IFRS 9 ECL Calculation Function
#' 
#' @param portfolio_data Data frame with portfolio information
#' @param model_parameters List with calculation parameters
#' @return List with results and summary
calculate_ifrs9_ecl <- function(portfolio_data, model_parameters = list()) {
  
  cat("=== Starting IFRS 9 ECL Calculation ===\n")
  cat("Portfolio size:", nrow(portfolio_data), "accounts\n")
  cat("Calculation date:", as.character(Sys.Date()), "\n")
  
  # Set default parameters
  default_params <- list(
    pd_method = "historical",
    lgd_method = "historical", 
    ead_method = "current"
  )
  
  # Merge with provided parameters
  params <- modifyList(default_params, model_parameters)
  
  tryCatch({
    # Step 1: Determine IFRS 9 stages
    cat("\n1. Determining IFRS 9 stages...\n")
    portfolio_data <- determine_ifrs9_stage(portfolio_data)
    
    # Step 2: Calculate PD
    cat("\n2. Calculating Probability of Default (PD)...\n")
    portfolio_data <- calculate_pd(portfolio_data, params$pd_method)
    
    # Step 3: Calculate LGD
    cat("\n3. Calculating Loss Given Default (LGD)...\n")
    portfolio_data <- calculate_lgd(portfolio_data, params$lgd_method)
    
    # Step 4: Calculate EAD
    cat("\n4. Calculating Exposure at Default (EAD)...\n")
    portfolio_data <- calculate_ead(portfolio_data, params$ead_method)
    
    # Step 5: Calculate ECL
    cat("\n5. Calculating Expected Credit Loss (ECL)...\n")
    portfolio_data <- calculate_ecl(portfolio_data)
    
    # Calculate summary statistics
    summary_stats <- portfolio_data %>%
      summarise(
        total_accounts = n(),
        stage1_count = sum(current_stage == 1, na.rm = TRUE),
        stage2_count = sum(current_stage == 2, na.rm = TRUE),
        stage3_count = sum(current_stage == 3, na.rm = TRUE),
        total_outstanding = sum(outstanding_amount, na.rm = TRUE),
        total_ecl_12m = sum(ecl_12m, na.rm = TRUE),
        total_ecl_lifetime = sum(ecl_lifetime, na.rm = TRUE),
        total_final_ecl = sum(final_ecl, na.rm = TRUE),
        average_pd_12m = mean(pd_12m, na.rm = TRUE),
        average_lgd = mean(lgd, na.rm = TRUE),
        coverage_ratio = ifelse(total_outstanding > 0, 
                               total_final_ecl / total_outstanding * 100, 0),
        syariah_outstanding = sum(outstanding_amount[is_syariah_compliant == TRUE], na.rm = TRUE),
        conventional_outstanding = sum(outstanding_amount[is_syariah_compliant == FALSE], na.rm = TRUE)
      )
    
    cat("\n=== ECL Calculation Completed Successfully ===\n")
    cat("Total ECL:", format(summary_stats$total_final_ecl, big.mark = ","), "\n")
    cat("Coverage Ratio:", round(summary_stats$coverage_ratio, 2), "%\n")
    
    return(list(
      results = portfolio_data,
      summary = summary_stats,
      parameters = params,
      calculation_date = Sys.Date(),
      status = "success"
    ))
    
  }, error = function(e) {
    cat("\nERROR in IFRS 9 calculation:", e$message, "\n")
    return(list(
      results = NULL,
      summary = NULL,
      parameters = params,
      calculation_date = Sys.Date(),
      status = "error",
      error_message = e$message
    ))
  })
}

#' Validate Portfolio Data
#' 
#' @param portfolio_data Data frame to validate
#' @return List with validation results
validate_portfolio_data <- function(portfolio_data) {
  
  cat("Validating portfolio data...\n")
  
  errors <- c()
  warnings <- c()
  
  # Required columns
  required_cols <- c("account_id", "outstanding_amount", "product_type", 
                     "origination_date", "current_stage")
  
  missing_cols <- setdiff(required_cols, names(portfolio_data))
  if (length(missing_cols) > 0) {
    errors <- c(errors, paste("Missing required columns:", paste(missing_cols, collapse = ", ")))
  }
  
  # Data quality checks
  if ("outstanding_amount" %in% names(portfolio_data)) {
    if (any(portfolio_data$outstanding_amount < 0, na.rm = TRUE)) {
      errors <- c(errors, "Negative outstanding amounts found")
    }
  }
  
  if ("days_past_due" %in% names(portfolio_data)) {
    if (any(portfolio_data$days_past_due < 0, na.rm = TRUE)) {
      errors <- c(errors, "Negative days past due found")
    }
  }
  
  if ("current_stage" %in% names(portfolio_data)) {
    invalid_stages <- portfolio_data$current_stage[!portfolio_data$current_stage %in% c(1, 2, 3)]
    if (length(invalid_stages) > 0) {
      errors <- c(errors, "Invalid IFRS 9 stages found (must be 1, 2, or 3)")
    }
  }
  
  # Check for duplicates
  if ("account_id" %in% names(portfolio_data)) {
    if (any(duplicated(portfolio_data$account_id))) {
      warnings <- c(warnings, "Duplicate account IDs found")
    }
  }
  
  result <- list(
    valid = length(errors) == 0,
    errors = errors,
    warnings = warnings,
    total_records = nrow(portfolio_data),
    validation_date = Sys.Date()
  )
  
  if (result$valid) {
    cat("✅ Portfolio data validation passed\n")
  } else {
    cat("❌ Portfolio data validation failed\n")
    cat("Errors:\n")
    for (error in errors) {
      cat("  -", error, "\n")
    }
  }
  
  if (length(warnings) > 0) {
    cat("Warnings:\n")
    for (warning in warnings) {
      cat("  -", warning, "\n")
    }
  }
  
  return(result)
}

# Export functions for use in other scripts
cat("IFRS 9 calculation functions loaded successfully\n")
cat("Available functions:\n")
cat("  - calculate_ifrs9_ecl(): Main ECL calculation\n")
cat("  - validate_portfolio_data(): Data validation\n")
cat("  - determine_ifrs9_stage(): Stage classification\n")
cat("  - calculate_pd(): PD calculation\n")
cat("  - calculate_lgd(): LGD calculation\n")
cat("  - calculate_ead(): EAD calculation\n")
cat("  - calculate_ecl(): ECL calculation\n")'

    generate_code_file \
        "packages/r-analytics/scripts/ifrs9/ifrs9_calculations.R" \
        "R Script" \
        "Main IFRS 9 ECL calculation functions with comprehensive modeling" \
        "$template_content"
}

# Generate R API Service
generate_r_api_service() {
    local template_content='# Load required libraries
suppressPackageStartupMessages({
  library(plumber)
  library(jsonlite)
  library(dplyr)
  library(DBI)
  library(RPostgreSQL)
})

# Source IFRS 9 calculation functions
source("scripts/ifrs9/ifrs9_calculations.R")

# Global variables for database connection
db_config <- list(
  host = Sys.getenv("DB_HOST", "localhost"),
  port = as.integer(Sys.getenv("DB_PORT", "5432")),
  dbname = Sys.getenv("DB_NAME", "ifrspro_platform_admin"),
  user = Sys.getenv("DB_USER", "postgres"),
  password = Sys.getenv("DB_PASSWORD", "postgres")
)

#' Get database connection
get_db_connection <- function() {
  tryCatch({
    con <- dbConnect(
      RPostgreSQL::PostgreSQL(),
      host = db_config$host,
      port = db_config$port,
      dbname = db_config$dbname,
      user = db_config$user,
      password = db_config$password
    )
    return(con)
  }, error = function(e) {
    cat("Database connection error:", e$message, "\n")
    return(NULL)
  })
}

#* @apiTitle IFRS 9 R Analytics API
#* @apiDescription R-based statistical computing API for IFRS 9 calculations
#* @apiVersion 1.0.0
#* @apiContact list(name = "IFRS Pro Team", email = "support@ifrspro.id")

#* Health check endpoint
#* @get /health
#* @serializer json
function() {
  list(
    status = "healthy",
    service = "IFRS 9 R Analytics API",
    version = "1.0.0",
    r_version = R.version.string,
    timestamp = Sys.time(),
    features = list(
      ecl_calculation = TRUE,
      pd_modeling = TRUE,
      lgd_modeling = TRUE,
      ead_modeling = TRUE,
      staging_analysis = TRUE,
      portfolio_analysis = TRUE
    )
  )
}

#* Get R service information
#* @get /info
#* @serializer json
function() {
  installed_packages <- installed.packages()[, "Package"]
  required_packages <- c("jsonlite", "dplyr", "lubridate", "MASS", "survival", "plumber", "DBI", "RPostgreSQL")
  
  list(
    service = "IFRS 9 R Analytics API",
    description = "Statistical computing service for IFRS 9 ECL calculations",
    r_version = R.version.string,
    platform = R.version$platform,
    available_packages = required_packages[required_packages %in% installed_packages],
    missing_packages = required_packages[!required_packages %in% installed_packages],
    endpoints = list(
      health = "GET /health",
      info = "GET /info",
      calculate_ecl = "POST /ifrs9/calculate-ecl",
      validate_data = "POST /ifrs9/validate-data",
      portfolio_summary = "POST /ifrs9/portfolio-summary",
      staging_analysis = "POST /ifrs9/staging-analysis"
    ),
    timestamp = Sys.time()
  )
}

#* Calculate IFRS 9 ECL for portfolio
#* @post /ifrs9/calculate-ecl
#* @param portfolio_data:object Portfolio data in JSON format
#* @param model_parameters:object Optional model parameters
#* @serializer json
function(portfolio_data, model_parameters = list()) {
  
  cat("Received ECL calculation request at", as.character(Sys.time()), "\n")
  
  tryCatch({
    # Parse input data
    if (is.character(portfolio_data)) {
      portfolio_df <- fromJSON(portfolio_data)
    } else {
      portfolio_df <- portfolio_data
    }
    
    # Convert to data frame if needed
    if (!is.data.frame(portfolio_df)) {
      portfolio_df <- as.data.frame(portfolio_df)
    }
    
    cat("Processing", nrow(portfolio_df), "portfolio accounts\n")
    
    # Parse model parameters
    if (is.character(model_parameters)) {
      params <- fromJSON(model_parameters)
    } else {
      params <- model_parameters
    }
    
    # Validate data
    validation_result <- validate_portfolio_data(portfolio_df)
    if (!validation_result$valid) {
      return(list(
        success = FALSE,
        error = "Data validation failed",
        validation_errors = validation_result$errors,
        timestamp = Sys.time()
      ))
    }
    
    # Calculate ECL
    ecl_result <- calculate_ifrs9_ecl(portfolio_df, params)
    
    if (ecl_result$status == "success") {
      # Convert results to JSON-friendly format
      results_summary <- list(
        success = TRUE,
        total_accounts = ecl_result$summary$total_accounts,
        stage_distribution = list(
          stage1 = ecl_result$summary$stage1_count,
          stage2 = ecl_result$summary$stage2_count,
          stage3 = ecl_result$summary$stage3_count
        ),
        financial_summary = list(
          total_outstanding = ecl_result$summary$total_outstanding,
          total_ecl_12m = ecl_result$summary$total_ecl_12m,
          total_ecl_lifetime = ecl_result$summary$total_ecl_lifetime,
          total_final_ecl = ecl_result$summary$total_final_ecl,
          coverage_ratio = ecl_result$summary$coverage_ratio
        ),
        banking_breakdown = list(
          syariah_outstanding = ecl_result$summary$syariah_outstanding,
          conventional_outstanding = ecl_result$summary$conventional_outstanding
        ),
        risk_metrics = list(
          average_pd_12m = ecl_result$summary$average_pd_12m,
          average_lgd = ecl_result$summary$average_lgd
        ),
        model_parameters = ecl_result$parameters,
        calculation_date = ecl_result$calculation_date,
        timestamp = Sys.time()
      )
      
      # Include detailed results if requested (limit to 1000 records for performance)
      if (nrow(ecl_result$results) <= 1000) {
        results_summary$detailed_results <- ecl_result$results
      } else {
        results_summary$detailed_results_note <- "Results truncated. Use batch processing for large portfolios."
        results_summary$detailed_results <- head(ecl_result$results, 1000)
      }
      
      return(results_summary)
      
    } else {
      return(list(
        success = FALSE,
        error = "ECL calculation failed",
        error_message = ecl_result$error_message,
        timestamp = Sys.time()
      ))
    }
    
  }, error = function(e) {
    cat("Error in ECL calculation API:", e$message, "\n")
    return(list(
      success = FALSE,
      error = "Internal server error",
      error_message = e$message,
      timestamp = Sys.time()
    ))
  })
}

#* Validate portfolio data
#* @post /ifrs9/validate-data
#* @param portfolio_data:object Portfolio data in JSON format
#* @serializer json
function(portfolio_data) {
  
  cat("Received data validation request at", as.character(Sys.time()), "\n")
  
  tryCatch({
    # Parse input data
    if (is.character(portfolio_data)) {
      portfolio_df <- fromJSON(portfolio_data)
    } else {
      portfolio_df <- portfolio_data
    }
    
    # Convert to data frame if needed
    if (!is.data.frame(portfolio_df)) {
      portfolio_df <- as.data.frame(portfolio_df)
    }
    
    # Validate data
    validation_result <- validate_portfolio_data(portfolio_df)
    
    return(list(
      success = TRUE,
      validation_result = validation_result,
      timestamp = Sys.time()
    ))
    
  }, error = function(e) {
    cat("Error in data validation API:", e$message, "\n")
    return(list(
      success = FALSE,
      error = "Validation error",
      error_message = e$message,
      timestamp = Sys.time()
    ))
  })
}

#* Get portfolio summary statistics
#* @post /ifrs9/portfolio-summary
#* @param portfolio_data:object Portfolio data in JSON format
#* @serializer json
function(portfolio_data) {
  
  cat("Received portfolio summary request at", as.character(Sys.time()), "\n")
  
  tryCatch({
    # Parse input data
    if (is.character(portfolio_data)) {
      portfolio_df <- fromJSON(portfolio_data)
    } else {
      portfolio_df <- portfolio_data
    }
    
    # Convert to data frame if needed
    if (!is.data.frame(portfolio_df)) {
      portfolio_df <- as.data.frame(portfolio_df)
    }
    
    # Calculate summary statistics
    summary_stats <- portfolio_df %>%
      summarise(
        total_accounts = n(),
        total_outstanding = sum(outstanding_amount, na.rm = TRUE),
        
        # Stage distribution
        stage1_count = sum(current_stage == 1, na.rm = TRUE),
        stage2_count = sum(current_stage == 2, na.rm = TRUE),
        stage3_count = sum(current_stage == 3, na.rm = TRUE),
        
        # Product distribution
        personal_loan_count = sum(product_type == "Personal Loan", na.rm = TRUE),
        mortgage_count = sum(product_type == "Mortgage Loan", na.rm = TRUE),
        working_capital_count = sum(product_type == "Working Capital", na.rm = TRUE),
        murabaha_count = sum(product_type == "Murabaha", na.rm = TRUE),
        musharaka_count = sum(product_type == "Musharaka", na.rm = TRUE),
        mudharaba_count = sum(product_type == "Mudharaba", na.rm = TRUE),
        
        # Banking type breakdown
        syariah_count = sum(is_syariah_compliant == TRUE, na.rm = TRUE),
        conventional_count = sum(is_syariah_compliant == FALSE, na.rm = TRUE),
        syariah_outstanding = sum(outstanding_amount[is_syariah_compliant == TRUE], na.rm = TRUE),
        conventional_outstanding = sum(outstanding_amount[is_syariah_compliant == FALSE], na.rm = TRUE),
        
        # Risk indicators
        average_days_past_due = mean(days_past_due, na.rm = TRUE),
        max_days_past_due = max(days_past_due, na.rm = TRUE),
        accounts_with_collateral = sum(!is.na(collateral_value) & collateral_value > 0, na.rm = TRUE),
        total_collateral_value = sum(collateral_value, na.rm = TRUE)
      )
    
    return(list(
      success = TRUE,
      summary = summary_stats,
      timestamp = Sys.time()
    ))
    
  }, error = function(e) {
    cat("Error in portfolio summary API:", e$message, "\n")
    return(list(
      success = FALSE,
      error = "Summary calculation error",
      error_message = e$message,
      timestamp = Sys.time()
    ))
  })
}

#* Perform IFRS 9 staging analysis
#* @post /ifrs9/staging-analysis
#* @param portfolio_data:object Portfolio data in JSON format
#* @serializer json
function(portfolio_data) {
  
  cat("Received staging analysis request at", as.character(Sys.time()), "\n")
  
  tryCatch({
    # Parse input data
    if (is.character(portfolio_data)) {
      portfolio_df <- fromJSON(portfolio_data)
    } else {
      portfolio_df <- portfolio_data
    }
    
    # Convert to data frame if needed
    if (!is.data.frame(portfolio_df)) {
      portfolio_df <- as.data.frame(portfolio_df)
    }
    
    # Perform staging analysis
    portfolio_df <- determine_ifrs9_stage(portfolio_df)
    
    # Calculate staging statistics
    staging_analysis <- list(
      stage_distribution = portfolio_df %>%
        group_by(current_stage) %>%
        summarise(
          count = n(),
          outstanding = sum(outstanding_amount, na.rm = TRUE),
          percentage = round(n() / nrow(portfolio_df) * 100, 2)
        ),
      
      stage_transitions = portfolio_df %>%
        filter(!is.na(previous_stage) & previous_stage != current_stage) %>%
        group_by(previous_stage, current_stage) %>%
        summarise(count = n(), .groups = "drop"),
      
      risk_indicators = list(
        default_rate = nrow(filter(portfolio_df, current_stage == 3)) / nrow(portfolio_df) * 100,
        sicr_rate = nrow(filter(portfolio_df, current_stage == 2)) / nrow(portfolio_df) * 100,
        performing_rate = nrow(filter(portfolio_df, current_stage == 1)) / nrow(portfolio_df) * 100
      ),
      
      product_stage_analysis = portfolio_df %>%
        group_by(product_type, current_stage) %>%
        summarise(
          count = n(),
          outstanding = sum(outstanding_amount, na.rm = TRUE),
          .groups = "drop"
        ),
      
      banking_type_analysis = portfolio_df %>%
        group_by(is_syariah_compliant, current_stage) %>%
        summarise(
          count = n(),
          outstanding = sum(outstanding_amount, na.rm = TRUE),
          .groups = "drop"
        )
    )
    
    return(list(
      success = TRUE,
      staging_analysis = staging_analysis,
      updated_portfolio = portfolio_df,
      timestamp = Sys.time()
    ))
    
  }, error = function(e) {
    cat("Error in staging analysis API:", e$message, "\n")
    return(list(
      success = FALSE,
      error = "Staging analysis error",
      error_message = e$message,
      timestamp = Sys.time()
    ))
  })
}

# Start the API server
cat("IFRS 9 R Analytics API loaded successfully\n")
cat("Available endpoints:\n")
cat("  GET  /health - Health check\n")
cat("  GET  /info - Service information\n")
cat("  POST /ifrs9/calculate-ecl - ECL calculation\n")
cat("  POST /ifrs9/validate-data - Data validation\n")
cat("  POST /ifrs9/portfolio-summary - Portfolio summary\n")
cat("  POST /ifrs9/staging-analysis - Staging analysis\n")
cat("\nTo start the API server, run:\n")
cat("  pr() %>% pr_run(host=\"0.0.0.0\", port=4236)\n")'

    generate_code_file \
        "packages/r-analytics/api/ifrs9_api.R" \
        "R API Script" \
        "Plumber-based R API service for IFRS 9 calculations" \
        "$template_content"
}

# Generate R Service Configuration
generate_r_service_config() {
    local template_content='# IFRS 9 R Analytics Service Configuration
# ==========================================

# Service Information
SERVICE_NAME <- "IFRS9_R_Analytics"
SERVICE_VERSION <- "1.0.0"
SERVICE_DESCRIPTION <- "R-based statistical computing for IFRS 9 calculations"

# Server Configuration (from environment or defaults)
R_SERVICE_HOST <- Sys.getenv("R_ANALYTICS_HOST", "localhost")
R_SERVICE_PORT <- as.integer(Sys.getenv("R_ANALYTICS_PORT", "4236"))
R_SERVICE_TIMEOUT <- as.integer(Sys.getenv("R_TIMEOUT_SECONDS", "300"))

# Database Configuration
DB_CONFIG <- list(
  host = Sys.getenv("DB_HOST", "localhost"),
  port = as.integer(Sys.getenv("DB_PORT", "5432")),
  dbname = Sys.getenv("DB_NAME", "ifrspro_platform_admin"),
  user = Sys.getenv("DB_USER", "postgres"),
  password = Sys.getenv("DB_PASSWORD", "postgres"),
  max_connections = 5,
  connection_timeout = 30
)

# Calculation Limits
CALCULATION_LIMITS <- list(
  max_portfolio_size = 100000,  # Maximum number of accounts per calculation
  max_memory_mb = as.integer(Sys.getenv("R_MAX_MEMORY_MB", "2048")),
  max_execution_time = R_SERVICE_TIMEOUT,
  batch_size = 10000  # Process in batches for large portfolios
)

# Model Parameters Default Values
DEFAULT_MODEL_PARAMS <- list(
  pd_method = "historical",
  lgd_method = "historical",
  ead_method = "current",
  staging_criteria = list(
    stage1_max_dpd = 30,
    stage2_min_dpd = 31,
    stage2_max_dpd = 89,
    stage3_min_dpd = 90
  ),
  risk_adjustments = list(
    syariah_pd_factor = 0.85,
    syariah_lgd_factor = 0.9,
    collateral_max_reduction = 0.8,
    guarantee_reduction = 0.7
  )
)

# Logging Configuration
LOGGING_CONFIG <- list(
  enabled = TRUE,
  level = Sys.getenv("LOG_LEVEL", "INFO"),
  file_path = "./logs/r-analytics.log",
  max_file_size_mb = 100,
  backup_count = 5
)

# Error Handling
ERROR_CODES <- list(
  VALIDATION_ERROR = 1001,
  CALCULATION_ERROR = 1002,
  DATABASE_ERROR = 1003,
  TIMEOUT_ERROR = 1004,
  MEMORY_ERROR = 1005,
  INVALID_INPUT = 1006
)

# Performance Monitoring
PERFORMANCE_CONFIG <- list(
  enabled = TRUE,
  log_slow_queries = TRUE,
  slow_query_threshold_seconds = 30,
  memory_monitoring = TRUE,
  memory_check_interval_seconds = 60
)

# Validation Rules
VALIDATION_RULES <- list(
  required_columns = c(
    "account_id", "outstanding_amount", "product_type", 
    "origination_date", "current_stage", "is_syariah_compliant"
  ),
  optional_columns = c(
    "customer_id", "contract_id", "committed_amount", "original_amount",
    "currency_code", "maturity_date", "reporting_date", "days_past_due",
    "customer_name", "customer_type", "industry_sector", "internal_rating",
    "external_rating", "interest_rate", "profit_rate", "collateral_value",
    "collateral_type", "guarantee_amount", "syariah_contract_type"
  ),
  data_types = list(
    account_id = "character",
    outstanding_amount = "numeric",
    current_stage = "integer",
    days_past_due = "integer",
    is_syariah_compliant = "logical"
  ),
  value_ranges = list(
    outstanding_amount = c(0, Inf),
    current_stage = c(1, 3),
    days_past_due = c(0, Inf),
    interest_rate = c(0, 1),
    profit_rate = c(0, 1)
  )
)

# Initialize logging function
init_logging <- function() {
  if (LOGGING_CONFIG$enabled) {
    log_dir <- dirname(LOGGING_CONFIG$file_path)
    if (!dir.exists(log_dir)) {
      dir.create(log_dir, recursive = TRUE)
    }
    
    cat("IFRS 9 R Analytics Service - Configuration Loaded\n")
    cat("Service:", SERVICE_NAME, "v", SERVICE_VERSION, "\n")
    cat("Host:", R_SERVICE_HOST, "Port:", R_SERVICE_PORT, "\n")
    cat("Max Memory:", CALCULATION_LIMITS$max_memory_mb, "MB\n")
    cat("Log file:", LOGGING_CONFIG$file_path, "\n")
    cat("Configuration loaded at:", as.character(Sys.time()), "\n")
  }
}

# Memory monitoring function
monitor_memory <- function() {
  if (PERFORMANCE_CONFIG$memory_monitoring) {
    memory_usage <- gc()
    total_memory_mb <- sum(memory_usage[, 2]) * 0.000001  # Convert to MB
    
    if (total_memory_mb > CALCULATION_LIMITS$max_memory_mb * 0.8) {
      warning("High memory usage detected: ", round(total_memory_mb, 2), " MB")
    }
    
    return(total_memory_mb)
  }
}

# Validation helper function
validate_environment <- function() {
  cat("Validating R Analytics environment...\n")
  
  # Check required packages
  required_packages <- c("jsonlite", "dplyr", "lubridate", "MASS", "survival", "plumber")
  missing_packages <- required_packages[!required_packages %in% installed.packages()[, "Package"]]
  
  if (length(missing_packages) > 0) {
    stop("Missing required packages: ", paste(missing_packages, collapse = ", "))
  }
  
  # Check memory
  available_memory <- gc()[2, 2] * 0.000001  # Convert to MB
  if (available_memory < 100) {
    warning("Low available memory: ", round(available_memory, 2), " MB")
  }
  
  # Check database connection (if configured)
  if (nzchar(DB_CONFIG$host)) {
    tryCatch({
      con <- dbConnect(
        RPostgreSQL::PostgreSQL(),
        host = DB_CONFIG$host,
        port = DB_CONFIG$port,
        dbname = DB_CONFIG$dbname,
        user = DB_CONFIG$user,
        password = DB_CONFIG$password
      )
      dbDisconnect(con)
      cat("✅ Database connection test successful\n")
    }, error = function(e) {
      warning("Database connection test failed: ", e$message)
    })
  }
  
  cat("✅ Environment validation completed\n")
}

# Export configuration
cat("IFRS 9 R Analytics Configuration loaded\n")

# Initialize logging
init_logging()

# Validate environment on load
validate_environment()'

    generate_code_file \
        "packages/r-analytics/config/service_config.R" \
        "R Configuration" \
        "R Analytics service configuration with environment and validation" \
        "$template_content"
}

# Generate R Service Startup Script
generate_r_startup_script() {
    local template_content='#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: packages/r-analytics/start-r-service.sh
# Generated: 2025-07-22 15:30:00
# Phase: D3H1 - Basic IFRS 9 Data Models
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: R Analytics service startup script for IFRS 9 calculations
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/r-analytics-startup-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# Logging functions
log_info() {
    echo "[INFO] $(date '\''+%Y-%m-%d %H:%M:%S'\'') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '\''+%Y-%m-%d %H:%M:%S'\'') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '\''+%Y-%m-%d %H:%M:%S'\'') - $1" | tee -a "${LOG_FILE}"
}

# Load environment variables
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    source "${PROJECT_ROOT}/.env"
    log_info "Environment variables loaded"
fi

# Set default values for R Analytics
R_ANALYTICS_HOST=${R_ANALYTICS_HOST:-"localhost"}
R_ANALYTICS_PORT=${R_ANALYTICS_PORT:-4236}
R_TIMEOUT_SECONDS=${R_TIMEOUT_SECONDS:-300}

log_info "=== Starting IFRS 9 R Analytics Service ==="
log_info "Host: ${R_ANALYTICS_HOST}"
log_info "Port: ${R_ANALYTICS_PORT}"
log_info "Timeout: ${R_TIMEOUT_SECONDS} seconds"

# Check if R is installed
if ! command -v R &> /dev/null; then
    log_error "R is not installed. Please install R 4.3+ first."
    exit 1
fi

# Check if required packages are installed
log_info "Checking R package dependencies..."
R --slave --no-restore --no-save << '\''REOF'\''
required_packages <- c("plumber", "jsonlite", "dplyr", "lubridate", "MASS", "survival", "DBI", "RPostgreSQL")
missing_packages <- required_packages[!required_packages %in% installed.packages()[, "Package"]]

if (length(missing_packages) > 0) {
    cat("Missing packages:", paste(missing_packages, collapse = ", "), "\n")
    cat("Installing missing packages...\n")
    install.packages(missing_packages, repos = "https://cran.r-project.org")
}

cat("All required packages are available\n")
REOF

if [[ $? -ne 0 ]]; then
    log_error "Failed to verify R packages"
    exit 1
fi

log_success "R package dependencies verified"

# Change to R analytics directory
cd "${SCRIPT_DIR}"

# Start the R Analytics API service
log_info "Starting R Analytics API service..."

# Create R startup script
cat > start_api.R << '\''REOF'\''
# Load configuration
source("config/service_config.R")

# Load API
source("api/ifrs9_api.R")

# Start the Plumber API
library(plumber)

cat("=== IFRS 9 R Analytics Service ===\n")
cat("Starting API server...\n")
cat("Host:", Sys.getenv("R_ANALYTICS_HOST", "localhost"), "\n")
cat("Port:", as.integer(Sys.getenv("R_ANALYTICS_PORT", "4236")), "\n")

# Create plumber router
pr <- pr("api/ifrs9_api.R")

# Add CORS headers
pr %>%
  pr_filter("cors", function(req, res) {
    res$setHeader("Access-Control-Allow-Origin", "*")
    res$setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    res$setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization")
    
    if (req$REQUEST_METHOD == "OPTIONS") {
      res$status <- 200
      return(list())
    } else {
      plumber::forward()
    }
  })

# Start the server
pr %>%
  pr_run(
    host = Sys.getenv("R_ANALYTICS_HOST", "localhost"),
    port = as.integer(Sys.getenv("R_ANALYTICS_PORT", "4236"))
  )
REOF

# Start R service in background
log_info "Launching R Analytics service..."

R --slave --no-restore --no-save < start_api.R &
R_PID=$!

# Save PID for later shutdown
echo $R_PID > "${PROJECT_ROOT}/logs/r-analytics.pid"

log_success "R Analytics service started with PID: $R_PID"

# Wait a moment and check if service is running
sleep 5

if kill -0 $R_PID 2>/dev/null; then
    log_success "R Analytics service is running successfully"
    log_info "Service URL: http://${R_ANALYTICS_HOST}:${R_ANALYTICS_PORT}"
    log_info "Health check: http://${R_ANALYTICS_HOST}:${R_ANALYTICS_PORT}/health"
    log_info "Service info: http://${R_ANALYTICS_HOST}:${R_ANALYTICS_PORT}/info"
    log_info "PID file: ${PROJECT_ROOT}/logs/r-analytics.pid"
    log_info "Logs: ${LOG_FILE}"
else
    log_error "R Analytics service failed to start"
    exit 1
fi

# Cleanup function
cleanup() {
    if [[ -f "${PROJECT_ROOT}/logs/r-analytics.pid" ]]; then
        R_PID=$(cat "${PROJECT_ROOT}/logs/r-analytics.pid")
        if kill -0 $R_PID 2>/dev/null; then
            log_info "Stopping R Analytics service (PID: $R_PID)..."
            kill $R_PID
            rm -f "${PROJECT_ROOT}/logs/r-analytics.pid"
            log_success "R Analytics service stopped"
        fi
    fi
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Keep script running if started in foreground
if [[ "${1:-}" == "--foreground" ]]; then
    log_info "Running in foreground mode. Press Ctrl+C to stop."
    wait $R_PID
fi'

    # Create startup script
    local script_path="packages/r-analytics/start-r-service.sh"
    log_info "Generating ${script_path}"
    mkdir -p "$(dirname "${script_path}")"
    cat > "${script_path}" << EOF
${template_content}
EOF
    chmod +x "${script_path}"
    log_success "Generated: ${script_path}"
}

# Main execution function
main() {
    log_info "Starting IFRS 9 R Analytics Code Generation..."
    
    # Generate R scripts
    generate_ifrs9_calculations
    generate_r_api_service
    generate_r_service_config
    generate_r_startup_script
    
    log_success "R Analytics code generation completed successfully"
    log_info "Generated files logged in: ${LOG_FILE}"
    
    log_info "Next: Frontend components generation..."
}

# Execute main function
main "$@"