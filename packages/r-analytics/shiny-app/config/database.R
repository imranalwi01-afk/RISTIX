# =============================================================================
# SIMPLIFIED DATABASE CONFIGURATION - IAF R ANALYTICS
# =============================================================================
# Purpose: Database configuration matching original working app
# Source: Based on /home/doppelgaenger/ifrspro/_analytics/_v30/app30.R
# Environment: Local development with direct connection
# =============================================================================

get_preferred_env <- function(primary, fallback, default = "") {
  primary_val <- Sys.getenv(primary, "")
  if (nzchar(primary_val)) return(primary_val)
  fallback_val <- Sys.getenv(fallback, "")
  if (nzchar(fallback_val)) return(fallback_val)
  default
}

# Load runtime logger if not already loaded.
if (!exists("ra_log_info")) {
  for (logger_path in c("../logger.R", "/opt/r-analytics/logger.R", "logger.R")) {
    if (file.exists(logger_path)) {
      source(logger_path)
      break
    }
  }
}

# Fallback logger if shared logger is unavailable.
if (!exists("ra_log_info")) {
  ra_log_info <- function(message, context = NULL, service = NULL) cat("[INFO] ", message, "\n", sep = "")
  ra_log_warn <- function(message, context = NULL, service = NULL) cat("[WARN] ", message, "\n", sep = "", file = stderr())
  ra_log_error <- function(message, context = NULL, service = NULL) cat("[ERROR] ", message, "\n", sep = "", file = stderr())
} else if (exists("ra_init_logger") && !nzchar(getOption("ra_logger_service", ""))) {
  ra_init_logger(service = "r-analytics-db")
}

#' Get Database Configuration for IFRS9 Analytics
#' @description Returns database configuration matching original working app
#' @return Database configuration list for IFRS9 analytics
get_database_config <- function() {
  # Configuration driven by environment (FRS9_DB_* preferred, then DB_*)
  return(list(
    host = get_preferred_env("FRS9_DB_HOST", "DB_HOST", "10.8.0.2"),
    port = as.integer(get_preferred_env("FRS9_DB_PORT", "DB_PORT", "5433")),
    dbname = get_preferred_env("FRS9_DB_NAME", "DB_NAME", "FRS9PRO"),
    schema = get_preferred_env("FRS9_DB_SCHEMA", "DB_SCHEMA", "public"),
    user = get_preferred_env("FRS9_DB_USER", "DB_USER", "postgres"),
    password = get_preferred_env("FRS9_DB_PASSWORD", "DB_PASSWORD", "postgres"),
    sslmode = Sys.getenv("DB_SSLMODE", "disable")
  ))
}

