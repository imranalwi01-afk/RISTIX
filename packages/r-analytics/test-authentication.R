# =============================================================================
# AUTHENTICATION INTEGRATION TEST
# =============================================================================
# Purpose: Test modular authentication system with backend API integration
# =============================================================================

# Clear workspace
rm(list = ls())

# Test Configuration
cat("🧪 Authentication Integration Test\n")
cat("=====================================\n\n")

# Set working directory to shiny-app
setwd("./shiny-app")

# Check if required files exist
required_files <- c(
  "config/centralized-config.R",
  "config/auth-config.R",
  "modules/auth/auth_api.R",
  "modules/auth/auth_service.R",
  "modules/auth/auth_ui.R",
  "modules/auth/auth_server.R",
  "modules/auth/auth_integration.R"
)

cat("📁 Checking required files:\n")
for (file in required_files) {
  if (file.exists(file)) {
    cat("  ✅", file, "\n")
  } else {
    cat("  ❌", file, "- MISSING\n")
  }
}
cat("\n")

# Test 1: Load Centralized Configuration
cat("📋 Test 1: Loading Centralized Configuration\n")
cat("-------------------------------------------\n")

tryCatch({
  # Source centralized configuration
  source("config/centralized-config.R")

  # Initialize configuration manager
  if (exists("config_manager")) {
    config <- config_manager$get_config()
    cat("✅ Configuration manager loaded successfully\n")
    cat("   - Environment:", config$environment, "\n")
    cat("   - Deployment Target:", config$deployment_target, "\n")
    cat("   - Auth Enabled:", config$security$enable_auth, "\n")
    cat("   - Backend URL:", config$security$auth_backend_url, "\n")
    cat("   - Debug Mode:", config$features$debug_mode, "\n")
  } else {
    cat("❌ Configuration manager not found\n")
  }

}, error = function(e) {
  cat("❌ Error loading configuration:", e$message, "\n")
})

cat("\n")

# Test 2: Load Authentication Configuration
cat("🔐 Test 2: Loading Authentication Configuration\n")
cat("---------------------------------------------\n")

tryCatch({
  # Source auth configuration
  source("config/auth-config.R")

  # Test auth config function
  if (exists("get_auth_config")) {
    auth_config <- get_auth_config()
    cat("✅ Authentication configuration loaded successfully\n")
    cat("   - Auth Enabled:", auth_config$enabled, "\n")
    cat("   - Backend URL:", auth_config$backend_url, "\n")
    cat("   - Debug Mode:", auth_config$debug_mode, "\n")
    cat("   - Session Timeout:", auth_config$session_timeout, "\n")
    cat("   - Dev User Available:", !is.null(auth_config$dev_user), "\n")
  } else {
    cat("❌ Authentication configuration function not found\n")
  }

}, error = function(e) {
  cat("❌ Error loading authentication configuration:", e$message, "\n")
})

cat("\n")

# Test 3: Load Authentication Modules
cat("🧩 Test 3: Loading Authentication Modules\n")
cat("----------------------------------------\n")

# Load modules in correct order
modules_to_test <- c(
  "modules/auth/auth_api.R",
  "modules/auth/auth_service.R",
  "modules/auth/auth_ui.R",
  "modules/auth/auth_server.R",
  "modules/auth/auth_integration.R"
)

for (module in modules_to_test) {
  tryCatch({
    source(module)
    cat("✅", basename(module), "loaded successfully\n")
  }, error = function(e) {
    cat("❌ Error loading", basename(module), ":", e$message, "\n")
  })
}

cat("\n")

# Test 4: Test Authentication API Class
cat("🌐 Test 4: Testing Authentication API Class\n")
cat("-------------------------------------------\n")

