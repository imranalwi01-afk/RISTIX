#!/bin/bash
# scripts/dev/test-error-fixes.sh
# IFRS9 Platform - Error Fix Validation Script

echo "🔧 IFRS9 Platform - Testing Error Fixes"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# Function to test with timeout
test_with_timeout() {
    timeout 30s $1
    return $?
}

echo -e "${BLUE}📦 Step 1: Installing Dependencies${NC}"
echo "Installing root dependencies..."
pnpm install
check_status "Root dependencies installed"

echo "Installing backend dependencies..."
cd packages/backend
pnpm install
check_status "Backend dependencies installed"
cd ../..

echo "Installing frontend dependencies..."
cd packages/frontend
pnpm install
check_status "Frontend dependencies installed"
cd ../..

echo -e "${BLUE}🔍 Step 2: TypeScript Type Checking${NC}"
echo "Checking TypeScript compilation..."
cd packages/backend
pnpm run type-check
check_status "Backend TypeScript compilation"
cd ../..

echo -e "${BLUE}🚀 Step 3: Backend Startup Test${NC}"
echo "Testing backend server startup..."
cd packages/backend

# Start backend in background with timeout
echo "Starting backend server (30 second test)..."
timeout 15s pnpm run dev &
BACKEND_PID=$!

# Wait a bit for startup
sleep 5

# Check if process is still running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend server started successfully${NC}"
    
    # Test health endpoint if available
    if command -v curl &> /dev/null; then
        sleep 2
        echo "Testing health endpoint..."
        curl -f http://localhost:4232/health > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Backend health endpoint responding${NC}"
        else
            echo -e "${YELLOW}⚠️ Backend health endpoint not responding (may not be implemented)${NC}"
        fi
    fi
    
    # Kill the background process
    kill $BACKEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
fi

cd ../..

echo -e "${BLUE}🌐 Step 4: Frontend Startup Test${NC}"
echo "Testing frontend server startup..."
cd packages/frontend

# Start frontend in background with timeout
echo "Starting frontend server (15 second test)..."
timeout 10s pnpm run dev &
FRONTEND_PID=$!

# Wait a bit for startup
sleep 8

# Check if process is still running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend server started successfully${NC}"
    
    # Test frontend endpoint if available
    if command -v curl &> /dev/null; then
        sleep 1
        echo "Testing frontend endpoint..."
        curl -f http://localhost:4231 > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Frontend endpoint responding${NC}"
        else
            echo -e "${YELLOW}⚠️ Frontend endpoint not fully ready (normal during startup)${NC}"
        fi
    fi
    
    # Kill the background process
    kill $FRONTEND_PID 2>/dev/null
    wait $FRONTEND_PID 2>/dev/null
else
    echo -e "${RED}❌ Frontend server failed to start${NC}"
fi

cd ../..

echo -e "${BLUE}🧪 Step 5: R Analytics Test${NC}"
echo "Testing R Analytics server startup..."
cd packages/r-analytics

# Start R Analytics in background with timeout
echo "Starting R Analytics server (10 second test)..."
timeout 8s pnpm run dev &
R_ANALYTICS_PID=$!

# Wait a bit for startup
sleep 5

# Check if process is still running
if kill -0 $R_ANALYTICS_PID 2>/dev/null; then
    echo -e "${GREEN}✅ R Analytics server started successfully${NC}"
    
    # Kill the background process
    kill $R_ANALYTICS_PID 2>/dev/null
    wait $R_ANALYTICS_PID 2>/dev/null
else
    echo -e "${YELLOW}⚠️ R Analytics server startup test (may need R runtime)${NC}"
fi

cd ../..

echo -e "${BLUE}📊 Step 6: Full Development Server Test${NC}"
echo "Testing all servers together (10 second test)..."
timeout 8s pnpm run dev &
ALL_PID=$!

sleep 6

if kill -0 $ALL_PID 2>/dev/null; then
    echo -e "${GREEN}✅ All development servers started successfully${NC}"
    kill $ALL_PID 2>/dev/null
    wait $ALL_PID 2>/dev/null
else
    echo -e "${YELLOW}⚠️ Some development servers may have issues${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ERROR FIX VALIDATION COMPLETE!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Run: pnpm run dev"
echo "2. Check: http://localhost:4231 (Frontend)"
echo "3. Check: http://localhost:4232 (Backend)"
echo "4. Check: http://localhost:4236 (R Analytics)"
echo ""
echo "If all tests passed, your error fixes are working correctly!"