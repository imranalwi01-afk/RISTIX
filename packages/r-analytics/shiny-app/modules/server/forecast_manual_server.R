# =============================================================================
# FORECAST MANUAL SERVER MODULE
# =============================================================================
# Extracted from: app34.R (lines 2215-2480)
# Purpose: Server logic for manual forecasting operations
# =============================================================================

forecast_manual_server <- function(input, output, session, data_results) {
  
  # =============================================================================
  # LOCAL UTILITY FUNCTIONS
  # =============================================================================
  
  # Safe data reading function (also defined in data_server.R and forecast_server.R)
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
  
  # =============================================================================
  # TAB 1: Forecast Pilih Metode Otomatis
  # =============================================================================
  
  df5 <- reactiveVal(NULL)
  
  # Upload handler
  observeEvent(input$submit5, {
    req(input$file_upload_other5)
    
    # safe_read_data is available globally from app.R / utils
    data <- safe_read_data(input$file_upload_other5, input$csv_sep5)
    
    if (is.null(data)) {
      df5(data.frame(Pesan = "File tidak dapat dibaca."))
      return()
    }
    
    df5(data)
    
    # Validation logic from app34.R
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
  
  output$df5table_output <- DT::renderDT({
    req(df5())
    DT::datatable(df5(), options = list(scrollX = TRUE))
  })
  
  # Summary calculation
  forecast_manual_pilih <- eventReactive(input$runpilihmetodeotomatis, {
    req(df5())
    # konversi_ke_list_forecast and loop_akurasi_forecast_list are global
    list_variabel <- konversi_ke_list_forecast(df5())
    hasil_akurasiL <- loop_akurasi_forecast_list(list_variabel, makur = input$akurasi_forecastx5)
    hasil_akurasiL
  })
  
  output$out_summary_forecast_manual_pilih <- renderPrint({
    req(forecast_manual_pilih())
    forecast_manual_pilih()
  })
  
  # Forecast execution
  Hasilforecast_manual_pilih <- eventReactive(input$runforecastmanualpilih, {
    req(input$metode_pilihan)
    req(df5())
    req(forecast_manual_pilih())
    
    metode_vec <- as.numeric(trimws(unlist(strsplit(input$metode_pilihan, ","))))
    list_variabel <- konversi_ke_list_forecast(df5())
    
    n_var <- length(list_variabel)
    validate(
      need(
        length(metode_vec) == n_var,
        paste0(
          "Jumlah metode pilih (", length(metode_vec),
          ") harus sama dengan jumlah variabel (", n_var, ")"
        )
      )
    )
    
    hasil_forecast_manual <- forecast_dengan_pilihan_metode(
      list_data = list_variabel,
      list_akurasi = forecast_manual_pilih(),
      metode_pilihan = metode_vec,
      jf = input$jumlah_forecast5
    )
    
    hasilfulldf <- gabung_hasil_forecast(hasil_forecast_manual)
    
    # In modular app, we use historical part from uploaded df5() if datacorex missing
    # But for safety, we'll try to use df5() columns that match results
    res_cols <- names(hasilfulldf)
    hist_data <- df5()[, res_cols, drop = FALSE]
    
    hasilfulldf <- rbind(hist_data, hasilfulldf)
    hasilfulldf
  })
  
  transformed5_result_forecast <- reactiveVal(NULL)
  
  output$out_hasilforecast_manual_pilih <- DT::renderDataTable({
    req(Hasilforecast_manual_pilih())
    df <- Hasilforecast_manual_pilih()
    
    if (input$transform5) {
      # transform function is global
      Date <- df[, 1]
      df3x <- df[, -1]
      df3new <- transform_data(df3x) # Original used transform() but our modular uses transform_data()
      df3new <- cbind(Date = Date, df3new)
      df3new <- na.omit(df3new)
      
      transformed5_result_forecast(df3new)
      DT::datatable(df3new, options = list(scrollX = TRUE))
    } else {
      transformed5_result_forecast(df)
      DT::datatable(df, options = list(scrollX = TRUE))
    }
  })
  
  output$download_forecast_manual_pilih <- downloadHandler(
    filename = function() {
      paste0("hasil_forecast_manualpilih_", format(Sys.time(), "%Y-%m-%d_%H-%M-%S"), ".xlsx")
    },
    content = function(file) {
      req(transformed5_result_forecast())
      openxlsx::write.xlsx(transformed5_result_forecast(), file)
    }
  )
  
  # =============================================================================
  # TAB 2: Pilih Metode Forecast
  # =============================================================================
  
  df6 <- reactiveVal(NULL)
  
  observeEvent(input$submit6, {
    req(input$file_upload_other6)
    data <- safe_read_data(input$file_upload_other6, input$csv_sep6)
    
    if (is.null(data)) {
      df6(data.frame(Pesan = "File tidak dapat dibaca."))
      return()
    }
    
    df6(data)
    
    result <- convert_dates2(data)
    if (result$num_columns < 2 && length(result$date_columns) == 0) {
      showModal(modalDialog(title = "Peringatan", "File tidak valid."))
    }
  })
  
  output$df6table_output <- DT::renderDT({
    req(df6())
    DT::datatable(df6(), options = list(scrollX = TRUE))
  })
  
  hasil_forecast6 <- eventReactive(input$run_pilih_metode, {
    req(df6())
    req(input$pilihmetodeforecast)
    req(input$jumlah_forecast6)
    
    forecast_semua_variabel(
      datawide = df6(),
      metode   = input$pilihmetodeforecast,
      jf       = input$jumlah_forecast6,
      byy      = "month"
    )
  })
  
  transformed6_result_forecast <- reactiveVal(NULL)
  
  output$out_hasilforecast_pilih_metode <- DT::renderDataTable({
    req(hasil_forecast6())
    
    hasil <- hasil_forecast6()
    # gabung_hasil_forecast1 is global
    hasilfulldf <- gabung_hasil_forecast1(hasil)
    dfxx <- df6()
    
    # Date handling
    date_col <- names(dfxx)[sapply(dfxx, inherits, "Date")][1]
    if (is.na(date_col)) date_col <- names(dfxx)[1]
    
    dfxx[[date_col]] <- as.Date(dfxx[[date_col]])
    hasilfulldf$Date <- as.Date(hasilfulldf$Date)
    
    # Rename for bind_rows compatibility if needed
    names(dfxx)[names(dfxx) == date_col] <- "Date"
    
    df_combined <- dplyr::bind_rows(dfxx, hasilfulldf) %>%
      dplyr::arrange(Date)
    
    if (input$transform6) {
      Date <- df_combined$Date
      df3x <- df_combined[, !names(df_combined) %in% "Date", drop = FALSE]
      df3new <- transform_data(df3x)
      df3new <- cbind(Date = Date, df3new)
      df3new <- na.omit(df3new)
      
      transformed6_result_forecast(df3new)
      DT::datatable(df3new, options = list(scrollX = TRUE))
    } else {
      transformed6_result_forecast(df_combined)
      DT::datatable(df_combined, options = list(scrollX = TRUE))
    }
  })
  
  output$download_forecast_pilih_metode <- downloadHandler(
    filename = function() {
      paste0("forecast_", input$pilihmetodeforecast, ".csv")
    },
    content = function(file) {
      req(transformed6_result_forecast())
      write.csv(transformed6_result_forecast(), file, row.names = FALSE)
    }
  )

  # Return results if needed by other modules
  return(list(
    manual_pilih_data = transformed5_result_forecast,
    pilih_metode_data = transformed6_result_forecast
  ))
}
