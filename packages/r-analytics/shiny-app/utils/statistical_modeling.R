# Statistical Modeling Utilities
# File: utils/statistical_modeling.R
# Extracted from global.R - preserving original function names and signatures

####Data Transform Function####
transform_data <- function(data) {
  vars <- names(data)

  # Safe percentage conversion
  data <- data %>%
    mutate(across(where(~ any(grepl("%", .))),
                  ~ {
                    val <- as.numeric(gsub("%", "", .))
                    ifelse(is.na(val), 0, val / 100)
                  }))

  lag_mapping <- c(3, 6, 9, 12)
  lag_labels <- c(1, 2, 3, 4)

  for (var in vars) {
    # Skip if variable doesn't exist in data
    if (!var %in% names(data)) next

    data <- data %>%
      mutate(
        # Y Transformation with safety checks
        !!paste0(var, "_Y") := {
          var_data <- as.numeric(.data[[var]])
          lag_data <- lag(var_data, 12)
          # Handle division by zero and NA values
          ifelse(is.na(lag_data) | lag_data == 0, 0, (var_data / lag_data) - 1)
        }
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
        # Differencing 12 Bulan with safety checks
        !!paste0(var, "_Diff12") := {
          var_data <- as.numeric(.data[[var]])
          lag_data <- lag(var_data, 12)
          ifelse(is.na(lag_data), 0, var_data - lag_data)
        }
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
        # Log Transform with safety checks
        !!paste0(var, "_Ln") := {
          var_data <- .data[[var]]
          # Ensure numeric data
          var_data_num <- as.numeric(var_data)
          # Handle non-numeric and zero/negative values
          log(ifelse(is.na(var_data_num) | var_data_num <= 0, 1, var_data_num))
        }
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
          !!paste0(var, "_Lg", lag_label) := lag(.data[[var]], lag_val)
        )
    }
  }

  return(data)
}

####Filter Model by Core Variables####
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

####Generate 1 Variable Regression Formulas####
gen1varx <- function(data, target_var, independent_vars) {
  # CRITICAL: Enhanced data validation
  if (is.null(data) || nrow(data) == 0) {
    stop("❌ Input data is NULL or empty")
  }

  if (!target_var %in% names(data)) {
    stop("❌ Target variable '", target_var, "' not found in data")
  }

  if (length(independent_vars) == 0) {
    stop("❌ No independent variables provided")
  }

  # Check which independent variables actually exist
  available_vars <- independent_vars[independent_vars %in% names(data)]
  if (length(available_vars) == 0) {
    stop("❌ None of the independent variables exist in the data")
  }

  if (length(available_vars) < length(independent_vars)) {
    missing_vars <- setdiff(independent_vars, available_vars)
    warning("⚠️ Some independent variables not found: ", paste(missing_vars, collapse = ", "))
  }

  # Check for valid target variable data
  target_data <- data[[target_var]]
  if (all(is.na(target_data))) {
    stop("❌ Target variable '", target_var, "' contains only NA values")
  }

  # Buat formula untuk setiap variabel independen yang tersedia
  formulas <- lapply(available_vars, function(var) {
    formula_str <- paste(target_var, "~", var)
    tryCatch({
      as.formula(formula_str)
    }, error = function(e) {
      stop("❌ Cannot create formula: ", formula_str, " - Error: ", e$message)
    })
  })

  # Beri nama pada setiap formula berdasarkan variabel independen
  names(formulas) <- available_vars

  cat("✅ Generated", length(formulas), "1-variable regression formulas for target:", target_var, "\n")
  cat("  Available independent variables:", paste(available_vars, collapse = ", "), "\n")

  # Kembalikan list formula
  return(formulas)
}

####Run 1 Variable Regression Models####
runmodel1p <- function(data, formulas) {
  # CRITICAL: Add data validation
  if (is.null(data) || nrow(data) == 0) {
    warning("❌ runmodel1p: Input data is NULL or empty")
    return(data.frame(
      Variables = character(0),
      Estimate = numeric(0),
      tValue = numeric(0),
      Probt = numeric(0),
      R_Squared = numeric(0),
      AIC = numeric(0),
      BIC = numeric(0),
      SSE = numeric(0),
      stringsAsFactors = FALSE
    ))
  }

  # Inisialisasi list untuk menyimpan hasil
  results <- list()

  # Iterasi setiap formula
  for (i in seq_along(formulas)) {
    tryCatch({
      # Jalankan model dengan lm()
      model <- lm(formulas[[i]], data = data)

      # CRITICAL: Check if model has valid data
      if (length(model$coefficients) == 0) {
        warning("❌ runmodel1p: Model has no coefficients for formula: ", deparse(formulas[[i]]))
        next
      }

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

    }, error = function(e) {
      warning("❌ runmodel1p: Model fitting failed for formula: ", deparse(formulas[[i]]), " Error: ", e$message)
      # Continue with next formula instead of stopping
    })
  }

  # Gabungkan semua hasil menjadi satu dataframe
  if (length(results) == 0) {
    warning("❌ runmodel1p: No models were successfully fitted")
    return(data.frame(
      Variables = character(0),
      Estimate = numeric(0),
      tValue = numeric(0),
      Probt = numeric(0),
      R_Squared = numeric(0),
      AIC = numeric(0),
      BIC = numeric(0),
      SSE = numeric(0),
      stringsAsFactors = FALSE
    ))
  }

  final_result <- do.call(rbind, results)
  return(final_result)
}

