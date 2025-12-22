# =============================================================================
# MODEL UI MODULE
# =============================================================================
# Extracted from: _analytics/_v15/reference/app15.R (lines 257-321)
# Purpose: Statistical modeling interface with parameter configuration and output displays
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Model UI Module
#' @description Creates the statistical modeling interface with input parameters, variable selection, and comprehensive output displays
#' @return Shiny tabItem for statistical modeling
model_ui <- function() {
  tabItem(tabName = "model",
          tabBox(id = "model_tabbox", title = "", width = 12,
                 tabPanel("Input",
                          fluidRow(
                            box(title = "Parameter", status = "primary", width = 6, solidHeader = TRUE,
                                numericInput("pval", "P-value", value = 0.05),
                                numericInput("rsq", "R-Square Single Factor", value = 0.0),
                                numericInput("corr", "Correlation", value = 0.6),
                                radioButtons("normal", "Normality test", choices = c("shapiro","kolmogorov","anderson")),
                                numericInput("alpha", "alpha assumption", value = 0.05),
                                dateInput("train_start", "Tanggal Awal Insample",
                value = NULL),
                                dateInput("train_split", "Tanggal Akhir Insample",
                                value = NULL),
                                dateInput("test_end", "Tanggal Akhir Outsample",
                                value = NULL)
                            ),


                            box(title = "Intuition", status = "primary", width = 6, solidHeader = TRUE,
                                DT::dataTableOutput("intuisi_table")
                            )
                          ),
                          fluidRow(
                            box(title = "Pilih Variabel", width = 12, status = "info", solidHeader = TRUE,
                                shinycssloaders::withSpinner(uiOutput("select_y"), type = 4, color = "#3c8dbc"),
                                shinycssloaders::withSpinner(uiOutput("select_x"), type = 4, color = "#3c8dbc"),
                                actionButton("select_all_x", "Pilih Semua"),
                                actionButton("reset_x", "Reset Pilihan"),
                                br(), br(),
                                actionButton("runmodel", "RUN", class = "btn-success"),
                                br(), br(),
                                div(id = "loading-message", style = "display: none; color: #3c8dbc;",
                                    tags$i(class = "fa fa-spinner fa-spin"), " Processing models, please wait...")

                            )
                          )
                 ),
                 tabPanel("Output",



                          box(title = "Correlation Coefficient Sign Intuition", width = 12, status = "primary", solidHeader = TRUE,
                              shinycssloaders::withSpinner(DT::dataTableOutput("table_sign1"), type = 4, color = "#3c8dbc")),
                          #downloadButton("dl_corr", "Download")),
                          box(title = "Single Factor", width = 12, status = "primary", solidHeader = TRUE,
                              shinycssloaders::withSpinner(DT::dataTableOutput("table_reg1"), type = 4, color = "#3c8dbc")),
                          #downloadButton("dl_single", "Download")),
                          box(title = "Correlation 2 & 3 Variable", width = 12, status = "primary", solidHeader = TRUE,
                              tabBox(width = 12,
                                     tabPanel("Tabel korelasi 2 variabel", shinycssloaders::withSpinner(DT::dataTableOutput("table_korel2"), type = 4, color = "#3c8dbc")),
                                     tabPanel("Tabel korelasi 3 variabel", shinycssloaders::withSpinner(DT::dataTableOutput("table_korel3"), type = 4, color = "#3c8dbc"))

                              )),
                          box(title = "Multiple Linear Regression", width = 12, status = "primary", solidHeader = TRUE,
                              tabBox(width = 12,
                                     tabPanel("Tabel regresi 2 variabel", shinycssloaders::withSpinner(DT::dataTableOutput("table_reg2"), type = 4, color = "#3c8dbc")),
                                     tabPanel("Tabel regresi 3 variabel", shinycssloaders::withSpinner(DT::dataTableOutput("table_reg3"), type = 4, color = "#3c8dbc")),
                                     tabPanel("Model Gabungan", shinycssloaders::withSpinner(DT::dataTableOutput("table_reg23"), type = 4, color = "#3c8dbc"))

                              )),
                          box(title = "Final Model (Pass)", width = 12, status = "primary", solidHeader = TRUE,
                              tabBox(width = 12,
                                     tabPanel("Uji Asumsi", shinycssloaders::withSpinner(DT::dataTableOutput("table_asumsi"), type = 4, color = "#3c8dbc")),
                                     tabPanel("Back Testing", shinycssloaders::withSpinner(DT::dataTableOutput("table_backtest"), type = 4, color = "#3c8dbc")),
                                     tabPanel("Final Model", shinycssloaders::withSpinner(DT::dataTableOutput("table_finalmodel"), type = 4, color = "#3c8dbc")))),
                          br(), br(),
                          box(title = "Download Model Output", width = 4, status = "primary", solidHeader = TRUE,
                              downloadButton("download_model", "Download Output Model", class = "btn-success"))
                 )
          ))
}

