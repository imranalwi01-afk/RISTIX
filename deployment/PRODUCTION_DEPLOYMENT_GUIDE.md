# 🚀 **IFRS9 Multi-Tenant Platform - Production Deployment Guide**

## 📋 **Overview**

Complete production deployment guide for the IFRS9 Multi-Tenant Banking Platform using **native services** (NO Docker containers). This guide ensures a secure, scalable, and highly available deployment suitable for enterprise banking operations.

### **🏗️ Architecture**

- **Multi-server deployment** with load balancing
- **Database-per-tenant isolation** with PostgreSQL
- **Native service deployment** (PM2 + Nginx + PostgreSQL + Redis + R)
- **Comprehensive monitoring** and alerting
- **Automated backup** and disaster recovery

---

## 🖥️ **Infrastructure Requirements**

### **Server Configuration**

#### **Application Server (AS1)**

- **IP**: `192.168.0.85`
- **Role**: Primary application server
- **Services**: Frontend, Backend, R Analytics
- **Specs**: 16 cores, 32GB RAM, 500GB SSD
- **OS**: Ubuntu 20.04+ LTS

#### **Database Server (DS1)**

- **IP**: `192.168.0.85` (same as AS1)
- **Role**: Primary PostgreSQL + Redis
- **Port**: 5432 (PostgreSQL), 6379 (Redis)
- **Specs**: 24 cores, 64GB RAM, 2TB NVMe
- **Databases**: Platform, Shared Services, Tenant DBs

#### **Legacy Database Server (DS2)**

- **IP**: `192.168.0.106`
- **Role**: Legacy FRS9PRO + Analytics
- **Port**: 5432 (PostgreSQL Legacy), 5434 (Analytics)
- **Specs**: 20 cores, 48GB RAM, 1TB NVMe

#### **Load Balancer Server (LB1)** _(Optional)_

- **IP**: `192.168.0.88`
- **Role**: Nginx reverse proxy + SSL termination
- **Services**: Nginx, SSL certificates
- **Specs**: 8 cores, 16GB RAM, 100GB SSD

### **Domain Configuration**

- **Frontend**: `https://ifrs9.ifrspro.id`
- **Backend API**: `https://bifrs9.ifrspro.id`
- **R Analytics**: `https://rifrs9.ifrspro.id`

---

## 🔧 **Prerequisites Installation**

### **Step 1: System Updates**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential software-properties-common
```

### **Step 2: Node.js & pnpm Installation**

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm globally
npm install -g pnpm@9

# Install PM2 for process management
npm install -g pm2

# Verify installations
node --version  # Should be v20.x.x
pnpm --version  # Should be 9.x.x
pm2 --version   # Should be latest
```

### **Step 3: PostgreSQL Installation**

```bash
# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure PostgreSQL
sudo -u postgres psql << EOF
ALTER USER postgres PASSWORD 'postgres';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
EOF
```

### **Step 4: Redis Installation**

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis for production
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Update Redis configuration
sudo tee -a /etc/redis/redis.conf << EOF

# IFRS9 Platform Configuration
bind 127.0.0.1 192.168.0.85
requireauth redis_secure_password_here
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1 300 10 60 10000
appendonly yes
appendfsync everysec
EOF

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### **Step 5: R Installation**

```bash
# Add R repository
wget -qO- https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc | sudo tee -a /etc/apt/trusted.gpg.d/cran_ubuntu_key.asc
echo "deb https://cloud.r-project.org/bin/linux/ubuntu $(lsb_release -cs)-cran40/" | sudo tee -a /etc/apt/sources.list.d/cran-r.list

# Install R and required packages
sudo apt update
sudo apt install -y r-base r-base-dev

# Install R packages
sudo R -e "
install.packages(c('plumber', 'DBI', 'RPostgreSQL', 'jsonlite', 'survival', 'randomForest'), repos='https://cran.r-project.org/')
"
```

### **Step 6: Nginx Installation**

```bash
# Install Nginx
sudo apt install -y nginx

# Enable and start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🚀 **Deployment Process**

### **Step 1: Clone Repository**

```bash
# Clone the IFRS9 platform repository
cd /opt
sudo mkdir -p ifrs9
sudo chown $USER:$USER /opt/ifrs9
cd /opt/ifrs9

git clone <repository-url> .
# OR if already exists: cd /home/doppelgaenger/ifrspro/ifrs9-platform
```

### **Step 2: Run Automated Deployment**

```bash
# Navigate to project directory
cd /home/doppelgaenger/ifrspro/ifrs9-platform

