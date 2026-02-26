#!/bin/bash
set -euo pipefail

# This is a basic entrypoint for the R Analytics container
echo "Starting R Analytics Entrypoint..."

# Resolve DB variables consistently: prefer FRS9_DB_* when provided.
if [ -n "${FRS9_DB_HOST:-}" ]; then export DB_HOST="${FRS9_DB_HOST}"; fi
if [ -n "${FRS9_DB_PORT:-}" ]; then export DB_PORT="${FRS9_DB_PORT}"; fi
if [ -n "${FRS9_DB_USER:-}" ]; then export DB_USER="${FRS9_DB_USER}"; fi
if [ -n "${FRS9_DB_PASSWORD:-}" ]; then export DB_PASSWORD="${FRS9_DB_PASSWORD}"; fi
if [ -n "${FRS9_DB_NAME:-}" ]; then export DB_NAME="${FRS9_DB_NAME}"; fi
if [ -n "${FRS9_DB_SCHEMA:-}" ]; then export DB_SCHEMA="${FRS9_DB_SCHEMA}"; fi

echo "Resolved DB target for Shiny/API:"
echo "  DB_HOST=${DB_HOST:-<unset>}"
echo "  DB_PORT=${DB_PORT:-<unset>}"
echo "  DB_NAME=${DB_NAME:-<unset>}"
echo "  DB_SCHEMA=${DB_SCHEMA:-public}"

# If a command is provided, execute it. Otherwise, do nothing (wait for manual start if needed)
if [ $# -gt 0 ]; then
  exec "$@"
else
  echo "Preserving environment variables for R runtime..."
  # Explicitly preserve connection and tenant variables so R sessions see them.
  # Avoid writing under /opt/r-analytics/shiny-app because local compose mounts it read-only.
  R_ENV_FILE="/tmp/r-analytics.Renviron"
  env | grep -E '^(DB_|FRS9_|TENANT_|BANKING_|USER_|SHINY_|R_)' > "${R_ENV_FILE}"
  export R_ENVIRON_USER="${R_ENV_FILE}"

  prefix_logs() {
    local prefix="$1"
    awk -v p="$prefix" '{ print p $0; fflush(); }'
  }

  DASHBOARD_PORT="${R_PORT:-4236}"
  API_PORT="${R_SERVICE_PORT:-4241}"
  export R_PORT="${DASHBOARD_PORT}"
  export R_SERVICE_PORT="${API_PORT}"

  # Centralized log dir for Docker visibility.
  export R_ANALYTICS_LOG_DIR="${R_ANALYTICS_LOG_DIR:-/opt/r-analytics/logs}"
  mkdir -p "${R_ANALYTICS_LOG_DIR}"
  touch "${R_ANALYTICS_LOG_DIR}/ifrs9_app.log" \
        "${R_ANALYTICS_LOG_DIR}/ifrs9_error.log" \
        "${R_ANALYTICS_LOG_DIR}/ifrs9_data.log" \
        "${R_ANALYTICS_LOG_DIR}/ifrs9_model.log" \
        "${R_ANALYTICS_LOG_DIR}/ifrs9_pd.log"

  echo "Starting R Analytics API (Port ${API_PORT})..."
  Rscript start_api.R 2>&1 | prefix_logs "[R-API] " &
  API_PIPE_PID=$!

  echo "Starting R Analytics Dashboard (Port ${DASHBOARD_PORT})..."
  (
    cd /opt/r-analytics/shiny-app
    Rscript app.R
  ) 2>&1 | prefix_logs "[SHINY] " &
  SHINY_PIPE_PID=$!

  # Also forward file-based app logs to Docker stdout for easy diagnostics.
  tail -n +1 -F \
    "${R_ANALYTICS_LOG_DIR}/ifrs9_app.log" \
    "${R_ANALYTICS_LOG_DIR}/ifrs9_error.log" \
    "${R_ANALYTICS_LOG_DIR}/ifrs9_data.log" \
    "${R_ANALYTICS_LOG_DIR}/ifrs9_model.log" \
    "${R_ANALYTICS_LOG_DIR}/ifrs9_pd.log" 2>/dev/null | prefix_logs "[R-LOG] " &
  LOG_TAIL_PID=$!

  # If either process exits, stop the container so orchestration can restart it.
  wait -n "$API_PIPE_PID" "$SHINY_PIPE_PID"
  EXIT_CODE=$?
  echo "A critical service stopped. Shutting down container (exit code: ${EXIT_CODE})."

  kill "$API_PIPE_PID" "$SHINY_PIPE_PID" "$LOG_TAIL_PID" 2>/dev/null || true
  wait "$API_PIPE_PID" "$SHINY_PIPE_PID" "$LOG_TAIL_PID" 2>/dev/null || true
  exit "$EXIT_CODE"
fi
