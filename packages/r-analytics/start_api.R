library(plumber)

# Log startup
cat("🚀 Starting R Analytics API Runner...\n")

# Port configuration from environment variable
port <- as.integer(Sys.getenv("R_SERVICE_PORT", "4241"))
host <- "0.0.0.0"

cat(paste("Configuration: Host=", host, ", Port=", port, "\n", sep=""))

# path to the API definition
api_file <- "iaf-r-api.R"

if (!file.exists(api_file)) {
  cat(paste("❌ Error: API definition file not found:", api_file, "\n"))
  quit(status = 1)
}

tryCatch({
  # Create router
  pr <- plumb(api_file)
  
  # Run the API
  cat(paste("✅ API running on http://", host, ":", port, "\n", sep=""))
  pr$run(host = host, port = port)
  
}, error = function(e) {
  cat(paste("❌ Error starting API:", e$message, "\n"))
  quit(status = 1)
})
