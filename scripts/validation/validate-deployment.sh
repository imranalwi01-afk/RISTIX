#!/bin/bash
# /home/doppelgaenger/ifrspro/ifrs9-platform/scripts/validation/validate-deployment.sh
# Production Deployment Validation Script
# Validates all system components before production deployment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
VALIDATION_LOG="/var/log/ifrs9/validation-$(date +%Y%m%d-%H%M%S).log"

# Colors and logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${VALIDATION_LOG}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${VALIDATION_LOG}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${VALIDATION_LOG}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${VALIDATION_LOG}"
}

# Validation counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

validate_check() {
    local check_name="$1"
    local check_command="$2"
    local is_critical="${3:-true}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Validating: $check_name"
    
    if eval "$check_command" &>/dev/null; then
        log_success "$check_name - PASSED"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        if [[ "$is_critical" == "true" ]]; then
            log_error "$check_name - FAILED (CRITICAL)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        else
            log_warning "$check_name - FAILED (NON-CRITICAL)"
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
            return 2
        fi
    fi
}

# System Requirements Validation
validate_system_requirements() {
    log_info "========== SYSTEM REQUIREMENTS VALIDATION =========="
    
    # Node.js version
    validate_check "Node.js 18+ Installation" \
        "command -v node >/dev/null && [[ \$(node --version | sed 's/v//' | cut -d. -f1) -ge 18 ]]"
    
    # pnpm installation
    validate_check "pnpm Package Manager" \
        "command -v pnpm >/dev/null"
    
    # PostgreSQL client
    validate_check "PostgreSQL Client Tools" \
        "command -v psql >/dev/null && command -v createdb >/dev/null"
    
    # Redis tools
    validate_check "Redis Client Tools" \
        "command -v redis-cli >/dev/null" "false"
    
    # PM2 process manager
    validate_check "PM2 Process Manager" \
        "command -v pm2 >/dev/null"
    
    # Nginx web server
    validate_check "Nginx Web Server" \
        "command -v nginx >/dev/null"
    
    # R installation
    validate_check "R Statistical Computing" \
        "command -v R >/dev/null && command -v Rscript >/dev/null"
    
    # System memory (minimum 4GB)
    validate_check "System Memory (4GB+)" \
        "[[ \$(free -m | awk 'NR==2{print \$2}') -ge 4000 ]]"
    
    # Disk space (minimum 20GB)
    validate_check "Disk Space (20GB+)" \
        "[[ \$(df -BG /var | tail -1 | awk '{print \$4}' | sed 's/G//') -ge 20 ]]"
}

# Database Connectivity Validation
validate_database_connectivity() {
    log_info "========== DATABASE CONNECTIVITY VALIDATION =========="
    
    # Load environment variables
    if [[ -f "${PROJECT_ROOT}/.env.production" ]]; then
        source "${PROJECT_ROOT}/.env.production"
    fi
    
    # Primary database server (DS1)
    validate_check "Primary Database Server (DS1)" \
        "pg_isready -h ${DS1_HOST:-192.168.0.85} -p ${DS1_PORT:-5432} -U ${DS1_USER:-postgres}"
    
    # Secondary database server (DS2) 
    validate_check "Secondary Database Server (DS2)" \
        "pg_isready -h ${DS2_HOST:-192.168.0.106} -p ${DS2_PORT:-5433} -U ${DS2_USER:-postgres}" "false"
    
    # Platform admin database
    validate_check "Platform Admin Database" \
        "psql -h ${DS1_HOST:-192.168.0.85} -p ${DS1_PORT:-5432} -U ${DS1_USER:-postgres} -d ifrspro_platform_admin -c 'SELECT 1;'"
    
    # Shared services database
    validate_check "Shared Services Database" \
        "psql -h ${DS1_HOST:-192.168.0.85} -p ${DS1_PORT:-5432} -U ${DS1_USER:-postgres} -d ifrspro_shared_services -c 'SELECT 1;'"
    
    # Demo tenant databases
    validate_check "Demo Conventional Tenant Database" \
        "psql -h ${DS1_HOST:-192.168.0.85} -p ${DS1_PORT:-5432} -U ${DS1_USER:-postgres} -d ifrspro_tenant_demo_conventional -c 'SELECT 1;'"
    
    validate_check "Demo Syariah Tenant Database" \
        "psql -h ${DS1_HOST:-192.168.0.85} -p ${DS1_PORT:-5432} -U ${DS1_USER:-postgres} -d ifrspro_tenant_demo_syariah -c 'SELECT 1;'"
    
    validate_check "Dana Tenant Database" \
        "psql -h ${DS1_HOST:-192.168.0.85} -p ${DS1_PORT:-5432} -U ${DS1_USER:-postgres} -d ifrspro_tenant_dana -c 'SELECT 1;'"
}

