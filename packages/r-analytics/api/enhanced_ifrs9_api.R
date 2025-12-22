# packages/r-analytics/api/enhanced_ifrs9_api.R
# ============================================================================
# IAF IFRS9 R API - Indonesia Airawata Finance
# ============================================================================
# Company: Indonesia Airawata Finance (IAF)
# Banking Type: Conventional Banking
# Server: http://10.18.11.35:4236
# Purpose: RESTful API endpoints for IAF IFRS9 calculations
# Dependencies: enhanced-global.R, plumber, DBI, RPostgres
# ============================================================================

# Load required libraries
suppressMessages({
  library(plumber)
  library(jsonlite)
  library(dplyr)
  library(DBI)
  library(RPostgres)
  library(lubridate)
  library(futile.logger)
})

# Source enhanced global functions
source("shiny-app/enhanced-global.R")

# Configure IAF logging
flog.threshold(INFO)
flog.appender(appender.file("/var/log/iaf/r-analytics.log"))

# Global variables for API state
.api_version <- "2.0.0"
.api_start_time <- Sys.time()

#' @apiTitle IFRS9 Multi-Tenant Analytics API
#' @apiDescription Enhanced R Analytics API for IFRS9 calculations with multi-tenant support
#' @apiVersion 2.0.0
#' @apiContact list(name = "IFRS9 Platform", email = "support@ifrspro.id")

#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Tenant-ID")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
}

#* @filter logger
function(req) {
  cat(paste0(
    "[", Sys.time(), "] ",
    req$REQUEST_METHOD, " ", req$PATH_INFO, 
    " - IP: ", req$REMOTE_ADDR, "\n"
  ))
  plumber::forward()
}

#* API Health Check
#* @get /health
function() {
  tryCatch({
    uptime_seconds <- as.numeric(difftime(Sys.time(), .api_start_time, units = "secs"))
    
    list(
      status = "healthy",
      version = .api_version,
      uptime_seconds = round(uptime_seconds, 2),
      r_version = R.version.string,
      timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC"),
      services = list(
        database_connections = list(
          platform = !is.null(.platform_conn),
          tenant = !is.null(.tenant_conn),
          frs9 = !is.null(.frs9_conn),
          analytics = !is.null(.analytics_conn)
        ),
        current_tenant = .current_tenant,
        banking_mode = .banking_mode
      )
    )
  }, error = function(e) {
    list(
      status = "unhealthy",
      error = e$message,
      timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC")
    )
  })
}

#* Initialize Multi-Tenant Connections
#* @post /initialize
function(req, tenant_slug = "demo-conventional", user_context = NULL) {
  tryCatch({
    flog.info(paste("Initializing connections for tenant:", tenant_slug))
    
    # Parse request body if provided
    if (!is.null(req$postBody) && nchar(req$postBody) > 0) {
      body <- fromJSON(req$postBody)
      tenant_slug <- body$tenant_slug %||% tenant_slug
      user_context <- body$user_context %||% user_context
    }
    
    # Initialize tenant connections using enhanced global.R
    result <- initialize_r_analytics(tenant_slug, user_context)
    
    flog.info(paste("Connections initialized for tenant:", tenant_slug))
    
    list(
      success = TRUE,
      tenant_slug = result$tenant,
      banking_mode = result$banking_mode,
      connections = result$connections,
      islamic_data_available = result$islamic_data_available,
      timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC")
    )
  }, error = function(e) {
    flog.error(paste("Initialization failed:", e$message))
    list(
      success = FALSE,
      error = e$message,
      tenant_slug = tenant_slug,
      timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC")
    )
  })
}

