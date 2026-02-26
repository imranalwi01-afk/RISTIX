# Environment Variables

This guide documents the environment variables used across the IAF IFRS9 System.

## 💻 Frontend (Next.js)

These variables are prefixed with `NEXT_PUBLIC_` to be available in the browser.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BACKEND_URL` | Base URL for the Backend API | `http://localhost:3001` |
| `NEXT_PUBLIC_API_BASE_URL` | Canonical API base (v1) | `/api/v1` |
| `NEXT_PUBLIC_RAPI_BASE_URL` | R Analytics API Base URL | `/api` |
| `NEXT_PUBLIC_R_ANALYTICS_URL`| R Shiny Dashboard Base URL | `http://localhost:4236` |
| `NEXT_PUBLIC_WS_URL` | WebSocket Server URL | `ws://localhost:3002` |
| `NEXT_PUBLIC_TENANT_ID` | Default Tenant ID | `iaf` |
| `NEXT_PUBLIC_BANKING_TYPE` | Default Banking Mode (`conventional`/`syariah`) | `conventional` |

---

## ⚙️ Backend (Node.js/Hono)

Variables used by the primary backend service.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `3001` |
| `HOST` | Server binding host | `0.0.0.0` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `LOG_LEVEL` | Minimum log severity to capture | `debug` |

---

## 📈 R-Analytics (R/Plumber/Shiny)

Variables used by the statistical computing engine.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `R_SERVICE_PORT` | Port for the Plumber API | `4241` |
| `R_PORT` | Port for the Shiny Dashboard | `4236` |
| `R_ENABLE_CORS` | Inject CORS headers in API responses | `true` |
| `FRS9_DB_HOST` | Database Host (Preferred) | `localhost` |
| `DB_HOST` | Database Host (Legacy Fallback) | `localhost` |
| `FRS9_DB_NAME` | Database Name (Preferred) | `FRS9PRO` |
| `DB_NAME` | Database Name (Legacy Fallback) | `postgres` |
| `DB_SSLMODE` | PostgreSQL SSL mode | `disable` |
| `R_ANALYTICS_DEBUG_MODE`| Enable verbose logging in R scripts | `false` |

> [!TIP]
> Always prefer variables prefixed with `FRS9_` for database configuration in R-Analytics to avoid conflicts with shared environment files.