tryCatch({
  if (exists("AuthenticationAPI")) {
    # Test API instantiation (disabled mode for testing)
    api_test <- AuthenticationAPI$new(
      base_url = "https://bifrs9-iaf.ifrspro.id",
      jwt_token = NULL,
      debug_mode = TRUE
    )

    cat("✅ AuthenticationAPI class instantiated successfully\n")

    # Test method existence
    methods_available <- c(
      "login", "logout", "refresh_token", "get_profile",
      "verify_token", "get_user_roles", "get_permissions"
    )

    cat("   Available methods:\n")
    for (method in methods_available) {
      if (method %in% names(api_test)) {
        cat("   ✅", method, "\n")
      } else {
        cat("   ❌", method, "- missing\n")
      }
    }

    # Clean up
    rm(api_test)
  } else {
    cat("❌ AuthenticationAPI class not found\n")
  }

}, error = function(e) {
  cat("❌ Error testing AuthenticationAPI:", e$message, "\n")
})

cat("\n")

# Test 5: Test Authentication Service Class
cat("🔧 Test 5: Testing Authentication Service Class\n")
cat("-----------------------------------------------\n")

tryCatch({
  if (exists("AuthenticationService")) {
    # Test service instantiation
    service_test <- AuthenticationService$new(debug_mode = TRUE)

    cat("✅ AuthenticationService class instantiated successfully\n")

    # Test method existence
    methods_available <- c(
      "initialize", "is_authenticated", "get_current_user",
      "get_user_roles", "has_permission", "has_role",
      "login", "logout", "refresh_session", "get_auth_config"
    )

    cat("   Available methods:\n")
    for (method in methods_available) {
      if (method %in% names(service_test)) {
        cat("   ✅", method, "\n")
      } else {
        cat("   ❌", method, "- missing\n")
      }
    }

    # Test authentication status
    auth_status <- service_test$is_authenticated()
    cat("   - Authenticated:", auth_status, "\n")

    # Test current user (should be dev user in disabled mode)
    current_user <- service_test$get_current_user()
    if (!is.null(current_user)) {
      cat("   - Current User:", current_user$email, "\n")
      cat("   - User Role:", current_user$role, "\n")
    } else {
      cat("   - Current User: None (authentication disabled)\n")
    }

    # Clean up
    rm(service_test)
  } else {
    cat("❌ AuthenticationService class not found\n")
  }

}, error = function(e) {
  cat("❌ Error testing AuthenticationService:", e$message, "\n")
})

cat("\n")

# Test 6: Test Environment Variables
cat("🌍 Test 6: Testing Environment Variables\n")
cat("---------------------------------------\n")

# Key environment variables for authentication
env_vars <- c(
  "ENABLE_AUTH",
  "AUTH_BACKEND_URL",
  "AUTH_TIMEOUT",
  "JWT_SECRET",
  "ENCRYPTION_KEY",
  "DEPLOYMENT_TARGET"
)

cat("Environment Variables:\n")
for (var in env_vars) {
  value <- Sys.getenv(var, "NOT_SET")
  if (value != "NOT_SET") {
    if (grepl("SECRET|KEY", var) && nchar(value) > 10) {
      # Show only first/last few chars for secrets
      cat("  ✅", var, ":", paste0(substr(value, 1, 3), "...", substr(value, nchar(value)-2, nchar(value))), "\n")
    } else {
      cat("  ✅", var, ":", value, "\n")
    }
  } else {
    cat("  ⚠️", var, ": not set\n")
  }
}

cat("\n")

# Test 7: Test Backend API Connectivity
cat("🔗 Test 7: Testing Backend API Connectivity\n")
cat("--------------------------------------------\n")

backend_url <- Sys.getenv("AUTH_BACKEND_URL", "https://bifrs9-iaf.ifrspro.id")
health_endpoint <- paste0(backend_url, "/health")

cat("Testing backend health endpoint:", health_endpoint, "\n")

