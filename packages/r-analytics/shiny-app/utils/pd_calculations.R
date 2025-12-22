# =============================================================================
# PD CALCULATIONS UTILITY FUNCTIONS
# =============================================================================
# Extracted from: _analytics/_v15/reference/global.R
# Purpose: Probability of Default calculations, scenario analysis, and PD engine
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

# Define %||% operator (null-coalescing operator)
# Returns left operand if not NULL, otherwise returns right operand
`%||%` <- function(x, y) if (!is.null(x)) x else y

#' Boxplot scenario analysis for macroeconomic variables (Original implementation from global.R)
#' @param x Historical data matrix
#' @param intuisi Vector of intuition signs (-1, 0, 1) for each variable
#' @return Boxplot scenario results with classification, frequency, and statistics
Boxplot_Scenario <- function(x, intuisi) {

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

  # Proses klasifikasi otomatis
  df_klasifikasi <- c()
  for (i in 1:length(cols_to_classify)) {
    if (intuisi[i] == 1) {
      df_klasifikasi <- cbind(df_klasifikasi, klasifikasi_macro1(x[, i]))
    } else {
      df_klasifikasi <- cbind(df_klasifikasi, klasifikasi_macro2(x[, i]))
    }
  }

  df_klasifikasi <- as.data.frame(df_klasifikasi)
  colnames(df_klasifikasi) <- cols_to_classify
  df.klasifikasi <- df_klasifikasi

  library(dplyr)
  library(tidyr)

  # Urutan variabel asli
  urutan_var <- colnames(df_klasifikasi)

  # Ubah ke long format
  df_long <- df_klasifikasi %>%
    dplyr::mutate(RowID = dplyr::row_number()) %>%
    tidyr::pivot_longer(-RowID, names_to = "Variable", values_to = "Category")

  # Hitung frekuensi per kategori dan variabel
  pivot_table <- df_long %>%
    dplyr::count(Category, Variable) %>%
    tidyr::pivot_wider(names_from = Variable, values_from = n, values_fill = 0) %>%
    dplyr::select(Category, dplyr::all_of(urutan_var))

  # Hitung total per kolom
  total_row <- c(Category = "Total", as.list(colSums(pivot_table[, -1])))

  # Tambahkan baris Total
  pivot_table <- dplyr::bind_rows(pivot_table, total_row)

  # Atur urutan kategori manual
  kategori_order <- c("BASE", "BEST", "WORST", "OUTLIER", "Total")
  pivot_table$Category <- factor(pivot_table$Category, levels = kategori_order)

  # Urutkan sesuai urutan kategori
  pivot_table <- pivot_table %>% dplyr::arrange(Category)

  # Tampilkan hasil
  pivot_table <- as.data.frame(pivot_table)
  category.frecuency <- pivot_table

  #########################RATA-RATA###########################
  # Beri suffix untuk kolom klasifikasi
  df_klasifikasi_renamed <- df_klasifikasi %>%
    dplyr::rename_with(~ paste0(., "_class"))

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
    tidyr::pivot_wider(names_from = variabel, values_from = nilai) %>%
    dplyr::select(Average, dplyr::all_of(vars_numerik)) %>%
    dplyr::arrange(factor(Average, levels = c("BASE", "BEST", "WORST")))

  avg_table <- as.data.frame(avg_table)
  avg.table <- avg_table

  #########################FREKUENSI PERCENTAGE###########################
  pivot_table <- pivot_table[-4:-5, ]

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

  category.percentage <- pivot_table_percent

  #########################RATA-RATA PERCENTAGE###########################
  average_per_category <- rowMeans(pivot_table_percent[, -1])
  names(average_per_category) <- pivot_table_percent$Category
  weighted.boxplot <- average_per_category

  #########################DIFFERENCE FROM BASE###########################
  # Hitung rasio (BEST - BASE) / BASE with safety checks
  base_value <- avg_table[1, -1]
  rasio_best <- ifelse(base_value == 0 | is.na(base_value), 0,
                        (avg_table[2, -1] - base_value) / base_value)
  rasio_worst <- ifelse(base_value == 0 | is.na(base_value), 0,
                        (avg_table[3, -1] - base_value) / base_value)

  # Gabungkan jadi tabel baru
  diff_base <- rbind(BEST = rasio_best, WORST = rasio_worst)
  diff.base <- diff_base

  boxplot_result <- list(
    df.klasifikasi = df.klasifikasi,
    category.frecuency = category.frecuency,
    category.percentage = category.percentage,
    weighted.boxplot = weighted.boxplot,
    avg.table = avg.table,
    diff.base = diff.base
  )

  return(boxplot_result)
}

