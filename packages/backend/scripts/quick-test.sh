#!/bin/bash
# packages/backend/scripts/quick-test.sh
# ✅ QUICK TEST: Start backend and verify it's working

set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 IFRS9 Backend Quick Test${NC}"
echo "============================"

cd "$BACKEND_DIR"

# Apply fixes first
echo -e "${BLUE}🔧 Applying compilation fixes...${NC}"
if [ -f "scripts/fix-compilation.sh" ]; then
    chmod +x scripts/fix-compilation.sh
    ./scripts/fix-compilation.sh
else
    echo -e "${YELLOW}⚠️  fix-compilation.sh not found, continuing anyway${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Starting backend server for testing...${NC}"

# Start server in background
PORT=${PORT:-4232}

# Find and start the server
if [ -f "src/server.ts" ]; then
    ENTRY_POINT="src/server.ts"
elif [ -f "src/app.ts" ]; then
    ENTRY_POINT="src/app.ts"  
elif [ -f "src/index.ts" ]; then
    ENTRY_POINT="src/index.ts"
else
    echo -e "${RED}❌ No suitable entry point found${NC}"
    exit 1
fi

echo -e "${BLUE}📍 Using entry point: ${ENTRY_POINT}${NC}"

# Start server
npx ts-node --transpile-only "$ENTRY_POINT" &
SERVER_PID=$!

echo -e "${BLUE}🔄 Server PID: ${SERVER_PID}${NC}"
echo -e "${BLUE}⏳ Waiting for server to start...${NC}"

# Wait for server to be ready
for i in {1..30}; do
    if curl -s "http://localhost:${PORT}/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is responding!${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""

# Test endpoints
echo -e "${BLUE}🧪 Testing endpoints...${NC}"

# Test 1: Health check
echo -n "Health check: "
if curl -s "http://localhost:${PORT}/health" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test 2: Root endpoint  
echo -n "Root endpoint: "
if curl -s "http://localhost:${PORT}/" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test 3: API info
echo -n "API info: "
if curl -s "http://localhost:${PORT}/api/v1" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Backend test completed!${NC}"
echo ""
echo -e "${BLUE}📋 Server details:${NC}"
echo "   URL: http://localhost:${PORT}"
echo "   Health: http://localhost:${PORT}/health"
echo "   API: http://localhost:${PORT}/api/v1"
echo ""

# Keep server running for a bit
echo -e "${BLUE}⏰ Keeping server running for 10 seconds...${NC}"
sleep 10

# Stop server
echo -e "${BLUE}🛑 Stopping test server...${NC}"
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo -e "${GREEN}✅ Test complete!${NC}"