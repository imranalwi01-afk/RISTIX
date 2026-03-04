# =============================================================================
# DATA PROCESSING UTILITY FUNCTIONS
# =============================================================================
# Extracted from: _analytics/_v15/reference/global.R
# Purpose: Data transformation, date conversion, and data cleaning utilities
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Convert columns to Date format with automatic detection
#' @param df Data frame with potential date columns
#' @param threshold Minimum success rate for date conversion (default: 0.9)
#' @param date_formats Vector of date formats to try
#' @return Data frame with converted date columns
convert_dates <- function(df, threshold = 0.9,
                               date_formats = c("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y",
                                                "%Y/%m/%d", "%d.%m.%Y", "%Y.%m.%d")) {

  if (is.null(df) || ncol(df) == 0) {
    warning("Data kosong atau tidak memiliki kolom di convert_dates.")
    return(df)
  }

  is_date_col <- logical(length = ncol(df))
  best_formats <- character(length = ncol(df))

  for (i in seq_along(df)) {
    col <- df[[i]]

    # Ubah factor jadi character
    if (is.factor(col)) {
      col <- as.character(col)
    }

    # Lanjut hanya jika character
    if (!is.character(col)) next

    best_rate <- 0
    best_format <- NA

    for (fmt in date_formats) {
      parsed <- suppressWarnings(as.Date(col, format = fmt))
      rate <- mean(!is.na(parsed))

      if (rate > best_rate) {
        best_rate <- rate
        best_format <- fmt
      }

      if (best_rate >= 1) break
    }

    if (best_rate >= threshold) {
      df[[i]] <- as.Date(col, format = best_format)
      is_date_col[i] <- TRUE
      best_formats[i] <- best_format
    }
  }

  # Info kolom yang diubah
  changed_cols <- names(df)[is_date_col]
  if (length(changed_cols) > 0) {
    message("Kolom yang dikonversi ke Date:")
    for (j in seq_along(changed_cols)) {
      message(sprintf("- %s (format: %s)", changed_cols[j], best_formats[is_date_col][j]))
    }
  } else {
    message("Tidak ada kolom yang terdeteksi sebagai tanggal.")
  }

  return(df)
}

#' Convert columns to Date format with validation (enhanced version)
#' @param df Data frame with potential date columns
#' @param threshold Minimum success rate for date conversion (default: 0.9)
#' @param date_formats Vector of date formats to try
#' @return List with converted data frame, column count, and date column info
convert_dates2 <- function(df, threshold = 0.9,
                           date_formats = c("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y")) {

  if (is.null(df) || ncol(df) == 0) {
    warning("Data kosong atau tidak memiliki kolom.")
    return(list(df = df, num_columns = 0, date_columns = character()))
  }

  is_date_col <- logical(length = ncol(df))
  best_formats <- character(length = ncol(df))

  for (i in seq_along(df)) {
    col <- df[[i]]

    if (is.factor(col)) col <- as.character(col)
    if (!is.character(col)) next

    # Batasi panjang string maksimal agar tidak membuat strptime crash
    col <- ifelse(nchar(col) > 50, NA, col)

    best_rate <- 0
    best_format <- NA

    for (fmt in date_formats) {
      parsed <- suppressWarnings(tryCatch(
        as.Date(col, format = fmt),
        error = function(e) rep(NA, length(col))
      ))
      rate <- mean(!is.na(parsed))

      if (rate > best_rate) {
        best_rate <- rate
        best_format <- fmt
      }
      if (best_rate >= 1) break
    }

    if (best_rate >= threshold) {
      df[[i]] <- as.Date(col, format = best_format)
      is_date_col[i] <- TRUE
      best_formats[i] <- best_format
    }
  }

  changed_cols <- names(df)[is_date_col]
  if (length(changed_cols) > 0) {
    message("Kolom yang dikonversi ke Date:")
    for (j in seq_along(changed_cols)) {
      message(sprintf("- %s (format: %s)", changed_cols[j], best_formats[is_date_col][j]))
    }
  } else {
    message("Tidak ada kolom yang terdeteksi sebagai tanggal.")
  }

  return(list(df = df,
              num_columns = ncol(df),
              date_columns = changed_cols))
}

#' Split data by date boundaries
#' @param datax Data frame with date column
#' @param bb Start date boundary (optional, defaults to minimum date)
#' @param bt Training end date boundary
#' @param ba Final end date boundary
#' @return List with data1 (training) and data2 (test) data frames
batasdata <- function(datax, bb = NULL, bt, ba) {
  # Deteksi kolom bertipe Date
  date_column <- names(datax)[sapply(datax, inherits, "Date")]

  if (length(date_column) == 0) {
    stop("Tidak ada kolom bertipe Date dalam datax.")
  }
  if (length(date_column) > 1) {
    warning("Terdapat lebih dari satu kolom Date, menggunakan kolom pertama: ", date_column[1])
  }

  tanggal_col <- date_column[1]

  # Tentukan nilai bb (awal)
  if (is.null(bb) || is.na(bb)) {
    bb <- min(datax[[tanggal_col]], na.rm = TRUE)
  } else {
    bb <- as.Date(bb)
  }

  # Konversi batas-batas ke Date dengan validasi
  if (is.null(bt) || is.na(bt)) {
    bt <- max(datax[[tanggal_col]], na.rm = TRUE)
  } else {
    bt <- as.Date(bt)
  }

  if (is.null(ba) || is.na(ba)) {
    ba <- max(datax[[tanggal_col]], na.rm = TRUE)
  } else {
    ba <- as.Date(ba)
  }

  # Filter data
  data1 <- datax[datax[[tanggal_col]] >= bb & datax[[tanggal_col]] <= bt, ]
  data2 <- datax[datax[[tanggal_col]] > bt & datax[[tanggal_col]] <= ba, ]

  # Return sebagai list
  return(list(data1 = data1, data2 = data2))
}

#' Transform numeric data with various transformation methods
#' @param df Data frame with numeric data (2nd column will be transformed)
#' @param transformations Vector of transformation methods to apply
#' @param logit_value Small value to replace zeros in logit transformation
#' @param moving_avg_window Window size for moving average
#' @return Data frame with original and transformed columns
transform_y <- function(df, transformations = c("logit", "average", "moving_average", "log"),
                        logit_value = 0.000001, moving_avg_window = 3) {

  # Check if input data is valid
  if (is.null(df) || nrow(df) == 0 || ncol(df) < 2) {
    cat("❌ ERROR [TRANSFORM_Y]: Invalid input data\n")
    cat("  - df is null:", is.null(df), "\n")
    if (!is.null(df)) {
      cat("  - df rows:", nrow(df), "\n")
      cat("  - df cols:", ncol(df), "\n")
    }
    # Return empty data frame with consistent structure
    return(data.frame())
  }

  # Ensure we have at least 2 columns before accessing names(df)[2]
  if (ncol(df) < 2) {
    cat("❌ ERROR [TRANSFORM_Y]: Data frame must have at least 2 columns\n")
    return(df)
  }

  col_name <- names(df)[2]
  cat("🔍 DEBUG [TRANSFORM_Y]: Processing column:", col_name, "\n")

  # CRITICAL FIX: Check if the target column contains numeric data
  if (!is.numeric(df[[col_name]])) {
    cat("⚠️  WARNING [TRANSFORM_Y]: Column", col_name, "is not numeric. Attempting to convert...\n")

    # Try to convert to numeric, coercing errors to NA
    df[[col_name]] <- as.numeric(df[[col_name]])

    # Check if conversion resulted in valid numeric data
    if (all(is.na(df[[col_name]]))) {
      cat("❌ ERROR [TRANSFORM_Y]: Column", col_name, "cannot be converted to numeric. No transformations applied.\n")
      return(df)
    }

    # Remove NA values for transformation
    original_rows <- nrow(df)
    df <- df[!is.na(df[[col_name]]), ]
    cat("📊 INFO [TRANSFORM_Y]: Removed", original_rows - nrow(df), "NA values from", col_name, "\n")
  }

  # Check if we have enough data after cleaning
  if (nrow(df) == 0) {
    cat("❌ ERROR [TRANSFORM_Y]: No valid numeric data remaining after cleaning\n")
    return(df)
  }

  # Fungsi untuk transformasi Logit dengan error handling
  logit_transform <- function(x, logit_value) {
    tryCatch({
      # CRITICAL FIX: Ensure x is numeric before operations
      if (!is.numeric(x)) {
        cat("⚠️ WARNING [LOGIT_TRANSFORM]: Converting non-numeric x to numeric\n")
        x <- as.numeric(x)
        # Remove any NA values created by conversion
        if (any(is.na(x))) {
          cat("  - Replacing", sum(is.na(x)), "NA values with", logit_value, "\n")
          x[is.na(x)] <- logit_value
        }
      }

      # Apply bounds checking with numeric operations
      x <- ifelse(x <= 0, logit_value, x)
      x <- ifelse(x >= 1, 1 - logit_value, x)

      # CRITICAL FIX: Check for division by zero or invalid operations
      denominator <- (1 - x)
      if (any(denominator <= 0, na.rm = TRUE)) {
        cat("⚠️ WARNING [LOGIT_TRANSFORM]: Denominator <= 0 detected, applying fixes\n")
        denominator[denominator <= 0] <- logit_value
      }

      # Safe division with error handling
      result <- tryCatch({
        log(x / denominator)
      }, error = function(e) {
        cat("❌ ERROR in logit_transform division:", e$message, "\n")
        return(rep(0, length(x)))  # Return zeros if division fails
      })

      if (any(is.infinite(result)) || any(is.nan(result))) {
        warning("Logit transformation produced infinite or NaN values")
        return(ifelse(is.infinite(result) | is.nan(result), 0, result))
      }
      return(result)
    }, error = function(e) {
      cat("❌ ERROR in logit_transform:", e$message, "\n")
      return(x)  # Return original values if transformation fails
    })
  }

  # Fungsi untuk transformasi Average (Cumulative Average) dengan error handling
  average_transform <- function(x) {
    tryCatch({
      cumsum(x) / seq_along(x)
    }, error = function(e) {
      cat("❌ ERROR in average_transform:", e$message, "\n")
      return(x)
    })
  }

  # Fungsi untuk transformasi Moving Average dengan error handling
  moving_average_transform <- function(x, window) {
    tryCatch({
      # Ensure window is valid
      if (window >= length(x)) {
        return(rep(mean(x, na.rm = TRUE), length(x)))
      }
      # Menggunakan filter() dari package stats untuk moving average
      result <- stats::filter(x, rep(1 / window, window), sides = 2)
      # Handle NA values at boundaries
      if (any(is.na(result))) {
        result[is.na(result)] <- x[is.na(result)]
      }
      return(result)
    }, error = function(e) {
      cat("❌ ERROR in moving_average_transform:", e$message, "\n")
      return(x)
    })
  }

  # Fungsi untuk transformasi Log dengan error handling
  log_transform <- function(x) {
    tryCatch({
      # Handle non-positive values
      x_clean <- ifelse(x <= 0, logit_value, x)
      result <- log(x_clean)
      if (any(is.infinite(result)) || any(is.nan(result))) {
        return(ifelse(is.infinite(result) | is.nan(result), log(logit_value), result))
      }
      return(result)
    }, error = function(e) {
      cat("❌ ERROR in log_transform:", e$message, "\n")
      return(x)
    })
  }

  # Iterasi melalui semua transformasi yang dipilih dengan validasi
  for (transformation in transformations) {
    cat("🔄 Applying transformation:", transformation, "\n")

    tryCatch({
      if (transformation == "logit") {
        df[[paste0("logit_", col_name)]] <- sapply(df[[col_name]], logit_transform, logit_value = logit_value)
      } else if (transformation == "average") {
        df[[paste0("average_", col_name)]] <- average_transform(df[[col_name]])
      } else if (transformation == "moving_average") {
        df[[paste0("ma_", col_name)]] <- moving_average_transform(df[[col_name]], moving_avg_window)
      } else if (transformation == "log") {
        df[[paste0("log_", col_name)]] <- log_transform(df[[col_name]])
      }
      cat("✅ Transformation", transformation, "applied successfully\n")
    }, error = function(e) {
      cat("❌ ERROR applying transformation", transformation, ":", e$message, "\n")
      # Continue with next transformation instead of failing completely
    })
  }

  return(df)
}

