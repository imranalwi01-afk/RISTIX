# =============================================================================
# FORECAST SERVER MODULE
# =============================================================================
# Extracted from: _analytics/_v15/reference/app15.R (server function lines 1300-1800)
# Purpose: Server logic for forecasting operations, MEV data processing, and Y variable prediction
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Forecast Server Module
#' @description Handles forecasting logic including MEV data processing, model filtering, and Y variable prediction
#' @param input Shiny input object
#' @param output Shiny output object
#' @param session Shiny session object
#' @param model_results Results from model server
#' @param con Database connection
#' @return List of reactive forecast results
forecast_server <- function(input, output, session, model_results, data_results, con) {

  # =============================================================================
  # UTILITY FUNCTIONS
  # =============================================================================
  # Utility functions are already sourced in app.R - no duplication needed
  # All utils/data_processing.R, utils/forecasting.R, utils/statistical_modeling.R,
  # and utils/database_utils.R are loaded globally in app.R before modules are initialized

  # =============================================================================
  # REACTIVE VALUES
  # =============================================================================

  dforecast <- reactiveVal(NULL)
  transformed_result_forecast <- reactiveVal(NULL)

  # =============================================================================
  # MEV VARIABLE EXTRACTION (Original: app15.R lines 1593-1596)
  # =============================================================================

  #' Extract MEV (Macroeconomic Variables) from joined data
  #' @description Extracts unique variable sources by splitting column names
  #' @details Original implementation: lines 1593-1596
  #' sources <- unique(sapply(strsplit(namax, "_"), `[`, 1))
  mev_variables <- reactive({
    req(model_results$model_data())

    tryCatch({
      # Get all column names from final joined data
      model_data_full <- model_results$model_data()
      namax <- names(model_data_full)

      # Extract variable prefix by splitting on underscore (line 1594)
      # This gets the MEV name before the transformation suffix
      # e.g., "GDP_Y_Lg1" -> "GDP", "INFLASI_Diff12" -> "INFLASI"
      sources <- unique(sapply(strsplit(namax, "_"), `[`, 1))

      # Remove date/period columns if present
      sources <- sources[!tolower(sources) %in% c("prc", "date", "period", "tanggal")]

      # Filter to only include columns that exist in data (line 1595)
      sources <- sources[sources %in% names(model_data_full)]

      # Create subset with only core MEV variables
      if (length(sources) > 0) {
        datacorex <- model_data_full[, sources, drop = FALSE]
        cat("✅ MEV variables extracted (", length(sources), " variables):",
            paste(sources, collapse=", "), "\n")
        return(datacorex)
      } else {
        cat("⚠️ No valid MEV variables found\n")
        return(NULL)
      }
    }, error = function(e) {
      cat("❌ ERROR extracting MEV variables:", e$message, "\n")
      return(NULL)
    })
  })

  # =============================================================================
  # P2-TASK#14: ENHANCED DATE FILTERING LOGIC
  # =============================================================================
  # Purpose: Advanced date filtering for forecast operations
  # Reference: IMPLEMENTATION_GUIDE_P1_P2.md lines 708-827
  # Original: app15.R implied date filtering logic

  #' Filter data by date range
  #' @description Reactive function to filter data within specified date range
  #' @details Filters data between forecast_start_date and forecast_end_date inputs
  #' @return Filtered data frame within date range
  filter_by_date_range <- reactive({
    cat("\n🔍 DEBUG [FILTER_BY_DATE_RANGE]: Starting date range filtering\n")

    req(input$forecast_start_date, input$forecast_end_date)
    req(model_results$model_data())
    cat("  - ✅ Requirements met (dates and model_data)\n")

    tryCatch({
      df <- model_results$model_data()
      cat("  - Model data obtained, dims:", dim(df), "\n")

      # Find date column (flexible matching)
      date_col <- names(df)[grepl("DATE|PERIOD|PRC", names(df), ignore.case = TRUE)][1]
      cat("  - Date column detected:", date_col %||% "NONE", "\n")

      if (is.null(date_col)) {
        cat("  - ⚠️ No date column found, returning unfiltered data\n")
        return(df)
      }

      # Convert to Date type
      df[[date_col]] <- as.Date(df[[date_col]])
      start_date <- as.Date(input$forecast_start_date)
      end_date <- as.Date(input$forecast_end_date)

      cat("  - Date range: ", format(start_date, "%Y-%m-%d"), " to ",
          format(end_date, "%Y-%m-%d"), "\n")

      # Apply date filter using dplyr
      filtered <- df %>%
        filter(!!sym(date_col) >= start_date & !!sym(date_col) <= end_date)

      cat("  - ✅ Filtered data, original rows:", nrow(df), ", filtered rows:", nrow(filtered), "\n")

      return(filtered)

    }, error = function(e) {
      cat("❌ ERROR [FILTER_BY_DATE_RANGE]:", e$message, "\n")
      return(model_results$model_data())  # Return unfiltered on error
    })
  })

  #' Historical data only (exclude future dates)
  #' @description Reactive function to filter data up to reporting date for backtesting
  #' @details Excludes all data after the reporting_date to prevent look-ahead bias
  #' @return Data frame with only historical observations
  historical_data_only <- reactive({
    cat("\n🔍 DEBUG [HISTORICAL_DATA_ONLY]: Starting historical data filtering\n")

    req(filter_by_date_range())
    cat("  - ✅ filter_by_date_range requirement met\n")

    tryCatch({
      df <- filter_by_date_range()
      cat("  - Filtered data obtained, dims:", dim(df), "\n")

      # Check if reporting_date input exists
      if (is.null(input$reporting_date)) {
        cat("  - ⚠️ No reporting_date input, returning all filtered data\n")
        return(df)
      }

      reporting_date <- as.Date(input$reporting_date)
      cat("  - Reporting date:", format(reporting_date, "%Y-%m-%d"), "\n")

      # Find date column
      date_col <- names(df)[grepl("DATE|PERIOD|PRC", names(df), ignore.case = TRUE)][1]

      if (!is.null(date_col)) {
        df[[date_col]] <- as.Date(df[[date_col]])

        # Filter to historical data only (≤ reporting_date)
        df_historical <- df %>%
          filter(!!sym(date_col) <= reporting_date)

        cat("  - ✅ Historical data filtered, original rows:", nrow(df),
            ", historical rows:", nrow(df_historical), "\n")

        return(df_historical)
      } else {
        cat("  - ⚠️ No date column found, returning unfiltered data\n")
        return(df)
      }

    }, error = function(e) {
      cat("❌ ERROR [HISTORICAL_DATA_ONLY]:", e$message, "\n")
      return(filter_by_date_range())  # Return date-filtered on error
    })
  })

  #' Handle partial period forecasting
  #' @description Aligns forecast results to target number of periods
  #' @param forecast_result Forecast object with $mean component
  #' @param target_periods Desired number of forecast periods
  #' @details Extends forecast with last value if too short, truncates if too long
  #' @return Adjusted forecast object with correct period length
  partial_period_handling <- function(forecast_result, target_periods) {
    cat("\n🔍 DEBUG [PARTIAL_PERIOD_HANDLING]: Starting period alignment\n")
    cat("  - Target periods:", target_periods, "\n")

    tryCatch({
      actual_periods <- length(forecast_result$mean)
      cat("  - Actual forecast periods:", actual_periods, "\n")

      if (actual_periods < target_periods) {
        # Extend forecast by repeating last value
        last_value <- tail(forecast_result$mean, 1)
        extension <- rep(last_value, target_periods - actual_periods)

        forecast_result$mean <- c(forecast_result$mean, extension)

        cat("  - ✅ Forecast extended with", target_periods - actual_periods,
            "periods (last value:", last_value, ")\n")

      } else if (actual_periods > target_periods) {
        # Truncate forecast to target periods
        forecast_result$mean <- head(forecast_result$mean, target_periods)

        cat("  - ✅ Forecast truncated from", actual_periods, "to", target_periods, "periods\n")

      } else {
        cat("  - ✅ Forecast periods match target (", target_periods, ")\n")
      }

      return(forecast_result)

    }, error = function(e) {
      cat("❌ ERROR [PARTIAL_PERIOD_HANDLING]:", e$message, "\n")
      return(forecast_result)  # Return unmodified on error
    })
  }

  # =============================================================================
  # MODEL COMPLETION AND FILTERING
  # =============================================================================

  # Note: backtestf() is defined in model_server.R, not here

  # Final model results
  finalmodel <- eventReactive(input$runmodel, {
    cat("\n🔍 DEBUG [FINALMODEL]: Starting finalmodel reactive\n")
    cat("  - input$y_var:", input$y_var %||% "NULL", "\n")

    req(input$y_var, model_results$training_data(), model_results$back_test())
    cat("  - ✅ All requirements met\n")

    tryCatch({
      backtesto <- model_results$back_test()
      cat("  - ✅ backtesto obtained, rows:", nrow(backtesto), "\n")
      cat("  - backtesto columns:", paste(names(backtesto), collapse=", "), "\n")

      modelname <- backtesto$Model
      cat("  - modelname extracted, length:", length(modelname), "\n")
      if(length(modelname) > 0) cat("  - First model:", modelname[1], "\n")

      hasilmodreg3 <- runreg3models3(model_results$training_data(), input$y_var, modelname)
      cat("  - ✅ runreg3models3 completed, rows:", nrow(hasilmodreg3), "\n")

      backtesto <- backtesto %>%
        dplyr::select(-R_squared, -R_squared_adjusted)
      cat("  - ✅ backtesto columns filtered\n")

      hasilakhir <- dplyr::left_join(hasilmodreg3, backtesto, by = "Model") %>%
        dplyr::select(-MAPEinsample, -MAPEoutsample, -RMSEinsample, -RMSEoutsample)
      cat("  - ✅ Final join completed, final rows:", nrow(hasilakhir), "\n")
      cat("  - Final columns:", paste(names(hasilakhir), collapse=", "), "\n")

      hasilakhir
    }, error = function(e) {
      cat("❌ ERROR [FINALMODEL]:", e$message, "\n")
      return(data.frame(Error = paste("finalmodel failed:", e$message)))
    })
  })

  # Core variable choices for filtering
  core_choices <- reactive({
    cat("\n🔍 DEBUG [CORE_CHOICES]: Starting core_choices reactive\n")

    fm <- finalmodel()
    cat("  - finalmodel obtained, class:", class(fm), "\n")
    cat("  - finalmodel rows:", if(is.null(fm)) "NULL" else nrow(fm), "\n")

    req(!is.null(fm), nrow(fm) > 0)
    cat("  - ✅ finalmodel requirements met\n")

    tryCatch({
      choices <- extract_core_choices(fm)
      cat("  - ✅ extract_core_choices completed, length:", length(choices), "\n")
      cat("  - Core choices:", paste(choices, collapse=", "), "\n")
      choices
    }, error = function(e) {
      cat("❌ ERROR [CORE_CHOICES]:", e$message, "\n")
      return(character(0))
    })
  })

  # Dynamic UI for core variables
  output$core_vars_ui <- renderUI({
    selectizeInput(
      "core_vars", "Core variables:",
      choices = core_choices(),
      multiple = TRUE,
      options = list(placeholder = "Pilih 1+ core vars",
                     plugins = list("remove_button"))
    )
  })

  # Model selection UI (FIXED: Missing implementation causing Variable Y issue)
  output$select_model <- renderUI({
    req(finalmodel())

    # Get model names from finalmodel (like original app15.R line 1514)
    modelname <- finalmodel()[["Model"]]

    # Remove error cases and NA values
    if ("Error" %in% names(modelname) || any(is.na(modelname))) {
      modelname <- modelname[!("Error" %in% names(modelname)) & !is.na(modelname)]
    }

    # Ensure we have valid model choices
    if (length(modelname) > 0) {
      selectInput("model_forecast", "Pilih Model", choices = modelname)
    } else {
      div(HTML("No models available. Please run modeling first."), style = "color: red; padding: 10px;")
    }
  })

  # Filter management
  default_filtered_data <- reactive({ finalmodel() })
  last_action <- reactiveVal("none")

  observeEvent(input$apply_filter, { last_action("apply") })
  observeEvent(input$reset_filter, { last_action("reset") })

  # Reset filter controls
  observeEvent(input$reset_filter, {
    updateSelectizeInput(session, "core_vars", selected = character(0))
    updateNumericInput(session, "min_match", value = 1)
    updateSelectInput(session, "sort_by", selected = "R_squared")
    updateCheckboxInput(session, "exact_word", value = FALSE)
  })

  # Apply filters
  filtered_data <- eventReactive(input$apply_filter, {
    core_vars_input <- if (is.null(input$core_vars)) character(0) else input$core_vars
    filter_model_by_core_vars(
      data = finalmodel(),
      core_vars = core_vars_input,
      min_match = input$min_match,
      sort_by = input$sort_by,
      exact_word = input$exact_word
    )
  }, ignoreInit = FALSE)

  # Final filtered data
  final_filtered_data <- reactive({
    if (last_action() == "apply" && !is.null(input$apply_filter) && input$apply_filter > 0) {
      filtered_data()
    } else {
      default_filtered_data()
    }
  })

  # Model selection UI
  output$select_model <- renderUI({
    modelname <- final_filtered_data()[["Model"]]
    selectInput("model_forecast", "Pilih Model", choices = modelname)
  })

  # =============================================================================
  # FORECAST DATA PROCESSING
  # =============================================================================

  # Safe data reading function
  safe_read_data <- function(input_file, sep) {
    ext <- tools::file_ext(input_file$name)
    tryCatch({
      if (ext %in% c("xlsx", "xls")) {
        readxl::read_excel(input_file$datapath)
      } else {
        read.csv(input_file$datapath, sep = sep, stringsAsFactors = FALSE)
      }
    }, error = function(e) {
      showNotification(paste("Gagal membaca file:", e$message), type = "error")
      return(NULL)
    })
  }

  # Handle external forecast file upload
  observeEvent(input$submit3, {
    req(input$forecastfile)

    data <- safe_read_data(input$forecastfile, input$sep3)

    if (is.null(data)) {
      dforecast(data.frame(Pesan = "File tidak dapat dibaca."))
      return()
    }

    dforecast(data)

    # Validate columns
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

  # Process external forecast data
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
      df3new <- transform_data(df3x)
      df3new <- cbind(df2[, date_col, drop = FALSE], df3new)
      df3new <- na.omit(df3new)
      return(df3new)
    } else {
      return(df2)
    }
  })

  # MEV historical forecast processing
  df_forecast0 <- eventReactive(input$forecastX, {
    cat("\n🔍 DEBUG [DF_FORECAST0]: Starting df_forecast0 reactive\n")
    cat("  - input$forecastX triggered:", input$forecastX, "\n")
    cat("  - input$akurasi_forecastx:", input$akurasi_forecastx %||% "NULL", "\n")

    req(model_results$model_data())
    cat("  - ✅ model_data requirement met\n")

    tryCatch({
      # CRITICAL FIX: Use model_data() like original df_final()
      model_data_full <- model_results$model_data()
      cat("  - model_data_full obtained, class:", class(model_data_full), "\n")
      cat("  - model_data_full dims:", dim(model_data_full), "\n")

      namax <- names(model_data_full)  # Match original pattern
      cat("  - namax length:", length(namax), "\n")
      cat("  - namax sample:", paste(head(namax, 5), collapse=", "), "\n")

      sources <- unique(sapply(strsplit(namax, "_"), `[`, 1))
      cat("  - sources extracted, length:", length(sources), "\n")
      cat("  - sources:", paste(sources, collapse=", "), "\n")

      # Filter sources to only include columns that exist
      sources <- sources[sources %in% names(model_data_full)]
      cat("  - sources filtered to existing columns:", paste(sources, collapse=", "), "\n")

      if (length(sources) > 0) {
        datacorex <- model_data_full[, sources, drop = FALSE]
      } else {
        cat("  - ⚠️ No valid source columns found, using full data\n")
        datacorex <- model_data_full
      }
      cat("  - datacorex created, dims:", dim(datacorex), "\n")

      list_variabel <- konversi_ke_list_forecast(datacorex)
      cat("  - ✅ konversi_ke_list_forecast completed, list length:", length(list_variabel), "\n")
      cat("  - list_variabel names:", paste(names(list_variabel), collapse=", "), "\n")

      hasil_akurasiL <- loop_akurasi_forecast_list(list_variabel, makur = input$akurasi_forecastx)
      cat("  - ✅ loop_akurasi_forecast_list completed, result length:", length(hasil_akurasiL), "\n")

      hasil_akurasiL
    }, error = function(e) {
      cat("❌ ERROR [DF_FORECAST0]:", e$message, "\n")
      cat("  - Error details:", str(e), "\n")
      return(list())
    })
  })

  df_forecast1 <- eventReactive(input$forecastX, {
    cat("\n🔍 DEBUG [DF_FORECAST1]: Starting df_forecast1 reactive\n")
    cat("  - input$forecastX triggered:", input$forecastX, "\n")
    cat("  - input$jumlah_forecast:", input$jumlah_forecast %||% "NULL", "\n")

    req(model_results$model_data())
    cat("  - ✅ model_data requirement met\n")

    tryCatch({
      # CRITICAL FIX: Use model_data() like original df_final()
      model_data_full <- model_results$model_data()
      cat("  - model_data_full obtained, dims:", dim(model_data_full), "\n")

      namax <- names(model_data_full)  # Match original pattern
      cat("  - namax length:", length(namax), "\n")

      sources <- unique(sapply(strsplit(namax, "_"), `[`, 1))
      cat("  - sources extracted:", paste(sources, collapse=", "), "\n")

      # Filter sources to only include columns that exist
      sources <- sources[sources %in% names(model_data_full)]
      cat("  - sources filtered to existing columns:", paste(sources, collapse=", "), "\n")

      if (length(sources) > 0) {
        datacorex <- model_data_full[, sources, drop = FALSE]
      } else {
        cat("  - ⚠️ No valid source columns found, using full data\n")
        datacorex <- model_data_full
      }
      cat("  - datacorex created, dims:", dim(datacorex), "\n")

      list_variabel <- konversi_ke_list_forecast(datacorex)
      cat("  - ✅ konversi_ke_list_forecast completed\n")

      cat("  - Getting df_forecast0() result...\n")
      akurasi_result <- df_forecast0()
      cat("  - df_forecast0() obtained, class:", class(akurasi_result), "\n")

      hasil_forecastmetode <- forecast_dengan_metode_terbaik(list_variabel, akurasi_result, jf = input$jumlah_forecast)
      cat("  - ✅ forecast_dengan_metode_terbaik completed\n")

      hasilfulldf <- gabung_hasil_forecast(hasil_forecastmetode)
      cat("  - ✅ gabung_hasil_forecast completed, dims:", dim(hasilfulldf), "\n")

      hasilforecastgabung <- rbind(datacorex, hasilfulldf)
      cat("  - ✅ Final rbind completed, final dims:", dim(hasilforecastgabung), "\n")

      hasilforecastgabung
    }, error = function(e) {
      cat("❌ ERROR [DF_FORECAST1]:", e$message, "\n")
      cat("  - Error details:", str(e), "\n")
      return(data.frame(Error = paste("df_forecast1 failed:", e$message)))
    })
  })

  # =============================================================================
  # FORECAST EXECUTION
  # =============================================================================

  # CRITICAL FIX: Missing forecastxxx reactive function from original app15.R
  forecastxxx <- reactive({
    cat("\n🔍 DEBUG [FORECASTXXX]: Starting forecastxxx reactive\n")

    tryCatch({
      if(input$mevfore == 'MEV_Awal'){
        df <- transformed_result_forecast()
      } else if(input$mevfore == 'External_Data'){
        df <- datainputforecast()
      }

      req(df)
      cat("  - ✅ Forecast data obtained, dims:", dim(df), "\n")

      date_col <- names(df)[sapply(df, inherits, "Date")]
      if (length(date_col) == 0) {
        showNotification("Tidak ditemukan kolom bertipe Date di df.", type = "error")
        return(NULL)
      }

      date_col_name <- date_col[1]  # ambil kolom tanggal pertama yang terdeteksi
      names(df)[names(df) == date_col_name] <- "Date"

      # Ambil tanggal maksimum dari data awal
      model_data <- model_results$model_data()
      tanggal_terakhir_awal <- max(model_data[,1])

      # Filter data kedua agar hanya berisi data setelah tanggal terakhir di data_awal
      datafor <- subset(df, Date > tanggal_terakhir_awal)
      cat("  - ✅ forecastxxx completed, filtered rows:", nrow(datafor), "\n")
      return(datafor)

    }, error = function(e) {
      cat("❌ ERROR [FORECASTXXX]:", e$message, "\n")
      return(data.frame(Error = paste("forecastxxx failed:", e$message)))
    })
  })

  # Main forecast calculation
  hasilforecast <- eventReactive(input$runforecast, {
    cat("\n🔍 DEBUG [HASILFORECAST]: Starting main forecast calculation\n")
    cat("  - input$runforecast triggered:", input$runforecast, "\n")
    cat("  - input$model_forecast:", input$model_forecast %||% "NULL", "\n")
    cat("  - input$mevfore:", input$mevfore %||% "NULL", "\n")

    req(input$model_forecast, model_results$training_data())
    cat("  - ✅ Requirements met (model_forecast, training_data)\n")

    tryCatch({
      # Get forecast data source
      cat("  - Determining forecast data source...\n")
      if (input$mevfore == 'MEV_Awal') {
        cat("  - Using MEV_Awal (transformed_result_forecast)\n")
        df <- transformed_result_forecast()

        # Check if transformed_result_forecast is null or invalid
        if (is.null(df)) {
          cat("  - ⚠️ transformed_result_forecast is NULL, using df_forecast1\n")
          df <- df_forecast1()
        }
      } else if (input$mevfore == 'External_Data') {
        cat("  - Using External_Data (datainputforecast)\n")
        df <- datainputforecast()
      }

      req(df)
      cat("  - ✅ Forecast data obtained, class:", class(df), ", dims:", dim(df), "\n")

      # Try to find Date columns or Date-like columns
      date_col <- names(df)[sapply(df, inherits, "Date")]
      cat("  - Date columns found:", paste(date_col, collapse=", "), "\n")

      if (length(date_col) == 0) {
        # Try to detect Date columns by name patterns
        date_like_cols <- names(df)[grepl("date|Date|DATE|tanggal|Tanggal", names(df), ignore.case = TRUE)]
        cat("  - Date-like named columns found:", paste(date_like_cols, collapse=", "), "\n")

        if (length(date_like_cols) > 0) {
          # Try to convert first date-like column
          tryCatch({
            if (length(date_like_cols) > 0) {
              df[[date_like_cols[1]]] <- as.Date(df[[date_like_cols[1]]])
              date_col <- date_like_cols[1]
              cat("  - ✅ Successfully converted", date_like_cols[1], "to Date\n")
            }
          }, error = function(e) {
            cat("  - ⚠️ Failed to convert date-like column:", e$message, "\n")
          })
        }

        if (length(date_col) == 0) {
          # Try using first column as Date if it's not numeric
          if (ncol(df) > 0 && !is.numeric(df[[1]])) {
            tryCatch({
              df[[1]] <- as.Date(df[[1]])
              date_col <- names(df)[1]
              cat("  - ✅ Successfully converted first column", names(df)[1], "to Date\n")
            }, error = function(e) {
              cat("  - ⚠️ Failed to convert first column to Date:", e$message, "\n")
            })
          }
        }

        if (length(date_col) == 0) {
          cat("❌ ERROR: No Date columns found in forecast data\n")
          showNotification("Tidak ditemukan kolom bertipe Date di df.", type = "error")
          return(NULL)
        }
      }

      date_col_name <- date_col[1]
      names(df)[names(df) == date_col_name] <- "Date"
      cat("  - ✅ Date column renamed to 'Date'\n")

      # Get last date from original data
      model_data <- model_results$model_data()
      cat("  - model_data obtained for date comparison, dims:", dim(model_data), "\n")
      tanggal_terakhir_awal <- max(model_data[, 1])
      cat("  - Last date from original data:", tanggal_terakhir_awal, "\n")

      # Filter for future data only
      datafor <- subset(df, Date > tanggal_terakhir_awal)
      cat("  - ✅ Future data filtered, rows:", nrow(datafor), "\n")

      # Build regression model
      cat("  - Building regression model with formula:", input$model_forecast, "\n")
      training_data <- model_results$training_data()
      cat("  - Training data dims:", dim(training_data), "\n")
      finalmodel_lm <- lm(as.formula(input$model_forecast), data = training_data)
      cat("  - ✅ Regression model created\n")

      # Transform forecast data (CRITICAL FIX)
      cat("  - Transforming forecast data to match training data format...\n")
      cat("  - Original forecast data columns:", paste(names(datafor), collapse=", "), "\n")

      # Remove Date column temporarily for transformation
      date_vector <- datafor$Date
      datafor_no_date <- datafor[, !names(datafor) %in% "Date", drop = FALSE]

      # Apply same transformation as training data
      cat("  - Applying transform() function to forecast data...\n")
      datafor_transformed <- transform_data(datafor_no_date)
      cat("  - Transformed forecast data columns:", paste(names(datafor_transformed), collapse=", "), "\n")

      # Add Date back
      datafor_transformed$Date <- date_vector

      # Use transformed data for predictions
      datafor_final <- datafor_transformed

      # Make predictions
      cat("  - Making predictions with transformed data...\n")
      pred <- predict(finalmodel_lm, newdata = datafor_final, interval = "prediction")
      pred <- round(pred, 8)
      cat("  - ✅ Predictions completed, result dims:", dim(pred), "\n")

      # Combine results
      cat("  - Combining results...\n")
      hasil <- data.frame(
        Date = datafor$Date,
        Forecast = pred[, "fit"],
        Lower = pred[, "lwr"],
        Upper = pred[, "upr"]
      )
      cat("  - ✅ Results combined, final dims:", dim(hasil), "\n")

      return(hasil)
    }, error = function(e) {
      cat("❌ ERROR [HASILFORECAST]:", e$message, "\n")
      cat("  - Error details:", str(e), "\n")
      return(data.frame(Error = paste("Forecast calculation failed:", e$message)))
    })
  })

  # =============================================================================
  # FORECAST AVERAGE Y (Original: app34.R lines 2095-2142)
  # =============================================================================

  forecastaveragey <- eventReactive(input$runforaveragey, {
    req(finalmodel())

    if (input$mevfore == "MEV_Awal") {
      # Use transformed_result_forecast() if available, otherwise fallback to df_forecast1
      df <- transformed_result_forecast()
      if (is.null(df)) df <- df_forecast1()
    } else if (input$mevfore == "External_Data") {
      df <- datainputforecast()
    }

    req(df)

    date_col <- names(df)[sapply(df, inherits, "Date")]
    if (length(date_col) == 0) {
      showNotification("Tidak ditemukan kolom bertipe Date di data forecast.", type = "error")
      return(NULL)
    }

    date_col_name <- date_col[1]
    # Match original app34.R logic but with fixed typo (names(df) not names(df1))
    temp_df <- df
    names(temp_df)[names(temp_df) == date_col_name] <- "Date"

    # Ambil tanggal maksimum dari data awal
    model_data <- model_results$model_data()
    tanggal_terakhir_awal <- max(model_data[, 1])

    # Filter data kedua agar hanya berisi data setelah tanggal terakhir di data_awal
    datafor <- subset(temp_df, Date > tanggal_terakhir_awal)

    if (nrow(datafor) == 0) {
      showNotification("Tidak ada data forecast setelah tanggal terakhir data historis.", type = "warning")
      return(NULL)
    }

    # newdata() in app34.R corresponds to model_results$training_data()
    predictions <- predict_from_model_table_safe(
      model_tbl = finalmodel(),
      train_data = model_results$training_data(),
      new_data = datafor,
      formula_col = "Model"
    )

    predictions
  })

  output$table_forecastaveragey <- DT::renderDataTable({
    req(forecastaveragey())
    DT::datatable(forecastaveragey(), options = list(scrollX = TRUE))
  })

  averageygabmodel <- eventReactive(input$runforaveragey, {
    req(forecastaveragey())
    bbc <- add_average_forecast(forecast_df = forecastaveragey(), window_size = 12, unit = "Y")
    hasilbbc <- cbind(finalmodel(), bbc[, -1])
    hasilbbc
  })

  output$table_averageygabmodel <- DT::renderDataTable({
    req(averageygabmodel())
    DT::datatable(averageygabmodel(), options = list(scrollX = TRUE))
  })

  # Selected model information
  tabel_pemilihan_model_akhir <- eventReactive(input$runforecast, {
    # Validate inputs
    if (is.null(input$model_forecast) || input$model_forecast == "") {
      return(data.frame(
        Model = character(0),
        MAPEgabung = numeric(0),
        RMSEoutsample = numeric(0),
        normal_P = numeric(0),
        homogen_P = numeric(0),
        DW_P = numeric(0),
        VIF1 = numeric(0),
        VIF2 = numeric(0),
        VIF3 = numeric(0),
        stringsAsFactors = FALSE
      ))
    }

    # Get finalmodel data with validation
    finalmodel_data <- tryCatch({
      finalmodel()
    }, error = function(e) {
      return(NULL)
    })

    if (is.null(finalmodel_data) || nrow(finalmodel_data) == 0) {
      return(data.frame(
        Model = character(0),
        MAPEgabung = numeric(0),
        RMSEoutsample = numeric(0),
        normal_P = numeric(0),
        homogen_P = numeric(0),
        DW_P = numeric(0),
        VIF1 = numeric(0),
        VIF2 = numeric(0),
        VIF3 = numeric(0),
        stringsAsFactors = FALSE
      ))
    }

    # Filter model data
    datax <- finalmodel_data[finalmodel_data$Model == input$model_forecast, , drop = FALSE]

    # Ensure we return at least the column structure
    if (nrow(datax) == 0) {
      required_cols <- c("Model", "MAPEgabung", "RMSEoutsample", "normal_P", "homogen_P", "DW_P", "VIF1", "VIF2", "VIF3")
      missing_cols <- setdiff(required_cols, names(datax))
      for (col in missing_cols) {
        datax[[col]] <- numeric(0)
      }
    }

    return(datax)
  })

  # =============================================================================
  # OUTPUT RENDERS
  # =============================================================================

  # Render forecast summary
  output$summaryforecastx <- renderPrint({
    cat("\n🔍 DEBUG [SUMMARYFORECASTX]: Starting summary render\n")

    # Check if model data exists
    if (is.null(model_results$model_data()) ||
        is.null(try(model_results$model_data(), silent = TRUE))) {
      cat("  - ⚠️ No model data available for forecasting\n")
      return("📋 Tidak ada data model tersedia. Silakan upload data dan jalankan model terlebih dahulu.")
    }

    # Check if forecastX button has been clicked
    if (is.null(input$forecastX) || input$forecastX == 0) {
      cat("  - ⚠️ ForecastX button not clicked yet\n")
      return("📋 Klik tombol 'Forecast X' untuk memulai analisis forecasting.")
    }

    tryCatch({
      result <- df_forecast0()
      cat("  - ✅ df_forecast0() result obtained, class:", class(result), "\n")
      if(is.list(result)) {
        cat("  - Result is list, length:", length(result), "\n")
        if(length(result) == 0) {
          return("📋 Hasil forecast kosong. Pastikan data dan parameter sudah benar.")
        }
      } else if(is.data.frame(result)) {
        cat("  - Result is data.frame, dims:", dim(result), "\n")
        if(nrow(result) == 0) {
          return("📋 Hasil forecast kosong. Pastikan data dan parameter sudah benar.")
        }
      }
      result
    }, error = function(e) {
      cat("❌ ERROR [SUMMARYFORECASTX]:", e$message, "\n")
      return(paste("❌ Error dalam forecast summary:", e$message))
    })
  })

  # Render MEV historical table
  output$tabelfrommevhis <- DT::renderDataTable({
    cat("\n🔍 DEBUG [TABELFROMMEVHIS]: Starting MEV historical table render\n")

    # Check if model data exists
    if (is.null(model_results$model_data()) ||
        is.null(try(model_results$model_data(), silent = TRUE))) {
      cat("  - ⚠️ No model data available for MEV historical table\n")
      return(DT::datatable(
        data.frame(Status = "Tidak ada data model tersedia. Silakan upload data dan jalankan model terlebih dahulu."),
        options = list(scrollX = TRUE, dom = 't', paging = FALSE)
      ))
    }

    # Check if forecastX button has been clicked
    if (is.null(input$forecastX) || input$forecastX == 0) {
      cat("  - ⚠️ ForecastX button not clicked yet\n")
      return(DT::datatable(
        data.frame(Status = "Klik tombol 'Forecast X' untuk memulai analisis MEV historical."),
        options = list(scrollX = TRUE, dom = 't', paging = FALSE)
      ))
    }

    tryCatch({
      df <- df_forecast1()
      cat("  - ✅ df_forecast1() requirement met\n")
      cat("  - df obtained, class:", class(df), ", dims:", dim(df), "\n")

      # Check if df is valid
      if (is.null(df) || nrow(df) == 0) {
        cat("  - ⚠️ df_forecast1() returned empty data\n")
        return(DT::datatable(
          data.frame(Status = "Data forecast kosong. Pastikan data dan parameter sudah benar."),
          options = list(scrollX = TRUE, dom = 't', paging = FALSE)
        ))
      }

      cat("  - input$transform4:", input$transform4 %||% "NULL", "\n")

      if (input$transform4) {
        cat("  - Applying transformation...\n")
        Date <- df[, 1]
        df3x <- df[, -1]
        df3new <- transform_data(df3x)
        df3new <- cbind(Date, df3new)
        df3new <- na.omit(df3new)
        cat("  - ✅ Transformation completed, dims:", dim(df3new), "\n")

        transformed_result_forecast(df3new)
        DT::datatable(df3new, options = list(scrollX = TRUE))
      } else {
        cat("  - No transformation needed\n")
        transformed_result_forecast(df)
        return(DT::datatable(df, options = list(scrollX = TRUE)))
      }
    }, error = function(e) {
      cat("❌ ERROR [TABELFROMMEVHIS]:", e$message, "\n")
      return(DT::datatable(
        data.frame(Error = paste("Table render failed:", e$message)),
        options = list(scrollX = TRUE, dom = 't', paging = FALSE)
      ))
    })
  })

  # Render external forecast table
  output$forecasttable <- renderDT({
    req(datainputforecast())
    DT::datatable(datainputforecast(), options = list(scrollX = TRUE))
  })

  # Render forecast results
  output$dataforecast <- DT::renderDataTable({
    req(hasilforecast())
    DT::datatable(hasilforecast(), options = list(scrollX = TRUE))
  })

  # Render model selection results
  output$pemilihan_model_akhir <- renderDataTable({
    DT::datatable(tabel_pemilihan_model_akhir(), options = list(scrollX = TRUE))
  })

  # Note: table_backtest is rendered by model_server.R, not here

  # Render final model results
  output$table_finalmodel <- DT::renderDataTable({
    req(finalmodel())
    DT::datatable(finalmodel(), options = list(scrollX = TRUE))
  })

  # Render forecast plot
  output$plot_forecast <- renderPlotly({
    req(model_results$model_data(), hasilforecast(), input$y_var)

    df_actual <- model_results$model_data()

    # Detect date columns
    date_cols <- names(df_actual)[sapply(df_actual, function(x) inherits(x, "Date") || inherits(x, "POSIXt"))]
    if (length(date_cols) == 0) {
      showNotification("Kolom tanggal tidak ditemukan di data0()", type = "error")
      return(NULL)
    }
    date_col_actual <- date_cols[1]

    # Prepare actual data
    data_actual <- data.frame(
      Date = df_actual[[date_col_actual]],
      Actual = df_actual[[input$y_var]]
    )

    # Forecast results
    df_forecast <- hasilforecast()

    # Last actual point
    last_actual_point <- tail(data_actual, 1)

    # Combine for plot
    df_forecast_plot <- rbind(
      data.frame(Date = last_actual_point$Date,
                 Forecast = last_actual_point$Actual,
                 Lower = NA,
                 Upper = NA),
      df_forecast
    )

    # Create plot
    g <- ggplot() +
      geom_line(data = data_actual, aes(x = Date, y = Actual), color = "red", linewidth = 1) +
      geom_line(data = df_forecast_plot, aes(x = Date, y = Forecast), color = "deepskyblue4", linewidth = 1) +
      geom_ribbon(data = df_forecast, aes(x = Date, ymin = Lower, ymax = Upper), fill = "red", alpha = 0.2) +
      geom_vline(xintercept = min(df_forecast$Date), linetype = "dashed") +
      labs(title = paste(input$y_var, "by Month"),
           y = input$y_var,
           x = "Date") +
      theme_minimal() +
      scale_x_date(date_breaks = "6 months", date_labels = "%Y-%m") +
      theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
      scale_y_continuous()

    ggplotly(g) %>% layout(autosize = TRUE)
  })

  # =============================================================================
  # DOWNLOAD & SAVE HANDLERS
  # =============================================================================

  # Download all outputs as Excel
  output$download_all_outputs <- downloadHandler(
    filename = function() {
      paste0("Modeling_Forecasting_IFRS9_", format(Sys.time(), "%Y-%m-%d_%H-%M-%S"), ".xlsx")
    },
    content = function(file) {
      wb <- openxlsx::createWorkbook()

      # Add all relevant data frames to Excel sheets

      # Data Y awal
      openxlsx::addWorksheet(wb, "Data Y awal")
      tryCatch({
        openxlsx::writeData(wb, "Data Y awal", data_results$dependent_transformed())
      }, error = function(e) {
        cat("Error pada sheet 'Data Y awal':", e$message, "\n")
        openxlsx::writeData(wb, "Data Y awal", data.frame())
      })

      # Data full
      openxlsx::addWorksheet(wb, "Data full")
      tryCatch({
        openxlsx::writeData(wb, "Data full", model_results$joined_data())
      }, error = function(e) {
        cat("Error pada sheet 'Data full':", e$message, "\n")
        openxlsx::writeData(wb, "Data full", data.frame())
      })

      # Data Trained
      openxlsx::addWorksheet(wb, "Data Trained")
      tryCatch({
        openxlsx::writeData(wb, "Data Trained", model_results$training_data())
      }, error = function(e) {
        cat("Error pada sheet 'Data Trained':", e$message, "\n")
        openxlsx::writeData(wb, "Data Trained", data.frame(Note = "Data not available"))
      })

      # Final Model
      openxlsx::addWorksheet(wb, "Final Model")
      tryCatch({
        openxlsx::writeData(wb, "Final Model", finalmodel())
      }, error = function(e) {
        cat("Error pada sheet 'Final Model':", e$message, "\n")
        openxlsx::writeData(wb, "Final Model", data.frame(Note = "Data not available"))
      })

      # Model Akhir
      openxlsx::addWorksheet(wb, "Model Akhir")
      tryCatch({
        openxlsx::writeData(wb, "Model Akhir", tabel_pemilihan_model_akhir())
      }, error = function(e) {
        cat("Error pada sheet 'Model Akhir':", e$message, "\n")
        openxlsx::writeData(wb, "Model Akhir", data.frame(Note = "Data not available"))
      })

      # Forecast X
      openxlsx::addWorksheet(wb, "Forecast X")
      tryCatch({
        openxlsx::writeData(wb, "Forecast X", forecastxxx())
      }, error = function(e) {
        cat("Error pada sheet 'Forecast X':", e$message, "\n")
        openxlsx::writeData(wb, "Forecast X", data.frame())
      })

      # Forecast Y
      openxlsx::addWorksheet(wb, "Forecast Y")
      tryCatch({
        openxlsx::writeData(wb, "Forecast Y", hasilforecast())
      }, error = function(e) {
        cat("Error pada sheet 'Forecast Y':", e$message, "\n")
        openxlsx::writeData(wb, "Forecast Y", data.frame(Note = "Data not available"))
      })

      # Backtest Results
      if (!is.null(model_results$back_test)) {
        openxlsx::addWorksheet(wb, "Backtest")
        tryCatch({
          openxlsx::writeData(wb, "Backtest", model_results$back_test())
        }, error = function(e) {
          cat("Error pada sheet 'Backtest':", e$message, "\n")
          openxlsx::writeData(wb, "Backtest", data.frame(Note = "Data not available"))
        })
      }

      openxlsx::saveWorkbook(wb, file, overwrite = TRUE)
    }
  )

  # Save model to database
  observeEvent(input$save_model_db, {
    cat("\n🔍 DEBUG [SAVE_MODEL_DB]: Save model button clicked\n")

    # Validate model name first (needed for both online and offline modes)
    nm <- input$model_name_input
    if (is.null(nm)) nm <- ""
    nm <- gsub("^\\s+|\\s+$", "", nm)  # trim spaces
    cat("  - Model name input:", nm, "\n")

    if (nm == "") {
      cat("  - ❌ Model name is empty\n")
      showNotification("Nama model tidak boleh kosong.", type = "error")
      return()
    }
    if (nchar(nm) > 50) {
      cat("  - ❌ Model name too long:", nchar(nm), "characters\n")
      showNotification("Nama model terlalu panjang (maks 50 karakter).", type = "error")
      return()
    }

    # Check database connection first
    if (is.null(con)) {
      cat("❌ DEBUG [SAVE_MODEL_DB]: Database connection is NULL\n")
      showNotification("⚠️ Database tidak terhubung. Model akan disimpan secara lokal saja.", type = "warning")

      # Save to local file as fallback
      tryCatch({
        # Create local save directory
        local_dir <- file.path(tempdir(), "saved_models")
        if (!dir.exists(local_dir)) {
          dir.create(local_dir, recursive = TRUE)
        }

        # Create Excel file name
        timestamp <- format(Sys.time(), "%Y%m%d_%H%M%S")
        filename <- paste0("Model_", nm, "_", timestamp, ".xlsx")
        local_file <- file.path(local_dir, filename)

        # Create Excel workbook (simplified version)
        wb <- openxlsx::createWorkbook()
        openxlsx::addWorksheet(wb, "Final Model")

        if (!is.null(try(finalmodel(), silent = TRUE))) {
          openxlsx::writeData(wb, "Final Model", finalmodel())
        } else {
          openxlsx::writeData(wb, "Final Model", data.frame(Note = "Final model data not available"))
        }

        openxlsx::addWorksheet(wb, "Model Info")
        model_info <- data.frame(
          Model_Name = nm,
          Created_Date = Sys.time(),
          Status = "Saved Locally (Offline Mode)",
          File_Location = local_file
        )
        openxlsx::writeData(wb, "Model Info", model_info)

        openxlsx::saveWorkbook(wb, local_file, overwrite = TRUE)

        showNotification(paste("✅ Model berhasil disimpan secara lokal:", filename), type = "default")
        updateTextInput(session, "model_name_input", value = "")

        cat("✅ DEBUG [SAVE_MODEL_DB]: Model saved locally to:", local_file, "\n")
        return()

      }, error = function(e) {
        cat("❌ DEBUG [SAVE_MODEL_DB]: Local save failed:", e$message, "\n")
        showNotification(paste("❌ Gagal menyimpan model secara lokal:", e$message), type = "error")
        return()
      })
    }

    # Continue with database save (nm is already validated above)

    # Check for duplicate name in database
    tryCatch({
      dup <- dbGetQuery(
        con,
        'SELECT model_id
         FROM frs9_r_model_summary
         WHERE lower(model_name) = lower($1)
           AND id_deleted = FALSE
         LIMIT 1',
        params = list(nm)
      )

      if (nrow(dup) > 0) {
        showNotification(
          paste0("Nama model '", nm, "' sudah ada (ID=", dup$model_id[1], "). Gunakan nama lain."),
          type = "error"
        )
        return()
      }

      # Create Excel workbook with all data
      file_path <- tempfile(fileext = ".xlsx")
      wb <- openxlsx::createWorkbook()

      # Add all data frame results to Excel sheets with error handling
      openxlsx::addWorksheet(wb, "Data Y awal")
      tryCatch({
        openxlsx::writeData(wb, "Data Y awal", data_results$dependent_transformed())
      }, error = function(e) {
        cat("Error pada sheet 'Data Y awal':", e$message, "\n")
        openxlsx::writeData(wb, "Data Y awal", data.frame())
      })

      openxlsx::addWorksheet(wb, "Data full")
      tryCatch({
        openxlsx::writeData(wb, "Data full", model_results$joined_data())
      }, error = function(e) {
        cat("Error pada sheet 'Data full':", e$message, "\n")
        openxlsx::writeData(wb, "Data full", data.frame())
      })

      openxlsx::addWorksheet(wb, "Data Trained")
      tryCatch({
        openxlsx::writeData(wb, "Data Trained", model_results$training_data())
      }, error = function(e) {
        cat("Error pada sheet 'Data Trained':", e$message, "\n")
        openxlsx::writeData(wb, "Data Trained", data.frame())
      })

      openxlsx::addWorksheet(wb, "Intuisi")
      tryCatch({
        openxlsx::writeData(wb, "Intuisi", model_results$intuition_results())
      }, error = function(e) {
        cat("Error pada sheet 'Intuisi':", e$message, "\n")
        openxlsx::writeData(wb, "Intuisi", data.frame())
      })

      openxlsx::addWorksheet(wb, "Sign Intuisi")
      tryCatch({
        openxlsx::writeData(wb, "Sign Intuisi", model_results$sign_intuition())
      }, error = function(e) {
        cat("Error pada sheet 'Sign Intuisi':", e$message, "\n")
        openxlsx::writeData(wb, "Sign Intuisi", data.frame())
      })

      openxlsx::addWorksheet(wb, "Single Factor")
      tryCatch({
        openxlsx::writeData(wb, "Single Factor", model_results$single_factor_model())
      }, error = function(e) {
        cat("Error pada sheet 'Single Factor':", e$message, "\n")
        openxlsx::writeData(wb, "Single Factor", data.frame())
      })

      openxlsx::addWorksheet(wb, "Korelasi 2 Var")
      tryCatch({
        openxlsx::writeData(wb, "Korelasi 2 Var", model_results$correlation_2var())
      }, error = function(e) {
        cat("Error pada sheet 'Korelasi 2 Var':", e$message, "\n")
        openxlsx::writeData(wb, "Korelasi 2 Var", data.frame())
      })

      openxlsx::addWorksheet(wb, "Korelasi 3 Var")
      tryCatch({
        openxlsx::writeData(wb, "Korelasi 3 Var", model_results$correlation_3var())
      }, error = function(e) {
        cat("Error pada sheet 'Korelasi 3 Var':", e$message, "\n")
        openxlsx::writeData(wb, "Korelasi 3 Var", data.frame())
      })

      openxlsx::addWorksheet(wb, "Regresi 2 Var")
      tryCatch({
        openxlsx::writeData(wb, "Regresi 2 Var", model_results$regression_2var())
      }, error = function(e) {
        cat("Error pada sheet 'Regresi 2 Var':", e$message, "\n")
        openxlsx::writeData(wb, "Regresi 2 Var", data.frame())
      })

      openxlsx::addWorksheet(wb, "Regresi 3 Var")
      tryCatch({
        openxlsx::writeData(wb, "Regresi 3 Var", model_results$regression_3var())
      }, error = function(e) {
        cat("Error pada sheet 'Regresi 3 Var':", e$message, "\n")
        openxlsx::writeData(wb, "Regresi 3 Var", data.frame())
      })

      openxlsx::addWorksheet(wb, "Gabungan Model")
      tryCatch({
        openxlsx::writeData(wb, "Gabungan Model", model_results$combined_model())
      }, error = function(e) {
        cat("Error pada sheet 'Gabungan Model':", e$message, "\n")
        openxlsx::writeData(wb, "Gabungan Model", data.frame())
      })

      openxlsx::addWorksheet(wb, "Uji Asumsi")
      tryCatch({
        openxlsx::writeData(wb, "Uji Asumsi", model_results$assumption_test())
      }, error = function(e) {
        cat("Error pada sheet 'Uji Asumsi':", e$message, "\n")
        openxlsx::writeData(wb, "Uji Asumsi", data.frame())
      })

      openxlsx::addWorksheet(wb, "Backtest")
      tryCatch({
        openxlsx::writeData(wb, "Backtest", model_results$back_test())
      }, error = function(e) {
        cat("Error pada sheet 'Backtest':", e$message, "\n")
        openxlsx::writeData(wb, "Backtest", data.frame())
      })

      openxlsx::addWorksheet(wb, "Final Model")
      tryCatch({
        openxlsx::writeData(wb, "Final Model", finalmodel())
      }, error = function(e) {
        cat("Error pada sheet 'Final Model':", e$message, "\n")
        openxlsx::writeData(wb, "Final Model", data.frame())
      })

      openxlsx::addWorksheet(wb, "Model Akhir")
      tryCatch({
        openxlsx::writeData(wb, "Model Akhir", tabel_pemilihan_model_akhir())
      }, error = function(e) {
        cat("Error pada sheet 'Model Akhir':", e$message, "\n")
        openxlsx::writeData(wb, "Model Akhir", data.frame())
      })

      openxlsx::addWorksheet(wb, "Forecast X")
      tryCatch({
        openxlsx::writeData(wb, "Forecast X", forecastxxx())
      }, error = function(e) {
        cat("Error pada sheet 'Forecast X':", e$message, "\n")
        openxlsx::writeData(wb, "Forecast X", data.frame())
      })

      openxlsx::addWorksheet(wb, "Forecast Y")
      tryCatch({
        openxlsx::writeData(wb, "Forecast Y", hasilforecast())
      }, error = function(e) {
        cat("Error pada sheet 'Forecast Y':", e$message, "\n")
        openxlsx::writeData(wb, "Forecast Y", data.frame())
      })

      openxlsx::saveWorkbook(wb, file = file_path, overwrite = TRUE)

      if (!file.exists(file_path)) {
        showNotification("❌ File hasil workbook tidak ditemukan.", type = "error")
        return()
      }

      file_size <- file.info(file_path)$size
      if (is.na(file_size) || file_size == 0) {
        showNotification("❌ File Excel kosong atau gagal dibuat.", type = "error")
        return()
      }

      # Read file as raw binary
      raw_data <- tryCatch({
        con_file <- file(file_path, "rb")
        on.exit(close(con_file), add = TRUE)
        readBin(con_file, what = "raw", n = file.info(file_path)$size)
      }, error = function(e) {
        showNotification(paste("❌ Gagal membaca file sebagai raw:", e$message), type = "error")
        return(NULL)
      })

      if (is.null(raw_data) || !is.raw(raw_data) || length(raw_data) == 0) {
        showNotification("❌ Data file tidak valid untuk disimpan ke PostgreSQL.", type = "error")
        return()
      }

      cat("✅ raw_data type:", typeof(raw_data), "\n")
      cat("✅ raw_data length:", length(raw_data), "\n")

      # Get values from final model
      model_row <- tabel_pemilihan_model_akhir()
      r_squared <- if ("R_squared" %in% names(model_row)) model_row$R_squared else NA
      mape <- if ("MAPEgabung" %in% names(model_row)) model_row$MAPEgabung else NA
      dep_var <- model_results$namay()

      # Save to PostgreSQL
      tryCatch({
        query <- "
                INSERT INTO frs9_r_model_summary
                (model_name, model_status, dependent_variable, r_squared, mape, data_file, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                "

        stmt <- dbSendQuery(con, query)

        # Send parameters one by one
        dbBind(stmt, list(
          nm,
          "active",
          dep_var,
          r_squared,
          mape,
          I(list(raw_data)),  # wrap with I() + list() for binary
          Sys.getenv("USERNAME")
        ))

        dbClearResult(stmt)

        showNotification("✅ Model berhasil disimpan ke database.", type = "default")
        updateTextInput(session, "model_name_input", value = "")

      }, error = function(e) {
        showNotification(paste("❌ Gagal simpan model:", e$message), type = "error")
      })

    }, error = function(e) {
      showNotification(paste("❌ Error during save process:", e$message), type = "error")
    })
  })

  # Model summary table from database
  output$model_summary_table_DB <- renderDT({
    # If database connection doesn't exist, show empty table
    if (!exists("con") || is.null(con)) {
      return(DT::datatable(
        data.frame(
          Note = "Database tidak terhubung. Model tidak dapat ditampilkan."
        ),
        options = list(dom = 't', paging = FALSE)
      ))
    }

    # Try to fetch models from database
    tryCatch({
      models <- dbGetQuery(
        con,
        'SELECT model_id, model_name, created_date
         FROM frs9_r_model_summary
         WHERE id_deleted = FALSE
         ORDER BY created_date DESC
         LIMIT 100'
      )

      DT::datatable(models, options = list(scrollX = TRUE))

    }, error = function(e) {
      DT::datatable(
        data.frame(Error = paste("Gagal mengambil data model:", e$message)),
        options = list(dom = 't', paging = FALSE)
      )
    })
  })

  # Download plot as PNG
  output$downloadPlot <- downloadHandler(
    filename = function() {
      paste0("forecast_plot_", format(Sys.time(), "%Y%m%d_%H%M%S"), ".png")
    },
    content = function(file) {
      tryCatch({
        # Get the current plot
        req(model_results$model_data(), hasilforecast(), input$y_var)

        df_actual <- model_results$model_data()
        date_cols <- names(df_actual)[sapply(df_actual, function(x) inherits(x, "Date") || inherits(x, "POSIXt"))]
        if (length(date_cols) == 0) {
          stop("No date columns found")
        }
        date_col_actual <- date_cols[1]

        data_actual <- data.frame(
          Date = df_actual[[date_col_actual]],
          Actual = df_actual[[input$y_var]]
        )

        df_forecast <- hasilforecast()
        last_actual_point <- tail(data_actual, 1)

        df_forecast_plot <- rbind(
          data.frame(Date = last_actual_point$Date,
                     Forecast = last_actual_point$Actual,
                     Lower = NA,
                     Upper = NA),
          df_forecast
        )

        # Create ggplot
        g <- ggplot() +
          geom_line(data = data_actual, aes(x = Date, y = Actual), color = "red", linewidth = 1) +
          geom_line(data = df_forecast_plot, aes(x = Date, y = Forecast), color = "deepskyblue4", linewidth = 1) +
          geom_ribbon(data = df_forecast, aes(x = Date, ymin = Lower, ymax = Upper), fill = "red", alpha = 0.2) +
          geom_vline(xintercept = min(df_forecast$Date), linetype = "dashed") +
          labs(title = paste(input$y_var, "Forecast by Month"),
               y = input$y_var,
               x = "Date") +
          theme_minimal() +
          scale_x_date(date_breaks = "6 months", date_labels = "%Y-%m") +
          theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
          scale_y_continuous()

        # Save plot
        ggsave(file, plot = g, width = 12, height = 8, dpi = 300, device = "png")

      }, error = function(e) {
        # Create error plot if main plot fails
        g_error <- ggplot() +
          annotate("text", x = 0.5, y = 0.5, label = paste("Error creating plot:", e$message)) +
          theme_void()
        ggsave(file, plot = g_error, width = 8, height = 6, device = "png")
      })
    }
  )

  # =============================================================================
  # RETURN VALUES
  # =============================================================================

  return(list(
    forecast_results = hasilforecast,
    forecast_average_y = forecastaveragey,
    average_gab_model = averageygabmodel,
    final_model = finalmodel,
    filtered_models = final_filtered_data,
    backtest_results = model_results$back_test,
    forecast_data = reactive({
      if (input$mevfore == 'MEV_Awal') {
        transformed_result_forecast()
      } else {
        datainputforecast()
      }
    })
  ))
}

# =============================================================================
# END OF FORECAST SERVER MODULE
# =============================================================================
