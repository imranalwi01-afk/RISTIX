#!/bin/bash
# scripts/monitoring/system-monitor.sh
# ============================================================================
# IFRS9 Multi-Tenant Platform - System Monitoring Script
# ============================================================================
# Purpose: Comprehensive system monitoring for production environment
# Features: Health checks, performance monitoring, alerting, dashboard
# Services: Frontend, Backend, R Analytics, PostgreSQL, Redis, Nginx
# ============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="/var/log/ifrs9/monitoring-$(date +%Y%m%d).log"
ALERT_LOG="/var/log/ifrs9/alerts.log"
STATUS_FILE="/tmp/ifrs9-status.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90
RESPONSE_TIME_THRESHOLD=2000  # milliseconds

# Server Configuration
PRIMARY_SERVER="192.168.0.85"
SECONDARY_SERVER="192.168.0.106"
PROXY_SERVER="192.168.0.88"

# Services Configuration
SERVICES=(
    "frontend:http://localhost:4231/api/health"
    "backend:http://localhost:4232/api/v1/health"
    "r_analytics:http://localhost:4236/health"
)

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_alert() {
    local message="$1"
    local severity="${2:-WARNING}"
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$severity] $message" >> "$ALERT_LOG"
    
    if [ "$severity" = "CRITICAL" ]; then
        log_error "CRITICAL ALERT: $message"
    else
        log_warning "ALERT: $message"
    fi
}

# ============================================================================
# SYSTEM MONITORING FUNCTIONS
# ============================================================================

check_system_resources() {
    local status="healthy"
    local issues=()
    
    log_info "Checking system resources..."
    
    # CPU Usage
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1}')
    cpu_usage=$(printf "%.0f" "$cpu_usage")
    
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
        issues+=("High CPU usage: ${cpu_usage}%")
        status="warning"
        log_alert "High CPU usage detected: ${cpu_usage}%" "WARNING"
    fi
    
    # Memory Usage
    local memory_info
    memory_info=$(free | awk 'FNR==2{printf "%.0f", ($3/($3+$7))*100}')
    
    if [ "$memory_info" -gt "$MEMORY_THRESHOLD" ]; then
        issues+=("High memory usage: ${memory_info}%")
        status="warning"
        log_alert "High memory usage detected: ${memory_info}%" "WARNING"
    fi
    
    # Disk Usage
    local disk_usage
    disk_usage=$(df / | awk 'NR==2{gsub("%","",$5); print $5}')
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        issues+=("High disk usage: ${disk_usage}%")
        status="critical"
        log_alert "High disk usage detected: ${disk_usage}%" "CRITICAL"
    fi
    
    # Load Average
    local load_avg
    load_avg=$(uptime | awk '{print $(NF-2)}' | sed 's/,//')
    local cpu_cores
    cpu_cores=$(nproc)
    local load_percentage
    load_percentage=$(awk "BEGIN {printf \"%.0f\", ($load_avg/$cpu_cores)*100}")
    
    if [ "$load_percentage" -gt 80 ]; then
        issues+=("High system load: ${load_avg} (${load_percentage}%)")
        status="warning"
        log_alert "High system load detected: ${load_avg}" "WARNING"
    fi
    
    # Update status
    echo "{
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"system_resources\": {
            \"status\": \"$status\",
            \"cpu_usage\": $cpu_usage,
            \"memory_usage\": $memory_info,
            \"disk_usage\": $disk_usage,
            \"load_average\": \"$load_avg\",
            \"load_percentage\": $load_percentage,
            \"issues\": [$(printf '\"%s\",' "${issues[@]}" | sed 's/,$//')]
        }
    }" > /tmp/system-resources.json
    
    if [ "$status" = "healthy" ]; then
        log_success "System resources check passed"
    else
        log_warning "System resources check detected issues: ${#issues[@]} issues"
    fi
    
    return $([ "$status" = "healthy" ] && echo 0 || echo 1)
}

