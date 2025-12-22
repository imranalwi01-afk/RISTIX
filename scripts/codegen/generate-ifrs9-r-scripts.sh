#!/bin/bash
# scripts/codegen/generate-ifrs9-r-scripts.sh
# IFRS 9 R Analytics Scripts Generator - DAY 3 HOUR 1

set -e
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
R_DIR="${PROJECT_ROOT}/packages/r-analytics"

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Generate main IFRS 9 calculations file
generate_ifrs9_calculations() {
    log_info "Generating main IFRS 9 calculations..."
    
    cat > "${R_DIR}/scripts/ifrs9/ifrs9_calculations.R" << 'EOF'
# packages/r-analytics/scripts/ifrs9/ifrs9_calculations.R
# Basic IFRS 9 ECL Calculations - DAY 3 HOUR 1
# Objective: Provide basic ECL calculation functions for IFRS 9 compliance

library(dplyr)
library(lubridate)
library(jsonlite)
library(MASS)
library(survival)

#' Basic Probability of Default (PD) Calculation
#' 
#' @param portfolio_data Data frame containing portfolio accounts
#' @param method Method for PD calculation ("historical", "logistic", "market")
#' @return Data frame with PD_12M and PD_Lifetime columns
calculate_basic_pd <- function(portfolio_data, method = "historical") {
  
  cat("Calculating PD using method:", method, "\n")
  
  # Ensure required columns exist
  required_cols <- c("account_id", "days_past_due", "internal_rating", "origination_date")
  missing_cols <- setdiff(required_cols, names(portfolio_data))
  if (length(missing_cols) > 0) {
    stop(paste("Missing required columns:", paste(missing_cols, collapse = ", ")))
  }
  
  if (method == "historical") {
    return(calculate_historical_pd(portfolio_data))
  } else if (method == "logistic") {
    return(calculate_logistic_pd(portfolio_data))
  } else {
    return(calculate_market_pd(portfolio_data))
  }
}

#' Historical PD Calculation (Basic)
calculate_historical_pd <- function(portfolio_data) {
  
  # Rating-based PD mapping (simplified)
  rating_pd_map <- data.frame(
    internal_rating = c("AAA", "AA+", "AA", "AA-", "A+", "A", "A-", 
                       "BBB+", "BBB", "BBB-", "BB+", "BB", "BB-",
                       "B+", "B", "B-", "CCC+", "CCC", "CCC-", "CC", "C", "D"),
    base_pd_12m = c(0.001, 0.002, 0.003, 0.005, 0.008, 0.012, 0.018,
                    0.025, 0.035, 0.050, 0.075, 0.100, 0.150,
                    0.200, 0.300, 0.450, 0.600, 0.750, 0.900, 0.950, 0.990, 1.000),
    stringsAsFactors = FALSE
  )
  
  # Merge with portfolio data
  pd_data <- portfolio_data %>%
    left_join(rating_pd_map, by = "internal_rating") %>%
    mutate(
      base_pd_12m = ifelse(is.na(base_pd_12m), 0.05, base_pd_12m),  # Default 5% if no rating
      
      # Adjust PD for Days Past Due
      dpd_adjustment = case_when(
        days_past_due == 0 ~ 1.0,
        days_past_due <= 30 ~ 1.2,
        days_past_due <= 60 ~ 1.5,
        days_past_due <= 90 ~ 2.0,
        TRUE ~ 3.0
      ),
      
      # Calculate years from origination
      years_from_origination = as.numeric(difftime(Sys.Date(), as.Date(origination_date), units = "days")) / 365.25,
      
      # Age adjustment factor
      age_factor = pmin(1 + years_from_origination * 0.1, 2.0),
      
      # Final PD calculations
      PD_12M = pmin(base_pd_12m * dpd_adjustment * age_factor, 1.0),
      PD_Lifetime = pmin(PD_12M * 2.5, 1.0)  # Simplified lifetime PD
    ) %>%
    select(account_id, PD_12M, PD_Lifetime)
  
  return(pd_data)
}

#' Logistic Regression PD Calculation (Basic)
calculate_logistic_pd <- function(portfolio_data) {
  
  # Prepare data for logistic regression
  model_data <- portfolio_data %>%
    mutate(
      # Create binary default indicator (simplified)
      default_indicator = ifelse(days_past_due > 90, 1, 0),
      
      # Create features
      log_outstanding = log(pmax(outstanding_amount, 1)),
      dpd_buckets = cut(days_past_due, 
                       breaks = c(-1, 0, 30, 60, 90, Inf),
                       labels = c("Current", "DPD_30", "DPD_60", "DPD_90", "Default")),
      years_from_origination = as.numeric(difftime(Sys.Date(), as.Date(origination_date), units = "days")) / 365.25
    )
  
  # Simple logistic regression model
  tryCatch({
    pd_model <- glm(default_indicator ~ log_outstanding + years_from_origination + dpd_buckets,
                    data = model_data,
                    family = binomial(link = "logit"))
    
    # Predict PD
    predicted_pd <- predict(pd_model, type = "response")
    
    pd_results <- data.frame(
      account_id = portfolio_data$account_id,
      PD_12M = pmin(predicted_pd, 1.0),
      PD_Lifetime = pmin(predicted_pd * 2.5, 1.0)
    )
    
  }, error = function(e) {
    # Fallback to historical method if logistic regression fails
    cat("Logistic regression failed, falling back to historical method\n")
    pd_results <- calculate_historical_pd(portfolio_data)
  })
  
  return(pd_results)
}

#' Market-based PD Calculation (Placeholder)
calculate_market_pd <- function(portfolio_data) {
  # For basic implementation, use historical method
  return(calculate_historical_pd(portfolio_data))
}

#' Basic Loss Given Default (LGD) Calculation
#' 
#' @param portfolio_data Data frame containing portfolio accounts
#' @param method Method for LGD calculation ("historical", "beta", "workout")
#' @return Data frame with LGD column
calculate_basic_lgd <- function(portfolio_data, method = "historical") {
  
  cat("Calculating LGD using method:", method, "\n")
  
  lgd_data <- portfolio_data %>%
    mutate(
      # Base LGD by product type
      base_lgd = case_when(
        grepl("mortgage|home", tolower(product_type)) ~ 0.35,
        grepl("auto|vehicle", tolower(product_type)) ~ 0.55,
        grepl("personal|unsecured", tolower(product_type)) ~ 0.75,
        grepl("credit card", tolower(product_type)) ~ 0.85,
        TRUE ~ 0.45  # Default LGD
      ),
      
      # Adjust for collateral
      collateral_adjustment = case_when(
        !is.na(collateral_value) & collateral_value > 0 ~ 0.8,
        grepl("real_estate|property", tolower(collateral_type %||% "")) ~ 0.7,
        grepl("vehicle|machinery", tolower(collateral_type %||% "")) ~ 0.9,
        grepl("cash|deposit", tolower(collateral_type %||% "")) ~ 0.1,
        TRUE ~ 1.0
      ),
      
      # Islamic banking adjustment (typically lower LGD due to asset backing)
      islamic_adjustment = ifelse(is_syariah_compliant == TRUE, 0.9, 1.0),
      
      # Final LGD calculation
      LGD = pmin(base_lgd * collateral_adjustment * islamic_adjustment, 1.0)
    ) %>%
    select(account_id, LGD)
  
  return(lgd_data)
}

#' Basic Exposure at Default (EAD) Calculation
#' 
#' @param portfolio_data Data frame containing portfolio accounts
#' @param method Method for EAD calculation ("current", "stressed", "regulatory")
#' @return Data frame with EAD column
calculate_basic_ead <- function(portfolio_data, method = "current") {
  
  cat("Calculating EAD using method:", method, "\n")
  
  ead_data <- portfolio_data %>%
    mutate(
      # Current exposure
      current_exposure = outstanding_amount,
      
      # Undrawn commitment
      undrawn_commitment = pmax(committed_amount - outstanding_amount, 0),
      
      # Credit Conversion Factor (CCF)
      ccf = case_when(
        grepl("credit card|revolving", tolower(product_type)) ~ 0.75,
        grepl("line of credit", tolower(product_type)) ~ 0.50,
        grepl("term loan|mortgage", tolower(product_type)) ~ 0.00,  # Fully drawn
        TRUE ~ 0.75  # Default CCF
      ),
      
      # Stressed CCF (higher conversion in stressed scenarios)
      stressed_ccf = case_when(
        method == "stressed" ~ pmin(ccf * 1.5, 1.0),
        TRUE ~ ccf
      ),
      
      # Final EAD calculation
      EAD = current_exposure + (undrawn_commitment * if (method == "stressed") stressed_ccf else ccf)
    ) %>%
    select(account_id, EAD)
  
  return(ead_data)
}

#' IFRS 9 Stage Classification
#' 
#' @param portfolio_data Data frame containing portfolio accounts with PD values
#' @return Data frame with IFRS9_Stage column
classify_ifrs9_stage <- function(portfolio_data) {
  
  stage_data <- portfolio_data %>%
    mutate(
      # Stage 3: Default
      stage_3 = (days_past_due > 90 | 
                account_status == "default" | 
                PD_12M >= 1.0),
      
      # Stage 2: Significant increase in credit risk
      # Simplified: PD increase > 100% from origination or DPD > 30
      pd_increase_significant = (PD_12M > 0.10),  # Simplified threshold
      stage_2 = (!stage_3 & (days_past_due > 30 | pd_increase_significant)),
      
      # Stage 1: Normal credit risk
      IFRS9_Stage = case_when(
        stage_3 ~ 3L,
        stage_2 ~ 2L,
        TRUE ~ 1L
      )
    ) %>%
    select(account_id, IFRS9_Stage)
  
  return(stage_data)
}

#' Complete ECL Calculation
#' 
#' @param portfolio_data Data frame containing portfolio accounts
#' @param calculation_parameters List of calculation parameters
#' @return Data frame with complete ECL results
calculate_complete_ecl <- function(portfolio_data, calculation_parameters = list()) {
  
  cat("Starting complete ECL calculation for", nrow(portfolio_data), "accounts\n")
  
  # Set default parameters
  params <- list(
    pd_method = "historical",
    lgd_method = "historical", 
    ead_method = "current",
    forward_looking = FALSE,
    scenario_weights = list(base = 0.5, upside = 0.2, downside = 0.3)
  )
  
  # Override with provided parameters
  params[names(calculation_parameters)] <- calculation_parameters
  
  # Step 1: Calculate PD
  cat("Step 1: Calculating PD...\n")
  pd_results <- calculate_basic_pd(portfolio_data, method = params$pd_method)
  
  # Step 2: Calculate LGD
  cat("Step 2: Calculating LGD...\n")
  lgd_results <- calculate_basic_lgd(portfolio_data, method = params$lgd_method)
  
  # Step 3: Calculate EAD
  cat("Step 3: Calculating EAD...\n")
  ead_results <- calculate_basic_ead(portfolio_data, method = params$ead_method)
  
  # Step 4: Combine results
  cat("Step 4: Combining results...\n")
  combined_results <- portfolio_data %>%
    left_join(pd_results, by = "account_id") %>%
    left_join(lgd_results, by = "account_id") %>%
    left_join(ead_results, by = "account_id")
  
  # Step 5: Classify IFRS 9 stages
  cat("Step 5: Classifying IFRS 9 stages...\n")
  stage_results <- classify_ifrs9_stage(combined_results)
  combined_results <- combined_results %>%
    left_join(stage_results, by = "account_id")
  
  # Step 6: Calculate ECL
  cat("Step 6: Calculating ECL amounts...\n")
  final_results <- combined_results %>%
    mutate(
      # 12-month ECL
      ECL_12M = PD_12M * LGD * EAD,
      
      # Lifetime ECL
      ECL_Lifetime = PD_Lifetime * LGD * EAD,
      
      # Final ECL based on stage
      ECL_Final = case_when(
        IFRS9_Stage == 1 ~ ECL_12M,      # Stage 1: 12-month ECL
        IFRS9_Stage == 2 ~ ECL_Lifetime,  # Stage 2: Lifetime ECL
        IFRS9_Stage == 3 ~ ECL_Lifetime   # Stage 3: Lifetime ECL
      ),
      
      # Round to 6 decimal places
      PD_12M = round(PD_12M, 6),
      PD_Lifetime = round(PD_Lifetime, 6),
      LGD = round(LGD, 4),
      EAD = round(EAD, 2),
      ECL_12M = round(ECL_12M, 6),
      ECL_Lifetime = round(ECL_Lifetime, 6),
      ECL_Final = round(ECL_Final, 6)
    )
  
  cat("ECL calculation completed successfully!\n")
  cat("Summary:\n")
  cat("- Stage 1 accounts:", sum(final_results$IFRS9_Stage == 1), "\n")
  cat("- Stage 2 accounts:", sum(final_results$IFRS9_Stage == 2), "\n")
  cat("- Stage 3 accounts:", sum(final_results$IFRS9_Stage == 3), "\n")
  cat("- Total ECL:", format(sum(final_results$ECL_Final), big.mark = ","), "\n")
  
  return(final_results)
}

#' Aggregate ECL Results
#' 
#' @param ecl_results Data frame with ECL calculation results
#' @return List with aggregated statistics
aggregate_ecl_results <- function(ecl_results) {
  
  summary_stats <- list(
    total_accounts = nrow(ecl_results),
    stage1_accounts = sum(ecl_results$IFRS9_Stage == 1),
    stage2_accounts = sum(ecl_results$IFRS9_Stage == 2),
    stage3_accounts = sum(ecl_results$IFRS9_Stage == 3),
    total_exposure = sum(ecl_results$EAD, na.rm = TRUE),
    total_ecl_12m = sum(ecl_results$ECL_12M, na.rm = TRUE),
    total_ecl_lifetime = sum(ecl_results$ECL_Lifetime, na.rm = TRUE),
    total_ecl_final = sum(ecl_results$ECL_Final, na.rm = TRUE),
    average_pd_12m = mean(ecl_results$PD_12M, na.rm = TRUE),
    average_lgd = mean(ecl_results$LGD, na.rm = TRUE),
    ecl_coverage_ratio = sum(ecl_results$ECL_Final, na.rm = TRUE) / sum(ecl_results$EAD, na.rm = TRUE)
  )
  
  return(summary_stats)
}

#' Export ECL Results to JSON
#' 
#' @param ecl_results Data frame with ECL results
#' @param file_path Path to save JSON file
export_ecl_results <- function(ecl_results, file_path) {
  
  # Create export data
  export_data <- list(
    calculation_date = Sys.Date(),
    calculation_timestamp = Sys.time(),
    summary = aggregate_ecl_results(ecl_results),
    results = ecl_results
  )
  
  # Write to JSON
  write(toJSON(export_data, pretty = TRUE, auto_unbox = TRUE), file_path)
  
  cat("ECL results exported to:", file_path, "\n")
}

# Helper function for null coalescing
`%||%` <- function(x, y) {
  if (is.null(x) || is.na(x) || length(x) == 0) y else x
}

cat("IFRS 9 calculation functions loaded successfully!\n")
EOF

    log_success "Main IFRS 9 calculations generated"
}

