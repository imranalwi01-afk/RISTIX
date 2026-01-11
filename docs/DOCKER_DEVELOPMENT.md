# Docker Compose Development Guide

## 🎯 Quick Start

The docker-compose setup now supports **profiles** for maximum flexibility!

### Available Profiles

| Profile | Services Started | Use Case |
|---------|-----------------|----------|
| `db` | postgres + redis | Running app locally, need databases |
| `app` | backend + frontend | Using external/remote databases |
| `full` | All services | Complete Docker environment |
| (none) | Manual selection | Pick specific services |

---

## 📋 Common Scenarios

### 1️⃣ Local Development (Recommended)
**Run databases in Docker, app locally**

```bash
# Start databases
docker-compose -f docker-compose.dev.yml --profile db up -d

# In separate terminals:
cd packages/new-backend && bun run dev
cd packages/frontend && pnpm run dev
```

**Why?** Fastest hot-reload, easy debugging, native performance

---

### 2️⃣ App in Docker, External Databases
**Use remote/production databases**

```bash
# Set environment variables in .env
DATABASE_URL=postgresql://user:pass@remote-host:5432/db
REDIS_URL=redis://remote-host:6379

# Start app services only
docker-compose -f docker-compose.dev.yml --profile app up -d
```

**Why?** Test against real data, staging environment

---

### 3️⃣ Full Docker Environment
**Everything in containers**

```bash
docker-compose -f docker-compose.dev.yml --profile full up -d
```

**Why?** Consistent environment, easy onboarding, CI/CD testing

---

### 4️⃣ Backend in Docker, Frontend Local
**Mix and match**

```bash
# Start backend with databases
docker-compose -f docker-compose.dev.yml up -d postgres redis new-backend

# Run frontend locally
cd packages/frontend && pnpm run dev
```

**Why?** Debug frontend easily, backend isolated

---

## 🛠️ Useful Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f new-backend
```

### Run Migrations
```bash
docker-compose -f docker-compose.dev.yml exec new-backend bun run db:migrate
```

### Access Database
```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d ifrspro_platform_admin
```

### Stop Services
```bash
# Stop all
docker-compose -f docker-compose.dev.yml --profile full down

# Stop specific profile
docker-compose -f docker-compose.dev.yml --profile db down
```

### Clean Up (⚠️ Deletes Data)
```bash
# Remove containers and volumes
docker-compose -f docker-compose.dev.yml down -v
```

---

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and adjust for your scenario:

```bash
cp .env.example .env
```

### Key Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Main database connection | `postgresql://postgres:postgres@localhost:5432/ifrspro_platform_admin` |
| `LEGACY_DATABASE_URL` | Legacy FRS9PRO database | `postgresql://postgres:postgres@localhost:5432/frs9pro` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | `dev-jwt-secret-change-in-production` |

---

## 🚀 Performance Tips

1. **Use local development** for fastest hot-reload
2. **Mount volumes** for code changes without rebuilds
3. **Use BuildKit** for faster Docker builds:
   ```bash
   export DOCKER_BUILDKIT=1
   ```
4. **Prune regularly** to free disk space:
   ```bash
   docker system prune -a
   ```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5432  # or :6379, :4232, :4231

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check if postgres is healthy
docker-compose -f docker-compose.dev.yml ps

# Restart postgres
docker-compose -f docker-compose.dev.yml restart postgres
```

### Can't Connect to Redis
```bash
# Test Redis connection
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping
```

---

## 📚 Additional Resources

- [Docker Compose Profiles Docs](https://docs.docker.com/compose/profiles/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
