# Docker Local Development - Quick Start Guide

## 🚀 Running Frontend + New-Backend Locally

### ✅ Configuration Complete

**Services:**
- **Frontend**: http://localhost:4231 (Next.js with hot reload)
- **Backend**: http://localhost:4232/api/v1 (Hono + Bun)
- **API Docs**: http://localhost:4232/reference (Scalar UI)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 📋 Prerequisites

1. **Docker & Docker Compose** installed
2. **Make** installed (optional, for shortcuts)
3. **Environment files** configured

### 🔧 Setup Steps

#### 1. Configure Environment Variables

```bash
# Copy environment template
cp packages/new-backend/.env.example packages/new-backend/.env

# Edit database settings to point to your database
# Default: localhost:5432 (works with Docker postgres)
```

**Key settings in `packages/new-backend/.env`:**
```env
# Database (uses Docker postgres by default)
PLATFORM_DB_HOST=postgres
PLATFORM_DB_PORT=5432
PLATFORM_DB_NAME=ifrspro_platform_admin
PLATFORM_DB_USER=postgres
PLATFORM_DB_PASSWORD=postgres

# Or point to external database
PLATFORM_DB_HOST=192.168.0.85
PLATFORM_DB_PORT=5432
```

#### 2. Start Services

**Option A: Using Make (Recommended)**
```bash
# Start full stack (frontend + backend + databases)
make local-full

# Or start individual services
make local-db        # Just databases
make local-backend   # Just backend
make local-frontend  # Just frontend
```

**Option B: Using Docker Compose Directly**
```bash
cd ops/local

# Start full stack
docker-compose --profile full up

# Start with rebuild
docker-compose --profile full up --build

# Start in background
docker-compose --profile full up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 3. Verify Services

```bash
# Check backend health
curl http://localhost:4232/api/v1/health

# Expected response:
# {
#   "status": "ok",
#   "runtime": "bun",
#   "version": "1.0.0",
#   "timestamp": "2026-01-15T..."
# }

# Check frontend
open http://localhost:4231

# Check API documentation
open http://localhost:4232/reference
```

### 🔍 Service Details

#### Frontend (localhost:4231)
- **Container**: `ifrs9-frontend-dev-hot`
- **Hot Reload**: ✅ Enabled
- **API Target**: `http://new-backend:4232/api/v1`
- **Volumes**: Source code mounted for live updates

#### Backend (localhost:4232)
- **Container**: `ifrs9-new-backend-dev`
- **Runtime**: Bun
- **Framework**: Hono
- **ORM**: Drizzle
- **Hot Reload**: ✅ Enabled (via `bun run dev`)

#### PostgreSQL (localhost:5432)
- **Container**: `ifrs9-postgres-dev`
- **Version**: PostgreSQL 16 Alpine
- **Database**: `ifrspro_platform_admin`
- **Credentials**: postgres/postgres

#### Redis (localhost:6379)
- **Container**: `ifrs9-redis-dev`
- **Version**: Redis 7 Alpine
- **Persistence**: ✅ Enabled (AOF)

### 🐛 Troubleshooting

#### Frontend can't connect to backend

**Symptom**: API calls fail, CORS errors

**Solution**:
```bash
# Check backend is running
docker-compose ps

# Check backend logs
docker-compose logs new-backend

# Verify network
docker network inspect ops_local_ifrs9-dev
```

#### Database connection failed

**Symptom**: Backend crashes with database error

**Solution**:
```bash
# Check postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Verify database exists
docker-compose exec postgres psql -U postgres -c "\l"

# Create database if missing
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE ifrspro_platform_admin;"
```

#### Port already in use

**Symptom**: Error binding to port 4231 or 4232

**Solution**:
```bash
# Find process using port
lsof -i :4231
lsof -i :4232

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

#### Hot reload not working

**Symptom**: Code changes don't reflect

**Solution**:
```bash
# Restart with rebuild
docker-compose --profile full down
docker-compose --profile full up --build

# Or restart specific service
docker-compose restart frontend-dev
docker-compose restart new-backend
```

### 📝 Development Workflow

#### Making Changes

**Frontend changes:**
1. Edit files in `packages/frontend/src/`
2. Changes auto-reload (watch mode)
3. Refresh browser to see updates

**Backend changes:**
1. Edit files in `packages/new-backend/src/`
2. Bun auto-restarts (watch mode)
3. API changes immediately available

**Database changes:**
1. Create migration in `packages/new-backend/drizzle/`
2. Run migration: `docker-compose exec new-backend bun run db:migrate`

#### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend-dev
docker-compose logs -f new-backend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 new-backend
```

#### Accessing Containers

```bash
# Backend shell
docker-compose exec new-backend sh

# Frontend shell
docker-compose exec frontend-dev sh

# Postgres shell
docker-compose exec postgres psql -U postgres -d ifrspro_platform_admin

# Redis shell
docker-compose exec redis redis-cli
```

### 🧪 Testing API Endpoints

#### Using curl

```bash
# Health check
curl http://localhost:4232/api/v1/health

# Auth (example)
curl -X POST http://localhost:4232/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Menu
curl http://localhost:4232/api/v1/menu
```

#### Using Browser

```
# API Documentation (Interactive)
http://localhost:4232/reference

# OpenAPI Spec
http://localhost:4232/doc

# Frontend
http://localhost:4231
```

### 🔄 Common Commands

```bash
# Start everything
make local-full

# Stop everything
docker-compose down

# Restart backend only
docker-compose restart new-backend

# Rebuild and restart
docker-compose up --build new-backend

# View backend logs
docker-compose logs -f new-backend

# Clean everything (including volumes)
docker-compose down -v

# Check status
docker-compose ps
```

### 📊 Service Health Checks

**Backend Health:**
```bash
curl http://localhost:4232/api/v1/health
```

**Database Health:**
```bash
docker-compose exec postgres pg_isready -U postgres
```

**Redis Health:**
```bash
docker-compose exec redis redis-cli ping
```

### 🎯 Next Steps

After services are running:

1. **Test Frontend**: Open http://localhost:4231
2. **Test API**: Open http://localhost:4232/reference
3. **Check Logs**: `docker-compose logs -f`
4. **Start Development**: Edit code and see live updates!

### 📚 Additional Resources

- **API Documentation**: http://localhost:4232/reference
- **OpenAPI Spec**: http://localhost:4232/doc
- **Drizzle Studio**: `docker-compose exec new-backend bun run db:studio`

### 🚨 Important Notes

1. **First Run**: May take 5-10 minutes to download images and install dependencies
2. **Database**: Ensure `ifrspro_platform_admin` database exists
3. **Hot Reload**: Works for both frontend and backend
4. **Ports**: Make sure 4231, 4232, 5432, 6379 are available
5. **Network**: Services communicate via Docker network `ifrs9-dev`

### ✅ Success Indicators

When everything is working:
- ✅ `docker-compose ps` shows all services as "Up"
- ✅ http://localhost:4231 loads frontend
- ✅ http://localhost:4232/api/v1/health returns `{"status":"ok"}`
- ✅ http://localhost:4232/reference shows API docs
- ✅ No errors in `docker-compose logs`

Happy coding! 🚀