#' Forecast MEV boxplot function (Original implementation from global.R)
#' @param mev_base Base MEV data
#' @param db_boxplot Boxplot difference data
#' @param modely Regression model
#' @param z Transformation type ("logit", "log", or none)
#' @param coln Column name for dependent variable
#' @param metode Outlier method ("boxplot" or "sd")
#' @return Forecast boxplot results
forecast_mev_bxp <- function(mev_base, db_boxplot, modely, z, coln, metode = "boxplot") {

  library(stringr)

  # ORIGINAL WORKING LOGIC: Use the exact same logic as the working version
  # Daftar nama input yang ingin dicocokkan
  input_vars <- colnames(mev_base)

  # Daftar referensi target
  names <- colnames(db_boxplot)

  cat("🔍 DEBUG [FORECAST_MEV_BXP]: Using ORIGINAL working logic\n")
  cat("  - input_vars (mev_base columns):", paste(input_vars, collapse=", "), "\n")
  cat("  - names (db_boxplot columns):", paste(names, collapse=", "), "\n")

  # ORIGINAL LOGIC: Proses pencocokan: ambil nama dalam `names` yang cocok sebagian dengan `input_vars`
  matched_names <- names[sapply(names, function(nm) {
    any(str_detect(toupper(input_vars), toupper(nm)))
  })]

  cat("  - matched_names (original logic):", paste(matched_names, collapse=", "), "\n")

  # ORIGINAL LOGIC: Use matched names from boxplot
  multiplied_bxp <- db_boxplot[, matched_names, drop = FALSE]

  # DEBUG: Log dimension matching before kalikan_df
  cat("🔍 DEBUG [FORECAST_MEV_BXP]: Original matching results\n")
  cat("  - mev_base dimensions:", paste(dim(mev_base), collapse="x"), "\n")
  cat("  - mev_base[,-1] dimensions:", paste(dim(mev_base[,-1]), collapse="x"), "\n")
  cat("  - multiplied_bxp dimensions:", paste(dim(multiplied_bxp), collapse="x"), "\n")
  cat("  - Length check: mev_base[,-1] cols =", ncol(mev_base[,-1]), ", multiplied_bxp cols =", ncol(multiplied_bxp), "\n")
  if(nrow(multiplied_bxp) >= 1) {
    cat("  - multiplied_bxp[1,] length:", length(multiplied_bxp[1,]), "\n")
    cat("  - multiplied_bxp[1,] values:", paste(multiplied_bxp[1,], collapse=", "), "\n")
  }

  # ORIGINAL LOGIC: kalikan_df function (unchanged)
  kalikan_df <- function(a, b) {
    cat("🔍 DEBUG [KALIKAN_DF]: Validating dimensions\n")
    cat("  - a (dataframe) ncol:", ncol(a), "\n")
    cat("  - b (vector) length:", length(b), "\n")
    if(ncol(a) != length(b)) {
      cat("❌ DEBUG [KALIKAN_DF]: Dimension mismatch - ncol(a)=", ncol(a), "!= length(b)=", length(b), "\n")
      cat("  - a column names:", paste(colnames(a), collapse=", "), "\n")
      cat("  - b names:", paste(names(b), collapse=", "), "\n")
    }
    stopifnot(ncol(a) == length(b))  # validasi ukuran b

    hasil <- as.data.frame(
      Map(function(col, faktor) {
        col * (1 + faktor)
      }, a, b)
    )

    colnames(hasil) <- colnames(a)
    return(hasil)
  }

  # CRITICAL FIX: Filter mev_base to only include variables with boxplot scenarios
  mev_variables <- colnames(mev_base)[-1]  # All variables except date

  # Find which mev variables have corresponding boxplot scenarios
  mev_with_scenarios <- mev_variables[sapply(mev_variables, function(var) {
    any(str_detect(toupper(var), toupper(matched_names)))
  })]

  cat("🔧 DEBUG [FORECAST_MEV_BXP]: Variable filtering for kalikan_df\n")
  cat("  - mev_variables:", paste(mev_variables, collapse=", "), "\n")
  cat("  - mev_with_scenarios:", paste(mev_with_scenarios, collapse=", "), "\n")

  # Use only the variables that have scenarios
  mev_filtered <- mev_base[, mev_with_scenarios, drop = FALSE]

  mev_bestc <- kalikan_df(mev_filtered, multiplied_bxp[1, ])
  mev_worstc <- kalikan_df(mev_filtered, multiplied_bxp[2, ])

  # CRITICAL FIX: Reconstruct complete data frames for model prediction
  # Start with original mev_base for all scenarios
  mev_best <- mev_base
  mev_worst <- mev_base

  # Replace only the variables that have scenarios with modified values
  for(var in mev_with_scenarios) {
    mev_best[[var]] <- mev_bestc[[var]]
    mev_worst[[var]] <- mev_worstc[[var]]
  }

  cat("🔧 DEBUG [FORECAST_MEV_BXP]: Reconstructed prediction data\n")
  cat("  - mev_best columns:", paste(colnames(mev_best), collapse=", "), "\n")
  cat("  - mev_worst columns:", paste(colnames(mev_worst), collapse=", "), "\n")

  ####predict pakai model
  predict_base <- predict(modely, mev_base)
  predict_best <- predict(modely, mev_best)
  predict_worst <- predict(modely, mev_worst)

  #####back transform
  back_trans <- function(x, z, coln) {

    if (z == "logit") {
      hasil_trans <- data.frame(y_trans = x, y = exp(x) / (1 + exp(x)))
      colnames(hasil_trans) <- c(coln, paste0("BT_", coln))
    } else if (z == "log") {
      hasil_trans <- data.frame(y_trans = x, y = exp(x))
      colnames(hasil_trans) <- c(coln, paste0("BT_", coln))
    } else {
      hasil_trans <- data.frame(y_trans = x, y = x)
      colnames(hasil_trans) <- c(coln, paste0("BT_", coln))
    }

    return(hasil_trans)
  }

  f_base <- cbind(mev_base, back_trans(predict_base, z, coln))
  f_best <- cbind(mev_best, back_trans(predict_best, z, coln))
  f_worst <- cbind(mev_worst, back_trans(predict_worst, z, coln))

  # DEBUG: Log forecast transformation results
  cat("🔍 DEBUG [FORECAST_MEV_BXP]: Creating f_yjoin with forecast results\n")
  cat("  - f_base dimensions:", paste(dim(f_base), collapse="x"), "\n")
  cat("  - f_best dimensions:", paste(dim(f_best), collapse="x"), "\n")
  cat("  - f_worst dimensions:", paste(dim(f_worst), collapse="x"), "\n")
  cat("  - coln (dependent variable):", coln, "\n")
  cat("  - z (transformation):", z, "\n")

  f_yjoin <- data.frame(
    f_base[, ncol(f_base)],
    f_best[, ncol(f_best)],
    f_worst[, ncol(f_worst)]
  )
  colnames(f_yjoin) <- c(
    paste0(coln, " BASE"),
    paste0(coln, " BEST"),
    paste0(coln, " WORST")
  )

  cat("  - f_yjoin dimensions:", paste(dim(f_yjoin), collapse="x"), "\n")
  cat("  - f_yjoin column names:", paste(colnames(f_yjoin), collapse=", "), "\n")
  cat("  - f_yjoin first 5 rows BASE:", paste(round(f_yjoin[1:min(5,nrow(f_yjoin)), 1], 4), collapse=", "), "\n")

  forecast.boxplot.result <- list(
    f.base = f_base,
    f.best = f_best,
    f.worst = f_worst,
    f.yjoin = f_yjoin,
    diff.boxplot = multiplied_bxp
  )

  return(forecast.boxplot.result)
}

