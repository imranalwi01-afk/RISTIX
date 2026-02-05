#!/bin/bash

# =================================================================
# IFRS9 R Analytics Diagnostic Script
# =================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 IFRS9 R Analytics Diagnostic Report${NC}"
echo "=================================================="
echo "Generated: $(date)"
echo ""

# Current directory and files
echo -e "${BLUE}📁 Current Directory Analysis:${NC}"
echo "Working directory: $(pwd)"
echo ""
echo "Files in current directory:"
ls -la
echo ""

# Check log directory structure
echo -e "${BLUE}📋 Log Directory Structure:${NC}"
if [[ -d "logs" ]]; then
    echo "✅ logs/ directory exists"
    ls -la logs/
else
    echo "❌ logs/ directory missing"
fi
echo ""

# Check for log files in various locations
echo -e "${BLUE}🔍 Searching for R log files:${NC}"
find . -name "*.log" -type f 2>/dev/null | head -10
echo ""

# Check R installation
echo -e "${BLUE}🔧 R Installation Check:${NC}"
if command -v R &> /dev/null; then
    echo "✅ R is installed: $(R --version | head -n1)"
    echo ""
    echo "R library paths:"
    R --slave -e ".libPaths()"
    echo ""
else
    echo "❌ R is not installed"
fi

# Check R packages
echo -e "${BLUE}📦 R Package Status:${NC}"
if command -v R &> /dev/null; then
    R --slave -e "
    critical_packages <- c('shiny', 'shinydashboard', 'DT', 'plotly', 'dplyr', 'RPostgres')
    for(pkg in critical_packages) {
        if(pkg %in% installed.packages()[,'Package']) {
            cat('✅', pkg, 'installed\n')
        } else {
            cat('❌', pkg, 'missing\n')
        }
    }
    "
else
    echo "❌ Cannot check R packages (R not installed)"
fi
echo ""

# Check processes
echo -e "${BLUE}🔄 Running R Processes:${NC}"
ps aux | grep -E "R|shiny" | grep -v grep || echo "No R processes running"
echo ""

# Check ports
echo -e "${BLUE}🌐 Port Usage Check:${NC}"
echo "Checking ports 3838-3840:"
for port in 3838 3839 3840; do
    if netstat -ln 2>/dev/null | grep ":$port " >/dev/null; then
        echo "✅ Port $port is in use"
    else
        echo "⭕ Port $port is available"
    fi
done
echo ""

# Check database connectivity - USE ENVIRONMENT VARIABLES
echo -e "${BLUE}🗄️ Database Connectivity:${NC}"
if command -v psql &> /dev/null; then
    # Load environment variables
    if [[ -f ".env" ]]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi

    # Use environment variables with fallbacks
    db_host=${DB_HOST:-"localhost"}
    db_port=${DB_PORT:-"5432"}
    db_user=${DB_USER:-"postgres"}
    db_password=${DB_PASSWORD:-"postgres"}
    db_name=${DB_NAME:-"ifrspro_platform_admin"}

    # Test DS1 connection
    echo "Testing DS1 (${db_host}:${db_port}):"
    if PGPASSWORD="$db_password" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -c "SELECT 1;" &>/dev/null; then
        echo "✅ DS1 connection successful"
    else
        echo "❌ DS1 connection failed"
    fi

    # Test DS2 connection (if configured)
    legacy_db_host=${LEGACY_DB_HOST:-"192.168.0.106"}
    legacy_db_port=${LEGACY_DB_PORT:-"5433"}
    legacy_db_name=${LEGACY_DB_NAME:-"FRS9PRO"}

    echo "Testing DS2 (${legacy_db_host}:${legacy_db_port}):"
    if PGPASSWORD="$db_password" psql -h "$legacy_db_host" -p "$legacy_db_port" -U "$db_user" -d "$legacy_db_name" -c "SELECT 1;" &>/dev/null; then
        echo "✅ DS2 connection successful"
    else
        echo "❌ DS2 connection failed"
    fi
