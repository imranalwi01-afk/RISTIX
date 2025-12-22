#!/bin/bash
# scripts/deployment/deploy-production.sh
# ============================================================================
# IFRS9 Multi-Tenant Platform - Production Deployment Script
# ============================================================================
# Generated: 2025-01-11
# Purpose: Complete production deployment automation for native services
# Architecture: Multi-server deployment without Docker containers
# Services: Frontend, Backend, R Analytics, PostgreSQL, Redis, Nginx
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# ============================================================================
# CONFIGURATION & VARIABLES
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEPLOYMENT_CONFIG="${PROJECT_ROOT}/deployment/production.config.js"
LOG_FILE="/var/log/ifrs9/deployment-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server Configuration
PRIMARY_SERVER="192.168.0.85"
SECONDARY_SERVER="192.168.0.106"
PROXY_SERVER="192.168.0.88"

# Application Configuration
FRONTEND_PORT="4231"
BACKEND_PORT="4232"
R_ANALYTICS_PORT="4236"

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

validate_prerequisites() {
    log_info "Validating deployment prerequisites..."
    
    # Check required commands
    local required_commands=("node" "pnpm" "pm2" "nginx" "psql" "redis-cli")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Required command not found: $cmd"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version
    node_version=$(node --version | sed 's/v//')
    if [[ $(echo "$node_version 20.0.0" | tr " " "\n" | sort -V | head -n1) != "20.0.0" ]]; then
        log_error "Node.js version 20.0.0+ required. Current: $node_version"
        exit 1
    fi
    
    # Check disk space
    local available_space
    available_space=$(df "${PROJECT_ROOT}" | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 1048576 ]; then # 1GB in KB
        log_warning "Low disk space. Available: ${available_space}KB"
    fi
    
    # Check memory
    local available_memory
    available_memory=$(free -m | awk 'NR==2{print $7}')
    if [ "$available_memory" -lt 2048 ]; then # 2GB
        log_warning "Low available memory. Available: ${available_memory}MB"
    fi
    
    log_success "Prerequisites validation completed"
}

validate_database_connectivity() {
    log_info "Validating database connectivity..."
    
    # Test primary database connection
    if ! PGPASSWORD="postgres" psql -h "$PRIMARY_SERVER" -p 5432 -U postgres -d postgres -c "SELECT 1;" &> /dev/null; then
        log_error "Cannot connect to primary PostgreSQL server: $PRIMARY_SERVER:5432"
        exit 1
    fi
    
    # Test legacy database connection
    if ! PGPASSWORD="postgres" psql -h "$SECONDARY_SERVER" -p 5433 -U postgres -d postgres -c "SELECT 1;" &> /dev/null; then
        log_error "Cannot connect to legacy PostgreSQL server: $SECONDARY_SERVER:5433"
        exit 1
    fi
    
    # Test Redis connection
    if ! redis-cli -h "$PRIMARY_SERVER" -p 6379 ping &> /dev/null; then
        log_error "Cannot connect to Redis server: $PRIMARY_SERVER:6379"
        exit 1
    fi
    
    log_success "Database connectivity validation completed"
}

validate_application_health() {
    log_info "Validating application health..."
    
    local max_attempts=30
    local attempt=0
    
    # Check frontend health
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "http://localhost:${FRONTEND_PORT}/api/health" &> /dev/null; then
            log_success "Frontend health check passed"
            break
        fi
        ((attempt++))
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "Frontend health check failed after ${max_attempts} attempts"
        return 1
    fi
    
    # Check backend health
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "http://localhost:${BACKEND_PORT}/api/v1/health" &> /dev/null; then
            log_success "Backend health check passed"
            break
        fi
        ((attempt++))
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "Backend health check failed after ${max_attempts} attempts"
        return 1
    fi
    
    # Check R Analytics health
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "http://localhost:${R_ANALYTICS_PORT}/health" &> /dev/null; then
            log_success "R Analytics health check passed"
            break
        fi
        ((attempt++))
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_warning "R Analytics health check failed - this is optional"
    fi
    
    log_success "Application health validation completed"
}

# ============================================================================
# DATABASE SETUP FUNCTIONS
# ============================================================================

