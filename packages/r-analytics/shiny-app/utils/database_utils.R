# =============================================================================
# DATABASE UTILITY FUNCTIONS
# =============================================================================
# Extracted from: _analytics/_v15/reference/global.R
# Purpose: Database connection, file upload utilities, and statistical helpers
# Author: Original IFRS9 Analytics Team
# Date: Extracted for modular architecture
# =============================================================================

#' Save file upload to database with binary storage
#' @param file_input Shiny file input object
#' @param file_data Data frame containing the file data
#' @param con Database connection object
#' @param user_id User ID (optional)
#' @param purpose Purpose of the upload (e.g., "independent", "dependent", "pd_calculation")
#' @return Database insert result (upload ID)
#' @details Stores Excel files as binary (bytea) in PostgreSQL for exact reconstruction
save_upload_to_db <- function(file_input, file_data, con,
                              user_id = NULL, purpose = "unknown") {
  # Validasi input
  if (is.null(file_input) || is.null(file_data)) {
    stop("File input atau datanya tidak boleh NULL.")
  }

  # Info file
  filename <- file_input$name
  ext <- tools::file_ext(filename)

  # CRITICAL: Store original Excel file as binary if it's an Excel file
  # This preserves formatting and allows exact reconstruction (lines 862-875)
  file_bin <- NULL

  if (ext %in% c("xlsx", "xls")) {
    # For Excel files: read original binary file directly
    file_size <- file.info(file_input$datapath)$size
    file_bin <- readBin(file_input$datapath, what = "raw", n = file_size)
  } else {
    # For CSV/other formats: convert data to CSV then to binary
    tmpfile <- tempfile(fileext = ".csv")
    write.csv(file_data, tmpfile, row.names = FALSE)
    file_size <- file.info(tmpfile)$size
    file_bin <- readBin(tmpfile, what = "raw", n = file_size)
    unlink(tmpfile)
  }

  # Cek panjang
  if (length(file_bin) < 1) {
    stop("File upload kosong atau gagal dikonversi ke binary.")
  }

  # Eksekusi insert ke DB with RETURNING id
  query <- "
    INSERT INTO upload_history (
      user_id, filename, file_type, purpose, rows, columns, data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  "

  result <- dbGetQuery(con, query, params = list(
    ifelse(is.null(user_id), Sys.info()[["user"]], user_id),
    filename,
    ext,
    purpose,
    nrow(file_data),
    ncol(file_data),
    I(list(file_bin))  # penting: I(list(...)) untuk BYTEA
  ))

  return(result$id)
}

#' Load file from upload history database
#' @param con Database connection object
#' @param upload_id Upload ID from upload_history table
#' @return Data frame with loaded data or NULL if error
#' @details Reconstructs file from binary (bytea) storage (lines 2586-2621)
load_from_history <- function(con, upload_id) {
  tryCatch({
    # Query untuk ambil binary data
    result <- dbGetQuery(con,
      "SELECT data, file_type FROM upload_history WHERE id = $1",
      params = list(upload_id))

    if (nrow(result) == 0) {
      stop(paste("Upload ID", upload_id, "tidak ditemukan"))
    }

    # Extract binary data
    bin <- result$data[[1]]
    if (is.null(bin) || length(bin) == 0) {
      stop("Kolom data_file kosong")
    }

    # Reconstruct file from binary (lines 2607-2609)
    ext <- result$file_type
    path <- tempfile(fileext = paste0(".", ext))
    writeBin(bin, path)

    # Read file based on type
    df <- if (ext %in% c("xlsx", "xls")) {
      readxl::read_excel(path)
    } else {
      read.csv(path)
    }

    # Cleanup temp file
    unlink(path)

    return(df)

  }, error = function(e) {
    message("Error loading from history: ", e$message)
    return(NULL)
  })
}

#' Delete upload from history
#' @param con Database connection object
#' @param upload_id Upload ID to delete
#' @return TRUE if successful, FALSE otherwise
#' @details Deletes upload record from database (lines 876-877)
delete_from_history <- function(con, upload_id) {
  tryCatch({
    dbExecute(con, "DELETE FROM upload_history WHERE id = $1",
              params = list(upload_id))
    return(TRUE)
  }, error = function(e) {
    message("Error deleting from history: ", e$message)
    return(FALSE)
  })
}

#' Update upload status in history
#' @param con Database connection object
#' @param upload_id Upload ID to update
#' @param status New status value
#' @return TRUE if successful, FALSE otherwise
update_upload_status <- function(con, upload_id, status = "processed") {
  tryCatch({
    dbExecute(con, "UPDATE upload_history SET status = $1, updated_at = NOW() WHERE id = $2",
              params = list(status, upload_id))
    return(TRUE)
  }, error = function(e) {
    message("Error updating upload status: ", e$message)
    return(FALSE)
  })
}

#' Get upload history list
#' @param con Database connection object
#' @param purpose Filter by purpose (optional, e.g., "independent")
#' @return Data frame with upload history
get_upload_history <- function(con, purpose = NULL) {
  query <- if (is.null(purpose)) {
    "SELECT id, filename, file_type, rows, columns, upload_time, status
     FROM upload_history ORDER BY upload_time DESC"
  } else {
    "SELECT id, filename, file_type, rows, columns, upload_time, status
     FROM upload_history WHERE purpose = $1 ORDER BY upload_time DESC"
  }

  tryCatch({
    if (is.null(purpose)) {
      dbGetQuery(con, query)
    } else {
      dbGetQuery(con, query, params = list(purpose))
    }
  }, error = function(e) {
    message("Error getting upload history: ", e$message)
    return(data.frame())
  })
}

#' ACF Statistics function for time series analysis
#' @param x Time series data
#' @param lag Maximum lag for ACF/PACF calculation
#' @return Matrix of ACF, PACF, Q-Stats, and P-values
acfStat <- function(x, lag = 36) {
  out1 <- acf(x, lag.max = lag, plot = F, na.action = na.pass)
  acfout <- out1$acf
  out2 <- pacf(x, lag.max = lag, plot = F, na.action = na.pass)
  pacfout <- NULL
  pacfout[1] <- 1
  pacfout <- c(pacfout, out2$acf)
  temp1 <- NULL
  temp1[1] <- NULL
  temp2 <- NULL
  temp2[1] <- NULL
  for(i in 1:lag) {
    temp1[i+1] <- Box.test(x, lag = i, type = "Ljung")$statistic
    temp2[i+1] <- Box.test(x, lag = i, type = "Ljung")$p.value
  }

  result <- cbind(ACF = acfout, PACF = pacfout, "Q-Stats" = temp1, "P-Value" = temp2)
  rownames(result) <- 0:lag
  print(result)
}

#' Generate ARIMA model string representation
#' @param object ARIMA model object
#' @return String representation of ARIMA model
arima.string <- function(object) {
  order <- object$arma[c(1,6,2,3,7,4,5)]
  result <- paste("ARIMA(",order[1],",",order[2],",",order[3],")",sep="")
  if(order[7]>1 & sum(order[4:6])>0)
    result <- paste(result,"(",order[4],",",order[5],",",order[6],")[",order[7],"]",sep="")
  if(is.element("constant",names(object$coef))|is.element("intercept",names(object$coef)))
    result <- paste(result,"with non-zero mean")
  else if (is.element("drift",names(object$coef)))
    result <- paste(result,"with drift")
  else if(order[2]==0 & order[5]==0)
    result <- paste(result,"with zero mean")
  else
    result <- paste(result,"")
  return(result)
}

#' Print ARIMA model coefficients with statistics
#' @param x ARIMA model object
#' @param digits Number of decimal places
#' @param se Include standard errors
#' @param ... Additional parameters
#' @return Prints formatted ARIMA coefficients
printarima <- function(x, digits = 4, se = T, ...) {
  if(length(x$coef)>0) {
    cat("\nCoefficients:\n")
    coef <- round(x$coef, digits = digits)
    if(se && nrow(x$var.coef)) {
      ses <- rep(0, length(coef))
      ses[x$mask] <- round(sqrt(diag(x$var.coef)), digits = digits)
      coef <- matrix(coef, 1, dimnames = list(NULL, names(coef)))
      coef <- rbind(coef, s.e. = ses)
      statt <- coef[1,]/ses
      pval <- 2*pt(abs(statt), df = length(x$residuals)-1, lower.tail = F)
      coef <- rbind(coef, t = round(statt, digits = digits),
                    sign. = round(pval, digits = digits))
      coef <- t(coef)
    }
    print.default(coef, print.gap = 2)
  }
}

# =============================================================================
# END OF DATABASE UTILITY FUNCTIONS
# =============================================================================