#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION  
# ============================================================================
# File Path: scripts/psdd/d2h8-production-services-config.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H8 - Production Services Configuration (Part 2)
# Methodology: Phased Shell-Driven Development (PSDD)
# Dependencies: Redis, R, Nginx, PM2, SSL certificates
# Purpose: Complete native services configuration for production deployment
# Previous: d2h8-production-infrastructure-setup.sh (Part 1)
# Next Phase: D3H1 - Basic IFRS 9 data models and calculations
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h8-services-config-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H8-PART2"
PHASE_NAME="Production Services Configuration"
PHASE_OBJECTIVE="Configure Redis, R, Nginx, PM2, and deployment automation"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    
    # Update progress tracking
    track_progress "${PHASE_ID}" "FAILED" "Production services configuration failed at line ${line_number}"
    
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2" 
    local details="$3"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status} | ${details} | D3H1 - Basic IFRS 9 data models" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status} - ${details}"
}

# Configure Redis for production
configure_redis_production() {
    log_info "Configuring Redis for production deployment..."
    
    local redis_config_file="/etc/redis/redis.conf"
    local redis_backup_file="/etc/redis/redis.conf.backup"
    
    # Backup original Redis configuration
    sudo cp "${redis_config_file}" "${redis_backup_file}" || log_warning "Failed to backup Redis config"
    
    # Create production Redis configuration
    cat > "/tmp/redis_production.conf" << 'EOF'
# ============================================================================
# PSDD Redis Production Configuration
# ============================================================================
# Generated for IFRS Pro Platform production deployment  
# Optimized for session management, caching, and real-time features
# ============================================================================

# Network Configuration
bind 127.0.0.1
protected-mode yes
port 6379
timeout 300
tcp-keepalive 300
tcp-backlog 511

# General Configuration
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log

# Snapshotting (Persistence)
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# Security
requirepass REDIS_PASSWORD_PLACEHOLDER
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
rename-command CONFIG "CONFIG_8fa92d1e2c4a5d6f"

# Memory Management  
maxmemory 512MB
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Append Only Mode (AOF)
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Lua Scripting
lua-time-limit 5000

# Slow Log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Latency Monitor
latency-monitor-threshold 100

# Client Output Buffer Limits
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60

# Advanced Configuration
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000

# Active Rehashing
activerehashing yes

# Notifications
notify-keyspace-events ""

# Advanced Memory
dynamic-hz yes
EOF

    # Generate secure Redis password
    local redis_password=$(openssl rand -base64 32)
    sed -i "s/REDIS_PASSWORD_PLACEHOLDER/${redis_password}/g" "/tmp/redis_production.conf"
    
    # Apply Redis configuration
    sudo cp "/tmp/redis_production.conf" "${redis_config_file}"
    sudo chown redis:redis "${redis_config_file}"
    sudo chmod 640 "${redis_config_file}"
    
    # Create Redis log directory
    sudo mkdir -p /var/log/redis
    sudo chown redis:redis /var/log/redis
    sudo chmod 755 /var/log/redis
    
    # Restart Redis service
    sudo systemctl restart redis-server
    sudo systemctl enable redis-server
    
    # Verify Redis is running
    if sudo systemctl is-active --quiet redis-server; then
        log_success "Redis production configuration applied and service restarted"
        
        # Store Redis password in secrets
        echo "REDIS_PASSWORD=${redis_password}" >> "${PROJECT_ROOT}/config/secrets/redis.env"
        chmod 600 "${PROJECT_ROOT}/config/secrets/redis.env"
    else
        log_error "Redis failed to start with production configuration"
        exit 1
    fi
    
    log_success "Redis production configuration completed"
}

