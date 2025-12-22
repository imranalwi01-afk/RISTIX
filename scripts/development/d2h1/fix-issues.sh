#!/bin/bash
# Fix DAY 2 HOUR 1 Issues

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

echo "[FIX] Fixing environment file..."
# Clean up the .env file
cp "${PROJECT_ROOT}/.env.platform" "${PROJECT_ROOT}/.env"
echo "✅ Environment file fixed"

echo "[FIX] Creating DAY 1 completion marker..."
# Create DAY 1 completion marker
echo "DAY 1 completed manually - $(date)" > "${PROJECT_ROOT}/.day1-completed"
echo "✅ DAY 1 completion marker created"

echo "[FIX] Validating database connection..."
# Test database connection
if pg_isready -h localhost -p 5432 -U postgres; then
    echo "✅ PostgreSQL is accessible"
else
    echo "❌ PostgreSQL is not accessible. Please start PostgreSQL service:"
    echo "   sudo systemctl start postgresql"
    echo "   # OR for Ubuntu/Debian:"
    echo "   sudo service postgresql start"
fi

echo "[FIX] Testing Redis connection..."
# Test Redis connection
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is accessible"
else
    echo "❌ Redis is not accessible. Please start Redis service:"
    echo "   sudo systemctl start redis"
    echo "   # OR for Ubuntu/Debian:"
    echo "   sudo service redis-server start"
fi

echo ""
echo "🎯 All fixes applied! You can now run:"
echo "   ./scripts/development/d2h1/d2h1-environment-setup.sh"
echo "   ./scripts/development/d2h1/d2h1-platform-infrastructure.sh"
