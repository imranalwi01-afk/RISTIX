# R Profile for IFRS 9 Platform
options(
  repos = c(CRAN = "https://cloud.r-project.org/"),
  download.file.method = "libcurl",
  timeout = 300,
  warn = 1
)

# Ensure user library directory exists
user_lib <- Sys.getenv("R_LIBS_USER")
if (user_lib == "") {
  # Set default user library path for macOS
  r_version <- paste(R.version$major, strsplit(R.version$minor, "\\.")[[1]][1], sep = ".")
  user_lib <- path.expand(paste0("~/Library/R/", r_version, "/library"))
  Sys.setenv(R_LIBS_USER = user_lib)
}
if (!dir.exists(user_lib)) {
  dir.create(user_lib, recursive = TRUE)
}

.libPaths(c(user_lib, .libPaths()))

message("✅ R user library configured")
message("📂 User library: ", user_lib)