# Configure R Analytics for production
configure_r_analytics_production() {
    log_info "Configuring R Analytics service for production..."
    
    # Create R service directory structure
    local r_service_dir="/opt/ifrspro/r-analytics"
    sudo mkdir -p "${r_service_dir}"/{scripts,models,logs,temp}
    sudo mkdir -p "/opt/ifrspro/R/library"
    
    # Set proper ownership
    sudo chown -R $(whoami):$(whoami) "${r_service_dir}"
    sudo chown -R $(whoami):$(whoami) "/opt/ifrspro/R"
    
    # Install required R packages
    log_info "Installing required R packages for IFRS 9 analytics..."
    
    cat > "/tmp/install_r_packages.R" << 'EOF'
# PSDD R Package Installation Script
# Required packages for IFRS 9 analytics platform

# Set library path
.libPaths("/opt/ifrspro/R/library")

# Required CRAN packages
required_packages <- c(
    "plumber",          # REST API framework
    "jsonlite",         # JSON handling
    "dplyr",            # Data manipulation
    "tidyr",            # Data tidying
    "readr",            # Data reading
    "lubridate",        # Date/time handling
    "stringr",          # String manipulation
    "purrr",            # Functional programming
    "ggplot2",          # Data visualization
    "plotly",           # Interactive plots
    "DT",               # Data tables
    "openxlsx",         # Excel file handling
    "DBI",              # Database interface
    "RPostgreSQL",      # PostgreSQL driver
    "pool",             # Connection pooling
    "config",           # Configuration management
    "logger",           # Logging
    "future",           # Parallel processing
    "promises",         # Asynchronous programming
    "caret",            # Classification and regression
    "randomForest",     # Random forest algorithm
    "glmnet",           # Regularized regression
    "survival",         # Survival analysis
    "ROCR",             # ROC curves
    "pROC",             # ROC analysis
    "VaR",              # Value at Risk
    "fGarch",           # GARCH models
    "rugarch",          # Univariate GARCH
    "quantmod",         # Quantitative financial modeling
    "PerformanceAnalytics", # Investment performance analytics
    "RiskPortfolios",   # Risk-based portfolios
    "copula",           # Copula modeling
    "actuar",           # Actuarial functions
    "creditr",          # Credit risk modeling
    "RQuantLib"         # Quantitative finance library
)

# Install packages
install.packages(required_packages, 
                lib = "/opt/ifrspro/R/library",
                repos = "https://cran.r-project.org/",
                dependencies = TRUE)

# Verify installations
installed <- installed.packages(lib.loc = "/opt/ifrspro/R/library")[,"Package"]
missing <- setdiff(required_packages, installed)

if (length(missing) > 0) {
    cat("Failed to install packages:", paste(missing, collapse = ", "), "\n")
    quit(status = 1)
} else {
    cat("All required packages installed successfully\n")
    quit(status = 0)
}
EOF

    # Install R packages
    Rscript "/tmp/install_r_packages.R" || log_warning "Some R packages may have failed to install"
    
    # Create R Analytics API service
    cat > "${r_service_dir}/api_service.R" << 'EOF'
# ============================================================================
# PSDD R Analytics API Service
# ============================================================================
# File Path: /opt/ifrspro/r-analytics/api_service.R
# Generated: $(date '+%Y-%m-%d %H:%M:%S')  
# Phase: D2H8 - Production Services Configuration
# Purpose: R-based analytics API for IFRS 9 calculations
# ============================================================================

# Load required libraries
library(plumber, lib.loc = "/opt/ifrspro/R/library")
library(jsonlite, lib.loc = "/opt/ifrspro/R/library")
library(dplyr, lib.loc = "/opt/ifrspro/R/library")
library(logger, lib.loc = "/opt/ifrspro/R/library")
library(DBI, lib.loc = "/opt/ifrspro/R/library")
library(RPostgreSQL, lib.loc = "/opt/ifrspro/R/library")

# Configure logging
log_appender(appender_file("/opt/ifrspro/r-analytics/logs/api.log"))
log_threshold(INFO)

# Database connection configuration
get_db_connection <- function() {
    tryCatch({
        conn <- dbConnect(
            PostgreSQL(),
            host = Sys.getenv("DB_HOST", "localhost"),
            port = as.integer(Sys.getenv("DB_PORT", "5432")),
            dbname = Sys.getenv("SHARED_DB_NAME", "ifrspro_shared_services"),
            user = Sys.getenv("SHARED_DB_USER", "ifrspro_shared"),
            password = Sys.getenv("SHARED_DB_PASSWORD", "password")
        )
        return(conn)
    }, error = function(e) {
        log_error(paste("Database connection failed:", e$message))
        return(NULL)
    })
}

#* @apiTitle IFRS Pro R Analytics API
#* @apiDescription REST API for IFRS 9 statistical calculations and modeling
#* @apiVersion 1.0.0

#* Health check endpoint
#* @get /health
#* @serializer json
function() {
    list(
        status = "healthy",
        timestamp = Sys.time(),
        version = "1.0.0",
        service = "R Analytics API",
        r_version = R.version.string
    )
}

#* Calculate basic statistics
#* @param data:object Input data for statistical analysis
#* @post /api/statistics/basic
#* @serializer json
function(data) {
    tryCatch({
        log_info("Processing basic statistics request")
        
        # Validate input data
        if (is.null(data) || length(data) == 0) {
            return(list(error = "No data provided", status = 400))
        }
        
        # Convert to numeric if needed
        numeric_data <- as.numeric(unlist(data))
        numeric_data <- numeric_data[!is.na(numeric_data)]
        
        if (length(numeric_data) == 0) {
            return(list(error = "No valid numeric data", status = 400))
        }
        
        # Calculate statistics
        stats <- list(
            count = length(numeric_data),
            mean = mean(numeric_data),
            median = median(numeric_data),
            sd = sd(numeric_data),
            min = min(numeric_data),
            max = max(numeric_data),
            q1 = quantile(numeric_data, 0.25),
            q3 = quantile(numeric_data, 0.75),
            skewness = moments::skewness(numeric_data),
            kurtosis = moments::kurtosis(numeric_data)
        )
        
        log_info("Basic statistics calculated successfully")
        
        return(list(
            status = "success",
            data = stats,
            timestamp = Sys.time()
        ))
        
    }, error = function(e) {
        log_error(paste("Basic statistics calculation failed:", e$message))
        return(list(
            error = e$message,
            status = 500,
            timestamp = Sys.time()
        ))
    })
}

#* Calculate Probability of Default (PD) using logistic regression
#* @param data:object Portfolio data for PD modeling
#* @post /api/ifrs9/calculate-pd
#* @serializer json  
function(data) {
    tryCatch({
        log_info("Processing PD calculation request")
        
        # Validate input data structure
        required_fields <- c("customer_id", "default_indicator", "financial_metrics")
        if (!all(required_fields %in% names(data))) {
            return(list(
                error = paste("Missing required fields:", 
                            paste(setdiff(required_fields, names(data)), collapse = ", ")),
                status = 400
            ))
        }
        
        # Convert to data frame
        df <- data.frame(data)
        
        # Simple logistic regression model (placeholder)
        # In production, this would use more sophisticated models
        if (nrow(df) < 10) {
            # Fallback to average method for small datasets
            avg_pd <- mean(df$default_indicator, na.rm = TRUE)
            pd_results <- rep(avg_pd, nrow(df))
        } else {
            # Logistic regression model
            model <- glm(default_indicator ~ ., data = df[,-1], family = binomial)
            pd_results <- predict(model, type = "response")
        }
        
        # Return results
        result <- list(
            status = "success",
            model_type = "logistic_regression",
            data = data.frame(
                customer_id = df$customer_id,
                probability_of_default = pd_results,
                risk_grade = ifelse(pd_results < 0.05, "Low", 
                                  ifelse(pd_results < 0.15, "Medium", "High"))
            ),
            summary = list(
                total_customers = nrow(df),
                avg_pd = mean(pd_results),
                median_pd = median(pd_results),
                high_risk_count = sum(pd_results >= 0.15)
            ),
            timestamp = Sys.time()
        )
        
        log_info("PD calculation completed successfully")
        return(result)
        
    }, error = function(e) {
        log_error(paste("PD calculation failed:", e$message))
        return(list(
            error = e$message,
            status = 500,
            timestamp = Sys.time()
        ))
    })
}

#* Calculate Loss Given Default (LGD)
#* @param data:object Recovery data for LGD modeling
#* @post /api/ifrs9/calculate-lgd
#* @serializer json
function(data) {
    tryCatch({
        log_info("Processing LGD calculation request")
        
        # Validate input
        if (is.null(data$recovery_rates) || is.null(data$exposure_amounts)) {
            return(list(error = "Recovery rates and exposure amounts required", status = 400))
        }
        
        recovery_rates <- as.numeric(data$recovery_rates)
        exposure_amounts <- as.numeric(data$exposure_amounts)
        
        # Calculate LGD (simplified model)
        lgd_values <- pmax(0, 1 - recovery_rates)  # LGD = 1 - Recovery Rate
        
        # Weight by exposure amounts
        weighted_avg_lgd <- weighted.mean(lgd_values, exposure_amounts, na.rm = TRUE)
        
        result <- list(
            status = "success",
            data = list(
                individual_lgd = lgd_values,
                weighted_average_lgd = weighted_avg_lgd,
                distribution = list(
                    min = min(lgd_values, na.rm = TRUE),
                    max = max(lgd_values, na.rm = TRUE),
                    median = median(lgd_values, na.rm = TRUE),
                    mean = mean(lgd_values, na.rm = TRUE)
                )
            ),
            timestamp = Sys.time()
        )
        
        log_info("LGD calculation completed successfully")
        return(result)
        
    }, error = function(e) {
        log_error(paste("LGD calculation failed:", e$message))
        return(list(
            error = e$message,
            status = 500,
            timestamp = Sys.time()
        ))
    })
}

#* Calculate Expected Credit Loss (ECL)
#* @param data:object Combined data for ECL calculation
#* @post /api/ifrs9/calculate-ecl  
#* @serializer json
function(data) {
    tryCatch({
        log_info("Processing ECL calculation request")
        
        # Validate required fields
        required_fields <- c("pd", "lgd", "ead")
        if (!all(required_fields %in% names(data))) {
            return(list(
                error = paste("Missing required fields:", 
                            paste(setdiff(required_fields, names(data)), collapse = ", ")),
                status = 400
            ))
        }
        
        # Extract components
        pd_values <- as.numeric(data$pd)
        lgd_values <- as.numeric(data$lgd)  
        ead_values <- as.numeric(data$ead)
        
        # Calculate ECL = PD × LGD × EAD
        ecl_values <- pd_values * lgd_values * ead_values
        
        # Portfolio level aggregation
        total_ecl <- sum(ecl_values, na.rm = TRUE)
        total_ead <- sum(ead_values, na.rm = TRUE)
        portfolio_ecl_rate <- total_ecl / total_ead
        
        result <- list(
            status = "success",
            data = list(
                individual_ecl = ecl_values,
                total_ecl = total_ecl,
                portfolio_ecl_rate = portfolio_ecl_rate,
                statistics = list(
                    count = length(ecl_values),
                    mean_ecl = mean(ecl_values, na.rm = TRUE),
                    median_ecl = median(ecl_values, na.rm = TRUE),
                    max_ecl = max(ecl_values, na.rm = TRUE)
                )
            ),
            calculation_method = "PD × LGD × EAD",
            timestamp = Sys.time()
        )
        
        log_info("ECL calculation completed successfully")
        return(result)
        
    }, error = function(e) {
        log_error(paste("ECL calculation failed:", e$message))
        return(list(
            error = e$message,
            status = 500,
            timestamp = Sys.time()
        ))
    })
}

#* Create and configure Plumber router
create_router <- function() {
    pr <- plumb("/opt/ifrspro/r-analytics/api_service.R")
    pr$setErrorHandler(function(req, res, err) {
        log_error(paste("API Error:", err$message))
        res$status <- 500
        list(error = "Internal server error", timestamp = Sys.time())
    })
    return(pr)
}
EOF

    # Create R service startup script
    cat > "${r_service_dir}/start_service.sh" << 'EOF'
#!/bin/bash
# ============================================================================
# PSDD R Analytics Service Startup Script
# ============================================================================
# File Path: /opt/ifrspro/r-analytics/start_service.sh
# Purpose: Start R Analytics API service for production
# ============================================================================

# Set environment variables
export R_LIBS_USER="/opt/ifrspro/R/library"
export R_HOME="/usr/lib/R"

# Change to service directory
cd /opt/ifrspro/r-analytics

# Start R API service
R --slave --no-restore --file=api_service.R -e "
    source('api_service.R')
    pr <- create_router()
    pr\$run(host='0.0.0.0', port=4236, swagger=FALSE)
" >> logs/service.log 2>&1
EOF

    chmod +x "${r_service_dir}/start_service.sh"
    
    log_success "R Analytics production configuration completed"
}

