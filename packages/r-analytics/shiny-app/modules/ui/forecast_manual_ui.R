# =============================================================================
# FORECAST MANUAL UI MODULE
# =============================================================================
# Extracted from: app34.R (lines 832-992)
# Purpose: Manual forecasting interface with automatic and manual method selection
# =============================================================================

forecast_manual_ui <- function() {
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
              ) %>% shinycssloaders::withSpinner()
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
              DT::dataTableOutput("out_hasilforecast_pilih_metode") %>% shinycssloaders::withSpinner()
            )
          )
        )
      )
    )
  )
}
