#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/ops/local/backend.env"
COMPOSE_FILE="$ROOT_DIR/ops/local/docker-compose.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  echo "Copy ops/local/backend.env.example to ops/local/backend.env and fill remote DB values first."
  exit 1
fi

docker compose \
  --env-file "$ENV_FILE" \
  -f "$COMPOSE_FILE" \
  --profile backend-remote-db \
  --profile frontend-remote-db \
  up -d redis new-backend-vpn frontend-dev
