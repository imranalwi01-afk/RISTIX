# Install required R packages for IFRS 9 analytics
# packages/r-analytics/install-packages.R

# Set CRAN mirror
options(repos = c(CRAN = "https://cran.rstudio.com/"))

# Define required packages
required_packages <- c(
  # Database connectivity
  "DBI",
  "RPostgreSQL",
  "odbc",
  
  # Data manipulation
  "dplyr",
  "tidyr",
  "data.table",
  "lubridate",
  
  # Statistical modeling
  "survival",
  "MASS",
  "forecast",
  "VaR",
  "PerformanceAnalytics",
  
  # Financial modeling
  "quantmod",
  "RQuantLib",
  "fBasics",
  
  # Machine learning
  "randomForest",
  "glmnet",
  "caret",
  
  # JSON and API
  "jsonlite",
  "httr",
  "curl",
  
  # Visualization
  "ggplot2",
  "plotly",
  "lattice",
  
  # Web service
  "plumber",
  "httpuv",
  
  # Utilities
  "devtools",
  "testthat",
  "logr"
)

# Function to install packages if not already installed
install_if_missing <- function(packages) {
  for (pkg in packages) {
    if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
      cat(paste("Installing package:", pkg, "\n"))
      install.packages(pkg, dependencies = TRUE)
      
      if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
        stop(paste("Failed to install package:", pkg))
      } else {
        cat(paste("Successfully installed:", pkg, "\n"))
      }
    } else {
      cat(paste("Package already installed:", pkg, "\n"))
    }
  }
}

# Install packages
cat("Starting R package installation for IFRS 9 Platform...\n")
install_if_missing(required_packages)

# Verify installations
cat("\nVerifying package installations...\n")
for (pkg in required_packages) {
  if (require(pkg, character.only = TRUE, quietly = TRUE)) {
    cat(paste("✓", pkg, "- OK\n"))
  } else {
    cat(paste("✗", pkg, "- FAILED\n"))
  }
}

cat("\nR packages installation completed for IFRS 9 Platform!\n")
