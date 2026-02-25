# LAPORAN LENGKAP SUB MENU APLIKASI IFRS 9 INDONESIA AIRAWATA FINANCE

## Beserta Link URL dan Tabel Database yang Terkait

---

## OVERVIEW APLIKASI

**Aplikasi:** IFRS 9 Indonesia Airawata Finance (IAF)  
**Versi:** Multi-Tenant Platform v1.0  
**Database Utama:**

- `ifrspro_platform_admin` (Administrasi Platform)
- `ifrspro_tenant_iaf` (Data Spesifik Tenant)

---

## DAFTAR LENGKAP SUB MENU APLIKASI

### 1. DASHBOARD (IFRS 9 System Overview)

**URL:** `/banking/dashboard`  
**Route:** GET `/banking/dashboard`  
**Controller:** `dashboard.controller.ts`

**Tabel Database yang Terkait:**

- `menu.menu_analytics` - Tracking penggunaan menu
- `menu.menu_user_preferences` - Preferensi user dashboard
- `platform_admin.system_metrics` - Metrik sistem (CPU, memory, disk usage)
- `core.user_activity_logs` - Log aktivitas user
- `ifrs9.frs9_master_account` - Data master akun untuk overview
- `menu.menu_items` - Konfigurasi menu dashboard
- `menu.menu_categories` - Kategori menu
- `platform_admin.configuration` - Konfigurasi dashboard

---

### 2. SYSTEM SETUP (Core System Configuration)

**URL:** `/banking/setup/application`  
**Route:** GET/POST `/application`  
**Controller:** `application-parameter.controller.ts`

**Tabel Database yang Terkait:**

- `platform_admin.configuration` - Parameter sistem
- `platform_admin.tenants` - Konfigurasi tenant
- `core.users` - Manajemen user sistem
- `core.roles` - Role dan permission
- `core.user_roles` - Mapping user-role
- `platform_admin.menu_configurations` - Konfigurasi menu sistem
- `platform_admin.audit_logs` - Log perubahan konfigurasi

---

### 3. BUSINESS SETTINGS

**URL:** `/banking/setup/business`  
**Route:** GET/POST `/banking/business-settings`  
**Controller:** `business-settings.controller.ts`

**Tabel Database yang Terkait:**

- `core.banking_products` - Produk perbankan
- `reference_data.banking_products` - Data referensi produk
- `business_settings.parameters` - Parameter bisnis B0012-B0016
- `business_settings.cascading_dropdowns` - Konfigurasi cascading dropdowns

---

### 4. PARAMETER MANAGEMENT (Banking Parameters & Configuration)

#### 4.1 Product Parameters

**URL:** `/banking/parameters/product`  
**Route:** GET/POST `/banking/parameters/product`  
**Controller:** `product-parameter.controller.ts`

**Tabel Database yang Terkait:**

- `core.banking_products` - Produk perbankan
- `reference_data.banking_products` - Data referensi produk
- `product_parameters.configurations` - Konfigurasi parameter produk

#### 4.2 Journal Parameters

**URL:** `/banking/parameters/journal`  
**Route:** GET/POST `/banking/parameters/journal`  
**Controller:** `journal-parameter.controller.ts`

**Tabel Database yang Terkait:**

- `journal_parameters.configurations` - Konfigurasi jurnal
- `journal_parameters.accounts` - Akun jurnal
- `journal_parameters.mappings` - Mapping jurnal

---

### 5. SEGMENTATION CONFIGURATION

**URL:** `/banking/collective/segmentation`  
**Route:** GET/POST `/banking/segmentation` atau `/segmentation`  
**Controller:** `segmentation.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_imp_ca_segment_query` - Query segmentasi
- `segmentation.rules` - Aturan segmentasi
- `segmentation.approval_history` - History approval segmentasi
- `segmentation.business_parameters` - Parameter bisnis untuk segmentasi

---

### 6. COLLECTIVE IMPAIRMENT (Portfolio Assessment)

#### 6.1 PD Setup (Probability of Default)

**URL:** `/banking/collective/pd-setup`  
**Route:** GET/POST `/banking/pd-setup` atau `/banking/collective/pd-setup`  
**Controller:** `pd-setup.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_imp_ca_pd_config` - Konfigurasi PD
- `ifrs9.frs9_imp_ca_pd_enr` - PD enrollment
- `pd_setup.parameters` - Parameter PD setup
- `pd_setup.models` - Model PD

#### 6.2 LGD Setup (Loss Given Default)

