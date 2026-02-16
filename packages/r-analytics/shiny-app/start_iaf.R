#!/usr/bin/env Rscript

# =============================================================================
# IAF R ANALYTICS STARTUP SCRIPT - SMART ENVIRONMENT CONFIGURATION
# =============================================================================
# Purpose: Start IAF R Analytics with environment-specific configuration
# Supports: LOCALDEV and IAFECS deployment targets
# Usage: Called from start-iaf-analytics.sh with environment variables
# =============================================================================

# Silent startup - no banner to prevent log corruption
# Environment configuration will be loaded silently

# Get environment variables from shell
deployment_target <- Sys.getenv("DEPLOYMENT_TARGET", "localdev")
node_env <- Sys.getenv("NODE_ENV", "development")
r_port <- Sys.getenv("R_PORT", "4236")
r_service_port <- Sys.getenv("R_SERVICE_PORT", "4241")
db_host <- Sys.getenv("DB_HOST", "192.168.0.106")
db_port <- Sys.getenv("DB_PORT", "5433")
db_user <- Sys.getenv("DB_USER", "postgres")
db_password <- Sys.getenv("DB_PASSWORD", "postgres")
db_name <- Sys.getenv("DB_NAME", "FRS9PRO")
db_schema <- Sys.getenv("DB_SCHEMA", "public")
banking_type <- Sys.getenv("BANKING_TYPE", "conventional")
tenant_slug <- Sys.getenv("TENANT_SLUG", "iaf")
company_name <- Sys.getenv("COMPANY_NAME", "Indonesia Airawata Finance")
backend_url <- Sys.getenv("BACKEND_URL", "https://iaf-ifrs-be.ifrspro.id")
api_base_url <- Sys.getenv("API_BASE_URL", "https://iaf-ifrs-be.ifrspro.id/api")
r_analytics_url <- Sys.getenv("R_ANALYTICS_URL", "https://iaf-ifrs-analytics.ifrspro.id")
r_api_url <- Sys.getenv("R_API_URL", "https://iaf-ifrs-analytics-calc.ifrspro.id")

# Silent configuration loading to prevent log corruption
# Configuration summary suppressed to avoid duplicate output

# Set R-specific environment variables
Sys.setenv(R_PORT = r_port)
Sys.setenv(R_SERVICE_PORT = r_service_port)
Sys.setenv(DB_HOST = db_host)
Sys.setenv(DB_PORT = db_port)
Sys.setenv(DB_USER = db_user)
Sys.setenv(DB_PASSWORD = db_password)
Sys.setenv(DB_NAME = db_name)
Sys.setenv(DB_SCHEMA = db_schema)
Sys.setenv(BANKING_TYPE = banking_type)
Sys.setenv(TENANT_SLUG = tenant_slug)
Sys.setenv(COMPANY_NAME = company_name)
Sys.setenv(BACKEND_URL = backend_url)
Sys.setenv(API_BASE_URL = api_base_url)
Sys.setenv(R_ANALYTICS_URL = r_analytics_url)
Sys.setenv(R_API_URL = r_api_url)
Sys.setenv(DEPLOYMENT_TARGET = deployment_target)
Sys.setenv(NODE_ENV = node_env)

# Database configuration for R
db_config <- list(
  host = db_host,
  port = as.integer(db_port),
  user = db_user,
  password = db_password,
  dbname = db_name,
  schema = db_schema,
  sslmode = if (deployment_target == "iafecs") "require" else "disable"
)

# IAF configuration for R
iaf_config <- list(
  deployment_target = deployment_target,
  banking_type = banking_type,
  tenant_slug = tenant_slug,
  company_name = company_name,
  node_env = node_env,
  urls = list(
    backend = backend_url,
    api_base = api_base_url,
    r_analytics = r_analytics_url,
    r_api = r_api_url
  )
)

# Make configurations available to Shiny app
options(
  IAF_DB_CONFIG = db_config,
  IAF_CONFIG = iaf_config,
  IAF_DEPLOYMENT_TARGET = deployment_target,
  IAF_BANKING_TYPE = banking_type,
  IAF_TENANT_SLUG = tenant_slug
)

# Silent configuration loading - no output to prevent log corruption
# Environment configuration is loaded silently to avoid duplicate messages

# Test database connection if required packages are available
tryCatch({
  # Try to load RPostgres and test connection
  if (require("RPostgres", quietly = TRUE)) {
    cat("🔍 Testing database connection...\n")
    con <- dbConnect(RPostgres::Postgres(),
                     host = db_config$host,
                     port = db_config$port,
                     user = db_config$user,
                     password = db_config$password,
                     dbname = db_config$dbname)

    # Test simple query
    result <- dbGetQuery(con, "SELECT version() as version")
    cat("✅ Database connection successful\n")
    cat("📊 PostgreSQL version:", result$version, "\n")
    dbDisconnect(con)
  } else {
    cat("⚠️ RPostgres package not available, skipping database test\n")
  }
}, error = function(e) {
  cat("⚠️ Database connection test failed:", e$message, "\n")
})

# Silent startup - no output to prevent log corruption
# All environment variables are set and ready for Shiny app

# Launch the Shiny application
tryCatch({
  # Set shiny options
  options(
    shiny.host = "0.0.0.0",
    shiny.port = as.integer(r_port),
    shiny.test.mode = FALSE
  )

  # Load and run the Shiny application silently
  if (file.exists("app.R")) {
    shiny::runApp(
      appDir = ".",
      host = "0.0.0.0",
      port = as.integer(r_port),
      launch.browser = FALSE
    )
  } else {
    stop("app.R not found in current directory")
  }

}, error = function(e) {
  cat("❌ Failed to start Shiny application:\n")
  cat("Error:", e$message, "\n")
  cat("Call stack:\n")
  for (i in 1:length(traceback())) {
    cat("  ", traceback()[i], "\n")
  }
  quit(status = 1)
})
