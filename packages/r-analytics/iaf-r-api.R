# IAF R Analytics API Service - Port 4241
# IFRS 9 Statistical Computing and Analytics

library(plumber)
library(jsonlite)

# Logging function
log_info <- function(message) {
  cat(paste("[", Sys.time(), "] INFO:", message, "\n"), file = stderr())
}

log_error <- function(message) {
  cat(paste("[", Sys.time(), "] ERROR:", message, "\n"), file = stderr())
}

log_info("🚀 Starting IAF R Analytics API Service...")

#* @filter cors
function(res) {
  # Remove explicit Origin header to avoid conflict with upstream proxy (Nginx/Ingress)
  # res$setHeader("Access-Control-Allow-Origin", "*") 
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID, Origin, Accept")
  plumber::forward()
}

#* @options /api/session
#* @options /session
#* @options /api/ecl/calculate
#* @options /ecl/calculate
#* @options /api/models/pd
#* @options /models/pd
#* @options /health
#* @options /api/status
#* @options /status
#* @options /api/system/info
#* @options /system/info
#* @options /api/test/generate-data
#* @options /test/generate-data
function(res) {
  # Remove explicit Origin header to prevent conflict
  # res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID, Origin, Accept")
  res$status <- 200
  return(list())
}

#* @apiTitle IAF IFRS9 R Analytics API
#* @apiDescription Statistical Computing and Analytics for Indonesia Airawata Finance
#* @apiVersion 1.0.0

#* Health check endpoint
#* @get /health
#* @serializer unboxedJSON
function() {
  list(
    status = "ok",
    service = "IAF R Analytics API",
    version = "1.0.0",
    timestamp = Sys.time(),
    port = 4241,
    tenant = "iaf",
    message = "R Analytics service is operational"
  )
}

#* Root endpoint
#* @get /
function() {
  "IAF R Analytics API - IFRS9 Statistical Computing Service"
}

#* API status endpoint
#* @get /api/status
#* @get /status
#* @serializer unboxedJSON
function() {
  list(
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
}

#* Initialize session for frontend iframe
#* @post /api/session
#* @post /session
#* @serializer unboxedJSON
function(req) {
  tryCatch({
    log_info("Frontend session initialization request received")

    # Parse request body if provided
    body <- list()
    if (!is.null(req$postBody) && req$postBody != "") {
      body <- jsonlite::fromJSON(req$postBody, simplifyVector = FALSE)
    }

    # Extract session parameters
    tenant_id <- if (!is.null(body$tenant_id)) body$tenant_id else if (!is.null(body$tenantId)) body$tenantId else "iaf"
    banking_mode <- if (!is.null(body$banking_mode)) body$banking_mode else if (!is.null(body$bankingMode)) body$bankingMode else "conventional"

    log_info(paste("Initializing session for tenant:", tenant_id, "banking mode:", banking_mode))

    # Create session response
    session_id <- paste0("iaf_session_", format(Sys.time(), "%Y%m%d_%H%M%S"))

    result <- list(
      success = TRUE,
      message = "Session initialized successfully",
      data = list(
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
      ),
      timestamp = Sys.time()
    )

    log_info(paste("Session initialized successfully with ID:", session_id))
    return(result)

  }, error = function(e) {
    log_error(paste("Session initialization error:", e$message))
    return(list(
      success = FALSE,
      error = e$message,
      message = "Failed to initialize session",
      timestamp = Sys.time()
    ))
  })
}

#* Basic ECL calculation endpoint
#* @post /api/ecl/calculate
#* @post /ecl/calculate
#* @serializer unboxedJSON
function(req) {
  tryCatch({
    log_info("ECL calculation request received")
    
    # Parse request body
    body <- req$postBody
    if (is.null(body) || body == "") {
      return(list(
        success = FALSE,
        error = "No data provided",
        message = "Request body is empty"
      ))
    }
    
    data <- jsonlite::fromJSON(body, simplifyVector = FALSE)
    
    # Basic ECL calculation simulation
    # In production, this would use actual IFRS 9 models
    result <- list(
      success = TRUE,
      calculation_type = "ECL",
      tenant = "iaf",
      timestamp = Sys.time(),
      result = list(
        total_ecl = 1234567.89,
        stage_1_ecl = 456789.12,
        stage_2_ecl = 234567.89,
        stage_3_ecl = 543210.88,
        currency = "IDR"
      ),
      message = "ECL calculation completed successfully"
    )
    
    log_info("ECL calculation completed")
    return(result)
    
  }, error = function(e) {
    log_error(paste("ECL calculation error:", e$message))
    return(list(
      success = FALSE,
      error = e$message,
      timestamp = Sys.time()
    ))
  })
}

#* PD model execution endpoint
#* @post /api/models/pd
#* @post /models/pd
#* @serializer unboxedJSON  
function(req) {
  tryCatch({
    log_info("PD model execution request received")
    
    result <- list(
      success = TRUE,
      model_type = "PD",
      tenant = "iaf",
      timestamp = Sys.time(),
      result = list(
        portfolio_pd = 0.0245,
        stage_1_pd = 0.0123,
        stage_2_pd = 0.0456,
        stage_3_pd = 1.0000,
        model_version = "v2.1",
        confidence_interval = list(lower = 0.0200, upper = 0.0290)
      ),
      message = "PD model execution completed"
    )
    
    log_info("PD model execution completed")
    return(result)
    
  }, error = function(e) {
    log_error(paste("PD model error:", e$message))
    return(list(
      success = FALSE,
      error = e$message,
      timestamp = Sys.time()
    ))
  })
}

#* System information endpoint
#* @get /api/system/info
#* @get /system/info
#* @serializer unboxedJSON
function() {
  list(
    r_version = R.version.string,
    platform = R.version$platform,
    packages = list(
      plumber = as.character(packageVersion("plumber")),
      jsonlite = as.character(packageVersion("jsonlite"))
    ),
    memory = list(
      used_mb = round(sum(gc()[,2]) * 8 / 1024, 2),
      available_mb = "N/A"
    ),
    uptime = Sys.time(),
    working_directory = getwd()
  )
}

#* Test data generation endpoint
#* @get /api/test/generate-data
#* @get /test/generate-data
#* @serializer unboxedJSON
function() {
  tryCatch({
    # Generate sample portfolio data for testing
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
    
    list(
      success = TRUE,
      message = "Test data generated successfully",
      data_info = list(
        records = nrow(test_data),
        total_exposure = sum(test_data$outstanding_amount),
        stage_distribution = table(test_data$current_stage)
      ),
      sample_records = head(test_data, 5),
      timestamp = Sys.time()
    )
    
  }, error = function(e) {
    log_error(paste("Test data generation error:", e$message))
    return(list(
      success = FALSE,
      error = e$message,
      timestamp = Sys.time()
    ))
  })
}

# Log successful API setup
log_info("✅ IAF R Analytics API endpoints configured successfully")
log_info("📊 Available endpoints: /health, /api/status, /api/session, /api/ecl/calculate, /api/models/pd")
log_info("🔗 Service will be available at: http://localhost:4241")