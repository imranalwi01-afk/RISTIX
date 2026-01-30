# install_deps.R
# Script to install required packages for IFRS9 App

required_packages <- c(
  "shiny", "shinydashboard", "DT", "data.table", "dplyr", "openxlsx",
  "lmtest", "car", "combinat", "tseries", "forecast", "MASS",
  "nortest", "tibble", "ggplot2", "plotly", "shinyWidgets",
  "DBI", "RPostgres", "lubridate", "shinycssloaders",
  "future", "future.apply", "smooth", "fpp2", "aTSA", "date",
  "tidyverse", "readxl"
)

# Identify missing packages
new_packages <- required_packages[!(required_packages %in% installed.packages()[,"Package"])]

# Install missing packages
if(length(new_packages)) {
  message("Installing missing packages: ", paste(new_packages, collapse = ", "))
  install.packages(new_packages, repos = "https://cloud.r-project.org/")
} else {
  message("All required packages are already installed.")
}

message("Setup Complete!")
