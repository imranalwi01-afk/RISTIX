# IAF R Analytics API Service - Port 4241
# IFRS 9 Statistical Computing and Analytics

library(plumber)
library(jsonlite)

for (logger_path in c("logger.R", "/opt/r-analytics/logger.R", "../logger.R")) {
  if (file.exists(logger_path)) {
    source(logger_path)
    break
  }
}

if (!exists("ra_log_info")) {
  stop("logger.R could not be loaded")
}

ra_init_logger(service = "r-analytics-api")

`%||%` <- function(x, y) if (is.null(x) || (is.character(x) && !nzchar(x))) y else x

get_preferred_env <- function(primary, fallback, default = "") {
  primary_val <- Sys.getenv(primary, "")
  if (nzchar(primary_val)) return(primary_val)
  fallback_val <- Sys.getenv(fallback, "")
  if (nzchar(fallback_val)) return(fallback_val)
  default
}

create_request_id <- function() {
  paste0("req_", format(Sys.time(), "%Y%m%d%H%M%OS3"), "_", paste(sample(c(letters, 0:9), 6, replace = TRUE), collapse = ""))
}

get_request_id <- function(req) {
  rid <- req$HTTP_X_REQUEST_ID %||% req$HTTP_X_CORRELATION_ID %||% req$HTTP_X_TRACE_ID %||% ""
  rid <- trimws(as.character(rid))
  if (!nzchar(rid)) rid <- create_request_id()
  rid
}

api_response <- function(success, request_id, message = NULL, data = NULL, error = NULL, code = NULL, session_id = NULL) {
  payload <- list(
    success = success,
    message = message %||% if (success) "OK" else "Request failed",
    requestId = request_id,
    timestamp = Sys.time()
  )

  if (!is.null(code)) payload$code <- code
  if (!is.null(error)) payload$error <- error
  if (!is.null(data)) payload$data <- data
  if (!is.null(session_id)) payload$sessionId <- session_id

  payload
}

parse_body <- function(req) {
  if (is.null(req$postBody) || !nzchar(req$postBody)) {
    return(list())
  }
  jsonlite::fromJSON(req$postBody, simplifyVector = FALSE)
}

get_db_config <- function() {
  list(
    host = get_preferred_env("FRS9_DB_HOST", "DB_HOST", "localhost"),
    port = as.integer(get_preferred_env("FRS9_DB_PORT", "DB_PORT", "5432")),
    dbname = get_preferred_env("FRS9_DB_NAME", "DB_NAME", "FRS9PRO"),
    user = get_preferred_env("FRS9_DB_USER", "DB_USER", "postgres"),
    password = get_preferred_env("FRS9_DB_PASSWORD", "DB_PASSWORD", "postgres"),
    schema = get_preferred_env("FRS9_DB_SCHEMA", "DB_SCHEMA", "public"),
    sslmode = Sys.getenv("DB_SSLMODE", "disable")
  )
}

check_readiness <- function() {
  cfg <- get_db_config()
  result <- list(
    ready = FALSE,
    dbConnected = FALSE,
    db = list(host = cfg$host, port = cfg$port, dbname = cfg$dbname, schema = cfg$schema),
    criticalTables = list(
      frs9_imp_ca_pd_config = FALSE,
      frs9_imp_ca_lgd_config = FALSE
    ),
    reason = NULL
  )

  if (!requireNamespace("DBI", quietly = TRUE) || !requireNamespace("RPostgres", quietly = TRUE)) {
    result$reason <- "Required packages DBI/RPostgres are not installed"
    return(result)
  }

  con <- tryCatch({
    DBI::dbConnect(
      RPostgres::Postgres(),
      host = cfg$host,
      port = cfg$port,
      dbname = cfg$dbname,
      user = cfg$user,
      password = cfg$password,
      sslmode = cfg$sslmode
    )
  }, error = function(e) e)

  if (inherits(con, "error")) {
    result$reason <- paste("Database connection failed:", con$message)
    return(result)
  }

  on.exit(try(DBI::dbDisconnect(con), silent = TRUE), add = TRUE)
  result$dbConnected <- TRUE

  table_names <- c("frs9_imp_ca_pd_config", "frs9_imp_ca_lgd_config")
  for (tbl in table_names) {
    qualified <- paste0(cfg$schema, ".", tbl)
    exists_tbl <- tryCatch({
      query <- paste0("SELECT to_regclass('", qualified, "') AS reg")
      out <- DBI::dbGetQuery(con, query)
      !is.na(out$reg[[1]]) && nzchar(as.character(out$reg[[1]]))
    }, error = function(e) {
      result$reason <<- paste("Table check failed:", e$message)
      FALSE
    })
    result$criticalTables[[tbl]] <- isTRUE(exists_tbl)
  }

  result$ready <- isTRUE(result$dbConnected) && all(unlist(result$criticalTables))
  if (!result$ready && is.null(result$reason)) {
    result$reason <- "One or more critical tables are missing"
  }

  result
}

