# =============================================================================
# IAF R ANALYTICS AUTHENTICATION CONFIGURATION
# =============================================================================
# Purpose: Authentication configuration for IAF R Analytics
# Default User: ranalytics@iaf.co.id / 1019181716
# Role: IAF Tenant Superadmin (Full access to R Analytics)
# =============================================================================

# IAF R Analytics Default User Configuration
IAF_R_ANALYTICS_USER <- list(
  email = "ranalytics@iaf.co.id",
  password = "1019181716",
  name = "IAF R Analytics Administrator",
  role = "IAF_TENANT_SUPERADMIN",
  tenant_slug = "iaf",
  banking_type = "conventional",
  permissions = c(
    "dashboard.view",
    "data.upload", "data.download", "data.process",
    "model.create", "model.run", "model.view", "model.export",
    "forecast.run", "forecast.view", "forecast.export",
    "analytics.full_access",
    "admin.users", "admin.system"
  ),
  authenticated = TRUE,
  session_id = NULL,
  last_login = NULL,
  created_at = Sys.time()
)

# Authentication Settings
IAF_AUTH_SETTINGS <- list(
  enabled = FALSE,  # Disabled for development
  auto_login = TRUE,  # Auto-login for development
  session_timeout = 28800,  # 8 hours
  max_login_attempts = 5,
  lockout_duration = 900,  # 15 minutes
  password_min_length = 8,
  require_mfa = FALSE,
  remember_me = TRUE
)

# Load IAF User Context
load_iaf_user_context <- function() {
  if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
    cat("🔑 Loading IAF R Analytics user context...\n")
    cat("📧 User:", IAF_R_ANALYTICS_USER$email, "\n")
    cat("👤 Name:", IAF_R_ANALYTICS_USER$name, "\n")
    cat("🏢 Role:", IAF_R_ANALYTICS_USER$role, "\n")
    cat("🏦 Tenant:", IAF_R_ANALYTICS_USER$tenant_slug, "\n")
  }

  return(IAF_R_ANALYTICS_USER)
}

# Validate IAF User
validate_iaf_user <- function(email, password) {
  # For development, auto-validate the IAF user
  if (email == IAF_R_ANALYTICS_USER$email &&
      password == IAF_R_ANALYTICS_USER$password) {
    return(TRUE)
  }
  return(FALSE)
}

# Get IAF User Permissions
get_iaf_user_permissions <- function() {
  return(IAF_R_ANALYTICS_USER$permissions)
}

# Check IAF User Permission
check_iaf_permission <- function(permission) {
  return(permission %in% IAF_R_ANALYTICS_USER$permissions)
}

# Update IAF User Session
update_iaf_session <- function() {
  IAF_R_ANALYTICS_USER$session_id <- paste0("iaf_session_", Sys.getpid())
  IAF_R_ANALYTICS_USER$last_login <- Sys.time()

  if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
    cat("🔄 Updated IAF user session\n")
  }
}

# IAF User Logout
logout_iaf_user <- function() {
  if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
    cat("🔓 IAF user logged out at:", format(Sys.time(), "%Y-%m-%d %H:%M:%S"), "\n")
  }

  IAF_R_ANALYTICS_USER$session_id <- NULL
  IAF_R_ANALYTICS_USER$authenticated <- FALSE
}