# Phase 2 Coverage Plan (Backend API)

Date: February 24, 2026  
Scope: `/packages/new-backend`

Last updated: February 25, 2026

## Objective

Raise automated confidence from route-registry smoke checks to reliable behavior coverage across core API modules, with a target trajectory to **>=80% line coverage** on priority backend domains.

## Current Baseline

- Route registry checks: implemented and passing (`all-routes.registry.test.ts`)
- API/runtime tests: implemented and passing (`effect.runtime.test.ts`, `notifications.service.test.ts`)
- Wave 2 service tests in progress and passing:
  - `users.service.test.ts`
  - `rbac.service.test.ts`
- Repository routing tests migrated to Bun:
  - `tenant-db-routing-users.test.ts`
  - `tenant-db-routing-others.test.ts`
- Wave 3 approval-focused suites added and passing:
  - `approval-helpers.test.ts`
  - `permission-approval.service.test.ts`
- Route surface expanded with secured-operation contract sweep:
  - `all-routes.registry.test.ts` now validates all secured OpenAPI operations
  - Asserts non-404 and non-5xx behavior with minimal payloads (infra-independent)
- User create response contract coverage added:
  - `users.response-contract.test.ts`
  - Verifies `POST /api/v1/user` returns JSON contract for both `201` direct create and `202` approval-required flows
- Notification and approval route contract coverage added:
  - `notifications.response-contract.test.ts`
  - `approval.response-contract.test.ts`
  - Verifies success/error envelopes and payload mapping for key `/api/v1/notifications/*` and `/api/v1/approvals/*` endpoints
- Jobs and IFRS9 route contract coverage added:
  - `jobs.response-contract.test.ts`
  - `ifrs9.response-contract.test.ts`
  - Verifies key jobs queue/approval contracts and IFRS9 controller/stub endpoint contracts
- Approval service behavior coverage expanded:
  - `approval.service.test.ts`
  - Verifies conflict prevention, self-approval guard, requester cancellation ownership, pending-approval filtering, and fallback routing candidate resolution
- Branch-depth expansion completed for Wave 3:
  - `jobs.response-contract.test.ts` now covers runtime diagnostics, run conflict/queue failure branches, approval/reject decision paths, and metrics aggregation
  - `approval.service.test.ts` now covers status guards, matrix eligibility, multi-level progression, reject/request-info/delegate paths, cancellation paths, history/detail queries, and notification fallback behavior
  - `/api/v1/jobs/executions/pending-approval` static path collision with `/executions/{id}` is now guarded in route handler and covered by contract test

## Strategy

Use a **wave-based approach** so we improve quality continuously while avoiding a risky big-bang refactor.

### Wave 1 (Immediate, low risk, high leverage)

Focus:
- Core shared utilities used by many routes
- Error/response behavior contracts
- Notification flow (already implemented)

Deliverables:
- `lib/react-admin` tests
- `lib/effect/runtime` tests
- Notification service tests
- Route registry + OpenAPI mount checks

Acceptance:
- All Wave 1 tests green in CI/local
- No 5xx/404 regression on mounted route prefixes

### Wave 2 (Core identity & access)

Focus:
- `auth` middleware/service contracts
- `users` service & users routes
- `rbac` route validation and role CRUD contracts

Deliverables:
- Service tests with repository mocks:
  - `auth.service`
  - `users.service`
  - `rbac.service`
- Route contract tests:
  - `users.routes`
  - `rbac.routes`
  - auth critical endpoints (`/auth/login`, `/auth/verify`, `/auth/refresh`)

Acceptance:
- Auth/user/rbac module coverage >=80% lines per module bucket
- Create/update/delete endpoints return consistent `{ success, ... }` envelopes for 2xx/4xx

### Wave 3 (Approval + jobs + IFRS9 critical workflows)

Focus:
- 4-eyes approval lifecycle
- Job enqueue/approval/metrics route behavior
- IFRS9 route contracts and error handling

Deliverables:
- `approval.service` behavior tests
- `jobs.routes` contract tests with queue-service mocked
- IFRS9 route contract tests for common paths (`staging`, `models`, `reports`)

Acceptance:
- Approval + jobs + IFRS9 route buckets >=75% initially, then raised to >=80%
- Zero uncaught error path in critical route tests

