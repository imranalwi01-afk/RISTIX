# Arsitektur Aplikasi

## Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), Material UI v7, React Query, Redux Toolkit |
| **Backend** | Hono + Effect-TS + Drizzle ORM |
| **Database** | PostgreSQL (3 koneksi: Platform, Tenant, Legacy) |
| **Queue** | BullMQ + Redis |
| **Auth** | JWT (access + refresh token) |
| **R Analytics** | R Shiny server (terpisah) |
| **Observability** | OpenTelemetry → Tempo + Loki + Prometheus + Grafana |

## Arsitektur Multi-Tenant

Setiap tenant punya database sendiri (`ifrspro_tenant_{slug}`) + shared database (`ifrspro_platform_admin`) + legacy database (`FRS9PRO`).

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│              Next.js 16 + MUI v7                 │
└──────────┬──────────────────────┬────────────────┘
           │ API calls            │ R Analytics
           ▼                      ▼
┌──────────────────┐    ┌──────────────────┐
│   Backend Hono   │    │   R Shiny Server │
│ + Effect + Drizzle│   │   Port 4236/4241 │
└──┬───────┬───────┘    └──────────────────┘
   │       │
   ▼       ▼
┌──────────┴──────────┐
│    Database Layer    │
├─────────────────────┤
│ Platform DB          │ ← menu, tenants, platform settings
│ (ifrspro_platform)   │
├─────────────────────┤
│ Tenant DB            │ ← roles, users, permissions, approval
│ (ifrspro_tenant_*)   │
├─────────────────────┤
│ Legacy DB            │ ← IFRS9 data: master_account, result, config
│ (FRS9PRO)            │
└──────────────────────┘
```

## Alur Data

### Read Flow (Contoh: ECL Result Report)

```
User → Next.js (SSR) → /api/v1/banking/ifrs9-reports/ecl-result
  → Hono route → ifrs9ReportsController.getECLResult()
    → ifrs9ReportsService.getECLResult()
      → SELECT FROM public.frs9_ecl_summary (Legacy DB)
    → Response: { data, pagination, summary }
  → Frontend: BaseIfrs9Report → ECLResultReport → charts + cards
```

### Write Flow (Contoh: Update Product Parameter)

```
User → Form dialog → API call → /api/v1/banking/parameters/product/{id}
  → Auth middleware → verify JWT + permissions
  → Approval interceptor → check if approval required
    → if yes: create approval request, return 202
    → if no: langsung update DB, return 200
  → Audit log → insert ke audit.audit_logs
```

## Koneksi Database

Backend maintain **3 koneksi PostgreSQL** terpisah:

```typescript
// config/database.ts
platformDb → Platform DB (menu, platform_admin schema)
tenantDb   → Tenant DB (core, approval, audit schema)
legacyDb   → Legacy DB (FRS9PRO - frs9_* tables)
```

Dipilih via helper `getDatabase(tenantId)`:
- `tenantId` provided → return `tenantDb`
- `tenantId` null/undefined → return `platformDb`

## Struktur Package

```
packages/
├── frontend/         # Next.js 16 App Router
│   └── src/
│       ├── app/      # Pages (App Router)
│       ├── components/ # UI Components
│       ├── features/  # Feature modules (api + hooks + domain)
│       ├── services/  # API clients
│       ├── store/     # Redux
│       └── utils/     # Utilities
├── new-backend/      # Hono + Effect + Drizzle
│   └── src/
│       ├── routes/    # API route handlers
│       ├── controllers/ # Controller logic
│       ├── services/  # Business logic
│       ├── repositories/ # Data access
│       ├── middleware/ # Auth, audit, approval
│       └── db/        # Schema, migrations, seeds
└── r-analytics/      # R Shiny
```

## Observability Stack

Berjalan di Docker terpisah (`docker-compose.observability.yml`):

| Service | Port | Fungsi |
|---------|------|--------|
| otel-collector | 4317 (gRPC), 4318 (HTTP) | Terima traces dari app |
| Tempo | 3200 | Store traces |
| Loki | 3100 | Store logs |
| Prometheus | 9090 | Store metrics |
| Grafana | 3000 | Dashboard unified |
