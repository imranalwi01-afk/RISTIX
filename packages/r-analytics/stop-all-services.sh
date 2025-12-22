#!/bin/bash
# Stop All IAF R Analytics Services
# This script stops both the main dashboard (4236) and calculation API (4241)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARD_PID_FILE="${SCRIPT_DIR}/iaf-analytics.pid"
CALC_PID_FILE="${SCRIPT_DIR}/iaf-calc.pid"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

echo "${LOG_PREFIX} 🛑 Stopping All IAF R Analytics Services..."

# Stop Dashboard Service (Port 4236)
if [ -f "$DASHBOARD_PID_FILE" ]; then
    echo "${LOG_PREFIX} 📊 Stopping Dashboard Service (Port 4236)..."
    DASHBOARD_PID=$(cat "$DASHBOARD_PID_FILE")
    
    if kill -0 $DASHBOARD_PID 2>/dev/null; then
        kill -TERM $DASHBOARD_PID 2>/dev/null
        
        # Wait for graceful shutdown
        for i in {1..10}; do
            if ! kill -0 $DASHBOARD_PID 2>/dev/null; then
                echo "${LOG_PREFIX} ✅ Dashboard service stopped gracefully"
                break
            fi
            sleep 1
        done
        
        # Force kill if still running
        if kill -0 $DASHBOARD_PID 2>/dev/null; then
            kill -9 $DASHBOARD_PID 2>/dev/null
            echo "${LOG_PREFIX} ⚠️  Dashboard service force stopped"
        fi
    fi
    
    rm -f "$DASHBOARD_PID_FILE"
else
    echo "${LOG_PREFIX} ⚠️  Dashboard PID file not found"
fi

# Stop Calculation Service (Port 4241)
if [ -f "$CALC_PID_FILE" ]; then
    echo "${LOG_PREFIX} 🧮 Stopping Calculation Service (Port 4241)..."
    CALC_PID=$(cat "$CALC_PID_FILE")
    
    if kill -0 $CALC_PID 2>/dev/null; then
        kill -TERM $CALC_PID 2>/dev/null
        
        # Wait for graceful shutdown
        for i in {1..10}; do
            if ! kill -0 $CALC_PID 2>/dev/null; then
                echo "${LOG_PREFIX} ✅ Calculation service stopped gracefully"
                break
            fi
            sleep 1
        done
        
        # Force kill if still running
        if kill -0 $CALC_PID 2>/dev/null; then
            kill -9 $CALC_PID 2>/dev/null
            echo "${LOG_PREFIX} ⚠️  Calculation service force stopped"
        fi
    fi
    
    rm -f "$CALC_PID_FILE"
else
    echo "${LOG_PREFIX} ⚠️  Calculation PID file not found"
fi

# Clean up any remaining processes on both ports
echo "${LOG_PREFIX} 🧹 Cleaning up remaining processes..."

# Clean up port 4236
if netstat -tlnp 2>/dev/null | grep -q :4236; then
    echo "${LOG_PREFIX} 🧹 Cleaning up port 4236..."
    port_pid=$(lsof -ti :4236 2>/dev/null)
    if [ -n "$port_pid" ]; then
        kill -9 $port_pid 2>/dev/null || true
        echo "${LOG_PREFIX} ✅ Cleaned up port 4236"
    fi
fi

# Clean up port 4241
if netstat -tlnp 2>/dev/null | grep -q :4241; then
    echo "${LOG_PREFIX} 🧹 Cleaning up port 4241..."
    port_pid=$(lsof -ti :4241 2>/dev/null)
    if [ -n "$port_pid" ]; then
        kill -9 $port_pid 2>/dev/null || true
        echo "${LOG_PREFIX} ✅ Cleaned up port 4241"
    fi
fi

# Clean up generated R files
echo "${LOG_PREFIX} 🧹 Cleaning up temporary R files..."
rm -f "${SCRIPT_DIR}/iaf_analytics_app.R"
rm -f "${SCRIPT_DIR}/iaf_calc_api.R"

echo ""
echo "${LOG_PREFIX} 🎉 All IAF R Analytics Services stopped successfully!"
echo "${LOG_PREFIX} =================================="
echo "${LOG_PREFIX} 📊 Port 4236: Dashboard - STOPPED"
echo "${LOG_PREFIX} 🧮 Port 4241: Calculation API - STOPPED"
echo "${LOG_PREFIX} 🧹 Temporary files cleaned up"
echo "${LOG_PREFIX} =================================="