#' Join two data frames by Date column with automatic date standardization
#' @param df1 First data frame with Date column
#' @param df2 Second data frame with Date column
#' Transform independent variables with comprehensive feature engineering
#' @description Creates multiple transformed variables including YoY changes, lags, differences, and log transforms
#' @param data Data frame with independent variables (excluding date column)
#' @return Data frame with original and transformed variables
transform <- function(data) {
  vars <- names(data)
  data <- data %>%
    mutate(across(where(~ any(grepl("%", .))), ~ as.numeric(gsub("%", "", .)) / 100))

  lag_mapping <- c(3, 6, 9, 12)
  lag_labels <- c(1, 2, 3, 4)

  for (var in vars) {
      # Handle Y Transformation with NA safety
    y_col <- paste0(var, "_Y")
    current_vals <- data[[var]]
    lag_vals <- dplyr::lag(data[[var]], 12)

    # Safe division with NA handling
    y_vals <- ifelse(is.na(current_vals) | is.na(lag_vals) | lag_vals == 0,
                     NA,
                     (current_vals / lag_vals) - 1)
    data[[y_col]] <- y_vals

    for (i in seq_along(lag_mapping)) {
      lag_val <- lag_mapping[i]
      lag_label <- lag_labels[i]

      data <- data %>%
        mutate(
          !!paste0(var, "_Y_Lg", lag_label) := lag(.data[[paste0(var, "_Y")]], lag_val)
        )
    }

    data <- data %>%
      mutate(
        # Differencing 12 Bulan
        !!paste0(var, "_Diff12") := .data[[var]] - lag(.data[[var]], 12)
      )

    for (i in seq_along(lag_mapping)) {
      lag_val <- lag_mapping[i]
      lag_label <- lag_labels[i]

      data <- data %>%
        mutate(
          !!paste0(var, "_Diff12_Lg", lag_label) := lag(.data[[paste0(var, "_Diff12")]], lag_val)
        )
    }

    data <- data %>%
      mutate(
        # Log Transform
        !!paste0(var, "_Ln") := log(ifelse(.data[[var]] > 0, .data[[var]], 1))
      )

    for (i in seq_along(lag_mapping)) {
      lag_val <- lag_mapping[i]
      lag_label <- lag_labels[i]

      data <- data %>%
        mutate(
          !!paste0(var, "_Ln_Lg", lag_label) := lag(.data[[paste0(var, "_Ln")]], lag_val)
        )
    }

    for (i in seq_along(lag_mapping)) {
      lag_val <- lag_mapping[i]
      lag_label <- lag_labels[i]

      data <- data %>%
        mutate(
          # Lag Transformations
          !!paste0(var, "_Lg", lag_label) := lag(.data[[var]], lag_val)
        )
    }
  }

  return(data)
}

