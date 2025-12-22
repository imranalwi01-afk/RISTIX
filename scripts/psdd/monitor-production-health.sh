#!/bin/bash
# ============================================================================
# PSDD Production Health Monitoring Script
# ============================================================================
# File Path: scripts/psdd/monitor-production-health.sh
# Purpose: Continuous monitoring of IFRS Pro Platform production health
# Usage: ./monitor-production-health.sh [--continuous]
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/health-monitor-$(date +%Y%m%d).log"

# Monitoring function
check_health() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] Starting health check..." | tee -a "$LOG_FILE"
    
    # Service status
    local services=("postgresql" "redis-server" "nginx")
    for service in "${services[@]}"; do
        if sudo systemctl is-active --quiet "$service"; then
            echo "[$timestamp] ✓ $service: Running" | tee -a "$LOG_FILE"
        else
            echo "[$timestamp] ✗ $service: Stopped" | tee -a "$LOG_FILE"
        fi
    done
    
    # Application health
    local apps=("http://localhost:4231/health:Frontend" "http://localhost:4232/api/health:Backend" "http://localhost:4236/health:R-Analytics")
    for app in "${apps[@]}"; do
        local url=$(echo "$app" | cut -d: -f1-2)
        local name=$(echo "$app" | cut -d: -f3)
        
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "[$timestamp] ✓ $name: Healthy" | tee -a "$LOG_FILE"
        else
            echo "[$timestamp] ✗ $name: Unhealthy" | tee -a "$LOG_FILE"
        fi
    done
    
    # Resource usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local memory_usage=$(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
    local disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2{print $5}')
    
    echo "[$timestamp] System Resources: CPU: $cpu_usage, Memory: $memory_usage, Disk: $disk_usage" | tee -a "$LOG_FILE"
    
    echo "[$timestamp] Health check completed" | tee -a "$LOG_FILE"
    echo "----------------------------------------" | tee -a "$LOG_FILE"
}

# Main function
main() {
    mkdir -p "${PROJECT_ROOT}/logs"
    
    if [[ "${1:-}" == "--continuous" ]]; then
        echo "Starting continuous monitoring (check every 5 minutes)..."
        echo "Press Ctrl+C to stop"
        while true; do
            check_health
            sleep 300  # 5 minutes
        done
    else
        check_health
    fi
}

main "$@"