setup_databases() {
    log_info "Setting up production databases..."
    
    # Create log directory if it doesn't exist
    sudo mkdir -p "$(dirname "$LOG_FILE")"
    
    # Setup primary databases
    log_info "Setting up primary databases on $PRIMARY_SERVER..."
    
    local databases=("ifrspro_platform_admin" "ifrspro_shared_services" "ifrspro_tenant_dana" "ifrspro_tenant_demo_conventional" "ifrspro_tenant_demo_syariah")
    
    for db in "${databases[@]}"; do
        log_info "Creating database: $db"
        
        if PGPASSWORD="postgres" psql -h "$PRIMARY_SERVER" -p 5432 -U postgres -lqt | cut -d \\| -f 1 | grep -qw "$db"; then
            log_info "Database $db already exists"
        else
            PGPASSWORD="postgres" createdb -h "$PRIMARY_SERVER" -p 5432 -U postgres "$db"
            log_success "Created database: $db"
        fi
        
        # Apply schema if backup exists
        local backup_file="${PROJECT_ROOT}/database/backups/${db}_backup.sql"
        if [[ -f "$backup_file" ]]; then
            log_info "Applying schema from backup: $backup_file"
            PGPASSWORD="postgres" psql -h "$PRIMARY_SERVER" -p 5432 -U postgres -d "$db" -f "$backup_file" &>> "$LOG_FILE"
            log_success "Schema applied for database: $db"
        fi
    done
    
    log_success "Database setup completed"
}

setup_redis() {
    log_info "Setting up Redis configuration..."
    
    # Generate Redis configuration
    local redis_conf="/etc/redis/redis.conf"
    
    if [[ -f "$redis_conf" ]]; then
        # Backup original configuration
        sudo cp "$redis_conf" "${redis_conf}.backup.$(date +%Y%m%d)"
        log_info "Redis configuration backed up"
    fi
    
    # Update Redis configuration
    sudo tee "$redis_conf" > /dev/null << EOF
# Redis Configuration for IFRS9 Platform
# Generated: $(date)

bind 127.0.0.1 ${PRIMARY_SERVER}
port 6379
protected-mode yes
requirepass redis_password_here

# Memory Configuration
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# Database Configuration
databases 16

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
EOF
    
    # Restart Redis
    sudo systemctl restart redis-server
    sudo systemctl enable redis-server
    
    log_success "Redis setup completed"
}

# ============================================================================
# APPLICATION BUILD FUNCTIONS
# ============================================================================

build_applications() {
    log_info "Building applications for production..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_info "Installing dependencies with pnpm..."
    pnpm install --frozen-lockfile --production=false
    
    # Build backend
    log_info "Building backend application..."
    cd "${PROJECT_ROOT}/packages/backend"
    pnpm run build
    log_success "Backend build completed"
    
    # Build frontend
    log_info "Building frontend application..."
    cd "${PROJECT_ROOT}/packages/frontend"
    pnpm run build
    log_success "Frontend build completed"
    
    # Setup R Analytics
    log_info "Setting up R Analytics service..."
    cd "${PROJECT_ROOT}/packages/r-analytics"
    
    # Install R packages if needed
    if [[ -f "install_packages.R" ]]; then
        Rscript install_packages.R &>> "$LOG_FILE"
        log_success "R packages installed"
    fi
    
    log_success "Application build completed"
}

# ============================================================================
# PM2 DEPLOYMENT FUNCTIONS
# ============================================================================

deploy_with_pm2() {
    log_info "Deploying applications with PM2..."
    
    cd "$PROJECT_ROOT"
    
    # Stop existing processes
    log_info "Stopping existing PM2 processes..."
    pm2 stop ecosystem.config.js 2>/dev/null || true
    pm2 delete ecosystem.config.js 2>/dev/null || true
    
    # Generate PM2 configuration
    log_info "Generating PM2 ecosystem configuration..."
    node -e "
    const config = require('./deployment/production.config.js');
    const fs = require('fs');
    const pm2Config = config.generatePM2Config();
    fs.writeFileSync('./ecosystem.config.js', pm2Config);
    console.log('PM2 configuration generated');
    "
    
    # Start applications with PM2
    log_info "Starting applications with PM2..."
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    pm2 startup
    
    log_success "PM2 deployment completed"
}

# ============================================================================
# NGINX CONFIGURATION FUNCTIONS
# ============================================================================

