# Aggressive suppression of package startup messages and conflicts
options(tidyverse.quiet = TRUE)
options(conflicts.policy = list(error = FALSE, warn = FALSE))

# Load conflicted first to manage expectations
suppressPackageStartupMessages(library(conflicted))

# Define preferences early if possible, though they usually apply after loading
# Date functions preferences (lubridate vs data.table)
conflict_prefer("hour", "lubridate", quiet = TRUE)
conflict_prefer("isoweek", "lubridate", quiet = TRUE)
conflict_prefer("isoyear", "lubridate", quiet = TRUE)
conflict_prefer("mday", "lubridate", quiet = TRUE)
conflict_prefer("minute", "lubridate", quiet = TRUE)
conflict_prefer("month", "lubridate", quiet = TRUE)
conflict_prefer("quarter", "lubridate", quiet = TRUE)
conflict_prefer("second", "lubridate", quiet = TRUE)
conflict_prefer("wday", "lubridate", quiet = TRUE)
conflict_prefer("week", "lubridate", quiet = TRUE)
conflict_prefer("yday", "lubridate", quiet = TRUE)
conflict_prefer("year", "lubridate", quiet = TRUE)

# General preferences
conflict_prefer("filter", "dplyr", quiet = TRUE)
conflict_prefer("select", "dplyr", quiet = TRUE)
conflict_prefer("between", "dplyr", quiet = TRUE)
conflict_prefer("first", "dplyr", quiet = TRUE)
conflict_prefer("last", "dplyr", quiet = TRUE)
conflict_prefer("lag", "dplyr", quiet = TRUE)
conflict_prefer("recode", "dplyr", quiet = TRUE)
conflict_prefer("transpose", "purrr", quiet = TRUE)
conflict_prefer("some", "purrr", quiet = TRUE)
conflict_prefer("spread", "tidyr", quiet = TRUE)
conflict_prefer("box", "shinydashboard", quiet = TRUE)
conflict_prefer("dataTableOutput", "DT", quiet = TRUE)
conflict_prefer("renderDataTable", "DT", quiet = TRUE)
conflict_prefer("select", "dplyr", quiet = TRUE)
conflict_prefer("validate", "shiny", quiet = TRUE)
conflict_prefer("layout", "plotly", quiet = TRUE)
conflict_prefer("date", "lubridate", quiet = TRUE)

# Load all other libraries silently
suppressPackageStartupMessages({
  library(forecast)
  library(ggplot2)
  library(tidyverse)
  library(tseries)
  library(smooth)
  library(fpp2)
  library(aTSA)
  library(date)
  library(lubridate)
  library(shiny)
  library(shinydashboard)
  library(DT)
  library(data.table)
  library(dplyr)
  library(openxlsx)
  library(lmtest)
  library(car)
  library(combinat)
  library(MASS)
  library(nortest)
  library(tibble)
  library(plotly)
  library(shinyWidgets)
  library(DBI)
  library(RPostgres)
})

# Load database configuration with robust path fallback.
database_config_candidates <- c(
  "config/database.R",
  file.path(getwd(), "config", "database.R"),
  file.path(Sys.getenv("R_ANALYTICS_SHINY_APP_DIR", getwd()), "config", "database.R"),
  "/opt/r-analytics/shiny-app/config/database.R"
)

database_config_path <- database_config_candidates[file.exists(database_config_candidates)][1]
if (!is.na(database_config_path)) {
  cat(sprintf("📖 Sourcing database config from: %s\n", database_config_path))
  flush.console()
  source(database_config_path)
} else {
  cat("⚠️ Warning: config/database.R not found\n")
  flush.console()
  warning(sprintf("config/database.R not found. Checked: %s", paste(unique(database_config_candidates), collapse = ", ")))
}
cat("✅ global.R basic setup complete\n")
if (exists("PD")) cat(sprintf("📊 PD available: %d rows\n", nrow(PD)))
if (exists("LGD")) cat(sprintf("📊 LGD available: %d rows\n", nrow(LGD)))
flush.console()






gen1varx <- function(data, target_var, independent_vars) {
  # Periksa apakah target_var ada dalam data
  if (!target_var %in% names(data)) {
    stop("Target variable tidak ditemukan dalam data.")
  }
  
  # Periksa apakah semua independent_vars ada dalam data
  missing_vars <- independent_vars[!independent_vars %in% names(data)]
  if (length(missing_vars) > 0) {
    stop(paste("Independent variable(s) tidak ditemukan dalam data:", paste(missing_vars, collapse = ", ")))
  }
  
  # Buat formula untuk setiap variabel independen
  formulas <- lapply(independent_vars, function(var) {
    as.formula(paste(target_var, "~", var))
  })
  
  # Beri nama pada setiap formula berdasarkan variabel independen
  names(formulas) <- independent_vars
  
  # Kembalikan list formula
  return(formulas)
}


###date otomate###
convert_dates <- function(df, threshold = 0.9,
                               date_formats = c("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y")) {
  
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



#convert_dates2 <- function(df, threshold = 0.9,
#                          date_formats = c("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y")) {
#  
#  # Validasi jumlah kolom
#  num_columns <- ncol(df)
#  if (num_columns > 2) {
#    message("File memiliki lebih dari 2 kolom.")
#  }
#  
#  # Pengecekan apakah ada kolom tanggal
#  is_date_col <- logical(length = ncol(df))
#  best_formats <- character(length = ncol(df))
#  
#  for (i in seq_along(df)) {
#    col <- df[[i]]
#    
#    # Ubah factor jadi character
#    if (is.factor(col)) {
#      col <- as.character(col)
#    }
#    
#    # Lanjut hanya jika character
#    if (!is.character(col)) next
#    
#    best_rate <- 0
#    best_format <- NA
#    
#    for (fmt in date_formats) {
#      parsed <- suppressWarnings(as.Date(col, format = fmt))
#      rate <- mean(!is.na(parsed))
#      
#      if (rate > best_rate) {
#        best_rate <- rate
#        best_format <- fmt
#      }
#      
#      if (best_rate >= 1) break
#    }
#    
#    if (best_rate >= threshold) {
#      df[[i]] <- as.Date(col, format = best_format)
#      is_date_col[i] <- TRUE
#      best_formats[i] <- best_format
#    }
#  }
#  
#  # Info kolom yang diubah
#  changed_cols <- names(df)[is_date_col]
#  if (length(changed_cols) > 0) {
#    message("Kolom yang dikonversi ke Date:")
#    for (j in seq_along(changed_cols)) {
#      message(sprintf("- %s (format: %s)", changed_cols[j], best_formats[is_date_col][j]))
#    }
#  } else {
#    message("Tidak ada kolom yang terdeteksi sebagai tanggal.")
#  }
#  
  # Mengembalikan hasil konversi dan validasi
#  result <- list(df = df, num_columns = num_columns, date_columns = changed_cols)
#  return(result)
#}

#convert_dates2 <- function(df, threshold = 0.9,
#                           date_formats = c("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y")) {
#  
#  if (is.null(df) || ncol(df) == 0) {
#    warning("Data kosong atau tidak memiliki kolom.")
#    return(list(df = df, num_columns = 0, date_columns = character()))
#  }
#  
#  is_date_col <- logical(length = ncol(df))
#  best_formats <- character(length = ncol(df))
#  
#  for (i in seq_along(df)) {
#    col <- df[[i]]
#    
#    if (is.factor(col)) col <- as.character(col)
#    if (!is.character(col)) next
#    
#    best_rate <- 0
#    best_format <- NA
#    
#    for (fmt in date_formats) {
#      parsed <- suppressWarnings(as.Date(col, format = fmt))
#      rate <- mean(!is.na(parsed))
#      
#      if (rate > best_rate) {
#        best_rate <- rate
#        best_format <- fmt
#      }
#      if (best_rate >= 1) break
#    }
#    
#    if (best_rate >= threshold) {
#      df[[i]] <- as.Date(col, format = best_format)
#      is_date_col[i] <- TRUE
#      best_formats[i] <- best_format
#    }
#  }
#  
#  changed_cols <- names(df)[is_date_col]
#  if (length(changed_cols) > 0) {
#    message("Kolom yang dikonversi ke Date:")
#    for (j in seq_along(changed_cols)) {
#      message(sprintf("- %s (format: %s)", changed_cols[j], best_formats[is_date_col][j]))
#    }
#  } else {
#    message("Tidak ada kolom yang terdeteksi sebagai tanggal.")
#  }
#  
#  return(list(df = df,
#              num_columns = ncol(df),
#              date_columns = changed_cols))
#}


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
  if (is.null(bb)) {
    bb <- min(datax[[tanggal_col]], na.rm = TRUE)
  } else {
    bb <- as.Date(bb)
  }
  
  # Konversi batas-batas ke Date
  bt <- as.Date(bt)
  ba <- as.Date(ba)
  
  # Filter data
  data1 <- datax[datax[[tanggal_col]] >= bb & datax[[tanggal_col]] <= bt, ]
  data2 <- datax[datax[[tanggal_col]] > bt & datax[[tanggal_col]] <= ba, ]
  
  # Return sebagai list
  return(list(data1 = data1, data2 = data2))
}



####intuisi####
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

####Running Model 1 variabel####
# Fungsi dengan tambahan R-squared, BIC, AIC, dan SSE
runmodel1p <- function(data, formulas) {
  # Inisialisasi list untuk menyimpan hasil
  results <- list()
  
  # Iterasi setiap formula
  for (i in seq_along(formulas)) {
    # Jalankan model dengan lm()
    model <- lm(formulas[[i]], data = data)
    
    # Ekstrak summary dari model
    summary_model <- summary(model)
    
    # Hitung metrik tambahan
    r_squared <- summary_model$r.squared
    aic <- AIC(model)
    bic <- BIC(model)
    sse <- sum(residuals(model)^2)
    
    
    # Ambil koefisien, t-value, dan p-value dari model
    coef_info <- summary_model$coefficients
    result <- data.frame(
      Variables = rownames(coef_info),
      Estimate = coef_info[, "Estimate"], 
      tValue = coef_info[, "t value"],
      Probt = coef_info[, "Pr(>|t|)"],
      R_Squared = r_squared,
      AIC = aic,
      BIC = bic,
      SSE = sse,
      stringsAsFactors = FALSE
    )
    
    # Hapus baris Intercept
    result <- result[!grepl("\\(Intercept\\)", result$Variables), ]
    
    # Tambahkan ke list hasil
    results[[names(formulas)[i]]] <- result
  }
  
  # Gabungkan semua hasil menjadi satu dataframe
  final_result <- do.call(rbind, results)
  
  
  # Return list hasil dan metrik
  return(final_result)
}

#seleksi dari hasil regresi 1 variabel berdasarkan rsquare/pvalue atau keduanya# 
smr1var <- function(data, batasrsq = 0.5, batasprobt = 0.05) {
  
  if(batasrsq != 0 & batasprobt != 0){
    data$statusreg1 <- ifelse(data$R_Squared > batasrsq & data$Probt < batasprobt,
                              "pass",
                              "eliminate"
    )
  }else if(batasrsq != 0){
    data$statusreg1 <- ifelse(data$R_Squared > batasrsq, "pass", "eliminate")
  }else if(batasprobt!=0){
    data$statusreg1 <- ifelse(data$Probt < batasprobt, "pass", "eliminate")
  }else {
    data$statusreg1 <- rep("pass",nrow(data))
  }
  
  # Jika ingin menyeleksi berdasarkan keduanya
  return(data)
}


####seleksi korelasi 2 variabel####
tabel_korelasi2 <- function(data, chunk_size = 1000) {
  # Konversi ke data.table untuk efisiensi
  data <- as.data.table(data)
  
  # Hitung matriks korelasi
  cor_matrix <- cor(data)
  
  # Ambil nama variabel
  independent_vars <- colnames(data)
  sources <- sapply(strsplit(independent_vars, "_"), `[`, 1)
  
  # Buat vektor pencocokan sumber
  variable_source <- setNames(sources, independent_vars)
  
  # Generate kombinasi unik dari 2 variabel dengan sumber berbeda
  valid_combinations_2 <- Filter(
    function(combo) length(unique(variable_source[combo])) == 2,
    combn(independent_vars, 2, simplify = FALSE)
  )
  
  # Fungsi untuk memproses dalam partisi
  process_chunk <- function(chunk) {
    combinations <- rbindlist(lapply(chunk, function(x) list(x[1], x[2])))
    setnames(combinations, c("Variable1", "Variable2"))
    
    # Ambil nilai korelasi dengan indexing matriks langsung menggunakan mget
    combinations[, `:=` (
      Variable12 = mapply(function(v1, v2) cor_matrix[v1, v2], Variable1, Variable2)
    )]
    
  }
  
  # Memproses data dalam chunk
  hasil_list <- lapply(split(valid_combinations_2, ceiling(seq_along(valid_combinations_2) / chunk_size)), process_chunk)
  
  # Gabungkan hasil
  hasil <- rbindlist(hasil_list, use.names = TRUE, fill = TRUE)
  
  return(hasil)
}



####Seleksi korelasi untuk 3 variabel####
#korelasi terbaru

tabel_korelasi <- function(data, threshold = 0, chunk_size = 1000) {
  # Konversi ke data.table untuk efisiensi
  data <- as.data.table(data)
  
  # Hitung matriks korelasi
  cor_matrix <- cor(data)
  
  # Ambil nama variabel
  independent_vars <- colnames(data)
  sources <- sapply(strsplit(independent_vars, "_"), `[`, 1)
  
  # Buat vektor pencocokan sumber
  variable_source <- setNames(sources, independent_vars)
  
  # Generate kombinasi unik dari tiga variabel dengan sumber berbeda
  valid_combinations_3 <- Filter(
    function(combo) length(unique(variable_source[combo])) == 3,
    combn(independent_vars, 3, simplify = FALSE)
  )
  
  # Jika tidak ada kombinasi valid
  if (length(valid_combinations_3) == 0) {
    warning("Tidak ada kombinasi 3 variabel dari sumber berbeda yang ditemukan.")
    return(data.table())
  }
  
  # Fungsi untuk memproses dalam partisi
  process_chunk <- function(chunk) {
    combinations <- rbindlist(lapply(chunk, function(x) list(x[1], x[2], x[3])))
    setnames(combinations, c("Variable1", "Variable2", "Variable3"))
    
    # Ambil nilai korelasi dengan indexing matriks langsung menggunakan mget
    combinations[, `:=` (
      Variable12 = mapply(function(v1, v2) cor_matrix[v1, v2], Variable1, Variable2),
      Variable13 = mapply(function(v1, v3) cor_matrix[v1, v3], Variable1, Variable3),
      Variable23 = mapply(function(v2, v3) cor_matrix[v2, v3], Variable2, Variable3)
    )]
    
  }
  
  # Memproses data dalam chunk
  hasil_list <- lapply(split(valid_combinations_3, ceiling(seq_along(valid_combinations_3) / chunk_size)), process_chunk)
  
  # Gabungkan hasil
  hasil <- rbindlist(hasil_list, use.names = TRUE, fill = TRUE)
  
  return(hasil)
}