#' Cap upper bound for values
#' @param x Input value or vector
#' @param upper_bound Upper bound limit
#' @return Capped values
cap_upper <- function(x, upper_bound = 1) {
  return(pmin(x, upper_bound))
}

#' Build yearly rows for PD calculation (Original implementation from global.R)
#' @param mpd_mat Marginal PD matrix
#' @param cpd_mat Cumulative PD matrix
#' @param scenario_id Scenario identifier (1=Base, 2=Best, 3=Worst, 4=Final)
#' @param prc_date Processing date
#' @param pd_config_id PD configuration ID
#' @param model_id Model ID
#' @param created_by User who created the record
#' @return Yearly PD data structure for database insertion
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

#' Build monthly rows for PD calculation (Original implementation from global.R)
#' @param mpd_mat Marginal PD matrix
#' @param cpd_mat Cumulative PD matrix (optional, will be calculated if NULL)
#' @param scenario_id Scenario identifier (1=Base, 2=Best, 3=Worst, 4=Final)
#' @param prc_date Processing date
#' @param pd_config_id PD configuration ID
#' @param model_id Model ID
#' @param created_by User who created the record
#' @return Monthly PD data structure for database insertion
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

# ===== CAP UPPER FUNCTION =====
cap_upper <- function(df, upper = 1) {
  df[] <- lapply(df, function(col) pmin(col, upper, na.rm = TRUE))
  df
}