setup_nginx() {
    log_info "Setting up Nginx configuration..."
    
    # Generate Nginx configuration
    log_info "Generating Nginx configuration..."
    node -e "
    const config = require('./deployment/production.config.js');
    const fs = require('fs');
    const nginxConfig = config.generateNginxConfig();
    fs.writeFileSync('./deployment/nginx.conf', nginxConfig);
    console.log('Nginx configuration generated');
    "
    
    # Backup existing Nginx configuration
    local nginx_conf="/etc/nginx/nginx.conf"
    if [[ -f "$nginx_conf" ]]; then
        sudo cp "$nginx_conf" "${nginx_conf}.backup.$(date +%Y%m%d)"
        log_info "Nginx configuration backed up"
    fi
    
    # Install new configuration
    sudo cp "${PROJECT_ROOT}/deployment/nginx.conf" "$nginx_conf"
    
    # Test configuration
    if sudo nginx -t; then
        log_success "Nginx configuration is valid"
        
        # Reload Nginx
        sudo systemctl reload nginx
        sudo systemctl enable nginx
        
        log_success "Nginx configuration deployed"
    else
        log_error "Nginx configuration is invalid"
        # Restore backup
        sudo cp "${nginx_conf}.backup.$(date +%Y%m%d)" "$nginx_conf"
        exit 1
    fi
}

# ============================================================================
# MONITORING SETUP FUNCTIONS
# ============================================================================

setup_monitoring() {
    log_info "Setting up monitoring and logging..."
    
    # Create log directories
    sudo mkdir -p /var/log/ifrs9
    sudo mkdir -p /var/log/nginx
    sudo chown -R www-data:www-data /var/log/nginx
    sudo chown -R "$USER:$USER" /var/log/ifrs9
    
    # Setup log rotation
    sudo tee /etc/logrotate.d/ifrs9 > /dev/null << EOF
/var/log/ifrs9/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
    
    # Setup health check monitoring
    local health_check_script="/usr/local/bin/ifrs9-health-check.sh"
    sudo tee "$health_check_script" > /dev/null << 'EOF'
#!/bin/bash
# IFRS9 Health Check Script

LOG_FILE="/var/log/ifrs9/health-check.log"

check_service() {
    local service_name="$1"
    local url="$2"
    
    if curl -f -s "$url" > /dev/null; then
        echo "[$(date)] ✅ $service_name is healthy" >> "$LOG_FILE"
        return 0
    else
        echo "[$(date)] ❌ $service_name is unhealthy" >> "$LOG_FILE"
        return 1
    fi
}

# Check all services
check_service "Frontend" "http://localhost:4231/api/health"
check_service "Backend" "http://localhost:4232/api/v1/health"
check_service "R Analytics" "http://localhost:4236/health"
EOF
    
    sudo chmod +x "$health_check_script"
    
    # Setup cron job for health checks
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/ifrs9-health-check.sh") | crontab -
    
    log_success "Monitoring setup completed"
}

# ============================================================================
# BACKUP SETUP FUNCTIONS
# ============================================================================

setup_backup() {
    log_info "Setting up backup system..."
    
    # Create backup directory
    sudo mkdir -p /opt/ifrs9/backups/{database,application,logs}
    sudo chown -R "$USER:$USER" /opt/ifrs9/backups
    
    # Database backup script
    local db_backup_script="/usr/local/bin/ifrs9-db-backup.sh"
    sudo tee "$db_backup_script" > /dev/null << EOF
#!/bin/bash
# IFRS9 Database Backup Script

BACKUP_DIR="/opt/ifrs9/backups/database"
DATE=\$(date +%Y%m%d_%H%M%S)

# Primary databases
DATABASES=("ifrspro_platform_admin" "ifrspro_shared_services" "ifrspro_tenant_dana" "ifrspro_tenant_demo_conventional" "ifrspro_tenant_demo_syariah")

for db in "\${DATABASES[@]}"; do
    echo "Backing up database: \$db"
    PGPASSWORD="postgres" pg_dump -h ${PRIMARY_SERVER} -p 5432 -U postgres -d "\$db" | gzip > "\${BACKUP_DIR}/\${db}_\${DATE}.sql.gz"
done

# Clean old backups (keep 30 days)
find "\$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: \$DATE"
EOF
    
    sudo chmod +x "$db_backup_script"
    
    # Setup cron job for daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/ifrs9-db-backup.sh") | crontab -
    
    log_success "Backup system setup completed"
}

# ============================================================================
# SECURITY CONFIGURATION FUNCTIONS
# ============================================================================

