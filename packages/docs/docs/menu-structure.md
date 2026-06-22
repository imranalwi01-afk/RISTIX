# Struktur Menu

## Banking Menu

Semua menu banking di-load dari database (Platform DB → `menu.menu_categories` + `menu.menu_items`). Role-based filtering via `core.menu_permissions`.

### Dashboard
| Menu | Path | Permission Required |
|------|------|-------------------|
| Overview | `/banking/dashboard` | `banking.dashboard.view` |

### System Setup
| Menu | Path | Permission Required |
|------|------|-------------------|
| Application Configuration | `/banking/setup/application` | `banking.setup.application.access` |
| Business Configuration | `/banking/setup/business` | `banking.setup.business.access` |

### Parameter Management
| Menu | Path | Permission Required |
|------|------|-------------------|
| Product Parameters | `/banking/parameters/product` | `banking.parameter.product.access` |
| Accounting Parameters | `/banking/parameters/journal` | `banking.parameter.journal.access` |

### Collective Impairment
| Menu | Path | Permission Required |
|------|------|-------------------|
| Segmentation Config | `/banking/collective/segmentation` | `banking.parameter.segmentation.access` |
| Rule Base Setting | `/banking/collective/rule-base` | `banking.collective.rule_base.access` |
| Bucket Parameter | `/banking/collective/bucket` | `banking.collective.bucket.access` |
| PD Setup | `/banking/collective/pd-setup` | `banking.collective.pd.access` |
| FL Scalar | `/banking/collective/fl-scalar` | `banking.collective.fl_scalar.access` |
| LGD Setup | `/banking/collective/lgd-setup` | `banking.collective.lgd.access` |
| EAD Setup | `/banking/collective/ead-setup` | `banking.collective.ead.access` |
| ECL Configuration | `/banking/collective/ecl-config` | `banking.collective.ecl.access` |

### Individual Impairment
| Menu | Path | Permission Required |
|------|------|-------------------|
| Assessment Workspace | `/banking/individual/assessment` | `banking.individual.access` |
| Individual Provision | `/banking/individual/provision` | `banking.individual.access` |
| DCF Upload Report | `/banking/individual/review/dcf-upload-report` | `banking.individual.access` |

### IFRS 9 Processing
| Menu | Path | Permission Required |
|------|------|-------------------|
| Impairment Module | `/banking/ifrs9/impairment-module` | `banking.processing.impairment.access` |
| Amortization Module | `/banking/ifrs9/amortization-module` | `banking.processing.amortization.access` |
| ECL Calculations | `/banking/ifrs9/calculations` | `banking.processing.access` |
| IFRS 9 Staging | `/banking/ifrs9/staging` | `banking.processing.access` |
| Model Management | `/banking/ifrs9/models` | `banking.processing.access` |
| Forecast | `/banking/ifrs9/scenarios` | `banking.processing.access` |
| Data Upload | `/banking/data/upload` | `banking.tools.upload.view` |
| Data Validation | `/banking/data/validation` | `banking.processing.access` |

### IFRS 9 Reports
| Menu | Path | Permission Required |
|------|------|-------------------|
| ECL Movement | `/banking/ifrs9-reports/ecl-movement` | `banking.reports.ifrs9.access` |
| GCA Movement | `/banking/ifrs9-reports/gca-movement` | `banking.reports.ifrs9.access` |
| Lifetime PD | `/banking/ifrs9-reports/lifetime-pd` | `banking.reports.ifrs9.lifetime_pd.access` |
| Lifetime LGD | `/banking/ifrs9-reports/lifetime-lgd` | `banking.reports.ifrs9.lifetime_lgd.access` |
| EAD Model | `/banking/ifrs9-reports/ead-model` | `banking.reports.ifrs9.ead_model.access` |
| ECL Result | `/banking/ifrs9-reports/ecl-result` | `banking.reports.ifrs9.ecl_result.access` |
| Nominative Report | `/banking/ifrs9-reports/nominative` | `banking.reports.ifrs9.nominative.access` |

### Advanced Analytics
| Menu | Path | Permission Required |
|------|------|-------------------|
| R Analytics | `/banking/analytics/r-analytics` | `banking.analytics.r.view` |
| Financial Reports | `/banking/analytics/reports` | `banking.analytics.view` |
| Executive Dashboard | `/banking/analytics/dashboard` | `banking.analytics.view` |
| Advanced Export | `/banking/analytics/export` | `banking.analytics.view` |
| Access Matrix | `/banking/analytics/access-matrix` | `banking.analytics.view` |

### Workflow Management
| Menu | Path | Permission Required |
|------|------|-------------------|
| Approval System | `/banking/workflow/approval` | `admin.maintenance.access` |
| Notifications | `/banking/notifications` | `notifications.view` |

### Tools
| Menu | Path | Permission Required |
|------|------|-------------------|
| Manual Upload | `/banking/tools/upload` | `banking.tools.upload.view` |
| Data Export | `/banking/tools/export` | `banking.tools.export.view` |
| ETL Tools | `/banking/tools/etl` | `banking.tools.etl.view` |

### Admin & Maintenance
| Menu | Path | Permission Required |
|------|------|-------------------|
| Access Management | `/banking/maintenance/access-management` | `admin.maintenance.access` |
| Approval | `/banking/maintenance/approval` | `admin.maintenance.access` |
| Job Monitoring | `/banking/maintenance/job-monitoring` | `jobs.access` |
| Audit Log | `/banking/maintenance/audit` | `admin.maintenance.access` |
| User Activity | `/banking/maintenance/user-activity` | `admin.maintenance.access` |
| SMTP | `/banking/maintenance/smtp` | `admin.system.manage` |
| Users | `/banking/maintenance/users` | `admin.users.view` |

## Platform Admin Menu

| Menu | Path | Permission |
|------|------|-----------|
| Users | `/platform/users` | Platform admin |
| Tenants | `/platform/tenants` | Platform admin |
| Tenant Users | `/platform/tenant-users` | Platform admin |
| RBAC | `/platform/rbac` | Platform admin |
| Menus | `/platform/menus` | Platform admin |
| SMTP Settings | `/platform/settings/smtp` | Platform admin |

## Struktur Sidebar

Sidebar banking di-generate dari database (`menu.menu_items` + `menu.menu_categories`) dan difilter berdasarkan role user via `core.menu_permissions`.

Default fallback: jika tidak ada `menu_permissions` untuk suatu item, item tersebut **visible by default**.
