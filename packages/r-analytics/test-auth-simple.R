# =============================================================================
# SIMPLE AUTHENTICATION TEST
# =============================================================================
# Purpose: Basic test of authentication module loading and basic functionality
# =============================================================================

# Clear workspace
rm(list = ls())

# Test Configuration
cat("🧪 Simple Authentication Module Test\n")
cat("=====================================\n\n")

# Set working directory to shiny-app
setwd("./shiny-app")

# Test 1: Load Configuration
cat("📋 Test 1: Loading Configuration\n")
cat("---------------------------------\n")

tryCatch({
  source("config/centralized-config.R")

  if (exists("config_manager")) {
    config <- config_manager$get_config()
    cat("✅ Configuration loaded successfully\n")
    cat("   - Environment:", config$environment, "\n")
    cat("   - Auth Enabled:", config$security$enable_auth, "\n")
  } else {
    cat("❌ Configuration manager not found\n")
  }
}, error = function(e) {
  cat("❌ Error loading configuration:", e$message, "\n")
})

cat("\n")

# Test 2: Load Authentication API
cat("🌐 Test 2: Loading Authentication API\n")
cat("--------------------------------------\n")

tryCatch({
  source("modules/auth/auth_api.R")

  if (exists("AuthenticationAPI")) {
    cat("✅ AuthenticationAPI class loaded\n")

    # Test with proper config structure
    test_config <- list(
      backend_api = "https://bifrs9-iaf.ifrspro.id"
    )

    api_instance <- AuthenticationAPI$new(test_config)
    cat("✅ AuthenticationAPI instantiated successfully\n")

    # Check methods exist
    methods_to_check <- c("login", "logout", "get_profile")
    for (method in methods_to_check) {
      if (method %in% names(api_instance)) {
        cat("   ✅ Method exists:", method, "\n")
      } else {
        cat("   ❌ Method missing:", method, "\n")
      }
    }

    rm(api_instance)
  } else {
    cat("❌ AuthenticationAPI class not found\n")
  }
}, error = function(e) {
  cat("❌ Error loading AuthenticationAPI:", e$message, "\n")
})

cat("\n")

# Test 3: Test Authentication Service
cat("🔧 Test 3: Loading Authentication Service\n")
cat("----------------------------------------\n")

tryCatch({
  source("modules/auth/auth_service.R")

  if (exists("AuthenticationService")) {
    cat("✅ AuthenticationService class loaded\n")

    service_instance <- AuthenticationService$new()
    cat("✅ AuthenticationService instantiated successfully\n")

    # Test basic methods
    auth_status <- service_instance$is_authenticated()
    current_user <- service_instance$get_current_user()

    cat("   - Authenticated:", auth_status, "\n")
    if (!is.null(current_user)) {
      cat("   - Current User:", current_user$email, "\n")
      cat("   - Role:", current_user$role, "\n")
    }

    rm(service_instance)
  } else {
    cat("❌ AuthenticationService class not found\n")
  }
}, error = function(e) {
  cat("❌ Error loading AuthenticationService:", e$message, "\n")
})

cat("\n")

# Test 4: Test UI and Server modules
cat("🎨 Test 4: Loading UI and Server Modules\n")
cat("---------------------------------------\n")

tryCatch({
  source("modules/auth/auth_ui.R")
  source("modules/auth/auth_server.R")

  ui_exists <- exists("AuthenticationUI")
  server_exists <- exists("AuthenticationServerModule")

  cat("   ✅ AuthenticationUI:", if (ui_exists) "Loaded" else "Failed", "\n")
  cat("   ✅ AuthenticationServerModule:", if (server_exists) "Loaded" else "Failed", "\n")

  if (server_exists) {
    server_instance <- AuthenticationServerModule$new()
    cat("   ✅ AuthenticationServerModule instantiated\n")
    rm(server_instance)
  }
}, error = function(e) {
  cat("❌ Error loading modules:", e$message, "\n")
})

cat("\n")

# Test 5: Integration Module
cat("🔗 Test 5: Loading Integration Module\n")
cat("--------------------------------------\n")

tryCatch({
  source("modules/auth/auth_integration.R")

  if (exists("AuthenticationIntegration")) {
    cat("✅ AuthenticationIntegration class loaded\n")
  } else {
    cat("❌ AuthenticationIntegration class not found\n")
  }
}, error = function(e) {
  cat("❌ Error loading integration module:", e$message, "\n")
})

cat("\n")
cat("=====================================\n")
cat("🏁 Simple Authentication Test Complete\n")
cat("=====================================\n")