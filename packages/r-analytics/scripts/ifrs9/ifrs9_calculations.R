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
