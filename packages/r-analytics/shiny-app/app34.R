# Ensure we are in the correct directory for relative imports
if (!is.null(tryCatch(setwd(dirname(rstudioapi::getSourceEditorContext()$path)), error = function(e) NULL))) {
  setwd(dirname(rstudioapi::getSourceEditorContext()$path))
} else {
  # Fallback for Docker/Production environments
  if (dir.exists("/opt/r-analytics/shiny-app")) {
    setwd("/opt/r-analytics/shiny-app")
  }
}
message(paste0("[", Sys.time(), "] 🚀 STARTING APP INITIALIZATION..."))
message(paste0("[", Sys.time(), "] 📦 Loading libraries..."))

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

message(paste0("[", Sys.time(), "] 📦 Libraries loaded. Sourcing global.R..."))
source("global.R")
message(paste0("[", Sys.time(), "] ✅ global.R sourced successfully."))



# Koneksi database PostgreSQL
# Database Configuration Logging
db_host <- Sys.getenv("DB_HOST", "10.8.0.2")
db_port <- as.integer(Sys.getenv("DB_PORT", "5433"))
db_name <- Sys.getenv("DB_NAME", "IFRS9_pro")
db_user <- Sys.getenv("DB_USER", "postgres")
db_password <- Sys.getenv("DB_PASSWORD", "postgres")

cat(paste0("\n=============================================\n"))
cat(paste0("🚀 Starting Database Connection...\n"))
cat(paste0("📌 Host: ", db_host, "\n"))
cat(paste0("📌 Port: ", db_port, "\n"))
cat(paste0("📌 Name: ", db_name, "\n"))
cat(paste0("📌 User: ", db_user, "\n"))
cat(paste0("=============================================\n"))

# Koneksi database PostgreSQL with Error Handling
con <- tryCatch({
  conn <- dbConnect(
    RPostgres::Postgres(),
    dbname = db_name,
    host = db_host,
    port = db_port,
    user = db_user,
    password = db_password
  )
  cat("✅ Database connection successful!\n")
  conn
}, error = function(e) {
  cat(paste0("❌ Database connection failed: ", e$message, "\n"))
  # cat("⚠️ Falling back to offline mode (if supported)...\n")
  NULL
})


dbExecute(con, "SET search_path TO dbo;")

# Load konfigurasi
LGD <- dbGetQuery(con, 'SELECT * FROM "FRS9_IMP_CA_LGD_CONFIG"')
PD <- dbGetQuery(con, 'SELECT * FROM "FRS9_IMP_CA_PD_CONFIG"')


pd_tables_map <- list(
  FL.P.ODR           = "Forward Looking Prediction",
  TTC.ODR            = "True The Life Cycle",
  MPD.Scalling       = "Marginal PD Scalling",
  Scalling           = "Scalling",
  Optimization       = "Optimization",
  yearly_cpd_bfl     = "Yearly Cummulative PD Before Forward Looking",
  yearly_mpd_bfl     = "Yearly Marginal PD Before Forward Looking",
  yearly_mpd_afl     = "Yearly Marginal PD After Forward Looking",
  yearly_cpd_afl     = "Yearly Cummulative PD After Forward Looking",
  monthly_cpd_bfl    = "Monthly Cummulative PD Before Forward Looking",
  monthly_cpd_afl    = "Monthly Cummulative PD After Forward Looking",
  monthly_mpd_bfl    = "Monthly Marginal PD Before Forward Looking",
  monthly_mpd_afl    = "Monthly Marginal PD After Forward Looking"
)


pd_final_map <- list(
  monthly_mpd_afl_final = "Monthly Marginal PD After Forward Looking Final",
  monthly_cpd_afl_final = "Monthly Cummulative PD After Forward Looking Final",
  yearly_mpd_afl_final = "Yearly Marginal PD After Forward Looking Final",
  yearly_cpd_afl_final = "Yearly Cummulative PD After Forward Looking Final"
)


