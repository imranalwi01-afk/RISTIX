# =============================================================================
# ERROR LOGGING SYSTEM
# =============================================================================
# Purpose: Comprehensive logging system with file rotation, severity levels, and application-wide logging
# Reference: MODULAR_VERSION_TODO.md Task #18
# Features: File-based logging, rotation, severity levels, structured logging
# Created: P2-Task#18
# =============================================================================

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

resolve_log_dir <- function() {
  configured <- Sys.getenv("R_ANALYTICS_LOG_DIR", "")
  if (nzchar(configured)) return(configured)
  if (file.exists("/.dockerenv")) return("/opt/r-analytics/logs")
  "logs"
}

#' Logging Configuration Constants
#' @description Global configuration for the logging system
LOG_CONFIG <- list(
  # Log directory (relative to app root)
  log_dir = resolve_log_dir(),

  # Log file names
  log_file_app = "ifrs9_app.log",
  log_file_error = "ifrs9_error.log",
  log_file_data = "ifrs9_data.log",
  log_file_model = "ifrs9_model.log",
  log_file_pd = "ifrs9_pd.log",

  # Log rotation settings
  max_log_size_mb = 10,           # Maximum log file size before rotation (MB)
  max_log_files = 5,              # Number of rotated log files to keep

  # Severity levels (ascending severity)
  levels = c("DEBUG", "INFO", "WARN", "ERROR", "FATAL"),

  # Minimum severity level to log (DEBUG logs everything, ERROR logs only errors)
  min_level = "INFO",

  # Log format settings
  timestamp_format = "%Y-%m-%d %H:%M:%S",
  include_function_name = TRUE,
  include_line_number = FALSE,

  # Console output settings
  console_output = TRUE,          # Also print to console
  console_colors = TRUE,          # Use colored output in console

  # Performance logging
  log_performance = TRUE,         # Log execution times
  performance_threshold_ms = 1000 # Log functions taking longer than this
)

# =============================================================================
# LOGGING SYSTEM INITIALIZATION
# =============================================================================

#' Initialize Logging System
#' @description Creates log directory and initializes logging environment
#' @return Logical TRUE if successful, FALSE otherwise
init_logging <- function() {
  tryCatch({
    # Create logs directory if it doesn't exist
    if (!dir.exists(LOG_CONFIG$log_dir)) {
      dir.create(LOG_CONFIG$log_dir, recursive = TRUE)
      cat("✅ Created log directory:", LOG_CONFIG$log_dir, "\n")
    }

    # Initialize log rotation tracking
    if (!exists(".log_rotation_state", envir = .GlobalEnv)) {
      assign(".log_rotation_state", list(
        last_rotation_check = Sys.time(),
        rotation_count = 0
      ), envir = .GlobalEnv)
    }

    # Write startup message to all log files
    startup_msg <- sprintf(
      "========================================\nIFRS9 Analytics Application Started\nTimestamp: %s\n========================================\n",
      format(Sys.time(), LOG_CONFIG$timestamp_format)
    )

    log_files <- c(
      LOG_CONFIG$log_file_app,
      LOG_CONFIG$log_file_error,
      LOG_CONFIG$log_file_data,
      LOG_CONFIG$log_file_model,
      LOG_CONFIG$log_file_pd
    )

    for (log_file in log_files) {
      log_path <- file.path(LOG_CONFIG$log_dir, log_file)
      cat(startup_msg, file = log_path, append = TRUE)
    }

    cat("✅ Logging system initialized successfully\n")
    log_info("Logging system initialized", category = "SYSTEM")

    return(TRUE)

  }, error = function(e) {
    cat("❌ Failed to initialize logging system:", e$message, "\n")
    return(FALSE)
  })
}

# =============================================================================
# LOG ROTATION FUNCTIONS
# =============================================================================