check_application_services() {
    local overall_status="healthy"
    local service_results=()
    
    log_info "Checking application services..."
    
    for service_config in "${SERVICES[@]}"; do
        local service_name="${service_config%%:*}"
        local service_url="${service_config#*:}"
        
        log_info "Checking $service_name at $service_url"
        
        local start_time
        start_time=$(date +%s%3N)
        
        local status_code
        local response_time
        local status="healthy"
        
        if status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$service_url" 2>/dev/null); then
            local end_time
            end_time=$(date +%s%3N)
            response_time=$((end_time - start_time))
            
            if [ "$status_code" = "200" ]; then
                if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
                    status="slow"
                    log_warning "$service_name is responding slowly: ${response_time}ms"
                    log_alert "$service_name slow response time: ${response_time}ms" "WARNING"
                else
                    log_success "$service_name is healthy (${response_time}ms)"
                fi
            else
                status="unhealthy"
                log_error "$service_name returned status code: $status_code"
                log_alert "$service_name unhealthy - status code: $status_code" "CRITICAL"
                overall_status="critical"
            fi
        else
            status="unreachable"
            response_time=-1
            log_error "$service_name is unreachable"
            log_alert "$service_name is unreachable" "CRITICAL"
            overall_status="critical"
        fi
        
        service_results+=("{
            \"name\": \"$service_name\",
            \"url\": \"$service_url\",
            \"status\": \"$status\",
            \"status_code\": \"$status_code\",
            \"response_time\": $response_time
        }")
    done
    
    # Update status
    echo "{
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"application_services\": {
            \"status\": \"$overall_status\",
            \"services\": [$(IFS=,; echo "${service_results[*]}")]
        }
    }" > /tmp/application-services.json
    
    if [ "$overall_status" = "healthy" ]; then
        log_success "Application services check passed"
        return 0
    else
        log_error "Application services check failed"
        return 1
    fi
}

check_database_services() {
    local overall_status="healthy"
    local db_results=()
    
    log_info "Checking database services..."
    
    # PostgreSQL Primary (Multi-tenant)
    local primary_status="healthy"
    if ! PGPASSWORD="postgres" psql -h "$PRIMARY_SERVER" -p 5432 -U postgres -d postgres -c "SELECT 1;" &> /dev/null; then
        primary_status="unreachable"
        overall_status="critical"
        log_error "Primary PostgreSQL is unreachable: $PRIMARY_SERVER:5432"
        log_alert "Primary PostgreSQL unreachable" "CRITICAL"
    else
        log_success "Primary PostgreSQL is healthy"
        
        # Check database sizes and connections
        local db_info
        db_info=$(PGPASSWORD="postgres" psql -h "$PRIMARY_SERVER" -p 5432 -U postgres -d postgres -t -c "
        SELECT 
            COUNT(*) as active_connections,
            pg_size_pretty(SUM(pg_database_size(datname))) as total_size
        FROM pg_database 
        WHERE datname NOT IN ('template0', 'template1', 'postgres');
        " 2>/dev/null)
        
        log_info "Primary PostgreSQL stats: $db_info"
    fi
    
    # PostgreSQL Legacy
    local legacy_status="healthy"
    if ! PGPASSWORD="postgres" psql -h "$SECONDARY_SERVER" -p 5432 -U postgres -d postgres -c "SELECT 1;" &> /dev/null; then
        legacy_status="unreachable"
        log_warning "Legacy PostgreSQL is unreachable: $SECONDARY_SERVER:5432"
        log_alert "Legacy PostgreSQL unreachable" "WARNING"
    else
        log_success "Legacy PostgreSQL is healthy"
    fi
    
    # Redis
    local redis_status="healthy"
    if ! redis-cli -h "$PRIMARY_SERVER" -p 6379 ping &> /dev/null; then
        redis_status="unreachable"
        overall_status="critical"
        log_error "Redis is unreachable: $PRIMARY_SERVER:6379"
        log_alert "Redis unreachable" "CRITICAL"
    else
        log_success "Redis is healthy"
        
        # Check Redis memory usage
        local redis_memory
        redis_memory=$(redis-cli -h "$PRIMARY_SERVER" -p 6379 info memory | grep used_memory_human | cut -d: -f2 | tr -d '\\r')
        log_info "Redis memory usage: $redis_memory"
    fi
    
    db_results+=("{
        \"name\": \"postgresql_primary\",
        \"host\": \"$PRIMARY_SERVER:5432\",
        \"status\": \"$primary_status\"
    }")
    
    db_results+=("{
        \"name\": \"postgresql_legacy\",
        \"host\": \"$SECONDARY_SERVER:5432\",
        \"status\": \"$legacy_status\"
    }")
    
    db_results+=("{
        \"name\": \"redis\",
        \"host\": \"$PRIMARY_SERVER:6379\",
        \"status\": \"$redis_status\"
    }")
    
    # Update status
    echo "{
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"database_services\": {
            \"status\": \"$overall_status\",
            \"databases\": [$(IFS=,; echo "${db_results[*]}")]
        }
    }" > /tmp/database-services.json
    
    if [ "$overall_status" = "healthy" ]; then
        log_success "Database services check passed"
        return 0
    else
        log_error "Database services check failed"
        return 1
    fi
}