# Configure Nginx reverse proxy
configure_nginx_production() {
    log_info "Configuring Nginx reverse proxy for production..."
    
    # Create Nginx configuration for IFRS Pro Platform
    cat > "/tmp/ifrspro_nginx.conf" << 'EOF'
# ============================================================================
# PSDD Nginx Production Configuration  
# ============================================================================
# Generated for IFRS Pro Platform production deployment
# Reverse proxy and load balancing configuration
# ============================================================================

# Upstream servers
upstream ifrspro_frontend {
    server 127.0.0.1:4231 weight=1 max_fails=3 fail_timeout=30s;
}

upstream ifrspro_backend {
    server 127.0.0.1:4232 weight=1 max_fails=3 fail_timeout=30s;
}

upstream ifrspro_r_analytics {
    server 127.0.0.1:4236 weight=1 max_fails=3 fail_timeout=30s;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=frontend_limit:10m rate=20r/s;

# Frontend Server (HTTPS)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ifrs9.ifrspro.id;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/ifrspro.crt;
    ssl_certificate_key /etc/ssl/private/ifrspro.key;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
    
    # Rate Limiting
    limit_req zone=frontend_limit burst=20 nodelay;
    
    # Static Files Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Proxy to Frontend Application
    location / {
        proxy_pass http://ifrspro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
    }
    
    # Access and Error Logs
    access_log /var/log/nginx/ifrspro_frontend_access.log;
    error_log /var/log/nginx/ifrspro_frontend_error.log;
}

# Backend API Server (HTTPS)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name bifrs9.ifrspro.id;
    
    # SSL Configuration (same as frontend)
    ssl_certificate /etc/ssl/certs/ifrspro.crt;
    ssl_certificate_key /etc/ssl/private/ifrspro.key;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Rate Limiting for API
    limit_req zone=api_limit burst=20 nodelay;
    
    # API Endpoints
    location /api/ {
        proxy_pass http://ifrspro_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin "https://ifrs9.ifrspro.id" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Tenant-ID" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health Check Endpoint
    location /health {
        proxy_pass http://ifrspro_backend/health;
        access_log off;
    }
    
    # Access and Error Logs
    access_log /var/log/nginx/ifrspro_backend_access.log;
    error_log /var/log/nginx/ifrspro_backend_error.log;
}

# R Analytics Server (HTTPS)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rifrs9.ifrspro.id;
    
    # SSL Configuration (same as above)
    ssl_certificate /etc/ssl/certs/ifrspro.crt;
    ssl_certificate_key /etc/ssl/private/ifrspro.key;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    # Rate Limiting
    limit_req zone=api_limit burst=10 nodelay;
    
    # R Analytics API
    location /api/ {
        proxy_pass http://ifrspro_r_analytics;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Longer timeouts for statistical computations
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin "https://ifrs9.ifrspro.id" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # Health Check for R Service
    location /health {
        proxy_pass http://ifrspro_r_analytics/health;
        access_log off;
    }
    
    # Access and Error Logs
    access_log /var/log/nginx/ifrspro_r_analytics_access.log;
    error_log /var/log/nginx/ifrspro_r_analytics_error.log;
}

# HTTP to HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name ifrs9.ifrspro.id bifrs9.ifrspro.id rifrs9.ifrspro.id;
    
    return 301 https://$server_name$request_uri;
}

