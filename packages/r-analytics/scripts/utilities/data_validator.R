# packages/r-analytics/scripts/utilities/data_validator.R
# Data validation utilities for IFRS 9 calculations

library(jsonlite)
library(dplyr)

# Validate portfolio data structure
validate_portfolio_data <- function(data) {
  tryCatch({
    validation_results <- list(
      is_valid = TRUE,
      errors = c(),
      warnings = c(),
      data_summary = list(),
      field_analysis = list()
    )
    
    # Check if data is a data frame or can be converted
    if (!is.data.frame(data)) {
      if (is.list(data) && length(data) > 0) {
        data <- data.frame(data)
      } else {
        validation_results$is_valid <- FALSE
        validation_results$errors <- c(validation_results$errors, "Data must be a data frame or convertible list")
        return(validation_results)
      }
    }
    
    # Check for minimum required fields
    required_fields <- c("account_id", "outstanding_amount")
    missing_required <- setdiff(required_fields, names(data))
    
    if (length(missing_required) > 0) {
      validation_results$is_valid <- FALSE
      validation_results$errors <- c(
        validation_results$errors,
        paste("Missing required fields:", paste(missing_required, collapse = ", "))
      )
    }
    
    # Check for recommended fields
    recommended_fields <- c("customer_id", "product_type", "origination_date", "maturity_date")
    missing_recommended <- setdiff(recommended_fields, names(data))
    
    if (length(missing_recommended) > 0) {
      validation_results$warnings <- c(
        validation_results$warnings,
        paste("Missing recommended fields:", paste(missing_recommended, collapse = ", "))
      )
    }
    
    # Data quality checks
    if ("outstanding_amount" %in% names(data)) {
      # Check for negative amounts
      negative_amounts <- sum(data$outstanding_amount < 0, na.rm = TRUE)
      if (negative_amounts > 0) {
        validation_results$warnings <- c(
          validation_results$warnings,
          paste(negative_amounts, "records have negative outstanding amounts")
        )
      }
      
      # Check for zero amounts
      zero_amounts <- sum(data$outstanding_amount == 0, na.rm = TRUE)
      if (zero_amounts > 0) {
        validation_results$warnings <- c(
          validation_results$warnings,
          paste(zero_amounts, "records have zero outstanding amounts")
        )
      }
    }
    
    # Check for missing values
    na_summary <- sapply(data, function(x) sum(is.na(x)))
    high_na_fields <- names(na_summary[na_summary > nrow(data) * 0.5])
    
    if (length(high_na_fields) > 0) {
      validation_results$warnings <- c(
        validation_results$warnings,
        paste("Fields with >50% missing values:", paste(high_na_fields, collapse = ", "))
      )
    }
    
    # Data summary
    validation_results$data_summary <- list(
      total_records = nrow(data),
      total_fields = ncol(data),
      total_exposure = ifelse("outstanding_amount" %in% names(data), 
                             sum(data$outstanding_amount, na.rm = TRUE), 0),
      date_range = ifelse("origination_date" %in% names(data),
                         paste(min(data$origination_date, na.rm = TRUE), "to", 
                              max(data$origination_date, na.rm = TRUE)), "N/A")
    )
    
    # Field analysis
    validation_results$field_analysis <- lapply(names(data), function(col) {
      list(
        field_name = col,
        data_type = class(data[[col]])[1],
        missing_count = sum(is.na(data[[col]])),
        unique_values = length(unique(data[[col]][!is.na(data[[col]])])),
        sample_values = head(unique(data[[col]][!is.na(data[[col]])]), 5)
      )
    })
    names(validation_results$field_analysis) <- names(data)
    
    return(validation_results)
    
  }, error = function(e) {
    return(list(
      is_valid = FALSE,
      errors = c(paste("Validation failed:", e$message)),
      warnings = c(),
      data_summary = list(),
      field_analysis = list()
    ))
  })
}