#buat model dari seleksi korelasi 2#
gre2 <- function(y,data) {
  data1 <- data[,paste(y,"~", Variable1, "+", Variable2)]
  return(data1)
}


####regresi 2 variabel####
runreg2models2 <- function(data, target_var, regression_models, chunk_size = 1000) {
  actual <- data[[target_var]]  # Data aktual untuk perhitungan metrik
  
  process_model <- function(formula) {
    model <- lm(formula, data = data)
    summary_model <- summary(model)
    
    coef_model <- coef(model)
    coef_names <- rownames(summary_model$coefficients)
    
    # Pastikan ada cukup variabel untuk menghindari error
    var1 <- ifelse(length(coef_names) > 1, coef_names[2], NA)
    var2 <- ifelse(length(coef_names) > 2, coef_names[3], NA)
    p_values <- coef(summary_model)[, 4]  # p-values termasuk Intercept
    r_squared <- summary_model$r.squared
    r_squared_adjusted <- summary_model$adj.r.squared
    predicted <- predict(model, data)
    
    # Pastikan fungsi calc_rmse tersedia atau gunakan sqrt(mean((actual - predicted)^2))
    rmse <- sqrt(mean((actual - predicted)^2, na.rm = TRUE))
    
    return(data.frame(
      Model = deparse(formula),
      var1 = var1,
      var2 = var2,
      Intercept = coef_model[1],
      Coef_V1 = coef_model[2],
      Coef_V2 = coef_model[3],
      Pr_intercept = p_values[1],
      Pr_Variable1 = p_values[2],
      Pr_Variable2 = p_values[3],
      R_squared = round(r_squared, 6),
      R_squared_adjusted = round(r_squared_adjusted, 6),
      stringsAsFactors = FALSE
    ))
  }
  
  results_list <- vector("list", length(regression_models))  # Prealokasi list
  
  num_chunks <- ceiling(length(regression_models) / chunk_size)
  
  for (chunk in seq_len(num_chunks)) {
    start_idx <- (chunk - 1) * chunk_size + 1
    end_idx <- min(chunk * chunk_size, length(regression_models))
    
    chunk_models <- regression_models[start_idx:end_idx]
    results_list[start_idx:end_idx] <- lapply(chunk_models, process_model)
  }
  
  results <- do.call(rbind, results_list)  
  results <- unique(results)  # Menghapus hasil yang berulang
  rownames(results) <- paste0("M",1:length(regression_models))
  return(results)
}



#buat model dari seleksi korelasi 3#
gre3 <- function(y, data) {
  required_vars <- c("Variable1", "Variable2", "Variable3")
  
  # Cek kolom wajib ada
  if (!all(required_vars %in% colnames(data))) {
    warning("Variabel wajib tidak ditemukan di dataset.")
    return(character(0))
  }
  
  # Cek jika data kosong (tidak ada baris)
  if (nrow(data) == 0) {
    warning("Dataset kosong. Tidak ada formula yang bisa dibuat.")
    return(character(0))
  }
  
  data <- na.omit(data)
  
  # Buat formula berdasarkan kombinasi Variable1 + Variable2 + Variable3
  formulas <- paste(y, "~", data$Variable1, "+", data$Variable2, "+", data$Variable3)
  return(formulas)
}



runreg3models2 <- function(data, target_var, regression_models, chunk_size = 1000, parallel = FALSE, probt = 0.05) {
  actual <- data[[target_var]]
  
  # Cek jika regression_models kosong
  if (length(regression_models) == 0) {
    warning("regression_models kosong. Tidak ada model yang bisa diproses.")
    return(data.frame())
  }
  
  calc_mape <- function(actual, predicted) {
    mean(abs((actual - predicted) / actual)) * 100
  }
  
  calc_rmse <- function(actual, predicted) {
    sqrt(mean((actual - predicted)^2))
  }
  
  process_model <- function(formula) {
    tryCatch({
      model <- lm(formula, data = data)
      summary_model <- summary(model)
      coef_model <- coef(model)
      p_values <- coef(summary_model)[, 4]
      coef_names <- names(coef_model)
      
      var1 <- ifelse(length(coef_names) > 1, coef_names[2], NA)
      var2 <- ifelse(length(coef_names) > 2, coef_names[3], NA)
      var3 <- ifelse(length(coef_names) > 3, coef_names[4], NA)
      
      data.frame(
        Model = paste(deparse(formula), collapse = " "),
        var1 = var1,
        var2 = var2,
        var3 = var3,
        Intercept = ifelse(length(coef_model) >= 1, coef_model[1], NA),
        Coef_V1 = ifelse(length(coef_model) >= 2, coef_model[2], NA),
        Coef_V2 = ifelse(length(coef_model) >= 3, coef_model[3], NA),
        Coef_V3 = ifelse(length(coef_model) >= 4, coef_model[4], NA),
        Pr_intercept = ifelse(length(p_values) >= 1, p_values[1], NA),
        Pr_Variable1 = ifelse(length(p_values) >= 2, p_values[2], NA),
        Pr_Variable2 = ifelse(length(p_values) >= 3, p_values[3], NA),
        Pr_Variable3 = ifelse(length(p_values) >= 4, p_values[4], NA),
        R_squared = round(summary_model$r.squared, 6),
        R_squared_adjusted = round(summary_model$adj.r.squared, 6)
      )
    }, error = function(e) {
      return(NULL)
    })
  }
  
  results_list <- vector("list", length(regression_models))
  num_chunks <- ceiling(length(regression_models) / chunk_size)
  
  for (chunk in seq_len(num_chunks)) {
    start_idx <- (chunk - 1) * chunk_size + 1
    end_idx <- min(chunk * chunk_size, length(regression_models))
    chunk_models <- regression_models[start_idx:end_idx]
    
    if (parallel) {
      plan(multisession)
      results_list[start_idx:end_idx] <- future_lapply(chunk_models, process_model)
    } else {
      results_list[start_idx:end_idx] <- lapply(chunk_models, process_model)
    }
  }
  
  results_list <- results_list[!sapply(results_list, is.null)]
  if (length(results_list) == 0) return(data.frame())
  
  results <- do.call(rbind, results_list)
  results <- unique(results)
  rownames(results) <- paste0("M", 1:nrow(results))
  return(results)
}




# Fungsi uji asumsi dan akurasi
ujiasumsi <- function(data, target_var, regression_models,normalmethod = "anderson",homogenmethod="breusch", chunk_size = 1000) {
  
  # Pastikan string bersih dari karakter escape (\")
  regression_models <- gsub('\"', '', regression_models)
  regression_models <- lapply(regression_models, as.formula)
  
  # Pastikan input berupa list formula
  if (!is.list(regression_models)) {
    stop("Error: regression_models harus berupa list formula!")
  }
  
  # Data aktual untuk perhitungan metrik
  actual <- data[[target_var]]  
  
  # Fungsi untuk menghitung MAPE
  calc_mape <- function(actual, predicted) {
    mean(abs((actual - predicted) / actual), na.rm = TRUE) * 100
  }
  
  # Fungsi untuk menghitung RMSE
  calc_rmse <- function(actual, predicted) {
    sqrt(mean((actual - predicted)^2, na.rm = TRUE))
  }
  
  
  # Fungsi untuk uji normalitas
  uji_normalitas <- function(data, method = normalmethod) {
    if (!is.numeric(data)) {
      stop("Data harus berupa numerik!")
    }
    
    result <- switch(normalmethod,
                     "shapiro" = shapiro.test(data),
                     "kolmogorov" = ks.test(data, "pnorm", mean(data), sd(data)),
                     "anderson" = ad.test(data),
                     stop("Metode tidak dikenali! Pilih: 'shapiro', 'kolmogorov', atau 'anderson'")
    )
    
    return(result)
  }
  
  # Fungsi untuk uji homogenitas varians
  uji_homogenitas <- function(model, method = homogenmethod) {
    if (!inherits(model, "lm")) {
      stop("Input harus berupa model regresi linear!")
    }
    
    result <- switch(method,
                     "breusch" = bptest(model),
                     "white" = white.test(model),
                     stop("Metode tidak dikenali! Pilih: 'breusch' atau 'white'")
    )
    
    return(result)
  }
  
  # Fungsi untuk mengolah model
  process_model <- function(formula) {
    model <- lm(formula, data = data)
    predicted <- predict(model, data)
    
    # Hitung metrik evaluasi
    mape <- calc_mape(actual, predicted)
    rmse <- calc_rmse(actual, predicted)
    
    # Uji asumsi
    normal_testP <- uji_normalitas(residuals(model))$p.value
    homogen_testP <- uji_homogenitas(model)$p.value
    dw_p <- dwtest(model)$p.value
    nilai_vif <- vif(model)
    
    # Pastikan panjang nilai VIF sesuai jumlah prediktor
    vif_values <- rep(NA, 3)  # Default: NA jika prediktor <3
    vif_values[1:length(nilai_vif)] <- nilai_vif
    
    return(data.frame(
      Model = paste(deparse(formula), collapse = " "),
      MAPE = round(mape, 6),
      RMSE = round(rmse, 6),
      normal_P = round(normal_testP, 4),
      homogen_P = round(homogen_testP, 4),
      DW_P = round(dw_p, 4),
      VIF1 = vif_values[1],
      VIF2 = vif_values[2],
      VIF3 = vif_values[3]
    ))
  }
  
  # Prealokasi list hasil
  results_list <- vector("list", length(regression_models))
  
  # Proses model dalam chunk untuk efisiensi
  num_chunks <- ceiling(length(regression_models) / chunk_size)
  for (chunk in seq_len(num_chunks)) {
    start_idx <- (chunk - 1) * chunk_size + 1
    end_idx <- min(chunk * chunk_size, length(regression_models))
    chunk_models <- regression_models[start_idx:end_idx]
    
    results_list[start_idx:end_idx] <- lapply(chunk_models, process_model)
  }
  
  # Gabungkan hasil dan hapus duplikasi
  results <- do.call(rbind, results_list)  
  results <- unique(results)  
  
  return(results)
}


backtesting <- function(datatrain, datatest, target_var, regression_models) {
  
  # Pastikan string bersih dari karakter escape (")
  regression_models <- gsub('\"', '', regression_models)
  regression_models <- lapply(regression_models, as.formula)
  
  data <- datatrain
  # Data aktual untuk perhitungan metrik
  actual_train <- data[[target_var]]  
  actual_test <- datatest[[target_var]]

  
  # Fungsi untuk menghitung MAPE
  calc_mape <- function(actual, predicted) {
    # Gabungkan jadi data frame
    gbung <- data.frame(actual = actual, predicted = predicted)
    
    # Hapus baris di mana actual = 0
    gbung <- gbung[gbung$actual != 0, ]
    
    # Hitung MAPE dari data yang sudah difilter
    mean(abs((gbung$actual - gbung$predicted) / gbung$actual), na.rm = TRUE) * 100
  }
  
  # Fungsi untuk menghitung RMSE
  calc_rmse <- function(actual, predicted) {
    sqrt(mean((actual - predicted)^2, na.rm = TRUE))
  }
  
  # Prealokasi list hasil
  results_list <- list()
  
  # Loop melalui setiap model dalam regression_models
  for (i in seq_along(regression_models)) {
    formula <- regression_models[[i]]
    
    # Buat model regresi
    model <- lm(formula, data = data)
    
    # Prediksi untuk in-sample (training) dan out-sample (testing)
    predicted_train <- predict(model, data)
    predicted_test <- predict(model, datatest)
    predicted_fulldata <- predict(model,fulldata)
    summary_model <- summary(model)
    
    r_squared <- summary_model$r.squared
    r_squared_adjusted <- summary_model$adj.r.squared
    
    # Hitung metrik evaluasi
    mape_train <- calc_mape(actual_train, predicted_train)
    rmse_train <- calc_rmse(actual_train, predicted_train)
    mape_test <- calc_mape(actual_test, predicted_test)
    rmse_test <- calc_rmse(actual_test, predicted_test)
    
    # Simpan hasil dalam data frame
    results_list[[i]] <- data.frame(
      Model = paste(deparse(formula), collapse = " "),
      MAPEinsample = round(mape_train, 6),
      RMSEinsample = round(rmse_train, 6),
      MAPEoutsample = round(mape_test, 6),
      RMSEoutsample = round(rmse_test, 6),
      R_squared = round(r_squared, 6),
      R_squared_adjusted = round(r_squared_adjusted, 6)
    )
  }
  
  # Gabungkan hasil menjadi satu dataframe
  results <- do.call(rbind, results_list)
  
  return(results)
}