# ===== PD ENGINE FUNCTION =====
PD_engine=function(forecast_odr_boxplot,actual_odr,issuer,ympd){

  # CRITICAL FIX: Add comprehensive input validation
  cat("🔍 DEBUG [PD_ENGINE]: Validating input parameters\n")

  # Check if inputs are valid
  if (is.null(forecast_odr_boxplot) || is.null(actual_odr) ||
      is.null(issuer) || is.null(ympd)) {
    cat("❌ ERROR [PD_ENGINE]: NULL input parameters\n")
    return(NULL)
  }

  # Check if inputs are numeric vectors
  if (!is.numeric(forecast_odr_boxplot) || !is.numeric(actual_odr) ||
      !is.numeric(issuer)) {
    cat("❌ ERROR [PD_ENGINE]: Non-numeric input parameters\n")
    return(NULL)
  }

  # Check minimum required lengths
  if (length(forecast_odr_boxplot) < 24) {
    cat("❌ ERROR [PD_ENGINE]: forecast_odr_boxplot must have at least 24 values, got", length(forecast_odr_boxplot), "\n")
    return(NULL)
  }

  if (length(actual_odr) < 1) {
    cat("❌ ERROR [PD_ENGINE]: actual_odr must have at least 1 value, got", length(actual_odr), "\n")
    return(NULL)
  }

  if (length(issuer) < 4) {
    cat("❌ ERROR [PD_ENGINE]: issuer must have at least 4 values, got", length(issuer), "\n")
    return(NULL)
  }

  # Check ympd matrix dimensions
  if (!is.matrix(ympd) && !is.data.frame(ympd)) {
    cat("❌ ERROR [PD_ENGINE]: ympd must be a matrix or data frame\n")
    return(NULL)
  }

  if (nrow(ympd) < 5) {
    cat("❌ ERROR [PD_ENGINE]: ympd must have at least 5 rows, got", nrow(ympd), "\n")
    return(NULL)
  }

  # Ensure all values are finite and not NA
  if (any(is.na(forecast_odr_boxplot)) || any(is.infinite(forecast_odr_boxplot))) {
    cat("⚠️  WARNING [PD_ENGINE]: forecast_odr_boxplot contains NA or infinite values\n")
    forecast_odr_boxplot <- forecast_odr_boxplot[!is.na(forecast_odr_boxplot) & !is.infinite(forecast_odr_boxplot)]
    if (length(forecast_odr_boxplot) < 24) {
      cat("❌ ERROR [PD_ENGINE]: Insufficient valid forecast data after cleaning\n")
      return(NULL)
    }
  }

  if (any(is.na(actual_odr)) || any(is.infinite(actual_odr))) {
    cat("⚠️  WARNING [PD_ENGINE]: actual_odr contains NA or infinite values\n")
    actual_odr <- actual_odr[!is.na(actual_odr) & !is.infinite(actual_odr)]
    if (length(actual_odr) == 0) {
      cat("❌ ERROR [PD_ENGINE]: No valid actual_odr data after cleaning\n")
      return(NULL)
    }
  }

  name_FL_P_ODR=c("PIT PD +1","PIT PD +2","CPD+1","Marginal PD +1","Marginal PD +2")

  # CRITICAL FIX: Add bounds checking for array access
  tryCatch({
    # Check if we have enough data for the calculations
    if (length(forecast_odr_boxplot) < 24) {
      cat("❌ ERROR [PD_ENGINE]: Not enough forecast data (need >=24, got", length(forecast_odr_boxplot), ")\n")
      return(NULL)
    }

    # Calculate with bounds checking
    first_half_mean <- mean(forecast_odr_boxplot[1:12])
    second_half_mean <- mean(forecast_odr_boxplot[13:24])

    value_FL_P_ODR <- c(first_half_mean, second_half_mean,
                        first_half_mean, first_half_mean,
                        second_half_mean * (1 - first_half_mean))

    # Check for invalid calculations
    if (any(is.na(value_FL_P_ODR)) || any(is.infinite(value_FL_P_ODR))) {
      cat("❌ ERROR [PD_ENGINE]: Invalid FL_P_ODR calculations\n")
      return(NULL)
    }

    FL_P_ODR <- data.frame(value = value_FL_P_ODR)
    rownames(FL_P_ODR) <- name_FL_P_ODR

  }, error = function(e) {
    cat("❌ ERROR [PD_ENGINE]: Error calculating FL_P_ODR:", e$message, "\n")
    return(NULL)
  })

  name_TTC_ODR=c("TTC PD +1","TTC PD +2","CPD +1","Marginal PD +1","Marginal PD +2")

  tryCatch({
    actual_odr_mean <- mean(actual_odr)

    if (is.na(actual_odr_mean) || is.infinite(actual_odr_mean)) {
      cat("❌ ERROR [PD_ENGINE]: Invalid actual_odr mean calculation\n")
      return(NULL)
    }

    value_TTC_ODR <- c(actual_odr_mean, actual_odr_mean, actual_odr_mean,
                      actual_odr_mean, actual_odr_mean * (1 - actual_odr_mean))

    # Check for invalid calculations
    if (any(is.na(value_TTC_ODR)) || any(is.infinite(value_TTC_ODR))) {
      cat("❌ ERROR [PD_ENGINE]: Invalid TTC_ODR calculations\n")
      return(NULL)
    }

    TTC_ODR <- data.frame(value = value_TTC_ODR)
    rownames(TTC_ODR) <- name_TTC_ODR

  }, error = function(e) {
    cat("❌ ERROR [PD_ENGINE]: Error calculating TTC_ODR:", e$message, "\n")
    return(NULL)
  })

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

  # CRITICAL DEBUG: Add detailed debugging for logit calculation
  cat("🔍 DEBUG [PD_ENGINE]: Pre-logit calculation data\n")
  cat("  - ym_pd structure:\n")
  print(ym_pd)
  cat("  - ym_pd$TTC.MPD.1[1:4]:", paste(round(ym_pd$TTC.MPD.1[1:4], 6), collapse=", "), "\n")
  cat("  - ym_pd$TTC.MPD.2[1:4]:", paste(round(ym_pd$TTC.MPD.2[1:4], 6), collapse=", "), "\n")
  cat("  - Tot_ym_pd:", paste(round(Tot_ym_pd, 6), collapse=", "), "\n")

  # Check for problematic values
  cat("  - Values == 0:", sum(ym_pd$TTC.MPD.1[1:4] == 0), "in TTC.MPD.1,", sum(ym_pd$TTC.MPD.2[1:4] == 0), "in TTC.MPD.2\n")
  cat("  - Values >= 1:", sum(ym_pd$TTC.MPD.1[1:4] >= 1), "in TTC.MPD.1,", sum(ym_pd$TTC.MPD.2[1:4] >= 1), "in TTC.MPD.2\n")

  # Use EXACT original logic from working version
  Logit.TTC.1=ifelse(ym_pd$TTC.MPD.1[1:4]==0,0,log(ym_pd$TTC.MPD.1[1:4]/(1-ym_pd$TTC.MPD.1[1:4])))
  Logit.TTC.2=ifelse(ym_pd$TTC.MPD.2[1:4]==0,0,log(ym_pd$TTC.MPD.2[1:4]/(1-ym_pd$TTC.MPD.2[1:4])))
  TLogit.TTC.1=ifelse(Tot_ym_pd[1]==0,0,log(Tot_ym_pd[1]/(1-Tot_ym_pd[1])))
  TLogit.TTC.2=ifelse(Tot_ym_pd[2]==0,0,log(Tot_ym_pd[2]/(1-Tot_ym_pd[2])))

  cat("  - Logit.TTC.1:", paste(round(Logit.TTC.1, 6), collapse=", "), "\n")
  cat("  - Logit.TTC.2:", paste(round(Logit.TTC.2, 6), collapse=", "), "\n")
  cat("  - TLogit.TTC.1:", round(TLogit.TTC.1, 6), "\n")
  cat("  - TLogit.TTC.2:", round(TLogit.TTC.2, 6), "\n")

  f1=function(x) MARGINAL.PD.1.S-(crossprod(1/(1+exp(-(Logit.TTC.1+x))),issuer[1:4])/sum(issuer[1:4]))
  f2=function(x) MARGINAL.PD.2.S-(crossprod(1/(1+exp(-(Logit.TTC.2+x))),issuer[1:4])/sum(issuer[1:4]))

  # CRITICAL FIX: Add robust error handling for uniroot edge cases
  cat("🔧 DEBUG [PD_ENGINE]: Attempting uniroot calculations\n")
  cat("  - MARGINAL.PD.1.S:", round(MARGINAL.PD.1.S, 6), "\n")
  cat("  - MARGINAL.PD.2.S:", round(MARGINAL.PD.2.S, 6), "\n")

  # Test function values at endpoints to diagnose uniroot issues
  f1_lower <- f1(-50)
  f1_upper <- f1(50)
  f2_lower <- f2(-50)
  f2_upper <- f2(50)

  cat("  - f1(-50):", round(f1_lower, 6), "f1(50):", round(f1_upper, 6), "\n")
  cat("  - f2(-50):", round(f2_lower, 6), "f2(50):", round(f2_upper, 6), "\n")

  # Try uniroot with error handling and fallback
  scaling1 <- tryCatch({
    uniroot(f1, lower = -50, upper = 50)$root
  }, error = function(e) {
    cat("⚠️ WARNING [PD_ENGINE]: uniroot failed for scaling1 -", e$message, "\n")
    cat("  - Using fallback scaling1 = 0\n")
    0  # Fallback to no scaling
  })

  scaling2 <- tryCatch({
    uniroot(f2, lower = -50, upper = 50)$root
  }, error = function(e) {
    cat("⚠️ WARNING [PD_ENGINE]: uniroot failed for scaling2 -", e$message, "\n")
    cat("  - Using fallback scaling2 = 0\n")
    0  # Fallback to no scaling
  })

  cat("  - scaling1:", round(scaling1, 6), "\n")
  cat("  - scaling2:", round(scaling2, 6), "\n")

  tabel3=data.frame(value=mpd_scalling)
  rownames(tabel3)=c("Marginal PD +1", "Marginal PD +2")

  # CRITICAL FIX: Ensure all vectors have same length (6 elements)
  # Check vector lengths before combining
  cat("🔍 DEBUG [PD_ENGINE]: Checking vector lengths for tabel4\n")
  cat("  - issuer length:", length(issuer), "\n")
  cat("  - issuer[1:4] length:", length(issuer[1:4]), "\n")

  # Ensure issuer has at least 4 elements for the calculations
  if (length(issuer) < 4) {
    cat("⚠️ WARNING [PD_ENGINE]: issuer vector too short, padding with zeros\n")
    issuer <- c(issuer, rep(0, 4 - length(issuer)))
  }

  # Calculate the weighted averages safely
  pit_pd1_weighted <- crossprod(1/(1+exp(-(Logit.TTC.1+scaling1))), issuer[1:4])/sum(issuer[1:4])
  pit_pd2_weighted <- crossprod(1/(1+exp(-(Logit.TTC.2+scaling2))), issuer[1:4])/sum(issuer[1:4])

  # Create tabel4 with consistent 6-element vectors
  tabel4=data.frame(Bucket=c(1,2,3,4,5,"Total"),
                    Z=c(issuer[1:5], sum(issuer[1:5])),
                    A=c(ym_pd$TTC.MPD.1, Tot_ym_pd[1]),
                    B=c(ym_pd$TTC.MPD.2, Tot_ym_pd[2]),
                    C=c(1/(1+exp(-(Logit.TTC.1+scaling1))), 1, pit_pd1_weighted),
                    D=c(1/(1+exp(-(Logit.TTC.2+scaling2))), 0, pit_pd2_weighted),
                    E=c(Logit.TTC.1, NA, TLogit.TTC.1),
                    F=c(Logit.TTC.2, NA, TLogit.TTC.2),
                    G=c(Logit.TTC.1+scaling1, NA, TLogit.TTC.1+scaling1),
                    H=c(Logit.TTC.2+scaling2, NA, TLogit.TTC.2+scaling2)
  )

  colnames(tabel4)=c("Bucket","issuer","TTC MPD+1",
                     "TTC MPD+2",	"PIT MPD+1",	"PIT MPD+2",
                     "Logit TTC+1", "Logit TTC+2",
                     "Logit PIT+1",	"Logit PIT+2")

  tabel5=data.frame(value=c(scaling1,scaling2))
  rownames(tabel5)=c("Scaling +1","Scaling +2")

  # FIX: Ensure consistent row counts - check dimensions before cbind
  # Create tabel5_6 first, then prepare ympdx_subset with matching rows
  tabel5_6 <- data.frame(Y1=tabel4$`PIT MPD+1`[1:5], Y2=tabel4$`PIT MPD+2`[1:5])

  # Only use first 5 rows of ympdx to match tabel5_6 (exclude Total row)
  ympdx_rows <- nrow(ympdx)
  if (ympdx_rows >= 5) {
    ympdx_subset <- ympdx[1:5, 3:ncol(ympdx), drop=FALSE]
  } else {
    # Fallback: use available rows and adjust tabel5_6
    ympdx_subset <- ympdx[, 3:ncol(ympdx), drop=FALSE]
    if (nrow(tabel4) >= ympdx_rows) {
      tabel5_6 <- data.frame(Y1=tabel4$`PIT MPD+1`[1:ympdx_rows], Y2=tabel4$`PIT MPD+2`[1:ympdx_rows])
    }
  }

  # Validate dimensions before cbind
  if (nrow(tabel5_6) != nrow(ympdx_subset)) {
    cat("⚠️ WARNING [PD_ENGINE]: Row count mismatch - tabel5_6:", nrow(tabel5_6), "ympdx_subset:", nrow(ympdx_subset), "\n")
    # Use minimum rows to prevent error
    min_rows <- min(nrow(tabel5_6), nrow(ympdx_subset))
    if (min_rows > 0) {
      tabel5_6 <- tabel5_6[1:min_rows, , drop=FALSE]
      ympdx_subset <- ympdx_subset[1:min_rows, , drop=FALSE]
      cat("  - Adjusted to", min_rows, "rows\n")
    } else {
      # Create empty data frame if no valid data
      tabel5_6 <- data.frame(Y1=numeric(0), Y2=numeric(0))
      ympdx_subset <- data.frame()
      cat("  - Using empty data frames\n")
    }
  }

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

  yearly_mpd_afl=cbind(tabel5_6, ympdx_subset)
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

# ===== PD ENGINE FINAL FUNCTION =====
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

# =============================================================================
# PD_ENGINE1 FUNCTION (From original working version)
# =============================================================================

#' PD Engine 1 - Original working PD calculation function
#' @description Replicated from _analytics/_v30/global.R for compatibility
#' @param forecast_odr_boxplot Forecast ODR boxplot data (numeric vector)
#' @param actual_odr Actual ODR data (numeric vector)
#' @param issuer Issuer amounts (numeric vector)
#' @param ympd Year-month PD matrix
#' @return List with PD calculation results

PD_engine1 <- function(forecast_odr_boxplot, actual_odr, issuer, ympd) {

  name_FL_P_ODR <- c("PIT PD +1","PIT PD +2","CPD+1","Marginal PD +1","Marginal PD +2")
  value_FL_P_ODR <- c(mean(forecast_odr_boxplot[1:12]), mean(forecast_odr_boxplot[13:24]),
                     mean(forecast_odr_boxplot[1:12]), mean(forecast_odr_boxplot[1:12]),
                     mean(forecast_odr_boxplot[13:24]) * (1 - mean(forecast_odr_boxplot[1:12])))
  FL_P_ODR <- data.frame(value = value_FL_P_ODR)
  rownames(FL_P_ODR) <- name_FL_P_ODR

  name_TTC_ODR <- c("TTC PD +1","TTC PD +2","CPD +1","Marginal PD +1","Marginal PD +2")
  value_TTC_ODR <- c(mean(actual_odr), mean(actual_odr), mean(actual_odr),
                    mean(actual_odr), mean(actual_odr) * (1 - mean(actual_odr)))
  TTC_ODR <- data.frame(value = value_TTC_ODR)
  rownames(TTC_ODR) <- name_TTC_ODR

  cutoma <- function(data) {
    cutoma.pd <- c()
    for (i in 1:ncol(data)) {
      if (i == 1) {
        cutoma.pd <- cbind(cutoma.pd, data[,1])
      } else {
        cutoma.pd <- cbind(cutoma.pd, data[,i] - data[,i-1])
      }
    }
    return(cutoma.pd <- as.data.frame(cutoma.pd))
  }

  matocu <- function(data) {
    matocu.pd <- c()
    for (i in 1:ncol(data)) {
      if (i == 1) {
        matocu.pd <- cbind(matocu.pd, data[,1])
      } else {
        matocu.pd <- cbind(matocu.pd, rowSums(data[,1:i]))
      }
    }
    return(matocu.pd <- as.data.frame(matocu.pd))
  }

  ympdx <- cutoma(ympd)
  ympdx[5, 2:ncol(ympdx)] <- 0

  ym_pd <- data.frame(Bucket = 1:nrow(ympdx), TTC.MPD.1 = ympdx[,1], TTC.MPD.2 = ympdx[,2])
  Tot_ym_pd <- c(crossprod(issuer[1:4], ym_pd$TTC.MPD.1[1:4]) / sum(issuer[1:4]),
               crossprod(issuer[1:4], ym_pd$TTC.MPD.2[1:4]) / sum(issuer[1:4]))

  mpd_scalling <- c((FL_P_ODR$value[4] / TTC_ODR$value[4]) * Tot_ym_pd[1],
                  (FL_P_ODR$value[5] / TTC_ODR$value[5]) * Tot_ym_pd[2])
  MARGINAL.PD.1.S <- mpd_scalling[1]
  MARGINAL.PD.2.S <- mpd_scalling[2]

  Logit.TTC.1 <- ifelse(ym_pd$TTC.MPD.1[1:4] == 0, 0, log(ym_pd$TTC.MPD.1[1:4] / (1 - ym_pd$TTC.MPD.1[1:4])))
  Logit.TTC.2 <- ifelse(ym_pd$TTC.MPD.2[1:4] == 0, 0, log(ym_pd$TTC.MPD.2[1:4] / (1 - ym_pd$TTC.MPD.2[1:4])))
  TLogit.TTC.1 <- ifelse(Tot_ym_pd[1] == 0, 0, log(Tot_ym_pd[1] / (1 - Tot_ym_pd[1])))
  TLogit.TTC.2 <- ifelse(Tot_ym_pd[2] == 0, 0, log(Tot_ym_pd[2] / (1 - Tot_ym_pd[2])))

  # === SCALING 1 ===
  f1 <- function(x) MARGINAL.PD.1.S - (crossprod(1/(1+exp(-(Logit.TTC.1 + x))), issuer[1:4]) / sum(issuer[1:4]))

  PD_min_1 <- crossprod(1/(1+exp(-(Logit.TTC.1 - 50))), issuer[1:4]) / sum(issuer[1:4])
  PD_max_1 <- crossprod(1/(1+exp(-(Logit.TTC.1 + 50))), issuer[1:4]) / sum(issuer[1:4])

  if (MARGINAL.PD.1.S <= PD_min_1) {
    scaling1 <- -50
  } else if (MARGINAL.PD.1.S >= PD_max_1) {
    scaling1 <- 50
  } else {
    scaling1 <- uniroot(f1, lower = -50, upper = 50)$root
  }

  # === SCALING 2 ===
  f2 <- function(x) MARGINAL.PD.2.S - (crossprod(1/(1+exp(-(Logit.TTC.2 + x))), issuer[1:4]) / sum(issuer[1:4]))

  PD_min_2 <- crossprod(1/(1+exp(-(Logit.TTC.2 - 50))), issuer[1:4]) / sum(issuer[1:4])
  PD_max_2 <- crossprod(1/(1+exp(-(Logit.TTC.2 + 50))), issuer[1:4]) / sum(issuer[1:4])

  if (MARGINAL.PD.2.S <= PD_min_2) {
    scaling2 <- -50
  } else if (MARGINAL.PD.2.S >= PD_max_2) {
    scaling2 <- 50
  } else {
    scaling2 <- uniroot(f2, lower = -50, upper = 50)$root
  }

  tabel3 <- data.frame(value = mpd_scalling)
  rownames(tabel3) <- c("Marginal PD +1", "Marginal PD +2")

  tabel4 <- data.frame(Bucket = c(1,2,3,4,5,"Total"),
                      Z = c(issuer, sum(issuer)),
                      A = c(ym_pd$TTC.MPD.1, Tot_ym_pd[1]),
                      B = c(ym_pd$TTC.MPD.2, Tot_ym_pd[2]),
                      C = c(1/(1+exp(-(Logit.TTC.1+scaling1))), 1, crossprod(1/(1+exp(-(Logit.TTC.1+scaling1))), issuer[1:4])/sum(issuer[1:4])),
                      D = c(1/(1+exp(-(Logit.TTC.2+scaling2))), 0, crossprod(1/(1+exp(-(Logit.TTC.2+scaling2))), issuer[1:4])/sum(issuer[1:4])),
                      E = c(Logit.TTC.1, NA, TLogit.TTC.1),
                      F = c(Logit.TTC.2, NA, TLogit.TTC.2),
                      G = c(Logit.TTC.1+scaling1, NA, TLogit.TTC.1+scaling1),
                      H = c(Logit.TTC.2+scaling2, NA, TLogit.TTC.2+scaling2)
  )

  colnames(tabel4) <- c("Bucket","issuer","TTC MPD+1",
                       "TTC MPD+2", "PIT MPD+1", "PIT MPD+2",
                       "Logit TTC+1", "Logit TTC+2",
                       "Logit PIT+1", "Logit PIT+2")

  tabel5 <- data.frame(value = c(scaling1, scaling2))
  rownames(tabel5) <- c("Scaling +1","Scaling +2")

  tabel5_6 <- data.frame(Y1 = tabel4$`PIT MPD+1`[1:5], Y2 = tabel4$`PIT MPD+2`[1:5])

  intp_pd <- function(data) {
    hasil_intp <- c()
    for (i in 1:ncol(data)) {
      for (j in 1:12) {
        if (j == 1) {
          hasil_intp <- cbind(hasil_intp, 1-((1-data[,i])^(j/12)))
        } else {
          hasil_intp <- cbind(hasil_intp, 1-((1-data[,i])^(j/12)) - (1-(1-data[,i])^((j-1)/12)))
        }
      }
    }
    return(hasil_intp <- as.data.frame(hasil_intp))
  }

  ## === YEARLY ===
  yearly_cpd_bfl <- ympd
  colnames(yearly_cpd_bfl) <- paste0("Y", 1:ncol(yearly_cpd_bfl))

  yearly_mpd_bfl <- ympdx
  colnames(yearly_mpd_bfl) <- paste0("Y", 1:ncol(yearly_mpd_bfl))

  yearly_mpd_afl <- tabel5_6
  colnames(yearly_mpd_afl) <- paste0("Y", 1:ncol(yearly_mpd_afl))

  yearly_cpd_afl <- matocu(yearly_mpd_afl)
  colnames(yearly_cpd_afl) <- paste0("Y", 1:ncol(yearly_cpd_afl))

  ## === MONTHLY ===
  monthly_mpd_bfl <- intp_pd(yearly_mpd_bfl)
  colnames(monthly_mpd_bfl) <- paste0("M", 1:ncol(monthly_mpd_bfl))

  monthly_mpd_afl <- intp_pd(yearly_mpd_afl)
  colnames(monthly_mpd_afl) <- paste0("M", 1:ncol(monthly_mpd_afl))

  ## tambahan: monthly_cpd
  monthly_cpd_bfl <- matocu(monthly_mpd_bfl)
  colnames(monthly_cpd_bfl) <- paste0("M", 1:ncol(monthly_cpd_bfl))

  monthly_cpd_afl <- matocu(monthly_mpd_afl)
  colnames(monthly_cpd_afl) <- paste0("M", 1:ncol(monthly_cpd_afl))

  Hasil.PD <- list(FL.P.ODR = FL_P_ODR,
                  TTC.ODR = TTC_ODR,
                  MPD.Scalling = tabel3,
                  Scalling = tabel4,
                  Optimization = tabel5,
                  yearly_cpd_bfl = yearly_cpd_bfl,
                  yearly_mpd_bfl = yearly_mpd_bfl,
                  yearly_mpd_afl = cap_upper(yearly_mpd_afl, 1),
                  yearly_cpd_afl = cap_upper(yearly_cpd_afl, 1),
                  monthly_mpd_bfl = cap_upper(monthly_mpd_bfl, 1),
                  monthly_mpd_afl = cap_upper(monthly_mpd_afl, 1),
                  monthly_cpd_bfl = cap_upper(monthly_cpd_bfl, 1),
                  monthly_cpd_afl = cap_upper(monthly_cpd_afl, 1))

  Hasil.PD
}

# =============================================================================
# END OF PD CALCULATIONS UTILITY FUNCTIONS
# =============================================================================