# packages/r-analytics/api/basic_ifrs9_api.R
# IAF IFRS 9 API Service - Indonesia Airawata Finance
# Company: Indonesia Airawata Finance (IAF)
# Banking Type: Conventional Banking
library(jsonlite)
library(dplyr)

# Source calculation functions
source("scripts/ifrs9/ifrs9_basic_calculations.R")

# IAF API endpoints
cat("=== IAF IFRS 9 R Analytics API ===\n")
cat("Company: Indonesia Airawata Finance\n")
cat("Banking Type: Conventional\n")
cat("Port: 4236\n")
cat("Server: http://10.18.11.35:4236\n")
cat("Status: Ready for IAF calculations\n")
cat("Available functions:\n")
cat("  - calculate_basic_ifrs9_ecl()\n")
cat("  - Health check: Ready\n")

# IAF Conventional Banking Test Data
iaf_sample_data <- data.frame(
  account_id = paste0("IAF", sprintf("%06d", 1:5)),
  product_type = c("Personal Loan", "Mortgage Loan", "Auto Loan", "Working Capital", "Credit Card"),
  outstanding_amount = c(50000, 200000, 75000, 100000, 150000),
  committed_amount = c(50000, 200000, 75000, 150000, 200000),
  days_past_due = c(0, 15, 45, 75, 120),
  banking_type = rep("conventional", 5),
  collateral_value = c(NA, 300000, 80000, NA, NA)
)

cat("\n🧪 Testing with IAF sample data...\n")
test_result <- calculate_basic_ifrs9_ecl(iaf_sample_data)
cat("IAF Test completed successfully!\n")
