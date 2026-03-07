# =============================================================================
# REGRESSION GUARDRAILS: TRANSFORM + PRE-FLIGHT SCENARIO CHECK
# =============================================================================
library(testthat)

source("../shiny-app/global.R")

resolve_mev_feb_path <- function() {
  candidates <- c(
    "../../../docs/data/MEV_ALL_FEB.csv",
    "../../docs/data/MEV_ALL_FEB.csv",
    "docs/data/MEV_ALL_FEB.csv"
  )

  for (p in candidates) {
    if (file.exists(p)) {
      return(normalizePath(p))
    }
  }

  stop("MEV_ALL_FEB.csv tidak ditemukan di docs/data")
}

test_that("transform keeps latest snapshot date when Transformasi is enabled", {
  csv_path <- resolve_mev_feb_path()

  raw_df <- read.csv(csv_path, sep = ";", stringsAsFactors = FALSE)
  converted <- convert_dates2(raw_df)

  expect_true(length(converted$date_columns) >= 1)

  date_col <- converted$date_columns[1]
  df2 <- converted$df
  df3x <- df2[, !names(df2) %in% date_col, drop = FALSE]

  transformed <- transform(df3x)
  transformed <- cbind(df2[, date_col, drop = FALSE], transformed)
  transformed <- na.omit(transformed)

  expect_true(nrow(transformed) > 0)
  expect_equal(max(transformed[[date_col]]), as.Date("2026-02-28"))
})

test_that("preflight and make_scenario support transformed variable names", {
  base_df <- data.frame(
    UNEMPLOYMENT_Ln_Lg4 = c(1.10, 1.12),
    CPI_Y_Lg1 = c(0.03, 0.04),
    check.names = FALSE
  )

  intuition_df <- data.frame(
    var = c("UNEMPLOYMENT", "CPI"),
    sign = c(1, -1),
    stringsAsFactors = FALSE
  )

  sd_vec <- data.frame(
    UNEMPLOYMENT = 0.02,
    CPI = 0.01,
    check.names = FALSE
  )

  preflight <- preflight_scenario_inputs(base_df, intuition_df, sd_vec)

  expect_true(isTRUE(preflight$ok))
  expect_length(preflight$missing_intuition, 0)
  expect_length(preflight$missing_sd, 0)

  scenario <- make_scenario(base_df, intuition_df, sd_vec)
  expect_true(is.list(scenario))
  expect_true(all(c("worst", "best") %in% names(scenario)))
  expect_equal(colnames(scenario$worst), colnames(base_df))
})

test_that("preflight reports missing intuition with transformed source name", {
  base_df <- data.frame(UNEMPLOYMENT_Ln_Lg4 = c(1.10, 1.12), check.names = FALSE)

  intuition_df <- data.frame(
    var = c("CPI"),
    sign = c(1),
    stringsAsFactors = FALSE
  )

  sd_vec <- data.frame(UNEMPLOYMENT = 0.02, check.names = FALSE)

  preflight <- preflight_scenario_inputs(base_df, intuition_df, sd_vec)
  expect_false(preflight$ok)
  expect_equal(preflight$missing_intuition, "UNEMPLOYMENT_Ln_Lg4")

  expect_error(
    make_scenario(base_df, intuition_df, sd_vec),
    "Intuisi tidak ditemukan untuk variabel: UNEMPLOYMENT_Ln_Lg4"
  )
})