#' Model UI Content for Header Navigation
#' @description Extracts content from model_ui for use with navbarPage
#' @return Content elements without tabItem wrapper
model_ui_content <- function() {
  tabsetPanel(
    type = "tabs",
    id = "model_tabbox",

    tabPanel("Input",
             # First Row: Parameter and Intuition panels - responsive layout
             fluidRow(
               # Parameter panel - takes half width on large screens, full on small
               column(width = 3,
                 div(class = "box box-primary box-solid",
                     div(class = "box-header with-border",
                         h3(class = "box-title", "Parameter")
                     ),
                     div(class = "box-body",
                         numericInput("pval", "P-value", value = 0.05, width = "100%"),
                         numericInput("rsq", "R-Square Single Factor", value = 0.0, width = "100%"),
                         numericInput("corr", "Correlation", value = 0.6, width = "100%"),
                         radioButtons("normal", "Normality test",
                                     choices = c("shapiro","kolmogorov","anderson"),
                                     inline = FALSE, width = "100%"),
                         numericInput("alpha", "alpha assumption", value = 0.05, width = "100%"),
                         br(),
                         div(style = "border-top: 1px solid #f4f4f4; padding-top: 10px; margin-top: 10px;",
                             h6("Date Range Settings", style = "color: #3c8dbc; font-weight: bold;"),
                             dateInput("train_start", "Tanggal Awal Insample",
                                      value = NULL, width = "100%"),
                             dateInput("train_split", "Tanggal Akhir Insample",
                                      value = NULL, width = "100%"),
                             dateInput("test_end", "Tanggal Akhir Outsample",
                                      value = NULL, width = "100%")
                         )
                     )
                 )
               ),

               # Intuition panel - takes half width on large screens, full on small
               column(width = 9,
                 div(class = "box box-primary box-solid",
                     div(class = "box-header with-border",
                         h3(class = "box-title", "Intuition")
                     ),
                     div(class = "box-body", style = "padding: 10px;",
                         DT::dataTableOutput("intuisi_table", width = "100%")
                     )
                 )
               )
             ),

             # Second Row: Variable selection and controls
             fluidRow(
               # Full width panel for variable selection
               div(class = "col-sm-12",
                 div(class = "box box-info box-solid",
                     div(class = "box-header with-border",
                         h3(class = "box-title", "Pilih Variabel")
                     ),
                     div(class = "box-body",
                         # Variable selection controls with better spacing
                         div(class = "row",
                             div(class = "col-md-12",
                                 shinycssloaders::withSpinner(
                                     uiOutput("select_y"),
                                     type = 4,
                                     color = "#3c8dbc"
                                 )
                             ),
                             div(class = "col-md-12",
                                 shinycssloaders::withSpinner(
                                     uiOutput("select_x"),
                                     type = 4,
                                     color = "#3c8dbc"
                                 )
                             )
                         ),

                         # Action buttons with better styling
                         div(class = "row", style = "margin-top: 15px; margin-bottom: 15px;",
                             div(class = "col-md-12",
                                 div(class = "btn-group", role = "group", style = "width: 100%;",
                                     actionButton("select_all_x", "Select All",
                                                 class = "btn btn-primary btn-sm",
                                                 style = "margin-right: 5px; width: 48%;"),
                                     actionButton("reset_x", "Reset Selection",
                                                 class = "btn btn-default btn-sm",
                                                 style = "width: 48%;")
                                 )
                             ),
                             div(class = "col-md-12",
                                 div(style = "text-align: right; margin-top: 5px;",
                                     actionButton("runmodel", "RUN MODEL",
                                                 class = "btn-success btn-lg",
                                                 icon = icon("play"),
                                                 style = "padding: 8px 20px;")
                                 )
                             )
                         ),

                         # Loading message
                         div(id = "loading-message",
                             style = "display: none; color: #3c8dbc; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin-top: 10px;",
                             tags$i(class = "fa fa-spinner fa-spin", style = "font-size: 16px; margin-right: 10px;"),
                             strong("Processing models, please wait..."),
                             br(),
                             small("This may take several moments depending on your data size.")
                         )
                     )
                 )
               )
             )
    ),

    tabPanel("Output",
             # Output panels with better responsive layout
             fluidRow(
               div(class = "col-sm-12",
                 div(class = "box box-primary box-solid",
                     div(class = "box-header with-border",
                         h3(class = "box-title", "Correlation Coefficient Sign Intuition")
                     ),
                     div(class = "box-body", style = "overflow-x: auto;",
                         shinycssloaders::withSpinner(
                             DT::dataTableOutput("table_sign1", width = "100%"),
                             type = 4,
                             color = "#3c8dbc"
                         )
                     )
                 )
               )
             ),

             fluidRow(
               div(class = "col-sm-12",
                 div(class = "box box-primary box-solid",
                     div(class = "box-header with-border",
                         h3(class = "box-title", "Single Factor Analysis")
                     ),
                     div(class = "box-body", style = "overflow-x: auto;",
                         shinycssloaders::withSpinner(
                             DT::dataTableOutput("table_reg1", width = "100%"),
                             type = 4,
                             color = "#3c8dbc"
                         )
                     )
                 )
               )
             ),

             fluidRow(
               div(class = "col-sm-12",
                 div(class = "box box-primary box-solid",
                     div(class = "box-header with-border",
                         h3(class = "box-title", "Correlation Analysis")
                     ),
                     div(class = "box-body",
                         tabsetPanel(type = "tabs",
                                     tabPanel("2 Variable Correlation",
                                              shinycssloaders::withSpinner(
                                                  DT::dataTableOutput("table_korel2", width = "100%"),
                                                  type = 4,
                                                  color = "#3c8dbc"
                                              )),
                                     tabPanel("3 Variable Correlation",
                                              shinycssloaders::withSpinner(
                                                  DT::dataTableOutput("table_korel3", width = "100%"),
                                                  type = 4,
                                                  color = "#3c8dbc"
                                              ))
                         )
                     )
                 )
               )
             ),

             fluidRow(
               div(class = "col-sm-12",
                 div(class = "box box-primary box-solid",
                     div(class = "box-header with-border",
                         h3(class = "box-title", "Multiple Linear Regression")
                     ),
                     div(class = "box-body",
                         tabsetPanel(type = "tabs",
                                     tabPanel("2 Variable Regression",
                                              shinycssloaders::withSpinner(
                                                  DT::dataTableOutput("table_reg2", width = "100%"),
                                                  type = 4,
                                                  color = "#3c8dbc"
                                              )),
                                     tabPanel("3 Variable Regression",
                                              shinycssloaders::withSpinner(
                                                  DT::dataTableOutput("table_reg3", width = "100%"),
                                                  type = 4,
                                                  color = "#3c8dbc"
                                              )),
                                     tabPanel("Combined Model",
                                              shinycssloaders::withSpinner(
                                                  DT::dataTableOutput("table_reg23", width = "100%"),
                                                  type = 4,
                                                  color = "#3c8dbc"
                                              ))
                         )
                     )
                 )
               )
             ),

             fluidRow(
               div(class = "col-sm-12",
                 div(class = "box box-primary box-solid",
                     div(class = "box-header with-border",
                         h3(class = "box-title", "Final Model Results")
                     ),
                     div(class = "box-body",
                         tabsetPanel(type = "tabs",
                                     tabPanel("Assumption Testing",
                                              shinycssloaders::withSpinner(
                                                  DT::dataTableOutput("table_asumsi", width = "100%"),
                                                  type = 4,
                                                  color = "#3c8dbc"
                                              )),
                                     tabPanel("Back Testing",
                                              shinycssloaders::withSpinner(
                                                  DT::dataTableOutput("table_backtest", width = "100%"),
                                                  type = 4,
                                                  color = "#3c8dbc"
                                              )),
                                     tabPanel("Final Model Summary",
                                              shinycssloaders::withSpinner(
                                                  DT::dataTableOutput("table_finalmodel", width = "100%"),
                                                  type = 4,
                                                  color = "#3c8dbc"
                                              ))
                         )
                     )
                 )
               )
             ),

             # Download section
             fluidRow(
               div(class = "col-sm-12 col-md-4 col-md-offset-8",
                 div(class = "box box-success box-solid",
                     div(class = "box-header with-border",
                         h3(class = "box-title", "Download Results")
                     ),
                     div(class = "box-body", style = "text-align: center;",
                         downloadButton("download_model", "Download Model Output",
                                       class = "btn-success btn-block",
                                       icon = icon("download"))
                     )
                 )
               )
             )
    )
  )
}

# =============================================================================
# END OF MODEL UI MODULE
# =============================================================================