# Logging & Observability

## Architecture

```
Backend (Bun/Pino)
  ├── stdout (JSON lines) → Docker json-file → Loki
  ├── OTLP Traces (gRPC) → otel-collector → Tempo
  └── OTLP Metrics (gRPC) → otel-collector → Prometheus

Frontend (Next.js)
  └── OTLP Traces (HTTP) → otel-collector → Tempo

Grafana
  ├── Loki (logs)
  ├── Tempo (traces)
  └── Prometheus (metrics)
```

## Log Format (Pino)

Every log line is a JSON object written to stdout:

```json
{
  "level": 30,
  "time": "2026-07-08T03:36:16.087Z",
  "service": "ifrs9-new-backend",
  "environment": "development",
  "requestId": "Zstme5sq1uQed0dRmYmeg",
  "tenantId": "f7b3a087-8a42-40c4-baca-9dc92cc0a2be",
  "method": "PUT",
  "path": "/api/v1/roles/...",
  "status": 500,
  "durationMs": 42.91,
  "msg": "request.completed"
}
```

### Standard Fields
| Field | Source | Description |
|-------|--------|-------------|
| `level` | Pino | 10=trace, 20=debug, 30=info, 40=warn, 50=error |
| `time` | Pino | ISO 8601 timestamp |
| `service` | Pino base | `ifrs9-new-backend` |
| `environment` | Pino base | `development` (always "development" due to Bun's NODE_ENV) |
| `requestId` | Middleware | UUID per-request, matches API error responses |
| `tenantId` | Auth middleware | Tenant UUID |
| `userId` | Auth middleware | User UUID |
| `method` | Router | HTTP method |
| `path` | Router | Request path |
| `status` | Router | HTTP status code |
| `durationMs` | Router | Request duration in ms |
| `msg` | Code | Human-readable description |

## OpenTelemetry Traces (Tempo)

### Span Attributes
Every HTTP request creates a span with:
- `http.method`, `http.url`, `http.path`, `http.status_code`
- `request_id` — matches API error response
- `tenant_id`, `user_id`

### DB Tracing
Postgres queries wrapped by `wrapSql` Proxy adds:
- `db.statement`, `db.duration_ms`, `db.row_count`, `db.parameters`

### Job Tracing
BullMQ workers wrapped by `traceJobProcessor()` adds:
- `job.process.{queueName}`, `job.enqueue`

### Sampling
- Errors: 100% sampled
- Success: 10% sampled

## Querying

**Grafana**: `https://ristix.bdo-ki.com/monitoring/`

### Loki (Logs)
| Query | Finds |
|-------|-------|
| `{container="ifrs9-backend-prod"} \|= "94a468da"` | Request by ID |
| `{container="ifrs9-backend-prod"} \| json \| status = 500` | All errors |
| `{container="ifrs9-backend-prod"} \|= "Query:"` | DB SQL queries |

### Tempo (Traces)
Search by `request_id`, `http.path`, `http.status_code`, or `service.name`.

## Known Issues & Improvements

### 1. Environment Label Shows "development"
Pino base is set at module load time before `env.ts` parses `NODE_ENV`. Always shows `"development"` because Bun compiles with that default. The actual env is printed in a separate startup log.

### 2. console.error Used for Unhandled Errors
The `default` case in `handleEffectError` uses `console.error('Unhandled error:', error)` which writes plain text, not JSON. Fix: use `logger.error({ err: error })`.

### 3. No Loki Log Driver in Docker Compose
Logs use Docker's default json-file driver. No Promtail or Loki plugin is configured, so logs may not be reliably shipped to Loki. Fix: add `logging:` block with Loki driver.

### 4. Log Level Not Dynamically Configurable
`LOG_LEVEL` env var is read once at startup. Cannot change without container restart. Fix: add `/admin/log-level` endpoint.
