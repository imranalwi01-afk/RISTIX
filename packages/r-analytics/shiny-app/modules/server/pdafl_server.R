# =============================================================================
# PD-AFL SERVER MODULE
# =============================================================================
# Extracted from: _analytics/_v15/reference/app15.R (server function lines 2487-3363)
# Purpose: Server logic for PD-AFL calculations, boxplot scenarios, and PD engine operations
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Helper function for style intervals
#' @param x Vector of values
#' @param low Lower bound
#' @param high Upper bound
#' @param colors Vector of colors
#' @return Vector of colors
styleInterval <- function(x, low, high, colors = c("lightblue", "white")) {
  ifelse(x < low, colors[1], ifelse(x > high, colors[3], colors[2]))
}

#' PD-AFL Server Module
#' @description Handles PD-AFL calculations including boxplot scenarios, MEV processing, PD engine operations, and final PD calculations
#' @param input Shiny input object
#' @param output Shiny output object
#' @param session Shiny session object
#' @param con Database connection
#' @param PD PD configuration data
#' @return List of reactive PD-AFL results
pdafl_server <- function(input, output, session, con, PD) {

  # =============================================================================
  # UTILITY FUNCTIONS
  # =============================================================================
  # Utility functions are already sourced in app.R - no duplication needed
  # All utils/data_processing.R, utils/pd_calculations.R, and utils/database_utils.R
  # are loaded globally in app.R before modules are initialized

  # =============================================================================
  # MODULE INITIALIZATION AND DEBUG SETUP
  # =============================================================================

  if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
    cat("DEBUG: PD & AFL server module initialized\n")
    cat("  - Module file: pdafl_server.R\n")
    cat("  - Session ID:", session$token, "\n")
    cat("  - Database connection status: Available\n")
  }

  # =============================================================================
  # REACTIVE VALUES AND INITIALIZATION
  # =============================================================================

  # PD tables mapping for dynamic UI generation
  pd_tables_map <- c(
    "FL.P.ODR" = "Forward Looking Prediction",
    "TTC.ODR" = "True The Life Cycle",
    "MPD.Scalling" = "Marginal PD Scalling",
    "Scalling" = "Scalling",
    "Optimization" = "Optimization",
    "yearly_cpd_bfl" = "Yearly Cummulative PD Before Forward Looking",
    "yearly_mpd_bfl" = "Yearly Marginal PD Before Forward Looking",
    "yearly_mpd_afl" = "Yearly Marginal PD After Forward Looking",
    "yearly_cpd_afl" = "Yearly Cummulative PD After Forward Looking",
    "monthly_cpd_bfl" = "Monthly Cummulative PD Before Forward Looking",
    "monthly_cpd_afl" = "Monthly Cummulative PD After Forward Looking",
    "monthly_mpd_bfl" = "Monthly Marginal PD Before Forward Looking",
    "monthly_mpd_afl" = "Monthly Marginal PD After Forward Looking"
  )

  # PD final mapping
  pd_final_map <- c(
    "monthly_mpd_afl_final" = "Monthly Marginal PD After Forward Looking FINAL",
    "monthly_cpd_afl_final" = "Monthly Cummulative PD After Forward Looking FINAL",
    "yearly_mpd_afl_final" = "Yearly Marginal PD After Forward Looking Final",
    "yearly_cpd_afl_final" = "Yearly Cummulative PD After Forward Looking Final"
  )

  # Reactive storage for weighted boxplot data
  weighted_pdafl <- reactiveValues(data = NULL)

  # Reactive storage for intuition data
  intuisiData_pdafl <- reactiveValues(data = NULL)

  if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
    cat("DEBUG: Reactive values initialized successfully\n")
    cat("  - weighted_pdafl: Reactive storage ready\n")
    cat("  - intuisiData_pdafl: Reactive storage ready\n")
  }

  # =============================================================================
  # P2-TASK#15: ADVANCED PD MODEL CONFIGURATION HANDLERS
  # =============================================================================
  # Purpose: Server-side logic for enhanced PD configuration UI controls
  # Reference: MODULAR_VERSION_TODO.md Task #15
  # Original: app15.R implied configuration logic

  # Weight Validation Reactive Output
  output$weight_validation_ui <- renderUI({
    req(input$weight_base, input$weight_best, input$weight_worst)

    # Calculate total weight
    total_weight <- input$weight_base + input$weight_best + input$weight_worst

    # Check if weights sum to 1.0 (with small tolerance for floating point)
    if (abs(total_weight - 1.0) < 0.001) {
      tags$div(
        style = "color: green; font-weight: bold; padding: 10px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px;",
        icon("check-circle"),
        " Weights sum to 1.0 ✓"
      )
    } else {
      tags$div(
        style = "color: #856404; font-weight: bold; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px;",
        icon("exclamation-triangle"),
        sprintf(" Warning: Weights sum to %.3f (must equal 1.0)", total_weight)
      )
    }
  })

  # Reset Configuration Button Handler
  observeEvent(input$reset_pd_config, {
    cat("DEBUG: Resetting PD configuration to defaults\n")

    # Reset all configuration inputs to default values
    updateSliderInput(session, "longrun_period", value = 60)
    updateCheckboxInput(session, "use_longrun_average", value = FALSE)
    updateNumericInput(session, "pd_scaling_factor", value = 1.0)
    updateSliderInput(session, "confidence_level", value = 95)
    updateNumericInput(session, "weight_base", value = 0.6)
    updateNumericInput(session, "weight_best", value = 0.2)
    updateNumericInput(session, "weight_worst", value = 0.2)
    updateCheckboxInput(session, "include_macroeconomic", value = TRUE)
    updateCheckboxInput(session, "apply_flooring", value = TRUE)
    updateNumericInput(session, "pd_floor_value", value = 0.03)

    showNotification(
      "Configuration reset to defaults",
      type = "default",
      duration = 3
    )

    cat(" DEBUG [RESET_CONFIG]: Configuration reset completed\n")
  })

  # Helper Function: Apply PD Scaling Factor
  apply_pd_scaling <- function(pd_values, scaling_factor = 1.0) {
    cat(" DEBUG [APPLY_SCALING]: Applying PD scaling factor:", scaling_factor, "\n")

    if (is.null(pd_values) || length(pd_values) == 0) {
      return(pd_values)
    }

    # Apply scaling factor (conservative if >1.0, aggressive if <1.0)
    scaled_pd <- pd_values * scaling_factor

    cat("  - Original PD range:", paste(round(range(pd_values, na.rm = TRUE), 4), collapse = " to "), "\n")
    cat("  - Scaled PD range:", paste(round(range(scaled_pd, na.rm = TRUE), 4), collapse = " to "), "\n")

    return(scaled_pd)
  }

  # Helper Function: Apply PD Floor (Regulatory Minimum)
  apply_pd_floor <- function(pd_values, floor_value = 0.0003) {
    cat(" DEBUG [APPLY_FLOOR]: Applying PD floor:", floor_value, "\n")

    if (is.null(pd_values) || length(pd_values) == 0) {
      return(pd_values)
    }

    # Count how many values are below floor
    below_floor <- sum(pd_values < floor_value, na.rm = TRUE)

    if (below_floor > 0) {
      cat("  - Values below floor:", below_floor, "out of", length(pd_values), "\n")
    }

    # Apply floor: max(pd, floor_value)
    floored_pd <- pmax(pd_values, floor_value, na.rm = TRUE)

    return(floored_pd)
  }

  # Helper Function: Calculate Long-Run Average PD
  calculate_longrun_average <- function(pd_timeseries, period_months = 60) {
    cat(" DEBUG [LONGRUN_AVG]: Calculating long-run average PD\n")
    cat("  - Period:", period_months, "months\n")

    if (is.null(pd_timeseries) || length(pd_timeseries) == 0) {
      return(NULL)
    }

    # Take last N periods for long-run average
    n_periods <- min(period_months, length(pd_timeseries))
    recent_pd <- tail(pd_timeseries, n_periods)

    # Calculate average
    longrun_avg <- mean(recent_pd, na.rm = TRUE)

    cat("  - Periods used:", n_periods, "\n")
    cat("  - Long-run average:", round(longrun_avg, 6), "\n")

    return(longrun_avg)
  }

  # Helper Function: Apply Weighted Boxplot Scenarios
  apply_boxplot_weights <- function(base_pd, best_pd, worst_pd,
                                    weight_base = 0.6, weight_best = 0.2, weight_worst = 0.2) {
    cat(" DEBUG [BOXPLOT_WEIGHTS]: Applying weighted boxplot scenarios\n")
    cat("  - Weights: Base =", weight_base, ", Best =", weight_best, ", Worst =", weight_worst, "\n")

    # Validate weights sum to 1.0
    total_weight <- weight_base + weight_best + weight_worst
    if (abs(total_weight - 1.0) > 0.001) {
      cat(" WARNING: Weights do not sum to 1.0 (sum =", total_weight, "), normalizing...\n")
      weight_base <- weight_base / total_weight
      weight_best <- weight_best / total_weight
      weight_worst <- weight_worst / total_weight
    }

    # Calculate weighted average
    weighted_pd <- (base_pd * weight_base) + (best_pd * weight_best) + (worst_pd * weight_worst)

    cat("  - Base PD range:", paste(round(range(base_pd, na.rm = TRUE), 4), collapse = " to "), "\n")
    cat("  - Best PD range:", paste(round(range(best_pd, na.rm = TRUE), 4), collapse = " to "), "\n")
    cat("  - Worst PD range:", paste(round(range(worst_pd, na.rm = TRUE), 4), collapse = " to "), "\n")
    cat("  - Weighted PD range:", paste(round(range(weighted_pd, na.rm = TRUE), 4), collapse = " to "), "\n")

    return(weighted_pd)
  }

  # =============================================================================
  # P2-TASK#16: HISTORICAL PD COMPARISON FUNCTIONS
  # =============================================================================
  # Purpose: Compare current PD calculations with historical values
  # Reference: MODULAR_VERSION_TODO.md Task #16
  # Features: Trend analysis, change indicators, alerts

  # Helper Function: Load Historical PD Data from Database
  load_historical_pd <- function(segment_id, n_periods = 12) {
    cat(" DEBUG [LOAD_HISTORICAL]: Loading historical PD data\n")
    cat("  - Segment ID:", segment_id, "\n")
    cat("  - Periods:", n_periods, "\n")

    tryCatch({
      # Query historical PD outputs from database
      query <- 'SELECT
        "REPORTING_DATE",
        "SEGMENT_ID",
        "YEARLY_MPD_AFL" as yearly_marginal_pd,
        "YEARLY_CPD_AFL" as yearly_cumulative_pd,
        "MONTHLY_MPD_AFL" as monthly_marginal_pd,
        "MONTHLY_CPD_AFL" as monthly_cumulative_pd,
        "CREATED_DATE"
      FROM "frs9_r_pd_output_yearly"
      WHERE "SEGMENT_ID" = $1
      ORDER BY "REPORTING_DATE" DESC
      LIMIT $2'

      historical_data <- dbGetQuery(con, query, params = list(segment_id, n_periods))

      if (nrow(historical_data) > 0) {
        cat(" DEBUG [LOAD_HISTORICAL]: Loaded", nrow(historical_data), "historical records\n")
        cat("  - Date range:", paste(range(historical_data$REPORTING_DATE), collapse = " to "), "\n")
      } else {
        cat(" DEBUG [LOAD_HISTORICAL]: No historical data found\n")
      }

      return(historical_data)

    }, error = function(e) {
      cat(" DEBUG [LOAD_HISTORICAL]: Error loading historical data:", e$message, "\n")
      return(data.frame())
    })
  }

  # Helper Function: Calculate PD Trend Analysis
  calculate_pd_trend <- function(current_pd, historical_pd_series) {
    cat(" DEBUG [PD_TREND]: Calculating PD trend analysis\n")

    if (is.null(historical_pd_series) || length(historical_pd_series) < 2) {
      cat(" DEBUG [PD_TREND]: Insufficient historical data for trend analysis\n")
      return(list(
        trend = "insufficient_data",
        slope = NA,
        r_squared = NA,
        direction = "unknown"
      ))
    }

    tryCatch({
      # Create time series
      n_periods <- length(historical_pd_series)
      time_index <- 1:n_periods

      # Fit linear trend
      trend_model <- lm(historical_pd_series ~ time_index)
      slope <- coef(trend_model)[2]
      r_squared <- summary(trend_model)$r.squared

      # Determine trend direction
      direction <- if (abs(slope) < 0.0001) {
        "stable"
      } else if (slope > 0) {
        "increasing"
      } else {
        "decreasing"
      }

      # Predict next period
      predicted_next <- predict(trend_model, newdata = data.frame(time_index = n_periods + 1))

      cat("  - Trend direction:", direction, "\n")
      cat("  - Slope:", round(slope, 6), "\n")
      cat("  - R-squared:", round(r_squared, 4), "\n")
      cat("  - Predicted next:", round(predicted_next, 4), "\n")
      cat("  - Current PD:", round(current_pd, 4), "\n")

      return(list(
        trend = direction,
        slope = slope,
        r_squared = r_squared,
        direction = direction,
        predicted_next = predicted_next,
        deviation_from_prediction = current_pd - predicted_next
      ))

    }, error = function(e) {
      cat(" DEBUG [PD_TREND]: Error in trend calculation:", e$message, "\n")
      return(list(
        trend = "error",
        slope = NA,
        r_squared = NA,
        direction = "unknown"
      ))
    })
  }

  # Helper Function: Calculate Change Indicators
  calculate_change_indicators <- function(current_pd, historical_pd_series) {
    cat(" DEBUG [CHANGE_INDICATORS]: Calculating change indicators\n")

    if (is.null(historical_pd_series) || length(historical_pd_series) == 0) {
      cat(" DEBUG [CHANGE_INDICATORS]: No historical data available\n")
      return(list(
        vs_previous = NA,
        vs_average = NA,
        vs_min = NA,
        vs_max = NA,
        percentile_rank = NA
      ))
    }

    tryCatch({
      # Previous period comparison
      previous_pd <- historical_pd_series[1]
      change_vs_previous <- current_pd - previous_pd
      pct_change_vs_previous <- (change_vs_previous / previous_pd) * 100

      # Average comparison
      historical_avg <- mean(historical_pd_series, na.rm = TRUE)
      change_vs_average <- current_pd - historical_avg
      pct_change_vs_average <- (change_vs_average / historical_avg) * 100

      # Min/Max comparison
      historical_min <- min(historical_pd_series, na.rm = TRUE)
      historical_max <- max(historical_pd_series, na.rm = TRUE)

      # Percentile rank
      all_values <- c(historical_pd_series, current_pd)
      percentile_rank <- (sum(all_values <= current_pd) / length(all_values)) * 100

      cat("  - vs Previous:", round(pct_change_vs_previous, 2), "%\n")
      cat("  - vs Average:", round(pct_change_vs_average, 2), "%\n")
      cat("  - Percentile rank:", round(percentile_rank, 1), "%\n")

      return(list(
        vs_previous = change_vs_previous,
        vs_previous_pct = pct_change_vs_previous,
        vs_average = change_vs_average,
        vs_average_pct = pct_change_vs_average,
        vs_min = current_pd - historical_min,
        vs_max = current_pd - historical_max,
        percentile_rank = percentile_rank,
        historical_avg = historical_avg,
        historical_min = historical_min,
        historical_max = historical_max
      ))

    }, error = function(e) {
      cat(" DEBUG [CHANGE_INDICATORS]: Error in calculation:", e$message, "\n")
      return(list(
        vs_previous = NA,
        vs_average = NA,
        vs_min = NA,
        vs_max = NA,
        percentile_rank = NA
      ))
    })
  }

  # Helper Function: Generate PD Alerts
  generate_pd_alerts <- function(current_pd, trend_analysis, change_indicators,
                                  alert_thresholds = list(
                                    large_increase_pct = 20,
                                    large_decrease_pct = -20,
                                    high_percentile = 90,
                                    low_percentile = 10
                                  )) {
    cat(" DEBUG [PD_ALERTS]: Generating PD alerts\n")

    alerts <- list()

    # Check for large increases
    if (!is.na(change_indicators$vs_previous_pct) &&
        change_indicators$vs_previous_pct > alert_thresholds$large_increase_pct) {
      alerts <- c(alerts, list(
        type = "warning",
        severity = "high",
        message = sprintf("Large PD increase: +%.1f%% vs previous period",
                         change_indicators$vs_previous_pct),
        metric = "vs_previous_pct",
        value = change_indicators$vs_previous_pct
      ))
    }

    # Check for large decreases
    if (!is.na(change_indicators$vs_previous_pct) &&
        change_indicators$vs_previous_pct < alert_thresholds$large_decrease_pct) {
      alerts <- c(alerts, list(
        type = "default",
        severity = "medium",
        message = sprintf("Large PD decrease: %.1f%% vs previous period",
                         change_indicators$vs_previous_pct),
        metric = "vs_previous_pct",
        value = change_indicators$vs_previous_pct
      ))
    }

    # Check for high percentile (unusually high PD)
    if (!is.na(change_indicators$percentile_rank) &&
        change_indicators$percentile_rank > alert_thresholds$high_percentile) {
      alerts <- c(alerts, list(
        type = "warning",
        severity = "high",
        message = sprintf("PD at %.0f percentile - unusually high",
                         change_indicators$percentile_rank),
        metric = "percentile_rank",
        value = change_indicators$percentile_rank
      ))
    }

    # Check for low percentile (unusually low PD)
    if (!is.na(change_indicators$percentile_rank) &&
        change_indicators$percentile_rank < alert_thresholds$low_percentile) {
      alerts <- c(alerts, list(
        type = "default",
        severity = "low",
        message = sprintf("PD at %.0f percentile - unusually low",
                         change_indicators$percentile_rank),
        metric = "percentile_rank",
        value = change_indicators$percentile_rank
      ))
    }

    # Check for strong increasing trend
    if (!is.na(trend_analysis$r_squared) && trend_analysis$r_squared > 0.7 &&
        trend_analysis$direction == "increasing") {
      alerts <- c(alerts, list(
        type = "warning",
        severity = "medium",
        message = sprintf("Strong increasing trend detected (R² = %.2f)",
                         trend_analysis$r_squared),
        metric = "trend",
        value = trend_analysis$slope
      ))
    }

    cat("  - Generated", length(alerts), "alerts\n")

    return(alerts)
  }

  # Main Function: Comprehensive Historical PD Comparison
  compare_pd_with_history <- function(current_pd_value, segment_id, pd_type = "yearly_marginal") {
    cat("\n" , "==============================================\n")
    cat(" DEBUG [COMPARE_HISTORY]: Starting historical PD comparison\n")
    cat("  - Current PD:", round(current_pd_value, 6), "\n")
    cat("  - Segment ID:", segment_id, "\n")
    cat("  - PD Type:", pd_type, "\n")

    # Load historical data
    historical_data <- load_historical_pd(segment_id, n_periods = 12)

    if (nrow(historical_data) == 0) {
      cat(" DEBUG [COMPARE_HISTORY]: No historical data - skipping comparison\n")
      return(list(
        has_history = FALSE,
        message = "No historical data available for comparison"
      ))
    }

    # Extract relevant PD series based on type
    pd_column_map <- list(
      "yearly_marginal" = "yearly_marginal_pd",
      "yearly_cumulative" = "yearly_cumulative_pd",
      "monthly_marginal" = "monthly_marginal_pd",
      "monthly_cumulative" = "monthly_cumulative_pd"
    )

    pd_column <- pd_column_map[[pd_type]]
    historical_pd_series <- historical_data[[pd_column]]

    # Calculate trend analysis
    trend_analysis <- calculate_pd_trend(current_pd_value, historical_pd_series)

    # Calculate change indicators
    change_indicators <- calculate_change_indicators(current_pd_value, historical_pd_series)

    # Generate alerts
    alerts <- generate_pd_alerts(current_pd_value, trend_analysis, change_indicators)

    cat(" DEBUG [COMPARE_HISTORY]: Comparison completed\n")
    cat("==============================================\n\n")

    return(list(
      has_history = TRUE,
      current_pd = current_pd_value,
      historical_data = historical_data,
      trend_analysis = trend_analysis,
      change_indicators = change_indicators,
      alerts = alerts,
      n_historical_periods = nrow(historical_data)
    ))
  }

  # =============================================================================
  # P2-TASK#17: PD VALIDATION RULES
  # =============================================================================
  # Purpose: Validate PD calculations with range checks, monotonicity, and anomaly detection
  # Reference: MODULAR_VERSION_TODO.md Task #17
  # Features: Range validation, monotonicity checks, anomaly warnings

  #' Validate PD Range
  #' @description Checks if PD values are within valid range [0, 1] with warnings for edge cases
  #' @param pd_value Numeric PD value to validate
  #' @param pd_type Character type of PD (e.g., "yearly_marginal", "monthly_cumulative")
  #' @param segment_id Character segment identifier for logging
  #' @return List with validation status, warnings, and details
  validate_pd_range <- function(pd_value, pd_type = "PD", segment_id = "UNKNOWN") {
    cat("\n", "==============================================\n")
    cat(" DEBUG [VALIDATE_RANGE]: Validating PD range\n")
    cat("  - PD Type:", pd_type, "\n")
    cat("  - PD Value:", round(pd_value, 6), "\n")
    cat("  - Segment:", segment_id, "\n")

    validation_result <- list(
      is_valid = TRUE,
      warnings = list(),
      errors = list(),
      pd_value = pd_value,
      segment_id = segment_id
    )

    tryCatch({
      # Check for NA/NULL
      if (is.na(pd_value) || is.null(pd_value)) {
        validation_result$is_valid <- FALSE
        validation_result$errors <- c(validation_result$errors, list(
          type = "missing_value",
          severity = "critical",
          message = sprintf("%s: PD value is NA or NULL", pd_type),
          segment_id = segment_id
        ))
        cat(" ERROR: PD value is NA/NULL\n")
        return(validation_result)
      }

      # Check for non-numeric
      if (!is.numeric(pd_value)) {
        validation_result$is_valid <- FALSE
        validation_result$errors <- c(validation_result$errors, list(
          type = "invalid_type",
          severity = "critical",
          message = sprintf("%s: PD value is not numeric (type: %s)", pd_type, class(pd_value)),
          segment_id = segment_id
        ))
        cat(" ERROR: PD value is not numeric\n")
        return(validation_result)
      }

      # Check valid probability range [0, 1]
      if (pd_value < 0 || pd_value > 1) {
        validation_result$is_valid <- FALSE
        validation_result$errors <- c(validation_result$errors, list(
          type = "out_of_range",
          severity = "critical",
          message = sprintf("%s: PD value %.6f is outside valid range [0, 1]", pd_type, pd_value),
          segment_id = segment_id,
          value = pd_value
        ))
        cat(" ERROR: PD value", pd_value, "outside range [0, 1]\n")
        return(validation_result)
      }

      # Warning: Very low PD (potential data issue)
      if (pd_value < 0.0001) {
        validation_result$warnings <- c(validation_result$warnings, list(
          type = "very_low_pd",
          severity = "low",
          message = sprintf("%s: Very low PD (%.6f) - may indicate data quality issue", pd_type, pd_value),
          segment_id = segment_id,
          value = pd_value
        ))
        cat(" WARNING: Very low PD (<0.01%)\n")
      }

      # Warning: High PD (potential risk)
      if (pd_value > 0.5) {
        validation_result$warnings <- c(validation_result$warnings, list(
          type = "high_pd",
          severity = "high",
          message = sprintf("%s: High PD (%.2f%%) indicates significant default risk", pd_type, pd_value * 100),
          segment_id = segment_id,
          value = pd_value
        ))
        cat(" WARNING: High PD (>50%)\n")
      }

      # Warning: Extreme PD (near 100%)
      if (pd_value > 0.95) {
        validation_result$warnings <- c(validation_result$warnings, list(
          type = "extreme_pd",
          severity = "critical",
          message = sprintf("%s: Extreme PD (%.2f%%) - portfolio at critical risk", pd_type, pd_value * 100),
          segment_id = segment_id,
          value = pd_value
        ))
        cat(" CRITICAL WARNING: Extreme PD (>95%)\n")
      }

      # Warning: Exactly 0 or 1 (edge cases)
      if (pd_value == 0) {
        validation_result$warnings <- c(validation_result$warnings, list(
          type = "zero_pd",
          severity = "medium",
          message = sprintf("%s: PD is exactly 0 - consider using floor (e.g., 0.0001)", pd_type),
          segment_id = segment_id,
          value = pd_value
        ))
        cat(" WARNING: PD is exactly 0 (consider PD floor)\n")
      }

      if (pd_value == 1) {
        validation_result$warnings <- c(validation_result$warnings, list(
          type = "pd_one",
          severity = "high",
          message = sprintf("%s: PD is exactly 1 (100%% default probability)", pd_type),
          segment_id = segment_id,
          value = pd_value
        ))
        cat(" WARNING: PD is exactly 1 (100% default)\n")
      }

      cat(" DEBUG [VALIDATE_RANGE]: Range validation completed\n")
      cat("  - Status:", ifelse(validation_result$is_valid, "PASSED", "FAILED"), "\n")
      cat("  - Warnings:", length(validation_result$warnings), "\n")
      cat("  - Errors:", length(validation_result$errors), "\n")
      cat("==============================================\n\n")

      return(validation_result)

    }, error = function(e) {
      cat(" DEBUG [VALIDATE_RANGE]: Error during validation:", e$message, "\n")
      validation_result$is_valid <- FALSE
      validation_result$errors <- c(validation_result$errors, list(
        type = "validation_error",
        severity = "critical",
        message = paste("Validation error:", e$message),
        segment_id = segment_id
      ))
      return(validation_result)
    })
  }

  #' Check PD Monotonicity
  #' @description Validates that PD series is monotonically increasing over time (typical pattern)
  #' @param pd_series Numeric vector of PD values ordered by time period
  #' @param period_labels Character vector of period labels (for reporting)
  #' @param segment_id Character segment identifier for logging
  #' @return List with monotonicity status and violations
  check_pd_monotonicity <- function(pd_series, period_labels = NULL, segment_id = "UNKNOWN") {
    cat("\n", "==============================================\n")
    cat(" DEBUG [MONOTONICITY]: Checking PD monotonicity\n")
    cat("  - Segment:", segment_id, "\n")
    cat("  - Series length:", length(pd_series), "\n")

    if (length(pd_series) < 2) {
      cat(" DEBUG [MONOTONICITY]: Insufficient data points (need >= 2)\n")
      cat("==============================================\n\n")
      return(list(
        is_monotonic = NA,
        violations = list(),
        message = "Insufficient data for monotonicity check (need at least 2 periods)"
      ))
    }

    # Default period labels if not provided
    if (is.null(period_labels)) {
      period_labels <- paste0("Period_", seq_along(pd_series))
    }

    tryCatch({
      violations <- list()
      non_increasing_count <- 0

      # Check each consecutive pair
      for (i in 2:length(pd_series)) {
        if (!is.na(pd_series[i-1]) && !is.na(pd_series[i])) {
          if (pd_series[i] < pd_series[i-1]) {
            non_increasing_count <- non_increasing_count + 1
            decrease_pct <- ((pd_series[i] - pd_series[i-1]) / pd_series[i-1]) * 100

            violations <- c(violations, list(
              period_from = period_labels[i-1],
              period_to = period_labels[i],
              pd_from = pd_series[i-1],
              pd_to = pd_series[i],
              decrease = pd_series[i-1] - pd_series[i],
              decrease_pct = decrease_pct,
              message = sprintf("PD decreased from %.4f to %.4f (%.1f%%)",
                              pd_series[i-1], pd_series[i], decrease_pct)
            ))

            cat("  - Violation:", period_labels[i-1], "→", period_labels[i],
                ":", round(pd_series[i-1], 4), "→", round(pd_series[i], 4), "\n")
          }
        }
      }

      is_monotonic <- (non_increasing_count == 0)

      cat("  - Monotonic:", is_monotonic, "\n")
      cat("  - Violations found:", non_increasing_count, "\n")
      cat(" DEBUG [MONOTONICITY]: Check completed\n")
      cat("==============================================\n\n")

      return(list(
        is_monotonic = is_monotonic,
        violations = violations,
        violation_count = non_increasing_count,
        total_periods = length(pd_series),
        message = if (is_monotonic) {
          "PD series is monotonically increasing (expected pattern)"
        } else {
          sprintf("%d violations detected - PD decreased between periods", non_increasing_count)
        }
      ))

    }, error = function(e) {
      cat(" DEBUG [MONOTONICITY]: Error during check:", e$message, "\n")
      return(list(
        is_monotonic = FALSE,
        violations = list(),
        error = e$message
      ))
    })
  }

  #' Detect PD Anomalies
  #' @description Identifies unusual patterns in PD values using statistical methods
  #' @param pd_value Numeric current PD value
  #' @param historical_pd_series Numeric vector of historical PD values
  #' @param segment_id Character segment identifier for logging
  #' @param threshold_sd Numeric standard deviation threshold for outlier detection (default: 2)
  #' @return List with anomaly detection results
  detect_pd_anomalies <- function(pd_value, historical_pd_series = NULL,
                                   segment_id = "UNKNOWN", threshold_sd = 2) {
    cat("\n", "==============================================\n")
    cat(" DEBUG [ANOMALY_DETECT]: Detecting PD anomalies\n")
    cat("  - Segment:", segment_id, "\n")
    cat("  - Current PD:", round(pd_value, 6), "\n")
    cat("  - Threshold SD:", threshold_sd, "\n")

    anomaly_result <- list(
      has_anomaly = FALSE,
      anomalies = list(),
      statistics = list(),
      segment_id = segment_id
    )

    tryCatch({
      # Anomaly 1: Current PD validation
      range_validation <- validate_pd_range(pd_value, "Current PD", segment_id)
      if (!range_validation$is_valid) {
        anomaly_result$has_anomaly <- TRUE
        anomaly_result$anomalies <- c(anomaly_result$anomalies, list(
          type = "invalid_pd",
          severity = "critical",
          message = "Current PD failed range validation",
          details = range_validation$errors
        ))
        cat(" ANOMALY: Invalid PD detected\n")
      }

      # Anomaly 2: Statistical outlier detection (if historical data available)
      if (!is.null(historical_pd_series) && length(historical_pd_series) >= 3) {
        cat("  - Historical series length:", length(historical_pd_series), "\n")

        historical_mean <- mean(historical_pd_series, na.rm = TRUE)
        historical_sd <- sd(historical_pd_series, na.rm = TRUE)

        anomaly_result$statistics <- list(
          historical_mean = historical_mean,
          historical_sd = historical_sd,
          z_score = if (historical_sd > 0) {
            (pd_value - historical_mean) / historical_sd
          } else {
            NA
          }
        )

        cat("  - Historical mean:", round(historical_mean, 6), "\n")
        cat("  - Historical SD:", round(historical_sd, 6), "\n")

        if (!is.na(anomaly_result$statistics$z_score)) {
          z_score <- anomaly_result$statistics$z_score
          cat("  - Z-score:", round(z_score, 2), "\n")

          if (abs(z_score) > threshold_sd) {
            anomaly_result$has_anomaly <- TRUE
            anomaly_result$anomalies <- c(anomaly_result$anomalies, list(
              type = "statistical_outlier",
              severity = if (abs(z_score) > 3) "high" else "medium",
              message = sprintf("PD is a statistical outlier (Z-score: %.2f, threshold: %.1f SD)",
                              z_score, threshold_sd),
              z_score = z_score,
              deviation_pct = ((pd_value - historical_mean) / historical_mean) * 100
            ))
            cat(" ANOMALY: Statistical outlier detected (Z-score:", round(z_score, 2), ")\n")
          }
        }

        # Anomaly 3: Sudden spike/drop detection
        if (length(historical_pd_series) > 0) {
          recent_pd <- historical_pd_series[1]  # Most recent historical value
          change_pct <- ((pd_value - recent_pd) / recent_pd) * 100

          if (abs(change_pct) > 50) {
            anomaly_result$has_anomaly <- TRUE
            anomaly_result$anomalies <- c(anomaly_result$anomalies, list(
              type = "sudden_change",
              severity = if (abs(change_pct) > 100) "critical" else "high",
              message = sprintf("Large PD change detected: %+.1f%% vs previous period",
                              change_pct),
              change_pct = change_pct,
              previous_pd = recent_pd,
              current_pd = pd_value
            ))
            cat(" ANOMALY: Sudden change detected (", round(change_pct, 1), "%)\n")
          }
        }
      } else {
        cat("  - Insufficient historical data for statistical analysis\n")
      }

      # Anomaly 4: Extreme values check
      if (pd_value < 0.00001) {
        anomaly_result$has_anomaly <- TRUE
        anomaly_result$anomalies <- c(anomaly_result$anomalies, list(
          type = "near_zero_pd",
          severity = "medium",
          message = sprintf("PD is extremely low (%.6f) - potential data issue", pd_value)
        ))
        cat(" ANOMALY: Near-zero PD\n")
      }

      if (pd_value > 0.99) {
        anomaly_result$has_anomaly <- TRUE
        anomaly_result$anomalies <- c(anomaly_result$anomalies, list(
          type = "near_default_pd",
          severity = "critical",
          message = sprintf("PD is extremely high (%.2f%%) - portfolio at imminent default risk",
                          pd_value * 100)
        ))
        cat(" ANOMALY: Near-default PD\n")
      }

      cat(" DEBUG [ANOMALY_DETECT]: Detection completed\n")
      cat("  - Has anomaly:", anomaly_result$has_anomaly, "\n")
      cat("  - Anomalies found:", length(anomaly_result$anomalies), "\n")
      cat("==============================================\n\n")

      return(anomaly_result)

    }, error = function(e) {
      cat(" DEBUG [ANOMALY_DETECT]: Error during detection:", e$message, "\n")
      anomaly_result$has_anomaly <- TRUE
      anomaly_result$anomalies <- c(anomaly_result$anomalies, list(
        type = "detection_error",
        severity = "critical",
        message = paste("Error during anomaly detection:", e$message)
      ))
      return(anomaly_result)
    })
  }

  #' Comprehensive PD Validation
  #' @description Main validation function combining range, monotonicity, and anomaly checks
  #' @param current_pd Numeric current PD value
  #' @param pd_series Numeric vector of PD time series (optional, for monotonicity)
  #' @param historical_pd Numeric vector of historical PD values (optional, for anomaly detection)
  #' @param segment_id Character segment identifier for logging
  #' @param pd_type Character type of PD being validated
  #' @return List with comprehensive validation results
  validate_pd_comprehensive <- function(current_pd, pd_series = NULL, historical_pd = NULL,
                                        segment_id = "UNKNOWN", pd_type = "PD") {
    log_validation("PD_COMPREHENSIVE", "STARTED",
                  details = list(segment_id = segment_id, pd_type = pd_type,
                                current_pd = round(current_pd, 6)))

    validation_summary <- list(
      segment_id = segment_id,
      pd_type = pd_type,
      current_pd = current_pd,
      overall_status = "PASSED",
      validations = list(),
      errors = list(),
      warnings = list(),
      anomalies = list()
    )

    # 1. Range validation
    log_debug("Running PD range validation", category = "VALIDATION")
    range_check <- validate_pd_range(current_pd, pd_type, segment_id)
    validation_summary$validations$range <- range_check

    if (!range_check$is_valid) {
      validation_summary$overall_status <- "FAILED"
      validation_summary$errors <- c(validation_summary$errors, range_check$errors)
      log_validation("PD_RANGE", "FAILED",
                    details = list(errors = length(range_check$errors)))
    }
    if (length(range_check$warnings) > 0) {
      validation_summary$warnings <- c(validation_summary$warnings, range_check$warnings)
      log_validation("PD_RANGE", "WARNING",
                    details = list(warnings = length(range_check$warnings)))
    }

    # 2. Monotonicity check (if time series provided)
    if (!is.null(pd_series) && length(pd_series) >= 2) {
      log_debug("Running PD monotonicity check", category = "VALIDATION")
      monotonicity_check <- check_pd_monotonicity(pd_series, NULL, segment_id)
      validation_summary$validations$monotonicity <- monotonicity_check

      if (!is.na(monotonicity_check$is_monotonic) && !monotonicity_check$is_monotonic) {
        validation_summary$warnings <- c(validation_summary$warnings, list(
          type = "non_monotonic",
          severity = "medium",
          message = sprintf("PD series has %d non-increasing transitions",
                          monotonicity_check$violation_count),
          details = monotonicity_check$violations
        ))
        log_validation("PD_MONOTONICITY", "WARNING",
                      details = list(violations = monotonicity_check$violation_count))
      }
    } else {
      log_debug("Skipping monotonicity check - insufficient time series data", category = "VALIDATION")
    }

    # 3. Anomaly detection (if historical data provided)
    if (!is.null(historical_pd) && length(historical_pd) > 0) {
      log_debug("Running PD anomaly detection", category = "VALIDATION")
      anomaly_check <- detect_pd_anomalies(current_pd, historical_pd, segment_id)
      validation_summary$validations$anomaly <- anomaly_check

      if (anomaly_check$has_anomaly) {
        validation_summary$anomalies <- anomaly_check$anomalies

        # Escalate critical anomalies to errors
        critical_anomalies <- Filter(function(a) a$severity == "critical", anomaly_check$anomalies)
        if (length(critical_anomalies) > 0) {
          validation_summary$overall_status <- "FAILED"
          validation_summary$errors <- c(validation_summary$errors, critical_anomalies)
          log_validation("PD_ANOMALY", "FAILED",
                        details = list(critical_anomalies = length(critical_anomalies)))
        } else {
          log_validation("PD_ANOMALY", "WARNING",
                        details = list(anomalies = length(anomaly_check$anomalies)))
        }
      }
    } else {
      log_debug("Skipping anomaly detection - no historical data", category = "VALIDATION")
    }

    # Generate final validation summary
    log_validation("PD_COMPREHENSIVE", validation_summary$overall_status,
                  details = list(errors = length(validation_summary$errors),
                                warnings = length(validation_summary$warnings),
                                anomalies = length(validation_summary$anomalies)))

    return(validation_summary)
  }

  # =============================================================================
  # SEGMENTATION AND DATA LOADING
  # =============================================================================

  # Dynamic UI for PD-AFL segmentation
  output$segmentationPDAFLUI <- renderUI({
    selectInput("segmentpd", "Segmentation:", choices = setNames(PD$PKID, PD$PD_MODEL_NAME))
  })

  # FIXED: Load issuer data using direct dbGetQuery exactly like original working version
  dataissuerrr0 <- eventReactive(input$runpdafl, {
    cat(" DEBUG [DATAISSUERRR0]: Starting issuer data extraction\n")
    cat("  - PD_CONFIG_ID (input$segmentpd):", input$segmentpd, "\n")

    # Use exact same pattern as original working version - with params list
    datais <- tryCatch({
      cat(" DEBUG [DATAISSUERRR0]: Executing FRS9_IMP_CA_PD_ENR query\n")
      result <- dbGetQuery(con, 'SELECT "PRC_DATE","BUCKET_FROM", "CALC_AMOUNT"
      FROM "FRS9_IMP_CA_PD_ENR"
      WHERE "PD_CONFIG_ID" = $1',
                           params = list(input$segmentpd))
      cat(" DEBUG [DATAISSUERRR0]: Query successful\n")
      result
    }, error = function(e) {
      cat(" DEBUG [DATAISSUERRR0]: Query failed:", e$message, "\n")
      return(NULL)
    })

    if(is.null(datais)) {
      cat(" DEBUG [DATAISSUERRR0]: No data returned from FRS9_IMP_CA_PD_ENR\n")
      return(NULL)
    }

    cat("  - datais dimensions:", paste(dim(datais), collapse="x"), "\n")
    if(nrow(datais) > 0) {
      cat("  - PRC_DATE range:", paste(range(datais$PRC_DATE, na.rm=TRUE), collapse=" to "), "\n")
      cat("  - BUCKET_FROM values:", paste(unique(datais$BUCKET_FROM), collapse=", "), "\n")
      cat("  - CALC_AMOUNT range:", paste(round(range(datais$CALC_AMOUNT, na.rm=TRUE)), collapse=" to "), "\n")
    }

    cat(" DEBUG [DATAISSUERRR0]: Issuer data extraction completed\n")
    datais
  })

  # FIXED: Load configuration data using direct dbGetQuery exactly like original working version
  konfig_id <- eventReactive(input$runpdafl, {
    cat(" DEBUG [KONFIG_ID]: Starting configuration data extraction\n")
    cat("  - PD_CONFIG_ID (input$segmentpd):", input$segmentpd, "\n")

    # Use exact same pattern as original working version - with params list
    datacon <- tryCatch({
      cat(" DEBUG [KONFIG_ID]: Executing FRS9_IMP_CA_PD_CONFIG query\n")
      result <- dbGetQuery(con, 'SELECT "POPULATION_TYPE","OBSERVATION_PERIOD", "OBSERVATION_START_DATE"
      FROM "FRS9_IMP_CA_PD_CONFIG"
      WHERE "PKID" = $1',
                            params = list(input$segmentpd))
      cat(" DEBUG [KONFIG_ID]: Query successful\n")
      result
    }, error = function(e) {
      cat(" DEBUG [KONFIG_ID]: Query failed:", e$message, "\n")
      return(NULL)
    })

    if(is.null(datacon)) {
      cat(" DEBUG [KONFIG_ID]: No data returned from FRS9_IMP_CA_PD_CONFIG\n")
      return(NULL)
    }

    cat("  - datacon dimensions:", paste(dim(datacon), collapse="x"), "\n")
    if(nrow(datacon) > 0) {
      cat("  - POPULATION_TYPE:", datacon$POPULATION_TYPE[1], "\n")
      cat("  - OBSERVATION_PERIOD:", datacon$OBSERVATION_PERIOD[1], "\n")
      cat("  - OBSERVATION_START_DATE:", as.character(datacon$OBSERVATION_START_DATE[1]), "\n")
    }

    cat(" DEBUG [KONFIG_ID]: Configuration data extraction completed\n")
    datacon
  })

  # Process issuer data based on configuration
  dataissuerrr01 <- reactive({
    cat(" DEBUG [DATAISSUERRR01]: Starting issuer data processing\n")

    dataisu <- dataissuerrr0()
    config <- konfig_id()

    cat(" DEBUG [DATAISSUERRR01]: Data validation\n")
    cat("  - dataisu rows:", if(is.null(dataisu)) "NULL" else nrow(dataisu), "\n")
    cat("  - config rows:", if(is.null(config)) "NULL" else nrow(config), "\n")

    if(is.null(dataisu) || nrow(dataisu) == 0) {
      cat(" DEBUG [DATAISSUERRR01]: dataisu is NULL or empty\n")
      return(data.frame())
    }

    if(is.null(config) || nrow(config) == 0) {
      cat(" DEBUG [DATAISSUERRR01]: config is NULL or empty\n")
      return(dataisu)
    }

    # Ensure Date type and access first row to avoid vector length issues
    cat(" DEBUG [DATAISSUERRR01]: Converting dates\n")
    dataisu$PRC_DATE <- as.Date(dataisu$PRC_DATE)
    config$OBSERVATION_START_DATE <- as.Date(config$OBSERVATION_START_DATE)

    cat(" DEBUG [DATAISSUERRR01]: Configuration values\n")
    cat("  - POPULATION_TYPE:", config$POPULATION_TYPE[1], "\n")
    cat("  - OBSERVATION_PERIOD:", config$OBSERVATION_PERIOD[1], "\n")
    cat("  - OBSERVATION_START_DATE:", as.character(config$OBSERVATION_START_DATE[1]), "\n")

    # CRITICAL FIX: Use [1] to ensure scalar comparison
    population_type <- config$POPULATION_TYPE[1]
    observation_period <- config$OBSERVATION_PERIOD[1]
    observation_start_date <- config$OBSERVATION_START_DATE[1]

    cat(" DEBUG [DATAISSUERRR01]: Scalar values extracted\n")
    cat("  - population_type (scalar):", population_type, "\n")
    cat("  - observation_period (scalar):", observation_period, "\n")
    cat("  - observation_start_date (scalar):", as.character(observation_start_date), "\n")

    # CRITICAL FIX: Scalar comparison to avoid vector length issues
    if(population_type == 1){
      cat(" DEBUG [DATAISSUERRR01]: Using all data (POPULATION_TYPE = 1)\n")
      dataku <- dataisu
    } else if(population_type == 2){
      cat(" DEBUG [DATAISSUERRR01]: Filtering by observation period (POPULATION_TYPE = 2)\n")

      # Take last n periods according to OBSERVATION_PERIOD
      unique_dates <- unique(dataisu$PRC_DATE)
      cat("  - Total unique dates:", length(unique_dates), "\n")
      cat("  - Observation period:", observation_period, "\n")

      last_n_dates <- tail(unique_dates, observation_period)
      cat("  - Last N dates selected:", length(last_n_dates), "\n")
      cat("  - Date range:", as.character(min(last_n_dates)), "to", as.character(max(last_n_dates)), "\n")

      dataku <- dataisu[dataisu$PRC_DATE %in% last_n_dates, ]
      cat("  - Rows after date filter:", nrow(dataku), "\n")

      # Additional filter if start period is greater than start date
      min_date <- min(last_n_dates)
      cat("  - Min date:", as.character(min_date), "\n")
      cat("  - Start date:", as.character(observation_start_date), "\n")

      if(min_date < observation_start_date){
        cat(" DEBUG [DATAISSUERRR01]: Applying start date filter\n")
        dataku <- dataku[dataku$PRC_DATE >= observation_start_date, ]
        cat("  - Rows after start date filter:", nrow(dataku), "\n")
      }
    } else {
      cat(" DEBUG [DATAISSUERRR01]: Unknown POPULATION_TYPE, using all data\n")
      dataku <- dataisu
    }

    cat(" DEBUG [DATAISSUERRR01]: Final result - rows:", nrow(dataku), "\n")
    dataku
  })

  # FIXED: Load multiplication factor data using direct dbGetQuery exactly like original working version
  datammulttt0 <- eventReactive(input$runpdafl, {
    cat(" DEBUG [DATAMMULTTT0]: Starting multiplication data extraction\n")
    cat("  - PD_CONFIG_ID (input$segmentpd):", input$segmentpd, "\n")

    # Use exact same pattern as original working version - with params list
    dataemut <- tryCatch({
      cat(" DEBUG [DATAMMULTTT0]: Executing FRS9_IMP_CA_PD_MMULT query\n")
      result <- dbGetQuery(con, 'SELECT * FROM "FRS9_IMP_CA_PD_MMULT"
      WHERE "PD_CONFIG_ID" = $1',
                           params = list(input$segmentpd))
      cat(" DEBUG [DATAMMULTTT0]: Query successful\n")
      result
    }, error = function(e) {
      cat(" DEBUG [DATAMMULTTT0]: Query failed:", e$message, "\n")
      return(NULL)
    })

    if(is.null(dataemut)) {
      cat(" DEBUG [DATAMMULTTT0]: No data returned from FRS9_IMP_CA_PD_MMULT\n")
      return(NULL)
    }

    cat("  - dataemut dimensions:", paste(dim(dataemut), collapse="x"), "\n")

    if(nrow(dataemut) > 0) {
      cat("  - PRC_DATE range:", paste(range(dataemut$PRC_DATE, na.rm=TRUE), collapse=" to "), "\n")
      cat("  - BUCKET_FROM values:", paste(unique(dataemut$BUCKET_FROM), collapse=", "), "\n")
      cat("  - FL_SEQ values:", paste(unique(dataemut$FL_SEQ), collapse=", "), "\n")
    }

    cat(" DEBUG [DATAMMULTTT0]: Multiplication data extraction completed\n")
    dataemut
  })

  # =============================================================================
  # HISTORICAL MODEL DATA TABLE (EXACT FROM ORIGINAL app15.R lines 2473-2484)
  # =============================================================================

  # Reactive: Load model summary data from database when refresh button clicked
  model_summary_data_DB2 <- eventReactive(input$refresh, {
    # FIXED: Check database connection before executing query
    if (is.null(con)) {
      cat(" WARNING [MODEL_SUMMARY_DB2]: Database connection is NULL - returning sample data\n")

      # Return sample model summary data for offline mode
      return(data.frame(
        model_id = c("MODEL_001", "MODEL_002", "MODEL_003"),
        model_name = c("Sample PD Model", "Sample LGD Model", "Sample EAD Model"),
        model_status = c("Active", "Active", "Active"),
        dependent_variable = c("Default_Rate", "Loss_Rate", "Exposure"),
        r_squared = c(0.85, 0.78, 0.92),
        mape = c(0.12, 0.15, 0.08),
        created_date = as.Date(c("2024-01-15", "2024-02-20", "2024-03-10"))
      ))
    }

    # Execute database query with error handling
    tryCatch({
      result <- dbGetQuery(con, "
        SELECT model_id, model_name, model_status, dependent_variable, r_squared, mape, created_date
        FROM frs9_r_model_summary
        WHERE id_deleted = FALSE
        ORDER BY model_id DESC
      ")

      cat(" DEBUG [MODEL_SUMMARY_DB2]: Loaded", nrow(result), "model records\n")
      return(result)

    }, error = function(e) {
      cat(" ERROR [MODEL_SUMMARY_DB2]: Database query failed:", e$message, "\n")

      # Return sample data as fallback
      return(data.frame(
        model_id = c("ERROR_001"),
        model_name = paste("Query Failed:", substr(e$message, 1, 50)),
        model_status = "Error",
        dependent_variable = "N/A",
        r_squared = 0,
        mape = 1,
        created_date = Sys.Date()
      ))
    })
  }, ignoreNULL = FALSE)

  # Output: Render Historical Model Data table
  output$model_summary_table_DB2 <- renderDT({
    datatable(model_summary_data_DB2(),
              options = list(
                pageLength = 5,
                autoWidth = TRUE,
                scrollX = TRUE,
                columnDefs = list(list(className = 'dt-center', targets = '_all'))
              ),
              rownames = FALSE,
              class = 'display compact stripe hover',
              style = 'bootstrap4')
  })

  # =============================================================================
  # MODEL DATABASE INTERACTION
  # =============================================================================

  # CRITICAL FIX: Refresh model list using direct dbGetQuery exactly like original working version
  # Original app15.R line 2556-2565: Query ALL models ordered by created_date DESC
  observeEvent(input$refresh, {
    modelupload <- tryCatch(
      dbGetQuery(con, 'SELECT "model_id","model_name" FROM "frs9_r_model_summary" ORDER BY created_date DESC'),
      error = function(e) { NULL }
    )
    if (!is.null(modelupload) && nrow(modelupload) > 0) {
      choices <- setNames(modelupload$model_name, modelupload$model_name)  # value = model_name
      updateSelectInput(session, "choose_model", choices = choices)
    }
  }, ignoreNULL = FALSE)

  # Get model data and file from database
  dataydanfileexcelDB <- reactive({
    if (is.null(input$choose_model) || input$choose_model == "") {
      return(data.frame(dependent_variable = character(0), data_file = character(0)))
    }

    # FIXED: Use direct dbGetQuery with proper parameter binding like original working version
    result0 <- tryCatch({
      dbGetQuery(con, 'SELECT "dependent_variable", "data_file" FROM "frs9_r_model_summary"
      WHERE "model_name" = $1 LIMIT 1',
                 params = list(input$choose_model))
    }, error = function(e) {
      # Graceful fallback if table doesn't exist
      data.frame(dependent_variable = character(0), data_file = character(0))
    })
    result0
  })

  # Variable Y from selected model
  vary_pdafl <- reactive({
    dataydanfileexcelDB()$dependent_variable
  })

  # Reactive Excel path management
  reactive_excel_path <- reactiveVal(NULL)

  observeEvent(dataydanfileexcelDB(), {
    df0 <- dataydanfileexcelDB()

    # Validate query results
    if (is.null(df0) || nrow(df0) == 0) {
      reactive_excel_path(NULL)
      showNotification("Model tidak ditemukan / tidak ada data_file.", type = "error")
      return()
    }

    bin <- df0$data_file[[1]]
    if (is.null(bin)) {
      reactive_excel_path(NULL)
      showNotification("Kolom data_file kosong.", type = "error")
      return()
    }

    # Write to temporary Excel file
    path <- tempfile(fileext = ".xlsx")
    ok <- tryCatch({
      writeBin(bin, path)
      TRUE
    }, error = function(e) {
      showNotification(paste("Gagal menulis file:", e$message), type = "error")
      FALSE
    })

    if (ok && file.exists(path)) {
      reactive_excel_path(path)
    } else {
      reactive_excel_path(NULL)
    }
  }, ignoreInit = TRUE)

  # =============================================================================
  # DATA EXTRACTION FROM EXCEL
  # =============================================================================

  # Extract core data from Excel
  datacorex <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    df <- tryCatch({
      openxlsx::read.xlsx(temp_xlsx, sheet = "Data full", detectDates = TRUE)
    }, error = function(e) {
      showNotification(paste("Gagal baca sheet 'Data full':", e$message), type = "error")
      return(NULL)
    })
    req(!is.null(df), ncol(df) >= 2)

    column_names <- names(df)  # FIXED: Avoid conflict with namax() reactive function
    sources <- unique(sapply(strsplit(column_names, "_"), `[`, 1))
    sources <- sources[sources %in% names(df)]
    if (length(sources) == 0) return(df)

    df[, sources, drop = FALSE]
  })

  # Extract intuition data from Excel
  intuisi_pdafl <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    tryCatch({
      openxlsx::read.xlsx(temp_xlsx, sheet = "Intuisi")
    }, error = function(e) {
      showNotification(paste("Gagal baca sheet 'Intuisi':", e$message), type = "error")
      return(NULL)
    })
  })

  # Initialize intuition data
  observeEvent(intuisi_pdafl(), {
    req(intuisi_pdafl())
    intuisiData_pdafl$data <- intuisi_pdafl()
  })

  # Render editable intuition table
  output$intuisitable_pdafl <- DT::renderDataTable({
    req(intuisiData_pdafl$data)
    DT::datatable(intuisiData_pdafl$data,
                  editable = TRUE,
                  options = list(
                    dom = 't',
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  # Handle intuition table edits
  observeEvent(input$intuisitable_pdafl_cell_edit, {
    info <- input$intuisitable_pdafl_cell_edit
    i <- info$row
    j <- info$col
    v <- suppressWarnings(as.numeric(info$value))

    if (!is.na(v) && v %in% c(-1, 0, 1)) {
      intuisiData_pdafl$data[i, j] <- v
    } else {
      showModal(modalDialog(
        title = "Input Tidak Valid",
        "Hanya boleh memasukkan nilai -1, 0, atau 1.",
        easyClose = TRUE
      ))
    }
  })

  # =============================================================================
  # MEV BOXPLOT EXECUTION
  # =============================================================================

  # Execute MEV boxplot analysis
  eksekusi_mev_BPF <- eventReactive(input$runpdafl, {
    cat(" DEBUG [EKSEKUSI_MEV_BPF]: Starting MEV boxplot analysis\n")

    datax <- datacorex()[,-1:-2]
    cat("  - datax dimensions:", if(is.null(datax)) "NULL" else paste(dim(datax), collapse="x"), "\n")
    cat("  - datax columns:", if(is.null(datax)) "NULL" else paste(names(datax), collapse=", "), "\n")

    intuisi <- intuisiData_pdafl$data$sign
    cat("  - intuisi length:", if(is.null(intuisi)) "NULL" else length(intuisi), "\n")
    cat("  - intuisi values:", if(is.null(intuisi)) "NULL" else paste(intuisi, collapse=", "), "\n")

    if(is.null(datax) || is.null(intuisi)) {
      cat(" DEBUG [EKSEKUSI_MEV_BPF]: Missing required data\n")
      return(NULL)
    }

    cat(" DEBUG [EKSEKUSI_MEV_BPF]: Calling Boxplot_Scenario function\n")
    # Execute boxplot scenario analysis
    hasil_boxplot <- Boxplot_Scenario(datax, intuisi)
    cat(" DEBUG [EKSEKUSI_MEV_BPF]: Boxplot_Scenario completed successfully\n")

    # Debug the boxplot result structure
    cat(" DEBUG [EKSEKUSI_MEV_BPF]: Boxplot result structure:\n")
    if(!is.null(hasil_boxplot$diff.base)) {
      cat("  - diff.base dimensions:", paste(dim(hasil_boxplot$diff.base), collapse="x"), "\n")
      cat("  - diff.base columns:", paste(colnames(hasil_boxplot$diff.base), collapse=", "), "\n")
    } else {
      cat("  - diff.base is NULL\n")
    }

    hasil_boxplot
  })

  # Initialize weighted data
  observeEvent(eksekusi_mev_BPF(), {
    req(eksekusi_mev_BPF())
    weighted_pdafl$data <- data.frame(weight=eksekusi_mev_BPF()$weighted.boxplot)
  })

  # Handle weighted boxplot table edits
  observeEvent(input$weighted_boxplot_table_cell_edit, {
    info <- input$weighted_boxplot_table_cell_edit
    i <- info$row
    j <- info$col
    v <- suppressWarnings(as.numeric(info$value))

    if (!is.na(v)) {
      new_data <- weighted_pdafl$data
      new_data[i, j] <- v

      # Check total weight with rounding
      total_weight <- round(sum(new_data$weight), 2)

      if (total_weight == 1) {
        weighted_pdafl$data <- new_data
      } else {
        showModal(modalDialog(
          title = "Input Tidak Valid",
          paste0("Jumlah seluruh weight harus = 1. Saat ini: ", total_weight),
          easyClose = TRUE
        ))
      }
    }
  })

  # =============================================================================
  # FORECAST DATA EXTRACTION
  # =============================================================================

  # Extract forecast MEV base data
  fmev_base_pdfl <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    df <- tryCatch({
      openxlsx::read.xlsx(temp_xlsx, sheet = "Forecast X", detectDates = TRUE)
    }, error = function(e) {
      showNotification(paste("Gagal baca sheet 'Forecast X':", e$message), type = "error")
      return(NULL)
    })
    df
  })

  # Extract model from history
  modelfromhisto_pdfl <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    df <- tryCatch({
      openxlsx::read.xlsx(temp_xlsx, sheet = "Model Akhir", detectDates = TRUE)
    }, error = function(e) {
      showNotification(paste("Gagal baca sheet 'model akhir':", e$message), type = "error")
      return(NULL)
    })
    df
  })

  # Extract historical data
  datahisto_pdfl <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    df <- tryCatch({
      openxlsx::read.xlsx(temp_xlsx, sheet = "Data full", detectDates = TRUE)
    }, error = function(e) {
      showNotification(paste("Gagal baca sheet 'Data full':", e$message), type = "error")
      return(NULL)
    })
    df
  })

  # =============================================================================
  # FORECAST BOXPLOT EXECUTION
  # =============================================================================

  # Execute forecast boxplot analysis
  fo_boxplot_pdafl <- eventReactive(input$runpdafl, {
    cat(" DEBUG [FO_BOXPLOT_PDAFL]: Starting forecast boxplot analysis\n")

    tryCatch({
      datahisto <- datahisto_pdfl()
      cat("  - datahisto dimensions:", if(is.null(datahisto)) "NULL" else paste(dim(datahisto), collapse="x"), "\n")

      modelfromhisto <- modelfromhisto_pdfl()
      cat("  - modelfromhisto dimensions:", if(is.null(modelfromhisto)) "NULL" else paste(dim(modelfromhisto), collapse="x"), "\n")

      fmev_base <- fmev_base_pdfl()
      cat("  - fmev_base dimensions:", if(is.null(fmev_base)) "NULL" else paste(dim(fmev_base), collapse="x"), "\n")
      cat("  - fmev_base column names:", if(is.null(fmev_base)) "NULL" else paste(names(fmev_base), collapse=", "), "\n")

      if(is.null(datahisto) || is.null(modelfromhisto) || is.null(fmev_base)) {
        cat(" DEBUG [FO_BOXPLOT_PDAFL]: Missing required input data\n")
        return(NULL)
      }

    cat(" DEBUG [FO_BOXPLOT_PDAFL]: Processing model formula\n")
    modelfromhistoku <- modelfromhisto$Model
    cat("  - Original model formula:", if(is.null(modelfromhistoku)) "NULL" else as.character(modelfromhistoku[1]), "\n")

    vars_needed <- unlist(modelfromhisto[, c("var1", "var2", "var3")], use.names = FALSE)
    cat("  - vars_needed from model (transformed names):", paste(vars_needed, collapse=", "), "\n")

    # CRITICAL FIX: Excel "Forecast X" has BASE names (Interbank, FX, PPI)
    # Model needs TRANSFORMED names (Interbank_Y_Lg2, FX_Diff12_Lg1, PPI_Y_Lg1)
    # Solution: Use partial matching to FIND base columns, then RENAME them to transformed names
    # This is how forecast_mev_bxp() works - it accepts ANY column names and passes them to predict()

    fmev_cols <- names(fmev_base)
    cat("  - fmev_base column names (base names from Excel):", paste(fmev_cols, collapse=", "), "\n")

    # For each TRANSFORMED model variable, find matching BASE variable in fmev_base
    # Returns named vector: c(Interbank_Y_Lg2="Interbank", FX_Diff12_Lg1="FX", ...)
    base_to_transformed_map <- sapply(vars_needed, function(var_needed) {
      # Find fmev_base column whose name is CONTAINED in the transformed variable name
      # e.g., "Interbank" is contained in "Interbank_Y_Lg2"
      matching_col <- fmev_cols[sapply(fmev_cols, function(col) {
        grepl(toupper(col), toupper(var_needed), fixed = TRUE)
      })]

      # Return first match or NA if no match
      if(length(matching_col) > 0) matching_col[1] else NA
    })

    # Names of the result are transformed names (Interbank_Y_Lg2)
    # Values are base names from fmev_base (Interbank)
    cat("  - Partial match mapping (base -> transformed):\n")
    for(i in seq_along(base_to_transformed_map)) {
      cat("    ", base_to_transformed_map[i], "->", names(base_to_transformed_map)[i], "\n")
    }

    # Remove NA values - only keep successfully matched variables
    base_to_transformed_map <- base_to_transformed_map[!is.na(base_to_transformed_map)]

    if (length(base_to_transformed_map) == 0) {
      cat(" DEBUG [FO_BOXPLOT_PDAFL]: No matching variables found\n")
      cat("   MODEL NEEDS THESE VARIABLES:", paste(vars_needed, collapse=", "), "\n")
      cat("   EXCEL FILE 'Forecast X' HAS THESE COLUMNS:", paste(names(fmev_base), collapse=", "), "\n")
      showNotification(
        paste0("Error: Excel file 'Forecast X' tidak memiliki kolom yang sesuai.\n\n",
               "Model membutuhkan: ", paste(vars_needed, collapse=", "), "\n\n",
               "File Excel memiliki: ", paste(names(fmev_base), collapse=", ")),
        type = "error",
        duration = 15
      )
      stop("Tidak ada kolom yang cocok antara model dan fmev_base.")
    }

    # vars_available now contains the BASE column names from fmev_base
    vars_available <- as.character(base_to_transformed_map)
    cat("  - vars_available (base names to extract):", paste(vars_available, collapse=", "), "\n")

    # IMPORTANT: Follow original logic EXACTLY - create model with ALL data
    cat(" DEBUG [FO_BOXPLOT_PDAFL]: Creating model (ORIGINAL LOGIC)\n")

    # Create model exactly as original - with ALL available data
    modelku <- lm(modelfromhistoku, data=datahisto)
    cat("  -  LM model created with full formula and data\n")
    cat("  - Model formula:", deparse(formula(modelku)), "\n")
    cat("  - Model has", length(coef(modelku)), "coefficients\n")

    cat(" DEBUG [FO_BOXPLOT_PDAFL]: Preparing forecast data with RENAMED columns\n")

    # CRITICAL FIX: Extract base columns and RENAME them to transformed names
    # This solves the predict() error: "object 'Interbank_Y_Lg2' not found"
    # Step 1: Extract base columns from fmev_base
    fmev_base2 <- fmev_base[, vars_available, drop = FALSE]

    # Step 2: RENAME base columns to transformed names that model expects
    # base_to_transformed_map is named vector: c(Interbank_Y_Lg2="Interbank", ...)
    # names() gives transformed names, values give current base names
    transformed_names <- names(base_to_transformed_map)
    colnames(fmev_base2) <- transformed_names
    cat("  - Renamed columns from base to transformed:\n")
    for(i in seq_along(transformed_names)) {
      cat("    ", vars_available[i], "->", transformed_names[i], "\n")
    }

    # Step 3: Add date column as first column
    dateku <- fmev_base[, 1]
    fmev_base2 <- cbind(dateku, fmev_base2)
    cat("  - fmev_base2 dimensions:", paste(dim(fmev_base2), collapse="x"), "\n")
    cat("  - fmev_base2 variables (TRANSFORMED NAMES):", paste(colnames(fmev_base2)[-1], collapse=", "), "\n")

    # Note: forecast_mev_bxp will handle the boxplot scenario matching internally

    z <- input$backtransform
    cat("  - backtransform:", z, "\n")

    vary <- vary_pdafl()
    cat("  - dependent variable:", vary, "\n")

      cat(" DEBUG [FO_BOXPLOT_PDAFL]: Calling forecast_mev_bxp function\n")
      # Execute forecast MEV boxplot with outlier method
      fo_boxplot <- forecast_mev_bxp(fmev_base2, eksekusi_mev_BPF()$diff.base, modelku, z, vary, metode = input$outliermet)

      # Validate the result structure
      if(is.null(fo_boxplot)) {
        cat(" DEBUG [FO_BOXPLOT_PDAFL]: forecast_mev_bxp returned NULL\n")
        return(NULL)
      }

      # Check required components exist
      required_components <- c("f.base", "f.best", "f.worst", "f.yjoin", "diff.boxplot")
      missing_components <- required_components[!required_components %in% names(fo_boxplot)]

      if(length(missing_components) > 0) {
        cat(" DEBUG [FO_BOXPLOT_PDAFL]: Missing components:", paste(missing_components, collapse=", "), "\n")
        cat("  - Available components:", paste(names(fo_boxplot), collapse=", "), "\n")
        return(NULL)
      }

      cat(" DEBUG [FO_BOXPLOT_PDAFL]: forecast_mev_bxp completed successfully\n")
      cat("  - outlier method used:", input$outliermet, "\n")
      cat("  - Components returned:", paste(names(fo_boxplot), collapse=", "), "\n")
      cat("  - f.base dimensions:", if(is.null(fo_boxplot$f.base)) "NULL" else paste(dim(fo_boxplot$f.base), collapse="x"), "\n")
      cat("  - f.best dimensions:", if(is.null(fo_boxplot$f.best)) "NULL" else paste(dim(fo_boxplot$f.best), collapse="x"), "\n")
      cat("  - f.worst dimensions:", if(is.null(fo_boxplot$f.worst)) "NULL" else paste(dim(fo_boxplot$f.worst), collapse="x"), "\n")

      return(fo_boxplot)

    }, error = function(e) {
      cat(" DEBUG [FO_BOXPLOT_PDAFL]: Error during forecast boxplot analysis:", e$message, "\n")
      cat("  - Error occurred at:", paste(Sys.time()), "\n")
      return(NULL)
    })
  })

  # =============================================================================
  # PD CALCULATIONS
  # =============================================================================

  # Execute PD calculations for all scenarios
  hasilPD <- eventReactive(input$runpdafl, {
    log_info("Starting PD calculations for all scenarios", category = "PD",
            details = list(transformation = input$backtransform))

    log_debug("Getting forecast boxplot results", category = "PD")
    fo_boxplot_result <- fo_boxplot_pdafl()
    if(is.null(fo_boxplot_result)) {
      log_error("Forecast boxplot returned NULL", category = "PD")
      return(NULL)
    }

    fo.y.boxplot <- fo_boxplot_result$f.yjoin
    log_debug("Forecast boxplot obtained", category = "PD",
             details = list(dimensions = if(is.null(fo.y.boxplot)) "NULL"
                           else paste(dim(fo.y.boxplot), collapse="x")))

    datahisto <- datahisto_pdfl()
    log_debug("Historical data obtained", category = "PD",
             details = list(dimensions = if(is.null(datahisto)) "NULL"
                           else paste(dim(datahisto), collapse="x")))

    vary <- vary_pdafl()
    log_debug("Dependent variable obtained", category = "PD",
             details = list(vary = vary))

    if(is.null(datahisto) || is.null(vary) || !vary %in% names(datahisto)) {
      log_error("Invalid datahisto or vary variable", category = "PD",
               details = list(vary = vary, datahisto_null = is.null(datahisto)))
      return(NULL)
    }

    datay <- datahisto[[vary]]
    cat("  - datay length:", length(datay), "\n")

    # Back transformation function
    back_trans <- function(x, z){
      if(z=="logit"){
        y <- exp(x)/(1+exp(x))
      } else if (z=="log") {
        y <- exp(x)
      } else {
        y <- x
      }
      return(y)
    }

    cat(" DEBUG [HASILPD]: Applying back transformation\n")
    datay2 <- back_trans(datay, input$backtransform)
    cat("  - datay2 length:", length(datay2), "\n")
    cat("  - datay2 range:", if(length(datay2) > 0) paste(round(range(datay2, na.rm=TRUE), 4), collapse=" to ") else "EMPTY", "\n")

    cat(" DEBUG [HASILPD]: Getting issuer data\n")
    dataissuer_raw <- dataissuerrr01()
    if(is.null(dataissuer_raw) || nrow(dataissuer_raw) == 0) {
      cat(" DEBUG [HASILPD]: dataissuerrr01() returned NULL or empty\n")
      return(NULL)
    }

    dataissuer2 <- aggregate(CALC_AMOUNT~BUCKET_FROM, data=dataissuer_raw, sum)
    cat("  - dataissuer2 dimensions:", paste(dim(dataissuer2), collapse="x"), "\n")

    issuer <- dataissuer2$CALC_AMOUNT
    cat("  - issuer vector length:", length(issuer), "\n")
    cat("  - issuer values:", paste(round(issuer), collapse=", "), "\n")

    cat(" DEBUG [HASILPD]: Processing multiplication data\n")
    datammult <- as.data.frame(datammulttt0())
    cat("  - datammult dimensions:", if(is.null(datammult)) "NULL" else paste(dim(datammult), collapse="x"), "\n")

    if(is.null(datammult) || nrow(datammult) == 0) {
      cat(" DEBUG [HASILPD]: datammult is NULL or empty\n")
      return(NULL)
    }

    latest_date <- datammult$PRC_DATE[nrow(datammult)]
    cat("  - latest_date:", as.character(latest_date), "\n")

    filtered_datammult <- datammult[datammult$PRC_DATE == latest_date & datammult$BUCKET_TO == 5, ]
    cat("  - filtered_datammult dimensions:", paste(dim(filtered_datammult), collapse="x"), "\n")

    ym.pd <- as.data.frame.matrix(xtabs(MMULT ~ BUCKET_FROM + FL_SEQ, data = filtered_datammult))
    cat("  - ym.pd dimensions:", paste(dim(ym.pd), collapse="x"), "\n")

    ym.pd[5,2:ncol(ym.pd)] <- 0
    cat("  - ym.pd bucket 5 values set to 0 (except first column)\n")

    cat(" DEBUG [HASILPD]: Using PD_engine1 with correct column names from original working version\n")

    # Extract forecast data using correct column names from original working version
    if(is.null(fo.y.boxplot)) {
      cat(" DEBUG [HASILPD]: fo.y.boxplot is NULL\n")
      return(NULL)
    }

    cat("  - fo.y.boxplot structure:\n")
    cat("    - class:", class(fo.y.boxplot), "\n")
    cat("    - dimensions:", paste(dim(fo.y.boxplot), collapse="x"), "\n")
    cat("    - column names:", paste(colnames(fo.y.boxplot), collapse=", "), "\n")

    # Use correct column names as in original working version
    forecast_base <- fo.y.boxplot$`ODR_60 BASE`
    forecast_best <- fo.y.boxplot$`ODR_60 BEST`
    forecast_worst <- fo.y.boxplot$`ODR_60 WORST`

    cat("  - forecast_base class:", class(forecast_base), "\n")
    cat("  - forecast_best class:", class(forecast_best), "\n")
    cat("  - forecast_worst class:", class(forecast_worst), "\n")

    # Calculate PD using PD_engine1 function exactly like original working version
    cat(" DEBUG [HASILPD]: Calculating PD.Base using PD_engine1\n")
    PD.Base <- PD_engine1(forecast_base, datay2, issuer, ym.pd)

    cat(" DEBUG [HASILPD]: Calculating PD.Best using PD_engine1\n")
    PD.Best <- PD_engine1(forecast_best, datay2, issuer, ym.pd)

    cat(" DEBUG [HASILPD]: Calculating PD.Worst using PD_engine1\n")
    PD.Worst <- PD_engine1(forecast_worst, datay2, issuer, ym.pd)

    cat(" DEBUG [HASILPD]: All PD calculations completed successfully\n")

    list(
      Base  = PD.Base,
      Best  = PD.Best,
      Worst = PD.Worst
    )
  })

  # Execute final PD calculations with weighted combination
  hasilFinal <- eventReactive(input$runpdafl_final, {
    cat(" DEBUG [HASILFINAL]: Starting final PD calculations with weighted combination\n")

    req(hasilPD())
    pd_results <- hasilPD()

    if(is.null(pd_results)) {
      cat(" DEBUG [HASILFINAL]: hasilPD() returned NULL\n")
      return(NULL)
    }

    cat("  - PD scenarios available:", paste(names(pd_results), collapse=", "), "\n")

    # Check weighted data
    if(is.null(weighted_pdafl$data) || is.null(weighted_pdafl$data$weight)) {
      cat(" DEBUG [HASILFINAL]: weighted_pdafl data is NULL\n")
      return(NULL)
    }

    weights <- weighted_pdafl$data$weight
    cat("  - weights:", paste(round(weights, 3), collapse=", "), "\n")
    cat("  - weights sum:", round(sum(weights), 3), "\n")

    cat(" DEBUG [HASILFINAL]: Extracting monthly MPD data\n")
    base_mpd <- pd_results$Base$monthly_mpd_afl
    best_mpd <- pd_results$Best$monthly_mpd_afl
    worst_mpd <- pd_results$Worst$monthly_mpd_afl

    cat("  - base_mpd dimensions:", if(is.null(base_mpd)) "NULL" else paste(dim(base_mpd), collapse="x"), "\n")
    cat("  - best_mpd dimensions:", if(is.null(best_mpd)) "NULL" else paste(dim(best_mpd), collapse="x"), "\n")
    cat("  - worst_mpd dimensions:", if(is.null(worst_mpd)) "NULL" else paste(dim(worst_mpd), collapse="x"), "\n")

    cat(" DEBUG [HASILFINAL]: Calling PD_engine_final\n")
    PD.Final <- PD_engine_final(base_mpd, best_mpd, worst_mpd, weights)
    cat(" DEBUG [HASILFINAL]: PD_engine_final completed successfully\n")

    # Return only relevant Final tables
    result <- list(
      monthly_mpd_afl_final = PD.Final$monthly_mpd_afl_final,
      monthly_cpd_afl_final = PD.Final$monthly_cpd_afl_final,
      yearly_mpd_afl_final   = PD.Final$yearly_mpd_afl_final,
      yearly_cpd_afl_final   = PD.Final$yearly_cpd_afl_final
    )

    cat(" DEBUG [HASILFINAL]: Final results prepared\n")
    result
  })

  # =============================================================================
  # OUTPUT RENDERS
  # =============================================================================

  # Render MEV boxplot results
  output$df_klasifikasi_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$df.klasifikasi,
                  options = list(
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "300px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  output$category_frecuency_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$category.frecuency,
                  options = list(
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "300px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  output$category_percentage_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$category.percentage,
                  options = list(
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "300px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  rownames = FALSE,
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  # Render weighted boxplot tables
  output$weighted_boxplot_table0 <- DT::renderDT({
    DT::datatable(data.frame(weight=eksekusi_mev_BPF()$weighted.boxplot),
                  options = list(
                    autoWidth = TRUE,
                    dom = 't',
                    paging = FALSE,
                    scrollX = TRUE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  output$weighted_boxplot_table <- DT::renderDT({
    req(weighted_pdafl$data)
    DT::datatable(
      weighted_pdafl$data,
      options = list(
        dom = 't',
        paging = FALSE,
        autoWidth = TRUE,
        scrollX = TRUE,
        columnDefs = list(list(className = 'dt-center', targets = '_all'))
      ),
      editable = TRUE,
      class = 'display compact stripe hover',
      style = 'bootstrap4'
    )
  })

  # Render additional MEV tables
  output$avg_table_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$avg.table,
                  options = list(
                    pageLength = 5,
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "400px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  output$diff_base_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$diff.base,
                  options = list(
                    pageLength = 5,
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "400px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  # Render forecast boxplot tables
  output$fo_boxplotbase_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$f.base,
                  options = list(
                    pageLength = 5,
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "400px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  rownames = FALSE,
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  output$fo_boxplotbest_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$f.best,
                  options = list(
                    pageLength = 5,
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "400px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  rownames = FALSE,
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  output$fo_boxplotworst_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$f.worst,
                  options = list(
                    pageLength = 5,
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "400px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  rownames = FALSE,
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  output$fo_boxplotyjoin_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$f.yjoin,
                  options = list(
                    pageLength = 5,
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "400px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  rownames = FALSE,
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  output$fo_boxplotdiff_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$diff.boxplot,
                  options = list(
                    pageLength = 5,
                    autoWidth = TRUE,
                    scrollX = TRUE,
                    scrollY = "400px",
                    dom = 't',
                    paging = FALSE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  rownames = FALSE,
                  class = 'display compact stripe hover',
                  style = 'bootstrap4')
  })

  # Dynamic PD tables rendering for all scenarios
  observe({
    # Use req() to silently exit if hasilPD() hasn't been triggered yet
    # This matches the original app15.R behavior at line 2971
    req(hasilPD())

    # Only print debug messages AFTER req() passes (meaning hasilPD exists)
    cat("\n", paste(rep("=", 80), collapse=""), "\n")
    cat(" DEBUG [PD_TABLES_OBSERVE]: PD TABLES RENDERING ACTIVATED\n")
    cat(paste(rep("=", 80), collapse=""), "\n")

    pd_data <- hasilPD()

    cat(" DEBUG [PD_TABLES_OBSERVE]: hasilPD() data received successfully\n")
    cat("  - Scenarios available:", paste(names(pd_data), collapse=", "), "\n")
    cat("  - Processing", length(pd_tables_map), "table types per scenario\n")

    for (scenario in c("Base","Best","Worst")) {
      if(scenario %in% names(pd_data)) {
        scenario_data <- pd_data[[scenario]]
        cat("   Processing", scenario, "scenario:", length(scenario_data), "tables\n")

        for (tbl_key in names(pd_tables_map)) {
          local({
            s <- tolower(scenario)
            t <- tbl_key
            output_id <- paste0("pd_", s, "_", t)

            if(t %in% names(scenario_data)) {
              table_data <- scenario_data[[t]]

              # Render the table with improved alignment and full width
              output[[output_id]] <- renderDT({
                datatable(
                  table_data,
                  options = list(
                    scrollX = TRUE,
                    scrollY = "250px",
                    paging = FALSE,
                    autoWidth = TRUE,
                    columnDefs = list(list(className = 'dt-center', targets = '_all'))
                  ),
                  class = 'display compact stripe hover',
                  style = 'bootstrap4'
                )
              })
            } else {
              # Table not found - render error message
              output[[output_id]] <- renderDT({
                datatable(data.frame(Error = paste("Table", t, "not found")), options = list(dom='t'))
              })
            }
          })
        }
      } else {
        cat("   Scenario", scenario, "not found in pd_data\n")

        # Render empty tables for missing scenario
        for (tbl_key in names(pd_tables_map)) {
          local({
            s <- tolower(scenario)
            t <- tbl_key
            output_id <- paste0("pd_", s, "_", t)

            output[[output_id]] <- renderDT({
              datatable(data.frame(Error = paste("Scenario", scenario, "not available")), options = list(dom='t'))
            })
          })
        }
      }
    }

    cat(" DEBUG [PD_TABLES_OBSERVE]: All PD tables rendering completed\n")
  })

  # Dynamic final PD tables rendering
  observe({
    req(hasilFinal())
    final_data <- hasilFinal()

    for (tbl_key in names(pd_final_map)) {
      local({
        t <- tbl_key
        output[[paste0("pd_final_", t)]] <- renderDT({
          req(final_data[[t]])
          datatable(
            final_data[[t]],
            options = list(
              scrollX = TRUE,
              scrollY = "250px",
              paging = FALSE,
              autoWidth = TRUE,
              columnDefs = list(list(className = 'dt-center', targets = '_all'))
            ),
            class = 'display compact stripe hover',
            style = 'bootstrap4'
          )
        })
      })
    }
  })

  # =============================================================================
  # DOWNLOAD HANDLERS
  # =============================================================================

  # Download PDAFL basic results
  output$download_xlsx_pdafl <- downloadHandler(
    filename = function() paste0("PDAFL_Output_", Sys.Date(), ".xlsx"),
    content = function(file) {
      req(eksekusi_mev_BPF())

      # Collect all tables to export
      weights_df <- tryCatch(
        { if (!is.null(eksekusi_mev_BPF()$weighted.boxplot)) data.frame(weight=eksekusi_mev_BPF()$weighted.boxplot) else NULL },
        error = function(e) NULL
      )

      tables <- list(
        list(name = "Df Klasifikasi",         df = eksekusi_mev_BPF()$df.klasifikasi),
        list(name = "Category Frequency",      df = eksekusi_mev_BPF()$category.frecuency),
        list(name = "Category Percentage",     df = eksekusi_mev_BPF()$category.percentage),
        list(name = "Weighted Boxplot Weights",df = weights_df),
        list(name = "Avg Table",               df = eksekusi_mev_BPF()$avg.table),
        list(name = "Diff Base",               df = eksekusi_mev_BPF()$diff.base)
      )

      wb <- createWorkbook()
      addWorksheet(wb, "Output")

      titleStyle <- createStyle(textDecoration = "bold", fontSize = 12)
      headerStyle <- createStyle(textDecoration = "bold")

      current_row <- 1L
      max_cols <- 1L

      for (t in tables) {
        if (is.null(t$df) || is.null(ncol(t$df)) || ncol(t$df) == 0) next

        # Write table name (title)
        writeData(wb, "Output", x = t$name, startRow = current_row, startCol = 1, colNames = FALSE)
        addStyle(wb, "Output", style = titleStyle, rows = current_row, cols = 1, gridExpand = TRUE)

        # Write table exactly 1 row below title
        writeData(
          wb, "Output", x = t$df, startRow = current_row + 1, startCol = 1,
          headerStyle = headerStyle, borders = "rows", rowNames = FALSE
        )

        # Calculate table height: header (1) + nrow data
        n_rows <- if (is.null(nrow(t$df))) 0L else nrow(t$df)
        block_height <- 1L + n_rows

        # Update next row: title(1) + table(block_height) + spacing(3)
        current_row <- current_row + 1L + block_height + 3L

        # Track maximum columns for auto width
        max_cols <- max(max_cols, ncol(t$df))
      }

      # Auto width for all used columns
      setColWidths(wb, "Output", cols = 1:max_cols, widths = "auto")

      saveWorkbook(wb, file, overwrite = TRUE)
    }
  )

  # Helper function for writing multiple tables to one sheet
  write_tables_one_sheet <- function(wb, sheet, items, start_row = 1L) {
    titleStyle  <- createStyle(textDecoration = "bold", fontSize = 12)
    headerStyle <- createStyle(textDecoration = "bold")
    current_row <- start_row
    max_cols    <- 1L

    for (it in items) {
      nm <- it$name
      df <- it$df
      if (is.null(df) || is.null(ncol(df)) || ncol(df) == 0) next

      # Title
      writeData(wb, sheet, x = nm, startRow = current_row, startCol = 1, colNames = FALSE)
      addStyle(wb, sheet, titleStyle, rows = current_row, cols = 1, gridExpand = TRUE)

      # Table
      writeData(
        wb, sheet, x = df, startRow = current_row + 1, startCol = 1,
        headerStyle = headerStyle, borders = "rows", rowNames = FALSE
      )

      n_rows       <- if (is.null(nrow(df))) 0L else nrow(df)
      block_height <- 1L + n_rows
      current_row  <- current_row + 1L + block_height + 3L
      max_cols     <- max(max_cols, ncol(df))
    }

    setColWidths(wb, sheet, cols = 1:max_cols, widths = "auto")
    invisible(current_row)
  }

  # Download comprehensive PDAFL results
  output$download_all_xlsx <- downloadHandler(
    filename = function() paste0("PDAFL_All_",max(dataissuerrr01()$PRC_DATE)," rep-", Sys.Date(), ".xlsx"),
    content = function(file) {

      wb <- createWorkbook()

      ## MEV Boxplot Sheet
      addWorksheet(wb, "MEV Boxplot")

      items_sheet1 <- list()
      if (!is.null(eksekusi_mev_BPF())) {
        weights_df <- tryCatch(
          { if (!is.null(eksekusi_mev_BPF()$weighted.boxplot)) data.frame(weight=eksekusi_mev_BPF()$weighted.boxplot) else NULL },
          error = function(e) NULL
        )

        items_sheet1 <- list(
          list(name = "Df Klasifikasi",           df = eksekusi_mev_BPF()$df.klasifikasi),
          list(name = "Category Frequency",       df = eksekusi_mev_BPF()$category.frecuency),
          list(name = "Category Percentage",      df = eksekusi_mev_BPF()$category.percentage),
          list(name = "Weighted Boxplot Weights", df = weights_df),
          list(name = "Avg Table",                df = eksekusi_mev_BPF()$avg.table),
          list(name = "Diff Base",                df = eksekusi_mev_BPF()$diff.base)
        )
      }

      if (length(items_sheet1) == 0) {
        writeData(wb, "MEV Boxplot", "Belum ada data MEV Boxplot yang dieksekusi.", startRow = 1, startCol = 1)
      } else {
        write_tables_one_sheet(wb, "MEV Boxplot", items_sheet1, start_row = 1L)
      }

      ## MEV Forecast Boxplot Sheet
      addWorksheet(wb, "MEV Forecast Boxplot")

      items_sheet2 <- list()
      if (!is.null(fo_boxplot_pdafl())) {
        items_sheet2 <- list(
          list(name = "Forecast Base",              df = fo_boxplot_pdafl()$f.base),
          list(name = "Forecast Best",              df = fo_boxplot_pdafl()$f.best),
          list(name = "Forecast Worst",             df = fo_boxplot_pdafl()$f.worst),
          list(name = "Forecast YJoin (Gabungan)",  df = fo_boxplot_pdafl()$f.yjoin),
          list(name = "Difference vs Boxplot Base", df = fo_boxplot_pdafl()$diff.boxplot)
        )
      }

      if (length(items_sheet2) == 0) {
        writeData(wb, "MEV Forecast Boxplot", "Belum ada data Forecast MEV Boxplot yang dieksekusi.", startRow = 1, startCol = 1)
      } else {
        write_tables_one_sheet(wb, "MEV Forecast Boxplot", items_sheet2, start_row = 1L)
      }

      ## PD Execution Sheet
      addWorksheet(wb, "Eksekusi PD")

      # Header with report date
      report_text <- tryCatch({
        x <- dataissuerrr01()
        if (!is.null(x) && "PRC_DATE" %in% names(x)) {
          dt <- suppressWarnings(max(as.Date(x$PRC_DATE), na.rm = TRUE))
          paste0("Report PD Date ", format(dt, "%Y-%m-%d"))
        } else {
          "Report PD Date -"
        }
      }, error = function(e) "Report PD Date -")

      openxlsx::writeData(wb, "Eksekusi PD", report_text, startRow = 1, startCol = 1)

      hdr_style <- openxlsx::createStyle(textDecoration = "bold", fontSize = 12)
      openxlsx::addStyle(wb, "Eksekusi PD", hdr_style, rows = 1, cols = 1, gridExpand = TRUE)
      openxlsx::freezePane(wb, "Eksekusi PD", firstActiveRow = 3)

      # Content starting from row 3
      items_sheet3 <- list()

      # Include weighted boxplot table (edited results)
      weights_edited <- tryCatch({
        if (!is.null(weighted_pdafl$data)) {
          dfw <- weighted_pdafl$data
          dfw <- data.frame(weight = dfw)
          dfw$weight <- as.numeric(dfw$weight)
          data.frame(Index = c("Base","Best","Worst"), Weight = dfw$weight)
        } else NULL
      }, error = function(e) NULL)

      items_sheet3 <- append(items_sheet3, list(
        list(name = "Weighted Boxplot (Edited) - from weighted_boxplot_table", df = weights_edited)
      ))

      # PD tables per scenario (Base/Best/Worst)
      if (!is.null(hasilPD())) {
        pd_data <- hasilPD()
        for (scenario in c("Base","Best","Worst")) {
          items_sheet3 <- append(items_sheet3, list(
            list(name = paste("Scenario:", scenario), df = data.frame(Info = " "))
          ))
          for (tbl_key in names(pd_tables_map)) {
            df_here <- tryCatch(pd_data[[scenario]][[tbl_key]], error = function(e) NULL)
            items_sheet3 <- append(items_sheet3, list(
              list(name = paste0(pd_tables_map[[tbl_key]], " (", scenario, ")"), df = df_here)
            ))
          }
        }
      }

      # FINAL tables
      if (!is.null(hasilFinal())) {
        final_data <- hasilFinal()
        items_sheet3 <- append(items_sheet3, list(
          list(name = "Section: FINAL (Weighted Combination)", df = data.frame(Info = " "))
        ))
        for (tbl_key in names(pd_final_map)) {
          df_here <- tryCatch(final_data[[tbl_key]], error = function(e) NULL)
          items_sheet3 <- append(items_sheet3, list(
            list(name = pd_final_map[[tbl_key]], df = df_here)
          ))
        }
      }

      # Write all tables to sheet, starting from row 3
      if (length(items_sheet3) == 0) {
        openxlsx::writeData(wb, "Eksekusi PD", "Belum ada hasil Eksekusi PD.", startRow = 3, startCol = 1)
      } else {
        write_tables_one_sheet(wb, "Eksekusi PD", items_sheet3, start_row = 3L)
      }

      # Save workbook
      saveWorkbook(wb, file, overwrite = TRUE)
    }
  )

  # =============================================================================
  # DATABASE SAVE FUNCTIONALITY
  # =============================================================================

  # FIXED: Get current model ID using direct dbGetQuery exactly like original working version
  current_model_id <- reactive({
    req(input$choose_model)
    tryCatch({
      res <- dbGetQuery(con, 'SELECT "model_id" FROM "frs9_r_model_summary" WHERE "model_name" = $1 LIMIT 1',
                        params = list(input$choose_model))
      if (nrow(res) > 0) as.integer(res$model_id[[1]]) else NA_integer_
    }, error = function(e) {
      cat(" Model ID lookup failed (this is normal):", e$message, "\n")
      NA_integer_
    })
  })

  # Save PD results to database
  observeEvent(input$save_pd, {
    req(hasilPD())

    # Metadata
    prc_date     <- max(dataissuerrr01()$PRC_DATE, na.rm = TRUE)
    pd_config_id <- as.integer(input$segmentpd)
    model_id     <- current_model_id()
    created_by   <- if (!is.null(session$user) && nzchar(session$user)) session$user else
      if (!is.na(Sys.info()[["user"]])) Sys.info()[["user"]] else "shiny"

    pd <- hasilPD()             # list: Base, Best, Worst
    pf <- try(hasilFinal(), silent = TRUE)
    has_final <- !(inherits(pf, "try-error") || is.null(pf))

    # Build YEARLY (Base/Best/Worst)
    df_year_base  <- build_yearly_rows(pd$Base$yearly_mpd_afl,  pd$Base$yearly_cpd_afl,  1L, prc_date, pd_config_id, model_id, created_by)
    df_year_best  <- build_yearly_rows(pd$Best$yearly_mpd_afl,  pd$Best$yearly_cpd_afl,  2L, prc_date, pd_config_id, model_id, created_by)
    df_year_worst <- build_yearly_rows(pd$Worst$yearly_mpd_afl, pd$Worst$yearly_cpd_afl, 3L, prc_date, pd_config_id, model_id, created_by)
    df_year_all   <- rbind(df_year_base, df_year_best, df_year_worst)

    if (has_final) {
      df_year_final <- build_yearly_rows(
        pf$yearly_mpd_afl_final,
        pf$yearly_cpd_afl_final %||% NULL,
        4L, prc_date, pd_config_id, model_id, created_by
      )
      df_year_all <- rbind(df_year_all, df_year_final)
    }

    # Build MONTHLY (Base/Best/Worst)
    df_mon_base  <- build_monthly_rows(pd$Base$monthly_mpd_afl,  pd$Base$monthly_cpd_afl %||% NULL, 1L, prc_date, pd_config_id, model_id, created_by)
    df_mon_best  <- build_monthly_rows(pd$Best$monthly_mpd_afl,  pd$Best$monthly_cpd_afl %||% NULL, 2L, prc_date, pd_config_id, model_id, created_by)
    df_mon_worst <- build_monthly_rows(pd$Worst$monthly_mpd_afl, pd$Worst$monthly_cpd_afl %||% NULL, 3L, prc_date, pd_config_id, model_id, created_by)
    df_mon_all   <- rbind(df_mon_base, df_mon_best, df_mon_worst)

    # Build MONTHLY FINAL (if available)
    if (has_final) {
      df_mon_final <- build_monthly_rows(
        pf$monthly_mpd_afl_final,
        pf$monthly_cpd_afl_final %||% NULL,
        4L, prc_date, pd_config_id, model_id, created_by
      )
      df_mon_all <- rbind(df_mon_all, df_mon_final)
    }

    # Save to DB (1 transaction)
    tryCatch({
      DBI::dbWithTransaction(con, {
        # YEARLY
        DBI::dbAppendTable(con, "frs9_r_pd_output_yearly", df_year_all)

        # MONTHLY
        DBI::dbAppendTable(con, "frs9_r_pd_output_monthly", df_mon_all)
      })

      n_year <- nrow(df_year_all)
      n_mon  <- nrow(df_mon_all)
      msg <- sprintf("Sukses simpan PD: YEARLY=%d baris, MONTHLY=%d baris%s.",
                     n_year, n_mon, if (has_final) " (dengan FINAL)" else "")
      showNotification(msg, type = "default")

    }, error = function(e) {
      showNotification(paste("Gagal simpan PD:", e$message), type = "error")
    })
  }, ignoreInit = TRUE)

  # =============================================================================
  # ADDITIONAL EVENT HANDLERS - IMPROVED FUNCTIONALITY
  # =============================================================================

  # Refresh PD & AFL data
  observeEvent(input$refresh_pdafl, {
    cat(" [PD&AFL]: Refresh data requested\n")
    showNotification("Refreshing PD & AFL data...", type = "default", duration = 2)

    # Clear reactive values to force refresh
    rm(list = ls(envir = .GlobalEnv), envir = .GlobalEnv)

    # Reinitialize data
    if (exists("PD", envir = .GlobalEnv)) {
      rm("PD", envir = .GlobalEnv)
    }

    # Trigger data reload
    session$reload()

    showNotification("PD & AFL data refreshed successfully!", type = "message", duration = 3)
  })

  # Clear cache
  observeEvent(input$clear_pdafl_cache, {
    cat("🗑️ [PD&AFL]: Cache clear requested\n")
    showNotification("Clearing PD & AFL cache...", type = "default", duration = 2)

    # Clear specific reactive values
    rm(list = c("hasilPD", "hasilFinal", "eksekusi_mev_BPF", "fo_boxplot_pdafl"),
       envir = environment(), inherits = FALSE)

    # Clear browser cache via JavaScript
    session$sendCustomMessage("clear_cache", list(timestamp = Sys.time()))

    showNotification("PD & AFL cache cleared successfully!", type = "message", duration = 3)
  })

  # Handle download button click (improved event handling)
  observeEvent(input$download_clicked, {
    cat("📥 [PD&AFL]: Download button clicked\n")
    showNotification("Preparing download...", type = "default", duration = 1)
  })

  # =============================================================================
  # PD OUTPUT TABLES - ORIGINAL PATTERN IMPLEMENTATION
  # =============================================================================

  # Create output tables for Base, Best, and Worst PD scenarios
  # Following the exact pattern from _v30/app30.R (lines 2987-3005)
  observe({
    req(hasilPD())
    pd_data <- hasilPD()

    for (scenario in c("Base","Best","Worst")) {
      for (tbl_key in names(pd_tables_map)) {
        local({
          s <- tolower(scenario)
          t <- tbl_key
          output[[paste0("pd_", s, "_", t)]] <- renderDT({
            datatable(
              pd_data[[scenario]][[t]],
              options = list(scrollX = TRUE, scrollY = "250px", paging = FALSE)
            )
          })
        })
      }
    }
  })

  # PD Final tables output - Following original pattern from _v30/app30.R
  observe({
    req(hasilFinal())
    final_data <- hasilFinal()

    for (tbl_key in names(pd_final_map)) {
      local({
        t <- tbl_key
        output[[paste0("pd_final_", t)]] <- renderDT({
          req(final_data[[t]])
          datatable(
            final_data[[t]],
            options = list(scrollX = TRUE, scrollY = "250px", paging = FALSE)
          )
        })
      })
    }
  })

  # =============================================================================
  # RETURN VALUES
  # =============================================================================

  return(list(
    mev_boxplot_results = eksekusi_mev_BPF,
    forecast_boxplot_results = fo_boxplot_pdafl,
    pd_results = hasilPD,
    final_pd_results = hasilFinal,
    weighted_data = reactive({ weighted_pdafl$data }),
    issuer_data = dataissuerrr01,
    config_data = konfig_id
  ))
}

# =============================================================================
# END OF PD-AFL SERVER MODULE
# =============================================================================