####Select from 1 Variable Regression Results####
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

####Correlation Selection for 2 Variables####
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
    utils::combn(independent_vars, 2, simplify = FALSE)
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

####Correlation Selection for 3 Variables####
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
    utils::combn(independent_vars, 3, simplify = FALSE)
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

####Generate 2 Variable Model Formulas####
gre2 <- function(y,data) {
  data1 <- data[,paste(y,"~", Variable1, "+", Variable2)]
  return(data1)
}

####Generate 3 Variable Model Formulas####
gre3 <- function(y,data) {
  data1 <- data[,paste(y,"~", Variable1, "+", Variable2, "+", Variable3)]
  return(data1)
}

####Run 2 Variable Regression Models####
runreg2models2 <- function(data, target_var, regression_models, chunk_size = 1000) {
  actual <- data[[target_var]]  # Data aktual untuk perhitungan metrik

  process_model <- function(formula) {
    tryCatch({
      model <- lm(formula, data = data)
      summary_model <- summary(model)

      coef_model <- coef(model)
      coef_names <- rownames(summary_model$coefficients)
      p_values <- coef(summary_model)[, 4]  # p-values termasuk Intercept
      r_squared <- summary_model$r.squared
      r_squared_adjusted <- summary_model$adj.r.squared
      predicted <- predict(model, data)

      # Pastikan fungsi calc_rmse tersedia atau gunakan sqrt(mean((actual - predicted)^2))
      rmse <- sqrt(mean((actual - predicted)^2, na.rm = TRUE))

      # Extract coefficients safely - handle cases where coefficients might not exist
      Intercept <- ifelse(length(coef_model) >= 1, coef_model[1], NA)
      Coef_V1 <- ifelse(length(coef_model) >= 2, coef_model[2], NA)
      Coef_V2 <- ifelse(length(coef_model) >= 3, coef_model[3], NA)

      # Extract p-values safely
      Pr_intercept <- ifelse(length(p_values) >= 1, p_values[1], NA)
      Pr_Variable1 <- ifelse(length(p_values) >= 2, p_values[2], NA)
      Pr_Variable2 <- ifelse(length(p_values) >= 3, p_values[3], NA)

      # Extract variable names safely
      var1 <- ifelse(length(coef_names) > 1, coef_names[2], NA)
      var2 <- ifelse(length(coef_names) > 2, coef_names[3], NA)

      return(data.frame(
        Model = deparse(formula),
        var1 = var1,
        var2 = var2,
        Intercept = Intercept,
        Coef_V1 = Coef_V1,
        Coef_V2 = Coef_V2,
        Pr_intercept = Pr_intercept,
        Pr_Variable1 = Pr_Variable1,
        Pr_Variable2 = Pr_Variable2,
        R_squared = round(r_squared, 6),
        R_squared_adjusted = round(r_squared_adjusted, 6),
        stringsAsFactors = FALSE
      ))
    }, error = function(e) {
      # Return empty dataframe for failed models
      return(data.frame(
        Model = deparse(formula),
        var1 = NA,
        var2 = NA,
        Intercept = NA,
        Coef_V1 = NA,
        Coef_V2 = NA,
        Pr_intercept = NA,
        Pr_Variable1 = NA,
        Pr_Variable2 = NA,
        R_squared = NA,
        R_squared_adjusted = NA,
        stringsAsFactors = FALSE
      ))
    })
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
  rownames(results) <- paste0("M", 1:nrow(results))
  return(results)
}

####Run 3 Variable Regression Models####
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

####Statistical Assumption Testing####
ujiasumsi <- function(data, target_var, regression_models,normalmethod = "anderson",homogenmethod="breusch", chunk_size = 1000) {

  # Add input validation
  if (is.null(data) || nrow(data) == 0) {
    cat("❌ ujiasumsi() ERROR: Invalid or empty data input\n")
    return(data.frame(
      Model = character(0),
      MAPE = numeric(0),
      RMSE = numeric(0),
      normal_P = numeric(0),
      homogen_P = numeric(0),
      DW_P = numeric(0),
      VIF1 = numeric(0),
      VIF2 = numeric(0),
      VIF3 = numeric(0),
      stringsAsFactors = FALSE
    ))
  }

  if (!target_var %in% names(data)) {
    cat("❌ ujiasumsi() ERROR: Target variable", target_var, "not found in data\n")
    return(data.frame(
      Model = character(0),
      MAPE = numeric(0),
      RMSE = numeric(0),
      normal_P = numeric(0),
      homogen_P = numeric(0),
      DW_P = numeric(0),
      VIF1 = numeric(0),
      VIF2 = numeric(0),
      VIF3 = numeric(0),
      stringsAsFactors = FALSE
    ))
  }

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
    tryCatch({
      model <- lm(formula, data = data)
      predicted <- predict(model, data)

      # Hitung metrik evaluasi
      mape <- calc_mape(actual, predicted)
      rmse <- calc_rmse(actual, predicted)

      # Uji asumsi dengan error handling
      normal_testP <- tryCatch({
        uji_normalitas(residuals(model))$p.value
      }, error = function(e) {
        cat("❌ Normality test error:", e$message, "\n")
        return(NA)
      })

      homogen_testP <- tryCatch({
        uji_homogenitas(model)$p.value
      }, error = function(e) {
        cat("❌ Homogeneity test error:", e$message, "\n")
        return(NA)
      })

      dw_p <- tryCatch({
        dwtest(model)$p.value
      }, error = function(e) {
        cat("❌ Durbin-Watson test error:", e$message, "\n")
        return(NA)
      })

      nilai_vif <- tryCatch({
        vif(model)
      }, error = function(e) {
        cat("❌ VIF calculation error:", e$message, "\n")
        return(numeric(0))
      })

      # Pastikan panjang nilai VIF sesuai jumlah prediktor
      vif_values <- rep(NA, 3)  # Default: NA jika prediktor <3
      if (length(nilai_vif) > 0) {
        vif_values[1:length(nilai_vif)] <- nilai_vif
      }

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

    }, error = function(e) {
      cat("❌ Model processing error for formula:", deparse(formula), "-", e$message, "\n")
      # Return empty row with NA values on error
      return(data.frame(
        Model = paste(deparse(formula), collapse = " "),
        MAPE = NA,
        RMSE = NA,
        normal_P = NA,
        homogen_P = NA,
        DW_P = NA,
        VIF1 = NA,
        VIF2 = NA,
        VIF3 = NA
      ))
    })
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


#' Combine 2-variable and 3-variable regression models
#' @param model_reg2var Results from 2-variable regression modeling
#' @param model_reg3var Results from 3-variable regression modeling
#' @return Combined model results
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

#' Run Regression Models for 3 Variables - Original Function from app15.R
#' @description Execute multiple regression models for Final Model functionality
#' @param data Data frame containing variables
#' @param target_var Target variable name
#' @param regression_models List of regression model formulas
#' @param chunk_size Chunk size for processing (default: 1000)
#' @param parallel Whether to use parallel processing (default: FALSE)
#' @param probt Probability threshold for significance (default: 0.05)
#' @return Data frame with model results
runreg3models3 <- function(data, target_var, regression_models, chunk_size = 1000, parallel = FALSE, probt = 0.05) {

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

  # Filter NULL results (important error handling like in runreg3models2)
  results_list <- results_list[!sapply(results_list, is.null)]
  if (length(results_list) == 0) return(data.frame())

  # Gabungkan hasil menjadi satu dataframe
  results <- do.call(rbind, results_list)
  rownames(results) <- paste0("M", 1:nrow(results))
  return(results)
}

#' Backtesting Function for Final Model - Original Function from app15.R
#' @description Perform backtesting calculations for model validation
#' @param datatrain Training data
#' @param datatest Testing data
#' @param datagabung Combined data
#' @param target_var Target variable name
#' @param regression_models List of regression model formulas
#' @return Data frame with backtesting results
backtesting2 <- function(datatrain, datatest, datagabung, target_var, regression_models) {
  cat("\n🔍 DEBUG [BACKTESTING2]: Starting backtesting2 function...\n")

  # Debug: Check input parameters
  cat("🔍 DEBUG [BACKTESTING2]: Checking input parameters...\n")
  cat("  - datatrain dims:", if(is.null(datatrain)) "NULL" else paste(dim(datatrain), collapse="x"), "\n")
  cat("  - datatest dims:", if(is.null(datatest)) "NULL" else paste(dim(datatest), collapse="x"), "\n")
  cat("  - datagabung dims:", if(is.null(datagabung)) "NULL" else paste(dim(datagabung), collapse="x"), "\n")
  cat("  - target_var:", target_var, "\n")
  cat("  - regression_models count:", length(regression_models), "\n")
  cat("  - regression_models:", paste(regression_models, collapse=" | "), "\n")

  fulldata <- datagabung
  cat("  - fulldata assigned, dims:", paste(dim(fulldata), collapse="x"), "\n")

  # Debug: Clean regression models
  cat("🔍 DEBUG [BACKTESTING2]: Cleaning regression model formulas...\n")
  regression_models <- gsub('\"', '', regression_models)  # FIXED: Match original exactly (single quotes around double quote)
  cat("  - After gsub cleaning:", paste(regression_models, collapse=" | "), "\n")

  tryCatch({
    regression_models <- lapply(regression_models, as.formula)
    cat("✅ DEBUG [BACKTESTING2]: Formula conversion successful\n")
  }, error = function(e) {
    cat("❌ DEBUG [BACKTESTING2]: ERROR in formula conversion:", e$message, "\n")
    stop(e)
  })

  # Debug: Prepare data variables
  cat("🔍 DEBUG [BACKTESTING2]: Preparing data variables...\n")
  data <- datatrain  # REVERTED: Back to original variable name to match working version
  cat("  - data variable assigned (matching original), dims:", paste(dim(data), collapse="x"), "\n")

  # Debug: Check target variable exists
  cat("🔍 DEBUG [BACKTESTING2]: Checking target variable availability...\n")
  if(target_var %in% names(data)) {
    cat("✅ DEBUG [BACKTESTING2]: target_var found in training data\n")
  } else {
    cat("❌ DEBUG [BACKTESTING2]: target_var NOT found in training data\n")
    cat("  - Available columns:", paste(names(data), collapse=", "), "\n")
  }

  # Data aktual untuk perhitungan metrik
  actual_train <- data[[target_var]]
  actual_test <- datatest[[target_var]]
  actual_fulldata <- fulldata[[target_var]]

  cat("  - actual_train length:", length(actual_train), "\n")
  cat("  - actual_test length:", length(actual_test), "\n")
  cat("  - actual_fulldata length:", length(actual_fulldata), "\n")

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
  cat("🔍 DEBUG [BACKTESTING2]: Starting model loop...\n")

  # Loop melalui setiap model dalam regression_models
  for (i in seq_along(regression_models)) {
    cat("\n🔍 DEBUG [BACKTESTING2]: Processing model", i, "of", length(regression_models), "\n")

    formula <- regression_models[[i]]
    cat("  - Formula:", deparse(formula), "\n")

    # Buat model regresi
    cat("🔍 DEBUG [BACKTESTING2]: Creating linear model...\n")
    tryCatch({
      model <- lm(formula, data = data)
      cat("✅ DEBUG [BACKTESTING2]: Linear model created successfully\n")
    }, error = function(e) {
      cat("❌ DEBUG [BACKTESTING2]: ERROR creating linear model:", e$message, "\n")
      cat("  - Formula:", deparse(formula), "\n")
      cat("  - Data columns:", paste(names(data), collapse=", "), "\n")
      stop(e)
    })

    # Prediksi untuk in-sample (training) dan out-sample (testing)
    cat("🔍 DEBUG [BACKTESTING2]: Making predictions...\n")
    tryCatch({
      predicted_train <- predict(model, data)
      predicted_test <- predict(model, datatest)
      predicted_fulldata <- predict(model, fulldata)
      cat("✅ DEBUG [BACKTESTING2]: Predictions completed\n")
      cat("  - predicted_train length:", length(predicted_train), "\n")
      cat("  - predicted_test length:", length(predicted_test), "\n")
      cat("  - predicted_fulldata length:", length(predicted_fulldata), "\n")
    }, error = function(e) {
      cat("❌ DEBUG [BACKTESTING2]: ERROR making predictions:", e$message, "\n")
      stop(e)
    })

    # Get model summary
    cat("🔍 DEBUG [BACKTESTING2]: Getting model summary...\n")
    summary_model <- summary(model)
    r_squared <- summary_model$r.squared
    r_squared_adjusted <- summary_model$adj.r.squared
    cat("  - R-squared:", r_squared, "\n")
    cat("  - Adjusted R-squared:", r_squared_adjusted, "\n")

    # Hitung metrik evaluasi
    cat("🔍 DEBUG [BACKTESTING2]: Calculating evaluation metrics...\n")
    tryCatch({
      mape_train <- calc_mape(actual_train, predicted_train)
      cat("  - MAPE train:", mape_train, "\n")
    }, error = function(e) {
      cat("❌ DEBUG [BACKTESTING2]: ERROR calculating MAPE train:", e$message, "\n")
      mape_train <- NA
    })
    rmse_train <- calc_rmse(actual_train, predicted_train)
    mape_test <- calc_mape(actual_test, predicted_test)
    rmse_test <- calc_rmse(actual_test, predicted_test)
    mape_gabung <- calc_mape(actual_fulldata, predicted_fulldata)

    cat("  - RMSE train:", rmse_train, "\n")
    cat("  - MAPE test:", mape_test, "\n")
    cat("  - RMSE test:", rmse_test, "\n")
    cat("  - MAPE combined:", mape_gabung, "\n")

    # Simpan hasil dalam data frame
    cat("🔍 DEBUG [BACKTESTING2]: Creating result data frame for model", i, "...\n")
    results_list[[i]] <- data.frame(
      Model = paste(deparse(formula), collapse = " "),
      MAPEinsample = round(mape_train, 6),
      RMSEinsample = round(rmse_train, 6),
      MAPEoutsample = round(mape_test, 6),
      MAPEgabung = round(mape_gabung, 6),
      RMSEoutsample = round(rmse_test, 6),
      R_squared = round(r_squared, 6),
      R_squared_adjusted = round(r_squared_adjusted, 6)
    )
    cat("✅ DEBUG [BACKTESTING2]: Model", i, "processing completed\n")
  }

  # Gabungkan hasil menjadi satu dataframe
  cat("\n🔍 DEBUG [BACKTESTING2]: Combining all results...\n")
  tryCatch({
    results <- do.call(rbind, results_list)
    cat("✅ DEBUG [BACKTESTING2]: Results combined successfully\n")
    cat("  - Final result dims:", paste(dim(results), collapse="x"), "\n")
    cat("  - Final columns:", paste(names(results), collapse=", "), "\n")
  }, error = function(e) {
    cat("❌ DEBUG [BACKTESTING2]: ERROR combining results:", e$message, "\n")
    stop(e)
  })

  cat("🎉 DEBUG [BACKTESTING2]: backtesting2 function completed successfully!\n\n")
  return(results)
}

#' Extract Core Variables from Final Model - Original Function from app15.R
#' @description Extract unique variable names from final model data
#' @param datafinalmodel Data frame containing final model results
#' @return Vector of unique variable names
gabungkolomb <- function(datafinalmodel) {
  jadibaris <- c(datafinalmodel[['var1']], datafinalmodel[['var2']], datafinalmodel[['var3']])
  jadibaris <- jadibaris[!is.na(jadibaris)]
  sources <- unique(sapply(strsplit(jadibaris, "_"), `[`, 1))
  # gabungkan sumber dengan isi asli, lalu ambil unique
  gabunglagi <- unique(c(sources, jadibaris))

  return(gabunglagi)
}

#' Boxplot Scenario Analysis Function (Original implementation from global.R)
#' @param x Data frame with numeric variables
#' @param intuisi Vector of intuition values (1 or -1) for each variable
#' @return List with boxplot analysis results including diff.base
Boxplot_Scenario <- function(x, intuisi) {

  library(dplyr)
  library(purrr)
  library(tidyr)

  klassification_macro1 <- function(x) {
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

  klassification_macro2 <- function(x) {
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
      df_klasifikasi <- cbind(df_klasifikasi, klassification_macro1(x[, i]))
    } else {
      df_klasifikasi <- cbind(df_klasifikasi, klassification_macro2(x[, i]))
    }
  }

  df_klasifikasi <- as.data.frame(df_klasifikasi)
  colnames(df_klasifikasi) <- cols_to_classify
  df.klasifikasi <- df_klasifikasi

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
    select(Category, all_of(urutan_var))

  # Hitung total per kolom
  total_row <- c(Category = "Total", as.list(colSums(pivot_table[, -1])))

  # Tambahkan baris Total
  pivot_table <- bind_rows(pivot_table, total_row)

  # Atur urutan kategori manual
  kategori_order <- c("BASE", "BEST", "WORST", "OUTLIER", "Total")
  pivot_table$Category <- factor(pivot_table$Category, levels = kategori_order)

  # Urutkan sesuai urutan kategori
  pivot_table <- pivot_table %>% arrange(Category)

  # Tampilkan hasil
  pivot_table <- as.data.frame(pivot_table)
  category.frecuency <- pivot_table

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
    select(Average, all_of(vars_numerik)) %>%
    arrange(factor(Average, levels = c("BASE", "BEST", "WORST")))

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
  # Hitung rasio (BEST - BASE) / BASE
  rasio_best <- (avg_table[2, -1] - avg_table[1, -1]) / avg_table[1, -1]

  # Hitung rasio (WORST - BASE) / BASE
  rasio_worst <- (avg_table[3, -1] - avg_table[1, -1]) / avg_table[1, -1]

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

#' Check intuition sign for correlation variables
#' @param Variabel_X Variable name (character)
#' @param Korelasixy Correlation with Y (numeric)
#' @param ref Reference data frame with expected signs (first col = variable, second col = expected sign)
#' @param bebas_pass List of free-pass variables (character vector)
#' @return "pass", "eliminate", or sign indicator
#' @details Implements original intuition checking logic (app15.R lines 1115-1151)
#' @note This function uses assign_expect() from data_processing.R:421
check_intuition_sign <- function(Variabel_X, Korelasixy, ref, bebas_pass = NULL) {
  # Extract variable prefix (line 1139 from app15.R)
  var_prefix <- sapply(strsplit(Variabel_X, "_"), `[`, 1)

  # Default free-pass variables if not provided
  # These variables bypass intuition checking (lines 1120-1125 from app15.R)
  if (is.null(bebas_pass)) {
    bebas_pass <- c("USDIDR", "IHSG", "INFLASI", "SBI", "GDP", "BIRATE")
  }

  # Load assign_expect function from data_processing.R
  # (Already exists at data_processing.R:421)
  if (!exists("assign_expect", mode = "function")) {
    source("utils/data_processing.R")
  }

  # Intuition sign checking (lines 1140-1143 from app15.R)
  # Logic:
  # 1. If variable prefix in free-pass list -> "pass"
  # 2. If actual correlation sign matches expected sign -> "pass"
  # 3. Otherwise -> "eliminate"
  # Calculate expected and actual signs first to handle NA values
  expected_signs <- sapply(Variabel_X, function(x) {
    assign_expect(x, ref)
  })
  actual_signs <- ifelse(Korelasixy < 0, -1, 1)

  sign <- dplyr::case_when(
    var_prefix %in% bebas_pass ~ "pass",
    !is.na(expected_signs) & actual_signs == expected_signs ~ "pass",
    TRUE ~ "eliminate"
  )

  return(sign)
}

#' Apply intuition checking to correlation results data frame
#' @param cor_results Data frame with columns: Variabel_X, Korelasixy
#' @param ref Reference data frame with expected signs
#' @param bebas_pass List of free-pass variables (optional)
#' @return Filtered data frame with only "pass" variables
#' @details Wrapper function to apply check_intuition_sign() to entire data frame
#' @note Integrates with gen2() and gen3() correlation functions
apply_intuition_check <- function(cor_results, ref, bebas_pass = NULL) {
  # Validate required columns exist
  if (!"Korelasixy" %in% names(cor_results) || !"Variabel_X" %in% names(cor_results)) {
    warning("Missing required columns: Korelasixy or Variabel_X")
    return(cor_results)
  }

  # Apply sign checking to each variable
  cor_results$sign_check <- mapply(
    check_intuition_sign,
    Variabel_X = cor_results$Variabel_X,
    Korelasixy = cor_results$Korelasixy,
    MoreArgs = list(ref = ref, bebas_pass = bebas_pass),
    SIMPLIFY = TRUE
  )

  # Filter out eliminated variables
  cor_results_filtered <- cor_results %>%
    dplyr::filter(sign_check != "eliminate")

  return(cor_results_filtered)
}

# =============================================================================
# P2: ENHANCED MODEL GENERATION WITH INTUITION CHECKING
# =============================================================================
# Original: app15.R lines 1200-1350
# Enhancement: Integrate intuition checking into model generation workflow

#' Enhanced 2-variable regression generation with intuition checking
#' @param y Dependent variable name
#' @param data Correlation results data frame with Variable1, Variable2 columns
#' @param ref Reference data for intuition checking (optional)
#' @param bebas_pass Free-pass variables (optional)
#' @return Character vector of model formulas (intuition-filtered if ref provided)
#' @details Enhances original gre2() by applying intuition checks before model generation
gre2_enhanced <- function(y, data, ref = NULL, bebas_pass = NULL) {

  cat("🔍 DEBUG [GRE2_ENHANCED]: Starting enhanced 2-variable model generation\n")
  cat("  - Input rows:", nrow(data), "\n")

  # Apply intuition checking first if references provided
  if (!is.null(ref) && !is.null(bebas_pass)) {
    cat("  - Applying intuition checks...\n")

    # Check Variable1
    if ("Variable1" %in% names(data) && "Korelasixy" %in% names(data)) {
      data$sign_check_var1 <- mapply(
        check_intuition_sign,
        Variabel_X = data$Variable1,
        Korelasixy = data$Korelasixy,
        MoreArgs = list(ref = ref, bebas_pass = bebas_pass),
        SIMPLIFY = TRUE
      )

      # Filter out eliminated variables
      original_rows <- nrow(data)
      data <- data[data$sign_check_var1 != "eliminate", ]
      eliminated_count <- original_rows - nrow(data)

      if (eliminated_count > 0) {
        cat("  - ✅ Intuition check: Eliminated", eliminated_count, "invalid Variable1 combinations\n")
      }
    }

    # Check Variable2 (correlation with Y already checked in gen2)
    # Variable2 correlation is already validated in correlation analysis

    cat("  - Rows after intuition filtering:", nrow(data), "\n")
  }

  # Call original gre2() function
  if (nrow(data) == 0) {
    cat("  - ⚠️ No valid combinations after filtering\n")
    return(character(0))
  }

  formulas <- gre2(y, data)

  cat("✅ DEBUG [GRE2_ENHANCED]: Generated", length(formulas), "model formulas\n")

  return(formulas)
}

#' Enhanced 3-variable regression generation with intuition checking
#' @param y Dependent variable name
#' @param data Correlation results data frame with Variable1, Variable2, Variable3 columns
#' @param ref Reference data for intuition checking (optional)
#' @param bebas_pass Free-pass variables (optional)
#' @return Character vector of model formulas (intuition-filtered if ref provided)
#' @details Enhances original gre3() by applying intuition checks before model generation
gre3_enhanced <- function(y, data, ref = NULL, bebas_pass = NULL) {

  cat("🔍 DEBUG [GRE3_ENHANCED]: Starting enhanced 3-variable model generation\n")
  cat("  - Input rows:", nrow(data), "\n")

  # Apply intuition checking first if references provided
  if (!is.null(ref) && !is.null(bebas_pass)) {
    cat("  - Applying intuition checks...\n")

    # Check Variable1
    if ("Variable1" %in% names(data) && "Korelasixy1" %in% names(data)) {
      data$sign_check_var1 <- mapply(
        check_intuition_sign,
        Variabel_X = data$Variable1,
        Korelasixy = data$Korelasixy1,
        MoreArgs = list(ref = ref, bebas_pass = bebas_pass),
        SIMPLIFY = TRUE
      )

      original_rows <- nrow(data)
      data <- data[data$sign_check_var1 != "eliminate", ]
      eliminated_var1 <- original_rows - nrow(data)

      if (eliminated_var1 > 0) {
        cat("  - ✅ Eliminated", eliminated_var1, "invalid Variable1 combinations\n")
      }
    }

    # Check Variable2
    if ("Variable2" %in% names(data) && "Korelasixy2" %in% names(data)) {
      data$sign_check_var2 <- mapply(
        check_intuition_sign,
        Variabel_X = data$Variable2,
        Korelasixy = data$Korelasixy2,
        MoreArgs = list(ref = ref, bebas_pass = bebas_pass),
        SIMPLIFY = TRUE
      )

      original_rows <- nrow(data)
      data <- data[data$sign_check_var2 != "eliminate", ]
      eliminated_var2 <- original_rows - nrow(data)

      if (eliminated_var2 > 0) {
        cat("  - ✅ Eliminated", eliminated_var2, "invalid Variable2 combinations\n")
      }
    }

    # Check Variable3
    if ("Variable3" %in% names(data) && "Korelasixy3" %in% names(data)) {
      data$sign_check_var3 <- mapply(
        check_intuition_sign,
        Variabel_X = data$Variable3,
        Korelasixy = data$Korelasixy3,
        MoreArgs = list(ref = ref, bebas_pass = bebas_pass),
        SIMPLIFY = TRUE
      )

      original_rows <- nrow(data)
      data <- data[data$sign_check_var3 != "eliminate", ]
      eliminated_var3 <- original_rows - nrow(data)

      if (eliminated_var3 > 0) {
        cat("  - ✅ Eliminated", eliminated_var3, "invalid Variable3 combinations\n")
      }
    }

    cat("  - Rows after intuition filtering:", nrow(data), "\n")
  }

  # Call original gre3() function
  if (nrow(data) == 0) {
    cat("  - ⚠️ No valid combinations after filtering\n")
    return(character(0))
  }

  formulas <- gre3(y, data)

  cat("✅ DEBUG [GRE3_ENHANCED]: Generated", length(formulas), "model formulas\n")

  return(formulas)
}

# =============================================================================
# P2: INTEGRATED ASSUMPTION TESTING SUITE
# =============================================================================
# Comprehensive testing framework for regression model validation

#' Run all assumption tests on regression model
#' @param model lm model object
#' @param data Data frame used for modeling (optional, for additional checks)
#' @return List with all test results and pass/fail status
#' @details Performs Shapiro-Wilk, Breusch-Pagan, Durbin-Watson, and VIF tests
run_all_assumptions <- function(model, data = NULL) {

  cat("\n", paste(rep("=", 60), collapse=""), "\n")
  cat("🔍 RUNNING COMPREHENSIVE ASSUMPTION TESTS\n")
  cat(paste(rep("=", 60), collapse=""), "\n\n")

  results <- list()
  all_passed <- TRUE

  # 1. Normality Test (Shapiro-Wilk)
  cat("1. Testing normality of residuals (Shapiro-Wilk)...\n")
  tryCatch({
    residuals_vec <- residuals(model)

    # Shapiro test has sample size limits
    if (length(residuals_vec) > 5000) {
      cat("   ⚠️ Sample size > 5000, using sample of 5000 for Shapiro test\n")
      residuals_vec <- sample(residuals_vec, 5000)
    }

    normality <- shapiro.test(residuals_vec)
    results$normality <- list(
      test = "Shapiro-Wilk",
      statistic = normality$statistic,
      p_value = normality$p.value,
      passed = normality$p.value > 0.05,
      interpretation = if(normality$p.value > 0.05) "Residuals are normally distributed" else "Residuals are NOT normally distributed"
    )

    if (!results$normality$passed) all_passed <- FALSE

    cat("   ", if(results$normality$passed) "✅" else "❌",
        "p-value:", round(normality$p.value, 4), "\n")

  }, error = function(e) {
    results$normality <<- list(
      test = "Shapiro-Wilk",
      error = e$message,
      passed = FALSE,
      interpretation = "Test failed"
    )
    all_passed <<- FALSE
    cat("   ❌ Error:", e$message, "\n")
  })

  # 2. Homoscedasticity Test (Breusch-Pagan)
  cat("2. Testing homoscedasticity (Breusch-Pagan)...\n")
  tryCatch({
    if (!requireNamespace("lmtest", quietly = TRUE)) {
      stop("lmtest package required for Breusch-Pagan test")
    }

    homogeneity <- lmtest::bptest(model)
    results$homoscedasticity <- list(
      test = "Breusch-Pagan",
      statistic = homogeneity$statistic,
      p_value = homogeneity$p.value,
      passed = homogeneity$p.value > 0.05,
      interpretation = if(homogeneity$p.value > 0.05) "Homoscedasticity satisfied" else "Heteroscedasticity detected"
    )

    if (!results$homoscedasticity$passed) all_passed <- FALSE

    cat("   ", if(results$homoscedasticity$passed) "✅" else "❌",
        "p-value:", round(homogeneity$p.value, 4), "\n")

  }, error = function(e) {
    results$homoscedasticity <<- list(
      test = "Breusch-Pagan",
      error = e$message,
      passed = FALSE,
      interpretation = "Test failed"
    )
    all_passed <<- FALSE
    cat("   ❌ Error:", e$message, "\n")
  })

  # 3. Autocorrelation Test (Durbin-Watson)
  cat("3. Testing autocorrelation (Durbin-Watson)...\n")
  tryCatch({
    if (!requireNamespace("lmtest", quietly = TRUE)) {
      stop("lmtest package required for Durbin-Watson test")
    }

    autocorr <- lmtest::dwtest(model)
    results$autocorrelation <- list(
      test = "Durbin-Watson",
      statistic = autocorr$statistic,
      p_value = autocorr$p.value,
      passed = autocorr$p.value > 0.05,
      interpretation = if(autocorr$p.value > 0.05) "No autocorrelation" else "Autocorrelation detected"
    )

    if (!results$autocorrelation$passed) all_passed <- FALSE

    cat("   ", if(results$autocorrelation$passed) "✅" else "❌",
        "p-value:", round(autocorr$p.value, 4),
        "DW statistic:", round(autocorr$statistic, 4), "\n")

  }, error = function(e) {
    results$autocorrelation <<- list(
      test = "Durbin-Watson",
      error = e$message,
      passed = FALSE,
      interpretation = "Test failed"
    )
    all_passed <<- FALSE
    cat("   ❌ Error:", e$message, "\n")
  })

  # 4. Multicollinearity Test (VIF) - only if multiple predictors
  cat("4. Testing multicollinearity (VIF)...\n")
  tryCatch({
    n_predictors <- length(coefficients(model)) - 1  # Exclude intercept

    if (n_predictors > 1) {
      if (!requireNamespace("car", quietly = TRUE)) {
        stop("car package required for VIF calculation")
      }

      vif_values <- car::vif(model)
      max_vif <- max(vif_values)

      results$multicollinearity <- list(
        test = "VIF",
        vif_values = vif_values,
        max_vif = max_vif,
        passed = max_vif < 10,
        interpretation = if(max_vif < 10) "No multicollinearity (VIF < 10)" else "Multicollinearity detected (VIF >= 10)"
      )

      if (!results$multicollinearity$passed) all_passed <- FALSE

      cat("   ", if(results$multicollinearity$passed) "✅" else "❌",
          "Max VIF:", round(max_vif, 2), "\n")

      # Print individual VIF values
      for (var_name in names(vif_values)) {
        cat("     -", var_name, ":", round(vif_values[var_name], 2), "\n")
      }

    } else {
      results$multicollinearity <- list(
        test = "VIF",
        note = "Not applicable (single predictor)",
        passed = TRUE,
        interpretation = "VIF test not needed for single predictor"
      )
      cat("   ✅ Not applicable (single predictor)\n")
    }

  }, error = function(e) {
    results$multicollinearity <<- list(
      test = "VIF",
      error = e$message,
      passed = FALSE,
      interpretation = "Test failed"
    )
    all_passed <<- FALSE
    cat("   ❌ Error:", e$message, "\n")
  })

  # Overall assessment
  tests_count <- length(results)
  tests_passed <- sum(sapply(results, function(x) isTRUE(x$passed)))

  results$overall <- list(
    all_passed = all_passed,
    total_tests = tests_count,
    tests_passed = tests_passed,
    pass_rate = round(tests_passed / tests_count * 100, 1)
  )

  # Print summary
  cat("\n", paste(rep("=", 60), collapse=""), "\n")
  cat("📊 ASSUMPTION TESTING SUMMARY\n")
  cat(paste(rep("=", 60), collapse=""), "\n")
  cat(sprintf("Tests Passed: %d / %d (%.1f%%)\n",
              tests_passed, tests_count, results$overall$pass_rate))

  if (all_passed) {
    cat("✅ ALL ASSUMPTIONS SATISFIED - Model is valid!\n")
  } else {
    cat("⚠️ SOME ASSUMPTIONS VIOLATED - Review model carefully!\n")
  }
  cat(paste(rep("=", 60), collapse=""), "\n\n")

  return(results)
}

#' Print detailed assumption test results
#' @param results Output from run_all_assumptions()
#' @details Prints formatted summary of all assumption tests
print_assumption_summary <- function(results) {
  cat("\n", paste(rep("=", 70), collapse=""), "\n")
  cat("📋 DETAILED ASSUMPTION TEST RESULTS\n")
  cat(paste(rep("=", 70), collapse=""), "\n\n")

  for (test_name in names(results)) {
    if (test_name == "overall") next

    test <- results[[test_name]]
    status <- if (isTRUE(test$passed)) "✅ PASS" else "❌ FAIL"

    cat(sprintf("%-25s: %s\n", test$test, status))

    if (!is.null(test$p_value)) {
      cat(sprintf("  ├─ p-value: %.4f %s\n",
                  test$p_value,
                  if(test$p_value > 0.05) "(> 0.05 ✓)" else "(≤ 0.05 ✗)"))
    }

    if (!is.null(test$statistic)) {
      cat(sprintf("  ├─ Statistic: %.4f\n", test$statistic))
    }

    if (!is.null(test$max_vif)) {
      cat(sprintf("  ├─ Max VIF: %.2f %s\n",
                  test$max_vif,
                  if(test$max_vif < 10) "(< 10 ✓)" else "(≥ 10 ✗)"))
    }

    if (!is.null(test$interpretation)) {
      cat(sprintf("  └─ %s\n", test$interpretation))
    }

    if (!is.null(test$error)) {
      cat(sprintf("  └─ Error: %s\n", test$error))
    }

    cat("\n")
  }

  # Overall summary
  overall <- results$overall
  cat(paste(rep("-", 70), collapse=""), "\n")
  cat(sprintf("Overall Result: %d / %d tests passed (%.1f%%)\n",
              overall$tests_passed, overall$total_tests, overall$pass_rate))

  if (overall$all_passed) {
    cat("✅ ALL ASSUMPTIONS SATISFIED!\n")
    cat("   → Model meets all statistical requirements\n")
    cat("   → Safe to proceed with predictions\n")
  } else {
    cat("⚠️ SOME ASSUMPTIONS VIOLATED!\n")
    cat("   → Review violated assumptions carefully\n")
    cat("   → Consider model transformations or alternative approaches\n")
    cat("   → Use predictions with caution\n")
  }
  cat(paste(rep("=", 70), collapse=""), "\n\n")
}

# =============================================================================
# END OF STATISTICAL MODELING UTILITY FUNCTIONS
# =============================================================================