backtesting2 <- function(datatrain, datatest,datagabung, target_var, regression_models) {
  fulldata=datagabung
  # Pastikan string bersih dari karakter escape (")
  regression_models <- gsub('\"', '', regression_models)
  regression_models <- lapply(regression_models, as.formula)
  
  data <- datatrain
  # Data aktual untuk perhitungan metrik
  actual_train <- data[[target_var]]  
  actual_test <- datatest[[target_var]]
  actual_fulldata <- fulldata[[target_var]]
  
  
  # Fungsi untuk menghitung MAPE
  calc_mape <- function(actual, predicted) {
    # Gabungkan jadi data frame
    gbung <- data.frame(actual = actual, predicted = predicted)
    
    # Hapus baris di mana actual = 0
    gbung <- gbung[gbung$actual != 0, ]
    
    # Hitung MAPE dari data yang sudah difilter
    mean(abs((gbung$actual - gbung$predicted) / gbung$actual), na.rm = TRUE) * 100
  }
  
  # Fungsi untuk menghitung RMSE
  calc_rmse <- function(actual, predicted) {
    sqrt(mean((actual - predicted)^2, na.rm = TRUE))
  }
  
  # Prealokasi list hasil
  results_list <- list()
  
  # Loop melalui setiap model dalam regression_models
  for (i in seq_along(regression_models)) {
    formula <- regression_models[[i]]
    
    # Buat model regresi
    model <- lm(formula, data = data)
    
    # Prediksi untuk in-sample (training) dan out-sample (testing)
    predicted_train <- predict(model, data)
    predicted_test <- predict(model, datatest)
    predicted_fulldata <- predict(model,fulldata)
    summary_model <- summary(model)
    
    r_squared <- summary_model$r.squared
    r_squared_adjusted <- summary_model$adj.r.squared
    
    # Hitung metrik evaluasi
    mape_train <- calc_mape(actual_train, predicted_train)
    rmse_train <- calc_rmse(actual_train, predicted_train)
    mape_test <- calc_mape(actual_test, predicted_test)
    rmse_test <- calc_rmse(actual_test, predicted_test)
    mape_gabung <- calc_mape(actual_fulldata,predicted_fulldata)
        
    # Simpan hasil dalam data frame
    results_list[[i]] <- data.frame(
      Model = paste(deparse(formula), collapse = " "),
      MAPEinsample = round(mape_train, 6),
      RMSEinsample = round(rmse_train, 6),
      MAPEoutsample = round(mape_test, 6),
      MAPEgabung = round(mape_gabung,6),
      RMSEoutsample = round(rmse_test, 6),
      R_squared = round(r_squared, 6),
      R_squared_adjusted = round(r_squared_adjusted, 6)
    )
  }
  
  # Gabungkan hasil menjadi satu dataframe
  results <- do.call(rbind, results_list)
  
  return(results)
}


runreg3models3 <- function(data, target_var, regression_models, chunk_size = 1000, parallel = FALSE,probt=0.05) {
  
  # Data aktual untuk perhitungan metrik
  actual <- data[[target_var]]  

  # Fungsi untuk menghitung MAPE
  calc_mape <- function(actual, predicted) {
    # Gabungkan jadi data frame
    gbung <- data.frame(actual = actual, predicted = predicted)
    
    # Hapus baris di mana actual = 0
    gbung <- gbung[gbung$actual != 0, ]
    
    # Hitung MAPE dari data yang sudah difilter
    mean(abs((gbung$actual - gbung$predicted) / gbung$actual), na.rm = TRUE) * 100
  }
  
  # Fungsi untuk menghitung RMSE
  calc_rmse <- function(actual, predicted) {
    sqrt(mean((actual - predicted)^2, na.rm = TRUE))
  }  
  
  regression_models <- gsub('\"', '', regression_models)
  regression_models <- lapply(regression_models, as.formula)
  
  
  # Prealokasi list hasil
  results_list <- list()
  
  
  for (i in seq_along(regression_models)) {
    formula <- regression_models[[i]]
    
    # Buat model regresi
    model <- lm(formula, data = data)
    summary_model <- summary(model)
    coef_model <- coef(model)
    coef_names <- rownames(summary_model$coefficients)
    
    
    # Pastikan ada cukup variabel untuk menghindari error
    var1 <- ifelse(length(coef_names) > 1, coef_names[2], NA)
    var2 <- ifelse(length(coef_names) > 2, coef_names[3], NA)
    var3 <- ifelse(length(coef_names) > 3, coef_names[4], NA)
    
    p_values <- coef(summary_model)[, 4]  # p-values tanpa Intercept
    r_squared <- summary_model$r.squared
    r_squared_adjusted <- summary_model$adj.r.squared
    significant_vars <- sum(p_values <= probt)
    
    # Prediksi untuk in-sample (training) dan out-sample (testing)
    summary_model <- summary(model)
    r_squared <- summary_model$r.squared
    r_squared_adjusted <- summary_model$adj.r.squared

    
    # Simpan hasil dalam data frame
    results_list[[i]] <- data.frame(
      Model = paste(deparse(formula), collapse = " "),
      var1 = var1,
      var2 = var2,
      var3 = var3,
      Intercept = coef_model[1],
      Coef_V1 = coef_model[2],
      Coef_V2 = coef_model[3],
      Coef_V3 = coef_model[4],
      Pr_intercept = p_values[1],
      Pr_Variable1 = p_values[2],
      Pr_Variable2 = p_values[3],
      Pr_Variable3 = p_values[4],
      R_squared = round(r_squared, 6),
      R_squared_adjusted = round(r_squared_adjusted, 6)
    )
  }
  
  # Gabungkan hasil menjadi satu dataframe
  results <- do.call(rbind, results_list)
  rownames(results) <- paste0("M",1:length(regression_models))
  return(results)
}


