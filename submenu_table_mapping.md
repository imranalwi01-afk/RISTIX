# Daftar Lengkap Sub-Menu dan Koneksi ke Tabel Database
## Aplikasi IFRS 9 Indonesia Airawata Finance

---

## DAFTAR LENGKAP SUB-MENU

### 1. DASHBOARD (IFRS 9 System Overview)
**Tabel yang Terhubung:**
- `menu.menu_analytics`
- `menu.menu_user_preferences`
- `platform_admin.system_metrics`
- `core.user_activity_logs`
- `ifrs9.frs9_master_account`
- `menu.menu_items`
- `menu.menu_categories`
- `platform_admin.configuration`

---

### 2. SYSTEM SETUP (Core System Configuration)
**Tabel yang Terhubung:**
- `platform_admin.configuration`
- `platform_admin.tenants`
- `core.users`
- `core.roles`
- `core.user_roles`
- `platform_admin.menu_configurations`
- `platform_admin.audit_logs`

---

### 3. PARAMETER MANAGEMENT (Banking Parameters & Configuration)
**Tabel yang Terhubung:**
- `core.banking_products`
- `reference_data.banking_products`
- `ifrs9.frs9_imp_ca_pd_config`
- `ifrs9.frs9_imp_ca_lgd_config`
- `ifrs9.frs9_imp_ca_ead_config`
- `ifrs9.frs9_imp_ca_ecl_configd`
- `ifrs9.frs9_imp_ca_fl_scalarh`
- `ifrs9.frs9_imp_ca_fl_scalard`
- `ifrs9.frs9_imp_ca_bucket_parameter`
- `ifrs9.frs9_imp_ca_segment_query`

---

### 4. COLLECTIVE IMPAIRMENT (Portfolio Assessment)
**Tabel yang Terhubung:**
- `ifrs9.frs9_imp_ca_ecl_sum`
- `ifrs9.frs9_imp_ca_ecl_detail`
- `ifrs9.frs9_imp_ca_ecl_ts`
- `ifrs9.frs9_imp_ca_pd_enr`
- `ifrs9.frs9_imp_ca_lgd`
- `ifrs9.frs9_imp_ca_ead`
- `ifrs9.frs9_imp_ca_account_event`
- `ifrs9.frs9_imp_ca_segment_query`
- `ifrs9.frs9_default`

---

### 5. INDIVIDUAL IMPAIRMENT (Account Assessment)
**Tabel yang Terhubung:**
- `ifrs9.frs9_master_account`
- `ifrs9.frs9_account_id`
- `ifrs9.frs9_imp_ca_account_event`
- `ifrs9.frs9_event_changes`
- `individual.individual_reports`
- `ifrs9.frs9_imp_ca_account_event_prv`
- `ifrs9.frs9_master_transaction_cost`

---

### 6. IFRS 9 (Processing Modules)
**Tabel yang Terhubung:**
- `ifrs9.frs9_amort_journal_data`
- `ifrs9.frs9_eir_ecf`
- `ifrs9.frs9_ecl_model_mapping`
- `ifrs9.frs9_impairment_module`
- `ifrs9.frs9_amortization_module`
- `ifrs9.stg_frs9_master_account_bpf`
- `ifrs9.tmp_frs9_master_account_prev`

---

### 7. IFRS 9 REPORTS (Comprehensive IFRS 9 Reporting Suite)
**Tabel yang Terhubung:**
- `ifrs9.frs9_imp_ca_ecl_sum`
- `ifrs9.frs9_imp_movement_data`
- `ifrs9.frs9_statistic`
- `individual.individual_reports`
- `ifrs9.frs9_report_templates`
- `ifrs9.frs9_lifetime_pd`
- `ifrs9.frs9_lifetime_lgd`
- `ifrs9.frs9_ead_model`
- `ifrs9.frs9_ecl_result`

---

### 8. ADVANCED ANALYTICS (R Analytics & BI)
**Tabel yang Terhubung:**
- `analytics.r_models`
- `analytics.model_executions`
- `r_analytics.economic_scenarios`
- `r_analytics.statistical_models`
- `analytics.credit_risk_analytics`
- `analytics.model_executions`
- `analytics.predictive_models`
- `analytics.performance_metrics`

---

### 9. WORKFLOW MANAGEMENT (Business Process & Approval)
**Tabel yang Terhubung:**
- `workflow.workflows`
- `workflow.workflow_instances`
- `workflow.workflow_steps`
- `workflow.approval_requests`
- `workflow.approval_history`
- `audit.user_activity_logs`
- `core.user_sessions`
- `platform_admin.audit_logs`

---

### 10. TOOLS (Utilities)
**Tabel yang Terhubung:**
- `etl_designer.etl_workflows`
- `etl_designer.quality_reports`
- `ifrs9.stg_frs9_master_account_bpf`
- `ifrs9.frs9_upload_logs`
- `platform_admin.configuration`
- `platform_admin.system_metrics`
- `audit.user_activity_logs`

---

### 11. ADMIN & MAINTENANCE (System Administration)
**Tabel yang Terhubung:**
- `platform_admin.platform_users`
- `platform_admin.roles`
- `platform_admin.tenants`
- `platform_admin.audit_logs`
- `platform_admin.configuration`
- `platform_admin.system_metrics`
- `menu.system_health_checks`
- `menu.performance_metrics`
- `menu.load_balancer_status`
- `menu.api_gateway_logs`

---

## RINGKASAN TOTAL TABEL PER SUB-MENU

| No | Sub-Menu | Jumlah Tabel | Database Utama |
|----|----------|--------------|---------------|
| 1 | Dashboard | 8 | platform_admin, tenant_iaf |
| 2 | System Setup | 7 | platform_admin |
| 3 | Parameter Management | 10 | tenant_iaf |
| 4 | Collective Impairment | 9 | tenant_iaf |
| 5 | Individual Impairment | 7 | tenant_iaf |
| 6 | IFRS 9 | 7 | tenant_iaf |
| 7 | IFRS 9 Reports | 9 | tenant_iaf |
| 8 | Advanced Analytics | 8 | platform_admin, tenant_iaf |
| 9 | Workflow Management | 8 | platform_admin |
| 10 | Tools | 7 | keduanya |
| 11 | Admin & Maintenance | 10 | platform_admin |
| **TOTAL** | **11 Sub-Menu** | **90+ Tabel** | **2 Database** |

---

## DISTRIBUSI TABEL PER DATABASE

### Database `ifrspro_platform_admin`
- Dashboard: 3 tabel
- System Setup: 7 tabel
- Advanced Analytics: 5 tabel
- Workflow Management: 6 tabel
- Tools: 3 tabel
- Admin & Maintenance: 10 tabel
**Total: 34 tabel**

### Database `ifrspro_tenant_iaf`
- Dashboard: 2 tabel
- Parameter Management: 10 tabel
- Collective Impairment: 9 tabel
- Individual Impairment: 5 tabel
- IFRS 9: 7 tabel
- IFRS 9 Reports: 9 tabel
- Advanced Analytics: 3 tabel
- Tools: 2 tabel
**Total: 47 tabel**

### Database Keduanya (Shared)
- Tools: 2 tabel
- Advanced Analytics: 2 tabel
**Total: 4 tabel**

**GRAND TOTAL: 85+ tabel unik** across 2 database utama