check_pm2_processes() {
    local status="healthy"
    local processes=()
    
    log_info "Checking PM2 processes..."
    
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed"
        return 1
    fi
    
    # Get PM2 process list
    local pm2_list
    pm2_list=$(pm2 jlist 2>/dev/null | jq -r '.[] | "\(.name):\(.pm2_env.status):\(.monit.memory):\(.monit.cpu)"' 2>/dev/null)
    
    if [ -z "$pm2_list" ]; then
        log_warning "No PM2 processes found"
        status="warning"
    else
        while IFS=: read -r name process_status memory cpu; do
            if [ "$process_status" != "online" ]; then
                status="critical"
                log_error "PM2 process $name is $process_status"
                log_alert "PM2 process $name is $process_status" "CRITICAL"
            else
                log_success "PM2 process $name is online"
            fi
            
            processes+=("{
                \"name\": \"$name\",
                \"status\": \"$process_status\",
                \"memory\": $memory,
                \"cpu\": $cpu
            }")
        done <<< "$pm2_list"
    fi
    
    # Update status
    echo "{
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"pm2_processes\": {
            \"status\": \"$status\",
            \"processes\": [$(IFS=,; echo "${processes[*]}")]
        }
    }" > /tmp/pm2-processes.json
    
    if [ "$status" = "healthy" ]; then
        log_success "PM2 processes check passed"
        return 0
    else
        log_error "PM2 processes check failed"
        return 1
    fi
}

check_nginx_status() {
    local status="healthy"
    local nginx_info=()
    
    log_info "Checking Nginx status..."
    
    # Check if Nginx is running
    if ! systemctl is-active --quiet nginx; then
        status="critical"
        log_error "Nginx service is not running"
        log_alert "Nginx service is not running" "CRITICAL"
    else
        log_success "Nginx service is running"
        
        # Check Nginx configuration
        if nginx -t &> /dev/null; then
            log_success "Nginx configuration is valid"
        else
            status="warning"
            log_warning "Nginx configuration has issues"
            log_alert "Nginx configuration validation failed" "WARNING"
        fi
        
        # Check if Nginx is responding
        if curl -f -s "http://localhost" &> /dev/null; then
            log_success "Nginx is responding to requests"
        else
            status="critical"
            log_error "Nginx is not responding to requests"
            log_alert "Nginx not responding to requests" "CRITICAL"
        fi
    fi
    
    # Update status
    echo "{
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"nginx\": {
            \"status\": \"$status\",
            \"service_active\": $(systemctl is-active --quiet nginx && echo true || echo false),
            \"config_valid\": $(nginx -t &> /dev/null && echo true || echo false)
        }
    }" > /tmp/nginx-status.json
    
    if [ "$status" = "healthy" ]; then
        log_success "Nginx check passed"
        return 0
    else
        log_error "Nginx check failed"
        return 1
    fi
}

# ============================================================================
# STATUS AGGREGATION FUNCTIONS
# ============================================================================