# Application Build Validation
validate_application_build() {
    log_info "========== APPLICATION BUILD VALIDATION =========="
    
    cd "${PROJECT_ROOT}"
    
    # Package installation
    validate_check "Package Dependencies Installation" \
        "pnpm install"
    
    # TypeScript compilation
    validate_check "TypeScript Compilation" \
        "pnpm run type-check"
    
    # Frontend build
    validate_check "Frontend Application Build" \
        "cd packages/frontend && pnpm run build"
    
    # Backend build
    validate_check "Backend Application Build" \
        "cd packages/backend && pnpm run build"
    
    # R Analytics setup
    validate_check "R Analytics Package Installation" \
        "cd packages/r-analytics && Rscript -e 'install.packages(c(\"plumber\", \"jsonlite\", \"dplyr\", \"ggplot2\", \"randomForest\"))'"
}

# Service Configuration Validation
validate_service_configuration() {
    log_info "========== SERVICE CONFIGURATION VALIDATION =========="
    
    # Environment configuration
    validate_check "Production Environment Configuration" \
        "[[ -f '${PROJECT_ROOT}/.env.production' ]]"
    
    # PM2 ecosystem configuration
    validate_check "PM2 Ecosystem Configuration" \
        "[[ -f '${PROJECT_ROOT}/ecosystem.config.js' ]]"
    
    # Nginx configuration
    validate_check "Nginx Site Configuration" \
        "[[ -f '/etc/nginx/sites-available/ifrs9-platform' ]]" "false"
    
    # SSL certificates (if HTTPS enabled)
    validate_check "SSL Certificate Files" \
        "[[ -f '/etc/ssl/certs/ifrs9-platform.crt' && -f '/etc/ssl/private/ifrs9-platform.key' ]]" "false"
    
    # Log directories
    validate_check "Log Directory Structure" \
        "[[ -d '/var/log/ifrs9' && -w '/var/log/ifrs9' ]]"
    
    # Upload directories
    validate_check "Upload Directory Structure" \
        "[[ -d '/var/uploads/ifrs9' && -w '/var/uploads/ifrs9' ]]"
}

# Network and Security Validation
validate_network_security() {
    log_info "========== NETWORK & SECURITY VALIDATION =========="
    
    # Port availability
    validate_check "Frontend Port (4231) Available" \
        "! netstat -tuln | grep ':4231 '" "false"
    
    validate_check "Backend Port (4232) Available" \
        "! netstat -tuln | grep ':4232 '" "false"
    
    validate_check "R Analytics Port (4236) Available" \
        "! netstat -tuln | grep ':4236 '" "false"
    
    # Firewall configuration (if UFW is used)
    validate_check "UFW Firewall Configuration" \
        "command -v ufw >/dev/null && ufw status | grep -q 'Status: active'" "false"
    
    # File permissions
    validate_check "Application File Permissions" \
        "[[ -r '${PROJECT_ROOT}/packages/backend/dist/index.js' ]]"
    
    validate_check "Log File Permissions" \
        "[[ -w '/var/log/ifrs9/' ]]"
}

