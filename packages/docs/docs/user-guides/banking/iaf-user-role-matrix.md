---
title: IAF User Role Matrix
description: Operasional user accounts, role ownership, and approval responsibilities for the IAF tenant.
---

# IAF User Role Matrix

This document records the current operational users for the IAF tenant after the RBAC and approval cleanup on March 12, 2026.

## Initial Password

All provisioned IAF users currently use the same initial password:

`1019181716`

This is an operational bootstrap password. Change it after first controlled login if these accounts will be used outside local/internal testing.

## Demo Accounts

All accounts below are demo accounts for the IAF tenant.

| Email | Username | Password | Role |
| --- | --- | --- | --- |
| `maker@iaf.co.id` | `maker_iaf` | `1019181716` | `MAKER` |
| `checker@iaf.co.id` | `checker_iaf` | `1019181716` | `CHECKER` |
| `approver@iaf.co.id` | `approver_iaf` | `1019181716` | `APPROVER` |
| `admin@iaf.co.id` | `admin_iaf` | `1019181716` | `IAF_TENANT_ADMIN` |
| `superadmin@iaf.co.id` | `superadmin_iaf` | `1019181716` | `IAF_TENANT_SUPERADMIN` |
| `data.admin@iaf.co.id` | `data_admin_iaf` | `1019181716` | `IAF_DATA_ADMIN` |
| `risk.analyst@iaf.co.id` | `risk_analyst_iaf` | `1019181716` | `IAF_RISK_ANALYST` |
| `ifrs.manager@iaf.co.id` | `ifrs_manager_iaf` | `1019181716` | `IAF_IFRS_MANAGER` |
| `cro@iaf.co.id` | `cro_iaf` | `1019181716` | `IAF_BANK_CRO` |
| `portfolio.manager@iaf.co.id` | `portfolio_manager_iaf` | `1019181716` | `IAF_PORTFOLIO_MANAGER` |
| `report.analyst@iaf.co.id` | `report_analyst_iaf` | `1019181716` | `IAF_REPORT_ANALYST` |
| `auditor@iaf.co.id` | `auditor_iaf` | `1019181716` | `IAF_AUDITOR` |
| `viewer@iaf.co.id` | `viewer_iaf` | `1019181716` | `IAF_VIEWER` |

## Active IAF Users

| Email | Username | Role | Purpose |
| --- | --- | --- | --- |
| `maker@iaf.co.id` | `maker_iaf` | `MAKER` | Submit changes that require approval |
| `checker@iaf.co.id` | `checker_iaf` | `CHECKER` | First approval layer for business changes |
| `approver@iaf.co.id` | `approver_iaf` | `APPROVER` | Final approval layer for business changes |
| `admin@iaf.co.id` | `admin_iaf` | `IAF_TENANT_ADMIN` | Tenant administration and admin approval layer 1 |
| `superadmin@iaf.co.id` | `superadmin_iaf` | `IAF_TENANT_SUPERADMIN` | Tenant super administration and admin approval layer 2 |
| `data.admin@iaf.co.id` | `data_admin_iaf` | `IAF_DATA_ADMIN` | Setup and master data maintenance |
| `risk.analyst@iaf.co.id` | `risk_analyst_iaf` | `IAF_RISK_ANALYST` | Collective impairment setup and analysis |
| `ifrs.manager@iaf.co.id` | `ifrs_manager_iaf` | `IAF_IFRS_MANAGER` | IFRS 9 management review and checker-level business approval |
| `cro@iaf.co.id` | `cro_iaf` | `IAF_BANK_CRO` | Final business approver for material IFRS 9 changes |
| `portfolio.manager@iaf.co.id` | `portfolio_manager_iaf` | `IAF_PORTFOLIO_MANAGER` | Portfolio review and individual impairment oversight |
| `report.analyst@iaf.co.id` | `report_analyst_iaf` | `IAF_REPORT_ANALYST` | Reporting and export access |
| `auditor@iaf.co.id` | `auditor_iaf` | `IAF_AUDITOR` | Read-only audit and review access |
| `viewer@iaf.co.id` | `viewer_iaf` | `IAF_VIEWER` | Read-only business access |

## Approval Routing

### Business Changes

These include setup and banking configuration entities such as:

- business settings
- app settings
- product and journal parameters
- segmentation
- rule base
- bucket parameter
- PD setup
- LGD setup
- EAD setup
- ECL configuration
- FL scalar

Routing:

| Level | Allowed Roles |
| --- | --- |
| Level 1 | `CHECKER`, `IAF_IFRS_MANAGER` |
| Level 2 | `APPROVER`, `IAF_BANK_CRO` |

### Admin Changes

These include:

- user create, update, delete
- user status changes
- role create, update, delete
- role permission updates
- role assignment changes

Routing:

| Level | Allowed Roles |
| --- | --- |
| Level 1 | `IAF_TENANT_ADMIN` |
| Level 2 | `IAF_TENANT_SUPERADMIN` |

## Role Separation Rules

| Role | What it means | What it is not |
| --- | --- | --- |
| `APPROVER` | Final approver for business workflow | Not a superadmin |
| `IAF_TENANT_SUPERADMIN` | Technical or tenant override authority | Not the normal business approver |
| `CHECKER` | First review gate for business approval | Not tenant admin |
| `IAF_TENANT_ADMIN` | First review gate for user and RBAC admin changes | Not business approver level 2 |

## Legacy Demo Account

`demo@frspro.co.id` is intentionally left in the database for legacy/demo use, but it has been demoted to:

- `IAF_VIEWER`

It no longer holds:

- `APPROVER`
- `IAF_TENANT_ADMIN`
- `IAF_TENANT_SUPERADMIN`

## Recommended Usage

Use these accounts for testing:

| Scenario | Recommended User |
| --- | --- |
| Submit a change | `maker@iaf.co.id` or `data.admin@iaf.co.id` |
| Checker review | `checker@iaf.co.id` or `ifrs.manager@iaf.co.id` |
| Final business approval | `approver@iaf.co.id` or `cro@iaf.co.id` |
| User or role administration | `admin@iaf.co.id` |
| Final admin approval | `superadmin@iaf.co.id` |
| Audit verification | `auditor@iaf.co.id` |
| Report-only validation | `report.analyst@iaf.co.id` or `viewer@iaf.co.id` |
