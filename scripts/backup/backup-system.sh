#!/bin/bash
# /home/doppelgaenger/ifrspro/ifrs9-platform/scripts/backup/backup-system.sh
# Comprehensive backup and disaster recovery system
# Supports database backups, application backups, and automated recovery

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Configuration
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/ifrs9}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
BACKUP_LOG="/var/log/ifrs9/backup-$(date +%Y%m%d-%H%M%S).log"

# Colors and logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${BACKUP_LOG}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${BACKUP_LOG}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${BACKUP_LOG}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${BACKUP_LOG}"
}

# Load environment configuration
load_environment() {
    if [[ -f "${PROJECT_ROOT}/.env.production" ]]; then
        source "${PROJECT_ROOT}/.env.production"
        log_info "Loaded production environment configuration"
    else
        log_warning "Production environment file not found, using defaults"
    fi
    
    # Set defaults
    DB_HOST="${DS1_HOST:-192.168.0.85}"
    DB_PORT="${DS1_PORT:-5432}"
    DB_USER="${DS1_USER:-postgres}"
    
    DB2_HOST="${DS2_HOST:-192.168.0.106}"
    DB2_PORT="${DS2_PORT:-5432}"
    DB2_USER="${DS2_USER:-postgres}"
}

# Create backup directory structure
setup_backup_directories() {
    log_info "Setting up backup directory structure..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    CURRENT_BACKUP_DIR="${BACKUP_ROOT}/${timestamp}"
    
    mkdir -p "${CURRENT_BACKUP_DIR}"/{databases,applications,configurations,logs}
    mkdir -p "${BACKUP_ROOT}/latest"
    
    log_success "Backup directories created: ${CURRENT_BACKUP_DIR}"
}

# Database backup functions
backup_platform_databases() {
    log_info "========== PLATFORM DATABASES BACKUP =========="
    
    local db_backup_dir="${CURRENT_BACKUP_DIR}/databases/platform"
    mkdir -p "$db_backup_dir"
    
    # Platform admin database
    log_info "Backing up platform admin database..."
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "ifrspro_platform_admin" \
        --no-password --verbose --format=custom \
        > "${db_backup_dir}/ifrspro_platform_admin.backup" 2>>"${BACKUP_LOG}"; then
        log_success "Platform admin database backup completed"
    else
        log_error "Platform admin database backup failed"
        return 1
    fi
    
    # Shared services database
    log_info "Backing up shared services database..."
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "ifrspro_shared_services" \
        --no-password --verbose --format=custom \
        > "${db_backup_dir}/ifrspro_shared_services.backup" 2>>"${BACKUP_LOG}"; then
        log_success "Shared services database backup completed"
    else
        log_error "Shared services database backup failed"
        return 1
    fi
}

backup_tenant_databases() {
    log_info "========== TENANT DATABASES BACKUP =========="
    
    local tenant_backup_dir="${CURRENT_BACKUP_DIR}/databases/tenants"
    mkdir -p "$tenant_backup_dir"
    
    # Get list of tenant databases
    local tenant_databases=(
        "ifrspro_tenant_demo_conventional"
        "ifrspro_tenant_demo_syariah"
        "ifrspro_tenant_dana"
    )
    
    for db_name in "${tenant_databases[@]}"; do
        log_info "Backing up tenant database: $db_name"
        
        if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" \
            --no-password --verbose --format=custom \
            > "${tenant_backup_dir}/${db_name}.backup" 2>>"${BACKUP_LOG}"; then
            log_success "Tenant database backup completed: $db_name"
        else
            log_error "Tenant database backup failed: $db_name"
            return 1
        fi
    done
    
    # Backup tenant registry information
    log_info "Backing up tenant registry information..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "ifrspro_platform_admin" \
        -c "COPY (SELECT * FROM platform_admin.tenants) TO STDOUT WITH CSV HEADER;" \
        > "${tenant_backup_dir}/tenant_registry.csv" 2>>"${BACKUP_LOG}"
}

backup_legacy_databases() {
    log_info "========== LEGACY DATABASES BACKUP =========="
    
    local legacy_backup_dir="${CURRENT_BACKUP_DIR}/databases/legacy"
    mkdir -p "$legacy_backup_dir"
    
    # FRS9PRO database (DS2)
    log_info "Backing up FRS9PRO legacy database..."
    if pg_dump -h "$DB2_HOST" -p "$DB2_PORT" -U "$DB2_USER" -d "FRS9PRO" \
        --no-password --verbose --format=custom \
        > "${legacy_backup_dir}/FRS9PRO.backup" 2>>"${BACKUP_LOG}"; then
        log_success "FRS9PRO legacy database backup completed"
    else
        log_warning "FRS9PRO legacy database backup failed (non-critical)"
    fi
    
    # IFRS9_pro analytics database (DS2)
    log_info "Backing up IFRS9_pro analytics database..."
    if pg_dump -h "$DB2_HOST" -p "$DB2_PORT" -U "$DB2_USER" -d "IFRS9_pro" \
        --no-password --verbose --format=custom \
        > "${legacy_backup_dir}/IFRS9_pro.backup" 2>>"${BACKUP_LOG}"; then
        log_success "IFRS9_pro analytics database backup completed"
    else
        log_warning "IFRS9_pro analytics database backup failed (non-critical)"
    fi
}

