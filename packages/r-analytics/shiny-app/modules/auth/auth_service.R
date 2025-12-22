# =============================================================================
# AUTHENTICATION SERVICE MODULE
# =============================================================================
# Purpose: Main authentication service for R Analytics Shiny application
# Integration: Works with backend API and provides session management
# Environment: Can be enabled/disabled via configuration
# =============================================================================

# Load required libraries
library(R6)
library(shinyjs)

# Source dependencies
if (file.exists("modules/auth/auth_api.R")) {
  source("modules/auth/auth_api.R")
} else if (file.exists("../../modules/auth/auth_api.R")) {
  source("../../modules/auth/auth_api.R")
}

# Note: centralized-config.R is already loaded in global.R
# Do NOT load it again here to avoid duplicate database connections

#' Authentication Service
#' @description Main authentication service for R Analytics application
AuthenticationService <- R6Class("AuthenticationService",

  private = list(
    # Configuration
    config = NULL,
    # Authentication API
    api = NULL,
    # Current authentication state
    is_auth_enabled = FALSE,
    # Current user session
    current_user = NULL,
    # Session observer
    session_observer = NULL,

    # Initialize development mode if auth is disabled
    initialize_dev_mode = function() {
      private$current_user <- list(
        id = "dev-user-001",
        email = "admin@iaf.co.id",
        name = "IAF Administrator",
        role = "IAF_TENANT_SUPERADMIN",
        permissions = c(
          "home_access", "data_access", "model_access", "forecast_access", "pd_afl_access",
          "data_upload", "data_delete", "model_create", "model_delete", "forecast_run",
          "export_data", "admin_settings"
        ),
        tenant_id = "iaf",
        is_development = TRUE
      )
    },

    # Setup session observers
    setup_session_observers = function() {
      # Create session observer for automatic token refresh
      private$session_observer <- observe({
        # Check token validity periodically
        if (private$is_authenticated()) {
          if (!private$api$is_authenticated()) {
            # Token expired, logout user
            private$logout_user()
          }
        }
      }, interval = 5 * 60 * 1000) # Check every 5 minutes

      # Setup JavaScript handlers for login/logout
      shinyjs::runjs("
        // Login handler
        window.rAnalyticsLogin = function(credentials) {
          Shiny.setInputValue('login_credentials', credentials, {priority: 'event'});
        };

        // Logout handler
        window.rAnalyticsLogout = function() {
          Shiny.setInputValue('logout_request', true, {priority: 'event'});
        };
      ")
    },

    # Logout user
    logout_user = function() {
      if (private$is_auth_enabled) {
        private$api$logout()
      }
      private$current_user <- NULL

      # Clear session storage
      shinyjs::runjs("sessionStorage.removeItem('r_analytics_user');")

      # Trigger UI update
      session$sendCustomMessage(type = "auth_logout", data = list())
    },

    # Save user session to storage
    save_user_session = function() {
      if (private$is_authenticated() && !private$current_user$is_development) {
        user_data <- list(
          user = private$current_user,
          jwt_token = private$api$get_jwt_token(),
          timestamp = Sys.time()
        )

        shinyjs::runjs(paste0(
          "sessionStorage.setItem('r_analytics_user', JSON.stringify(",
          toJSON(user_data, auto_unbox = TRUE),
          "));"
        ))
      }
    },

    # Load user session from storage
    load_user_session = function() {
      if (private$is_auth_enabled) {
        shinyjs::runjs("
          var userData = sessionStorage.getItem('r_analytics_user');
          if (userData) {
            Shiny.setInputValue('session_data', JSON.parse(userData), {priority: 'event'});
          } else {
            Shiny.setInputValue('session_data', null, {priority: 'event'});
          }
        ")
      }
    }
  ),

  public = list(
    # Initialize authentication service
    initialize = function() {
      # Get configuration
      private$config <- get_config_manager()$get_config()
      private$is_auth_enabled <- private$config$security$enable_auth

      if (private$is_auth_enabled) {
        # Initialize API service
        private$api <- AuthenticationAPI$new(private$config)

        # Setup session observers
        private$setup_session_observers()

        # Try to restore session
        private$load_user_session()
      } else {
        # Development mode
        private$initialize_dev_mode()
      }
    },

    # Login user
    login = function(email, password, tenant_id = NULL) {
      if (!private$is_auth_enabled) {
        return(list(success = FALSE, message = "Authentication is disabled in development mode"))
      }

      result <- private$api$login(email, password, tenant_id)

      if (result$success) {
        private$current_user <- result$user
        private$save_user_session()

        # Trigger UI update
        session$sendCustomMessage(type = "auth_login", data = list(
          user = private$current_user,
          permissions = private$current_user$permissions
        ))

        return(result)
      } else {
        return(result)
      }
    },

    # Logout user
    logout = function() {
      private$logout_user()
      return(list(success = TRUE, message = "Logged out successfully"))
    },

    # Check if user is authenticated
    is_authenticated = function() {
      if (!private$is_auth_enabled) {
        return(TRUE) # Always authenticated in dev mode
      }
      return(private$api$is_authenticated())
    },

    # Get current user
    get_current_user = function() {
      return(private$current_user)
    },

    # Check if user has specific permission
    has_permission = function(permission) {
      if (!private$is_authenticated()) {
        return(FALSE)
      }

      if (!private$is_auth_enabled) {
        return(TRUE) # All permissions in dev mode
      }

      return(private$api$has_permission(permission))
    },

    # Check if user has specific role
    has_role = function(role_name) {
      if (!private$is_authenticated()) {
        return(FALSE)
      }

      if (!private$is_auth_enabled) {
        return(TRUE) # All roles in dev mode
      }

      return(private$api$has_role(role_name))
    },

    # Get user roles
    get_user_roles = function() {
      if (!private$is_authenticated()) {
        return(character(0))
      }

      if (!private$is_auth_enabled) {
        return("IAF_TENANT_SUPERADMIN")
      }

      user <- private$api$get_current_user()
      if (!is.null(user$roles)) {
        return(sapply(user$roles, function(role) role$roleName))
      }
      return(character(0))
    },

    # Check authentication mode
    is_auth_enabled = function() {
      return(private$is_auth_enabled)
    },

    # Get configuration
    get_config = function() {
      return(list(
        enabled = private$is_auth_enabled,
        current_user = private$current_user,
        is_authenticated = private$is_authenticated()
      ))
    },

    # Restore session from stored data
    restore_session = function(session_data) {
      if (!is.null(session_data) && private$is_auth_enabled) {
        tryCatch({
          private$current_user <- session_data$user
          private$api <- AuthenticationAPI$new(private$config)
          # Set the JWT token in API (would need to add this method to API class)
          return(TRUE)
        }, error = function(e) {
          return(FALSE)
        })
      }
      return(FALSE)
    }
  )
)