# Lightweight runtime logger for Docker-first observability.
# Logs to stdout/stderr with level filtering and key=value context.

RA_LOG_LEVELS <- c(debug = 10L, info = 20L, warn = 30L, error = 40L)

ra_init_logger <- function(service = NULL, level = NULL) {
  resolved_service <- service
  if (is.null(resolved_service) || !nzchar(resolved_service)) {
    resolved_service <- Sys.getenv("LOG_SERVICE", "r-analytics")
  }

  resolved_level <- tolower(level %||% Sys.getenv("LOG_LEVEL", "info"))
  if (!resolved_level %in% names(RA_LOG_LEVELS)) {
    resolved_level <- "info"
  }

  options(
    ra_logger_service = resolved_service,
    ra_logger_level = resolved_level
  )
}

`%||%` <- function(x, y) if (is.null(x)) y else x

ra_get_log_level <- function() {
  lvl <- tolower(getOption("ra_logger_level", Sys.getenv("LOG_LEVEL", "info")))
  if (!lvl %in% names(RA_LOG_LEVELS)) {
    lvl <- "info"
  }
  lvl
}

ra_should_log <- function(level) {
  current <- ra_get_log_level()
  RA_LOG_LEVELS[[tolower(level)]] >= RA_LOG_LEVELS[[current]]
}

ra_format_context <- function(context = NULL) {
  if (is.null(context) || length(context) == 0) {
    return("")
  }

  keys <- names(context)
  if (is.null(keys)) {
    keys <- paste0("arg", seq_along(context))
  }

  parts <- character(length(context))
  for (i in seq_along(context)) {
    key <- keys[[i]]
    value <- as.character(context[[i]] %||% "")
    value <- gsub("[\r\n]", " ", value)
    if (grepl("\\s", value)) {
      value <- paste0("\"", value, "\"")
    }
    parts[[i]] <- paste0(key, "=", value)
  }

  paste(parts, collapse = " ")
}

ra_log <- function(level, message, context = NULL, service = NULL) {
  level <- tolower(level)
  if (!level %in% names(RA_LOG_LEVELS)) {
    level <- "info"
  }

  if (!ra_should_log(level)) {
    return(invisible(NULL))
  }

  ts <- format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z")
  svc <- service %||% getOption("ra_logger_service", Sys.getenv("LOG_SERVICE", "r-analytics"))
  ctx <- ra_format_context(context)
  line <- paste0("[", ts, "] [", toupper(level), "] [", svc, "] ", message)
  if (nzchar(ctx)) {
    line <- paste0(line, " ", ctx)
  }

  stream <- if (level %in% c("warn", "error")) stderr() else stdout()
  cat(line, "\n", file = stream, sep = "")
  flush(stream)
  invisible(NULL)
}

ra_log_debug <- function(message, context = NULL, service = NULL) {
  ra_log("debug", message, context = context, service = service)
}

ra_log_info <- function(message, context = NULL, service = NULL) {
  ra_log("info", message, context = context, service = service)
}

ra_log_warn <- function(message, context = NULL, service = NULL) {
  ra_log("warn", message, context = context, service = service)
}

ra_log_error <- function(message, context = NULL, service = NULL) {
  ra_log("error", message, context = context, service = service)
}