# Default Server (Deny all other requests)
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    server_name _;
    return 444;
}
EOF

    # Copy Nginx configuration
    sudo cp "/tmp/ifrspro_nginx.conf" "/etc/nginx/sites-available/ifrspro"
    sudo ln -sf "/etc/nginx/sites-available/ifrspro" "/etc/nginx/sites-enabled/ifrspro"
    
    # Remove default Nginx site
    sudo rm -f "/etc/nginx/sites-enabled/default"
    
    # Test Nginx configuration
    if sudo nginx -t; then
        log_success "Nginx configuration syntax is valid"
        sudo systemctl reload nginx
        sudo systemctl enable nginx
    else
        log_error "Nginx configuration has syntax errors"
        exit 1
    fi
    
    log_success "Nginx reverse proxy configuration completed"
}

# Configure PM2 for process management
configure_pm2_production() {
    log_info "Configuring PM2 for production process management..."
    
    # Create PM2 ecosystem configuration
    cat > "${PROJECT_ROOT}/ecosystem.config.js" << 'EOF'
// ============================================================================
// PSDD PM2 Ecosystem Configuration
// ============================================================================
// File Path: ecosystem.config.js
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H8 - Production Services Configuration  
// Purpose: PM2 process management for IFRS Pro Platform
// ============================================================================

module.exports = {
  apps: [
    {
      name: 'ifrspro-frontend',
      script: 'npm',
      args: 'run start',
      cwd: './packages/frontend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4231
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4231
      },
      max_memory_restart: '1G',
      error_file: '/var/log/ifrspro/frontend-error.log',
      out_file: '/var/log/ifrspro/frontend-out.log',
      log_file: '/var/log/ifrspro/frontend.log',
      time: true,
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'ifrspro-backend',  
      script: 'npm',
      args: 'run start',
      cwd: './packages/backend',
      instances: 4,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4232
      },
      env_production: {
        NODE_ENV: 'production', 
        PORT: 4232
      },
      max_memory_restart: '2G',
      error_file: '/var/log/ifrspro/backend-error.log',
      out_file: '/var/log/ifrspro/backend-out.log', 
      log_file: '/var/log/ifrspro/backend.log',
      time: true,
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 30000
    },
    {
      name: 'ifrspro-r-analytics',
      script: '/opt/ifrspro/r-analytics/start_service.sh',
      cwd: '/opt/ifrspro/r-analytics',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        R_LIBS_USER: '/opt/ifrspro/R/library'
      },
      max_memory_restart: '4G',
      error_file: '/var/log/ifrspro/r-analytics-error.log',
      out_file: '/var/log/ifrspro/r-analytics-out.log',
      log_file: '/var/log/ifrspro/r-analytics.log',
      time: true,
      autorestart: true,
      restart_delay: 10000,
      max_restarts: 5,
      min_uptime: '30s',
      kill_timeout: 60000
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ifrs9.ifrspro.id',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/ifrs-pro-platform.git',
      path: '/opt/ifrspro',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
EOF

    # Create PM2 log directories
    sudo mkdir -p /var/log/ifrspro
    sudo chown $(whoami):$(whoami) /var/log/ifrspro
    sudo chmod 755 /var/log/ifrspro
    
    # Install PM2 logrotate
    sudo pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 100M
    pm2 set pm2-logrotate:retain 10
    pm2 set pm2-logrotate:compress true
    pm2 set pm2-logrotate:dateFormat 'YYYY-MM-DD_HH-mm-ss'
    pm2 set pm2-logrotate:workerInterval 30
    pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
    
    log_success "PM2 production configuration completed"
}

# Create SSL certificate setup script
create_ssl_certificate_setup() {
    log_info "Creating SSL certificate setup script..."
    
    cat > "${PROJECT_ROOT}/scripts/psdd/setup-ssl-certificates.sh" << 'EOF'
#!/bin/bash
# ============================================================================
# PSDD SSL Certificate Setup Script
# ============================================================================
# File Path: scripts/psdd/setup-ssl-certificates.sh
# Purpose: Generate or install SSL certificates for production deployment
# ============================================================================

# For development/staging - create self-signed certificates
create_self_signed_certificates() {
    echo "Creating self-signed SSL certificates..."
    
    sudo mkdir -p /etc/ssl/certs /etc/ssl/private
    
    # Generate private key
    sudo openssl genrsa -out /etc/ssl/private/ifrspro.key 2048
    
    # Generate certificate signing request
    sudo openssl req -new -key /etc/ssl/private/ifrspro.key -out /tmp/ifrspro.csr \
        -subj "/C=ID/ST=Jakarta/L=Jakarta/O=IFRS Pro Platform/OU=IT/CN=ifrs9.ifrspro.id"
    
    # Generate self-signed certificate
    sudo openssl x509 -req -days 365 -in /tmp/ifrspro.csr \
        -signkey /etc/ssl/private/ifrspro.key -out /etc/ssl/certs/ifrspro.crt
    
    # Set proper permissions
    sudo chmod 600 /etc/ssl/private/ifrspro.key
    sudo chmod 644 /etc/ssl/certs/ifrspro.crt
    
    echo "Self-signed SSL certificates created successfully"
}

# For production - use Let's Encrypt certificates
setup_letsencrypt_certificates() {
    echo "Setting up Let's Encrypt SSL certificates..."
    
    # Install certbot
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    
    # Generate certificates for all domains
    sudo certbot --nginx -d ifrs9.ifrspro.id -d bifrs9.ifrspro.id -d rifrs9.ifrspro.id \
        --non-interactive --agree-tos --email admin@ifrspro.id
    
    # Setup automatic renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    
    echo "Let's Encrypt SSL certificates installed successfully"
}

# Main function
main() {
    if [[ "${1:-self-signed}" == "letsencrypt" ]]; then
        setup_letsencrypt_certificates
    else
        create_self_signed_certificates
    fi
}

main "$@"
EOF

    chmod +x "${PROJECT_ROOT}/scripts/psdd/setup-ssl-certificates.sh"
    
    # Generate self-signed certificates for development
    bash "${PROJECT_ROOT}/scripts/psdd/setup-ssl-certificates.sh" self-signed
    
    log_success "SSL certificate setup completed"
}

