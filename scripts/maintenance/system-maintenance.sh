#!/bin/bash
# /home/doppelgaenger/ifrspro/ifrs9-platform/scripts/maintenance/system-maintenance.sh
# Automated system maintenance and optimization
# Runs periodic maintenance tasks to keep the platform healthy

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
MAINTENANCE_LOG="/var/log/ifrs9/maintenance-$(date +%Y%m%d-%H%M%S).log"

# Colors and logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${MAINTENANCE_LOG}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${MAINTENANCE_LOG}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${MAINTENANCE_LOG}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${MAINTENANCE_LOG}"
}

# Load environment configuration
load_environment() {
    if [[ -f "${PROJECT_ROOT}/.env.production" ]]; then
        source "${PROJECT_ROOT}/.env.production"
        log_info "Loaded production environment configuration"
    fi
    
    # Set defaults
    DB_HOST="${DS1_HOST:-192.168.0.85}"
    DB_PORT="${DS1_PORT:-5432}"
    DB_USER="${DS1_USER:-postgres}"
}

# Database maintenance
maintain_databases() {
    log_info "========== DATABASE MAINTENANCE =========="
    
    # Platform databases maintenance
    local platform_databases=(
        "ifrspro_platform_admin"
        "ifrspro_shared_services"
    )
    
    local tenant_databases=(
        "ifrspro_tenant_demo_conventional"
        "ifrspro_tenant_demo_syariah"
        "ifrspro_tenant_dana"
    )
    
    # Combine all databases
    local all_databases=("${platform_databases[@]}" "${tenant_databases[@]}")
    
    for db_name in "${all_databases[@]}"; do
        log_info "Maintaining database: $db_name"
        
        # Vacuum and analyze
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" \
            -c "VACUUM ANALYZE;" 2>>"${MAINTENANCE_LOG}"; then
            log_success "Database vacuum/analyze completed: $db_name"
        else
            log_warning "Database vacuum/analyze failed: $db_name"
        fi
        
        # Update table statistics
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" \
            -c "ANALYZE;" 2>>"${MAINTENANCE_LOG}"; then
            log_success "Database statistics updated: $db_name"
        else
            log_warning "Database statistics update failed: $db_name"
        fi
        
        # Reindex if needed (only if database is not too large)
        local db_size=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" \
            -t -c "SELECT pg_size_pretty(pg_database_size('$db_name'));" 2>/dev/null || echo "unknown")
        
        log_info "Database size: $db_name = $db_size"
        
        # Check for bloated tables and indexes
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" << 'EOF' >> "${MAINTENANCE_LOG}" 2>&1 || true
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
LIMIT 10;
EOF
    done
}

# Log rotation and cleanup
maintain_logs() {
    log_info "========== LOG MAINTENANCE =========="
    
    # Application logs cleanup
    if [[ -d "/var/log/ifrs9" ]]; then
        log_info "Cleaning up application logs older than 30 days..."
        find /var/log/ifrs9 -name "*.log" -mtime +30 -delete
        find /var/log/ifrs9 -name "*.log.*" -mtime +30 -delete
        
        # Compress logs older than 7 days
        find /var/log/ifrs9 -name "*.log" -mtime +7 -exec gzip {} \;
        
        log_success "Application logs cleanup completed"
    fi
    
    # PM2 logs cleanup
    if command -v pm2 >/dev/null; then
        log_info "Cleaning up PM2 logs..."
        pm2 flush || log_warning "PM2 log flush failed"
        log_success "PM2 logs cleanup completed"
    fi
    
    # Nginx logs rotation
    if [[ -d "/var/log/nginx" ]]; then
        log_info "Rotating Nginx logs..."
        if command -v logrotate >/dev/null; then
            logrotate /etc/logrotate.d/nginx || log_warning "Nginx log rotation failed"
        fi
        log_success "Nginx logs rotation completed"
    fi
    
    # System logs cleanup
    if command -v journalctl >/dev/null; then
        log_info "Cleaning up system journal logs..."
        journalctl --vacuum-time=30d || log_warning "Journal cleanup failed"
        log_success "System journal cleanup completed"
    fi
}