aggregate_status() {
    log_info "Aggregating system status..."
    
    # Combine all status files
    local overall_status="healthy"
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Read individual status files
    local system_resources
    local app_services
    local db_services
    local pm2_processes
    local nginx_status
    
    system_resources=$(cat /tmp/system-resources.json 2>/dev/null || echo "{}")
    app_services=$(cat /tmp/application-services.json 2>/dev/null || echo "{}")
    db_services=$(cat /tmp/database-services.json 2>/dev/null || echo "{}")
    pm2_processes=$(cat /tmp/pm2-processes.json 2>/dev/null || echo "{}")
    nginx_status=$(cat /tmp/nginx-status.json 2>/dev/null || echo "{}")
    
    # Determine overall status
    for status_file in /tmp/{system-resources,application-services,database-services,pm2-processes,nginx-status}.json; do
        if [ -f "$status_file" ]; then
            local component_status
            component_status=$(jq -r '.*.status' "$status_file" 2>/dev/null || echo "unknown")
            
            if [ "$component_status" = "critical" ]; then
                overall_status="critical"
            elif [ "$component_status" = "warning" ] && [ "$overall_status" != "critical" ]; then
                overall_status="warning"
            fi
        fi
    done
    
    # Generate comprehensive status report
    cat > "$STATUS_FILE" << EOF
{
    "timestamp": "$timestamp",
    "overall_status": "$overall_status",
    "platform": {
        "name": "IFRS9 Multi-Tenant Platform",
        "version": "1.0.0",
        "environment": "production"
    },
    "components": {
        $(echo "$system_resources" | jq -c '.' | sed 's/^{//' | sed 's/}$/,/')
        $(echo "$app_services" | jq -c '.' | sed 's/^{//' | sed 's/}$/,/')
        $(echo "$db_services" | jq -c '.' | sed 's/^{//' | sed 's/}$/,/')
        $(echo "$pm2_processes" | jq -c '.' | sed 's/^{//' | sed 's/}$/,/')
        $(echo "$nginx_status" | jq -c '.' | sed 's/^{//' | sed 's/}$//')
    }
}
EOF
    
    log_success "Status aggregation completed"
    
    return $([ "$overall_status" = "healthy" ] && echo 0 || echo 1)
}

