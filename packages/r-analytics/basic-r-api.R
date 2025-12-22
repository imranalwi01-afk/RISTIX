library(jsonlite)
library(dplyr)

cat("=== Basic R Analytics Service ===\n")
cat("Loaded packages: jsonlite, dplyr\n")
cat("Port: 8001 (simulated)\n")
cat("Status: Ready for basic IFRS 9 calculations\n")

# Basic calculation functions are loaded from our generated scripts
source("scripts/ifrs9/ifrs9_calculations.R")

cat("IFRS 9 calculation functions loaded successfully!\n")
cat("Service ready!\n")

# Keep R session alive
while(TRUE) {
  Sys.sleep(5)
  cat(".")
}