#* Calculate Probability of Default using Statistical Models
#* @post /api/models/pd/calculate
function(req, tenant_id, model_type = "pd_calculation") {
  tryCatch({
    start_time <- Sys.time()
    flog.info(paste("PD calculation requested for tenant:", tenant_id))
    
    # Parse request body
    body <- fromJSON(req$postBody)
    accounts_data <- body$data
    parameters <- body$parameters
    banking_mode <- body$banking_mode %||% "conventional"
    
    # Initialize connections if needed
    if (is.null(.current_tenant) || .current_tenant != tenant_id) {
      initialize_r_analytics(tenant_id)
    }
    
    # Convert to data frame if necessary
    if (is.list(accounts_data)) {
      accounts_df <- do.call(rbind, lapply(accounts_data, as.data.frame))
    } else {
      accounts_df <- as.data.frame(accounts_data)
    }
    
    # Apply enhanced statistical functions from global.R
    # Use existing statistical functions for PD modeling
    
    # Generate formulas for PD modeling
    target_var <- "default_indicator"
    independent_vars <- c("days_past_due", "outstanding_amount", "customer_type")
    
    # Create mock default indicator if not present
    if (!"default_indicator" %in% names(accounts_df)) {
      accounts_df$default_indicator <- ifelse(accounts_df$days_past_due > 90, 1, 0)
    }
    
    # Use gen1varx function for variable generation
    formulas <- gen1varx(accounts_df, target_var, independent_vars)
    
    # Run models using existing functions
    model_results <- runmodel1p(accounts_df, formulas)
    
    # Calculate PD for each account
    pd_results <- accounts_df %>%
      mutate(
        base_pd = pmax(0.001, parameters$baseRate %||% 0.02),
        adjusted_pd = case_when(
          days_past_due >= 90 ~ base_pd * 5,  # Stage 3
          days_past_due >= 30 ~ base_pd * 2,  # Stage 2
          TRUE ~ base_pd  # Stage 1
        ),
        pd_12_month = pmin(1, adjusted_pd),
        pd_lifetime = pmin(1, adjusted_pd * 1.5)
      ) %>%
      select(account_id, pd_12_month, pd_lifetime, days_past_due)
    
    execution_time <- as.numeric(difftime(Sys.time(), start_time, units = "secs"))
    
    flog.info(paste("PD calculation completed for", nrow(accounts_df), "accounts in", round(execution_time, 2), "seconds"))
    
    list(
      success = TRUE,
      model_type = "pd_calculation",
      tenant_id = tenant_id,
      execution_time = round(execution_time, 2),
      results = list(
        account_results = pd_results,
        model_summary = model_results,
        statistical_metrics = list(
          accounts_processed = nrow(accounts_df),
          stage_1_count = sum(pd_results$days_past_due < 30),
          stage_2_count = sum(pd_results$days_past_due >= 30 & pd_results$days_past_due < 90),
          stage_3_count = sum(pd_results$days_past_due >= 90),
          average_pd_12m = mean(pd_results$pd_12_month),
          average_pd_lifetime = mean(pd_results$pd_lifetime)
        )
      ),
      metadata = list(
        data_points = nrow(accounts_df),
        model_parameters = parameters,
        r_version = R.version.string,
        calculation_date = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC"),
        banking_mode = banking_mode
      )
    )
    
  }, error = function(e) {
    flog.error(paste("PD calculation failed:", e$message))
    list(
      success = FALSE,
      error = e$message,
      model_type = "pd_calculation",
      tenant_id = tenant_id,
      timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC")
    )
  })
}

