# =============================================================================
# DATA UI MODULE
# =============================================================================
# Extracted from: _analytics/_v15/reference/app15.R (lines 152-256)
# Purpose: Data input, management, and preview interfaces
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Data UI Module
#' @description Creates the data input interface with file upload, data preview, and transformation controls
#' @return Shiny tabItem for data management
data_ui <- function() {
  tabItem(tabName = "input",
          tabBox(title = "", width = 12,
                 tabPanel("Dependent Variable",
                          fluidRow(
                            box(width = 4, title = "Input Data", solidHeader = TRUE, status = "primary",
                                selectInput("dependent", "Choose Dependent:", choices = c("PD", "lgd", "OTHERS")),

                                conditionalPanel(
                                  condition = "input.dependent != 'OTHERS'",
                                  uiOutput("segmentationUI")
                                ),

                                conditionalPanel(
                                  condition = "input.dependent == 'OTHERS'",
                                  tagList(
                                    fileInput("file_upload_other1", "Upload CSV File",
                                              accept = c(".csv", ".xlsx", ".xls")),
                                    radioButtons("csv_sep1", "Separator:",
                                                 choices = c("Comma" = ",", "Semicolon" = ";", "Tab" = "\t"),
                                                 inline = TRUE,selected = "comma")
                                  )
                                ),

                                actionButton("submit", "Submit", class = "btn-success")
                            ),

                            box(width = 8, title = "Data Preview", solidHeader = TRUE, status = "info",
                                DTOutput("dependent_data")
                            )

                          ),fluidRow(
                            box(width=4,
                                checkboxGroupInput(
                                  inputId = "transformasi",
                                  label = "Pilih Metode Transformasi:",
                                  choices = c("logit", "average", "log"),
                                  selected = "logit"  # Default logit as checked
                                )
                            ),
                            box(width=8,title = "Data Preview", solidHeader = TRUE, status = "info",
                                DTOutput("tabel_data_dependent_tr")
                            )
                          )),

                 tabPanel('Independent Variables',
                          fluidRow(
                            box(width = 4, title = "Input Data", solidHeader = TRUE, status = "primary",
                                fileInput("file_upload_other2", "Upload CSV File",
                                          accept = c(".csv", ".xlsx", ".xls")),
                                radioButtons("csv_sep2", "Separator:",
                                             choices = c("Comma" = ",", "Semicolon" = ";", "Tab" = "\t"),
                                             inline = TRUE),
                                checkboxInput("transform","Transformasi",value = F),
                                br(),
                                actionButton("submit2", "Submit", class = "btn-success")
                            ),

                            column(
                              width = 8,
                              fluidRow(
                                box(width = 12, title = "Data Preview", solidHeader = TRUE, status = "info",
                                    DTOutput("independent_data")
                                )
                              )
                              #fluidRow(
                              # box(width = 12, title = "Preview transform", solidHeader = TRUE, status = "info",
                              #      DT::dataTableOutput("tryn")
                              # )
                              #)
                            ),

                            box(width = 12, title = "Riwayat Upload & Unduh Kembali", solidHeader = TRUE, status = "primary",
                                fluidRow(
                                  column(6,
                                         selectInput("download_upload_id", "Pilih File Upload Sebelumnya:", choices = NULL),
                                         downloadButton("download_upload_csv", "Download CSV"),
                                         actionButton("delete_upload", "🗑️ Hapus File Upload", class = "btn-danger")

                                  ),
                                  column(6,
                                         DTOutput("upload_history_table")

                                  )
                                )
                            )
                          )


                 ),
                 tabPanel("Data Full",
                          fluidRow(
                            box(width=3,title="Join Data", solidHeader = TRUE,status = "primary",
                                actionButton("join","Join",class="btn-success")
                            ),
                            box(width = 9, title = "Data Preview",solidHeader = TRUE, status = "info",
                                DTOutput("tabel_hasil_join"))
                          )

                 )

          )



  )
}

#' Data UI Content for Header Navigation
#' @description Extracts content from data_ui for use with navbarPage
#' @return Content elements without tabItem wrapper
data_ui_content <- function() {
  tabsetPanel(
    type = "tabs",
    id = "data_tabs",

    tabPanel("Dependent Variable",
             fluidRow(
               box(width = 4, title = "Input Data", solidHeader = TRUE, status = "primary",
                   selectInput("dependent", "Choose Dependent:", choices = c("PD", "lgd", "OTHERS")),

                   conditionalPanel(
                     condition = "input.dependent != 'OTHERS'",
                     uiOutput("segmentationUI")
                   ),

                   conditionalPanel(
                     condition = "input.dependent == 'OTHERS'",
                     tagList(
                       fileInput("file_upload_other1", "Upload CSV File",
                                 accept = c(".csv", ".xlsx", ".xls")),
                       radioButtons("csv_sep1", "Separator:",
                                    choices = c("Comma" = ",", "Semicolon" = ";", "Tab" = "\t"),
                                    inline = TRUE,selected = "comma")
                     )
                   ),

                   actionButton("submit", "Submit", class = "btn-success")
               ),

               box(width = 8, title = "Data Preview", solidHeader = TRUE, status = "info",
                   DTOutput("dependent_data")
               )

             ),fluidRow(
               box(width=4,
                   checkboxGroupInput(
                     inputId = "transformasi",
                     label = "Pilih Metode Transformasi:",
                     choices = c("logit", "average", "log"),
                     selected = "logit"  # Default logit as checked
                   )
               ),
               box(width=8,title = "Data Preview", solidHeader = TRUE, status = "info",
                   DTOutput("tabel_data_dependent_tr")
               )
             )),

    tabPanel('Independent Variables',
             fluidRow(
               box(width = 4, title = "Input Data", solidHeader = TRUE, status = "primary",
                   fileInput("file_upload_other2", "Upload CSV File",
                             accept = c(".csv", ".xlsx", ".xls")),
                   radioButtons("csv_sep2", "Separator:",
                                choices = c("Comma" = ",", "Semicolon" = ";", "Tab" = "\t"),
                                inline = TRUE),
                   checkboxInput("transform","Transformasi",value = F),
                   br(),
                   actionButton("submit2", "Submit", class = "btn-success")
               ),

               column(
                 width = 8,
                 fluidRow(
                   box(width = 12, title = "Data Preview", solidHeader = TRUE, status = "info",
                       DTOutput("independent_data")
                   )
                 )
                 #fluidRow(
                 # box(width = 12, title = "Preview transform", solidHeader = TRUE, status = "info",
                 #      DT::dataTableOutput("tryn")
                 # )
                 #)
               ),

               box(width = 12, title = "Riwayat Upload & Unduh Kembali", solidHeader = TRUE, status = "primary",
                   fluidRow(
                     column(6,
                            selectInput("download_upload_id", "Pilih File Upload Sebelumnya:", choices = NULL),
                            downloadButton("download_upload_csv", "Download CSV"),
                            actionButton("delete_upload", "🗑️ Hapus File Upload", class = "btn-danger")

                     ),
                     column(6,
                            DTOutput("upload_history_table")

                     )
                   )
               )
             )


    ),

    tabPanel("Data Full",
             fluidRow(
               box(width=3,title="Join Data", solidHeader = TRUE,status = "primary",
                   actionButton("join","Join",class="btn-success")
               ),
               box(width = 9, title = "Data Preview",solidHeader = TRUE, status = "info",
                   DTOutput("tabel_hasil_join"))
             )
    )
  )
}

# =============================================================================
# END OF DATA UI MODULE
# =============================================================================