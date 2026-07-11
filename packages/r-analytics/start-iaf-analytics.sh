#!/bin/bash
# IAF R Analytics Startup Script - Smart Environment Configuration
# Starts IAF R Analytics with seamless LOCALDEV/IAFECS environment switching

set -e

LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SHINY_APP_DIR="${SCRIPT_DIR}/shiny-app"
LOGS_DIR="${SCRIPT_DIR}/logs"
PID_FILE="${SCRIPT_DIR}/iaf-analytics.pid"
LOG_FILE="${LOGS_DIR}/iaf-analytics.log"

# =============================================================================
# 🚀 SMART ENVIRONMENT CONFIGURATION - SEAMLESS LOCALDEV/IAFECS SWITCHING
# =============================================================================
# Purpose: Auto-detect and load correct environment configuration for R Analytics
# Supports: LOCALDEV (localhost) and IAFECS (Alibaba Cloud ECS)
# Usage: DEPLOYMENT_TARGET=localdev|iafecs or automatic detection
# =============================================================================

echo "${LOG_PREFIX} 🔧 IAF R Analytics Smart Environment Loader - Auto-detecting..."

# Function to detect deployment target
detect_deployment_target() {
    # Priority 1: Check explicit environment variable (RESPECT USER SETTING)
    if [ -n "$DEPLOYMENT_TARGET" ]; then
        echo "$DEPLOYMENT_TARGET"
        return
    fi

    # Priority 2: Check if .env.localdev exists (LOCAL DEVELOPMENT PRIORITY)
    if [ -f "${PROJECT_ROOT}/.env.localdev" ]; then
        echo "localdev"
        return
    fi

    # Priority 3: Check if running on Alibaba Cloud ECS
    if [ -f "/etc/ecs/ecs.config" ] || [ -n "$ECS_CONTAINER_METADATA_URI" ] || \
       [ -n "$AWS_EXECUTION_ENV" ] && [ "$AWS_EXECUTION_ENV" = "ECS" ] || \
       hostname | grep -q "ecs\|alibaba\|10\.18"; then
        echo "iafecs"
        return
    fi

    # Priority 4: Check if .env.iafecs exists (indicates ECS deployment)
    if [ -f "${PROJECT_ROOT}/.env.iafecs" ]; then
        echo "iafecs"
        return
    fi

    # Priority 5: Default to local development
    echo "localdev"
}

# Function to load environment configuration
load_environment_config() {
    local deployment_target=$1
    echo "${LOG_PREFIX} 🎯 Detected R Analytics deployment target: ${deployment_target}"

    # Load appropriate environment file
    local env_file="${PROJECT_ROOT}/.env.${deployment_target}"
    if [ -f "$env_file" ]; then
        echo "${LOG_PREFIX} ✅ Loading environment file: .env.${deployment_target}"
        set -a
        source "$env_file"
        set +a
    else
        echo "${LOG_PREFIX} ⚠️ Environment file not found: ${env_file}"
    fi

    # Also load base .env file if it exists
    if [ -f "${PROJECT_ROOT}/.env" ]; then
        echo "${LOG_PREFIX} ✅ Loading base environment file: .env"
        set -a
        source "${PROJECT_ROOT}/.env"
        set +a
    fi

    # Load R Analytics authentication configuration
    local auth_config_file="${SCRIPT_DIR}/config/auth.env"
    if [ -f "$auth_config_file" ]; then
        echo "${LOG_PREFIX} ✅ Loading R Analytics authentication configuration"
        set -a
        source "$auth_config_file"
        set +a
    else
        echo "${LOG_PREFIX} ⚠️ R Analytics auth config not found: ${auth_config_file}"
    fi
}

# Function to get configuration value
get_config() {
    local key=$1
    local default_value=$2
    local value="${!key}"
    echo "${value:-$default_value}"
}

# Detect and load configuration
DEPLOYMENT_TARGET=$(detect_deployment_target)
load_environment_config "$DEPLOYMENT_TARGET"

# Export R-specific environment variables based on configuration
export R_PORT=$(get_config "R_ANALYTICS_PORT" "4236")
export R_SERVICE_PORT=$(get_config "R_SERVICE_PORT" "4241")
export R_HOST=$(get_config "R_ANALYTICS_HOST" "0.0.0.0")
export NODE_ENV=$(get_config "NODE_ENV" "development")

# Database configuration for R - Following IAF local production guide
export DB_HOST=$(get_config "LEGACY_DB_HOST" "192.168.0.106")
export DB_PORT=$(get_config "LEGACY_DB_PORT" "5433")
export DB_USER=$(get_config "LEGACY_DB_USER" "postgres")
export DB_PASSWORD=$(get_config "LEGACY_DB_PASSWORD" "postgres")
export DB_NAME=$(get_config "LEGACY_DB_NAME" "FRS9PRO")
export DB_SCHEMA=$(get_config "LEGACY_DB_SCHEMA" "public")