#' Check and Rotate Log Files
#' @description Checks log file sizes and rotates if necessary
#' @param log_file Character path to log file
#' @return Logical TRUE if rotation occurred
rotate_log_if_needed <- function(log_file) {
  tryCatch({
    if (!file.exists(log_file)) {
      return(FALSE)
    }

    # Check file size
    file_size_mb <- file.info(log_file)$size / (1024 * 1024)

    if (file_size_mb >= LOG_CONFIG$max_log_size_mb) {
      # Perform rotation
      rotate_log_files(log_file)
      return(TRUE)
    }

    return(FALSE)

  }, error = function(e) {
    cat("⚠️ Log rotation check failed:", e$message, "\n")
    return(FALSE)
  })
}

#' Rotate Log Files
#' @description Rotates log files (e.g., app.log -> app.log.1 -> app.log.2 ...)
#' @param log_file Character path to log file
rotate_log_files <- function(log_file) {
  tryCatch({
    # Shift existing rotated logs
    for (i in (LOG_CONFIG$max_log_files - 1):1) {
      old_file <- paste0(log_file, ".", i)
      new_file <- paste0(log_file, ".", i + 1)

      if (file.exists(old_file)) {
        if (i == LOG_CONFIG$max_log_files - 1) {
          # Delete oldest file
          file.remove(old_file)
        } else {
          # Rename to next number
          file.rename(old_file, new_file)
        }
      }
    }

    # Rotate current log to .1
    if (file.exists(log_file)) {
      file.rename(log_file, paste0(log_file, ".1"))
    }

    # Update rotation state
    rotation_state <- get(".log_rotation_state", envir = .GlobalEnv)
    rotation_state$last_rotation_check <- Sys.time()
    rotation_state$rotation_count <- rotation_state$rotation_count + 1
    assign(".log_rotation_state", rotation_state, envir = .GlobalEnv)

    cat("🔄 Log file rotated:", log_file, "\n")

  }, error = function(e) {
    cat("❌ Log rotation failed:", e$message, "\n")
  })
}

# =============================================================================
# CORE LOGGING FUNCTIONS
# =============================================================================

#' Write Log Entry
#' @description Core logging function that writes to log files
#' @param level Character severity level (DEBUG, INFO, WARN, ERROR, FATAL)
#' @param message Character log message
#' @param category Character log category (SYSTEM, DATA, MODEL, PD, etc.)
#' @param details List additional details to log
#' @param log_file Character specific log file to write to (optional)
write_log <- function(level, message, category = "APP", details = NULL, log_file = NULL) {
  tryCatch({
    # Check if level meets minimum threshold
    level_index <- match(level, LOG_CONFIG$levels)
    min_level_index <- match(LOG_CONFIG$min_level, LOG_CONFIG$levels)

    if (is.na(level_index) || level_index < min_level_index) {
      return(invisible(NULL))
    }

    # Get calling function name
    calling_function <- if (LOG_CONFIG$include_function_name) {
      tryCatch({
        call_stack <- sys.calls()
        if (length(call_stack) >= 3) {
          as.character(call_stack[[length(call_stack) - 2]][[1]])
        } else {
          "unknown"
        }
      }, error = function(e) "unknown")
    } else {
      NULL
    }

    # Build log entry
    timestamp <- format(Sys.time(), LOG_CONFIG$timestamp_format)

    log_entry <- sprintf(
      "[%s] [%s] [%s]%s %s",
      timestamp,
      level,
      category,
      if (!is.null(calling_function)) paste0(" [", calling_function, "]") else "",
      message
    )

    # Add details if provided
    if (!is.null(details) && length(details) > 0) {
      details_str <- paste(
        sapply(names(details), function(name) {
          sprintf("  %s: %s", name, as.character(details[[name]]))
        }),
        collapse = "\n"
      )
      log_entry <- paste0(log_entry, "\n", details_str)
    }

    log_entry <- paste0(log_entry, "\n")

    # Determine target log file
    if (is.null(log_file)) {
      log_file <- if (level %in% c("ERROR", "FATAL")) {
        LOG_CONFIG$log_file_error
      } else if (category == "DATA") {
        LOG_CONFIG$log_file_data
      } else if (category == "MODEL") {
        LOG_CONFIG$log_file_model
      } else if (category == "PD") {
        LOG_CONFIG$log_file_pd
      } else {
        LOG_CONFIG$log_file_app
      }
    }

    log_path <- file.path(LOG_CONFIG$log_dir, log_file)

    # Check rotation before writing
    rotate_log_if_needed(log_path)

    # Write to log file
    cat(log_entry, file = log_path, append = TRUE)

    # Console output with colors
    if (LOG_CONFIG$console_output) {
      if (LOG_CONFIG$console_colors) {
        colored_entry <- switch(level,
          "DEBUG" = paste0("\033[36m", log_entry, "\033[0m"),    # Cyan
          "INFO" = paste0("\033[32m", log_entry, "\033[0m"),     # Green
          "WARN" = paste0("\033[33m", log_entry, "\033[0m"),     # Yellow
          "ERROR" = paste0("\033[31m", log_entry, "\033[0m"),    # Red
          "FATAL" = paste0("\033[35m", log_entry, "\033[0m"),    # Magenta
          log_entry
        )
        cat(colored_entry)
      } else {
        cat(log_entry)
      }
    }

  }, error = function(e) {
    # Fallback to console if logging fails
    cat("⚠️ Logging failed:", e$message, "\n")
    cat("Original message:", message, "\n")
  })
}

