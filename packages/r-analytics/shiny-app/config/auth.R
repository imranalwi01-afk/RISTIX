# =============================================================================
# USER AUTHENTICATION & ROLE-BASED ACCESS MODULE
# =============================================================================
# Purpose: User authentication and role-based access control for R Analytics
# Integration: Works with IAF frontend banking application
# Centralized Control: Can be enabled/disabled via environment configuration
# =============================================================================

# Load required libraries
library(R6)

# Source centralized configuration first
if (!exists("config_manager")) {
  if (file.exists("config/centralized-config.R")) {
    source("config/centralized-config.R")
  } else if (file.exists("../config/centralized-config.R")) {
    source("../config/centralized-config.R")
  }
}

# Source centralized authentication configuration (only if not already loaded)
if (!exists("is_auth_required")) {
  if (file.exists("config/auth-config.R")) {
    source("config/auth-config.R")
  } else if (file.exists("../config/auth-config.R")) {
    source("../config/auth-config.R")
  }
}

# Load IAF-specific authentication configuration
if (file.exists("config/auth-iaf-config.R")) {
  source("config/auth-iaf-config.R")
}

# Initialize global authentication configuration with fallback
if (!exists("auth_config")) {
  if (exists("get_auth_config") && is.function(get_auth_config)) {
    auth_config <<- get_auth_config()
  } else {
    # Fallback configuration if get_auth_config is not available
    auth_config <<- list(
      enabled = as.logical(Sys.getenv("ENABLE_AUTH", "false")),
      debug_mode = as.logical(Sys.getenv("DEBUG_MODE", "true")),
      auth_backend_url = Sys.getenv("AUTH_BACKEND_URL", "https://iaf-ifrs-be.ifrspro.id"),
      auth_timeout = as.integer(Sys.getenv("AUTH_TIMEOUT", "30")),
      # Use IAF R Analytics user as default
      dev_user = if (exists("IAF_R_ANALYTICS_USER")) IAF_R_ANALYTICS_USER else list(
        id = "dev-user-001",
        email = "ranalytics@iaf.co.id",
        name = "IAF R Analytics Administrator",
        role = "IAF_TENANT_SUPERADMIN",
        tenant_id = "iaf",
        permissions = c(
          "dashboard.view",
          "data.upload", "data.download", "data.process",
          "model.create", "model.run", "model.view", "model.export",
          "forecast.run", "forecast.view", "forecast.export",
          "analytics.full_access",
          "admin.users", "admin.system",
          "data_upload", "data_delete", "model_create", "model_delete",
          "forecast_run", "export_data", "admin_settings"
        )
      ),
      validate_permissions = FALSE
    )
  }
}