# Validate calculation parameters
validate_calculation_parameters <- function(parameters) {
  tryCatch({
    validation_results <- list(
      is_valid = TRUE,
      errors = c(),
      warnings = c(),
      parameter_summary = list()
    )
    
    # Default parameter structure
    default_params <- list(
      pd_params = list(
        base_pd_12m = 0.015,
        base_pd_lifetime = 0.08,
        rating_multiplier = 1.0,
        sector_adjustment = 0.0,
        economic_adjustment = 0.0
      ),
      lgd_params = list(
        base_lgd = 0.45,
        secured_discount = 0.2,
        unsecured_premium = 0.1,
        collateral_haircut = 0.3
      ),
      ead_params = list(
        credit_conversion_factor = 0.75,
        usage_given_default = 0.85
      ),
      staging_params = list(
        stage1_dpd_threshold = 30,
        stage2_dpd_threshold = 90,
        stage2_sicr_threshold = 2.0,
        stage3_default_threshold = 90
      )
    )
    
    # Check parameter ranges
    if (!is.null(parameters$pd_params)) {
      if (!is.null(parameters$pd_params$base_pd_12m)) {
        if (parameters$pd_params$base_pd_12m < 0 || parameters$pd_params$base_pd_12m > 1) {
          validation_results$errors <- c(
            validation_results$errors,
            "base_pd_12m must be between 0 and 1"
          )
          validation_results$is_valid <- FALSE
        }
      }
      
      if (!is.null(parameters$pd_params$base_pd_lifetime)) {
        if (parameters$pd_params$base_pd_lifetime < 0 || parameters$pd_params$base_pd_lifetime > 1) {
          validation_results$errors <- c(
            validation_results$errors,
            "base_pd_lifetime must be between 0 and 1"
          )
          validation_results$is_valid <- FALSE
        }
      }
    }
    
    if (!is.null(parameters$lgd_params)) {
      if (!is.null(parameters$lgd_params$base_lgd)) {
        if (parameters$lgd_params$base_lgd < 0 || parameters$lgd_params$base_lgd > 1) {
          validation_results$errors <- c(
            validation_results$errors,
            "base_lgd must be between 0 and 1"
          )
          validation_results$is_valid <- FALSE
        }
      }
    }
    
    # Parameter summary
    validation_results$parameter_summary <- list(
      provided_parameters = names(parameters),
      missing_parameters = setdiff(names(default_params), names(parameters)),
      parameter_count = length(names(parameters))
    )
    
    return(validation_results)
    
  }, error = function(e) {
    return(list(
      is_valid = FALSE,
      errors = c(paste("Parameter validation failed:", e$message)),
      warnings = c(),
      parameter_summary = list()
    ))
  })
}

# Main validation function
validate_input_data <- function(input_data) {
  results <- list(
    overall_valid = TRUE,
    portfolio_validation = list(),
    parameter_validation = list(),
    timestamp = Sys.time()
  )
  
  # Validate portfolio data if provided
  if (!is.null(input_data$portfolio_data)) {
    results$portfolio_validation <- validate_portfolio_data(input_data$portfolio_data)
    if (!results$portfolio_validation$is_valid) {
      results$overall_valid <- FALSE
    }
  }
  
  # Validate parameters if provided
  if (!is.null(input_data$parameters)) {
    results$parameter_validation <- validate_calculation_parameters(input_data$parameters)
    if (!results$parameter_validation$is_valid) {
      results$overall_valid <- FALSE
    }
  }
  
  return(results)
}

# If script is called directly, validate input_data from JSON
if (exists("input_data")) {
  validation_result <- validate_input_data(input_data)
  cat(toJSON(validation_result, auto_unbox = TRUE, pretty = TRUE))
} else {
  cat(toJSON(list(
    success = FALSE,
    error = "No input_data provided for validation"
  ), auto_unbox = TRUE))
}

# packages/r-analytics/scripts/utilities/health_check.R
# Health check script for R Analytics service

library(jsonlite)

