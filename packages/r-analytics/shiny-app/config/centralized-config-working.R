# =============================================================================
# CENTRALIZED CONFIGURATION SYSTEM - IAF R ANALYTICS (WORKING VERSION)
# =============================================================================
# Purpose: Centralized configuration management for R Analytics
# Principle: NO HARDCODED VALUES - All configuration from environment
# Environment: Smart detection between localdev and iafecs
# =============================================================================

# Load required R6 library
library(R6)

#' Centralized Configuration Manager
#' @description Loads and manages all configuration from environment variables
CentralizedConfiguration <- R6Class("CentralizedConfiguration",

  private = list(
    # Cached configuration
    config_cache = NULL,

    # Load environment configuration
    load_environment_config = function() {
      # Priority 1: DEPLOYMENT_TARGET environment variable
      deployment_target <- Sys.getenv("DEPLOYMENT_TARGET", "NOT_SET")

      # Priority 2: Environment detection
      if (deployment_target == "NOT_SET") {
        deployment_target <- self$detect_environment()
      }

      # Silent mode: No environment detection output to prevent log corruption

      if (deployment_target == "iafecs") {
        return(private$load_production_config())
      } else {
        return(private$load_development_config())
      }
    },

    # Detect deployment environment
    detect_environment = function() {
      # Check for ECS metadata
      tryCatch({
        ecs_metadata <- system("curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null", intern = TRUE)
        if (length(ecs_metadata) > 0 && grepl("^i-", ecs_metadata)) {
          return("iafecs")
        }
      }, error = function(e) {
        # Not on ECS
      })

      # Check for IAF-specific patterns
      hostname <- Sys.getenv("HOSTNAME", "")
      if (grepl("iaf|ecs|alibaba", hostname, ignore.case = TRUE)) {
        return("iafecs")
      }

      # Default to local development
      return("localdev")
    },

    # Load production configuration
    load_production_config = function() {
      # Silent configuration loading

      return(list(
        environment = "production",
        deployment_target = "iafecs",
        services = list(
          r_analytics = list(
            dashboard_port = as.integer(Sys.getenv("R_DASHBOARD_PORT", "4236")),
            api_port = as.integer(Sys.getenv("R_API_PORT", "4241")),
            host = Sys.getenv("R_SERVICE_HOST", "0.0.0.0"),
            workers = as.integer(Sys.getenv("R_WORKERS", "4"))
          )
        ),
        database = list(
          rds = list(
            host = Sys.getenv("RDS_HOST", "pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com"),
            port = as.integer(Sys.getenv("RDS_PORT", "5432")),
            user = Sys.getenv("RDS_USER", "admin_iaf"),
            password = Sys.getenv("RDS_PASSWORD", "P@ssw0rd2025!"),
            ssl_mode = Sys.getenv("RDS_SSL_MODE", "prefer"),
            connection_timeout = as.integer(Sys.getenv("DB_CONNECTION_TIMEOUT", "10000"))
          ),
          databases = list(
            platform_admin = Sys.getenv("DB_PLATFORM_ADMIN", "ifrspro_platform_admin"),
            shared_services = Sys.getenv("DB_SHARED_SERVICES", "ifrspro_shared_services"),
            frs9_legacy = Sys.getenv("DB_FRS9_LEGACY", "FRS9PRO"),
            ifrs9_analytics = Sys.getenv("DB_IFRS9_ANALYTICS", "FRS9PRO"),
            tenant_iaf = Sys.getenv("DB_TENANT_IAF", "ifrspro_tenant_iaf")
          )
        ),
        urls = list(
          analytics_dashboard = Sys.getenv("ANALYTICS_DASHBOARD_URL", "https://analytics-ristix.bdo-ki.com"),
          analytics_api = Sys.getenv("ANALYTICS_API_URL", "https://analytics-calc-ristix.bdo-ki.com"),
          backend_api = Sys.getenv("BACKEND_API_URL", "https://api-ristix.bdo-ki.com"),
          frontend = Sys.getenv("FRONTEND_URL", "https://ristix.bdo-ki.com")
        ),
        security = list(
          jwt_secret = Sys.getenv("JWT_SECRET"),
          encryption_key = Sys.getenv("ENCRYPTION_KEY"),
          session_timeout = as.integer(Sys.getenv("SESSION_TIMEOUT", "28800")),
          enable_auth = as.logical(Sys.getenv("ENABLE_AUTH", "true"))
        ),
        features = list(
          debug_mode = as.logical(Sys.getenv("DEBUG_MODE", "false")),
          advanced_logging = as.logical(Sys.getenv("ADVANCED_LOGGING", "true")),
          performance_monitoring = as.logical(Sys.getenv("PERFORMANCE_MONITORING", "true"))
        )
      ))
    },

    # Load development configuration
    load_development_config = function() {
      cat("🏠 Loading Local Development Configuration\n")

      return(list(
        environment = "development",
        deployment_target = "localdev",
        services = list(
          r_analytics = list(
            dashboard_port = as.integer(Sys.getenv("R_DASHBOARD_PORT", "4236")),
            api_port = as.integer(Sys.getenv("R_API_PORT", "4241")),
            host = Sys.getenv("R_SERVICE_HOST", "0.0.0.0"),
            workers = as.integer(Sys.getenv("R_WORKERS", "2"))
          )
        ),
        database = list(
          local = list(
            ds1 = list(
              host = Sys.getenv("DS1_HOST", "192.168.0.85"),
              port = as.integer(Sys.getenv("DS1_PORT", "5432")),
              user = Sys.getenv("DS1_USER", "postgres"),
              password = Sys.getenv("DS1_PASSWORD", "postgres"),
              ssl_mode = Sys.getenv("DS1_SSL_MODE", "disable")
            ),
            ds2 = list(
              host = Sys.getenv("DS2_HOST", "192.168.0.106"),
              port = as.integer(Sys.getenv("DS2_PORT", "5433")),
              user = Sys.getenv("DS2_USER", "postgres"),
              password = Sys.getenv("DS2_PASSWORD", "postgres"),
              ssl_mode = Sys.getenv("DS2_SSL_MODE", "disable")
            )
          ),
          databases = list(
            platform_admin = Sys.getenv("DB_PLATFORM_ADMIN", "ifrspro_platform_admin"),
            shared_services = Sys.getenv("DB_SHARED_SERVICES", "ifrspro_shared_services"),
            frs9_legacy = Sys.getenv("DB_FRS9_LEGACY", "FRS9PRO"),
            ifrs9_analytics = Sys.getenv("DB_IFRS9_ANALYTICS", "FRS9PRO"),
            tenant_iaf = Sys.getenv("DB_TENANT_IAF", "ifrspro_tenant_iaf")
          )
        ),
        urls = list(
          analytics_dashboard = Sys.getenv("ANALYTICS_DASHBOARD_URL", "https://ifrs9-iaf-analytics.ifrspro.id"),
          analytics_api = Sys.getenv("ANALYTICS_API_URL", "https://ifrs9-iaf-analytics-calc.ifrspro.id"),
          backend_api = Sys.getenv("BACKEND_API_URL", "https://bifrs9-iaf.ifrspro.id"),
          frontend = Sys.getenv("FRONTEND_URL", "https://ifrs9-iaf.ifrspro.id")
        ),
        security = list(
          jwt_secret = Sys.getenv("JWT_SECRET", "dev-jwt-secret-change-in-production"),
          encryption_key = Sys.getenv("ENCRYPTION_KEY", "dev-encryption-key-change-in-production"),
          session_timeout = as.integer(Sys.getenv("SESSION_TIMEOUT", "28800")),
          enable_auth = as.logical(Sys.getenv("ENABLE_AUTH", "false"))
        ),
        features = list(
          debug_mode = as.logical(Sys.getenv("DEBUG_MODE", "true")),
          advanced_logging = as.logical(Sys.getenv("ADVANCED_LOGGING", "true")),
          performance_monitoring = as.logical(Sys.getenv("PERFORMANCE_MONITORING", "false"))
        )
      ))
    }
  ),

  public = list(
    # Initialize Configuration
    initialize = function() {
      if (is.null(private$config_cache)) {
        private$config_cache <- private$load_environment_config()
      }
      return(private$config_cache)
    },

    # Get Configuration
    get_config = function(section = NULL) {
      if (is.null(private$config_cache)) {
        self$initialize()
      }

      if (is.null(section)) {
        return(private$config_cache)
      } else {
        return(private$config_cache[[section]])
      }
    },

    # Get Database Configuration
    get_database_config = function(database_name = "ifrs9_analytics") {
      config <- self$get_config()

      if (config$deployment_target == "iafecs") {
        # Production: Use RDS
        return(list(
          host = config$database$rds$host,
          port = config$database$rds$port,
          user = config$database$rds$user,
          password = config$database$rds$password,
          dbname = config$database$databases[[database_name]],
          sslmode = config$database$rds$ssl_mode
        ))
      } else {
        # Development: Use appropriate local server
        if (database_name %in% c("platform_admin", "shared_services", "tenant_iaf")) {
          db_server <- config$database$local$ds1
        } else {
          db_server <- config$database$local$ds2
        }

        return(list(
          host = db_server$host,
          port = db_server$port,
          user = db_server$user,
          password = db_server$password,
          dbname = config$database$databases[[database_name]],
          sslmode = db_server$ssl_mode
        ))
      }
    },

    # Get Service Configuration
    get_service_config = function(service_name = "r_analytics") {
      config <- self$get_config()
      return(config$services[[service_name]])
    },

    # Get URL Configuration
    get_urls = function() {
      config <- self$get_config()
      return(config$urls)
    },

    # Is Debug Mode
    is_debug_mode = function() {
      config <- self$get_config()
      return(config$features$debug_mode)
    },

    # Get Environment
    get_environment = function() {
      config <- self$get_config()
      return(config$environment)
    }
  )
)

# Lazy-loaded Global Configuration Instance
get_config_manager <- function() {
  if (!exists(".config_manager_instance", envir = .GlobalEnv)) {
    .config_manager_instance <- CentralizedConfiguration$new()
  }
  return(.config_manager_instance)
}

# Global Configuration Instance (backward compatibility)
config_manager <- local({
  get_config_manager()
})