#!/bin/bash
set -e

# This is a basic entrypoint for the R Analytics container
echo "Starting R Analytics Entrypoint..."

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