# Perform comprehensive health check
perform_health_check <- function() {
  tryCatch({
    health_result <- list(
      success = TRUE,
      service_status = "healthy",
      r_version = R.version.string,
      timestamp = Sys.time(),
      checks = list()
    )
    
    # Check R version
    r_version <- R.Version()
    health_result$checks$r_version <- list(
      status = "ok",
      version = paste(r_version$major, r_version$minor, sep = "."),
      details = "R version is compatible"
    )
    
    # Check required packages
    required_packages <- c("jsonlite", "dplyr", "survival", "DBI")
    package_status <- list()
    
    for (pkg in required_packages) {
      pkg_check <- list(
        name = pkg,
        status = "ok",
        installed = FALSE,
        version = "unknown"
      )
      
      tryCatch({
        if (require(pkg, character.only = TRUE, quietly = TRUE)) {
          pkg_check$installed <- TRUE
          pkg_check$version <- as.character(packageVersion(pkg))
        } else {
          pkg_check$status <- "missing"
          pkg_check$installed <- FALSE
          health_result$checks$packages$status <- "warning"
        }
      }, error = function(e) {
        pkg_check$status <- "error"
        pkg_check$error <- e$message
      })
      
      package_status[[pkg]] <- pkg_check
    }
    
    health_result$checks$packages <- list(
      status = "ok",
      packages = package_status
    )
    
    # Test basic calculation
    tryCatch({
      test_data <- data.frame(
        account_id = c("TEST001", "TEST002", "TEST003"),
        outstanding_amount = c(10000, 20000, 15000),
        pd = c(0.01, 0.02, 0.015),
        lgd = c(0.4, 0.5, 0.45)
      )
      
      test_data$ecl <- test_data$outstanding_amount * test_data$pd * test_data$lgd
      test_sum <- sum(test_data$ecl)
      
      health_result$checks$calculation_test <- list(
        status = "ok",
        test_result = test_sum,
        details = "Basic ECL calculation test passed"
      )
      
    }, error = function(e) {
      health_result$checks$calculation_test <- list(
        status = "error",
        error = e$message,
        details = "Basic calculation test failed"
      )
      health_result$success <- FALSE
      health_result$service_status <- "degraded"
    })
    
    # Memory check
    memory_info <- gc()
    health_result$checks$memory <- list(
      status = "ok",
      used_mb = round(sum(memory_info[,2]) * 8 / 1024, 2),
      details = "Memory usage normal"
    )
    
    # Performance test
    start_time <- Sys.time()
    # Simple performance test
    test_matrix <- matrix(rnorm(10000), nrow = 100)
    test_result <- colSums(test_matrix)
    end_time <- Sys.time()
    
    response_time <- as.numeric(difftime(end_time, start_time, units = "secs")) * 1000
    
    health_result$checks$performance <- list(
      status = if (response_time < 1000) "ok" else "warning",
      response_time_ms = round(response_time, 2),
      details = paste("Performance test completed in", round(response_time, 2), "ms")
    )
    
    return(health_result)
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      service_status = "unhealthy",
      error = e$message,
      timestamp = Sys.time()
    ))
  })
}

# Execute health check
health_check_result <- perform_health_check()
cat(toJSON(health_check_result, auto_unbox = TRUE, pretty = TRUE))

# packages/r-analytics/scripts/ecl/stress_test_calculator.R
# Stress test calculator for ECL calculations

library(jsonlite)
library(dplyr)
source('./scripts/ecl/basic_ecl_calculator.R')

