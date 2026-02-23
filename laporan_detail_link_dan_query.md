# LAPORAN DETAIL LINK, TABEL, DAN QUERY APLIKASI IFRS 9

Laporan ini memetakan setiap Sub Menu di aplikasi ke URL, Skema Database, Tabel Utama, dan Query yang digunakan untuk mengambil data.

---

## 1. MODULE: INDIVIDUAL IMPAIRMENT

_Status: Query Validasi (High Accuracy) berdasarkan `individual_assessment_analysis.md`_

### 1.1. Individual Watchlist

- **Nama Sub Menu:** Individual Watchlist
- **Link:** `/banking/individual/watchlist`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_master_account`
- **Query:**
  ```sql
  SELECT
      ma.account_id, ma.account_number, ma.cif_number, ma.customer_name,
      ma.account_status, ma.impaired_flag, ma.dpd_days, ma.rating_code
  FROM ifrs9.frs9_master_account ma
  WHERE ma.prc_date = CURRENT_DATE
    AND ma.banking_type = 'conventional'
  ORDER BY ma.account_number;
  ```

### 1.2. Assessment Report

- **Nama Sub Menu:** List of Individual Report
- **Link:** `/banking/individual/assessment`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_imp_ia_header`
- **Query:**
  ```sql
  SELECT
      h.ia_id, h.prc_date, h.account_id, h.impaired_flag,
      h.method, h.status, h.createdby, h.createddate
  FROM ifrs9.frs9_imp_ia_header h
  WHERE h.prc_date <= CURRENT_DATE
  ORDER BY h.prc_date DESC, h.account_id;
  ```

### 1.3. Scenario Analysis

- **Nama Sub Menu:** Scenario Details
- **Link:** `/banking/individual/scenario`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_imp_ia_header`, `frs9_imp_ia_rr`
- **Query:**
  ```sql
  SELECT
      h.ia_id, h.account_id, rr.period_start, rr.period_end,
      rr.scenario_type, rr.ecl_amount, rr.pd_rate, rr.lgd_rate
  FROM ifrs9.frs9_imp_ia_header h
  JOIN ifrs9.frs9_imp_ia_rr rr ON h.ia_id = rr.ia_id
  WHERE h.account_id = :account_id
  ORDER BY rr.period_start DESC;
  ```

### 1.4. DCF Analysis

- **Nama Sub Menu:** Discounted Cash Flow
- **Link:** `/banking/individual/dcf`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_imp_ia_dcf`
- **Query:**
  ```sql
  SELECT
      d.pkid, d.ia_id, d.account_id, d.periode,
      d.cash_flow_amount, d.discount_rate, d.present_value
  FROM ifrs9.frs9_imp_ia_dcf d
  WHERE d.account_id = :account_id
  ORDER BY d.periode;
  ```

---

## 2. MODULE: COLLECTIVE IMPAIRMENT

_Status: Query Pattern (Standard CRUD) berdasarkan struktur tabel_

### 2.1. PD Setup

- **Nama Sub Menu:** PD Setup (Probability of Default)
- **Link:** `/banking/collective/pd-setup`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_imp_ca_pd_config`
- **Query:**
  ```sql
  SELECT
      config_id, model_name, segment_id,
      period_start, period_end, status, created_date
  FROM ifrs9.frs9_imp_ca_pd_config
  WHERE is_active = true
  ORDER BY created_date DESC;
  ```

### 2.2. LGD Setup

- **Nama Sub Menu:** LGD Setup (Loss Given Default)
- **Link:** `/banking/collective/lgd-setup`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_imp_ca_lgd_config`
- **Query:**
  ```sql
  SELECT
      config_id, lgd_model_type, recovery_rate_method,
      segment_criteria, status
  FROM ifrs9.frs9_imp_ca_lgd_config
  ORDER BY config_id;
  ```

### 2.3. EAD Setup

- **Nama Sub Menu:** EAD Setup (Exposure At Default)
- **Link:** `/banking/collective/ead-setup`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_imp_ca_ead_config`
- **Query:**
  ```sql
  SELECT
      config_id, ccf_method, amortization_type,
      prepayment_rate, status
  FROM ifrs9.frs9_imp_ca_ead_config
  WHERE is_active = true;
  ```

### 2.4. Collective Summary

- **Nama Sub Menu:** Collective ECL Summary
- **Link:** `/banking/collective/summary`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_imp_ca_ecl_sum`
- **Query:**
  ```sql
  SELECT
      report_date, segment_name, stage,
      SUM(ecl_amount) as total_ecl,
      SUM(outstanding_amount) as total_exposure
  FROM ifrs9.frs9_imp_ca_ecl_sum
  GROUP BY report_date, segment_name, stage
  ORDER BY report_date DESC;
  ```

