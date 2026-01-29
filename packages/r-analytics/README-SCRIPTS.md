# R Analytics Scripts Guide

## 🚀 Overview

This directory contains centralized management scripts for the IAF R Analytics Shiny application. The system has been streamlined to eliminate redundancy and provide easy-to-use management tools.

## 📋 Recommended Scripts to Use

### 🎯 **Primary Script: `r-analytics-manager.sh`**

**NEW CENTRAL MANAGER** - This is the **recommended script** for all operations:

```bash
# Start the R Analytics service
./r-analytics-manager.sh start

# Stop the R Analytics service
./r-analytics-manager.sh stop

# Restart the service
./r-analytics-manager.sh restart

# Check service status
./r-analytics-manager.sh status

# Manage authentication
./r-analytics-manager.sh auth status
./r-analytics-manager.sh auth enable
./r-analytics-manager.sh auth disable

# Run diagnostics
./r-analytics-manager.sh diag

# Run tests
./r-analytics-manager.sh test

# Clean up logs and temporary files
./r-analytics-manager.sh cleanup

# Show help
./r-analytics-manager.sh help
```

## 🔧 **Core Scripts (Keep These)**

### 1. **`start-iaf-analytics.sh`** - Main Startup Script ⭐
- **Purpose**: Primary startup script with comprehensive configuration
- **Features**: Smart environment detection, port management, authentication loading
- **Status**: ✅ **Keep and use**
- **Called by**: `r-analytics-manager.sh start`

### 2. **`shiny-app/start_iaf.R`** - R Configuration Script ⭐
- **Purpose**: R script that sets up environment and launches Shiny app
- **Features**: Database testing, environment configuration, app launching
- **Status**: ✅ **Keep** (called by main startup script)
- **Called by**: `start-iaf-analytics.sh`

### 3. **`stop-all-services.sh`** - Service Management ⭐
- **Purpose**: Gracefully stops all R Analytics services
- **Features**: PID tracking, port cleanup, process termination
- **Status**: ✅ **Keep** (for service management)
- **Called by**: `r-analytics-manager.sh stop`

### 4. **`auth-manager.sh`** - Authentication Management ⭐
- **Purpose**: Centralized authentication control
- **Features**: Enable/disable authentication, status checking
- **Status**: ✅ **Keep** (recently created)
- **Called by**: `r-analytics-manager.sh auth`

### 5. **`r-diagnostic.sh`** - Diagnostics Tool ⭐
- **Purpose**: System health checks and troubleshooting
- **Features**: Database connections, service status, configuration validation
- **Status**: ✅ **Keep** (for troubleshooting)
- **Called by**: `r-analytics-manager.sh diag`

### 6. **`test-r-analytics.sh`** - Testing Suite ⭐
- **Purpose**: Comprehensive testing of all components
- **Features**: Functional tests, integration tests, performance tests
- **Status**: ✅ **Keep** (for validation)
- **Called by**: `r-analytics-manager.sh test`

## 🗑️ **Removed Scripts (No Longer Needed)**

The following scripts have been **removed** as they were redundant or outdated:

- ❌ `start-iaf-analytics-fixed.sh` - Outdated ECS-specific configuration
- ❌ `shiny-app/start.sh` - Duplicated functionality, less comprehensive
- ❌ `shiny-app/_unused/` - Backup directory with old scripts

## 🚀 **Recommended Workflow**

### Daily Development:

```bash
# Start development environment (authentication disabled)
./r-analytics-manager.sh start

# Check status
./r-analytics-manager.sh status

# When done, stop the service
./r-analytics-manager.sh stop
```

### Authentication Management:

```bash
# Check current authentication status
./r-analytics-manager.sh auth status

# Disable authentication for development
./r-analytics-manager.sh auth disable

# Enable authentication for testing
./r-analytics-manager.sh auth enable

# Restart to apply changes
./r-analytics-manager.sh restart
```

### Troubleshooting:

```bash
# Run diagnostics
./r-analytics-manager.sh diag

# Run tests
./r-analytics-manager.sh test

# Check service status
./r-analytics-manager.sh status

# Clean up if needed
./r-analytics-manager.sh cleanup
```

## 📊 **Script Architecture**

### How Scripts Work Together:

```
r-analytics-manager.sh (Central Manager)
    |
    +-- start: start-iaf-analytics.sh
    |       |
    |       +-- Loads environment variables
    |       +-- Calls shiny-app/start_iaf.R
    |       |
    |       +-- Sets up R environment
    |       +-- Launches app.R (Shiny)
    |
    +-- stop: stop-all-services.sh
    |
    +-- auth: auth-manager.sh
    |
    +-- diag: r-diagnostic.sh
    |
    +-- test: test-r-analytics.sh
```

### File Structure:

