# =============================================================================
# GLOBAL CONFIGURATION - MODULAR IFRS9 ANALYTICS (CLEAN VERSION)
# =============================================================================
# Purpose: Load required libraries and configurations without redundancy
# Author: IFRS9 Analytics Team
# Date: Clean version with eliminated package conflicts
# =============================================================================

# =============================================================================
# LOAD REQUIRED LIBRARIES (Clean loading with conflict resolution)
# =============================================================================

# CRITICAL: Load core shiny packages FIRST with explicit checking
# These must be available before any other code runs
if (!requireNamespace("shiny", quietly = TRUE)) {
  stop("Package 'shiny' is required but not installed. Please run: install.packages('shiny')")
}
if (!requireNamespace("shinydashboard", quietly = TRUE)) {
  stop("Package 'shinydashboard' is required but not installed. Please run: install.packages('shinydashboard')")
}
if (!requireNamespace("DT", quietly = TRUE)) {
  stop("Package 'DT' is required but not installed. Please run: install.packages('DT')")
}
if (!requireNamespace("htmltools", quietly = TRUE)) {
  stop("Package 'htmltools' is required but not installed. Please run: install.packages('htmltools')")
}

# Load core packages with explicit library calls (REQUIRED ORDER)
# 1. htmltools MUST be loaded before shiny
suppressPackageStartupMessages(library(htmltools))

# 2. shiny core
suppressPackageStartupMessages(library(shiny))

# 3. dashboard components
suppressPackageStartupMessages(library(shinydashboard))

# 4. Data tables
suppressPackageStartupMessages(library(DT))

# 5. Analytics packages
suppressPackageStartupMessages(library(forecast))

# Verify essential shiny objects are available
if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
  cat("DEBUG: Checking shiny objects...\n")
  cat("DEBUG: tags exists:", exists("tags"), "\n")
  cat("DEBUG: tags class:", class(tags), "\n")
  cat("DEBUG: tags$head exists:", exists("tags$head") && is.function(tags$head), "\n")
  cat("DEBUG: shiny loaded:", "shiny" %in% loadedNamespaces(), "\n")
  cat("DEBUG: htmltools loaded:", "htmltools" %in% loadedNamespaces(), "\n")
}

if (!exists("tags") || !is.function(tags$head)) {
  cat("ERROR DEBUG: tags object missing or not a function\n")
  cat("ERROR DEBUG: Available objects in global environment:\n")
  for (obj in ls(envir = .GlobalEnv)) {
    if (obj == "tags") {
      cat("DEBUG: tags object found with class:", class(get(obj, envir = .GlobalEnv)), "\n")
    }
  }
  stop("ERROR: Shiny 'tags' object not properly loaded. This is a critical error.")
}

# Load conflicting packages with suppressed warnings and conflict resolution
suppressPackageStartupMessages({
  library(ggplot2)
  library(tidyr)
  library(stringr)
  library(tseries)
  library(data.table)
  library(dplyr)
  library(DBI)
  library(RPostgres)
  library(lubridate)
  library(tibble)
  library(plotly)
  library(lmtest)
  library(car)
  library(MASS)
  library(future)
  library(future.apply)
  library(promises)
  library(survival)
  library(corrplot)
  library(R6)
  library(curl)
})

# Explicit conflict resolution - prevent function masking issues
select <- dplyr::select
filter <- dplyr::filter
lag <- dplyr::lag

# =============================================================================
# UTILITY FUNCTIONS (Load once)
# =============================================================================

# Data processing utilities
source("utils/data_processing.R")

# Statistical modeling utilities
source("utils/statistical_modeling.R")

# Forecasting utilities
source("utils/forecasting.R")

# PD calculation utilities
source("utils/pd_calculations.R")

# Database utilities
source("utils/database_utils.R")

# =============================================================================
# DATABASE CONNECTION (Load centralized database configuration)
# =============================================================================

# Load centralized database configuration (silent loading)
if (file.exists("config/database.R")) {
  suppressPackageStartupMessages({
    source("config/database.R")
  })
} else {
  # Fallback basic database configuration
  cat("⚠️ Database configuration not found, using fallback\n")
  con <- NULL
  PD <- data.frame()
  LGD <- data.frame()
}

# =============================================================================
# LOAD CONFIGURATION (Silent loading)
# =============================================================================

# Load environment configuration
if (file.exists("config/environment-loader-r-analytics.R")) {
  source("config/environment-loader-r-analytics.R", local = TRUE)
} else {
  # Fallback configuration
  rafse_env_loader <- list(
    getConfiguration = function() {
      list(
        environment_name = "development",
        urls = list(r_analytics = "http://localhost:4236")
      )
    }
  )
}

# =============================================================================
# LOAD AUTHENTICATION MODULE (Clean loading)
# =============================================================================

# Load authentication configuration first (silent loading)
if (file.exists("config/auth-config.R")) {
  suppressPackageStartupMessages({
    source("config/auth-config.R")
  })
}

# Load R6-based authentication system for IAF integration (silent loading)
if (file.exists("config/auth.R")) {
  suppressPackageStartupMessages({
    source("config/auth.R")
  })
}

# =============================================================================
# LOAD PD AND LGD DATA (Silent loading)
# =============================================================================

# Load PD configuration data
tryCatch({
  if (file.exists("config/PD.R")) {
    source("config/PD.R")
  }
}, error = function(e) {
  # Silent fallback - PD not critical for basic functionality
})

# Load LGD configuration data
tryCatch({
  if (file.exists("config/LGD.R")) {
    source("config/LGD.R")
  }
}, error = function(e) {
  # Silent fallback - LGD not critical for basic functionality
})

# =============================================================================
# FINAL SETUP (Minimal output)
# =============================================================================

# Only show essential startup message in development mode
if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
  message("🚀 IFRS9 R Analytics Dashboard - Ready")
  message(paste0("🌐 Environment: ", rafse_env_loader$getConfiguration()$environment_name))
}

# Suppress redundant output for production-like environments