# Performance and Resource Validation
validate_performance_resources() {
    log_info "========== PERFORMANCE & RESOURCES VALIDATION =========="
    
    # CPU cores (minimum 2)
    validate_check "CPU Cores (2+)" \
        "[[ \$(nproc) -ge 2 ]]"
    
    # Load average check
    validate_check "System Load Average" \
        "[[ \$(uptime | awk -F'load average:' '{ print \$2 }' | awk '{ print \$1 }' | sed 's/,//') < 2.0 ]]" "false"
    
    # Available memory check
    validate_check "Available Memory (1GB+)" \
        "[[ \$(free -m | awk 'NR==2{print \$7}') -ge 1000 ]]"
    
    # Disk I/O performance (basic check)
    validate_check "Disk I/O Performance" \
        "dd if=/dev/zero of=/tmp/test_io bs=1M count=100 oflag=direct 2>/dev/null && rm -f /tmp/test_io" "false"
}

# Application Health Validation
validate_application_health() {
    log_info "========== APPLICATION HEALTH VALIDATION =========="
    
    # Start services temporarily for health check
    cd "${PROJECT_ROOT}"
    
    # Backend health check
    if pm2 describe ifrs9-backend &>/dev/null; then
        validate_check "Backend Service Health" \
            "curl -sf http://localhost:4232/api/v1/health" "false"
    else
        log_warning "Backend service not running - skipping health check"
    fi
    
    # Frontend availability check
    if pm2 describe ifrs9-frontend &>/dev/null; then
        validate_check "Frontend Service Availability" \
            "curl -sf http://localhost:4231" "false"
    else
        log_warning "Frontend service not running - skipping availability check"
    fi
    
    # R Analytics service check
    if pm2 describe ifrs9-r-analytics &>/dev/null; then
        validate_check "R Analytics Service Health" \
            "curl -sf http://localhost:4236/health" "false"
    else
        log_warning "R Analytics service not running - skipping health check"
    fi
}

# Generate validation report
generate_validation_report() {
    log_info "========== VALIDATION REPORT =========="
    log_info "Total Checks: $TOTAL_CHECKS"
    log_success "Passed: $PASSED_CHECKS"
    log_error "Failed: $FAILED_CHECKS" 
    log_warning "Warnings: $WARNING_CHECKS"
    
    local success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    log_info "Success Rate: ${success_rate}%"
    
    echo
    if [[ $FAILED_CHECKS -eq 0 ]]; then
        log_success "🎉 DEPLOYMENT VALIDATION PASSED - System ready for production!"
        if [[ $WARNING_CHECKS -gt 0 ]]; then
            log_warning "⚠️  $WARNING_CHECKS non-critical warnings found - review recommended"
        fi
        echo
        log_info "Next steps:"
        log_info "1. Run deployment: ./scripts/deployment/deploy-production.sh"
        log_info "2. Start monitoring: ./scripts/monitoring/system-monitor.sh"
        log_info "3. Verify application: Access https://ifrs9.ifrspro.id"
        return 0
    else
        log_error "❌ DEPLOYMENT VALIDATION FAILED - $FAILED_CHECKS critical issues found"
        echo
        log_info "Please resolve critical issues before proceeding with deployment."
        log_info "Check validation log: $VALIDATION_LOG"
        return 1
    fi
}

# Main execution
main() {
    log_info "Starting IFRS9 Multi-Tenant Platform deployment validation..."
    log_info "Validation log: $VALIDATION_LOG"
    echo
    
    # Create log directory
    mkdir -p "$(dirname "$VALIDATION_LOG")"
    
    # Run validation checks
    validate_system_requirements
    echo
    validate_database_connectivity  
    echo
    validate_application_build
    echo
    validate_service_configuration
    echo
    validate_network_security
    echo
    validate_performance_resources
    echo
    validate_application_health
    echo
    
    # Generate final report
    generate_validation_report
}

# Execute main function
main "$@"