# Temporary files cleanup
cleanup_temporary_files() {
    log_info "========== TEMPORARY FILES CLEANUP =========="
    
    # Application temporary files
    local temp_dirs=(
        "/tmp"
        "/var/tmp"
        "/var/uploads/ifrs9/temp"
        "${PROJECT_ROOT}/packages/frontend/.next/cache"
        "${PROJECT_ROOT}/packages/backend/temp"
    )
    
    for temp_dir in "${temp_dirs[@]}"; do
        if [[ -d "$temp_dir" ]]; then
            log_info "Cleaning temporary files in: $temp_dir"
            
            # Remove files older than 7 days
            find "$temp_dir" -type f -mtime +7 -name "*ifrs9*" -delete 2>/dev/null || true
            find "$temp_dir" -type f -mtime +7 -name "*temp*" -delete 2>/dev/null || true
            find "$temp_dir" -type f -mtime +7 -name "*.tmp" -delete 2>/dev/null || true
            
            # Remove empty directories
            find "$temp_dir" -type d -empty -delete 2>/dev/null || true
            
            log_success "Temporary files cleanup completed: $temp_dir"
        fi
    done
    
    # Node.js cache cleanup
    if [[ -d "${HOME}/.npm/_cacache" ]]; then
        log_info "Cleaning npm cache..."
        npm cache clean --force || log_warning "npm cache clean failed"
        log_success "npm cache cleanup completed"
    fi
    
    # pnpm cache cleanup
    if command -v pnpm >/dev/null; then
        log_info "Cleaning pnpm cache..."
        pnpm store prune || log_warning "pnpm store prune failed"
        log_success "pnpm cache cleanup completed"
    fi
}

# System resource optimization
optimize_system_resources() {
    log_info "========== SYSTEM RESOURCE OPTIMIZATION =========="
    
    # Memory cleanup
    log_info "Optimizing system memory..."
    
    # Drop caches (safely)
    sync
    echo 1 > /proc/sys/vm/drop_caches 2>/dev/null || log_warning "Cache drop failed (requires root)"
    
    # Get memory info
    local memory_info=$(free -h | grep "Mem:")
    log_info "Memory status: $memory_info"
    
    # Check swap usage
    local swap_info=$(free -h | grep "Swap:")
    log_info "Swap status: $swap_info"
    
    # Process optimization
    log_info "Checking process resource usage..."
    
    # Find high CPU processes
    ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head -10 >> "${MAINTENANCE_LOG}" 2>&1
    
    # Find high memory processes
    ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%mem | head -10 >> "${MAINTENANCE_LOG}" 2>&1
    
    # Disk space optimization
    log_info "Optimizing disk space..."
    
    # Clean package manager caches
    if command -v apt-get >/dev/null; then
        apt-get autoremove -y || log_warning "apt autoremove failed"
        apt-get autoclean || log_warning "apt autoclean failed"
    fi
    
    # Clean old kernels (Ubuntu/Debian)
    if command -v apt-get >/dev/null && [[ -f /etc/debian_version ]]; then
        local current_kernel=$(uname -r)
        local old_kernels=$(dpkg -l | grep linux-image | grep -v "$current_kernel" | awk '{print $2}' | grep -v generic || true)
        
        if [[ -n "$old_kernels" ]]; then
            log_info "Removing old kernel packages..."
            echo "$old_kernels" | xargs apt-get purge -y || log_warning "Old kernel removal failed"
        fi
    fi
    
    log_success "System resource optimization completed"
}

# Application health optimization
optimize_applications() {
    log_info "========== APPLICATION OPTIMIZATION =========="
    
    # Node.js application optimization
    if command -v pm2 >/dev/null; then
        log_info "Optimizing PM2 applications..."
        
        # Restart applications if memory usage is high
        pm2 jlist | jq -r '.[] | select(.monit.memory > 500000000) | .name' | while read app_name; do
            if [[ -n "$app_name" ]]; then
                log_warning "Restarting high-memory application: $app_name"
                pm2 restart "$app_name" || log_error "Failed to restart $app_name"
            fi
        done
        
        # Reload PM2 daemon if needed
        pm2 ping || pm2 resurrect
        
        log_success "PM2 applications optimization completed"
    fi
    
    # Database connection pool optimization
    log_info "Optimizing database connections..."
    
    # Check for idle connections
    for db_name in ifrspro_platform_admin ifrspro_shared_services; do
        local idle_connections=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" \
            -t -c "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle' AND query_start < NOW() - INTERVAL '30 minutes';" 2>/dev/null || echo "0")
        
        log_info "Idle connections in $db_name: $idle_connections"
        
        # Terminate long-idle connections
        if [[ $idle_connections -gt 10 ]]; then
            log_warning "Terminating long-idle connections in $db_name"
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" \
                -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < NOW() - INTERVAL '1 hour';" \
                2>>"${MAINTENANCE_LOG}" || true
        fi
    done
    
    log_success "Application optimization completed"
}

