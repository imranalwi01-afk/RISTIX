# =============================================================================
# FORECAST UI MODULE
# =============================================================================
# Pattern: Matches app34.R forecast section (lines 569-770)
# Uses tabsetPanel instead of tabBox for reliable tab rendering
# =============================================================================

#' Forecast UI Module
#' @description Creates the forecasting interface with MEV data processing and Y variable prediction capabilities
#' @return Shiny tabItem for forecasting operations
forecast_ui <- function() {
  tabItem(tabName = "forecast",
    fluidRow(
      column(width = 12,
        tabsetPanel(id = "forecast_tabs", type = "tabs",

          # =====================================================================
          # TAB 1: FORECAST X
          # =====================================================================
          tabPanel("Forecast X",
            br(),
            fluidRow(
              column(width = 4,
                box(width = 12, title = "Data MEV", solidHeader = TRUE, status = "primary",
                  selectInput("mevfore", "Pilih Sumber Data:", choices = c("MEV_Awal", "External_Data"), selected = "MEV_Awal"),
                  br(),
                  conditionalPanel(
                    condition = "input.mevfore == 'MEV_Awal'",
                    selectInput("akurasi_forecastx", "Akurasi", choices = c("MAPE", "RMSE"), selected = "MAPE"),
                    numericInput("jumlah_forecast", "Forecast berapa periode ke depan", value = 12, min = 1, step = 1),
                    br(),
                    actionButton("forecastX", "Forecast", class = "btn btn-success")
                  ),
                  conditionalPanel(
                    condition = "input.mevfore == 'External_Data'",
                    fileInput("forecastfile", "Upload File External", placeholder = "mevforecast.csv"),
                    radioButtons("sep3", "Pemisah Kolom",
                                 choices = c("Koma" = ",", "Titik koma" = ";", "Tab" = "\t"),
                                 inline = TRUE),
                    actionButton("submit3", "Submit", class = "btn btn-success"),
                    br(), br()
                  )
                )
              ),
              column(width = 8,
                conditionalPanel(
                  condition = "input.mevfore == 'External_Data'",
                  box(width = 12, title = "Tabel Forecast (External Data)", solidHeader = TRUE, status = "info",
                    DT::dataTableOutput("forecasttable"),
                    checkboxInput("transform3", "Transformasi", value = FALSE)
                  )
                ),
                conditionalPanel(
                  condition = "input.mevfore == 'MEV_Awal'",
                  box(width = 12, title = "Tabel MEV Historis", solidHeader = TRUE, status = "warning",
                    tabsetPanel(id = "forecast_x_mev_tabs", type = "tabs",
                      tabPanel("Hasil Forecast",
                        shinycssloaders::withSpinner(DT::dataTableOutput("tabelfrommevhis"), type = 6, color = "#007bff"),
                        br(), br(),
                        checkboxInput("transform4", "Transformasi", value = FALSE)
                      ),
                      tabPanel("Summary",
                        tags$div(style = "height:500px; overflow-y:scroll; white-space:pre-wrap;",
                          shinycssloaders::withSpinner(verbatimTextOutput("summaryforecastx"))
                        )
                      )
                    )
                  )
                )
              )
            )
          ),

          # =====================================================================
          # TAB 2: FORECAST AVERAGE Y
          # =====================================================================
          tabPanel("Forecast Average Y",
            br(),
            box(
              width = 3, solidHeader = TRUE, status = "primary",
              actionButton("runforaveragey", "RUN", class = "btn-success")
            ),
            box(
              title = "Model Final with Average Year", width = 12, status = "primary", solidHeader = TRUE,
              DT::dataTableOutput("table_averageygabmodel")
            ),
            box(
              title = "Forecast Y", width = 12, status = "primary", solidHeader = TRUE,
              DT::dataTableOutput("table_forecastaveragey")
            )
          ),

          # =====================================================================
          # TAB 3: FORECAST Y
          # =====================================================================
          tabPanel("Forecast Y",
            br(),
            fluidRow(
              box(title = "Hasil Forecast", width = 6,
                uiOutput("core_vars_ui"),
                numericInput("min_match", "Minimal jumlah core match:", value = 1, min = 1),
                selectInput("sort_by", "Urutkan berdasarkan:", choices = c("R_squared", "MAPEgabung"), selected = "R_squared"),
                checkboxInput("exact_word", "Cocokkan kata utuh (exact match)?", value = FALSE),
                actionButton("apply_filter", "Terapkan Filter", class = "btn btn-primary"),
                actionButton("reset_filter", "Reset", icon = icon("rotate-left"), class = "btn-secondary"),
                br(), br(),
                uiOutput("select_model"),
                br(), br(),
                actionButton("runforecast", "RUN", class = "btn-success"),
                br(), br(),
                DT::dataTableOutput("dataforecast"),
                br(), br()
              ),
              box(title = "Graph", solidHeader = TRUE, status = "warning", width = 6,
                plotlyOutput("plot_forecast"),
                downloadButton("downloadPlot", "Download Plot PNG")
              ),
              box(title = "Output Akhir", width = 12, status = "success",
                dataTableOutput("pemilihan_model_akhir")
              )
            ),
            fluidRow(
              box(title = "Simpan Model ke Database", width = 6, status = "primary", solidHeader = TRUE,
                textInput("model_name_input", "Nama Model (unik dan deskriptif):", value = ""),
                actionButton("save_model_db", "\U0001F4BE Simpan ke Database", class = "btn btn-warning")
              ),
              box(title = "Download ALL Output", width = 6, status = "primary", solidHeader = TRUE,
                downloadButton("download_all_outputs", "Download Output", class = "btn-success")
              ),
              box(
                title = "\U0001F4CA Model yang Sudah Disimpan", width = 12, status = "primary", solidHeader = TRUE,
                DTOutput("model_summary_table_DB")
              )
            )
          )

        ) # end tabsetPanel
      ) # end column
    ) # end fluidRow
  ) # end tabItem
}