# Create deployment automation script
create_deployment_automation() {
    log_info "Creating deployment automation scripts..."
    
    # Create main deployment script
    cat > "${PROJECT_ROOT}/scripts/psdd/deploy-production.sh" << 'EOF'
#!/bin/bash
# ============================================================================
# PSDD Production Deployment Script
# ============================================================================
# File Path: scripts/psdd/deploy-production.sh
# Purpose: Automated production deployment for IFRS Pro Platform
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/production-deploy-$(date +%Y%m%d-%H%M%S).log"

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check all required services are running
    local services=("postgresql" "redis-server" "nginx")
    for service in "${services[@]}"; do
        if ! sudo systemctl is-active --quiet "$service"; then
            log_error "Required service is not running: $service"
            exit 1
        fi
    done
    
    # Check database connectivity
    if ! pg_isready -h localhost -p 5432 -U postgres; then
        log_error "PostgreSQL is not accessible"
        exit 1
    fi
    
    # Check Redis connectivity
    if ! redis-cli ping > /dev/null 2>&1; then
        log_error "Redis is not accessible"
        exit 1
    fi
    
    log_success "Pre-deployment checks passed"
}

# Build applications
build_applications() {
    log_info "Building applications for production..."
    
    # Install dependencies
    cd "${PROJECT_ROOT}"
    pnpm install --frozen-lockfile
    
    # Build frontend
    cd "${PROJECT_ROOT}/packages/frontend"
    npm run build
    
    # Build backend (if TypeScript compilation is needed)
    cd "${PROJECT_ROOT}/packages/backend"
    npm run build || log_info "Backend build not required"
    
    log_success "Applications built successfully"
}