---

## 3. MODULE: SYSTEM SETUP & ADMIN

_Status: Query Pattern (Platform Admin)_

### 3.1. User Management

- **Nama Sub Menu:** User Management
- **Link:** `/admin/users`
- **Skema:** `core`
- **Tabel:** `users`
- **Query:**
  ```sql
  SELECT
      u.id, u.username, u.email, u.full_name,
      u.is_active, r.name as role_name
  FROM core.users u
  LEFT JOIN core.user_roles ur ON u.id = ur.user_id
  LEFT JOIN core.roles r ON ur.role_id = r.id
  WHERE u.tenant_id = :tenant_id
  ORDER BY u.username;
  ```

### 3.2. Menu Configuration

- **Nama Sub Menu:** Menu Management
- **Link:** `/menu`
- **Skema:** `menu`
- **Tabel:** `menu_items`
- **Query:**
  ```sql
  SELECT
      id, title, url, icon, parent_id, sort_order
  FROM menu.menu_items
  WHERE is_active = true
  ORDER BY sort_order;
  ```

### 3.3. System Monitoring

- **Nama Sub Menu:** System Metrics
- **Link:** `/admin/monitoring/performance`
- **Skema:** `platform_admin`
- **Tabel:** `system_metrics`
- **Query:**
  ```sql
  SELECT
      metric_name, metric_value, timestamp, host_id
  FROM platform_admin.system_metrics
  WHERE timestamp >= NOW() - INTERVAL '1 hour'
  ORDER BY timestamp DESC;
  ```

---

## 4. MODULE: DASHBOARD

_Status: Query Pattern (Analytics)_

### 4.1. Main Dashboard

- **Nama Sub Menu:** Dashboard Overview
- **Link:** `/banking/dashboard`
- **Skema:** `ifrs9` / `menu`
- **Tabel:** `frs9_master_account`, `menu_analytics`
- **Query:**

  ```sql
  -- Total Exposure Query
  SELECT SUM(outstanding_balance)
  FROM ifrs9.frs9_master_account
  WHERE prc_date = CURRENT_DATE;

  -- User Activity Query
  SELECT menu_key, count(*) as visit_count
  FROM menu.menu_analytics
  WHERE visit_date = CURRENT_DATE
  GROUP BY menu_key;
  ```

---

## 5. MODULE: PARAMETER MANAGEMENT

_Status: Query Pattern (Business Settings)_

### 5.1. Product Parameter

- **Nama Sub Menu:** Product Parameters
- **Link:** `/banking/parameters/product`
- **Skema:** `core`
- **Tabel:** `banking_products`
- **Query:**
  ```sql
  SELECT
      product_code, product_name, product_type,
      currency, interest_rate_type
  FROM core.banking_products
  WHERE is_active = true
  ORDER BY product_code;
  ```

### 5.2. Segmentation Rules

- **Nama Sub Menu:** Segmentation Configuration
- **Link:** `/banking/collective/segmentation`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_imp_ca_segment_query`
- **Query:**
  ```sql
  SELECT
      segment_id, segment_name, sql_query_logic,
      priority, description
  FROM ifrs9.frs9_imp_ca_segment_query
  ORDER BY priority ASC;
  ```

---

## 6. MODULE: REPORTING

_Status: Query Pattern (Reporting)_

### 6.1. Regulatory Reports

- **Nama Sub Menu:** Regulatory Reports
- **Link:** `/reports/regulatory`
- **Skema:** `ifrs9`
- **Tabel:** `frs9_report_templates`, `frs9_ecl_result`
- **Query:**
  ```sql
  SELECT
      t.template_name, r.report_period,
      r.generated_date, r.download_url
  FROM ifrs9.frs9_ecl_result r
  JOIN ifrs9.frs9_report_templates t ON r.template_id = t.id
  WHERE r.status = 'COMPLETED'
  ORDER BY r.generated_date DESC;
  ```
