# packages/r-analytics/scripts/ifrs9/ifrs9_basic_calculations.R
# ============================================================================
# BASIC IFRS 9 CALCULATIONS (Essential Packages Only)
# ============================================================================
# Uses only: jsonlite, dplyr, lubridate, MASS (already working)

library(jsonlite)
library(dplyr)
library(lubridate)

cat("✅ Essential R packages loaded for IFRS 9\n")
cat("📦 Loaded: jsonlite, dplyr, lubridate\n")

#' Calculate Basic PD (Probability of Default)
calculate_basic_pd <- function(portfolio_data) {
  portfolio_data %>%
    mutate(
      # Base PD by product type
      base_pd = case_when(
        product_type == "Personal Loan" ~ 0.03,
        product_type == "Mortgage Loan" ~ 0.01,
        product_type == "Working Capital" ~ 0.025,
        product_type == "Murabaha" ~ 0.02,
        product_type == "Musharaka" ~ 0.035,
        product_type == "Mudharaba" ~ 0.04,
        TRUE ~ 0.025
      ),
      
      # DPD adjustment
      dpd_factor = case_when(
        days_past_due == 0 ~ 1.0,
        days_past_due <= 30 ~ 1.5,
        days_past_due <= 60 ~ 2.5,
        days_past_due <= 90 ~ 4.0,
        TRUE ~ 6.0
      ),
      
      # Islamic banking adjustment
      syariah_factor = ifelse(is_syariah_compliant, 0.85, 1.0),
      
      # Final PD calculation
      pd_12m = pmin(base_pd * dpd_factor * syariah_factor, 1.0),
      pd_lifetime = pmin(1 - (1 - pd_12m)^2, 1.0)  # Simple 2-year approximation
    )
}

#' Calculate Basic LGD (Loss Given Default)
calculate_basic_lgd <- function(portfolio_data) {
  portfolio_data %>%
    mutate(
      # Base LGD by product type
      base_lgd = case_when(
        product_type == "Personal Loan" ~ 0.55,
        product_type == "Mortgage Loan" ~ 0.25,
        product_type == "Working Capital" ~ 0.45,
        product_type == "Murabaha" ~ 0.30,
        product_type == "Musharaka" ~ 0.40,
        product_type == "Mudharaba" ~ 0.50,
        TRUE ~ 0.45
      ),
      
      # Collateral adjustment
      collateral_factor = ifelse(!is.na(collateral_value) & collateral_value > 0,
                                0.6, 1.0),  # 40% reduction if collateral exists
      
      # Final LGD
      lgd = pmin(pmax(base_lgd * collateral_factor, 0.05), 0.95)
    )
}

#' Calculate Basic EAD (Exposure at Default)
calculate_basic_ead <- function(portfolio_data) {
  portfolio_data %>%
    mutate(
      # Credit conversion factor by product
      ccf = case_when(
        product_type %in% c("Personal Loan", "Mortgage Loan", "Murabaha") ~ 1.0,
        product_type %in% c("Working Capital", "Musharaka") ~ 0.75,
        product_type == "Mudharaba" ~ 0.5,
        TRUE ~ 0.75
      ),
      
      # Calculate EAD
      undrawn = pmax(ifelse(is.na(committed_amount), 0, committed_amount) - outstanding_amount, 0),
      ead = outstanding_amount + (undrawn * ccf)
    )
}

#' Main IFRS 9 ECL Calculation
calculate_basic_ifrs9_ecl <- function(portfolio_data) {
  cat("🔄 Starting Basic IFRS 9 ECL Calculation\n")
  cat("📊 Portfolio size:", nrow(portfolio_data), "accounts\n")
  
  # Step 1: Determine stages
  portfolio_data <- portfolio_data %>%
    mutate(
      ifrs9_stage = case_when(
        days_past_due >= 90 ~ 3L,
        days_past_due >= 30 ~ 2L,
        TRUE ~ 1L
      )
    )
  
  # Step 2: Calculate risk parameters
  portfolio_data <- portfolio_data %>%
    calculate_basic_pd() %>%
    calculate_basic_lgd() %>%
    calculate_basic_ead()
  
  # Step 3: Calculate ECL
  portfolio_data <- portfolio_data %>%
    mutate(
      ecl_12m = pd_12m * lgd * ead,
      ecl_lifetime = pd_lifetime * lgd * ead,
      final_ecl = case_when(
        ifrs9_stage == 1 ~ ecl_12m,
        ifrs9_stage == 2 ~ ecl_lifetime,
        ifrs9_stage == 3 ~ ead * lgd,  # Default: full exposure * LGD
        TRUE ~ ecl_12m
      )
    )
  
  # Calculate summary
  summary_stats <- portfolio_data %>%
    summarise(
      total_accounts = n(),
      stage1_count = sum(ifrs9_stage == 1),
      stage2_count = sum(ifrs9_stage == 2),
      stage3_count = sum(ifrs9_stage == 3),
      total_outstanding = sum(outstanding_amount, na.rm = TRUE),
      total_ecl = sum(final_ecl, na.rm = TRUE),
      coverage_ratio = total_ecl / total_outstanding * 100
    )
  
  cat("✅ ECL Calculation completed\n")
  cat("📈 Total ECL:", round(summary_stats$total_ecl, 2), "\n")
  cat("📊 Coverage Ratio:", round(summary_stats$coverage_ratio, 2), "%\n")
  
  return(list(
    results = portfolio_data,
    summary = summary_stats,
    status = "success"
  ))
}

cat("✅ Basic IFRS 9 calculation functions ready\n")
