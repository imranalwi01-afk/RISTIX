#!/bin/bash
# =============================================================================
# R ANALYTICS CENTRAL MANAGER
# =============================================================================
# Purpose: Centralized management for IAF R Analytics services
# Usage: ./r-analytics-manager.sh [start|stop|restart|status|auth|diag|test|cleanup]
# =============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHINY_APP_DIR="${SCRIPT_DIR}/shiny-app"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

print_usage() {
    echo "R Analytics Central Manager"
    echo "=========================="
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start    Start R Analytics service"
    echo "  stop     Stop R Analytics service"
    echo "  restart  Restart R Analytics service"
    echo "  status   Check R Analytics service status"
    echo "  auth     Authentication management (enable/disable/status)"
    echo "  diag     Run diagnostics and health checks"
    echo "  test     Run comprehensive tests"
    echo "  cleanup  Clean up logs and temporary files"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start service"
    echo "  $0 auth status             # Check auth status"
    echo "  $0 auth disable            # Disable authentication"
    echo "  $0 restart                 # Restart service"
    echo ""
    echo "Current Working Directory: $SCRIPT_DIR"
    echo "Shiny App Directory: $SHINY_APP_DIR"
}

check_directories() {
    if [ ! -d "$SHINY_APP_DIR" ]; then
        echo -e "${RED}❌ Shiny app directory not found: $SHINY_APP_DIR${NC}"
        exit 1
    fi

    if [ ! -f "$SHINY_APP_DIR/app.R" ]; then
        echo -e "${RED}❌ app.R not found in $SHINY_APP_DIR${NC}"
        exit 1
    fi

    if [ ! -f "$SHINY_APP_DIR/start_iaf.R" ]; then
        echo -e "${RED}❌ start_iaf.R not found in $SHINY_APP_DIR${NC}"
        exit 1
    fi

    if [ ! -f "$SCRIPT_DIR/start-iaf-analytics.sh" ]; then
        echo -e "${RED}❌ Main startup script not found: $SCRIPT_DIR/start-iaf-analytics.sh${NC}"
        exit 1
    fi
}

start_service() {
    echo -e "${CYAN}🚀 Starting R Analytics Service...${NC}"
    check_directories

    cd "$SCRIPT_DIR"
    ./start-iaf-analytics.sh

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ R Analytics service started successfully${NC}"
        echo -e "${CYAN}🌐 Access: https://ifrs9-iaf-analytics.ifrspro.id${NC}"
        echo -e "${CYAN}🔧 Auth: ./r-analytics-manager.sh auth status${NC}"
    else
        echo -e "${RED}❌ Failed to start R Analytics service${NC}"
        exit 1
    fi
}

stop_service() {
    echo -e "${YELLOW}🛑 Stopping R Analytics Service...${NC}"

    if [ -f "$SCRIPT_DIR/stop-all-services.sh" ]; then
        cd "$SCRIPT_DIR"
        ./stop-all-services.sh
        echo -e "${GREEN}✅ R Analytics service stopped${NC}"
    else
        echo -e "${RED}❌ Stop script not found${NC}"
        exit 1
    fi
}

restart_service() {
    echo -e "${PURPLE}🔄 Restarting R Analytics Service...${NC}"

    # CRITICAL FIX: Clear logs before restart as requested by user
    echo -e "${YELLOW}🧹 Clearing logs before restart...${NC}"
    clear_logs_only

    stop_service
    sleep 2
    start_service
}

check_status() {
    echo -e "${BLUE}📊 R Analytics Service Status${NC}"
    echo "================================"

    # Check if main process is running
    if [ -f "$SCRIPT_DIR/iaf-analytics.pid" ]; then
        PID=$(cat "$SCRIPT_DIR/iaf-analytics.pid")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Main Service: RUNNING (PID: $PID)${NC}"

            # Get process details
            echo "   Command: $(ps -p $PID -o cmd=)"
            echo "   Memory: $(ps -p $PID -o rss= | tail -1 | awk '{print $1/1024 "MB"}')"
            echo "   CPU: $(ps -p $PID -o %cpu= | tail -1)"
        else
            echo -e "${RED}❌ Main Service: NOT RUNNING (stale PID file)${NC}"
            rm -f "$SCRIPT_DIR/iaf-analytics.pid"
        fi
    else
        echo -e "${RED}❌ Main Service: NOT RUNNING${NC}"
    fi

    # Check port status
    echo ""
    echo "Port Status:"
    if netstat -tlnp 2>/dev/null | grep -q ":4236"; then
        echo -e "${GREEN}✅ Port 4236 (Dashboard): IN USE${NC}"
        PID_PORT=$(lsof -ti :4236 2>/dev/null)
        echo "   Process PID: $PID_PORT"
    else
        echo -e "${RED}❌ Port 4236 (Dashboard): FREE${NC}"
    fi

    if netstat -tlnp 2>/dev/null | grep -q ":4241"; then
        echo -e "${GREEN}✅ Port 4241 (Calc API): IN USE${NC}"
        PID_PORT=$(lsof -ti :4241 2>/dev/null)
        echo "   Process PID: $PID_PORT"
    else
        echo -e "${RED}❌ Port 4241 (Calc API): FREE${NC}"
    fi

    # Check authentication status
    echo ""
    if [ -f "$SCRIPT_DIR/auth-manager.sh" ]; then
        cd "$SCRIPT_DIR"
        ./auth-manager.sh status
    fi

    # Check logs
    echo ""
    echo "Recent Logs:"
    if [ -d "$SCRIPT_DIR/logs" ]; then
        echo "   Log directory: $SCRIPT_DIR/logs"
        echo "   Latest log: $(ls -t "$SCRIPT_DIR/logs"/*.log 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "No logs found")"
        echo "   Log size: $(du -sh "$SCRIPT_DIR/logs" 2>/dev/null | cut -f1 || echo "Unknown")"
    else
        echo -e "${YELLOW}⚠️  Log directory not found${NC}"
    fi
}