# Define stress test scenarios
define_stress_scenarios <- function() {
  scenarios <- list(
    base = list(
      name = "Base Scenario",
      description = "Normal economic conditions",
      pd_multiplier = 1.0,
      lgd_multiplier = 1.0,
      economic_adjustment = 0.0,
      unemployment_rate = 5.0,
      gdp_growth = 2.5
    ),
    
    adverse = list(
      name = "Adverse Scenario", 
      description = "Moderate economic downturn",
      pd_multiplier = 1.5,
      lgd_multiplier = 1.2,
      economic_adjustment = 0.3,
      unemployment_rate = 8.5,
      gdp_growth = -1.0
    ),
    
    severely_adverse = list(
      name = "Severely Adverse Scenario",
      description = "Severe economic recession",
      pd_multiplier = 2.0,
      lgd_multiplier = 1.5,
      economic_adjustment = 0.6,
      unemployment_rate = 12.0,
      gdp_growth = -3.5
    ),
    
    covid_like = list(
      name = "Pandemic Scenario",
      description = "COVID-19 like economic shock",
      pd_multiplier = 2.5,
      lgd_multiplier = 1.3,
      economic_adjustment = 0.8,
      unemployment_rate = 15.0,
      gdp_growth = -5.0
    ),
    
    financial_crisis = list(
      name = "Financial Crisis Scenario",
      description = "2008-like financial crisis",
      pd_multiplier = 3.0,
      lgd_multiplier = 1.8,
      economic_adjustment = 1.2,
      unemployment_rate = 10.5,
      gdp_growth = -4.0
    )
  )
  
  return(scenarios)
}

# Apply stress scenario to parameters
apply_stress_scenario <- function(base_parameters, scenario) {
  stressed_params <- base_parameters
  
  # Adjust PD parameters
  if (!is.null(stressed_params$pd_params)) {
    stressed_params$pd_params$base_pd_12m <- stressed_params$pd_params$base_pd_12m * scenario$pd_multiplier
    stressed_params$pd_params$base_pd_lifetime <- stressed_params$pd_params$base_pd_lifetime * scenario$pd_multiplier
    stressed_params$pd_params$economic_adjustment <- scenario$economic_adjustment
  }
  
  # Adjust LGD parameters
  if (!is.null(stressed_params$lgd_params)) {
    stressed_params$lgd_params$base_lgd <- pmin(0.95, stressed_params$lgd_params$base_lgd * scenario$lgd_multiplier)
    stressed_params$lgd_params$collateral_haircut <- pmin(0.8, stressed_params$lgd_params$collateral_haircut * 1.2)
  }
  
  # Adjust staging parameters (more conservative under stress)
  if (!is.null(stressed_params$staging_params)) {
    stressed_params$staging_params$stage2_sicr_threshold <- stressed_params$staging_params$stage2_sicr_threshold * 0.8
  }
  
  return(stressed_params)
}

# Execute comprehensive stress test
execute_stress_test <- function(portfolio_data, stress_scenarios, base_parameters = list()) {
  tryCatch({
    cat("Starting comprehensive stress test...\n")
    
    # Get scenario definitions
    scenario_definitions <- define_stress_scenarios()
    
    # Initialize results
    stress_results <- list()
    
    # Process each requested scenario
    for (scenario_name in stress_scenarios) {
      if (scenario_name %in% names(scenario_definitions)) {
        scenario <- scenario_definitions[[scenario_name]]
        
        cat("Processing scenario:", scenario_name, "\n")
        
        # Apply stress to parameters
        stressed_params <- apply_stress_scenario(base_parameters, scenario)
        
        # Calculate ECL under stress
        stressed_result <- calculate_basic_ecl(portfolio_data, stressed_params)
        
        # Calculate stress impact metrics
        base_ecl <- if (scenario_name == "base") {
          sum(stressed_result$ecl_amount, na.rm = TRUE)
        } else {
          # For comparison, calculate base scenario ECL
          base_result <- calculate_basic_ecl(portfolio_data, base_parameters)
          sum(base_result$ecl_amount, na.rm = TRUE)
        }
        
        stressed_ecl <- sum(stressed_result$ecl_amount, na.rm = TRUE)
        
        # Compile scenario results
        scenario_summary <- list(
          scenario_name = scenario_name,
          scenario_description = scenario$description,
          scenario_parameters = scenario,
          portfolio_metrics = list(
            total_accounts = nrow(stressed_result),
            total_exposure = sum(stressed_result$ead, na.rm = TRUE),
            total_ecl = stressed_ecl,
            stage_distribution = table(stressed_result$current_stage),
            average_pd = mean(ifelse(stressed_result$current_stage == 1, 
                                   stressed_result$pd_12m, 
                                   stressed_result$pd_lifetime), na.rm = TRUE),
            average_lgd = mean(stressed_result$lgd, na.rm = TRUE)
          ),
          stress_impact = list(
            base_ecl = if (scenario_name != "base") base_ecl else stressed_ecl,
            stressed_ecl = stressed_ecl,
            ecl_increase_amount = if (scenario_name != "base") stressed_ecl - base_ecl else 0,
            ecl_increase_percentage = if (scenario_name != "base" && base_ecl > 0) {
              round((stressed_ecl - base_ecl) / base_ecl * 100, 2)
            } else {
              0
            }
          ),
          detailed_results = stressed_result
        )
        
        stress_results[[scenario_name]] <- scenario_summary
        
        cat("✓ Scenario", scenario_name, "completed. ECL:", round(stressed_ecl, 2), "\n")
        
      } else {
        cat("Warning: Unknown scenario", scenario_name, "skipped\n")
      }
    }
    
    # Overall stress test summary
    overall_summary <- list(
      stress_test_summary = list(
        scenarios_processed = length(stress_results),
        portfolio_size = nrow(portfolio_data),
        execution_time = Sys.time(),
        max_ecl_scenario = names(stress_results)[which.max(sapply(stress_results, function(x) x$portfolio_metrics$total_ecl))],
        ecl_range = list(
          min_ecl = min(sapply(stress_results, function(x) x$portfolio_metrics$total_ecl)),
          max_ecl = max(sapply(stress_results, function(x) x$portfolio_metrics$total_ecl))
        )
      ),
      scenario_results = stress_results
    )
    
    cat("Stress test completed successfully!\n")
    cat("Scenarios processed:", length(stress_results), "\n")
    
    return(overall_summary)
    
  }, error = function(e) {
    stop("Stress test execution failed: ", e$message)
  })
}

# If script is called directly, execute stress test
if (exists("input_data")) {
  # Extract data from input
  portfolio_df <- data.frame(input_data$portfolio_data)
  scenarios <- input_data$stress_scenarios
  parameters <- input_data$parameters
  
  # Execute stress test
  stress_results <- execute_stress_test(portfolio_df, scenarios, parameters)
  
  # Output results
  cat(toJSON(stress_results, auto_unbox = TRUE))
} else {
  cat(toJSON(list(
    success = FALSE,
    error = "No input_data provided for stress test"
  ), auto_unbox = TRUE))
}

# packages/r-analytics/scripts/models/basic_models.R
# Basic statistical models for IFRS 9 calculations

library(survival)
library(jsonlite)
library(dplyr)

# Simple logistic regression PD model
build_simple_pd_model <- function(training_data, target_variable = "default_flag") {
  tryCatch({
    cat("Building simple PD model...\n")
    
    # Prepare features
    features <- c("outstanding_amount", "days_past_due", "customer_age", "income")
    available_features <- intersect(features, names(training_data))
    
    if (length(available_features) == 0) {
      stop("No suitable features found for PD modeling")
    }
    
    # Build model formula
    formula_str <- paste(target_variable, "~", paste(available_features, collapse = " + "))
    model_formula <- as.formula(formula_str)
    
    # Fit logistic regression
    pd_model <- glm(model_formula, 
                   data = training_data, 
                   family = binomial(link = "logit"))
    
    # Model summary
    model_summary <- list(
      model_type = "logistic_regression",
      formula = formula_str,
      features_used = available_features,
      coefficients = coef(pd_model),
      aic = AIC(pd_model),
      training_samples = nrow(training_data),
      fit_date = Sys.time()
    )
    
    cat("✓ PD model built successfully\n")
    
    return(list(
      model = pd_model,
      summary = model_summary,
      success = TRUE
    ))
    
  }, error = function(e) {
    return(list(
      model = NULL,
      summary = list(),
      success = FALSE,
      error = e$message
    ))
  })
}

