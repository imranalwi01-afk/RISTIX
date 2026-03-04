# =============================================================================
# TEST: FORECAST SERVER PARITY
# =============================================================================
library(testthat)
library(shiny)

source("../shiny-app/global.R")
source("../shiny-app/modules/server/forecast_server.R")

test_that("forecast_server.R successfully extracts MEV variables without date column pollution", {
  
  # Mock model outcomes 
  mock_model_data <- reactive({
    data.frame(
      prc_date = as.Date(c("2020-01-01", "2020-02-01")),
      odr = c(0.1, 0.2),
      GDP_Lag1 = c(1, 2),
      INF_Diff12 = c(3, 4)
    )
  })
  
  mock_model_results <- list(
    model_data = mock_model_data,
    final_model = reactive({ list() }),
    significant_vars = reactive({ c("GDP_Lag1", "INF_Diff12") })
  )
  
  testServer(forecast_server, args = list(
    model_results = mock_model_results,
    data_results = list(dependent_transformed = reactive({ data.frame() })),
    con = NULL
  ), {
    
    # Simulate user turning on Forecast X with MEV
    session$setInputs(mevfore = "MEV_Awal")
    session$setInputs(jumlah_forecast = 12)
    session$setInputs(forecastX = 1)
    
    # Internal variables test 
    # Extract MEV logic should have stripped 'prc_date' out of the sources completely
    # like original line 1595 in app34.R did.
    mev_extract <- NULL
    tryCatch({
      mev_extract <- mev_variables()
    }, error = function(e) {})
    
    expect_true(is.data.frame(mev_extract))
    
    # It should only contain the roots "GDP" and "INF"
    extracted_names <- names(mev_extract)
    expect_false(any(grepl("date|prc", tolower(extracted_names))))
  })
})
