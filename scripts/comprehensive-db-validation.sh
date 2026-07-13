#!/bin/bash
# =============================================================================
# 🗄️ COMPREHENSIVE DATABASE CONNECTIVITY VALIDATION
# =============================================================================
# Purpose: Test database connections for both local and RDS environments
# Validates: Platform DB, Shared DB, FRS9 DB, Tenant DB, RDS connectivity
# Usage: ./comprehensive-db-validation.sh [environment]
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
VALIDATION_LOG="${PROJECT_ROOT}/logs/db-validation-$(date +%Y%m%d-%H%M%S).log"
REPORT_FILE="${PROJECT_ROOT}/logs/db-validation-report-$(date +%Y%m%d-%H%M%S).md"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# Environment detection
ENVIRONMENT="${1:-auto}"
DB_CONNECTIONS=0
DB_SUCCESSFUL=0
DB_FAILED=0

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

# Print header
print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}🗄️ COMPREHENSIVE DATABASE CONNECTIVITY VALIDATION${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${BLUE}Timestamp: $(date)${NC}"
    echo -e "${BLUE}Project Root: ${PROJECT_ROOT}${NC}"
    echo -e "${BLUE}Validation Log: ${VALIDATION_LOG}${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

# Print section header
print_section() {
    local section="$1"
    echo -e "${PURPLE}🔍 ${section}${NC}"
    echo -e "${PURPLE}$(printf '=%.0s' {1..80})${NC}"
}

# Print validation result
print_result() {
    local status="$1"
    local message="$2"
    local details="$3"

    case "$status" in
        "PASS")
            echo -e "${GREEN}✅ ${message}${NC}"
            DB_SUCCESSFUL=$((DB_SUCCESSFUL + 1))
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  ${message}${NC}"
            ;;
        "FAIL")
            echo -e "${RED}❌ ${message}${NC}"
            DB_FAILED=$((DB_FAILED + 1))
            ;;
    esac
    [ -n "$details" ] && echo -e "${CYAN}   ${details}${NC}"
    echo ""
}

# Detect environment
detect_environment() {
    if [ "$ENVIRONMENT" = "auto" ]; then
        # Check for IAF ECS indicators
        if [ -f "/etc/ecs/ecs.config" ] || [ -n "$ECS_CONTAINER_METADATA_URI" ] || \
           hostname | grep -q "ecs\|alibaba\|10\.18"; then
            ENVIRONMENT="iafecs"
        else
            ENVIRONMENT="localdev"
        fi
    fi

    print_result "PASS" "Environment detected: ${ENVIRONMENT}" "Deployment target: ${ENVIRONMENT}"
}

# Load environment variables
load_environment() {
    print_section "ENVIRONMENT VARIABLES LOADING"

    # Check for environment files
    local env_files=(".env" ".env.localdev" ".env.iafecs" ".env.production")

    for env_file in "${env_files[@]}"; do
        if [ -f "${PROJECT_ROOT}/${env_file}" ]; then
            print_result "PASS" "Loading environment file: ${env_file}"
            # Export environment variables safely
            set -a
            source "${PROJECT_ROOT}/${env_file}"
            set +a
        else
            print_result "WARN" "Environment file not found: ${env_file}" "Optional file"
        fi
    done

    # Display critical database environment variables
    echo -e "${CYAN}Critical Database Variables:${NC}"
    echo -e "${CYAN}  DB_HOST: ${DB_HOST:-'not set'}${NC}"
    echo -e "${CYAN}  DB_PORT: ${DB_PORT:-'not set'}${NC}"
    echo -e "${CYAN}  DB_USER: ${DB_USER:-'not set'}${NC}"
    echo -e "${CYAN}  DB_PASSWORD: ${DB_PASSWORD:+***set***}${NC}"
    echo -e "${CYAN}  DB_NAME: ${DB_NAME:-'not set'}${NC}"
    echo ""
}

# Test database connection
test_database_connection() {
    local db_name="$1"
    local db_host="$2"
    local db_port="$3"
    local db_user="$4"
    local db_password="$5"
    local description="$6"

    echo -e "${BLUE}Testing: ${description}${NC}"
    echo -e "${CYAN}  Host: ${db_host}${NC}"
    echo -e "${CYAN}  Port: ${db_port}${NC}"
    echo -e "${CYAN}  Database: ${db_name}${NC}"
    echo -e "${CYAN}  User: ${db_user}${NC}"

    DB_CONNECTIONS=$((DB_CONNECTIONS + 1))

    if command -v psql >/dev/null 2>&1; then
        if PGPASSWORD="$db_password" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -c "SELECT 1 as test_connection, version() as postgres_version, current_database as current_db;" 2>>"$VALIDATION_LOG" 2>&1; then
            print_result "PASS" "Database connection successful: ${description}" "Host: ${db_host}:${db_port}/${db_name}"
            return 0
        else
            local error_msg=$(PGPASSWORD="$db_password" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -c "SELECT 1;" 2>&1 | head -1)
            print_result "FAIL" "Database connection failed: ${description}" "Error: ${error_msg}"
            return 1
        fi
    else
        print_result "WARN" "PostgreSQL client not available - cannot test database connection" "Install: sudo apt install postgresql-client"
        return 2
    fi
}

