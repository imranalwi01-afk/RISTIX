# Laporan Detail Query & Tabel Analytics Dashboard

## Menu: Strategic Portfolio Dashboard

**URL:** `http://localhost:4231/banking/analytics/dashboard?mode=conventional`

Berikut adalah rincian teknis query untuk dashboard analitik portofolio.

---

### 1. Component: Portfolio KPIs (Headline)

- **Nama Sub Menu:** Risk Summary
- **Link Sub Menu:** `/banking/analytics/dashboard`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Metrik utama kesehatan portofolio saat ini.
- **Query:**
  ```sql
  SELECT
      COUNT(account_number) as total_accounts,
      SUM(outstanding_balance) as total_exposure,
      SUM(ecl_amount) as total_impairment,
      -- NPL Ratio (Stage 3 / Total)
      (SUM(CASE WHEN stage = '3' THEN outstanding_balance ELSE 0 END) / NULLIF(SUM(outstanding_balance), 0)) * 100 as npl_ratio,
      -- Cost of Credit (ECL / Exposure)
      (SUM(ecl_amount) / NULLIF(SUM(outstanding_balance), 0)) * 100 as coc_ratio
  FROM public.frs9_master_account
  WHERE prc_date = CURRENT_DATE
    AND banking_type = 'conventional';
  ```

---

### 2. Component: Asset Quality Trend (Chart)

- **Nama Sub Menu:** NPL Trend
- **Link Sub Menu:** `/banking/analytics/dashboard/trend`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_ecl_ts`
- **Deskripsi:** Tren historis eksposur per stage selama 12 bulan terakhir.
- **Query:**
  ```sql
  SELECT
      TO_CHAR(report_date, 'Mon-YY') as period_label,
      report_date,
      stage,
      SUM(outstanding_amount) as exposure,
      SUM(ecl_amount) as impairment
  FROM public.frs9_imp_ca_ecl_ts
  WHERE report_date >= (CURRENT_DATE - INTERVAL '12 months')
    AND banking_type = 'conventional'
  GROUP BY report_date, stage
  ORDER BY report_date ASC, stage ASC;
  ```

---

### 3. Component: Concentration by Sector

- **Nama Sub Menu:** Sector Analysis
- **Link Sub Menu:** `/banking/analytics/dashboard/sector`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Top 5 sektor ekonomi dengan eksposur terbesar.
- **Query:**
  ```sql
  SELECT
      economic_sector as sector_name,
      SUM(outstanding_balance) as total_exposure,
      (SUM(outstanding_balance) * 100.0 / (SELECT SUM(outstanding_balance) FROM public.frs9_master_account WHERE prc_date = CURRENT_DATE)) as percentage
  FROM public.frs9_master_account
  WHERE prc_date = CURRENT_DATE
    AND banking_type = 'conventional'
  GROUP BY economic_sector
  ORDER BY total_exposure DESC
  LIMIT 5;
  ```

---

### 4. Component: PD vs LGD Distribution (Scatter Plot)

- **Nama Sub Menu:** Risk Distribution
- **Link Sub Menu:** `/banking/analytics/dashboard/risk-map`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Memetakan segmen berdasarkan rata-rata PD dan LGD (Risk Map).
- **Query:**
  ```sql
  SELECT
      segment_code,
      AVG(pd_rate) * 100 as avg_pd,
      AVG(lgd_rate) * 100 as avg_lgd,
      SUM(outstanding_balance) as bubble_size
  FROM public.frs9_master_account
  WHERE prc_date = CURRENT_DATE
    AND banking_type = 'conventional'
  GROUP BY segment_code;
  ```
