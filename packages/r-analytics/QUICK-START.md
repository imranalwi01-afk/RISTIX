# R Analytics Quick Start Guide

## 🚀 **Quick Start**

### **1. Recommended Approach: Use Centralized Manager**

```bash
# Go to R Analytics directory
cd /home/doppelgaenger/ifrspro/ifrs9-iaf/packages/r-analytics

# Start the service
./r-analytics-manager.sh start

# Check status
./r-analytics-manager.sh status

# When done, stop the service
./r-analytics-manager.sh stop
```

### **2. Access the Dashboard**

- **Development URL**: https://iaf-ifrs-analytics.ifrspro.id
- **Local URL**: http://localhost:4236
- **Authentication**: Currently **DISABLED** (development mode)

## 🔧 **Authentication Management**

### **Current Status (Development)**
- ✅ Authentication: **DISABLED**
- ✅ Auto-login: **ENABLED**
- ✅ Full access: **AVAILABLE**
- ✅ Debug logging: **ENABLED**

### **Authentication Commands:**
```bash
# Check current status
./r-analytics-manager.sh auth status

# Disable authentication (development mode)
./r-analytics-manager.sh auth disable

# Enable authentication (production mode)
./r-analytics-manager.sh auth enable

# Restart to apply changes
./r-analytics-manager.sh restart
```

## 📋 **Available Commands**

### **Service Management:**
```bash
./r-analytics-manager.sh start      # Start service
./r-analytics-manager.sh stop       # Stop service
./r-analytics-manager.sh restart    # Restart service
./r-analytics-manager.sh status     # Check status
```

### **Authentication:**
```bash
./r-analytics-manager.sh auth enable   # Enable authentication
./r-analytics-manager.sh auth disable  # Disable authentication
./r-analytics-manager.sh auth status   # Check auth status
```

### **Troubleshooting:**
```bash
./r-analytics-manager.sh diag        # Run diagnostics
./r-analytics-manager.sh test        # Run tests
./r-analytics-manager.sh cleanup     # Clean up files
```

### **Help:**
```bash
./r-analytics-manager.sh help        # Show help
```

## 🎯 **What You Should Use**

### **Primary Script: `r-analytics-manager.sh`**
- ✅ **Recommended** for all operations
- ✅ Centralized management
- ✅ Easy to use commands
- ✅ Comprehensive status checking

### **Core Files:**
- ✅ `start-iaf-analytics.sh` - Main startup (called by manager)
- ✅ `shiny-app/start_iaf.R` - R configuration (called by startup)
- ✅ `app.R` - Main Shiny application (called by R script)

### **Never Use These (Removed):**
- ❌ `start-iaf-analytics-fixed.sh` - **DELETED** (outdated)
- ❌ `shiny-app/start.sh` - **DELETED** (redundant)
- ❌ `shiny-app/_unused/*` - **DELETED** (backup files)

## 🔗 **Service Architecture**

```
r-analytics-manager.sh
    ↓ (calls)
start-iaf-analytics.sh
    ↓ (calls with environment)
shiny-app/start_iaf.R
    ↓ (launches)
app.R (Shiny Application)
```

## 🚦 **Your Current Workflow**

### **For Development (Current):**
```bash
# 1. Start service
./r-analytics-manager.sh start

# 2. Access dashboard
# https://iaf-ifrs-analytics.ifrspro.id

# 3. No login required (authentication disabled)

# 4. Full access to all modules

# 5. Stop when done
./r-analytics-manager.sh stop
```

### **For Production:**
```bash
# 1. Enable authentication
./r-analytics-manager.sh auth enable

# 2. Start service
./r-analytics-manager.sh start

# 3. Access dashboard via IAF frontend
# https://iaf-ifrs-analytics.ifrspro.id
# (Will require login)

# 4. Monitor status
./r-analytics-manager.sh status
```

## 🔍 **Troubleshooting**

### **Service Won't Start:**
```bash
./r-analytics-manager.sh diag
./r-analytics-manager.sh cleanup
./r-analytics-manager.sh start
```

### **Authentication Issues:**
```bash
./r-analytics-manager.sh auth status
./r-analytics-manager.sh auth disable
./r-analytics-manager.sh restart
```

### **Port Conflicts:**
```bash
./r-analytics-manager.sh stop
./r-analytics-manager.sh cleanup
./r-analytics-manager.sh start
```

## 📞 **Support**

If you encounter issues:

1. **Check status first**: `./r-analytics-manager.sh status`
2. **Run diagnostics**: `./r-analytics-manager.sh diag`
3. **Check authentication**: `./r-analytics-manager.sh auth status`
4. **Clean and restart**: `./r-analytics-manager.sh cleanup && ./r-analytics-manager.sh start`

---

**🎉 Your R Analytics service is now centralized and easy to manage!**

**Primary Command**: `./r-analytics-manager.sh start`

**Current Authentication**: DISABLED (development mode)

**Access URL**: https://ifrs9-iaf-analytics.ifrspro.id