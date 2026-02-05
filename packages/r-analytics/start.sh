#!/bin/bash

# =============================================================================
# R ANALYTICS START SCRIPT WITH LIVE LOGS
# =============================================================================
# Purpose: Start R Analytics service and display live logs
# Author: IAF Development Team
# Date: 2025-01-13
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_DIR="${SCRIPT_DIR}/shiny-app"
LOG_DIR="${APP_DIR}/logs"

# Log files
APP_LOG="${LOG_DIR}/ifrs9_app.log"
ERROR_LOG="${LOG_DIR}/ifrs9_error.log"
MODEL_LOG="${LOG_DIR}/ifrs9_model.log"
DATA_LOG="${LOG_DIR}/ifrs9_data.log"

# Port configuration
R_PORT=${R_PORT:-4236}

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to kill process using port
kill_process_on_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null)

    if [[ -n "$pids" ]]; then
        print_warning "Found processes using port $port:"
        lsof -Pi :$port -sTCP:LISTEN

        print_info "Killing processes on port $port..."

        # Kill all processes using the port
        echo "$pids" | xargs -r kill -9 2>/dev/null

        # Wait for processes to be killed
        sleep 2

        # Verify port is now free
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_error "Failed to kill processes on port $port"
            return 1
        else
            print_success "Successfully killed processes on port $port"
            return 0
        fi
    else
        print_info "No processes found using port $port"
        return 0
    fi
}

# Function to kill all existing R Analytics processes
kill_r_analytics_processes() {
    print_info "Killing existing R Analytics processes..."

    # Kill all R processes for this specific port
    local r_pids=$(pgrep -f "R.*app.R.*${R_PORT}" 2>/dev/null || true)
    if [[ -n "$r_pids" ]]; then
        print_warning "Found R Analytics processes on port ${R_PORT}:"
        echo "$r_pids"
        print_info "Killing R Analytics processes..."
        echo "$r_pids" | xargs -r kill -TERM 2>/dev/null || true
        sleep 2
        # Force kill if still running
        r_pids=$(pgrep -f "R.*app.R.*${R_PORT}" 2>/dev/null || true)
        if [[ -n "$r_pids" ]]; then
            echo "$r_pids" | xargs -r kill -9 2>/dev/null || true
        fi
        print_success "Killed R Analytics processes"
    fi

    # Clean up PID files
    local pid_file="/tmp/r-analytics-singleton-${R_PORT}.pid"
    if [[ -f "$pid_file" ]]; then
        rm -f "$pid_file"
        print_info "Removed stale PID file: $pid_file"
    fi

    # Kill tail processes
    local tail_pids=$(pgrep -f "tail.*r-analytics" 2>/dev/null || true)
    if [[ -n "$tail_pids" ]]; then
        echo "$tail_pids" | xargs -r kill -9 2>/dev/null || true
        print_info "Killed tail processes"
    fi

    # Kill tee processes
    local tee_pids=$(pgrep -f "tee.*r-analytics" 2>/dev/null || true)
    if [[ -n "$tee_pids" ]]; then
        echo "$tee_pids" | xargs -r kill -9 2>/dev/null || true
        print_info "Killed tee processes"
    fi
}

# Function to check and prepare port
check_port() {
    # Kill any existing R Analytics processes first
    kill_r_analytics_processes

    # Kill any remaining processes on the port
    if ! kill_process_on_port $R_PORT; then
        print_error "Could not free up port $R_PORT"
        exit 1
    fi

    # Double check that port is now available
    if lsof -Pi :$R_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Port $R_PORT is still in use after cleanup"
        exit 1
    else
        print_success "Port $R_PORT is now available"
    fi
}

# Function to create log directory
setup_logs() {
    mkdir -p "${LOG_DIR}"

    # Clear old logs but keep backup
    if [[ -f "${APP_LOG}" ]]; then
        cp "${APP_LOG}" "${APP_LOG}.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    print_info "Log directory: ${LOG_DIR}"
}

# Function to start R Analytics with live logs
start_r_analytics() {
    print_info "Starting R Analytics service on port ${R_PORT}..."
    print_info "Working directory: ${APP_DIR}"
    print_info "Press Ctrl+C to stop the service"

    # Change to app directory
    cd "${APP_DIR}"

    # Create a combined log output file
    COMBINED_LOG="${LOG_DIR}/r-analytics-combined.log"

    # Clear old combined log to avoid file truncation messages
    if [[ -f "${COMBINED_LOG}" ]]; then
      > "${COMBINED_LOG}"
    fi

    # Start the R service with tee for live output
    print_info "Starting R Shiny application..."

    # Trap to ensure clean shutdown
    trap 'print_info "Stopping R Analytics service..."; kill $R_PID 2>/dev/null; print_success "R Analytics service stopped"; exit 0' INT TERM

    # Start R script in background and capture logs
    Rscript app.R 2>&1 | tee "${COMBINED_LOG}" &
    R_PID=$!

    # Wait a moment to check if service started successfully
    sleep 3

    # Check if process is still running
    if kill -0 $R_PID 2>/dev/null; then
        print_success "R Analytics service started successfully (PID: $R_PID)"
        print_success "Service running at: http://localhost:${R_PORT}"
        print_info "Combined log file: ${COMBINED_LOG}"
        print_info "Watching logs... (Press Ctrl+C to stop)"
        echo

        # Check if there's already a tail process for this log file
        EXISTING_TAIL_PID=$(pgrep -f "tail.*${COMBINED_LOG}" || true)
        if [[ -n "$EXISTING_TAIL_PID" ]]; then
            print_warning "Found existing tail process for log file, will reuse it"
            TAIL_PID=$EXISTING_TAIL_PID
        else
            # Show live logs from the combined log file
            tail -f "${COMBINED_LOG}" &
            TAIL_PID=$!
        fi

        # Wait for the R process to finish
        wait $R_PID

        # Clean up tail process
        kill $TAIL_PID 2>/dev/null
    else
        print_error "R Analytics service failed to start"
        print_error "Check the log file: ${COMBINED_LOG}"
        exit 1
    fi
}

# Function to show service status
show_status() {
    print_info "Checking R Analytics service status..."

    if lsof -Pi :$R_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_success "R Analytics is running on port ${R_PORT}"
        print_info "Process details:"
        lsof -Pi :$R_PORT -sTCP:LISTEN
        print_info "Web interface: http://localhost:${R_PORT}"
    else
        print_warning "R Analytics is not running"
    fi
}

# Main execution
main() {
    echo "=============================================================================="
    echo "🚀 IAF R ANALYTICS START SCRIPT WITH LIVE LOGS"
    echo "=============================================================================="
    echo "📁 Working Directory: ${PROJECT_ROOT}"
    echo "🌐 Port: ${R_PORT}"
    echo "📝 Log Directory: ${LOG_DIR}"
    echo "=============================================================================="

    # Check if we're in the right directory
    if [[ ! -f "${APP_DIR}/app.R" ]]; then
        print_error "app.R not found in ${APP_DIR}"
        print_error "Please ensure you're running this from the correct directory"
        exit 1
    fi

    # Setup
    setup_logs

    # Kill existing R Analytics processes to prevent duplicates
    kill_r_analytics_processes

    # Kill any existing processes on the port and prepare it
    check_port

    # Show current status before starting
    echo ""
    print_info "Starting new R Analytics service..."

    # Start the service
    start_r_analytics
}

# Run main function
main "$@"