#' Log Debug Message
#' @param message Character log message
#' @param category Character log category
#' @param details List additional details
log_debug <- function(message, category = "APP", details = NULL) {
  write_log("DEBUG", message, category, details)
}

#' Log Info Message
#' @param message Character log message
#' @param category Character log category
#' @param details List additional details
log_info <- function(message, category = "APP", details = NULL) {
  write_log("INFO", message, category, details)
}

#' Log Warning Message
#' @param message Character log message
#' @param category Character log category
#' @param details List additional details
log_warn <- function(message, category = "APP", details = NULL) {
  write_log("WARN", message, category, details)
}

#' Log Error Message
#' @param message Character log message
#' @param category Character log category
#' @param details List additional details
log_error <- function(message, category = "APP", details = NULL) {
  write_log("ERROR", message, category, details)
}

#' Log Fatal Error Message
#' @param message Character log message
#' @param category Character log category
#' @param details List additional details
log_fatal <- function(message, category = "APP", details = NULL) {
  write_log("FATAL", message, category, details)
}

# =============================================================================
# SPECIALIZED LOGGING FUNCTIONS
# =============================================================================

#' Log Data Operation
#' @param operation Character operation type (UPLOAD, DOWNLOAD, DELETE, etc.)
#' @param status Character operation status (SUCCESS, FAILED)
#' @param details List operation details
log_data_operation <- function(operation, status, details = NULL) {
  message <- sprintf("Data operation: %s - %s", operation, status)
  level <- if (status == "FAILED") "ERROR" else "INFO"
  write_log(level, message, category = "DATA", details = details)
}

#' Log Model Operation
#' @param model_type Character model type (LINEAR, LOGISTIC, etc.)
#' @param operation Character operation (FIT, PREDICT, VALIDATE)
#' @param status Character operation status
#' @param details List operation details (R-squared, coefficients, etc.)
log_model_operation <- function(model_type, operation, status, details = NULL) {
  message <- sprintf("Model %s: %s - %s", model_type, operation, status)
  level <- if (status == "FAILED") "ERROR" else "INFO"
  write_log(level, message, category = "MODEL", details = details)
}