else
    echo "❌ psql not installed - cannot test database connections"
fi
echo ""

# Check for app files
echo -e "${BLUE}📱 R Application Files:${NC}"
for app_file in "app.R" "enhanced-app.R" "global.R" "enhanced-global.R"; do
    if [[ -f "$app_file" ]]; then
        echo "✅ $app_file exists ($(wc -l < "$app_file") lines)"
    else
        echo "❌ $app_file missing"
    fi
done
echo ""

# Check directory permissions
echo -e "${BLUE}🔐 Directory Permissions:${NC}"
echo "Current directory permissions: $(ls -ld . | awk '{print $1}')"
if [[ -d "logs" ]]; then
    echo "logs/ directory permissions: $(ls -ld logs | awk '{print $1}')"
fi
if [[ -d "pids" ]]; then
    echo "pids/ directory permissions: $(ls -ld pids | awk '{print $1}')"
fi
echo ""

# Environment variables
echo -e "${BLUE}🌍 Environment Variables:${NC}"
env | grep -E "(DB_|R_|FRONTEND|BACKEND)" | sort
echo ""

# System resources
echo -e "${BLUE}💻 System Resources:${NC}"
echo "Memory usage:"
free -h
echo ""
echo "Disk usage:"
df -h . 2>/dev/null | tail -1
echo ""

# Error analysis
echo -e "${BLUE}🚨 Error Analysis:${NC}"
echo "Looking for recent error patterns..."

# Check for any existing log files with errors
if find . -name "*.log" -type f 2>/dev/null | head -1 >/dev/null; then
    echo "Recent log entries:"
    find . -name "*.log" -type f -exec tail -5 {} \; 2>/dev/null
else
    echo "No log files found for error analysis"
fi
echo ""

# Recommendations
echo -e "${YELLOW}💡 DIAGNOSTIC RECOMMENDATIONS:${NC}"
echo ""

# Check what failed
has_r=$(command -v R &> /dev/null && echo "yes" || echo "no")
has_packages=$(R --slave -e "cat(ifelse('shiny' %in% installed.packages()[,'Package'], 'yes', 'no'))" 2>/dev/null || echo "no")
has_psql=$(command -v psql &> /dev/null && echo "yes" || echo "no")

if [[ "$has_r" == "no" ]]; then
    echo -e "${RED}❌ CRITICAL: R is not installed${NC}"
    echo "   Fix: sudo apt install r-base r-base-dev"
    echo ""
fi

if [[ "$has_packages" == "no" ]]; then
    echo -e "${RED}❌ CRITICAL: R packages missing${NC}"
    echo "   Fix: Run the R package installer script"
    echo ""
fi

if [[ "$has_psql" == "no" ]]; then
    echo -e "${YELLOW}⚠️ WARNING: PostgreSQL client missing${NC}"
    echo "   Fix: sudo apt install postgresql-client"
    echo ""
fi

# Specific issues based on the startup error
if [[ ! -f "logs/r_conventional.log" ]]; then
    echo -e "${RED}❌ ISSUE: Log file path problem${NC}"
    echo "   The startup script has a path duplication issue"
    echo "   Fix: Use the updated startup script"
    echo ""
fi

echo -e "${GREEN}🔧 IMMEDIATE FIX STEPS:${NC}"
echo ""
echo "1. Replace your startup script:"
echo "   wget -O start-r-analytics.sh <new-script-url>"
echo "   chmod +x start-r-analytics.sh"
echo ""
echo "2. Install R packages properly:"
echo "   wget -O install-r-packages.sh <package-installer-url>"
echo "   chmod +x install-r-packages.sh"
echo "   ./install-r-packages.sh"
echo ""
echo "3. Restart the services:"
echo "   ./start-r-analytics.sh restart"
echo ""

echo "=================================================="
echo -e "${BLUE}🎯 End of Diagnostic Report${NC}"