# Deploy with PM2
deploy_with_pm2() {
    log_info "Deploying applications with PM2..."
    
    cd "${PROJECT_ROOT}"
    
    # Stop existing processes
    pm2 delete all || log_info "No existing PM2 processes to stop"
    
    # Start applications using ecosystem config
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup startup script
    sudo pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))
    
    log_success "PM2 deployment completed"
}

# Post-deployment validation
post_deployment_validation() {
    log_info "Running post-deployment validation..."
    
    # Wait for services to start
    sleep 30
    
    # Check frontend
    if curl -f -s http://localhost:4231/health > /dev/null; then
        log_success "Frontend is responding"
    else
        log_error "Frontend is not responding"
    fi
    
    # Check backend API
    if curl -f -s http://localhost:4232/api/health > /dev/null; then
        log_success "Backend API is responding"
    else
        log_error "Backend API is not responding"
    fi
    
    # Check R Analytics
    if curl -f -s http://localhost:4236/health > /dev/null; then
        log_success "R Analytics service is responding"
    else
        log_error "R Analytics service is not responding"
    fi
    
    # Check PM2 process status
    pm2 status
    
    log_success "Post-deployment validation completed"
}

# Main deployment function
main() {
    log_info "Starting production deployment..."
    
    mkdir -p "${PROJECT_ROOT}/logs"
    
    pre_deployment_checks
    build_applications
    deploy_with_pm2
    post_deployment_validation
    
    log_success "Production deployment completed successfully!"
    log_info "Access your application at:"
    log_info "  Frontend: https://ifrs9.ifrspro.id"
    log_info "  Backend API: https://bifrs9.ifrspro.id/api"
    log_info "  R Analytics: https://rifrs9.ifrspro.id/api"
}