# Run deployment script
./scripts/deployment/deploy-production.sh

# For validation only (dry run):
./scripts/deployment/deploy-production.sh --dry-run
```

### **Step 3: Manual Configuration (if needed)**

#### **Environment Configuration**

```bash
# Generate production environment file
node -e "
const config = require('./deployment/production.config.js');
const envFile = config.generateEnvironmentFile();
require('fs').writeFileSync('.env.production', envFile);
console.log('✅ Environment file generated');
"

# Copy environment file
cp .env.production .env
```

#### **Database Setup**

```bash
# Create platform databases
PGPASSWORD="postgres" createdb -h 192.168.0.85 -U postgres ifrspro_platform_admin
PGPASSWORD="postgres" createdb -h 192.168.0.85 -U postgres ifrspro_shared_services
PGPASSWORD="postgres" createdb -h 192.168.0.85 -U postgres ifrspro_tenant_dana
PGPASSWORD="postgres" createdb -h 192.168.0.85 -U postgres ifrspro_tenant_demo_conventional
PGPASSWORD="postgres" createdb -h 192.168.0.85 -U postgres ifrspro_tenant_demo_syariah

# Apply database schemas (if backup files exist)
# PGPASSWORD="postgres" psql -h 192.168.0.85 -U postgres -d ifrspro_platform_admin -f database/backups/platform_admin_backup.sql
```

#### **Build Applications**

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build backend
cd packages/backend
pnpm run build
cd ../..

# Build frontend
cd packages/frontend
pnpm run build
cd ../..
```

#### **Start Services with PM2**

```bash
# Generate PM2 configuration
node -e "
const config = require('./deployment/production.config.js');
const pm2Config = config.generatePM2Config();
require('fs').writeFileSync('./ecosystem.config.js', pm2Config);
console.log('✅ PM2 configuration generated');
"

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔒 **SSL Certificate Configuration**

### **Step 1: Obtain SSL Certificates**

```bash
# Obtain SSL certificates for all domains
sudo certbot --nginx -d ifrs9.ifrspro.id
sudo certbot --nginx -d bifrs9.ifrspro.id
sudo certbot --nginx -d rifrs9.ifrspro.id

# Setup automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Step 2: Configure Nginx with HTTP to HTTPS Redirects**

Create the complete nginx configuration including HTTP to HTTPS redirects:

```bash
# Create nginx configuration with HTTP to HTTPS redirects
sudo tee /etc/nginx/sites-available/iaf-complete-https << 'EOF'
# IAF IFRS9 Platform - Complete HTTPS Configuration with HTTP to HTTPS Redirects
# Updated: January 2025

# =================================================================
# HTTP to HTTPS Redirect Rules for All Domains
# =================================================================

# Frontend HTTP Redirect
server {
    listen 80;
    server_name ristix.bdo-ki.com;

    # Force HTTPS redirect
    return 301 https://$server_name$request_uri;
}

# Backend API HTTP Redirect
server {
    listen 80;
    server_name api-ristix.bdo-ki.com;

    # Force HTTPS redirect
    return 301 https://$server_name$request_uri;
}

# R Analytics Dashboard HTTP Redirect
server {
    listen 80;
    server_name analytics-ristix.bdo-ki.com;

    # Force HTTPS redirect
    return 301 https://$server_name$request_uri;
}

# R Analytics Calculation API HTTP Redirect
server {
    listen 80;
    server_name analytics-calc-ristix.bdo-ki.com;

    # Force HTTPS redirect
    return 301 https://$server_name$request_uri;
}

# =================================================================
# HTTPS Server Configurations
# =================================================================

# Frontend Application with WebSocket support
server {
    listen 443 ssl http2;
    server_name ristix.bdo-ki.com;

    ssl_certificate /root/projects/ifrs9-iaf/ristix.bdo-ki.com/ristix.bdo-ki.com.pem;
    ssl_certificate_key /root/projects/ifrs9-iaf/ristix.bdo-ki.com/ristix.bdo-ki.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;

    # WebSocket support for Next.js HMR
    location /_next/webpack-hmr {
        proxy_pass http://127.0.0.1:4231/_next/webpack-hmr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Regular application routes
    location / {
        proxy_pass http://127.0.0.1:4231;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api-ristix.bdo-ki.com;

    ssl_certificate /root/projects/ifrs9-iaf/ristix.bdo-ki.com/ristix.bdo-ki.com.pem;
    ssl_certificate_key /root/projects/ifrs9-iaf/ristix.bdo-ki.com/ristix.bdo-ki.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;

    location / {
        proxy_pass http://127.0.0.1:4232;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support for backend (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # CORS handled by backend only
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Allow-Credentials;
    }
}

# R Analytics Dashboard
server {
    listen 443 ssl http2;
    server_name analytics-ristix.bdo-ki.com;

    ssl_certificate /root/projects/ifrs9-iaf/ristix.bdo-ki.com/ristix.bdo-ki.com.pem;
    ssl_certificate_key /root/projects/ifrs9-iaf/ristix.bdo-ki.com/ristix.bdo-ki.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;

    location / {
        proxy_pass http://127.0.0.1:4236;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# R Analytics Calculation API
server {
    listen 443 ssl http2;
    server_name analytics-calc-ristix.bdo-ki.com;

    ssl_certificate /root/projects/ifrs9-iaf/ristix.bdo-ki.com/ristix.bdo-ki.com.pem;
    ssl_certificate_key /root/projects/ifrs9-iaf/ristix.bdo-ki.com/ristix.bdo-ki.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;

    location / {
        proxy_pass http://127.0.0.1:4241;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# WebSocket connection upgrade map
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
EOF

# Enable the new configuration
sudo ln -sf /etc/nginx/sites-available/iaf-complete-https /etc/nginx/sites-enabled/

# Remove default nginx configuration
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📊 **Monitoring Setup**

### **Step 1: System Monitoring**

```bash
# Make monitoring script executable
chmod +x ./scripts/monitoring/system-monitor.sh

