# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IFRS 9 Multi-Tenant Dual Banking Platform - a comprehensive banking solution supporting both conventional and Syariah banking institutions with IFRS 9 compliance calculations.

## 🚨 CRITICAL DEPLOYMENT NOTES

**IAF ECS SERVER ENVIRONMENT:**
- **Local Development**: Treat ifrs9-iaf/ folder as IAF ECS Server environment
- **Deployment Process**: Fix locally, then user uploads via rsync to IAF ECS Server (10.18.11.35)
- **🚨 IMPORTANT**: Claude AI cannot use rsync - User must deploy manually to avoid permission issues
- **rsync Command (USER EXECUTION ONLY)**:
  ```bash
  rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='*.log' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='_unused' \
    --exclude='.env.local' \
    --exclude='.env.localdev' \
    ./ifrs9-iaf/ root@10.18.11.35:~/projects/ifrs9-iaf/
  ```
- **Production URLs**:
  - Frontend: https://iaf-ifrs.danafin.com
  - Backend: https://iaf-ifrs-be.danafin.com
  - R Analytics: https://iaf-ifrs-analytics.danafin.com
- **Authentication**: Password.2025! for IAF ECS Server

## 🔄 SEAMLESS LOCAL/IAFECS ENVIRONMENT SWITCHING

### **Centralized Configuration Architecture**
**PRINCIPLE**: Edit codes locally with centralized configuration, deploy via rsync, modify parameters on ECS, works seamlessly.

**Environment Files**:
- `.env.localdev` - Local development configuration (localhost databases, dev URLs)
- `.env.iafecs` - IAF ECS production configuration (RDS databases, production URLs)
- **Smart Detection**: Auto-detects deployment target based on environment variables and hostname

**Configuration Loading**:
- **Backend**: `packages/backend/src/config/environment-loader.ts` - Smart environment detection
- **Frontend**: `packages/frontend/src/config/environment-loader-frontend.ts` - Browser-based detection
- **R Analytics**: Environment variables passed via startup scripts

### **Enhanced Deployment Workflow**