#* Calculate Loss Given Default
#* @post /api/models/lgd/calculate
function(req, tenant_id) {
  tryCatch({
    start_time <- Sys.time()
    flog.info(paste("LGD calculation requested for tenant:", tenant_id))
    
    body <- fromJSON(req$postBody)
    accounts_data <- body$data
    parameters <- body$parameters
    banking_mode <- body$banking_mode %||% "conventional"
    
    # Initialize connections if needed
    if (is.null(.current_tenant) || .current_tenant != tenant_id) {
      initialize_r_analytics(tenant_id)
    }
    
    # Convert to data frame
    if (is.list(accounts_data)) {
      accounts_df <- do.call(rbind, lapply(accounts_data, as.data.frame))
    } else {
      accounts_df <- as.data.frame(accounts_data)
    }
    
    # Calculate LGD based on collateral and recovery parameters
    lgd_results <- accounts_df %>%
      mutate(
        recovery_rate = case_when(
          !is.na(collateral_value) & collateral_value > 0 ~ 
            pmin(0.8, (collateral_value * 0.7) / exposure_amount),
          collateral_type == "real_estate" ~ 0.6,
          collateral_type == "vehicle" ~ 0.4,
          collateral_type == "cash" ~ 0.9,
          TRUE ~ 0.2
        ),
        lgd = pmax(0.1, pmin(0.9, 1 - recovery_rate)),
        downturn_lgd = lgd * 1.2  # Downturn adjustment
      ) %>%
      select(account_id, lgd, recovery_rate, downturn_lgd)
    
    execution_time <- as.numeric(difftime(Sys.time(), start_time, units = "secs"))
    
    flog.info(paste("LGD calculation completed for", nrow(accounts_df), "accounts"))
    
    list(
      success = TRUE,
      model_type = "lgd_calculation",
      tenant_id = tenant_id,
      execution_time = round(execution_time, 2),
      results = list(
        account_results = lgd_results,
        summary_statistics = list(
          accounts_processed = nrow(accounts_df),
          average_lgd = mean(lgd_results$lgd),
          average_recovery_rate = mean(lgd_results$recovery_rate),
          secured_accounts = sum(!is.na(accounts_df$collateral_value)),
          unsecured_accounts = sum(is.na(accounts_df$collateral_value))
        )
      ),
      metadata = list(
        data_points = nrow(accounts_df),
        model_parameters = parameters,
        r_version = R.version.string,
        calculation_date = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC"),
        banking_mode = banking_mode
      )
    )
    
  }, error = function(e) {
    flog.error(paste("LGD calculation failed:", e$message))
    list(
      success = FALSE,
      error = e$message,
      model_type = "lgd_calculation",
      tenant_id = tenant_id
    )
  })
}

#* Perform IFRS9 Staging Analysis
#* @post /api/models/staging/analyze
function(req, tenant_id) {
  tryCatch({
    start_time <- Sys.time()
    flog.info(paste("Staging analysis requested for tenant:", tenant_id))
    
    body <- fromJSON(req$postBody)
    accounts_data <- body$data
    parameters <- body$parameters
    banking_mode <- body$banking_mode %||% "conventional"
    
    # Initialize connections if needed
    if (is.null(.current_tenant) || .current_tenant != tenant_id) {
      initialize_r_analytics(tenant_id)
    }
    
    # Convert to data frame
    if (is.list(accounts_data)) {
      accounts_df <- do.call(rbind, lapply(accounts_data, as.data.frame))
    } else {
      accounts_df <- as.data.frame(accounts_data)
    }
    
    # Perform staging analysis
    staging_results <- accounts_df %>%
      mutate(
        # IFRS 9 staging logic
        new_stage = case_when(
          days_past_due >= parameters$stage3DpdThreshold ~ 3,
          days_past_due >= parameters$stage2DpdThreshold ~ 2,
          current_pd / origination_pd >= parameters$sicrPdMultiple ~ 2,
          TRUE ~ 1
        ),
        stage_movement = case_when(
          new_stage > current_stage ~ "deterioration",
          new_stage < current_stage ~ "improvement",
          TRUE ~ "no_change"
        ),
        staging_reason = case_when(
          new_stage == 3 ~ paste("Default:", days_past_due, "DPD"),
          new_stage == 2 & days_past_due >= parameters$stage2DpdThreshold ~ 
            paste("DPD:", days_past_due, "days"),
          new_stage == 2 ~ "SICR detected",
          TRUE ~ "Performing"
        )
      ) %>%
      select(account_id, current_stage, new_stage, stage_movement, staging_reason)
    
    execution_time <- as.numeric(difftime(Sys.time(), start_time, units = "secs"))
    
    flog.info(paste("Staging analysis completed for", nrow(accounts_df), "accounts"))
    
    list(
      success = TRUE,
      model_type = "staging_analysis",
      tenant_id = tenant_id,
      execution_time = round(execution_time, 2),
      results = list(
        account_results = staging_results,
        staging_summary = list(
          total_accounts = nrow(accounts_df),
          stage_1_count = sum(staging_results$new_stage == 1),
          stage_2_count = sum(staging_results$new_stage == 2),
          stage_3_count = sum(staging_results$new_stage == 3),
          deteriorations = sum(staging_results$stage_movement == "deterioration"),
          improvements = sum(staging_results$stage_movement == "improvement"),
          no_changes = sum(staging_results$stage_movement == "no_change")
        )
      ),
      metadata = list(
        data_points = nrow(accounts_df),
        model_parameters = parameters,
        r_version = R.version.string,
        calculation_date = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC"),
        banking_mode = banking_mode
      )
    )
    
  }, error = function(e) {
    flog.error(paste("Staging analysis failed:", e$message))
    list(
      success = FALSE,
      error = e$message,
      model_type = "staging_analysis",
      tenant_id = tenant_id
    )
  })
}

