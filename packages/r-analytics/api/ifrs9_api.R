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