# Generate R API endpoints
generate_r_api() {
    log_info "Generating R API endpoints..."
    
    cat > "${R_DIR}/api/ifrs9_api.R" << 'EOF'
# packages/r-analytics/api/ifrs9_api.R
# IFRS 9 R API Endpoints - DAY 3 HOUR 1

# Load required libraries
library(plumber)
library(jsonlite)
library(DBI)
library(RPostgreSQL)
library(dplyr)

# Source calculation functions
source("scripts/ifrs9/ifrs9_calculations.R")

# Database connection function
get_db_connection <- function() {
  tryCatch({
    con <- dbConnect(
      PostgreSQL(),
      host = Sys.getenv("DB_HOST", "localhost"),
      port = as.integer(Sys.getenv("DB_PORT", "5432")),
      dbname = Sys.getenv("DB_NAME", "postgres"),
      user = Sys.getenv("DB_USER", "postgres"),
      password = Sys.getenv("DB_PASSWORD", "postgres")
    )
    return(con)
  }, error = function(e) {
    stop(paste("Database connection failed:", e$message))
  })
}

#' @apiTitle IFRS 9 R Analytics API
#' @apiDescription Basic IFRS 9 ECL calculation endpoints
#' @apiVersion 1.0.0

#' Health check endpoint
#' @get /health
function() {
  list(
    status = "healthy",
    timestamp = Sys.time(),
    r_version = R.version.string,
    message = "IFRS 9 R Analytics Service is running"
  )
}

#' Calculate ECL for portfolio accounts
#' @post /ifrs9/calculate-ecl
#' @param req HTTP request object
#' @serializer json
function(req) {
  
  tryCatch({
    # Parse request body
    body <- jsonlite::fromJSON(rawToChar(req$postBody), flatten = TRUE)
    
    # Validate required parameters
    if (is.null(body$tenant_id)) {
      stop("tenant_id is required")
    }
    
    if (is.null(body$calculation_date)) {
      stop("calculation_date is required")  
    }
    
    # Set default parameters
    params <- list(
      pd_method = body$parameters$pd_method %||% "historical",
      lgd_method = body$parameters$lgd_method %||% "historical",
      ead_method = body$parameters$ead_method %||% "current",
      forward_looking = body$parameters$forward_looking %||% FALSE
    )
    
    # Get database connection
    con <- get_db_connection()
    on.exit(dbDisconnect(con), add = TRUE)
    
    # Build query for portfolio accounts
    where_clause <- paste("WHERE tenant_id = '", body$tenant_id, "' AND is_active = true", sep = "")
    
    if (!is.null(body$account_ids) && length(body$account_ids) > 0) {
      account_list <- paste("'", body$account_ids, "'", sep = "", collapse = ", ")
      where_clause <- paste(where_clause, " AND account_id IN (", account_list, ")")
    }
    
    # Query portfolio data
    query <- paste("
      SELECT 
        account_id,
        customer_id,
        product_type,
        outstanding_amount,
        committed_amount,
        currency_code,
        origination_date,
        maturity_date,
        current_stage,
        customer_name,
        customer_type,
        industry_sector,
        internal_rating,
        external_rating,
        is_syariah_compliant,
        syariah_contract_type,
        account_status,
        COALESCE(
          EXTRACT(DAYS FROM (CURRENT_DATE - COALESCE(last_payment_date, origination_date))), 
          0
        ) as days_past_due,
        collateral_value,
        collateral_type
      FROM core.portfolio_accounts", 
      where_clause
    )
    
    portfolio_data <- dbGetQuery(con, query)
    
    if (nrow(portfolio_data) == 0) {
      return(list(
        success = FALSE,
        error = "No portfolio accounts found for calculation",
        data = NULL
      ))
    }
    
    # Perform ECL calculation
    ecl_results <- calculate_complete_ecl(portfolio_data, params)
    
    # Generate summary
    summary <- aggregate_ecl_results(ecl_results)
    
    # Return results
    return(list(
      success = TRUE,
      data = list(
        calculation_date = body$calculation_date,
        calculation_timestamp = Sys.time(),
        parameters = params,
        summary = summary,
        results = ecl_results
      ),
      message = "ECL calculation completed successfully"
    ))
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = paste("ECL calculation failed:", e$message),
      data = NULL
    ))
  })
}