**URL:** `/banking/collective/lgd-setup`  
**Route:** GET/POST `/banking/collective/lgd-setup`  
**Controller:** `lgd-setup.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_imp_ca_lgd_config` - Konfigurasi LGD
- `ifrs9.frs9_imp_ca_lgd` - LGD calculation
- `lgd_setup.parameters` - Parameter LGD setup
- `lgd_setup.models` - Model LGD

#### 6.3 EAD Setup (Exposure At Default)

**URL:** `/banking/collective/ead-setup`  
**Route:** GET/POST `/banking/collective/ead-setup`  
**Controller:** `ead-setup.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_imp_ca_ead_config` - Konfigurasi EAD
- `ifrs9.frs9_imp_ca_ead` - EAD calculation
- `ead_setup.parameters` - Parameter EAD setup
- `ead_setup.models` - Model EAD

#### 6.4 FL Scalar (Forward Looking Scalar)

**URL:** `/banking/collective/fl-scalar`  
**Route:** GET/POST `/banking/collective/fl-scalar`  
**Controller:** `fl-scalar.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_imp_ca_fl_scalarh` - Forward Lookup scalar header
- `ifrs9.frs9_imp_ca_fl_scalard` - Forward Lookup scalar detail
- `fl_scalar.adjustments` - Adjustments FL scalar
- `fl_scalar.scenarios` - Skenario FL scalar

#### 6.5 Bucket Parameter

**URL:** `/banking/collective/bucket`  
**Route:** GET/POST `/banking/bucket-parameter` atau `/banking/collective/bucket`  
**Controller:** `bucket-parameter.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_imp_ca_bucket_parameter` - Parameter bucket
- `bucket_parameters.configurations` - Konfigurasi bucket
- `bucket_parameters.ranges` - Range bucket

#### 6.6 Rule Base Setting

**URL:** `/banking/collective/rule-base`  
**Route:** GET/POST `/banking/rule-base-setting` atau `/banking/collective/rule-base`  
**Controller:** `rule-base-setting.controller.ts`

**Tabel Database yang Terkait:**

- `rule_base.settings` - Pengaturan rule base
- `rule_base.conditions` - Kondisi rule base
- `rule_base.actions` - Aksi rule base

#### 6.7 ECL Configuration

**URL:** `/banking/collective/ecl-config`  
**Route:** GET/POST `/banking/collective/ecl-config`  
**Controller:** `ecl-configuration.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_imp_ca_ecl_configd` - Konfigurasi ECL detail
- `ecl_configurations.parameters` - Parameter ECL
- `ecl_configurations.models` - Model ECL

#### 6.8 Collective Parameter

**URL:** `/banking/collective-parameter`  
**Route:** GET/POST `/banking/collective-parameter`  
**Controller:** `collective-parameter.controller.ts`

**Tabel Database yang Terkait:**

- `collective_parameters.configurations` - Konfigurasi kolektif
- `collective_parameters.settings` - Pengaturan kolektif

#### 6.9 Collective Summary Data

**Tabel Database Utama Collective Impairment:**

- `ifrs9.frs9_imp_ca_ecl_sum` - Summary ECL kolektif
- `ifrs9.frs9_imp_ca_ecl_detail` - Detail ECL kolektif
- `ifrs9.frs9_imp_ca_ecl_ts` - Time series ECL
- `ifrs9.frs9_imp_ca_account_event` - Event akun kolektif
- `ifrs9.frs9_default` - Default rules

---

### 7. INDIVIDUAL IMPAIRMENT (Account Assessment)

**URL:** `/banking/individual/impairment`  
**Route:** GET/POST `/banking/individual/impairment` atau `/ifrs9/individual-impairment`  
**Controller:** `individual-impairment.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_master_account` - Data master akun
- `ifrs9.frs9_account_id` - Identifikasi akun
- `ifrs9.frs9_imp_ca_account_event` - Event impairment individual
- `ifrs9.frs9_event_changes` - Perubahan event
- `individual.individual_reports` - Report impairment individual
- `ifrs9.frs9_imp_ca_account_event_prv` - Previous event
- `ifrs9.frs9_master_transaction_cost` - Cost transaksi

---

### 8. IFRS 9 PROCESSING MODULES

