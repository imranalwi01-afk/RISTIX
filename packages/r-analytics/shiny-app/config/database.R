# =============================================================================
# DATABASE CONFIGURATION - IAF R ANALYTICS
# =============================================================================
# Pattern: Direct top-level code matching app34.R (the working reference)
# No function wrapper — variables (con, PD, LGD) go straight to global scope
# =============================================================================

# --- Helper functions --------------------------------------------------------

get_preferred_env <- function(primary, fallback, default = "") {
  primary_val <- Sys.getenv(primary, "")
  if (nzchar(primary_val)) return(primary_val)
  fallback_val <- Sys.getenv(fallback, "")
  if (nzchar(fallback_val)) return(fallback_val)
  default
}

resolve_column_name <- function(df, candidates) {
  if (!is.data.frame(df) || ncol(df) == 0 || length(candidates) == 0) return(NULL)
  col_names <- names(df)
  for (candidate in candidates) {
    if (candidate %in% col_names) return(candidate)
  }
  NULL
}

normalize_column_names <- function(df) {
  if (!is.data.frame(df) || ncol(df) == 0) return(df)
  names(df) <- tolower(names(df))
  df
}

normalize_reference_config <- function(df, model_type = c("pd", "lgd")) {
  model_type <- match.arg(model_type)
  if (!is.data.frame(df) || nrow(df) == 0) return(df)
  df <- normalize_column_names(df)

  if (model_type == "pd") {
    model_col <- resolve_column_name(df, c("pd_model_name", "model_name", "name"))
    if (!is.null(model_col) && model_col != "pd_model_name") {
      names(df)[names(df) == model_col] <- "pd_model_name"
    }
  } else {
    model_col <- resolve_column_name(df, c("lgd_model_name", "model_name", "name"))
    if (!is.null(model_col) && model_col != "lgd_model_name") {
      names(df)[names(df) == model_col] <- "lgd_model_name"
    }
  }
  df
}

# --- Logger bootstrap --------------------------------------------------------

if (!exists("ra_log_info")) {
  for (logger_path in c("../logger.R", "/opt/r-analytics/logger.R", "logger.R")) {
    if (file.exists(logger_path)) { source(logger_path); break }
  }
}
if (!exists("ra_log_info")) {
  ra_log_info  <- function(message, context = NULL, service = NULL) cat("[INFO] ", message, "\n", sep = "")
  ra_log_warn  <- function(message, context = NULL, service = NULL) cat("[WARN] ", message, "\n", sep = "", file = stderr())
  ra_log_error <- function(message, context = NULL, service = NULL) cat("[ERROR] ", message, "\n", sep = "", file = stderr())
} else if (exists("ra_init_logger") && !nzchar(getOption("ra_logger_service", ""))) {
  ra_init_logger(service = "r-analytics-db")
}

# =============================================================================
# DATABASE CONNECTION (matches app34.R pattern exactly)
# =============================================================================

db_host     <- get_preferred_env("FRS9_DB_HOST", "DB_HOST", "10.8.0.2")
db_port     <- as.integer(get_preferred_env("FRS9_DB_PORT", "DB_PORT", "5433"))
db_name     <- get_preferred_env("FRS9_DB_NAME", "DB_NAME", "FRS9PRO")
db_schema   <- get_preferred_env("FRS9_DB_SCHEMA", "DB_SCHEMA", "public")
db_user     <- get_preferred_env("FRS9_DB_USER", "DB_USER", "postgres")
db_password <- get_preferred_env("FRS9_DB_PASSWORD", "DB_PASSWORD", "postgres")

# Keep DB_* in sync so legacy modules reading DB_* use the resolved values.
Sys.setenv(
  DB_HOST = db_host,
  DB_PORT = as.character(db_port),
  DB_NAME = db_name,
  DB_SCHEMA = db_schema,
  DB_USER = db_user,
  DB_PASSWORD = db_password
)

ra_log_info("Starting database connection", context = list(
  host = db_host, port = db_port, dbname = db_name, schema = db_schema, user = db_user
))

# Connect to PostgreSQL (same pattern as app34.R lines 101-115)
con <- tryCatch({
  conn <- DBI::dbConnect(
    RPostgres::Postgres(),
    dbname   = db_name,
    host     = db_host,
    port     = db_port,
    user     = db_user,
    password = db_password
  )
  ra_log_info("Database connection successful")
  conn
}, error = function(e) {
  ra_log_error("Database connection failed", context = list(error = e$message))
  cat("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n")
  cat("🚨 DATABASE CONNECTION FAILED\n")
  cat("   Host:", db_host, ":", db_port, "\n")
  cat("   Database:", db_name, "\n")
  cat("   Error:", e$message, "\n")
  cat("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n")
  NULL
})

# Set schema search_path (same as app34.R lines 118-123)
if (!is.null(con)) {
  if (!grepl("^[A-Za-z_][A-Za-z0-9_]*$", db_schema)) {
    db_schema <- "public"
  }
  tryCatch({
    DBI::dbExecute(con, paste0('SET search_path TO "', db_schema, '", public;'))
    ra_log_info("Schema search_path set", context = list(schema = db_schema))
  }, error = function(e) {
    DBI::dbExecute(con, "SET search_path TO public;")
    ra_log_warn("Schema set failed, using public", context = list(error = e$message))
  })
}

# Ensure analytics_joined_data table exists
if (!is.null(con)) {
  tryCatch({
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
}

# =============================================================================
# LOAD PD / LGD CONFIG (matches app34.R lines 126-145)
# =============================================================================

if (!is.null(con)) {
  LGD <- tryCatch({
    lgd_data <- DBI::dbGetQuery(con, "SELECT * FROM frs9_imp_ca_lgd_config")
    lgd_data <- normalize_reference_config(lgd_data, "lgd")
    ra_log_info("LGD configuration loaded", context = list(rows = nrow(lgd_data)))
    lgd_data
  }, error = function(e) {
    ra_log_warn("Failed to load LGD config", context = list(error = e$message))
    data.frame()
  })

  PD <- tryCatch({
    pd_data <- DBI::dbGetQuery(con, "SELECT * FROM frs9_imp_ca_pd_config")
    pd_data <- normalize_reference_config(pd_data, "pd")
    ra_log_info("PD configuration loaded", context = list(rows = nrow(pd_data)))
    pd_data
  }, error = function(e) {
    ra_log_warn("Failed to load PD config", context = list(error = e$message))
    data.frame()
  })
} else {
  ra_log_warn("Running in offline mode: DB unavailable, using empty PD/LGD config")
  LGD <- data.frame()
  PD <- data.frame()
}

cat(sprintf("📊 Database setup complete: con=%s | PD=%d rows | LGD=%d rows\n",
            if (is.null(con)) "NULL" else "CONNECTED",
            nrow(PD), nrow(LGD)))
flush.console()

# =============================================================================
# END OF DATABASE CONFIGURATION
# =============================================================================
