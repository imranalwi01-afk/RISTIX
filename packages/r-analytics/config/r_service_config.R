# packages/r-analytics/config/r_service_config.R
# R Service Configuration - IFRS 9 Analytics

# Service Configuration
R_SERVICE_CONFIG <- list(
  port = as.integer(Sys.getenv("R_SERVICE_PORT", "8001")),
  host = Sys.getenv("R_SERVICE_HOST", "0.0.0.0"),
  threads = as.integer(Sys.getenv("R_SERVICE_THREADS", "1")),
  max_memory_mb = as.integer(Sys.getenv("R_MAX_MEMORY_MB", "2048")),
  timeout_seconds = as.integer(Sys.getenv("R_TIMEOUT_SECONDS", "300"))
)

# Database Configuration
DB_CONFIG <- list(
  host = Sys.getenv("DB_HOST", "localhost"),
  port = as.integer(Sys.getenv("DB_PORT", "5432")),
  user = Sys.getenv("DB_USER", "postgres"),
  password = Sys.getenv("DB_PASSWORD", "postgres"),
  dbname = Sys.getenv("DB_NAME", "postgres")
)

# IFRS 9 Model Configuration
IFRS9_CONFIG <- list(
  default_pd_method = "historical",
  default_lgd_method = "historical",
  default_ead_method = "current",
  
  # PD Configuration
  pd_config = list(
    min_pd = 0.0001,
    max_pd = 1.0,
    default_pd = 0.05,
    rating_override = TRUE
  ),
  
  # LGD Configuration
  lgd_config = list(
    min_lgd = 0.01,
    max_lgd = 1.0,
    default_lgd = 0.45,
    collateral_adjustment = TRUE
  ),
  
  # EAD Configuration
  ead_config = list(
    default_ccf = 0.75,
    max_ccf = 1.0,
    stressed_ccf_multiplier = 1.5
  ),
  
  # Stage Classification
  stage_config = list(
    stage2_pd_threshold = 0.10,
    stage2_dpd_threshold = 30,
    stage3_dpd_threshold = 90,
    significant_increase_factor = 2.0
  )
)

# Logging Configuration
LOGGING_CONFIG <- list(
  level = Sys.getenv("LOG_LEVEL", "INFO"),
  file = Sys.getenv("LOG_FILE", "r_analytics.log"),
  max_size_mb = 100
)

cat("R Service configuration loaded successfully!\n")
cat("Service will run on:", R_SERVICE_CONFIG$host, ":", R_SERVICE_CONFIG$port, "\n")
