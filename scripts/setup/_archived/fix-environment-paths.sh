#!/bin/bash
# scripts/setup/fix-environment-paths.sh
# Fix environment paths to use local project directories instead of system paths

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "🔧 Fixing environment paths to use local project directories..."

# Create necessary local directories
mkdir -p "${PROJECT_ROOT}/logs"
mkdir -p "${PROJECT_ROOT}/tmp" 
mkdir -p "${PROJECT_ROOT}/uploads"
mkdir -p "${PROJECT_ROOT}/config"

# Fix .env files to use local paths
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    echo "📝 Updating .env file paths..."
    sed -i.bak 's|LOG_FILE=/var/log/ifrspro/app.log|LOG_FILE=./logs/app.log|g' "${PROJECT_ROOT}/.env"
    sed -i.bak 's|UPLOAD_PATH=/var/uploads/ifrspro|UPLOAD_PATH=./uploads|g' "${PROJECT_ROOT}/.env"
    sed -i.bak 's|UPLOAD_TEMP_PATH=/tmp/ifrspro|UPLOAD_TEMP_PATH=./tmp|g' "${PROJECT_ROOT}/.env"
fi

# Fix .env.example
if [[ -f "${PROJECT_ROOT}/.env.example" ]]; then
    echo "📝 Updating .env.example file paths..."
    sed -i.bak 's|LOG_FILE=/var/log/ifrspro/app.log|LOG_FILE=./logs/app.log|g' "${PROJECT_ROOT}/.env.example"
    sed -i.bak 's|UPLOAD_PATH=/var/uploads/ifrspro|UPLOAD_PATH=./uploads|g' "${PROJECT_ROOT}/.env.example"
    sed -i.bak 's|UPLOAD_TEMP_PATH=/tmp/ifrspro|UPLOAD_TEMP_PATH=./tmp|g' "${PROJECT_ROOT}/.env.example"
fi

# Fix backend .env if it exists
if [[ -f "${PROJECT_ROOT}/packages/backend/.env" ]]; then
    echo "📝 Updating backend .env file paths..."
    sed -i.bak 's|LOG_FILE=./logs/backend.log|LOG_FILE=../../logs/backend.log|g' "${PROJECT_ROOT}/packages/backend/.env"
    sed -i.bak 's|UPLOAD_PATH=./uploads|UPLOAD_PATH=../../uploads|g' "${PROJECT_ROOT}/packages/backend/.env"
fi

# Fix R Analytics .env if it exists  
if [[ -f "${PROJECT_ROOT}/packages/r-analytics/.env" ]]; then
    echo "📝 Updating R Analytics .env file paths..."
    sed -i.bak 's|LOG_FILE=./logs/r-analytics.log|LOG_FILE=../../logs/r-analytics.log|g' "${PROJECT_ROOT}/packages/r-analytics/.env"
fi

# Clean up backup files
find "${PROJECT_ROOT}" -name "*.env.bak" -delete 2>/dev/null || true

echo "✅ Environment paths fixed to use local project directories"
echo "📂 Created directories:"
echo "   • ${PROJECT_ROOT}/logs"
echo "   • ${PROJECT_ROOT}/tmp"
echo "   • ${PROJECT_ROOT}/uploads"
echo "   • ${PROJECT_ROOT}/config"
echo ""
echo "🔧 Updated paths in environment files to use relative project paths"
echo "🔄 You can now run the setup scripts successfully"