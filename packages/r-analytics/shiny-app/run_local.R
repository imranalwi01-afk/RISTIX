# run_local.R
# Script to run IFRS9 R Analytics locally

message("==========================================")
message("   IFRS9 R ANALYTICS LOCAL RUNNER")
message("==========================================")

# 0. Set up library path correctly
r_version <- paste(R.version$major, strsplit(R.version$minor, "\\.")[[1]][1], sep = ".")
user_lib <- path.expand(paste0("~/Library/R/", r_version, "/library"))
if (!dir.exists(user_lib)) {
    dir.create(user_lib, recursive = TRUE)
}
.libPaths(c(user_lib, .libPaths()))
message("📦 R Library Path: ", user_lib)

# 1. Required Packages
# Menjamin semua library yang dibutuhkan tersedia di laptop
required_packages <- c(
    "shiny", "shinydashboard", "DT", "data.table", "dplyr", "openxlsx",
    "lmtest", "car", "combinat", "tseries", "forecast", "MASS",
    "nortest", "tibble", "ggplot2", "plotly", "shinyWidgets",
    "DBI", "RPostgres", "lubridate", "shinycssloaders",
    "future", "future.apply", "smooth", "fpp2", "aTSA", "date",
    "tidyverse", "readxl", "plumber"
)

# Identify missing packages
message("[*] Mengecek kelengkapan library R...")
new_packages <- required_packages[!(required_packages %in% installed.packages()[, "Package"])]

# Install missing packages
if (length(new_packages)) {
    message("Installing missing packages: ", paste(new_packages, collapse = ", "))
    install.packages(new_packages, repos = "https://cloud.r-project.org/")
} else {
    message("✅ Semua library R sudah lengkap.")
}

# 2. Environment Variables - KONEKSI DATABASE LUAR (VPN)
# Mengarahkan koneksi ke server database eksternal 10.8.0.2
Sys.setenv(DB_HOST = "10.8.0.2")
Sys.setenv(DB_PORT = "5433")
Sys.setenv(DB_NAME = "FRS9PRO")
Sys.setenv(DB_SCHEMA = "public")
Sys.setenv(DB_USER = "postgres")
Sys.setenv(DB_PASSWORD = "postgres")
Sys.setenv(R_ANALYTICS_DEBUG_MODE = "true")

message("📡 Konfigurasi Database Luar:")
message(paste("   - Host: ", Sys.getenv("DB_HOST")))
message(paste("   - Port: ", Sys.getenv("DB_PORT")))
message(paste("   - DB Name: ", Sys.getenv("DB_NAME")))

# 3. Connectivity Test
message("[*] Mengetes koneksi ke database server...")
tryCatch(
    {
        con_test <- DBI::dbConnect(
            RPostgres::Postgres(),
            dbname = Sys.getenv("DB_NAME"),
            host = Sys.getenv("DB_HOST"),
            port = as.integer(Sys.getenv("DB_PORT")),
            user = Sys.getenv("DB_USER"),
            password = Sys.getenv("DB_PASSWORD"),
            connect_timeout = 5
        )
        # Test simple query and schema
        DBI::dbExecute(con_test, "SET search_path TO public;")
        message("✅ KONEKSI BERHASIL: Terhubung ke database server luar (10.8.0.2)")
        DBI::dbDisconnect(con_test)
    },
    error = function(e) {
        message("❌ KONEKSI GAGAL: ", e$message)
        message("⚠️  Pastikan VPN Anda aktif dan server 10.8.0.2 dapat diakses.")
        stop("Aplikasi tidak bisa dilanjutkan tanpa koneksi database.")
    }
)

message("🚀 Memulai Shiny App di http://localhost:4236 ...")

# 4. Run the App
# Menjalankan aplikasi monolitik app34.R
shiny::runApp("app34.R", host = "0.0.0.0", port = 4236, launch.browser = FALSE)
