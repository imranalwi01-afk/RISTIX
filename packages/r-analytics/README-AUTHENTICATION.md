# R Analytics Authentication System

## Overview

The R Analytics Shiny application now includes a centralized authentication system that can be easily enabled or disabled based on development needs.

## 🚀 Quick Start

### Current Status (Development Mode)
- **Authentication**: ❌ **DISABLED**
- **Development Mode**: ✅ **ENABLED**
- **Auth Bypass**: ✅ **ENABLED** (no login required)
- **IAF Integration**: ✅ **ENABLED**

The R Analytics dashboard is currently running in **development mode** with authentication disabled for easy testing.

## 📋 Authentication Management

### Using the Auth Manager Script

The `auth-manager.sh` script provides easy control over authentication:

```bash
# Check current authentication status
./auth-manager.sh status

# Enable authentication (for production/testing)
./auth-manager.sh enable

# Disable authentication (for development)
./auth-manager.sh disable

# Show help
./auth-manager.sh help
```

### Configuration File

Authentication settings are stored in `config/auth.env`:

```bash
# Main authentication toggle
R_ANALYTICS_AUTH_ENABLED=false      # Currently disabled for development
R_ANALYTICS_DEV_MODE=true           # Development mode enabled
R_ANALYTICS_DEV_BYPASS_AUTH=true    # Auth bypass in development
R_ANALYTICS_IAF_INTEGRATION=true    # IAF frontend integration
```

## 🔧 Authentication Modes

### 1. Development Mode (Current)
- **Authentication**: Disabled
- **User Context**: Automatic development user
- **Access**: Full access to all modules
- **Purpose**: Easy development and testing

When authentication is disabled:
- Uses automatic development user context
- No login required
- Full access to all R Analytics modules
- Debug logging enabled

### 2. Production Mode
- **Authentication**: Enabled
- **User Context**: From IAF frontend
- **Access**: Role-based permissions
- **Purpose**: Secure production deployment

When authentication is enabled:
- Requires valid user parameters from IAF frontend
- Validates user roles and permissions
- Enforces tenant-based access control
- Comprehensive audit logging

## 👤 User Context & Roles

### Development User (Default)
When authentication is disabled, the system automatically creates a development user:

```json
{
  "user_id": "dev-user-12345",
  "user_email": "dev-user@ifrs9.local",
  "user_name": "Development User",
  "user_role": "IAF_TENANT_ADMIN",
  "tenant_id": "iaf",
  "tenant_slug": "iaf",
  "banking_type": "conventional",
  "authenticated": true,
  "dev_mode": true
}
```

### IAF User Roles (Production)
When authentication is enabled, users come from the IAF frontend with roles:

- `IAF_TENANT_SUPERADMIN` - Full system access
- `IAF_TENANT_ADMIN` - Tenant administration
- `IAF_BANK_CRO` - Chief Risk Officer
- `IAF_IFRS_MANAGER` - IFRS9 management
- `IAF_RISK_ANALYST` - Risk analysis
- `IAF_PORTFOLIO_MANAGER` - Portfolio management
- `IAF_DATA_ADMIN` - Data administration
- `IAF_REPORT_ANALYST` - Report analysis
- `IAF_AUDITOR` - Audit functions
- `IAF_VIEWER` - Read-only access

## 🔗 IAF Frontend Integration

### Authentication Flow
1. IAF frontend passes user parameters via URL
2. R Analytics validates user context
3. Role-based permissions are applied
4. User gets appropriate module access

### URL Parameters
When authentication is enabled, the IAF frontend passes these parameters:

```
https://iaf-ifrs-analytics.ifrspro.id?
  user_id=12345&
  user_email=user@iaf.co.id&
  user_name=John%20Doe&
  user_role=IAF_TENANT_ADMIN&
  tenant_id=iaf&
  tenant_slug=iaf&
  banking_type=conventional
```

## 📊 Module Access Control

### Available Modules
- **Home** - Dashboard and overview
- **Data** - Data input and management
- **Model** - Statistical modeling
- **Forecast** - Forecasting operations
- **PD AFL** - PD & AFL calculations