# Application and configuration backups
backup_applications() {
    log_info "========== APPLICATION BACKUP =========="
    
    local app_backup_dir="${CURRENT_BACKUP_DIR}/applications"
    
    # Backend application
    log_info "Backing up backend application..."
    tar -czf "${app_backup_dir}/backend.tar.gz" -C "${PROJECT_ROOT}" packages/backend/ \
        --exclude=node_modules --exclude=dist --exclude=logs 2>>"${BACKUP_LOG}"
    
    # Frontend application  
    log_info "Backing up frontend application..."
    tar -czf "${app_backup_dir}/frontend.tar.gz" -C "${PROJECT_ROOT}" packages/frontend/ \
        --exclude=node_modules --exclude=.next --exclude=out 2>>"${BACKUP_LOG}"
    
    # R Analytics application
    log_info "Backing up R Analytics application..."
    tar -czf "${app_backup_dir}/r-analytics.tar.gz" -C "${PROJECT_ROOT}" packages/r-analytics/ 2>>"${BACKUP_LOG}"
    
    # Shared packages
    log_info "Backing up shared packages..."
    tar -czf "${app_backup_dir}/shared.tar.gz" -C "${PROJECT_ROOT}" packages/shared/ 2>>"${BACKUP_LOG}"
    
    log_success "Application backup completed"
}

backup_configurations() {
    log_info "========== CONFIGURATION BACKUP =========="
    
    local config_backup_dir="${CURRENT_BACKUP_DIR}/configurations"
    
    # Environment files
    log_info "Backing up environment configurations..."
    if [[ -f "${PROJECT_ROOT}/.env.production" ]]; then
        cp "${PROJECT_ROOT}/.env.production" "${config_backup_dir}/"
    fi
    if [[ -f "${PROJECT_ROOT}/.env.staging" ]]; then
        cp "${PROJECT_ROOT}/.env.staging" "${config_backup_dir}/"
    fi
    
    # PM2 ecosystem configuration
    if [[ -f "${PROJECT_ROOT}/ecosystem.config.js" ]]; then
        cp "${PROJECT_ROOT}/ecosystem.config.js" "${config_backup_dir}/"
    fi
    
    # Package.json files
    find "${PROJECT_ROOT}" -name "package.json" -not -path "*/node_modules/*" \
        -exec cp --parents {} "${config_backup_dir}/" \;
    
    # Nginx configuration
    if [[ -f "/etc/nginx/sites-available/ifrs9-platform" ]]; then
        cp "/etc/nginx/sites-available/ifrs9-platform" "${config_backup_dir}/nginx-ifrs9-platform"
    fi
    
    # SSL certificates
    if [[ -f "/etc/ssl/certs/ifrs9-platform.crt" ]]; then
        cp "/etc/ssl/certs/ifrs9-platform.crt" "${config_backup_dir}/"
    fi
    if [[ -f "/etc/ssl/private/ifrs9-platform.key" ]]; then
        cp "/etc/ssl/private/ifrs9-platform.key" "${config_backup_dir}/"
    fi
    
    log_success "Configuration backup completed"
}

backup_logs() {
    log_info "========== LOG BACKUP =========="
    
    local log_backup_dir="${CURRENT_BACKUP_DIR}/logs"
    
    # Application logs
    if [[ -d "/var/log/ifrs9" ]]; then
        tar -czf "${log_backup_dir}/application_logs.tar.gz" -C /var/log ifrs9/ 2>>"${BACKUP_LOG}"
        log_success "Application logs backup completed"
    fi
    
    # PM2 logs
    if [[ -d "${HOME}/.pm2/logs" ]]; then
        tar -czf "${log_backup_dir}/pm2_logs.tar.gz" -C "${HOME}/.pm2" logs/ 2>>"${BACKUP_LOG}"
        log_success "PM2 logs backup completed"
    fi
    
    # Nginx logs
    if [[ -d "/var/log/nginx" ]]; then
        tar -czf "${log_backup_dir}/nginx_logs.tar.gz" -C /var/log nginx/ 2>>"${BACKUP_LOG}"
        log_success "Nginx logs backup completed"
    fi
}