#' Enhanced Database Configuration Setup
#' @description Configures database connection matching original working app
#' @return List containing database connection and reference data
setup_database <- function() {
  ra_log_info("Setting up database connection")
  db_cfg <- get_database_config()
  db_schema <- db_cfg$schema
  if (!grepl("^[A-Za-z_][A-Za-z0-9_]*$", db_schema)) {
    db_schema <- "public"
  }

  # Use the exact same database configuration as the original working app
  # Based on /home/doppelgaenger/ifrspro/_analytics/_v30/app30.R

  ra_log_info("Database target resolved", context = list(
    host = db_cfg$host,
    port = db_cfg$port,
    dbname = db_cfg$dbname,
    schema = db_schema,
    sslmode = db_cfg$sslmode
  ))

  # Initialize variables with safe defaults
  con <- NULL
  PD <- data.frame()
  LGD <- data.frame()

  # Try to establish database connection with enhanced error handling
  tryCatch({
    ra_log_info("Connecting to database")

    # Check if required database packages are available
    if (!requireNamespace("DBI", quietly = TRUE) || !requireNamespace("RPostgres", quietly = TRUE)) {
      stop("Required database packages (DBI, RPostgres) are not installed")
    }

    # Use centralized env-driven configuration.
    con <- DBI::dbConnect(RPostgres::Postgres(),
                         host = db_cfg$host,
                         port = db_cfg$port,
                         dbname = db_cfg$dbname,
                         user = db_cfg$user,
                         password = db_cfg$password,
                         sslmode = db_cfg$sslmode)

    ra_log_info("Database connection established")

    # Test connection with a simple query
    test_query <- tryCatch({
      DBI::dbGetQuery(con, "SELECT 1 as test_connection")
    }, error = function(e) {
      ra_log_warn("Connection test query failed", context = list(error = e$message))
      return(NULL)
    })

    if (!is.null(test_query) && nrow(test_query) > 0) {
      ra_log_info("Connection test successful")
    } else {
      ra_log_warn("Connection test failed - continuing anyway")
    }

    # Set schema path from environment (FRS9PRO uses public by default)
    tryCatch({
      search_path_sql <- paste0('SET search_path TO "', db_schema, '", public;')
      DBI::dbExecute(con, search_path_sql)
      ra_log_info("Schema search_path configured", context = list(schema = db_schema, fallback = "public"))
    }, error = function(e) {
      # Fallback to public if configured schema doesn't exist
      DBI::dbExecute(con, "SET search_path TO public;")
      ra_log_warn("Schema configuration failed, fallback to public", context = list(error = e$message))
    })

    # Ensure analytics_joined_data table exists for modular app
    tryCatch({
      ra_log_info("Ensuring analytics_joined_data table exists")
      DBI::dbExecute(con, 'CREATE TABLE IF NOT EXISTS analytics_joined_data (
        id SERIAL PRIMARY KEY,
        data_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id VARCHAR(255)
      )')
      ra_log_info("analytics_joined_data table ready")
    }, error = function(e) {
      ra_log_warn("Failed to create analytics_joined_data table", context = list(error = e$message))
    })

    # Load configuration data with comprehensive error handling
    ra_log_info("Loading configuration data from database")

    # Try to load LGD configuration
    LGD <- tryCatch({
      lgd_data <- DBI::dbGetQuery(con, "SELECT * FROM frs9_imp_ca_lgd_config")
      ra_log_info("LGD configuration loaded", context = list(rows = nrow(lgd_data)))
      lgd_data
    }, error = function(e) {
      ra_log_warn("LGD configuration load failed, using empty dataset", context = list(error = e$message))
      data.frame()
    })

    # Try to load PD configuration
    PD <- tryCatch({
      pd_data <- DBI::dbGetQuery(con, "SELECT * FROM frs9_imp_ca_pd_config")
      ra_log_info("PD configuration loaded", context = list(rows = nrow(pd_data)))
      pd_data
    }, error = function(e) {
      ra_log_warn("PD configuration load failed, using empty dataset", context = list(error = e$message))
      data.frame()
    })

    ra_log_info("Database setup completed successfully")

  }, error = function(e) {
    ra_log_error("Database connection failed, switching to offline mode", context = list(error = e$message))
    ra_log_info("Offline mode enabled with sample data")

    # Ensure connection is NULL for offline mode
    con <- NULL

    # Create sample configuration data for offline mode
    ra_log_info("Creating sample configuration data")
    LGD <- data.frame(
      config_id = 1:5,
      lgd_rate = c(0.45, 0.50, 0.40, 0.55, 0.48),
      recovery_rate = c(0.55, 0.50, 0.60, 0.45, 0.52),
      description = paste("Sample LGD Configuration", 1:5)
    )

    PD <- data.frame(
      config_id = 1:5,
      pd_rate = c(0.02, 0.015, 0.025, 0.018, 0.022),
      rating = paste("BBB", 1:5),
      description = paste("Sample PD Configuration", 1:5)
    )

    ra_log_info("Sample configuration data created", context = list(
      lgd_rows = nrow(LGD),
      pd_rows = nrow(PD)
    ))
  })

  # Return comprehensive database setup
  return(list(
    connection = con,
    config = list(
      host = db_cfg$host,
      port = db_cfg$port,
      dbname = db_cfg$dbname,
      schema = db_schema,
      user = db_cfg$user,
      sslmode = db_cfg$sslmode
    ),
    environment = "local",
    PD = PD,
    LGD = LGD,
    offline_mode = is.null(con)
  ))
}

# =============================================================================
# CENTRALIZED DATABASE INITIALIZATION
# =============================================================================

# Initialize database connection and reference data using centralized config
database_setup <- setup_database()

# Export global variables for backward compatibility
con <- database_setup$connection
PD <- database_setup$PD
LGD <- database_setup$LGD

# =============================================================================
# END OF CENTRALIZED DATABASE CONFIGURATION
# =============================================================================