#' Calculate PD only
#' @post /ifrs9/calculate-pd
#' @param req HTTP request object
#' @serializer json
function(req) {
  
  tryCatch({
    body <- jsonlite::fromJSON(rawToChar(req$postBody), flatten = TRUE)
    
    # Validate input
    if (is.null(body$portfolio_data)) {
      stop("portfolio_data is required")
    }
    
    portfolio_data <- as.data.frame(body$portfolio_data)
    method <- body$method %||% "historical"
    
    # Calculate PD
    pd_results <- calculate_basic_pd(portfolio_data, method)
    
    return(list(
      success = TRUE,
      data = pd_results,
      message = paste("PD calculation completed using", method, "method")
    ))
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = paste("PD calculation failed:", e$message),
      data = NULL
    ))
  })
}

#' Calculate LGD only
#' @post /ifrs9/calculate-lgd
#' @param req HTTP request object
#' @serializer json
function(req) {
  
  tryCatch({
    body <- jsonlite::fromJSON(rawToChar(req$postBody), flatten = TRUE)
    
    if (is.null(body$portfolio_data)) {
      stop("portfolio_data is required")
    }
    
    portfolio_data <- as.data.frame(body$portfolio_data)
    method <- body$method %||% "historical"
    
    # Calculate LGD
    lgd_results <- calculate_basic_lgd(portfolio_data, method)
    
    return(list(
      success = TRUE,
      data = lgd_results,
      message = paste("LGD calculation completed using", method, "method")
    ))
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = paste("LGD calculation failed:", e$message),
      data = NULL
    ))
  })
}

