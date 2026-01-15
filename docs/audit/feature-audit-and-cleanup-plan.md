# 🧹 System Feature Audit & Cleanup Plan

## 🎯 Objective
Identify and remove "bloat" features (SaaS/Platform wrappers, unused engines) to focus the application on its core purpose: **IFRS9 Logic for IAF**.

## 🔴 High-Confidence Removal Candidates (Kill List)
These appear to be unused legacy features or generic SaaS wrappers not needed for a single-tenant or specific banking implementation.

### 1. Database Schemas (Unused / Bloat)
*Deep audit of `packages/backend` (legacy code) confirms:*
- [ ] **`platform_billing`**: 💀 **DEAD CODE**. Only found in migrations/config. Safe to delete.
- [ ] **`platform_integration`**: 💀 **DEAD CODE**. Only found in migrations. Safe to delete.
- [ ] **`etl_designer` & `etl_processing`**: ⚠️ **User Decision**. Code exists in `src/api/controllers/etl` and `src/core/services/etl`. However, if you are not using the drag-and-drop ETL GUI, this is massive bloat (~15 files).
- [ ] **`platform_analytics`**: ⚠️ **Low Usage**. Only referenced in `database-driven-menu.service.ts`. Likely safe to remove if you don't use the "Platform Dashboard".

### 2. Backend Modules (Generic/SaaS Features)
*These have route files but seem irrelevant to the core mission.*
- [ ] **`tenant-registry.routes.ts`**: Automatic tenant discovery/onboarding.
- [ ] **`user-registration.routes.ts`**: Self-service user signup. (Enterprise usually uses Admin-invite only)
- [ ] **`consultants.routes.ts`**: "Consultant Marketplace" features.
- [ ] **`banking-resource.routes.ts`**: Generic resource manager.
- [ ] **`forms.routes.ts`**: Generic form builder engine? (Unless used for surveys/data collection)

---

## 🟡 Needs Verification (Ask User)
*Features that seem generic but might be used by IFRS9 logic.*
- [ ] **`workflow.routes.ts`**: Is there a generic workflow engine driving approvals? Or is `approval.routes.ts` enough?
- [ ] **`platform-infrastructure.routes.ts`**: System health checks? Keep for DevOps or remove?
- [ ] **`r-analytics.routes.ts`**: Interface to R-Server. *Likely KEEP for IFRS9 calculations*, but confirm scope.

---

## 🟢 Core Features (Must Keep)
*Do NOT touch these.*
1.  **IFRS9 Logic**: `impairment`, `amortization`, `bucket-parameters`, `pd`, `lgd`, `ead`, `fl-scalar`
2.  **App Core**: `auth` (Login), `rbac` (Permissions), `users`, `tenants`, `menu`, `audit`
3.  **Job Engine**: `jobs` (Calculation runners)
4.  **Approvals**: `approval` (Critical for banking workflows)

## 📋 Action Plan
1.  **Drop Schemas**: Generate Migration to `DROP SCHEMA CASCADE` for the "Kill List" items.
2.  **Delete Code**: Remove route files, services, and Drizzle schema definitions for removed features.
3.  **Clean Dependencies**: Remove unused packages related to these features.
