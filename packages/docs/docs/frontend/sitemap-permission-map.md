---
title: Sitemap and Permission Map
description: Frontend sitemap grouped by domain with mapped backend permission families.
sidebar_position: 3
---

# Sitemap and Permission Map

## 1. Purpose
This page documents:
- frontend page groups (sitemap by module)
- backend permission family required for API access

This is the reference for UI routing, authorization review, and QA access testing.

## 2. Permission Mapping Rule
Backend route middleware resolves required permission candidates as:
- `<base>.view|create|update|delete`
- `<base>.manage`
- `<base>.access`
- `<base>`

Examples:
- `banking.parameter.product.view`
- `banking.parameter.product.manage`
- `admin.roles.manage`

## 3. Page Group to Permission Family

| Frontend Area | Example Pages | Primary API Prefix | Permission Family |
|---|---|---|---|
| Auth | `/login`, `/platform/login` | `/api/v1/auth/*` | session/token based (no module permission) |
| Dashboard | `/banking/dashboard` | `/api/v1/banking/dashboard` | `banking.dashboard.*` |
| Setup - Application | `/banking/setup/application` | `/api/v1/banking/setup/application` | `banking.setup.application.*` |
| Setup - Business | `/banking/setup/business` | `/api/v1/banking/setup/business` | `banking.setup.business.*` |
| Parameters - Product | `/banking/parameters/product` | `/api/v1/banking/parameters/product` | `banking.parameter.product.*` |
| Parameters - Journal | `/banking/parameters/journal` | `/api/v1/banking/parameters/journal` | `banking.parameter.journal.*` |
| Parameters - Segmentation | `/banking/parameters/product/segment`, `/banking/collective/segmentation` | `/api/v1/banking/parameters/segmentation`, `/api/v1/banking/parameters/*segments` | `banking.parameter.segmentation.*` |
| Collective - Rule Base | `/banking/collective/rule-base` | `/api/v1/banking/collective/rule-base` | `banking.collective.rule_base.*` |
| Collective - Bucket | `/banking/collective/bucket` | `/api/v1/banking/collective/bucket` | `banking.collective.bucket.*` |
| Collective - PD | `/banking/collective/pd-setup` | `/api/v1/banking/collective/pd-configurations` | `banking.collective.pd.*` |
| Collective - LGD | `/banking/collective/lgd-setup` | `/api/v1/banking/collective/lgd-configurations` | `banking.collective.lgd.*` |
| Collective - EAD | `/banking/collective/ead-setup` | `/api/v1/banking/collective/ead-configurations` | `banking.collective.ead.*` |
| Collective - ECL | `/banking/collective/ecl-config` | `/api/v1/banking/collective/ecl-config` | `banking.collective.ecl.*` |
| Collective - FL Scalar | `/banking/collective/fl-scalar` | `/api/v1/banking/collective/fl-scalar` | `banking.collective.fl_scalar.*` |
| Individual Impairment | `/banking/individual/*` | `/api/v1/banking/individual/*` | `banking.individual.*` |
| IFRS9 Processing | `/banking/ifrs9/*` | `/api/v1/banking/ifrs9/*`, `/api/v1/ifrs9/*` | `banking.processing.*` |
| IFRS9 Reports | `/banking/reports/*`, `/banking/ifrs9-reports/*` | `/api/v1/ifrs9/reports/*`, `/api/v1/reports/*` | `banking.reports.ifrs9.*` |
| R Analytics | `/banking/analytics/r-analytics` | `/api/v1/r-analytics/*` | `banking.analytics.r.*` |
| Maintenance - Users | `/banking/maintenance/users` | `/api/v1/users/*` | `admin.users.*` |
| Maintenance - Roles | `/banking/maintenance/roles` | `/api/v1/roles/*`, `/api/v1/rbac/*` | `admin.roles.*` |
| Maintenance - Approval | `/banking/maintenance/approval` | `/api/v1/approvals/*` | `approval.requests.approve` / `approval.all` |
| Maintenance - Audit | `/banking/maintenance/audit` | `/api/v1/audit/*` | `admin.system.*` |
| Maintenance - User Activity | `/banking/maintenance/user-activity` | `/api/v1/user-activity/*` | `admin.system.*` |
| Job Monitoring | `/banking/maintenance/job-monitoring` | `/api/v1/jobs/*` | jobs-specific action permissions (`jobs.view`, `jobs.run`, `jobs.approve`, etc.) |
| Platform - Tenants | `/platform/tenants` | `/api/v1/tenants/*` | `admin.system.*` |
| Platform - Users | `/platform/users`, `/platform/tenant-users` | `/api/v1/platform-users/*`, `/api/v1/users/*` | `admin.system.*` + `admin.users.*` |
| Platform - RBAC | `/platform/rbac` | `/api/v1/rbac/*`, `/api/v1/roles/*` | `admin.roles.*` |

## 4. Notes
- Some pages consume multiple APIs; table shows primary permission family.
- Frontend display gating can use `Can` component, but backend authorization is the final enforcement.
- For `jobs`, permission policy is action-specific in route handlers and should be documented per endpoint.