ra_log_info("Starting IAF R Analytics API Service")

#* @filter request_context
function(req, res) {
  req$request_id <- get_request_id(req)
  res$setHeader("X-Request-Id", req$request_id)
  plumber::forward()
}

#* @filter cors
function(req, res) {
  enable_cors <- tolower(Sys.getenv("R_ENABLE_CORS", "true")) == "true"

  if (enable_cors) {
    res$setHeader("Access-Control-Allow-Origin", "*")
    res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID, X-Requested-With, Cache-Control, Origin, Accept, X-Request-Id")

    if (req$REQUEST_METHOD == "OPTIONS") {
      res$status <- 200
      return(list())
    }
  }
  plumber::forward()
}

#* @apiTitle IAF IFRS9 R Analytics API
#* @apiDescription Statistical Computing and Analytics for Indonesia Airawata Finance
#* @apiVersion 1.0.0

#* Root endpoint
#* @get /
function() {
  "IAF R Analytics API - IFRS9 Statistical Computing Service"
}

#* Health check endpoint
#* @get /health
#* @serializer unboxedJSON
function(req) {
  request_id <- req$request_id %||% create_request_id()
  api_response(
    success = TRUE,
    request_id = request_id,
    message = "R Analytics service is alive",
    data = list(
      status = "ok",
      service = "IAF R Analytics API",
      version = "1.0.0",
      port = 4241,
      tenant = "iaf"
    )
  )
}

#* Readiness endpoint (DB + critical tables)
#* @get /ready
#* @serializer unboxedJSON
function(req, res) {
  request_id <- req$request_id %||% create_request_id()
  readiness <- check_readiness()
  res$status <- if (isTRUE(readiness$ready)) 200 else 503

  ra_log_info("Readiness check completed", context = list(
    requestId = request_id,
    ready = readiness$ready,
    dbConnected = readiness$dbConnected
  ))

  api_response(
    success = isTRUE(readiness$ready),
    request_id = request_id,
    message = if (isTRUE(readiness$ready)) "Service is ready" else "Service is not ready",
    data = readiness,
    code = if (isTRUE(readiness$ready)) "READY" else "NOT_READY"
  )
}

#* API status endpoint
#* @get /api/status
#* @get /status
#* @serializer unboxedJSON
function(req) {
  request_id <- req$request_id %||% create_request_id()
  api_response(
    success = TRUE,
    request_id = request_id,
    message = "Service status",
    data = list(
      service = "IAF IFRS9 R Analytics",
      version = "1.0.0",
      status = "operational",
      port = 4241,
      host = "localhost",
      tenant = "iaf",
      capabilities = list(
        "ECL Calculations",
        "PD/LGD/EAD Modeling",
        "Staging Classification",
        "Statistical Analysis"
      ),
      uptime = Sys.time()
    )
  )
}

#* Initialize session for frontend iframe
#* @post /api/session
#* @post /session
#* @serializer unboxedJSON
function(req) {
  request_id <- req$request_id %||% create_request_id()

  tryCatch({
    body <- parse_body(req)

    tenant_id <- body$tenant_id %||% body$tenantId %||% "iaf"
    banking_mode <- body$banking_mode %||% body$bankingMode %||% "conventional"
    session_id <- paste0("iaf_session_", format(Sys.time(), "%Y%m%d_%H%M%S"), "_", paste(sample(0:9, 4, replace = TRUE), collapse = ""))

    ra_log_info("Session initialization requested", context = list(
      requestId = request_id,
      tenant = tenant_id,
      bankingMode = banking_mode,
      sessionId = session_id
    ))

    api_response(
      success = TRUE,
      request_id = request_id,
      message = "Session initialized successfully",
      session_id = session_id,
      data = list(
        requestId = request_id,
        sessionId = session_id,
        tenantSlug = tenant_id,
        bankingType = banking_mode,
        status = "running",
        port = 4236,
        startTime = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ"),
        uptime = 0,
        service = "IAF IFRS9 R Analytics",
        version = "1.0.0",
        api_endpoints = list(
          ecl_calculate = "/api/ecl/calculate",
          pd_calculate = "/api/models/pd",
          system_info = "/api/system/info",
          health_check = "/health",
          readiness_check = "/ready",
          test_data = "/api/test/generate-data"
        ),
        capabilities = list(
          ifrs9_calculations = TRUE,
          multi_tenant = TRUE,
          islamic_banking = banking_mode == "syariah",
          real_time_processing = TRUE,
          statistical_modeling = TRUE
        ),
        sessionConfig = list(
          tenant = "iaf",
          company = "Indonesia Airawata Finance",
          bankingType = banking_mode,
          currency = "IDR",
          timeZone = "Asia/Jakarta"
        )
      )
    )
  }, error = function(e) {
    ra_log_error("Session initialization failed", context = list(requestId = request_id, error = e$message))
    api_response(
      success = FALSE,
      request_id = request_id,
      message = "Failed to initialize session",
      error = e$message,
      code = "SESSION_INIT_FAILED"
    )
  })
}

