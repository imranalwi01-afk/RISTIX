# Laporan Analisis Koneksi Sub-Menu ke Database dan Tabel
## Aplikasi IFRS 9 Indonesia Airawata Finance

Berdasarkan analisis kodebase dan struktur database, berikut adalah laporan lengkap koneksi setiap sub-menu ke database dan tabel yang terkait:

---

## 1. DASHBOARD (IFRS 9 System Overview)
### **Database:** `ifrspro_platform_admin` & `ifrspro_tenant_iaf`
### **Tabel Utama:**
- `menu.menu_analytics` - Tracking penggunaan menu
- `menu.menu_user_preferences` - Preferensi user dashboard
- `platform_admin.system_metrics` - Metrik sistem (CPU, memory, disk usage)
- `core.user_activity_logs` - Log aktivitas user
- `ifrs9.frs9_master_account` - Data master akun untuk overview

### **Tabel Pendukung:**
- `menu.menu_items` - Konfigurasi menu dashboard
- `menu.menu_categories` - Kategori menu
- `platform_admin.configuration` - Konfigurasi dashboard

---

## 2. SYSTEM SETUP (Core System Configuration)
### **Database:** `ifrspro_platform_admin`
### **Tabel Utama:**
- `platform_admin.configuration` - Parameter sistem
- `platform_admin.tenants` - Konfigurasi tenant
- `core.users` - Manajemen user sistem
- `core.roles` - Role dan permission
- `core.user_roles` - Mapping user-role

### **Tabel Pendukung:**
- `platform_admin.menu_configurations` - Konfigurasi menu sistem
- `platform_admin.audit_logs` - Log perubahan konfigurasi

---

## 3. PARAMETER MANAGEMENT (Banking Parameters & Configuration)
### **Database:** `ifrspro_tenant_iaf`
### **Tabel Utama:**
- `core.banking_products` - Produk perbankan
- `reference_data.banking_products` - Data referensi produk
- `ifrs9.frs9_imp_ca_pd_config` - Konfigurasi PD
- `ifrs9.frs9_imp_ca_lgd_config` - Konfigurasi LGD
- `ifrs9.frs9_imp_ca_ead_config` - Konfigurasi EAD
- `ifrs9.frs9_imp_ca_ecl_configd` - Konfigurasi ECL detail

### **Tabel Parameter Spesifik:**
- `ifrs9.frs9_imp_ca_fl_scalarh` - Forward Lookup scalar header
- `ifrs9.frs9_imp_ca_fl_scalard` - Forward Lookup scalar detail
- `ifrs9.frs9_imp_ca_bucket_parameter` - Parameter bucket
- `ifrs9.frs9_imp_ca_segment_query` - Query segmentasi

---

## 4. COLLECTIVE IMPAIRMENT (Portfolio Assessment)
### **Database:** `ifrspro_tenant_iaf`
### **Tabel Utama:**
- `ifrs9.frs9_imp_ca_ecl_sum` - Summary ECL kolektif
- `ifrs9.frs9_imp_ca_ecl_detail` - Detail ECL kolektif
- `ifrs9.frs9_imp_ca_ecl_ts` - Time series ECL
- `ifrs9.frs9_imp_ca_pd_enr` - PD enrollment
- `ifrs9.frs9_imp_ca_lgd` - LGD calculation
- `ifrs9.frs9_imp_ca_ead` - EAD calculation

### **Tabel Pendukung:**
- `ifrs9.frs9_imp_ca_account_event` - Event akun kolektif
- `ifrs9.frs9_imp_ca_segment_query` - Query segmentasi
- `ifrs9.frs9_default` - Default rules

---

## 5. INDIVIDUAL IMPAIRMENT (Account Assessment)
### **Database:** `ifrspro_tenant_iaf`
### **Tabel Utama:**
- `ifrs9.frs9_master_account` - Data master akun
- `ifrs9.frs9_account_id` - Identifikasi akun
- `ifrs9.frs9_imp_ca_account_event` - Event impairment individual
- `ifrs9.frs9_event_changes` - Perubahan event
- `individual.individual_reports` - Report impairment individual

### **Tabel Pendukung:**
- `ifrs9.frs9_imp_ca_account_event_prv` - Previous event
- `ifrs9.frs9_master_transaction_cost` - Cost transaksi

---

## 6. IFRS 9 (Processing Modules)
### **Database:** `ifrspro_tenant_iaf`
### **Tabel Utama:**
- `ifrs9.frs9_amort_journal_data` - Data jurnal amortisasi
- `ifrs9.frs9_eir_ecf` - EIR/ECF calculation
- `ifrs9.frs9_ecl_model_mapping` - Mapping model ECL
- `ifrs9.frs9_impairment_module` - Modul impairment
- `ifrs9.frs9_amortization_module` - Modul amortisasi

