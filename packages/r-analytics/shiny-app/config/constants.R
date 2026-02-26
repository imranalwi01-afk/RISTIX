# =============================================================================
# CONSTANTS CONFIGURATION MODULE
# =============================================================================
# Extracted from: app.R (lines 83-95)
# Purpose: Application constants and mapping definitions
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Application Constants
#' @description Constants used throughout the IFRS9 Analytics application

# =============================================================================
# PD TABLES MAPPING
# =============================================================================

# PD tables mapping for dynamic UI generation
pd_tables_map <- c(
  "odr_yearly" = "ODR Yearly",
  "odr_monthly" = "ODR Monthly",
  "provision_yearly" = "Provision Yearly",
  "provision_monthly" = "Provision Monthly"
)

# PD final mapping
pd_final_map <- c(
  "final_yearly" = "Final PD Yearly",
  "final_monthly" = "Final PD Monthly"
)

# Export to global environment for UI modules
pd_tables_map <- pd_tables_map
pd_final_map <- pd_final_map

# Ensure global availability
assign("pd_tables_map", pd_tables_map, envir = .GlobalEnv)
assign("pd_final_map", pd_final_map, envir = .GlobalEnv)

# =============================================================================
# APPLICATION CONSTANTS
# =============================================================================

# Application metadata
APP_TITLE <- "IFRS 9 Analytics - Modular"
APP_VERSION <- "2.0.0"
APP_DESCRIPTION <- "Modular Shiny application for IFRS9 statistical modeling and PD calculations"

# UI Constants
SIDEBAR_WIDTH <- 250
MAIN_CONTENT_WIDTH <- 12

# Table display options
DEFAULT_PAGE_LENGTH <- 25
MAX_PAGE_LENGTH <- 100

# File upload limits
MAX_FILE_SIZE_MB <- 50
ALLOWED_FILE_TYPES <- c(".csv", ".xlsx", ".xls")

# Chart colors
CHART_COLORS <- list(
  primary = "#1f77b4",
  secondary = "#ff7f0e",
  success = "#2ca02c",
  warning = "#ff7f0e",
  danger = "#d62728"
)

# Date formats
DATE_FORMAT_DISPLAY <- "%Y-%m-%d"
DATE_FORMAT_FILE <- "%Y%m%d"
DATETIME_FORMAT <- "%Y-%m-%d %H:%M:%S"

# =============================================================================
# CALCULATION CONSTANTS
# =============================================================================

# PD Engine Constants
PD_SCENARIOS <- c("Base", "Best", "Worst")
PD_TRANSFORMATION_TYPES <- c("logit", "log", "identity")

# =============================================================================
# INTUITION SIGN CHECKING CONFIGURATION
# =============================================================================
# Original reference: app15.R lines 1120-1125
# Purpose: Configure variables that bypass intuition checking and their expected signs

#' Free-pass variables (bypass intuition checking)
#' These macroeconomic variables are automatically marked as "pass" without sign checking
#' Original: ref[[var_col]][ref[[expect_col]] == 0]
BEBAS_PASS_VARIABLES <- c(
  "USDIDR",    # USD to IDR exchange rate
  "IHSG",      # Jakarta Composite Index
  "INFLASI",   # Inflation rate
  "SBI",       # Bank Indonesia Certificates
  "GDP",       # Gross Domestic Product
  "BIRATE"     # Bank Indonesia Rate
)

#' Intuition reference mapping
#' Maps variable prefixes to expected correlation signs
#' Structure: list(variable = expected_sign)
#' Expected signs: 1 (positive correlation), -1 (negative correlation), 0 (free-pass)
INTUITION_MAPPING <- list(
  # Free-pass variables (0 = bypass checking)
  "USDIDR" = 0,
  "IHSG" = 0,
  "INFLASI" = 0,
  "SBI" = 0,
  "GDP" = 0,
  "BIRATE" = 0,

  # Expected positive correlations (1)
  "UNEMPLOYMENT" = 1,
  "LENDING" = 1,
  "CREDIT" = 1,

  # Expected negative correlations (-1)
  "INCOME" = -1,
  "GROWTH" = -1,
  "LIQUIDITY" = -1
)