# IAF-specific configuration
export BANKING_TYPE=$(get_config "BANKING_TYPE" "conventional")
export TENANT_SLUG=$(get_config "TENANT_SLUG" "iaf")
export COMPANY_NAME=$(get_config "COMPANY_NAME" "Indonesia Airawata Finance")

# API URLs for R service integration
export BACKEND_URL=$(get_config "BACKEND_URL" "https://iaf-ifrs-be.ifrspro.id")
export API_BASE_URL=$(get_config "API_BASE_URL" "https://iaf-ifrs-be.ifrspro.id/api")

# R Analytics URLs
if [ "$DEPLOYMENT_TARGET" = "iafecs" ]; then
    export R_ANALYTICS_URL="https://analytics-ristix.bdo-ki.com"
    export R_API_URL="https://analytics-calc-ristix.bdo-ki.com"
else
    export R_ANALYTICS_URL="https://iaf-ifrs-analytics.ifrspro.id"
    export R_API_URL="https://iaf-ifrs-analytics-calc.ifrspro.id"
fi

# Silent configuration loading - only show in debug mode
if [ "$R_ANALYTICS_DEBUG_MODE" = "true" ]; then
  echo "${LOG_PREFIX} 📊 R Analytics Configuration Summary:"
  echo "${LOG_PREFIX}   Deployment Target: $DEPLOYMENT_TARGET"
  echo "${LOG_PREFIX}   R Port: $R_PORT"
  echo "${LOG_PREFIX}   R Service Port: $R_SERVICE_PORT"
  echo "${LOG_PREFIX}   Database: $DB_HOST:$DB_PORT/$DB_NAME"
  echo "${LOG_PREFIX}   DB Schema: $DB_SCHEMA"
  echo "${LOG_PREFIX}   Banking Type: $BANKING_TYPE"
  echo "${LOG_PREFIX}   Tenant: $TENANT_SLUG"
  echo "${LOG_PREFIX}   Authentication Enabled: $R_ANALYTICS_AUTH_ENABLED"
  echo "${LOG_PREFIX}   Development Mode: $R_ANALYTICS_DEV_MODE"
  echo "${LOG_PREFIX}   Auth Bypass in Dev: $R_ANALYTICS_DEV_BYPASS_AUTH"
  echo "${LOG_PREFIX}   IAF Integration: $R_ANALYTICS_IAF_INTEGRATION"
  echo "${LOG_PREFIX}   R Analytics URL: $R_ANALYTICS_URL"
  echo "${LOG_PREFIX}   R API URL: $R_API_URL"
fi

echo "${LOG_PREFIX} 🚀 Starting IAF R Analytics Service"
echo "============================================================"

# Create directories if they don't exist
mkdir -p "${LOGS_DIR}"

