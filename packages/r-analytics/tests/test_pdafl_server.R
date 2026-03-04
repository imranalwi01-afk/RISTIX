# =============================================================================
# TEST: PDAFL SERVER PARITY
# =============================================================================
library(testthat)
library(shiny)

source("../shiny-app/global.R")
source("../shiny-app/modules/server/pdafl_server.R")

test_that("pdafl_server.R provides advanced tuning inputs identical to app15 expectations", {
  
  # We mock the connections simply to test UI validation and boxplot reactions
  mock_PD <- data.frame(pkid = 1, pd_model_name = "Mock PD Model", stringsAsFactors = FALSE)
  
  testServer(pdafl_server, args = list(
    con = NULL,
    PD = mock_PD
  ), {
    
    # Advanced logic: boxplot weights sum to 1.0 (Task #15 check)
    session$setInputs(weight_base = 0.6)
    session$setInputs(weight_best = 0.2)
    session$setInputs(weight_worst = 0.2)
    
    # Check what the validation UI reactives fire
    # Because of how testServer works, output reactives update when inputs trigger
    # Wait for flush (simulating shiny tick)
    session$flushReact()
    
    val_ui <- output$weight_validation_ui
    expect_true(grepl("Weights sum to 1.0", as.character(val_ui)))
    
    # Make them fail
    session$setInputs(weight_worst = 0.3)
    session$flushReact()
    
    val_ui_fail <- output$weight_validation_ui
    expect_true(grepl("Warning: Weights sum to", as.character(val_ui_fail)))
    expect_false(grepl("Weights sum to 1.0 ✓", as.character(val_ui_fail)))
  })
})