run_diagnostics() {
    echo -e "${CYAN}🔍 Running R Analytics Diagnostics...${NC}"

    if [ -f "$SCRIPT_DIR/r-diagnostic.sh" ]; then
        cd "$SCRIPT_DIR"
        ./r-diagnostic.sh
    else
        echo -e "${RED}❌ Diagnostic script not found${NC}"
        exit 1
    fi
}

run_tests() {
    echo -e "${PURPLE}🧪 Running R Analytics Tests...${NC}"

    if [ -f "$SCRIPT_DIR/test-r-analytics.sh" ]; then
        cd "$SCRIPT_DIR"
        ./test-r-analytics.sh
    else
        echo -e "${RED}❌ Test script not found${NC}"
        exit 1
    fi
}

manage_auth() {
    if [ -z "$2" ]; then
        echo "Usage: $0 auth [enable|disable|status]"
        exit 1
    fi

    case "$2" in
        "enable"|"disable"|"status")
            if [ -f "$SCRIPT_DIR/auth-manager.sh" ]; then
                cd "$SCRIPT_DIR"
                ./auth-manager.sh "$2"
            else
                echo -e "${RED}❌ Authentication manager script not found${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}❌ Invalid authentication command: $2${NC}"
            echo "Available: enable, disable, status"
            exit 1
            ;;
    esac
}

clear_logs_only() {
    # CRITICAL FIX: Function to clear only log files (as requested by user)
    echo -e "${YELLOW}🧹 Clearing R Analytics log files...${NC}"

    # Clear main logs directory
    if [ -d "$SCRIPT_DIR/logs" ]; then
        LOG_COUNT=$(find "$SCRIPT_DIR/logs" -name "*.log" | wc -l)
        if [ "$LOG_COUNT" -gt 0 ]; then
            rm -f "$SCRIPT_DIR/logs"/*.log
            echo -e "${GREEN}✅ Cleared $LOG_COUNT log files from main logs directory${NC}"
        else
            echo -e "${BLUE}ℹ️  No log files to clear in main logs directory${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  Main logs directory not found${NC}"
    fi

    # Clear shiny-app logs directory
    if [ -d "$SHINY_APP_DIR/logs" ]; then
        SHINY_LOG_COUNT=$(find "$SHINY_APP_DIR/logs" -name "*.log" | wc -l)
        if [ "$SHINY_LOG_COUNT" -gt 0 ]; then
            rm -f "$SHINY_APP_DIR/logs"/*.log
            echo -e "${GREEN}✅ Cleared $SHINY_LOG_COUNT log files from shiny-app logs directory${NC}"
        else
            echo -e "${BLUE}ℹ️  No log files to clear in shiny-app logs directory${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  Shiny-app logs directory not found${NC}"
    fi

    echo -e "${GREEN}✅ Log clearing completed${NC}"
}

cleanup_files() {
    echo -e "${YELLOW}🧹 Cleaning up R Analytics files...${NC}"

    # Remove log files (using the dedicated function)
    clear_logs_only

    # Remove PID files
    if [ -f "$SCRIPT_DIR/iaf-analytics.pid" ]; then
        rm -f "$SCRIPT_DIR/iaf-analytics.pid"
        echo -e "${GREEN}✅ Removed stale PID file${NC}"
    fi

    if [ -f "$SCRIPT_DIR/iaf-calc.pid" ]; then
        rm -f "$SCRIPT_DIR/iaf-calc.pid"
        echo -e "${GREEN}✅ Removed calc PID file${NC}"
    fi

    # Remove temporary R files
    cd "$SHINY_APP_DIR"
    TEMP_FILES=("iaf_analytics_app.R" "iaf_calc_api.R" "*.RData" "*.Rhistory")

    for pattern in "${TEMP_FILES[@]}"; do
        COUNT=$(ls $pattern 2>/dev/null | wc -l)
        if [ "$COUNT" -gt 0 ]; then
            rm -f $pattern
            echo -e "${GREEN}✅ Removed $COUNT temporary files ($pattern)${NC}"
        fi
    done

    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main script logic
COMMAND="${1:-help}"

case "$COMMAND" in
    "start")
        start_service
        ;;
    "stop")
        stop_service
        ;;
    "restart")
        restart_service
        ;;
    "status")
        check_status
        ;;
    "auth")
        manage_auth "$@"
        ;;
    "diag"|"diagnostic")
        run_diagnostics
        ;;
    "test")
        run_tests
        ;;
    "cleanup")
        cleanup_files
        ;;
    "help"|"-h"|"--help")
        print_usage
        ;;
    *)
        echo -e "${RED}❌ Invalid command: $COMMAND${NC}"
        echo ""
        print_usage
        exit 1
        ;;
esac