**URL:** `/ifrs9` atau `/banking/ifrs9`  
**Route:** GET/POST `/ifrs9` atau `/banking/ifrs9`  
**Controller:** `ifrs9.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_amort_journal_data` - Data jurnal amortisasi
- `ifrs9.frs9_eir_ecf` - EIR/ECF calculation
- `ifrs9.frs9_ecl_model_mapping` - Mapping model ECL
- `ifrs9.frs9_impairment_module` - Modul impairment
- `ifrs9.frs9_amortization_module` - Modul amortisasi
- `ifrs9.stg_frs9_master_account_bpf` - Staging data
- `ifrs9.tmp_frs9_master_account_prev` - Temporary processing

---

### 9. IFRS 9 REPORTS (Comprehensive IFRS 9 Reporting Suite)

**URL:** `/ifrs9/reports`  
**Route:** GET/POST `/ifrs9/reports`  
**Controller:** `ifrs9-reports.controller.ts`

**Tabel Database yang Terkait:**

- `ifrs9.frs9_imp_ca_ecl_sum` - Summary ECL reports
- `ifrs9.frs9_imp_movement_data` - Movement data
- `ifrs9.frs9_statistic` - Data statistik
- `individual.individual_reports` - Report individual
- `ifrs9.frs9_report_templates` - Template report
- `ifrs9.frs9_lifetime_pd` - Lifetime PD reports
- `ifrs9.frs9_lifetime_lgd` - Lifetime LGD reports
- `ifrs9.frs9_ead_model` - EAD model reports
- `ifrs9.frs9_ecl_result` - ECL result reports

---

### 10. ADVANCED ANALYTICS (R Analytics & BI)

#### 10.1 R Analytics Dashboard

**URL:** `/banking/analytics/r-analytics`  
**Route:** GET/POST `/r-analytics`  
**Controller:** `r-analytics.controller.ts`

**Tabel Database yang Terkait:**

- `analytics.r_models` - Model R analytics
- `analytics.model_executions` - Eksekusi model
- `r_analytics.economic_scenarios` - Skenario ekonomi
- `r_analytics.statistical_models` - Model statistik
- `analytics.credit_risk_analytics` - Analytics resiko kredit
- `analytics.model_executions` - History eksekusi model
- `analytics.predictive_models` - Model prediktif
- `analytics.performance_metrics` - Metrik performa

#### 10.2 Analytics Dashboard

**URL:** `/banking/analytics/dashboard`  
**Route:** GET `/banking/analytics/dashboard`

#### 10.3 Analytics Reports

**URL:** `/banking/analytics/reports`  
**Route:** GET `/banking/analytics/reports`

#### 10.4 Analytics Export

**URL:** `/banking/analytics/export`  
**Route:** GET `/banking/analytics/export`

---

### 11. WORKFLOW MANAGEMENT (Business Process & Approval)

**URL:** `/workflow`  
**Route:** GET/POST `/workflow`  
**Controller:** `workflow.controller.ts`

**Tabel Database yang Terkait:**

- `workflow.workflows` - Definisi workflow (Tenant)
- `workflow.workflow_instances` - Instance workflow (Tenant)
- `workflow.workflow_steps` - Step workflow (Tenant)
- `workflow.approval_requests` - Request approval (Tenant)
- `workflow.workflow_transitions` - History approval (Tenant)
- `core.user_activity_logs` - Log aktivitas workflow
- `core.user_sessions` - Session user
- `platform_admin.audit_logs` - Audit trail (System Level only)

---

### 12. TOOLS (Utilities)

#### 12.1 ETL Designer

**URL:** `/etl` atau `/etl/workflow`  
**Route:** GET/POST `/etl` atau `/etl/workflow`  
**Controller:** `etl.controller.ts`, `workflow.controller.ts`

**Tabel Database yang Terkait:**

- `etl_designer.etl_workflows` - Workflow ETL
- `etl_designer.quality_reports` - Report kualitas data
- `ifrs9.stg_frs9_master_account_bpf` - Staging upload
- `ifrs9.frs9_upload_logs` - Log upload data
- `platform_admin.configuration` - Konfigurasi tools

---

### 13. ADMIN & MAINTENANCE (System Administration)

#### 13.1 Platform Admin

**URL:** `/admin`  
**Route:** GET/POST `/platform/admin`  
**Controller:** `platform-admin.controller.ts`

**Tabel Database yang Terkait:**

- `platform_admin.platform_users` - User platform
- `platform_admin.roles` - Role management
- `platform_admin.tenants` - Tenant management
- `platform_admin.audit_logs` - Audit logs
- `platform_admin.configuration` - System configuration

#### 13.2 User Management

**URL:** `/admin/users`  
**Route:** GET/POST `/users`  
**Controller:** `user.controller.ts`

#### 13.3 Role Management

