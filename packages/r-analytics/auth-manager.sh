#!/bin/bash
# R Analytics Authentication Management Script
# Usage: ./auth-manager.sh [enable|disable|status]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTH_CONFIG_FILE="${SCRIPT_DIR}/config/auth.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_usage() {
    echo "Usage: $0 [enable|disable|status]"
    echo ""
    echo "Commands:"
    echo "  enable  - Enable authentication for R Analytics"
    echo "  disable - Disable authentication for R Analytics (development mode)"
    echo "  status  - Show current authentication status"
    echo ""
}

print_status() {
    echo "🔐 R Analytics Authentication Status"
    echo "=================================="

    if [ -f "$AUTH_CONFIG_FILE" ]; then
        source "$AUTH_CONFIG_FILE"

        echo -e "Authentication Enabled: ${R_ANALYTICS_AUTH_ENABLED:+${GREEN}${R_ANALYTICS_AUTH_ENABLED}${NC}}"
        echo -e "Development Mode: ${R_ANALYTICS_DEV_MODE:+${BLUE}${R_ANALYTICS_DEV_MODE}${NC}}"
        echo -e "Auth Bypass in Dev: ${R_ANALYTICS_DEV_BYPASS_AUTH:+${YELLOW}${R_ANALYTICS_DEV_BYPASS_AUTH}${NC}}"
        echo -e "IAF Integration: ${R_ANALYTICS_IAF_INTEGRATION:+${GREEN}${R_ANALYTICS_IAF_INTEGRATION}${NC}}"
        echo -e "Debug Mode: ${R_ANALYTICS_DEBUG_MODE:+${BLUE}${R_ANALYTICS_DEBUG_MODE}${NC}}"

        echo ""
        echo "📋 Configuration Details:"
        echo "  File: $AUTH_CONFIG_FILE"
        echo "  Auth Required: $([ "$R_ANALYTICS_AUTH_ENABLED" = "true" ] && echo "Yes" || echo "No")"
        echo "  Auto-login in Dev: $([ "$R_ANALYTICS_DEV_AUTO_LOGIN" = "true" ] && echo "Yes" || echo "No")"
        echo "  Session Timeout: ${R_ANALYTICS_PROD_SESSION_TIMEOUT:-3600}s"

    else
        echo -e "${RED}❌ Authentication config file not found: $AUTH_CONFIG_FILE${NC}"
        echo "Please run this script from the r-analytics directory."
    fi
}

enable_auth() {
    echo "🔐 Enabling authentication for R Analytics..."

    # Backup original config
    if [ -f "$AUTH_CONFIG_FILE" ]; then
        cp "$AUTH_CONFIG_FILE" "${AUTH_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ Backup created: ${AUTH_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Update configuration
    cat > "$AUTH_CONFIG_FILE" << 'EOF'
# R Analytics Authentication Configuration
# =============================================================================
# CENTRALIZED AUTHENTICATION CONTROL FOR IAF R ANALYTICS
# =============================================================================

# Authentication Settings
R_ANALYTICS_AUTH_ENABLED=true
R_ANALYTICS_AUTH_DEBUG=false
R_ANALYTICS_AUTH_REQUIRED_FOR_DASHBOARD=true

# Development Mode Settings
R_ANALYTICS_DEV_MODE=false
R_ANALYTICS_DEV_BYPASS_AUTH=false
R_ANALYTICS_DEV_AUTO_LOGIN=false

# Production Mode Settings
R_ANALYTICS_PROD_AUTH_REQUIRED=true
R_ANALYTICS_PROD_SESSION_TIMEOUT=3600

# Security Settings (when auth is enabled)
R_ANALYTICS_JWT_SECRET=your-jwt-secret-here
R_ANALYTICS_ENCRYPTION_KEY=your-encryption-key-here
R_ANALYTICS_SESSION_COOKIE_NAME=ifrs9_r_analytics_session

# User Context Settings (when auth is enabled)
R_ANALYTICS_REQUIRE_USER_ID=true
R_ANALYTICS_REQUIRE_TENANT_ID=true
R_ANALYTICS_REQUIRE_USER_ROLE=true

# IAF Integration Settings
R_ANALYTICS_IAF_INTEGRATION=true
R_ANALYTICS_IAF_USER_VALIDATION=true
R_ANALYTICS_IAF_TENANT_VALIDATION=true

# Debug Logging
R_ANALYTICS_DEBUG_MODE=false
R_ANALYTICS_LOG_AUTH_ATTEMPTS=true
R_ANALYTICS_LOG_USER_CONTEXT=true
EOF

    echo "✅ Authentication enabled successfully!"
    echo ""
    echo "📋 Changes made:"
    echo "  - Authentication: ENABLED"
    echo "  - Development Mode: DISABLED"
    echo "  - Auth Bypass: DISABLED"
    echo "  - IAF Integration: ENABLED"
    echo ""
    echo "🔄 Please restart R Analytics service to apply changes:"
    echo "   ./start-iaf-analytics.sh"
}