# Create backup manifest
create_backup_manifest() {
    log_info "Creating backup manifest..."
    
    local manifest_file="${CURRENT_BACKUP_DIR}/MANIFEST.txt"
    
    cat > "$manifest_file" << EOF
IFRS9 Multi-Tenant Platform Backup Manifest
===========================================

Backup Date: $(date)
Backup Directory: ${CURRENT_BACKUP_DIR}
Backup Type: Full System Backup
Retention Policy: ${BACKUP_RETENTION_DAYS} days

Database Backups:
- Platform Admin Database: $(ls -la "${CURRENT_BACKUP_DIR}/databases/platform/" 2>/dev/null || echo "Not available")
- Shared Services Database: $(ls -la "${CURRENT_BACKUP_DIR}/databases/platform/" 2>/dev/null || echo "Not available")
- Tenant Databases: $(ls -la "${CURRENT_BACKUP_DIR}/databases/tenants/" 2>/dev/null || echo "Not available")
- Legacy Databases: $(ls -la "${CURRENT_BACKUP_DIR}/databases/legacy/" 2>/dev/null || echo "Not available")

Application Backups:
$(ls -la "${CURRENT_BACKUP_DIR}/applications/" 2>/dev/null || echo "Not available")

Configuration Backups:
$(ls -la "${CURRENT_BACKUP_DIR}/configurations/" 2>/dev/null || echo "Not available")

Log Backups:
$(ls -la "${CURRENT_BACKUP_DIR}/logs/" 2>/dev/null || echo "Not available")

Backup Size:
$(du -sh "${CURRENT_BACKUP_DIR}" 2>/dev/null || echo "Not available")

Checksum:
$(find "${CURRENT_BACKUP_DIR}" -type f -exec md5sum {} \; | md5sum)
EOF

    log_success "Backup manifest created: $manifest_file"
}

# Update latest backup symlink
update_latest_backup() {
    log_info "Updating latest backup symlink..."
    
    rm -f "${BACKUP_ROOT}/latest"
    ln -s "${CURRENT_BACKUP_DIR}" "${BACKUP_ROOT}/latest"
    
    log_success "Latest backup symlink updated"
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${BACKUP_RETENTION_DAYS} days..."
    
    find "${BACKUP_ROOT}" -maxdepth 1 -type d -name "20*" -mtime +${BACKUP_RETENTION_DAYS} -exec rm -rf {} \;
    
    local remaining_backups=$(find "${BACKUP_ROOT}" -maxdepth 1 -type d -name "20*" | wc -l)
    log_success "Cleanup completed. ${remaining_backups} backups remaining"
}

# Backup verification
verify_backup() {
    log_info "========== BACKUP VERIFICATION =========="
    
    local verification_log="${CURRENT_BACKUP_DIR}/verification.log"
    
    # Verify database backup files
    log_info "Verifying database backup integrity..."
    for backup_file in $(find "${CURRENT_BACKUP_DIR}/databases" -name "*.backup" 2>/dev/null); do
        if pg_restore --list "$backup_file" >/dev/null 2>>"$verification_log"; then
            log_success "Database backup verified: $(basename "$backup_file")"
        else
            log_error "Database backup verification failed: $(basename "$backup_file")"
            return 1
        fi
    done
    
    # Verify archive files
    log_info "Verifying application archive integrity..."
    for archive_file in $(find "${CURRENT_BACKUP_DIR}/applications" -name "*.tar.gz" 2>/dev/null); do
        if tar -tzf "$archive_file" >/dev/null 2>>"$verification_log"; then
            log_success "Archive verified: $(basename "$archive_file")"
        else
            log_error "Archive verification failed: $(basename "$archive_file")"
            return 1
        fi
    done
    
    log_success "Backup verification completed successfully"
}

# Main backup function
perform_full_backup() {
    log_info "Starting full system backup..."
    
    setup_backup_directories
    
    # Perform all backup operations
    backup_platform_databases
    backup_tenant_databases
    backup_legacy_databases
    backup_applications
    backup_configurations
    backup_logs
    
    create_backup_manifest
    update_latest_backup
    verify_backup
    cleanup_old_backups
    
    log_success "Full system backup completed successfully"
    log_info "Backup location: ${CURRENT_BACKUP_DIR}"
}

