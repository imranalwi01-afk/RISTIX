# R Script Execution Framework for IFRS 9 Analytics
# PSDD D3H3 - Generated 2025-07-22
# File: packages/r-analytics/scripts/ifrs9/run_pipeline.R

# Load required libraries and source model functions
suppressPackageStartupMessages({
  library(jsonlite)
  library(dplyr)
  library(tidyr)
  library(DBI)
  library(RPostgreSQL)
})

# Source IFRS 9 models
source("../../models/credit-risk/ifrs9_models.R")

# =============================================================================
# SCRIPT EXECUTION FRAMEWORK
# =============================================================================

#' Main execution function for R Analytics API
#' @param args Command line arguments: inputFile, outputFile, errorFile, sessionId
main <- function(args) {
  
  # Initialize execution context
  execution_context <- list(
    start_time = Sys.time(),
    session_id = if(length(args) >= 4) args[4] else "unknown",
    input_file = if(length(args) >= 1) args[1] else "input.json",
    output_file = if(length(args) >= 2) args[2] else "output.json",
    error_file = if(length(args) >= 3) args[3] else "error.log"
  )
  
  tryCatch({
    # Log execution start
    cat(paste("Starting R Analytics execution at", Sys.time(), 
              "- Session:", execution_context$session_id, "\n"))
    
    # Read input data
    input_data <- read_input_data(execution_context$input_file)
    
    # Validate input data
    validate_input_data(input_data)
    
    # Execute operation based on input
    result <- execute_operation(input_data, execution_context)
    
    # Write output
    write_output_data(result, execution_context$output_file)
    
    # Log successful completion
    execution_time <- as.numeric(difftime(Sys.time(), execution_context$start_time, units = "secs"))
    cat(paste("R Analytics execution completed successfully in", 
              round(execution_time, 2), "seconds\n"))
    
  }, error = function(e) {
    # Handle errors
    error_message <- paste("R Analytics execution failed:", e$message)
    cat(error_message, "\n")
    
    # Write error to error file
    write_error_log(e, execution_context)
    
    # Write error response to output
    error_result <- list(
      success = FALSE,
      error = error_message,
      timestamp = Sys.time(),
      session_id = execution_context$session_id
    )
    
    write_output_data(error_result, execution_context$output_file)
    
    quit(status = 1)
  })
}

# =============================================================================
# INPUT/OUTPUT FUNCTIONS
# =============================================================================

#' Read input data from JSON file
#' @param input_file Path to input JSON file
#' @return List with input data
read_input_data <- function(input_file) {
  
  if (!file.exists(input_file)) {
    stop(paste("Input file not found:", input_file))
  }
  
  input_data <- fromJSON(input_file, simplifyVector = FALSE)
  
  cat(paste("Input data loaded from:", input_file, "\n"))
  return(input_data)
}

#' Validate input data structure
#' @param input_data Input data list
validate_input_data <- function(input_data) {
  
  # Check required fields
  required_fields <- c("operation", "session_id")
  missing_fields <- setdiff(required_fields, names(input_data))
  
  if (length(missing_fields) > 0) {
    stop(paste("Missing required fields:", paste(missing_fields, collapse = ", ")))
  }
  
  # Validate operation type
  valid_operations <- c(
    "build_pd_model", "build_lgd_model", "build_ead_model",
    "calculate_ecl", "run_ifrs9_analytics", "validate_ifrs9_models",
    "health_check"
  )
  
  if (!input_data$operation %in% valid_operations) {
    stop(paste("Invalid operation:", input_data$operation, 
               "- Valid operations:", paste(valid_operations, collapse = ", ")))
  }
  
  cat(paste("Input validation passed for operation:", input_data$operation, "\n"))
}

#' Write output data to JSON file
#' @param result Result data
#' @param output_file Path to output JSON file
write_output_data <- function(result, output_file) {
  
  # Ensure result has required structure
  output_data <- list(
    success = TRUE,
    data = result,
    timestamp = Sys.time(),
    r_version = R.version.string
  )
  
  # Convert to JSON and write
  json_output <- toJSON(output_data, auto_unbox = TRUE, pretty = TRUE, digits = 6)
  writeLines(json_output, output_file)
  
  cat(paste("Output written to:", output_file, "\n"))
}

