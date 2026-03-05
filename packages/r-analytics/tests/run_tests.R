# =============================================================================
# MODULAR SHINY APP TEST RUNNER
# =============================================================================
# Run with: Rscript run_tests.R
# This will execute all tests in the tests/ directory to verify parity
# between the modular logic and app34.R.

if (!requireNamespace("testthat", quietly = TRUE)) {
  install.packages("testthat", repos = "http://cran.us.r-project.org")
}
library(testthat)

script_arg <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
script_path <- if (length(script_arg) > 0) sub("^--file=", "", script_arg[1]) else ""
tests_dir <- if (nzchar(script_path)) dirname(normalizePath(script_path)) else getwd()

cat("====================================================================\n")
cat("🚀 STARTING IFRS9 MODULAR PARITY TESTS\n")
cat("====================================================================\n\n")

# Run all test files in the current directory matching 'test_*.R'
test_dir(tests_dir, reporter = "summary")

cat("\n====================================================================\n")
cat("✅ TEST SUITE COMPLETED\n")
cat("====================================================================\n")