# Security maintenance
maintain_security() {
    log_info "========== SECURITY MAINTENANCE =========="
    
    # Check for failed login attempts
    if [[ -f "/var/log/auth.log" ]]; then
        log_info "Checking authentication logs..."
        local failed_attempts=$(grep "authentication failure" /var/log/auth.log | wc -l 2>/dev/null || echo "0")
        log_info "Failed authentication attempts: $failed_attempts"
        
        if [[ $failed_attempts -gt 100 ]]; then
            log_warning "High number of failed authentication attempts detected"
        fi
    fi
    
    # Check file permissions
    log_info "Checking critical file permissions..."
    
    # Application files
    find "${PROJECT_ROOT}/packages" -name "*.js" -not -perm 644 -ls >> "${MAINTENANCE_LOG}" 2>&1 || true
    find "${PROJECT_ROOT}/packages" -name "*.json" -not -perm 644 -ls >> "${MAINTENANCE_LOG}" 2>&1 || true
    
    # Configuration files
    if [[ -f "${PROJECT_ROOT}/.env.production" ]]; then
        local env_perms=$(stat -c %a "${PROJECT_ROOT}/.env.production")
        if [[ "$env_perms" != "600" ]]; then
            log_warning "Environment file permissions incorrect: $env_perms (should be 600)"
            chmod 600 "${PROJECT_ROOT}/.env.production" || log_error "Failed to fix environment file permissions"
        fi
    fi
    
    # Check SSL certificate expiration
    if [[ -f "/etc/ssl/certs/ifrs9-platform.crt" ]]; then
        local cert_expiry=$(openssl x509 -in /etc/ssl/certs/ifrs9-platform.crt -noout -enddate | cut -d= -f2)
        local days_until_expiry=$(( ($(date -d "$cert_expiry" +%s) - $(date +%s)) / 86400 ))
        
        log_info "SSL certificate expires in $days_until_expiry days"
        
        if [[ $days_until_expiry -lt 30 ]]; then
            log_warning "SSL certificate expires soon: $days_until_expiry days"
        fi
    fi
    
    log_success "Security maintenance completed"
}

# Generate maintenance report
generate_maintenance_report() {
    log_info "========== MAINTENANCE REPORT =========="
    
    local report_file="/var/log/ifrs9/maintenance-report-$(date +%Y%m%d).txt"
    
    cat > "$report_file" << EOF
IFRS9 Multi-Tenant Platform Maintenance Report
==============================================

Date: $(date)
Hostname: $(hostname)
Uptime: $(uptime)

System Resources:
$(free -h)

Disk Usage:
$(df -h | grep -E '^/dev|^tmpfs')

Database Status:
$(ps aux | grep postgres | grep -v grep || echo "PostgreSQL not running")

Application Status:
$(pm2 list || echo "PM2 not running")

Network Status:
$(netstat -tuln | grep -E ':4231|:4232|:4236|:5432' || echo "Key services not listening")

Log Files:
$(ls -la /var/log/ifrs9/ | tail -10)

Maintenance Tasks Completed:
- Database maintenance (vacuum, analyze)
- Log rotation and cleanup
- Temporary files cleanup
- System resource optimization
- Application optimization
- Security checks

Next Maintenance: $(date -d "+1 week")
EOF

    log_success "Maintenance report generated: $report_file"
}