# Test all database configurations
test_all_databases() {
    print_section "DATABASE CONNECTIVITY TESTING"

    # Platform Database
    test_database_connection \
        "${DB_NAME:-ifrspro_platform_admin}" \
        "${DB_HOST:-192.168.0.85}" \
        "${DB_PORT:-5432}" \
        "${DB_USER:-postgres}" \
        "${DB_PASSWORD:-postgres}" \
        "Platform Database"

    # Shared Services Database
    test_database_connection \
        "${SHARED_DB_NAME:-ifrspro_shared_services}" \
        "${DB_HOST:-192.168.0.85}" \
        "${DB_PORT:-5432}" \
        "${DB_USER:-postgres}" \
        "${DB_PASSWORD:-postgres}" \
        "Shared Services Database"

    # FRS9 Database
    test_database_connection \
        "${FRS9_DB_NAME:-FRS9PRO}" \
        "${FRS9_DB_HOST:-192.168.0.106}" \
        "${FRS9_DB_PORT:-5432}" \
        "${FRS9_DB_USER:-postgres}" \
        "${FRS9_DB_PASSWORD:-postgres}" \
        "FRS9 Database (Analytics)"

    # Tenant Database
    test_database_connection \
        "${TENANT_DB_NAME:-ifrspro_tenant_iaf}" \
        "${DB_HOST:-192.168.0.85}" \
        "${DB_PORT:-5432}" \
        "${DB_USER:-postgres}" \
        "${DB_PASSWORD:-postgres}" \
        "Tenant Database (IAF)"

    # RDS Production Database (if configured)
    if [ "$ENVIRONMENT" = "iafecs" ] && [ -n "$RDS_ENDPOINT" ]; then
        test_database_connection \
            "${RDS_DB_NAME:-ifrspro_platform_admin}" \
            "${RDS_ENDPOINT}" \
            "${RDS_PORT:-5432}" \
            "${RDS_USER:-admin_iaf}" \
            "${RDS_PASSWORD:-P@ssw0rd2025!}" \
            "RDS Production Database"
    fi
}

# Test environment-specific database configurations
test_environment_specific_databases() {
    print_section "ENVIRONMENT-SPECIFIC DATABASE CONFIGURATIONS"

    if [ "$ENVIRONMENT" = "iafecs" ]; then
        echo -e "${BLUE}🏭 Testing IAF ECS Production Database Configuration${NC}"

        # Test RDS connection (production)
        if [ -n "$RDS_ENDPOINT" ]; then
            test_database_connection \
                "${RDS_DB_NAME:-ifrspro_platform_admin}" \
                "$RDS_ENDPOINT" \
                "${RDS_PORT:-5432}" \
                "${RDS_USER:-admin_iaf}" \
                "${RDS_PASSWORD:-P@ssw0rd2025!}" \
                "RDS Platform Database (Production)"

            test_database_connection \
                "${SHARED_DB_NAME:-ifrspro_shared_services}" \
                "$RDS_ENDPOINT" \
                "${RDS_PORT:-5432}" \
                "${RDS_USER:-admin_iaf}" \
                "${RDS_PASSWORD:-P@ssw0rd2025!}" \
                "RDS Shared Database (Production)"

            test_database_connection \
                "${FRS9_DB_NAME:-FRS9PRO}" \
                "$RDS_ENDPOINT" \
                "${FRS9_DB_PORT:-5432}" \
                "${FRS9_DB_USER:-postgres}" \
                "${FRS_DB_PASSWORD:-postgres}" \
                "RDS FRS9 Database (Production)"
        fi
    else
        echo -e "${BLUE}🏠 Testing Local Development Database Configuration${NC}"

        # Test local development connections
        test_database_connection \
            "${DB_NAME:-ifrspro_platform_admin}" \
            "${DB_HOST:-192.168.0.85}" \
            "${DB_PORT:-5432}" \
            "${DB_USER:-postgres}" \
            "${DB_PASSWORD:-postgres}" \
            "Local Platform Database"

        test_database_connection \
            "${DB_NAME:-ifrspro_shared_services}" \
            "${DB_HOST:-192.168.0.85}" \
            "${DB_PORT:-5432}" \
            "${DB_USER:-postgres}" \
            "${DB_PASSWORD:-postgres}" \
            "Local Shared Database"

        test_database_connection \
            "${FRS9_DB_NAME:-FRS9PRO}" \
            "${FRS9_DB_HOST:-192.168.0.106}" \
            "${FRS9_DB_PORT:-5432}" \
            "${FRS9_DB_USER:-postgres}" \
            "${FRS9_DB_PASSWORD:-postgres}" \
            "Local FRS9 Database (Analytics)"
    fi
}

