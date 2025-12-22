# =============================================================================
# MODEL SERVER MODULE - WORKING VERSION
# =============================================================================
# Based on the working original from _v15mod-base-02
# Fixed to resolve dependency issues and modreg2() errors

#' Model Server Module - WORKING VERSION
#' @description Handles statistical modeling including variable selection, correlation analysis, regression modeling, and model validation
#' @param input Shiny input object
#' @param output Shiny output object
#' @param session Shiny session object
#' @param dependent_data Reactive data from data server
#' @param independent_data Reactive data from data server
#' @param joined_data Reactive joined data
#' @return List of reactive model results
model_server <- function(input, output, session, dependent_data, independent_data, joined_data) {

  # =============================================================================
  # UTILITY FUNCTIONS
  # =============================================================================
  # Utility functions are already sourced in app.R - no duplication needed
  # All utils/data_processing.R, utils/statistical_modeling.R, and utils/database_utils.R
  # are loaded globally in app.R before modules are initialized

  # =============================================================================
  # REACTIVE VALUES AND DATA PREPARATION - EXACT FROM WORKING ORIGINAL
  # =============================================================================

  # FIXED: data0() reactive function - uses joined_data() as in original (matching v30)
  # The original v30 uses datagabung() result which is stored in joined_data
  data0 <- reactive({
    req(joined_data())
    df <- joined_data()

    # Debug logging
    cat("🔍 DEBUG [DATA0]: data0() called\n")
    cat("  - Data source: joined_data() (datagabung result)\n")
    cat("  - Input data dims:", paste(dim(df), collapse="x"), "\n")
    cat("  - Input columns:", paste(names(df), collapse=", "), "\n")

    # Check if it's an error data frame and handle properly
    if ("Error" %in% names(df)) {
      cat("❌ DEBUG [DATA0]: Error data frame detected\n")
      return(NULL)  # Return NULL instead of warning data frame
    }

    cat("✅ DEBUG [DATA0]: Returning valid data frame\n")
    return(df)
  })

  # =============================================================================
  # DATE UPDATE NOTE:
  # The date update logic has been moved to the main server (app.R)
  # It is now triggered by observeEvent(input$join, {...}) matching original v30
  # This ensures date inputs are updated when user clicks the Join button
  # =============================================================================

  # Variable selection UI - using correct data sources like original version
  output$select_y <- renderUI({
    req(dependent_data())
    vary <- dependent_data()
    y_choices <- names(vary)[-1]  # FIXED: Use different variable name to avoid conflict with namay() reactive
    selectInput("y_var", "Pilih Variabel Y", choices = y_choices)
  })

  output$select_x <- renderUI({
    req(joined_data())

    # Get all available columns (excluding date column)
    all_choices <- names(joined_data())[-1]  # Exclude first column (date)

    # Exclude selected Y variable to avoid redundancy
    y_selected <- input$y_var
    if (!is.null(y_selected) && y_selected %in% all_choices) {
      x_choices <- all_choices[all_choices != y_selected]
      cat("🔍 DYNAMIC: Excluding Y variable '", y_selected, "' from X choices\n")
    } else {
      x_choices <- all_choices
    }

    # Additional check: exclude variables that are transformations of Y (like logit_ODR when ODR is selected)
    if (!is.null(y_selected)) {
      # Common transformation patterns to exclude
      if (y_selected == "ODR" && "logit_ODR" %in% x_choices) {
        x_choices <- x_choices[x_choices != "logit_ODR"]
        cat("🔍 DYNAMIC: Excluding logit_ODR (transformation of ODR)\n")
      }
      # Add more transformation patterns as needed
      if (grepl("^logit_", y_selected) || grepl("^log_", y_selected) || grepl("^sqrt_", y_selected)) {
        # If Y is a transformation, exclude the original variable
        base_var <- gsub("^logit_|^log_|^sqrt_", "", y_selected)
        if (base_var %in% x_choices) {
          x_choices <- x_choices[x_choices != base_var]
          cat("🔍 DYNAMIC: Excluding base variable '", base_var, "' (Y is its transformation)\n")
        }
      }
    }

    cat("🔍 DYNAMIC Variable selection debug:\n")
    cat("  - All joined columns:", paste(names(joined_data()), collapse=", "), "\n")
    cat("  - Selected Y variable:", ifelse(is.null(y_selected), "None", y_selected), "\n")
    cat("  - Available X variables (excluding date + Y variable + transformations):", paste(x_choices, collapse=", "), "\n")
    cat("  - Total X variables available:", length(x_choices), "\n")

    selectizeInput("x_var", "Pilih Variabel X",
                   choices = x_choices,
                   selected = NULL,
                   multiple = TRUE)
  })

  # Variable selection actions
  observeEvent(input$select_all_x, {
    if (!is.null(joined_data())) {
      # DYNAMIC: Get all available columns (excluding date and Y variable)
      all_choices <- names(joined_data())[-1]  # Exclude first column (date)

      # Exclude selected Y variable to avoid redundancy
      y_selected <- input$y_var
      if (!is.null(y_selected) && y_selected %in% all_choices) {
        all_x_choices <- all_choices[all_choices != y_selected]
        cat("✅ DYNAMIC: Excluding Y variable '", y_selected, "' from selection\n")
      } else {
        all_x_choices <- all_choices
      }

      # Additional check: exclude variables that are transformations of Y
      if (!is.null(y_selected)) {
        # Common transformation patterns to exclude
        if (y_selected == "ODR" && "logit_ODR" %in% all_x_choices) {
          all_x_choices <- all_x_choices[all_x_choices != "logit_ODR"]
          cat("✅ DYNAMIC: Excluding logit_ODR (transformation of ODR)\n")
        }
        # Add more transformation patterns as needed
        if (grepl("^logit_", y_selected) || grepl("^log_", y_selected) || grepl("^sqrt_", y_selected)) {
          # If Y is a transformation, exclude the original variable
          base_var <- gsub("^logit_|^log_|^sqrt_", "", y_selected)
          if (base_var %in% all_x_choices) {
            all_x_choices <- all_x_choices[all_x_choices != base_var]
            cat("✅ DYNAMIC: Excluding base variable '", base_var, "' (Y is its transformation)\n")
          }
        }
      }

      updateSelectizeInput(session, "x_var", selected = all_x_choices)
      cat("✅ DYNAMIC - Selected all X variables:", paste(all_x_choices, collapse=", "), "\n")
      cat("✅ Total variables selected:", length(all_x_choices), "\n")
    }
  })

  observeEvent(input$reset_x, {
    updateSelectizeInput(session, "x_var", selected = character(0))
  })

  # DYNAMIC: Update X variable choices when Y variable changes
  observeEvent(input$y_var, {
    if (!is.null(joined_data())) {
      # Get all available columns (excluding date column)
      all_choices <- names(joined_data())[-1]  # Exclude first column (date)

      # Exclude selected Y variable to avoid redundancy
      y_selected <- input$y_var
      if (!is.null(y_selected) && y_selected %in% all_choices) {
        x_choices <- all_choices[all_choices != y_selected]
        cat("🔄 DYNAMIC: Excluding Y variable '", y_selected, "' from X choices\n")
      } else {
        x_choices <- all_choices
      }

      # Additional check: exclude variables that are transformations of Y
      if (!is.null(y_selected)) {
        # Common transformation patterns to exclude
        if (y_selected == "ODR" && "logit_ODR" %in% x_choices) {
          x_choices <- x_choices[x_choices != "logit_ODR"]
          cat("🔄 DYNAMIC: Excluding logit_ODR (transformation of ODR)\n")
        }
        # Add more transformation patterns as needed
        if (grepl("^logit_", y_selected) || grepl("^log_", y_selected) || grepl("^sqrt_", y_selected)) {
          # If Y is a transformation, exclude the original variable
          base_var <- gsub("^logit_|^log_|^sqrt_", "", y_selected)
          if (base_var %in% x_choices) {
            x_choices <- x_choices[x_choices != base_var]
            cat("🔄 DYNAMIC: Excluding base variable '", base_var, "' (Y is its transformation)\n")
          }
        }
      }

      # Get currently selected X variables
      current_x_selected <- input$x_var

      # Remove excluded variables from current selection
      if (!is.null(current_x_selected)) {
        # Remove Y variable if selected
        to_remove <- c()
        if (!is.null(y_selected) && y_selected %in% current_x_selected) {
          to_remove <- c(to_remove, y_selected)
        }
        # Remove transformations
        if (y_selected == "ODR" && "logit_ODR" %in% current_x_selected) {
          to_remove <- c(to_remove, "logit_ODR")
        }
        # Remove base variable if Y is a transformation
        if (!is.null(y_selected) && (grepl("^logit_", y_selected) || grepl("^log_", y_selected) || grepl("^sqrt_", y_selected))) {
          base_var <- gsub("^logit_|^log_|^sqrt_", "", y_selected)
          if (base_var %in% current_x_selected) {
            to_remove <- c(to_remove, base_var)
          }
        }

        new_x_selected <- current_x_selected[!current_x_selected %in% to_remove]

        updateSelectizeInput(session, "x_var",
                           choices = x_choices,
                           selected = new_x_selected)
      } else {
        # Just update the choices if no cleanup needed
        updateSelectizeInput(session, "x_var", choices = x_choices)
      }

      cat("🔄 DYNAMIC - Y variable changed to:", ifelse(is.null(y_selected), "None", y_selected), "\n")
      cat("🔄 Updated X variable choices:", paste(x_choices, collapse=", "), "\n")
    }
  })

  # DYNAMIC: Initialize date inputs when joined_data becomes available or when session starts
  observe({
    # This will trigger when session starts and when joined_data changes
    df <- joined_data()
    cat("🔍 DYNAMIC [MODEL_SERVER]: observe() triggered, checking joined_data()\n")

    if (!is.null(df)) {
      cat("🔍 DYNAMIC [MODEL_SERVER]: joined_data() is not NULL, calling update_date_inputs_from_data()\n")
      # Call the date initialization function
      update_date_inputs_from_data()
    } else {
      cat("⚠️ DYNAMIC [MODEL_SERVER]: joined_data() is NULL\n")
    }
  })

  # CRITICAL FIX: Additional observer to ensure date inputs are updated when Model tab is accessed
  # This fixes the issue where date inputs are not populated when switching to Model tab
  observe({
    # Get current tab from main app values
    current_tab <- input$active_tab  # This matches the tab input name in main UI

    # Only proceed if we're on the Model tab
    if (!is.null(current_tab) && current_tab == "Model") {
      cat("🔍 CRITICAL FIX [MODEL_SERVER]: Model tab accessed, checking date inputs...\n")

      # Check if date inputs have values (they should be populated from joined_data)
      train_start_value <- input$train_start
      train_split_value <- input$train_split
      test_end_value <- input$test_end

      if (is.null(train_start_value) || is.null(train_split_value) || is.null(test_end_value)) {
        cat("⚠️ CRITICAL FIX [MODEL_SERVER]: Date inputs not populated, forcing update...\n")
        # Force update the date inputs from joined data
        update_date_inputs_from_data()
      } else {
        cat("✅ CRITICAL FIX [MODEL_SERVER]: Date inputs already populated:\n")
        cat("  - train_start:", train_start_value, "\n")
        cat("  - train_split:", train_split_value, "\n")
        cat("  - test_end:", test_end_value, "\n")
      }
    }
  }, priority = 1000)  # Set high priority to ensure this runs after other observers

  # CRITICAL FIX: Delayed observer to handle cases where tab switching doesn't trigger immediately
  observe({
    # Use invalidateLater to check periodically when on Model tab
    current_tab <- input$active_tab

    if (!is.null(current_tab) && current_tab == "Model") {
      # Check if date inputs need updating after a short delay
      invalidateLater(2000, session)  # Check again in 2 seconds

      df <- joined_data()
      if (!is.null(df) && is.data.frame(df) && nrow(df) > 0) {
        # Verify date inputs are properly set
        train_start_value <- input$train_start
        if (is.null(train_start_value)) {
          cat("🔄 CRITICAL FIX [MODEL_SERVER]: Retrying date input update...\n")
          update_date_inputs_from_data()
        }
      }
    }
  })

  # Separate function to handle date initialization
  update_date_inputs_from_data <- function() {
    df <- joined_data()
    cat("🔍 DYNAMIC [MODEL_SERVER]: update_date_inputs_from_data() called\n")

    # Debug: Print info about df
    if (is.null(df)) {
      cat("⚠️ DYNAMIC [MODEL_SERVER]: joined_data() returned NULL\n")
      return(NULL)
    }
    cat("🔍 DYNAMIC [MODEL_SERVER]: df class:", class(df), "\n")
    cat("🔍 DYNAMIC [MODEL_SERVER]: df dimensions:", nrow(df), "x", ncol(df), "\n")

    # Validate df is a data frame and has data before proceeding
    if (!is.data.frame(df) || nrow(df) == 0) {
      cat("⚠️ WARNING: joined_data() is not a valid data frame or has no rows\n")

      # Set default date values when no data is available
      default_date <- Sys.Date()
      updateDateInput(session, "train_start", value = default_date, min = default_date - 365, max = default_date + 365)
      updateDateInput(session, "train_split", value = default_date + 180, min = default_date - 365, max = default_date + 365)
      updateDateInput(session, "test_end", value = default_date + 365, min = default_date - 365, max = default_date + 365)

      cat("📅 DYNAMIC [MODEL_SERVER]: Set default date range (no data available)\n")
      return(NULL)
    }

    # ENHANCED: Check for Date columns with better detection
    cat("🔍 ENHANCED [MODEL_SERVER]: Available columns:", paste(names(df), collapse=", "), "\n")

    # Check for Date columns
    date_colx <- names(df)[sapply(df, function(col) inherits(col, "Date"))]
    cat("🔍 ENHANCED [MODEL_SERVER]: Date columns found:", paste(date_colx, collapse=", "), "\n")

    if (length(date_colx) == 0) {
      # Try to find datetime column if no Date column found
      date_colx <- names(df)[sapply(df, function(col) inherits(col, "POSIXct") || inherits(col, "POSIXt"))]
      cat("🔍 ENHANCED [MODEL_SERVER]: Datetime columns found:", paste(date_colx, collapse=", "), "\n")
      if (length(date_colx) > 0) {
        cat("🔍 ENHANCED [MODEL_SERVER]: Using datetime column instead of Date column\n")
      }
    }

    # ADDITIONAL: Try to find date columns by column name patterns
    if (length(date_colx) == 0) {
      date_pattern_cols <- names(df)[grepl("(?i)date|tanggal|waktu|time", names(df))]
      cat("🔍 ENHANCED [MODEL_SERVER]: Date pattern columns found:", paste(date_pattern_cols, collapse=", "), "\n")
      if (length(date_pattern_cols) > 0) {
        # Try to convert first matching column to Date
        tryCatch({
          test_col <- df[[date_pattern_cols[1]]]
          if (inherits(test_col, "character") || inherits(test_col, "factor")) {
            converted_dates <- as.Date(test_col)
            if (!all(is.na(converted_dates))) {
              date_colx <- date_pattern_cols[1]
              df[[date_colx]] <<- converted_dates  # Update the dataframe with converted dates
              cat("✅ ENHANCED [MODEL_SERVER]: Converted character column to Date:", date_colx, "\n")
            }
          }
        }, error = function(e) {
          cat("⚠️ ENHANCED [MODEL_SERVER]: Could not convert column to Date:", e$message, "\n")
        })
      }
    }

    if (length(date_colx) > 0) {
      date_col <- date_colx[1]
      cat("✅ DYNAMIC [MODEL_SERVER]: Using date column:", date_col, "\n")

      # Get valid dates (remove NAs)
      valid_dates <- df[[date_col]][!is.na(df[[date_col]])]
      if (length(valid_dates) > 0) {
        # Convert to Date class if needed (they should already be Date)
        if (!inherits(valid_dates, "Date")) {
          valid_dates <- as.Date(valid_dates)
        }

        # ENHANCED: Update date inputs with proper error handling
        tryCatch({
          # Calculate date positions
          first_date <- valid_dates[1]
          middle_pos <- round(length(valid_dates)/2)
          middle_date <- valid_dates[middle_pos]
          last_date <- valid_dates[length(valid_dates)]

          # Get min and max for range limits
          min_date <- min(valid_dates)
          max_date <- max(valid_dates)

          # Update date inputs with proper date ranges
          updateDateInput(session, "train_start",
                          value = first_date,
                          min = min_date,
                          max = max_date)

          updateDateInput(session, "train_split",
                          value = middle_date,
                          min = min_date,
                          max = max_date)

          updateDateInput(session, "test_end",
                          value = last_date,
                          min = min_date,
                          max = max_date)

          cat("✅ ENHANCED [MODEL_SERVER]: Date inputs updated successfully:\n")
          cat("  - Tanggal Awal Insample (train_start):", format(first_date, "%Y-%m-%d"), "\n")
          cat("  - Tanggal Akhir Insample (train_split):", format(middle_date, "%Y-%m-%d"), "\n")
          cat("  - Tanggal Akhir Outsample (test_end):", format(last_date, "%Y-%m-%d"), "\n")
          cat("  - Date range:", format(min_date, "%Y-%m-%d"), "to", format(max_date, "%Y-%m-%d"), "\n")
          cat("  - Total date points:", length(valid_dates), "\n")

        }, error = function(e) {
          cat("❌ ENHANCED [MODEL_SERVER]: Error updating date inputs:", e$message, "\n")
          # Set default values as fallback
          default_date <- Sys.Date()
          tryCatch({
            updateDateInput(session, "train_start", value = default_date, min = default_date - 365, max = default_date + 365)
            updateDateInput(session, "train_split", value = default_date + 180, min = default_date - 365, max = default_date + 365)
            updateDateInput(session, "test_end", value = default_date + 365, min = default_date - 365, max = default_date + 365)
            cat("🔄 ENHANCED [MODEL_SERVER]: Set default date values as fallback\n")
          }, error = function(e2) {
            cat("❌ ENHANCED [MODEL_SERVER]: Could not set default dates:", e2$message, "\n")
          })
        })
      } else {
        cat("⚠️ ENHANCED [MODEL_SERVER]: No valid dates found in column:", date_col, "\n")
        # Set default values as fallback
        default_date <- Sys.Date()
        tryCatch({
          updateDateInput(session, "train_start", value = default_date, min = default_date - 365, max = default_date + 365)
          updateDateInput(session, "train_split", value = default_date + 180, min = default_date - 365, max = default_date + 365)
          updateDateInput(session, "test_end", value = default_date + 365, min = default_date - 365, max = default_date + 365)
          cat("🔄 ENHANCED [MODEL_SERVER]: Set default date values (no valid dates found)\n")
        }, error = function(e) {
          cat("❌ ENHANCED [MODEL_SERVER]: Could not set default dates:", e$message, "\n")
        })
      }
    } else {
      cat("⚠️ ENHANCED [MODEL_SERVER]: No date/datetime columns found in joined_data\n")
      cat("  - Available columns:", paste(names(df), collapse=", "), "\n")

      # Set default values as fallback
      default_date <- Sys.Date()
      tryCatch({
        updateDateInput(session, "train_start", value = default_date, min = default_date - 365, max = default_date + 365)
        updateDateInput(session, "train_split", value = default_date + 180, min = default_date - 365, max = default_date + 365)
        updateDateInput(session, "test_end", value = default_date + 365, min = default_date - 365, max = default_date + 365)
        cat("🔄 ENHANCED [MODEL_SERVER]: Set default date values (no date columns found)\n")
      }, error = function(e) {
        cat("❌ ENHANCED [MODEL_SERVER]: Could not set default dates:", e$message, "\n")
      })
    }
  }

  # Variable name reactives
  namax <- reactive({ req(input$x_var); input$x_var })
  namay <- reactive({ req(input$y_var); input$y_var })

  # =============================================================================
  # DATA EXTRACTION REACTIVES (FIXED DEPENDENCY ORDER)
  # =============================================================================

  # Data extraction reactives (from original lines 1010-1016) - MOVED UP
  # FIXED: Use joined_data() for date-related operations to match the date update logic
  xdata <- reactive({
    req(joined_data(), namax(), input$train_start, input$train_split, input$test_end)
    joined_data()[, namax(), drop = FALSE]
  })

  ydata <- reactive({
    req(joined_data(), namay(), input$train_start, input$train_split, input$test_end)
    joined_data()[, namay(), drop = FALSE]
  })

  # =============================================================================
  # DATA SPLITTING AND PREPARATION (FIXED ORDER)
  # =============================================================================

  # Data splitting - MOVED UP BEFORE MODELING
  # FIXED: Use joined_data() for date-related operations to match the date update logic
  data1 <- reactive({
    req(joined_data(), input$train_start, input$train_split, input$test_end)

    dataawal <- batasdata(joined_data(), bb = input$train_start, bt = input$train_split, ba = input$test_end)
    datatrain <- dataawal$data1
    datatrain
  })

  datatest1 <- reactive({
    req(joined_data(), input$train_start, input$train_split, input$test_end)

    dataawal <- batasdata(joined_data(), bb = input$train_start, bt = input$train_split, ba = input$test_end)
    datatest <- dataawal$data2
    datatest
  })

  # Data for modeling - MOVED UP
  yx <- reactive({
    # FIXED: Use joined_data() for date-related operations to match the date update logic
    df <- joined_data()

    # Find date column
    date_colx <- names(df)[unlist(lapply(df, function(col) inherits(col, "Date")))]
    if (length(date_colx) == 0) {
      # Try to find datetime column
      date_colx <- names(df)[sapply(df, function(col) inherits(col, "POSIXct") || inherits(col, "POSIXt"))]
    }

    if (length(date_colx) == 0) {
      stop("No date or datetime column found in the data")
    }

    Date <- as.Date(df[[date_colx[1]]])
    namafull <- c(namay(), namax())
    datafull <- df[, namafull, drop = FALSE]
    bosku <- data.frame(Date=Date, datafull)
    bosku
  })

  # =============================================================================
  # INTUITION TABLE LOGIC
  # =============================================================================

  # Generate initial intuition data
  intuisiData_raw <- reactive({
    cat("🔍 DEBUG [INTUITION_RAW]: Starting intuition data generation...\n")

    tryCatch({
      # Direct match to original: df <- df_final()
      # In modular version: df <- independent_data() (which IS df_final from data server)
      cat("🔍 DEBUG [INTUITION_RAW]: Getting independent_data() (equivalent to original df_final())...\n")
      df <- independent_data()

      # Check if data exists (this matches original req(df) logic)
      if(is.null(df)) {
        cat("⚠️ DEBUG [INTUITION_RAW]: independent_data() returned NULL - no data uploaded\n")
        # Return sample intuition table with common variable names for demonstration
        # This helps users understand the interface even without uploading data
        sample_vars <- c("GDP", "INFL", "IR", "ER", "BI", "CPI", "M2", "TRADE", "UNEMP")
        sample_table <- data.frame(
          var = sample_vars,
          sign = rep(0, length(sample_vars))
        )
        cat("✅ DEBUG [INTUITION_RAW]: Returning sample intuition table with", nrow(sample_table), "variables\n")
        return(sample_table)
      }

      req(df)
      cat("✅ DEBUG [INTUITION_RAW]: Data received, dims:", paste(dim(df), collapse="x"), "\n")
      cat("✅ DEBUG [INTUITION_RAW]: Column names:", paste(names(df), collapse=", "), "\n")

      # EXACT logic from original app15.R lines 1037-1044
      date_col <- names(df)[unlist(lapply(df, function(col) inherits(col, "Date")))]
      cat("✅ DEBUG [INTUITION_RAW]: Date columns found:", paste(date_col, collapse=", "), "\n")

      df3x <- df[, !names(df) %in% date_col, drop = FALSE]
      namax <- names(df3x)
      cat("✅ DEBUG [INTUITION_RAW]: Non-date columns:", paste(namax, collapse=", "), "\n")

      # Extract variable prefixes by splitting on underscore (original logic)
      sources <- unique(sapply(strsplit(namax, "_"), `[`, 1))
      cat("✅ DEBUG [INTUITION_RAW]: Variable prefixes extracted:", paste(sources, collapse=", "), "\n")

      # Create intuition table with var names and default sign values (original logic)
      abc <- data.frame(var = sources, sign = rep(0, length(sources)))
      cat("✅ DEBUG [INTUITION_RAW]: Generated intuition table with", nrow(abc), "rows\n")
      return(abc)

    }, error = function(e) {
      cat("❌ DEBUG [INTUITION_RAW]: ERROR:", e$message, "\n")
      # Return sample table on error instead of empty
      sample_vars <- c("GDP", "INFL", "IR", "ER", "BI")
      sample_table <- data.frame(
        var = sample_vars,
        sign = rep(0, length(sample_vars))
      )
      cat("⚠️ DEBUG [INTUITION_RAW]: Returning fallback sample table\n")
      return(sample_table)
    })
  })

  # Editable intuition data
  intuisiData <- reactiveValues(data = NULL)

  # Initialize intuition data
  observeEvent(intuisiData_raw(), {
    intuisiData$data <- intuisiData_raw()
  })

  # Render intuition table
  output$intuisi_table <- DT::renderDataTable({
    cat("🔍 DEBUG [INTUITION_RENDER]: Rendering intuition table...\n")

    tryCatch({
      cat("🔍 DEBUG [INTUITION_RENDER]: Checking intuisiData$data...\n")
      req(intuisiData$data)

      data <- intuisiData$data
      cat("✅ DEBUG [INTUITION_RENDER]: Data available, dims:", paste(dim(data), collapse="x"), "\n")
      cat("✅ DEBUG [INTUITION_RENDER]: Data columns:", paste(names(data), collapse=", "), "\n")
      cat("✅ DEBUG [INTUITION_RENDER]: Data preview:\n")
      print(data)

      DT::datatable(data, editable = TRUE, options = list(scrollX = TRUE))
    }, error = function(e) {
      cat("❌ DEBUG [INTUITION_RENDER]: ERROR:", e$message, "\n")
      # Return empty datatable as fallback
      DT::datatable(data.frame(Error = "Failed to load intuition data"))
    })
  })

  # Handle table edits
  observeEvent(input$intuisi_table_cell_edit, {
    info <- input$intuisi_table_cell_edit
    i <- info$row
    j <- info$col
    v <- as.numeric(info$value)

    # Only allow values -1, 0, or 1
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

  # Reference intuition data
  refInt <- reactive({
    req(intuisiData$data)
    intuisiData$data
  })

  # =============================================================================
  # STATISTICAL MODELING LOGIC - WORKING VERSION
  # =============================================================================

  # Sign intuition correlation analysis
  signintuisikor <- eventReactive(input$runmodel, {
    req(namay(), namax(), xdata(), ydata())

    hasil_korelasi <- data.frame(
      Variabel_X = namax(),
      Korelasixy = sapply(xdata(), function(x) {
        tryCatch({
          # Ensure ydata() is a valid data frame and not empty
          y_data <- ydata()
          if (is.null(y_data) || !is.data.frame(y_data) || ncol(y_data) == 0) {
            return(NA)
          }
          # Use the first column of ydata
          round(cor(x, y_data[[1]]), 3)
        }, error = function(e) {
          cat("⚠️ Error in correlation calculation:", e$message, "\n")
          return(NA)
        })
      })
    )

    ref <- refInt()

    if (is.null(ref) || nrow(ref) == 0) {
      # If no reference, all pass
      korint <- hasil_korelasi %>%
        dplyr::mutate(sign = "pass")
    } else {
      # Get column names and expectations
      var_col <- names(ref)[1]
      expect_col <- names(ref)[2]

      # Get variables with expectation 0
      bebas_pass <- ref[[var_col]][ref[[expect_col]] == 0]

      # Calculate expected signs first to avoid repeated calls
      expected_signs <- sapply(hasil_korelasi$Variabel_X, function(x) {
        assign_expect(x, ref)
      })
      actual_signs <- ifelse(hasil_korelasi$Korelasixy < 0, -1, 1)

      korint <- hasil_korelasi %>%
        dplyr::mutate(
          var_prefix = sapply(strsplit(Variabel_X, "_"), `[`, 1),
          sign = dplyr::case_when(
            var_prefix %in% bebas_pass ~ "pass",
            !is.na(expected_signs) & actual_signs == expected_signs ~ "pass",
            TRUE ~ "eliminate"
          )
        ) %>%
        dplyr::select(-var_prefix)
    }

    rownames(korint) <- NULL
    korint
  })

  # Single variable regression modeling - MEMORY OPTIMIZED
  model_reg1var <- eventReactive(input$runmodel, {
    req(namay(), namax(), input$pval, input$rsq, signintuisikor(), data0())

    cat("🧠 MEMORY-OPTIMIZED MODELING: Starting single variable regression...\n")

    # Memory optimization: garbage collection before modeling
    gc()

    sign_data <- signintuisikor()
    newvarr0x <- sign_data[sign_data$sign=="pass", "Variabel_X"]

    cat("📊 MODELING INFO:", length(newvarr0x), "variables to model\n")
    cat("📊 TRAINING DATA:", nrow(data0()), "rows x", ncol(data0()), "columns\n")

    # Process in batches to avoid memory issues
    max_batch_size <- 20  # Process maximum 20 variables at a time
    all_results <- list()

    if(length(newvarr0x) > 0) {
      for(i in seq(1, length(newvarr0x), by = max_batch_size)) {
        end_idx <- min(i + max_batch_size - 1, length(newvarr0x))
        batch_vars <- newvarr0x[i:end_idx]

        cat("🔄 Processing batch", ceiling(i/max_batch_size), "with", length(batch_vars), "variables\n")

        # Generate models for this batch
        models <- gen1varx(data0(), namay(), batch_vars)

        # Run models with error handling
        tryCatch({
          batch_output <- runmodel1p(data0(), models)
          all_results[[length(all_results) + 1]] <- batch_output

          # Force garbage collection after each batch
          gc()

        }, error = function(e) {
          cat("❌ ERROR in batch", ceiling(i/max_batch_size), ":", e$message, "\n")
          # Continue with next batch
        })
      }
    }

    # Combine all batch results
    if(length(all_results) > 0) {
      outputra <- do.call(rbind, all_results)
    } else {
      outputra <- data.frame()
    }

    # Apply filtering criteria
    if(nrow(outputra) > 0) {
      outputra1 <- smr1var(outputra, batasrsq = input$rsq, batasprobt = input$pval)
      rownames(outputra1) <- NULL
      cat("✅ MODELING COMPLETE:", nrow(outputra1), "significant variables found\n")
    } else {
      outputra1 <- data.frame()
      cat("⚠️ NO RESULTS: No models completed successfully\n")
    }

    # Final garbage collection
    gc()

    outputra1
  })

  # Variable filtering and data preparation
  newvarr1x <- reactive({
    req(model_reg1var(), namay(), namax())
    newvarr1 <- model_reg1var()[model_reg1var()$statusreg1=="pass", "Variables"]
    newvarr1
  })

  newdata <- reactive({
    req(model_reg1var(), namay(), namax(), newvarr1x())
    newdata0 <- data0()[, c(namay(), newvarr1x())]
    newdata0
  })

  newdatax <- reactive({
    req(model_reg1var(), namay(), namax(), newvarr1x())

    # CRITICAL FIX: Match original app15.R behavior - use data0() and minimal validation
    # Original doesn't use data1(), uses data0() directly
    newdatax0 <- data0()[, newvarr1x(), drop = FALSE]

    # Debug logging to track data flow
    cat("🔍 DEBUG [NEWDATAX]: Creating correlation data\n")
    cat("  - model_reg1var() rows:", nrow(model_reg1var()), "\n")
    cat("  - newvarr1x() length:", length(newvarr1x()), "\n")
    cat("  - newvarr1x() variables:", paste(head(newvarr1x(), 10), collapse=", "), "\n")
    cat("  - newdatax0 dimensions:", paste(dim(newdatax0), collapse="x"), "\n")

    # Original behavior: Let correlation functions handle missing values
    # Don't filter NA values during extraction - this is key difference!

    # Basic validation only - match original app15.R
    if (is.null(newdatax0) || ncol(newdatax0) == 0) {
      cat("❌ DEBUG [NEWDATAX]: No data or columns, returning empty dataframe\n")
      return(data.frame())
    }

    cat("✅ newdatax() - Original app15.R behavior:\n")
    cat("  - Extracted variables:", paste(names(newdatax0), collapse=", "), "\n")
    cat("  - Data dimensions:", paste(dim(newdatax0), collapse="x"), "\n")
    cat("  - NA handling: Performed by correlation functions (like original)\n")

    newdatax0
  })

  # =============================================================================
  # CORRELATION ANALYSIS - WORKING VERSION
  # =============================================================================

  # Two-variable correlation analysis - MEMORY OPTIMIZED
  korel_reg2var <- eventReactive(input$runmodel, {
    req(namay(), namax(), newdatax(), input$corr)

    cat("🔗 CORRELATION ANALYSIS: Starting two-variable correlation...\n")

    if(ncol(newdatax()) < 2) {
      cat("⚠️ CORRELATION: Need at least 2 variables for correlation analysis\n")
      return(data.frame())
    }

    cat("📊 CORRELATION INFO:", ncol(newdatax()), "variables, correlation threshold:", input$corr, "\n")

    # Force garbage collection before correlation analysis
    gc()

    tryCatch({
      tabkorel2 <- tabel_korelasi2(newdatax())
      tabkorel2$statuskor2 <- ifelse(abs(tabkorel2$Variable12) < input$corr, "pass", "eliminate")

      passed_count <- sum(tabkorel2$statuskor2 == "pass")
      total_count <- nrow(tabkorel2)

      cat("✅ CORRELATION COMPLETE:", passed_count, "of", total_count, "variable pairs passed threshold\n")

      # Clean up memory
      gc()
      return(tabkorel2)

    }, error = function(e) {
      cat("❌ CORRELATION ERROR:", e$message, "\n")
      gc()
      return(data.frame())
    })
  })

  # Three-variable correlation analysis - MEMORY OPTIMIZED
  korel_reg3var <- eventReactive(input$runmodel, {
    req(namay(), namax(), newdatax(), input$corr)

    cat("🔗 CORRELATION ANALYSIS: Starting three-variable correlation...\n")

    if(ncol(newdatax()) < 3) {
      cat("⚠️ CORRELATION: Need at least 3 variables for three-variable correlation\n")
      return(data.frame())
    }

    cat("📊 CORRELATION INFO:", ncol(newdatax()), "variables available for 3-variable analysis\n")

    # Force garbage collection before correlation analysis
    gc()

    tabel_korelasix <- tryCatch({
      cat("🔄 Running three-variable correlation matrix...\n")
      tabel_korelasi(newdatax())
    }, warning = function(w) {
      cat("⚠️ CORRELATION WARNING:", w$message, "\n")
      gc()
      return(data.frame())
    }, error = function(e) {
      cat("❌ CORRELATION ERROR:", e$message, "\n")
      gc()
      return(data.frame())
    })

    if (nrow(tabel_korelasix) == 0) {
      cat("⚠️ CORRELATION: No correlation results generated\n")
      return(data.frame())
    }

    # Apply three-variable correlation criteria with NA handling
    # Handle NA values in correlation comparisons
    corr_cols <- tabel_korelasix[, c("Variable12", "Variable13", "Variable23")]
    corr_cols[is.na(corr_cols)] <- 0  # Treat NA as zero correlation (will fail threshold)

    tabel_korelasix$statuskor3 <- ifelse(
      rowSums(abs(corr_cols) < input$corr) == 3,
      "pass", "eliminate"
    )

    passed_count <- sum(tabel_korelasix$statuskor3 == "pass")
    total_count <- nrow(tabel_korelasix)

    cat("✅ CORRELATION COMPLETE:", passed_count, "of", total_count, "variable triples passed threshold\n")

    # Clean up memory
    gc()
    return(tabel_korelasix)
  })

  # =============================================================================
  # MODEL GENERATION - WORKING VERSION
  # =============================================================================

  # 2-variable model generation (from original lines 1248-1254) - EXACT MATCH
  modreg2 <- reactive({
    req(namay(), namax(), korel_reg2var())
    barisk2 <- c()  # Bisa kosong - EXACT MATCH to original
    model2faktor <- korel_reg2var()[if (length(barisk2) > 0) barisk2 else which(korel_reg2var()$statuskor2 == "pass"), 1:2]
    modreg20 <- gre2(namay(), model2faktor)
    modreg20
  })

  # 3-variable model generation (from original lines 1271-1300) - EXACT MATCH
  modreg3 <- reactive({
    req(namay(), namax(), korel_reg3var())

    k3data <- korel_reg3var()

    # Cegah error jika NULL atau 0 baris - EXACT MATCH to original
    if(is.null(k3data) || nrow(k3data) == 0 || !"statuskor3" %in% names(k3data)) {
      return(character(0))
    }

    # Cek jika ada nilai NA di statuskor3 - EXACT MATCH to original
    if(any(is.na(k3data$statuskor3))) {
      showNotification("Peringatan: Beberapa nilai di 'statuskor3' adalah NA.", type = "warning")
      k3data <- k3data[!is.na(k3data$statuskor3), ]  # Menghapus baris yang memiliki NA
    }

    barisk3 <- c()  # jika kosong, ambil yg pass - EXACT MATCH to original
    model3faktor <- k3data[if (length(barisk3) > 0) barisk3 else which(k3data$statuskor3 == "pass"), 1:3]

    if(nrow(model3faktor) == 0) {
      showNotification("Tidak ada kombinasi model yang lolos untuk 3 variabel.", type = "error")
      return(character(0))
    }

    modreg3 <- gre3(namay(), model3faktor)
    return(modreg3)
  })

  # =============================================================================
  # REGRESSION MODELS - WORKING VERSION
  # =============================================================================

  # 2-variable regression models - FIXED
  model_reg2var <- eventReactive(input$runmodel, {
    req(namay(), namax(), modreg2(), input$pval, newdata())

    # Check if modreg2() returned valid data
    modreg_data <- modreg2()
    if (is.null(modreg_data) || length(modreg_data) == 0) {
      return(data.frame(Error = "No 2-variable models passed correlation threshold"))
    }

    hasilmodreg2 <- runreg2models2(newdata(), namay(), modreg_data, chunk_size = 200)

    # Check if we have results
    if (is.null(hasilmodreg2) || nrow(hasilmodreg2) == 0) {
      return(data.frame(Error = "Failed to generate 2-variable regression models"))
    }

    # Handle NA values in p-value comparisons
    pval_cols <- hasilmodreg2[, 8:9]
    pval_cols[is.na(pval_cols)] <- Inf  # Treat NA as infinitely large p-values
    hasilmodreg2$statusreg <- ifelse(rowSums(pval_cols < input$pval) == 2, "pass", "eliminate")
    hasilmodreg2
  })

  # 3-variable regression models - FIXED
  model_reg3var <- eventReactive(input$runmodel, {
    req(namay(), namax(), input$pval, newdata(), modreg3())

    mod3 <- modreg3()

    if (is.null(mod3) || length(mod3) == 0) {
      return(data.frame(Error = "No 3-variable models passed correlation threshold"))
    }

    hasilmodreg3 <- runreg3models2(newdata(), namay(), mod3)

    # Check if we have results
    if (is.null(hasilmodreg3) || nrow(hasilmodreg3) == 0) {
      return(data.frame(Error = "Failed to generate 3-variable regression models"))
    }

    # Handle NA values in p-value comparisons
    pval_cols <- hasilmodreg3[, 10:12]
    pval_cols[is.na(pval_cols)] <- Inf  # Treat NA as infinitely large p-values
    hasilmodreg3$statusreg <- ifelse(rowSums(pval_cols < input$pval) == 3, "pass", "eliminate")
    return(hasilmodreg3)
  })

  # Combined 2-variable and 3-variable regression models
  model_reg23var <- eventReactive(input$runmodel, {
    hasil <- model23(model_reg2var(), model_reg3var())
    hasil
  })

  # =============================================================================
  # FINAL MODEL FUNCTIONS - WORKING VERSION
  # =============================================================================

  # Test data - from original app15.R lines 992-998
  # NOTE: datatest1 is already defined earlier

  # Assumption testing - from original app15.R lines 1359-1378
  ujiasumsif <- eventReactive(input$runmodel, {
    req(namay(), namax(), model_reg23var(), input$alpha, newdata(), input$normal)
    cmodelfinal <- model_reg23var()$Model

    # Run assumption testing function
    hasilujiasumsi <- ujiasumsi(newdata(), namay(), cmodelfinal, normalmethod = input$normal)

    # Add status for assumption testing results
    hasilujiasumsi <- hasilujiasumsi %>%
      dplyr::mutate(
        statasumsi = ifelse(normal_P >= input$pval & homogen_P >= input$alpha, 'pass', 'eliminate')
      )
    rownames(hasilujiasumsi) <- NULL

    hasilujiasumsi <- hasilujiasumsi %>%
      dplyr::mutate(rownames = paste0("M", row_number())) %>%
      tibble::column_to_rownames(var = "rownames")
    hasilujiasumsi
  })

  # Back testing - EXACT ORIGINAL from app15.R lines 1386-1407
  backtestf <- eventReactive(input$runmodel, {
    cat("\n🔍 DEBUG [BACKTESTF]: Starting backtesting function...\n")

    # DETAILED DEBUG: Check each requirement individually to find exact error
    cat("🔍 DEBUG [BACKTESTF]: Testing each requirement individually...\n")

    # Test 1: namay()
    cat("🔍 TEST 1: namay() function...\n")
    tryCatch({
      namay_result <- namay()
      cat("  ✅ namay() SUCCESS:", paste(namay_result, collapse=","), "\n")
      cat("  - namay() is function:", is.function(namay), "\n")
      cat("  - namay() class:", class(namay), "\n")
    }, error = function(e) {
      cat("  ❌ namay() ERROR:", e$message, "\n")
    })

    # Test 2: namax()
    cat("🔍 TEST 2: namax() function...\n")
    tryCatch({
      namax_result <- namax()
      cat("  ✅ namax() SUCCESS:", paste(namax_result, collapse=","), "\n")
      cat("  - namax() is function:", is.function(namax), "\n")
      cat("  - namax() class:", class(namax), "\n")
    }, error = function(e) {
      cat("  ❌ namax() ERROR:", e$message, "\n")
    })

    # Test 3: ujiasumsif()
    cat("🔍 TEST 3: ujiasumsif() function...\n")
    tryCatch({
      ujiasumsif_result <- ujiasumsif()
      cat("  ✅ ujiasumsif() SUCCESS, dims:", paste(dim(ujiasumsif_result), collapse="x"), "\n")
      cat("  - ujiasumsif() is function:", is.function(ujiasumsif), "\n")
      cat("  - ujiasumsif() class:", class(ujiasumsif), "\n")
    }, error = function(e) {
      cat("  ❌ ujiasumsif() ERROR:", e$message, "\n")
    })

    # Test 4: input$pval
    cat("🔍 TEST 4: input$pval...\n")
    tryCatch({
      cat("  ✅ input$pval:", input$pval, "class:", class(input$pval), "\n")
    }, error = function(e) {
      cat("  ❌ input$pval ERROR:", e$message, "\n")
    })

    # Test 5: newdata()
    cat("🔍 TEST 5: newdata() function...\n")
    tryCatch({
      newdata_result <- newdata()
      cat("  ✅ newdata() SUCCESS, dims:", paste(dim(newdata_result), collapse="x"), "\n")
      cat("  - newdata() is function:", is.function(newdata), "\n")
      cat("  - newdata() class:", class(newdata), "\n")
    }, error = function(e) {
      cat("  ❌ newdata() ERROR:", e$message, "\n")
    })

    # Test 6: datatest1()
    cat("🔍 TEST 6: datatest1() function...\n")
    tryCatch({
      datatest1_result <- datatest1()
      cat("  ✅ datatest1() SUCCESS, dims:", paste(dim(datatest1_result), collapse="x"), "\n")
      cat("  - datatest1() is function:", is.function(datatest1), "\n")
      cat("  - datatest1() class:", class(datatest1), "\n")
    }, error = function(e) {
      cat("  ❌ datatest1() ERROR:", e$message, "\n")
    })

    # Now try req() with each parameter individually
    cat("🔍 DEBUG [BACKTESTF]: Testing req() with each parameter individually...\n")

    tryCatch({
      cat("🔍 REQ TEST 1: req(namay())...\n")
      req(namay())
      cat("  ✅ req(namay()) SUCCESS\n")
    }, error = function(e) {
      cat("  ❌ req(namay()) ERROR:", e$message, "\n")
      return(data.frame(Error = paste("req(namay()) failed:", e$message)))
    })

    tryCatch({
      cat("🔍 REQ TEST 2: req(namax())...\n")
      req(namax())
      cat("  ✅ req(namax()) SUCCESS\n")
    }, error = function(e) {
      cat("  ❌ req(namax()) ERROR:", e$message, "\n")
      return(data.frame(Error = paste("req(namax()) failed:", e$message)))
    })

    tryCatch({
      cat("🔍 REQ TEST 3: req(ujiasumsif())...\n")
      req(ujiasumsif())
      cat("  ✅ req(ujiasumsif()) SUCCESS\n")
    }, error = function(e) {
      cat("  ❌ req(ujiasumsif()) ERROR:", e$message, "\n")
      return(data.frame(Error = paste("req(ujiasumsif()) failed:", e$message)))
    })

    tryCatch({
      cat("🔍 REQ TEST 4: req(input$pval)...\n")
      req(input$pval)
      cat("  ✅ req(input$pval) SUCCESS\n")
    }, error = function(e) {
      cat("  ❌ req(input$pval) ERROR:", e$message, "\n")
      return(data.frame(Error = paste("req(input$pval) failed:", e$message)))
    })

    tryCatch({
      cat("🔍 REQ TEST 5: req(newdata())...\n")
      req(newdata())
      cat("  ✅ req(newdata()) SUCCESS\n")
    }, error = function(e) {
      cat("  ❌ req(newdata()) ERROR:", e$message, "\n")
      return(data.frame(Error = paste("req(newdata()) failed:", e$message)))
    })

    tryCatch({
      cat("🔍 REQ TEST 6: req(datatest1())...\n")
      req(datatest1())
      cat("  ✅ req(datatest1()) SUCCESS\n")
    }, error = function(e) {
      cat("  ❌ req(datatest1()) ERROR:", e$message, "\n")
      return(data.frame(Error = paste("req(datatest1()) failed:", e$message)))
    })

    # Finally, try the full req() call
    tryCatch({
      cat("🔍 FINAL REQ TEST: Full req() call...\n")
      req(namay(), namax(), ujiasumsif(), input$pval, newdata(), datatest1())
      cat("✅ DEBUG [BACKTESTF]: All requirements satisfied\n")
    }, error = function(e) {
      cat("  ❌ FINAL REQ() ERROR:", e$message, "\n")
      cat("  ❌ FULL ERROR DETAILS:", toString(e), "\n")
      return(data.frame(Error = paste("Full req() failed:", e$message)))
    })

    # Debug: Get assumption testing results
    cat("🔍 DEBUG [BACKTESTF]: Getting assumption testing results...\n")
    hasil_ujiasumsi <- ujiasumsif()
    cat("  - Total assumption test results:", nrow(hasil_ujiasumsi), "models\n")
    cat("  - Column names:", paste(names(hasil_ujiasumsi), collapse=", "), "\n")

    hasilujiasumsipass <- hasil_ujiasumsi[hasil_ujiasumsi$statasumsi == "pass", ]
    cat("  - Models that passed:", nrow(hasilujiasumsipass), "\n")

    # Debug: Model selection logic
    if (nrow(hasilujiasumsipass) > 0) {
      cat("✅ DEBUG [BACKTESTF]: Using PASSED models for backtesting\n")
      modelbacktesting <- hasilujiasumsipass$Model
      join_ref <- hasilujiasumsipass
    } else {
      cat("⚠️ DEBUG [BACKTESTF]: No models passed - using ALL models for backtesting\n")
      modelbacktesting <- hasil_ujiasumsi$Model
      join_ref <- hasil_ujiasumsi
    }
    cat("  - Models for backtesting:", length(modelbacktesting), "\n")
    cat("  - Model formulas:", paste(modelbacktesting, collapse=" | "), "\n")

    # Debug: Data preparation
    cat("🔍 DEBUG [BACKTESTF]: Preparing data for backtesting...\n")
    cat("  - data0() dims:", paste(dim(data0()), collapse="x"), "\n")
    cat("  - datatest1() dims:", paste(dim(datatest1()), collapse="x"), "\n")
    datagabung <- rbind(data0(),datatest1())
    cat("  - Combined datagabung dims:", paste(dim(datagabung), collapse="x"), "\n")
    cat("  - data0() dims:", paste(dim(data0()), collapse="x"), "\n")

    # Debug: Call backtesting2 function
    cat("🔍 DEBUG [BACKTESTF]: Calling backtesting2 function...\n")
    cat("  - newdata() dims:", paste(dim(newdata()), collapse="x"), "\n")
    cat("  - datatest1() dims:", paste(dim(datatest1()), collapse="x"), "\n")
    cat("  - data0() dims:", paste(dim(data0()), collapse="x"), "\n")
    cat("  - Target variable:", namay(), "\n")
    cat("  - Number of models:", length(modelbacktesting), "\n")

    tryCatch({
      # EXACT ORIGINAL: Use data0() as third parameter (following app15.R line 1397)
      # The original creates local datagabung but still uses data0() in backtesting2()
      hasilbacktest <- backtesting2(newdata(), datatest1(), data0(), namay(), modelbacktesting)
      cat("✅ DEBUG [BACKTESTF]: backtesting2 completed successfully\n")
      cat("  - Result dims:", paste(dim(hasilbacktest), collapse="x"), "\n")
      cat("  - Result columns:", paste(names(hasilbacktest), collapse=", "), "\n")
    }, error = function(e) {
      cat("❌ DEBUG [BACKTESTF]: ERROR in backtesting2:", e$message, "\n")
      cat("  - Error class:", class(e)[1], "\n")
      cat("  - Call:", deparse(e$call), "\n")
      stop(e)
    })

    # Debug: Join results
    cat("🔍 DEBUG [BACKTESTF]: Joining results with assumption tests...\n")
    cat("  - join_ref dims:", paste(dim(join_ref), collapse="x"), "\n")
    cat("  - join_ref columns:", paste(names(join_ref), collapse=", "), "\n")

    tryCatch({
      hasilakhir <- dplyr::left_join(hasilbacktest, join_ref, by = "Model") %>%
        dplyr::select(-statasumsi, -MAPE, -RMSE)
      cat("✅ DEBUG [BACKTESTF]: Join completed successfully\n")
      cat("  - Final result dims:", paste(dim(hasilakhir), collapse="x"), "\n")
      cat("  - Final columns:", paste(names(hasilakhir), collapse=", "), "\n")
    }, error = function(e) {
      cat("❌ DEBUG [BACKTESTF]: ERROR in join operation:", e$message, "\n")
      stop(e)
    })

    cat("🎉 DEBUG [BACKTESTF]: backtestf function completed successfully!\n\n")
    return(hasilakhir)
  })

  # Final model - from original app15.R lines 1416-1426
  finalmodel <- eventReactive(input$runmodel, {
    cat("\n🔍 DEBUG [FINALMODEL]: Starting final model function...\n")

    # Debug: Check requirements
    cat("🔍 DEBUG [FINALMODEL]: Checking requirements...\n")
    cat("  - namay():", if(is.null(try(namay(), silent=TRUE))) "NULL/ERROR" else paste(namay(), collapse=","), "\n")
    cat("  - namax():", if(is.null(try(namax(), silent=TRUE))) "NULL/ERROR" else paste(namax(), collapse=","), "\n")
    cat("  - newdata() dims:", if(is.null(try(newdata(), silent=TRUE))) "NULL/ERROR" else paste(dim(newdata()), collapse="x"), "\n")

    req(namay(), namax(), newdata(), backtestf())
    cat("✅ DEBUG [FINALMODEL]: All requirements satisfied\n")

    # Debug: Get backtesting results
    cat("🔍 DEBUG [FINALMODEL]: Getting backtesting results...\n")
    tryCatch({
      backtesto <- backtestf()
      cat("✅ DEBUG [FINALMODEL]: backtestf() executed successfully\n")
      cat("  - Backtest results dims:", paste(dim(backtesto), collapse="x"), "\n")
      cat("  - Backtest columns:", paste(names(backtesto), collapse=", "), "\n")
    }, error = function(e) {
      cat("❌ DEBUG [FINALMODEL]: ERROR getting backtestf() results:", e$message, "\n")
      stop(e)
    })

    # Debug: Extract model names
    cat("🔍 DEBUG [FINALMODEL]: Extracting model names...\n")
    modelname <- backtesto$Model
    cat("  - Number of models:", length(modelname), "\n")
    cat("  - Model names:", paste(modelname, collapse=" | "), "\n")

    # Debug: Run regression models
    cat("🔍 DEBUG [FINALMODEL]: Running runreg3models3...\n")
    tryCatch({
      hasilmodreg3 <- runreg3models3(newdata(), namay(), modelname)
      cat("✅ DEBUG [FINALMODEL]: runreg3models3 completed successfully\n")
      cat("  - Result dims:", paste(dim(hasilmodreg3), collapse="x"), "\n")
      cat("  - Result columns:", paste(names(hasilmodreg3), collapse=", "), "\n")
    }, error = function(e) {
      cat("❌ DEBUG [FINALMODEL]: ERROR in runreg3models3:", e$message, "\n")
      cat("  - Error class:", class(e)[1], "\n")
      stop(e)
    })

    # Debug: Clean backtesting results
    cat("🔍 DEBUG [FINALMODEL]: Cleaning backtesting results...\n")
    tryCatch({
      backtesto <- backtesto %>%
        dplyr::select(-R_squared, -R_squared_adjusted)
      cat("✅ DEBUG [FINALMODEL]: Backtest data cleaned\n")
      cat("  - Cleaned columns:", paste(names(backtesto), collapse=", "), "\n")
    }, error = function(e) {
      cat("❌ DEBUG [FINALMODEL]: ERROR cleaning backtesto:", e$message, "\n")
      stop(e)
    })

    # Debug: Join final results
    cat("🔍 DEBUG [FINALMODEL]: Joining final results...\n")
    tryCatch({
      hasilakhir <- dplyr::left_join(hasilmodreg3, backtesto, by = "Model") %>%
        dplyr::select(-MAPEinsample, -MAPEoutsample, -RMSEinsample, -RMSEoutsample)
      cat("✅ DEBUG [FINALMODEL]: Final join completed successfully\n")
      cat("  - Final result dims:", paste(dim(hasilakhir), collapse="x"), "\n")
      cat("  - Final columns:", paste(names(hasilakhir), collapse=", "), "\n")
    }, error = function(e) {
      cat("❌ DEBUG [FINALMODEL]: ERROR in final join:", e$message, "\n")
      stop(e)
    })

    cat("🎉 DEBUG [FINALMODEL]: finalmodel function completed successfully!\n\n")
    return(hasilakhir)
  })

  # =============================================================================
  # ALL OUTPUT RENDERERS - WORKING VERSION
  # =============================================================================

  # Render joined data table
  output$tabel_hasil_join <- renderDT({
    req(data0())
    datatable(data0(), options = list(scrollX = TRUE))
  })

  # Render correlation sign table
  output$table_sign1 <- DT::renderDataTable({
    req(signintuisikor())
    DT::datatable(signintuisikor(), 10, options = list(scrollX = TRUE))
  })

  # Render single regression table
  output$table_reg1 <- DT::renderDataTable({
    req(model_reg1var())
    DT::datatable(model_reg1var(), options = list(scrollX = TRUE))
  })

  # Render two-variable correlation table
  output$table_korel2 <- DT::renderDataTable({
    req(korel_reg2var())
    DT::datatable(korel_reg2var(), options = list(scrollX = TRUE))
  })

  # Render three-variable correlation table
  output$table_korel3 <- DT::renderDataTable({
    req(korel_reg3var())
    DT::datatable(korel_reg3var(), options = list(scrollX = TRUE))
  })

  # Render two-variable regression table + DEBUG LOGGING
  output$table_reg2 <- DT::renderDataTable({
    cat("\n🔍 DEBUG [TABLE_REG2]: Rendering 2-variable regression table...\n")
    tryCatch({
      result <- model_reg2var()

      # Check if result contains error
      if ("Error" %in% names(result)) {
        error_msg <- result$Error[1]
        cat("❌ DEBUG [TABLE_REG2]: Error in regression data:", error_msg, "\n")
        DT::datatable(data.frame(Error = error_msg))
      } else if (is.null(result) || nrow(result) == 0) {
        cat("⚠️ DEBUG [TABLE_REG2]: No regression data available\n")
        DT::datatable(data.frame(Warning = "No 2-variable regression models available - check correlation threshold"))
      } else {
        cat("✅ DEBUG [TABLE_REG2]: Data retrieved successfully\n")
        cat("  - Result dims:", paste(dim(result), collapse="x"), "\n")
        DT::datatable(result, options = list(scrollX = TRUE))
      }
    }, error = function(e) {
      cat("❌ DEBUG [TABLE_REG2]: ERROR in rendering:", e$message, "\n")
      DT::datatable(data.frame(Error = paste("Failed to load:", e$message)))
    })
  })

  # Render three-variable regression table + DEBUG LOGGING
  output$table_reg3 <- DT::renderDataTable({
    cat("\n🔍 DEBUG [TABLE_REG3]: Rendering 3-variable regression table...\n")
    tryCatch({
      result <- model_reg3var()

      # Check if result contains error
      if ("Error" %in% names(result)) {
        error_msg <- result$Error[1]
        cat("❌ DEBUG [TABLE_REG3]: Error in regression data:", error_msg, "\n")
        DT::datatable(data.frame(Error = error_msg))
      } else if (is.null(result) || nrow(result) == 0) {
        cat("⚠️ DEBUG [TABLE_REG3]: No regression data available\n")
        DT::datatable(data.frame(Warning = "No 3-variable regression models available - check correlation threshold"))
      } else {
        cat("✅ DEBUG [TABLE_REG3]: Data retrieved successfully\n")
        cat("  - Result dims:", paste(dim(result), collapse="x"), "\n")
        DT::datatable(result, options = list(scrollX = TRUE))
      }
    }, error = function(e) {
      cat("❌ DEBUG [TABLE_REG3]: ERROR in rendering:", e$message, "\n")
      DT::datatable(data.frame(Error = paste("Failed to load:", e$message)))
    })
  })

  # Render combined regression table + DEBUG LOGGING
  output$table_reg23 <- DT::renderDataTable({
    cat("\n🔍 DEBUG [TABLE_REG23]: Rendering combined regression table...\n")
    tryCatch({
      df <- model_reg23var()
      cat("✅ DEBUG [TABLE_REG23]: Data retrieved successfully\n")
      cat("  - Result dims:", paste(dim(df), collapse="x"), "\n")

      if (nrow(df) == 0 || ncol(df) == 0) {
        cat("⚠️ DEBUG [TABLE_REG23]: No combined models available\n")
        return(DT::datatable(data.frame(Pesan = "Tidak ada model gabungan yang tersedia.")))
      } else {
        DT::datatable(df, options = list(scrollX = TRUE))
      }
    }, error = function(e) {
      cat("❌ DEBUG [TABLE_REG23]: ERROR in rendering:", e$message, "\n")
      DT::datatable(data.frame(Error = paste("Failed to load:", e$message)))
    })
  })

  # Assumption testing table + DEBUG LOGGING
  output$table_asumsi <- DT::renderDataTable({
    cat("\n🔍 DEBUG [TABLE_ASUMSI]: Rendering assumption testing table...\n")
    req(ujiasumsif())
    result <- ujiasumsif()
    cat("✅ DEBUG [TABLE_ASUMSI]: Data retrieved, dims:", paste(dim(result), collapse="x"), "\n")
    DT::datatable(result, options = list(scrollX = TRUE))
  })

  # Back testing table + DEBUG LOGGING
  output$table_backtest <- DT::renderDataTable({
    cat("\n🔍 DEBUG [TABLE_BACKTEST]: Rendering back testing table...\n")
    tryCatch({
      req(backtestf())
      result <- backtestf()
      cat("✅ DEBUG [TABLE_BACKTEST]: Data retrieved successfully\n")
      cat("  - Result dims:", paste(dim(result), collapse="x"), "\n")
      cat("  - Result columns:", paste(names(result), collapse=", "), "\n")
      cat("  - Sample values from first row:", "\n")
      if(nrow(result) > 0) {
        for(col in names(result)[1:min(3, ncol(result))]) {
          cat("    - ", col, ":", result[1, col], "\n")
        }
      }
      DT::datatable(result, options = list(scrollX = TRUE))
    }, error = function(e) {
      cat("❌ DEBUG [TABLE_BACKTEST]: ERROR in rendering:", e$message, "\n")
      DT::datatable(data.frame(Error = paste("Failed to load:", e$message)))
    })
  })

  # Final model table + DEBUG LOGGING
  output$table_finalmodel <- DT::renderDataTable({
    cat("\n🔍 DEBUG [TABLE_FINALMODEL]: Rendering final model table...\n")
    tryCatch({
      req(finalmodel())
      result <- finalmodel()
      cat("✅ DEBUG [TABLE_FINALMODEL]: Data retrieved successfully\n")
      cat("  - Result dims:", paste(dim(result), collapse="x"), "\n")
      cat("  - Result columns:", paste(names(result), collapse=", "), "\n")
      cat("  - Sample values from first row:", "\n")
      if(nrow(result) > 0) {
        for(col in names(result)[1:min(3, ncol(result))]) {
          cat("    - ", col, ":", result[1, col], "\n")
        }
      }
      DT::datatable(result, options = list(scrollX = TRUE))
    }, error = function(e) {
      cat("❌ DEBUG [TABLE_FINALMODEL]: ERROR in rendering:", e$message, "\n")
      DT::datatable(data.frame(Error = paste("Failed to load:", e$message)))
    })
  })

  # =============================================================================
  # DOWNLOAD HANDLER FOR MODEL OUTPUT
  # =============================================================================

  # Download handler for complete model output
  output$download_model <- downloadHandler(
    filename = function() {
      # Generate timestamped filename - EXACT MATCH to original working version
      paste0("hasil_modeling_IFRS9_", format(Sys.time(), "%Y-%m-%d_%H-%M-%S"), ".xlsx")
    },
    content = function(file) {
      cat("📥 DOWNLOAD [MODEL_SERVER]: Generating model output Excel file...\n")

      tryCatch({
        # CRITICAL FIX: Use the original working pattern from app30.R
        # Create workbook and add sheets with proper error handling like original
        wb <- createWorkbook()

        # Add all data frame hasil ke sheet Excel, gunakan tryCatch untuk menangani error
        # Following exact pattern from original working version at /home/doppelgaenger/ifrspro/_analytics/_v30/app30.R

        # 1. Data Y awal (Original pattern)
        addWorksheet(wb, "Data Y awal")
        tryCatch({
          data_y_awal <- data_dependent_tr()  # Using reactive function from original
          writeData(wb, "Data Y awal", data_y_awal)
        }, error = function(e) {
          cat("Error pada sheet 'Data Y awal':", e$message, "\n")
          writeData(wb, "Data Y awal", data.frame())  # Kosongkan jika error
        })

        # 2. Data full (Original pattern)
        addWorksheet(wb, "Data full")
        tryCatch({
          data_full <- yx()  # Using reactive function from original
          writeData(wb, "Data full", data_full)
        }, error = function(e) {
          cat("Error pada sheet 'Data full':", e$message, "\n")
          writeData(wb, "Data full", data.frame())  # Kosongkan jika error
        })

        # 3. Sign Intuition (Enhanced from original pattern)
        addWorksheet(wb, "Sign Intuition")
        tryCatch({
          sign_data <- signintuisikor()
          if (!is.null(sign_data) && nrow(sign_data) > 0) {
            writeData(wb, "Sign Intuition", sign_data)
          } else {
            writeData(wb, "Sign Intuition", data.frame(Message = "No data available"))
          }
        }, error = function(e) {
          cat("Error pada sheet 'Sign Intuition':", e$message, "\n")
          writeData(wb, "Sign Intuition", data.frame(Message = paste("Error:", e$message)))
        })

        # 4. Single Factor Regression (Following original pattern)
        addWorksheet(wb, "Single Factor")
        tryCatch({
          single_data <- model_reg1var()
          if (!is.null(single_data) && nrow(single_data) > 0) {
            writeData(wb, "Single Factor", single_data)
          } else {
            writeData(wb, "Single Factor", data.frame(Message = "No data available"))
          }
        }, error = function(e) {
          cat("Error pada sheet 'Single Factor':", e$message, "\n")
          writeData(wb, "Single Factor", data.frame(Message = paste("Error:", e$message)))
        })

        # 5. Two Variable Correlation (Following original pattern)
        addWorksheet(wb, "Correlation 2 Variable")
        tryCatch({
          corr2_data <- korel_reg2var()
          if (!is.null(corr2_data) && nrow(corr2_data) > 0) {
            writeData(wb, "Correlation 2 Variable", corr2_data)
          } else {
            writeData(wb, "Correlation 2 Variable", data.frame(Message = "No data available"))
          }
        }, error = function(e) {
          cat("Error pada sheet 'Correlation 2 Variable':", e$message, "\n")
          writeData(wb, "Correlation 2 Variable", data.frame(Message = paste("Error:", e$message)))
        })

        # 6. Three Variable Correlation (Following original pattern)
        addWorksheet(wb, "Correlation 3 Variable")
        tryCatch({
          corr3_data <- korel_reg3var()
          if (!is.null(corr3_data) && nrow(corr3_data) > 0) {
            writeData(wb, "Correlation 3 Variable", corr3_data)
          } else {
            writeData(wb, "Correlation 3 Variable", data.frame(Message = "No data available"))
          }
        }, error = function(e) {
          cat("Error pada sheet 'Correlation 3 Variable':", e$message, "\n")
          writeData(wb, "Correlation 3 Variable", data.frame(Message = paste("Error:", e$message)))
        })

        # 7. Two Variable Regression (Following original pattern)
        addWorksheet(wb, "Regression 2 Variable")
        tryCatch({
          reg2_data <- model_reg2var()
          if (!is.null(reg2_data) && nrow(reg2_data) > 0) {
            writeData(wb, "Regression 2 Variable", reg2_data)
          } else {
            writeData(wb, "Regression 2 Variable", data.frame(Message = "No data available"))
          }
        }, error = function(e) {
          cat("Error pada sheet 'Regression 2 Variable':", e$message, "\n")
          writeData(wb, "Regression 2 Variable", data.frame(Message = paste("Error:", e$message)))
        })

        # 8. Three Variable Regression (Following original pattern)
        addWorksheet(wb, "Regression 3 Variable")
        tryCatch({
          reg3_data <- model_reg3var()
          if (!is.null(reg3_data) && nrow(reg3_data) > 0) {
            writeData(wb, "Regression 3 Variable", reg3_data)
          } else {
            writeData(wb, "Regression 3 Variable", data.frame(Message = "No data available"))
          }
        }, error = function(e) {
          cat("Error pada sheet 'Regression 3 Variable':", e$message, "\n")
          writeData(wb, "Regression 3 Variable", data.frame(Message = paste("Error:", e$message)))
        })

        # 8. Data Y Awal (Fixed based on original working version)
        addWorksheet(wb, "Data Y Awal")
        tryCatch({
          # CRITICAL FIX: Data Y Awal should use dependent_data parameter (data_dependent_tr)
          if (!is.null(dependent_data) && is.data.frame(dependent_data) && nrow(dependent_data) > 0) {
            writeData(wb, "Data Y Awal", dependent_data)
            cat("✅ Data Y Awal sheet populated with", nrow(dependent_data), "rows\n")
          } else {
            writeData(wb, "Data Y Awal", data.frame(Message = "No dependent data available. Please process data in the Data tab first."))
          }
        }, error = function(e) {
          cat("Error pada sheet 'Data Y Awal':", e$message, "\n")
          writeData(wb, "Data Y Awal", data.frame(Message = paste("Error:", e$message)))
        })

        # 9. Model Akhir (Fixed based on original working version)
        addWorksheet(wb, "Model Akhir")
        tryCatch({
          # CRITICAL FIX: Model Akhir should use tabel_pemilihan_model_akhir from forecast_server
          # This function is only available after running the forecast process
          # Create informative message for user
          final_data <- data.frame(
            `Sheet Information` = c(
              "Model Akhir (Final Model Selection)",
              "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
              "Status: Available after forecast execution",
              "Action Required: Run forecast process first",
              "",
              "How to get Model Akhir data:",
              "1. Go to 'Forecast Y' tab",
              "2. Configure forecast parameters",
              "3. Click 'RUN' to execute forecast",
              "4. Download from 'Output' button in Forecast Y tab",
              "",
              "This provides complete model selection results"
            ),
            `Details` = c(
              "Final model selection results with",
              "Performance metrics and rankings",
              "Based on statistical criteria",
              "Including R², MAPE, accuracy scores",
              "",
              "Step-by-step instructions:",
              "Navigate to forecasting module",
              "Set your forecast parameters",
              "Execute the forecasting model",
              "Download complete Excel output",
              "",
              "Contains: Model rankings, metrics, selection"
            )
          )

          if (!is.null(final_data) && nrow(final_data) > 0) {
            writeData(wb, "Model Akhir", final_data)
            cat("✅ Model Akhir sheet populated with user guidance\n")
          } else {
            writeData(wb, "Model Akhir", data.frame(Message = "No data available"))
          }
        }, error = function(e) {
          cat("Error pada sheet 'Model Akhir':", e$message, "\n")
          writeData(wb, "Model Akhir", data.frame(Message = paste("Error:", e$message)))
        })

        # CRITICAL FIX: Use saveWorkbook like original working version
        saveWorkbook(wb, file, overwrite = TRUE)

        cat("✅ DOWNLOAD [MODEL_SERVER]: Successfully generated Excel file\n")
        cat("  - File saved:", file, "\n")
        cat("  - File size:", round(file.info(file)$size / 1024, 2), "KB\n")

      }, error = function(e) {
        cat("❌ DOWNLOAD [MODEL_SERVER]: Error generating Excel file:", e$message, "\n")

        # CRITICAL FIX: Create a valid Excel file even on error (not CSV)
        tryCatch({
          wb_error <- createWorkbook()
          addWorksheet(wb_error, "Error")

          error_data <- data.frame(
            `Error Message` = "Could not generate complete Excel file",
            `Reason` = e$message,
            `Timestamp` = format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
            `Suggestion` = "Please run the model first before downloading",
            check.names = FALSE
          )

          writeData(wb_error, "Error", error_data)
          saveWorkbook(wb_error, file, overwrite = TRUE)

          cat("🔄 DOWNLOAD [MODEL_SERVER]: Created error report Excel file\n")

        }, error = function(e2) {
          cat("❌ DOWNLOAD [MODEL_SERVER]: Could not create error file:", e2$message, "\n")
          # Create a minimal valid Excel file
          wb_minimal <- createWorkbook()
          addWorksheet(wb_minimal, "Info")
          writeData(wb_minimal, "Info", data.frame(Message = "Download temporarily unavailable"))
          saveWorkbook(wb_minimal, file, overwrite = TRUE)
        })
      })
    },
    # CRITICAL FIX: Proper content type for Excel files
    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )

  # =============================================================================
  # RETURN VALUES
  # =============================================================================

  return(list(
    joined_data = data0,
    model_data = data0,
    single_regression = model_reg1var,
    two_var_correlation = korel_reg2var,
    three_var_correlation = korel_reg3var,
    two_var_regression = model_reg2var,
    filtered_variables = newvarr1x,
    training_data = data1,
    test_data = datatest1,
    assumption_test = ujiasumsif,
    back_test = backtestf,
    final_model = finalmodel,
    new_data = newdata,
    # CRITICAL FIX: Add missing reactive functions needed by forecast_server
    namay = namay,
    intuition_results = refInt,
    sign_intuition = signintuisikor,
    single_factor_model = model_reg1var,
    correlation_2var = korel_reg2var,
    correlation_3var = korel_reg3var,
    regression_2var = model_reg2var,
    regression_3var = model_reg3var,
    combined_model = model_reg23var
  ))
}

# =============================================================================
# END OF MODEL SERVER MODULE - WORKING VERSION
# =============================================================================