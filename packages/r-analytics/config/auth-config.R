# =============================================================================
# R ANALYTICS AUTHENTICATION CONFIGURATION SERVICE
# =============================================================================
# Centralized authentication management for IAF R Analytics
# Supports development and production modes with easy toggle
# =============================================================================

# Load authentication configuration from environment
load_auth_config <- function() {

  # Default authentication settings
  auth_config <- list(

    # Authentication Control
    auth_enabled = Sys.getenv("R_ANALYTICS_AUTH_ENABLED", "false") == "true",
    auth_debug = Sys.getenv("R_ANALYTICS_AUTH_DEBUG", "false") == "true",
    auth_required_for_dashboard = Sys.getenv("R_ANALYTICS_AUTH_REQUIRED_FOR_DASHBOARD", "false") == "true",

    # Development Mode
    dev_mode = Sys.getenv("R_ANALYTICS_DEV_MODE", "true") == "true",
    dev_bypass_auth = Sys.getenv("R_ANALYTICS_DEV_BYPASS_AUTH", "true") == "true",
    dev_auto_login = Sys.getenv("R_ANALYTICS_DEV_AUTO_LOGIN", "true") == "true",

    # Production Mode
    prod_auth_required = Sys.getenv("R_ANALYTICS_PROD_AUTH_REQUIRED", "true") == "true",
    prod_session_timeout = as.numeric(Sys.getenv("R_ANALYTICS_PROD_SESSION_TIMEOUT", "3600")),

    # Security Settings
    jwt_secret = Sys.getenv("R_ANALYTICS_JWT_SECRET", "default-secret-change-in-production"),
    encryption_key = Sys.getenv("R_ANALYTICS_ENCRYPTION_KEY", "default-key-change-in-production"),
    session_cookie_name = Sys.getenv("R_ANALYTICS_SESSION_COOKIE_NAME", "ifrs9_r_analytics_session"),

    # User Context Requirements
    require_user_id = Sys.getenv("R_ANALYTICS_REQUIRE_USER_ID", "true") == "true",
    require_tenant_id = Sys.getenv("R_ANALYTICS_REQUIRE_TENANT_ID", "true") == "true",
    require_user_role = Sys.getenv("R_ANALYTICS_REQUIRE_USER_ROLE", "true") == "true",

    # IAF Integration
    iaf_integration = Sys.getenv("R_ANALYTICS_IAF_INTEGRATION", "true") == "true",
    iaf_user_validation = Sys.getenv("R_ANALYTICS_IAF_USER_VALIDATION", "true") == "true",
    iaf_tenant_validation = Sys.getenv("R_ANALYTICS_IAF_TENANT_VALIDATION", "true") == "true",

    # Debug Logging
    debug_mode = Sys.getenv("R_ANALYTICS_DEBUG_MODE", "true") == "true",
    log_auth_attempts = Sys.getenv("R_ANALYTICS_LOG_AUTH_ATTEMPTS", "true") == "true",
    log_user_context = Sys.getenv("R_ANALYTICS_LOG_USER_CONTEXT", "true") == "true"
  )

  return(auth_config)
}

# Global authentication configuration
auth_config <- load_auth_config()

# Print authentication configuration on startup
print_auth_config <- function() {
  cat("🔐 R Analytics Authentication Configuration:\n")
  cat("   Authentication Enabled:", auth_config$auth_enabled, "\n")
  cat("   Development Mode:", auth_config$dev_mode, "\n")
  cat("   Auth Bypass in Dev:", auth_config$dev_bypass_auth, "\n")
  cat("   IAF Integration:", auth_config$iaf_integration, "\n")
  cat("   Debug Mode:", auth_config$debug_mode, "\n")

  if (auth_config$auth_enabled) {
    cat("   Session Timeout:", auth_config$prod_session_timeout, "seconds\n")
    cat("   User Validation Required:", auth_config$iaf_user_validation, "\n")
    cat("   Tenant Validation Required:", auth_config$iaf_tenant_validation, "\n")
  }

  cat("\n")
}