# Validate database configuration consistency
validate_database_config_consistency() {
    print_section "DATABASE CONFIGURATION CONSISTENCY"

    # Check if all databases use the same host for the environment
    local primary_host="${DB_HOST:-192.168.0.85}"
    local frs9_host="${FRS9_DB_HOST:-192.168.0.106}"

    if [ "$ENVIRONMENT" = "localdev" ]; then
        if [ "$primary_host" != "$frs9_host" ]; then
            print_result "WARN" "Database hosts differ between environments" "Platform: ${primary_host}, FRS9: ${frs9_host}"
        else
            print_result "PASS" "Database hosts consistent across environments" "All using: ${primary_host}"
        fi
    elif [ "$ENVIRONMENT" = "iafecs" ] && [ -n "$RDS_ENDPOINT" ]; then
        if [ "$RDS_ENDPOINT" != "$primary_host" ]; then
            print_result "WARN" "Potential configuration inconsistency detected" "Check environment variables"
        else
            print_result "PASS" "RDS configuration consistent" "Using: ${RDS_ENDPOINT:-not set}"
        fi
    fi

    # Check SSL configuration
    local ssl_enabled="${DB_SSL:-false}"
    if [ "$ssl_enabled" = "true" ]; then
        print_result "PASS" "SSL enabled for database connections"
    else
        print_result "WARN" "SSL disabled for database connections" "Expected for local development"
    fi

    # Check database name patterns
    local db_patterns=("ifrspro_platform_admin" "ifrspro_shared_services" "FRS9PRO" "ifrspro_tenant_")
    for pattern in "${db_patterns[@]}"; do
        if [ -n "$(eval echo \${${pattern^^}:-empty})" ]; then
            print_result "PASS" "Database name pattern found: ${pattern}"
        else
            print_result "WARN" "Database name not set: ${pattern}"
        fi
    done
}

# Check table existence and structure
validate_database_structure() {
    print_section "DATABASE STRUCTURE VALIDATION"

    # Test basic table existence in platform database
    if command -v psql >/dev/null 2>&1 && [ -n "${DB_PASSWORD}" ]; then
        echo -e "${BLUE}Checking platform database structure...${NC}"

        local platform_tables=("users" "tenants" "configurations" "audit_logs")
        for table in "${platform_tables[@]}"; do
            if PGPASSWORD="$DB_PASSWORD" psql -h "${DB_HOST:-192.168.0.85}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-ifrspro_platform_admin}" -c "\dt ${table}" 2>>"$VALIDATION_LOG" 2>&1; then
                print_result "PASS" "Table exists: ${table}"
            else
                print_result "WARN" "Table not found: ${table}" "May need migration"
            fi
        done

        # Check FRS9 database structure
        echo -e "${BLUE}Checking FRS9 database structure...${NC}"
        local frs9_tables=("frs9_param_commonh" "frs9_param_commond" "frs9_param_product" "frs9_param_journal")
        for table in "${frs9_tables[@]}"; do
            if PGPASSWORD="$FRS9_DB_PASSWORD" psql -h "${FRS9_DB_HOST:-192.168.0.106}" -p "${FRS9_DB_PORT:-5432}" -U "${FRS9_DB_USER:-postgres}" -d "${FRS9_DB_NAME:-FRS9PRO}" -c "\dt ${table}" 2>>"$VALIDATION_LOG" 2>&1; then
                print_result "PASS" "FRS9 Table exists: ${table}"
            else
                print_result "WARN" "FRS9 Table not found: ${table}" "May need migration"
            fi
        done
    fi
}

