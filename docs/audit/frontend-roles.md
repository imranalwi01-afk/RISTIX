# Frontend Hardcoded Roles Audit

This document lists all hardcoded role strings and checks found in the frontend as of 2026-01-19. These should be refactored to use permission-based checks or moved to a configuration file.

## Hardcoded Roles List

### Platform Admin Roles
Used primarily to bypass all access checks and redirect to `/platform/admin`.
- `PLATFORM_SUPER_ADMIN`
- `PLATFORM_TECH_ADMIN`
- `PLATFORM_OPERATIONS`
- `PLATFORM_SUPPORT`
- `platform_super_admin`
- `platform_admin`
- `SUPER_ADMIN`

### Consultant Roles
Used to redirect users to `/consultant/dashboard`.
- `SENIOR_IFRS9_CONSULTANT`
- `ISLAMIC_BANKING_CONSULTANT`
- `RISK_CONSULTANT`
- `TECHNICAL_SPECIALIST`
- `R_ANALYTICS_CONSULTANT`
- `CONSULTANT_PROJECT_MANAGER`
- `consultant`
- `CONSULTANT`

### Regulator Roles
Used to redirect users to `/regulator/dashboard`.
- `CENTRAL_BANK_DIRECTOR`
- `BANKING_SUPERVISION_HEAD`
- `IFRS_SUPERVISOR`
- `ISLAMIC_BANKING_DIRECTOR`
- `SYARIAH_COMPLIANCE_AUDITOR`
- `MARKET_RISK_SUPERVISOR`
- `regulator`
- `BANKING_SUPERVISION`
- `REGULATOR`

### Banking (IAF) Roles
Used to redirect users to `/banking/dashboard`.
- `BANK_CRO`
- `BANK_IFRS_MANAGER`
- `BANK_RISK_ANALYST`
- `BANK_PORTFOLIO_MANAGER`
- `BANK_DATA_ADMIN`
- `BANK_USER`
- `IAF_TENANT_SUPERADMIN`
- `IAF_TENANT_ADMIN`
- `SYARIAH_BANK_CRO`
- `CRO`
- `IFRS_MANAGER`

## Files Containing Hardcoded Checks

### [proxy.ts](file:///Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf/packages/frontend/src/proxy.ts)
- `PROTECTED_ROUTE_PATTERNS`: Maps path prefixes (`/platform`, `/consultant`, `/regulator`) to allowed roles.
- `STAKEHOLDER_REDIRECTS`: Maps stakeholder types to default landing pages.

### [AuthProvider.tsx](file:///Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf/packages/frontend/src/providers/AuthProvider.tsx)
- `getRoleBasedRedirectUrl`: Contains complex `if/else` logic using `.includes()` and exact matches for all stakeholder types.
- `detectBankingModeFromUser`: Checks roles for `syariah`, `islamic`, and `dps` to switch themes.

### [layout.tsx](file:///Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf/packages/frontend/src/app/banking/layout.tsx)
- `useEffect`: Contains special overrides for `admin@iaf.co.id` and `superadmin@iaf.co.id` to force `IAF_TENANT_SUPERADMIN` if their role is `BANK_USER`.
- Normalizes "IAF Tenant Super Administrator" to `IAF_TENANT_SUPERADMIN`.

### [page.tsx (maintenance/menus)](file:///Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf/packages/frontend/src/app/banking/maintenance/menus/page.tsx)
- Hardcoded roles allowed to view/edit specific menu configurations.