#' User Authentication Module
#' @description Provides user authentication and role-based access control
UserAuthModule <- R6Class("UserAuthModule",

  private = list(
    # User session storage
    current_user = NULL,
    # Session reference to avoid locked environment issues
    session_ref = NULL,

    # Available roles and permissions
    role_permissions = list(
      "IAF_TENANT_SUPERADMIN" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "data_upload", "data_delete", "model_create", "model_delete", "forecast_run",
        "export_data", "admin_settings"
      ),
      "IAF_TENANT_ADMIN" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "data_upload", "data_delete", "model_create", "model_delete", "forecast_run",
        "export_data"
      ),
      "IAF_BANK_CRO" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "data_upload", "forecast_run", "export_data"
      ),
      "IAF_IFRS_MANAGER" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "model_create", "model_delete", "forecast_run", "export_data"
      ),
      "IAF_RISK_ANALYST" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "forecast_run", "export_data"
      ),
      "IAF_PORTFOLIO_MANAGER" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "forecast_run", "export_data"
      ),
      "IAF_DATA_ADMIN" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "data_upload", "data_delete", "export_data"
      ),
      "IAF_REPORT_ANALYST" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "export_data"
      ),
      "IAF_AUDITOR" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "export_data"
      ),
      "IAF_VIEWER" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access"
      ),
      "PLATFORM_SUPER_ADMIN" = c(
        "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
        "admin_settings", "user_management", "tenant_management"
      )
    )
  ),

  public = list(

    #' Initialize User Authentication Module
    #' @param session Shiny session object
    initialize = function(session) {
      # Store session reference in private environment to avoid locked environment issues
      private$session_ref <- session
      private$current_user <- NULL

      # Check if authentication is required
      is_auth_required_func <- get("is_auth_required", envir = .GlobalEnv, inherits = FALSE)
      if (!is.function(is_auth_required_func)) {
        private$log_auth("error", "is_auth_required function not found")
        return(FALSE)
      }

      if (!is_auth_required_func()) {
        # Authentication is disabled, use development user context
        if (auth_config$debug_mode && !exists(".auth_dev_context_shown", envir = .GlobalEnv)) {
          cat("🔓 Authentication disabled - Using development context\n")
          assign(".auth_dev_context_shown", TRUE, envir = .GlobalEnv)
        }

        get_dev_user_context_func <- get("get_dev_user_context", envir = .GlobalEnv, inherits = FALSE)
        if (is.function(get_dev_user_context_func)) {
          private$current_user <- get_dev_user_context_func()
          private$current_user$permissions <- self$get_role_permissions(private$current_user$role)

          log_user_context_func <- get("log_user_context", envir = .GlobalEnv, inherits = FALSE)
          if (is.function(log_user_context_func) && !exists(".user_context_logged", envir = .GlobalEnv)) {
            log_user_context_func(private$current_user, "Development User Context")
            assign(".user_context_logged", TRUE, envir = .GlobalEnv)
          }
        } else {
          private$log_auth("error", "get_dev_user_context function not found")
        }
      } else {
        # Authentication is enabled, try to get user context from URL parameters or headers
        if (auth_config$debug_mode) {
          cat("🔐 Authentication enabled - Loading user context\n")
        }
        self$load_user_context()
      }

      invisible(self)
    },

    #' Load User Context from Frontend
    load_user_context = function() {
      tryCatch({
        # Get user context from URL parameters (passed from IAF frontend)
        user_id <- private$session_ref$request$GET[["user_id"]]
        user_email <- private$session_ref$request$GET[["user_email"]]
        user_name <- private$session_ref$request$GET[["user_name"]]
        user_role <- private$session_ref$request$GET[["user_role"]]
        tenant_id <- private$session_ref$request$GET[["tenant_id"]]

        # Fallback to session storage if URL parameters not available
        if (is.null(user_id) || user_id == "") {
          user_id <- private$session_ref$userData[["user_id"]]
          user_email <- private$session_ref$userData[["user_email"]]
          user_name <- private$session_ref$userData[["user_name"]]
          user_role <- private$session_ref$userData[["user_role"]]
          tenant_id <- private$session_ref$userData[["tenant_id"]]
        }

        # Set current user if information is available
        if (!is.null(user_id) && user_id != "") {
          private$current_user <- list(
            id = user_id,
            email = user_email,
            name = user_name,
            role = user_role,
            tenant_id = tenant_id,
            permissions = self$get_role_permissions(user_role)
          )

          # Validate user context if validation is enabled
          validate_user_context_func <- get("validate_user_context", envir = .GlobalEnv, inherits = FALSE)
          if (is.function(validate_user_context_func)) {
            if (!validate_user_context_func(private$current_user)) {
              private$current_user <- NULL
              return()
            }
          } else {
            private$log_auth("warning", "validate_user_context function not found - skipping validation")
          }

          # Store in session for persistence
          private$session_ref$userData <- list(
            user_id = user_id,
            user_email = user_email,
            user_name = user_name,
            user_role = user_role,
            tenant_id = tenant_id
          )

          # Log user access
          self$log_user_access()
        }

      }, error = function(error) {
        cat("Error loading user context:", error$message, "\n")
      })
    },

    #' Get Permissions for Role
    get_role_permissions = function(role) {
      # Check if role exists and is not empty
      if (is.null(role) || length(role) == 0 || role == "") {
        # Default minimal permissions for missing role
        return(c("home_access", "view_only"))
      }

      if (role %in% names(private$role_permissions)) {
        return(private$role_permissions[[role]])
      } else {
        # Default minimal permissions for unknown role
        if (exists("auth_config") && !is.null(auth_config) && auth_config$debug_mode) {
          cat("⚠️ Unknown role:", role, "- using default permissions\n")
        }
        return(c("home_access", "view_only"))
      }
    },

    #' Check User Permission
    has_permission = function(permission) {
      if (is.null(private$current_user)) {
        return(FALSE)
      }

      return(permission %in% private$current_user$permissions)
    },

    #' Check if User is Authenticated
    is_authenticated = function() {
      return(!is.null(private$current_user))
    },

    #' Get Current User Information
    get_current_user = function() {
      return(private$current_user)
    },

    #' Get User Display Name
    get_user_display_name = function() {
      if (is.null(private$current_user)) {
        return("Guest User")
      }

      if (!is.null(private$current_user$name) && private$current_user$name != "") {
        return(private$current_user$name)
      }

      return(private$current_user$email)
    },

    #' Check if User Can Access Module
    can_access_module = function(module_name) {
      module_permissions <- paste0(module_name, "_access")
      return(self$has_permission(module_permissions))
    },

    #' Get Available Modules for User
    get_available_modules = function() {
      if (!self$is_authenticated()) {
        return(c("home"))  # Only home module for guests
      }

      available_modules <- c()

      # Check each module permission
      if (self$can_access_module("home")) {
        available_modules <- c(available_modules, "home")
      }
      if (self$can_access_module("data")) {
        available_modules <- c(available_modules, "data")
      }
      if (self$can_access_module("model")) {
        available_modules <- c(available_modules, "model")
      }
      if (self$can_access_module("forecast")) {
        available_modules <- c(available_modules, "forecast")
      }
      if (self$can_access_module("pd_afl")) {
        available_modules <- c(available_modules, "pd_afl")
      }

      return(available_modules)
    },

    #' Log User Access
    log_user_access = function() {
      if (self$is_authenticated()) {
        cat("User Access Log:\n")
        cat("  User ID:", private$current_user$id, "\n")
        cat("  Email:", private$current_user$email, "\n")
        cat("  Name:", private$current_user$name, "\n")
        cat("  Role:", private$current_user$role, "\n")
        cat("  Tenant ID:", private$current_user$tenant_id, "\n")
        cat("  Permissions:", paste(private$current_user$permissions, collapse = ", "), "\n")
        cat("  Timestamp:", format(Sys.time(), "%Y-%m-%d %H:%M:%S"), "\n")
      }
    },

    #' Create Access Denied UI
    create_access_denied_ui = function() {
      div(
        style = "display: flex; justify-content: center; align-items: center; height: 60vh; flex-direction: column;",
        div(
          style = "text-align: center; padding: 20px;",
          h4(style = "color: #d32f2f; margin-bottom: 20px;", "Access Denied"),
          p("You don't have permission to access this module."),
          p(style = "font-size: 14px; color: #666;",
             "Please contact your system administrator if you believe this is an error."),
          br(),
          actionButton("refresh", "Refresh Session",
                      class = "btn btn-warning",
                      onclick = "location.reload();")
        )
      )
    },

    #' Create Guest User UI
    create_guest_ui = function() {
      if (is.function(is_auth_required) && !is_auth_required()) {
        # Authentication is disabled, show development mode message
        div(
          style = "display: flex; justify-content: center; align-items: center; height: 40vh; flex-direction: column;",
          div(
            style = "text-align: center; padding: 20px;",
            h4(style = "color: #4caf50; margin-bottom: 15px;", "Development Mode"),
            p("Authentication is disabled in development mode."),
            p(style = "font-size: 14px; color: #666;",
               "The R Analytics dashboard is running with full access for testing."),
            br(),
            div(style = "background: #f5f5f5; padding: 10px; border-radius: 4px; text-align: left;",
              strong("Authentication Status:"), paste0(if (is.function(get_auth_status)) get_auth_status()$auth_enabled else "N/A"), br(),
              strong("Auth Required:"), paste0(if (is.function(get_auth_status)) get_auth_status()$auth_required else "N/A"), br(),
              strong("Development Mode:"), paste0(if (is.function(get_auth_status)) get_auth_status()$dev_mode else "N/A")
            )
          )
        )
      } else {
        # Authentication is enabled, show login required message
        div(
          style = "display: flex; justify-content: center; align-items: center; height: 60vh; flex-direction: column;",
          div(
            style = "text-align: center; padding: 20px;",
            h4(style = "color: #ff9800; margin-bottom: 20px;", "Authentication Required"),
            p("Please log in to access the IFRS9 Analytics Dashboard."),
            p(style = "font-size: 14px; color: #666;",
               "Use the IAF Banking Application to access this dashboard."),
            br(),
            actionButton("refresh", "Refresh Session",
                        class = "btn btn-info",
                        onclick = "location.reload();")
          )
        )
      }
    }
  )
)

#' Initialize Global User Authentication
#' @description Creates global user authentication instance
#' @param session Shiny session object
initialize_user_auth <- function(session) {
  return(UserAuthModule$new(session))
}