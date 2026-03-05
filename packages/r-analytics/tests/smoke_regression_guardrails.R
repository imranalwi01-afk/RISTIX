#!/usr/bin/env Rscript

# Smoke test for critical regression guardrails:
# 1) Transform flow must keep latest snapshot date (2026-02-28)
# 2) Scenario preflight must pass for transformed predictor names

script_arg <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
script_path <- if (length(script_arg) > 0) sub("^--file=", "", script_arg[1]) else ""
script_dir <- if (nzchar(script_path)) dirname(normalizePath(script_path)) else getwd()

source(file.path(script_dir, "../shiny-app/global.R"))

resolve_mev_feb_path <- function() {
  candidates <- c(
    file.path(script_dir, "../../../docs/data/MEV_ALL_FEB.csv"),
    file.path(script_dir, "../../docs/data/MEV_ALL_FEB.csv"),
    file.path(getwd(), "docs/data/MEV_ALL_FEB.csv")
  )

  for (p in candidates) {
    if (file.exists(p)) return(normalizePath(p))
  }

  stop("MEV_ALL_FEB.csv tidak ditemukan di docs/data")
}

assert_or_stop <- function(condition, message) {
  if (!isTRUE(condition)) {
    stop(message, call. = FALSE)
  }
}

cat("[SMOKE] Loading MEV_ALL_FEB.csv...\n")
csv_path <- resolve_mev_feb_path()
raw_df <- read.csv(csv_path, sep = ";", stringsAsFactors = FALSE)
converted <- convert_dates2(raw_df)

assert_or_stop(length(converted$date_columns) >= 1, "Date column tidak terdeteksi")

cat("[SMOKE] Running transform flow (app34 logic)...\n")
date_col <- converted$date_columns[1]
df2 <- converted$df
df3x <- df2[, !names(df2) %in% date_col, drop = FALSE]
transformed <- transform(df3x)
transformed <- cbind(df2[, date_col, drop = FALSE], transformed)
transformed <- na.omit(transformed)

last_date <- max(transformed[[date_col]])
assert_or_stop(last_date == as.Date("2026-02-28"), paste0("Last date mismatch: ", last_date))
cat("[SMOKE] Transform check passed. last_date=", format(last_date, "%Y-%m-%d"), "\n", sep = "")

cat("[SMOKE] Running preflight scenario mapping check...\n")
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
assert_or_stop(isTRUE(preflight$ok), "Preflight gagal untuk transformed variable mapping")

scenario <- make_scenario(base_df, intuition_df, sd_vec)
assert_or_stop(all(c("worst", "best") %in% names(scenario)), "Scenario output tidak lengkap")

cat("[SMOKE] Preflight + scenario check passed.\n")
cat("[SMOKE] ALL CHECKS PASSED\n")