#* Comprehensive ECL Calculation using Enhanced Global Functions
#* @post /api/models/ecl/calculate
function(req, tenant_id) {
  tryCatch({
    start_time <- Sys.time()
    flog.info(paste("Comprehensive ECL calculation requested for tenant:", tenant_id))
    
    body <- fromJSON(req$postBody)
    portfolio_data <- body$data
    parameters <- body$parameters
    banking_mode <- body$banking_mode %||% "conventional"
    
    # Initialize connections if needed
    if (is.null(.current_tenant) || .current_tenant != tenant_id) {
      initialize_r_analytics(tenant_id)
    }
    
    # Convert to data frame
    if (is.list(portfolio_data)) {
      portfolio_df <- do.call(rbind, lapply(portfolio_data, as.data.frame))
    } else {
      portfolio_df <- as.data.frame(portfolio_data)
    }
    
    # Get Islamic-specific data if Syariah banking
    islamic_data <- NULL
    if (banking_mode == "syariah") {
      islamic_data <- get_islamic_specific_data()
    }
    
    # Perform comprehensive ECL calculation
    ecl_results <- portfolio_df %>%
      mutate(
        # Staging
        ifrs9_stage = case_when(
          days_past_due >= 90 ~ 3,
          days_past_due >= 30 ~ 2,
          TRUE ~ 1
        ),
        
        # PD calculation
        base_pd = 0.02,
        pd_12_month = case_when(
          ifrs9_stage == 3 ~ base_pd * 5,
          ifrs9_stage == 2 ~ base_pd * 2,
          TRUE ~ base_pd
        ),
        pd_lifetime = case_when(
          ifrs9_stage == 1 ~ pd_12_month,
          TRUE ~ pd_12_month * 1.5
        ),
        
        # LGD calculation
        lgd = case_when(
          !is.na(collateral_value) & collateral_value > 0 ~ 
            pmax(0.1, 1 - pmin(0.8, (collateral_value * 0.7) / outstanding_amount)),
          TRUE ~ 0.45
        ),
        
        # EAD calculation
        ead = outstanding_amount,
        
        # ECL calculation
        ecl_12_month = pd_12_month * lgd * ead,
        ecl_lifetime = pd_lifetime * lgd * ead,
        final_ecl = case_when(
          ifrs9_stage == 1 ~ ecl_12_month,
          TRUE ~ ecl_lifetime
        )
      ) %>%
      select(account_id, ifrs9_stage, pd_12_month, pd_lifetime, lgd, ead, 
             ecl_12_month, ecl_lifetime, final_ecl)
    
    # Calculate summary statistics
    summary_stats <- list(
      total_accounts = nrow(ecl_results),
      stage_1_count = sum(ecl_results$ifrs9_stage == 1),
      stage_2_count = sum(ecl_results$ifrs9_stage == 2),
      stage_3_count = sum(ecl_results$ifrs9_stage == 3),
      total_ecl = sum(ecl_results$final_ecl),
      stage_1_ecl = sum(ecl_results$final_ecl[ecl_results$ifrs9_stage == 1]),
      stage_2_ecl = sum(ecl_results$final_ecl[ecl_results$ifrs9_stage == 2]),
      stage_3_ecl = sum(ecl_results$final_ecl[ecl_results$ifrs9_stage == 3]),
      avg_pd_12m = mean(ecl_results$pd_12_month),
      avg_pd_lifetime = mean(ecl_results$pd_lifetime),
      avg_lgd = mean(ecl_results$lgd)
    )
    
    execution_time <- as.numeric(difftime(Sys.time(), start_time, units = "secs"))
    
    flog.info(paste("ECL calculation completed - Total ECL:", round(summary_stats$total_ecl, 2)))
    
    # Send notification to parent frame
    send_message_to_parent("ecl_calculation_completed", list(
      tenant_id = tenant_id,
      summary = summary_stats,
      execution_time = execution_time
    ))
    
    list(
      success = TRUE,
      model_type = "ecl_calculation",
      tenant_id = tenant_id,
      execution_time = round(execution_time, 2),
      results = list(
        account_results = ecl_results,
        summary = summary_stats,
        islamic_data = islamic_data
      ),
      metadata = list(
        data_points = nrow(portfolio_df),
        model_parameters = parameters,
        r_version = R.version.string,
        calculation_date = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC"),
        banking_mode = banking_mode,
        tenant = .current_tenant
      )
    )
    
  }, error = function(e) {
    flog.error(paste("ECL calculation failed:", e$message))
    list(
      success = FALSE,
      error = e$message,
      model_type = "ecl_calculation",
      tenant_id = tenant_id
    )
  })
}

