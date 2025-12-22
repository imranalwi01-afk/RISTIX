# R Profile for IFRS 9 Platform
options(
  repos = c(CRAN = "https://cloud.r-project.org/"),
  download.file.method = "libcurl",
  timeout = 300,
  warn = 1
)

# Ensure user library directory exists
user_lib <- Sys.getenv("R_LIBS_USER")
if (!dir.exists(user_lib)) {
  dir.create(user_lib, recursive = TRUE)
}

.libPaths(c(user_lib, .libPaths()))

cat("✅ R user library configured\n")
cat("📂 User library:", user_lib, "\n")
