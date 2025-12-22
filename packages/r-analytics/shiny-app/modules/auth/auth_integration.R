# =============================================================================
# AUTHENTICATION INTEGRATION MODULE
# =============================================================================
# Purpose: Integration module for authentication system with main app
# Integration: Provides easy integration functions for app.R
# Environment: Works with Shiny application modules
# =============================================================================

# Load required libraries
library(shiny)
library(R6)

# Source authentication modules
if (file.exists("modules/auth/auth_server.R")) {
  source("modules/auth/auth_server.R")
} else if (file.exists("../../modules/auth/auth_server.R")) {
  source("../../modules/auth/auth_server.R")
}

#' Authentication Integration
#' @description Easy integration functions for authentication system
AuthenticationIntegration <- R6Class("AuthenticationIntegration",

  private = list(
    # Authentication server module
    auth_server = NULL
  ),

  public = list(
    # Initialize authentication
    initialize = function(input, output, session) {
      private$auth_server <- AuthenticationServerModule$new()
      private$auth_server$initialize(input, output, session)
    },

    # Check if user is authenticated
    is_authenticated = function() {
      return(private$auth_server$is_authenticated())
    },

    # Get current user
    get_current_user = function() {
      return(private$auth_server$get_current_user())
    },

    # Get user roles
    get_user_roles = function() {
      return(private$auth_server$get_user_roles())
    },

    # Check user permissions
    has_permission = function(permission) {
      return(private$auth_server$has_permission(permission))
    },

    # Check user role
    has_role = function(role_name) {
      return(private$auth_server$has_role(role_name))
    },

    # Render authentication sidebar user
    render_sidebar_user = function() {
      return(private$auth_server$render_sidebar_user())
    },

    # Render login form
    render_login_form = function() {
      return(private$auth_server$render_login_form())
    },

    # Render user info
    render_user_info = function() {
      return(private$auth_server$render_user_info())
    },

    # Render authentication status
    render_auth_status = function() {
      return(private$auth_server$render_auth_status())
    },

    # Render UI elements with permission check
    render_if_authenticated = function(ui_elements) {
      return(renderUI({
        conditionalPanel(
          condition = private$auth_server$is_authenticated(),
          ui_elements
        )
      }))
    },

    # Render UI elements with role check
    render_if_role = function(ui_elements, required_role) {
      return(private$auth_server$render_if_permission(
        ui_elements,
        paste0("role_", required_role)
      ))
    },

    # Render UI elements with permission check
    render_if_permission = function(ui_elements, required_permission) {
      return(private$auth_server$render_if_permission(
        ui_elements,
        required_permission
      ))
    },

    # Create access controlled tab
    create_access_controlled_tab = function(
      tab_name,
      icon = NULL,
      ui_content,
      required_permissions = NULL,
      required_roles = NULL
    ) {
      return(
        conditionalPanel(
          condition = {
            # Check if authenticated
            if (!private$auth_server$is_authenticated()) {
              return(FALSE)
            }

            # Check permissions if specified
            if (!is.null(required_permissions)) {
              return(all(sapply(required_permissions, function(perm) {
                private$auth_server$has_permission(perm)
              })))
            }

            # Check roles if specified
            if (!is.null(required_roles)) {
              return(any(sapply(required_roles, function(role) {
                private$auth_server$has_role(role)
              })))
            }

            return(TRUE)
          },
          value = ui_content
        )
      )
    },

    # Create access controlled output
    create_access_controlled_output = function(
      output_id,
      output_expr,
      required_permissions = NULL,
      required_roles = NULL
    ) {
      return({
        output[[output_id]] <- renderText({
          # Check if authenticated
          if (!private$auth_server$is_authenticated()) {
            return("Access denied: Please login to view this content")
          }

          # Check permissions if specified
          if (!is.null(required_permissions)) {
            if (!all(sapply(required_permissions, function(perm) {
              private$auth_server$has_permission(perm)
            }))) {
              return("Access denied: Insufficient permissions")
            }
          }

          # Check roles if specified
          if (!is.null(required_roles)) {
            if (!any(sapply(required_roles, function(role) {
              private$auth_server$has_role(role)
            }))) {
              return("Access denied: Insufficient role")
            }
          }

          # Execute the output expression
          output_expr()
        })
      })
    },

    # Get authentication configuration
    get_config = function() {
      return(private$auth_server$get_auth_config())
    }
  )
)