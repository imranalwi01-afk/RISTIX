#!/bin/bash
set -e

# This is a basic entrypoint for the R Analytics container
echo "Starting R Analytics Entrypoint..."

# If a command is provided, execute it. Otherwise, do nothing (wait for manual start if needed)
if [ $# -gt 0 ]; then
  exec "$@"
else
  echo "No command provided. Starting R Analytics (Shiny) ..."
  cd /opt/r-analytics/shiny-app
  exec Rscript start_iaf.R
fi