#' Join two data frames by Date column with automatic date standardization
#' @param df1 First data frame with Date column
#' @param df2 Second data frame with Date column
#' @return Merged data frame with inner join on standardized dates
inner_join_date <- function(df1, df2) {

  # ENHANCED: Try to detect date columns by type AND by name patterns
  date_col1 <- names(df1)[sapply(df1, inherits, "Date")]

  # If no Date columns found, look for date-like column names and try to convert
  if (length(date_col1) == 0) {
    potential_date_cols1 <- names(df1)[grepl("date|Date|DATE|PRC_DATE", names(df1), ignore.case = TRUE)]
    if (length(potential_date_cols1) > 0) {
      # Try to convert the first potential date column
      first_col <- potential_date_cols1[1]
      df1 <- convert_dates(df1)
      # Check again after conversion
      date_col1 <- names(df1)[sapply(df1, inherits, "Date")]
    }
  }

  # Same for df2
  date_col2 <- names(df2)[sapply(df2, inherits, "Date")]

  # If no Date columns found, look for date-like column names and try to convert
  if (length(date_col2) == 0) {
    potential_date_cols2 <- names(df2)[grepl("date|Date|DATE|PRC_DATE", names(df2), ignore.case = TRUE)]
    if (length(potential_date_cols2) > 0) {
      # Try to convert the first potential date column
      first_col <- potential_date_cols2[1]
      df2 <- convert_dates(df2)
      # Check again after conversion
      date_col2 <- names(df2)[sapply(df2, inherits, "Date")]
    }
  }

  # Periksa jika kedua tabel memiliki kolom tanggal yang valid
  if (length(date_col1) == 0 | length(date_col2) == 0) {
    cat("🔍 Debug info - Available columns:\n")
    cat("df1 columns:", paste(names(df1), collapse = ", "), "\n")
    cat("df2 columns:", paste(names(df2), collapse = ", "), "\n")
    cat("df1 Date columns:", paste(date_col1, collapse = ", "), "\n")
    cat("df2 Date columns:", paste(date_col2, collapse = ", "), "\n")
    stop("Kolom tanggal tidak ditemukan pada salah satu atau kedua tabel.")
  }

  # Ganti nama kolom tanggal menjadi "Date" di kedua data frame
  names(df1)[names(df1) == date_col1] <- "Date"
  names(df2)[names(df2) == date_col2] <- "Date"

  # Convert to end of month using base R
  # Get last day of month by going to first day of next month and subtracting 1
  get_last_day_of_month <- function(date) {
    year_month <- format(date, "%Y-%m")
    next_month <- as.Date(paste0(year_month, "-01")) + 32
    first_of_next <- as.Date(paste0(format(next_month, "%Y-%m"), "-01"))
    return(first_of_next - 1)
  }

  df1$Date <- get_last_day_of_month(df1$Date)
  df2$Date <- get_last_day_of_month(df2$Date)

  # Melakukan inner join berdasarkan kolom tanggal
  merged_df <- merge(df1, df2, by = "Date", all = FALSE)

  return(merged_df)
}

#' Clean data frame by handling missing values and date standardization
#' @param df Data frame with Date column in first position
#' @param missing_value_method Method to handle missing values
#' @return Cleaned data frame
clean_dataframe <- function(df, missing_value_method = c("mean", "median", "zero", "remove")) {
  # Memastikan kolom pertama adalah tanggal
  df[[1]] <- as.Date(df[[1]], format="%Y-%m-%d")

  # Menyaring data untuk memastikan hanya data yang berada di akhir bulan
  df <- df[format(df[[1]], "%d") == "01", ]

  # Mengatasi missing values sesuai dengan metode yang dipilih
  missing_value_method <- match.arg(missing_value_method)

  for (col in 2:ncol(df)) {
    if (any(is.na(df[[col]]))) {
      if (missing_value_method == "mean") {
        df[[col]][is.na(df[[col]])] <- mean(df[[col]], na.rm = TRUE)
      } else if (missing_value_method == "median") {
        df[[col]][is.na(df[[col]])] <- median(df[[col]], na.rm = TRUE)
      } else if (missing_value_method == "zero") {
        df[[col]][is.na(df[[col]])] <- 0.0000001
      } else if (missing_value_method == "remove") {
        df <- df[!is.na(df[[col]]), ]
      }
    }
  }

  return(df)
}

#' Assign expected values from reference table
#' @param sources Vector of source values to match
#' @param reference Data frame with variable names and expected values
#' @return Vector of matched expected values
assign_expect <- function(sources, reference) {
  # Ambil nama kolom pertama dan kedua secara eksplisit
  if (ncol(reference) < 2) stop("Reference harus memiliki minimal dua kolom.")

  var_col <- names(reference)[1]
  expect_col <- names(reference)[2]

  # Ambil bagian awal dari sources sebelum underscore
  sources_clean <- sapply(strsplit(sources, "_"), `[`, 1)

  # Cocokkan dengan kolom pertama reference
  matched_indices <- match(sources_clean, reference[[var_col]])

  # Ambil nilai dari kolom ekspektasi berdasarkan indeks yang cocok
  result <- reference[[expect_col]][matched_indices]

  # Kembalikan hasil
  return(ifelse(is.na(result), NA, result))
}


# =============================================================================
# END OF DATA PROCESSING UTILITY FUNCTIONS
# =============================================================================