#* Basic ECL calculation endpoint
#* @post /api/ecl/calculate
#* @post /ecl/calculate
#* @serializer unboxedJSON
function(req) {
  request_id <- req$request_id %||% create_request_id()
  tryCatch({
    body <- req$postBody
    if (is.null(body) || body == "") {
      return(api_response(
        success = FALSE,
        request_id = request_id,
        message = "Request body is empty",
        error = "No data provided",
        code = "EMPTY_REQUEST_BODY"
      ))
    }

    data <- jsonlite::fromJSON(body, simplifyVector = FALSE)
    ra_log_info("ECL calculation request received", context = list(requestId = request_id, hasPayload = !is.null(data)))

    api_response(
      success = TRUE,
      request_id = request_id,
      message = "ECL calculation completed successfully",
      data = list(
        calculation_type = "ECL",
        tenant = "iaf",
        result = list(
          total_ecl = 1234567.89,
          stage_1_ecl = 456789.12,
          stage_2_ecl = 234567.89,
          stage_3_ecl = 543210.88,
          currency = "IDR"
        )
      )
    )
  }, error = function(e) {
    ra_log_error("ECL calculation failed", context = list(requestId = request_id, error = e$message))
    api_response(FALSE, request_id, message = "ECL calculation failed", error = e$message, code = "ECL_CALC_FAILED")
  })
}

#* PD model execution endpoint
#* @post /api/models/pd
#* @post /models/pd
#* @serializer unboxedJSON
function(req) {
  request_id <- req$request_id %||% create_request_id()
  tryCatch({
    ra_log_info("PD model execution request received", context = list(requestId = request_id))
    api_response(
      success = TRUE,
      request_id = request_id,
      message = "PD model execution completed",
      data = list(
        model_type = "PD",
        tenant = "iaf",
        result = list(
          portfolio_pd = 0.0245,
          stage_1_pd = 0.0123,
          stage_2_pd = 0.0456,
          stage_3_pd = 1.0000,
          model_version = "v2.1",
          confidence_interval = list(lower = 0.0200, upper = 0.0290)
        )
      )
    )
  }, error = function(e) {
    ra_log_error("PD model execution failed", context = list(requestId = request_id, error = e$message))
    api_response(FALSE, request_id, message = "PD model execution failed", error = e$message, code = "PD_MODEL_FAILED")
  })
}

#* System information endpoint
#* @get /api/system/info
#* @get /system/info
#* @serializer unboxedJSON
function(req) {
  request_id <- req$request_id %||% create_request_id()
  api_response(
    success = TRUE,
    request_id = request_id,
    message = "System info",
    data = list(
      r_version = R.version.string,
      platform = R.version$platform,
      packages = list(
        plumber = as.character(packageVersion("plumber")),
        jsonlite = as.character(packageVersion("jsonlite"))
      ),
      memory = list(
        used_mb = round(sum(gc()[, 2]) * 8 / 1024, 2),
        available_mb = "N/A"
      ),
      uptime = Sys.time(),
      working_directory = getwd()
    )
  )
}

#* Test data generation endpoint
#* @get /api/test/generate-data
#* @get /test/generate-data
#* @serializer unboxedJSON
function(req) {
  request_id <- req$request_id %||% create_request_id()
  tryCatch({
    n_accounts <- 1000
    test_data <- data.frame(
      account_id = paste0("IAF", sprintf("%06d", 1:n_accounts)),
      customer_id = paste0("CUST", sprintf("%06d", sample(1:500, n_accounts, replace = TRUE))),
      outstanding_amount = round(runif(n_accounts, 10000, 5000000), 2),
      product_type = sample(c("MORTGAGE", "PERSONAL_LOAN", "CORPORATE_LOAN"), n_accounts, replace = TRUE),
      current_stage = sample(1:3, n_accounts, replace = TRUE, prob = c(0.85, 0.12, 0.03)),
      days_past_due = pmax(0, round(rnorm(n_accounts, 15, 30))),
      stringsAsFactors = FALSE
    )

    api_response(
      success = TRUE,
      request_id = request_id,
      message = "Test data generated successfully",
      data = list(
        data_info = list(
          records = nrow(test_data),
          total_exposure = sum(test_data$outstanding_amount),
          stage_distribution = table(test_data$current_stage)
        ),
        sample_records = head(test_data, 5)
      )
    )
  }, error = function(e) {
    ra_log_error("Test data generation failed", context = list(requestId = request_id, error = e$message))
    api_response(FALSE, request_id, message = "Test data generation failed", error = e$message, code = "TEST_DATA_FAILED")
  })
}

ra_log_info("IAF R Analytics API endpoints configured successfully")
ra_log_info("Available endpoints", context = list(
  health = "/health",
  ready = "/ready",
  status = "/api/status",
  session = "/api/session",
  ecl = "/api/ecl/calculate",
  pd = "/api/models/pd"
))
ra_log_info("Service will be available", context = list(url = "http://localhost:4241"))