#' Get expected sign for a variable
#' @param variable_name Variable name (prefix will be extracted)
#' @return Expected sign (1, -1, or 0 for free-pass)
#' @note Used by check_intuition_sign() in statistical_modeling.R
get_expected_sign <- function(variable_name) {
  # Extract prefix
  prefix <- sapply(strsplit(variable_name, "_"), `[`, 1)

  # Lookup in mapping, return 0 if not found
  sign <- INTUITION_MAPPING[[prefix]]
  if (is.null(sign)) {
    return(0)  # Default to free-pass if not in mapping
  }

  return(sign)
}

# Staging constants
STAGE_1 <- 1
STAGE_2 <- 2
STAGE_3 <- 3

# Model validation thresholds
MIN_R_SQUARED <- 0.5
MIN_OBSERVATIONS <- 50
MAX_VIF <- 10

# =============================================================================
# DATABASE TABLE NAMES
# =============================================================================

# FRS9 Parameter Tables
FRS9_PARAM_PD_MODEL_H <- "frs9_param_pd_model_h"
FRS9_PARAM_LGD_MODEL_H <- "frs9_param_lgd_model_h"
FRS9_PARAM_PRODUCT <- "frs9_param_product"
FRS9_PARAM_JOURNAL <- "frs9_param_journal"

# Output Tables
FRS9_R_PD_OUTPUT_YEARLY <- "frs9_r_pd_output_yearly"
FRS9_R_PD_OUTPUT_MONTHLY <- "frs9_r_pd_output_monthly"
FRS9_R_MODEL_SUMMARY <- "frs9_r_model_summary"

# =============================================================================
# P2-TASK#13: DATABASE-DRIVEN INTUITION REFERENCE MAPPING
# =============================================================================
# Purpose: Load intuition reference mappings from database instead of hardcoded
# Reference: IMPLEMENTATION_GUIDE_P1_P2.md lines 644-704
# Original: app15.R hardcoded intuition logic

