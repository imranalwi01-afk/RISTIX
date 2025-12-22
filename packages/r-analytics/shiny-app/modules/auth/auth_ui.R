# =============================================================================
# AUTHENTICATION UI MODULE
# =============================================================================
# Purpose: UI components for authentication (login form, user info, etc.)
# Integration: Works with Shiny application and authentication service
# Environment: Adapts based on authentication enabled/disabled
# =============================================================================

# Load required libraries
library(shiny)
library(shinydashboard)
library(shinyjs)
library(DT)

#' Authentication UI Module
#' @description Provides UI components for authentication system
AuthenticationUIModule <- R6Class("AuthenticationUIModule",

  private = list(
    # Authentication service reference
    auth_service = NULL,

    # Create login form UI
    create_login_form = function() {
      div(
        id = "login-form-container",
        class = "login-form",
        div(
          class = "row",
          div(
            class = "col-md-12",
            div(
              class = "login-header",
              h4("IAF R Analytics Login", class = "text-center"),
              p("Please login with your IAF credentials", class = "text-center text-muted")
            ),
            br(),

            # Login form
            div(
              class = "form-group",
              tags$input(
                type = "email",
                class = "form-control",
                id = "login-email",
                placeholder = "Email address",
                required = TRUE
              )
            ),
            br(),

            div(
              class = "form-group",
              tags$input(
                type = "password",
                class = "form-control",
                id = "login-password",
                placeholder = "Password",
                required = TRUE
              )
            ),
            br(),

            div(
              class = "form-group",
              tags$input(
                type = "text",
                class = "form-control",
                id = "login-tenant",
                placeholder = "Tenant ID (optional)",
                required = FALSE
              )
            ),
            br(),

            div(
              class = "form-group text-center",
              actionButton(
                "login_button",
                "Login",
                class = "btn btn-primary btn-block",
                icon = icon("sign-in-alt")
              )
            )
          )
        )
      )
    },

    # Create user info display
    create_user_info = function(user) {
      div(
        class = "user-info",
        div(
          class = "row",
          div(
            class = "col-md-12",
            div(
              class = "user-header",
              div(
                class = "user-avatar",
                icon("user-circle")
              ),
              div(
                class = "user-details",
                h5(user$name, class = "user-name"),
                small(user$email, class = "user-email text-muted"),
                if (!is.null(user$role)) {
                  span(
                    class = paste0("badge badge-primary user-role"),
                    user$role
                  )
                }
              )
            )
            ),
            hr(),

            # User actions
            div(
              class = "user-actions",
              div(
                class = "btn-group",
                actionButton(
                  "profile_button",
                  "Profile",
                  class = "btn btn-sm btn-outline-primary",
                  icon = icon("user")
                ),
                actionButton(
                  "logout_button",
                  "Logout",
                  class = "btn btn-sm btn-outline-danger",
                  icon = icon("sign-out-alt")
                )
              )
            )
          )
        )
    },

    # Create development mode indicator
    create_dev_mode_indicator = function() {
      div(
        class = "dev-mode-indicator",
        div(
          class = "alert alert-warning",
          icon("exclamation-triangle"),
          strong("Development Mode: "),
          "Authentication disabled. Using development user context.",
          br(),
          "User: ", code("admin@iaf.co.id"),
          " | Role: ", code("IAF_TENANT_SUPERADMIN")
        )
      )
    }
  ),

  public = list(
    # Initialize UI module
    initialize = function(auth_service) {
      private$auth_service <- auth_service
    },

    # Get login UI
    get_login_ui = function() {
      return(private$create_login_form())
    },

    # Get user info UI
    get_user_info_ui = function() {
      user <- private$auth_service$get_current_user()
      if (!is.null(user)) {
        return(private$create_user_info(user))
      } else {
        return(div("No user session"))
      }
    },

    # Get authentication status UI
    get_auth_status_ui = function() {
      if (private$auth_service$is_auth_enabled()) {
        if (private$auth_service$is_authenticated()) {
          user <- private$auth_service$get_current_user()
          return(
            div(
              class = "auth-status authenticated",
              span(
                class = "badge badge-success",
                icon("check-circle"),
                "Authenticated"
              ),
              tags$small(" | "),
              tags$small(user$email %||% "Unknown")
            )
          )
        } else {
          return(
            div(
              class = "auth-status unauthenticated",
              span(
                class = "badge badge-danger",
                icon("exclamation-circle"),
                "Not Authenticated"
              )
            )
          )
        }
      } else {
        return(private$create_dev_mode_indicator())
      }
    },

    # Get sidebar user info
    get_sidebar_user_ui = function() {
      if (private$auth_service$is_auth_enabled()) {
        if (private$auth_service$is_authenticated()) {
          user <- private$auth_service$get_current_user()
          return(
            dropdownMenu(
              span(
                icon("user"),
                " ", user$name %||% "User"
              ),
              menuItem(
                icon("user"),
                "Profile",
                href = "#"
              ),
              menuItem(
                icon("sign-out-alt"),
                "Logout",
                href = "#",
                actionButtonInputId = "logout_button"
              ),
              icon = icon("user")
            )
          )
        } else {
          return(
            menuItem(
              icon("sign-in-alt"),
              "Login",
              href = "#",
              actionButtonInputId = "show_login_button"
            )
          )
        }
      } else {
        return(
          menuItem(
            icon("cog"),
            "Dev Mode",
            href = "#"
          )
        )
      }
    },

    # Setup JavaScript handlers
    setup_js_handlers = function() {
      shinyjs::runjs("
        // Login form handler
        document.getElementById('login-email').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            document.getElementById('login-password').focus();
          }
        });

        document.getElementById('login-password').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            document.getElementById('login-tenant').focus();
          }
        });

        document.getElementById('login-tenant').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            Shiny.setInputValue('login_button', true);
          }
        });

        // Prevent form submission
        document.getElementById('login-form-container').addEventListener('submit', function(e) {
          e.preventDefault();
          Shiny.setInputValue('login_button', true);
        });
      ")
    }
  )
)