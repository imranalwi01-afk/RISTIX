#!/usr/bin/env Rscript

# Debug script to load global.R line by line
cat("🔧 Starting detailed debug of global.R loading...\n")

# Change to shiny-app directory
setwd("shiny-app")

# Enable verbose error reporting
options(error = function() {
  cat("🚨 ERROR OCCURRED!\n")
  cat("📍 Line by line traceback:\n")
  traceback(2)
  cat("🎯 LAST FEW COMMANDS:\n")
  cat(sys.frames()[[1]]$sys.calls(), sep = "\n")
})

# Test loading each section
cat("\n📚 Loading base libraries...\n")
suppressPackageStartupMessages({
  library(shiny)
  library(shinydashboard)
  library(DT)
  library(data.table)
  library(dplyr)
  library(openxlsx)
  library(lmtest)
  library(car)
  library(combinat)
  library(tseries)
  library(forecast)
  library(MASS)
  library(nortest)
  library(tibble)
  library(ggplot2)
  library(plotly)
  library(shinyWidgets)
  library(DBI)
  library(RPostgres)
  library(lubridate)
  library(shinycssloaders)
  library(future)
  library(future.apply)
})

cat("✅ Base libraries loaded successfully\n")

# Load config files
cat("\n🔧 Loading configuration files...\n")
if (file.exists("config/database.R")) {
  source("config/database.R")
  cat("✅ Database config loaded\n")
}

if (file.exists("config/logging.R")) {
  source("config/logging.R")
  cat("✅ Logging config loaded\n")
}

if (file.exists("config/auth.R")) {
  source("config/auth.R")
  cat("✅ Auth config loaded\n")
}

# Load utility files one by one
cat("\n🛠️ Loading utility files...\n")

util_files <- c(
  "utils/data_processing.R",
  "utils/database_utils.R",
  "utils/forecasting.R",
  "utils/pd_calculations.R",
  "utils/statistical_modeling.R"
)

for (util_file in util_files) {
  if (file.exists(util_file)) {
    cat("📂 Loading:", util_file, "... ")
    tryCatch({
      source(util_file, local = TRUE)
      cat("✅\n")
    }, error = function(e) {
      cat("❌ ERROR:", e$message, "\n")
      traceback(2)
      quit(status = 1)
    })
  } else {
    cat("⚠️ Not found:", util_file, "\n")
  }
}

cat("\n✅ All utility files loaded successfully\n")
cat("🎉 global.R loading completed without errors!\n")