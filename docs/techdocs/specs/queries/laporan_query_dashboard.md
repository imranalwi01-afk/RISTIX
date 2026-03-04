# Laporan Detail Query & Tabel Dashboard

## Menu: Dashboard Overview

**URL:** `http://localhost:4231/banking/dashboard?mode=conventional`

Berikut adalah rincian teknis untuk setiap widget/komponen yang tampil pada halaman Dashboard.

---

### 1. Widget: Total Exposure (Portfolio Overview)

- **Nama Sub Menu:** Dashboard (Widget: Total Exposure)
- **Link Sub Menu:** `/banking/dashboard`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Menampilkan total _outstanding balance_ dari seluruh akun aktif hari ini sesuai filter mode (Conventional/Syariah).
- **Query:**
  ```sql
  SELECT SUM(outstanding_balance) as total_exposure
  FROM public.frs9_master_account
  WHERE prc_date = CURRENT_DATE
    AND banking_type = 'conventional'; -- Filter dinamis dari URL
  ```

---

### 2. Widget: Collective ECL Summary (Risk Profile)

- **Nama Sub Menu:** Dashboard (Widget: ECL Summary)
- **Link Sub Menu:** `/banking/dashboard`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_ecl_sum`
- **Deskripsi:** Ringkasan nilai ECL dan Exposure dikelompokkan berdasarkan Segment dan Stage (1, 2, 3).
- **Query:**
  ```sql
  SELECT
      segment_name,
      stage,
      SUM(ecl_amount) as total_ecl,
      SUM(outstanding_amount) as total_exposure
  FROM public.frs9_imp_ca_ecl_sum
  WHERE report_date = (SELECT MAX(report_date) FROM public.frs9_imp_ca_ecl_sum)
  GROUP BY segment_name, stage
  ORDER BY segment_name, stage;
  ```

---

### 3. Widget: Top Watchlist (High Risk Accounts)

- **Nama Sub Menu:** Dashboard (Widget: Top Watchlist)
- **Link Sub Menu:** `/banking/dashboard`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_master_account`
- **Deskripsi:** Menampilkan daftar akun dengan risiko tinggi (Impaired atau High DPD) secara ringkas (Top 10).
- **Query:**
  ```sql
  SELECT
      account_number,
      customer_name,
      dpd_days,
      rating_code,
      outstanding_balance
  FROM public.frs9_master_account
  WHERE prc_date = CURRENT_DATE
    AND banking_type = 'conventional'
    AND (impaired_flag = true OR dpd_days > 30)
  ORDER BY outstanding_balance DESC
  LIMIT 10;
  ```

---

### 4. Widget: System Usage (User Activity)

- **Nama Sub Menu:** Dashboard (Widget: User Activity)
- **Link Sub Menu:** `/banking/dashboard`
- **Database:** `Platform Admin`
- **Skema:** `menu`
- **Nama Tabel:** `menu_analytics`
- **Deskripsi:** Statistik menu yang paling sering diakses oleh user pada hari ini.
- **Query:**
  ```sql
  SELECT menu_key, count(*) as visit_count
  FROM menu.menu_analytics
  WHERE visit_date = CURRENT_DATE
  GROUP BY menu_key
  ORDER BY visit_count DESC;
  ```

---

### 5. Widget: Quick Actions (Shortcuts)

- **Nama Sub Menu:** Dashboard (Widget: Quick Actions)
- **Link Sub Menu:** `/banking/dashboard`
- **Database:** `Platform Admin`
- **Skema:** `menu`
- **Nama Tabel:** `menu_items`
- **Deskripsi:** Tombol navigasi cepat ke menu operasional prioritas (misal: Create Assessment, Upload Data).
- **Query:**
  ```sql
  SELECT title, url, icon, description
  FROM menu.menu_items
  WHERE is_active = true
    AND is_quick_action = true -- Flag khusus untuk item quick action
  ORDER BY sort_order;
  ```
