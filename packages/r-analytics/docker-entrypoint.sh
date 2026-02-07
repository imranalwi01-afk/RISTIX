#!/bin/bash
set -e

# This is a basic entrypoint for the R Analytics container
echo "Starting R Analytics Entrypoint..."

# If a command is provided, execute it. Otherwise, do nothing (wait for manual start if needed)
if [ $# -gt 0 ]; then
  exec "$@"
else
  echo "Starting Shiny Server..."
  exec shiny-server
fi