#' Load intuition reference mapping from database
#' @param con Database connection object
#' @return Data frame with columns: variable_pattern, expected_sign, category, description
#' @details Loads economic intuition mappings for PD modeling from intuition_reference table.
#'          Falls back to hardcoded defaults if database is unavailable.
#' @note This function is called during application startup or when refreshing references
load_intuition_reference <- function(con) {
  cat("\n🔍 Loading intuition reference mappings from database...\n")

  tryCatch({
    # Query database for active intuition references
    ref <- dbGetQuery(con, "
      SELECT
        variable_pattern,
        expected_sign,
        category,
        description,
        active
      FROM intuition_reference
      WHERE active = TRUE
      ORDER BY category, variable_pattern
    ")

    if (nrow(ref) > 0) {
      cat("✅ Loaded", nrow(ref), "intuition reference mappings from database\n")

      # Display summary by category
      cat("\n📊 Loaded mappings by category:\n")
      category_summary <- table(ref$category)
      for (cat_name in names(category_summary)) {
        cat("  -", cat_name, ":", category_summary[[cat_name]], "variables\n")
      }

      cat("\n")
      return(ref)
    } else {
      cat("⚠️ No intuition references found in database, using fallback defaults\n")
      return(get_fallback_intuition_reference())
    }

  }, error = function(e) {
    cat("⚠️ Could not load intuition reference from database:", e$message, "\n")
    cat("   Using fallback defaults instead\n\n")

    # Fallback to hardcoded defaults
    return(get_fallback_intuition_reference())
  })
}

#' Get fallback intuition reference mappings (hardcoded defaults)
#' @return Data frame with default intuition mappings
#' @details Used when database is unavailable or contains no data
#' @note These defaults match the most common economic intuitions for IFRS9 modeling
get_fallback_intuition_reference <- function() {
  cat("📋 Using fallback intuition reference (hardcoded defaults)\n")

  fallback_ref <- data.frame(
    variable_pattern = c(
      # Risk indicators (positive correlation)
      "NPL", "NPA", "WRITEOFF",

      # Capital indicators (negative correlation)
      "CAR", "TIER1",

      # Economic indicators
      "GDP", "INFLASI", "INFLATION", "UNEMPLOYMENT", "CPI",

      # Market indicators (negative correlation)
      "IHSG", "JCI", "JKSE",

      # Interest rate indicators (positive correlation)
      "SBI", "BIRATE", "SBIS", "INTERESTRATE",

      # Currency indicators (positive correlation)
      "USDIDR", "EURIDR", "JPYIDR"
    ),
    expected_sign = c(
      # Risk: positive
      1, 1, 1,

      # Capital: negative
      -1, -1,

      # Economic: mixed
      -1, 1, 1, 1, 1,

      # Market: negative
      -1, -1, -1,

      # Interest: positive
      1, 1, 1, 1,

      # Currency: positive
      1, 1, 1
    ),
    category = c(
      # Risk
      "risk", "risk", "risk",

      # Capital
      "capital", "capital",

      # Economic
      "economic", "economic", "economic", "economic", "economic",

      # Market
      "market", "market", "market",

      # Interest
      "interest", "interest", "interest", "interest",

      # Currency
      "currency", "currency", "currency"
    ),
    description = c(
      # Risk
      "NPL ratio - higher NPL indicates higher default risk",
      "NPA ratio - higher NPA indicates higher default risk",
      "Write-off ratio - higher write-offs indicate higher default risk",

      # Capital
      "CAR - higher capital provides buffer against defaults",
      "Tier 1 Capital - higher tier 1 capital reduces default risk",

      # Economic
      "GDP growth - economic expansion reduces default probability",
      "Inflation rate - higher inflation increases default risk",
      "Inflation rate - higher inflation increases default risk",
      "Unemployment rate - job losses increase default risk",
      "Consumer Price Index - rising prices increase default risk",

      # Market
      "IHSG - positive market sentiment reduces defaults",
      "JCI - positive market sentiment reduces defaults",
      "JKSE - positive market sentiment reduces defaults",

      # Interest
      "SBI rate - higher rates increase borrowing costs",
      "BI Rate - higher rates increase default risk",
      "Sharia BI Certificate - higher rates increase default risk",
      "Interest rate - higher rates increase default risk",

      # Currency
      "USD/IDR - currency depreciation increases defaults",
      "EUR/IDR - currency depreciation increases defaults",
      "JPY/IDR - currency depreciation increases defaults"
    ),
    stringsAsFactors = FALSE
  )

  cat("  - Loaded", nrow(fallback_ref), "default mappings\n\n")

  return(fallback_ref)
}

#' Check if intuition reference needs refresh
#' @param last_load_time POSIXct timestamp of last load
#' @param refresh_interval_minutes How often to refresh (default: 60 minutes)
#' @return Logical TRUE if refresh is needed
should_refresh_intuition_reference <- function(last_load_time = NULL, refresh_interval_minutes = 60) {
  if (is.null(last_load_time)) {
    return(TRUE)
  }

  time_diff <- difftime(Sys.time(), last_load_time, units = "mins")
  return(as.numeric(time_diff) > refresh_interval_minutes)
}

#' Cached intuition reference loader
#' @param con Database connection
#' @param force_refresh Force reload from database (default: FALSE)
#' @return Data frame with intuition mappings
#' @details Caches the intuition reference and only reloads if cache is stale
#' @note Use force_refresh = TRUE after updating database mappings
load_intuition_reference_cached <- function(con, force_refresh = FALSE) {
  # Global variables to store cache
  if (!exists(".intuition_ref_cache", envir = .GlobalEnv)) {
    assign(".intuition_ref_cache", NULL, envir = .GlobalEnv)
    assign(".intuition_ref_cache_time", NULL, envir = .GlobalEnv)
  }

  # Check if refresh is needed
  cache_time <- get(".intuition_ref_cache_time", envir = .GlobalEnv)

  if (force_refresh || should_refresh_intuition_reference(cache_time)) {
    cat("🔄 Refreshing intuition reference cache...\n")

    # Load from database
    ref <- load_intuition_reference(con)

    # Update cache
    assign(".intuition_ref_cache", ref, envir = .GlobalEnv)
    assign(".intuition_ref_cache_time", Sys.time(), envir = .GlobalEnv)

    return(ref)
  } else {
    cat("✅ Using cached intuition reference (loaded at",
        format(cache_time, "%Y-%m-%d %H:%M:%S"), ")\n")
    return(get(".intuition_ref_cache", envir = .GlobalEnv))
  }
}

# =============================================================================
# END OF CONSTANTS CONFIGURATION MODULE
# =============================================================================