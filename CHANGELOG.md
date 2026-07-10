# Changelog

## [v2.14.50] - 2026-07-10

### Fixed
- Fixed bug in `parameters.service.ts` where system settings (like `CURRDSPLY`) could not be saved due to an incorrect duplicate sequence check.
- Dropped deprecated `frs9pro` lowercase database to consolidate instances.

### Changed
- Configured local environment variables to explicitly use uppercase `FRS9PRO` database.
- Routed NGINX intercept configuration to direct analytics traffic to Shiny.

## [v2.14.22] - 2026-07-05

### Added
- Export buttons (Excel) for all IFRS9 report pages: Lifetime PD, Lifetime LGD, EAD Model, ECL Movement, GCA Movement
- Export permissions for all report types (6 new `.export` codes added to DB + catalog)
- `r_analytics_comprehensive` approval matrix in DB

### Fixed
- Report sub-pages no longer reference deleted `banking.reports.ifrs9.view` fallback
- Sidebar entries use specific permissions instead of fallback
- Overview page export buttons use per-report permissions

## [v2.14.21] - 2026-07-05

### Added
- R Analytics Model Approval matrix (Checker → Approver) for model_status updates
- `r_analytics_comprehensive` added to strict four-eyes entities

## [v2.14.20] - 2026-07-05

### Fixed
- Re-added `banking.processing.impairment.view` and `banking.processing.amortization.view` to DB after accidental deletion
- Cleaned up dead `banking.processing.view`, `banking.processing` (standalone), `banking.analytics.view`

### Changed
- Sidebar impairment/amortization now uses specific permissions instead of `banking.reports.ifrs9.view`
- Default BullMQ `attempts` set to 0 (user configures via job definition `maxRetries`)

## [v2.14.15-18] - 2026-07-05

### Fixed
- ECL config approval execution: added missing `defaultRuleId` column to Drizzle schema (`legacy/index.ts:248`)
- Superadmin can now bypass "already approved" SoD checks via `APPROVAL_ALLOW_SUPERADMIN_LEVEL_BYPASS`
- BullMQ worker `lockDuration` increased to prevent "job stalled" errors (approval: 60s, ECL: 2h)
- ECL worker `maxStalledCount: 0` to disable stall detection for long-running stored procedures
- MaxRetry from job definitions now wired to BullMQ `attempts` via `ECLCalculationJob.attempts`
- OTel spans now tagged with `request_id` matching API error response `requestId`

### Changed
- Replaced `banking.configuration.ifrs9` permission (Tools) with dead config — deleted from DB and code
- Consolidated `banking.collective.{pd,lgd,ead}` → `banking.collective.{pd,lgd,ead}_setup` to eliminate duplicate permission groups
- Removed all `.manage` permissions from DB (34 codes) — simplified to view/create/update/delete/approve only
- Removed all standalone parent permissions (e.g. `banking.collective.bucket`, `banking.reports.ifrs9.nominative`)
- Updated test to match removed `parameter` from strict four-eyes entities

### Removed
- `banking.parameter.{view,create,update,delete,manage}` — dead parent permissions
- `banking.configuration.*` — dead Tools section
- `site:` tools/ directory — dead pages
- Dead `IFRS9_TOOLS_MANAGE`, `PARAMETER_BASE_VIEW`, and 14 other unused permission array constants
- Standalone report parent entries (`ead_model`, `ecl_movement`, etc.) — consolidated to only `.view`/`.export`