#### **Step 1: Local Development & Testing**
1. **Work in ifrs9-iaf/**: Make code changes locally with centralized configuration
2. **Local Testing**: Test endpoints locally with `npm run dev`
3. **Environment Switching**: Rely on auto-detection or set DEPLOYMENT_TARGET
4. **Validate**: Ensure all endpoints work before deployment

#### **Step 2: Deploy to IAF ECS Server**
```bash
# Deploy with enhanced rsync command (includes security exclusions)
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='*.log' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='_unused' \
  --exclude='.env.local' \
  --exclude='.env.localdev' \
  ./ifrs9-iaf/ root@10.18.11.35:~/projects/ifrs9-iaf/
```

#### **Step 3: ECS Server Configuration**
1. **SSH to ECS**: `ssh root@10.18.11.35` (Password: Password.2025!)
2. **Navigate**: `cd ~/projects/ifrs9-iaf`
3. **Restart Services Using start.sh Scripts**:
   ```bash
   # Restart Frontend
   cd packages/frontend && ./start.sh

   # Restart Backend
   cd packages/backend && ./start.sh

   # Restart R Analytics
   cd packages/r-analytics/shiny-app && ./start.sh
   ```

**🚨 IMPORTANT: NO PM2 USAGE**
- **Current Process**: Services are managed using individual `start.sh` scripts
- **Location**: Each package has its own `start.sh` script
- **Frontend**: `packages/frontend/start.sh`
- **Backend**: `packages/backend/start.sh`
- **R Analytics**: `packages/r-analytics/shiny-app/start.sh`
- **PM2**: NOT CURRENTLY USED - Do not use PM2 commands

#### **Step 4: Validation**
- **Frontend**: Test at https://iaf-ifrs.danafin.com
- **Backend API**: Test endpoints at https://iaf-ifrs-be.danafin.com/api/v1
- **R Analytics**: Test at https://iaf-ifrs-analytics.danafin.com
- **Health Check**: `curl -k https://iaf-ifrs-be.danafin.com/health`

### **Environment Detection Logic**
```bash
# Backend Auto-Detection Priority:
1. DEPLOYMENT_TARGET environment variable (localdev|iafecs)
2. ECS metadata indicators (Alibaba Cloud ECS detection)
3. .env.iafecs file existence
4. Hostname patterns (ecs, alibaba, 10.18.x.x)
5. Default: localdev

# Frontend Auto-Detection Priority:
1. NEXT_PUBLIC_DEPLOYMENT_TARGET environment variable
2. Window hostname detection:
   - iaf-ifrs.danafin.com → iafecs
   - ifrs9-iaf.ifrspro.id → localdev
3. NODE_ENV=production → iafecs
4. Default: localdev
```

### **Centralized Configuration Rules**
✅ **MANDATORY**: All configuration must be centralized - NO HARDCODED VALUES
- Database connections: Use environment loader, not hardcoded hostnames
- API URLs: Use smart configuration, not fixed endpoints
- Feature flags: Environment-based configuration
- Security settings: Centralized in environment files

❌ **FORBIDDEN**: Hardcoded values in frontend, backend, or R-analytics code
- No "localhost:port" references in application code
- No fixed database connection strings
- No hardcoded API endpoints
- No environment-specific values in source code

### **Configuration Examples**

**Backend Configuration**:
```typescript
// ❌ WRONG - Hardcoded
const dbHost = 'localhost';
const apiUrl = 'http://localhost:4232';

// ✅ CORRECT - Centralized
import { environmentLoader } from './config/environment-loader';
const config = environmentLoader.getConfiguration();
const dbHost = config.database.host;
const apiUrl = config.urls.backend;
```

**Frontend Configuration**:
```typescript
// ❌ WRONG - Hardcoded
const backendUrl = 'http://localhost:4232';

// ✅ CORRECT - Smart loader
import { frontendEnvironmentLoader } from './config/environment-loader-frontend';
const config = frontendEnvironmentLoader.getConfiguration();
const backendUrl = config.api.backend;
```

### **Service Port Mappings**
**Local Development**:
- Frontend: 4231 → https://iaf-ifrs.ifrspro.id
- Backend: 4232 → https://iaf-ifrs-be.ifrspro.id
- R Analytics: 4236 → https://iaf-ifrs-analytics.ifrspro.id

**IAF ECS Production**:
- Frontend: 4231 → https://iaf-ifrs.danafin.com
- Backend: 4232 → https://iaf-ifrs-be.danafin.com
- R Analytics: 4236 → https://iaf-ifrs-analytics.danafin.com

**Technology Stack:**
- Frontend: Next.js 15 + Material-UI v6 + React Admin v4
- Backend: Express.js + Node.js + TypeScript + Sequelize ORM
- Database: PostgreSQL (multi-tenant with database-per-tenant isolation)
- Analytics: R Analytics integration (port 4236)
- Caching: Redis
- Package Manager: pnpm (workspace-based monorepo)

## Development Commands

### Root-level commands (run from project root):
- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run tests for all packages
- `pnpm lint` - Run linting for all packages
- `pnpm lint:fix` - Fix linting issues
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean build artifacts

### Setup commands:
- `pnpm run setup:full` - Complete environment setup (env + packages + db)
- `pnpm run setup:env` - Environment setup only
- `pnpm run setup:packages` - Install all package dependencies
- `pnpm run setup:db` - Database setup and migrations

### Database operations:
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:seed` - Seed databases with sample data

### Package-specific development (run from package directories):

**Backend** (`packages/backend/`):
- `pnpm dev` - Start backend in development mode (ts-node)
- `pnpm build` - Compile TypeScript to dist/
- `pnpm start` - Start production server
- `pnpm test` - Run Jest tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage

**Frontend** (`packages/frontend/`):
- `pnpm dev` - Start Next.js dev server on port 4231
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Next.js linting
- `pnpm type-check` - TypeScript checking

## Architecture

### Monorepo Structure
- `packages/backend/` - Express.js API server
- `packages/frontend/` - Next.js web application
- `packages/r-analytics/` - R analytics service
- `packages/shared/` - Shared types, schemas, and utilities

### Multi-Tenant Architecture
- **Database-per-tenant isolation** - Each tenant has dedicated PostgreSQL database
- **Tenant context middleware** - Automatic tenant resolution from requests
- **Dual banking support** - Conventional and Syariah banking modes
- **RBAC system** - Role-based access control with audit trails

### Key Backend Components
- **Authentication**: JWT-based auth with refresh tokens (`src/core/services/auth/`)
- **Multi-tenancy**: Tenant management and context switching (`src/core/services/tenant/`)
- **IFRS9 Calculations**: ECL, PD, LGD, EAD calculations (`src/core/services/ifrs9/`)
- **Workflow Engine**: Approval workflows and business processes (`src/core/services/workflow/`)
- **ETL Pipeline**: Data transformation and processing (`src/core/services/etl/`)
- **Configuration Management**: Feature flags and tenant-specific settings (`src/core/services/config/`)

### Frontend Architecture  
- **React Admin**: Admin interface with Material-UI v6
- **Dual Banking Themes**: Separate themes for conventional/Syariah banking
- **Multi-stakeholder Support**: Different layouts for banking staff, consultants, regulators
- **IFRS9 Dashboard**: Analytics and calculation monitoring

### R Analytics Integration
- **R Service**: Dedicated R analytics service on port 4236
- **IFRS9 Models**: PD, LGD, EAD statistical models
- **API Integration**: RESTful endpoints for R script execution

## 🚨 CRITICAL PRODUCTION MODE POLICY 🚨

### **⚠️ MANDATORY PRODUCTION MODE REQUIREMENT**
🏭 **THIS SYSTEM OPERATES IN PRODUCTION MODE ONLY!**
**NEVER EVER CHANGE CONFIGURATIONS TO DEVELOPMENT MODE!**

## 🔒 SSL CONNECTION CONFIGURATION RULES

### **🏗️ DATABASE SSL REQUIREMENTS**

#### **🚨 MANDATORY: ALL DATABASE CONNECTIONS - NO SSL REQUIRED**

```bash
# =============================================================================
# ❌ CRITICAL RULE: ALL DATABASES MUST USE SSL = false
# =============================================================================
#
# ALL DATABASE CONNECTIONS (BOTH LOCAL AND PRODUCTION) MUST HAVE SSL DISABLED
#
# Database Connections (NO SSL - ALL ENVIRONMENTS):
# ✅ DS1 Primary Server: 192.168.0.85:5432 (NO SSL)
# ✅ DS2 Analytics Server: 192.168.0.106:5433 (NO SSL)
# ✅ RDS Alibaba Cloud: pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com:5432 (NO SSL)
#
# DATABASES WITH SSL = false:
# ✅ ifrspro_platform_admin (Platform Admin)
# ✅ ifrspro_shared_services (Shared Services)
# ✅ ifrspro_tenant_iaf (IAF Tenant Database)
# ✅ FRS9PRO (Legacy FRS9 System)
# ✅ IFRS9_pro (IFRS9 Analytics)
#
# =============================================================================
#
# MANDATORY ENVIRONMENT VARIABLES FOR ALL ENVIRONMENTS:
# DB_SSL=false
# PLATFORM_DB_SSL=false
# SHARED_DB_SSL=false
# TENANT_DB_SSL=false
# LEGACY_DB_SSL=false
# FRS9_DB_SSL=false

# DATABASE CONFIGURATION FILES:
# ✅ packages/backend/config/database.json - All servers must have "ssl": false
# ✅ packages/backend/.env.iafecs - All DB_SSL_* variables must be "false"
#
# =============================================================================
```

#### **LOCAL DEVELOPMENT (iaf-ifrs.ifrspro.id):**
```bash
# Local Development Database Connections (NO SSL - MANDATORY)
DS1 Primary Server:
- Host: 192.168.0.85
- Port: 5432
- SSL: false (MANDATORY - DISABLED)
- Databases: ifrspro_platform_admin, ifrspro_shared_services, ifrspro_tenant_*

DS2 Analytics Server:
- Host: 192.168.0.106
- Port: 5433
- SSL: false (MANDATORY - DISABLED)
- Databases: FRS9PRO, IFRS9_pro

# CONNECTION RULES:
❌ NEVER USE SSL for any database connections
✅ ALWAYS USE direct PostgreSQL connections (NO SSL)
✅ ALL ENVIRONMENT VARIABLES MUST BE: DB_SSL=false, PLATFORM_DB_SSL=false, TENANT_DB_SSL=false
```

#### **IAF ECS PRODUCTION (iaf-ifrs.danafin.com):**
```bash
# IAF ECS Production Database Connections (NO SSL - MANDATORY)
RDS Alibaba Cloud:
- Host: pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com
- Port: 5432
- SSL: false (MANDATORY - DISABLED)
- Databases: ifrspro_platform_admin, ifrspro_shared_services, ifrspro_tenant_iaf, FRS9PRO

# CONNECTION RULES:
❌ NEVER USE SSL for RDS database connections (MANDATORY)
✅ ALL ENVIRONMENT VARIABLES MUST BE: DB_SSL=false, PLATFORM_DB_SSL=false, TENANT_DB_SSL=false
✅ Direct PostgreSQL connections without SSL termination
✅ Nginx reverse proxy handles HTTPS at application layer, not database layer
```

### **🔧 ENVIRONMENT-SPECIFIC SSL CONFIGURATION**

#### **Backend Configuration Rules:**
```typescript
// ✅ CORRECT: ALL DATABASES MUST USE SSL = false
const isLocalDevelopment = process.env.DEPLOYMENT_TARGET === 'localdev';
const isProductionECS = process.env.DEPLOYMENT_TARGET === 'iafecs';

// 🚨 MANDATORY: ALL DATABASES - NO SSL
const sslEnabled = false;

// Environment-specific database hosts
const dbHost = isLocalDevelopment
  ? '192.168.0.85'  // Local DS1
  : 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com'; // RDS Production

const dbConfig = {
  host: dbHost,
  port: 5432,
  ssl: sslEnabled, // ALWAYS false for all databases
  // ... other config
};
```

#### **Frontend Configuration Rules:**
```typescript
// Local Development: HTTP via Cloudflare Zero Trust
const backendUrl = isLocalDevelopment
  ? 'https://iaf-ifrs-be.ifrspro.id'  // Cloudflare Zero Trust
  : 'https://iaf-ifrs-be.danafin.com'; // IAF ECS Production

// NO hardcoded localhost URLs
// NO direct IP:port combinations
```

### **🚨 CRITICAL RULES SUMMARY**

#### **❌ FORBIDDEN CONFIGURATIONS:**
- Never use SSL connections for local development databases (192.168.0.x)
- Never use RDS connections for local development without proper VPN
- Never hardcode database connection strings
- Never disable SSL for IAF ECS production connections

#### **✅ REQUIRED CONFIGURATIONS:**
- Local Development: SSL=false for 192.168.0.85/192.168.0.106 database connections
- IAF ECS Production: SSL=true for RDS database connections
- Always use environment variables: DEPLOYMENT_TARGET=localdev|iafecs
- Always use centralized configuration system

### **🔄 AUTOMATIC DETECTION LOGIC**
```bash
# Environment Auto-Detection Priority:
1. DEPLOYMENT_TARGET environment variable (localdev|iafecs)
2. Hostname detection:
   - ifrs9-iaf.ifrspro.id → localdev
   - iaf-ifrs.danafin.com → iafecs
3. Default: localdev

# SSL Configuration Based on Environment:
- localdev → SSL=false (local databases)
- iafecs → SSL=true (RDS databases)
```

**PRODUCTION DATABASE SERVERS (ALIBABA CLOUD RDS):**
- **IAF ECS Environment**: Uses Alibaba Cloud RDS (Relational Database Service)
- **All Databases**: Connect via RDS service endpoints (not direct server IPs)
- **RDS Configuration**: Multi-database setup on Alibaba Cloud RDS
- **Legacy Integration**: FRS9PRO and IFRS9 analytics via RDS
- **❌ NEVER USE**: localhost, 127.0.0.1, or any development database connections for IAF ECS
- **❌ NEVER USE**: Development mode configurations or localhost references for IAF ECS

**PRODUCTION ENFORCEMENT:**
- ALL database operations MUST use Alibaba Cloud RDS service endpoints
- ALL API calls MUST target production RDS endpoints
- ALL configurations MUST remain in production mode
- Users work in LIVE PRODUCTION ENVIRONMENT - treat with extreme care
- R Analytics MUST connect to RDS for all database operations

## 🔒 HTTPS PRODUCTION DEPLOYMENT

### **HTTPS DEPLOYMENT ON IAF ECS SERVER**
**Server**: IAF ECS Server (10.18.11.35)
**SSL**: danafin.com wildcard certificates
**Deployment Date**: January 2025

**HTTPS DOMAINS:**
- **Frontend**: `https://iaf-ifrs.danafin.com` (Port 4231 → 443)
- **Backend**: `https://iaf-ifrs-be.danafin.com` (Port 4232 → 443)
- **R Analytics Dashboard**: `https://iaf-ifrs-analytics.danafin.com` (Port 4236 → 443)
- **R Analytics API**: `https://iaf-ifrs-analytics-calc.danafin.com` (Port 4241 → 443)

### **HTTPS CONFIGURATION FILES**
**nginx Configuration**: `/etc/nginx/sites-available/iaf-complete-https`
- SSL certificate: `/root/projects/ifrs9-iaf/danafin.com/danafin.com.pem`
- SSL private key: `/root/projects/ifrs9-iaf/danafin.com/danafin.com.key`
- CORS handling: Backend-only (nginx headers removed to prevent duplicates)

**Frontend Configuration**: `packages/frontend/.env`
```bash
NEXT_PUBLIC_ENABLE_HTTPS=true
NEXT_PUBLIC_SECURE_COOKIES=true
NEXT_PUBLIC_BACKEND_HOST=iaf-ifrs-be.danafin.com
NEXT_PUBLIC_BACKEND_PORT=443
BACKEND_URL=https://iaf-ifrs-be.danafin.com
```

**Centralized Config**: `packages/frontend/src/config/centralized.config.ts`
- All URLs use HTTPS defaults
- Environment-based fallbacks
- Security headers enabled

**API Service**: `packages/frontend/src/services/api.ts`
- HTTPS URLs for all backend communication
- Mixed Content Security Policy compliance
- Secure cookie handling

### **DEPLOYMENT PROCESS**
1. **File Sync**: `rsync -avz --exclude='node_modules' ./ifrs9-iaf/ root@10.18.11.35:~/projects/ifrs9-iaf/`
2. **CORS Fix**: Executed `fix-cors-duplicate-headers.sh` to resolve header conflicts
3. **Service Restart**:
   ```bash
   # Restart all services using start.sh scripts
   cd packages/frontend && ./start.sh
   cd packages/backend && ./start.sh
   cd packages/r-analytics/shiny-app && ./start.sh
   ```
4. **SSL Verification**: All services accessible via HTTPS with valid certificates

### **SECURITY FEATURES**
- **Mixed Content Security**: All HTTP requests upgraded to HTTPS
- **Secure Cookies**: Authentication cookies with secure flag
- **CORS Policy**: Backend-handled CORS to prevent duplicate headers
- **SSL/TLS**: TLS 1.2+ with modern cipher suites
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

### **STRICT NO MOCKUP/FALLBACK DATA POLICY**
⚠️ **MANDATORY REQUIREMENT**: **NEVER EVER USE MOCKUP DATA, FALL BACK DATA, OR ASSUMPTIONS DATA!**

**ALL data must come from REAL PRODUCTION DATABASE connections:**
- ✅ **USE**: Live database queries from DS1 (192.168.0.85:5432) and DS2 (192.168.0.106:5433)
- ✅ **USE**: Real API endpoints with actual production database integration
- ✅ **USE**: Authentic FRS9PRO table data with proper mapping
- ❌ **NEVER USE**: Mock arrays, sample data, placeholder values, or fallback data
- ❌ **NEVER USE**: Hardcoded responses, static JSON, or temporary assumptions
- ❌ **NEVER USE**: localhost or development database connections

**Database Integration Requirements:**
- All controllers must connect to actual PostgreSQL production databases
- Use actual table names: `frs9_imp_ca_fl_scalarh`, `frs9_imp_ca_fl_scalard`, etc. (lowercase)
- Legacy tables are UPPERCASE in original system, use lowercase in PostgreSQL
- Every frontend page must consume real API endpoints, not mock data
- Validate actual production database existence before implementing frontend features

**Violation Response:**
Any use of mock/fallback data or development configurations violates user requirements and must be immediately replaced with real production database integration.

---

## 🔄 DUAL ENVIRONMENT CONFIGURATION SYSTEM

### **CENTRALIZED CONFIGURATION ARCHITECTURE**
**IMPLEMENTATION DATE**: January 2025
**STATUS**: ✅ **FULLY IMPLEMENTED AND PRODUCTION READY**

**PRINCIPLE**: Single codebase with smart environment detection that automatically switches between IAF Development and IAF Production configurations without code changes.

### **🌍 ENVIRONMENT DETECTION SYSTEM**

#### **Auto-Detection Priority Logic**
```bash
# BACKEND DETECTION (environment-loader-backend.ts):
1. DEPLOYMENT_TARGET environment variable (localdev|iafecs)
2. ECS metadata indicators (Alibaba Cloud ECS detection)
3. .env.iafecs file existence
4. Hostname patterns (ecs, alibaba, 10.18.x.x)
5. Default: localdev

# FRONTEND DETECTION (environment-loader-frontend.ts):
1. Window hostname detection:
   - iaf-ifrs.danafin.com → iafecs (Production)
   - ifrs9-iaf.ifrspro.id → localdev (Development)
2. NEXT_PUBLIC_DEPLOYMENT_TARGET environment variable
3. NODE_ENV=production → iafecs
4. Default: localdev

# R-ANALYTICS DETECTION (environment-loader-r-analytics.ts):
1. DEPLOYMENT_TARGET environment variable (localdev|iafecs)
2. ECS metadata indicators (Alibaba Cloud ECS detection)
3. .env.iafecs file existence
4. NODE_ENV=production → iafecs
5. Default: localdev
```

### **🏗️ CONFIGURATION LOADER FILES**

#### **Frontend Configuration**
- **File**: `packages/frontend/src/config/environment-loader-frontend.ts`
- **Purpose**: Browser-based environment detection and URL resolution
- **Auto-Switching**:
  - **Development**: `ifrs9-iaf.ifrspro.id` domains + local databases
  - **Production**: `iaf-ifrs.danafin.com` domains + RDS databases

#### **Backend Configuration**
- **File**: `packages/backend/src/config/environment-loader-backend.ts`
- **Purpose**: Server-side environment detection and service configuration
- **Auto-Switching**:
  - **Development**: Local databases (192.168.0.85/192.168.0.106) + dev URLs
  - **Production**: RDS databases (pgm-d9j5id443p7876n9) + production URLs

#### **R-Analytics Configuration**
- **File**: `packages/r-analytics/config/environment-loader-r-analytics.ts`
- **Purpose**: R service environment detection and database configuration
- **Auto-Switching**:
  - **Development**: Local R service + development URLs
  - **Production**: ECS R service + production URLs

### **🔗 ENVIRONMENT URL MAPPINGS**

#### **IAF Development Environment (LOCALDEV)**
```bash
# Frontend URLs
Frontend: https://iaf-ifrs.ifrspro.id
Backend API: https://iaf-ifrs-be.ifrspro.id
R Analytics: https://iaf-ifrs-analytics.ifrspro.id
R Analytics API: https://iaf-ifrs-analytics-calc.ifrspro.id

# Database Connections
Platform DB: 192.168.0.85:5432 → ifrspro_platform_admin
Shared DB: 192.168.0.85:5432 → ifrspro_shared_services
FRS9 DB: 192.168.0.106:5433 → FRS9PRO
Tenant DBs: 192.168.0.85:5432 → ifrspro_tenant_*

# Service Ports (Internal)
Frontend: 4231
Backend: 4232
R Analytics: 4236
R Analytics API: 4241
```

#### **IAF Production Environment (IAFECS)**
```bash
# Frontend URLs
Frontend: https://iaf-ifrs.danafin.com
Backend API: https://iaf-ifrs-be.danafin.com
R Analytics: https://iaf-ifrs-analytics.danafin.com
R Analytics API: https://iaf-ifrs-analytics-calc.danafin.com

# Database Connections (Alibaba Cloud RDS)
All DBs: pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com:5432
Platform DB: ifrspro_platform_admin
Shared DB: ifrspro_shared_services
FRS9 DB: FRS9PRO
Tenant DBs: ifrspro_tenant_iaf

# Service Ports (Internal)
Frontend: 4231
Backend: 4232
R Analytics: 4236
R Analytics API: 4241
```

### **📁 ENVIRONMENT FILES STRUCTURE**

#### **Priority Loading Order**
```bash
1. .env                    # Base configuration
2. .env.localdev          # Local development overrides
3. .env.iafecs            # IAF ECS production overrides
4. .env.production        # Production overrides
```

#### **Environment Templates**
- **Template**: `.env.dual-template` - Complete dual-environment configuration
- **Local Dev**: `.env.localdev` - Development-specific settings
- **ECS Production**: `.env.iafecs` - Production-specific settings

### **🔧 CONFIGURATION USAGE EXAMPLES**

#### **Backend Configuration Usage**
```typescript
// ✅ CORRECT - Using centralized configuration
import { backendEnvironmentLoader } from './config/environment-loader-backend';

const config = backendEnvironmentLoader.getConfiguration();
const backendUrl = config.servers.backend.url;
const databaseConfig = config.database.platform;
const rAnalyticsUrl = config.rAnalytics.url;

// ❌ WRONG - Hardcoded values
const backendUrl = 'http://localhost:4232';
const dbHost = 'localhost';
```

#### **Frontend Configuration Usage**
```typescript
// ✅ CORRECT - Using centralized configuration
import { frontendEnvironmentLoader } from './config/environment-loader-frontend';

const config = frontendEnvironmentLoader.getConfiguration();
const apiBaseUrl = config.api.backend;
const rAnalyticsUrl = config.urls.rAnalytics;

// ❌ WRONG - Hardcoded values
const apiBaseUrl = 'http://localhost:4232/api';
const rAnalyticsUrl = 'http://localhost:4236';
```

#### **R-Analytics Configuration Usage**
```typescript
// ✅ CORRECT - Using centralized configuration
import { rAnalyticsEnvironmentLoader } from '../config/environment-loader-r-analytics';

const config = rAnalyticsEnvironmentLoader.getConfiguration();
const databaseConfig = config.database.rds;
const rServiceConfig = config.rService;

// ❌ WRONG - Hardcoded values
const dbHost = 'localhost';
const rServicePort = 4241;
```

### **🚀 RSYNC DEPLOYMENT PROCESS**

#### **DEPLOYMENT WORKFLOW**
```bash
# STEP 1: Local Development
# Work in /home/doppelgaenger/ifrspro/ifrs9-iaf/ folder
# Use centralized configuration system
# Test locally with ifrs9-iaf.ifrspro.id domains

# STEP 2: Deploy to IAF ECS Server
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='*.log' \
  --exclude='.next' \
  --exclude='dist' \
  ./ifrs9-iaf/ root@10.18.11.35:~/projects/ifrs9-iaf/

# STEP 3: SSH to ECS Server
ssh root@10.18.11.35
# Password: Password.2025!

# STEP 4: Navigate to Project
cd ~/projects/ifrs9-iaf

# STEP 5: Restart Services
cd packages/frontend && ./start.sh
cd packages/backend && ./start.sh
cd packages/r-analytics/shiny-app && ./start.sh

# STEP 6: Verify Deployment
# Check if services are running (use ps aux | grep node or netstat -tlnp)
curl -k https://iaf-ifrs-be.danafin.com/health
curl -k https://iaf-ifrs-analytics.danafin.com/health
```

#### **AUTOMATIC ENVIRONMENT SWITCHING**
**No configuration changes required!** The system automatically detects:

- **Local Development**: When accessing `ifrs9-iaf.ifrspro.id` → uses local databases and dev URLs
- **IAF Production**: When accessing `iaf-ifrs.danafin.com` → uses RDS databases and production URLs

#### **DEPLOYMENT VALIDATION CHECKLIST**
```bash
# Pre-Deployment Validation
✅ Centralized configuration implemented in all packages
✅ No hardcoded URLs or database connections
✅ Environment loaders properly configured
✅ CORS origins updated for both environments
✅ Database connections use environment variables

# Post-Deployment Verification
✅ Frontend loads: https://iaf-ifrs.danafin.com
✅ Backend API responds: https://iaf-ifrs-be.danafin.com/health
✅ R Analytics works: https://iaf-ifrs-analytics.danafin.com
✅ Database connections established (RDS)
✅ Authentication system functional
✅ All services running: Check process status with ps aux | grep node
```

### **🔒 SECURITY CONFIGURATIONS**

#### **Database Security**
- **Development**: Local PostgreSQL with basic authentication
- **Production**: Alibaba Cloud RDS with SSL and secure credentials
- **Credentials**: Environment-based, never hardcoded
- **Connection Strings**: Built dynamically from configuration

#### **API Security**
- **CORS Origins**: Environment-specific origin validation
- **Authentication**: JWT with environment-specific secrets
- **HTTPS**: Enforced in production, optional in development
- **Rate Limiting**: Configured per environment

#### **R-Analytics Security**
- **Package Installation**: Secure CRAN repositories
- **Database Access**: Environment-based credentials
- **API Endpoints**: Proper authentication and authorization
- **File Access**: Restricted to configured directories

### **📊 CONFIGURATION SYSTEM SUMMARY**

#### **Files Created/Modified**
```bash
# Frontend Configuration
packages/frontend/src/config/environment-loader-frontend.ts ✅
packages/frontend/src/config/centralized.config.ts ✅
packages/frontend/src/lib/api/config.ts ✅
packages/frontend/src/providers/AuthProvider.tsx ✅

# Backend Configuration
packages/backend/src/config/environment-loader-backend.ts ✅
packages/backend/src/config/centralized.config.ts ✅
packages/backend/src/middleware/cors.ts ✅
packages/backend/src/server.ts ✅

# R-Analytics Configuration
packages/r-analytics/config/environment-loader-r-analytics.ts ✅
packages/r-analytics/src/config/r-analytics-config.ts ✅
packages/r-analytics/start-iaf-analytics.sh ✅

# Environment Templates
packages/frontend/.env.dual-template ✅
packages/backend/.env.dual-template ✅
packages/r-analytics/.env.dual-template ✅
```

#### **Benefits Achieved**
- ✅ **Zero Hardcoded Values**: All configurations externalized
- ✅ **Automatic Environment Switching**: Smart detection based on hostname
- ✅ **Single Codebase**: Same code works in both environments
- ✅ **Secure Configuration**: Proper credential management
- ✅ **Easy Deployment**: Simple rsync process with automatic detection
- ✅ **Production Ready**: Enterprise-grade configuration system

### **🎯 FINAL DEPLOYMENT ANSWER**

**YES - The deployment process is validated and working:**

```bash
# ONE COMMAND TO DEPLOY:
rsync -avz --progress --exclude='node_modules' ./ifrs9-iaf/ root@10.18.11.35:~/projects/ifrs9-iaf/

# ONE COMMAND TO RESTART:
# Restart all services using start.sh scripts
cd packages/frontend && ./start.sh
cd packages/backend && ./start.sh
cd packages/r-analytics/shiny-app && ./start.sh
```

The **centralized dual-environment configuration system** ensures:
- ✅ **Seamless switching** between local development and IAF production
- ✅ **Automatic detection** of deployment environment
- ✅ **Zero hardcoded values** in any component
- ✅ **Production security** with RDS databases and HTTPS
- ✅ **Developer-friendly** local testing with production-like setup

**The IFRS9 platform is now enterprise-ready with robust dual-environment support!** 🚀

## Configuration

### Environment Variables
Key environment variables are defined in `src/config/app.ts`:
- Database connections (per tenant)
- JWT secrets for authentication
- R Analytics service configuration
- Redis configuration
- Banking-specific settings (Islamic compliance, AAOIFI standards)

### Multi-Tenant Configuration
- Tenant databases configured in `config/tenant-databases.env`
- Each tenant has isolated database schema
- Tenant-specific configurations stored in tenant config service

### TypeScript Paths
Workspace aliases defined in `tsconfig.json`:
- `@ifrs9/shared` - Shared package
- `@ifrs9/backend` - Backend package  
- `@ifrs9/frontend` - Frontend package
- `@ifrs9/r-analytics` - R Analytics package

## Production Workflow

### Starting Production Environment
🏭 **PRODUCTION MODE ONLY - NO DEVELOPMENT MODE ALLOWED**
1. Run `pnpm run setup:full` for initial setup
2. Use `pnpm dev` to start all services (connects to PRODUCTION databases)
3. Frontend runs on https://ifrs9.ifrspro.id (PRODUCTION)
4. Backend API runs on https://bifrs9.ifrspro.id (PRODUCTION)
5. R Analytics on production ports per tenant

### PRODUCTION DATABASE CONNECTIONS (ALIBABA CLOUD RDS)
- **RDS Service**: All databases hosted on Alibaba Cloud RDS
- **Multi-Database**: Platform, Tenants, Legacy FRS9PRO, IFRS9 Analytics
- **Connection Method**: Via RDS service endpoints (not direct IP connections)
- **R Analytics**: Must connect to RDS for all IFRS9 calculations and data access

### Testing
- Backend uses Jest for unit/integration testing
- Frontend uses Next.js built-in testing
- Run `pnpm test` from root for full test suite
- Individual package tests: `cd packages/[package] && pnpm test`

### Database Management  
- Migrations in `database/migrations/`
- Use Sequelize ORM for database operations
- Multi-tenant migrations handle schema creation per tenant
- Seed data for demo conventional/Syariah tenants

### Code Organization
- **Controllers**: Handle HTTP requests (`src/api/controllers/`)
- **Services**: Business logic (`src/core/services/`)
- **Models**: Database models (`src/core/models/`)
- **Middleware**: Request processing (`src/api/middleware/`)
- **Types**: TypeScript definitions (`src/types/`)

### Banking-Specific Features
- **Dual Banking**: Support for conventional and Islamic banking
- **Syariah Compliance**: AAOIFI standards compliance checking
- **IFRS9 Calculations**: Expected Credit Loss calculations
- **Regulatory Reporting**: Multi-jurisdiction reporting capabilities

### **Naming Pattern**:
```
[000]-[000]-[00]-[file-name].md
```

---

## 🗄️ **DATABASE ARCHITECTURE DOCUMENTATION**

### **📋 Complete Database Schema Documentation**

The comprehensive database architecture documentation is now available at:
**📄 `/home/doppelgaenger/ifrspro/_briefs/_v7/database-architecture-docs.md`**

#### **Key Database Components Covered:**

##### **🏢 Multi-Database Architecture**
- **Platform Admin Database** (`ifrspro_platform_admin`): Cross-tenant management
- **Tenant Databases** (`ifrspro_tenant_{slug}`): Complete business isolation
- **Shared Services Database** (`ifrspro_shared_services`): Common reference data
- **Legacy Integration** (`FRS9PRO`): Legacy system bridge

##### **👥 User Management & Security**
- **Roles System**: Hierarchical RBAC with 10 IAF-specific roles
- **Permission Matrix**: Granular access control (view, create, edit, delete, approve)
- **Multi-Factor Authentication**: Complete MFA support with backup codes
- **Session Management**: Secure session tracking and device management

##### **📋 Menu Navigation System**
- **Dynamic Menu Structure**: Database-driven navigation with 55+ menu items
- **Role-Based Menu Access**: Context-aware menu display based on user permissions
- **Banking Mode Support**: Separate conventional and Islamic banking menus
- **Hierarchical Menu Organization**: Multi-level menu with parent-child relationships

##### **🏦 Banking Data Models**
- **Portfolio Accounts**: Complete account management with IFRS 9 staging
- **Customer Management**: Individual and corporate customer data
- **Islamic Banking Compliance**: Syariah contract types and compliance tracking
- **Risk Assessment**: Credit scoring, collateral management, and risk grading

##### **🔐 Audit & Compliance**
- **Comprehensive Audit Trail**: Complete change tracking with user context
- **User Activity Logging**: Detailed user action tracking
- **Compliance Monitoring**: Regulatory compliance flags and risk assessment
- **Data Change History**: Complete modification audit with before/after values

#### **IAF Tenant Role Hierarchy (Current Implementation):**

| Level | Role Code | Role Name | Islamic Banking | Current Status |
|-------|-----------|-----------|-----------------|----------------|
| 10 | IAF_TENANT_SUPERADMIN | IAF Tenant Super Administrator | ✅ | ✅ **IMPLEMENTED** |
| 9 | IAF_TENANT_ADMIN | IAF Tenant Administrator | ✅ | ✅ **IMPLEMENTED** |
| 8 | IAF_BANK_CRO | IAF Chief Risk Officer | ✅ | ✅ **IMPLEMENTED** |
| 7 | IAF_IFRS_MANAGER | IAF IFRS 9 Manager | ✅ | ✅ **IMPLEMENTED** |
| 6 | IAF_RISK_ANALYST | IAF Risk Analyst | ✅ | ✅ **IMPLEMENTED** |
| 6 | IAF_PORTFOLIO_MANAGER | IAF Portfolio Manager | ✅ | ✅ **IMPLEMENTED** |
| 5 | IAF_DATA_ADMIN | IAF Data Administrator | ✅ | ✅ **IMPLEMENTED** |
| 5 | IAF_REPORT_ANALYST | IAF Report Analyst | ✅ | ✅ **IMPLEMENTED** |
| 4 | IAF_AUDITOR | IAF Internal Auditor | ✅ | ✅ **IMPLEMENTED** |
| 1 | IAF_VIEWER | IAF Viewer | ✅ | ✅ **IMPLEMENTED** |

#### **✅ Current Implementation Status:**

**Database Setup Verification (Latest Check):**
```
✅ Connected to tenant database (ifrspro_tenant_iaf)
📋 Roles in tenant database:
  IAF_AUDITOR - IAF Internal Auditor (Active: true)
  IAF_BANK_CRO - IAF Chief Risk Officer (Active: true)
  IAF_DATA_ADMIN - IAF Data Administrator (Active: true)
  IAF_IFRS_MANAGER - IAF IFRS 9 Manager (Active: true)
  IAF_PORTFOLIO_MANAGER - IAF Portfolio Manager (Active: true)
  IAF_REPORT_ANALYST - IAF Report Analyst (Active: true)
  IAF_RISK_ANALYST - IAF Risk Analyst (Active: true)
  IAF_TENANT_ADMIN - IAF Tenant Administrator (Active: true)
  IAF_TENANT_SUPERADMIN - IAF Tenant Super Administrator (Active: true)
  IAF_VIEWER - IAF Viewer (Active: true)
```

**✅ Successfully Implemented:**
- **10 IAF Tenant Roles** with proper hierarchy and permissions
- **8+ Basic Menu Items** with role-based access control
- **admin@iaf.co.id** assigned to **IAF_TENANT_SUPERADMIN** role
- **Complete tenant isolation** in `ifrspro_tenant_iaf` database
- **Permission matrix** with granular access control
- **Banking mode support** for both conventional and Islamic banking

#### **📖 Detailed Documentation Sections:**

1. **Multi-Database Architecture** - Complete database hierarchy and connection patterns
2. **User Management System** - Roles, permissions, and authentication flows
3. **Menu Navigation System** - Database-driven menu with role-based filtering
4. **Security & Authentication** - MFA, session management, and audit trails
5. **Banking Data Models** - Portfolio, customer, and product management
6. **Performance & Optimization** - Indexing strategy and query optimization
7. **Legacy System Integration** - FRS9PRO migration bridge and data synchronization
8. **Monitoring & Maintenance** - Health checks and database maintenance procedures

#### **🔗 Database Connection Examples:**

```typescript
// Tenant Database Connection Pattern
const tenantConnection = await getTenantConnection('iaf');
// Uses: ifrspro_tenant_iaf database with complete business isolation

// Platform Database Connection Pattern
const platformConnection = getPlatformConnection();
// Uses: ifrspro_platform_admin database for cross-tenant operations
```

#### **📚 Architecture Principles:**

- **Complete Data Isolation**: Database-per-tenant architecture ensures zero data leakage
- **Flexible Role System**: Hierarchical RBAC supporting complex banking organizational structures
- **Banking Mode Support**: Full support for both conventional and Islamic banking operations
- **Regulatory Compliance**: Complete audit trail for banking regulatory requirements
- **Performance Optimization**: Strategic indexing and query optimization for enterprise scale
- **Security Best Practices**: Row-level security, encryption, and comprehensive access controls

**📄 For complete database schema, SQL scripts, and implementation details, refer to: `/home/doppelgaenger/ifrspro/_briefs/_v7/database-architecture-docs.md`**