### Permission Matrix
Different roles have different levels of access:

| Role | Home | Data | Model | Forecast | PD AFL | Admin |
|------|------|------|-------|----------|-------|-------|
| IAF_VIEWER | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| IAF_DATA_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| IAF_TENANT_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🚦 Switching Between Modes

### For Development (Recommended)
```bash
./auth-manager.sh disable
./start-iaf-analytics.sh
```

### For Production/Testing
```bash
./auth-manager.sh enable
./start-iaf-analytics.sh
```

### Current Development Workflow
1. Authentication is disabled by default
2. Full access to all modules for testing
3. Debug logging enabled for troubleshooting
4. Easy to switch to production mode when ready

## 🔍 Debugging & Logging

### Debug Mode
- **Development Mode**: Always enabled
- **Production Mode**: Controlled by `R_ANALYTICS_DEBUG_MODE`

### Log Categories
- **Authentication Attempts**: Login/logout tracking
- **User Context**: User information logging
- **Permission Checks**: Access control logging
- **Module Access**: Module-specific access logs

### Viewing Logs
```bash
# View R Analytics logs
tail -f logs/iaf-analytics.log

# Check authentication status
./auth-manager.sh status
```

## 🔒 Security Features

### When Authentication is Enabled:
- ✅ User validation against IAF system
- ✅ Role-based access control
- ✅ Tenant-based isolation
- ✅ Session management
- ✅ Audit logging
- ✅ Permission validation

### When Authentication is Disabled:
- ⚠️ Development mode only
- ⚠️ Full access (use with caution)
- ⚠️ No user validation
- ⚠️ Debug logging enabled

## 📝 Configuration Guide

### Environment Variables
Key environment variables control authentication behavior:

```bash
# Main toggle
R_ANALYTICS_AUTH_ENABLED=false     # Enable/disable authentication

# Development settings
R_ANALYTICS_DEV_MODE=true          # Development mode
R_ANALYTICS_DEV_BYPASS_AUTH=true   # Bypass auth in development
R_ANALYTICS_DEV_AUTO_LOGIN=true    # Auto-login in development

# Production settings
R_ANALYTICS_PROD_AUTH_REQUIRED=true    # Require auth in production
R_ANALYTICS_PROD_SESSION_TIMEOUT=3600  # Session timeout

# IAF integration
R_ANALYTICS_IAF_INTEGRATION=true       # Enable IAF frontend integration
R_ANALYTICS_IAF_USER_VALIDATION=true    # Validate IAF users
R_ANALYTICS_IAF_TENANT_VALIDATION=true  # Validate tenant access
```

### Custom Development User
You can modify the development user in `config/auth-config.R`:

```r
get_dev_user_context <- function() {
  dev_user <- list(
    user_id = "custom-dev-user",
    user_email = "custom@yourdomain.com",
    user_name = "Custom Developer",
    user_role = "IAF_TENANT_ADMIN",  # Change role as needed
    tenant_id = "iaf",
    tenant_slug = "iaf",
    banking_type = "conventional",
    authenticated = TRUE,
    dev_mode = TRUE
  )
  return(dev_user)
}
```

## 🚀 Getting Started

### 1. Check Current Status
```bash
cd /home/doppelgaenger/ifrspro/ifrs9-iaf/packages/r-analytics
./auth-manager.sh status
```

### 2. Start R Analytics (Development Mode)
```bash
./start-iaf-analytics.sh
```

### 3. Access Dashboard
- **Local**: https://iaf-ifrs-analytics.ifrspro.id
- **No login required** (development mode)

### 4. When Ready for Production
```bash
./auth-manager.sh enable
./start-iaf-analytics.sh
```

## 📞 Support

For authentication-related issues:

1. Check status: `./auth-manager.sh status`
2. View logs: `tail -f logs/iaf-analytics.log`
3. Restart service: `./start-iaf-analytics.sh`
4. Toggle authentication: `./auth-manager.sh disable` (dev) / `enable` (prod)

---

**Current Status**: 🟢 **DEVELOPMENT MODE** - Authentication disabled for easy testing