#' Write error log
#' @param error Error object
#' @param execution_context Execution context
write_error_log <- function(error, execution_context) {
  
  error_log <- paste(
    "R Analytics Error Log",
    paste("Session ID:", execution_context$session_id),
    paste("Timestamp:", Sys.time()),
    paste("Error Message:", error$message),
    paste("Call Stack:", paste(capture.output(traceback()), collapse = "\n")),
    sep = "\n"
  )
  
  writeLines(error_log, execution_context$error_file)
}

# =============================================================================
# OPERATION EXECUTION FUNCTIONS
# =============================================================================

#' Execute operation based on input data
#' @param input_data Input data with operation and parameters
#' @param execution_context Execution context
#' @return Operation result
execute_operation <- function(input_data, execution_context) {
  
  operation <- input_data$operation
  
  cat(paste("Executing operation:", operation, "\n"))
  
  result <- switch(operation,
    "build_pd_model" = execute_build_pd_model(input_data),
    "build_lgd_model" = execute_build_lgd_model(input_data),
    "build_ead_model" = execute_build_ead_model(input_data),
    "calculate_ecl" = execute_calculate_ecl(input_data),
    "run_ifrs9_analytics" = execute_run_ifrs9_analytics(input_data),
    "validate_ifrs9_models" = execute_validate_models(input_data),
    "health_check" = execute_health_check(input_data),
    stop(paste("Unknown operation:", operation))
  )
  
  return(result)
}

#' Execute PD model building
execute_build_pd_model <- function(input_data) {
  
  cat("Building PD model...\n")
  
  # Convert input data to data frames
  portfolio_data <- as.data.frame(do.call(rbind, input_data$portfolioData))
  economic_data <- if(length(input_data$economicData) > 0) {
    as.data.frame(do.call(rbind, input_data$economicData))
  } else {
    data.frame()
  }
  
  # Build PD model
  pd_model_result <- build_pd_model(
    portfolio_data = portfolio_data,
    economic_factors = economic_data,
    config = input_data$config
  )
  
  # Prepare output (exclude actual model object for JSON serialization)
  output <- list(
    model_type = pd_model_result$model_type,
    config = pd_model_result$config,
    validation_metrics = pd_model_result$validation_metrics,
    feature_importance = pd_model_result$feature_importance,
    training_data_size = pd_model_result$training_data_size,
    validation_data_size = pd_model_result$validation_data_size,
    build_time = pd_model_result$build_time,
    model_summary = list(
      coefficients = coef(pd_model_result$model),
      aic = AIC(pd_model_result$model),
      bic = BIC(pd_model_result$model)
    )
  )
  
  return(output)
}

#' Execute LGD model building
execute_build_lgd_model <- function(input_data) {
  
  cat("Building LGD model...\n")
  
  # Convert input data to data frame
  default_data <- as.data.frame(do.call(rbind, input_data$defaultData))
  
  # Build LGD model
  lgd_model_result <- build_lgd_model(
    default_data = default_data,
    config = input_data$config
  )
  
  # Prepare output
  output <- list(
    model_type = lgd_model_result$model_type,
    config = lgd_model_result$config,
    r_squared = lgd_model_result$r_squared,
    adj_r_squared = lgd_model_result$adj_r_squared,
    data_size = lgd_model_result$data_size,
    build_time = lgd_model_result$build_time,
    model_summary = list(
      coefficients = coef(lgd_model_result$model),
      r_squared = summary(lgd_model_result$model)$r.squared
    )
  )
  
  return(output)
}

#' Execute EAD model building
execute_build_ead_model <- function(input_data) {
  
  cat("Building EAD model...\n")
  
  # Convert input data to data frame
  exposure_data <- as.data.frame(do.call(rbind, input_data$exposureData))
  
  # Build EAD model
  ead_model_result <- build_ead_model(
    exposure_data = exposure_data,
    config = input_data$config
  )
  
  # Prepare output
  output <- list(
    model_type = ead_model_result$model_type,
    config = ead_model_result$config,
    r_squared = ead_model_result$r_squared,
    data_size = ead_model_result$data_size,
    build_time = ead_model_result$build_time,
    model_summary = list(
      coefficients = coef(ead_model_result$model),
      r_squared = summary(ead_model_result$model)$r.squared
    )
  )
  
  return(output)
}

