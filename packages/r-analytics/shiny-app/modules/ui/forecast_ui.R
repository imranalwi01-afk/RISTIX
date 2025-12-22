# =============================================================================
# FORECAST UI MODULE
# =============================================================================
# Extracted from: _analytics/_v15/reference/app15.R (lines 322-453)
# Purpose: Forecasting interface with MEV data input and Y variable prediction
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Forecast UI Module
#' @description Creates the forecasting interface with MEV data processing and Y variable prediction capabilities
#' @return Shiny tabItem for forecasting operations
forecast_ui <- function() {
  tabItem(tabName = "forecast",
          tabBox(title = "", width = 12,
                 tabPanel("Forecast X",

                          # Bungkus dalam fluidRow agar rapi di layout
                          fluidRow(
                            column(width = 4,  # Gunakan lebar 6 agar ada ruang jika ingin tambah kolom nanti

                                   box(width = 12, title = "Data MEV", solidHeader = TRUE, status = "primary",

                                       # Pilihan sumber data
                                       selectInput("mevfore", "Pilih Sumber Data:", choices = c("MEV_Awal", "External_Data"), selected = "MEV_Awal"),
                                       br(),

                                       # Jika MEV_Awal dipilih
                                       conditionalPanel(
                                         condition = "input.mevfore == 'MEV_Awal'",
                                         selectInput("akurasi_forecastx", "Akurasi", choices = c("MAPE", "RMSE"), selected = "MAPE"),
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

                                         checkboxInput("transform3","Transformasi",value = F)
                                     )
                                   ),

                                   conditionalPanel(
                                     condition = "input.mevfore == 'MEV_Awal'",

                                     box(width = 12, title = "Tabel MEV Historis", solidHeader = TRUE, status = "warning",
                                         tabBox(width = 12,
                                                tabPanel("Hasil Forecast",shinycssloaders::withSpinner(DT::dataTableOutput("tabelfrommevhis"), type = 6, color = "#007bff"),
                                                         br(),br(),
                                                         checkboxInput("transform4","Transformasi",value = F)
                                                ),
                                                tabPanel("Summary",tags$div(style = "height:500px; overflow-y:scroll; white-space:pre-wrap;",shinycssloaders::withSpinner(verbatimTextOutput("summaryforecastx"))))
                                                )
                                         )




                                     )
                                   )
                            )

                          )
                 ),
                 tabPanel("Forecast Y",
                          fluidRow(
                            box(title = "Hasil Forecast",width = 6,

                                # --- UI ---
                                uiOutput("core_vars_ui"),  # ganti textInput lama
                                numericInput("min_match", "Minimal jumlah core match:", value = 1, min = 1),
                                selectInput("sort_by", "Urutkan berdasarkan:", choices = c("R_squared", "MAPEgabung"), selected = "R_squared"),
                                checkboxInput("exact_word", "Cocokkan kata utuh (exact match)?", value = FALSE),
                                shinycssloaders::withSpinner(
                                  actionButton("apply_filter", "Terapkan Filter",
                                               type = 4, color = "#0d6efd", size = "sm")
                                ),
                                actionButton("reset_filter", "Reset", icon = icon("rotate-left"), class = "btn-secondary"),


                                br(),br(),
                                uiOutput("select_model"),
                                br(),br(),
                                actionButton("runforecast", "RUN", class = "btn-success"),

                                br(),br(),
                                DT::dataTableOutput("dataforecast"),


                                br(),br(),



                            ),


                            box(title = "Graph",solidHeader = T,status = "warning",width = 6,
                                plotlyOutput("plot_forecast"),
                                downloadButton("downloadPlot", "Download Plot PNG")),

                            box(title = "Output Akhir",width = 12,status = "success",dataTableOutput("pemilihan_model_akhir"))


                          ),
                          fluidRow(
                            box(title = "Simpan Model ke Database", width = 6, status = "primary", solidHeader = TRUE,
                                textInput("model_name_input", "Nama Model (unik dan deskriptif):", value = ""),
                                actionButton("save_model_db", "💾 Simpan ke Database", class = "btn btn-warning")
                            ),
                            box(title = "Download ALL Output", width = 6, status = "primary", solidHeader = TRUE,
                                downloadButton("download_all_outputs", "Download Output", class = "btn-success")),

                            box(
                              title = "📊 Model yang Sudah Disimpan", width = 12, status = "primary", solidHeader = TRUE,
                              DTOutput("model_summary_table_DB")
                            )



                          )

                 )
         )
}

