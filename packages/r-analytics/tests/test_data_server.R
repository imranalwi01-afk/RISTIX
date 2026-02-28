# =============================================================================
# TEST: DATA SERVER PARITY
# =============================================================================
library(testthat)
library(shiny)
library(dplyr)

# Standard loads
options(tidyverse.quiet = TRUE)
source("../shiny-app/global.R")
source("../shiny-app/modules/server/data_server.R")

test_that("data_server.R successfully simulates data load and join equivalent to app34.R", {
  
  # Stub a mock DB connection and configurations
  mock_PD <- data.frame(pkid = 1, pd_model_name = "Mock PD Model", stringsAsFactors = FALSE)
  mock_LGD <- data.frame(pkid = 1, lgd_model_name = "Mock LGD Model", stringsAsFactors = FALSE)
  mock_persistent <- reactiveValues(
    dependent_data = NULL,
    independent_data = NULL,
    joined_data = NULL
  )
  
  testServer(data_server, args = list(
    con = NULL, 
    PD = mock_PD, 
    LGD = mock_LGD,
    persistent_data = mock_persistent
  ), {
    
    # Simulate selecting 'OTHERS' for dependent variable
    session$setInputs(dependent = "OTHERS")
    
    # Since we can't easily fake fileUpload inputs headlessly without complex mocking,
    # we verify that the reactives initialize correctly and wait for data.
    
    # Exposing internal reactives to test scope
    datagabung_res <- NULL
    tryCatch({
      # Try triggering the join logic
      session$setInputs(join = 1)
      datagabung_res <- joined_data()
    }, error = function(e) {})
    
    # Expected behavior: If join is clicked but no data is uploaded, 
    # joined_data() should return an empty data.frame() natively matching app34.R's safe return
    expect_true(is.data.frame(datagabung_res))
    expect_equal(nrow(datagabung_res), 0)
    
    # Check that return lists export exactly what app34.R used globally
    returned_keys <- names(session$returned)
    expect_true("dependent_transformed" %in% returned_keys)
    expect_true("independent_data" %in% returned_keys)
    expect_true("joined_data" %in% returned_keys)
  })
})