transform <- function(data) {
  vars <- names(data)
  data <- data %>%
    mutate(across(where(~ any(grepl("%", .))), ~ as.numeric(gsub("%", "", .)) / 100))
  
  lag_mapping <- c(3, 6, 9, 12)
  lag_labels <- c(1, 2, 3, 4)
  
  for (var in vars) {
    data <- data %>%
      mutate(
        # Y Transformation
        !!paste0(var, "_Y") := (.data[[var]] / lag(.data[[var]], 12)) - 1
      )
    
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


transform2 <- function(data) {
  vars <- names(data)
  data <- data %>%
    mutate(across(where(~ any(grepl("%", .))), ~ as.numeric(gsub("%", "", .)) / 100))
  
  lag_mapping <- c(3, 6, 9, 12)
  lag_labels <- c(1, 2, 3, 4)
  
  for (var in vars) {
    data <- data %>%
      mutate(
        # Y Transformation
        !!paste0(var, "_Y") := (.data[[var]] / lag(.data[[var]], 12)) - 1
      )
    
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
  bad_cols <- sapply(data, function(col) any(is.infinite(col) | is.nan(col)))
  data <- data[, !bad_cols, drop = FALSE]
  return(data)
}



drop_cols_with_hash_errors <- function(df) {
  # pola semua hash error umum Excel (sesuaikan jika hanya perlu #NUM!)
  pat <- "^(#NUM!|#DIV/0!|#VALUE!|#N/A|#REF!|#NAME\\?)$"
  
  has_hash <- vapply(
    df,
    function(x) {
      # grepl aman untuk non-character juga (akan di-coerce)
      any(grepl(pat, x, perl = TRUE))
    },
    logical(1)
  )
  df[, !has_hash, drop = FALSE]
}



model23 <- function(model_reg2var, model_reg3var) {
  # Filter model yang lolos (statusreg == "pass")
  runmodel2faktor <- tryCatch({
    if (!is.null(model_reg2var)) {
      model_reg2var[model_reg2var$statusreg == "pass", ]
    } else {
      data.frame()
    }
  }, error = function(e) data.frame())
  
  runmodel3faktor <- tryCatch({
    if (!is.null(model_reg3var)) {
      model_reg3var[model_reg3var$statusreg == "pass", ]
    } else {
      data.frame()
    }
  }, error = function(e) data.frame())
  
  # Logika penggabungan
  if (nrow(runmodel3faktor) > 0 && nrow(runmodel2faktor) > 0) {
    hasil <- dplyr::bind_rows(runmodel3faktor, runmodel2faktor) %>%
      dplyr::select(-statusreg)
  } else if (nrow(runmodel2faktor) > 0) {
    hasil <- runmodel2faktor %>%
      dplyr::select(-statusreg)
  } else if (nrow(runmodel3faktor) > 0) {
    hasil <- runmodel3faktor %>%
      dplyr::select(-statusreg)
  } else {
    return(data.frame())  # Tidak ada model yang lolos
  }
  
  # Tambahkan rownames sebagai M1, M2, ...
  hasil <- hasil %>%
    tibble::rownames_to_column(var = "rownames") %>%
    dplyr::mutate(rownames = paste0("M", dplyr::row_number())) %>%
    tibble::column_to_rownames(var = "rownames")
  
  return(hasil)
}



model_regnf <- function(fulldata, datax, namay, runmodel2faktor, 
                        paramkorelasi = 0.6, alpha = 0.05) {
  
    tabkorel3 <- tabel_korelasi(datax)
  
  ## Gunakan tabel korelasi 3 variabel yang sudah disediakan
  if (is.null(tabkorel3)) {
    cat("DEBUG: Tabel korelasi 3 kosong, melanjutkan tanpa tabkorel3.\n")
    tabkorel3 <- data.frame()  # Set sebagai data frame kosong jika tidak ada
  }
  
  if (nrow(tabkorel3) > 0) {
    # Proses hanya jika tabkorel3 tidak kosong
    tabkorel3 <- tabkorel3 %>%
      dplyr::filter(
        Variable1 %in% vars_valid,
        Variable2 %in% vars_valid,
        Variable3 %in% vars_valid
      )
    
    if (!all(c("Variable12", "Variable13", "Variable23") %in% names(tabkorel3))) return(NULL)
    
    tabkorel3 <- na.omit(tabkorel3)
    tabkorel3$statuskor3 <- ifelse(rowSums(abs(tabkorel3[, c("Variable12", "Variable13", "Variable23")]) < paramkorelasi) == 3, "pass", "eliminate")
    model3faktor <- tabkorel3[tabkorel3$statuskor3 == "pass", 1:3]
    
    ## Run model 3 variabel
    if (nrow(model3faktor) > 0) {
      modreg3 <- gre3(namay, model3faktor)
      hasilmodreg3 <- runreg3models2(fulldata, namay, modreg3)
      hasilmodreg3$statusreg <- ifelse(rowSums(hasilmodreg3[, 10:12] < alpha) == 3, "pass", "eliminate")
      runmodel3faktor <- hasilmodreg3[hasilmodreg3$statusreg == "pass", ]
    } else {
      runmodel3faktor <- data.frame()  # Jika tidak ada model 3 variabel yang valid
    }
  } else {
    runmodel3faktor <- data.frame()  # Jika tabkorel3 kosong
  }
  
  ## Gabung hasil model
  if (nrow(runmodel3faktor) > 0) {
    model23 <- bind_rows(runmodel3faktor, runmodel2faktor) %>%
      dplyr::select(-statusreg)
  } else {
    model23 <- runmodel2faktor %>%
      dplyr::select(-statusreg)
  }
  
  if (nrow(model23) == 0) return(NULL)
  
  model23 <- model23 %>%
    tibble::rownames_to_column("rownames") %>%
    dplyr::mutate(rownames = paste0("M", dplyr::row_number())) %>%
    tibble::column_to_rownames("rownames")
  
  return(model23)
}



transform_y <- function(df, transformations = c("logit", "average", "moving_average", "log"), 
                        logit_value = 0.000001, moving_avg_window = 3) {
  
  # Fungsi untuk transformasi Logit
  logit_transform <- function(x, logit_value) {
    x <- ifelse(x == 0, logit_value, x)
    log(x / (1 - x))
  }
  
  # Fungsi untuk transformasi Average (Cumulative Average)
  average_transform <- function(x) {
    cumsum(x) / seq_along(x)
  }
  
  # Fungsi untuk transformasi Moving Average
  moving_average_transform <- function(x, window) {
    # Menggunakan filter() dari package stats untuk moving average
    stats::filter(x, rep(1 / window, window), sides = 2)
  }
  
  # Fungsi untuk transformasi Log
  log_transform <- function(x) {
    log(x)
  }
  
  col_name <- names(df)[2]
  
  # Iterasi melalui semua transformasi yang dipilih
  for (transformation in transformations) {
    if (transformation == "logit") {
      df[[paste0("logit_", col_name)]] <- sapply(df[[col_name]], logit_transform, logit_value = logit_value)
    } else if (transformation == "average") {
      df[[paste0("average_", col_name)]] <- average_transform(df[[col_name]])
    } else if (transformation == "moving_average") {
      df[[paste0("ma_", col_name)]] <- moving_average_transform(df[[col_name]], moving_avg_window)
    } else if (transformation == "log") {
      df[[paste0("log_", col_name)]] <- log_transform(df[[col_name]])
    }
  }
  
  return(df)
}


inner_join_date <- function(df1, df2) {
  
  # Mendeteksi kolom bertipe Date di df1
  date_col1 <- names(df1)[sapply(df1, inherits, "Date")]
  
  # Mendeteksi kolom bertipe Date di df2
  date_col2 <- names(df2)[sapply(df2, inherits, "Date")]
  
  # Periksa jika kedua tabel memiliki kolom tanggal yang valid
  if (length(date_col1) == 0 | length(date_col2) == 0) {
    stop("Kolom tanggal tidak ditemukan pada salah satu atau kedua tabel.")
  }
  
  # Ganti nama kolom tanggal menjadi "Date" di kedua data frame
  names(df1)[names(df1) == date_col1] <- "Date"
  names(df2)[names(df2) == date_col2] <- "Date"
  
  # Ganti ke akhir bulan yang benar
  df1$Date <- ceiling_date(df1$Date, "month") - days(1)  # Akhir bulan
  df1$Date <- as.Date(df1$Date)
  
  # Parsing dan konversi kolom Date ke format yang konsisten di df2
  # Ganti ke akhir bulan yang benar
  df2$Date <- ceiling_date(df2$Date, "month") - days(1)  # Akhir bulan
  df2$Date <- as.Date(df2$Date)
  
  # Melakukan inner join berdasarkan kolom tanggal
  merged_df <- merge(df1, df2, by = "Date", all = FALSE)
  
  return(merged_df)
}



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
  
  # Menghapus kolom duplikat
  df <- df[, !duplicated(names(df))]
  
  # Mengubah persen menjadi angka tanpa persen yang sudah dibagi 100
  for (col in 2:ncol(df)) {
    if (any(grepl("%", df[[col]]))) {
      df[[col]] <- as.numeric(gsub("%", "", df[[col]])) / 100
    }
  }
  
  # Menyaring data yang memiliki tanggal yang sama dalam satu bulan
  date_duplicates <- table(format(df[[1]], "%Y-%m")) > 1
  if (any(date_duplicates)) {
    cat("Terdapat tanggal yang sama dalam 1 bulan:\n")
    print(names(date_duplicates[date_duplicates == TRUE]))
  }
  
  return(df)
}





###########################################forecast Y all model####################################################

predict_from_model_table_safe <- function(model_tbl, 
                                          train_data, 
                                          new_data,
                                          formula_col = "Model") {
  
  ## 1. Deteksi kolom Date otomatis
  date_col <- names(new_data)[
    sapply(new_data, function(x) inherits(x, c("Date", "POSIXct", "POSIXt")))
  ]
  
  date_col <- date_col[1]  # ambil satu saja (jika ada beberapa)
  
  ## 2. Ambil formula & bersihkan tanda kutip
  formula_chr <- model_tbl[[formula_col]]
  formula_chr <- gsub('^"|"$', '', formula_chr)   # hapus " di awal/akhir
  
  ## 3. Konversi ke formula SATU-PER-SATU (INI PENTING)
  formulas <- lapply(formula_chr, as.formula)
  
  ## 4. Prediksi
  preds <- lapply(formulas, function(fm) {
    tryCatch({
      fit <- lm(fm, data = train_data)
      predict(fit, newdata = new_data)
    }, error = function(e) {
      rep(NA_real_, nrow(new_data))
    })
  })
  
  ## 5. Gabungkan ke data.frame
  pred_df <- as.data.frame(preds)
  colnames(pred_df) <- rownames(model_tbl)
  
  ## 6. Ikutkan Date jika ada
  if (!is.na(date_col)) {
    pred_df <- cbind(
      Date = new_data[[date_col]],
      pred_df
    )
  }
  
  return(pred_df)
}



######################################average forecast Y###############################################
add_average_forecast <- function(forecast_df,
                                 window_size,
                                 unit = c("Y", "M"),
                                 date_col = NULL) {
  
  unit <- match.arg(unit)
  
  # === Deteksi kolom Date otomatis ===
  if (is.null(date_col)) {
    date_col <- names(forecast_df)[
      sapply(forecast_df, inherits, c("Date", "POSIXct", "POSIXt"))
    ][1]
  }
  
  if (is.na(date_col)) {
    stop("Kolom Date tidak ditemukan")
  }
  
  # === Ambil kolom model saja ===
  model_cols <- setdiff(names(forecast_df), date_col)
  model_data <- forecast_df[, model_cols, drop = FALSE]
  
  n_forecast <- nrow(model_data)
  n_group    <- ceiling(n_forecast / window_size)
  
  # === Prefix kolom ===
  prefix <- ifelse(unit == "Y", "Y", "M")
  
  # === Hitung average per model ===
  result <- lapply(seq_len(n_group), function(i) {
    
    idx_start <- (i - 1) * window_size + 1
    idx_end   <- min(i * window_size, n_forecast)
    
    colMeans(
      model_data[idx_start:idx_end, , drop = FALSE],
      na.rm = TRUE
    )
  })
  
  result_df <- as.data.frame(do.call(cbind, result))
  colnames(result_df) <- paste0("average",prefix, seq_len(n_group))
  
  result_df$model <- rownames(result_df)
  
  result_df[, c("model", paste0("average",prefix, seq_len(n_group)))]
}



######################################################################################################



save_upload_to_db <- function(file_input, file_data, con, 
                              user_id = NULL, purpose = "unknown") {
  # Validasi input
  if (is.null(file_input) || is.null(file_data)) {
    stop("File input atau datanya tidak boleh NULL.")
  }
  
  # Info file
  filename <- file_input$name
  ext <- tools::file_ext(filename)
  
  # Simpan sementara sebagai CSV
  tmpfile <- tempfile(fileext = ".csv")
  write.csv(file_data, tmpfile, row.names = FALSE)
  
  # Baca sebagai raw (harus pakai readBin dengan exactly length)
  file_size <- file.info(tmpfile)$size
  file_bin <- readBin(tmpfile, what = "raw", n = file_size)
  
  # Cek panjang
  if (length(file_bin) < 1) {
    stop("File upload kosong atau gagal dikonversi ke binary.")
  }
  
  # Eksekusi insert ke DB
  query <- "
    INSERT INTO upload_history (
      user_id, filename, file_type, purpose, rows, columns, data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  "
  
  dbExecute(con, query, params = list(
    ifelse(is.null(user_id), Sys.info()[["user"]], user_id),
    filename,
    ext,
    purpose,
    nrow(file_data),
    ncol(file_data),
    I(list(file_bin))  # penting: I(list(...)) untuk BYTEA
  ))
}





###########################################################################################################################################
###########################################Forecast########################################################################################
###########################################################################################################################################
acfStat<- function(x,lag=36)
{
  out1=acf(x,lag.max=lag,plot=F, na.action=na.pass)
  acfout=out1$acf
  out2=pacf(x,lag.max = lag,plot=F,na.action=na.pass)
  pacfout=NULL
  pacfout[1]=1
  pacfout=c(pacfout,out2$acf)
  temp1=NULL
  temp1[1]=NULL
  temp2=NULL
  temp2[1]=NULL
  for(i in 1:lag)
  {
    temp1[i+1]=Box.test(x,lag=i,type="Ljung")$statistic
    temp2[i+1]=Box.test(x,lag=i,type="Ljung")$p.value
  }
  
  
  result=cbind(ACF=acfout,PACF=pacfout,"Q-Stats"=temp1,"P-Value"=temp2)
  rownames(result)=0:lag
  print(result)
}


arima.string<-function(object)
{
  order<- object$arma[c(1,6,2,3,7,4,5)]
  result <- paste("ARIMA(",order[1],",",order[2],",",order[],")",sep="")
  if(order[7]>1 & sum(order[4:6])>0)
    result<-paste(result,"(",order[4],",",order[5],",",order[6],")[",order[],"]",sep="")
  if(is.element("constant",names(object$coef))|is.element("intercept",names(object$coef)))
    result<-paste(result,"with non-zero mean")
  else if (is.element("drift",names(object$coef)))
    result<-paste(result,"with drift")
  else if(order[2]==0 & order[5]==0)
    result<- paste(result,"with zero mean")
  else
    result<-paste(result,"")
  return(result)
}

printarima<-function(x,digits=4,se=T,...){
  if(length(x$coef)>0) {
    cat("\nCoefficients:\n")
    coef<-round(x$coef,digits=digits)
    if(se && nrow(x$var.coef)) {
      ses<- rep(0,length(coef))
      ses[x$mask] <- round(sqrt(diag(x$var.coef)), digits=digits)
      coef<-matrix(coef,1,dimnames=list(NULL,names(coef)))
      coef<-rbind(coef,s.e.=ses)
      statt<-coef[1,]/ses
      pval<-2*pt(abs(statt), df=length(x$residuals)-1,lower.tail=F)
      coef<-rbind(coef,t=round(statt,digits=digits),
                  sign.=round(pval,digits=digits))
      coef<-t(coef)
    }
    print.default(coef,print.gap=2)
  }
}


##########################################################
#################Simple Moving Average#############
##########################################################
SMA=function(data,order,h){
  data=as.vector(data)
  n=length(data)
  sp=n+h
  k=order
  MA=array(NA,dim=c(sp))
  for(i in 1:n){
    MA[i+(k-1)]=mean(data[i:(i+(k-1))])}
  MA=MA[1:sp]
  #Forecast
  Fo1=array(NA,dim=c(n))
  for(i in 1:n){
    Fo1[i+(k-1)+1]=MA[i+(k-1)]
  }
  Fo2=array(NA,dim=c(h))
  for(i in 1:h){
    Fo2[i]=Fo1[n+1]
  }
  
  Fo1=Fo1[1:n]
  Fo2=Fo2[1:h]
  data1=array(NA,dim=c(h))
  data=c(data,data1)
  Fo=c(Fo1,Fo2)
  
  data.frame(data,MA,Fo) 
  
}

akurasisma= function(model_sma){
  model_sma=na.omit(model_sma)
  dy=model_sma$data
  db=model_sma$Fo
  akurasi_sma=akurasi4(dy,db,k=1)
  t(akurasi_sma)
}

akurasisma2= function(model_sma){
  model_sma=na.omit(model_sma)
  dy=model_sma$data
  db=model_sma$Fo
  akurasi_sma=akurasi4(dy,db,k=1)[2]
  akurasi_sma
}

SM_Average= function(data,h){
  jd=length(data)
  dt=3:(jd-1)
  h=h
  fa=jd+1
  fz=jd+h
  kakurasi=NULL
  for (i in 1:length(dt)){
    y=SMA(data,order = dt[i],h)
    kakurasi[i]=akurasisma2(y)}
  tabelakurasi=data.frame(dt,kakurasi)
  tabelakurasi=tabelakurasi[order(tabelakurasi$kakurasi),]
  orde=tabelakurasi[1,1]
  hasilsma=SMA(data,order=orde,h)
  hasilakurasi=akurasisma(hasilsma)
  nilaiforecast=hasilsma$Fo[fa:fz]
  summa=list(order_optimum=orde,nilai_akurasi=hasilakurasi,forecast=nilaiforecast)
  summa
}




##########################################################
#################Double Moving Average#############
##########################################################

########LMA#######
LMA=function(data,order,h){
  data=as.vector(data)
  n=length(data)
  sp=n+h
  k=order
  m=order
  MA=array(NA,dim=c(sp))
  for(i in 1:n){
    MA[i+(k-1)]=mean(data[i:(i+(k-1))])}
  MA=MA[1:sp]
  DMA=array(NA,dim=c(sp))
  for(i in 1:n){
    DMA[i+(m-1)+(k-1)]=mean(MA[(i+(k-1)):(i+(m-1)+(k-1))])}
  DMA=DMA[1:sp]
  #Mencari nilai a
  a=array(NA,dim=c(sp))
  for(i in 1:n){
    a[i+(m-1)+(k-1)]=2*MA[i+(m-1)+(k-1)]-DMA[i+(m-1)+(k-1)]}
  #mencari nilai b
  b=array(NA,dim=c(sp))
  for(i in 1:n){
    b[i+(m-1)+(k-1)]=(2/(m-1))*(MA[i+(m-1)+(k-1)]-DMA[i+(m-1)+(k-1)])}
  #Forecast
  Fo1=array(NA,dim=c(n))
  for(i in 1:n){
    Fo1[i+(m-1)+(k-1)+1]=a[i+(m-1)+(k-1)]+b[i+(m-1)+(k-1)]
  }
  Fo2=array(NA,dim=c(h))
  for(i in 1:h){
    Fo2[i]=a[n]+(b[n]*i)
  }
  Fo1=Fo1[1:n]
  Fo2=Fo2[1:h]
  a=a[1:sp]
  b=b[1:sp]
  data1=array(NA,dim=c(h))
  data=c(data,data1)
  Fo=c(Fo1,Fo2)
  data.frame(data,MA,DMA,a,b,Fo) #menggabungkan ke6nya
}

akurasiLMA= function(model_lma){
  model_lma=na.omit(model_lma)
  dy=model_lma$data
  db=model_lma$Fo
  akurasi_sma=akurasi4(dy,db,k=1)
  t(akurasi_sma)
}

akurasiLMA2= function(model_lma){
  model_lma=na.omit(model_lma)
  dy=model_lma$data
  db=model_lma$Fo
  akurasi_sma=akurasi4(dy,db,k=1)[2]
  akurasi_sma
}

LM_Average= function(data,h){
  jd=length(data)
  kkm=round(jd/4,0)
  dt=2:kkm
  h=h
  fa=jd+1
  fz=jd+h
  kakurasi=NULL
  for (i in 1:length(dt)){
    y=LMA(data,order = dt[i],h)
    kakurasi[i]=akurasiLMA2(y)}
  tabelakurasi=data.frame(dt,kakurasi)
  tabelakurasi=tabelakurasi[order(tabelakurasi$kakurasi),]
  orde=tabelakurasi[1,1]
  hasillma=LMA(data,order=orde,h)
  hasilakurasi=akurasiLMA(hasillma)
  nilaiforecast=hasillma$Fo[fa:fz]
  summa=list(order_optimum=orde,nilai_akurasi=hasilakurasi,forecast=nilaiforecast)
  summa
}


##########################################################
#################Single Exponential Smoothing#############
##########################################################

ses.monggo<- function(x, alpha,f=1) {
  x=as.vector(x)
  m <- length(x)
  St0=sum(data)
  St=array(NA,dim=c(m+f))
  St[1] <- c(x[1])
  for (i in 2:m) {
    St[i] <- alpha * x[i] + (1 -alpha) * St[i - 1]}
  fo <- array(NA,dim=c(m+1))
  for(i in 2:(m+1)) {
    fo[i] <- St[i-1] 
  }
  pnjfo=f-1
  fo=c(fo,rep(fo[m+1],pnjfo))
  p=array(NA,dim=c(f))
  x=c(x,p)
  data.frame(x,St,fo)
}

##########################################################
######Second-Order Exponential Smoothing Montgomery#######
##########################################################
firstsmooth<-function(y,alpha,start=y[1]){
  ytilde<-y
  ytilde[1]<-alpha*y[1]+(1-alpha)*start
  for (i in 2:length(y)){
    ytilde[i]<-alpha*y[i]+(1-alpha)*ytilde[i-1]
  }
  ytilde
}

soes.monggo<-function(y,alpha,h){
  lcpi<-alpha
  y<-y
  smooth1<-firstsmooth(y,alpha=alpha)
  smooth2<-firstsmooth(smooth1,alpha=alpha)
  fo<-2*smooth1-smooth2
  tau<-1:h
  T<-length(smooth1)
  fo2<-(2+tau*(lcpi/(1-lcpi)))*smooth1[T]-(1+tau*(lcpi/(1-lcpi)))*smooth2[T]
  y=c(y,numeric(h))
  smooth1=c(smooth1,numeric(h))
  smooth2=c(smooth2,numeric(h))
  fo=c(fo,fo2)
  data.frame(y,smooth1,smooth2,fo)
}



##########################################################
###########double Exponential Smoothing (Holt)############
##########################################################

Holts<- function(y,alpha=0.2, beta=0.3,h) {
  x <-as.vector(y)
  m <-length(x)
  t<-1:m
  regres<-lm(x~t)
  a<-summary(regres)$coefficients[1,1]
  b<-summary(regres)$coefficients[2,1]
  l0<-a
  T0<-b
  l1<-alpha * x[1] + (1-alpha)*(l0+T0)
  T1<-beta* (l1-l0) + (1-beta) * T0
  l2<-alpha * x[2] + (1-alpha)*(l1+T1)
  T2<-beta* (l2-l1) + (1-beta) * T1
  level <- c(l1,l2, numeric(m-2))
  Tren<-c(T1,T2,numeric(m-2))
  for (i in 3:m) {
    level[i] <- alpha * x[i] + (1 -alpha) * (level[i - 1]+Tren[i-1])
    Tren[i]<-beta*(level[i]-level[i-1])+(1-beta)*Tren[i-1]
  }
  fo1=c(numeric(h))
  for(i in 1:h){
    fo1[i]=level[m]+Tren[m]*i}
  fo=level+Tren
  x=c(x,numeric(h))
  level=c(level,numeric(h))
  Tren=c(Tren,numeric(h))
  
  fo=c(fo,fo1)
  
  data.frame(x,level,Tren,fo)
}

############################################################
#############Brown (metode linear satu-parameter)###########
############################################################
akurasihasil= function(model_brownsapar){
  model_brownsapar=na.omit(model_brownsapar)
  dy=model_brownsapar$data
  db=model_brownsapar$Fi
  akurasi_browsapar=akurasi4(dy,db,k=1)
  t(akurasi_browsapar)
}

akurasibrs= function(model_brownsapar){
  model_brownsapar=na.omit(model_brownsapar)
  dy=model_brownsapar$data
  db=model_brownsapar$Fi
  akurasi_browsapar=akurasi4(dy,db,k=1)[2]
  akurasi_browsapar
}

Brownsapar=function(x,alpha,h){
  data=as.vector(x)
  n=length(data)
  SES=array(NA,dim=c(n+h))
  SES[1] <- data[1]
  for (i in 2:n) {
    SES[i] <- alpha * data[i] + (1 -alpha) * SES[i - 1]}
  DES=array(NA,dim=c(n+h))
  DES[1] <- SES[1]
  for (i in 2:n) {
    DES[i] <- alpha * SES[i] + (1 -alpha) * DES[i - 1]}
  #Mencari nilai a
  a=array(NA,dim=c(n+h))
  for(i in 2:n){
    a[i]=2*SES[i]-DES[i]}
  #mencari nilai b
  b=array(NA,dim=c(n+h))
  for(i in 2:n){
    b[i]= (alpha/(1 -alpha))*(SES[i]-DES[i])}
  #Forecast
  Fi=array(NA,dim=c(n))
  for(i in 3:n){
    Fi[i]=a[i-1]+b[i-1]}
  Fii=array(NA,dim=c(h))
  for(i in 1:h){
    Fii[i]=a[n]+b[n]*i}
  Fi=c(Fi,Fii)
  data1=array(NA,dim=c(n+h))
  data=c(data,data1[1:h])
  data.frame(data,SES,DES,a,b,Fi)}

brownsapar= function(data,h){
  dt=seq(0.0001,0.9999,by = 0.0002)
  h=h
  data=data
  jd=length(data)
  fa=jd+1
  fz=jd+h
  kakurasi=NULL
  for (i in 1:length(dt)){
    y=Brownsapar(data,alpha=dt[i],h)
    kakurasi[i]=akurasibrs(y)}
  tabelakurasi=data.frame(dt,kakurasi)
  tabelakurasi=tabelakurasi[order(tabelakurasi$kakurasi),]
  alpa=tabelakurasi[1,1]
  hasilbrown=Brownsapar(data,alpha=alpa,h)
  hasilakurasi=akurasihasil(hasilbrown)
  nilaiforecast=hasilbrown$Fi[fa:fz]
  summa=list(alpha_optimum=alpa,nilai_akurasi=hasilakurasi,forecast=nilaiforecast)
  summa
}


########AKURASI########
akurasi <- function(model){ 
  model2<-t(data.frame(loglikelihood=model$loglik,
                       AIC=model$aic,
                       AICc=model$aicc,
                       BIC=model$bic,
                       ME=accuracy(model)[1],
                       RMSE=accuracy(model)[2],
                       MAE=accuracy(model)[3],
                       MPE=accuracy(model)[4],
                       MAPE=accuracy(model)[5],
                       MASE=accuracy(model)[6]))
  options(scipen=999)
  model2<-round(model2,5)
  model2
}

akurasi2 <- function(model){ 
  model2<-t(data.frame(ME=accuracy(model)[1],
                       RMSE=accuracy(model)[2],
                       MAE=accuracy(model)[3],
                       MPE=accuracy(model)[4],
                       MAPE=accuracy(model)[5],
                       MASE=accuracy(model)[6]))
  options(scipen=999)
  model2<-round(model2,5)
  model2
}

akurasi3 <- function(model,data){ 
  model2<-t(data.frame(ME=accuracy(model,data)[1],
                       RMSE=accuracy(model,data)[2],
                       MAE=accuracy(model,data)[3],
                       MPE=accuracy(model,data)[4],
                       MAPE=accuracy(model,data)[5],
                       MASE=accuracy(model,data)[6]))
  options(scipen=999)
  model2<-round(model2,5)
  model2
}


akurasi4=function (x, x.hat, k=1) 
{
  n <- length(x)
  SST <- sum((x - mean(x))^2)
  SSE <- sum((x - x.hat)^2)
  MSE <- SSE/(n - k)
  RMSE <- sqrt(MSE)
  MAPE <- 100 * mean(abs((x - x.hat)/x))
  MPE <- 100 * mean((x - x.hat)/x)
  MAE <- mean(abs(x - x.hat))
  ME <- mean(x - x.hat)
  R2 <- 1 - SSE/SST
  ADJ.R2 <- 1 - (n - 1) * (1 - R2)/(n - k)
  AIC <- n * log(SSE/n) + 2 * k
  SBC <- n * log(SSE/n) + k * log(n)
  APC <- ((n + k)/(n * (n - k))) * SSE
  result <- t(data.frame( ME=ME,RMSE=RMSE,MPE=MPE, MAE=MAE,MAPE=MAPE,MSE=MSE,SST=SST, SSE=SSE, R2=R2, 
                          ADJ.R2=ADJ.R2, AIC=AIC, SBC=SBC, APC=APC))
  result=round(result,5)
  result
}



kuartos=function(v){
  if(v>9){
    ku=4
  } else if(v>6){
    ku=3
  } else if(v>3){
    ku=2
  } else{
    ku=1
  }
  return(ku)
}








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




memilih_metode=function(datku,metode,jf=12,byy="month"){
  
  tambah_bulan_akhir <- function(tanggal_vec,h) {
    tanggal_unik <- unique(as.Date(tanggal_vec))
    
    tanggal_terakhir <- floor_date(max(tanggal_unik), unit = "month")
    
    # Buat urutan tanggal ke depan
    hasil_forecast <- seq(from = tanggal_terakhir %m+% months(1), by = "month", length.out = h)
    hasil_forecast <- ceiling_date(hasil_forecast, "month") - days(1)
    
    return(hasil_forecast)
  }
  
  data=datku[,-1]
  date=c(datku[,1],tambah_bulan_akhir(datku[,1],jf))
  date1=datku[,1]
  date2=tambah_bulan_akhir(datku[,1],jf)
  #CGfit_xts <- xts(CGfit$CG, order.by = CGfit$date)
  bulan <- format(date[1], "%m")
  tahun <- format(date[1], "%Y")
  
  
  if (metode=="Single Moving Average"){
    model=SM_Average(data,jf)
    forecasting_r=data.frame(Date=date2,Forecast=model$forecast)
    actual_data=data.frame(Date=date1,Actual=data)
    detailnya=model
  } else if(metode=="Double Moving Average"){
    model=LM_Average(data,jf)
    forecasting_r=data.frame(Date=date2,Forecast=model$forecast)
    actual_data=data.frame(Date=date1,Actual=data)
    detailnya=model
  } else if (metode=="Single Exponential Smoothing") {
    model=ses(data,h=jf)
    forecasting_r=data.frame(Date=date2,Forecast=model$mean)
    actual_data=data.frame(Date=date1,Actual=model$x)
    detailnya=model$model
  } else if (metode=="Brown Linier Satu Parameter") {
    model=brownsapar(data,jf)
    forecasting_r=data.frame(Date=date2,Forecast=model$forecast)
    actual_data=data.frame(Date=date1,Actual=data)
    detailnya=model
  } else if (metode=="Holt Dua Parameter") {
    model=holt(data,h=jf)
    forecasting_r=data.frame(Date=date2,Forecast=model$mean)
    actual_data=data.frame(Date=date1,Actual=model$x)
    detailnya=model$model
  } else if (metode=="Holt Winter Aditif") {
    if(byy=="quarter"){
      y=ts(data,start = c(tahun,kuartos(bulan)),frequency =4)
      model=hw(y,seasonal="additive",h=jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model$model
    } else if (byy=="month"){
      y=ts(data,start = c(tahun,bulan),frequency =12)
      model=hw(y,seasonal="additive",h=jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model$model
    } else {
      y=0
      model=0 
      forecasting_r=data.frame(Date=date2,Forecast=0)
      actual_data=data.frame(Date=date1,Actual=0)
      detailnya=0
    }          
    
  } else if (metode=="Holt winter Multiplikatif") {
    if(byy=="year"||min(data)<=0){
      y=0
      model=0
      forecasting_r=data.frame(Date=date2,Forecast=0)
      actual_data=data.frame(Date=date1,Actual=0)
      detailnya=0
    } else if (byy=="day"||min(data)<=0){
      y=0
      model=0
      forecasting_r=data.frame(Date=date2,Forecast=0)
      actual_data=data.frame(Date=date1,Actual=0)
      detailnya=0
    } else if (byy=="quarter"){
      y=ts(data,start = c(tahun,kuartos(bulan)),frequency =4)
      model=hw(y,seasonal="multiplicative",h=jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model$model
    } else {
      y=ts(data,start = c(tahun,bulan),frequency =12)
      model=hw(y,seasonal="multiplicative",h=jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model$model
    }
    
    
  } else if (metode=="Auto ARIMA"){
    if(byy=="quarter"){
      y=ts(data,start = c(tahun,kuartos(bulan)),frequency =4)
      model_arima <- auto.arima(y)
      model_arima_custom <- Arima(y, order = c(model_arima$arma[1],model_arima$arma[6],model_arima$arma[2]),
                                  seasonal = list(order=c(model_arima$arma[3],model_arima$arma[7],model_arima$arma[4]),period=model_arima$arma[5]), include.constant = TRUE)
      
      
      model <- forecast::forecast(model_arima_custom, h = jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model_arima_custom
    } else if(byy=="month"){
      y=ts(data,start = c(tahun,bulan),frequency =12)
      model_arima <- auto.arima(y)
      model_arima_custom <- Arima(y, order = c(model_arima$arma[1],model_arima$arma[6],model_arima$arma[2]),
                                  seasonal = list(order=c(model_arima$arma[3],model_arima$arma[7],model_arima$arma[4]),period=model_arima$arma[5]), include.constant = TRUE)
      
      
      model <- forecast::forecast(model_arima_custom, h = jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model_arima_custom
    } else {
      y=ts(data)
      model_arima <- auto.arima(y)
      model_arima_custom <- Arima(y, order = c(model_arima$arma[1],model_arima$arma[6],model_arima$arma[2]),
                                  seasonal = list(order=c(model_arima$arma[3],model_arima$arma[7],model_arima$arma[4]),period=model_arima$arma[5]), include.constant = TRUE)
      
      
      model <- forecast::forecast(model_arima_custom, h = jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model_arima_custom
    }
    
  }else{
    if(byy=="quarter"){
      y=ts(data,start = c(tahun,kuartos(bulan)),frequency =4)
      model_tbats=tbats(y)
      model=forecast::forecast(model_tbats,h=jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model_tbats
    } else if(byy=="month"){
      y=ts(data,start = c(tahun,bulan),frequency =12)
      model_tbats=tbats(y)
      model=forecast::forecast(model_tbats,h=jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model_tbats
    } else {
      y=ts(data)
      model_tbats=tbats(y)
      model=forecast::forecast(model_tbats,h=jf)
      forecasting_r=data.frame(Date=date2,Forecast=model$mean)
      actual_data=data.frame(Date=date1,Actual=model$x)
      detailnya=model_tbats
    }
  }
  hasil=list(metode=metode,actual_data=actual_data,hasil_forecasting=forecasting_r,detail=detailnya)
  return(hasil)
}





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




##########akurasi dalam bentuk dataframe###########
loop_akurasi_forecast <- function(list_data, byy = "month", makur = "MAPE") {
  hasil <- lapply(names(list_data), function(nm) {
    df <- list_data[[nm]]
    if (ncol(df) >= 2) {
      akurasi <- best_forecast_metod(df, byy = byy, makur = makur)
      akurasi$Variable <- nm
      akurasi <- akurasi %>% select(Variable, everything())
      return(akurasi)
    } else {
      warning(paste("⚠️ Data", nm, "tidak memiliki minimal 2 kolom."))
      return(NULL)
    }
  })
  hasil_df <- bind_rows(hasil)
  return(hasil_df)
}

#####akurasi dalam bentuk list####
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





gabung_hasil_forecast <- function(hasil_list) {
  library(dplyr)
  
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


gabung_hasil_forecast1 <- function(hasil_list) {
  library(dplyr)
  
  df_final <- NULL
  
  for (nama_var in names(hasil_list)) {
    
    hasil <- hasil_list[[nama_var]]
    
    df_forecast <- hasil$hasil_forecasting
    
    if (is.data.frame(df_forecast) &&
        all(c("Date", "Forecast") %in% colnames(df_forecast))) {
      
      df_forecast$Date <- as.Date(df_forecast$Date)
      
      df_var <- df_forecast %>%
        rename(!!nama_var := Forecast)
      
      if (is.null(df_final)) {
        df_final <- df_var
      } else {
        df_final <- full_join(df_final, df_var, by = "Date")
      }
    }
  }
  
  return(df_final)
}


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
  hasil_list <- lapply(hasil_forecast, `[[`, "hasil")
  names(hasil_list) <- names_out
  
  return(hasil_list)
}





######################################################################################################
##########################################forecast manual#############################################
forecast_dengan_pilihan_metode <- function(list_data, list_akurasi, metode_pilihan, jf = 12, byy = "month") {
  hasil_forecast <- list()
  
  # Ambil nama variabel dari list_data
  nama_variabel <- names(list_data)
  
  for (i in seq_along(nama_variabel)) {
    var <- nama_variabel[i]
    idx_metode <- metode_pilihan[i]  # ambil indeks metode sesuai urutan
    
    cat("📈 Forecasting:", var, "dengan metode ke-", idx_metode, "\n")
    
    # Ambil data dan metode
    dat_satu <- list_data[[var]]
    metode_terpilih <- list_akurasi[[var]]$Metode[idx_metode]
    
    # Forecast
    hasil <- memilih_metode(dat_satu, metode = metode_terpilih, jf = jf, byy = byy)
    
    # Simpan hasil + info metode
    hasil$metode_digunakan <- metode_terpilih
    hasil_forecast[[var]] <- hasil
  }
  
  return(hasil_forecast)
}



####################

forecast_semua_variabel <- function(
    datawide,
    metode,
    jf = 12,
    byy = "month",
    silent = TRUE
) {
  
  # -----------------------------
  # Validasi input
  # -----------------------------
  stopifnot(is.data.frame(datawide))
  stopifnot(is.character(metode))
  
  # -----------------------------
  # Konversi wide → list time series
  # -----------------------------
  list_ts <- konversi_ke_list_forecast(datawide)
  
  # -----------------------------
  # Forecast setiap variabel
  # -----------------------------
  hasil_forecast <- lapply(names(list_ts), function(varname) {
    
    df <- list_ts[[varname]]
    
    res <- tryCatch({
      memilih_metode(
        datku = df,
        metode = metode,
        jf = jf,
        byy = byy
      )
    }, error = function(e) {
      if (!silent) {
        message("❌ Error pada variabel: ", varname)
        message(e$message)
      }
      return(list(
        metode = metode,
        actual_data = df,
        hasil_forecasting = NA,
        detail = e$message
      ))
    })
    
    res$variabel <- varname
    return(res)
  })
  
  names(hasil_forecast) <- names(list_ts)
  
  class(hasil_forecast) <- c("multi_forecast", class(hasil_forecast))
  return(hasil_forecast)
}



#############################################################################################################



##############################################sort and Filter##################################################
#filter_model_by_core_vars <- function(data, 
#                                      core_vars = character(), 
#                                      min_match = 1, 
#                                      model_col = "Model",
#                                      sort_by = c("R_squared", "MAPEgabung"),
#                                      exact_word = FALSE) {
#  sort_by <- match.arg(sort_by)
#  sort_direction <- ifelse(sort_by == "MAPE", "asc", "desc")
#  
#  if (exact_word && length(core_vars) > 0) {
#    core_vars <- paste0("\\b", core_vars, "\\b")
#  }
#  
#  if (length(core_vars) > 0) {
#    filtered <- data %>%
#      filter(
#        rowSums(
#          sapply(core_vars, function(var) stringr::str_detect(.data[[model_col]], var))
#        ) >= min_match
#      )
#  } else {
#    filtered <- data
#  }
#  
#  if (sort_direction == "desc") {
#    filtered <- filtered %>% arrange(desc(.data[[sort_by]]))
#  } else {
#    filtered <- filtered %>% arrange(.data[[sort_by]])
#  }
#  
#  return(filtered)
#}


filter_model_by_core_vars <- function(data, 
                                      core_vars = character(), 
                                      min_match = 1, 
                                      model_col = "Model",
                                      sort_by = c("R_squared", "MAPEgabung"),
                                      exact_word = FALSE) {
  sort_by <- match.arg(sort_by)
  
  # metrik yang makin kecil makin baik (ascending)
  ascending_metrics <- c("MAPE", "MAPEgabung", "RMSE", "MAE")
  sort_direction <- if (sort_by %in% ascending_metrics || grepl("MAPE", sort_by, ignore.case = TRUE)) "asc" else "desc"
  
  # siapkan pola pencarian
  patterns <- core_vars
  if (exact_word && length(patterns) > 0) {
    patterns <- paste0("\\b", stringr::str_replace_all(patterns, "([.^$|()\\[\\]{}*+?\\\\])", "\\\\\\1"), "\\b")
  }
  
  # filter berdasarkan jumlah match minimal
  if (length(patterns) > 0) {
    hits <- rowSums(sapply(patterns, function(var) stringr::str_detect(data[[model_col]], var)))
    filtered <- dplyr::filter(data, hits >= min_match)
  } else {
    filtered <- data
  }
  
  # urutkan
  if (sort_direction == "desc") {
    filtered <- dplyr::arrange(filtered, dplyr::desc(.data[[sort_by]]))
  } else {
    filtered <- dplyr::arrange(filtered, .data[[sort_by]])
  }
  filtered
}


extract_core_choices <- function(df, model_col = "Model") {
  stopifnot(model_col %in% names(df))
  models <- as.character(df[[model_col]])
  
  # ambil term (X) dari formula/string model
  get_xvars <- function(one) {
    # coba parse sebagai formula
    tl <- tryCatch({
      f <- if (inherits(one, "formula")) one else as.formula(one)
      attr(terms(f), "term.labels")
    }, error = function(e) NULL)
    
    if (!is.null(tl)) {
      # pecah interaksi, ambil token huruf/angka/_/.
      parts  <- unlist(strsplit(tl, "[:*+]"))
      tokens <- unlist(stringr::str_extract_all(parts, "[A-Za-z][A-Za-z0-9_\\.]*"))
    } else {
      # fallback: regex langsung dari string model
      # kalau ada '~', buang bagian kiri (response)
      rhs <- if (grepl("~", one)) sub("^.*~", "", one) else one
      tokens <- stringr::str_extract_all(rhs, "[A-Za-z][A-Za-z0-9_\\.]*")[[1]]
    }
    
    # buang nama fungsi/umum
    drop <- c("I","log","ln","exp","sqrt","abs","poly","s","lag","L","as","factor",
              "offset","Intercept","const","AR","MA","SARIMA","ETS","NNETAR")
    tokens <- setdiff(tokens, drop)
    tokens
  }
  
  raw_tokens <- unlist(lapply(models, get_xvars), use.names = FALSE)
  
  # normalisasi: hilangkan underscore
  norm_tokens <- gsub("_", "", raw_tokens)
  
  # unique + urut
  sort(unique(norm_tokens))
}


gabungkolomb <- function(datafinalmodel){
  jadibaris <- c(datafinalmodel[['var1']],datafinalmodel[['var2']],datafinalmodel[['var3']])
  jadibaris <- jadibaris[!is.na(jadibaris)]
  sources <- unique(sapply(strsplit(jadibaris, "_"), `[`, 1))
  # gabungkan sumber dengan isi asli, lalu ambil unique
  gabunglagi <- unique(c(sources, jadibaris))
  
  return(gabunglagi)
  
}



#######################boxplot############################

#########################Boxplot Function#########################
#########################Boxplot Function#########################
Boxplot_Scenario=function(x,intuisi){
  
  library(dplyr)
  library(purrr)
  library(tidyr)
  
  
  klasifikasi_macro1 <- function(x) {
    Q1 <- quantile(x, 0.25, na.rm = TRUE)
    Q2 <- quantile(x, 0.50, na.rm = TRUE)
    Q3 <- quantile(x, 0.75, na.rm = TRUE)
    IQR_val <- IQR(x, na.rm = TRUE)
    upper_limit <- Q3 + 1.5 * IQR_val
    below_limit <- Q1 - 1.5 * IQR_val
    kategori <- ifelse(x > Q1 & x < Q3, "BASE",
                       ifelse(x >= below_limit & x <= Q1, "BEST",
                              ifelse(x >= Q3 & x <= upper_limit, "WORST", 
                                     "OUTLIER")))
    return(kategori)
  }
  
  
  
  klasifikasi_macro2 <- function(x) {
    Q1 <- quantile(x, 0.25, na.rm = TRUE)
    Q2 <- quantile(x, 0.50, na.rm = TRUE)
    Q3 <- quantile(x, 0.75, na.rm = TRUE)
    IQR_val <- IQR(x, na.rm = TRUE)
    upper_limit <- Q3 + 1.5 * IQR_val
    below_limit <- Q1 - 1.5 * IQR_val
    kategori <- ifelse(x > Q1 & x < Q3, "BASE",
                       ifelse(x >= below_limit & x <= Q1, "WORST",
                              ifelse(x >= Q3 & x <= upper_limit, "BEST", 
                                     "OUTLIER")))
    return(kategori)
  }
  
  
  
  
  # Daftar kolom yang ingin diklasifikasikan
  cols_to_classify <- colnames(x)
  
  intuisi <- ifelse(intuisi==0,1,intuisi)
  
  # Proses klasifikasi otomatis
  df_klasifikasi=c()
  for (i in 1:length(cols_to_classify)) {
    if (intuisi[i]==1){
      df_klasifikasi=cbind(df_klasifikasi,klasifikasi_macro1(x[,i]))
    } else {
      df_klasifikasi=cbind(df_klasifikasi,klasifikasi_macro2(x[,i]))
    }
  }
  
  df_klasifikasi <- as.data.frame(df_klasifikasi)
  colnames(df_klasifikasi) <- cols_to_classify
  df.klasifikasi=df_klasifikasi
  
  library(dplyr)
  library(tidyr)
  
  # Urutan variabel asli
  urutan_var <- colnames(df_klasifikasi)
  
  # Ubah ke long format
  df_long <- df_klasifikasi %>%
    mutate(RowID = row_number()) %>%
    pivot_longer(-RowID, names_to = "Variable", values_to = "Category")
  
  # Hitung frekuensi per kategori dan variabel
  pivot_table <- df_long %>%
    count(Category, Variable) %>%
    pivot_wider(names_from = Variable, values_from = n, values_fill = 0) %>%
    dplyr::select(Category, all_of(urutan_var))
  
  # Hitung total per kolom
  total_row <- c(Category = "Total", as.list(colSums(pivot_table[,-1])))
  
  # Tambahkan baris Total
  pivot_table <- bind_rows(pivot_table, total_row)
  
  # Atur urutan kategori manual
  kategori_order <- c("BASE", "BEST", "WORST", "OUTLIER", "Total")
  pivot_table$Category <- factor(pivot_table$Category, levels = kategori_order)
  
  # Urutkan sesuai urutan kategori
  pivot_table <- pivot_table %>% arrange(Category)
  
  # Tampilkan hasil
  pivot_table=as.data.frame(pivot_table)
  category.frecuency=pivot_table
  
  
  #########################RATA-RATA###########################
  # Beri suffix untuk kolom klasifikasi
  df_klasifikasi_renamed <- df_klasifikasi %>%
    rename_with(~ paste0(., "_class"))
  
  # Gabungkan ke data asli
  df_gabung <- cbind(x, df_klasifikasi_renamed)
  
  # Daftar variabel yang akan dianalisis
  vars_numerik <- colnames(df_klasifikasi)
  
  # Hitung rata-rata untuk kategori BASE, BEST, WORST saja
  avg_table <- map_dfr(vars_numerik, function(var) {
    # nama kolom klasifikasi, contoh: "Coal_class"
    var_class <- paste0(var, "_class")
    
    data.frame(
      Average = c("BASE", "BEST", "WORST"),
      nilai = sapply(c("BASE", "BEST", "WORST"), function(kategori) {
        mean(df_gabung[[var]][df_gabung[[var_class]] == kategori], na.rm = TRUE)
      }),
      variabel = var
    )
    
    
  }) %>%
    pivot_wider(names_from = variabel, values_from = nilai) %>%
    dplyr::select(Average, all_of(vars_numerik)) %>%
    arrange(factor(Average, levels = c("BASE", "BEST", "WORST")))
  
  avg_table=as.data.frame(avg_table)
  avg.table=avg_table
  
  
  #########################FREKUENSI PERCENTAGE###########################
  pivot_table=pivot_table[-4:-5,]
  
  # Asumsikan pivot_table adalah hasil sebelumnya
  pivot_table_percent <- pivot_table
  
  # Ambil hanya bagian numerik
  data_numerik <- pivot_table_percent[, -1]
  
  # Hitung proporsi per kolom (margin = 2 berarti kolom)
  proporsi <- prop.table(as.matrix(data_numerik), margin = 2)
  
  # Ubah ke data frame dan tambahkan kembali kolom kategori
  pivot_table_percent <- data.frame(
    Category = pivot_table$Category,
    round(proporsi, 4)  # bulatkan jika ingin
  )
  
  
  category.percentage=pivot_table_percent
  
  #########################RATA-RATA PERCENTAGE###########################
  average_per_category <- rowMeans(pivot_table_percent[, -1])
  names(average_per_category) <- pivot_table_percent$Category
  weighted.boxplot=average_per_category
  
  
  #########################DIFFERENCE FROM BASE###########################
  # Hitung rasio (BEST - BASE) / BASE
  rasio_best <- (avg_table[2, -1] - avg_table[1, -1]) / avg_table[1, -1]
  
  # Hitung rasio (WORST - BASE) / BASE
  rasio_worst <- (avg_table[3, -1] - avg_table[1, -1]) / avg_table[1, -1]
  
  standar_dev <- apply(x,2,sd)
  # Gabungkan jadi tabel baru
  diff_base <- rbind(BEST = rasio_best, WORST = rasio_worst,stdev=standar_dev)
  diff.base=diff_base
  
  
  
  boxplot_result=list(df.klasifikasi=df.klasifikasi,
                      category.frecuency=category.frecuency,
                      category.percentage=category.percentage,
                      weighted.boxplot=weighted.boxplot,
                      avg.table=avg.table,
                      diff.base=diff.base)
  boxplot_result
}









#########################Forecast Boxplot Scenario Function#########################
make_scenario <- function(base_df, intuition_df, sd_vec) {
  
  stopifnot(is.data.frame(base_df))
  stopifnot(is.data.frame(intuition_df))
  
  # =========================
  # Normalisasi nama variabel base
  # =========================
  base_names <- colnames(base_df)
  
  core_names <- gsub("(_Y(_.*)?|_LG\\d+|_LAG\\d+)$", "", base_names)
  
  
  # =========================
  # Mapping INTUITION (by core name)
  # =========================
  intuition_map <- setNames(
    intuition_df$sign,
    intuition_df$var
  )
  
  matched_intuition <- intuition_map[core_names]
  
  if (any(is.na(matched_intuition))) {
    stop(
      "Intuisi tidak ditemukan untuk variabel: ",
      paste(base_names[is.na(matched_intuition)], collapse = ", ")
    )
  }
  
  # =========================
  # NORMALISASI SD_VEC
  # =========================
  
  # kalau 1-row data.frame (hasil_boxplot$diff.base[3,])
  if (is.data.frame(sd_vec)) {
    
    if (nrow(sd_vec) != 1) {
      stop("sd_vec data.frame harus 1 baris (row stdev)")
    }
    
    sd_raw <- as.numeric(sd_vec[1, ])
    names(sd_raw) <- (colnames(sd_vec))
    
  } else {
    # numeric vector
    sd_raw <- as.numeric(sd_vec)
    names(sd_raw) <- (names(sd_vec))
  }
  
  # mapping SD ke core name model
  matched_sd <- sd_raw[core_names]
  
  if (any(is.na(matched_sd))) {
    stop(
      "SD tidak ditemukan untuk variabel: ",
      paste(base_names[is.na(matched_sd)], collapse = ", ")
    )
  }
  
  # rename SD sesuai kolom model
  names(matched_sd) <- base_names
  
  # =========================
  # HITUNG SCENARIO
  # =========================
  adj_worst <- matched_intuition * matched_sd
  adj_best  <- -matched_intuition * matched_sd
  
  worst <- sweep(base_df, 2, adj_worst, "+")
  best  <- sweep(base_df, 2, adj_best,  "+")
  
  list(
    worst = worst,
    best  = best
    #intuition_used = matched_intuition,
    #sd_used = matched_sd
  )
}



forecast_mev_bxp=function(mev_base,db_boxplot,modely,z,coln,intuisi,metode="boxplot"){
  
  pred_vars <- all.vars(formula(modely))[-1]  # buang y
  
  Date <- mev_base[,1]
  mev_base=mev_base[,unlist(pred_vars, use.names = FALSE)]
  mev_base=cbind(Date,mev_base)
  
  db_boxplotsd <- db_boxplot[3,]
  sdcriteria <- make_scenario(mev_base[,-1],intuisi,db_boxplotsd)
  
  db_boxplot <- db_boxplot[1:2,]
  
  library(stringr)
  
  # Daftar nama input yang ingin dicocokkan
  input_vars <- colnames(mev_base)
  
  # Daftar referensi target
  names <- colnames(db_boxplot)
  
  # Proses pencocokan: ambil nama dalam `names` yang cocok sebagian dengan `input_vars`
  matched_names <- names[sapply(names, function(nm) {
    any(str_detect(toupper(input_vars), toupper(nm)))
  })]
  
  
  multiplied_bxp=db_boxplot[,matched_names]
  
  kalikan_df <- function(a, b) {
    stopifnot(ncol(a) == length(b))  # validasi ukuran b
    
    hasil <- as.data.frame(
      Map(function(col, faktor) {
        col * (1 + faktor)
      }, a, b)
    )
    
    colnames(hasil) <- colnames(a)
    return(hasil)
  }
  
  mev_bestc=kalikan_df(mev_base[,-1],multiplied_bxp[1,])
  mev_best=cbind(Date=mev_base[,1],mev_bestc)
  mev_worstc=kalikan_df(mev_base[,-1],multiplied_bxp[2,])
  mev_worst=cbind(Date=mev_base[,1],mev_worstc)
  
  if(metode=="boxplot"){
    mev_best=mev_best
    mev_worst=mev_worst
  }else{
    mev_best=cbind(Date=mev_base[,1],sdcriteria$best)
    mev_worst=cbind(Date=mev_base[,1],sdcriteria$worst)
  }
  
  ####predict pakai model
  predict_base=predict(modely,mev_base)
  predict_best=predict(modely,mev_best)
  predict_worst=predict(modely,mev_worst)
  
  
  #####back transform
  back_trans=function(x,z,coln){
    
    if(z=="logit"){
      hasil_trans=data.frame(y_trans=x,y=exp(x)/(1+exp(x)))
      colnames(hasil_trans)=c(coln,paste0("BT_",coln))
    } else if (z=="log") {
      hasil_trans=data.frame(y_trans=x,y=exp(x))
      colnames(hasil_trans)=c(coln,paste0("BT_",coln))
    } else {
      hasil_trans=data.frame(y_trans=x)
      colnames(hasil_trans)=coln
    }
    return(hasil_trans)
  }
  
  f_base=cbind(mev_base,back_trans(predict_base,z,coln))
  f_best=cbind(mev_best,back_trans(predict_best,z,coln))
  f_worst=cbind(mev_worst,back_trans(predict_worst,z,coln))
  f_yjoin=data.frame(f_base[,ncol(f_base)],
                     f_best[,ncol(f_best)],
                     f_worst[,ncol(f_worst)])
  colnames(f_yjoin)=c(paste0(coln," BASE"),
                      paste0(coln," BEST"),
                      paste0(coln," WORST"))
  
  forecast.boxplot.result=list(f.base=f_base,
                               f.best=f_best,
                               f.worst=f_worst,
                               f.yjoin=f_yjoin,
                               diff.boxplot=multiplied_bxp)
  forecast.boxplot.result
}





#################################PD ENGINE FUNCTION############
cap_upper <- function(df, upper = 1) {
  df[] <- lapply(df, function(col) pmin(col, upper, na.rm = TRUE))
  df
}



PD_engine1=function(forecast_odr_boxplot,actual_odr,issuer,ympd){
  
  name_FL_P_ODR=c("PIT PD +1","PIT PD +2","CPD+1","Marginal PD +1","Marginal PD +2")
  value_FL_P_ODR=c(mean(forecast_odr_boxplot[1:12]),mean(forecast_odr_boxplot[13:24]),
                   mean(forecast_odr_boxplot[1:12]),mean(forecast_odr_boxplot[1:12]),
                   mean(forecast_odr_boxplot[13:24])*(1-mean(forecast_odr_boxplot[1:12])))
  FL_P_ODR=data.frame(value=value_FL_P_ODR)
  rownames(FL_P_ODR)=name_FL_P_ODR
  
  name_TTC_ODR=c("TTC PD +1","TTC PD +2","CPD +1","Marginal PD +1","Marginal PD +2")
  value_TTC_ODR=c(mean(actual_odr),mean(actual_odr),mean(actual_odr),
                  mean(actual_odr),mean(actual_odr)*(1-mean(actual_odr)))
  TTC_ODR=data.frame(value=value_TTC_ODR)
  rownames(TTC_ODR)=name_TTC_ODR
  
  cutoma=function(data){
    cutoma.pd=c()
    for (i in 1:ncol(data)) {
      if (i==1){
        cutoma.pd=cbind(cutoma.pd,data[,1])
      } else {
        cutoma.pd=cbind(cutoma.pd,data[,i]-data[,i-1])
      }
    }
    return(cutoma.pd=as.data.frame(cutoma.pd))
  }
  
  matocu=function(data){
    matocu.pd=c()
    for (i in 1:ncol(data)) {
      if (i==1){
        matocu.pd=cbind(matocu.pd,data[,1])
      } else {
        matocu.pd=cbind(matocu.pd,rowSums(data[,1:i],na.rm = T))
      }
    }
    return(matocu.pd=as.data.frame(matocu.pd))
  }
  
  ympdx=cutoma(ympd)
  ympdx[5,2:ncol(ympdx)]=0
  
  ym_pd=data.frame(Bucket=1:nrow(ympdx),TTC.MPD.1=ympdx[,1],TTC.MPD.2=ympdx[,2])
  Tot_ym_pd=c(crossprod(issuer[1:4],ym_pd$TTC.MPD.1[1:4])/sum(issuer[1:4]),
              crossprod(issuer[1:4],ym_pd$TTC.MPD.2[1:4])/sum(issuer[1:4]))
  
  mpd_scalling=c((FL_P_ODR$value[4]/TTC_ODR$value[4])*Tot_ym_pd[1],
                 (FL_P_ODR$value[5]/TTC_ODR$value[5])*Tot_ym_pd[2])
  MARGINAL.PD.1.S=mpd_scalling[1]
  MARGINAL.PD.2.S=mpd_scalling[2]
  
  Logit.TTC.1=ifelse(ym_pd$TTC.MPD.1[1:4]==0,0,log(ym_pd$TTC.MPD.1[1:4]/(1-ym_pd$TTC.MPD.1[1:4])))
  Logit.TTC.2=ifelse(ym_pd$TTC.MPD.2[1:4]==0,0,log(ym_pd$TTC.MPD.2[1:4]/(1-ym_pd$TTC.MPD.2[1:4])))
  TLogit.TTC.1=ifelse(Tot_ym_pd[1]==0,0,log(Tot_ym_pd[1]/(1-Tot_ym_pd[1])))
  TLogit.TTC.2=ifelse(Tot_ym_pd[2]==0,0,log(Tot_ym_pd[2]/(1-Tot_ym_pd[2])))
  
  
  # === SCALING 1 ===
  f1 = function(x) MARGINAL.PD.1.S - (crossprod(1/(1+exp(-(Logit.TTC.1 + x))), issuer[1:4]) / sum(issuer[1:4]))
  
  PD_min_1 = crossprod(1/(1+exp(-(Logit.TTC.1 - 50))), issuer[1:4]) / sum(issuer[1:4])
  PD_max_1 = crossprod(1/(1+exp(-(Logit.TTC.1 + 50))), issuer[1:4]) / sum(issuer[1:4])
  
  if (MARGINAL.PD.1.S <= PD_min_1) {
    scaling1 = -50
  } else if (MARGINAL.PD.1.S >= PD_max_1) {
    scaling1 = 50
  } else {
    scaling1 = uniroot(f1, lower = -50, upper = 50)$root
  }
  
  # === SCALING 2 ===
  f2 = function(x) MARGINAL.PD.2.S - (crossprod(1/(1+exp(-(Logit.TTC.2 + x))), issuer[1:4]) / sum(issuer[1:4]))
  
  PD_min_2 = crossprod(1/(1+exp(-(Logit.TTC.2 - 50))), issuer[1:4]) / sum(issuer[1:4])
  PD_max_2 = crossprod(1/(1+exp(-(Logit.TTC.2 + 50))), issuer[1:4]) / sum(issuer[1:4])
  
  if (MARGINAL.PD.2.S <= PD_min_2) {
    scaling2 = -50
  } else if (MARGINAL.PD.2.S >= PD_max_2) {
    scaling2 = 50
  } else {
    scaling2 = uniroot(f2, lower = -50, upper = 50)$root
  }
  
  
  
  tabel3=data.frame(value=mpd_scalling)
  rownames(tabel3)=c("Marginal PD +1", "Marginal PD +2")
  
  tabel4=data.frame(Bucket=c(1,2,3,4,5,"Total"),
                    Z=c(issuer,sum(issuer)),
                    A=c(ym_pd$TTC.MPD.1,Tot_ym_pd[1]),
                    B=c(ym_pd$TTC.MPD.2,Tot_ym_pd[2]),
                    C=c(1/(1+exp(-(Logit.TTC.1+scaling1))),1,crossprod(1/(1+exp(-(Logit.TTC.1+scaling1))),issuer[1:4])/sum(issuer[1:4])),
                    D=c(1/(1+exp(-(Logit.TTC.2+scaling2))),0,crossprod(1/(1+exp(-(Logit.TTC.2+scaling2))),issuer[1:4])/sum(issuer[1:4])),
                    E=c(Logit.TTC.1,NA,TLogit.TTC.1),
                    F=c(Logit.TTC.2,NA,TLogit.TTC.2),
                    G=c(Logit.TTC.1+scaling1,NA,TLogit.TTC.1+scaling1),
                    H=c(Logit.TTC.2+scaling2,NA,TLogit.TTC.2+scaling2)
  )
  
  colnames(tabel4)=c("Bucket","issuer","TTC MPD+1",	
                     "TTC MPD+2",	"PIT MPD+1",	"PIT MPD+2",
                     "Logit TTC+1", "Logit TTC+2",
                     "Logit PIT+1",	"Logit PIT+2")
  
  tabel5=data.frame(value=c(scaling1,scaling2))
  rownames(tabel5)=c("Scaling +1","Scaling +2")
  
  tabel5_6=data.frame(Y1=tabel4$`PIT MPD+1`[1:5],Y2=tabel4$`PIT MPD+2`[1:5])
  
  intp_pd=function(data){
    hasil_intp=c()
    for (i in 1:ncol(data)){
      for (j in 1:12) {
        if (j==1){
          hasil_intp=cbind(hasil_intp,1-((1-data[,i])^(j/12)))
        } else {
          hasil_intp=cbind(hasil_intp,1-((1-data[,i])^(j/12)) - (1-(1-data[,i])^((j-1)/12)))
        }
      }
    }
    return(hasil_intp=as.data.frame(hasil_intp))
  }
  
  ## === YEARLY ===
  yearly_cpd_bfl=ympd
  colnames(yearly_cpd_bfl)=paste0("Y", 1:ncol(yearly_cpd_bfl))
  
  yearly_mpd_bfl=ympdx
  colnames(yearly_mpd_bfl)=paste0("Y", 1:ncol(yearly_mpd_bfl))
  
  yearly_mpd_afl=tabel5_6
  colnames(yearly_mpd_afl)=paste0("Y", 1:ncol(yearly_mpd_afl))
  
  yearly_cpd_afl=matocu(yearly_mpd_afl)
  colnames(yearly_cpd_afl)=paste0("Y", 1:ncol(yearly_cpd_afl))
  
  ## === MONTHLY ===
  monthly_mpd_bfl=intp_pd(yearly_mpd_bfl)
  colnames(monthly_mpd_bfl)=paste0("M", 1:ncol(monthly_mpd_bfl))
  
  monthly_mpd_afl=intp_pd(yearly_mpd_afl)
  colnames(monthly_mpd_afl)=paste0("M", 1:ncol(monthly_mpd_afl))
  
  ## tambahan: monthly_cpd
  monthly_cpd_bfl=matocu(monthly_mpd_bfl)
  colnames(monthly_cpd_bfl)=paste0("M", 1:ncol(monthly_cpd_bfl))
  
  monthly_cpd_afl=matocu(monthly_mpd_afl)
  colnames(monthly_cpd_afl)=paste0("M", 1:ncol(monthly_cpd_afl))
  
  Hasil.PD=list(FL.P.ODR=FL_P_ODR,
                TTC.ODR=TTC_ODR,
                MPD.Scalling=tabel3,
                Scalling=tabel4,
                Optimization=tabel5,
                yearly_cpd_bfl=yearly_cpd_bfl,
                yearly_mpd_bfl=yearly_mpd_bfl,
                yearly_mpd_afl=cap_upper(yearly_mpd_afl,1),
                yearly_cpd_afl=cap_upper(yearly_cpd_afl,1),
                monthly_mpd_bfl=cap_upper(monthly_mpd_bfl,1),
                monthly_mpd_afl=cap_upper(monthly_mpd_afl,1),
                monthly_cpd_bfl=cap_upper(monthly_cpd_bfl,1),
                monthly_cpd_afl=cap_upper(monthly_cpd_afl,1))
  
  Hasil.PD
}




PD_engine2=function(forecast_odr_boxplot,actual_odr,issuer,ympd){
  
  name_FL_P_ODR=c("PIT PD +1","PIT PD +2","CPD+1","Marginal PD +1","Marginal PD +2")
  value_FL_P_ODR=c(mean(forecast_odr_boxplot[1:12]),mean(forecast_odr_boxplot[13:24]),
                   mean(forecast_odr_boxplot[1:12]),mean(forecast_odr_boxplot[1:12]),
                   mean(forecast_odr_boxplot[13:24])*(1-mean(forecast_odr_boxplot[1:12])))
  FL_P_ODR=data.frame(value=value_FL_P_ODR)
  rownames(FL_P_ODR)=name_FL_P_ODR
  
  name_TTC_ODR=c("TTC PD +1","TTC PD +2","CPD +1","Marginal PD +1","Marginal PD +2")
  value_TTC_ODR=c(mean(actual_odr),mean(actual_odr),mean(actual_odr),
                  mean(actual_odr),mean(actual_odr)*(1-mean(actual_odr)))
  TTC_ODR=data.frame(value=value_TTC_ODR)
  rownames(TTC_ODR)=name_TTC_ODR
  
  cutoma=function(data){
    cutoma.pd=c()
    for (i in 1:ncol(data)) {
      if (i==1){
        cutoma.pd=cbind(cutoma.pd,data[,1])
      } else {
        cutoma.pd=cbind(cutoma.pd,data[,i]-data[,i-1])
      }
    }
    return(cutoma.pd=as.data.frame(cutoma.pd))
  }
  
  matocu=function(data){
    matocu.pd=c()
    for (i in 1:ncol(data)) {
      if (i==1){
        matocu.pd=cbind(matocu.pd,data[,1])
      } else {
        matocu.pd=cbind(matocu.pd,rowSums(data[,1:i]))
      }
    }
    return(matocu.pd=as.data.frame(matocu.pd))
  }
  
  ympdx=cutoma(ympd)
  ympdx[5,2:ncol(ympdx)]=0
  
  ym_pd=data.frame(Bucket=1:nrow(ympdx),TTC.MPD.1=ympdx[,1],TTC.MPD.2=ympdx[,2])
  Tot_ym_pd=c(crossprod(issuer[1:4],ym_pd$TTC.MPD.1[1:4])/sum(issuer[1:4]),
              crossprod(issuer[1:4],ym_pd$TTC.MPD.2[1:4])/sum(issuer[1:4]))
  
  mpd_scalling=c((FL_P_ODR$value[4]/TTC_ODR$value[4])*Tot_ym_pd[1],
                 (FL_P_ODR$value[5]/TTC_ODR$value[5])*Tot_ym_pd[2])
  MARGINAL.PD.1.S=mpd_scalling[1]
  MARGINAL.PD.2.S=mpd_scalling[2]
  
  Logit.TTC.1=ifelse(ym_pd$TTC.MPD.1[1:4]==0,0,log(ym_pd$TTC.MPD.1[1:4]/(1-ym_pd$TTC.MPD.1[1:4])))
  Logit.TTC.2=ifelse(ym_pd$TTC.MPD.2[1:4]==0,0,log(ym_pd$TTC.MPD.2[1:4]/(1-ym_pd$TTC.MPD.2[1:4])))
  TLogit.TTC.1=ifelse(Tot_ym_pd[1]==0,0,log(Tot_ym_pd[1]/(1-Tot_ym_pd[1])))
  TLogit.TTC.2=ifelse(Tot_ym_pd[2]==0,0,log(Tot_ym_pd[2]/(1-Tot_ym_pd[2])))
  
  f1=function(x) MARGINAL.PD.1.S-(crossprod(1/(1+exp(-(Logit.TTC.1+x))),issuer[1:4])/sum(issuer[1:4]))
  scaling1=uniroot(f1, lower = -50, upper = 50)$root
  
  f2=function(x) MARGINAL.PD.2.S-(crossprod(1/(1+exp(-(Logit.TTC.2+x))),issuer[1:4])/sum(issuer[1:4]))
  scaling2=uniroot(f2, lower = -50, upper = 50)$root
  
  
  
  
  tabel3=data.frame(value=mpd_scalling)
  rownames(tabel3)=c("Marginal PD +1", "Marginal PD +2")
  
  tabel4=data.frame(Bucket=c(1,2,3,4,5,"Total"),
                    Z=c(issuer,sum(issuer)),
                    A=c(ym_pd$TTC.MPD.1,Tot_ym_pd[1]),
                    B=c(ym_pd$TTC.MPD.2,Tot_ym_pd[2]),
                    C=c(1/(1+exp(-(Logit.TTC.1+scaling1))),1,crossprod(1/(1+exp(-(Logit.TTC.1+scaling1))),issuer[1:4])/sum(issuer[1:4])),
                    D=c(1/(1+exp(-(Logit.TTC.2+scaling2))),0,crossprod(1/(1+exp(-(Logit.TTC.2+scaling2))),issuer[1:4])/sum(issuer[1:4])),
                    E=c(Logit.TTC.1,NA,TLogit.TTC.1),
                    F=c(Logit.TTC.2,NA,TLogit.TTC.2),
                    G=c(Logit.TTC.1+scaling1,NA,TLogit.TTC.1+scaling1),
                    H=c(Logit.TTC.2+scaling2,NA,TLogit.TTC.2+scaling2)
  )
  
  colnames(tabel4)=c("Bucket","issuer","TTC MPD+1",	
                     "TTC MPD+2",	"PIT MPD+1",	"PIT MPD+2",
                     "Logit TTC+1", "Logit TTC+2",
                     "Logit PIT+1",	"Logit PIT+2")
  
  tabel5=data.frame(value=c(scaling1,scaling2))
  rownames(tabel5)=c("Scaling +1","Scaling +2")
  
  tabel5_6=data.frame(Y1=tabel4$`PIT MPD+1`[1:5],Y2=tabel4$`PIT MPD+2`[1:5])
  
  intp_pd=function(data){
    hasil_intp=c()
    for (i in 1:ncol(data)){
      for (j in 1:12) {
        if (j==1){
          hasil_intp=cbind(hasil_intp,1-((1-data[,i])^(j/12)))
        } else {
          hasil_intp=cbind(hasil_intp,1-((1-data[,i])^(j/12)) - (1-(1-data[,i])^((j-1)/12)))
        }
      }
    }
    return(hasil_intp=as.data.frame(hasil_intp))
  }
  
  ## === YEARLY ===
  yearly_cpd_bfl=ympd
  colnames(yearly_cpd_bfl)=paste0("Y", 1:ncol(yearly_cpd_bfl))
  
  yearly_mpd_bfl=ympdx
  colnames(yearly_mpd_bfl)=paste0("Y", 1:ncol(yearly_mpd_bfl))
  
  yearly_mpd_afl=tabel5_6
  colnames(yearly_mpd_afl)=paste0("Y", 1:ncol(yearly_mpd_afl))
  
  yearly_cpd_afl=matocu(yearly_mpd_afl)
  colnames(yearly_cpd_afl)=paste0("Y", 1:ncol(yearly_cpd_afl))
  
  ## === MONTHLY ===
  monthly_mpd_bfl=intp_pd(yearly_mpd_bfl)
  colnames(monthly_mpd_bfl)=paste0("M", 1:ncol(monthly_mpd_bfl))
  
  monthly_mpd_afl=intp_pd(yearly_mpd_afl)
  colnames(monthly_mpd_afl)=paste0("M", 1:ncol(monthly_mpd_afl))
  
  ## tambahan: monthly_cpd
  monthly_cpd_bfl=matocu(monthly_mpd_bfl)
  colnames(monthly_cpd_bfl)=paste0("M", 1:ncol(monthly_cpd_bfl))
  
  monthly_cpd_afl=matocu(monthly_mpd_afl)
  colnames(monthly_cpd_afl)=paste0("M", 1:ncol(monthly_cpd_afl))
  
  Hasil.PD=list(FL.P.ODR=FL_P_ODR,
                TTC.ODR=TTC_ODR,
                MPD.Scalling=tabel3,
                Scalling=tabel4,
                Optimization=tabel5,
                yearly_cpd_bfl=yearly_cpd_bfl,
                yearly_mpd_bfl=yearly_mpd_bfl,
                yearly_mpd_afl=cap_upper(yearly_mpd_afl,1),
                yearly_cpd_afl=cap_upper(yearly_cpd_afl,1),
                monthly_mpd_bfl=cap_upper(monthly_mpd_bfl,1),
                monthly_mpd_afl=cap_upper(monthly_mpd_afl,1),
                monthly_cpd_bfl=cap_upper(monthly_cpd_bfl,1),
                monthly_cpd_afl=cap_upper(monthly_cpd_afl,1))
  
  Hasil.PD
}




PD_engine_final=function(x,y,z,w){
  
  monthly_mpd_afl_final=(w[1]*x)+(w[2]*y)+(w[3]*z)
  monthly_mpd_afl_final[5,1]=1
  colnames(monthly_mpd_afl_final)=paste0("M", 1:ncol(monthly_mpd_afl_final))
  matocu=function(data){
    matocu.pd=c()
    for (i in 1:ncol(data)) {
      if (i==1){
        matocu.pd=cbind(matocu.pd,data[,1])
      } else {
        matocu.pd=cbind(matocu.pd,rowSums(data[,1:i]))
      }
    }
    return(matocu.pd=as.data.frame(matocu.pd))
  }
  
  monthly_cpd_afl_final=matocu(monthly_mpd_afl_final)
  colnames(monthly_cpd_afl_final)=paste0("M", 1:ncol(monthly_cpd_afl_final))
  
  yearly_cpd_afl=c()
  for (i in 1:(ncol(x)/12)){
    yearly_cpd_afl=cbind(yearly_cpd_afl,monthly_cpd_afl_final[,12*i])
  }
  
  
  n_months <- ncol(monthly_cpd_afl_final)
  n_years  <- floor(n_months / 12)
  if (n_years < 1) stop("Butuh >= 12 kolom (bulan) untuk hitung yearly PD.")
  
  yearly_cpd_afl <- as.data.frame(
    sapply(seq_len(n_years), function(k) monthly_cpd_afl_final[, 12*k])
  )
  
  yearly_mpd_afl_final <- yearly_cpd_afl
  yearly_mpd_afl_final[,1] <- yearly_cpd_afl[,1]                        # Y1
  if (n_years > 1){
    for (k in 2:n_years){
      yearly_mpd_afl_final[,k] <- yearly_cpd_afl[,k] - yearly_cpd_afl[,k-1]
    }
  }
  colnames(yearly_mpd_afl_final) <- paste0("Y", seq_len(n_years))
  
  yearly_cpd_afl=as.data.frame(yearly_cpd_afl)
  colnames(yearly_cpd_afl)=paste0("Y", 1:ncol(yearly_cpd_afl))
  
  hasil_pd_final=list(monthly_mpd_afl_final=cap_upper(monthly_mpd_afl_final,1),
                      monthly_cpd_afl_final=cap_upper(monthly_cpd_afl_final,1),
                      yearly_mpd_afl_final=cap_upper(yearly_mpd_afl_final,1),
                      yearly_cpd_afl_final=cap_upper(yearly_cpd_afl,1))
  hasil_pd_final
}





# ===== YEARLY (sudah ada – ini biar lengkap) =====
build_yearly_rows <- function(mpd_mat, cpd_mat, scenario_id, prc_date, pd_config_id, model_id, created_by) {
  stopifnot(nrow(mpd_mat) == nrow(cpd_mat), ncol(mpd_mat) == ncol(cpd_mat))
  nb <- nrow(mpd_mat); ny <- ncol(mpd_mat)
  
  yrs <- colnames(mpd_mat)
  years <- if (length(yrs) && all(grepl("^Y\\d+$", yrs))) as.integer(sub("^Y","",yrs)) else seq_len(ny)
  
  fl_year_vec <- rep(years, each = nb)             # 1..ny
  fl_seq_vec  <- rep(seq.int(0, ny - 1), each = nb) # 0..ny-1
  
  data.frame(
    prc_date      = as.Date(prc_date),
    pd_config_id  = as.integer(pd_config_id),
    model_id      = as.integer(model_id),
    scenario_id   = as.integer(scenario_id),
    bucket_id     = rep(seq_len(nb), times = ny),
    forecast_date = as.Date(as.Date(prc_date) %m+% years(fl_year_vec)),  # PRC_DATE + FL_YEAR
    fl_seq        = as.integer(fl_seq_vec),
    fl_year       = as.integer(fl_year_vec),
    marginal_pd   = as.numeric(unlist(mpd_mat, use.names = FALSE)),
    cumulative_pd = as.numeric(unlist(cpd_mat, use.names = FALSE)),
    created_by    = created_by,
    stringsAsFactors = FALSE
  )
}

# ===== MONTHLY (baru) =====
# Jika cpd_mat NULL -> dihitung dari mpd_mat dengan survival product.
build_monthly_rows <- function(mpd_mat, cpd_mat = NULL, scenario_id, prc_date, pd_config_id, model_id, created_by) {
  mpd <- as.matrix(mpd_mat)
  nb  <- nrow(mpd); nm <- ncol(mpd)
  
  if (is.null(cpd_mat)) {
    cpd <- t(apply(mpd, 1, function(r) 1 - cumprod(1 - pmax(pmin(r, 1 - 1e-12), 0))))
  } else {
    cpd <- as.matrix(cpd_mat)
    stopifnot(nrow(cpd) == nb, ncol(cpd) == nm)
  }
  
  fl_seq_vec <- rep(seq.int(0, nm - 1), each = nb)             # 0..nm-1
  fl_seq_vec1 <- rep(seq.int(1, nm), each = nb)  
  bucket_vec <- rep(seq_len(nb), times = nm)
  
  data.frame(
    prc_date      = as.Date(prc_date),
    pd_config_id  = as.integer(pd_config_id),
    model_id      = as.integer(model_id),
    scenario_id   = as.integer(scenario_id),
    bucket_id     = bucket_vec,
    forecast_date = as.Date(as.Date(prc_date) %m+% months(fl_seq_vec1)),  # PRC_DATE + fl_seq bulan
    fl_seq        = as.integer(fl_seq_vec),
    fl_year       = as.integer(fl_seq_vec %/% 12 + 1L),                  # 1..ceil(nm/12)
    fl_month      = as.integer(fl_seq_vec %% 12 + 1L),                   # 1..12 (Jan..Des relatif)
    marginal_pd   = as.numeric(unlist(mpd, use.names = FALSE)),
    cumulative_pd = as.numeric(unlist(cpd, use.names = FALSE)),
    created_by    = created_by,
    stringsAsFactors = FALSE
  )
}