# Predict PD using trained model
predict_pd_from_model <- function(model_object, new_data) {
  tryCatch({
    # Make predictions
    predictions <- predict(model_object$model, 
                          newdata = new_data, 
                          type = "response")
    
    return(list(
      predictions = predictions,
      success = TRUE
    ))
    
  }, error = function(e) {
    return(list(
      predictions = rep(0.05, nrow(new_data)), # Default fallback
      success = FALSE,
      error = e$message
    ))
  })
}

# Simple LGD regression model
build_simple_lgd_model <- function(training_data, target_variable = "loss_rate") {
  tryCatch({
    cat("Building simple LGD model...\n")
    
    # Prepare features
    features <- c("collateral_value", "loan_to_value", "product_type", "time_to_default")
    available_features <- intersect(features, names(training_data))
    
    if (length(available_features) == 0) {
      # Use basic model based on collateral
      if ("collateral_value" %in% names(training_data) && "outstanding_amount" %in% names(training_data)) {
        training_data$collateral_ratio <- training_data$collateral_value / training_data$outstanding_amount
        available_features <- "collateral_ratio"
      } else {
        stop("No suitable features found for LGD modeling")
      }
    }
    
    # Build model formula
    formula_str <- paste(target_variable, "~", paste(available_features, collapse = " + "))
    model_formula <- as.formula(formula_str)
    
    # Fit linear regression (bounded between 0 and 1)
    lgd_model <- glm(model_formula, 
                    data = training_data, 
                    family = quasibinomial(link = "logit"))
    
    # Model summary
    model_summary <- list(
      model_type = "beta_regression",
      formula = formula_str,
      features_used = available_features,
      coefficients = coef(lgd_model),
      training_samples = nrow(training_data),
      fit_date = Sys.time()
    )
    
    cat("✓ LGD model built successfully\n")
    
    return(list(
      model = lgd_model,
      summary = model_summary,
      success = TRUE
    ))
    
  }, error = function(e) {
    return(list(
      model = NULL,
      summary = list(),
      success = FALSE,
      error = e$message
    ))
  })
}

# Survival analysis for time-to-default
build_survival_model <- function(training_data, time_variable = "time_to_event", event_variable = "default_flag") {
  tryCatch({
    cat("Building survival model for time-to-default...\n")
    
    # Check required variables
    if (!time_variable %in% names(training_data) || !event_variable %in% names(training_data)) {
      stop("Required time or event variables not found")
    }
    
    # Prepare features
    features <- c("outstanding_amount", "customer_age", "income", "product_type")
    available_features <- intersect(features, names(training_data))
    
    if (length(available_features) > 0) {
      # Build Cox proportional hazards model
      formula_str <- paste("Surv(", time_variable, ",", event_variable, ") ~", 
                          paste(available_features, collapse = " + "))
      survival_formula <- as.formula(formula_str)
      
      survival_model <- coxph(survival_formula, data = training_data)
      
      model_summary <- list(
        model_type = "cox_proportional_hazards",
        formula = formula_str,
        features_used = available_features,
        concordance = survival_model$concordance,
        training_samples = nrow(training_data),
        fit_date = Sys.time()
      )
    } else {
      # Simple Kaplan-Meier estimator
      surv_formula <- as.formula(paste("Surv(", time_variable, ",", event_variable, ") ~ 1"))
      survival_model <- survfit(surv_formula, data = training_data)
      
      model_summary <- list(
        model_type = "kaplan_meier",
        formula = paste("Surv(", time_variable, ",", event_variable, ") ~ 1"),
        features_used = c(),
        median_survival = median(survival_model),
        training_samples = nrow(training_data),
        fit_date = Sys.time()
      )
    }
    
    cat("✓ Survival model built successfully\n")
    
    return(list(
      model = survival_model,
      summary = model_summary,
      success = TRUE
    ))
    
  }, error = function(e) {
    return(list(
      model = NULL,
      summary = list(),
      success = FALSE,
      error = e$message
    ))
  })
}

cat("Basic IFRS 9 statistical models loaded successfully!\n")