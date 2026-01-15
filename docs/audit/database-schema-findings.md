# 🗄️ Database Schema Findings & Legacy Analysis

## 📌 Overview
This document details the critical schema overlaps and "legacy weirdness" discovered between the **Platform Admin** database and **Tenant** databases. These discrepancies were causing authentication failures and required specific workarounds to support both legacy and new backend logic.

## 🚨 Critical Schema Overlaps

### 1. Tenants Table Duplication
There are **two** source-of-truth tables for tenants, living in different schemas on the same database instance.

| Feature | Reference A (Legacy Code) | Reference B (Actual Data) |
| :--- | :--- | :--- |
| **Table Name** | `platform_admin.tenants` | `core.tenants` |
| **Schema** | `platform_admin` | `core` |
| **Columns** | `tenant_slug`, `tenant_name` | `slug`, `name` |
| **Usage** | Used by old backend controllers & legacy services | Used by `individual` schema & new backend logic |
| **Status** | **MISSING/EMPTY** in some envs | **Populated** with actual tenant data |

**Resolution:**
We created a **Database View** `platform_admin.tenants` that points to `core.tenants`. This allows legacy code to query "platform_admin" while actually reading from the authoritative "core" table.

---

### 2. User Table Fragmentation
User data is split across multiple tables and databases depending on the user's role (System-level vs. Bank-level).

#### A. Platform Users (System Admins, Regulators)
*   **Database:** `ifrspro_platform_admin`
*   **Table:** `platform_admin.users` (created manually to match code expectations)
*   **Also exists as:** `platform_admin.platform_users` (on remote)
*   **Mismatch:** Legacy code expects `users`, but remote schema evolved to `platform_users`.
*   **Current State:** We created `platform_admin.users` locally and imported data to satisfy the legacy authentication flow.

#### B. Tenant Users (Bank Employees)
*   **Database:** `ifrspro_tenant_<slug>` (e.g., `ifrspro_tenant_iaf`)
*   **Table:** `core.users`
*   **Context:** These users exist **only** inside their specific tenant database.
*   **Authentication:** The backend must first resolve the tenant (via slug), connect to that specific tenant DB, and *then* query `core.users`.

---

## 🗺️ Foreign Key Complexity
The remote database (10.8.0.2) reveals a complex web of dependencies where foreign keys reference *different* versions of the truth:

*   `platform_monitoring.*` tables reference ➡️ `platform_admin.tenants`
*   `individual.*` (IFRS9) tables reference ➡️ `core.tenants`

This confirms that **both schemas are actively used** in production, requiring our local environment to support this "dual-schema" reality via views and aliases.

## 🛠️ Summary of Local Fixes
To make the local environment work with this legacy structure:
1.  **View Created:** `platform_admin.tenants` mapped to `core.tenants`.
2.  **Table Created:** `platform_admin.users` created and populated.
3.  **Data Synced:** `core.users` (IAF Tenant) populated from remote.
4.  **Config Fixed:** Docker network hostnames hardcoded to bypass environment variable conflicts.
