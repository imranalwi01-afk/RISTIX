# =============================================================================
# PD-AFL UI MODULE
# =============================================================================
# Extracted from: _analytics/_v15/reference/app15.R (lines 454-582)
# Purpose: PD and AFL (Asset Finance Loan) calculation interface with boxplot scenarios and model management
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' PD-AFL UI Module
#' @description Creates the PD and AFL calculation interface with model selection, boxplot scenarios, and comprehensive result displays
#' @return Shiny tabItem for PD-AFL calculations
pdafl_ui <- function() {
  # Ensure pd_tables_map and pd_final_map are available
  if (!exists("pd_tables_map", envir = .GlobalEnv)) {
    # Fallback to default mapping if not available
    pd_tables_map <- c(
      "odr_yearly" = "ODR Yearly",
      "odr_monthly" = "ODR Monthly",
      "provision_yearly" = "Provision Yearly",
      "provision_monthly" = "Provision Monthly"
    )
    assign("pd_tables_map", pd_tables_map, envir = .GlobalEnv)
  }

  if (!exists("pd_final_map", envir = .GlobalEnv)) {
    # Fallback to default final mapping if not available
    pd_final_map <- c(
      "final_yearly" = "Final PD Yearly",
      "final_monthly" = "Final PD Monthly"
    )
    assign("pd_final_map", pd_final_map, envir = .GlobalEnv)
  }

  # Get from global environment
  pd_tables_map <- get("pd_tables_map", envir = .GlobalEnv)
  pd_final_map <- get("pd_final_map", envir = .GlobalEnv)

  tabItem(tabName = "pdafl",
          tags$style(HTML("
            /* Fix DataTable alignment issues */
            .dataTables_wrapper {
              width: 100% !important;
            }
            .dataTables_scroll {
              width: 100% !important;
            }
            .dataTables_scrollHead,
            .dataTables_scrollBody {
              width: 100% !important;
            }
            table.dataTable {
              width: 100% !important;
              margin: 0 !important;
            }
            table.dataTable thead th,
            table.dataTable tbody td {
              text-align: center !important;
              vertical-align: middle !important;
            }
            /* Ensure box content fills width */
            .box-body {
              overflow-x: auto;
            }
          ")),
          fluidRow(
            # ==== KOLUMEN KIRI (lebar 3) ====
            column(
              width = 3,
              box(width = 12, solidHeader = TRUE, status = "primary",
                  actionButton("refresh", "refresh Data", class = "btn btn-warning"),
                  #actionButton("pilihM", "Pilih Model", class = "btn btn-warning"),
                  br(), br(),
                  selectInput("choose_model", "Pilih Model Historical:", choices = NULL),
                  br(), br(),
                  DT::dataTableOutput("intuisitable_pdafl")
              ),

              # Box Transformasi ditaruh DI BAWAH box kiri (masih di kolom kiri)
              box(width = 12, solidHeader = TRUE, status = "primary",
                  title = "Transformasi Y Sebelumnya:",
                  selectInput("backtransform", NULL, choices = c("logit", "log", "others"), selected = "logit"),
                  br(),
                  selectInput("outliermet", "Outlier Method:", choices = c("boxplot", "sd"), selected = "boxplot"),
                  uiOutput("segmentationPDAFLUI"),
                  br(),
                  actionButton("runpdafl", "RUN", class = "btn-success")
              ),

              # =============================================================================
              # P2-TASK#15: ENHANCED PD MODEL CONFIGURATION UI
              # =============================================================================
              # Purpose: Advanced PD calculation configuration controls
              # Reference: MODULAR_VERSION_TODO.md Task #15
              # Original: app15.R implied configuration controls

              # Advanced PD Configuration Box
              box(width = 12, solidHeader = TRUE, status = "info",
                  title = "⚙️ Advanced PD Configuration",
                  collapsible = TRUE, collapsed = TRUE,

                  # Long-run Average Configuration
                  h5(strong("Long-Run Average Settings")),
                  sliderInput("longrun_period",
                              "Long-Run Period (months):",
                              min = 12, max = 120, value = 60, step = 12),
                  helpText("Select the time period for calculating long-run average PD. Default: 60 months (5 years)"),

                  checkboxInput("use_longrun_average",
                                "Apply Long-Run Average Adjustment",
                                value = FALSE),
                  helpText("Enable to smooth PD estimates using long-run historical average"),
                  br(),

                  # Scaling Factor Adjustment
                  h5(strong("Scaling Factor Controls")),
                  numericInput("pd_scaling_factor",
                               "PD Scaling Factor:",
                               value = 1.0, min = 0.1, max = 5.0, step = 0.1),
                  helpText("Multiplier for PD adjustments (1.0 = no scaling, >1.0 = more conservative, <1.0 = less conservative)"),

                  sliderInput("confidence_level",
                              "Confidence Level (%):",
                              min = 80, max = 99, value = 95, step = 1),
                  helpText("Statistical confidence level for PD estimates"),
                  br(),

                  # Boxplot Weight Adjustment
                  h5(strong("Boxplot Scenario Weights")),
                  helpText("Adjust the weighting for Base/Best/Worst scenarios (must sum to 1.0)"),

                  fluidRow(
                    column(4,
                           numericInput("weight_base", "Base:",
                                        value = 0.6, min = 0, max = 1, step = 0.05)
                    ),
                    column(4,
                           numericInput("weight_best", "Best:",
                                        value = 0.2, min = 0, max = 1, step = 0.05)
                    ),
                    column(4,
                           numericInput("weight_worst", "Worst:",
                                        value = 0.2, min = 0, max = 1, step = 0.05)
                    )
                  ),

                  # Weight validation display
                  uiOutput("weight_validation_ui"),
                  br(),

                  # Model Assumptions
                  h5(strong("Model Assumptions")),
                  checkboxInput("include_macroeconomic",
                                "Include Macroeconomic Adjustments",
                                value = TRUE),

                  checkboxInput("apply_flooring",
                                "Apply PD Floor (Regulatory Minimum)",
                                value = TRUE),

                  conditionalPanel(
                    condition = "input.apply_flooring == true",
                    numericInput("pd_floor_value",
                                 "PD Floor Value (%):",
                                 value = 0.03, min = 0.01, max = 1.0, step = 0.01),
                    helpText("Minimum PD value for regulatory compliance (default: 0.03% = 3 basis points)")
                  ),
                  br(),

                  # Reset to Defaults
                  actionButton("reset_pd_config",
                               "Reset to Defaults",
                               class = "btn-warning btn-sm",
                               icon = icon("refresh"))
              )
            ),

            # ==== KOLUMEN KANAN (lebar 9) ====
            column(
              width = 9,
              box(width = 12, title = "Historical Model", solidHeader = TRUE, status = "primary",
                  DTOutput("model_summary_table_DB2")
              ),

              # ==== RESULTS MOVED HERE ====
              box(
                width = 12, solidHeader = FALSE,
                tabBox(
                  width = 12, side = "left", id = "tabset1",

                tabPanel("MEV Boxplot",
                         box(title = "Tabel Klasifikasi",
                             DT::dataTableOutput("df_klasifikasi_table")
                         ),
                         box(title = "Tabel Frekuensi Kategori",
                             DT::dataTableOutput("category_frecuency_table")
                         ),
                         box(title="Boxplot Categorization Percentage",
                             DT::dataTableOutput("category_percentage_table")),
                         box(title="Weighted Boxplot",
                             DT::dataTableOutput("weighted_boxplot_table0")),
                         box(title = "Average MEV by Boxplot Categorization",
                             DT::dataTableOutput("avg_table_table")),
                         box(title = "Average Difference Base ",
                             DT::dataTableOutput("diff_base_table"))
                         #downloadButton("download_xlsx_pdafl", "Download Excel")
                ),

                tabPanel("Forecast Boxplot",
                         box(title="Base",DT::dataTableOutput("fo_boxplotbase_table")),
                         box(title="Best",DT::dataTableOutput("fo_boxplotbest_table")),
                         box(title="Worst",DT::dataTableOutput("fo_boxplotworst_table")),
                         box(title="YJoin",DT::dataTableOutput("fo_boxplotyjoin_table")),
                         box(title="Diff",DT::dataTableOutput("fo_boxplotdiff_table"))



                ),

                tabPanel("PD–AFL",
                         tabBox(
                           width = 12,
                           tabPanel("Base",
                                    lapply(names(pd_tables_map), function(tbl_key) {
                                      tagList(
                                        h4(pd_tables_map[[tbl_key]]),
                                        DTOutput(paste0("pd_base_", tbl_key)), br()
                                      )
                                    })
                           ),
                           tabPanel("Best",
                                    lapply(names(pd_tables_map), function(tbl_key) {
                                      tagList(
                                        h4(pd_tables_map[[tbl_key]]),
                                        DTOutput(paste0("pd_best_", tbl_key)), br()
                                      )
                                    })
                           ),
                           tabPanel("Worst",
                                    lapply(names(pd_tables_map), function(tbl_key) {
                                      tagList(
                                        h4(pd_tables_map[[tbl_key]]),
                                        DTOutput(paste0("pd_worst_", tbl_key)), br()
                                      )
                                    })
                           ),
                           tabPanel("Final",
                                    fluidRow(
                                      box(width=4,
                                          DT::dataTableOutput("weighted_boxplot_table"),
                                          actionButton("runpdafl_final", "RUN", class = "btn-success")

                                      ),


                                      box(width=8,
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

          # =============================================================================
          # ACTION BUTTONS BAR - IMPROVED LAYOUT AND PLACEMENT
          # =============================================================================
          fluidRow(
            column(12,
              div(style = "background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #dee2e6;",
                div(style = "text-align: center; margin-bottom: 10px;",
                  h5(strong("📊 PD & AFL Actions"), style = "color: #495057; margin: 0;")
                ),
                div(style = "display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;",
                  # Download Button with improved styling
                  div(style = "flex: 0 0 auto;",
                    tags$button(id = "download_all_xlsx",
                               type = "button",
                               class = "btn btn-success btn-lg",
                               style = "min-width: 180px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);",
                               icon("file-download"),
                               " Download All Results",
                               onclick = "setTimeout(function() { Shiny.setInputValue('download_clicked', Math.random()); }, 100);")
                  ),

                  # Save PD Button with improved styling
                  div(style = "flex: 0 0 auto;",
                    actionButton("save_pd",
                                "💾 Save PD to Database",
                                class = "btn-primary btn-lg",
                                style = "min-width: 180px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);",
                                icon = icon("database"))
                  ),

                  # Additional utility buttons
                  div(style = "flex: 0 0 auto;",
                    actionButton("refresh_pdafl",
                                "🔄 Refresh Data",
                                class = "btn-outline-info btn",
                                style = "min-width: 120px;",
                                icon = icon("refresh"))
                  ),

                  div(style = "flex: 0 0 auto;",
                    actionButton("clear_pdafl_cache",
                                "🗑️ Clear Cache",
                                class = "btn-outline-warning btn",
                                style = "min-width: 120px;",
                                icon = icon("trash"))
                  )
                )
              )
            )
          )
        )
    )
}

#' PD-AFL UI Content for Header Navigation
#' @description Extracts content from pdafl_ui for use with navbarPage
#' @return Content elements without tabItem wrapper
pdafl_ui_content <- function() {
  div(
    tags$style(HTML("
      /* Fix DataTable alignment issues */
      .dataTables_wrapper {
        width: 100% !important;
      }
      .dataTables_scroll {
        width: 100% !important;
      }
      .dataTables_scrollHead,
      .dataTables_scrollBody {
        width: 100% !important;
      }
      table.dataTable {
        width: 100% !important;
        margin: 0 !important;
      }
      table.dataTable thead th,
      table.dataTable tbody td {
        text-align: center !important;
        vertical-align: middle !important;
      }
      /* Ensure box content fills width */
      .box-body {
        overflow-x: auto;
      }
    ")),
    fluidRow(
      # ==== KOLUMEN KIRI (lebar 3) ====
      column(
        width = 3,
        box(width = 12, solidHeader = TRUE, status = "primary",
            actionButton("refresh", "refresh Data", class = "btn btn-warning"),
            #actionButton("pilihM", "Pilih Model", class = "btn btn-warning"),
            br(), br(),
            selectInput("choose_model", "Pilih Model Historical:", choices = NULL),
            br(), br(),
            DT::dataTableOutput("intuisitable_pdafl")
        ),

        # Box Transformasi ditaruh DI BAWAH box kiri (masih di kolom kiri)
        box(width = 12, solidHeader = TRUE, status = "primary",
            title = "Transformasi Y Sebelumnya:",
            selectInput("backtransform", NULL, choices = c("logit", "log", "others"), selected = "logit"),
            br(),
            selectInput("outliermet", "Outlier Method:", choices = c("boxplot", "sd"), selected = "boxplot"),
            uiOutput("segmentationPDAFLUI"),
            br(),
            actionButton("runpdafl", "RUN", class = "btn-success")
        ),

        # P2-TASK#15: Enhanced PD Configuration (same as dashboard version)
        box(width = 12, solidHeader = TRUE, status = "info",
            title = "⚙️ Advanced PD Configuration",
            collapsible = TRUE, collapsed = TRUE,

            h5(strong("Long-Run Average Settings")),
            sliderInput("longrun_period",
                        "Long-Run Period (months):",
                        min = 12, max = 120, value = 60, step = 12),
            helpText("Select the time period for calculating long-run average PD. Default: 60 months (5 years)"),

            checkboxInput("use_longrun_average",
                          "Apply Long-Run Average Adjustment",
                          value = FALSE),
            helpText("Enable to smooth PD estimates using long-run historical average"),
            br(),

            h5(strong("Scaling Factor Controls")),
            numericInput("pd_scaling_factor",
                         "PD Scaling Factor:",
                         value = 1.0, min = 0.1, max = 5.0, step = 0.1),
            helpText("Multiplier for PD adjustments (1.0 = no scaling, >1.0 = more conservative, <1.0 = less conservative)"),

            sliderInput("confidence_level",
                        "Confidence Level (%):",
                        min = 80, max = 99, value = 95, step = 1),
            helpText("Statistical confidence level for PD estimates"),
            br(),

            h5(strong("Boxplot Scenario Weights")),
            helpText("Adjust the weighting for Base/Best/Worst scenarios (must sum to 1.0)"),

            fluidRow(
              column(4,
                     numericInput("weight_base", "Base:",
                                  value = 0.6, min = 0, max = 1, step = 0.05)
              ),
              column(4,
                     numericInput("weight_best", "Best:",
                                  value = 0.2, min = 0, max = 1, step = 0.05)
              ),
              column(4,
                     numericInput("weight_worst", "Worst:",
                                  value = 0.2, min = 0, max = 1, step = 0.05)
              )
            ),

            uiOutput("weight_validation_ui"),
            br(),

            h5(strong("Model Assumptions")),
            checkboxInput("include_macroeconomic",
                          "Include Macroeconomic Adjustments",
                          value = TRUE),

            checkboxInput("apply_flooring",
                          "Apply PD Floor (Regulatory Minimum)",
                          value = TRUE),

            conditionalPanel(
              condition = "input.apply_flooring == true",
              numericInput("pd_floor_value",
                           "PD Floor Value (%):",
                           value = 0.03, min = 0.01, max = 1.0, step = 0.01),
              helpText("Minimum PD value for regulatory compliance (default: 0.03% = 3 basis points)")
            ),
            br(),

            actionButton("reset_pd_config",
                         "Reset to Defaults",
                         class = "btn-warning btn-sm",
                         icon = icon("refresh"))
        )
      ),

      # ==== KOLUMEN KANAN (lebar 9) ====
      column(
        width = 9,
        box(width = 12, title = "Historical Model", solidHeader = TRUE, status = "primary",
            DTOutput("model_summary_table_DB2")
        ),

        # ==== RESULTS MOVED HERE ====
        tabsetPanel(
          type = "tabs",
          id = "pdafl_tabs",

        tabPanel("MEV Boxplot",
                 box(title = "Tabel Klasifikasi",
                     DT::dataTableOutput("df_klasifikasi_table")
                 ),
                 box(title = "Tabel Frekuensi Kategori",
                     DT::dataTableOutput("category_frecuency_table")
                 ),
                 box(title="Boxplot Categorization Percentage",
                     DT::dataTableOutput("category_percentage_table")),
                 box(title="Weighted Boxplot",
                     DT::dataTableOutput("weighted_boxplot_table0")),
                 box(title = "Average MEV by Boxplot Categorization",
                     DT::dataTableOutput("avg_table_table")),
                 box(title = "Average Difference Base ",
                     DT::dataTableOutput("diff_base_table"))
        ),

        tabPanel("Forecast Boxplot",
                 box(title="Base",DT::dataTableOutput("fo_boxplotbase_table")),
                 box(title="Best",DT::dataTableOutput("fo_boxplotbest_table")),
                 box(title="Worst",DT::dataTableOutput("fo_boxplotworst_table")),
                 box(title="YJoin",DT::dataTableOutput("fo_boxplotyjoin_table")),
                 box(title="Diff",DT::dataTableOutput("fo_boxplotdiff_table"))
        ),

        tabPanel("PD–AFL",
                 tabsetPanel(
                   type = "tabs",
                   tabPanel("Base",
                            lapply(names(pd_tables_map), function(tbl_key) {
                              tagList(
                                h4(pd_tables_map[[tbl_key]]),
                                DTOutput(paste0("pd_base_", tbl_key)), br()
                              )
                            })
                   ),
                   tabPanel("Best",
                            lapply(names(pd_tables_map), function(tbl_key) {
                              tagList(
                                h4(pd_tables_map[[tbl_key]]),
                                DTOutput(paste0("pd_best_", tbl_key)), br()
                              )
                            })
                   ),
                   tabPanel("Worst",
                            lapply(names(pd_tables_map), function(tbl_key) {
                              tagList(
                                h4(pd_tables_map[[tbl_key]]),
                                DTOutput(paste0("pd_worst_", tbl_key)), br()
                              )
                            })
                   ),
                   tabPanel("Final",
                            fluidRow(
                              box(width=4,
                                  DT::dataTableOutput("weighted_boxplot_table"),
                                  actionButton("runpdafl_final", "RUN", class = "btn-success")
                              ),

                              box(width=8,
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
      ),

      # =============================================================================
      # ACTION BUTTONS BAR - IMPROVED LAYOUT AND PLACEMENT
      # =============================================================================
      fluidRow(
        column(12,
          div(style = "background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #dee2e6;",
            div(style = "text-align: center; margin-bottom: 10px;",
              h5(strong("📊 PD & AFL Actions"), style = "color: #495057; margin: 0;")
            ),
            div(style = "display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;",
              # Download Button with improved styling
              div(style = "flex: 0 0 auto;",
                tags$button(id = "download_all_xlsx",
                           type = "button",
                           class = "btn btn-success btn-lg",
                           style = "min-width: 180px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);",
                           icon("file-download"),
                           " Download All Results",
                           onclick = "setTimeout(function() { Shiny.setInputValue('download_clicked', Math.random()); }, 100);")
              ),

              # Save PD Button with improved styling
              div(style = "flex: 0 0 auto;",
                actionButton("save_pd",
                            "💾 Save PD to Database",
                            class = "btn-primary btn-lg",
                            style = "min-width: 180px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);",
                            icon = icon("database"))
              ),

              # Additional utility buttons
              div(style = "flex: 0 0 auto;",
                actionButton("refresh_pdafl",
                            "🔄 Refresh Data",
                            class = "btn-outline-info btn",
                            style = "min-width: 120px;",
                            icon = icon("refresh"))
              ),

              div(style = "flex: 0 0 auto;",
                actionButton("clear_pdafl_cache",
                            "🗑️ Clear Cache",
                            class = "btn-outline-warning btn",
                            style = "min-width: 120px;",
                            icon = icon("trash"))
              )
            )
          )
        )
      )
    )
  )
}

# =============================================================================
# END OF PD-AFL UI MODULE
# =============================================================================