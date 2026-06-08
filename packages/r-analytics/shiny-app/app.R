# =============================================================================
# 🚀 WORKING MODULAR IFRS9 ANALYTICS APPLICATION
# =============================================================================
# ✅ FIXED: Proper modular structure with working button functionality
# ✅ KEPT: TOP HEADER NAVIGATION with IAF branding
# ✅ FIXED: All UI modules properly imported and working
# =============================================================================

# Guard against non-semver values (e.g. "latest") that break compareVersion() in Shiny startup.
shiny_server_version <- Sys.getenv("SHINY_SERVER_VERSION", "")
if (nzchar(shiny_server_version) && !grepl("^[0-9]+(\\.[0-9]+)*$", shiny_server_version)) {
  Sys.unsetenv("SHINY_SERVER_VERSION")
}

# Note: global.R is automatically loaded by Shiny
# Do NOT manually load it here to avoid duplicate execution
# Database connection and configuration data are loaded from global.R
# This sets up: con, PD, LGD (directly at top level, same as app37.R)

# Load additional libraries (only ones not already loaded in global.R)
suppressPackageStartupMessages({
  library(openxlsx)
  library(combinat)
  library(nortest)
  library(shinyWidgets)
  library(shinycssloaders)
})

# Note: Core packages (shiny, shinydashboard, DT, data.table, dplyr, etc.)
# are already loaded in global.R with conflict resolution

# Global PD tables mapping for PD-AFL UI (accessible across modules)
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

# Global PD final mapping for PD-AFL UI
pd_final_map <- c(
  "monthly_mpd_afl_final" = "Monthly Marginal PD After Forward Looking FINAL",
  "monthly_cpd_afl_final" = "Monthly Cummulative PD After Forward Looking FINAL",
  "yearly_mpd_afl_final" = "Yearly Marginal PD After Forward Looking Final",
  "yearly_cpd_afl_final" = "Yearly Cummulative PD After Forward Looking Final"
)

# Load debug configuration first
source("config/debug-config.R")

# Initialize debug mode before loading other modules
initialize_debug_config()

# Load logging system (required by server modules)
source("config/logging.R")

# Ensure UserAuthModule is available - load explicitly if needed
if (!exists("UserAuthModule")) {
  if (file.exists("config/auth.R")) {
    cat("Loading UserAuthModule from config/auth.R\n")
    source("config/auth.R")
  } else {
    stop("ERROR: config/auth.R not found - UserAuthModule required")
  }
}

# Final verification
if (!exists("UserAuthModule")) {
  stop("ERROR: UserAuthModule still not found - cannot proceed without authentication system")
}

# Utility functions already loaded from global.R (lines 99-111):
# data_processing.R, statistical_modeling.R, forecasting.R, pd_calculations.R, database_utils.R
# No need to reload them here to avoid duplicate execution

# Load all UI modules once
source("modules/ui/home_ui.R")
source("modules/ui/data_ui.R")
source("modules/ui/model_ui.R")
source("modules/ui/forecast_ui.R")
source("modules/ui/forecast_manual_ui.R")
source("modules/ui/pdafl_ui.R")

# Load all server modules once
source("modules/server/data_server.R")
source("modules/server/model_server.R")
source("modules/server/forecast_server.R")
source("modules/server/forecast_manual_server.R")
source("modules/server/pdafl_server.R")

# =============================================================================
# 🎨 CUSTOM STYLING (from original app)
# =============================================================================

# Silent package loading - no redundant checks or messages
# Essential functions should be available from global.R loading
if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
  if (!exists("tags") || !is.function(tags$head) || !exists("reactiveVal") || !is.function(reactiveVal)) {
    cat("DEBUG: Re-loading essential shiny packages\n")
    suppressPackageStartupMessages({
      library(shiny, warn.conflicts=FALSE)
      library(shinydashboard, warn.conflicts=FALSE)
      library(htmltools, warn.conflicts=FALSE)
      library(DT, warn.conflicts=FALSE)
      library(plotly, warn.conflicts=FALSE)
      library(ggplot2, warn.conflicts=FALSE)
      library(dplyr, warn.conflicts=FALSE)
      library(future, warn.conflicts=FALSE)
      library(future.apply, warn.conflicts=FALSE)
      library(promises, warn.conflicts=FALSE)
    })
  }
}