# Create HTTP request
tryCatch({
  # Use curl for testing
  curl_result <- system2("curl", args = c(
    "-s", "-o", "/dev/null",
    "-w", "%{http_code}",
    "-k",  # insecure for testing
    health_endpoint
  ), stdout = TRUE)

  http_code <- as.numeric(curl_result)

  if (http_code == 200) {
    cat("✅ Backend API is reachable (HTTP 200)\n")
  } else if (http_code == 404) {
    cat("⚠️ Backend API reachable but health endpoint not found (HTTP 404)\n")
  } else if (http_code == 0) {
    cat("❌ Backend API unreachable - connection failed\n")
  } else {
    cat("⚠️ Backend API responded with HTTP", http_code, "\n")
  }

}, error = function(e) {
  cat("❌ Error testing backend connectivity:", e$message, "\n")
})

cat("\n")

# Test 8: Integration Validation Summary
cat("📊 Test 8: Integration Validation Summary\n")
cat("==========================================\n")

# Check if all critical components are loaded
critical_components <- c(
  "config_manager", "get_auth_config",
  "AuthenticationAPI", "AuthenticationService"
)

loaded_count <- 0
total_count <- length(critical_components)

for (component in critical_components) {
  if (exists(component)) {
    loaded_count <- loaded_count + 1
    cat("✅", component, "\n")
  } else {
    cat("❌", component, "\n")
  }
}

success_rate <- round((loaded_count / total_count) * 100, 1)

cat("\n🎯 Integration Test Result:", success_rate, "%\n")

if (success_rate >= 75) {
  cat("🎉 Authentication integration is READY!\n")
} else if (success_rate >= 50) {
  cat("⚠️ Authentication integration needs minor fixes\n")
} else {
  cat("❌ Authentication integration has significant issues\n")
}

cat("\n")

# Test 9: Development vs Production Mode Test
cat("🏭 Test 9: Development vs Production Mode\n")
cat("=========================================\n")

auth_enabled <- as.logical(Sys.getenv("ENABLE_AUTH", "false"))
debug_mode <- as.logical(Sys.getenv("DEBUG_MODE", "true"))

cat("Current Configuration:\n")
cat("  - Authentication Enabled:", auth_enabled, "\n")
cat("  - Debug Mode:", debug_mode, "\n")

if (!auth_enabled) {
  cat("🏠 DEVELOPMENT MODE:\n")
  cat("  - Authentication disabled\n")
  cat("  - Development user active\n")
  cat("  - Full access granted\n")

  # Test dev user access
  if (exists("get_dev_user_context")) {
    dev_user <- get_dev_user_context()
    if (!is.null(dev_user)) {
      cat("  - Dev User:", dev_user$email, "\n")
      cat("  - Dev Role:", dev_user$role, "\n")
      cat("  - Permissions:", length(dev_user$permissions), "granted\n")
    }
  }
} else {
  cat("🏭 PRODUCTION MODE:\n")
  cat("  - Authentication enabled\n")
  cat("  - Backend integration active\n")
  cat("  - Real login required\n")
}

cat("\n")

# Test 10: File Structure Validation
cat("📂 Test 10: Complete File Structure Validation\n")
cat("============================================\n")

expected_structure <- list(
  "config" = c("centralized-config.R", "auth-config.R"),
  "modules/auth" = c(
    "auth_api.R", "auth_service.R", "auth_ui.R",
    "auth_server.R", "auth_integration.R"
  )
)

structure_valid <- TRUE

for (dir in names(expected_structure)) {
  cat("📁", dir, "/\n")
  for (file in expected_structure[[dir]]) {
    file_path <- file.path(dir, file)
    if (file.exists(file_path)) {
      cat("  ✅", file, "\n")
    } else {
      cat("  ❌", file, "- MISSING\n")
      structure_valid <- FALSE
    }
  }
}

if (structure_valid) {
  cat("\n✅ Complete file structure is VALID\n")
} else {
  cat("\n❌ File structure has missing files\n")
}

cat("\n")
cat("=====================================\n")
cat("🏁 Authentication Integration Test Complete\n")
cat("=====================================\n")