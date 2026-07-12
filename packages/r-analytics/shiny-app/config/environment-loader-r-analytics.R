# =============================================================================
# R ANALYTICS ENVIRONMENT LOADER - IAF DUAL ENVIRONMENT SUPPORT
# =============================================================================
# Purpose: Smart environment detection and configuration for R Analytics
# Environments: localdev (192.168.0.85/192.168.0.106) and iafecs (Alibaba RDS)
# Author: Enhanced for IFRS9-IAF production deployment
# Date: Created for comprehensive environment management
# =============================================================================

#' R Analytics Environment Configuration Loader
#' @description Provides comprehensive environment detection and configuration for R Analytics
#' @export
RAFSEnvironmentLoader <- R6Class("RAFSEnvironmentLoader",

  private = list(
    # Cache configuration to avoid repeated environment detection
    config_cache = NULL,
    .cached_environment = NULL,

    # Load environment-specific configuration
    load_env_config = function(env_type) {
      if (env_type == "iafecs") {
        return(list(
          # IAF ECS Production Configuration
          deployment_target = "iafecs",
          environment_name = "IAF Production",
          node_env = "production",

          # Database Configuration (Alibaba Cloud RDS)
          database = list(
            platform = list(
              host = "pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com",
              port = 5432,
              user = "admin_iaf",
              password = "P@ssw0rd2025!",
              dbname = "ifrspro_platform_admin",
              ssl_mode = "require"
            ),
            frs9 = list(
              host = "pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com",
              port = 5432,
              user = "admin_iaf",
              password = "P@ssw0rd2025!",
              dbname = "FRS9PRO",
              ssl_mode = "require"
            ),
            ifrs9_analytics = list(
              host = "pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com",
              port = 5432,
              user = "admin_iaf",
              password = "P@ssw0rd2025!",
              dbname = "FRS9PRO",
              ssl_mode = "prefer"  # Changed from "require" to "prefer" for compatibility
            ),
            tenant_iaf = list(
              host = "pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com",
              port = 5432,
              user = "admin_iaf",
              password = "P@ssw0rd2025!",
              dbname = "ifrspro_tenant_iaf",
              ssl_mode = "require"
            )
          ),

          # Service URLs (Production HTTPS)
          urls = list(
            frontend = "https://ristix.bdo-ki.com",
    backend = "https://ristix.bdo-ki.com",
    api = "https://ristix.bdo-ki.com/api",
            r_analytics = "https://analytics-ristix.bdo-ki.com",
            r_analytics_api = "https://analytics-calc-ristix.bdo-ki.com"
          ),

          # Service Configuration
          services = list(
            r_analytics = list(
              dashboard_port = 4236,
              api_port = 4241,
              host = "0.0.0.0"
            )
          ),

          # Banking Configuration
          banking = list(
            type = "conventional",
            tenant_slug = "iaf",
            company_name = "Indonesia Airawata Finance"
          ),

          # Security Settings
          security = list(
            enable_ssl = TRUE,
            secure_cookies = TRUE,
            cors_origins = c("https://ristix.bdo-ki.com")
          ),

          # Feature Flags
          features = list(
            debug_mode = FALSE,
            logging_level = "INFO",
            offline_mode_fallback = TRUE,
            analytics_enabled = TRUE
          )
        ))
      } else {
        # Local Development Configuration
        return(list(
          # Local Development Environment
          deployment_target = "localdev",
          environment_name = "IAF Local Development",
          node_env = "development",

          # Database Configuration (Local Servers)
          database = list(
            platform = list(
              host = "192.168.0.85",
              port = 5432,
              user = "postgres",
              password = "postgres",
              dbname = "ifrspro_platform_admin",
              ssl_mode = "disable"
            ),
            frs9 = list(
              host = "192.168.0.106",
              port = 5433,
              user = "postgres",
              password = "postgres",
              dbname = "FRS9PRO",
              ssl_mode = "disable"
            ),
            ifrs9_analytics = list(
              host = "192.168.0.106",
              port = 5433,
              user = "postgres",
              password = "postgres",
              dbname = "FRS9PRO",
              ssl_mode = "disable"
            ),
            tenant_iaf = list(
              host = "192.168.0.85",
              port = 5432,
              user = "postgres",
              password = "postgres",
              dbname = "ifrspro_tenant_iaf",
              ssl_mode = "disable"
            )
          ),

          # Service URLs (Development HTTPS via Cloudflare)
          urls = list(
            frontend = "https://iaf-ifrs.ifrspro.id",
            backend = "https://iaf-ifrs-be.ifrspro.id",
            api = "https://iaf-ifrs-be.ifrspro.id/api",
            r_analytics = "https://iaf-ifrs-analytics.ifrspro.id",
            r_analytics_api = "https://iaf-ifrs-analytics-calc.ifrspro.id"
          ),

          # Service Configuration
          services = list(
            r_analytics = list(
              dashboard_port = 4236,
              api_port = 4241,
              host = "0.0.0.0"
            )
          ),

          # Banking Configuration
          banking = list(
            type = "conventional",
            tenant_slug = "iaf",
            company_name = "Indonesia Airawata Finance (Local Dev)"
          ),

          # Security Settings
          security = list(
            enable_ssl = FALSE,
            secure_cookies = FALSE,
            cors_origins = c("https://iaf-ifrs.ifrspro.id", "https://iaf-ifrs-be.ifrspro.id",
                           "https://iaf-ifrs-analytics.ifrspro.id", "https://iaf-ifrs-analytics-calc.ifrspro.id")
          ),

          # Feature Flags
          features = list(
            debug_mode = TRUE,
            logging_level = "DEBUG",
            offline_mode_fallback = TRUE,
            analytics_enabled = TRUE
          )
        ))
      }
    },

    # Detect environment automatically
    detect_environment = function() {
      # SILENT MODE: No debug output to prevent log corruption
      # Store environment detection result to avoid repeated detection
      if (!is.null(private$.cached_environment)) {
        return(private$.cached_environment)
      }

      deployment_target <- Sys.getenv("DEPLOYMENT_TARGET", "NOT_SET")
      node_env <- Sys.getenv("NODE_ENV", "NOT_SET")
      hostname <- Sys.getenv("HOSTNAME", "NOT_SET")
      pwd <- Sys.getenv("PWD", "NOT_SET")

      # Priority 1: DEPLOYMENT_TARGET environment variable (RESPECT EXPLICIT SETTING)
      if (deployment_target == "localdev") {
        private$.cached_environment <- "localdev"
        return(private$.cached_environment)
      }
      if (deployment_target == "iafecs") {
        private$.cached_environment <- "iafecs"
        return(private$.cached_environment)
      }

      # Priority 2: NODE_ENV environment variable (ONLY IF DEPLOYMENT_TARGET NOT SET)
      if (node_env == "production") {
        private$.cached_environment <- "iafecs"
        return(private$.cached_environment)
      }

      # Priority 3: ECS-specific detection methods (ONLY IF DEPLOYMENT_TARGET NOT SET)
      # Check for ECS metadata endpoint
      tryCatch({
        ecs_metadata_url <- "http://169.254.169.254/latest/meta-data/instance-id"
        response <- curl::curl_fetch_memory(ecs_metadata_url, handle = curl::new_handle(timeout = 2))
        if (response$status_code == 200) {
          private$.cached_environment <- "iafecs"
          return(private$.cached_environment)
        }
      }, error = function(e) {
        # Not on ECS, continue
      })

      # Priority 4: Hostname detection for ECS (enhanced patterns)
      ecs_patterns <- c("ecs|alibaba|10\\.18|ip-10-18|awslinux|ec2-user|root@ip-10-18")
      for (pattern in ecs_patterns) {
        if (grepl(pattern, hostname, ignore.case = TRUE)) {
          private$.cached_environment <- "iafecs"
          return(private$.cached_environment)
        }
      }

      # Priority 5: Working directory detection (ONLY IF DEPLOYMENT_TARGET NOT SET)
      if (grepl("projects/ifrs9-iaf", pwd, ignore.case = TRUE)) {
        private$.cached_environment <- "iafecs"
        return(private$.cached_environment)
      }

      # Priority 6: Network interface detection
      tryCatch({
        network_info <- system("ip addr show | grep 'inet 10\\.18'", intern = TRUE)
        if (length(network_info) > 0 && any(grepl("10\\.18", network_info))) {
          private$.cached_environment <- "iafecs"
          return(private$.cached_environment)
        }
      }, error = function(e) {
        # Network check failed, continue
      })

      # Priority 7: Check for .env.iafecs file existence
      if (file.exists(".env.iafecs")) {
        private$.cached_environment <- "iafecs"
        return(private$.cached_environment)
      }

      # Priority 8: User detection
      current_user <- Sys.getenv("USER", "")
      if (current_user == "root" && grepl("projects", pwd, ignore.case = TRUE)) {
        private$.cached_environment <- "iafecs"
        return(private$.cached_environment)
      }

      # Default: local development
      private$.cached_environment <- "localdev"
      return(private$.cached_environment)
    }
  ),

  public = list(

    #' Initialize environment loader
    #' @description Creates new environment loader instance
    initialize = function() {
      # Auto-detect environment on initialization
      env_type <- private$detect_environment()
      private$config_cache <- private$load_env_config(env_type)

      # Quiet initialization - configuration loading is now silent
    },

    #' Get current configuration
    #' @description Returns the current environment configuration
    #' @return List containing all configuration parameters
    getConfiguration = function() {
      invisible(private$config_cache)
    },

    #' Get database configuration
    #' @description Returns database configuration for specified database type
    #' @param db_type Database type (platform, frs9, ifrs9_analytics, tenant_iaf)
    #' @return Database configuration list
    getDatabaseConfig = function(db_type = "ifrs9_analytics") {
      if (!db_type %in% names(private$config_cache$database)) {
        stop(paste("Invalid database type:", db_type))
      }
      return(private$config_cache$database[[db_type]])
    },

    #' Get service URLs
    #' @description Returns all service URLs for current environment
    #' @return List of service URLs
    getServiceUrls = function() {
      return(private$config_cache$urls)
    },

    #' Get R Analytics service configuration
    #' @description Returns R Analytics specific configuration
    #' @return R Analytics configuration list
    getRAnalyticsConfig = function() {
      return(private$config_cache$services$r_analytics)
    },

    #' Get banking configuration
    #' @description Returns banking configuration for current environment
    #' @return Banking configuration list
    getBankingConfig = function() {
      return(private$config_cache$banking)
    },

    #' Get security configuration
    #' @description Returns security settings for current environment
    #' @return Security configuration list
    getSecurityConfig = function() {
      return(private$config_cache$security)
    },

    #' Get feature flags
    #' @description Returns feature flags for current environment
    #' @return Feature flags list
    getFeatureFlags = function() {
      return(private$config_cache$features)
    },

    #' Check if running in production
    #' @description Returns TRUE if running in production environment
    #' @return Boolean
    isProduction = function() {
      return(private$config_cache$deployment_target == "iafecs")
    },

    #' Check if debug mode is enabled
    #' @description Returns TRUE if debug mode is enabled
    #' @return Boolean
    isDebugMode = function() {
      return(private$config_cache$features$debug_mode)
    },

    #' Print current environment information
    #' @description Displays current environment configuration summary
    printEnvironmentInfo = function() {
      # Silent environment info to prevent log corruption
      if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
        cat("\n")
        cat(paste(rep("=", 60), collapse = ""))
        cat("\n🌐 R Analytics Environment Configuration\n")
        cat("Deployment Target:", private$config_cache$deployment_target, "\n")
        cat("Environment:", private$config_cache$environment_name, "\n")
        cat(paste(rep("=", 60), collapse = ""))
        cat("\n")
      }
    },

    #' Reload configuration with new environment
    #' @description Forces environment re-detection and configuration reload
    #' @param env_type Optional environment type (localdev or iafecs)
    reloadConfiguration = function(env_type = NULL) {
      if (is.null(env_type)) {
        env_type <- private$detect_environment()
      }
      private$config_cache <- private$load_env_config(env_type)
      # Silent reload to prevent log corruption
      if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
        cat("🔄 Configuration reloaded for environment:", env_type, "\n")
      }
    }
  )
)

