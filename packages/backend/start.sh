#!/bin/bash
# packages/backend/start.sh
# ============================================================================
# 🚀 BACKEND STARTUP SCRIPT WITH PORT CLEANUP
# ============================================================================
# ✅ FEATURE: Automatically kills any service running on port 4232
# ✅ FEATURE: Starts Express.js backend development server
# ============================================================================

echo "🚀 Starting Backend Development Server..."
echo "📍 Target Port: 4232"

# Function to kill process on specific port (comprehensive)
kill_port() {
    local port=$1
    echo "🔍 Checking for existing services on port $port..."
    
    # Method 1: Find processes using lsof with multiple patterns
    local pids1=$(lsof -ti:$port 2>/dev/null)
    local pids2=$(lsof -ti tcp:$port 2>/dev/null) 
    local pids3=$(lsof -ti udp:$port 2>/dev/null)
    
    # Method 2: Find processes using netstat and extract PIDs
    local pids4=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | grep -E '^[0-9]+$')
    
    # Method 3: Find processes using ss command
    local pids5=$(ss -tlnp 2>/dev/null | grep ":$port " | sed 's/.*pid=\([0-9]*\).*/\1/')
    
    # Combine all PIDs and remove duplicates
    local all_pids="$pids1 $pids2 $pids3 $pids4 $pids5"
    local unique_pids=$(echo "$all_pids" | tr ' ' '\n' | grep -E '^[0-9]+$' | sort -u | tr '\n' ' ')
    
    if [ ! -z "$unique_pids" ]; then
        echo "⚡ Found service(s) running on port $port"
        for pid in $unique_pids; do
            if [ ! -z "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                echo "🔪 Killing process $pid..."
                kill -9 "$pid" 2>/dev/null || sudo kill -9 "$pid" 2>/dev/null
            fi
        done
        
        # Wait and verify
        sleep 3
        
        # Final verification using multiple methods
        local still_running1=$(lsof -ti:$port 2>/dev/null)
        local still_running2=$(netstat -tlnp 2>/dev/null | grep ":$port ")
        local still_running3=$(ss -tlnp 2>/dev/null | grep ":$port ")
        
        if [ -z "$still_running1" ] && [ -z "$still_running2" ] && [ -z "$still_running3" ]; then
            echo "✅ Successfully killed all services on port $port"
        else
            echo "❌ Some processes may still be running on port $port"
            echo "🔧 Manual cleanup may be required"
            
            # Show what's still running
            echo "📋 Processes still using port $port:"
            lsof -i:$port 2>/dev/null || echo "  None found via lsof"
            netstat -tlnp 2>/dev/null | grep ":$port" || echo "  None found via netstat"
        fi
    else
        echo "✅ Port $port is available"
    fi
}

# Kill any existing service on port 4232
kill_port 4232

echo ""
echo "🚀 Starting Express.js development server..."
echo "🔗 Backend API will be available at: http://localhost:4232"
echo "📚 API Documentation: http://localhost:4232/api/v1"
echo "⏰ Starting in 3 seconds..."
sleep 3

# Parse argument for environment
TARGET_ENV=${1:-local} # Default to 'local' if no argument provided

echo "🌍 Target Environment: $TARGET_ENV"

# Execute corresponding pnpm script
case "$TARGET_ENV" in
    "vps")
        echo "📡 Connecting to VPS Environment..."
        pnpm dev:vps
        ;;
    "iaf")
        echo "🏢 Connecting to IAF Tenant Environment..."
        pnpm dev:iaf
        ;;
    "local")
        echo "🏠 Connecting to Local Environment..."
        pnpm dev:local
        ;;
    *)
        echo "⚠️  Unknown environment: $TARGET_ENV"
        echo "   Usage: ./start.sh [local|iaf|vps]"
        echo "   Defaulting to 'local'..."
        pnpm dev:local
        ;;
esac