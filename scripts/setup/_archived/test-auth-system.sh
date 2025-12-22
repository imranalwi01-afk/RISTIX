#!/bin/bash
# scripts/setup/test-auth-system.sh
# Test script for authentication system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Configuration
BACKEND_URL="http://localhost:4232"
TEST_TENANT="demo-conventional"
TEST_EMAIL="admin@demo-conventional.com"
TEST_PASSWORD="admin123"

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Test health endpoint
test_health() {
    log_info "Testing health endpoint..."
    
    response=$(curl -s -w "%{http_code}" "${BACKEND_URL}/api/v1/auth/health" || echo "000")
    
    if [[ "$response" == *"200" ]]; then
        log_success "Health endpoint is working"
    else
        log_error "Health endpoint failed: $response"
        return 1
    fi
}

# Test login endpoint
test_login() {
    log_info "Testing login endpoint..."
    
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${TEST_EMAIL}\",
            \"password\": \"${TEST_PASSWORD}\",
            \"tenantSlug\": \"${TEST_TENANT}\"
        }" \
        "${BACKEND_URL}/api/v1/auth/login" || echo "000")
    
    if [[ "$response" == *"200" ]]; then
        log_success "Login endpoint is working"
        # Extract access token for further tests
        ACCESS_TOKEN=$(echo "$response" | jq -r '.data.tokens.accessToken' 2>/dev/null || echo "")
        export ACCESS_TOKEN
    else
        log_error "Login endpoint failed: $response"
        return 1
    fi
}

# Test me endpoint (requires authentication)
test_me() {
    if [[ -z "$ACCESS_TOKEN" ]]; then
        log_error "No access token available for /me test"
        return 1
    fi
    
    log_info "Testing /me endpoint..."
    
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        "${BACKEND_URL}/api/v1/auth/me" || echo "000")
    
    if [[ "$response" == *"200" ]]; then
        log_success "/me endpoint is working"
    else
        log_error "/me endpoint failed: $response"
        return 1
    fi
}

# Test logout endpoint
test_logout() {
    if [[ -z "$ACCESS_TOKEN" ]]; then
        log_error "No access token available for logout test"
        return 1
    fi
    
    log_info "Testing logout endpoint..."
    
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        "${BACKEND_URL}/api/v1/auth/logout" || echo "000")
    
    if [[ "$response" == *"200" ]]; then
        log_success "Logout endpoint is working"
    else
        log_error "Logout endpoint failed: $response"
        return 1
    fi
}

# Main test function
main() {
    log_info "Starting authentication system tests..."
    
    # Check if backend is running
    if ! curl -s "${BACKEND_URL}/health" >/dev/null 2>&1; then
        log_error "Backend server is not running at ${BACKEND_URL}"
        exit 1
    fi
    
    # Run tests
    test_health || exit 1
    test_login || exit 1
    test_me || exit 1
    test_logout || exit 1
    
    log_success "All authentication tests passed!"
}

main "$@"