# =============================================================================
# GLOBAL ENVIRONMENT LOADER INSTANCE
# =============================================================================

# Create global environment loader instance with lazy initialization
# This will be available throughout the R Analytics application
rafse_env_loader <- NULL

getRAFSEnvironmentLoader <- function() {
  if (is.null(rafse_env_loader)) {
    rafse_env_loader <- RAFSEnvironmentLoader$new()
  }
  return(rafse_env_loader)
}

# Export configuration functions for backward compatibility
#' Get R Analytics Environment Configuration
#' @description Returns current environment configuration (backward compatibility)
#' @return Configuration list
getRAFSEnvironment <- function() {
  loader <- getRAFSEnvironmentLoader()
  invisible(loader$getConfiguration())
}

#' Get Database Configuration (Backward Compatibility)
#' @description Returns database configuration for specified type
#' @param db_type Database type
#' @return Database configuration list
getRAnalyticsDatabaseConfig <- function(db_type = "ifrs9_analytics") {
  loader <- getRAFSEnvironmentLoader()
  return(loader$getDatabaseConfig(db_type))
}

#' Check if Production Environment
#' @description Returns TRUE if running in production
#' @return Boolean
isProductionEnvironment <- function() {
  loader <- getRAFSEnvironmentLoader()
  return(loader$isProduction())
}

# =============================================================================
# END OF ENVIRONMENT LOADER
# =============================================================================