#' Log PD Calculation
#' @param segment_id Character segment identifier
#' @param pd_type Character PD type (yearly, monthly, marginal, cumulative)
#' @param status Character calculation status
#' @param details List PD calculation details
log_pd_calculation <- function(segment_id, pd_type, status, details = NULL) {
  message <- sprintf("PD Calculation [%s]: %s - %s", segment_id, pd_type, status)
  level <- if (status == "FAILED") "ERROR" else "INFO"
  write_log(level, message, category = "PD", details = details)
}

#' Log Validation Result
#' @param validation_type Character validation type (RANGE, MONOTONICITY, ANOMALY)
#' @param result Character validation result (PASSED, FAILED, WARNING)
#' @param details List validation details
log_validation <- function(validation_type, result, details = NULL) {
  message <- sprintf("Validation %s: %s", validation_type, result)
  level <- switch(result,
    "PASSED" = "INFO",
    "WARNING" = "WARN",
    "FAILED" = "ERROR",
    "INFO"
  )
  write_log(level, message, category = "VALIDATION", details = details)
}

#' Log Database Operation
#' @param operation Character database operation (QUERY, INSERT, UPDATE, DELETE)
#' @param table_name Character table name
#' @param status Character operation status
#' @param details List operation details (rows affected, query time, etc.)
log_database <- function(operation, table_name, status, details = NULL) {
  message <- sprintf("Database %s on %s: %s", operation, table_name, status)
  level <- if (status == "FAILED") "ERROR" else "INFO"
  write_log(level, message, category = "DATABASE", details = details)
}

# =============================================================================
# PERFORMANCE LOGGING
# =============================================================================

#' Log Function Performance
#' @description Wrapper to log function execution time
#' @param func Function to execute and measure
#' @param func_name Character function name for logging
#' @param category Character log category
#' @return Result of function execution
log_performance <- function(func, func_name, category = "PERFORMANCE") {
  if (!LOG_CONFIG$log_performance) {
    return(func())
  }

  start_time <- Sys.time()

  result <- tryCatch({
    func()
  }, error = function(e) {
    end_time <- Sys.time()
    execution_time_ms <- as.numeric(difftime(end_time, start_time, units = "secs")) * 1000

    log_error(
      sprintf("%s execution failed after %.2f ms", func_name, execution_time_ms),
      category = category,
      details = list(
        error = e$message,
        execution_time_ms = execution_time_ms
      )
    )

    stop(e)
  })

  end_time <- Sys.time()
  execution_time_ms <- as.numeric(difftime(end_time, start_time, units = "secs")) * 1000

  # Only log if execution time exceeds threshold
  if (execution_time_ms >= LOG_CONFIG$performance_threshold_ms) {
    log_warn(
      sprintf("%s took %.2f ms (threshold: %.0f ms)",
              func_name, execution_time_ms, LOG_CONFIG$performance_threshold_ms),
      category = category,
      details = list(execution_time_ms = execution_time_ms)
    )
  } else {
    log_debug(
      sprintf("%s completed in %.2f ms", func_name, execution_time_ms),
      category = category,
      details = list(execution_time_ms = execution_time_ms)
    )
  }

  return(result)
}

# =============================================================================
# ERROR CONTEXT LOGGING
# =============================================================================

#' Log Error with Full Context
#' @description Logs error with complete context (stack trace, variables, etc.)
#' @param error Error object from tryCatch
#' @param context Character context description
#' @param category Character log category
log_error_context <- function(error, context = "Unknown", category = "ERROR") {
  # Get stack trace
  stack_trace <- tryCatch({
    paste(capture.output(traceback()), collapse = "\n")
  }, error = function(e) "Stack trace unavailable")

  # Get current environment variables (safely)
  env_vars <- tryCatch({
    ls(envir = parent.frame(n = 2))
  }, error = function(e) character(0))

  details <- list(
    context = context,
    error_message = error$message,
    error_call = as.character(error$call),
    stack_trace = stack_trace,
    available_variables = paste(env_vars, collapse = ", ")
  )

  log_error(
    sprintf("Error in %s: %s", context, error$message),
    category = category,
    details = details
  )
}