# Restore functions
restore_database() {
    local backup_file="$1"
    local database_name="$2"
    local host="${3:-$DB_HOST}"
    local port="${4:-$DB_PORT}"
    local user="${5:-$DB_USER}"
    
    log_info "Restoring database: $database_name from $backup_file"
    
    # Create database if it doesn't exist
    createdb -h "$host" -p "$port" -U "$user" "$database_name" 2>/dev/null || true
    
    # Restore from backup
    if pg_restore -h "$host" -p "$port" -U "$user" -d "$database_name" \
        --no-owner --no-privileges --verbose "$backup_file" 2>>"${BACKUP_LOG}"; then
        log_success "Database restore completed: $database_name"
        return 0
    else
        log_error "Database restore failed: $database_name"
        return 1
    fi
}

disaster_recovery() {
    local backup_dir="${1:-${BACKUP_ROOT}/latest}"
    
    if [[ ! -d "$backup_dir" ]]; then
        log_error "Backup directory not found: $backup_dir"
        return 1
    fi
    
    log_info "Starting disaster recovery from: $backup_dir"
    
    # Stop all services
    log_info "Stopping all IFRS9 services..."
    pm2 stop ecosystem.config.js || true
    
    # Restore databases
    log_info "Restoring platform databases..."
    if [[ -f "${backup_dir}/databases/platform/ifrspro_platform_admin.backup" ]]; then
        restore_database "${backup_dir}/databases/platform/ifrspro_platform_admin.backup" "ifrspro_platform_admin"
    fi
    
    if [[ -f "${backup_dir}/databases/platform/ifrspro_shared_services.backup" ]]; then
        restore_database "${backup_dir}/databases/platform/ifrspro_shared_services.backup" "ifrspro_shared_services"
    fi
    
    # Restore tenant databases
    log_info "Restoring tenant databases..."
    for backup_file in "${backup_dir}/databases/tenants"/*.backup; do
        if [[ -f "$backup_file" ]]; then
            local db_name=$(basename "$backup_file" .backup)
            restore_database "$backup_file" "$db_name"
        fi
    done
    
    # Restore applications
    log_info "Restoring applications..."
    if [[ -f "${backup_dir}/applications/backend.tar.gz" ]]; then
        tar -xzf "${backup_dir}/applications/backend.tar.gz" -C "${PROJECT_ROOT}/"
    fi
    
    if [[ -f "${backup_dir}/applications/frontend.tar.gz" ]]; then
        tar -xzf "${backup_dir}/applications/frontend.tar.gz" -C "${PROJECT_ROOT}/"
    fi
    
    # Restore configurations
    log_info "Restoring configurations..."
    if [[ -f "${backup_dir}/configurations/.env.production" ]]; then
        cp "${backup_dir}/configurations/.env.production" "${PROJECT_ROOT}/"
    fi
    
    if [[ -f "${backup_dir}/configurations/ecosystem.config.js" ]]; then
        cp "${backup_dir}/configurations/ecosystem.config.js" "${PROJECT_ROOT}/"
    fi
    
    # Rebuild and restart
    log_info "Rebuilding applications..."
    cd "${PROJECT_ROOT}"
    pnpm install
    pnpm run build
    
    log_info "Restarting services..."
    pm2 start ecosystem.config.js
    
    log_success "Disaster recovery completed successfully"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo
    echo "COMMANDS:"
    echo "  backup          Perform full system backup"
    echo "  restore         Restore from backup directory"
    echo "  verify          Verify backup integrity"
    echo "  cleanup         Clean up old backups"
    echo "  disaster        Perform disaster recovery"
    echo
    echo "OPTIONS:"
    echo "  --backup-dir    Specify backup directory (default: latest)"
    echo "  --retention     Backup retention in days (default: 30)"
    echo "  --help          Show this help message"
    echo
    echo "EXAMPLES:"
    echo "  $0 backup                           # Full system backup"
    echo "  $0 restore --backup-dir /path/to/backup"
    echo "  $0 disaster                         # Restore from latest backup"
    echo "  $0 cleanup --retention 7            # Keep only 7 days of backups"
}

# Main execution
main() {
    # Create log directory
    mkdir -p "$(dirname "$BACKUP_LOG")" /var/backups/ifrs9
    
    # Load environment
    load_environment
    
    # Parse command line arguments
    local command=""
    local backup_dir=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            backup|restore|verify|cleanup|disaster)
                command="$1"
                shift
                ;;
            --backup-dir)
                backup_dir="$2"
                shift 2
                ;;
            --retention)
                BACKUP_RETENTION_DAYS="$2"
                shift 2
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Execute command
    case "$command" in
        backup)
            perform_full_backup
            ;;
        restore)
            disaster_recovery "$backup_dir"
            ;;
        verify)
            verify_backup
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        disaster)
            disaster_recovery "$backup_dir"
            ;;
        "")
            log_error "No command specified"
            show_usage
            exit 1
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"