# Test monitoring
./scripts/monitoring/system-monitor.sh

# Setup continuous monitoring (optional)
./scripts/monitoring/system-monitor.sh --continuous &
```

### **Step 2: Health Check Automation**

```bash
# Create health check script
sudo tee /usr/local/bin/ifrs9-health-check.sh << 'EOF'
#!/bin/bash
cd /home/doppelgaenger/ifrspro/ifrs9-platform
./scripts/monitoring/system-monitor.sh --status-only
EOF

sudo chmod +x /usr/local/bin/ifrs9-health-check.sh

# Setup cron job for regular health checks
crontab -e
# Add: */5 * * * * /usr/local/bin/ifrs9-health-check.sh
```

### **Step 3: Log Rotation**

```bash
# Setup log rotation
sudo tee /etc/logrotate.d/ifrs9 << 'EOF'
/var/log/ifrs9/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
}
EOF
```

---

## 🔧 **Post-Deployment Verification**

### **Step 1: Service Health Checks**

```bash
# Check PM2 processes
pm2 status

# Check application health
curl -f https://ifrs9.ifrspro.id/api/health
curl -f https://bifrs9.ifrspro.id/api/v1/health
curl -f https://rifrs9.ifrspro.id/health

# Check database connections
PGPASSWORD="postgres" psql -h 192.168.0.85 -U postgres -c "SELECT version();"
redis-cli -h 192.168.0.85 ping
```

### **Step 2: Functional Testing**

```bash
# Test authentication endpoints
curl -X POST https://bifrs9.ifrspro.id/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ifrspro.id","password":"1019181716"}'

# Test React Admin interface
# Navigate to https://ifrs9.ifrspro.id and verify:
# - Login functionality
# - Banking resource CRUD operations
# - IFRS 9 calculation interface
# - Multi-tenant functionality
```

### **Step 3: Performance Testing**

```bash
# Install testing tools (optional)
sudo apt install -y apache2-utils

# Basic load testing
ab -n 1000 -c 10 https://ifrs9.ifrspro.id/
ab -n 1000 -c 10 https://bifrs9.ifrspro.id/api/v1/health
```

---

## 🔄 **Backup & Recovery**

### **Step 1: Database Backup Setup**

```bash
# Create backup script
sudo tee /usr/local/bin/ifrs9-db-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/ifrs9/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Backup all databases
DATABASES=("ifrspro_platform_admin" "ifrspro_shared_services" "ifrspro_tenant_dana" "ifrspro_tenant_demo_conventional" "ifrspro_tenant_demo_syariah")

for db in "${DATABASES[@]}"; do
    echo "Backing up database: $db"
    PGPASSWORD="postgres" pg_dump -h 192.168.0.85 -p 5432 -U postgres -d "$db" | gzip > "$BACKUP_DIR/${db}_${DATE}.sql.gz"
done

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
echo "Database backup completed: $DATE"
EOF

sudo chmod +x /usr/local/bin/ifrs9-db-backup.sh