# Check if authentication is required for current request
is_auth_required <- function() {

  # If authentication is explicitly disabled, no auth required
  if (!auth_config$auth_enabled) {
    return(FALSE)
  }

  # In development mode with bypass enabled, no auth required
  if (auth_config$dev_mode && auth_config$dev_bypass_auth) {
    return(FALSE)
  }

  # Production mode always requires auth
  if (!auth_config$dev_mode && auth_config$prod_auth_required) {
    return(TRUE)
  }

  # Default to auth required if none of the above conditions met
  return(TRUE)
}

# Get development user context for testing
get_dev_user_context <- function() {

  if (!auth_config$dev_auto_login) {
    return(NULL)
  }

  # Default development user context for IAF
  dev_user <- list(
    user_id = "dev-user-12345",
    user_email = "dev-user@ifrs9.local",
    user_name = "Development User",
    user_role = "ACCESS_MANAGEMENT_OPERATOR",
    tenant_id = "iaf",
    tenant_slug = "iaf",
    banking_type = "conventional",
    authenticated = TRUE,
    dev_mode = TRUE
  )

  if (auth_config$debug_mode) {
    cat("🔧 Development User Context Applied:", dev_user$user_email, "\n")
  }

  return(dev_user)
}

# Validate user context (when auth is enabled)
validate_user_context <- function(user_context) {

  if (!auth_config$auth_enabled) {
    return(TRUE)
  }

  # Check required fields
  if (auth_config$require_user_id && is.null(user_context$user_id)) {
    if (auth_config$log_auth_attempts) {
      cat("❌ Auth validation failed: Missing user_id\n")
    }
    return(FALSE)
  }

  if (auth_config$require_tenant_id && is.null(user_context$tenant_id)) {
    if (auth_config$log_auth_attempts) {
      cat("❌ Auth validation failed: Missing tenant_id\n")
    }
    return(FALSE)
  }

  if (auth_config$require_user_role && is.null(user_context$user_role)) {
    if (auth_config$log_auth_attempts) {
      cat("❌ Auth validation failed: Missing user_role\n")
    }
    return(FALSE)
  }

  # IAF-specific validations
  if (auth_config$iaf_integration) {

    # Validate tenant
    if (auth_config$iaf_tenant_validation && user_context$tenant_id != "iaf") {
      if (auth_config$log_auth_attempts) {
        cat("❌ Auth validation failed: Invalid tenant_id", user_context$tenant_id, "\n")
      }
      return(FALSE)
    }

    # Validate user role (IAF roles only)
    if (auth_config$iaf_user_validation && !grepl("^IAF_", user_context$user_role)) {
      if (auth_config$log_auth_attempts) {
        cat("❌ Auth validation failed: Invalid user role", user_context$user_role, "\n")
      }
      return(FALSE)
    }
  }

  if (auth_config$log_auth_attempts) {
    cat("✅ Auth validation successful:", user_context$user_email, "\n")
  }

  return(TRUE)
}

# Log user context for debugging
log_user_context <- function(user_context, context_label = "User Context") {

  if (!auth_config$log_user_context) {
    return()
  }

  cat("🔍", context_label, ":\n")
  if (!is.null(user_context)) {
    cat("   User ID:", user_context$user_id %||% "NULL", "\n")
    cat("   Email:", user_context$user_email %||% "NULL", "\n")
    cat("   Name:", user_context$user_name %||% "NULL", "\n")
    cat("   Role:", user_context$user_role %||% "NULL", "\n")
    cat("   Tenant:", user_context$tenant_id %||% "NULL", "\n")
    cat("   Authenticated:", user_context$authenticated %||% FALSE, "\n")
  } else {
    cat("   No user context available\n")
  }
  cat("\n")
}

# Helper function for null coalescing
`%||%` <- function(x, y) if (is.null(x)) y else x

# Authentication status summary
get_auth_status <- function() {

  status <- list(
    auth_enabled = auth_config$auth_enabled,
    auth_required = is_auth_required(),
    dev_mode = auth_config$dev_mode,
    bypass_auth = auth_config$dev_bypass_auth,
    iaf_integration = auth_config$iaf_integration,
    validation_required = auth_config$iaf_user_validation || auth_config$iaf_tenant_validation
  )

  return(status)
}