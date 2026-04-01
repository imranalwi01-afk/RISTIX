---
title: Banking Sidebar Sitemap
description: User-facing sitemap for the banking module based on the current sidebar navigation.
sidebar_position: 1
---

# Banking Sidebar Sitemap

This sitemap is derived from the current banking sidebar source in `packages/frontend/src/components/banking/BankingSidebarUtils.tsx`.

## Sidebar Tree

- Dashboard
  - `/banking/dashboard`
- System Setup
  - Application Configuration: `/banking/setup/application`
  - Business Configuration: `/banking/setup/business`
- Parameter Management
  - Product Parameters: `/banking/parameters/product`
  - Accounting Parameters: `/banking/parameters/journal`
- Collective Impairment
  - Segmentation Configuration: `/banking/collective/segmentation`
  - Rule Base Setting: `/banking/collective/rule-base`
  - Bucket Parameter: `/banking/collective/bucket`
  - PD Setup Management: `/banking/collective/pd-setup`
  - FL Scalar: `/banking/collective/fl-scalar`
  - LGD Setup Management: `/banking/collective/lgd-setup`
  - EAD Setup Management: `/banking/collective/ead-setup`
  - ECL Configuration: `/banking/collective/ecl-config`
- Individual Impairment
  - Assessment Workspace: `/banking/individual/assessment`
  - (Old) Assessment Workspace: `/banking/individual/assessment-old`
  - (Old - Imran) Assessment Workspace: `/banking/individual/assessment-old-imran`
  - Customer List: `/banking/individual/customer-list`
- IFRS 9
  - ECL Calculations: `/banking/ifrs9/calculations`
  - IFRS9 Staging: `/banking/ifrs9/staging`
  - Model Management: `/banking/ifrs9/models`
  - Forecast: `/banking/ifrs9/scenarios`
- IFRS 9 Reports
  - Nominative Report: `/banking/ifrs9-reports/nominative`
  - Lifetime PD: `/banking/ifrs9-reports/lifetime-pd`
  - Lifetime LGD: `/banking/ifrs9-reports/lifetime-lgd`
  - EAD Model: `/banking/ifrs9-reports/ead-model`
  - ECL Result: `/banking/ifrs9-reports/ecl-result`
  - ECL Movement: `/banking/ifrs9-reports/ecl-movement`
  - GCA Movement: `/banking/ifrs9-reports/gca-movement`
- Advanced Analytics
  - R Analytics: `/banking/analytics/r-analytics`
  - Financial Reports: `/banking/analytics/reports`
  - Executive Dashboard: `/banking/analytics/dashboard`
  - Advanced Export: `/banking/analytics/export`
- Workflow Management
  - Approval System: `/banking/workflow/approval`
  - Notifications: `/banking/notifications`
  - Workflow Configuration: `/banking/workflow/configuration`
  - Process Monitoring: `/banking/workflow/monitoring`
  - Staging Management: `/banking/workflow/staging`
  - Business Process: `/banking/workflow/business`
- Tools
  - Manual Upload: `/banking/tools/upload`
  - Bulk Data Import: `/banking/tools/bulk-import`
  - Data Export: `/banking/tools/export`
  - ETL Tools: `/banking/tools/etl`
  - Direct DB Connection: `/banking/tools/database`
  - Data Scheduler: `/banking/tools/scheduler`
- Admin & Maintenance
  - Access Management: `/banking/maintenance/user-management`
  - Approval: `/banking/maintenance/approval`
  - User Activity: `/banking/maintenance/audit`
  - Job Monitoring: `/banking/maintenance/job-monitoring`
  - Menu Management: `/banking/maintenance/menus`

## Route Availability Check

| Sidebar Item | URL | Page Exists |
|---|---|---|
| Dashboard | `/banking/dashboard` | Yes |
| Application Configuration | `/banking/setup/application` | Yes |
| Business Configuration | `/banking/setup/business` | Yes |
| Product Parameters | `/banking/parameters/product` | Yes |
| Accounting Parameters | `/banking/parameters/journal` | Yes |
| Segmentation Configuration | `/banking/collective/segmentation` | Yes |
| Rule Base Setting | `/banking/collective/rule-base` | Yes |
| Bucket Parameter | `/banking/collective/bucket` | Yes |
| PD Setup Management | `/banking/collective/pd-setup` | Yes |
| FL Scalar | `/banking/collective/fl-scalar` | Yes |
| LGD Setup Management | `/banking/collective/lgd-setup` | Yes |
| EAD Setup Management | `/banking/collective/ead-setup` | Yes |
| ECL Configuration | `/banking/collective/ecl-config` | Yes |
| Assessment Workspace | `/banking/individual/assessment` | Yes |
| (Old) Assessment Workspace | `/banking/individual/assessment-old` | Yes |
| (Old - Imran) Assessment Workspace | `/banking/individual/assessment-old-imran` | Yes |
| Customer List | `/banking/individual/customer-list` | Yes |
| ECL Calculations | `/banking/ifrs9/calculations` | Yes |
| IFRS9 Staging | `/banking/ifrs9/staging` | Yes |
| Model Management | `/banking/ifrs9/models` | Yes |
| Forecast | `/banking/ifrs9/scenarios` | Yes |
| Nominative Report | `/banking/ifrs9-reports/nominative` | Yes |
| Lifetime PD | `/banking/ifrs9-reports/lifetime-pd` | Yes |
| Lifetime LGD | `/banking/ifrs9-reports/lifetime-lgd` | Yes |
| EAD Model | `/banking/ifrs9-reports/ead-model` | Yes |
| ECL Result | `/banking/ifrs9-reports/ecl-result` | Yes |
| ECL Movement | `/banking/ifrs9-reports/ecl-movement` | Yes |
| GCA Movement | `/banking/ifrs9-reports/gca-movement` | Yes |
| R Analytics | `/banking/analytics/r-analytics` | Yes |
| Financial Reports | `/banking/analytics/reports` | Yes |
| Executive Dashboard | `/banking/analytics/dashboard` | Yes |
| Advanced Export | `/banking/analytics/export` | Yes |
| Approval System | `/banking/workflow/approval` | Yes |
| Notifications | `/banking/notifications` | Yes |
| Workflow Configuration | `/banking/workflow/configuration` | No |
| Process Monitoring | `/banking/workflow/monitoring` | Yes |
| Staging Management | `/banking/workflow/staging` | No |
| Business Process | `/banking/workflow/business` | Yes |
| Manual Upload | `/banking/tools/upload` | Yes |
| Bulk Data Import | `/banking/tools/bulk-import` | No |
| Data Export | `/banking/tools/export` | Yes |
| ETL Tools | `/banking/tools/etl` | Yes |
| Direct DB Connection | `/banking/tools/database` | No |
| Data Scheduler | `/banking/tools/scheduler` | No |
| Access Management | `/banking/maintenance/user-management` | Yes |
| Approval | `/banking/maintenance/approval` | Yes |
| User Activity | `/banking/maintenance/audit` | Yes |
| Job Monitoring | `/banking/maintenance/job-monitoring` | Yes |
| Menu Management | `/banking/maintenance/menus` | Yes |

## Notes

- This document is intentionally limited to routes exposed in the current banking sidebar.
- Several additional banking pages exist in the app tree but are not shown in the sidebar, so they are excluded here.
- Sidebar placeholders without a page today are:
  - `/banking/workflow/configuration`
  - `/banking/workflow/staging`
  - `/banking/tools/bulk-import`
  - `/banking/tools/database`
  - `/banking/tools/scheduler`