disable_auth() {
    echo "🔓 Disabling authentication for R Analytics (development mode)..."

    # Backup original config
    if [ -f "$AUTH_CONFIG_FILE" ]; then
        cp "$AUTH_CONFIG_FILE" "${AUTH_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ Backup created: ${AUTH_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Update configuration for development
    cat > "$AUTH_CONFIG_FILE" << 'EOF'
# R Analytics Authentication Configuration
# =============================================================================
# CENTRALIZED AUTHENTICATION CONTROL FOR IAF R ANALYTICS
# =============================================================================

# Authentication Settings
R_ANALYTICS_AUTH_ENABLED=false
R_ANALYTICS_AUTH_DEBUG=true
R_ANALYTICS_AUTH_REQUIRED_FOR_DASHBOARD=false

# Development Mode Settings
R_ANALYTICS_DEV_MODE=true
R_ANALYTICS_DEV_BYPASS_AUTH=true
R_ANALYTICS_DEV_AUTO_LOGIN=true

# Production Mode Settings
R_ANALYTICS_PROD_AUTH_REQUIRED=true
R_ANALYTICS_PROD_SESSION_TIMEOUT=3600

# Security Settings (when auth is enabled)
R_ANALYTICS_JWT_SECRET=your-jwt-secret-here
R_ANALYTICS_ENCRYPTION_KEY=your-encryption-key-here
R_ANALYTICS_SESSION_COOKIE_NAME=ifrs9_r_analytics_session

# User Context Settings (when auth is enabled)
R_ANALYTICS_REQUIRE_USER_ID=true
R_ANALYTICS_REQUIRE_TENANT_ID=true
R_ANALYTICS_REQUIRE_USER_ROLE=true

# IAF Integration Settings
R_ANALYTICS_IAF_INTEGRATION=true
R_ANALYTICS_IAF_USER_VALIDATION=true
R_ANALYTICS_IAF_TENANT_VALIDATION=true

# Debug Logging
R_ANALYTICS_DEBUG_MODE=true
R_ANALYTICS_LOG_AUTH_ATTEMPTS=true
R_ANALYTICS_LOG_USER_CONTEXT=true
EOF

    echo "✅ Authentication disabled successfully!"
    echo ""
    echo "📋 Changes made:"
    echo "  - Authentication: DISABLED"
    echo "  - Development Mode: ENABLED"
    echo "  - Auth Bypass: ENABLED"
    echo "  - Debug Mode: ENABLED"
    echo ""
    echo "🔄 Please restart R Analytics service to apply changes:"
    echo "   ./start-iaf-analytics.sh"
}

# Main script logic
case "${1:-status}" in
    "enable")
        enable_auth
        ;;
    "disable")
        disable_auth
        ;;
    "status")
        print_status
        ;;
    "help"|"-h"|"--help")
        print_usage
        ;;
    *)
        echo -e "${RED}❌ Invalid command: $1${NC}"
        echo ""
        print_usage
        exit 1
        ;;
esac