Status:
- In progress:
  - Approval helper and permission approval service tests implemented and passing
  - Secured route sweep implemented and passing
  - Targeted `jobs.routes` behavior tests implemented and passing
  - Targeted IFRS9 route contract tests implemented and passing
  - Targeted `approval.service` behavior tests implemented and passing
- Remaining:
  - Expand dynamic executor-path tests (`users.service`, `rbac.service`, `parameters.service`) to reduce remaining uncovered action handlers
  - Add broader IFRS9 reports-focused contracts as report route surface grows

### Wave 4 (Banking setup/configuration modules)

Focus:
- Product/bucket/fl-scalar/pd/lgd/ead/ecl/business/app-settings/journal/segmentation routes

Deliverables:
- Table-driven route tests for payload validation and success/approval paths
- Service-level tests for each config service

Acceptance:
- Banking configuration route bucket >=80%
- Schema normalization tests cover snake_case and camelCase payloads

## Test Architecture Rules

1. Mock side-effect modules at import boundary:
   - queue/redis worker startup (`queue.service`)
2. Prefer service unit tests for branch coverage, route tests for contract coverage.
3. Every create/update/delete route test must assert:
   - status code
   - `success` shape
   - error payload consistency for invalid input
4. Keep test data deterministic and tenant-aware (`X-Tenant-*` context).

## Execution Commands

From `packages/new-backend`:

```bash
pnpm test:repositories
pnpm test:routes
pnpm test:coverage:api
pnpm test:approval
pnpm test:phase2:wave1
pnpm test:phase2:wave2
pnpm test:phase2:wave3
pnpm test:phase2:wave4
pnpm test:phase2:baseline
pnpm test:phase2:baseline:wave2
pnpm test:phase2:baseline:wave3
pnpm test:phase2:baseline:wave4
```

Note:
- `test:repositories` should run separately from the Wave 2 aggregate command because current Bun module mocks are process-global and can collide across unrelated suites.

## Definition of Done (Phase 2)

1. Phase 2 test commands pass reliably without external infra dependency (Redis/worker side effects mocked where needed).
2. Priority module buckets (`auth`, `users`, `rbac`, `approval`, `jobs`, `notifications`) are >=80% lines.
3. Route registry test remains green and covers all mounted prefixes.
4. API response contract for create/update flows is stable (no false-negative frontend errors on successful 2xx responses).

## Current Script Health (February 25, 2026)

- `pnpm --dir packages/new-backend test:phase2:wave3`: passing
- `pnpm --dir packages/new-backend test:phase2:wave4`: passing
- `pnpm --dir packages/new-backend test:phase2:baseline:wave3`: passing
- `pnpm --dir packages/new-backend test:phase2:baseline:wave4`: passing
- `pnpm --dir packages/new-backend test:coverage:routes`: passing (now delegates to `test:phase2:baseline:wave4` for process isolation)
- Cross-suite Bun mock collision was mitigated by splitting wave3 approval suites into separate process runs.
- Additional Bun mock isolation applied for route contract suites:
  - `test:users-route-contract`
  - `test:auth-route-contract`
  - `test:notifications-route-contract`
  - `test:approval-route-contract`
  - `test:jobs-route-contract`
  - `test:ifrs9-route-contract`
  - `test:approval-service`
  - All run separately and are chained in Wave 3 scripts

## Latest Coverage Snapshot (February 25, 2026)

- `jobs.routes.ts`: **82.71% lines**, **85.48% funcs** (`test:jobs-route-contract --coverage`)
- `approval.service.ts`: **96.61% lines**, **93.97% funcs** (`test:approval-service --coverage`)
- `ifrs9.routes.ts`: **100% lines**, **100% funcs** (`test:ifrs9-route-contract --coverage`)
- `tenants.routes.ts`: **95.75% lines**, **100% funcs** (`test:tenants-route-contract --coverage`)
- `platform-admin.routes.ts`: **100% lines**, **100% funcs** (`test:platform-admin-route-contract --coverage`)
- `phase2:baseline:wave4`: passing end-to-end with expanded route + service suites

## Risks and Mitigations

- Risk: Full-suite still blocked by Jest-only tests.
  - Mitigation: Migrate those tests to Bun mock APIs in a dedicated infra task.

- Risk: Import-time side effects (worker/redis) make tests flaky.
  - Mitigation: Standardized module mocking at test bootstrap for queue and external connectors.

- Risk: Large route surface area slows progress.
  - Mitigation: Prioritize high-traffic critical modules first (Wave 2/3), then expand.
