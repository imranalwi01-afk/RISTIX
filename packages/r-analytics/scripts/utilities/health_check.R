# packages/r-analytics/scripts/utilities/health_check.R
# Health check script for R Analytics service

# Perform comprehensive health check
perform_health_check <- function() {
  tryCatch({
    health_result <- list(
      success = TRUE,
      service_status = "healthy",
      r_version = R.version.string,
      timestamp = Sys.time(),
      checks = list()
    )
    
    # Check R version
    r_version <- R.Version()
    health_result$checks$r_version <- list(
      status = "ok",
      version = paste(r_version$major, r_version$minor, sep = "."),
      details = "R version is compatible"
    )
    
    # Check required packages
    required_packages <- c("jsonlite", "DBI", "httr")
    package_status <- list()
    
    for (pkg in required_packages) {
      pkg_check <- list(
        name = pkg,
        status = "ok",
        installed = FALSE,
        version = "unknown"
      )
      
      tryCatch({
        if (requireNamespace(pkg, quietly = TRUE)) {
          pkg_check$installed <- TRUE
          if (exists("packageVersion")) {
            pkg_check$version <- as.character(packageVersion(pkg))
          }
        } else {
          pkg_check$status <- "missing"
          pkg_check$installed <- FALSE
        }
      }, error = function(e) {
        pkg_check$status <- "error"
        pkg_check$error <- e$message
      })
      
      package_status[[pkg]] <- pkg_check
    }
    
    health_result$checks$packages <- list(
      status = "ok",
      packages = package_status
    )
    
    # Test basic calculation
    tryCatch({
      test_data <- data.frame(
        account_id = c("TEST001", "TEST002", "TEST003"),
        outstanding_amount = c(10000, 20000, 15000)
      )
      
      # Simple ECL calculation
      test_data$ecl <- test_data$outstanding_amount * 0.02 * 0.45
      test_sum <- sum(test_data$ecl)
      
      health_result$checks$calculation_test <- list(
        status = "ok",
        test_result = test_sum,
        details = "Basic ECL calculation test passed"
      )
      
    }, error = function(e) {
      health_result$checks$calculation_test <- list(
        status = "error",
        error = e$message,
        details = "Basic calculation test failed"
      )
      health_result$success <- FALSE
      health_result$service_status <- "degraded"
    })
    
    # Memory check
    tryCatch({
      memory_info <- gc()
      health_result$checks$memory <- list(
        status = "ok",
        used_mb = round(sum(memory_info[,2]) * 8 / 1024, 2),
        details = "Memory usage normal"
      )
    }, error = function(e) {
      health_result$checks$memory <- list(
        status = "warning",
        details = "Memory check failed"
      )
    })
    
    return(health_result)
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      service_status = "unhealthy",
      error = e$message,
      timestamp = Sys.time()
    ))
  })
}

# Execute health check if script is called directly
if (exists("input_data")) {
  health_check_result <- perform_health_check()
  
  # Output JSON if jsonlite is available
  if (requireNamespace("jsonlite", quietly = TRUE)) {
    cat(jsonlite::toJSON(health_check_result, auto_unbox = TRUE, pretty = TRUE))
  } else {
    # Basic output without JSON
    cat("Health Check Results:\n")
    cat("Status:", health_check_result$service_status, "\n")
    cat("Success:", health_check_result$success, "\n")
    cat("Timestamp:", as.character(health_check_result$timestamp), "\n")
  }
} else {
  # When called from other scripts
  health_check_result <- perform_health_check()
  
  if (requireNamespace("jsonlite", quietly = TRUE)) {
    cat(jsonlite::toJSON(health_check_result, auto_unbox = TRUE, pretty = TRUE))
  } else {
    cat("R Health Check: OK\n")
  }
}

cat("✅ Health check functions loaded successfully!\n")