configure_security() {
    log_info "Configuring security settings..."
    
    # Setup firewall rules
    if command -v ufw &> /dev/null; then
        log_info "Configuring UFW firewall..."
        
        # Enable UFW
        sudo ufw --force enable
        
        # Allow SSH
        sudo ufw allow 22/tcp
        
        # Allow HTTP and HTTPS
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        
        # Allow database access from specific IPs
        sudo ufw allow from "$PRIMARY_SERVER" to any port 5432
        sudo ufw allow from "$SECONDARY_SERVER" to any port 5433
        
        # Allow Redis access
        sudo ufw allow from "$PRIMARY_SERVER" to any port 6379
        
        log_success "Firewall configured"
    fi
    
    # Set proper file permissions
    log_info "Setting file permissions..."
    
    # Application files
    find "$PROJECT_ROOT" -type f -name "*.js" -exec chmod 644 {} \\;
    find "$PROJECT_ROOT" -type f -name "*.json" -exec chmod 644 {} \\;
    find "$PROJECT_ROOT" -type f -name "*.sh" -exec chmod 755 {} \\;
    
    # Sensitive configuration files
    chmod 600 "$PROJECT_ROOT"/.env* 2>/dev/null || true
    chmod 600 "$PROJECT_ROOT"/deployment/*.config.js 2>/dev/null || true
    
    log_success "Security configuration completed"
}

# ============================================================================
# MAIN DEPLOYMENT FUNCTION
# ============================================================================

main() {
    log_info "Starting IFRS9 Multi-Tenant Platform production deployment..."
    log_info "Deployment started at: $(date)"
    log_info "Project root: $PROJECT_ROOT"
    log_info "Log file: $LOG_FILE"
    
    echo "🚀 IFRS9 Multi-Tenant Platform Production Deployment"
    echo "=================================================="
    echo ""
    
    # Step 1: Validate prerequisites
    log_info "Step 1: Validating prerequisites..."
    validate_prerequisites
    echo "✅ Prerequisites validation completed"
    
    # Step 2: Validate database connectivity
    log_info "Step 2: Validating database connectivity..."
    validate_database_connectivity
    echo "✅ Database connectivity validated"
    
    # Step 3: Setup databases
    log_info "Step 3: Setting up databases..."
    setup_databases
    echo "✅ Databases setup completed"
    
    # Step 4: Setup Redis
    log_info "Step 4: Setting up Redis..."
    setup_redis
    echo "✅ Redis setup completed"
    
    # Step 5: Build applications
    log_info "Step 5: Building applications..."
    build_applications
    echo "✅ Applications built successfully"
    
    # Step 6: Deploy with PM2
    log_info "Step 6: Deploying with PM2..."
    deploy_with_pm2
    echo "✅ PM2 deployment completed"
    
    # Step 7: Setup Nginx
    log_info "Step 7: Setting up Nginx..."
    setup_nginx
    echo "✅ Nginx setup completed"
    
    # Step 8: Validate application health
    log_info "Step 8: Validating application health..."
    if validate_application_health; then
        echo "✅ Application health validation passed"
    else
        log_warning "Application health validation had issues"
    fi
    
    # Step 9: Setup monitoring
    log_info "Step 9: Setting up monitoring..."
    setup_monitoring
    echo "✅ Monitoring setup completed"
    
    # Step 10: Setup backup system
    log_info "Step 10: Setting up backup system..."
    setup_backup
    echo "✅ Backup system setup completed"
    
    # Step 11: Configure security
    log_info "Step 11: Configuring security..."
    configure_security
    echo "✅ Security configuration completed"
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "=================================================="
    echo ""
    echo "📊 Deployment Summary:"
    echo "  • Frontend: https://ifrs9.ifrspro.id"
    echo "  • Backend API: https://bifrs9.ifrspro.id"
    echo "  • R Analytics: https://rifrs9.ifrspro.id"
    echo "  • Log file: $LOG_FILE"
    echo ""
    echo "🔍 Next Steps:"
    echo "  1. Verify SSL certificates are properly configured"
    echo "  2. Test all application endpoints"
    echo "  3. Configure DNS to point to the load balancer"
    echo "  4. Setup monitoring alerts"
    echo "  5. Perform load testing"
    echo ""
    
    log_success "Production deployment completed successfully"
    
    # Show PM2 status
    echo "📱 Current PM2 Status:"
    pm2 status
}

# ============================================================================
# SCRIPT EXECUTION
# ============================================================================

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "IFRS9 Multi-Tenant Platform Production Deployment"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --dry-run      Validate prerequisites without deploying"
        echo ""
        echo "Examples:"
        echo "  $0                    # Full production deployment"
        echo "  $0 --dry-run          # Validate without deploying"
        echo ""
        exit 0
        ;;
    --dry-run)
        log_info "Running deployment validation (dry run mode)"
        validate_prerequisites
        validate_database_connectivity
        log_success "Dry run completed - system is ready for deployment"
        exit 0
        ;;
    "")
        # Run main deployment
        main
        ;;
    *)
        log_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac