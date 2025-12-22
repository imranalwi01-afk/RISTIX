# =============================================================================
# AUTHENTICATION SERVER MODULE
# =============================================================================
# Purpose: Server-side logic for authentication in Shiny application
# Integration: Handles authentication events and session management
# Environment: Works with authentication service and UI modules
# =============================================================================

# Load required libraries
library(shiny)
library(R6)

# Source dependencies
source("modules/auth/auth_service.R")
source("modules/auth/auth_ui.R")

#' Authentication Server Module
#' @description Server-side logic for authentication system
AuthenticationServerModule <- R6Class("AuthenticationServerModule",

  private = list(
    # Authentication service
    auth_service = NULL,
    # Authentication UI
    auth_ui = NULL,
    # Session data
    session_data = NULL,

    # Handle login event
    handle_login = function(input, output, session) {
      # Get login credentials
      email <- input$login_email
      password <- input$login_password
      tenant_id <- input$login_tenant_id

      # Basic validation
      if (is.null(email) || is.null(password) || email == "" || password == "") {
        showNotification("Please enter email and password", type = "error", duration = 5)
        return(FALSE)
      }

      # Attempt login
      result <- private$auth_service$login(email, password, tenant_id)

      if (result$success) {
        showNotification("Login successful!", type = "success", duration = 3)
        return(TRUE)
      } else {
        showNotification(result$message %||% "Login failed", type = "error", duration = 5)
        return(FALSE)
      }
    },

    # Handle logout event
    handle_logout = function(input, output, session) {
      result <- private$auth_service$logout()

      if (result$success) {
        showNotification("Logged out successfully", type = "info", duration = 3)
      }
      return(result)
    },

    # Show notification
    showNotification = function(message, type = "default", duration = 5) {
      # Create notification UI
      notification_html <- div(
        class = paste0("alert alert-", type, "notification"),
        p(message),
        style = "position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;",
        tags$script("setTimeout(function() { $('.notification').fadeOut(); }, " , duration * 1000, ");")
      )

      # Add notification to page
      insertUI("#", "afterBegin", notification_html)
    },

    # Check user permissions for UI elements
    check_permission = function(permission) {
      return(private$auth_service$has_permission(permission))
    },

    # Check user roles for UI elements
    check_role = function(role_name) {
      return(private$auth_service$has_role(role_name))
    },

    # Filter UI elements based on permissions
    filter_ui_by_permission = function(ui_elements, required_permission) {
      if (private$auth_service$has_permission(required_permission)) {
        return(ui_elements)
      } else {
        return(div())
      }
    }
  ),

  public = list(
    # Initialize server module
    initialize = function(input, output, session) {
      # Initialize authentication service
      private$auth_service <- AuthenticationService$new()

      # Initialize UI module
      private$auth_ui <- AuthenticationUIModule$new(private$auth_service)

      # Setup JavaScript handlers
      private$auth_ui$setup_js_handlers()

      # Store session data in reactive values
      output$auth_status <- reactiveVal({
        private$auth_service$get_config()
      }, env = session)

      output$login_form_ui <- reactive({
        private$auth_ui$get_login_ui()
      })

      output$user_info_ui <- reactive({
        private$auth_ui$get_user_info_ui()
      })

      output$auth_status_ui <- reactive({
        private$auth_ui$get_auth_status_ui()
      })

      # Setup session data restoration
      observeEvent(input$session_data, {
        private$session_data <- input$session_data
        if (!is.null(private$session_data)) {
          private$auth_service$restore_session(private$session_data)
        }
      }, ignoreNULL = FALSE)

      # Session data for restoration
      output$session_data <- reactiveVal(NULL)
    },

    # Render login form
    render_login_form = function() {
      return(renderUI({
        private$auth_ui$get_login_ui()
      }))
    },

    # Render user info
    render_user_info = function() {
      return(renderUI({
        private$auth_ui$get_user_info_ui()
      }))
    },

    # Render authentication status
    render_auth_status = function() {
      return(renderUI({
        private$auth_ui$get_auth_status_ui()
      }))
    },

    # Render sidebar user info
    render_sidebar_user = function() {
      return(renderUI({
        private$auth_ui$get_sidebar_user_ui()
      }))
    },

    # Setup event handlers for the server
    setup_event_handlers = function(input, output, session) {
      # Handle login button click
      observeEvent(input$login_button, {
        isolate({
          login_success <- private$handle_login(input, output, session)
          if (login_success) {
            # Trigger UI update
            session$sendCustomMessage(type = "auth_success", data = list())
          }
        })
      })

      # Handle logout button click
      observeEvent(input$logout_button, {
        isolate({
          private$handle_logout(input, output, session)
          # Trigger UI update
          session$sendCustomMessage(type = "auth_logout", data = list())
        })
      })
    }

    # Handle logout request from JavaScript
    observeEvent(input$logout_request, {
      isolate({
        if (input$logout_request) {
          private$handle_logout(input, output, session)
        }
      })
    },

    # Handle login credentials from JavaScript
    observeEvent(input$login_credentials, {
      isolate({
        if (!is.null(input$login_credentials)) {
          # Update input fields
          updateTextInput(session, "login_email", value = input$login_credentials$email)
          updateTextInput(session, "login_password", value = input$login_credentials$password)
          updateTextInput(session, "login_tenant", value = input$login_credentials$tenant_id %||% "")

          # Trigger login
          updateActionButton(session, "login_button", label = "Logging in...")
          login_success <- private$handle_login(input, output, session)
          if (login_success) {
            session$sendCustomMessage(type = "auth_success", data = list())
          }
        }
      })
    }),

    # Permission-based UI rendering helpers
    render_if_permission = function(ui_elements, required_permission) {
      return(private$filter_ui_by_permission(ui_elements, required_permission))
    },

    # Check if user is authenticated
    is_authenticated = function() {
      return(private$auth_service$is_authenticated())
    },

    # Check if user has permission
    has_permission = function(permission) {
      return(private$check_permission(permission))
    },

    # Check if user has role
    has_role = function(role_name) {
      return(private$check_role(role_name))
    },

    # Get current user
    get_current_user = function() {
      return(private$auth_service$get_current_user())
    },

    # Get user roles
    get_user_roles = function() {
      return(private$auth_service$get_user_roles())
    },

    # Get authentication configuration
    get_auth_config = function() {
      return(private$auth_service$get_config())
    }
  )
)