#' Calculate EAD only
#' @post /ifrs9/calculate-ead
#' @param req HTTP request object
#' @serializer json
function(req) {
  
  tryCatch({
    body <- jsonlite::fromJSON(rawToChar(req$postBody), flatten = TRUE)
    
    if (is.null(body$portfolio_data)) {
      stop("portfolio_data is required")
    }
    
    portfolio_data <- as.data.frame(body$portfolio_data)
    method <- body$method %||% "current"
    
    # Calculate EAD
    ead_results <- calculate_basic_ead(portfolio_data, method)
    
    return(list(
      success = TRUE,
      data = ead_results,
      message = paste("EAD calculation completed using", method, "method")
    ))
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = paste("EAD calculation failed:", e$message),
      data = NULL
    ))
  })
}

#' Get IFRS 9 model configuration
#' @get /ifrs9/model-config
#' @param tenant_id Tenant identifier
#' @serializer json
function(tenant_id = "") {
  
  tryCatch({
    if (tenant_id == "") {
      stop("tenant_id parameter is required")
    }
    
    # Get database connection
    con <- get_db_connection()
    on.exit(dbDisconnect(con), add = TRUE)
    
    # Query model configurations
    query <- "
      SELECT 
        model_name,
        model_type,
        parameters,
        is_active
      FROM configuration.model_configurations 
      WHERE tenant_id = $1 AND is_active = true
    "
    
    config_data <- dbGetQuery(con, query, params = list(tenant_id))
    
    return(list(
      success = TRUE,
      data = config_data,
      message = "Model configuration retrieved successfully"
    ))
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = paste("Failed to retrieve model configuration:", e$message),
      data = NULL
    ))
  })
}

