library(plumber)

# Load runtime logger
for (logger_path in c("logger.R", "/opt/r-analytics/logger.R")) {
  if (file.exists(logger_path)) {
    source(logger_path)
    break
  }
}

if (!exists("ra_log_info")) {
  stop("logger.R could not be loaded")
}

ra_init_logger(service = "r-analytics-api-runner")
ra_log_info("Starting R Analytics API Runner")

# Port configuration from environment variable
port <- as.integer(Sys.getenv("R_SERVICE_PORT", "4241"))
host <- "0.0.0.0"

ra_log_info("API runtime configuration loaded", context = list(host = host, port = port))

# path to the API definition
api_file <- "iaf-r-api.R"

if (!file.exists(api_file)) {
  ra_log_error("API definition file not found", context = list(api_file = api_file))
  quit(status = 1)
}

tryCatch({
  # Create router
  pr <- plumb(api_file)
  
  # Run the API
  ra_log_info("API router initialized", context = list(url = paste0("http://", host, ":", port)))
  pr$run(host = host, port = port)
  
}, error = function(e) {
  ra_log_error("Error starting API", context = list(error = e$message))
  quit(status = 1)
})
