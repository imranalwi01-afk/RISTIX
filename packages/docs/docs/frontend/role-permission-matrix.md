---
title: Role Permission Matrix
description: Baseline role-permission matrix for IAF tenant roles with implementation guidance.
sidebar_position: 4
---

# Role Permission Matrix

## 1. Purpose
Define expected permission coverage per role so:
- role design is consistent
- onboarding is faster
- access reviews and audits are repeatable

## 2. Role Set (Current Seed Baseline)
- IAF Tenant Super Administrator
- IAF Tenant Administrator
- IAF Chief Risk Officer
- IAF IFRS 9 Manager
- IAF Portfolio Manager
- IAF Risk Analyst
- IAF Data Administrator
- IAF Report Analyst
- IAF Internal Auditor
- IAF Viewer

## 3. Matrix Legend
- `F` = full access (`*.manage` + CRUD + approve where relevant)
- `M` = manage (module CRUD, no global admin)
- `V` = view only
- `A` = approval authority
- `-` = no access by default

## 4. Domain Matrix (Draft Baseline)

| Role | Admin System | User Mgmt | Role Mgmt | Approvals | Setup (App/Business) | Parameters | Collective Models | Individual Impairment | IFRS9 Processing | IFRS9 Reports | Jobs |
|---|---|---|---|---|---|---|---|---|---|---|---|
| IAF Tenant Super Administrator | F | F | F | A | F | F | F | F | F | F | F |
| IAF Tenant Administrator | M | M | M | A | M | M | M | M | M | M | M |
| IAF Chief Risk Officer | V | - | - | A | V | V | M | M | M | F | V |
| IAF IFRS 9 Manager | - | - | - | A | M | M | F | M | F | F | M |
| IAF Portfolio Manager | - | - | - | - | V | M | M | V | M | M | V |
| IAF Risk Analyst | - | - | - | - | V | V | M | M | M | M | V |
| IAF Data Administrator | - | - | - | - | M | F | M | M | M | V | M |
| IAF Report Analyst | - | - | - | - | V | V | V | V | V | F | V |
| IAF Internal Auditor | V | V | V | V | V | V | V | V | V | F | V |
| IAF Viewer | - | - | - | - | V | V | V | V | V | V | - |

## 5. Canonical Permission Families
Use these as matrix keys:
- `admin.system.*`
- `admin.users.*`
- `admin.roles.*`
- `approval.requests.approve` / `approval.all`
- `banking.setup.application.*`
- `banking.setup.business.*`
- `banking.parameter.product.*`
- `banking.parameter.journal.*`
- `banking.parameter.segmentation.*`
- `banking.collective.rule_base.*`
- `banking.collective.bucket.*`
- `banking.collective.pd.*`
- `banking.collective.lgd.*`
- `banking.collective.ead.*`
- `banking.collective.ecl.*`
- `banking.collective.fl_scalar.*`
- `banking.individual.*`
- `banking.processing.*`
- `banking.reports.ifrs9.*`
- `banking.analytics.r.*`
- `jobs.view|create|run|control|approve`

## 6. Implementation Guidance
- Keep a single source-of-truth matrix (prefer DB table or versioned YAML/JSON).
- Generate:
  - role seeding grants
  - docs table
  - QA access test cases
- Review matrix with Compliance and Risk before production rollout.

## 7. Next Step (Recommended)
Implement matrix as code artifact (JSON/YAML) and auto-generate docs + seed scripts from it to avoid drift.