# CRITICAL FIX: Clear existing logs before startup (as requested by user)
echo "${LOG_PREFIX} 🧹 Clearing existing logs before startup..."
if [ -d "${LOGS_DIR}" ]; then
    LOG_COUNT=$(find "${LOGS_DIR}" -name "*.log" | wc -l)
    if [ "$LOG_COUNT" -gt 0 ]; then
        rm -f "${LOGS_DIR}"/*.log
        echo "${LOG_PREFIX} ✅ Cleared $LOG_COUNT existing log files"
    else
        echo "${LOG_PREFIX} ℹ️  No existing log files to clear"
    fi
fi

# Also clear shiny-app logs
SHINY_LOGS_DIR="${SHINY_APP_DIR}/logs"
if [ -d "$SHINY_LOGS_DIR" ]; then
    SHINY_LOG_COUNT=$(find "$SHINY_LOGS_DIR" -name "*.log" | wc -l)
    if [ "$SHINY_LOG_COUNT" -gt 0 ]; then
        rm -f "$SHINY_LOGS_DIR"/*.log
        echo "${LOG_PREFIX} ✅ Cleared $SHINY_LOG_COUNT shiny-app log files"
    else
        echo "${LOG_PREFIX} ℹ️  No existing shiny-app log files to clear"
    fi
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if netstat -tlnp 2>/dev/null | grep -q ":${port}"; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port_process() {
    local port=$1
    echo "${LOG_PREFIX} 🛑 Checking port ${port}..."

    if check_port $port; then
        echo "${LOG_PREFIX} ⚠️ Port ${port} is in use. Finding process..."

        # Find and kill process
        local pid=$(lsof -ti :${port} 2>/dev/null || echo "")
        if [ -n "$pid" ]; then
            echo "${LOG_PREFIX} 🔪 Killing process $pid on port ${port}..."
            kill -9 $pid 2>/dev/null || true
            sleep 2

            # Verify port is free
            if check_port $port; then
                echo "${LOG_PREFIX} ❌ Failed to free port ${port}"
                exit 1
            else
                echo "${LOG_PREFIX} ✅ Port ${port} is now free"
            fi
        fi
    else
        echo "${LOG_PREFIX} ✅ Port ${port} is free"
    fi
}

# Kill existing R processes (using configured port)
echo "${LOG_PREFIX} 🧹 Cleaning up existing R processes..."
pkill -f "shiny" 2>/dev/null || true
pkill -f "Rscript" 2>/dev/null || true
pkill -f "$R_PORT" 2>/dev/null || true
sleep 2

# Check if old PID file exists
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "${LOG_PREFIX} 🛑 Stopping old process (PID: $OLD_PID)..."
        kill -9 $OLD_PID 2>/dev/null || true
        sleep 2
    fi
    rm -f "$PID_FILE"
fi

# Ensure configured R port is free
kill_port_process $R_PORT

# Check if shiny-app directory exists
if [ ! -d "${SHINY_APP_DIR}" ]; then
    echo "${LOG_PREFIX} ❌ Error: shiny-app directory not found at ${SHINY_APP_DIR}"
    exit 1
fi

# Check if required files exist
if [ ! -f "${SHINY_APP_DIR}/app.R" ]; then
    echo "${LOG_PREFIX} ❌ Error: app.R not found in ${SHINY_APP_DIR}"
    exit 1
fi

if [ ! -f "${SHINY_APP_DIR}/global.R" ]; then
    echo "${LOG_PREFIX} ❌ Error: global.R not found in ${SHINY_APP_DIR}"
    exit 1
fi

if [ ! -f "${SHINY_APP_DIR}/start_iaf.R" ]; then
    echo "${LOG_PREFIX} ❌ Error: start_iaf.R not found in ${SHINY_APP_DIR}"
    exit 1
fi

# Change to shiny-app directory
cd "${SHINY_APP_DIR}"

echo "${LOG_PREFIX} 📂 Working directory: $(pwd)"
echo "${LOG_PREFIX} 📁 Files in shiny-app:"
ls -la

# Start IAF R Analytics using start_iaf.R with environment configuration
echo "${LOG_PREFIX} 🚀 Starting IAF R Analytics on port $R_PORT..."
echo "${LOG_PREFIX} 📊 Using original app.R with 5-menu interface"
echo "${LOG_PREFIX} 🎯 Environment: $DEPLOYMENT_TARGET ($NODE_ENV)"
echo "${LOG_PREFIX} 📝 Log file: ${LOG_FILE}"

# Run the R script in background with environment variables
nohup Rscript start_iaf.R > "${LOG_FILE}" 2>&1 &
NEW_PID=$!

# Save PID
echo $NEW_PID > "$PID_FILE"

echo "${LOG_PREFIX} ✅ IAF R Analytics started with PID: $NEW_PID"
echo "${LOG_PREFIX} 📌 PID saved to: $PID_FILE"

# Wait a bit and check if process is running
sleep 5

if ps -p $NEW_PID > /dev/null 2>&1; then
    echo "${LOG_PREFIX} ✅ R Analytics service is running successfully"
    echo "${LOG_PREFIX} 🌐 Local URL: http://localhost:$R_PORT"
    echo "${LOG_PREFIX} 🌐 Public URL: $R_ANALYTICS_URL"

    # Check if port is actually listening
    sleep 5
    if check_port $R_PORT; then
        echo "${LOG_PREFIX} ✅ Port $R_PORT is listening"

        # Test the service
        echo "${LOG_PREFIX} 🧪 Testing service..."
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$R_PORT | grep -q "200\|302"; then
            echo "${LOG_PREFIX} ✅ Service is responding correctly"
        else
            echo "${LOG_PREFIX} ⚠️ Service started but not responding to HTTP yet (may still be loading)"
        fi
    else
        echo "${LOG_PREFIX} ⚠️ Service started but port not listening yet (may still be loading)"
    fi

    echo "${LOG_PREFIX} 📊 IAF R Analytics is ready!"
    echo "${LOG_PREFIX} 📝 Check logs at: ${LOG_FILE}"
    echo "${LOG_PREFIX} 📝 To monitor: tail -f ${LOG_FILE}"
    echo "${LOG_PREFIX} 🔗 Configuration: $DEPLOYMENT_TARGET"
    echo "${LOG_PREFIX} 🏢 Database: $DB_HOST:$DB_PORT/$DB_NAME"
    echo "${LOG_PREFIX} 🏦 Banking Type: $BANKING_TYPE"
else
    echo "${LOG_PREFIX} ❌ Failed to start R Analytics service"
    echo "${LOG_PREFIX} 📝 Check log file for errors: ${LOG_FILE}"
    tail -20 "${LOG_FILE}"
    exit 1
fi

echo "============================================================"
echo "${LOG_PREFIX} 🎉 IAF R Analytics startup complete!"
echo "${LOG_PREFIX} 🔍 Original 5-menu interface (Home, Data, Model, Forecast, PD-afl)"
echo "${LOG_PREFIX} 🎯 Environment: $DEPLOYMENT_TARGET"
echo "${LOG_PREFIX} 🌐 Public Access: $R_ANALYTICS_URL"
echo "============================================================"
