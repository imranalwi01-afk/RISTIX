# =============================================================================
# AUTHENTICATION SERVER MODULE
# =============================================================================
# Purpose: Server-side logic for authentication system in Shiny
# Integration: Handles authentication events and state management
# Environment: Works with Shiny server logic and reactive expressions
# =============================================================================

# Load required libraries
library(shiny)
library(R6)
library(jsonlite)

#' Authentication Server Module
#' @description Server-side logic for authentication system
AuthenticationServerModule <- R6Class("AuthenticationServerModule",

  private = list(
    # Authentication service instance
    auth_service = NULL,

    # Authentication UI instance
    auth_ui = NULL,

    # Initialize logging
    log_action = function(action, details = NULL) {
      if (!is.null(private$auth_service) && private$auth_service$is_debug_mode()) {
        cat("🔐 AuthServer:", action)
        if (!is.null(details)) {
          cat(" -", paste(details, collapse = ", "))
        }
        cat("\n")
      }
    },

    # Handle login attempt
    handle_login = function(input, output, session) {
      email <- input$login_email
      password <- input$login_password
      tenant_id <- input$login_tenant_id

      private$log_action("Login attempt", list(email = email, tenant = tenant_id))

      # Validate input
      if (is.null(email) || is.null(password) || email == "" || password == "") {
        showNotification("Email and password are required", type = "error", duration = 5)
        return(FALSE)
      }

      # Attempt login
      login_result <- private$auth_service$login(email, password, tenant_id)

      if (login_result$success) {
        showNotification("Login successful", type = "success", duration = 3)
        private$log_action("Login successful", list(email = email))
        return(TRUE)
      } else {
        showNotification(login_result$error, type = "error", duration = 5)
        private$log_action("Login failed", list(email = email, error = login_result$error))
        return(FALSE)
      }
    },

    # Handle logout
    handle_logout = function(input, output, session) {
      private$log_action("Logout attempt")

      logout_result <- private$auth_service$logout()

      if (logout_result$success) {
        showNotification("Logged out successfully", type = "success", duration = 3)
        private$log_action("Logout successful")

        # Clear form fields
        updateTextInput(session, "login_email", value = "")
        updateTextInput(session, "login_password", value = "")
        updateTextInput(session, "login_tenant_id", value = "")

        return(TRUE)
      } else {
        showNotification("Logout failed", type = "error", duration = 5)
        private$log_action("Logout failed", list(error = logout_result$error))
        return(FALSE)
      }
    }
  ),

  public = list(
    # Initialize authentication server module
    initialize = function() {
      private$log_action("Initializing Authentication Server Module")

      # Initialize dependencies
      if (!exists("AuthenticationService")) {
        source("modules/auth/auth_service.R")
      }

      if (!exists("AuthenticationUI")) {
        source("modules/auth/auth_ui.R")
      }

      private$auth_service <- AuthenticationService$new()
      private$auth_ui <- AuthenticationUI$new()

      private$log_action("Authentication Server Module initialized")
    },

    # Setup all authentication-related server logic
    setup_server_logic = function(input, output, session) {
      private$log_action("Setting up server logic")

      # Setup event handlers
      self$setup_event_handlers(input, output, session)

      # Setup reactive authentication data
      self$setup_reactive_auth_data(input, output, session)

      # Setup authentication status handlers
      self$setup_auth_status_handlers(input, output, session)

      private$log_action("Server logic setup complete")
    },

    # Setup event handlers for authentication
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

      private$log_action("Event handlers configured")
    },

    # Setup reactive authentication data
    setup_reactive_auth_data = function(input, output, session) {
      # Reactive authentication status
      auth_status <- reactive({
        return(list(
          authenticated = private$auth_service$is_authenticated(),
          user = private$auth_service$get_current_user(),
          roles = private$auth_service$get_user_roles(),
          permissions = private$auth_service$get_permissions()
        ))
      })

      # Export reactive values
      return(list(
        auth_status = auth_status
      ))
    },

    # Setup authentication status handlers
    setup_auth_status_handlers = function(input, output, session) {
      # Handle JavaScript authentication status requests
      observeEvent(input$get_auth_status, {
        isolate({
          if (!is.null(input$get_auth_status) && input$get_auth_status) {
            auth_status <- private$auth_service$get_config()
            session$sendCustomMessage(type = "auth_status_response", data = auth_status)
          }
        })
      })
    },

    # Check if user is authenticated
    is_authenticated = function() {
      return(private$auth_service$is_authenticated())
    },

    # Get current user
    get_current_user = function() {
      return(private$auth_service$get_current_user())
    },

    # Get user roles
    get_user_roles = function() {
      return(private$auth_service$get_user_roles())
    },

    # Get user permissions
    get_permissions = function() {
      return(private$auth_service$get_permissions())
    },

    # Check if user has specific permission
    has_permission = function(permission) {
      return(private$auth_service$has_permission(permission))
    },

    # Check if user has specific role
    has_role = function(role_name) {
      return(private$auth_service$has_role(role_name))
    },

    # Render sidebar user information
    render_sidebar_user = function() {
      return(renderUI({
        private$auth_ui$get_sidebar_user_ui()
      }))
    },

    # Render login form
    render_login_form = function() {
      return(renderUI({
        private$auth_ui$get_login_form_ui()
      }))
    },

    # Render user information
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

    # Render UI elements with permission check
    render_if_authenticated = function(ui_elements) {
      return(renderUI({
        conditionalPanel(
          condition = "output.auth_authenticated",
          ui_elements
        )
      }))
    },

    # Render UI elements with role check
    render_if_role = function(ui_elements, required_role) {
      return(self$render_if_permission(ui_elements, paste0("role_", required_role)))
    },

    # Render UI elements with permission check
    render_if_permission = function(ui_elements, required_permission) {
      return(renderUI({
        conditionalPanel(
          condition = paste0("output.auth_authenticated && output.auth_has_permission_", required_permission),
          ui_elements
        )
      }))
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
            if (!private$auth_service$is_authenticated()) {
              return(FALSE)
            }

            # Check permissions if specified
            if (!is.null(required_permissions)) {
              return(all(sapply(required_permissions, function(perm) {
                private$auth_service$has_permission(perm)
              })))
            }

            # Check roles if specified
            if (!is.null(required_roles)) {
              return(any(sapply(required_roles, function(role) {
                private$auth_service$has_role(role)
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
          if (!private$auth_service$is_authenticated()) {
            return("Access denied: Please login to view this content")
          }

          # Check permissions if specified
          if (!is.null(required_permissions)) {
            if (!all(sapply(required_permissions, function(perm) {
              private$auth_service$has_permission(perm)
            }))) {
              return("Access denied: Insufficient permissions")
            }
          }

          # Check roles if specified
          if (!is.null(required_roles)) {
            if (!any(sapply(required_roles, function(role) {
              private$auth_service$has_role(role)
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
    get_auth_config = function() {
      return(private$auth_service$get_config())
    }
  )
)