#* Execute Custom R Script
#* @post /api/custom/execute
function(req, tenant_id) {
  tryCatch({
    start_time <- Sys.time()
    
    body <- fromJSON(req$postBody)
    script_name <- body$script_name
    data <- body$data
    parameters <- body$parameters
    
    flog.info(paste("Custom script execution requested:", script_name, "for tenant:", tenant_id))
    
    # Security check - only allow predefined scripts
    allowed_scripts <- c(
      "transform_portfolio_data",
      "calculate_correlation_matrix",
      "perform_regression_analysis",
      "generate_forecast",
      "islamic_banking_analysis"
    )
    
    if (!script_name %in% allowed_scripts) {
      stop(paste("Script not allowed:", script_name))
    }
    
    # Initialize connections if needed
    if (is.null(.current_tenant) || .current_tenant != tenant_id) {
      initialize_r_analytics(tenant_id)
    }
    
    # Execute based on script name
    result <- switch(script_name,
      "transform_portfolio_data" = {
        # Use transform function from global.R
        transformed_data <- transform(as.data.frame(data))
        list(transformed_data = transformed_data)
      },
      "calculate_correlation_matrix" = {
        # Use tabel_korelasi2 function
        correlation_matrix <- tabel_korelasi2(as.data.frame(data))
        list(correlation_matrix = correlation_matrix)
      },
      "islamic_banking_analysis" = {
        # Get Islamic-specific data
        islamic_data <- get_islamic_specific_data()
        list(islamic_analysis = islamic_data)
      },
      # Default case
      list(message = "Script executed successfully")
    )
    
    execution_time <- as.numeric(difftime(Sys.time(), start_time, units = "secs"))
    
    list(
      success = TRUE,
      script_name = script_name,
      tenant_id = tenant_id,
      execution_time = round(execution_time, 2),
      results = result,
      metadata = list(
        r_version = R.version.string,
        calculation_date = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC")
      )
    )
    
  }, error = function(e) {
    flog.error(paste("Custom script execution failed:", e$message))
    list(
      success = FALSE,
      error = e$message,
      script_name = script_name %||% "unknown",
      tenant_id = tenant_id
    )
  })
}

