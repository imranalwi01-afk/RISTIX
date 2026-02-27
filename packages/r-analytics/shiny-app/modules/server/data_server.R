# =============================================================================
# DATA SERVER MODULE
# =============================================================================
# Extracted from: _analytics/_v15/reference/app15.R (server function lines 587-780)
# Purpose: Server logic for data input, upload, validation, and transformation
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Data Server Module
#' @description Handles data input, file uploads, validation, and transformation for both dependent and independent variables
#' @param input Shiny input object
#' @param output Shiny output object
#' @param session Shiny session object
#' @param con Database connection object
#' @param PD PD configuration data
#' @param LGD LGD configuration data
#' @return None (handles reactive logic)
data_server <- function(input, output, session, con, PD, LGD, persistent_data) {

  # =============================================================================
  # DIAGNOSTIC LOGGING
  # =============================================================================
  cat("📊 DEBUG [DATA_SERVER_START]: PD rows:", nrow(PD), "| LGD rows:", nrow(LGD), "\n")
  flush.console()
  if (nrow(PD) > 0) cat("  - Sample PD models:", paste(head(PD$pd_model_name, 3), collapse=", "), "...\n")
  if (nrow(LGD) > 0) cat("  - Sample LGD models:", paste(head(LGD$lgd_model_name, 3), collapse=", "), "...\n")
  flush.console()

  # =============================================================================
  # UTILITY FUNCTIONS
  # =============================================================================
  # Utility functions are already sourced in app.R - no duplication needed

  resolve_col <- function(df, candidates) {
    if (!is.data.frame(df) || ncol(df) == 0) return(NULL)
    col_names <- names(df)
    lower_names <- tolower(col_names)
    for (candidate in candidates) {
      idx <- match(tolower(candidate), lower_names)
      if (!is.na(idx)) return(col_names[[idx]])
    }
    NULL
  }

  normalize_column_names <- function(df) {
    if (!is.data.frame(df) || ncol(df) == 0) return(df)
    names(df) <- tolower(names(df))
    df
  }

  build_segment_choices <- function(df, id_candidates, name_candidates, fallback_prefix) {
    if (!is.data.frame(df) || nrow(df) == 0) {
      return(c("No segmentation data found" = ""))
    }

    id_col <- resolve_col(df, id_candidates)
    name_col <- resolve_col(df, name_candidates)

    if (is.null(id_col) || is.null(name_col)) {
      return(c("Segmentation config columns not found" = ""))
    }

    ids <- as.character(df[[id_col]])
    labels <- as.character(df[[name_col]])
    valid <- !is.na(ids) & nzchar(trimws(ids))

    if (!any(valid)) {
      return(c("No valid segmentation ID found" = ""))
    }

    ids <- ids[valid]
    labels <- labels[valid]
    label_missing <- is.na(labels) | !nzchar(trimws(labels))
    labels[label_missing] <- paste(fallback_prefix, ids[label_missing])

    stats::setNames(ids, labels)
  }

  # =============================================================================
  # REACTIVE VALUES
  # =============================================================================

  # Variabel dependent
  rv_df <- reactiveVal()  # Menyimpan df untuk digunakan ulang
  df1 <- reactiveVal(NULL)  # Data independent

  output$dependent_data <- renderDT({
    df <- rv_df()
    if (is.null(df)) {
      return(datatable(
        data.frame(Info = "Select dependent + segmentation, then click Submit."),
        options = list(dom = "t", paging = FALSE, searching = FALSE, ordering = FALSE)
      ))
    }
    datatable(df, options = list(scrollX = TRUE))
  })

  # =============================================================================
  # DEPENDENT VARIABLE LOGIC
  # =============================================================================

  # Dynamic UI for segmentation based on dependent variable selection
  output$segmentationUI <- renderUI({
    if (input$dependent == "PD") {
      pd_choices <- build_segment_choices(
        PD,
        id_candidates = c("pkid", "pd_config_id", "config_id", "id"),
        name_candidates = c("pd_model_name", "model_name", "name", "description"),
        fallback_prefix = "PD"
      )
      selectInput("segment", "Segmentation:",
                  choices = pd_choices)
    } else if (input$dependent == "LGD") {
      lgd_choices <- build_segment_choices(
        LGD,
        id_candidates = c("pkid", "lgd_config_id", "config_id", "id"),
        name_candidates = c("lgd_model_name", "model_name", "name", "description"),
        fallback_prefix = "LGD"
      )
      selectInput("segment", "Segmentation:",
                  choices = lgd_choices)
    }
  })

  # Handle dependent variable data submission
  observeEvent(input$submit, {
    log_info("Dependent variable submission started", category = "DATA",
             details = list(dependent_type = input$dependent,
                          segment = if(is.null(input$segment)) "NULL" else input$segment))

    # Ambil data berdasarkan input
    df <- NULL
    if (input$dependent == "OTHERS") {
      if (!is.null(input$file_upload_other1)) {
        log_data_operation("UPLOAD", "STARTED",
                          details = list(filename = input$file_upload_other1$name,
                                        dependent_type = "OTHERS"))
        ext <- tools::file_ext(input$file_upload_other1$name)
        df <- if (ext %in% c("xlsx", "xls")) {
          readxl::read_excel(input$file_upload_other1$datapath)
        } else {
          read.csv(input$file_upload_other1$datapath, sep = input$csv_sep1)
        }
        df <- normalize_column_names(df)
        log_data_operation("UPLOAD", "SUCCESS",
                          details = list(rows = nrow(df), cols = ncol(df)))
      } else {
        log_warn("No file uploaded for dependent variable OTHERS", category = "DATA")
        df <- data.frame(Warning = "No file uploaded")
      }
    } else {
      # FIXED: Use direct dbGetQuery with proper parameter binding exactly like original working version
      tryCatch({
        log_database("QUERY", "frs9_imp_ca_pd_odr/lgd_h", "STARTED",
                    details = list(dependent = input$dependent, segment = input$segment))
        if (input$dependent == "PD") {
          df <- DBI::dbGetQuery(con, "SELECT * FROM frs9_imp_ca_pd_odr WHERE pd_config_id::text = $1",
                          params = list(as.character(input$segment)))
          df <- normalize_column_names(df)
          log_database("QUERY", "frs9_imp_ca_pd_odr", "SUCCESS",
                      details = list(rows = nrow(df)))
        } else {
          df <- DBI::dbGetQuery(con, "SELECT * FROM frs9_imp_ca_lgd_h WHERE lgd_config_id::text = $1",
                          params = list(as.character(input$segment)))
          df <- normalize_column_names(df)
          log_database("QUERY", "frs9_imp_ca_lgd_h", "SUCCESS",
                      details = list(rows = nrow(df)))
        }
      }, error = function(e) {
        log_database("QUERY", "frs9_imp_ca", "FAILED",
                    details = list(error = e$message, dependent = input$dependent))
        df <- data.frame(Warning = paste("No data found for", input$dependent))
      })
    }

    # Simpan ke reactiveVal
    log_debug("Setting reactive value rv_df with data", category = "DATA",
             details = list(rows = if(is.null(df)) "NULL" else nrow(df),
                           columns = if(is.null(df)) "NULL" else paste(names(df), collapse=", ")))
    rv_df(df)
    log_info("Reactive value rv_df successfully set", category = "DATA")
  })

  # Data transformation for dependent variable
  data_dependent_tr <- eventReactive(input$submit, {
    log_info("Data transformation triggered for dependent variable", category = "DATA",
            details = list(dependent_type = input$dependent))

    req(input$dependent)
    req(rv_df())  # Add this to ensure rv_df has data before proceeding

    log_debug("All requirements passed, proceeding with transformation", category = "DATA")

    tryCatch({
      # Check if rv_df() is available
      base_data <- rv_df()
      if (is.null(base_data) || nrow(base_data) == 0) {
        log_error("No data available for transformation", category = "DATA")
        # This should never happen now due to req() above
        data.frame(Error = "No data uploaded. Please upload a file first.")
      }

      # Get the base dependent data
      if (input$dependent == "PD"){
        if (!all(c("prc_date", "odr") %in% names(base_data))) {
          log_error("Missing required columns for PD transformation", category = "DATA",
                   details = list(required = "prc_date, odr", available = paste(names(base_data), collapse=", ")))
          data.frame(Error = "Missing required columns: prc_date, odr")
        }
        data_dependent <- base_data[,c("prc_date","odr")]
      }else if(input$dependent == "LGD"){
        if (!all(c("prc_date", "lgd") %in% names(base_data))) {
          log_error("Missing required columns for LGD transformation", category = "DATA",
                   details = list(required = "prc_date, lgd", available = paste(names(base_data), collapse=", ")))
          data.frame(Error = "Missing required columns: prc_date, lgd")
        }
        data_dependent <- base_data[,c("prc_date","lgd")]
      }else if(input$dependent=="OTHERS"){
        data_dependent <- base_data
        data_dependent <- convert_dates(data_dependent)
      }

      # Check if data_dependent is valid
      if (is.null(data_dependent) || nrow(data_dependent) == 0) {
        log_error("No valid dependent data after processing", category = "DATA")
        data.frame(Error = "No valid data after processing")
      }

      # Log data before transformation
      log_debug("Dependent data before transformation", category = "DATA",
               details = list(columns = paste(names(data_dependent), collapse=", "),
                             rows = nrow(data_dependent)))

      # Check if transformations are selected
      transformations <- input$transformasi
      log_info("Selected transformations", category = "DATA",
              details = list(transformations = if(is.null(transformations) || length(transformations) == 0)
                            "NONE" else paste(transformations, collapse=", ")))

      # Apply transformations only if selected
      if (!is.null(transformations) && length(transformations) > 0) {
        hasildependent <- transform_y(data_dependent, transformations,
                                       logit_value = 0.000001,
                                       moving_avg_window = 3)
        log_info("Transformations applied successfully", category = "DATA")
      } else {
        # If no transformations selected, return original data
        hasildependent <- data_dependent
        log_info("No transformations applied, using original data", category = "DATA")
      }

      # Log data after transformation
      log_debug("Dependent data after transformation", category = "DATA",
               details = list(columns = if(is.null(hasildependent)) "NULL" else paste(names(hasildependent), collapse=", "),
                             rows = if(is.null(hasildependent)) "NULL" else nrow(hasildependent)))

      # Ensure we return a data frame
      if (is.null(hasildependent) || !is.data.frame(hasildependent)) {
        log_error("Transform returned invalid data structure", category = "DATA")
        data.frame(Error = "Data transformation failed")
      }

      log_info("Data transformation completed successfully", category = "DATA",
              details = list(rows = nrow(hasildependent), cols = ncol(hasildependent)))
      hasildependent
    }, error = function(e) {
      log_error_context(e, "Data Dependent Transformation", category = "DATA")
      data.frame(Error = paste("Processing failed:", e$message))
    })
  })

  # Display transformed dependent data
  output$tabel_data_dependent_tr <- renderDT({
    cat("🔍 DEBUG [RENDER_DEPENDENT_TR]: renderDT for tabel_data_dependent_tr called\n")
    transformed <- data_dependent_tr()
    if (is.null(transformed) || !is.data.frame(transformed) || nrow(transformed) == 0) {
      return(datatable(
        data.frame(Info = "Transformed preview appears after Submit."),
        options = list(dom = "t", paging = FALSE, searching = FALSE, ordering = FALSE)
      ))
    }
    cat("✅ DEBUG [RENDER_DEPENDENT_TR]: data_dependent_tr() available, rendering table\n")
    datatable(transformed, options = list(scrollX = TRUE))
  })

  # =============================================================================
  # P2-TASK#10: DATE AUTO-UPDATE LOGIC
  # =============================================================================
  # Auto-detect max date from uploaded data and update reporting period
  # Reference: IMPLEMENTATION_GUIDE_P1_P2.md lines 430-468
  # Original: app15.R lines 928-941

  observe({
    req(rv_df())

    tryCatch({
      df <- rv_df()

      # Try to find date column (PRC_DATE, PERIOD, DATE, etc.)
      date_cols <- names(df)[grepl("DATE|PERIOD|PRC", names(df), ignore.case = TRUE)]

      if (length(date_cols) > 0) {
        # Get max date from first date column
        date_col <- date_cols[1]
        cat("📅 DEBUG [DATE_AUTO_UPDATE]: Found date column:", date_col, "\n")

        # Try to convert to Date
        dates <- tryCatch({
          as.Date(df[[date_col]])
        }, error = function(e) {
          cat("  ⚠️ Date conversion warning:", e$message, "\n")
          NULL
        })

        if (!is.null(dates) && any(!is.na(dates))) {
          max_date <- max(dates, na.rm = TRUE)

          cat("  ✅ Auto-detected max date:", format(max_date, "%Y-%m-%d"), "\n")
          cat("  - Total dates processed:", length(dates), "\n")
          cat("  - Valid dates found:", sum(!is.na(dates)), "\n")
          cat("  - Date range:", format(min(dates, na.rm = TRUE), "%Y-%m-%d"),
              "to", format(max_date, "%Y-%m-%d"), "\n")

          # Display suggested reporting period as output
          output$suggested_reporting_date <- renderText({
            paste("💡 Suggested Reporting Period:", format(max_date, "%Y-%m-%d"))
          })

          # Auto-populate reporting date input if it exists
          if (!is.null(input$reporting_date)) {
            updateDateInput(session, "reporting_date", value = max_date)
            cat("  ✅ Updated reporting_date input to:", format(max_date, "%Y-%m-%d"), "\n")
          } else {
            cat("  ℹ️ reporting_date input not found (may not exist in UI)\n")
          }
        } else {
          cat("  ⚠️ No valid dates found in column:", date_col, "\n")
        }
      } else {
        cat("📅 DEBUG [DATE_AUTO_UPDATE]: No date columns found in data\n")
        cat("  - Available columns:", paste(names(df), collapse = ", "), "\n")
      }
    }, error = function(e) {
      cat("❌ ERROR [DATE_AUTO_UPDATE]:", e$message, "\n")
    })
  })

  # Validation logic for dependent variable data
  observeEvent(input$submit, {
    if(input$dependent=="OTHERS"){
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

  # =============================================================================
  # INDEPENDENT VARIABLE LOGIC
  # =============================================================================

  # Safe data reading function
  safe_read_data <- function(input_file, sep) {
    ext <- tools::file_ext(input_file$name)
    tryCatch({
      if (ext %in% c("xlsx", "xls")) {
        normalize_column_names(readxl::read_excel(input_file$datapath))
      } else {
        normalize_column_names(read.csv(input_file$datapath, sep = sep, stringsAsFactors = FALSE))
      }
    }, error = function(e) {
      showNotification(paste("Gagal membaca file:", e$message), type = "error")
      return(NULL)
    })
  }

  # Handle independent variable data submission
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

  # Process independent data to df_final (from original lines 746-777)
  df_final <- reactive({
    cat("🔍 DEBUG [DATA_SERVER_DF_FINAL]: df_final() called...\n")
    cat("🔍 DEBUG [DATA_SERVER_DF_FINAL]: checking df1()...\n")

    df1_result <- df1()
    if(is.null(df1_result)) {
      cat("⚠️ DEBUG [DATA_SERVER_DF_FINAL]: df1() is NULL - no data uploaded yet\n")
      return(NULL)
    }

    cat("✅ DEBUG [DATA_SERVER_DF_FINAL]: df1() has data, dims:", paste(dim(df1_result), collapse="x"), "\n")

    req(df1())
    result <- convert_dates2(df1())
    df2 <- result$df
    date_col <- result$date_columns

    if (length(date_col) == 0) {
      showNotification("Tidak ada kolom tanggal terdeteksi.", type = "error")
      return(NULL)
    }

    # Apply transformation if checkbox is checked (matches original app15.R logic)
    if (input$transform) {
      # Exclude date columns from transformation
      df3x <- df2[, !names(df2) %in% date_col, drop = FALSE]
      cat("🔄 Applying transform to independent data...\n")
      cat("  Original variables:", paste(names(df3x), collapse=", "), "\n")

      # Apply the comprehensive transform function
      df3new <- transform_data(df3x)

      cat("  Transformed variables:", ncol(df3new), "columns\n")
      cat("  Sample new variables:", paste(head(names(df3new), 10), collapse=", "), "...\n")

      # Combine date columns back with transformed data
      df3new <- cbind(df2[, date_col, drop = FALSE], df3new)
      df3new <- na.omit(df3new)

      cat("  Final result:", ncol(df3new), "total columns\n")
      return(df3new)
    } else {
      cat("ℹ️ No transformation applied to independent data\n")
      return(df2)
    }
  })

  # =============================================================================
  # DATA JOINING FUNCTIONALITY (from original lines 902-912)
  # =============================================================================

  # Data gabung (join data dependent and independent)
  datagabung <- eventReactive(input$join, {
    req(data_dependent_tr(), df_final())

    data_dep <- data_dependent_tr()
    data_ind <- df_final()

    # Enhanced debug logging
    cat("\n🔍 === Enhanced Data Joining Debug ===\n")
    cat("📊 Dependent data info:\n")
    cat("  - Columns:", paste(names(data_dep), collapse = ", "), "\n")
    cat("  - Rows:", nrow(data_dep), "\n")
    cat("  - Column types:\n")
    for(col in names(data_dep)) {
      cat("    •", col, ":", class(data_dep[[col]])[1], "\n")
    }

    cat("\n📊 Independent data info:\n")
    cat("  - Columns:", paste(names(data_ind), collapse = ", "), "\n")
    cat("  - Rows:", nrow(data_ind), "\n")
    cat("  - Column types:\n")
    for(col in names(data_ind)) {
      cat("    •", col, ":", class(data_ind[[col]])[1], "\n")
    }

    # Show sample data
    cat("\n📋 Sample dependent data (first 3 rows):\n")
    print(head(data_dep, 3))

    cat("\n📋 Sample independent data (first 3 rows):\n")
    print(head(data_ind, 3))

    cat("\n🔗 Attempting to join data...\n")

    tryCatch({
      hasilgabung <- inner_join_date(data_dep, data_ind)
      cat("✅ Data joined successfully!\n")
      cat("  - Result columns:", paste(names(hasilgabung), collapse = ", "), "\n")
      cat("  - Result rows:", nrow(hasilgabung), "\n")
      cat("\n📋 Sample joined data (first 3 rows):\n")
      print(head(hasilgabung, 3))
      hasilgabung
    }, error = function(e) {
      cat("❌ Error in data joining:", e$message, "\n")

      # Additional error diagnosis
      date_cols_dep <- names(data_dep)[sapply(data_dep, function(x) inherits(x, "Date") || inherits(x, "POSIXct"))]
      date_cols_ind <- names(data_ind)[sapply(data_ind, function(x) inherits(x, "Date") || inherits(x, "POSIXct"))]

      cat("\n🔍 Error diagnosis:\n")
      cat("  - Date columns in dependent data:",
          if(length(date_cols_dep) > 0) paste(date_cols_dep, collapse=", ") else "NONE", "\n")
      cat("  - Date columns in independent data:",
          if(length(date_cols_ind) > 0) paste(date_cols_ind, collapse=", ") else "NONE", "\n")

      showNotification(paste("Join failed:", e$message), type = "error")
      data.frame(Error = paste("Join failed:", e$message))
    })
  })

  # =============================================================================
  # OUTPUT RENDERS
  # =============================================================================

  # Display independent data
  output$independent_data <- renderDT({
    req(df_final())
    datatable(df_final(), options = list(scrollX = TRUE))
  })

  # Display joined data table (from original line 915-917)
  output$tabel_hasil_join <- renderDT({
    req(datagabung())
    datatable(datagabung(), options = list(scrollX = TRUE))
  })

  # =============================================================================
  # UPLOAD HISTORY FUNCTIONALITY (from original lines 840-892)
  # =============================================================================

  # Update upload history select input with choices from database
  observe({
    # FIXED: Check database connection before executing query
    if (is.null(con)) {
      cat("⚠️ WARNING [UPLOAD_HISTORY]: Database connection is NULL - using sample data\n")
      # Provide sample choices for offline mode
      sample_choices <- c(
        "sample_independent_data.csv" = "SAMPLE_001",
        "demo_portfolio_data.csv" = "SAMPLE_002"
      )
      updateSelectInput(session, "download_upload_id", choices = sample_choices)
      return()
    }

    tryCatch({
      uploads <- DBI::dbGetQuery(con, 'SELECT id, filename FROM upload_history WHERE purpose = \'independent\' ORDER BY upload_time DESC')
      choices <- setNames(uploads$id, uploads$filename)
      updateSelectInput(session, "download_upload_id", choices = choices)
      cat("✅ DEBUG [UPLOAD_HISTORY]: Updated", length(choices), "upload choices\n")
    }, error = function(e) {
      cat("❌ ERROR [UPLOAD_HISTORY]: Could not update upload history choices:", e$message, "\n")
      # If database fails, provide sample choices
      sample_choices <- c(
        "Error loading data" = "ERROR_001",
        "Please check connection" = "ERROR_002"
      )
      updateSelectInput(session, "download_upload_id", choices = sample_choices)
    })
  })

  # Render upload history table
  output$upload_history_table <- renderDT({
    # FIXED: Check database connection before executing query
    if (is.null(con)) {
      cat("⚠️ WARNING [UPLOAD_HISTORY_TABLE]: Database connection is NULL - showing sample data\n")
      # Return sample upload history data for offline mode
      sample_uploads <- data.frame(
        id = c("SAMPLE_001", "SAMPLE_002", "SAMPLE_003"),
        filename = c("sample_independent_data.csv", "demo_portfolio_data.csv", "test_scenarios.csv"),
        file_type = c("CSV", "CSV", "CSV"),
        rows = c(150, 200, 75),
        columns = c(12, 15, 8),
        upload_time = as.POSIXct(c("2024-01-15 10:30:00", "2024-02-20 14:45:00", "2024-03-10 09:15:00"))
      )
      return(datatable(sample_uploads,
                      options = list(scrollX = TRUE, pageLength = 5),
                      caption = "Sample Upload History (Offline Mode)"))
    }

    tryCatch({
      uploads <- DBI::dbGetQuery(con, '
        SELECT id, filename, file_type, rows, columns, upload_time
        FROM upload_history
        WHERE purpose = \'independent\'
        ORDER BY upload_time DESC
      ')
      cat("✅ DEBUG [UPLOAD_HISTORY_TABLE]: Loaded", nrow(uploads), "upload records\n")
      datatable(uploads, options = list(scrollX = TRUE, pageLength = 10))
    }, error = function(e) {
      cat("❌ ERROR [UPLOAD_HISTORY_TABLE]: Could not render upload history table:", e$message, "\n")
      # Return empty data frame if database fails
      datatable(data.frame(Message = "Upload history not available"), options = list(scrollX = TRUE))
    })
  })

  # Handle delete upload confirmation dialog
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

  # Handle confirmed deletion
  observeEvent(input$confirm_delete, {
    req(input$download_upload_id)

    tryCatch({
      log_data_operation("DELETE", "STARTED",
                        details = list(upload_id = input$download_upload_id))

      # Delete from upload_history table
      DBI::dbExecute(con, "DELETE FROM upload_history WHERE id = $1",
                params = list(input$download_upload_id))

      log_database("DELETE", "upload_history", "SUCCESS",
                  details = list(upload_id = input$download_upload_id))

      removeModal()

      # Refresh selectInput and DT
      uploads <- DBI::dbGetQuery(con, "SELECT id, filename FROM upload_history WHERE purpose = 'independent' ORDER BY upload_time DESC")
      updateSelectInput(session, "download_upload_id", choices = setNames(uploads$id, uploads$filename))

      # Show success notification
      showNotification("File upload berhasil dihapus!", type = "message")
      log_data_operation("DELETE", "SUCCESS",
                        details = list(upload_id = input$download_upload_id))
    }, error = function(e) {
      log_database("DELETE", "upload_history", "FAILED",
                  details = list(upload_id = input$download_upload_id, error = e$message))
      removeModal()
      showNotification("Gagal menghapus file upload!", type = "error")
    })
  })

  # Download handler for uploaded files (using binary file reconstruction)
  output$download_upload_csv <- downloadHandler(
    filename = function() {
      req(input$download_upload_id)

      tryCatch({
        fname <- DBI::dbGetQuery(con, "
          SELECT filename FROM upload_history WHERE id = $1
        ", params = list(input$download_upload_id))

        fname <- if (nrow(fname) > 0) fname$filename[1] else "file.csv"
        if (!grepl("\\.csv$", fname)) fname <- paste0(fname, ".csv")
        return(fname)
      }, error = function(e) {
        cat("Error getting filename:", e$message, "\n")
        return("download.csv")
      })
    },
    content = function(file) {
      req(input$download_upload_id)

      tryCatch({
        # Use the new load_from_history() function (lines 2586-2621)
        # This properly handles binary file reconstruction with writeBin()
        df <- load_from_history(con, input$download_upload_id)

        if (is.null(df) || nrow(df) == 0) {
          write.csv(data.frame(WARNING = "Data tidak ditemukan atau kosong."), file, row.names = FALSE)
          return()
        }

        # Write as CSV
        write.csv(df, file, row.names = FALSE)
      }, error = function(e) {
        cat("Error downloading file:", e$message, "\n")
        write.csv(data.frame(ERROR = paste("Download error:", e$message)), file, row.names = FALSE)
      })
    }
  )

  # Load from history button handler (allows reloading data from upload history)
  observeEvent(input$load_from_history, {
    req(input$download_upload_id)

    tryCatch({
      log_data_operation("LOAD_HISTORY", "STARTED",
                        details = list(upload_id = input$download_upload_id))

      # Load data from history using binary reconstruction
      loaded_data <- load_from_history(con, input$download_upload_id)

      if (!is.null(loaded_data) && nrow(loaded_data) > 0) {
        log_data_operation("LOAD_HISTORY", "SUCCESS",
                          details = list(rows = nrow(loaded_data), cols = ncol(loaded_data)))
        # Store loaded data to df1 reactive
        df1(loaded_data)

        # Show success notification
        showNotification("Data berhasil dimuat dari history!", type = "success")
      } else {
        showNotification("Gagal memuat data dari history!", type = "error")
      }
    }, error = function(e) {
      cat("Error loading from history:", e$message, "\n")
      showNotification(paste("Error:", e$message), type = "error")
    })
  })

  # =============================================================================
  # RETURN VALUES
  # =============================================================================

  # Return reactive values for use in other modules with data persistence
  return(list(
    dependent_data = reactive({
      # Use persistent data first, fall back to rv_df
      if (!is.null(persistent_data$dependent_data)) {
        cat("🔄 Using persistent dependent_data\n")
        persistent_data$dependent_data
      } else {
        rv_df()
      }
    }),
    independent_data = reactive({
      cat("🔍 DEBUG [DATA_SERVER_RETURN]: independent_data() called, returning df_final()...\n")

      # Use persistent data first, fall back to df_final()
      if (!is.null(persistent_data$independent_data) && is.data.frame(persistent_data$independent_data)) {
        cat("🔄 Using persistent independent_data\n")
        cat("🔍 DEBUG [DATA_SERVER_RETURN]: persistent_data result:",
            "data.frame with dims", paste(dim(persistent_data$independent_data), collapse="x"), "\n")
        persistent_data$independent_data
      } else {
        result <- df_final()
        cat("🔍 DEBUG [DATA_SERVER_RETURN]: df_final() result:",
            if(is.null(result)) "NULL" else paste("data.frame with dims", paste(dim(result), collapse="x")), "\n")
        result
      }
    }),
    dependent_transformed = reactive({
      # Use persistent data first, fall back to data_dependent_tr
      if (!is.null(persistent_data$dependent_data) && is.data.frame(persistent_data$dependent_data)) {
        # Return transformed data if available
        if (!is.null(data_dependent_tr())) {
          data_dependent_tr()
        } else {
          persistent_data$dependent_data
        }
      } else {
        data_dependent_tr()
      }
    }),
    joined_data = reactive({
      # Use persistent data first, fall back to datagabung
      if (!is.null(persistent_data$joined_data) && is.data.frame(persistent_data$joined_data)) {
        cat("🔄 Using persistent joined_data\n")
        persistent_data$joined_data
      } else {
        # Try to load saved joined data from database
        if (!is.null(con)) {
          tryCatch({
            cat("🔍 DEBUG [DATA_SERVER]: Attempting to load saved joined data from database...\n")

            # Query to get the most recent joined data
            query <- "SELECT data_content, created_at FROM analytics_joined_data ORDER BY created_at DESC LIMIT 1"
            result <- DBI::dbGetQuery(con, query)

            if (nrow(result) > 0 && !is.null(result$data_content[1])) {
              # Deserialize the data
              joined_data <- unserialize(base64enc::base64decode(result$data_content[1]))

              if (is.data.frame(joined_data) && nrow(joined_data) > 0) {
                cat("✅ Loaded saved joined data from database (", nrow(joined_data), "rows)\n")
                cat("📅 Date range:", range(joined_data$Date, na.rm = TRUE), "\n")
                cat("📅 Saved on:", result$created_at[1], "\n")

                # Store in persistent data
                persistent_data$joined_data <<- joined_data

                return(joined_data)
              }
            }
          }, error = function(e) {
            cat("⚠️ Could not load saved joined data from database:", e$message, "\n")
          })
        }

        # Check if join operation has been triggered and has valid data
        # Only call datagabung() if the join button has been clicked
        if (is.null(input$join) || input$join == 0) {
          # Join button not clicked yet and no saved data available
          cat("⚠️ No joined data available - click 'Full Join' button to create joined data\n")
          return(data.frame())
        }

        tryCatch({
          cat("🔍 DEBUG [DATA_SERVER]: Calling datagabung()...\n")
          result <- datagabung()
          cat("🔍 DEBUG [DATA_SERVER]: datagabung() returned:\n")
          cat("  - type:", class(result), "\n")
          if (!is.null(result) && is.data.frame(result)) {
            cat("  - dimensions:", paste(dim(result), collapse="x"), "\n")

            # Store in persistent data
            persistent_data$joined_data <<- result

            # ✅ SAVE JOINED DATA TO DATABASE FOR PERSISTENCE
            if (!is.null(con) && nrow(result) > 0) {
              tryCatch({
                cat("💾 Saving joined data to database for persistence...\n")

                # Serialize the data
                serialized_data <- base64enc::base64encode(serialize(result, NULL))

                # Check if table exists, create if not
                table_check_query <- "CREATE TABLE IF NOT EXISTS analytics_joined_data (
                  id SERIAL PRIMARY KEY,
                  data_content TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  session_id VARCHAR(255)
                )"

                DBI::dbExecute(con, table_check_query)

                # Insert the data
                insert_query <- "INSERT INTO analytics_joined_data (data_content, session_id) VALUES ($1, $2)"
                session_id <- session$token  # Get session identifier
                DBI::dbExecute(con, insert_query, list(serialized_data, session_id))

                # Clean up old records (keep only the latest)
                cleanup_query <- "DELETE FROM analytics_joined_data WHERE id NOT IN (
                  SELECT id FROM analytics_joined_data ORDER BY created_at DESC LIMIT 1
                )"
                DBI::dbExecute(con, cleanup_query)

                cat("✅ Joined data saved to database successfully\n")
              }, error = function(e) {
                cat("❌ Failed to save joined data to database:", e$message, "\n")
              })
            }

            # ✅ UPDATE DATE INPUTS AFTER SUCCESSFUL JOIN
            # Update date inputs in Model tab based on joined data
            if (nrow(result) > 0) {
              cat("🔍 DEBUG [DATA_SERVER]: Updating date inputs from joined data...\n")

              # Check for Date columns
              date_colx <- names(result)[sapply(result, function(col) inherits(col, "Date"))]
              if (length(date_colx) == 0) {
                # Try to find datetime column if no Date column found
                date_colx <- names(result)[sapply(result, function(col) inherits(col, "POSIXct") || inherits(col, "POSIXt"))]
                if (length(date_colx) > 0) {
                  cat("🔍 DEBUG [DATA_SERVER]: Found datetime column instead of Date column\n")
                }
              }

              if (length(date_colx) > 0) {
                date_col <- date_colx[1]
                cat("✅ DEBUG [DATA_SERVER]: Using date column:", date_col, "\n")

                # Get valid dates (remove NAs)
                valid_dates <- result[[date_col]][!is.na(result[[date_col]])]
                if (length(valid_dates) > 0) {
                  # Update date inputs
                  updateDateInput(session, "train_start", value = valid_dates[1],
                                  min = min(valid_dates), max = max(valid_dates))

                  updateDateInput(session, "train_split", value = valid_dates[round(length(valid_dates)/2)],
                                  min = min(valid_dates), max = max(valid_dates))

                  updateDateInput(session, "test_end", value = valid_dates[length(valid_dates)],
                                  min = min(valid_dates), max = max(valid_dates))

                  cat("✅ DEBUG [DATA_SERVER]: Date inputs updated successfully\n")
                  cat("  - First date:", valid_dates[1], "\n")
                  cat("  - Middle date:", valid_dates[round(length(valid_dates)/2)], "\n")
                  cat("  - Last date:", valid_dates[length(valid_dates)], "\n")
                } else {
                  cat("⚠️ DEBUG [DATA_SERVER]: No valid dates found in column:", date_col, "\n")
                }
              } else {
                cat("⚠️ DEBUG [DATA_SERVER]: No date/datetime columns found in joined data\n")
              }
            }

            result
          } else {
            # Return empty data frame if no data available
            cat("  - datagabung returned NULL or invalid data\n")
            data.frame()
          }
        }, error = function(e) {
          cat("⚠️ datagabung not available or error:", e$message, "\n")
          data.frame()
        })
      }
    }),
    data_status = reactive({
      # Return data processing status
      list(
        has_dependent = !is.null(persistent_data$dependent_data),
        has_independent = !is.null(persistent_data$independent_data),
        has_joined = !is.null(persistent_data$joined_data),
        processed_rows = if (!is.null(persistent_data$dependent_data)) nrow(persistent_data$dependent_data) else 0
      )
    })
  ))

  # =============================================================================
  # SESSION CLEANUP - Clear joined data when session ends
  # =============================================================================
  session$onSessionEnded(function() {
    cat("🧹 Session ended - clearing joined data from database...\n")

    if (!is.null(con)) {
      tryCatch({
        # Clear joined data for this session
        query <- "DELETE FROM analytics_joined_data WHERE session_id = $1"
        session_id <- session$token
        DBI::dbExecute(con, query, list(session_id))

        cat("✅ Cleared joined data from database\n")
      }, error = function(e) {
        cat("⚠️ Failed to clear session data:", e$message, "\n")
      })
    }
  })

  # =============================================================================
  # RETURN VALUES (CRITICAL for modular architecture)
  # =============================================================================
  return(list(
    dependent_transformed = data_dependent_tr,
    independent_data = df1,
    joined_data = datagabung,
    base_data = rv_df
  ))
}

# =============================================================================
# END OF DATA SERVER MODULE
# =============================================================================
