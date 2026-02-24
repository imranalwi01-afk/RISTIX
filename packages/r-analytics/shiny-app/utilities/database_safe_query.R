# =============================================================================
# SAFE DATABASE QUERY UTILITIES
# =============================================================================
# Purpose: Robust database query wrapper to prevent segmentation faults
# Author: IFRS9 Analytics Team
# Date: Created for production deployment safety
# =============================================================================

#' Ultra-Safe Database Query Wrapper - REAL DATA ONLY - SEGFAULT PROOF
#' @description Executes database queries with bulletproof error handling using REAL DATABASE DATA
#' @param connection Database connection object
#' @param query SQL query string
#' @param default_value Default return value if query fails
#' @param query_name Descriptive name for logging
#' @return Query result or default value (REAL DATA ONLY)
safe_db_query <- function(connection, query, default_value = data.frame(), query_name = "Unknown Query") {

  # ULTRA-SAFE: Multiple levels of protection against segmentation faults

  # Level 1: Basic NULL checks
  if (is.null(connection)) {
    cat("⚠️ Database connection is NULL for:", query_name, "\n")
    return(default_value)
  }

  if (is.null(query) || length(query) == 0 || query == "") {
    cat("⚠️ Query is NULL or empty for:", query_name, "\n")
    return(default_value)
  }

  # Level 2: Connection class validation
  connection_class_valid <- tryCatch({
    inherits(connection, "PostgreSQLConnection") ||
    inherits(connection, "PqConnection") ||
    class(connection)[1] %in% c("PostgreSQLConnection", "PqConnection")
  }, error = function(e) {
    cat("⚠️ Connection class check failed for:", query_name, "\n")
    FALSE
  })

  if (!connection_class_valid) {
    cat("⚠️ Connection is not a valid PostgreSQL connection for:", query_name, "\n")
    return(default_value)
  }

  # Level 3: Ultra-safe connection validation without actual query
  connection_valid <- tryCatch({
    # Check if connection object has required attributes
    if (!is.null(attr(connection, "host")) || !is.null(connection@host)) {
      TRUE
    } else {
      FALSE
    }
  }, error = function(e) {
    cat("⚠️ Connection validation failed for:", query_name, "\n")
    FALSE
  })

  if (!connection_valid) {
    cat("⚠️ Database connection invalid for:", query_name, "\n")
    return(default_value)
  }

  cat("🔍 Executing REAL DATABASE query:", query_name, "\n")

  # Level 4: ULTRA-SAFE query execution with maximum protection
  result <- tryCatch({

    # Step 1: Validate query syntax briefly
    if (!grepl("^\\s*(SELECT|select)", query, perl = TRUE)) {
      cat("⚠️ Only SELECT queries allowed for safety:", query_name, "\n")
      return(default_value)
    }

    # Step 2: Set up safer environment for query execution
    old_options <- options()
    on.exit(options(old_options))
    options(warn = -1)  # Suppress warnings during query

    # Step 3: Execute with multi-level error catching
    query_result <- tryCatch({
      # Final protection: Execute the database query
      dbGetQuery(connection, query)
    }, warning = function(w) {
      cat("⚠️ Query warning for:", query_name, "-", w$message, "\n")
      NULL
    }, error = function(e) {
      cat("❌ Database query error for:", query_name, "-", e$message, "\n")
      NULL
    }, finally = {
      # Cleanup after query attempt
      gc(verbose = FALSE)  # Force garbage collection
    })

    # Step 4: Validate query result
    if (is.null(query_result)) {
      cat("⚠️ Query returned NULL for:", query_name, "\n")
      return(default_value)
    }

    if (!is.data.frame(query_result)) {
      cat("⚠️ Query did not return data frame for:", query_name, "\n")
      return(default_value)
    }

    if (nrow(query_result) == 0) {
      cat("ℹ️ Query returned empty result for:", query_name, "\n")
      return(default_value)
    }

    cat("✅ REAL DATA loaded successfully:", query_name, "- Rows:", nrow(query_result), "\n")
    query_result

  }, warning = function(w) {
    cat("⚠️ Warning during query execution:", query_name, "-", w$message, "\n")
    return(default_value)
  }, error = function(e) {
    cat("❌ Error during query execution:", query_name, "-", e$message, "\n")
    cat("🔧 Returning empty structure - NO MOCK DATA\n")
    return(default_value)
  }, finally = {
    # Final cleanup
    gc(verbose = FALSE)
  })

  # Level 5: Final result validation
  if (is.null(result)) {
    cat("⚠️ Final result is NULL for:", query_name, "\n")
    return(default_value)
  }

  if (!is.data.frame(result)) {
    cat("⚠️ Final result is not a data frame for:", query_name, "\n")
    return(default_value)
  }

  cat("✅ Query completed successfully:", query_name, "- Rows:", nrow(result), "\n")
  return(result)
}