generate_dashboard() {
    log_info "Generating monitoring dashboard..."
    
    local dashboard_file="/var/log/ifrs9/dashboard-$(date +%Y%m%d-%H%M%S).html"
    
    cat > "$dashboard_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IFRS9 Platform Monitoring Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .status-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-healthy { border-left: 5px solid #4CAF50; }
        .status-warning { border-left: 5px solid #FF9800; }
        .status-critical { border-left: 5px solid #f44336; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .metric-value { font-weight: bold; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 IFRS9 Multi-Tenant Platform</h1>
            <h2>Production Monitoring Dashboard</h2>
            <p class="timestamp">Last updated: <span id="timestamp"></span></p>
        </div>
        
        <div id="status-grid" class="status-grid">
            <!-- Status cards will be generated here -->
        </div>
    </div>

    <script>
        // Load status data and render dashboard
        async function loadStatus() {
            try {
                // In production, this would load from STATUS_FILE
                const statusData = STATUS_DATA_PLACEHOLDER;
                renderDashboard(statusData);
            } catch (error) {
                console.error('Failed to load status data:', error);
            }
        }

        function renderDashboard(data) {
            document.getElementById('timestamp').textContent = new Date(data.timestamp).toLocaleString();
            
            const statusGrid = document.getElementById('status-grid');
            statusGrid.innerHTML = '';
            
            // Overall status card
            const overallCard = createStatusCard('Overall System Status', data.overall_status, {
                'Platform': data.platform.name,
                'Version': data.platform.version,
                'Environment': data.platform.environment
            });
            statusGrid.appendChild(overallCard);
            
            // Component status cards
            Object.entries(data.components).forEach(([key, component]) => {
                if (component.status) {
                    const card = createStatusCard(
                        key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        component.status,
                        component
                    );
                    statusGrid.appendChild(card);
                }
            });
        }

        function createStatusCard(title, status, metrics) {
            const card = document.createElement('div');
            card.className = `status-card status-${status}`;
            
            let metricsHtml = '';
            Object.entries(metrics).forEach(([key, value]) => {
                if (key !== 'status' && key !== 'timestamp') {
                    metricsHtml += `
                        <div class="metric">
                            <span>${key.replace(/_/g, ' ')}</span>
                            <span class="metric-value">${value}</span>
                        </div>
                    `;
                }
            });
            
            card.innerHTML = `
                <h3>${title}</h3>
                <div class="metric">
                    <span>Status</span>
                    <span class="metric-value">${status.toUpperCase()}</span>
                </div>
                ${metricsHtml}
            `;
            
            return card;
        }

        // Auto-refresh every 30 seconds
        setInterval(loadStatus, 30000);
        loadStatus();
    </script>
</body>
</html>
EOF
    
    # Replace placeholder with actual status data
    local status_data
    status_data=$(cat "$STATUS_FILE" 2>/dev/null || echo '{}')
    sed -i "s/STATUS_DATA_PLACEHOLDER/$status_data/g" "$dashboard_file"
    
    log_success "Dashboard generated: $dashboard_file"
    
    # Create symlink for latest dashboard
    ln -sf "$dashboard_file" "/var/log/ifrs9/latest-dashboard.html"
}

# ============================================================================
# MAIN MONITORING FUNCTION
# ============================================================================

run_full_monitoring() {
    log_info "Starting comprehensive system monitoring..."
    
    local exit_code=0
    
    # Create necessary directories
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$ALERT_LOG")"
    mkdir -p /tmp
    
    echo "🔍 IFRS9 Platform System Monitoring"
    echo "=================================="
    echo ""
    
    # Run all checks
    echo "📊 System Resources..."
    check_system_resources || exit_code=1
    
    echo "🚀 Application Services..."
    check_application_services || exit_code=1
    
    echo "🗄️ Database Services..."
    check_database_services || exit_code=1
    
    echo "⚙️ PM2 Processes..."
    check_pm2_processes || exit_code=1
    
    echo "🌐 Nginx Status..."
    check_nginx_status || exit_code=1
    
    echo "📋 Aggregating Status..."
    aggregate_status || exit_code=1
    
    echo "📊 Generating Dashboard..."
    generate_dashboard
    
    # Display summary
    echo ""
    echo "📈 Monitoring Summary"
    echo "===================="
    
    if [ -f "$STATUS_FILE" ]; then
        local overall_status
        overall_status=$(jq -r '.overall_status' "$STATUS_FILE" 2>/dev/null || echo "unknown")
        
        case "$overall_status" in
            "healthy")
                echo -e "${GREEN}✅ System Status: HEALTHY${NC}"
                ;;
            "warning")
                echo -e "${YELLOW}⚠️ System Status: WARNING${NC}"
                ;;
            "critical")
                echo -e "${RED}❌ System Status: CRITICAL${NC}"
                ;;
            *)
                echo -e "${BLUE}❓ System Status: UNKNOWN${NC}"
                ;;
        esac
        
        echo "📄 Full status report: $STATUS_FILE"
        echo "🚨 Alert log: $ALERT_LOG"
        echo "📊 Dashboard: /var/log/ifrs9/latest-dashboard.html"
    fi
    
    echo ""
    
    return $exit_code
}

# ============================================================================
# SCRIPT EXECUTION
# ============================================================================

case "${1:-}" in
    --help|-h)
        echo "IFRS9 Platform System Monitoring"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h           Show this help message"
        echo "  --continuous         Run monitoring continuously"
        echo "  --dashboard-only     Generate dashboard only"
        echo "  --status-only        Check status without dashboard"
        echo "  --json               Output status as JSON"
        echo ""
        exit 0
        ;;
    --continuous)
        log_info "Starting continuous monitoring mode..."
        while true; do
            run_full_monitoring
            log_info "Waiting 5 minutes before next check..."
            sleep 300  # 5 minutes
        done
        ;;
    --dashboard-only)
        if [ -f "$STATUS_FILE" ]; then
            generate_dashboard
        else
            log_error "No status file found. Run full monitoring first."
            exit 1
        fi
        ;;
    --status-only)
        check_system_resources
        check_application_services
        check_database_services
        check_pm2_processes
        check_nginx_status
        aggregate_status
        ;;
    --json)
        run_full_monitoring > /dev/null 2>&1
        if [ -f "$STATUS_FILE" ]; then
            cat "$STATUS_FILE"
        else
            echo '{"error": "Status file not found"}'
            exit 1
        fi
        ;;
    "")
        run_full_monitoring
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac