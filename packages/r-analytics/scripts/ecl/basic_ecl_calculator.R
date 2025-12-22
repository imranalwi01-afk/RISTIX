# packages/r-analytics/scripts/ecl/basic_ecl_calculator.R
# Basic ECL Calculator - Works with minimal R packages

# Try to load packages, but continue even if they fail
load_package_safe <- function(pkg) {
  if (requireNamespace(pkg, quietly = TRUE)) {
    library(pkg, character.only = TRUE)
    return(TRUE)
  } else {
    cat(paste("Package", pkg, "not available - using base R alternatives\n"))
    return(FALSE)
  }
}

# Load available packages
has_jsonlite <- load_package_safe("jsonlite")
has_dplyr <- load_package_safe("dplyr")

# Basic ECL calculation function
calculate_basic_ecl <- function(portfolio_data, parameters = list()) {
  tryCatch({
    cat("Starting basic ECL calculation...\n")
    
    # Default parameters
    pd_12m <- ifelse(is.null(parameters$pd_12m), 0.02, parameters$pd_12m)
    pd_lifetime <- ifelse(is.null(parameters$pd_lifetime), 0.08, parameters$pd_lifetime)
    lgd <- ifelse(is.null(parameters$lgd), 0.45, parameters$lgd)
    
    # Ensure data is data frame
    if (!is.data.frame(portfolio_data)) {
      portfolio_data <- data.frame(portfolio_data)
    }
    
    # Basic validation
    if (nrow(portfolio_data) == 0) {
      stop("No portfolio data provided")
    }
    
    if (!"outstanding_amount" %in% names(portfolio_data)) {
      stop("outstanding_amount field is required")
    }
    
    # Simple ECL calculation
    portfolio_data$pd_12m <- pd_12m
    portfolio_data$pd_lifetime <- pd_lifetime
    portfolio_data$lgd <- lgd
    portfolio_data$ead <- portfolio_data$outstanding_amount
    
    # Determine staging (simplified)
    portfolio_data$current_stage <- 1
    if ("days_past_due" %in% names(portfolio_data)) {
      portfolio_data$current_stage[portfolio_data$days_past_due >= 30] <- 2
      portfolio_data$current_stage[portfolio_data$days_past_due >= 90] <- 3
    }
    
    # Calculate ECL based on staging
    portfolio_data$ecl_12m <- portfolio_data$outstanding_amount * portfolio_data$pd_12m * portfolio_data$lgd
    portfolio_data$ecl_lifetime <- portfolio_data$outstanding_amount * portfolio_data$pd_lifetime * portfolio_data$lgd
    
    portfolio_data$ecl_amount <- ifelse(portfolio_data$current_stage == 1,
                                       portfolio_data$ecl_12m,
                                       portfolio_data$ecl_lifetime)
    
    # Summary
    total_ecl <- sum(portfolio_data$ecl_amount, na.rm = TRUE)
    total_exposure <- sum(portfolio_data$outstanding_amount, na.rm = TRUE)
    
    result <- list(
      success = TRUE,
      summary = list(
        total_accounts = nrow(portfolio_data),
        total_exposure = total_exposure,
        total_ecl = total_ecl,
        ecl_ratio = round(total_ecl / total_exposure * 100, 4),
        stage_1_accounts = sum(portfolio_data$current_stage == 1),
        stage_2_accounts = sum(portfolio_data$current_stage == 2),
        stage_3_accounts = sum(portfolio_data$current_stage == 3)
      ),
      detailed_data = portfolio_data,
      calculation_date = Sys.time()
    )
    
    cat("✓ ECL calculation completed\n")
    cat("  Total accounts:", nrow(portfolio_data), "\n")
    cat("  Total ECL:", round(total_ecl, 2), "\n")
    
    return(result)
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = paste("ECL calculation failed:", e$message),
      timestamp = Sys.time()
    ))
  })
}

# Export results function
export_ecl_results <- function(calculation_result) {
  if (has_jsonlite && exists("toJSON")) {
    return(list(
      json_output = toJSON(calculation_result, auto_unbox = TRUE),
      summary = calculation_result$summary
    ))
  } else {
    # Base R JSON alternative
    return(list(
      json_output = paste("Basic R JSON - Success:", calculation_result$success),
      summary = calculation_result$summary
    ))
  }
}

cat("✅ Basic ECL calculator loaded successfully!\n")