#' Execute ECL calculation
execute_calculate_ecl <- function(input_data) {
  
  cat("Calculating ECL...\n")
  
  # Convert input data to data frame
  portfolio_data <- as.data.frame(do.call(rbind, input_data$portfolioData))
  
  # Note: In a real implementation, you would load pre-trained models
  # For demonstration purposes, we'll create simple mock models
  
  # Mock models (in reality, these would be loaded from storage)
  pd_model <- list(
    model = list(coefficients = c(Intercept = -2.5, current_ratio = -0.5)),
    model_type = "logistic_regression"
  )
  
  lgd_model <- list(
    model = list(coefficients = c(Intercept = 0.4, collateral_type = -0.1)),
    model_type = "linear_regression"
  )
  
  ead_model <- list(
    model = list(coefficients = c(Intercept = 1000, utilization_rate = 0.8)),
    model_type = "linear_regression"
  )
  
  # Calculate ECL (simplified version)
  ecl_result <- calculate_ecl(
    portfolio_data = portfolio_data,
    pd_model = pd_model,
    lgd_model = lgd_model,
    ead_model = ead_model,
    config = input_data$config
  )
  
  # Prepare output
  output <- list(
    portfolio_summary = ecl_result$portfolio_summary,
    config = ecl_result$config,
    calculation_time = ecl_result$calculation_time,
    timestamp = ecl_result$timestamp,
    sample_calculations = head(ecl_result$portfolio_ecl[, c("account_id", "pd_12m", "lgd", "ead", "ecl_final", "stage")], 10)
  )
  
  return(output)
}

#' Execute complete IFRS 9 analytics pipeline
execute_run_ifrs9_analytics <- function(input_data) {
  
  cat("Running IFRS 9 analytics pipeline...\n")
  
  # Convert input data to data frames
  portfolio_data <- as.data.frame(do.call(rbind, input_data$portfolioData))
  economic_data <- if(length(input_data$economicData) > 0) {
    as.data.frame(do.call(rbind, input_data$economicData))
  } else {
    data.frame(date = Sys.Date(), gdp_growth = 0.03, unemployment_rate = 0.05)
  }
  default_data <- if(length(input_data$defaultData) > 0) {
    as.data.frame(do.call(rbind, input_data$defaultData))
  } else {
    data.frame(loss_rate = 0.45, collateral_type = "Real Estate", loan_type = "Commercial")
  }
  
  # Run complete pipeline
  pipeline_result <- run_ifrs9_analytics(
    portfolio_data = portfolio_data,
    economic_data = economic_data,
    default_data = default_data,
    config = input_data$config
  )
  
  # Prepare output
  output <- list(
    models_summary = list(
      pd_model = list(
        auc = pipeline_result$models$pd_model$validation_metrics$auc,
        gini = pipeline_result$models$pd_model$validation_metrics$gini
      ),
      lgd_model = list(
        r_squared = pipeline_result$models$lgd_model$r_squared
      ),
      ead_model = list(
        r_squared = pipeline_result$models$ead_model$r_squared
      )
    ),
    ecl_summary = pipeline_result$ecl_results$portfolio_summary,
    validation_summary = pipeline_result$validation_results,
    pipeline_time = pipeline_result$pipeline_time,
    timestamp = pipeline_result$timestamp
  )
  
  return(output)
}

#' Execute model validation
execute_validate_models <- function(input_data) {
  
  cat("Validating models...\n")
  
  # Convert test data
  test_data <- as.data.frame(do.call(rbind, input_data$testData))
  
  # Mock validation (in reality, would use actual models)
  validation_result <- list(
    pd_validation = list(
      auc = 0.75,
      gini = 0.50
    ),
    lgd_validation = list(
      rmse = 0.15,
      mae = 0.12
    ),
    ead_validation = list(
      rmse = 500,
      mae = 350
    )
  )
  
  return(validation_result)
}

#' Execute health check
execute_health_check <- function(input_data) {
  
  cat("Performing health check...\n")
  
  # Gather system information
  health_info <- list(
    r_version = R.version.string,
    platform = R.version$platform,
    system_time = Sys.time(),
    memory_usage = list(
      used = round(sum(gc()[,2]), 2),
      available = round(memory.limit(), 2)
    ),
    loaded_packages = (.packages()),
    working_directory = getwd(),
    session_info = list(
      pid = Sys.getpid(),
      user = Sys.getenv("USER"),
      locale = Sys.getlocale()
    )
  )
  
  return(health_info)
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Get command line arguments
args <- commandArgs(trailingOnly = TRUE)

# Execute main function
main(args)