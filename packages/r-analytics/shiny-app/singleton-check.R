#!/usr/bin/env Rscript

# =============================================================================
# SINGLETON CHECK - PREVENT MULTIPLE R ANALYTICS INSTANCES
# =============================================================================
# Purpose: Ensure only one R Analytics instance runs at a time
# Usage: Sourced from app.R to check for existing instances
# =============================================================================

check_singleton_instance <- function() {
  port <- Sys.getenv("R_PORT", "4236")
  pid_file <- paste0("/tmp/r-analytics-singleton-", port, ".pid")

  # Check if PID file exists
  if (file.exists(pid_file)) {
    # Read existing PID
    existing_pid <- readLines(pid_file, warn = FALSE)

    # Check if process is still running
    if (length(existing_pid) > 0) {
      tryCatch({
        # Check if process exists by sending signal 0 (no actual signal)
        if (Sys.info()["sysname"] == "Windows") {
          # Windows: Use tasklist
          result <- system(paste("tasklist /FI \"PID eq", existing_pid, "\" 2>NUL"), intern = TRUE, ignore.stderr = TRUE)
          process_exists <- any(grepl(existing_pid, result, fixed = TRUE))
        } else {
          # Unix/Linux: Use kill -0
          process_exists <- system(paste("kill -0", existing_pid, " 2>/dev/null"), ignore.stderr = TRUE) == 0
        }

        if (process_exists) {
          # Process is still running - abort startup
          stop(paste("R Analytics instance already running on port", port, "with PID", existing_pid))
        } else {
          # Process is dead - clean up stale PID file
          file.remove(pid_file)
        }
      }, error = function(e) {
        # If we can't check the process, assume it's dead and continue
        if (file.exists(pid_file)) {
          file.remove(pid_file)
        }
      })
    }
  }

  # Write current PID to file
  current_pid <- Sys.getpid()
  writeLines(as.character(current_pid), pid_file)

  # Set up cleanup on exit
  reg.finalizer(function() {
    if (file.exists(pid_file)) {
      file.remove(pid_file)
    }
  }, onexit = TRUE)

  return(TRUE)
}

# Clean up function to remove PID file
cleanup_singleton <- function() {
  port <- Sys.getenv("R_PORT", "4236")
  pid_file <- paste0("/tmp/r-analytics-singleton-", port, ".pid")

  if (file.exists(pid_file)) {
    file.remove(pid_file)
  }
}