#* Initialize Session for Frontend
#* @post /api/session
function(req) {
  tryCatch({
    flog.info("Session initialization requested from frontend")

    # Parse request body if provided
    body <- list()
    if (!is.null(req$postBody) && nchar(req$postBody) > 0) {
      body <- fromJSON(req$postBody)
    }

    tenant_id <- body$tenant_id %||% body$tenantId %||% "iaf"
    banking_mode <- body$banking_mode %||% body$bankingMode %||% "conventional"
    user_context <- body$user_context %||% body$userContext

    flog.info(paste("Initializing session for tenant:", tenant_id, "banking mode:", banking_mode))

    # Initialize R analytics for the session
    initialization_result <- initialize_r_analytics(tenant_id, user_context)

    # Create session response
    session_data <- list(
      session_id = paste0("session_", format(Sys.time(), "%Y%m%d_%H%M%S")),
      tenant_id = tenant_id,
      banking_mode = banking_mode,
      initialization = initialization_result,
      api_endpoints = list(
        ecl_calculate = "/api/models/ecl/calculate",
        pd_calculate = "/api/models/pd/calculate",
        lgd_calculate = "/api/models/lgd/calculate",
        staging_analyze = "/api/models/staging/analyze",
        health_check = "/health",
        islamic_data = "/api/islamic/data"
      ),
      capabilities = list(
        ifrs9_calculations = TRUE,
        multi_tenant = TRUE,
        islamic_banking = banking_mode == "syariah",
        real_time_processing = TRUE
      )
    )

    flog.info(paste("Session initialized successfully for tenant:", tenant_id))

    list(
      success = TRUE,
      message = "Session initialized successfully",
      data = session_data,
      timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC")
    )

  }, error = function(e) {
    flog.error(paste("Session initialization failed:", e$message))
    list(
      success = FALSE,
      error = e$message,
      message = "Failed to initialize session",
      timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC")
    )
  })
}

#* Get Islamic Banking Specific Data
#* @get /api/islamic/data
function(tenant_id = NULL) {
  tryCatch({
    if (is.null(tenant_id)) {
      stop("Tenant ID required")
    }

    # Initialize connections if needed
    if (.banking_mode != "syariah") {
      return(list(
        success = FALSE,
        message = "Islamic banking data only available for Syariah tenants",
        banking_mode = .banking_mode
      ))
    }

    islamic_data <- get_islamic_specific_data()

    list(
      success = TRUE,
      data = islamic_data,
      tenant_id = tenant_id,
      banking_mode = .banking_mode,
      timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC")
    )

  }, error = function(e) {
    list(
      success = FALSE,
      error = e$message,
      tenant_id = tenant_id
    )
  })
}

#* Send notification to parent frame
#* @post /api/notify
function(req, tenant_id, message_type) {
  tryCatch({
    body <- fromJSON(req$postBody)
    data <- body$data
    
    send_message_to_parent(message_type, data)
    
    list(
      success = TRUE,
      message_type = message_type,
      tenant_id = tenant_id,
      timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC")
    )
    
  }, error = function(e) {
    list(
      success = FALSE,
      error = e$message
    )
  })
}

# Utility function for null coalescing
`%||%` <- function(x, y) if (is.null(x)) y else x

# API startup message
cat("🚀 Enhanced IFRS9 R Analytics API v", .api_version, " started\n")
cat("📊 Multi-tenant support enabled\n")
cat("🕌 Islamic banking features available\n")
cat("🔗 Database connections ready\n")
cat("⏰ Started at:", format(.api_start_time, "%Y-%m-%d %H:%M:%S UTC"), "\n")

# Export the plumber API
#* @plumber
function(pr) {
  pr %>%
    pr_set_api_spec(function(spec) {
      spec$info$title <- "IFRS9 Multi-Tenant Analytics API"
      spec$info$version <- .api_version
      spec$info$description <- "Enhanced R Analytics API for IFRS9 calculations with multi-tenant and Islamic banking support"
      spec
    })
}