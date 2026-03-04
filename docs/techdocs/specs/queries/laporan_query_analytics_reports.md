# Laporan Detail Query & Tabel Analytics Reports

## Menu: Portfolio Analytics & MIS

**URL:** `http://localhost:4231/banking/analytics/reports?mode=conventional`

Berikut adalah rincian teknis query untuk modul pelaporan analitik.

---

### 1. Component: Report Catalog

- **Nama Sub Menu:** Report Library
- **Link Sub Menu:** `/banking/analytics/reports`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_analytics_catalog`
- **Deskripsi:** Daftar laporan yang tersedia untuk user.
- **Query:**
  ```sql
  SELECT
      id,
      report_code,
      report_name,
      report_category, -- PORTFOLIO, VINTAGE, TRANSITION, PROFITABILITY
      description,
      visualization_config -- JSON config for frontend charts
  FROM public.frs9_analytics_catalog
  WHERE is_active = true
    AND (banking_type = 'conventional' OR banking_type = 'ALL')
  ORDER BY report_category, report_name;
  ```

---

### 2. Component: Dynamic Parameters

- **Nama Sub Menu:** Report Filter
- **Link Sub Menu:** `/banking/analytics/reports/params`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_analytics_report_params`
- **Deskripsi:** Parameter input yang dibutuhkan untuk menjalankan laporan tertentu.
- **Query:**
  ```sql
  SELECT
      param_key,
      param_label,
      input_type, -- DATE, DROPDOWN, TEXT, NUMBER
      lookup_query, -- SQL query to populate dropdown options
      is_mandatory
  FROM public.frs9_analytics_report_params
  WHERE report_id = :report_id
  ORDER BY sort_order;
  ```

---

### 3. Component: Data Execution (Example: Vintage Analysis)

- **Nama Sub Menu:** Report Viewer
- **Link Sub Menu:** `/banking/analytics/reports/view`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account` (Time Series)
- **Deskripsi:** Contoh query untuk analisis Vintage (NPL berdasarkan usia buku).
- **Query:**
  ```sql
  SELECT
      TO_CHAR(booking_date, 'YYYY-MM') as cohort_month,
      FLOOR(months_on_book / 3) * 3 as mob_quarter, -- 3, 6, 9, 12...
      SUM(CASE WHEN dpd_days > 90 THEN outstanding_balance ELSE 0 END) /
      NULLIF(SUM(outstanding_balance), 0) * 100 as npl_ratio
  FROM public.frs9_master_account_history
  WHERE booking_date BETWEEN :start_date AND :end_date
    AND product_code = :product_code
  GROUP BY TO_CHAR(booking_date, 'YYYY-MM'), FLOOR(months_on_book / 3) * 3
  ORDER BY cohort_month, mob_quarter;
  ```

---

### 4. Component: Report History

- **Nama Sub Menu:** Generated Reports
- **Link Sub Menu:** `/banking/analytics/reports/history`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_analytics_history`
- **Deskripsi:** Log laporan yang pernah dijalankan sebelumnya.
- **Query:**
  ```sql
  SELECT
      h.id,
      c.report_name,
      h.execution_date,
      h.executed_by,
      h.parameters_json,
      h.execution_duration_ms
  FROM public.frs9_analytics_history h
  JOIN public.frs9_analytics_catalog c ON h.report_id = c.id
  WHERE h.executed_by = :current_user
  ORDER BY h.execution_date DESC;
  ```
