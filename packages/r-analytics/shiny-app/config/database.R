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

#' Get Database Configuration for IFRS9 Analytics
#' @description Returns database configuration matching original working app
#' @return Database configuration list for IFRS9 analytics
get_database_config <- function() {
  # Configuration driven by environment (FRS9_DB_* preferred, then DB_*)
  return(list(
    host = get_preferred_env("FRS9_DB_HOST", "DB_HOST", "192.168.0.106"),
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
  cat("🔗 Setting up database connection (matching original app)...\n")
  db_cfg <- get_database_config()
  db_schema <- db_cfg$schema
  if (!grepl("^[A-Za-z_][A-Za-z0-9_]*$", db_schema)) {
    db_schema <- "public"
  }

  # Use the exact same database configuration as the original working app
  # Based on /home/doppelgaenger/ifrspro/_analytics/_v30/app30.R

  cat("🏢 Database: ", db_cfg$host, " : ", db_cfg$port, " / ", db_cfg$dbname, "\n", sep = "")
  cat("🔐 SSL Mode: ", db_cfg$sslmode, "\n", sep = "")
  cat("📋 Schema: ", db_schema, "\n", sep = "")

  # Initialize variables with safe defaults
  con <- NULL
  PD <- data.frame()
  LGD <- data.frame()

  # Try to establish database connection with enhanced error handling
  tryCatch({
    cat("📡 Connecting to database...\n")

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

    cat("✅ Database connection established!\n")

    # Test connection with a simple query
    test_query <- tryCatch({
      DBI::dbGetQuery(con, "SELECT 1 as test_connection")
    }, error = function(e) {
      cat("⚠️ Connection test failed:", e$message, "\n")
      return(NULL)
    })

    if (!is.null(test_query) && nrow(test_query) > 0) {
      cat("✅ Connection test successful!\n")
    } else {
      cat("⚠️ Connection test failed - continuing anyway\n")
    }

    # Set schema path from environment (FRS9PRO uses public by default)
    tryCatch({
      search_path_sql <- paste0('SET search_path TO "', db_schema, '", public;')
      DBI::dbExecute(con, search_path_sql)
      cat("🎯 Schema path set to ", db_schema, " (with public fallback)\n", sep = "")
    }, error = function(e) {
      # Fallback to public if configured schema doesn't exist
      DBI::dbExecute(con, "SET search_path TO public;")
      cat("🎯 Schema path set to public (fallback)\n")
    })

    # Ensure analytics_joined_data table exists for modular app
    tryCatch({
      cat("🔧 Creating analytics_joined_data table if it doesn't exist...\n")
      DBI::dbExecute(con, 'CREATE TABLE IF NOT EXISTS analytics_joined_data (
        id SERIAL PRIMARY KEY,
        data_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id VARCHAR(255)
      )')
      cat("✅ analytics_joined_data table is ready\n")
    }, error = function(e) {
      cat("⚠️ Failed to create analytics_joined_data table:", e$message, "\n")
    })

    # Load configuration data with comprehensive error handling
    cat("📊 Loading configuration data from database...\n")

    # Try to load LGD configuration
    LGD <- tryCatch({
      lgd_data <- DBI::dbGetQuery(con, "SELECT * FROM frs9_imp_ca_lgd_config")
      cat("✅ LGD configuration loaded:", nrow(lgd_data), "records\n")
      lgd_data
    }, error = function(e) {
      cat("⚠️ LGD configuration load failed:", e$message, "\n")
      cat("🔧 Using empty LGD configuration\n")
      data.frame()
    })

    # Try to load PD configuration
    PD <- tryCatch({
      pd_data <- DBI::dbGetQuery(con, "SELECT * FROM frs9_imp_ca_pd_config")
      cat("✅ PD configuration loaded:", nrow(pd_data), "records\n")
      pd_data
    }, error = function(e) {
      cat("⚠️ PD configuration load failed:", e$message, "\n")
      cat("🔧 Using empty PD configuration\n")
      data.frame()
    })

    cat("✅ Database setup completed successfully!\n")

  }, error = function(e) {
    cat("❌ Database connection failed:", e$message, "\n")
    cat("🔧 Application will run in offline mode with sample data\n")
    cat("📋 Offline mode features:\n")
    cat("   - Sample PD/LGD configurations will be generated\n")
    cat("   - File upload and processing will work\n")
    cat("   - Calculations will use sample parameters\n")

    # Ensure connection is NULL for offline mode
    con <- NULL

    # Create sample configuration data for offline mode
    cat("📊 Creating sample configuration data...\n")
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

    cat("✅ Sample configuration data created!\n")
    cat("   - Sample LGD configurations:", nrow(LGD), "records\n")
    cat("   - Sample PD configurations:", nrow(PD), "records\n")
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
