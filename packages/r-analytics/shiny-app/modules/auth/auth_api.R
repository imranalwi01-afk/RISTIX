# =============================================================================
# AUTHENTICATION API MODULE
# =============================================================================
# Purpose: API integration with IAF backend authentication system
# Integration: Communicates with /api/v1/auth endpoints
# Environment: Works with both localdev and iafecs configurations
# =============================================================================

# Load required libraries
suppressPackageStartupMessages({
  library(httr)
  library(jsonlite)
  library(R6)
})

#' Authentication API Service
#' @description Handles API calls to IAF backend authentication endpoints
AuthenticationAPI <- R6Class("AuthenticationAPI",

  private = list(
    # Base URL from configuration
    base_url = NULL,
    # JWT token storage
    jwt_token = NULL,
    # Refresh token
    refresh_token = NULL,
    # User session data
    user_session = NULL,

    # Make authenticated API request
    make_authenticated_request = function(endpoint, method = "GET", body = NULL) {
      url <- paste0(private$base_url, endpoint)

      headers <- add_headers(
        "Content-Type" = "application/json",
        "Authorization" = paste0("Bearer ", private$jwt_token)
      )

      tryCatch({
        if (method == "POST" && !is.null(body)) {
          response <- POST(url, body = toJSON(body, auto_unbox = TRUE), encode = "json", headers = headers)
        } else if (method == "GET") {
          response <- GET(url, headers = headers)
        } else {
          response <- VERB(method, url, headers = headers)
        }

        if (status_code(response) >= 200 && status_code(response) < 300) {
          return(content(response, "parsed", "application/json"))
        } else {
          return(list(success = FALSE, error = paste("HTTP Error:", status_code(response))))
        }
      }, error = function(e) {
        return(list(success = FALSE, error = paste("API Error:", e$message)))
      })
    },

    # Validate token and refresh if needed
    validate_and_refresh_token = function() {
      if (is.null(private$jwt_token)) {
        return(FALSE)
      }

      # Check if token is expired
      tryCatch({
        # Parse JWT token (basic validation)
        token_parts <- strsplit(private$jwt_token, "\\.")
        if (length(token_parts) >= 2) {
          # Add base padding if needed for JWT tokens
          jwt_payload <- token_parts[[2]]
          # JWT base64 strings should be padded to multiple of 4
          while (nchar(jwt_payload) %% 4 != 0) {
            jwt_payload <- paste0(jwt_payload, "=")
          }
          payload <- rawToChar(openssl::base64_decode(jwt_payload))
          token_data <- fromJSON(payload)

          # Check expiration (basic check)
          if (token_data$exp < as.numeric(Sys.time()) + 300) { # Refresh if expires within 5 minutes
            return(private$refresh_jwt_token())
          }
        }
        return(TRUE)
      }, error = function(e) {
        return(FALSE)
      })
    },

    # Refresh JWT token
    refresh_jwt_token = function() {
      if (is.null(private$refresh_token)) {
        return(FALSE)
      }

      tryCatch({
        response <- POST(
          url = paste0(private$base_url, "/api/v1/auth/refresh-token"),
          body = toJSON(list(refreshToken = private$refresh_token), auto_unbox = TRUE),
          encode = "json",
          add_headers("Content-Type" = "application/json")
        )

        if (status_code(response) == 200) {
          result <- content(response, "parsed", "application/json")
          if (result$success) {
            private$jwt_token <- result$data$token
            private$refresh_token <- result$data$refreshToken
            return(TRUE)
          }
        }
        return(FALSE)
      }, error = function(e) {
        return(FALSE)
      })
    }
  ),

  public = list(
    # Initialize with configuration
    initialize = function(config) {
      private$base_url <- config$backend_api
    },

    # Login to backend system
    login = function(email, password, tenant_id = NULL) {
      login_data <- list(
        email = email,
        password = password
      )

      if (!is.null(tenant_id)) {
        login_data$tenantId <- tenant_id
      }

      tryCatch({
        response <- POST(
          url = paste0(private$base_url, "/api/v1/auth/login"),
          body = toJSON(login_data, auto_unbox = TRUE),
          encode = "json",
          add_headers("Content-Type" = "application/json")
        )

        if (status_code(response) == 200) {
          result <- content(response, "parsed", "application/json")
          if (result$success) {
            private$jwt_token <- result$data$token
            private$refresh_token <- result$data$refreshToken
            private$user_session <- result$data$user

            # Get user roles and permissions
            user_profile <- private$get_profile()
            if (user_profile$success) {
              private$user_session$roles <- user_profile$data$roles
              private$user_session$permissions <- user_profile$data$permissions
            }

            return(list(
              success = TRUE,
              user = private$user_session,
              message = "Login successful"
            ))
          } else {
            return(list(success = FALSE, error = result$error, message = "Login failed"))
          }
        } else {
          error_content <- content(response, "parsed", "application/json")
          return(list(
            success = FALSE,
            error = error_content$error %||% "Authentication failed",
            message = "Invalid credentials"
          ))
        }
      }, error = function(e) {
        return(list(
          success = FALSE,
          error = paste("Login error:", e$message),
          message = "Connection to authentication service failed"
        ))
      })
    },

    # Get user profile with roles and permissions
    get_profile = function() {
      if (!private$validate_and_refresh_token()) {
        return(list(success = FALSE, error = "Invalid or expired token"))
      }

      result <- private$make_authenticated_request("/api/v1/auth/profile")
      return(result)
    },

    # Logout from backend system
    logout = function() {
      if (!is.null(private$jwt_token)) {
        tryCatch({
          response <- POST(
            url = paste0(private$base_url, "/api/v1/auth/logout"),
            headers = add_headers(
              "Content-Type" = "application/json",
              "Authorization" = paste0("Bearer ", private$jwt_token)
            )
          )
        }, error = function(e) {
          # Ignore logout errors - just clear local session
        })
      }

      # Clear local session
      private$jwt_token <- NULL
      private$refresh_token <- NULL
      private$user_session <- NULL

      return(list(success = TRUE, message = "Logged out successfully"))
    },

    # Check if user has specific permission
    has_permission = function(permission) {
      if (is.null(private$user_session) || is.null(private$user_session$permissions)) {
        return(FALSE)
      }

      # Check if permission exists in user's permissions
      return(permission %in% private$user_session$permissions)
    },

    # Check if user has specific role
    has_role = function(role_name) {
      if (is.null(private$user_session) || is.null(private$user_session$roles)) {
        return(FALSE)
      }

      # Check if role exists in user's roles
      return(any(sapply(private$user_session$roles, function(role) {
        return(role$roleName == role_name)
      })))
    },

    # Get current user session
    get_current_user = function() {
      return(private$user_session)
    },

    # Check if user is authenticated
    is_authenticated = function() {
      return(!is.null(private$jwt_token) && private$validate_and_refresh_token())
    },

    # Get JWT token for API calls
    get_jwt_token = function() {
      if (private$validate_and_refresh_token()) {
        return(private$jwt_token)
      }
      return(NULL)
    }
  )
)