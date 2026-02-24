#!/bin/bash
set -e

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
  echo "Starting R Analytics API (Port 4241)..."
  Rscript start_api.R > /opt/r-analytics/logs/api.log 2>&1 &
  
  # Tail logs to stdout in background so they appear in 'docker logs'
  echo "Starting Log Streamer..."
  touch /opt/r-analytics/logs/api.log
  tail -F /opt/r-analytics/logs/*.log &
  
  echo "Preserving environment variables for Shiny Server..."
  # Explicitly preserve connection and tenant variables so Shiny Server sees them
  env | grep -E '^(DB_|FRS9_|TENANT_|BANKING_|USER_|SHINY_|R_)' > /opt/r-analytics/shiny-app/.Renviron
  chown r-analytics:r-analytics /opt/r-analytics/shiny-app/.Renviron
  
  echo "Starting Shiny Server (Port 3838)..."
  exec shiny-server
fi
