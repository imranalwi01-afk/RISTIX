# =============================================================================
# FORECASTING UTILITY FUNCTIONS
# =============================================================================
# Extracted from: _analytics/_v15/reference/global.R
# Purpose: Time series forecasting, method selection, and accuracy evaluation
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Find the best forecasting method based on accuracy metrics
#' @param datku Data frame with date column and value column
#' @param byy Time period type ("month", "quarter", "year")
#' @param makur Accuracy metric to use ("MAPE" or "RMSE")
#' @return Data frame with methods ranked by accuracy
best_forecast_metod <- function(datku, byy = "month", makur = "MAPE") {
  data <- as.vector(datku[,-1])
  date <- as.Date(datku[, 1])
  bulan <- as.numeric(format(date[1], "%m"))
  tahun <- as.numeric(format(date[1], "%Y"))

  if (makur == "RMSE") {
    akurate <- 2
  } else if (makur == "MAPE") {
    akurate <- 5
  } else {
    stop("Unknown metric")
  }

  safe_akurasi <- function(expr) {
    tryCatch({
      hasil <- expr
      if (is.matrix(hasil) || is.data.frame(hasil)) hasil[akurate]
      else NA
    }, error = function(e) NA)
  }

  safe_model <- function(expr) {
    tryCatch(expr, error = function(e) NA)
  }

  y_month <- ts(data, start = c(tahun, bulan), frequency = ifelse(byy == "quarter", 4, ifelse(byy == "month", 12, 1)))

  akurasi_sma <- safe_akurasi(SM_Average(data, 2)$nilai_akurasi)
  akurasi_dma <- safe_akurasi(LM_Average(data, 2)$nilai_akurasi)
  akurasi_ses <- safe_akurasi(akurasi2(safe_model(ses(y_month))))
  akurasi_browsapar <- safe_akurasi(brownsapar(data, 2)$nilai_akurasi)
  akurasi_holt2par <- safe_akurasi(akurasi2(safe_model(holt(y_month))))

  akurasi_holtwinad <- if (byy %in% c("month", "quarter")) {
    freq <- ifelse(byy == "quarter", 4, 12)
    y <- ts(data, start = c(tahun, bulan), frequency = freq)
    safe_akurasi(akurasi2(safe_model(hw(y, seasonal = "additive"))))
  } else NA

  akurasi_holtwinsea <- if (byy %in% c("month", "quarter") && min(data) > 0) {
    freq <- ifelse(byy == "quarter", 4, 12)
    y <- ts(data, start = c(tahun, bulan), frequency = freq)
    safe_akurasi(akurasi2(safe_model(hw(y, seasonal = "multiplicative"))))
  } else NA

  akurasi_arima <- {
    model_arima <- safe_model(auto.arima(y_month))
    if (!is.null(model_arima) && !any(is.na(model_arima))) {
      accuracy(model_arima)[,makur]

    } else {
      NA
    }
  }

  akurasi_tbats <- {
    model_tbats <- safe_model(tbats(y_month))
    if (!is.null(model_tbats) && !any(is.na(model_tbats))) {
      accuracy(model_tbats)[,makur]
    } else {
      NA
    }
  }


  Metode <- c(
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

  akurasix <- c(
    akurasi_sma,
    akurasi_dma,
    akurasi_ses,
    akurasi_browsapar,
    akurasi_holt2par,
    akurasi_holtwinad,
    akurasi_holtwinsea,
    akurasi_arima,
    akurasi_tbats
  )

  Metode_terbaik <- data.frame(Metode, akurasi = akurasix)
  Metode_terbaik <- Metode_terbaik[order(Metode_terbaik$akurasi, na.last = TRUE), ]
  rownames(Metode_terbaik) <- 1:nrow(Metode_terbaik)
  return(Metode_terbaik)
}

#' Execute forecasting using specified method
#' @param datku Data frame with date and value columns
#' @param metode Forecasting method to use
#' @param jf Number of periods to forecast (default: 12)
#' @param byy Time period type ("month", "quarter", "year")
#' @return List with method, actual data, forecast results, and model details
memilih_metode <- function(datku, metode, jf = 12, byy = "month") {

  tambah_bulan_akhir <- function(tanggal_vec, h) {
    tanggal_unik <- unique(as.Date(tanggal_vec))

    tanggal_terakhir <- floor_date(max(tanggal_unik), unit = "month")

    # Buat urutan tanggal ke depan
    hasil_forecast <- seq(from = tanggal_terakhir %m+% months(1), by = "month", length.out = h)
    hasil_forecast <- ceiling_date(hasil_forecast, "month") - days(1)

    return(hasil_forecast)
  }

  data <- datku[,-1]
  date <- c(datku[,1], tambah_bulan_akhir(datku[,1], jf))
  date1 <- datku[,1]
  date2 <- tambah_bulan_akhir(datku[,1], jf)
  bulan <- format(date[1], "%m")
  tahun <- format(date[1], "%Y")


  if (metode == "Single Moving Average") {
    model <- SM_Average(data, jf)
    forecasting_r <- data.frame(Date = date2, Forecast = model$forecast)
    actual_data <- data.frame(Date = date1, Actual = data)
    detailnya <- model
  } else if (metode == "Double Moving Average") {
    model <- LM_Average(data, jf)
    forecasting_r <- data.frame(Date = date2, Forecast = model$forecast)
    actual_data <- data.frame(Date = date1, Actual = data)
    detailnya <- model
  } else if (metode == "Single Exponential Smoothing") {
    model <- ses(data, h = jf)
    forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
    actual_data <- data.frame(Date = date1, Actual = model$x)
    detailnya <- model$model
  } else if (metode == "Brown Linier Satu Parameter") {
    model <- brownsapar(data, jf)
    forecasting_r <- data.frame(Date = date2, Forecast = model$forecast)
    actual_data <- data.frame(Date = date1, Actual = data)
    detailnya <- model
  } else if (metode == "Holt Dua Parameter") {
    model <- holt(data, h = jf)
    forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
    actual_data <- data.frame(Date = date1, Actual = model$x)
    detailnya <- model$model
  } else if (metode == "Holt Winter Aditif") {
    if (byy == "quarter") {
      y <- ts(data, start = c(tahun, kuartos(bulan)), frequency = 4)
      model <- hw(y, seasonal = "additive", h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model$model
    } else if (byy == "month") {
      y <- ts(data, start = c(tahun, bulan), frequency = 12)
      model <- hw(y, seasonal = "additive", h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model$model
    } else {
      y <- 0
      model <- 0
      forecasting_r <- data.frame(Date = date2, Forecast = 0)
      actual_data <- data.frame(Date = date1, Actual = 0)
      detailnya <- 0
    }

  } else if (metode == "Holt winter Multiplikatif") {
    if (byy == "year" || min(data) <= 0) {
      y <- 0
      model <- 0
      forecasting_r <- data.frame(Date = date2, Forecast = 0)
      actual_data <- data.frame(Date = date1, Actual = 0)
      detailnya <- 0
    } else if (byy == "day" || min(data) <= 0) {
      y <- 0
      model <- 0
      forecasting_r <- data.frame(Date = date2, Forecast = 0)
      actual_data <- data.frame(Date = date1, Actual = 0)
      detailnya <- 0
    } else if (byy == "quarter") {
      y <- ts(data, start = c(tahun, kuartos(bulan)), frequency = 4)
      model <- hw(y, seasonal = "multiplicative", h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model$model
    } else {
      y <- ts(data, start = c(tahun, bulan), frequency = 12)
      model <- hw(y, seasonal = "multiplicative", h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model$model
    }


  } else if (metode == "Auto ARIMA") {
    if (byy == "quarter") {
      y <- ts(data, start = c(tahun, kuartos(bulan)), frequency = 4)
      model_arima <- auto.arima(y)
      model_arima_custom <- Arima(y, order = c(model_arima$arma[1], model_arima$arma[6], model_arima$arma[2]),
                                  seasonal = list(order = c(model_arima$arma[3], model_arima$arma[7], model_arima$arma[4]), period = model_arima$arma[5]), include.constant = TRUE)


      model <- forecast::forecast(model_arima_custom, h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model_arima_custom
    } else if (byy == "month") {
      y <- ts(data, start = c(tahun, bulan), frequency = 12)
      model_arima <- auto.arima(y)
      model_arima_custom <- Arima(y, order = c(model_arima$arma[1], model_arima$arma[6], model_arima$arma[2]),
                                  seasonal = list(order = c(model_arima$arma[3], model_arima$arma[7], model_arima$arma[4]), period = model_arima$arma[5]), include.constant = TRUE)


      model <- forecast::forecast(model_arima_custom, h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model_arima_custom
    } else {
      y <- ts(data)
      model_arima <- auto.arima(y)
      model_arima_custom <- Arima(y, order = c(model_arima$arma[1], model_arima$arma[6], model_arima$arma[2]),
                                  seasonal = list(order = c(model_arima$arma[3], model_arima$arma[7], model_arima$arma[4]), period = model_arima$arma[5]), include.constant = TRUE)


      model <- forecast::forecast(model_arima_custom, h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model_arima_custom
    }

  } else {
    if (byy == "quarter") {
      y <- ts(data, start = c(tahun, kuartos(bulan)), frequency = 4)
      model_tbats <- tbats(y)
      model <- forecast::forecast(model_tbats, h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model_tbats
    } else if (byy == "month") {
      y <- ts(data, start = c(tahun, bulan), frequency = 12)
      model_tbats <- tbats(y)
      model <- forecast::forecast(model_tbats, h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model_tbats
    } else {
      y <- ts(data)
      model_tbats <- tbats(y)
      model <- forecast::forecast(model_tbats, h = jf)
      forecasting_r <- data.frame(Date = date2, Forecast = model$mean)
      actual_data <- data.frame(Date = date1, Actual = model$x)
      detailnya <- model_tbats
    }
  }
  hasil <- list(metode = metode, actual_data = actual_data, hasil_forecasting = forecasting_r, detail = detailnya)
  return(hasil)
}

#' Convert wide data format to list of data frames for forecasting
#' @param datawide Wide format data frame with date column and multiple variables
#' @return List of data frames, one for each variable
konversi_ke_list_forecast <- function(datawide) {
  # Deteksi kolom bertipe Date atau karakter yang mirip tanggal
  kemungkinan_tanggal <- names(datawide)[sapply(datawide, function(x) {
    inherits(x, "Date") ||
      all(grepl("^\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}$", as.character(x[!is.na(x)])))
  })]

  if (length(kemungkinan_tanggal) == 0) {
    stop("Tidak ada kolom yang terdeteksi sebagai tanggal.")
  } else if (length(kemungkinan_tanggal) > 1) {
    warning("Lebih dari satu kolom terdeteksi sebagai tanggal. Menggunakan kolom pertama: ", kemungkinan_tanggal[1])
  }

  kolom_tanggal <- kemungkinan_tanggal[1]

  # Konversi ke Date jika belum
  if (!inherits(datawide[[kolom_tanggal]], "Date")) {
    datawide[[kolom_tanggal]] <- as.Date(datawide[[kolom_tanggal]], tryFormats = c("%d/%m/%Y", "%Y-%m-%d", "%m/%d/%Y"))
  }

  # Konversi ke list of data.frame
  list_df <- lapply(names(datawide)[names(datawide) != kolom_tanggal], function(nama) {
    df <- data.frame(Date = datawide[[kolom_tanggal]], Value = datawide[[nama]])
    colnames(df) <- c("Date", "Value")
    return(df)
  })
  names(list_df) <- names(datawide)[names(datawide) != kolom_tanggal]
  return(list_df)
}

#' Calculate forecast accuracy for multiple variables (list format)
#' @param list_data List of data frames for forecasting
#' @param byy Time period type ("month", "quarter", "year")
#' @param makur Accuracy metric to use ("MAPE" or "RMSE")
#' @return List of accuracy results for each variable
loop_akurasi_forecast_list <- function(list_data, byy = "month", makur = "MAPE") {
  hasil <- future_lapply(names(list_data), function(nm) {
    df <- list_data[[nm]]
    if (ncol(df) >= 2) {
      akurasi <- best_forecast_metod(df, byy = byy, makur = makur)
      akurasi$Variable <- nm
      akurasi <- akurasi %>% dplyr::select(Variable, everything())
      return(akurasi)
    } else {
      warning(paste("⚠️ Data", nm, "tidak memiliki minimal 2 kolom."))
      return(NULL)
    }
  })

  names(hasil) <- names(list_data)
  return(hasil)
}

#' Combine forecast results from multiple variables into single data frame
#' @param hasil_list List of forecast results
#' @return Data frame with forecasts for all variables
gabung_hasil_forecast <- function(hasil_list) {
  suppressPackageStartupMessages(library(dplyr))

  df_final <- NULL

  for (nama_var in names(hasil_list)) {
    hasil <- hasil_list[[nama_var]]

    # Pastikan elemen ke-3 (forecast) ada dan berupa data.frame
    if (length(hasil) >= 3 && is.data.frame(hasil[[3]])) {
      df_forecast <- hasil[[3]]  # Forecast ada di elemen ke-3

      # Pastikan ada kolom "Forecast" dan "Date"
      if (all(c("Date", "Forecast") %in% colnames(df_forecast))) {
        df_var <- df_forecast %>%
          rename(!!nama_var := Forecast)

        if (is.null(df_final)) {
          df_final <- df_var
        } else {
          df_final <- full_join(df_final, df_var, by = "Date")
        }
      } else {
        warning(paste("⛔ Format tidak sesuai untuk:", nama_var))
      }
    } else {
      warning(paste("⛔ Hasil forecast kosong/tidak valid untuk variabel:", nama_var))
    }
  }

  return(df_final)
}

#' Execute forecasting using the best method for each variable
#' @param list_data List of data frames for forecasting
#' @param list_akurasi List of accuracy results from loop_akurasi_forecast_list
#' @param jf Number of periods to forecast (default: 12)
#' @param byy Time period type ("month", "quarter", "year")
#' @return List of forecast results using optimal methods
forecast_dengan_metode_terbaik <- function(list_data, list_akurasi, jf = 12, byy = "month") {
  hasil_forecast <- future_lapply(names(list_data), function(nama_var) {
    cat("📈 Forecasting:", nama_var, "\n")

    dat_satu <- list_data[[nama_var]]
    metode_terbaik <- list_akurasi[[nama_var]]$Metode[1]
    hasil <- memilih_metode(dat_satu, metode = metode_terbaik, jf = jf, byy = byy)

    return(list(nama = nama_var, hasil = hasil))
  })

  # Konversi kembali ke list bernama
  names_out <- sapply(hasil_forecast, `[[`, "nama")
  hasil_final <- lapply(hasil_forecast, `[[`, "hasil")
  names(hasil_final) <- names_out

  return(hasil_final)
}

#' Extract model accuracy metrics for forecast evaluation
#' @param model Forecast model object
#' @return Matrix of accuracy metrics
akurasi2 <- function(model) {
  model2 <- t(data.frame(ME = accuracy(model)[1],
                       RMSE = accuracy(model)[2],
                       MAE = accuracy(model)[3],
                       MPE = accuracy(model)[4],
                       MAPE = accuracy(model)[5],
                       ACF1 = accuracy(model)[6],
                       Theil = accuracy(model)[7]))
  model2
}

# Note: The following functions are referenced but would need to be implemented:
# - SM_Average: Single Moving Average function
# - LM_Average: Double Moving Average function
# - brownsapar: Brown's Simple Exponential Smoothing
# - kuartos: Quarter conversion function
# These are complex functions with many dependencies and would require additional extraction

# =============================================================================
# END OF FORECASTING UTILITY FUNCTIONS
# =============================================================================