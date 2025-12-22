#!/bin/bash
# scripts/development/start-dev.sh
# Start all development services

set -e

echo "🚀 Starting IFRS 9 Platform Development Environment..."

# Load environment variables
if [[ -f ".env" ]]; then
    source .env
fi

# Start services in parallel
echo "📱 Frontend: http://localhost:${FRONTEND_PORT:-4231}"
echo "🔧 Backend API: http://localhost:${BACKEND_PORT:-4232}"
echo "📈 R Analytics: http://localhost:${R_ANALYTICS_PORT:-4236}"

# Start all services using pnpm
pnpm run dev
