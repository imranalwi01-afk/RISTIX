# Laporan Detail Query & Tabel Business Setup

## Menu: Business Configuration

**URL:** `http://localhost:4231/banking/setup/business?mode=conventional`

Berikut adalah rincian teknis query untuk komponen konfigurasi bisnis.

---

### 1. Component: Branch Organization

- **Nama Sub Menu:** Business Setup (Branch List)
- **Link Sub Menu:** `/banking/setup/business`
- **Database:** `Platform Admin` / `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `branches`
- **Deskripsi:** Mengambil daftar kantor cabang untuk dropdown dan validasi data upload.
- **Query:**
  ```sql
  SELECT
      id,
      branch_code,
      branch_name,
      branch_type, -- KCU, KCP, UNIT
      region_code,
      address,
      status
  FROM core.branches
  WHERE status = 'ACTIVE'
  ORDER BY branch_code;
  ```

---

### 2. Component: Currency Settings

- **Nama Sub Menu:** Business Setup (Currencies)
- **Link Sub Menu:** `/banking/setup/business`
- **Database:** `Platform Admin` / `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `currencies`
- **Deskripsi:** Daftar mata uang yang diizinkan untuk transaksi dan pelaporan.
- **Query:**
  ```sql
  SELECT
      code,
      name,
      symbol,
      decimal_places,
      is_local, -- Flag untuk mata uang dasar (IDR)
      exchange_rate_tolerance
  FROM core.currencies
  WHERE is_active = true
  ORDER BY is_local DESC, code ASC;
  ```

---

### 3. Component: Operational Calendar

- **Nama Sub Menu:** Business Setup (Holidays)
- **Link Sub Menu:** `/banking/setup/business`
- **Database:** `Platform Admin` / `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `holidays`
- **Deskripsi:** Daftar hari libur nasional dan cuti bersama untuk perhitungan hari kerja.
- **Query:**
  ```sql
  SELECT
      id,
      holiday_date,
      description,
      is_national_holiday,
      is_recurring
  FROM core.holidays
  WHERE holiday_date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year')
  ORDER BY holiday_date;
  ```

---

### 4. Component: Cost Center Structure

- **Nama Sub Menu:** Business Setup (Cost Centers)
- **Link Sub Menu:** `/banking/setup/business`
- **Database:** `Platform Admin` / `FRS9PRO`
- **Skema:** `core`
- **Nama Tabel:** `cost_centers`
- **Deskripsi:** Unit kerja pembebanan biaya.
- **Query:**
  ```sql
  SELECT
      code,
      name,
      category, -- HEAD_OFFICE, REGIONAL, BRANCH
      profit_center_link
  FROM core.cost_centers
  WHERE is_active = true
  ORDER BY code;
  ```

```

Analisis ini melengkapi dokumentasi untuk modul **System Setup**, khususnya bagian **Business Configuration** yang menggunakan schema `core` sebagai fondasi data master.

<!--
[PROMPT_SUGGESTION]buatkan script SQL untuk mengisi data dummy tabel core.branches dan core.currencies[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]bagaimana cara membuat validasi agar kode cabang tidak bisa dihapus jika masih ada akun aktif di cabang tersebut?[/PROMPT_SUGGESTION]
-->
```
