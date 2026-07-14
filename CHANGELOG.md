# Changelog

## [v2.14.79] - 2026-07-14

### Fixed
- Fixed backend database query crash for Lifetime PD Yearly due to incorrect column mapping (\`model_id\` -> \`pd_model_id\`, \`cumulative_afl\` -> \`cumulative_yearly\`, \`marginal_afl\` -> \`marginal_yearly\`) in Drizzle schema for \`vw_frs9_pd_structure_yearly\`.

## [v2.14.77] - 2026-07-13

### Added
- Added GL Outbound report menu directly below Nominative Report in the Banking Sidebar.

### Fixed
- Fixed visual layout in BaseIfrs9Report where the sticky toolbar would slice through the report header banner. The banner now properly resides above the toolbar and scrolls away naturally.
- Adjusted root container padding on BaseIfrs9Report to prevent content from going under the floating action buttons on the right side.

## [v2.14.66] - 2026-07-12

### Fixed
- Reverted GitHub Actions runner labels from `ristix-prod` back to `iaf-prod` to unblock deployment queues on the self-hosted runner.


## [v2.14.65] - 2026-07-12

### Fixed
- Fixed hardcoded fallback texts in the frontend to correctly display "RISTIX" instead of legacy "IAF" and "IFRS 9" branding on the login page and global settings provider.


## [v2.14.62] - 2026-07-12

### Fixed
- Fixed an issue in the Individual Impairment Watchlist where the "View Details" and "Edit Assessment" icons were unclickable for accounts with a zero or falsy account_id due to strict truthiness checks.


## [v2.14.61] - 2026-07-12

### Fixed
- Fixed an issue where the `Individual Impairment` menu did not render because it was missing a proper legacy mapping and permission override in `BankingSidebarUtils.tsx`, causing the menu generation to drop it due to lack of standard `banking.individual.view` permission checks.
## [v2.14.60] - 2026-07-12

### Changed
- Replaced all legacy `danafin.com` domain configurations with the new `ristix.bdo-ki.com` domains across frontend, backend, analytics, and deployment scripts to prevent connection fallback errors.

### Fixed
- Fixed an issue where the `Individual Impairment` menu was hardcoded to be hidden from the sidebar navigation.
- Fixed a state desync issue where uploading an avatar did not immediately update the avatar displayed in the top application bar until a page refresh.
## [v2.14.59] - 2026-07-11

### Added
- Added custom User Avatar Upload functionality. Users can now upload their avatars via Profile Settings.
- Images are correctly encoded and stored into PostgreSQL database (`avatar_url`) eliminating the need for Docker volumes.
- Frontend App Bar and Profile Menu now dynamically retrieve and display user avatars in real-time.

### Changed
- Replaced login screen logo and side-bar logo with the transparent RISTIX PRO logo.
## [v2.14.58] - 2026-07-11

### Added
- Added visibility toggle in the Platform Control Center to easily hide and unhide menus per tenant.

### Fixed
- Fixed an issue where hidden menus were entirely filtered out by the backend and could not be seen or managed from the Platform Control Center.

## [v2.14.57] - 2026-07-11

### Fixed
- Fixed deployment paths for docker compose to trigger properly on server.

## [v2.14.52] - 2026-07-10

### Fixed
- Hidden the Advanced Analytics tabs and header when R Analytics is opened in a new tab (fullscreen mode).

## [v2.14.51] - 2026-07-10

### Changed
- Rebranded IFRS 9 platform texts to PSAK 413 globally.
- Updated main application favicon to use Ristix logo.
- Modified sidebar to hide Financial Reports, Executive Dashboard, Advanced Export, and Individual Impairment menus.

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
- R Analytics Model Approval matrix (Checker Ã¢â€ â€™ Approver) for model_status updates
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
- Replaced `banking.configuration.ifrs9` permission (Tools) with dead config Ã¢â‚¬â€ deleted from DB and code
- Consolidated `banking.collective.{pd,lgd,ead}` Ã¢â€ â€™ `banking.collective.{pd,lgd,ead}_setup` to eliminate duplicate permission groups
- Removed all `.manage` permissions from DB (34 codes) Ã¢â‚¬â€ simplified to view/create/update/delete/approve only
- Removed all standalone parent permissions (e.g. `banking.collective.bucket`, `banking.reports.ifrs9.nominative`)
- Updated test to match removed `parameter` from strict four-eyes entities

### Removed
- `banking.parameter.{view,create,update,delete,manage}` Ã¢â‚¬â€ dead parent permissions
- `banking.configuration.*` Ã¢â‚¬â€ dead Tools section
- `site:` tools/ directory Ã¢â‚¬â€ dead pages
- Dead `IFRS9_TOOLS_MANAGE`, `PARAMETER_BASE_VIEW`, and 14 other unused permission array constants
- Standalone report parent entries (`ead_model`, `ecl_movement`, etc.) Ã¢â‚¬â€ consolidated to only `.view`/`.export`
