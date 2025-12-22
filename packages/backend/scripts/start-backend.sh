#!/bin/bash
# packages/backend/src/scripts/start-backend.sh
# ✅ Backend Startup Script with Health Checks

set -e

echo "🚀 IFRS9 Platform Backend Startup Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ROOT="$(cd "${BACKEND_DIR}/../.." && pwd)"
LOG_FILE="${BACKEND_DIR}/logs/startup.log"

# Create logs directory if it doesn't exist
mkdir -p "${BACKEND_DIR}/logs"

echo "📍 Project paths:"
echo "   Backend: ${BACKEND_DIR}"
echo "   Project Root: ${PROJECT_ROOT}"
echo ""

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "info")
            echo -e "${BLUE}ℹ️  ${message}${NC}"
            ;;
        "success")
            echo -e "${GREEN}✅ ${message}${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  ${message}${NC}"
            ;;
        "error")
            echo -e "${RED}❌ ${message}${NC}"
            ;;
    esac
}

# Check if Node.js is installed
check_node() {
    print_status "info" "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_status "error" "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    local node_version=$(node --version)
    print_status "success" "Node.js ${node_version} is installed"
}

# Check if pnpm is installed
check_pnpm() {
    print_status "info" "Checking pnpm installation..."
    if ! command -v pnpm &> /dev/null; then
        print_status "error" "pnpm is not installed. Installing pnpm..."
        npm install -g pnpm
    fi
    
    local pnpm_version=$(pnpm --version)
    print_status "success" "pnpm ${pnpm_version} is available"
}

# Check if PostgreSQL is running
check_postgres() {
    print_status "info" "Checking PostgreSQL connection..."
    if pg_isready -h localhost -p 5432 -U postgres >/dev/null 2>&1; then
        print_status "success" "PostgreSQL is running and accessible"
    else
        print_status "warning" "PostgreSQL connection failed. Please ensure PostgreSQL is running."
        print_status "info" "Expected connection: localhost:5432 with user 'postgres'"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "info" "Installing backend dependencies..."
    cd "${BACKEND_DIR}"
    
    if [ ! -d "node_modules" ]; then
        print_status "info" "Installing packages with pnpm..."
        pnpm install
        print_status "success" "Dependencies installed successfully"
    else
        print_status "success" "Dependencies already installed"
    fi
}

# Build TypeScript
build_typescript() {
    print_status "info" "Building TypeScript..."
    cd "${BACKEND_DIR}"
    
    if [ -f "tsconfig.json" ]; then
        pnpm run build || npm run build || npx tsc
        print_status "success" "TypeScript compilation completed"
    else
        print_status "warning" "No tsconfig.json found, skipping TypeScript build"
    fi
}

# Start the backend server
start_server() {
    print_status "info" "Starting IFRS9 Platform Backend..."
    cd "${BACKEND_DIR}"
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_status "warning" ".env file not found. Using default environment variables."
    fi
    
    # Start server based on available scripts
    if [ -f "package.json" ] && pnpm run --silent dev >/dev/null 2>&1; then
        print_status "info" "Starting with development server..."
        pnpm run dev
    elif [ -f "src/server.ts" ]; then
        print_status "info" "Starting with ts-node..."
        npx ts-node src/server.ts
    elif [ -f "dist/server.js" ]; then
        print_status "info" "Starting compiled JavaScript..."
        node dist/server.js
    else
        print_status "error" "No suitable startup method found"
        exit 1
    fi
}

# Health check function
health_check() {
    local max_attempts=30
    local attempt=1
    local port=${PORT:-4232}
    
    print_status "info" "Waiting for server to start on port ${port}..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:${port}/health" >/dev/null 2>&1; then
            print_status "success" "Server is running and healthy!"
            curl -s "http://localhost:${port}/" | jq -r '.message // "IFRS9 Platform Backend"' 2>/dev/null || echo "IFRS9 Platform Backend"
            echo ""
            print_status "info" "API Endpoints:"
            echo "   Health Check: http://localhost:${port}/health"
            echo "   API Info: http://localhost:${port}/api/v1"
            echo "   Login: POST http://localhost:${port}/api/v1/auth/login"
            echo ""
            print_status "info" "Demo Login:"
            echo '   curl -X POST http://localhost:'"${port}"'/api/v1/auth/login \'
            echo '     -H "Content-Type: application/json" \'
            echo '     -d '"'"'{"email":"superadmin@ifrs9platform.com","password":"1019181716"}'"'"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    print_status "error" "Server failed to start or is not responding"
    return 1
}

# Main execution
main() {
    echo "🔍 Pre-flight checks..."
    check_node
    check_pnpm
    check_postgres
    
    echo ""
    echo "📦 Setup phase..."
    install_dependencies
    
    echo ""
    echo "🏗️ Build phase..."
    build_typescript
    
    echo ""
    echo "🚀 Launch phase..."
    
    # Start server in background for health check
    if [ "$1" = "--check" ]; then
        start_server &
        local server_pid=$!
        
        # Wait a moment for server to initialize
        sleep 3
        
        # Run health check
        if health_check; then
            print_status "success" "Backend startup completed successfully!"
            kill $server_pid 2>/dev/null || true
        else
            print_status "error" "Backend startup failed health check"
            kill $server_pid 2>/dev/null || true
            exit 1
        fi
    else
        # Normal startup
        start_server
    fi
}

# Handle script arguments
case "$1" in
    "--check")
        main --check
        ;;
    "--help")
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --check    Start server and run health check, then exit"
        echo "  --help     Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                 # Start server normally"
        echo "  $0 --check        # Start, health check, then exit"
        ;;
    *)
        main
        ;;
esac