#' Validate portfolio data
#' @post /ifrs9/validate-data
#' @param req HTTP request object
#' @serializer json
function(req) {
  
  tryCatch({
    body <- jsonlite::fromJSON(rawToChar(req$postBody), flatten = TRUE)
    
    if (is.null(body$portfolio_data)) {
      stop("portfolio_data is required")
    }
    
    portfolio_data <- as.data.frame(body$portfolio_data)
    
    # Required columns for IFRS 9 calculation
    required_columns <- c(
      "account_id", "outstanding_amount", "origination_date", 
      "product_type", "customer_type", "current_stage"
    )
    
    missing_columns <- setdiff(required_columns, names(portfolio_data))
    
    # Data quality checks
    validation_results <- list(
      total_records = nrow(portfolio_data),
      missing_columns = missing_columns,
      data_quality = list(
        accounts_with_missing_amounts = sum(is.na(portfolio_data$outstanding_amount) | portfolio_data$outstanding_amount <= 0),
        accounts_with_invalid_dates = sum(is.na(as.Date(portfolio_data$origination_date))),
        accounts_with_missing_ratings = sum(is.na(portfolio_data$internal_rating) | portfolio_data$internal_rating == ""),
        unique_account_ids = length(unique(portfolio_data$account_id))
      ),
      validation_passed = length(missing_columns) == 0
    )
    
    return(list(
      success = TRUE,
      data = validation_results,
      message = if (validation_results$validation_passed) "Data validation passed" else "Data validation failed"
    ))
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = paste("Data validation failed:", e$message),
      data = NULL
    ))
  })
}
EOF

    log_success "R API endpoints generated"
}