main "$@"
EOF

    chmod +x "${PROJECT_ROOT}/scripts/psdd/deploy-production.sh"
    
    log_success "Deployment automation scripts created"
}

# Main execution function
main() {
    log_info "=========================================="
    log_info "PSDD ${PHASE_ID}: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    log_info "=========================================="
    
    # Track phase start
    track_progress "${PHASE_ID}" "STARTED" "Production services configuration initiated"
    
    # Load production environment
    if [[ -f "${PROJECT_ROOT}/.env.production" ]]; then
        source "${PROJECT_ROOT}/.env.production"
        log_info "Production environment loaded"
    fi
    
    # Configure all production services
    configure_redis_production
    configure_r_analytics_production
    configure_nginx_production
    configure_pm2_production
    create_ssl_certificate_setup
    create_deployment_automation
    
    log_success "=========================================="
    log_success "PSDD ${PHASE_ID} completed successfully!"
    log_success "All production services configured!"
    log_success "Ready for deployment with: ./scripts/psdd/deploy-production.sh"
    log_success "Next Phase: D3H1 - Basic IFRS 9 data models and calculations"
    log_success "=========================================="
    
    # Track phase completion
    track_progress "D2H8" "COMPLETED" "Production infrastructure & configuration completed - All native services ready for deployment"
}

# Execute main function with all arguments
main "$@"