# Ensure all required packages are loaded before UI definition
required_packages <- c("shiny", "shinydashboard", "DT", "plotly",
                        "shinyWidgets", "shinycssloaders",
                        "future", "future.apply")
missing_packages <- required_packages[!sapply(required_packages, function(pkg) {
  exists(pkg) && is.function(get(pkg))
})]

if (length(missing_packages) > 0) {
  suppressPackageStartupMessages({
    for (pkg in missing_packages) {
      library(pkg, character.only = TRUE)
    }
  })
}

# Custom styling will be defined after loading all dependencies
# This prevents using shiny objects before they're loaded

# =============================================================================
# ✅ RISTIX.PRO CUSTOM HEADER CSS (from app37.R)
# =============================================================================

customHeader <- tags$head(
  tags$style(HTML("
    /* ===== HEADER & NAVBAR ===== */
    .skin-blue .main-header .logo {
      background-color: #1976D2 !important;
      color: #ffffff !important;
      border: none !important;
      height: 50px !important;
      line-height: 50px !important;
    }
    .skin-blue .main-header .logo:hover {
      background-color: #1565C0 !important;
    }
    .skin-blue .main-header .navbar {
      background-color: #1976D2 !important;
      border: none !important;
      margin-bottom: 0 !important;
      min-height: 50px !important;
      box-shadow: none !important;
    }
    .skin-blue .main-header {
      max-height: 50px !important;
      box-shadow: none !important;
      padding-bottom: 0 !important;
    }
    .skin-blue .main-header .navbar .sidebar-toggle {
      color: #ffffff !important;
    }
    .skin-blue .main-header .navbar .sidebar-toggle:hover {
      background-color: #1565C0 !important;
    }
    .skin-blue .main-header .navbar .nav > li > a {
      color: #ffffff !important;
    }
    .skin-blue .main-header .navbar .nav > li > a:hover,
    .skin-blue .main-header .navbar .nav > li > a:active,
    .skin-blue .main-header .navbar .nav > li > a:focus {
      background-color: #1565C0 !important;
      color: #ffffff !important;
    }
    .navbar-nav > li.active > a {
      background-color: #1565C0 !important;
      color: #ffffff !important;
      font-weight: bold;
      box-shadow: inset 0 -3px 0 #FFD54F !important;
      border-bottom: none !important;
    }
    .box.box-primary { border-top-color: #1976D2; }
    .btn-success { background-color: #28a745; border-color: #28a745; }
    .content-wrapper { margin-top: 0px !important; padding-top: 10px !important; }
    .box { border-radius: 6px; border-top: 0 !important; border: 1px solid #1976D2 !important; }
    .box-header { background-color: #1976D2 !important; color: #ffffff !important; font-weight: bold; border-bottom: 1px solid #1976D2 !important; }
    .box-header .box-title { color: #ffffff !important; font-size: 16px; }
    .box.box-primary { border-top-color: #1976D2 !important; }
    .box.box-primary > .box-header { background-color: #1976D2 !important; color: #ffffff !important; }
    .box-body { background-color: #ffffff; }
    .box-footer { border-top: 1px solid #1976D2 !important; }
    html, body { background-color: #ffffff !important; height: 100%; }
    .wrapper { background-color: #ffffff !important; min-height: 100vh !important; }
    .content-wrapper, .right-side { background-color: #ffffff !important; min-height: 100vh !important; }
  "))
)

# =============================================================================
# ✅ WORKING UI - RISTIX.PRO DASHBOARD (matching app37.R)
# =============================================================================

ui <- dashboardPage(
  skin = "blue",

  # ===== TOP NAVBAR =====
  dashboardHeader(
    title = span("RISTIX.PRO", style = "font-weight:bold"),
    tags$li(
      class = "dropdown",
      tags$ul(
        class = "nav navbar-nav",
        tags$li(tags$a(href = "#shiny-tab-home", `data-toggle` = "tab", "Dashboard")),
        tags$li(tags$a(href = "#shiny-tab-input", `data-toggle` = "tab", "Data")),
        tags$li(tags$a(href = "#shiny-tab-model", `data-toggle` = "tab", "Model")),
        tags$li(tags$a(href = "#shiny-tab-forecast", `data-toggle` = "tab", "Forecast")),
        tags$li(tags$a(href = "#shiny-tab-forecast_manual", `data-toggle` = "tab", "Forecast Manual")),
        tags$li(tags$a(href = "#shiny-tab-pdafl", `data-toggle` = "tab", "PD & AFL"))
      )
    )
  ),
  dashboardSidebar(disable = TRUE),
  dashboardBody(
    customHeader,
    tabItems(
      home_ui(),
      data_ui(),
      model_ui(),
      forecast_ui(),
      forecast_manual_ui(),
      pdafl_ui()
    )
  )
)

# =============================================================================
# ✅ WORKING SERVER - MODULAR STRUCTURE
# =============================================================================

server <- function(input, output, session) {

  # Reactive value to track current active tab for navigation
  current_tab <- reactiveVal("home")

  # Initialize user authentication system
  user_auth <- UserAuthModule$new(session)

  # Silent database connection check - only show in debug mode
  if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
    if (!exists("con") || is.null(con)) {
      cat("⚠️ Database connection not found, using offline mode\n")
    }
  }

  # Ensure database connection and data are available
  if (!exists("con") || is.null(con)) {
    con <- NULL
  }
  if (!exists("PD") || is.null(PD)) {
    PD <- data.frame()
  }
  if (!exists("LGD") || is.null(LGD)) {
    LGD <- data.frame()
  }

  # Note: Breadcrumbs are now implemented directly in UI HTML

  # Gunakan optimal workers untuk avoid CPU overload (2 cores untuk memory efficiency)
  plan(multisession, workers = 2)

  # Tambahkan cleanup saat app dimatikan
  onStop(function() {
    message("Shiny stopped, resetting future plan to sequential")
    plan(sequential)  # agar tidak ganggu Shiny lain
  })

  # Memory optimization: Set garbage collection frequency
  options(gc.interval = 10)  # Garbage collect every 10 seconds
  options(max.print = 1000)  # Limit print output for memory

  # Enhanced reactive values for data persistence
  rv_df <- reactiveVal()  # Menyimpan df untuk digunakan ulang
  rv_independent_data <- reactiveVal()

  # Data persistence storage - prevents data loss when switching tabs
  persistent_data <- reactiveValues(
    # Core data storage
    dependent_data = NULL,
    independent_data = NULL,
    joined_data = NULL,

    # Model results storage
    model_results = NULL,
    forecast_results = NULL,
    intuition_data = NULL,

    # Date range storage for auto-population
    date_range = list(
      min_date = NULL,
      max_date = NULL,
      date_column = NULL
    ),

    # UI state storage
    last_dependent_type = "PD",
    last_segment = 1,
    data_loaded = FALSE,
    model_calculated = FALSE,
    forecast_run = FALSE
  )

  # =============================================================================
  # ✅ WORKING CONTENT RENDERING - STANDARD DASHBOARD PAGE (NO COMPLEX LOGIC)
  # =============================================================================

  # =============================================================================
  # ✅ WORKING SERVER LOGIC - MODULAR SERVER MODULES
  # =============================================================================

  # Data server module - handles all data functionality
  data_results <- data_server(input, output, session, con, PD, LGD, persistent_data)

  # Model server module - handles statistical modeling
  model_results <- model_server(input, output, session,
    dependent_data = data_results$dependent_transformed,
    independent_data = data_results$independent_data,
    joined_data = data_results$joined_data)

  # =============================================================================
  # ✅ DATE UPDATE LOGIC MOVED TO DATA_SERVER MODULE
  # =============================================================================
  # The date update logic has been moved to the data_server module
  # to ensure it runs immediately after datagabung() completes.
  # This fixes the timing issue where the observer was triggered
  # before the data was ready.

  if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
    cat("📝 Date update logic is now in data_server module (after datagabung completion)\n")
  }

  # Forecast server module - handles forecasting operations
  forecast_results <- forecast_server(input, output, session,
    model_results, data_results, con)

  # PD-AFL server module - handles PD & AFL calculations
  pdafl_results <- pdafl_server(input, output, session, con, PD)

  # Forecast manual server module
  forecast_manual_results <- forecast_manual_server(input, output, session, data_results)

  # =============================================================================
  # 🔄 DATA PERSISTENCE & DATE SYNCHRONIZATION
  # =============================================================================

  # Store data results in persistent storage to prevent loss when switching tabs
  observe({
    if (!is.null(data_results$dependent_transformed) && is.data.frame(data_results$dependent_transformed)) {
      data_df <- data_results$dependent_transformed

      # Validate that data frame has actual content (not just structure)
      if (!is.null(data_df) && nrow(data_df) > 0 && ncol(data_df) > 0) {
        persistent_data$dependent_data <- data_df
        persistent_data$data_loaded <- TRUE

        cat("✅ Valid data stored:", nrow(data_df), "rows,", ncol(data_df), "columns\n")

        # Extract date range information for Model tab auto-population
        if (!is.null(data_df) && nrow(data_df) > 0) {
          # Find date columns (common patterns)
          date_cols <- names(data_df)[grepl("(date|tanggal|periode|time)", names(data_df), ignore.case = TRUE)]

        if (length(date_cols) > 0) {
            date_col <- date_cols[1]  # Use first date column found

            # Convert to Date if needed
            if (inherits(data_df[[date_col]], "character") || inherits(data_df[[date_col]], "factor")) {
              tryCatch({
                data_df[[date_col]] <- as.Date(data_df[[date_col]], tryFormats = c("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y%m%d"))
              }, error = function(e) {
                cat("Date conversion warning:", e$message, "\n")
              })
            }

            # Extract date range
            valid_dates <- data_df[[date_col]][!is.na(data_df[[date_col]])]
            if (length(valid_dates) > 0) {
              persistent_data$date_range$min_date <- min(valid_dates)
              persistent_data$date_range$max_date <- max(valid_dates)
              persistent_data$date_range$date_column <- date_col

              cat("✅ Date range extracted:", persistent_data$date_range$min_date,
                  "to", persistent_data$date_range$max_date, "\n")
            }
          }
        }
      } else {
        # Data exists but has no content
        persistent_data$data_loaded <- FALSE
        cat("⚠️ Data frame has no content - setting data_loaded = FALSE\n")
      }
    } else {
      # Reset data_loaded status if no valid data
      persistent_data$data_loaded <- FALSE
      cat("⚠️ No valid data available - setting data_loaded = FALSE\n")
    }
  })

  # Store independent data
  observe({
    if (!is.null(data_results$independent_data) && is.data.frame(data_results$independent_data)) {
      persistent_data$independent_data <- data_results$independent_data
    }
  })

  # Store joined data
  observe({
    if (!is.null(data_results$joined_data) && is.data.frame(data_results$joined_data)) {
      persistent_data$joined_data <- data_results$joined_data
    }
  })

  # Store model results
  observe({
    if (!is.null(model_results)) {
      persistent_data$model_results <- model_results
      persistent_data$model_calculated <- TRUE
    }
  })

  # Store forecast results
  observe({
    if (!is.null(forecast_results)) {
      persistent_data$forecast_results <- forecast_results
      persistent_data$forecast_run <- TRUE
    }
  })

  # Store intuition data
  observe({
    if (!is.null(model_results$intuisiData) && is.data.frame(model_results$intuisiData)) {
      persistent_data$intuition_data <- model_results$intuisiData
    }
  })

  # Track UI state changes
  observe({
    if (!is.null(input$dependent_type)) {
      persistent_data$last_dependent_type <- input$dependent_type
    }
  })

  observe({
    if (!is.null(input$segment)) {
      persistent_data$last_segment <- input$segment
    }
  })

  # =============================================================================
  # 🔐 AUTHENTICATION EVENT HANDLERS
  # =============================================================================

  # Handle session refresh
  observeEvent(input$refresh_session, {
    tryCatch({
      cat("🔄 SESSION REFRESH: Starting session refresh process\n")

      # Show immediate feedback - using valid Shiny notification type
      showNotification("Refreshing session...", type = "default", duration = 1)

      # Create a non-blocking refresh using invalidateLater
      invalidateLater(100, session)

      # Safely reload user context with timeout protection
      if (!is.null(user_auth)) {
        cat("🔄 SESSION REFRESH: user_auth object available, calling load_user_context()\n")

        # Additional validation to debug the issue
        if (is.function(user_auth$load_user_context)) {
          user_auth$load_user_context()
          cat("🔄 SESSION REFRESH: load_user_context() completed successfully\n")
          showNotification("Session refreshed successfully!", type = "message", duration = 3)
        } else {
          cat("❌ SESSION REFRESH: load_user_context is not a function\n")
          showNotification("Session refresh failed: load_user_context method not available", type = "error", duration = 5)
        }
      } else {
        cat("❌ SESSION REFRESH: user_auth is NULL\n")
        showNotification("Authentication system not available", type = "warning", duration = 3)
      }
    }, error = function(e) {
      cat("❌ SESSION REFRESH ERROR:", e$message, "\n")
      cat("❌ SESSION REFRESH ERROR TYPE:", class(e), "\n")
      cat("❌ SESSION REFRESH ERROR CALL:", paste(deparse(e$call), collapse = "\n"), "\n")

      # Try to provide more specific error information
      error_msg <- e$message
      if (grepl("'arg' should be one of", error_msg, fixed = TRUE)) {
        # This is the specific error we're trying to fix
        showNotification("Session refresh failed: Invalid notification type used in system", type = "error", duration = 5)
        cat("💡 SESSION REFRESH: This error indicates an invalid notification type was used somewhere in the code\n")
      } else {
        showNotification(paste("Session refresh failed:", error_msg), type = "error", duration = 5)
      }
    })
  })

  # Handle logout
  observeEvent(input$logout, {
    # Clear session data
    session$userData <- list()

    # Show notification
    showNotification("Logged out successfully. Please refresh the page to login again.",
                    type = "default", duration = 5)

    # Log user access
    cat("🔓 User logged out at:", format(Sys.time(), "%Y-%m-%d %H:%M:%S"), "\n")
  })

  # =============================================================================
  # ✅ NAVIGATION NOW HANDLED BY STANDARD DASHBOARD PAGE (NO CUSTOM LOGIC NEEDED)
  # =============================================================================

  # Silent authentication and persistence logging - only show in debug mode
  if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
    observe({
      if (user_auth$is_authenticated()) {
        cat("🔑 User Authentication Status:\n")
        cat("  - Authenticated: Yes\n")
        cat("  - User:", user_auth$get_user_display_name(), "\n")
        cat("  - Role:", user_auth$get_current_user()$role %||% "Unknown", "\n")
        cat("  - Available Modules:", paste(user_auth$get_available_modules(), collapse = ", "), "\n")
      } else {
        cat("🔑 User Authentication Status: Not authenticated\n")
      }
    })

    observe({
      cat("📊 Data Persistence Status:\n")
      cat("  - Data loaded:", persistent_data$data_loaded, "\n")
      cat("  - Model calculated:", persistent_data$model_calculated, "\n")
      cat("  - Forecast run:", persistent_data$forecast_run, "\n")
      cat("  - Date range available:", !is.null(persistent_data$date_range$min_date), "\n")
    })
  }
}

# =============================================================================
# 🚀 LAUNCH THE WORKING MODULAR APPLICATION
# =============================================================================

# Simple PID file check - remove if exists
port <- Sys.getenv("R_PORT", "4236")
pid_file <- paste0("/tmp/r-analytics-singleton-", port, ".pid")
if (file.exists(pid_file)) {
  file.remove(pid_file)
  if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
    cat("✅ Removed stale PID file\n")
  }
}

# Write current PID to file
current_pid <- Sys.getpid()
writeLines(as.character(current_pid), pid_file)

# Note: PID cleanup will be handled by the start script

# Load centralized configuration with error handling
tryCatch({
  source("config/centralized-config.R")

  # Initialize configuration with fallback
  if (!exists("config_manager") || is.null(config_manager)) {
    # Fallback configuration if centralized config fails
    service_config <- list(
      host = "0.0.0.0",
      dashboard_port = as.integer(Sys.getenv("R_PORT", "4236"))
    )
  } else {
    config_manager$initialize()
    service_config <- config_manager$get_service_config("r_analytics")
  }
}, error = function(e) {
  # Fallback configuration if centralized config fails
  warning("Centralized config failed, using fallback: ", e$message)
  service_config <- list(
    host = "0.0.0.0",
    dashboard_port = as.integer(Sys.getenv("R_PORT", "4236"))
  )
})

shinyApp(ui = ui, server = server, options = list(
  host = service_config$host,
  port = service_config$dashboard_port,
  launch.browser = FALSE
))

# =============================================================================
# ✅ IMPLEMENTATION COMPLETE - WORKING MODULAR STRUCTURE!
# =============================================================================
# ✅ KEPT: Top header navigation (working perfectly)
# ✅ KEPT: Database connections (established and working)
# ✅ FIXED: Proper modular UI and server integration
# ✅ FIXED: All buttons now respond when clicked via modules
# ✅ FIXED: No dashboardHeader structure issues
# ✅ WORKING: All UI modules (home, data, model, forecast, pdafl)
# ✅ WORKING: All server modules with proper parameter passing
# =============================================================================
