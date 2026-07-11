# Development Setup

## Prerequisites

- Node.js 20+
- Bun 1.x
- pnpm 10.x
- Docker + Docker Compose
- PostgreSQL 16

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/ifrspro/ifrs9-iaf.git
cd ifrs9-iaf

# Install dependencies
cd packages/new-backend && pnpm install && cd ../..
cd packages/frontend && pnpm install && cd ../..
```

### 2. Start Infrastructure (DB + Redis)

```bash
docker compose -f ops/local/docker-compose.yml --profile db up -d
```

Ini akan menjalankan:
- PostgreSQL (port 5432)
- Redis (port 6379)

### 3. Setup Database

```bash
# Init platform DB
docker compose -f ops/local/docker-compose.yml --profile bootstrap up

# Run backend (auto-migrate)
cd packages/new-backend
pnpm run dev
```

### 4. Start Frontend

```bash
cd packages/frontend
pnpm run dev
```

Akses di http://localhost:4231

## Environment Variables

### Backend (`packages/new-backend/.env`)

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ifrspro_platform_admin
TENANT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ifrspro_tenant_iaf
LEGACY_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/FRS9PRO

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production

# Redis
REDIS_URL=redis://localhost:6379
```

### Frontend (`packages/frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4232/api/v1
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4232/api/v1
NEXT_PUBLIC_R_ANALYTICS_URL=http://localhost:4236
NEXT_PUBLIC_RAPI_BASE_URL=http://localhost:4241/api
```

## Docker Workflows

### Development (Windows/badak)
Trigger: push ke `develop` atau manual
```yaml
# docker-publish-dev.yml
# Build lokal di Windows server, no push ke registry
```

### Development (Linux/iaf-prod)
Trigger: manual (`workflow_dispatch`)
```yaml
# docker-publish.yml
# Build + push ke GHCR dengan tag :develop
```

### Production
Trigger: tag `v*.*.*` atau manual
```yaml
# docker-publish-prod.yml
# Build + push ke GHCR + deploy ke ristix.bdo-ki.com
```

## Build Commands

```bash
# Backend
cd packages/new-backend
pnpm run typecheck    # Type check
pnpm run dev          # Development mode (hot reload)
pnpm run build        # Build for production

# Frontend
cd packages/frontend
pnpm run type-check   # Type check
pnpm run lint         # ESLint
pnpm run build        # Production build
pnpm run dev          # Development (port 4231)

# Tests
pnpm --dir packages/new-backend run test
```

## Observability Stack

Untuk tracing & monitoring lokal:

```bash
docker compose -f docker-compose.observability.yml up -d
```

Akses Grafana di http://localhost:3000 (admin/admin)

## Struktur Docker Compose

### `ops/local/docker-compose.yml`
- Profiles: db, app, backend, frontend, analytics, full
- Jaringan: `ifrs9-dev`

### `docker-compose.observability.yml`
- Services: otel-collector, tempo, loki, prometheus, grafana
- Jaringan: `ifrs9-observability`

## Troubleshooting

### Port conflict
```bash
# Cek port usage
lsof -i :4231
lsof -i :4232
```

### Database connection refused
```bash
# Pastikan PostgreSQL running
docker ps | grep postgres
```

### Frontend can't reach backend
Pastikan environment variables set dengan benar. Di Docker, backend bisa diakses via `http://backend:4232` (internal network).