# Setup daily backup cron job
crontab -e
# Add: 0 2 * * * /usr/local/bin/ifrs9-db-backup.sh
```

### **Step 2: Application Backup**

```bash
# Create application backup script
sudo tee /usr/local/bin/ifrs9-app-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/ifrs9/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/home/doppelgaenger/ifrspro/ifrs9-platform"

mkdir -p "$BACKUP_DIR"

# Backup application files
tar -czf "$BACKUP_DIR/ifrs9-app-${DATE}.tar.gz" \
  --exclude="node_modules" \
  --exclude=".git" \
  --exclude="*.log" \
  "$PROJECT_DIR"

# Clean old backups (keep 14 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +14 -delete
echo "Application backup completed: $DATE"
EOF

sudo chmod +x /usr/local/bin/ifrs9-app-backup.sh

# Setup weekly backup cron job
crontab -e
# Add: 0 3 * * 0 /usr/local/bin/ifrs9-app-backup.sh
```

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **Issue 1: PM2 Processes Not Starting**

```bash
# Check PM2 logs
pm2 logs

# Restart processes
pm2 restart all

# Check disk space
df -h

# Check memory usage
free -h
```

#### **Issue 2: Database Connection Issues**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
PGPASSWORD="postgres" psql -h 192.168.0.85 -U postgres -c "SELECT 1;"

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### **Issue 3: Nginx Configuration Issues**

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### **Issue 4: SSL Certificate Issues**

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew --dry-run

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/ifrs9.ifrspro.id/cert.pem -text -noout | grep "Not After"
```

---

## 📈 **Performance Optimization**

### **Database Optimization**

```bash
# PostgreSQL configuration tuning
sudo tee -a /etc/postgresql/15/main/postgresql.conf << 'EOF'

# IFRS9 Platform Performance Tuning
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 2GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
max_connections = 200
EOF

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **Application Performance**

```bash
# Node.js performance flags
export NODE_OPTIONS="--max-old-space-size=4096"

# Update PM2 configuration for better performance
pm2 start ecosystem.config.js --node-args="--max-old-space-size=4096"
```

---

## 📋 **Deployment Checklist**

### **Pre-Deployment**

- [ ] Server requirements verified
- [ ] Prerequisites installed (Node.js, pnpm, PostgreSQL, Redis, R, Nginx)
- [ ] SSL certificates obtained
- [ ] DNS records configured
- [ ] Firewall rules configured

### **During Deployment**

- [ ] Repository cloned/updated
- [ ] Dependencies installed
- [ ] Applications built successfully
- [ ] Databases created and configured
- [ ] Environment variables set
- [ ] PM2 processes started
- [ ] Nginx configured and reloaded

### **Post-Deployment**

- [ ] Health checks passing
- [ ] SSL certificates working
- [ ] Application endpoints responding
- [ ] Database connections established
- [ ] Monitoring configured
- [ ] Backup systems configured
- [ ] Performance testing completed
- [ ] Documentation updated

---

## 🎯 **Production URLs**

After successful deployment, the platform will be accessible at:

- **🏠 Frontend Application**: https://ifrs9.ifrspro.id
- **🔗 Backend API**: https://bifrs9.ifrspro.id/api/v1
- **📊 R Analytics**: https://rifrs9.ifrspro.id
- **💻 Monitoring Dashboard**: https://ifrs9.ifrspro.id/monitoring _(if implemented)_

### **Test Credentials**

- **Platform Admin**: `admin@ifrspro.id` / `1019181716`
- **Dana Bank**: `cro@dana.com` / `1019181716` (tenantId: `dana`)
- **Syariah Bank**: `cro@syariahbank.com` / `1019181716` (tenantId: `syariah`)

---

## 📞 **Support & Maintenance**

### **Daily Operations**

- Monitor system health via `/scripts/monitoring/system-monitor.sh`
- Check PM2 process status: `pm2 status`
- Review application logs: `pm2 logs`
- Monitor database performance: `PGPASSWORD="postgres" psql -h 192.168.0.85 -U postgres -c "SELECT * FROM pg_stat_activity;"`

### **Weekly Maintenance**

- Review backup integrity
- Check SSL certificate expiration dates
- Monitor disk space usage
- Review security logs
- Update system packages: `sudo apt update && sudo apt upgrade`

### **Monthly Maintenance**

- Performance review and optimization
- Security audit and updates
- Database maintenance and optimization
- Capacity planning review
- Disaster recovery testing

---

**🎉 Deployment Guide Complete! Your IFRS9 Multi-Tenant Platform is ready for production use.**