# Generate R service configuration
generate_r_config() {
    log_info "Generating R service configuration..."
    
    cat > "${R_DIR}/config/r_service_config.R" << 'EOF'
# packages/r-analytics/config/r_service_config.R
# R Service Configuration - IFRS 9 Analytics

# Service Configuration
R_SERVICE_CONFIG <- list(
  port = as.integer(Sys.getenv("R_SERVICE_PORT", "8001")),
  host = Sys.getenv("R_SERVICE_HOST", "0.0.0.0"),
  threads = as.integer(Sys.getenv("R_SERVICE_THREADS", "1")),
  max_memory_mb = as.integer(Sys.getenv("R_MAX_MEMORY_MB", "2048")),
  timeout_seconds = as.integer(Sys.getenv("R_TIMEOUT_SECONDS", "300"))
)

# Database Configuration
DB_CONFIG <- list(
  host = Sys.getenv("DB_HOST", "localhost"),
  port = as.integer(Sys.getenv("DB_PORT", "5432")),
  user = Sys.getenv("DB_USER", "postgres"),
  password = Sys.getenv("DB_PASSWORD", "postgres"),
  dbname = Sys.getenv("DB_NAME", "postgres")
)

# IFRS 9 Model Configuration
IFRS9_CONFIG <- list(
  default_pd_method = "historical",
  default_lgd_method = "historical",
  default_ead_method = "current",
  
  # PD Configuration
  pd_config = list(
    min_pd = 0.0001,
    max_pd = 1.0,
    default_pd = 0.05,
    rating_override = TRUE
  ),
  
  # LGD Configuration
  lgd_config = list(
    min_lgd = 0.01,
    max_lgd = 1.0,
    default_lgd = 0.45,
    collateral_adjustment = TRUE
  ),
  
  # EAD Configuration
  ead_config = list(
    default_ccf = 0.75,
    max_ccf = 1.0,
    stressed_ccf_multiplier = 1.5
  ),
  
  # Stage Classification
  stage_config = list(
    stage2_pd_threshold = 0.10,
    stage2_dpd_threshold = 30,
    stage3_dpd_threshold = 90,
    significant_increase_factor = 2.0
  )
)

# Logging Configuration
LOGGING_CONFIG <- list(
  level = Sys.getenv("LOG_LEVEL", "INFO"),
  file = Sys.getenv("LOG_FILE", "r_analytics.log"),
  max_size_mb = 100
)

cat("R Service configuration loaded successfully!\n")
cat("Service will run on:", R_SERVICE_CONFIG$host, ":", R_SERVICE_CONFIG$port, "\n")
EOF

    log_success "R service configuration generated"
}

# Main function
main() {
    log_info "Starting IFRS 9 R analytics scripts generation..."
    
    # Create directories
    mkdir -p "${R_DIR}"/{scripts,api,config,models,data}
    mkdir -p "${R_DIR}/scripts/ifrs9"/{pd,lgd,ead,ecl}
    
    # Generate R files
    generate_ifrs9_calculations
    generate_r_api
    generate_r_config
    
    log_success "IFRS 9 R analytics scripts generation completed successfully!"
}

# Execute main function
main "$@"