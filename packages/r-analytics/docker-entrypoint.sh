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
  echo "Preserving environment variables for Shiny Server..."
  # Explicitly preserve connection and tenant variables so Shiny Server sees them
  env | grep -E '^(DB_|FRS9_|TENANT_|BANKING_|USER_|SHINY_|R_)' > /opt/r-analytics/shiny-app/.Renviron
  chown r-analytics:r-analytics /opt/r-analytics/shiny-app/.Renviron

  prefix_logs() {
    local prefix="$1"
    awk -v p="$prefix" '{ print p $0; fflush(); }'
  }

  echo "Starting R Analytics API (Port 4241)..."
  Rscript start_api.R 2>&1 | prefix_logs "[R-API] " &
  API_PIPE_PID=$!

  echo "Starting Shiny Server (Port 3838)..."
  shiny-server 2>&1 | prefix_logs "[SHINY] " &
  SHINY_PIPE_PID=$!

  # If either process exits, stop the container so orchestration can restart it.
  wait -n "$API_PIPE_PID" "$SHINY_PIPE_PID"
  EXIT_CODE=$?
  echo "A critical service stopped. Shutting down container (exit code: ${EXIT_CODE})."

  kill "$API_PIPE_PID" "$SHINY_PIPE_PID" 2>/dev/null || true
  wait "$API_PIPE_PID" "$SHINY_PIPE_PID" 2>/dev/null || true
  exit "$EXIT_CODE"
fi