# Performance monitoring
monitor_performance() {
    log_info "========== PERFORMANCE MONITORING =========="
    
    # System load
    local load_average=$(uptime | awk -F'load average:' '{ print $2 }')
    log_info "System load average: $load_average"
    
    # Memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')
    log_info "Memory usage: $memory_usage"
    
    # Disk usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}')
    log_info "Root disk usage: $disk_usage"
    
    # Database performance
    for db_name in ifrspro_platform_admin ifrspro_shared_services; do
        local active_connections=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" \
            -t -c "SELECT COUNT(*) FROM pg_stat_activity;" 2>/dev/null || echo "0")
        log_info "Active connections in $db_name: $active_connections"
    done
    
    # Application response times (basic check)
    if curl -sf http://localhost:4232/api/v1/health >/dev/null 2>&1; then
        local response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:4232/api/v1/health 2>/dev/null || echo "unknown")
        log_info "Backend API response time: ${response_time}s"
    else
        log_warning "Backend API health check failed"
    fi
    
    log_success "Performance monitoring completed"
}

# Schedule maintenance tasks
schedule_maintenance() {
    log_info "Setting up maintenance schedule..."
    
    # Create cron entry for daily maintenance
    local cron_entry="0 2 * * * ${SCRIPT_DIR}/system-maintenance.sh daily >> /var/log/ifrs9/maintenance-cron.log 2>&1"
    
    # Check if cron entry already exists
    if ! crontab -l 2>/dev/null | grep -q "system-maintenance.sh"; then
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        log_success "Daily maintenance scheduled for 2:00 AM"
    else
        log_info "Maintenance schedule already configured"
    fi
    
    # Weekly backup schedule
    local backup_cron="0 1 * * 0 ${SCRIPT_DIR}/../backup/backup-system.sh backup >> /var/log/ifrs9/backup-cron.log 2>&1"
    
    if ! crontab -l 2>/dev/null | grep -q "backup-system.sh"; then
        (crontab -l 2>/dev/null; echo "$backup_cron") | crontab -
        log_success "Weekly backup scheduled for Sunday 1:00 AM"
    else
        log_info "Backup schedule already configured"
    fi
}

# Main execution functions
run_daily_maintenance() {
    log_info "Running daily maintenance tasks..."
    
    maintain_databases
    maintain_logs
    cleanup_temporary_files
    optimize_system_resources
    optimize_applications
    maintain_security
    monitor_performance
    generate_maintenance_report
    
    log_success "Daily maintenance completed successfully"
}

run_weekly_maintenance() {
    log_info "Running weekly maintenance tasks..."
    
    # All daily tasks plus additional weekly tasks
    run_daily_maintenance
    
    # Additional weekly tasks
    log_info "Running additional weekly maintenance..."
    
    # Deep database maintenance
    for db_name in ifrspro_platform_admin ifrspro_shared_services; do
        log_info "Running deep database maintenance: $db_name"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" \
            -c "REINDEX DATABASE $db_name;" 2>>"${MAINTENANCE_LOG}" || log_warning "Reindex failed: $db_name"
    done
    
    # System package updates check
    if command -v apt-get >/dev/null; then
        log_info "Checking for system updates..."
        apt-get update >/dev/null 2>&1 || true
        local updates_available=$(apt-get -s upgrade | grep -c "^Inst" || echo "0")
        log_info "System updates available: $updates_available"
    fi
    
    log_success "Weekly maintenance completed successfully"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "COMMANDS:"
    echo "  daily           Run daily maintenance tasks"
    echo "  weekly          Run weekly maintenance tasks"
    echo "  database        Run database maintenance only"
    echo "  logs            Run log maintenance only"
    echo "  cleanup         Run cleanup tasks only"
    echo "  monitor         Run performance monitoring only"
    echo "  security        Run security maintenance only"
    echo "  schedule        Set up automated maintenance schedule"
    echo "  status          Show system status"
    echo "  --help          Show this help message"
    echo
    echo "If no command is specified, daily maintenance will run."
}

# Main function
main() {
    # Create log directory
    mkdir -p "$(dirname "$MAINTENANCE_LOG")"
    
    # Load environment
    load_environment
    
    local command="${1:-daily}"
    
    case "$command" in
        daily)
            run_daily_maintenance
            ;;
        weekly)
            run_weekly_maintenance
            ;;
        database)
            maintain_databases
            ;;
        logs)
            maintain_logs
            ;;
        cleanup)
            cleanup_temporary_files
            ;;
        monitor)
            monitor_performance
            ;;
        security)
            maintain_security
            ;;
        schedule)
            schedule_maintenance
            ;;
        status)
            monitor_performance
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
    
    log_info "Maintenance log: $MAINTENANCE_LOG"
}

# Execute main function
main "$@"