# =============================================================================
# LOG ANALYSIS FUNCTIONS
# =============================================================================

#' Get Log Summary
#' @description Returns summary statistics from log files
#' @param log_file Character log file to analyze (default: all)
#' @return Data frame with log summary
get_log_summary <- function(log_file = NULL) {
  tryCatch({
    if (is.null(log_file)) {
      log_files <- c(
        LOG_CONFIG$log_file_app,
        LOG_CONFIG$log_file_error,
        LOG_CONFIG$log_file_data,
        LOG_CONFIG$log_file_model,
        LOG_CONFIG$log_file_pd
      )
    } else {
      log_files <- log_file
    }

    summary_list <- lapply(log_files, function(lf) {
      log_path <- file.path(LOG_CONFIG$log_dir, lf)

      if (!file.exists(log_path)) {
        return(data.frame(
          log_file = lf,
          total_lines = 0,
          debug_count = 0,
          info_count = 0,
          warn_count = 0,
          error_count = 0,
          fatal_count = 0,
          file_size_mb = 0
        ))
      }

      lines <- readLines(log_path, warn = FALSE)

      data.frame(
        log_file = lf,
        total_lines = length(lines),
        debug_count = sum(grepl("\\[DEBUG\\]", lines)),
        info_count = sum(grepl("\\[INFO\\]", lines)),
        warn_count = sum(grepl("\\[WARN\\]", lines)),
        error_count = sum(grepl("\\[ERROR\\]", lines)),
        fatal_count = sum(grepl("\\[FATAL\\]", lines)),
        file_size_mb = round(file.info(log_path)$size / (1024 * 1024), 2)
      )
    })

    do.call(rbind, summary_list)

  }, error = function(e) {
    log_error("Failed to generate log summary", category = "SYSTEM",
              details = list(error = e$message))
    return(NULL)
  })
}

#' Clear All Logs
#' @description Removes all log files (use with caution)
#' @param confirm Logical must be TRUE to execute
#' @return Logical TRUE if successful
clear_all_logs <- function(confirm = FALSE) {
  if (!confirm) {
    cat("⚠️ Must set confirm=TRUE to clear all logs\n")
    return(FALSE)
  }

  tryCatch({
    log_files <- list.files(LOG_CONFIG$log_dir, pattern = "\\.log", full.names = TRUE)

    for (lf in log_files) {
      file.remove(lf)
    }

    cat("✅ Cleared", length(log_files), "log files\n")
    return(TRUE)

  }, error = function(e) {
    cat("❌ Failed to clear logs:", e$message, "\n")
    return(FALSE)
  })
}

# =============================================================================
# INITIALIZATION ON SOURCE
# =============================================================================

# Auto-initialize logging system when this file is sourced (only once)
if (!exists(".logging_initialized", envir = .GlobalEnv)) {
  tryCatch({
    init_logging()
    assign(".logging_initialized", TRUE, envir = .GlobalEnv)

    # Silent successful initialization to prevent log corruption
    if (Sys.getenv("R_ANALYTICS_DEBUG_MODE", "false") == "true") {
      cat("✅ Logging system loaded and ready\n")
      cat("📁 Log directory:", LOG_CONFIG$log_dir, "\n")
      cat("📝 Log files:\n")
      cat("  - Application:", LOG_CONFIG$log_file_app, "\n")
      cat("  - Errors:", LOG_CONFIG$log_file_error, "\n")
      cat("  - Data:", LOG_CONFIG$log_file_data, "\n")
      cat("  - Models:", LOG_CONFIG$log_file_model, "\n")
      cat("  - PD Calculations:", LOG_CONFIG$log_file_pd, "\n")
    }
  }, error = function(e) {
    cat("❌ Failed to initialize logging system:", e$message, "\n")
  })
}

# =============================================================================
# END OF ERROR LOGGING SYSTEM
# =============================================================================