customHeader <- tags$head(
  tags$style(HTML("
    /* ===== HEADER & NAVBAR ===== */
    /* ===== HEADER & NAVBAR ===== */
    .skin-blue .main-header .logo {
      background-color: #1976D2 !important;
      color: #ffffff !important;
      border: none !important;
      height: 50px !important;
      line-height: 50px !important;
    }

    .skin-blue .main-header .logo:hover {
      background-color: #1565C0 !important;
    }

    .skin-blue .main-header .navbar {
      background-color: #1976D2 !important;
      border: none !important;
      margin-bottom: 0 !important;
      min-height: 50px !important;
      box-shadow: none !important;
    }

    .skin-blue .main-header {
      max-height: 50px !important;
      box-shadow: none !important;
      padding-bottom: 0 !important;
    }

    /* ===== TOGGLE BUTTON ===== */
    .skin-blue .main-header .navbar .sidebar-toggle {
      color: #ffffff !important;
    }
    .skin-blue .main-header .navbar .sidebar-toggle:hover {
      background-color: #1565C0 !important;
    }

    /* ===== MENU ITEM ===== */
    .skin-blue .main-header .navbar .nav > li > a {
      color: #ffffff !important;
    }

    /* ===== HOVER MENU ===== */
    .skin-blue .main-header .navbar .nav > li > a:hover,
    .skin-blue .main-header .navbar .nav > li > a:active,
    .skin-blue .main-header .navbar .nav > li > a:focus {
      background-color: #1565C0 !important;
      color: #ffffff !important;
    }

    /* ===== ACTIVE MENU ===== */
    .navbar-nav > li.active > a {
      background-color: #1565C0 !important;
      color: #ffffff !important;
      font-weight: bold;
      box-shadow: inset 0 -3px 0 #FFD54F !important;
      border-bottom: none !important;
    }

    /* ===== BOX & BUTTON (opsional tetap) ===== */
    .box.box-primary {
      border-top-color: #1976D2;
    }

    .btn-success {
      background-color: #28a745;
      border-color: #28a745;
    }

    .content-wrapper {
      margin-top: 0px !important;
      padding-top: 10px !important;
    }

    /* ================================
       GLOBAL BOX STYLE
       ================================ */

    /* Box border */
    .box {
      border-radius: 6px;
      border-top: 0 !important;
      border: 1px solid #1976D2 !important;
    }

    /* Box header */
    .box-header {
      background-color: #1976D2 !important;
      color: #ffffff !important;
      font-weight: bold;
      border-bottom: 1px solid #1976D2 !important;
    }

    /* Box title */
    .box-header .box-title {
      color: #ffffff !important;
      font-size: 16px;
    }

    /* Solid primary box */
    .box.box-primary {
      border-top-color: #1976D2 !important;
    }

    .box.box-primary > .box-header {
      background-color: #1976D2 !important;
      color: #ffffff !important;
    }

    /* Box body (isi) */
    .box-body {
      background-color: #ffffff;
    }

    /* Optional: footer */
    .box-footer {
      border-top: 1px solid #1976D2 !important;
    }

     html, body {
  background-color: #ffffff !important;
  height: 100%;
}

.wrapper {
  background-color: #ffffff !important;
  min-height: 100vh !important;
}

.content-wrapper, .right-side {
  background-color: #ffffff !important;
  min-height: 100vh !important;
}


  "))
)


ui <- dashboardPage(
  skin = "blue",

  # ===== TOP NAVBAR =====
  dashboardHeader(
    title = span("RISTIX.PRO", style = "font-weight:bold"),
    tags$li(
      class = "dropdown",
      tags$ul(
        class = "nav navbar-nav",
        tags$li(
          tags$a(
            href = "#shiny-tab-dashboard",
            `data-toggle` = "tab",
            "Dashboard"
          )
        ),
        tags$li(
          tags$a(
            href = "#shiny-tab-input",
            `data-toggle` = "tab",
            "Data"
          )
        ),
        tags$li(
          tags$a(
            href = "#shiny-tab-model",
            `data-toggle` = "tab",
            "Model"
          )
        ),
        tags$li(
          tags$a(
            href = "#shiny-tab-forecast",
            `data-toggle` = "tab",
            "Forecast"
          )
        ),
        tags$li(
          tags$a(
            href = "#shiny-tab-pdafl",
            `data-toggle` = "tab",
            "PD & AFL"
          )
        ),
      )
    )
  ),
  dashboardSidebar(disable = T),
  dashboardBody(
    customHeader,


    # === INI HARUS LANGSUNG tabPanels ===
    tabItems(
      tabItem(
        tabName = "dashboard",
        tags$h2("IFRS 9", style = "font-size: 48px; font-weight: bold; color: #2e2e3a;"),
        tags$h3("Probability of Default (PD) Module", style = "font-size: 32px; font-weight: bold; color: #2e2e3a;"),
        tags$p(
          "The Probability of Default (PD) module in this IFRS 9 Modelling Tools application is designed to assist financial institutions in calculating the likelihood of borrower default based on historical data, in an accurate, efficient, and compliant manner with IFRS 9 standards.",
          style = "font-size: 22px; color: #333333;"
        ),
      ),
      tabItem(
        tabName = "input",
        tabBox(
          title = "", width = 12,
          tabPanel(
            "Dependent Variable",
            fluidRow(
              box(
                width = 4, title = "Input Data", solidHeader = TRUE, status = "primary",
                selectInput("dependent", "Choose Dependent:", choices = c("PD", "LGD", "OTHERS")),
                conditionalPanel(
                  condition = "input.dependent != 'OTHERS'",
                  uiOutput("segmentationUI")
                ),
                conditionalPanel(
                  condition = "input.dependent == 'OTHERS'",
                  tagList(
                    fileInput("file_upload_other1", "Upload CSV File",
                      accept = c(".csv", ".xlsx", ".xls")
                    ),
                    radioButtons("csv_sep1", "Separator:",
                      choices = c("Comma" = ",", "Semicolon" = ";", "Tab" = "\t"),
                      inline = TRUE, selected = "comma"
                    )
                  )
                ),
                actionButton("submit", "Submit", class = "btn-success")
              ),
              box(
                width = 8, title = "Data Preview", solidHeader = TRUE, status = "info",
                DTOutput("dependent_data")
              )
            ), fluidRow(
              box(
                width = 4,
                checkboxGroupInput(
                  inputId = "transformasi",
                  label = "Pilih Metode Transformasi:",
                  choices = c("logit", "average", "log")
                )
              ),
              box(
                width = 8, title = "Data Preview", solidHeader = TRUE, status = "info",
                DTOutput("tabel_data_dependent_tr")
              )
            )
          ),
          tabPanel(
            "Independent Variables",
            fluidRow(
              box(
                width = 4, title = "Input Data", solidHeader = TRUE, status = "primary",
                fileInput("file_upload_other2", "Upload CSV File",
                  accept = c(".csv", ".xlsx", ".xls")
                ),
                radioButtons("csv_sep2", "Separator:",
                  choices = c("Comma" = ",", "Semicolon" = ";", "Tab" = "\t"),
                  inline = TRUE
                ),
                checkboxInput("transform", "Transformasi", value = F),
                br(),
                actionButton("submit2", "Submit", class = "btn-success")
              ),
              column(
                width = 8,
                fluidRow(
                  box(
                    width = 12, title = "Data Preview", solidHeader = TRUE, status = "info",
                    DTOutput("independent_data")
                  )
                )
                # fluidRow(
                # box(width = 12, title = "Preview transform", solidHeader = TRUE, status = "info",
                #      DT::dataTableOutput("tryn")
                # )
                # )
              ),
              box(
                width = 12, title = "Riwayat Upload & Unduh Kembali", solidHeader = TRUE, status = "primary",
                fluidRow(
                  column(
                    6,
                    selectInput("download_upload_id", "Pilih File Upload Sebelumnya:", choices = NULL),
                    downloadButton("download_upload_csv", "Download CSV"),
                    actionButton("delete_upload", "🗑️ Hapus File Upload", class = "btn-danger")
                  ),
                  column(
                    6,
                    DTOutput("upload_history_table")
                  )
                )
              )
            )
          ),
          tabPanel(
            "Data Full",
            fluidRow(
              box(
                width = 3, title = "Join Data", solidHeader = TRUE, status = "primary",
                actionButton("join", "Join", class = "btn-success")
              ),
              box(
                width = 9, title = "Data Preview", solidHeader = TRUE, status = "info",
                DTOutput("tabel_hasil_join")
              )
            )
          )
        )
      ),
      tabItem(
        tabName = "model",
        tabBox(
          title = "", width = 12,
          tabPanel(
            "Input",
            fluidRow(
              box(
                title = "Parameter", status = "primary", width = 6, solidHeader = TRUE,
                numericInput("pval", "P-value", value = 0.05),
                numericInput("rsq", "R-Square Single Factor", value = 0.0),
                numericInput("corr", "Correlation", value = 0.6),
                radioButtons("normal", "Normality test", choices = c("shapiro", "kolmogorov", "anderson")),
                numericInput("alpha", "alpha assumption", value = 0.05),
                dateInput("train_start", "Tanggal Awal Insample", value = Sys.Date()),
                dateInput("train_split", "Tanggal Akhir Insample)", value = Sys.Date()),
                dateInput("test_end", "Tanggal Akhir Outsample", value = Sys.Date())
              ),
              box(
                title = "Intuition", status = "primary", width = 6, solidHeader = TRUE,
                DT::dataTableOutput("intuisi_table")
              )
            ),
            fluidRow(
              box(
                title = "Pilih Variabel", width = 12, status = "info", solidHeader = TRUE,
                uiOutput("select_y"),
                uiOutput("select_x"),
                actionButton("select_all_x", "Pilih Semua"),
                actionButton("reset_x", "Reset Pilihan"),
                br(), br(),
                actionButton("runmodel", "RUN", class = "btn-success")
              )
            )
          ),
          tabPanel(
            "Output",
            box(
              title = "Correlation Coefficient Sign Intuition", width = 12, status = "primary", solidHeader = TRUE,
              DT::dataTableOutput("table_sign1")
            ),
            # downloadButton("dl_corr", "Download")),
            box(
              title = "Single Factor", width = 12, status = "primary", solidHeader = TRUE,
              DT::dataTableOutput("table_reg1")
            ),
            # downloadButton("dl_single", "Download")),
            box(
              title = "Correlation 2 & 3 Variable", width = 12, status = "primary", solidHeader = TRUE,
              tabBox(
                width = 12,
                tabPanel("Tabel korelasi 2 variabel", DT::dataTableOutput("table_korel2")),
                tabPanel("Tabel korelasi 3 variabel", DT::dataTableOutput("table_korel3"))
              )
            ),
            box(
              title = "Multiple Linear Regression", width = 12, status = "primary", solidHeader = TRUE,
              tabBox(
                width = 12,
                tabPanel("Tabel regresi 2 variabel", DT::dataTableOutput("table_reg2")),
                tabPanel("Tabel regresi 3 variabel", DT::dataTableOutput("table_reg3")),
                tabPanel("Model Gabungan", DT::dataTableOutput("table_reg23"))
              )
            ),
            box(
              title = "Final Model (Pass)", width = 12, status = "primary", solidHeader = TRUE,
              tabBox(
                width = 12,
                tabPanel("Uji Asumsi", DT::dataTableOutput("table_asumsi")),
                tabPanel("Back Testing", DT::dataTableOutput("table_backtest")),
                tabPanel("Final Model", DT::dataTableOutput("table_finalmodel"))
              )
            ),
            br(), br(),
            box(
              title = "Download Model Output", width = 4, status = "primary", solidHeader = TRUE,
              downloadButton("download_model", "Download Output Model", class = "btn-success")
            )
          )
        )
      ),
      tabItem(
        tabName = "forecast",
        tabBox(
          title = "", width = 12,
          tabPanel(
            "Forecast X",

            # Bungkus dalam fluidRow agar rapi di layout
            fluidRow(
              column(
                width = 4, # Gunakan lebar 6 agar ada ruang jika ingin tambah kolom nanti

                box(
                  width = 12, title = "Data MEV", solidHeader = TRUE, status = "primary",

                  # Pilihan sumber data
                  selectInput("mevfore", "Pilih Sumber Data:", choices = c("MEV_Awal", "External_Data")),
                  br(),

                  # Jika MEV_Awal dipilih
                  conditionalPanel(
                    condition = "input.mevfore == 'MEV_Awal'",
                    selectInput("akurasi_forecastx", "Akurasi", choices = c("MAPE", "RMSE")),
                    numericInput("jumlah_forecast", "Forecast berapa periode ke depan", value = 12, min = 1, step = 1),
                    br(),
                    actionButton("forecastX", "Forecast", class = "btn btn-success")
                  ),

                  # Jika External Data dipilih
                  conditionalPanel(
                    condition = "input.mevfore == 'External_Data'",
                    fileInput("forecastfile", "Upload File External", placeholder = "mevforecast.csv"),
                    radioButtons("sep3", "Pemisah Kolom",
                      choices = c("Koma" = ",", "Titik koma" = ";", "Tab" = "\t"),
                      inline = TRUE
                    ),
                    actionButton("submit3", "Submit", class = "btn btn-success"),
                    br(), br()
                  )
                )
              ),
              column(
                width = 8,
                conditionalPanel(
                  condition = "input.mevfore == 'External_Data'",
                  box(
                    width = 12, title = "Tabel Forecast (External Data)", solidHeader = TRUE, status = "info",
                    DT::dataTableOutput("forecasttable"),
                    checkboxInput("transform3", "Transformasi", value = F)
                  )
                ),
                conditionalPanel(
                  condition = "input.mevfore == 'MEV_Awal'",
                  box(
                    width = 12, title = "Tabel MEV Historis", solidHeader = TRUE, status = "warning",
                    tabBox(
                      width = 12,
                      tabPanel(
                        "Hasil Forecast", withSpinner(DT::dataTableOutput("tabelfrommevhis"), type = 6, color = "#007bff"),
                        br(), br(),
                        checkboxInput("transform4", "Transformasi", value = F)
                      ),
                      tabPanel("Summary", tags$div(style = "height:500px; overflow-y:scroll; white-space:pre-wrap;", verbatimTextOutput("summaryforecastx") %>% withSpinner()))
                    )
                  )
                )
              )
            )
          ),
          tabPanel(
            "Forecast Average Y",
            box(
              width = 3, solidHeader = TRUE, status = "primary",
              actionButton("runforaveragey", "RUN", class = "btn-success")
            ),
            box(
              title = "Model Final with Average Year", width = 12, status = "primary", solidHeader = TRUE,
              dataTableOutput("table_averageygabmodel")
            ),
            box(
              title = "Forecast Y ", width = 12, status = "primary", solidHeader = TRUE,
              dataTableOutput("table_forecastaveragey")
            )
          ),
          tabPanel(
            "Forecast Y",
            fluidRow(
              box(
                title = "Hasil Forecast", width = 6,

                # --- UI ---
                uiOutput("core_vars_ui"), # ganti textInput lama
                numericInput("min_match", "Minimal jumlah core match:", value = 1, min = 1),
                selectInput("sort_by", "Urutkan berdasarkan:", choices = c("R_squared", "MAPEgabung")),
                checkboxInput("exact_word", "Cocokkan kata utuh (exact match)?", value = FALSE),
                actionButton("apply_filter", "Terapkan Filter"),
                actionButton("reset_filter", "Reset", icon = icon("rotate-left"), class = "btn-secondary"),
                br(), br(),
                uiOutput("select_model"),
                br(), br(),
                actionButton("runforecast", "RUN", class = "btn-success"),
                br(), br(),
                DT::dataTableOutput("dataforecast"),
                br(), br(),
              ),
              box(
                title = "Graph", solidHeader = T, status = "warning", width = 6,
                plotlyOutput("plot_forecast"),
                downloadButton("downloadPlot", "Download Plot PNG")
              ),
              box(title = "Output Akhir", width = 12, status = "success", dataTableOutput("pemilihan_model_akhir"))
            ),
            fluidRow(
              box(
                title = "Simpan Model ke Database", width = 6, status = "primary", solidHeader = TRUE,
                textInput("model_name_input", "Nama Model (unik dan deskriptif):", value = ""),
                actionButton("save_model_db", "💾 Simpan ke Database", class = "btn btn-warning")
              ),
              box(
                title = "Download ALL Output", width = 6, status = "primary", solidHeader = TRUE,
                downloadButton("download_all_outputs", "Download Output", class = "btn-success")
              ),
              box(
                title = "📊 Model yang Sudah Disimpan", width = 12, status = "primary", solidHeader = TRUE,
                DTOutput("model_summary_table_DB")
              )
            )
          )
        )
      ),
      tabItem(
        tabName = "pdafl",
        fluidRow(
          # ==== KOLUMEN KIRI (lebar 4) ====
          column(
            width = 4,
            box(
              width = 12, solidHeader = TRUE, status = "primary",
              actionButton("refresh", "refresh Data", class = "btn btn-warning"),
              # actionButton("pilihM", "Pilih Model", class = "btn btn-warning"),
              br(), br(),
              selectInput("choose_model", "Pilih Model Historical:", choices = NULL),
              br(), br(),
              DT::dataTableOutput("intuisitable_pdafl")
            ),

            # Box Transformasi ditaruh DI BAWAH box kiri (masih di kolom kiri)
            box(
              width = 12, solidHeader = TRUE, status = "primary",
              title = "Options:",
              selectInput("backtransform", "Transformasi data Y sebelumnya", choices = c("logit", "log", "others")),
              selectInput("outliermet", "Outlier Method", choices = c("boxplot", "sd")),
              uiOutput("segmentationPDAFLUI"),
              actionButton("runpdafl", "RUN", class = "btn-success")
            )
          ),

          # ==== KOLUMEN KANAN (lebar 8) ====
          column(
            width = 8,
            box(
              width = 12, title = "Historical Model", solidHeader = TRUE, status = "primary",
              DTOutput("model_summary_table_DB2")
            )
          )
        ),
        fluidRow(
          box(
            width = 12, solidHeader = FALSE,
            tabBox(
              width = 12, side = "left", id = "tabset1",
              tabPanel(
                "MEV Boxplot",
                box(
                  title = "Tabel Klasifikasi",
                  DT::dataTableOutput("df_klasifikasi_table")
                ),
                box(
                  title = "Tabel Frekuensi Kategori",
                  DT::dataTableOutput("category_frecuency_table")
                ),
                box(
                  title = "Boxplot Categorization Percentage",
                  DT::dataTableOutput("category_percentage_table")
                ),
                box(
                  title = "Weighted Boxplot",
                  DT::dataTableOutput("weighted_boxplot_table0")
                ),
                box(
                  title = "Average MEV by Boxplot Categorization",
                  DT::dataTableOutput("avg_table_table")
                ),
                box(
                  title = "Average Difference Base ",
                  DT::dataTableOutput("diff_base_table")
                )
                # downloadButton("download_xlsx_pdafl", "Download Excel")
              ),
              tabPanel(
                "Forecast Boxplot",
                box(title = "Base", DT::dataTableOutput("fo_boxplotbase_table")),
                box(title = "Best", DT::dataTableOutput("fo_boxplotbest_table")),
                box(title = "Worst", DT::dataTableOutput("fo_boxplotworst_table")),
                box(title = "YJoin", DT::dataTableOutput("fo_boxplotyjoin_table")),
                box(title = "Diff", DT::dataTableOutput("fo_boxplotdiff_table"))
              ),
              tabPanel(
                "PD–AFL",
                tabBox(
                  width = 12,
                  tabPanel(
                    "Base",
                    lapply(names(pd_tables_map), function(tbl_key) {
                      tagList(
                        h4(pd_tables_map[[tbl_key]]),
                        DTOutput(paste0("pd_base_", tbl_key)), br()
                      )
                    })
                  ),
                  tabPanel(
                    "Best",
                    lapply(names(pd_tables_map), function(tbl_key) {
                      tagList(
                        h4(pd_tables_map[[tbl_key]]),
                        DTOutput(paste0("pd_best_", tbl_key)), br()
                      )
                    })
                  ),
                  tabPanel(
                    "Worst",
                    lapply(names(pd_tables_map), function(tbl_key) {
                      tagList(
                        h4(pd_tables_map[[tbl_key]]),
                        DTOutput(paste0("pd_worst_", tbl_key)), br()
                      )
                    })
                  ),
                  tabPanel(
                    "Final",
                    fluidRow(
                      box(
                        width = 4,
                        DT::dataTableOutput("weighted_boxplot_table"),
                        actionButton("runpdafl_final", "RUN", class = "btn-success")
                      ),
                      box(
                        width = 8,
                        lapply(names(pd_final_map), function(tbl_key) {
                          tagList(
                            h4(pd_final_map[[tbl_key]]),
                            DTOutput(paste0("pd_final_", tbl_key)), br()
                          )
                        })
                      )
                    )
                  )
                )
              )
            )
          )
        ),
        downloadButton("download_all_xlsx", "Download Output"),
        actionButton("save_pd", "Save PD To DB")
      ),
      tabItem(
        tabName = "forecast_manual",
        tabBox(
          title = "", width = 12,
          tabPanel(
            "Forecast Pilih Metode Otomatis",

            ## =========================
            ## ROW 1: INPUT + DATA
            ## =========================
            fluidRow(
              box(
                width = 4, solidHeader = TRUE, status = "primary",
                title = "Input Data forecast",
                fileInput("file_upload_other5", "Upload CSV File",
                  accept = c(".csv", ".xlsx", ".xls")
                ),
                radioButtons(
                  "csv_sep5", "Separator:",
                  choices = c("Comma" = ",", "Semicolon" = ";", "Tab" = "\t"),
                  inline = TRUE
                ),
                br(),
                actionButton("submit5", "Submit", class = "btn-success")
              ),
              box(
                width = 8, solidHeader = TRUE, status = "primary",
                title = "Data",
                DT::dataTableOutput("df5table_output")
              )
            ),

            ## =========================
            ## ROW 2: SETTING + SUMMARY
            ## =========================
            fluidRow(
              box(
                width = 4, solidHeader = TRUE, status = "primary",
                title = "Setting Summary",
                selectInput("akurasi_forecastx5", "Akurasi",
                  choices = c("MAPE", "RMSE")
                ),
                numericInput("jumlah_forecast5",
                  "Forecast berapa periode ke depan",
                  value = 12, min = 1
                ),
                actionButton("runpilihmetodeotomatis", "RUNSUMMARY",
                  class = "btn-success"
                )
              ),
              box(
                width = 8, solidHeader = TRUE, status = "primary",
                title = "Summary",
                tags$div(
                  style = "height:500px; overflow-y:auto; white-space:pre-wrap;",
                  verbatimTextOutput(
                    "out_summary_forecast_manual_pilih"
                  ) %>% withSpinner()
                )
              )
            ),

            ## =========================
            ## ROW 3: HASIL
            ## =========================
            fluidRow(
              box(
                width = 4, solidHeader = T, title = "Setting Forecast", status = "primary",
                textInput("metode_pilihan",
                  "Metode Pilihan (pisahkan dengan koma):",
                  value = "2,1,1,1,2,1,1"
                ),
                checkboxInput("transform5", "Transformasi", FALSE),
                actionButton("runforecastmanualpilih", "RUNFORECAST",
                  class = "btn-success"
                ),
                downloadButton("download_forecast_manual_pilih", "Download Output Forecast", class = "btn-success")
              ),
              box(
                width = 8, solidHeader = TRUE, title = "Hasil Forecast", status = "primary",
                DT::dataTableOutput("out_hasilforecast_manual_pilih")
              )
            )
          ),
          tabPanel(
            "Pilih Metode Forecast",
            fluidRow(
              box(
                width = 4,
                title = "Input Data forecast",
                solidHeader = TRUE,
                status = "primary",
                fileInput("file_upload_other6", "Upload CSV File",
                  accept = c(".csv", ".xlsx", ".xls")
                ),
                radioButtons(
                  "csv_sep6",
                  "Separator:",
                  choices = c("Comma" = ",", "Semicolon" = ";", "Tab" = "\t"),
                  inline = TRUE,
                  selected = "Comma"
                ),
                br(),
                actionButton("submit6", "Submit", class = "btn-success")
              ),
              box(
                width = 8,
                solidHeader = TRUE,
                status = "primary",
                title = "Data",
                DT::dataTableOutput("df6table_output")
              )
            ),
            fluidRow(
              box(
                width = 4,
                solidHeader = TRUE,
                status = "primary",
                title = "Setting",
                selectInput(
                  "pilihmetodeforecast",
                  "Pilih Metode Forecast",
                  choices = c(
                    "Single Moving Average",
                    "Double Moving Average",
                    "Single Exponential Smoothing",
                    "Brown Linier Satu Parameter",
                    "Holt Dua Parameter",
                    "Holt Winter Aditif",
                    "Holt winter Multiplikatif",
                    "Auto ARIMA",
                    "TBATS Model"
                  )
                ),
                numericInput(
                  "jumlah_forecast6",
                  "Forecast berapa periode ke depan",
                  value = 24,
                  min = 1
                ),
                checkboxInput("transform6", "Transformasi", FALSE),
                actionButton("run_pilih_metode", "RUN Forecast", class = "btn-success"),
                downloadButton("download_forecast_pilih_metode",
                  "Download Output Forecast",
                  class = "btn-success"
                )
              ),
              box(
                width = 8,
                solidHeader = TRUE,
                status = "primary",
                title = "Hasil Forecast",
                tags$div(
                  style = "height:500px; overflow-y:auto; white-space:pre-wrap;",
                  DT::dataTableOutput("out_hasilforecast_pilih_metode") %>% withSpinner()
                )
              )
            )
          )
        )
      )
    )
  )
)

server <- function(input, output, session) {
  # Gunakan 3 core, atau sesuaikan
  plan(multisession, workers = 7)

  options(
    shiny.error = function() {
      showNotification(
        "Terjadi kesalahan sistem. Silakan ulangi.",
        type = "error",
        duration = NULL
      )
    }
  )

  # Tambahkan cleanup saat app dimatikan
  onStop(function() {
    message("Shiny stopped, resetting future plan to sequential")
    plan(sequential) # agar tidak ganggu Shiny lain
  })


  # variabel dependent
  rv_df <- reactiveVal() # Menyimpan df untuk digunakan ulang

  output$segmentationUI <- renderUI({
    if (input$dependent == "PD") {
      selectInput("segment", "Segmentation:",
        choices = setNames(PD$PKID, PD$PD_MODEL_NAME)
      )
    } else if (input$dependent == "LGD") {
      selectInput("segment", "Segmentation:",
        choices = setNames(LGD$PKID, LGD$LGD_MODEL_NAME)
      )
    }
  })

  observeEvent(input$submit, {
    # Ambil data berdasarkan input
    df <- NULL
    if (input$dependent == "OTHERS") {
      if (!is.null(input$file_upload_other1)) {
        ext <- tools::file_ext(input$file_upload_other1$name)
        df <- if (ext %in% c("xlsx", "xls")) {
          readxl::read_excel(input$file_upload_other1$datapath)
        } else {
          read.csv(input$file_upload_other1$datapath, sep = input$csv_sep1)
        }
      } else {
        df <- data.frame(Warning = "No file uploaded")
      }
    } else {
      query <- if (input$dependent == "PD") {
        sprintf('SELECT * FROM "FRS9_IMP_CA_PD_ODR" WHERE "PD_CONFIG_ID" = %s', input$segment)
      } else {
        sprintf('SELECT * FROM "FRS9_IMP_CA_LGD_H" WHERE "LGD_CONFIG_ID" = %s', input$segment)
      }
      df <- dbGetQuery(con, query)
    }

    # Simpan ke reactiveVal
    rv_df(df)

    # Tampilkan ke UI
    output$dependent_data <- renderDT({
      datatable(rv_df(), options = list(scrollX = TRUE))
    })
  })


  data_dependent_tr <- eventReactive(input$submit, {
    req(input$dependent)
    if (input$dependent == "PD") {
      data_dependent <- rv_df()[, c("PRC_DATE", "ODR")]
    } else if (input$dependent == "LGD") {
      data_dependent <- rv_df()[, c("PRC_DATE", "LGD")]
    } else if (input$dependent == "OTHERS") {
      data_dependent <- rv_df()
      data_dependent <- convert_dates(data_dependent)
    }

    hasildependent <- transform_y(data_dependent, input$transformasi, logit_value = 0.000001, moving_avg_window = 3)
    hasildependent
  })

  output$tabel_data_dependent_tr <- renderDT({
    req(data_dependent_tr())
    datatable(data_dependent_tr(), options = list(scrollX = TRUE))
  })


  observeEvent(input$submit, {
    if (input$dependent == "OTHERS") {
      # Memeriksa jumlah kolom
      result <- convert_dates2(rv_df())
      date_columns <- result$date_columns
      num_columns <- result$num_columns

      # Jika jumlah kolom lebih dari 2, tampilkan popup
      if (num_columns > 2 && length(date_columns) == 0) {
        showModal(modalDialog(
          title = "Peringatan: Kolom dan Tanggal Tidak Valid",
          paste("File yang diupload memiliki", num_columns, "kolom, lebih dari 2 kolom, dan tidak ada kolom tanggal!"),
          easyClose = TRUE,
          footer = tagList(
            modalButton("Tutup")
          )
        ))
      } else if (num_columns > 2 && length(date_columns) > 0) {
        showModal(modalDialog(
          title = "Peringatan: Kolom Terlalu Banyak",
          paste(" Stop File yang diupload memiliki", num_columns, "kolom, lebih dari 2 kolom, kolom tanggal ada."),
          easyClose = TRUE,
          footer = tagList(
            modalButton("Tutup")
          )
        ))
      } else if (num_columns < 2 && length(date_columns) > 0) {
        showModal(modalDialog(
          title = "Informasi: Kolom tidak Valid dan Tanggal Ditemukan",
          paste("File yang diupload memiliki", num_columns, "kolom (jumlah kolom harus sama dengan 2), kolom tanggal ada."),
          easyClose = TRUE,
          footer = tagList(
            modalButton("Tutup")
          )
        ))
      }
    }
  })


  ################# 1. Data independent##################
  df1 <- reactiveVal(NULL)


  safe_read_data <- function(input_file, sep) {
    ext <- tools::file_ext(input_file$name)
    tryCatch(
      {
        if (ext %in% c("xlsx", "xls")) {
          readxl::read_excel(input_file$datapath)
        } else {
          read.csv(input_file$datapath, sep = sep, stringsAsFactors = FALSE)
        }
      },
      error = function(e) {
        showNotification(paste("Gagal membaca file:", e$message), type = "error")
        return(NULL)
      }
    )
  }


  # 2. Ketika user submit/upload
  observeEvent(input$submit2, {
    req(input$file_upload_other2)

    data <- safe_read_data(input$file_upload_other2, input$csv_sep2)

    if (is.null(data)) {
      df1(data.frame(Pesan = "File tidak dapat dibaca."))
      return()
    }

    df1(data)

    # Simpan ke database
    save_upload_to_db(
      file_input = input$file_upload_other2,
      file_data = data,
      con = con,
      user_id = "user1",
      purpose = "independent"
    )

    # Validasi kolom tanggal dan jumlah kolom
    result <- convert_dates2(data)
    date_columns <- result$date_columns
    num_columns <- result$num_columns

    if (num_columns < 2 && length(date_columns) == 0) {
      showModal(modalDialog(
        title = "Peringatan: Kolom Tidak Valid",
        paste("File memiliki", num_columns, "kolom dan tidak ada kolom tanggal."),
        easyClose = TRUE,
        footer = modalButton("Tutup")
      ))
    } else if (num_columns < 2 && length(date_columns) > 0) {
      showModal(modalDialog(
        title = "Informasi: Tanggal Ditemukan, Kolom Kurang",
        paste("File memiliki", num_columns, "kolom. Kolom tanggal terdeteksi:", paste(date_columns, collapse = ", ")),
        easyClose = TRUE,
        footer = modalButton("Tutup")
      ))
    }
  })

  # Data final (dengan transformasi opsional)
  df_final <- reactive({
    req(df1())
    result <- convert_dates2(df1())
    df2 <- result$df
    date_col <- result$date_columns

    if (length(date_col) == 0) {
      showNotification("Tidak ada kolom tanggal terdeteksi.", type = "error")
      return(NULL)
    }

    if (input$transform) {
      df3x <- df2[, !names(df2) %in% date_col, drop = FALSE]
      df3new <- transform(df3x)
      df3new <- cbind(df2[, date_col, drop = FALSE], df3new)
      df3new <- na.omit(df3new)
      return(df3new)
    } else {
      return(df2)
    }
  })

  # Tampilkan tabel
  output$independent_data <- renderDT({
    req(df_final())
    DT::datatable(df_final(), options = list(scrollX = TRUE))
  })


  observeEvent(input$submit2, {
    # Memeriksa jumlah kolom
    result <- convert_dates2(df1())
    date_columns <- result$date_columns
    num_columns <- result$num_columns

    # Jika jumlah kolom lebih dari 2, tampilkan popup
    if (num_columns < 2 && length(date_columns) == 0) {
      showModal(modalDialog(
        title = "Peringatan: Kolom dan Tanggal Tidak Valid",
        paste("File yang diupload memiliki", num_columns, "kolom, kurang dari 2 kolom, dan tidak ada kolom tanggal!"),
        easyClose = TRUE,
        footer = tagList(
          modalButton("Tutup")
        )
      ))
    } else if (num_columns < 2 && length(date_columns) > 0) {
      showModal(modalDialog(
        title = "Informasi: Kolom tidak Valid dan Tanggal Ditemukan",
        paste("File yang diupload memiliki", num_columns, "kolom (jumlah kolom harus lebih besar atau sama dengan 2), kolom tanggal ada."),
        easyClose = TRUE,
        footer = tagList(
          modalButton("Tutup")
        )
      ))
    }
  })


  observe({
    uploads <- dbGetQuery(con, "SELECT id, filename FROM upload_history WHERE purpose = 'independent' ORDER BY upload_time DESC")
    choices <- setNames(uploads$id, uploads$filename)
    updateSelectInput(session, "download_upload_id", choices = choices)
  })


  output$upload_history_table <- renderDT({
    uploads <- dbGetQuery(con, "
    SELECT id, filename, file_type, rows, columns, upload_time
    FROM upload_history
    WHERE purpose = 'independent'
    ORDER BY upload_time DESC
  ")
    datatable(uploads, options = list(scrollX = TRUE))
  })


  observeEvent(input$delete_upload, {
    req(input$download_upload_id)

    showModal(modalDialog(
      title = "Konfirmasi Hapus",
      paste("Anda yakin ingin menghapus file upload dengan ID", input$download_upload_id, "?"),
      footer = tagList(
        modalButton("Batal"),
        actionButton("confirm_delete", "Ya, Hapus", class = "btn-danger")
      )
    ))
  })

  observeEvent(input$confirm_delete, {
    req(input$download_upload_id)

    # Hapus dari tabel upload_history
    dbExecute(con, "DELETE FROM upload_history WHERE id = $1",
      params = list(input$download_upload_id)
    )

    removeModal()

    # Perbarui selectInput dan DT
    uploads <- dbGetQuery(con, "SELECT id, filename FROM upload_history WHERE purpose = 'independent' ORDER BY upload_time DESC")
    updateSelectInput(session, "download_upload_id", choices = setNames(uploads$id, uploads$filename))

    output$upload_history_table <- renderDT({
      uploads_full <- dbGetQuery(con, "
      SELECT id, filename, file_type, rows, columns, upload_time
      FROM upload_history
      WHERE purpose = 'independent'
      ORDER BY upload_time DESC
    ")
      datatable(uploads_full, options = list(scrollX = TRUE))
    })

    showNotification("File berhasil dihapus.", type = "message")
  })


  ################ Joint data####################
  datagabung <- eventReactive(input$join, {
    req(data_dependent_tr(), df_final())

    data_dep <- data_dependent_tr()
    data_ind <- df_final()


    hasilgabung <- inner_join_date(data_dep, data_ind)
    hasilgabung
  })

  output$tabel_hasil_join <- renderDT({
    req(datagabung())
    datatable(datagabung(), options = list(scrollX = TRUE))
  })


  data0 <- reactive({
    req(datagabung())
    df <- datagabung()
    return(df)
  })

  observeEvent(input$join, {
    df <- datagabung()
    date_colx <- names(df)[sapply(df, inherits, "Date")]
    if (length(date_colx) == 0) {
      return(NULL)
    }

    updateDateInput(session, "train_start",
      value = df[1, date_colx],
      min = min(df[[date_colx]]), max = max(df[[date_colx]])
    )

    updateDateInput(session, "train_split",
      value = df[round(nrow(df) / 2), date_colx],
      min = min(df[[date_colx]]), max = max(df[[date_colx]])
    )

    updateDateInput(session, "test_end",
      value = df[nrow(df), date_colx],
      min = min(df[[date_colx]]), max = max(df[[date_colx]])
    )
  })


  output$tabel1 <- DT::renderDataTable({
    req(data0())
    DT::datatable(data0(), options = list(scrollX = TRUE))
  })


  # Dropdown variabel Y dan X
  output$select_y <- renderUI({
    req(data_dependent_tr())
    vary <- data_dependent_tr()
    namay <- names(vary)[-1]
    selectInput("y_var", "Pilih Variabel Y", choices = namay)
  })

  output$select_x <- renderUI({
    req(df_final())
    namax <- names(df_final())[-1]
    selectizeInput("x_var", "Pilih Variabel X",
      choices = namax,
      selected = NULL,
      multiple = TRUE
    )
  })

  observeEvent(input$select_all_x, {
    updateSelectizeInput(session, "x_var",
      selected = names(df_final())[-1]
    )
  })

  # Reset pilihan X
  observeEvent(input$reset_x, {
    updateSelectizeInput(session, "x_var", selected = character(0))
  })

  namax <- reactive({
    req(input$x_var)
    input$x_var
  })
  namay <- reactive({
    req(input$y_var)
    input$y_var
  })


  data1 <- reactive({
    req(datagabung(), input$train_start, input$train_split, input$test_end)

    dataawal <- batasdata(datagabung(), bb = input$train_start, bt = input$train_split, ba = input$test_end)
    datatrain <- dataawal$data1
    datatrain
  })

  datatest1 <- reactive({
    req(datagabung(), input$train_start, input$train_split, input$test_end)

    dataawal <- batasdata(datagabung(), bb = input$train_start, bt = input$train_split, ba = input$test_end)
    datatest <- dataawal$data2
    datatest
  })


  yx <- reactive({
    Date <- as.Date(datagabung()[, 1])
    namafull <- c(namay(), namax())
    datafull <- datagabung()[, namafull, drop = FALSE] # hasilnya: data frame berisi kolom yang dipilih
    bosku <- data.frame(Date = Date, datafull)
    bosku
  })

  xdata <- reactive({
    req(data1(), namax())
    data1()[, namax(), drop = FALSE] # hasilnya: data frame berisi kolom yang dipilih
  })

  ydata <- reactive({
    req(data1(), namay())
    data1()[, namay(), drop = FALSE] # hasilnya: data frame berisi kolom yang dipilih
  })


  # intuisiData <- reactiveValues(data = NULL)

  # observeEvent({
  #  input$intuisi
  #  input$sep2
  # }, {
  #  req(input$intuisi, input$sep2)
  #  df <- read.csv(input$intuisi$datapath, sep = input$sep2)
  #  intuisiData$data <- df
  # })

  # Reactive expression yang menghasilkan data awal
  intuisiData_raw <- reactive({
    df <- df_final()
    req(df)

    date_col <- names(df)[sapply(df, inherits, "Date")]

    df3x <- df[, !names(df) %in% date_col, drop = FALSE]
    namax <- names(df3x)

    sources <- unique(sapply(strsplit(namax, "_"), `[`, 1))

    abc <- data.frame(var = sources, sign = rep(0, length(sources)))
    return(abc)
  })

  # Tempat menyimpan data yang bisa diedit
  intuisiData <- reactiveValues(data = NULL)

  # Set nilai awal intuisiData$data ketika intuisiData_raw() berubah
  observeEvent(intuisiData_raw(), {
    intuisiData$data <- intuisiData_raw()
  })

  # Tampilkan tabel
  output$intuisi_table <- DT::renderDataTable({
    req(intuisiData$data)
    DT::datatable(intuisiData$data, editable = TRUE, options = list(scrollX = TRUE))
  })

  # Update data berdasarkan edit dari user
  # observeEvent(input$intuisi_table_cell_edit, {
  #  info <- input$intuisi_table_cell_edit
  #  i <- info$row
  #  j <- info$col
  #  v <- info$value
  #
  #  intuisiData$data[i, j] <- DT::coerceValue(v, intuisiData$data[i, j])
  # })


  observeEvent(input$intuisi_table_cell_edit, {
    info <- input$intuisi_table_cell_edit
    i <- info$row
    j <- info$col
    v <- as.numeric(info$value) # Pastikan nilai jadi numerik

    # Hanya izinkan nilai -1, 0, atau 1
    if (v %in% c(-1, 0, 1)) {
      intuisiData$data[i, j] <- v
    } else {
      showModal(modalDialog(
        title = "Input Tidak Valid",
        "Hanya boleh memasukkan nilai -1, 0, atau 1.",
        easyClose = TRUE
      ))
    }
  })


  # Untuk kebutuhan downstream lainnya
  refInt <- reactive({
    req(intuisiData$data)
    intuisiData$data
  })

  # signintuisikor <- eventReactive(input$runmodel, {
  #  req(namay(), namax(),refInt(),xdata(),ydata())
  #
  #  hasil_korelasi <- data.frame(
  #    Variabel_X = namax(),
  #    Korelasixy = sapply(xdata(), function(x) round(cor(x, ydata()[[1]]),3))
  #  )
  #
  #  korint <- hasil_korelasi %>%
  #    mutate(
  #      sign = ifelse(ifelse(Korelasixy < 0, -1, 1) == assign_expect(Variabel_X, refInt()), 'pass', 'eliminate'))
  #
  #  rownames( korint) <- NULL
  #  korint
  # })

  signintuisikor <- eventReactive(input$runmodel, {
    req(namay(), namax(), xdata(), ydata())

    hasil_korelasi <- data.frame(
      Variabel_X = namax(),
      Korelasixy = sapply(xdata(), function(x) round(cor(x, ydata()[[1]]), 3))
    )

    ref <- refInt()

    if (is.null(ref) || nrow(ref) == 0) {
      # Jika referensi tidak ada → semua pass
      korint <- hasil_korelasi %>%
        mutate(sign = "pass")
    } else {
      # Ambil kolom nama dan ekspektasi
      var_col <- names(ref)[1]
      expect_col <- names(ref)[2]

      # Ambil nama variabel dengan konversi 0
      bebas_pass <- ref[[var_col]][ref[[expect_col]] == 0]

      korint <- hasil_korelasi %>%
        mutate(
          var_prefix = sapply(strsplit(Variabel_X, "_"), `[`, 1),
          sign = case_when(
            var_prefix %in% bebas_pass ~ "pass", # Jika prefiks masuk daftar konversi 0
            ifelse(Korelasixy < 0, -1, 1) == assign_expect(Variabel_X, ref) ~ "pass",
            TRUE ~ "eliminate"
          )
        ) %>%
        select(-var_prefix)
    }

    rownames(korint) <- NULL
    korint
  })


  output$table_sign1 <- DT::renderDataTable({
    req(signintuisikor())
    DT::datatable(signintuisikor(), 10, options = list(scrollX = TRUE))
  })

  model_reg1var <- eventReactive(input$runmodel, {
    req(namay(), namax(), input$pval, input$rsq, signintuisikor(), data1())

    sign_data <- signintuisikor()
    newvarr0x <- sign_data[sign_data$sign == "pass", "Variabel_X"]
    models <- gen1varx(data1(), namay(), newvarr0x)
    outputra <- runmodel1p(data1(), models)
    outputra1 <- smr1var(outputra, batasrsq = input$rsq, batasprobt = input$pval)
    rownames(outputra1) <- NULL
    outputra1
  })


  output$table_reg1 <- DT::renderDataTable({
    req(model_reg1var())
    DT::datatable(model_reg1var(), options = list(scrollX = TRUE))
  })


  newvarr1x <- reactive({
    req(model_reg1var(), namay(), namax())
    newvarr1 <- model_reg1var()[model_reg1var()$statusreg1 == "pass", "Variables"]
    newvarr1
  })

  newdata <- reactive({
    req(model_reg1var(), namay(), namax(), newvarr1x())
    newdata0 <- data1()[, c(namay(), newvarr1x())]
    newdata0
  })

  newdatax <- reactive({
    req(model_reg1var(), namay(), namax(), newvarr1x())
    newdatax0 <- data1()[, newvarr1x()]
    newdatax0
  })

  korel_reg2var <- eventReactive(input$runmodel, {
    req(namay(), namax(), newdatax(), input$corr)
    tabkorel2 <- tabel_korelasi2(newdatax())
    tabkorel2$statuskor2 <- ifelse(abs(tabkorel2$Variable12) < input$corr, "pass", "eliminate")
    tabkorel2
  })


  output$table_korel2 <- DT::renderDataTable({
    req(korel_reg2var())
    DT::datatable(korel_reg2var(), options = list(scrollX = TRUE))
  })


  korel_reg3var <- eventReactive(input$runmodel, {
    req(namay(), namax(), newdatax(), input$corr)

    tabel_korelasix <- tryCatch(
      {
        cat("DEBUG --- tabel_korelasi data:\n")
        tabel_korelasi(newdatax())
      },
      warning = function(w) {
        showNotification(w$message, type = "warning")
        return(data.frame()) # kembalikan data.frame kosong agar aman
      },
      error = function(e) {
        showNotification(e$message, type = "error")
        return(data.frame())
      }
    )

    cat("DEBUG --- tabel_korelasi baris:", nrow(tabel_korelasix), "\n")
    if (nrow(tabel_korelasix) == 0) {
      return(data.frame())
    }

    tabel_korelasix$statuskor3 <- ifelse(
      rowSums(abs(tabel_korelasix[, c("Variable12", "Variable13", "Variable23")]) < input$corr) == 3,
      "pass", "eliminate"
    )

    tabel_korelasix
  })


  output$table_korel3 <- DT::renderDataTable({
    req(korel_reg3var())
    DT::datatable(korel_reg3var(), options = list(scrollX = TRUE))
  })


  modreg2 <- reactive({
    req(namay(), namax(), korel_reg2var())
    barisk2 <- c() # Bisa kosong
    model2faktor <- korel_reg2var()[if (length(barisk2) > 0) barisk2 else which(korel_reg2var()$statuskor2 == "pass"), 1:2]
    modreg20 <- gre2(namay(), model2faktor)
    modreg20
  })

  model_reg2var <- eventReactive(input$runmodel, {
    req(namay(), namax(), modreg2(), input$pval, newdata())
    hasilmodreg2 <- runreg2models2(newdata(), namay(), modreg2(), chunk_size = 200)
    hasilmodreg2$statusreg <- ifelse(rowSums(hasilmodreg2[, 8:9] < input$pval) == 2, "pass", "eliminate")
    hasilmodreg2
  })


  output$table_reg2 <- DT::renderDataTable({
    req(model_reg2var())
    DT::datatable(model_reg2var(), options = list(scrollX = TRUE))
  })


  modreg3 <- reactive({
    req(namay(), namax(), korel_reg3var())

    k3data <- korel_reg3var()

    # Cegah error jika NULL atau 0 baris
    if (is.null(k3data) || nrow(k3data) == 0 || !"statuskor3" %in% names(k3data)) {
      return(character(0))
    }

    # Cek jika ada nilai NA di statuskor3
    if (any(is.na(k3data$statuskor3))) {
      showNotification("Peringatan: Beberapa nilai di 'statuskor3' adalah NA.", type = "warning")
      k3data <- k3data[!is.na(k3data$statuskor3), ] # Menghapus baris yang memiliki NA
    }


    barisk3 <- c() # jika kosong, ambil yg pass
    model3faktor <- k3data[if (length(barisk3) > 0) barisk3 else which(k3data$statuskor3 == "pass"), 1:3]

    if (nrow(model3faktor) == 0) {
      showNotification("Tidak ada kombinasi model yang lolos untuk 3 variabel.", type = "error")
      return(character(0))
    }


    modreg3 <- gre3(namay(), model3faktor)
    return(modreg3)
  })

  model_reg3var <- eventReactive(input$runmodel, {
    req(namay(), namax(), input$pval, newdata(), modreg3())

    mod3 <- modreg3()

    if (is.null(mod3)) {
      return(data.frame())
    }


    hasilmodreg3 <- runreg3models2(newdata(), namay(), mod3)
    hasilmodreg3$statusreg <- ifelse(rowSums(hasilmodreg3[, 10:12] < input$pval) == 3, "pass", "eliminate")
    return(hasilmodreg3)
  })


  output$table_reg3 <- DT::renderDataTable({
    DT::datatable(model_reg3var(), options = list(scrollX = TRUE))
  })


  model_reg23var <- eventReactive(input$runmodel, {
    # req(namay(), namax(), newdatax(), input$corr,input$pval,model_reg2var())

    hasil <- model23(model_reg2var(), model_reg3var())
    hasil
    # hasilxx <- model_regnf(newdata(),newdatax(),namay(),runmodel2faktor = model_reg2var(),paramkorelasi =input$corr,alpha = input$pval)
    # hasilxx
  })


  output$table_reg23 <- DT::renderDataTable({
    df <- model_reg23var()
    if (nrow(df) == 0 || ncol(df) == 0) {
      return(DT::datatable(data.frame(Pesan = "Tidak ada model gabungan yang tersedia.")))
    } else {
      DT::datatable(df, options = list(scrollX = TRUE))
    }
  })


  observeEvent(input$runmodel, {
    cat("DEBUG --- Model Gabungan:\n")
    tryCatch(
      {
        cat("Jumlah baris model_reg2var:", nrow(model_reg2var()), "\n")
        cat("Jumlah baris model_reg3var:", nrow(model_reg3var()), "\n")
        cat("Jumlah baris model_reg23var:", nrow(model_reg23var()), "\n")
      },
      error = function(e) {
        cat("Error saat debug model_reg23var:", e$message, "\n")
      }
    )
  })

  ############## uji asumsi########################
  ujiasumsif <- eventReactive(input$runmodel, {
    req(namay(), namax(), model_reg23var(), input$alpha, newdata(), input$normal)
    cmodelfinal <- model_reg23var()$Model

    # Jalankan fungsi dengan data baru
    hasilujiasumsi <- ujiasumsi(newdata(), namay(), cmodelfinal, normalmethod = input$normal)

    # status hasil uji asumsi#
    hasilujiasumsi <- hasilujiasumsi %>%
      mutate(
        statasumsi = ifelse(normal_P >= input$pval & homogen_P >= input$alpha, "pass", "eliminate")
      )
    rownames(hasilujiasumsi) <- NULL

    hasilujiasumsi <- hasilujiasumsi %>%
      mutate(rownames = paste0("M", row_number())) %>%
      column_to_rownames(var = "rownames")
    hasilujiasumsi
  })

  output$table_asumsi <- DT::renderDataTable({
    req(ujiasumsif())
    DT::datatable(ujiasumsif(), options = list(scrollX = TRUE))
  })

  ################ back testing########################
  backtestf <- eventReactive(input$runmodel, {
    req(namay(), namax(), ujiasumsif(), input$pval, newdata(), datatest1())

    hasil_ujiasumsi <- ujiasumsif()
    hasilujiasumsipass <- hasil_ujiasumsi[hasil_ujiasumsi$statasumsi == "pass", ]

    if (nrow(hasilujiasumsipass) > 0) {
      modelbacktesting <- hasilujiasumsipass$Model
      join_ref <- hasilujiasumsipass
    } else {
      modelbacktesting <- hasil_ujiasumsi$Model
      join_ref <- hasil_ujiasumsi
    }

    datagabung <- rbind(data1(), datatest1())

    hasilbacktest <- backtesting2(newdata(), datatest1(), data0(), namay(), modelbacktesting)
    hasilakhir <- dplyr::left_join(hasilbacktest, join_ref, by = "Model") %>%
      dplyr::select(-statasumsi, -MAPE, -RMSE)

    return(hasilakhir)
  })


  output$table_backtest <- DT::renderDataTable({
    req(backtestf())
    DT::datatable(backtestf(), options = list(scrollX = TRUE))
  })


  finalmodel <- eventReactive(input$runmodel, {
    req(namay(), namax(), newdata(), backtestf())
    backtesto <- backtestf()
    modelname <- backtesto$Model
    hasilmodreg3 <- runreg3models3(newdata(), namay(), modelname)
    backtesto <- backtesto %>%
      dplyr::select(-R_squared, -R_squared_adjusted)
    hasilakhir <- dplyr::left_join(hasilmodreg3, backtesto, by = "Model") %>%
      dplyr::select(-MAPEinsample, -MAPEoutsample, -RMSEinsample, -RMSEoutsample)
    hasilakhir
  })

  output$table_finalmodel <- DT::renderDataTable({
    req(finalmodel())
    DT::datatable(finalmodel(), options = list(scrollX = TRUE))
  })


  # output$select_model <- renderUI({
  #  req(finalmodel())
  #  modelname <- finalmodel()$Model
  #  selectInput("model_forecast", "Pilih Model", choices = modelname)
  # })


  core_choices <- reactive({
    fm <- finalmodel()
    req(!is.null(fm), nrow(fm) > 0)
    gabungkolomb(fm)
  })

  output$core_vars_ui <- renderUI({
    selectizeInput(
      "core_vars", "Core variables:",
      choices = core_choices(),
      multiple = TRUE,
      options = list(
        placeholder = "Pilih 1+ core vars",
        plugins = list("remove_button")
      )
    )
  })


  #  # terapkan filter saat tombol diklik (tetap tampilkan data awal sebelum klik)
  #  filtered_data <- eventReactive(input$apply_filter, {
  #    core_vars_input <- if (is.null(input$core_vars)) character(0) else input$core_vars
  #    filter_model_by_core_vars(
  #      data = finalmodel(),
  #      core_vars = core_vars_input,
  #      min_match = input$min_match,
  #      sort_by = input$sort_by,
  #      exact_word = input$exact_word
  #    )
  #  }, ignoreInit = FALSE)
  #
  #  final_filtered_data <- reactive({
  #    if (is.null(input$apply_filter) || input$apply_filter == 0) default_filtered_data() else filtered_data()
  #  })


  # data awal
  default_filtered_data <- reactive({
    finalmodel()
  })

  last_action <- reactiveVal("none")
  observeEvent(input$apply_filter, {
    last_action("apply")
  })
  observeEvent(input$reset_filter, {
    last_action("reset")
  })

  # saat tombol Reset diklik: kosongkan pilihan & kembalikan nilai awal
  observeEvent(input$reset_filter, {
    updateSelectizeInput(session, "core_vars", selected = character(0))
    updateNumericInput(session, "min_match", value = 1)
    updateSelectInput(session, "sort_by", selected = "R_squared")
    updateCheckboxInput(session, "exact_word", value = FALSE)
  })


  filtered_data <- eventReactive(input$apply_filter,
    {
      core_vars_input <- if (is.null(input$core_vars)) character(0) else input$core_vars
      filter_model_by_core_vars(
        data = finalmodel(),
        core_vars = core_vars_input,
        min_match = input$min_match,
        sort_by = input$sort_by,
        exact_word = input$exact_word
      )
    },
    ignoreInit = FALSE
  )

  # penentu data yang ditampilkan: kalau terakhir Reset -> data default, kalau terakhir Apply -> data terfilter
  final_filtered_data <- reactive({
    if (last_action() == "apply" && !is.null(input$apply_filter) && input$apply_filter > 0) {
      filtered_data()
    } else {
      default_filtered_data()
    }
  })

  # dropdown pilih model hasil filter
  output$select_model <- renderUI({
    modelname <- final_filtered_data()[["Model"]]
    selectInput("model_forecast", "Pilih Model", choices = modelname)
  })


  dforecast <- reactiveVal(NULL)


  # 2. Ketika user submit/upload
  observeEvent(input$submit3, {
    req(input$forecastfile)

    data <- safe_read_data(input$forecastfile, input$sep3)

    if (is.null(data)) {
      dforecast(data.frame(Pesan = "File tidak dapat dibaca."))
      return()
    }

    dforecast(data)

    # Validasi kolom tanggal dan jumlah kolom
    result <- convert_dates2(data)
    date_columns <- result$date_columns
    num_columns <- result$num_columns

    if (num_columns < 2 && length(date_columns) == 0) {
      showModal(modalDialog(
        title = "Peringatan: Kolom Tidak Valid",
        paste("File memiliki", num_columns, "kolom dan tidak ada kolom tanggal."),
        easyClose = TRUE,
        footer = modalButton("Tutup")
      ))
    } else if (num_columns < 2 && length(date_columns) > 0) {
      showModal(modalDialog(
        title = "Informasi: Tanggal Ditemukan, Kolom Kurang",
        paste("File memiliki", num_columns, "kolom. Kolom tanggal terdeteksi:", paste(date_columns, collapse = ", ")),
        easyClose = TRUE,
        footer = modalButton("Tutup")
      ))
    }
  })

  # Data final (dengan transformasi opsional)
  datainputforecast <- reactive({
    req(dforecast())
    result <- convert_dates2(dforecast())
    df2 <- result$df
    date_col <- result$date_columns

    if (length(date_col) == 0) {
      showNotification("Tidak ada kolom tanggal terdeteksi.", type = "error")
      return(NULL)
    }

    if (input$transform3) {
      df3x <- df2[, !names(df2) %in% date_col, drop = FALSE]
      df3new <- transform(df3x)
      df3new <- cbind(df2[, date_col, drop = FALSE], df3new)
      df3new <- na.omit(df3new)
      return(df3new)
    } else {
      return(df2)
    }
  })

  # Tampilkan tabel
  output$forecasttable <- renderDT({
    req(datainputforecast())
    DT::datatable(datainputforecast(), options = list(scrollX = TRUE))
  })


  transformed_result_forecast <- reactiveVal(NULL)


  df_forecast0 <- eventReactive(input$forecastX, {
    namax <- names(df_final())
    sources <- unique(sapply(strsplit(namax, "_"), `[`, 1))
    datacorex <- df_final()[, sources, drop = FALSE]

    list_variabel <- konversi_ke_list_forecast(datacorex)
    hasil_akurasiL <- loop_akurasi_forecast_list(list_variabel, makur = input$akurasi_forecastx)
    hasil_akurasiL

    # hasil_forecastmetode <- forecast_dengan_metode_terbaik(list_variabel,hasil_akurasiL,input$jumlah_forecast)
    # hasilfulldf <- gabung_hasil_forecast(hasil_forecastmetode)
    # hasilfulldf
  })

  output$summaryforecastx <- renderPrint({
    df_forecast0()
  })


  df_forecast1 <- eventReactive(input$forecastX, {
    namax <- names(df_final())
    sources <- unique(sapply(strsplit(namax, "_"), `[`, 1))
    datacorex <- df_final()[, sources, drop = FALSE]
    list_variabel <- konversi_ke_list_forecast(datacorex)
    hasil_forecastmetode <- forecast_dengan_metode_terbaik(list_variabel, df_forecast0(), jf = input$jumlah_forecast)
    hasilfulldf <- gabung_hasil_forecast(hasil_forecastmetode)
    hasilforecastgabung <- rbind(datacorex, hasilfulldf)
    hasilforecastgabung
  })


  output$tabelfrommevhis <- DT::renderDataTable({
    req(df_forecast1())

    df <- df_forecast1()

    if (input$transform4) {
      Date <- df[, 1]
      df3x <- df[, -1]
      df3new <- transform(df3x)
      df3new <- cbind(Date, df3new)
      df3new <- na.omit(df3new)

      transformed_result_forecast(df3new) # ✅ simpan hasil transformasi

      DT::datatable(df3new, options = list(scrollX = TRUE))
    } else {
      transformed_result_forecast(df) # ✅ simpan data asli (tanpa transformasi)

      DT::datatable(df, options = list(scrollX = TRUE))
    }
  })


  forecastxxx <- reactive({
    if (input$mevfore == "MEV_Awal") {
      df <- transformed_result_forecast()
    } else if (input$mevfore == "External_Data") {
      df <- datainputforecast()
    }

    date_col <- names(df)[sapply(df, inherits, "Date")]
    if (length(date_col) == 0) {
      showNotification("Tidak ditemukan kolom bertipe Date di df.", type = "error")
      return(NULL)
    }

    date_col_name <- date_col[1] # ambil kolom tanggal pertama yang terdeteksi
    names(df)[names(df1) == date_col_name] <- "Date"

    # Ambil tanggal maksimum dari data awal
    tanggal_terakhir_awal <- max(data0()[, 1])

    # Filter data kedua agar hanya berisi data setelah tanggal terakhir di data_awal
    datafor <- subset(df, Date > tanggal_terakhir_awal)
    return(datafor)
  })


  forecastaveragey <- eventReactive(input$runforaveragey, {
    req(finalmodel())

    if (input$mevfore == "MEV_Awal") {
      df <- transformed_result_forecast()
    } else if (input$mevfore == "External_Data") {
      df <- datainputforecast()
    }


    date_col <- names(df)[sapply(df, inherits, "Date")]
    if (length(date_col) == 0) {
      showNotification("Tidak ditemukan kolom bertipe Date di df.", type = "error")
      return(NULL)
    }


    date_col_name <- date_col[1] # ambil kolom tanggal pertama yang terdeteksi
    names(df)[names(df1) == date_col_name] <- "Date"

    # Ambil tanggal maksimum dari data awal
    tanggal_terakhir_awal <- max(data0()[, 1])

    # Filter data kedua agar hanya berisi data setelah tanggal terakhir di data_awal
    datafor <- subset(df, Date > tanggal_terakhir_awal)

    date_vector <- datafor[[date_col_name]]

    predictions <- predict_from_model_table_safe(
      model_tbl = finalmodel(),
      train_data = newdata(),
      new_data = datafor,
      formula_col = "Model"
    )

    predictions
  })

  output$table_forecastaveragey <- DT::renderDataTable({
    DT::datatable(forecastaveragey(), options = list(scrollX = TRUE))
  })


  averageygabmodel <- eventReactive(input$runforaveragey, {
    bbc <- add_average_forecast(forecast_df = forecastaveragey(), window_size = 12, unit = "Y")
    hasilbbc <- cbind(finalmodel(), bbc[, -1])
    hasilbbc
  })

  output$table_averageygabmodel <- DT::renderDataTable({
    DT::datatable(averageygabmodel(), options = list(scrollX = TRUE))
  })


  hasilforecast <- eventReactive(input$runforecast, {
    req(input$model_forecast, newdata())


    if (input$mevfore == "MEV_Awal") {
      df <- transformed_result_forecast()
    } else if (input$mevfore == "External_Data") {
      df <- datainputforecast()
    }


    date_col <- names(df)[sapply(df, inherits, "Date")]
    if (length(date_col) == 0) {
      showNotification("Tidak ditemukan kolom bertipe Date di df.", type = "error")
      return(NULL)
    }


    date_col_name <- date_col[1] # ambil kolom tanggal pertama yang terdeteksi
    names(df)[names(df1) == date_col_name] <- "Date"

    # Ambil tanggal maksimum dari data awal
    tanggal_terakhir_awal <- max(data0()[, 1])

    # Filter data kedua agar hanya berisi data setelah tanggal terakhir di data_awal
    datafor <- subset(df, Date > tanggal_terakhir_awal)

    date_vector <- datafor[[date_col_name]]

    # Model regresi
    finalmodel <- lm(as.formula(input$model_forecast), data = newdata())


    # Prediksi dengan interval
    pred <- predict(finalmodel, newdata = datafor, interval = "prediction")
    pred <- round(pred, 8)


    # Gabungkan hasil prediksi dan tanggal
    hasil <- data.frame(
      Date = date_vector,
      Forecast = pred[, "fit"],
      Lower = pred[, "lwr"],
      Upper = pred[, "upr"]
    )

    return(hasil)
  })

  output$dataforecast <- DT::renderDataTable({
    req(hasilforecast())
    DT::datatable(hasilforecast(), options = list(scrollX = TRUE))
  })


  tabel_pemilihan_model_akhir <- eventReactive(input$runforecast, {
    datax <- finalmodel()[finalmodel()$Model == input$model_forecast, ]
    datax
  })

  output$pemilihan_model_akhir <- renderDataTable({
    DT::datatable(tabel_pemilihan_model_akhir(), options = list(scrollX = TRUE))
  })


  ###############################################################
  ######################## forecast_manual########################
  ###############################################################

  df5 <- reactiveVal(NULL)

  # 2. Ketika user submit/upload
  observeEvent(input$submit5, {
    req(input$file_upload_other5)

    data <- safe_read_data(input$file_upload_other5, input$csv_sep5)

    if (is.null(data)) {
      df5(data.frame(Pesan = "File tidak dapat dibaca."))
      return()
    }

    df5(data)

    # Validasi kolom tanggal dan jumlah kolom
    result <- convert_dates2(data)
    date_columns <- result$date_columns
    num_columns <- result$num_columns

    if (num_columns < 2 && length(date_columns) == 0) {
      showModal(modalDialog(
        title = "Peringatan: Kolom Tidak Valid",
        paste("File memiliki", num_columns, "kolom dan tidak ada kolom tanggal."),
        easyClose = TRUE,
        footer = modalButton("Tutup")
      ))
    } else if (num_columns < 2 && length(date_columns) > 0) {
      showModal(modalDialog(
        title = "Informasi: Tanggal Ditemukan, Kolom Kurang",
        paste("File memiliki", num_columns, "kolom. Kolom tanggal terdeteksi:", paste(date_columns, collapse = ", ")),
        easyClose = TRUE,
        footer = modalButton("Tutup")
      ))
    }
  })


  output$df5table_output <- renderDT({
    req(df5())
    DT::datatable(df5(), options = list(scrollX = TRUE))
  })


  forecast_manual_pilih <- eventReactive(input$runpilihmetodeotomatis, {
    list_variabel <- konversi_ke_list_forecast(df5())
    hasil_akurasiL <- loop_akurasi_forecast_list(list_variabel, makur = input$akurasi_forecastx5)
    hasil_akurasiL
  })


  output$out_summary_forecast_manual_pilih <- renderPrint({
    forecast_manual_pilih()
  })


  Hasilforecast_manual_pilih <- eventReactive(input$runforecastmanualpilih, {
    req(input$metode_pilihan)

    metode_vec <- as.numeric(trimws(unlist(strsplit(input$metode_pilihan, ","))))


    list_variabel <- konversi_ke_list_forecast(df5())

    metode <- metode_vec
    n_var <- length(list_variabel)

    validate(
      need(
        length(metode) == n_var,
        paste0(
          "Jumlah metode pilih (", length(metode),
          ") harus sama dengan jumlah variabel (", n_var, ")"
        )
      )
    )


    hasil_forecast_manual <- forecast_dengan_pilihan_metode(
      list_data = list_variabel,
      list_akurasi = forecast_manual_pilih(),
      metode_pilihan = metode_vec,
      jf = input$jumlah_forecast5
    )

    hasilfulldf <- gabung_hasil_forecast(hasil_forecast_manual)
    hasilfulldf <- rbind(datacorex, hasilfulldf)
    hasilfulldf
  })


  transformed5_result_forecast <- reactiveVal(NULL)

  output$out_hasilforecast_manual_pilih <- DT::renderDataTable({
    req(Hasilforecast_manual_pilih())

    df <- Hasilforecast_manual_pilih()

    if (input$transform5) {
      Date <- df[, 1]
      df3x <- df[, -1]
      df3new <- transform(df3x)
      df3new <- cbind(Date, df3new)
      df3new <- na.omit(df3new)

      transformed5_result_forecast(df3new) # ✅ simpan hasil transformasi

      DT::datatable(df3new, options = list(scrollX = TRUE))
    } else {
      transformed5_result_forecast(df) # ✅ simpan data asli (tanpa transformasi)

      DT::datatable(df, options = list(scrollX = TRUE))
    }
  })


  output$download_forecast_manual_pilih <- downloadHandler(
    filename = function() {
      paste0("hasil_forecast_manualpilih_", format(Sys.time(), "%Y-%m-%d_%H-%M-%S"), ".xlsx")
    },
    content = function(file) {
      wb <- createWorkbook()

      # Tambahkan semua data frame hasil ke sheet Excel, gunakan tryCatch untuk menangani error

      addWorksheet(wb, "Data Forecast Pilih")
      tryCatch(
        {
          writeData(wb, "Data Forecast Pilih", transformed5_result_forecast())
        },
        error = function(e) {
          cat("Error pada sheet 'Data Forecast Pilih':", e$message, "\n")
          writeData(wb, "Data Forecast Pilih", data.frame()) # Kosongkan jika error
        }
      )

      saveWorkbook(wb, file, overwrite = TRUE)
    }
  )


  ###############################################################################################
  ###############################################################################################
  ######################################### dataforecast6#################################################
  df6 <- reactiveVal(NULL)

  # 2. Ketika user submit/upload
  observeEvent(input$submit6, {
    req(input$file_upload_other6)

    data <- safe_read_data(input$file_upload_other6, input$csv_sep6)

    if (is.null(data)) {
      df6(data.frame(Pesan = "File tidak dapat dibaca."))
      return()
    }

    df6(data)

    # Validasi kolom tanggal dan jumlah kolom
    result <- convert_dates2(data)
    date_columns <- result$date_columns
    num_columns <- result$num_columns

    if (num_columns < 2 && length(date_columns) == 0) {
      showModal(modalDialog(
        title = "Peringatan: Kolom Tidak Valid",
        paste("File memiliki", num_columns, "kolom dan tidak ada kolom tanggal."),
        easyClose = TRUE,
        footer = modalButton("Tutup")
      ))
    } else if (num_columns < 2 && length(date_columns) > 0) {
      showModal(modalDialog(
        title = "Informasi: Tanggal Ditemukan, Kolom Kurang",
        paste("File memiliki", num_columns, "kolom. Kolom tanggal terdeteksi:", paste(date_columns, collapse = ", ")),
        easyClose = TRUE,
        footer = modalButton("Tutup")
      ))
    }
  })


  output$df6table_output <- renderDT({
    req(df6())
    DT::datatable(df6(), options = list(scrollX = TRUE))
  })


  # ===============================
  # 3. RUN FORECAST
  # ===============================

  transformed6_result_forecast <- reactiveVal(NULL)


  hasil_forecast6 <- eventReactive(input$run_pilih_metode, {
    req(df6())
    req(input$pilihmetodeforecast)
    req(input$jumlah_forecast6)


    forecast_semua_variabel(
      datawide = df6(),
      metode   = input$pilihmetodeforecast,
      jf       = input$jumlah_forecast6,
      byy      = "month"
    )
  })


  # ===============================
  # 4. TAMPILKAN HASIL FORECAST
  # ===============================

  output$out_hasilforecast_pilih_metode <- DT::renderDataTable({
    req(hasil_forecast6())

    hasil <- hasil_forecast6()
    hasilfulldf <- gabung_hasil_forecast1(hasil)
    dfxx <- df6()
    dfxx()$Date <- as.Date(dfxx$Date)
    hasilfulldf$Date <- as.Date(hasilfulldf$Date)

    df <- bind_rows(dfxx, hasilfulldf) %>%
      arrange(Date)


    if (input$transform6) {
      Date <- df[, 1]
      df3x <- df[, -1]
      df3new <- transform(df3x)
      df3new <- cbind(Date, df3new)
      df3new <- na.omit(df3new)

      transformed6_result_forecast(df3new) # ✅ simpan hasil transformasi

      DT::datatable(df3new, options = list(scrollX = TRUE))
    } else {
      transformed6_result_forecast(df) # ✅ simpan data asli (tanpa transformasi)

      DT::datatable(df, options = list(scrollX = TRUE))
    }
  })


  output$download_forecast_pilih_metode <- downloadHandler(
    filename = function() {
      paste0("forecast_", input$pilihmetodeforecast, ".csv")
    },
    content = function(file) {
      hasil <- hasil_forecast6()
      hasilfulldf <- gabung_hasil_forecast1(hasil)
      dfxx <- df6()
      dfxx()$Date <- as.Date(dfxx$Date)
      hasilfulldf$Date <- as.Date(hasilfulldf$Date)

      df_download <- bind_rows(dfxx, hasilfulldf) %>%
        arrange(Date)

      write.csv(df_download, file, row.names = FALSE)
    }
  )


  ################################################################################################


  output$plot_forecast <- renderPlotly({
    req(data0(), hasilforecast(), namay())

    df_actual <- data0()

    # Deteksi kolom tanggal di data0
    date_cols <- names(df_actual)[sapply(df_actual, function(x) inherits(x, "Date") || inherits(x, "POSIXt"))]
    if (length(date_cols) == 0) {
      showNotification("Kolom tanggal tidak ditemukan di data0()", type = "error")
      return(NULL)
    }
    date_col_actual <- date_cols[1]

    # Siapkan data historis aktual
    data_actual <- data.frame(
      Date = df_actual[[date_col_actual]],
      Actual = df_actual[[namay()]]
    )

    # Hasil forecast
    df_forecast <- hasilforecast()

    # Ambil 1 titik terakhir dari data aktual
    last_actual_point <- tail(data_actual, 1)

    # Ambil semua baris forecast
    df_forecast_plot <- rbind(
      data.frame(
        Date = last_actual_point$Date,
        Forecast = last_actual_point$Actual,
        Lower = NA,
        Upper = NA
      ),
      df_forecast
    )

    # Plot
    g <- ggplot() +
      geom_line(data = data_actual, aes(x = Date, y = Actual), color = "red", size = 1) +
      geom_line(data = df_forecast_plot, aes(x = Date, y = Forecast), color = "deepskyblue4", size = 1) +
      geom_ribbon(data = df_forecast, aes(x = Date, ymin = Lower, ymax = Upper), fill = "red", alpha = 0.2) +
      geom_vline(xintercept = min(df_forecast$Date), linetype = "dashed") +
      labs(
        title = paste(namay(), "by Month"),
        y = namay(),
        x = "Date"
      ) +
      theme_minimal() +
      scale_x_date(date_breaks = "6 months", date_labels = "%Y-%m") +
      theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
      scale_y_continuous()

    # Ubah ke plotly
    ggplotly(g) %>% layout(autosize = TRUE)
  })


  ############### download#################
  output$download_upload_csv <- downloadHandler(
    filename = function() {
      req(input$download_upload_id)

      fname <- dbGetQuery(con, "
      SELECT filename FROM upload_history WHERE id = $1
    ", params = list(input$download_upload_id))

      fname <- if (nrow(fname) > 0) fname$filename[1] else "file.csv"
      if (!grepl("\\.csv$", fname)) fname <- paste0(fname, ".csv")
      return(fname)
    },
    content = function(file) {
      req(input$download_upload_id)

      result <- dbGetQuery(con, "
    SELECT data FROM upload_history WHERE id = $1
  ", params = list(input$download_upload_id))

      # Jika kosong
      if (nrow(result) == 0 || is.null(result$data[[1]])) {
        write.csv(data.frame(WARNING = "Data tidak ditemukan atau kosong."), file, row.names = FALSE)
        return()
      }

      raw_bytes <- result$data[[1]]

      # Jika bukan raw → abort dan tampilkan error
      if (!inherits(raw_bytes, "raw")) {
        write.csv(data.frame(ERROR = "Format data bukan raw. Gagal menulis ulang file."), file, row.names = FALSE)
        return()
      }

      # Proses normal
      tmpfile <- tempfile(fileext = ".csv")
      str(result$data[[1]])
      typeof(result$data[[1]])
      class(result$data[[1]])

      writeBin(raw_bytes, tmpfile)

      df <- tryCatch(
        read.csv(tmpfile),
        error = function(e) data.frame(ERROR = e$message)
      )

      write.csv(df, file, row.names = FALSE)
    }
  )


  output$download_model <- downloadHandler(
    filename = function() {
      paste0("hasil_modeling_IFRS9_", format(Sys.time(), "%Y-%m-%d_%H-%M-%S"), ".xlsx")
    },
    content = function(file) {
      wb <- createWorkbook()

      # Tambahkan semua data frame hasil ke sheet Excel, gunakan tryCatch untuk menangani error

      addWorksheet(wb, "Data Y awal")
      tryCatch(
        {
          writeData(wb, "Data Y awal", data_dependent_tr())
        },
        error = function(e) {
          cat("Error pada sheet 'Data Y awal':", e$message, "\n")
          writeData(wb, "Data Y awal", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Data full")
      tryCatch(
        {
          writeData(wb, "Data full", yx())
        },
        error = function(e) {
          cat("Error pada sheet 'Data full':", e$message, "\n")
          writeData(wb, "Data full", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Data Trained")
      tryCatch(
        {
          writeData(wb, "Data Trained", data1())
        },
        error = function(e) {
          cat("Error pada sheet 'Data Trained':", e$message, "\n")
          writeData(wb, "Data Trained", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Intuisi")
      tryCatch(
        {
          writeData(wb, "Intuisi", refInt())
        },
        error = function(e) {
          cat("Error pada sheet 'Intuisi':", e$message, "\n")
          writeData(wb, "Intuisi", data.frame()) # Kosongkan jika error
        }
      )


      addWorksheet(wb, "Sign Intuisi")
      tryCatch(
        {
          writeData(wb, "Sign Intuisi", signintuisikor())
        },
        error = function(e) {
          cat("Error pada sheet 'Sign Intuisi':", e$message, "\n")
          writeData(wb, "Sign Intuisi", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Single Factor")
      tryCatch(
        {
          writeData(wb, "Single Factor", model_reg1var())
        },
        error = function(e) {
          cat("Error pada sheet 'Single Factor':", e$message, "\n")
          writeData(wb, "Single Factor", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Korelasi 2 Var")
      tryCatch(
        {
          writeData(wb, "Korelasi 2 Var", korel_reg2var())
        },
        error = function(e) {
          cat("Error pada sheet 'Korelasi 2 Var':", e$message, "\n")
          writeData(wb, "Korelasi 2 Var", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Korelasi 3 Var")
      tryCatch(
        {
          writeData(wb, "Korelasi 3 Var", korel_reg3var())
        },
        error = function(e) {
          cat("Error pada sheet 'Korelasi 3 Var':", e$message, "\n")
          writeData(wb, "Korelasi 3 Var", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Regresi 2 Var")
      tryCatch(
        {
          writeData(wb, "Regresi 2 Var", model_reg2var())
        },
        error = function(e) {
          cat("Error pada sheet 'Regresi 2 Var':", e$message, "\n")
          writeData(wb, "Regresi 2 Var", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Regresi 3 Var")
      tryCatch(
        {
          writeData(wb, "Regresi 3 Var", model_reg3var())
        },
        error = function(e) {
          cat("Error pada sheet 'Regresi 3 Var':", e$message, "\n")
          writeData(wb, "Regresi 3 Var", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Gabungan Model")
      tryCatch(
        {
          writeData(wb, "Gabungan Model", model_reg23var())
        },
        error = function(e) {
          cat("Error pada sheet 'Gabungan Model':", e$message, "\n")
          writeData(wb, "Gabungan Model", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Uji Asumsi")
      tryCatch(
        {
          writeData(wb, "Uji Asumsi", ujiasumsif())
        },
        error = function(e) {
          cat("Error pada sheet 'Uji Asumsi':", e$message, "\n")
          writeData(wb, "Uji Asumsi", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Backtest")
      tryCatch(
        {
          writeData(wb, "Backtest", backtestf())
        },
        error = function(e) {
          cat("Error pada sheet 'Backtest':", e$message, "\n")
          writeData(wb, "Backtest", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Final Model")
      tryCatch(
        {
          writeData(wb, "Final Model", finalmodel())
        },
        error = function(e) {
          cat("Error pada sheet 'Final Model':", e$message, "\n")
          writeData(wb, "Final Model", data.frame()) # Kosongkan jika error
        }
      )


      saveWorkbook(wb, file, overwrite = TRUE)
    }
  )


  output$download_all_outputs <- downloadHandler(
    filename = function() {
      paste0("Modeling & Forecasting_IFRS9_", format(Sys.time(), "%Y-%m-%d_%H-%M-%S"), ".xlsx")
    },
    content = function(file) {
      wb <- createWorkbook()

      # Tambahkan semua data frame hasil ke sheet Excel, gunakan tryCatch untuk menangani error

      addWorksheet(wb, "Data Y awal")
      tryCatch(
        {
          writeData(wb, "Data Y awal", data_dependent_tr())
        },
        error = function(e) {
          cat("Error pada sheet 'Data Y awal':", e$message, "\n")
          writeData(wb, "Data Y awal", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Data full")
      tryCatch(
        {
          writeData(wb, "Data full", yx())
        },
        error = function(e) {
          cat("Error pada sheet 'Data full':", e$message, "\n")
          writeData(wb, "Data full", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Data Trained")
      tryCatch(
        {
          writeData(wb, "Data Trained", data1())
        },
        error = function(e) {
          cat("Error pada sheet 'Data Trained':", e$message, "\n")
          writeData(wb, "Data Trained", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Intuisi")
      tryCatch(
        {
          writeData(wb, "Intuisi", refInt())
        },
        error = function(e) {
          cat("Error pada sheet 'Intuisi':", e$message, "\n")
          writeData(wb, "Intuisi", data.frame()) # Kosongkan jika error
        }
      )


      addWorksheet(wb, "Sign Intuisi")
      tryCatch(
        {
          writeData(wb, "Sign Intuisi", signintuisikor())
        },
        error = function(e) {
          cat("Error pada sheet 'Sign Intuisi':", e$message, "\n")
          writeData(wb, "Sign Intuisi", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Single Factor")
      tryCatch(
        {
          writeData(wb, "Single Factor", model_reg1var())
        },
        error = function(e) {
          cat("Error pada sheet 'Single Factor':", e$message, "\n")
          writeData(wb, "Single Factor", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Korelasi 2 Var")
      tryCatch(
        {
          writeData(wb, "Korelasi 2 Var", korel_reg2var())
        },
        error = function(e) {
          cat("Error pada sheet 'Korelasi 2 Var':", e$message, "\n")
          writeData(wb, "Korelasi 2 Var", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Korelasi 3 Var")
      tryCatch(
        {
          writeData(wb, "Korelasi 3 Var", korel_reg3var())
        },
        error = function(e) {
          cat("Error pada sheet 'Korelasi 3 Var':", e$message, "\n")
          writeData(wb, "Korelasi 3 Var", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Regresi 2 Var")
      tryCatch(
        {
          writeData(wb, "Regresi 2 Var", model_reg2var())
        },
        error = function(e) {
          cat("Error pada sheet 'Regresi 2 Var':", e$message, "\n")
          writeData(wb, "Regresi 2 Var", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Regresi 3 Var")
      tryCatch(
        {
          writeData(wb, "Regresi 3 Var", model_reg3var())
        },
        error = function(e) {
          cat("Error pada sheet 'Regresi 3 Var':", e$message, "\n")
          writeData(wb, "Regresi 3 Var", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Gabungan Model")
      tryCatch(
        {
          writeData(wb, "Gabungan Model", model_reg23var())
        },
        error = function(e) {
          cat("Error pada sheet 'Gabungan Model':", e$message, "\n")
          writeData(wb, "Gabungan Model", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Uji Asumsi")
      tryCatch(
        {
          writeData(wb, "Uji Asumsi", ujiasumsif())
        },
        error = function(e) {
          cat("Error pada sheet 'Uji Asumsi':", e$message, "\n")
          writeData(wb, "Uji Asumsi", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Backtest")
      tryCatch(
        {
          writeData(wb, "Backtest", backtestf())
        },
        error = function(e) {
          cat("Error pada sheet 'Backtest':", e$message, "\n")
          writeData(wb, "Backtest", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Final Model")
      tryCatch(
        {
          writeData(wb, "Final Model", finalmodel())
        },
        error = function(e) {
          cat("Error pada sheet 'Final Model':", e$message, "\n")
          writeData(wb, "Final Model", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Model Akhir")
      tryCatch(
        {
          writeData(wb, "Model Akhir", tabel_pemilihan_model_akhir())
        },
        error = function(e) {
          cat("Error pada sheet 'Model Akhir':", e$message, "\n")
          writeData(wb, "Model Akhir", data.frame()) # Kosongkan jika error
        }
      )

      addWorksheet(wb, "Forecast X")
      tryCatch(
        {
          writeData(wb, "Forecast X", forecastxxx())
        },
        error = function(e) {
          cat("Error pada sheet 'Forecast X':", e$message, "\n")
          writeData(wb, "Forecast X", data.frame()) # Kosongkan jika error
        }
      )


      addWorksheet(wb, "Forecast ALL Y")
      tryCatch(
        {
          writeData(wb, "Forecast ALL Y", forecastaveragey())
        },
        error = function(e) {
          cat("Error pada sheet 'Forecast ALL Y':", e$message, "\n")
          writeData(wb, "Forecast ALL Y", data.frame()) # Kosongkan jika error
        }
      )


      addWorksheet(wb, "Forecast ALL averageY")
      tryCatch(
        {
          writeData(wb, "Forecast ALL averageY", averageygabmodel())
        },
        error = function(e) {
          cat("Error pada sheet 'Forecast ALL averageY':", e$message, "\n")
          writeData(wb, "Forecast ALL averageY", data.frame()) # Kosongkan jika error
        }
      )


      addWorksheet(wb, "Forecast Y")
      tryCatch(
        {
          writeData(wb, "Forecast Y", hasilforecast())
        },
        error = function(e) {
          cat("Error pada sheet 'Forecast Y':", e$message, "\n")
          writeData(wb, "Forecast Y", data.frame()) # Kosongkan jika error
        }
      )


      saveWorkbook(wb, file, overwrite = TRUE)
    }
  )


  output$downloadPlot <- downloadHandler(
    filename = function() {
      paste0("forecast_plot_", Sys.Date(), ".png")
    },
    content = function(file) {
      req(data0(), hasilforecast(), namay())

      df_actual <- data0()

      # Deteksi kolom tanggal di data0
      date_cols <- names(df_actual)[sapply(df_actual, function(x) inherits(x, "Date") || inherits(x, "POSIXt"))]
      if (length(date_cols) == 0) {
        showNotification("Kolom tanggal tidak ditemukan di data0()", type = "error")
        return(NULL)
      }
      date_col_actual <- date_cols[1]

      # Siapkan data historis aktual
      data_actual <- data.frame(
        Date = df_actual[[date_col_actual]],
        Actual = df_actual[[namay()]]
      )

      # Hasil forecast
      df_forecast <- hasilforecast()

      # Plot
      g <- ggplot() +
        geom_line(data = data_actual, aes(x = Date, y = Actual), color = "red", size = 1) +
        geom_line(data = df_forecast, aes(x = Date, y = Forecast), color = "deepskyblue4", size = 1) +
        geom_ribbon(data = df_forecast, aes(x = Date, ymin = Lower, ymax = Upper), fill = "red", alpha = 0.2) +
        geom_vline(xintercept = min(df_forecast$Date), linetype = "dashed") +
        labs(
          title = paste(namay(), "by Month"),
          y = namay(),
          x = "Date"
        ) +
        theme_minimal() +
        scale_x_date(date_breaks = "6 months", date_labels = "%Y-%m") +
        theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
        scale_y_continuous()

      # Simpan ke file PNG
      ggsave(file, plot = g, device = "png", width = 10, height = 6)
    }
  )


  observeEvent(input$save_model_db, {
    # req(input$model_name_input)


    # --- VALIDASI NAMA (wajib & unik) ---
    nm <- input$model_name_input
    if (is.null(nm)) nm <- ""
    nm <- gsub("^\\s+|\\s+$", "", nm) # trim spasi kiri-kanan

    if (nm == "") {
      showNotification("Nama model tidak boleh kosong.", type = "error")
      return()
    }
    if (nchar(nm) > 50) {
      showNotification("Nama model terlalu panjang (maks 50 karakter).", type = "error")
      return()
    }

    # Cek duplikat di DB (case-insensitive) untuk yang belum dihapus
    dup <- dbGetQuery(
      con,
      "SELECT model_id
     FROM frs9_r_model_summary
     WHERE lower(model_name) = lower($1)
       AND id_deleted = FALSE
     LIMIT 1",
      params = list(nm)
    )

    if (nrow(dup) > 0) {
      showNotification(
        paste0("Nama model '", nm, "' sudah ada (ID=", dup$model_id[1], "). Gunakan nama lain."),
        type = "error"
      )
      return()
    }

    # Simpan ke workbook
    file_path <- tempfile(fileext = ".xlsx")
    wb <- createWorkbook()
    # Tambahkan semua data frame hasil ke sheet Excel, gunakan tryCatch untuk menangani error

    addWorksheet(wb, "Data Y awal")
    tryCatch(
      {
        writeData(wb, "Data Y awal", data_dependent_tr())
      },
      error = function(e) {
        cat("Error pada sheet 'Data Y awal':", e$message, "\n")
        writeData(wb, "Data Y awal", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Data full")
    tryCatch(
      {
        writeData(wb, "Data full", yx())
      },
      error = function(e) {
        cat("Error pada sheet 'Data full':", e$message, "\n")
        writeData(wb, "Data full", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Data Trained")
    tryCatch(
      {
        writeData(wb, "Data Trained", data1())
      },
      error = function(e) {
        cat("Error pada sheet 'Data Trained':", e$message, "\n")
        writeData(wb, "Data Trained", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Intuisi")
    tryCatch(
      {
        writeData(wb, "Intuisi", refInt())
      },
      error = function(e) {
        cat("Error pada sheet 'Intuisi':", e$message, "\n")
        writeData(wb, "Intuisi", data.frame()) # Kosongkan jika error
      }
    )


    addWorksheet(wb, "Sign Intuisi")
    tryCatch(
      {
        writeData(wb, "Sign Intuisi", signintuisikor())
      },
      error = function(e) {
        cat("Error pada sheet 'Sign Intuisi':", e$message, "\n")
        writeData(wb, "Sign Intuisi", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Single Factor")
    tryCatch(
      {
        writeData(wb, "Single Factor", model_reg1var())
      },
      error = function(e) {
        cat("Error pada sheet 'Single Factor':", e$message, "\n")
        writeData(wb, "Single Factor", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Korelasi 2 Var")
    tryCatch(
      {
        writeData(wb, "Korelasi 2 Var", korel_reg2var())
      },
      error = function(e) {
        cat("Error pada sheet 'Korelasi 2 Var':", e$message, "\n")
        writeData(wb, "Korelasi 2 Var", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Korelasi 3 Var")
    tryCatch(
      {
        writeData(wb, "Korelasi 3 Var", korel_reg3var())
      },
      error = function(e) {
        cat("Error pada sheet 'Korelasi 3 Var':", e$message, "\n")
        writeData(wb, "Korelasi 3 Var", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Regresi 2 Var")
    tryCatch(
      {
        writeData(wb, "Regresi 2 Var", model_reg2var())
      },
      error = function(e) {
        cat("Error pada sheet 'Regresi 2 Var':", e$message, "\n")
        writeData(wb, "Regresi 2 Var", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Regresi 3 Var")
    tryCatch(
      {
        writeData(wb, "Regresi 3 Var", model_reg3var())
      },
      error = function(e) {
        cat("Error pada sheet 'Regresi 3 Var':", e$message, "\n")
        writeData(wb, "Regresi 3 Var", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Gabungan Model")
    tryCatch(
      {
        writeData(wb, "Gabungan Model", model_reg23var())
      },
      error = function(e) {
        cat("Error pada sheet 'Gabungan Model':", e$message, "\n")
        writeData(wb, "Gabungan Model", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Uji Asumsi")
    tryCatch(
      {
        writeData(wb, "Uji Asumsi", ujiasumsif())
      },
      error = function(e) {
        cat("Error pada sheet 'Uji Asumsi':", e$message, "\n")
        writeData(wb, "Uji Asumsi", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Backtest")
    tryCatch(
      {
        writeData(wb, "Backtest", backtestf())
      },
      error = function(e) {
        cat("Error pada sheet 'Backtest':", e$message, "\n")
        writeData(wb, "Backtest", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Final Model")
    tryCatch(
      {
        writeData(wb, "Final Model", finalmodel())
      },
      error = function(e) {
        cat("Error pada sheet 'Final Model':", e$message, "\n")
        writeData(wb, "Final Model", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Model Akhir")
    tryCatch(
      {
        writeData(wb, "Model Akhir", tabel_pemilihan_model_akhir())
      },
      error = function(e) {
        cat("Error pada sheet 'Model Akhir':", e$message, "\n")
        writeData(wb, "Model Akhir", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Forecast X")
    tryCatch(
      {
        writeData(wb, "Forecast X", forecastxxx())
      },
      error = function(e) {
        cat("Error pada sheet 'Forecast X':", e$message, "\n")
        writeData(wb, "Forecast X", data.frame()) # Kosongkan jika error
      }
    )

    addWorksheet(wb, "Forecast Y")
    tryCatch(
      {
        writeData(wb, "Forecast Y", hasilforecast())
      },
      error = function(e) {
        cat("Error pada sheet 'Forecast Y':", e$message, "\n")
        writeData(wb, "Forecast Y", data.frame()) # Kosongkan jika error
      }
    )


    saveWorkbook(wb, file = file_path, overwrite = TRUE)

    if (!file.exists(file_path)) {
      showNotification("❌ File hasil workbook tidak ditemukan.", type = "error")
      return()
    }

    file_size <- file.info(file_path)$size
    if (is.na(file_size) || file_size == 0) {
      showNotification("❌ File Excel kosong atau gagal dibuat.", type = "error")
      return()
    }


    # Baca file sebagai raw
    # raw_data <- readBin(file_path, what = "raw", n = file.info(file_path)$size)
    # Baca sebagai raw, pastikan bukan list
    raw_data <- tryCatch(
      {
        con_file <- file(file_path, "rb") # rb = read binary
        on.exit(close(con_file), add = TRUE)
        readBin(con_file, what = "raw", n = file.info(file_path)$size)
      },
      error = function(e) {
        showNotification(paste("❌ Gagal membaca file sebagai raw:", e$message), type = "error")
        return(NULL)
      }
    )


    if (is.null(raw_data) || !is.raw(raw_data) || length(raw_data) == 0) {
      showNotification("❌ Data file tidak valid untuk disimpan ke PostgreSQL.", type = "error")
      return()
    }

    cat("✅ raw_data type:", typeof(raw_data), "\n")
    cat("✅ raw_data length:", length(raw_data), "\n")


    # Ambil nilai dari satu baris model final
    model_row <- tabel_pemilihan_model_akhir() # Gunakan baris pertama saja sebagai ringkasan
    r_squared <- if ("R_squared" %in% names(model_row)) model_row$R_squared else NA
    mape <- if ("MAPEgabung" %in% names(model_row)) model_row$MAPEgabung else NA
    dep_var <- namay()

    # Simpan ke PostgreSQL

    tryCatch(
      {
        query <- "
              INSERT INTO frs9_r_model_summary
              (model_name, model_status, dependent_variable, r_squared, mape, data_file, created_by)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              "

        stmt <- dbSendQuery(con, query)

        # Kirim parameter satu per satu
        dbBind(stmt, list(
          nm,
          "active",
          dep_var,
          r_squared,
          mape,
          I(list(raw_data)), # penting: bungkus dengan I() + list() agar dianggap binary
          Sys.getenv("USERNAME")
        ))

        dbClearResult(stmt)

        showNotification("✅ Model berhasil disimpan ke database.", type = "message")
        updateTextInput(session, "model_name_input", value = "")
      },
      error = function(e) {
        showNotification(paste("❌ Gagal simpan model:", e$message), type = "error")
      }
    )
  })


  model_summary_data_DB <- reactiveVal({
    dbGetQuery(con, "
    SELECT model_id, model_name, model_status, dependent_variable, r_squared, mape, created_date
    FROM frs9_r_model_summary
    WHERE id_deleted = FALSE
    ORDER BY model_id DESC
  ")
  })


  output$model_summary_table_DB <- renderDT({
    datatable(model_summary_data_DB(), options = list(pageLength = 5, autoWidth = TRUE), rownames = FALSE)
  })


  model_summary_data_DB2 <- eventReactive(input$refresh,
    {
      dbGetQuery(con, "
     SELECT model_id, model_name, model_status, dependent_variable, r_squared, mape, created_date
     FROM frs9_r_model_summary
     WHERE id_deleted = FALSE
     ORDER BY model_id DESC
   ")
    },
    ignoreNULL = FALSE
  )

  output$model_summary_table_DB2 <- renderDT({
    datatable(model_summary_data_DB2(), options = list(pageLength = 5, autoWidth = TRUE, scrollX = TRUE), rownames = FALSE)
  })


  output$segmentationPDAFLUI <- renderUI({
    selectInput("segmentpd", "Segmentation:", choices = setNames(PD$PKID, PD$PD_MODEL_NAME))
  })

  dataissuerrr0 <- eventReactive(input$runpdafl, {
    datais <- dbGetQuery(con, 'SELECT  "PRC_DATE","BUCKET_FROM", "CALC_AMOUNT"
    FROM "FRS9_IMP_CA_PD_ENR"
    WHERE "PD_CONFIG_ID" = $1',
      params = list(input$segmentpd)
    )
    datais
  })

  konfig_id <- eventReactive(input$runpdafl, {
    datacon <- dbGetQuery(con, 'SELECT  "POPULATION_TYPE","OBSERVATION_PERIOD", "OBSERVATION_START_DATE"
    FROM "FRS9_IMP_CA_PD_CONFIG"
    WHERE "PKID" = $1',
      params = list(input$segmentpd)
    )
    datacon
  })

  dataissuerrr01 <- reactive({
    dataisu <- dataissuerrr0()
    config <- konfig_id()

    # pastikan tipe data Date
    dataisu$PRC_DATE <- as.Date(dataisu$PRC_DATE)
    config$OBSERVATION_START_DATE <- as.Date(config$OBSERVATION_START_DATE)

    if (config$POPULATION_TYPE == 1) {
      dataku <- dataisu
    } else if (config$POPULATION_TYPE == 2) {
      # ambil n periode terakhir sesuai OBSERVATION_PERIOD
      last_n_dates <- tail(unique(dataisu$PRC_DATE), config$OBSERVATION_PERIOD)
      # print(last_n_dates[1])
      dataku <- dataisu[dataisu$PRC_DATE %in% last_n_dates, ]

      # filter tambahan jika mulai periode lebih besar dari start date
      if (min(last_n_dates) < config$OBSERVATION_START_DATE) {
        dataku <- dataku[dataku$PRC_DATE >= config$OBSERVATION_START_DATE, ]
      }

      # } else {
      #  dataku <- dataisu
    }

    dataku
  })


  datammulttt0 <- eventReactive(input$runpdafl, {
    dataemut <- dbGetQuery(con, 'SELECT * FROM "FRS9_IMP_CA_PD_MMULT"
    WHERE "PD_CONFIG_ID" = $1',
      params = list(input$segmentpd)
    )
    dataemut
  })


  observeEvent(input$refresh,
    {
      modelupload <- tryCatch(
        dbGetQuery(con, 'SELECT "model_id","model_name" FROM "frs9_r_model_summary" ORDER BY created_date DESC'),
        error = function(e) {
          NULL
        }
      )
      if (!is.null(modelupload) && nrow(modelupload) > 0) {
        choices <- setNames(modelupload$model_name, modelupload$model_name) # value = model_name
        updateSelectInput(session, "choose_model", choices = choices)
      }
    },
    ignoreNULL = FALSE
  )


  dataydanfileexcelDB <- reactive({
    result0 <- dbGetQuery(con, '
  SELECT "dependent_variable", "data_file"
  FROM frs9_r_model_summary
  WHERE model_name = $1
', params = list(input$choose_model))
    result0
  })

  # variable Y yang digunakan
  vary_pdafl <- reactive({
    dataydanfileexcelDB()$dependent_variable
  })


  # Reactive: path file .xlsx
  reactive_excel_path <- reactiveVal(NULL)

  observeEvent(dataydanfileexcelDB(),
    {
      df0 <- dataydanfileexcelDB()

      # Validasi hasil query
      if (is.null(df0) || nrow(df0) == 0) {
        reactive_excel_path(NULL)
        showNotification("Model tidak ditemukan / tidak ada data_file.", type = "error")
        return()
      }

      bin <- df0$data_file[[1]]
      if (is.null(bin)) {
        reactive_excel_path(NULL)
        showNotification("Kolom data_file kosong.", type = "error")
        return()
      }


      # Tulis ke tempfile .xlsx
      path <- tempfile(fileext = ".xlsx")
      ok <- tryCatch(
        {
          writeBin(bin, path)
          TRUE
        },
        error = function(e) {
          showNotification(paste("Gagal menulis file:", e$message), type = "error")
          FALSE
        }
      )

      if (ok && file.exists(path)) {
        reactive_excel_path(path)
      } else {
        reactive_excel_path(NULL)
      }
    },
    ignoreInit = TRUE
  )


  # mevcoba

  datacorex <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    df <- tryCatch(
      {
        openxlsx::read.xlsx(temp_xlsx, sheet = "Data full", detectDates = TRUE)
      },
      error = function(e) {
        showNotification(paste("Gagal baca sheet 'Data full':", e$message), type = "error")
        return(NULL)
      }
    )
    req(!is.null(df), ncol(df) >= 2)

    namax <- names(df)
    sources <- unique(sapply(strsplit(namax, "_"), `[`, 1))
    sources <- sources[sources %in% names(df)] # guard kolom
    if (length(sources) == 0) {
      return(df)
    } # fallback: kembalikan df apa adanya

    df[, sources, drop = FALSE]
  })

  intuisi_pdafl <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    tryCatch(
      {
        openxlsx::read.xlsx(temp_xlsx, sheet = "Intuisi")
      },
      error = function(e) {
        showNotification(paste("Gagal baca sheet 'Intuisi':", e$message), type = "error")
        return(NULL)
      }
    )
  })


  # Tempat menyimpan data yang bisa diedit
  intuisiData_pdafl <- reactiveValues(data = NULL)

  observeEvent(intuisi_pdafl(), {
    req(intuisi_pdafl())
    intuisiData_pdafl$data <- intuisi_pdafl()
  })

  output$intuisitable_pdafl <- DT::renderDataTable({
    req(intuisiData_pdafl$data)
    DT::datatable(intuisiData_pdafl$data, editable = TRUE, options = list(dom = "t"))
  })

  # PERBAIKI ID DI SINI
  observeEvent(input$intuisitable_pdafl_cell_edit, {
    info <- input$intuisitable_pdafl_cell_edit
    i <- info$row
    j <- info$col
    v <- suppressWarnings(as.numeric(info$value))

    if (!is.na(v) && v %in% c(-1, 0, 1)) {
      intuisiData_pdafl$data[i, j] <- v
    } else {
      showModal(modalDialog(
        title = "Input Tidak Valid",
        "Hanya boleh memasukkan nilai -1, 0, atau 1.",
        easyClose = TRUE
      ))
    }
  })


  ################################## eksekusi mev boxplot######################################

  eksekusi_mev_BPF <- eventReactive(input$runpdafl, {
    datax <- datacorex()[, -1:-2]

    intuisi <- intuisiData_pdafl$data$sign
    # eksekusi
    hasil_boxplot <- Boxplot_Scenario(datax, intuisi)
    hasil_boxplot
  })

  output$df_klasifikasi_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$df.klasifikasi, options = list(autoWidth = F, scrollX = TRUE, scrollY = "300px", dom = "t", paging = F))
  })


  output$category_frecuency_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$category.frecuency, options = list(autoWidth = F, scrollX = TRUE, scrollY = "300px", dom = "t", paging = FALSE))
  })

  output$category_percentage_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$category.percentage, options = list(autoWidth = F, scrollX = TRUE, scrollY = "300px", dom = "t", paging = FALSE), rownames = FALSE)
  })


  # --- reactive storage ---
  weighted_pdafl <- reactiveValues(data = NULL)

  observeEvent(eksekusi_mev_BPF(), {
    req(eksekusi_mev_BPF())
    weighted_pdafl$data <- data.frame(weight = eksekusi_mev_BPF()$weighted.boxplot)
  })


  # --- read-only table (snapshot awal) ---
  output$weighted_boxplot_table0 <- DT::renderDT({
    DT::datatable(data.frame(weight = eksekusi_mev_BPF()$weighted.boxplot), options = list(autoWidth = FALSE, dom = "t", paging = FALSE))
  })

  # --- editable table ---
  output$weighted_boxplot_table <- DT::renderDT({
    req(weighted_pdafl$data)
    DT::datatable(
      weighted_pdafl$data,
      options = list(dom = "t", paging = FALSE),
      editable = TRUE
    )
  })

  # Proxy untuk mereset tampilan jika edit tidak valid
  observeEvent(input$weighted_boxplot_table_cell_edit, {
    info <- input$weighted_boxplot_table_cell_edit
    i <- info$row
    j <- info$col
    v <- suppressWarnings(as.numeric(info$value))

    if (!is.na(v)) {
      # Salin data lama
      new_data <- weighted_pdafl$data

      # Update nilai di data sementara
      new_data[i, j] <- v

      # Cek total weight dengan pembulatan
      total_weight <- round(sum(new_data$weight), 2) # Bulatkan 6 desimal

      if (total_weight == 1) {
        weighted_pdafl$data <- new_data
      } else {
        showModal(modalDialog(
          title = "Input Tidak Valid",
          paste0("Jumlah seluruh weight harus = 1. Saat ini: ", total_weight),
          easyClose = TRUE
        ))
      }
    }
  })


  output$avg_table_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$avg.table, options = list(pageLength = 5, autoWidth = F, scrollX = TRUE, scrollY = "400px", dom = "t", paging = FALSE))
  })

  output$diff_base_table <- DT::renderDataTable({
    req(eksekusi_mev_BPF())
    DT::datatable(eksekusi_mev_BPF()$diff.base, options = list(pageLength = 5, autoWidth = F, scrollX = TRUE, scrollY = "400px", dom = "t", paging = FALSE))
  })


  ################### Eksekusi Forecast Mev Boxplot#################


  fmev_base_pdfl <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    df <- tryCatch(
      {
        openxlsx::read.xlsx(temp_xlsx, sheet = "Forecast X", detectDates = T)
      },
      error = function(e) {
        showNotification(paste("Gagal baca sheet 'Forecast X':", e$message), type = "error")
        return(NULL)
      }
    )
    df
  })


  modelfromhisto_pdfl <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    df <- tryCatch(
      {
        openxlsx::read.xlsx(temp_xlsx, sheet = "Model Akhir", detectDates = T)
      },
      error = function(e) {
        showNotification(paste("Gagal baca sheet 'model akhir':", e$message), type = "error")
        return(NULL)
      }
    )
    df
  })


  datahisto_pdfl <- reactive({
    temp_xlsx <- reactive_excel_path()
    req(!is.null(temp_xlsx), file.exists(temp_xlsx))

    df <- tryCatch(
      {
        openxlsx::read.xlsx(temp_xlsx, sheet = "Data full", detectDates = T)
      },
      error = function(e) {
        showNotification(paste("Gagal baca sheet 'Data full':", e$message), type = "error")
        return(NULL)
      }
    )
    df
  })


  fo_boxplot_pdafl <- eventReactive(input$runpdafl, {
    datahisto <- datahisto_pdfl()
    modelfromhisto <- modelfromhisto_pdfl()
    fmev_base <- fmev_base_pdfl()

    modelfromhistoku <- modelfromhisto$Model
    modelku <- lm(modelfromhistoku, data = datahisto)
    vars_needed <- unlist(modelfromhisto[, c("var1", "var2", "var3")], use.names = FALSE)
    vars_available <- intersect(vars_needed, names(fmev_base))

    if (length(vars_available) == 0) {
      stop("Tidak ada kolom yang cocok antara model dan fmev_base")
    }

    fmev_base2 <- fmev_base[, vars_available, drop = FALSE]
    dateku <- fmev_base[, 1]
    fmev_base2 <- cbind(dateku, fmev_base2)

    intuisi <- intuisiData_pdafl$data
    z <- input$backtransform
    vary <- vary_pdafl()
    # eksekusi
    fo_boxplot <- forecast_mev_bxp(fmev_base2, eksekusi_mev_BPF()$diff.base, modelku, z, vary, intuisi, metode = input$outliermet)
    fo_boxplot
  })


  output$fo_boxplotbase_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$f.base, options = list(pageLength = 5, autoWidth = TRUE, scrollX = TRUE, scrollY = "400px", dom = "t", paging = FALSE), rownames = FALSE)
  })


  output$fo_boxplotbest_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$f.best, options = list(pageLength = 5, autoWidth = TRUE, scrollX = TRUE, scrollY = "400px", dom = "t", paging = FALSE), rownames = FALSE)
  })

  output$fo_boxplotworst_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$f.worst, options = list(pageLength = 5, autoWidth = TRUE, scrollX = TRUE, scrollY = "400px", dom = "t", paging = FALSE), rownames = FALSE)
  })

  output$fo_boxplotyjoin_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$f.yjoin, options = list(pageLength = 5, autoWidth = TRUE, scrollX = TRUE, scrollY = "400px", dom = "t", paging = FALSE), rownames = FALSE)
  })

  output$fo_boxplotdiff_table <- DT::renderDataTable({
    req(fo_boxplot_pdafl())
    DT::datatable(fo_boxplot_pdafl()$diff.boxplot, options = list(pageLength = 5, autoWidth = TRUE, scrollX = TRUE, scrollY = "400px", dom = "t", paging = FALSE), rownames = FALSE)
  })


  ######################################################################################################### EKSEKUSI PD  ##################################################


  hasilPD <- eventReactive(input$runpdafl, {
    fo.y.boxplot <- fo_boxplot_pdafl()$f.yjoin
    datahisto <- datahisto_pdfl()
    vary <- vary_pdafl()
    datay <- datahisto[[vary]]
    back_trans <- function(x, z) {
      if (z == "logit") {
        y <- exp(x) / (1 + exp(x))
      } else if (z == "log") {
        y <- exp(x)
      } else {
        y <- x
      }
      return(y)
    }
    datay2 <- back_trans(datay, input$backtransform)

    # dataissuer2=aggregate(CALC_AMOUNT~BUCKET_FROM,data=dataissuerrr01(),sum)
    # issuer=dataissuer2$CALC_AMOUNT

    dataissuer2 <- dataissuerrr01() %>%
      group_by(BUCKET_FROM) %>%
      summarise(CALC_AMOUNT = sum(CALC_AMOUNT), .groups = "drop") %>%
      complete(BUCKET_FROM = 1:5, fill = list(CALC_AMOUNT = 0))
    dataissuer2 <- data.frame(dataissuer2)
    issuer <- dataissuer2$CALC_AMOUNT


    datammult <- as.data.frame(datammulttt0())
    filtered_datammult <- datammult[datammult$PRC_DATE == datammult$PRC_DATE[nrow(datammult)] & datammult$BUCKET_TO == 5, ]
    filtered_datammult$BUCKET_FROM <- factor(filtered_datammult$BUCKET_FROM, levels = 1:5)

    ym.pd <- as.data.frame.matrix(xtabs(MMULT ~ BUCKET_FROM + FL_SEQ, data = filtered_datammult))
    ym.pd[5, 2:ncol(ym.pd)] <- 0


    PD.Base <- PD_engine1(fo.y.boxplot$`ODR BASE`, datahisto$ODR, issuer, ym.pd)
    PD.Best <- PD_engine1(fo.y.boxplot$`ODR BEST`, datahisto$ODR, issuer, ym.pd)
    PD.Worst <- PD_engine1(fo.y.boxplot$`ODR WORST`, datahisto$ODR, issuer, ym.pd)


    list(
      Base  = PD.Base,
      Best  = PD.Best,
      Worst = PD.Worst
    )
  })


  hasilFinal <- eventReactive(input$runpdafl_final, {
    req(hasilPD()) # butuh Base, Best, Worst sudah dihitung

    PD.Final <- PD_engine_final(
      hasilPD()$Base$monthly_mpd_afl,
      hasilPD()$Best$monthly_mpd_afl,
      hasilPD()$Worst$monthly_mpd_afl,
      weighted_pdafl$data$weight
    )

    # return hanya tabel Final yang relevan
    list(
      monthly_mpd_afl_final = PD.Final$monthly_mpd_afl_final,
      monthly_cpd_afl_final = PD.Final$monthly_cpd_afl_final,
      yearly_mpd_afl_final   = PD.Final$yearly_mpd_afl_final,
      yearly_cpd_afl_final   = PD.Final$yearly_cpd_afl_final
    )
  })


  # === Server untuk isi DataTable ===#
  observe({
    req(hasilPD())
    pd_data <- hasilPD()

    for (scenario in c("Base", "Best", "Worst")) {
      for (tbl_key in names(pd_tables_map)) {
        local({
          s <- tolower(scenario)
          t <- tbl_key
          output[[paste0("pd_", s, "_", t)]] <- renderDT({
            datatable(
              pd_data[[scenario]][[t]],
              options = list(scrollX = TRUE, scrollY = "250px", paging = FALSE)
            )
          })
        })
      }
    }
  })


  observe({
    req(hasilFinal())
    final_data <- hasilFinal()

    for (tbl_key in names(pd_final_map)) {
      local({
        t <- tbl_key
        output[[paste0("pd_final_", t)]] <- renderDT({
          req(final_data[[t]])
          datatable(
            final_data[[t]],
            options = list(scrollX = TRUE, scrollY = "250px", paging = FALSE)
          )
        })
      })
    }
  })


  output$download_xlsx_pdafl <- downloadHandler(
    filename = function() paste0("PDAFL_Output_", Sys.Date(), ".xlsx"),
    content = function(file) {
      req(eksekusi_mev_BPF())

      # Kumpulkan semua tabel yang ingin diekspor
      # (nama tabel akan ditulis sebagai judul di atas setiap tabel)
      weights_df <- tryCatch(
        {
          if (!is.null(eksekusi_mev_BPF()$weighted.boxplot)) data.frame(weight = eksekusi_mev_BPF()$weighted.boxplot) else NULL
        },
        error = function(e) NULL
      )

      tables <- list(
        list(name = "Df Klasifikasi", df = eksekusi_mev_BPF()$df.klasifikasi),
        list(name = "Category Frequency", df = eksekusi_mev_BPF()$category.frecuency),
        list(name = "Category Percentage", df = eksekusi_mev_BPF()$category.percentage),
        list(name = "Weighted Boxplot Weights", df = weights_df),
        list(name = "Avg Table", df = eksekusi_mev_BPF()$avg.table),
        list(name = "Diff Base", df = eksekusi_mev_BPF()$diff.base)
      )

      wb <- createWorkbook()
      addWorksheet(wb, "Output")

      titleStyle <- createStyle(textDecoration = "bold", fontSize = 12)
      headerStyle <- createStyle(textDecoration = "bold")

      current_row <- 1L
      max_cols <- 1L

      for (t in tables) {
        # Lewati jika tabel NULL atau panjang 0 kolom
        if (is.null(t$df) || is.null(ncol(t$df)) || ncol(t$df) == 0) next

        # 1) Tulis nama tabel (judul)
        writeData(wb, "Output", x = t$name, startRow = current_row, startCol = 1, colNames = FALSE)
        addStyle(wb, "Output", style = titleStyle, rows = current_row, cols = 1, gridExpand = TRUE)

        # 2) Tulis tabel tepat 1 baris di bawah judul
        writeData(
          wb, "Output",
          x = t$df, startRow = current_row + 1, startCol = 1,
          headerStyle = headerStyle, borders = "rows", rowNames = FALSE
        )

        # Hitung tinggi tabel: header (1) + nrow data
        n_rows <- if (is.null(nrow(t$df))) 0L else nrow(t$df)
        block_height <- 1L + n_rows # 1 untuk header kolom

        # Update baris berikutnya: judul(1) + tabel(block_height) + jarak kosong(3)
        current_row <- current_row + 1L + block_height + 3L

        # Lacak jumlah kolom maksimum untuk auto width
        max_cols <- max(max_cols, ncol(t$df))
      }

      # Auto width untuk semua kolom yang terpakai
      setColWidths(wb, "Output", cols = 1:max_cols, widths = "auto")

      saveWorkbook(wb, file, overwrite = TRUE)
    }
  )


  # Helper: tulis banyak tabel ke **satu sheet** (judul + tabel + jarak 3 baris)
  write_tables_one_sheet <- function(wb, sheet, items, start_row = 1L) {
    titleStyle <- createStyle(textDecoration = "bold", fontSize = 12)
    headerStyle <- createStyle(textDecoration = "bold")
    current_row <- start_row
    max_cols <- 1L

    for (it in items) {
      nm <- it$name
      df <- it$df
      if (is.null(df) || is.null(ncol(df)) || ncol(df) == 0) next

      # 1) Judul
      writeData(wb, sheet, x = nm, startRow = current_row, startCol = 1, colNames = FALSE)
      addStyle(wb, sheet, titleStyle, rows = current_row, cols = 1, gridExpand = TRUE)

      # 2) Tabel
      writeData(
        wb, sheet,
        x = df, startRow = current_row + 1, startCol = 1,
        headerStyle = headerStyle, borders = "rows", rowNames = FALSE
      )

      n_rows <- if (is.null(nrow(df))) 0L else nrow(df)
      block_height <- 1L + n_rows # 1 untuk header
      current_row <- current_row + 1L + block_height + 3L # +3 baris kosong
      max_cols <- max(max_cols, ncol(df))
    }

    setColWidths(wb, sheet, cols = 1:max_cols, widths = "auto")
    invisible(current_row)
  }

  output$download_all_xlsx <- downloadHandler(
    filename = function() paste0("PDAFL_All_", max(dataissuerrr01()$PRC_DATE), " rep-", Sys.Date(), ".xlsx"),
    content = function(file) {
      wb <- createWorkbook()

      ## =========================
      ## SHEET 1: MEV Boxplot
      ## =========================
      addWorksheet(wb, "MEV Boxplot")

      # Pastikan eksekusi_mev_BPF sudah ada
      # (kalau belum, sheet tetap dibuat, tapi tanpa tabel)
      items_sheet1 <- list()
      if (!is.null(eksekusi_mev_BPF())) {
        # siapkan weight (jika ada)
        weights_df <- tryCatch(
          {
            if (!is.null(eksekusi_mev_BPF()$weighted.boxplot)) data.frame(weight = eksekusi_mev_BPF()$weighted.boxplot) else NULL
          },
          error = function(e) NULL
        )

        items_sheet1 <- list(
          list(name = "Df Klasifikasi", df = eksekusi_mev_BPF()$df.klasifikasi),
          list(name = "Category Frequency", df = eksekusi_mev_BPF()$category.frecuency),
          list(name = "Category Percentage", df = eksekusi_mev_BPF()$category.percentage),
          list(name = "Weighted Boxplot Weights", df = weights_df),
          list(name = "Avg Table", df = eksekusi_mev_BPF()$avg.table),
          list(name = "Diff Base", df = eksekusi_mev_BPF()$diff.base)
        )
      }

      # Bila tidak ada data sama sekali, tulis catatan kecil
      if (length(items_sheet1) == 0) {
        writeData(wb, "MEV Boxplot", "Belum ada data MEV Boxplot yang dieksekusi.", startRow = 1, startCol = 1)
      } else {
        write_tables_one_sheet(wb, "MEV Boxplot", items_sheet1, start_row = 1L)
      }

      ## =========================
      ## SHEET 2: MEV Forecast Boxplot
      ## =========================
      addWorksheet(wb, "MEV Forecast Boxplot")

      items_sheet2 <- list()
      if (!is.null(fo_boxplot_pdafl())) {
        items_sheet2 <- list(
          list(name = "Forecast Base", df = fo_boxplot_pdafl()$f.base),
          list(name = "Forecast Best", df = fo_boxplot_pdafl()$f.best),
          list(name = "Forecast Worst", df = fo_boxplot_pdafl()$f.worst),
          list(name = "Forecast YJoin (Gabungan)", df = fo_boxplot_pdafl()$f.yjoin),
          list(name = "Difference vs Boxplot Base", df = fo_boxplot_pdafl()$diff.boxplot)
        )
      }

      if (length(items_sheet2) == 0) {
        writeData(wb, "MEV Forecast Boxplot", "Belum ada data Forecast MEV Boxplot yang dieksekusi.", startRow = 1, startCol = 1)
      } else {
        write_tables_one_sheet(wb, "MEV Forecast Boxplot", items_sheet2, start_row = 1L)
      }

      ## =========================
      ## SHEET 3: Eksekusi PD
      ## =========================
      ## =========================
      ## SHEET 3: Eksekusi PD
      ## =========================
      addWorksheet(wb, "Eksekusi PD")

      # --- HEADER A1: Report PD Date <max(PRC_DATE)> ---
      report_text <- tryCatch(
        {
          x <- dataissuerrr01()
          if (!is.null(x) && "PRC_DATE" %in% names(x)) {
            dt <- suppressWarnings(max(as.Date(x$PRC_DATE), na.rm = TRUE))
            paste0("Report PD Date ", format(dt, "%Y-%m-%d"))
          } else {
            "Report PD Date -"
          }
        },
        error = function(e) "Report PD Date -"
      )

      openxlsx::writeData(wb, "Eksekusi PD", report_text, startRow = 1, startCol = 1)

      # (Opsional) gaya & freeze
      hdr_style <- openxlsx::createStyle(textDecoration = "bold", fontSize = 12)
      openxlsx::addStyle(wb, "Eksekusi PD", hdr_style, rows = 1, cols = 1, gridExpand = TRUE)
      openxlsx::freezePane(wb, "Eksekusi PD", firstActiveRow = 3)

      # --- KONTEN: mulai dari baris 3 (baris 2 sengaja kosong) ---
      items_sheet3 <- list()

      # 0) MASUKKAN tabel weighted_boxplot_table (hasil edit)
      weights_edited <- tryCatch(
        {
          if (!is.null(weighted_pdafl$data)) {
            dfw <- weighted_pdafl$data
            dfw <- data.frame(weight = dfw)
            dfw$weight <- as.numeric(dfw$weight)
            data.frame(Index = c("Base", "Best", "Worst"), Weight = dfw$weight)
          } else {
            NULL
          }
        },
        error = function(e) NULL
      )

      items_sheet3 <- append(items_sheet3, list(
        list(name = "Weighted Boxplot (Edited) - from weighted_boxplot_table", df = weights_edited)
      ))

      # 1) Tabel-tabel PD per skenario (Base/Best/Worst) — seperti kode Anda semula
      pd_tables_map <- list(
        FL.P.ODR           = "Forward Looking Prediction",
        TTC.ODR            = "True The Life Cycle",
        MPD.Scalling       = "Marginal PD Scalling",
        Scalling           = "Scalling",
        Optimization       = "Optimization",
        yearly_cpd_bfl     = "Yearly Cummulative PD Before Forward Looking",
        yearly_mpd_bfl     = "Yearly Marginal PD Before Forward Looking",
        yearly_mpd_afl     = "Yearly Marginal PD After Forward Looking",
        yearly_cpd_afl     = "Yearly Cummulative PD After Forward Looking",
        monthly_cpd_bfl    = "Monthly Cummulative PD Before Forward Looking",
        monthly_cpd_afl    = "Monthly Cummulative PD After Forward Looking",
        monthly_mpd_bfl    = "Monthly Marginal PD Before Forward Looking",
        monthly_mpd_afl    = "Monthly Marginal PD After Forward Looking"
      )

      if (!is.null(hasilPD())) {
        pd_data <- hasilPD()
        for (scenario in c("Base", "Best", "Worst")) {
          items_sheet3 <- append(items_sheet3, list(
            list(name = paste("Scenario:", scenario), df = data.frame(Info = " "))
          ))
          for (tbl_key in names(pd_tables_map)) {
            df_here <- tryCatch(pd_data[[scenario]][[tbl_key]], error = function(e) NULL)
            items_sheet3 <- append(items_sheet3, list(
              list(name = paste0(pd_tables_map[[tbl_key]], " (", scenario, ")"), df = df_here)
            ))
          }
        }
      }

      # 2) Tabel FINAL (opsional)
      if (!is.null(hasilFinal())) {
        final_data <- hasilFinal()
        pd_final_map <- list(
          monthly_mpd_afl_final = "Monthly Marginal PD After Forward Looking FINAL",
          monthly_cpd_afl_final = "Monthly Cummulative PD After Forward Looking FINAL",
          yearly_mpd_afl_final = "Yearly Marginal PD After Forward Looking Final",
          yearly_cpd_afl_final = "Yearly Cummulative PD After Forward Looking Final"
        )
        items_sheet3 <- append(items_sheet3, list(
          list(name = "Section: FINAL (Weighted Combination)", df = data.frame(Info = " "))
        ))
        for (tbl_key in names(pd_final_map)) {
          df_here <- tryCatch(final_data[[tbl_key]], error = function(e) NULL)
          items_sheet3 <- append(items_sheet3, list(
            list(name = pd_final_map[[tbl_key]], df = df_here)
          ))
        }
      }

      # Tulis semua tabel ke sheet, mulai baris ke-3
      if (length(items_sheet3) == 0) {
        openxlsx::writeData(wb, "Eksekusi PD", "Belum ada hasil Eksekusi PD.", startRow = 3, startCol = 1)
      } else {
        write_tables_one_sheet(wb, "Eksekusi PD", items_sheet3, start_row = 3L)
      }


      ## =========================
      ## Simpan workbook
      ## =========================
      saveWorkbook(wb, file, overwrite = TRUE)
    }
  )

  current_model_id <- reactive({
    req(input$choose_model)
    res <- dbGetQuery(con,
      "SELECT model_id FROM frs9_r_model_summary WHERE model_name = $1 LIMIT 1",
      params = list(input$choose_model)
    )
    if (nrow(res)) as.integer(res$model_id[[1]]) else NA_integer_
  })

  observeEvent(input$save_pd,
    {
      req(hasilPD())

      # meta
      prc_date <- max(dataissuerrr01()$PRC_DATE, na.rm = TRUE)
      pd_config_id <- as.integer(input$segmentpd)
      model_id <- current_model_id()
      created_by <- if (!is.null(session$user) && nzchar(session$user)) session$user else if (!is.na(Sys.info()[["user"]])) Sys.info()[["user"]] else "shiny"

      pd <- hasilPD() # list: Base, Best, Worst
      pf <- try(hasilFinal(), silent = TRUE)
      has_final <- !(inherits(pf, "try-error") || is.null(pf))

      # ===== Build YEARLY (Base/Best/Worst) =====
      df_year_base <- build_yearly_rows(pd$Base$yearly_mpd_afl, pd$Base$yearly_cpd_afl, 1L, prc_date, pd_config_id, model_id, created_by)
      df_year_best <- build_yearly_rows(pd$Best$yearly_mpd_afl, pd$Best$yearly_cpd_afl, 2L, prc_date, pd_config_id, model_id, created_by)
      df_year_worst <- build_yearly_rows(pd$Worst$yearly_mpd_afl, pd$Worst$yearly_cpd_afl, 3L, prc_date, pd_config_id, model_id, created_by)
      df_year_all <- rbind(df_year_base, df_year_best, df_year_worst)

      if (has_final) {
        df_year_final <- build_yearly_rows(
          pf$yearly_mpd_afl_final,
          pf$yearly_cpd_afl_final %||% NULL,
          4L, prc_date, pd_config_id, model_id, created_by
        )
        df_year_all <- rbind(df_year_all, df_year_final)
      }

      # ===== Build MONTHLY (Base/Best/Worst) =====
      # Gunakan monthly_cpd_afl jika ada; jika tidak, akan dihitung otomatis di helper.
      df_mon_base <- build_monthly_rows(pd$Base$monthly_mpd_afl, pd$Base$monthly_cpd_afl %||% NULL, 1L, prc_date, pd_config_id, model_id, created_by)
      df_mon_best <- build_monthly_rows(pd$Best$monthly_mpd_afl, pd$Best$monthly_cpd_afl %||% NULL, 2L, prc_date, pd_config_id, model_id, created_by)
      df_mon_worst <- build_monthly_rows(pd$Worst$monthly_mpd_afl, pd$Worst$monthly_cpd_afl %||% NULL, 3L, prc_date, pd_config_id, model_id, created_by)
      df_mon_all <- rbind(df_mon_base, df_mon_best, df_mon_worst)

      # ===== Build MONTHLY FINAL (jika tersedia) =====
      if (has_final) {
        df_mon_final <- build_monthly_rows(
          pf$monthly_mpd_afl_final,
          pf$monthly_cpd_afl_final %||% NULL,
          4L, prc_date, pd_config_id, model_id, created_by
        )
        df_mon_all <- rbind(df_mon_all, df_mon_final)
      }

      # ===== Simpan ke DB (1 transaksi) =====
      tryCatch(
        {
          DBI::dbWithTransaction(con, {
            # YEARLY
            DBI::dbAppendTable(con, "frs9_r_pd_output_yearly", df_year_all)

            # MONTHLY

            DBI::dbAppendTable(con, "frs9_r_pd_output_monthly", df_mon_all)
          })

          n_year <- nrow(df_year_all)
          n_mon <- nrow(df_mon_all)
          msg <- sprintf(
            "Sukses simpan PD: YEARLY=%d baris, MONTHLY=%d baris%s.",
            n_year, n_mon, if (has_final) " (dengan FINAL)" else ""
          )
          showNotification(msg, type = "message")
        },
        error = function(e) {
          showNotification(paste("Gagal simpan PD:", e$message), type = "error")
        }
      )
    },
    ignoreInit = TRUE
  )

  # Operator %||% (helper kecil)
  # `%||%` <- function(x, y) if (!is.null(x)) x else y
}

# shinyApp(ui, server)
shinyApp(ui, server)