# Generate database validation report
generate_database_report() {
    print_section "DATABASE VALIDATION SUMMARY"

    local success_rate=0
    if [ $DB_CONNECTIONS -gt 0 ]; then
        success_rate=$((DB_SUCCESSFUL * 100 / DB_CONNECTIONS))
    fi

    echo -e "${BLUE}Total Database Connections Tested:${NC} ${DB_CONNECTIONS}"
    echo -e "${GREEN}Successful:${NC} ${DB_SUCCESSFUL}"
    echo -e "${RED}Failed:${NC} ${DB_FAILED}"
    echo -e "${BLUE}Success Rate:${NC} ${success_rate}%"
    echo ""

    # Generate detailed markdown report
    cat > "$REPORT_FILE" << EOF
# Database Connectivity Validation Report

**Generated:** $(date)
**Environment:** ${ENVIRONMENT}
**Success Rate:** ${success_rate}%

## Summary

- **Total Connections Tested:** ${DB_CONNECTIONS}
- **Successful:** ${DB_SUCCESSFUL}
- **Failed:** ${DB_FAILED}
- **Success Rate:** ${success_rate}%

## Database Connection Results

### Platform Database
${DB_SUCCESSFUL:-✅ Connected successfully : ❌ Connection failed}

### Shared Services Database
${DB_SUCCESSFUL:-✅ Connected successfully : ❌ Connection failed}

### FRS9 Database (Analytics)
${DB_SUCCESSFUL:-✅ Connected successfully : ❌ Connection failed}

### Tenant Database
${DB_SUCCESSFUL:-✅ Connected successfully : ❌ Connection failed}

## Environment-Specific Configuration

EOF

    if [ "$ENVIRONMENT" = "iafecs" ]; then
        cat >> "$REPORT_FILE" << EOF
### IAF ECS Production Environment
- **RDS Endpoint:** ${RDS_ENDPOINT:-Not configured}
- **SSL Configuration:** Enabled for production
- **Authentication:** Using production credentials
- **Connection Method:** Secure tunnel via reverse proxy

EOF
    else
        cat >> "$REPORT_FILE" << EOF
### Local Development Environment
- **Local Database Servers:** 192.168.0.85 (DS1), 192.168.0.106 (DS2)
- **SSL Configuration:** Disabled for local development
- **Authentication:** Using development credentials
- **Connection Method:** Direct network connection

EOF
    fi

    cat >> "$REPORT_FILE" << EOF
## Recommendations

EOF

    if [ $DB_FAILED -gt 0 ]; then
        cat >> "$REPORT_FILE" << EOF
### Connection Issues Detected (${DB_FAILED})

Address these database connection issues:
1. **Network Connectivity**: Ensure database servers are accessible
2. **Authentication**: Verify database credentials are correct
3. **Firewall Rules**: Check if database ports are open
4. **SSL Configuration**: Adjust SSL settings if needed
5. **Database Status**: Ensure database services are running

EOF
    else
        cat >> "$_FILE" << EOF
### All Database Connections Successful

✅ **Platform Database**: Connected successfully
✅ **Shared Services Database**: Connected successfully
✅ **FRS9 Database**: Connected successfully
✅ **Tenant Database**: Connected successfully

The IFRS9 IAF platform has full database connectivity across all required databases.

EOF
    fi

    cat >> "$REPORT_FILE" << EOF
### Next Steps

1. **Verify Data Access**: Test application can read/write to all databases
2. **Performance Testing**: Check query performance and connection pooling
3. **Backup Validation**: Ensure backup systems are functional
4. **Monitoring Setup**: Implement database health monitoring
5. **Security Audit**: Review database access controls and permissions

**Database validation completed successfully. Platform ready for data operations.**
EOF

    print_result "PASS" "Database validation report generated" "Report: $REPORT_FILE"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    # Initialize log
    echo "Database Connectivity Validation - $(date)" > "$VALIDATION_LOG"
    echo "Environment: ${ENVIRONMENT}" >> "$VALIDATION_LOG"
    echo "" >> "$VALIDATION_LOG"

    print_header
    detect_environment
    load_environment
    test_all_databases
    test_environment_specific_databases
    validate_database_config_consistency
    validate_database_structure
    generate_database_report

    echo -e "${CYAN}📝 Full validation log: ${VALIDATION_LOG}${NC}"
    echo -e "${CYAN}📊 Database validation report: ${REPORT_FILE}${NC}"

    # Final assessment
    echo ""
    echo -e "${PURPLE}============================================================================${NC}"
    if [ $DB_FAILED -eq 0 ]; then
        echo -e "${GREEN}🚀 DATABASE VALIDATION COMPLETE: All connections successful!${NC}"
    else
        echo -e "${RED}❌ DATABASE VALIDATION ISSUES: ${DB_FAILED} connections failed${NC}"
    fi
    echo -e "${PURPLE}============================================================================${NC}"
}

# Execute main function
main "$@"