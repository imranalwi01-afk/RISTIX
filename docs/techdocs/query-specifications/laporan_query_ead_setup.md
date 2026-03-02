# Laporan Detail Query & Tabel EAD Setup

## Menu: Exposure At Default Configuration

**URL:** `http://localhost:4231/banking/collective/ead-setup?mode=conventional`

Berikut adalah rincian teknis query untuk manajemen model EAD.

---

### 1. Component: EAD Model List

- **Nama Sub Menu:** Model List
- **Link Sub Menu:** `/banking/collective/ead-setup`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_ead_config`
- **Deskripsi:** Daftar model EAD yang telah didefinisikan.
- **Query:**
  ```sql
  SELECT
      id,
      model_code,
      model_name,
      method, -- CCF_BASED, AMORTIZATION_SCHEDULE
      is_active,
      last_updated_date,
      description
  FROM public.frs9_imp_ca_ead_config
  WHERE banking_type = 'conventional'
  ORDER BY created_date DESC;
  ```

---

### 2. Component: CCF Parameters

- **Nama Sub Menu:** CCF Input
- **Link Sub Menu:** `/banking/collective/ead-setup/ccf`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_ead_ccf`
- **Deskripsi:** Nilai Credit Conversion Factor untuk fasilitas off-balance sheet.
- **Query:**
  ```sql
  SELECT
      id,
      ead_config_id,
      facility_type, -- LC, BG, UNUSED_LIMIT
      ccf_percentage, -- e.g., 0.20, 0.50
      is_committed -- TRUE/FALSE
  FROM public.frs9_imp_ca_ead_ccf
  WHERE ead_config_id = :ead_config_id
  ORDER BY facility_type;
  ```

---

### 3. Component: Prepayment Rates

- **Nama Sub Menu:** Prepayment Analysis
- **Link Sub Menu:** `/banking/collective/ead-setup/prepayment`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_ead_prepayment`
- **Deskripsi:** Data historis dan proyeksi tingkat pelunasan dipercepat.
- **Query:**
  ```sql
  SELECT
      period_year,
      segment_type,
      total_exposure_start,
      total_prepaid_amount,
      calculated_cpr -- Constant Prepayment Rate
  FROM public.frs9_imp_ca_ead_prepayment
  WHERE ead_config_id = :ead_config_id
  ORDER BY period_year DESC;
  ```

---

### 4. Component: Usage Mapping

- **Nama Sub Menu:** Segment Mapping
- **Link Sub Menu:** `/banking/collective/ead-setup`
- **Database:** `FRS9PRO`
- **Skema:** `public`
- **Nama Tabel:** `frs9_imp_ca_segment_config`
- **Deskripsi:** Melihat segmen yang menggunakan model EAD ini.
- **Query:**
  ```sql
  SELECT segment_code, segment_name
  FROM public.frs9_imp_ca_segment_config
  WHERE ead_config_id = :ead_config_id;
  ```
