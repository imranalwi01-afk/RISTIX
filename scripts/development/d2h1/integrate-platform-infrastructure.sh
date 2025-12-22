#!/bin/bash
# Integrate Platform Infrastructure with Existing Backend

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

echo "🔗 Integrating platform infrastructure with existing backend..."

# Add the new routes to your existing routes index
if [[ -f "${PROJECT_ROOT}/packages/backend/src/api/routes/index.ts" ]]; then
    echo ""
    echo "📝 Update your routes/index.ts to include the new platform infrastructure routes:"
    echo ""
    echo "// Add this import:"
    echo "import platformInfrastructureRoutes from './platform-infrastructure.routes';"
    echo ""
    echo "// Add this route registration:"
    echo "app.use('/api/platform', platformInfrastructureRoutes);"
    echo ""
else
    echo "⚠️  Routes index file not found. You may need to manually integrate the routes."
fi

# Update package.json dependencies if needed
echo ""
echo "📦 Make sure your package.json includes these dependencies:"
echo "- @nestjs/common"
echo "- @nestjs/config"
echo "- ioredis (for Redis cache)"
echo ""

# Test the new endpoints
echo "🧪 After integrating, you can test these new endpoints:"
echo "- GET  /api/platform/config/:key     - Get configuration"
echo "- POST /api/platform/config          - Set configuration"
echo "- GET  /api/platform/monitoring/health - Health check"
echo "- DELETE /api/platform/cache/:key    - Clear cache"
echo ""

echo "✅ Integration guidance provided!"
echo "🚀 Ready for DAY 2 HOUR 2 - Four-Eyes Approval System"