**URL:** `/admin/roles`  
**Route:** GET/POST `/roles`  
**Controller:** `role-management.controller.ts`

#### 13.4 Audit & Security

**URL:** `/admin/audit`  
**Route:** GET `/audit`  
**Controller:** `audit.controller.ts`

**Tabel Database Monitoring:**

- `platform_admin.system_metrics` - Metrik sistem
- `menu.system_health_checks` - Health check
- `menu.performance_metrics` - Performance monitoring
- `menu.load_balancer_status` - Status load balancer
- `menu.api_gateway_logs` - API logs

---

### 14. AUTHENTICATION & USER MANAGEMENT

#### 14.1 Login

**URL:** `/login`  
**Route:** POST `/auth`  
**Controller:** `auth.controller.ts`

**Tabel Database yang Terkait:**

- `core.users` - Data user
- `core.user_sessions` - Sesi user
- `core.user_roles` - Role user
- `audit.login_attempts` - Percobaan login

#### 14.2 User Registration

**URL:** `/register`  
**Route:** POST `/register`  
**Controller:** `user-registration.controller.ts`

---

### 15. MENU MANAGEMENT

**URL:** `/menu`  
**Route:** GET/POST `/menu`  
**Controller:** `menu.controller.ts`

**Tabel Database yang Terkait:**

- `menu.menu_items` - Item menu
- `menu.menu_categories` - Kategori menu
- `menu.menu_configurations` - Konfigurasi menu
- `menu.menu_user_preferences` - Preferensi user
- `menu.menu_analytics` - Analytics menu

---

## RINGKASAN TOTAL SUB MENU

| No        | Kategori Sub Menu     | Jumlah Sub Menu | Database Utama             |
| --------- | --------------------- | --------------- | -------------------------- |
| 1         | Dashboard             | 1               | platform_admin, tenant_iaf |
| 2         | System Setup          | 2               | platform_admin             |
| 3         | Business Settings     | 1               | tenant_iaf                 |
| 4         | Parameter Management  | 2               | tenant_iaf                 |
| 5         | Segmentation          | 1               | tenant_iaf                 |
| 6         | Collective Impairment | 9               | tenant_iaf                 |
| 7         | Individual Impairment | 1               | tenant_iaf                 |
| 8         | IFRS 9 Processing     | 1               | tenant_iaf                 |
| 9         | IFRS 9 Reports        | 1               | tenant_iaf                 |
| 10        | Advanced Analytics    | 4               | platform_admin, tenant_iaf |
| 11        | Workflow Management   | 1               | tenant_iaf                 |
| 12        | Tools (ETL)           | 2               | keduanya                   |
| 13        | Admin & Maintenance   | 4               | platform_admin             |
| 14        | Authentication        | 2               | platform_admin             |
| 15        | Menu Management       | 1               | platform_admin             |
| **TOTAL** | **32 Sub Menu**       | **32**          | **2 Database**             |

---

## DISTRIBUSI TABEL PER DATABASE

### Database `ifrspro_platform_admin`

- **Total Tabel:** ~45 tabel
- **Fungsi:** Administrasi sistem, user management, monitoring, platform configuration

### Database `ifrspro_tenant_iaf`

- **Total Tabel:** ~85 tabel
- **Fungsi:** Data IFRS 9 spesifik tenant, banking operations, impairment calculations

### Database Keduanya (Shared)

- **Total Tabel:** ~10 tabel
- **Fungsi:** Shared data antara platform dan tenant

**GRAND TOTAL: ~140+ tabel unik** across 2 database utama

---

## KESIMPULAN

Aplikasi IFRS 9 Indonesia Airawata Finance memiliki **32 sub menu** yang terorganisir dalam 15 kategori utama, dengan integrasi ke **140+ tabel database** yang tersebar across 2 database utama (`ifrspro_platform_admin` dan `ifrspro_tenant_iaf`). Setiap sub menu memiliki koneksi spesifik ke tabel-tabel yang relevan sesuai fungsionalitasnya, dengan arsitektur multi-tenant yang memisahkan data platform dan data tenant secara efektif.

**URL Base API:** `/api/v1`  
**URL Base Frontend:** `/banking` (untuk banking modules) dan `/admin` (untuk admin modules)  
**Authentication:** JWT-based dengan role-based access control (RBAC)  
**Multi-tenancy:** Terpisah antara platform admin dan tenant-specific data

---

_Laporan ini dibuat berdasarkan analisis kodebase per tanggal 14 Februari 2026_