```
packages/r-analytics/
├── r-analytics-manager.sh          # 🔧 NEW: Central manager (RECOMMENDED)
├── start-iaf-analytics.sh          # 🚀 Main startup script
├── stop-all-services.sh             # 🛑 Service stopper
├── auth-manager.sh                 # 🔐 Authentication manager
├── r-diagnostic.sh                 # 🔍 Diagnostics
├── test-r-analytics.sh              # 🧪 Testing suite
└── shiny-app/
    ├── start_iaf.R                 # ⚙️ R configuration
    ├── app.R                       # 📱 Main Shiny application
    └── global.R                    # 🌐 Global functions
```

## 🔍 **Configuration Management**

### Environment Variables:

The scripts automatically load and manage these environment variables:

- `DEPLOYMENT_TARGET` - localdev|iafecs (auto-detected)
- `R_PORT` - 4236 (R Analytics dashboard)
- `R_SERVICE_PORT` - 4241 (Calculation API)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` - Database connection
- `BANKING_TYPE` - conventional|syariah|dual
- `TENANT_SLUG` - iaf|metro|syariah|dana
- `R_ANALYTICS_AUTH_ENABLED` - Authentication toggle
- `NODE_ENV` - development|production

### Authentication Configuration:

Authentication is controlled by `config/auth.env`:

```bash
# Current (Development Mode)
R_ANALYTICS_AUTH_ENABLED=false
R_ANALYTICS_DEV_MODE=true
R_ANALYTICS_DEV_BYPASS_AUTH=true
```

## 🌐 **Service URLs**

### Development (localdev):
- **Dashboard**: https://iaf-ifrs-analytics.ifrspro.id
- **Local**: http://localhost:4236

### Production (iafecs):
- **Dashboard**: https://iaf-ifrs-analytics.danafin.com
- **Local**: http://10.18.11.35:4236

## 🔧 **Quick Start Commands**

### First Time Setup:

```bash
# Check authentication status
./r-analytics-manager.sh auth status

# Start service (development mode)
./r-analytics-manager.sh start

# Access the dashboard
# https://iaf-ifrs-analytics.ifrspro.id
```

### Production Deployment:

```bash
# Enable authentication for production
./r-analytics-manager.sh auth enable

# Start service
./r-analytics-manager.sh start

# Verify deployment
./r-analytics-manager.sh status
```

## 🛠️ **Troubleshooting Guide**

### Service Won't Start:

1. Check directories: `ls -la shiny-app/`
2. Run diagnostics: `./r-analytics-manager.sh diag`
3. Check ports: `netstat -tlnp | grep 4236`
4. Check logs: `tail -f logs/*.log`

### Authentication Issues:

1. Check auth status: `./r-analytics-manager.sh auth status`
2. Disable for development: `./r-analytics-manager.sh auth disable`
3. Restart service: `./r-analytics-manager.sh restart`

### Port Conflicts:

1. Stop service: `./r-analytics-manager.sh stop`
2. Check processes: `ps aux | grep R`
3. Force cleanup: `./r-analytics-manager.sh cleanup`
4. Start again: `./r-analytics-manager.sh start`

## 📝 **Script Development**

### Adding New Management Functions:

1. Add command to `r-analytics-manager.sh` case statement
2. Create helper functions as needed
3. Add documentation to this README

### Environment Configuration:

- Main config: `start-iaf-analytics.sh`
- R config: `shiny-app/start_iaf.R`
- Auth config: `config/auth.env`
- Database config: Loaded from environment variables

## 🎯 **Best Practices**

### Development Workflow:
1. Use `r-analytics-manager.sh` for all operations
2. Check `./r-analytics-manager.sh status` before making changes
3. Use `./r-analytics-manager.sh diag` for troubleshooting
4. Clean up with `./r-analytics-manager.sh cleanup` when needed

### Production Deployment:
1. Enable authentication: `./r-analytics-manager.sh auth enable`
2. Verify with: `./r-analytics-manager.sh test`
3. Deploy with proper environment variables
4. Monitor with: `./r-analytics-manager.sh status`

### Authentication Management:
1. Development: Keep disabled (`auth disable`)
2. Production: Enable (`auth enable`)
3. Testing: Toggle as needed
4. Always restart after changes

---

## 🎉 **Summary**

The R Analytics scripts have been **centralized and streamlined**:

- ✅ **One primary script**: `r-analytics-manager.sh` for all operations
- ✅ **Smart auto-detection**: Handles localdev and production automatically
- ✅ **Centralized authentication**: Easy enable/disable control
- ✅ **Comprehensive logging**: Detailed status and error information
- ✅ **Removed redundancy**: Eliminated duplicate and outdated scripts
- ✅ **Professional management**: PID tracking, graceful shutdown, diagnostics

**Use `./r-analytics-manager.sh` as your primary tool for all R Analytics operations!** 🚀