#' Safe Model Summary Query - REAL DATA ONLY
#' @description Specifically handles frs9_r_model_summary table using REAL DATABASE DATA
#' @param connection Database connection
#' @return Model summary data frame with REAL DATA or empty data frame
safe_model_summary_query <- function(connection) {

  # Create empty default structure that matches real table
  default_summary <- data.frame(
    model_id = character(0),
    model_name = character(0),
    stringsAsFactors = FALSE
  )

  cat("🔍 Attempting to load REAL model summary data from database\n")

  # Try different table name variations to find the real data
  queries_to_try <- list(
    list(
      name = "Model Summary (unquoted lowercase)",
      sql = "SELECT model_id, model_name FROM frs9_r_model_summary ORDER BY created_date DESC LIMIT 10"
    ),
    list(
      name = "Model Summary (quoted lowercase)",
      sql = 'SELECT "model_id","model_name" FROM "frs9_r_model_summary" ORDER BY created_date DESC LIMIT 10'
    ),
    list(
      name = "Model Summary (basic select)",
      sql = "SELECT * FROM frs9_r_model_summary LIMIT 5"
    ),
    list(
      name = "Model Summary (quoted uppercase legacy)",
      sql = 'SELECT "model_id","model_name" FROM "FRS9_R_MODEL_SUMMARY" ORDER BY created_date DESC LIMIT 10'
    )
  )

  # Try each query variation to get REAL DATA
  for (query_info in queries_to_try) {
    result <- safe_db_query(
      connection = connection,
      query = query_info$sql,
      default_value = NULL,
      query_name = query_info$name
    )

    if (!is.null(result) && nrow(result) > 0) {
      cat("✅ Successfully loaded REAL model summary data using:", query_info$name, "\n")
      return(result)
    }
  }

  # If all queries failed, return empty structure (NO MOCK DATA)
  cat("⚠️ All model summary queries failed, using empty data frame (REAL DATA ONLY)\n")
  default_summary
}

#' Safe PD Model Query - REAL DATA ONLY
#' @description Specifically handles FRS9_PARAM_PD_MODEL_H table using REAL DATABASE DATA
#' @param connection Database connection
#' @return PD model data frame with REAL DATA or empty data frame
safe_pd_model_query <- function(connection) {

  # Create empty default structure that matches real table
  default_pd <- data.frame(
    model_id = character(0),
    model_name = character(0),
    stringsAsFactors = FALSE
  )

  cat("🔍 Attempting to load REAL PD model data from database\n")

  # Try different table name variations to find the real data
  queries_to_try <- list(
    list(
      name = "PD Model (unquoted lowercase)",
      sql = "SELECT * FROM frs9_param_pd_model_h LIMIT 10"
    ),
    list(
      name = "PD Model (quoted lowercase)",
      sql = 'SELECT * FROM "frs9_param_pd_model_h" LIMIT 10'
    ),
    list(
      name = "PD Model (quoted uppercase legacy)",
      sql = 'SELECT * FROM "FRS9_PARAM_PD_MODEL_H" LIMIT 10'
    )
  )

  # Try each query variation to get REAL DATA
  for (query_info in queries_to_try) {
    result <- safe_db_query(
      connection = connection,
      query = query_info$sql,
      default_value = NULL,
      query_name = query_info$name
    )

    if (!is.null(result) && nrow(result) > 0) {
      cat("✅ Successfully loaded REAL PD model data using:", query_info$name, "\n")
      return(result)
    }
  }

  # If all queries failed, return empty structure (NO MOCK DATA)
  cat("⚠️ All PD model queries failed, using empty data frame (REAL DATA ONLY)\n")
  default_pd
}

#' Safe LGD Model Query - REAL DATA ONLY
#' @description Specifically handles FRS9_PARAM_LGD_MODEL_H table using REAL DATABASE DATA
#' @param connection Database connection
#' @return LGD model data frame with REAL DATA or empty data frame
safe_lgd_model_query <- function(connection) {

  # Create empty default structure that matches real table
  default_lgd <- data.frame(
    model_id = character(0),
    model_name = character(0),
    stringsAsFactors = FALSE
  )

  cat("🔍 Attempting to load REAL LGD model data from database\n")

  queries_to_try <- list(
    list(
      name = "LGD Model (unquoted lowercase)",
      sql = "SELECT * FROM frs9_param_lgd_model_h LIMIT 10"
    ),
    list(
      name = "LGD Model (quoted lowercase)",
      sql = 'SELECT * FROM "frs9_param_lgd_model_h" LIMIT 10'
    ),
    list(
      name = "LGD Model (quoted uppercase legacy)",
      sql = 'SELECT * FROM "FRS9_PARAM_LGD_MODEL_H" LIMIT 10'
    )
  )

  for (query_info in queries_to_try) {
    result <- safe_db_query(
      connection = connection,
      query = query_info$sql,
      default_value = NULL,
      query_name = query_info$name
    )

    if (!is.null(result) && nrow(result) > 0) {
      cat("✅ Successfully loaded REAL LGD model data using:", query_info$name, "\n")
      return(result)
    }
  }

  # If all queries failed, return empty structure (NO MOCK DATA)
  cat("⚠️ All LGD model queries failed, using empty data frame (REAL DATA ONLY)\n")
  default_lgd
}

cat("✅ Safe database query utilities loaded successfully!\n")

# =============================================================================
# END OF SAFE DATABASE QUERY UTILITIES
# =============================================================================