### **Tabel Processing:**
- `ifrs9.stg_frs9_master_account_bpf` - Staging data
- `ifrs9.tmp_frs9_master_account_prev` - Temporary processing

---

## 7. IFRS 9 REPORTS (Comprehensive IFRS 9 Reporting Suite)
### **Database:** `ifrspro_tenant_iaf`
### **Tabel Utama:**
- `ifrs9.frs9_imp_ca_ecl_sum` - Summary ECL reports
- `ifrs9.frs9_imp_movement_data` - Movement data
- `ifrs9.frs9_statistic` - Data statistik
- `individual.individual_reports` - Report individual
- `ifrs9.frs9_report_templates` - Template report

### **Tabel Reporting:**
- `ifrs9.frs9_lifetime_pd` - Lifetime PD reports
- `ifrs9.frs9_lifetime_lgd` - Lifetime LGD reports
- `ifrs9.frs9_ead_model` - EAD model reports
- `ifrs9.frs9_ecl_result` - ECL result reports

---

## 8. ADVANCED ANALYTICS (R Analytics & BI)
### **Database:** `ifrspro_platform_admin` & `ifrspro_tenant_iaf`
### **Tabel Utama:**
- `analytics.r_models` - Model R analytics
- `analytics.model_executions` - Eksekusi model
- `r_analytics.economic_scenarios` - Skenario ekonomi
- `r_analytics.statistical_models` - Model statistik
- `analytics.credit_risk_analytics` - Analytics resiko kredit

### **Tabel Pendukung:**
- `analytics.model_executions` - History eksekusi model
- `analytics.predictive_models` - Model prediktif
- `analytics.performance_metrics` - Metrik performa

---

## 9. WORKFLOW MANAGEMENT (Business Process & Approval)
### **Database:** `ifrspro_platform_admin`
### **Tabel Utama:**
- `workflow.workflows` - Definisi workflow
- `workflow.workflow_instances` - Instance workflow
- `workflow.workflow_steps` - Step workflow
- `workflow.approval_requests` - Request approval
- `workflow.approval_history` - History approval

### **Tabel Pendukung:**
- `audit.user_activity_logs` - Log aktivitas workflow
- `core.user_sessions` - Session user
- `platform_admin.audit_logs` - Audit trail

---

## 10. TOOLS (Utilities)
### **Database:** `ifrspro_platform_admin` & `ifrspro_tenant_iaf`
### **Tabel Utama:**
- `etl_designer.etl_workflows` - Workflow ETL
- `etl_designer.quality_reports` - Report kualitas data
- `ifrs9.stg_frs9_master_account_bpf` - Staging upload
- `ifrs9.frs9_upload_logs` - Log upload data
- `platform_admin.configuration` - Konfigurasi tools

### **Tabel Utilities:**
- `platform_admin.system_metrics` - Monitoring tools
- `audit.user_activity_logs` - Log penggunaan tools

---

## 11. ADMIN & MAINTENANCE (System Administration)
### **Database:** `ifrspro_platform_admin`
### **Tabel Utama:**
- `platform_admin.platform_users` - User platform
- `platform_admin.roles` - Role management
- `platform_admin.tenants` - Tenant management
- `platform_admin.audit_logs` - Audit logs
- `platform_admin.configuration` - System configuration

### **Tabel Monitoring:**
- `platform_admin.system_metrics` - Metrik sistem
- `menu.system_health_checks` - Health check
- `menu.performance_metrics` - Performance monitoring
- `menu.load_balancer_status` - Status load balancer
- `menu.api_gateway_logs` - API logs

---

## KESIMPULAN

### **Database Utama:**
1. **`ifrspro_platform_admin`** - Administrasi sistem, user management, monitoring
2. **`ifrspro_tenant_iaf`** - Data IFRS 9 spesifik tenant, banking operations

### **Schema Utama:**
- **`menu`** - Sistem menu dan navigasi
- **`core`** - Data core (users, roles, banking products)
- **`ifrs9`** - Data IFR 9 dan impairment
- **`platform_admin`** - Administrasi platform
- **`analytics`** - Analytics dan reporting
- **`workflow`** - Manajemen workflow
- **`audit`** - Logging dan audit trail

### **Total Tabel Terkait:** ~150+ tabel across multiple databases

Setiap sub-menu terhubung ke database dan tabel spesifik sesuai fungsionalitasnya, dengan arsitektur multi-tenant yang memisahkan data platform dan data tenant.
