# =============================================================================
# DEBUG CONFIGURATION - CONTROL VERBOSE OUTPUT
# =============================================================================
# Purpose: Centralize debug mode settings to control verbose output
# Usage: Called early in app.R to set debug environment variables
# =============================================================================

# Initialize debug configuration
initialize_debug_config <- function() {
  # Check for debug flag file
  debug_flag_file <- file.path(getwd(), ".debug-mode")

  if (file.exists(debug_flag_file)) {
    Sys.setenv(R_ANALYTICS_DEBUG_MODE = "true")
    cat("🐛 Debug mode enabled - .debug-mode file found\n")
  } else {
    Sys.setenv(R_ANALYTICS_DEBUG_MODE = "false")
  }

  # Also check for environment variable override
  debug_env <- Sys.getenv("R_ANALYTICS_DEBUG_MODE", "")
  if (debug_env != "") {
    Sys.setenv(R_ANALYTICS_DEBUG_MODE = debug_env)
  }
}

# Function to enable debug mode
enable_debug_mode <- function() {
  debug_flag_file <- file.path(getwd(), ".debug-mode")
  writeLines("DEBUG", debug_flag_file)
  cat("✅ Debug mode enabled - created .debug-mode file\n")
  cat("💡 Restart R Analytics to apply debug mode\n")
}

# Function to disable debug mode
disable_debug_mode <- function() {
  debug_flag_file <- file.path(getwd(), ".debug-mode")
  if (file.exists(debug_flag_file)) {
    file.remove(debug_flag_file)
    cat("✅ Debug mode disabled - removed .debug-mode file\n")
    cat("💡 Restart R Analytics to apply changes\n")
  } else {
    cat("ℹ️ Debug mode is already disabled\n")
  }
}

# Function to check if debug mode is enabled
is_debug_mode <- function() {
  return(Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true")
}