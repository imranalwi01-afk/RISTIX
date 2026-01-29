
# Set CRAN repository
options(repos = c(CRAN = "https://cloud.r-project.org"))

# Install renv and jsonlite if not already installed
if (!requireNamespace("renv", quietly = TRUE)) {
  install.packages("renv")
}
if (!requireNamespace("jsonlite", quietly = TRUE)) {
  install.packages("jsonlite")
}

# Define required packages for the Shiny app
required_packages <- c(
  "shiny",
  "shinydashboard",
  "forecast",
  "ggplot2",
  "dplyr",
  "tidyr",
  "readr",
  "jsonlite",
  "lubridate",
  "DT",
  "plotly",
  "openxlsx",
  "stringr",
  "purrr",
  "tibble",
  "fracdiff",
  "generics"
)

# Get package information
package_info <- available.packages()

# Create a list to store package records
records <- list()

for (pkg in required_packages) {
  if (pkg %in% rownames(package_info)) {
    records[[pkg]] <- list(
      Package = pkg,
      Version = package_info[pkg, "Version"],
      Source = "Repository",
      Repository = "CRAN"
    )
  } else {
    message(paste("Warning: Package", pkg, "not found in CRAN repository."))
  }
}

# Construct the renv.lock structure
lock <- list(
  R = list(
    Version = "4.3.2",
    Repositories = list(list(Name = "CRAN", URL = "https://cloud.r-project.org"))
  ),
  Packages = records
)

# Write the renv.lock file
jsonlite::write_json(lock, "/work/renv.lock", auto_unbox = TRUE, pretty = TRUE)

message("renv.lock generated successfully at /work/renv.lock")
